// Run this command to install dependencies:
// npm install recharts lucide-react clsx tailwind-merge
// npm install -D tailwindcss postcss autoprefixer

import { Header } from './components/Header';
import { BatteryWidget } from './components/BatteryWidget';
import { DepthWidget } from './components/DepthWidget';
import { StatusWidget } from './components/StatusWidget';
import { LiveChart } from './components/LiveChart';
import { useSerial } from './hooks/useSerial';

function App() {
  const { status, data, history, connect, disconnect } = useSerial();

  // Default mock data for UI visualization when disconnected
  // or initial state to prevent empty ugly boxes
  const displayData = data || { voltage: 0, depth: 0, o2: 0, status: 0, timestamp: Date.now() };

  return (
    <div className="min-h-screen bg-deep-sea-900 text-slate-200 font-sans selection:bg-neon-green selection:text-deep-sea-900">
      <Header 
        status={status} 
        onConnect={connect} 
        onDisconnect={disconnect} 
      />

      <main className="p-6 max-w-7xl mx-auto space-y-6">
        
        {/* Status Banner for connection help */}
        {status === 'disconnected' && (
          <div className="bg-blue-500/10 border border-blue-500/20 text-blue-200 p-4 rounded-lg text-sm font-mono flex items-center justify-center text-center">
            Ready to connect. Ensure STM32 is plugged in via USB and click 'CONNECT SYSTEM'.
            <br/>Select the correct COM port/device in the browser popup.
          </div>
        )}

        {status === 'error' && (
          <div className="bg-red-500/10 border border-red-500/20 text-red-200 p-4 rounded-lg text-sm font-mono text-center">
            Connection Error. Please check cable or refresh page.
          </div>
        )}

        {/* Top Grid: Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 h-64">
          <BatteryWidget voltage={displayData.voltage} />
          <StatusWidget o2={displayData.o2} status={displayData.status} />
          <DepthWidget depth={displayData.depth} />
        </div>

        {/* Bottom Grid: Chart */}
        <div className="w-full">
          <LiveChart data={history} />
        </div>
      </main>
    </div>
  );
}

export default App;