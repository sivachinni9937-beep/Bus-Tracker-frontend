// frontend/src/components/DelayChart.jsx
import React from 'react';
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';

export const DelayChart = ({ data = [], height = 240 }) => {
  if (!data || data.length === 0) {
    return (
      <div className="h-48 flex items-center justify-center text-slate-500 text-xs">
        No delay trend records available.
      </div>
    );
  }

  return (
    <div style={{ width: '100%', height }}>
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.5} />
          <XAxis 
            dataKey="time" 
            stroke="#94a3b8" 
            tick={{ fontSize: 11 }} 
            tickLine={false} 
          />
          <YAxis 
            stroke="#94a3b8" 
            tick={{ fontSize: 11 }} 
            tickLine={false} 
            unit="m" 
          />
          <Tooltip
            contentStyle={{
              backgroundColor: '#0f172a',
              borderColor: '#334155',
              borderRadius: '8px',
              fontSize: '12px',
              color: '#f8fafc'
            }}
          />
          <Line
            type="monotone"
            dataKey="average_delay"
            name="Avg Delay (min)"
            stroke="#3b82f6"
            strokeWidth={2.5}
            dot={{ r: 3, fill: '#3b82f6' }}
            activeDot={{ r: 6, fill: '#60a5fa' }}
          />
          <Line
            type="monotone"
            dataKey="city_bus"
            name="City Bus"
            stroke="#2563eb"
            strokeWidth={1.5}
            strokeDasharray="4 4"
            dot={false}
          />
          <Line
            type="monotone"
            dataKey="shared_auto"
            name="Shared Auto"
            stroke="#f59e0b"
            strokeWidth={1.5}
            strokeDasharray="4 4"
            dot={false}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};

export default DelayChart;
