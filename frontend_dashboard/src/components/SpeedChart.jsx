import React from 'react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend
} from 'recharts';

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div style={{
        backgroundColor: 'rgba(24, 24, 27, 0.95)',
        padding: '0.75rem 1rem',
        border: '1px solid rgba(255,255,255,0.1)',
        borderRadius: '0.75rem',
        color: '#fafafa',
        backdropFilter: 'blur(8px)',
        fontSize: '0.85rem'
      }}>
        <p style={{ margin: 0, marginBottom: '0.4rem', color: '#a1a1aa', fontSize: '0.75rem' }}>
          {new Date(label).toLocaleString()}
        </p>
        {payload[0] && (
          <p style={{ margin: 0, color: '#818cf8', fontWeight: 600 }}>
            ↓ Download: {payload[0].value} Mbps
          </p>
        )}
        {payload[1] && (
          <p style={{ margin: 0, color: '#34d399', fontWeight: 600 }}>
            ↑ Upload: {payload[1].value} Mbps
          </p>
        )}
      </div>
    );
  }
  return null;
};

const SpeedChart = ({ data }) => {
  return (
    <div className="chart-container">
      <h2 className="chart-title">Download & Upload Speed</h2>
      <div className="chart-wrapper">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart
            data={data}
            margin={{ top: 10, right: 20, left: 0, bottom: 0 }}
          >
            <defs>
              <linearGradient id="colorDownload" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#818cf8" stopOpacity={0.4} />
                <stop offset="95%" stopColor="#818cf8" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="colorUpload" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#34d399" stopOpacity={0.4} />
                <stop offset="95%" stopColor="#34d399" stopOpacity={0} />
              </linearGradient>
            </defs>
            <XAxis
              dataKey="timestamp"
              stroke="#52525b"
              tick={{ fill: '#a1a1aa', fontSize: 12 }}
              tickFormatter={(tick) => {
                const date = new Date(tick);
                return `${date.getHours()}:${date.getMinutes().toString().padStart(2, '0')}`;
              }}
            />
            <YAxis stroke="#52525b" tick={{ fill: '#a1a1aa', fontSize: 12 }} />
            <CartesianGrid strokeDasharray="3 3" stroke="#27272a" vertical={false} />
            <Tooltip content={<CustomTooltip />} />
            <Legend
              wrapperStyle={{ color: '#a1a1aa', fontSize: '0.8rem', paddingTop: '0.5rem' }}
            />
            <Area
              type="monotone"
              dataKey="download_mbps"
              name="Download (Mbps)"
              stroke="#818cf8"
              strokeWidth={2}
              fillOpacity={1}
              fill="url(#colorDownload)"
            />
            <Area
              type="monotone"
              dataKey="upload_mbps"
              name="Upload (Mbps)"
              stroke="#34d399"
              strokeWidth={2}
              fillOpacity={1}
              fill="url(#colorUpload)"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default SpeedChart;
