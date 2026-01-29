import React from 'react';
import { Battery, Zap } from 'lucide-react';

interface BatteryWidgetProps {
  voltage: number;
}

export const BatteryWidget: React.FC<BatteryWidgetProps> = ({ voltage }) => {
  // Map 10V-13V to 0-100%
  const percentage = Math.min(Math.max(((voltage - 10) / 3) * 100, 0), 100);
  
  // Circumference for SVG circle (r=40) => 2*pi*40 ≈ 251.2
  const circumference = 251.2;
  const strokeDashoffset = circumference - (percentage / 100) * circumference;

  let color = 'text-neon-green';
  if (percentage < 20) color = 'text-alert-red';
  else if (percentage < 50) color = 'text-yellow-400';

  return (
    <div className="bg-deep-sea-800 border border-deep-sea-700 rounded-xl p-6 relative overflow-hidden group">
      <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
        <Battery className="w-24 h-24 text-white" />
      </div>
      
      <h3 className="text-deep-sea-300 font-mono text-sm mb-4 flex items-center gap-2">
        <Zap className="w-4 h-4" /> POWER SYSTEM
      </h3>

      <div className="flex items-center justify-center py-4">
        <div className="relative w-40 h-40">
          {/* Background Circle */}
          <svg className="w-full h-full transform -rotate-90">
            <circle
              cx="80"
              cy="80"
              r="40"
              stroke="currentColor"
              strokeWidth="8"
              fill="transparent"
              className="text-deep-sea-700"
            />
            {/* Progress Circle */}
            <circle
              cx="80"
              cy="80"
              r="40"
              stroke="currentColor"
              strokeWidth="8"
              fill="transparent"
              strokeDasharray={circumference}
              strokeDashoffset={strokeDashoffset}
              strokeLinecap="round"
              className={`${color} transition-all duration-500 ease-out`}
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className={`text-3xl font-bold font-mono ${color}`}>
              {voltage.toFixed(1)}<span className="text-sm ml-1">V</span>
            </span>
            <span className="text-deep-sea-400 text-xs mt-1">{Math.round(percentage)}%</span>
          </div>
        </div>
      </div>
    </div>
  );
};
