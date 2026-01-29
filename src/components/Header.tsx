import React from 'react';
import { Anchor, Wifi, WifiOff } from 'lucide-react';
import type { ConnectionStatus } from '../types';

interface HeaderProps {
  status: ConnectionStatus;
  onConnect: () => void;
  onDisconnect: () => void;
}

export const Header: React.FC<HeaderProps> = ({ status, onConnect, onDisconnect }) => {
  return (
    <header className="bg-deep-sea-800 border-b border-deep-sea-700 p-4 flex justify-between items-center shadow-lg">
      <div className="flex items-center gap-3">
        <div className="p-2 bg-deep-sea-700 rounded-lg">
          <Anchor className="text-neon-green w-6 h-6" />
        </div>
        <div>
          <h1 className="text-xl font-bold text-white tracking-wider">SUBMARINE GLIDER</h1>
          <p className="text-xs text-deep-sea-300">SYSTEM MONITOR // MODEL X-1</p>
        </div>
      </div>

      <div className="flex items-center gap-4">
        <div className={`flex items-center gap-2 px-3 py-1 rounded-full text-xs font-mono border ${
          status === 'connected' 
            ? 'bg-green-900/30 border-green-500/50 text-green-400' 
            : 'bg-red-900/30 border-red-500/50 text-red-400'
        }`}>
          {status === 'connected' ? <Wifi className="w-3 h-3" /> : <WifiOff className="w-3 h-3" />}
          {status.toUpperCase()}
        </div>

        <button
          onClick={status === 'connected' ? onDisconnect : onConnect}
          className={`px-6 py-2 rounded font-mono font-bold transition-all duration-300 ${
            status === 'connected'
              ? 'bg-red-500/20 hover:bg-red-500/40 text-red-400 border border-red-500/50'
              : 'bg-neon-green/10 hover:bg-neon-green/20 text-neon-green border border-neon-green/50 hover:shadow-[0_0_15px_rgba(100,255,218,0.3)]'
          }`}
        >
          {status === 'connected' ? 'DISCONNECT' : 'CONNECT SYSTEM'}
        </button>
      </div>
    </header>
  );
};
