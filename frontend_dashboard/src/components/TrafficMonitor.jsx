import React, { useState, useEffect } from 'react';
import { fetchRealtimeUsage, fetchTrafficHistory, captureTrafficSnapshot } from '../api/fetch_data';
import { Monitor, Search, Camera, Globe, ArrowDown, ArrowUp } from 'lucide-react';

const TRAFFIC_RANGES = [
  { label: '1h', hours: 1 },
  { label: '3h', hours: 3 },
  { label: '24h', hours: 24 },
  { label: '7d', hours: 168 },
];

const TrafficMonitor = () => {
  const [liveProcesses, setLiveProcesses] = useState([]);
  const [trafficHistory, setTrafficHistory] = useState([]);
  const [filter, setFilter] = useState('');
  const [selectedRange, setSelectedRange] = useState(1);
  const [activeTab, setActiveTab] = useState('live'); // 'live' or 'history'
  const [capturing, setCapturing] = useState(false);

  // Fetch live connections every 5 seconds
  useEffect(() => {
    if (activeTab !== 'live') return;

    const getUsage = async () => {
      try {
        const data = await fetchRealtimeUsage();
        setLiveProcesses(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error(err);
      }
    };

    getUsage();
    const interval = setInterval(getUsage, 5000);
    return () => clearInterval(interval);
  }, [activeTab]);

  // Fetch historical traffic when tab or range changes
  useEffect(() => {
    if (activeTab !== 'history') return;

    const getHistory = async () => {
      try {
        const data = await fetchTrafficHistory(selectedRange);
        setTrafficHistory(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error(err);
      }
    };

    getHistory();
  }, [activeTab, selectedRange]);

  const handleCapture = async () => {
    setCapturing(true);
    try {
      await captureTrafficSnapshot();
      // Wait a second then refresh history
      setTimeout(async () => {
        const data = await fetchTrafficHistory(selectedRange);
        setTrafficHistory(Array.isArray(data) ? data : []);
        setCapturing(false);
      }, 1500);
    } catch (err) {
      setCapturing(false);
    }
  };

  const filteredLive = liveProcesses.filter(p =>
    p.name.toLowerCase().includes(filter.toLowerCase())
  );

  const filteredHistory = trafficHistory.filter(p =>
    p.app_name.toLowerCase().includes(filter.toLowerCase())
  );

  const formatBytes = (mb) => {
    if (mb >= 1024) return (mb / 1024).toFixed(2) + ' GB';
    if (mb >= 1) return mb.toFixed(2) + ' MB';
    return (mb * 1024).toFixed(0) + ' KB';
  };

  return (
    <div className="traffic-container chart-container" style={{ height: 'auto', minHeight: '420px' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', flexWrap: 'wrap', gap: '0.75rem' }}>
        <h2 className="chart-title" style={{ marginBottom: 0 }}>
          <Monitor size={18} style={{ verticalAlign: 'text-bottom', marginRight: '0.4rem' }} />
          Network Traffic
        </h2>
        <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
          <button
            className="capture-btn"
            onClick={handleCapture}
            disabled={capturing}
            title="Take a snapshot of current traffic and save to database"
          >
            <Camera size={14} /> {capturing ? 'Saving...' : 'Snapshot'}
          </button>
          <div className="search-box">
            <Search size={14} className="search-icon" />
            <input
              type="text"
              placeholder="Filter apps..."
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
            />
          </div>
        </div>
      </div>

      {/* Tab Buttons */}
      <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem', alignItems: 'center', flexWrap: 'wrap' }}>
        <div className="range-filter" style={{ margin: 0 }}>
          <button
            className={`range-btn ${activeTab === 'live' ? 'active' : ''}`}
            onClick={() => setActiveTab('live')}
          >
            <Globe size={12} style={{ marginRight: '4px' }} /> Live
          </button>
          <button
            className={`range-btn ${activeTab === 'history' ? 'active' : ''}`}
            onClick={() => setActiveTab('history')}
          >
            History
          </button>
        </div>

        {activeTab === 'history' && (
          <div className="range-filter" style={{ margin: 0 }}>
            {TRAFFIC_RANGES.map((opt) => (
              <button
                key={opt.hours}
                className={`range-btn ${selectedRange === opt.hours ? 'active' : ''}`}
                onClick={() => setSelectedRange(opt.hours)}
              >
                {opt.label}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Content */}
      <div className="process-list" style={{ maxHeight: '300px', overflowY: 'auto' }}>
        {activeTab === 'live' ? (
          filteredLive.length === 0 ? (
            <div className="no-data">No active network connections detected.</div>
          ) : (
            <table className="outage-table">
              <thead>
                <tr>
                  <th>Application</th>
                  <th style={{ textAlign: 'right' }}>Connections</th>
                  <th style={{ textAlign: 'right' }}>Established</th>
                  <th style={{ textAlign: 'right' }}>Other</th>
                </tr>
              </thead>
              <tbody>
                {filteredLive.map((p, i) => (
                  <tr key={i}>
                    <td style={{ fontWeight: 500 }}>{p.name}</td>
                    <td style={{ textAlign: 'right', color: 'var(--primary-accent)', fontWeight: 600 }}>
                      {p.connections}
                    </td>
                    <td style={{ textAlign: 'right', color: 'var(--success)' }}>
                      {p.status_established}
                    </td>
                    <td style={{ textAlign: 'right', color: 'var(--text-muted)' }}>
                      {p.status_other}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )
        ) : (
          filteredHistory.length === 0 ? (
            <div className="no-data">
              No historical data yet. Click "Snapshot" to capture current traffic.
            </div>
          ) : (
            <table className="outage-table">
              <thead>
                <tr>
                  <th>Application</th>
                  <th style={{ textAlign: 'right' }}><ArrowDown size={12} /> Received</th>
                  <th style={{ textAlign: 'right' }}><ArrowUp size={12} /> Sent</th>
                  <th style={{ textAlign: 'right' }}>Connections</th>
                </tr>
              </thead>
              <tbody>
                {filteredHistory.map((p, i) => (
                  <tr key={i}>
                    <td style={{ fontWeight: 500 }}>{p.app_name}</td>
                    <td style={{ textAlign: 'right', color: 'var(--secondary-accent)', fontWeight: 500 }}>
                      {formatBytes(p.total_recv_mb)}
                    </td>
                    <td style={{ textAlign: 'right', color: 'var(--primary-accent)', fontWeight: 500 }}>
                      {formatBytes(p.total_sent_mb)}
                    </td>
                    <td style={{ textAlign: 'right', color: 'var(--text-muted)' }}>
                      {p.total_connections}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )
        )}
      </div>

      <p style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: '0.75rem' }}>
        {activeTab === 'live'
          ? '* Live connections refresh every 5 seconds'
          : '* Historical data is captured via snapshots. Click "Snapshot" to record current state.'
        }
      </p>
    </div>
  );
};

export default TrafficMonitor;
