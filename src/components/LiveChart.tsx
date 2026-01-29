import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { Activity } from 'lucide-react';
import type { GliderData } from '../types';

interface LiveChartProps {
  data: GliderData[];
}

export const LiveChart: React.FC<LiveChartProps> = ({ data }) => {
  return (
    <div className="bg-deep-sea-800 border border-deep-sea-700 rounded-xl p-6 h-[400px] flex flex-col">
      <h3 className="text-deep-sea-300 font-mono text-sm mb-4 flex items-center gap-2">
        <Activity className="w-4 h-4" /> REAL-TIME TELEMETRY
      </h3>
      
      <div className="flex-1 w-full min-h-0">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
            <XAxis 
              dataKey="timestamp" 
              domain={['auto', 'auto']} 
              tickFormatter={(unixTime) => new Date(unixTime).toLocaleTimeString([], { hour12: false, minute: '2-digit', second: '2-digit' })}
              stroke="#64748b"
              tick={{ fontSize: 12 }}
            />
            <YAxis 
              yAxisId="left"
              stroke="#60a5fa"
              label={{ value: 'Depth (m)', angle: -90, position: 'insideLeft', fill: '#60a5fa' }}
              tick={{ fontSize: 12 }}
            />
            <YAxis 
              yAxisId="right" 
              orientation="right" 
              stroke="#64ffda"
              label={{ value: 'O2 (%)', angle: 90, position: 'insideRight', fill: '#64ffda' }}
              tick={{ fontSize: 12 }}
            />
            <Tooltip 
              contentStyle={{ backgroundColor: '#112240', borderColor: '#233554', color: '#e2e8f0' }}
              labelFormatter={(label) => new Date(label).toLocaleTimeString()}
            />
            <Legend />
            <Line 
              yAxisId="left"
              type="monotone" 
              dataKey="depth" 
              stroke="#3b82f6" 
              strokeWidth={2}
              dot={false}
              animationDuration={300}
              name="Depth"
            />
            <Line 
              yAxisId="right"
              type="monotone" 
              dataKey="o2" 
              stroke="#64ffda" 
              strokeWidth={2}
              dot={false}
              animationDuration={300}
              name="Oxygen"
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};
