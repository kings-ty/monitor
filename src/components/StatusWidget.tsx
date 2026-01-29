import React from 'react';
import { Wind, AlertCircle, CheckCircle } from 'lucide-react';

interface StatusWidgetProps {
  o2: number;
  status: number;
}

export const StatusWidget: React.FC<StatusWidgetProps> = ({ o2, status }) => {
  return (
    <div className="bg-deep-sea-800 border border-deep-sea-700 rounded-xl p-6 flex flex-col justify-between">
      <div>
        <h3 className="text-deep-sea-300 font-mono text-sm mb-4 flex items-center gap-2">
          <Wind className="w-4 h-4" /> ENV SENSORS
        </h3>
        <div className="flex items-baseline gap-2">
          <span className="text-4xl font-bold text-neon-green font-mono">{o2.toFixed(1)}</span>
          <span className="text-deep-sea-400 text-sm">% O2</span>
        </div>
      </div>

      <div className="mt-6 pt-6 border-t border-deep-sea-700">
        <h4 className="text-xs text-deep-sea-400 mb-2 uppercase tracking-widest">System Status</h4>
        <div className={`flex items-center gap-2 font-mono text-sm ${status === 0 ? 'text-green-400' : 'text-alert-red'}`}>
          {status === 0 ? <CheckCircle className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
          {status === 0 ? "ALL SYSTEMS NOMINAL" : `ERROR CODE: ${status}`}
        </div>
      </div>
    </div>
  );
};
