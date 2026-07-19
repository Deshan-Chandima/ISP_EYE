import React from 'react';

const NetworkHealthGauge = ({ ratio }) => {
  const normalizedRatio = Math.min(Math.max(ratio || 0, 0), 100);
  
  // Calculate SVG circle properties
  const radius = 44;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (normalizedRatio / 100) * circumference;

  let color = 'var(--success)';
  if (normalizedRatio < 70) color = 'var(--danger)';
  else if (normalizedRatio < 90) color = 'var(--warning)';

  return (
    <div className="health-gauge-container">
      <h3 className="health-title">Network Health</h3>
      <div className="gauge-wrapper">
        <svg className="gauge-svg" width="120" height="120">
          <circle
            className="gauge-bg"
            cx="60" cy="60" r={radius}
            strokeWidth="8"
          />
          <circle
            className="gauge-progress"
            cx="60" cy="60" r={radius}
            strokeWidth="8"
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            stroke={color}
            transform="rotate(-90 60 60)"
          />
        </svg>
        <div className="gauge-content">
          <span className="gauge-value" style={{ color }}>{normalizedRatio}%</span>
        </div>
      </div>
      <p className="health-status">
        {normalizedRatio >= 90 ? 'Excellent' : normalizedRatio >= 70 ? 'Fair' : 'Poor'} Connection
      </p>
    </div>
  );
};

export default NetworkHealthGauge;
