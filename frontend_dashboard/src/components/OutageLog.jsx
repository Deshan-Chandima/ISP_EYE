import React from 'react';
import { AlertTriangle } from 'lucide-react';

const OutageLog = ({ outages }) => {
  if (!outages || outages.length === 0) {
    return (
      <div className="outage-container">
        <h2 className="chart-title">Outage Log</h2>
        <div className="outage-empty">
          <span style={{ color: 'var(--success)', fontSize: '1.5rem' }}>✓</span>
          <p>No outages detected in this period. Your network is stable!</p>
        </div>
      </div>
    );
  }

  return (
    <div className="outage-container">
      <h2 className="chart-title">
        <AlertTriangle size={20} color="var(--danger)" style={{ verticalAlign: 'text-bottom', marginRight: '0.5rem' }} />
        Outage Log ({outages.length} event{outages.length > 1 ? 's' : ''})
      </h2>
      <div className="outage-table-wrapper">
        <table className="outage-table">
          <thead>
            <tr>
              <th>Date & Time</th>
              <th>Status</th>
              <th>Download</th>
              <th>Latency</th>
            </tr>
          </thead>
          <tbody>
            {outages.map((o, i) => (
              <tr key={i}>
                <td>{new Date(o.timestamp).toLocaleString()}</td>
                <td><span className="outage-badge">FAILED</span></td>
                <td>{o.download_mbps} Mbps</td>
                <td>{o.latency_ms} ms</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default OutageLog;
