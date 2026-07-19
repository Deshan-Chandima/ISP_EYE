import React, { useState, useEffect } from 'react';
import { fetchCurrentStatus, fetchHistoricalData, fetchOutages, runSpeedTest, getExportUrl } from './api/fetch_data';
import Sidebar from './components/Sidebar';
import SpeedChart from './components/SpeedChart';
import PingChart from './components/PingChart';
import OutageLog from './components/OutageLog';
import TrafficMonitor from './components/TrafficMonitor';
import RecentTestsCard from './components/RecentTestsCard';
import ServerInfoCard from './components/ServerInfoCard';
import {
  Activity, Download, Upload, Clock, Wifi, WifiOff,
  Play, Loader2, FileDown
} from 'lucide-react';
import './index.css';

const RANGE_OPTIONS = [
  { label: 'Last 24h', hours: 24 },
  { label: 'Last 7 Days', hours: 168 },
  { label: 'Last 30 Days', hours: 720 },
];

function App() {
  const [currentStatus, setCurrentStatus] = useState(null);
  const [historicalData, setHistoricalData] = useState(null);
  const [outages, setOutages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isTesting, setIsTesting] = useState(false);
  const [error, setError] = useState(null);
  const [lastTestTimestamp, setLastTestTimestamp] = useState(null);
  const [selectedRange, setSelectedRange] = useState(24);

  // Set your advertised speed here (Mbps)
  const ADVERTISED_SPEED = 100;

  const loadData = async (hours) => {
    try {
      setLoading(true);
      const [status, history, outageData] = await Promise.all([
        fetchCurrentStatus(),
        fetchHistoricalData(hours),
        fetchOutages(hours)
      ]);
      setCurrentStatus(status);
      setHistoricalData(history);
      setOutages(outageData);
      setLastTestTimestamp(status?.timestamp);
      setError(null);
    } catch (err) {
      // If current-status is 404 (no data yet), still show the dashboard
      if (err?.response?.status === 404) {
        setCurrentStatus(null);
        setError(null);
      } else {
        setError("Failed to connect to the backend API. Ensure it is running on port 8000.");
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData(selectedRange);
    const interval = setInterval(() => loadData(selectedRange), 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, [selectedRange]);

  const handleRunTest = async () => {
    if (isTesting) return;
    try {
      setIsTesting(true);
      await runSpeedTest();

      const pollInterval = setInterval(async () => {
        try {
          const newStatus = await fetchCurrentStatus();
          if (newStatus && newStatus.timestamp !== lastTestTimestamp) {
            clearInterval(pollInterval);
            setCurrentStatus(newStatus);
            setLastTestTimestamp(newStatus.timestamp);
            // Refresh all data
            const [history, outageData] = await Promise.all([
              fetchHistoricalData(selectedRange),
              fetchOutages(selectedRange)
            ]);
            setHistoricalData(history);
            setOutages(outageData);
            setIsTesting(false);
          }
        } catch (e) {
          console.error("Polling error", e);
        }
      }, 5000);

      setTimeout(() => {
        clearInterval(pollInterval);
        setIsTesting(false);
      }, 90000);

    } catch (err) {
      setError("Failed to start speed test.");
      setIsTesting(false);
    }
  };

  if (loading && !currentStatus && !historicalData) {
    return (
      <div className="loading">
        <Loader2 className="animate-spin" size={32} style={{ marginRight: '1rem' }} />
        Initializing ISP Eye...
      </div>
    );
  }

  if (error) {
    return (
      <div className="loading" style={{ color: 'var(--danger)', flexDirection: 'column', gap: '1rem' }}>
        <WifiOff size={48} />
        <span>{error}</span>
      </div>
    );
  }

  const isOnline = currentStatus?.status === 'SUCCESS';

  // Calculate performance ratio
  let avgDownload = 0;
  if (historicalData?.raw_data?.length > 0) {
    const successfulTests = historicalData.raw_data.filter(d => d.status === 'SUCCESS');
    if (successfulTests.length > 0) {
      const sum = successfulTests.reduce((acc, curr) => acc + curr.download_mbps, 0);
      avgDownload = sum / successfulTests.length;
    }
  }
  const performanceRatio = Math.round((avgDownload / ADVERTISED_SPEED) * 100);

  const totalTests = historicalData?.raw_data?.length || 0;
  const failedTests = outages?.length || 0;
  const uptimePercent = totalTests > 0 ? Math.round(((totalTests - failedTests) / totalTests) * 100) : 100;

  return (
    <div className="app-layout">
      <Sidebar performanceRatio={performanceRatio} />
      
      <main className="main-content">
        {/* Header / Topbar */}
        <header className="topbar">
          <div className="topbar-left">
            <h1 className="title">Dashboard</h1>
            <div className="status-badge">
              <div className={`status-dot ${isOnline ? 'online' : 'offline'}`}></div>
              <span style={{ color: isOnline ? 'var(--success)' : 'var(--danger)', fontSize: '0.9rem' }}>
                {isOnline ? 'Online' : 'Offline'}
              </span>
            </div>
          </div>
          <div className="topbar-actions">
            <button className="test-button" onClick={handleRunTest} disabled={isTesting}>
              {isTesting ? (
                <><Loader2 className="animate-spin" size={16} /> Testing...</>
              ) : (
                <><Play size={16} /> Run Test</>
              )}
            </button>
            <a href={getExportUrl(selectedRange)} className="export-button" download>
              <FileDown size={16} /> Export CSV
            </a>
          </div>
        </header>

        {/* Top Section: Server Info & Date Range */}
        <div className="top-section">
          <ServerInfoCard currentStatus={currentStatus} />
          
          <div className="range-filter">
            {RANGE_OPTIONS.map((opt) => (
              <button
                key={opt.hours}
                className={`range-btn ${selectedRange === opt.hours ? 'active' : ''}`}
                onClick={() => setSelectedRange(opt.hours)}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>

        {/* KPI Cards */}
        <div className="kpi-grid">
          <div className="kpi-card">
            <div className="kpi-title"><Download size={16} /> Download</div>
            <div>
              <span className="kpi-value">{currentStatus?.download_mbps || '—'}</span>
              <span className="kpi-unit"> Mbps</span>
            </div>
          </div>

          <div className="kpi-card">
            <div className="kpi-title"><Upload size={16} /> Upload</div>
            <div>
              <span className="kpi-value">{currentStatus?.upload_mbps || '—'}</span>
              <span className="kpi-unit"> Mbps</span>
            </div>
          </div>

          <div className="kpi-card">
            <div className="kpi-title"><Clock size={16} /> Latency</div>
            <div>
              <span className="kpi-value">{currentStatus?.latency_ms || '—'}</span>
              <span className="kpi-unit"> ms</span>
            </div>
          </div>

          <div className="kpi-card">
            <div className="kpi-title"><Activity size={16} /> Jitter</div>
            <div>
              <span className="kpi-value">{currentStatus?.jitter_ms || '—'}</span>
              <span className="kpi-unit"> ms</span>
            </div>
          </div>
        </div>

        {/* Charts & Recent Tests Grid */}
        <div className="middle-grid">
          <div className="charts-column">
            <SpeedChart data={historicalData?.raw_data || []} />
            <PingChart data={historicalData?.raw_data || []} />
          </div>
          <div className="side-column">
            <RecentTestsCard data={historicalData?.raw_data || []} />
          </div>
        </div>

        {/* Real-Time Traffic & Outage Log */}
        <div className="bottom-grid">
          <TrafficMonitor />
          <OutageLog outages={outages} />
        </div>
      </main>
    </div>
  );
}

export default App;
