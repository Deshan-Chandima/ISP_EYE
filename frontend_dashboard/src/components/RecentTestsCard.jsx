import React from 'react';
import { Clock, Download, Upload, Activity } from 'lucide-react';

const RecentTestsCard = ({ data }) => {
  // Sort by timestamp descending and take top 5
  const recentTests = [...(data || [])]
    .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
    .slice(0, 5);

  const formatTime = (ts) => {
    return new Date(ts).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };
  
  const formatDate = (ts) => {
    return new Date(ts).toLocaleDateString([], { month: 'short', day: 'numeric' });
  };

  return (
    <div className="recent-tests-card chart-container" style={{ height: 'auto', minHeight: '380px' }}>
      <h3 className="chart-title">
        <Clock size={18} style={{ display: 'inline', marginRight: '0.4rem', verticalAlign: 'text-bottom'}}/> 
        Recent Tests
      </h3>
      
      {recentTests.length === 0 ? (
        <div className="no-data">No tests available</div>
      ) : (
        <div className="recent-tests-list">
          {recentTests.map((test, index) => (
            <div key={index} className="recent-test-item">
              <div className="recent-test-date">
                <span className="time">{formatTime(test.timestamp)}</span>
                <span className="date">{formatDate(test.timestamp)}</span>
              </div>
              <div className="recent-test-metrics">
                <span className="metric" title="Download">
                  <Download size={14} color="var(--success)" /> {test.download_mbps}
                </span>
                <span className="metric" title="Upload">
                  <Upload size={14} color="var(--primary-accent)" /> {test.upload_mbps}
                </span>
                <span className="metric" title="Ping">
                  <Activity size={14} color="var(--warning)" /> {test.latency_ms}
                </span>
              </div>
              <div className={`recent-test-status ${test.status === 'SUCCESS' ? 'success' : 'danger'}`}>
                {test.status === 'SUCCESS' ? 'OK' : 'FAIL'}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default RecentTestsCard;
