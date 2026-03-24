import React from 'react';
import { ArrowDown } from 'lucide-react';

interface DepthWidgetProps {
  depth: number;
}

export const DepthWidget: React.FC<DepthWidgetProps> = ({ depth }) => {
  // Max depth 10m — adjust if your AUV goes deeper
  const maxDepth = 10;
  const percentage = Math.min((depth / maxDepth) * 100, 100);

  // Color shifts from cyan (shallow) → blue (mid) → deep-blue (deep)
  const barColor =
    percentage > 70 ? 'bg-blue-700/70 shadow-[0_0_20px_rgba(29,78,216,0.6)] border-blue-500' :
      percentage > 35 ? 'bg-blue-500/60 shadow-[0_0_20px_rgba(59,130,246,0.5)] border-blue-400' :
        'bg-cyan-400/50 shadow-[0_0_20px_rgba(34,211,238,0.4)] border-cyan-300';

  return (
    <div className="bg-deep-sea-800 border border-deep-sea-700 rounded-xl p-6 relative overflow-hidden h-full flex flex-col">
      <h3 className="text-deep-sea-300 font-mono text-sm mb-4 flex items-center gap-2">
        <ArrowDown className="w-4 h-4" /> DEPTH SENSOR
      </h3>

      <div className="flex-1 flex flex-col items-center justify-center gap-4">
        <div className="text-5xl font-bold text-white font-mono tracking-tighter">
          {depth.toFixed(1)}
          <span className="text-xl text-deep-sea-400 ml-2">m</span>
        </div>

        {/* Vertical Bar Visualizer */}
        <div className="w-16 h-48 bg-deep-sea-900 rounded-full border border-deep-sea-700 relative overflow-hidden">
          {/* Water surface effect */}
          <div
            className={`absolute bottom-0 w-full transition-all duration-500 ease-out border-t ${barColor}`}
            style={{ height: `${percentage}%` }}
          >
            <div className="absolute top-0 w-full h-2 bg-blue-400/30 animate-pulse"></div>
          </div>

          {/* Ruler marks */}
          {[0, 25, 50, 75, 100].map((mark) => (
            <div
              key={mark}
              className="absolute w-4 h-[1px] bg-deep-sea-600 right-0"
              style={{ bottom: `${mark}%` }}
            />
          ))}
        </div>
      </div>
    </div>
  );
};
