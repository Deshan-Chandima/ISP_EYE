import React from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer
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
        <p style={{ margin: 0, color: '#fbbf24', fontWeight: 600 }}>
          Ping: {payload[0]?.value} ms
        </p>
        {payload[1] && (
          <p style={{ margin: 0, color: '#fb923c', fontWeight: 600 }}>
            Jitter: {payload[1].value} ms
          </p>
        )}
      </div>
    );
  }
  return null;
};

const PingChart = ({ data }) => {
  return (
    <div className="chart-container">
      <h2 className="chart-title">Latency & Jitter</h2>
      <div className="chart-wrapper">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart
            data={data}
            margin={{ top: 10, right: 20, left: 0, bottom: 0 }}
          >
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
            <Line
              type="monotone"
              dataKey="latency_ms"
              name="Ping (ms)"
              stroke="#fbbf24"
              strokeWidth={2.5}
              dot={false}
              activeDot={{ r: 6, strokeWidth: 0, fill: '#fbbf24' }}
            />
            <Line
              type="monotone"
              dataKey="jitter_ms"
              name="Jitter (ms)"
              stroke="#fb923c"
              strokeWidth={2}
              dot={false}
              strokeDasharray="5 5"
              activeDot={{ r: 5, strokeWidth: 0, fill: '#fb923c' }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default PingChart;
