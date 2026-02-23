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
  const displayData = data || { voltage: 0, depth: 0, o2: 0, status: 0, tinyml_result: 0, pitch: 0, roll: 0, yaw: 0, timestamp: Date.now() };

  return (
    <div className="min-h-screen bg-deep-sea-900 text-slate-200 font-sans selection:bg-neon-green selection:text-deep-sea-900">
      <Header
        status={status}
        onConnect={connect}
        onDisconnect={disconnect}
      />

      <main className="p-6 max-w-7xl mx-auto space-y-6">

        {/* Status Banner for connection help */}
        {status === 'disconnected' && !data && (
          <div className="bg-blue-500/10 border border-blue-500/20 text-blue-200 p-4 rounded-lg text-sm font-mono flex items-center justify-center text-center">
            Ready to connect. Ensure STM32 is plugged in via USB and click 'CONNECT SYSTEM'.
            <br />Select the correct COM port/device in the browser popup.
          </div>
        )}
        {status === 'disconnected' && data && (
          <div className="bg-green-500/10 border border-green-500/20 text-green-400 p-4 rounded-lg text-sm font-mono flex items-center justify-center text-center">
            LIVE VIEWER MODE: Receiving data from active connection.
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

        {/* IMU Data Display - Commented out for now
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-gradient-to-br from-slate-800 to-slate-900 border border-slate-700 rounded-lg p-6 shadow-lg">
            <h3 className="text-sm font-medium text-slate-400 mb-2">PITCH</h3>
            <p className="text-4xl font-bold text-neon-green">{displayData.pitch.toFixed(2)}°</p>
          </div>
          <div className="bg-gradient-to-br from-slate-800 to-slate-900 border border-slate-700 rounded-lg p-6 shadow-lg">
            <h3 className="text-sm font-medium text-slate-400 mb-2">ROLL</h3>
            <p className="text-4xl font-bold text-neon-green">{displayData.roll.toFixed(2)}°</p>
          </div>
          <div className="bg-gradient-to-br from-slate-800 to-slate-900 border border-slate-700 rounded-lg p-6 shadow-lg">
            <h3 className="text-sm font-medium text-slate-400 mb-2">YAW</h3>
            <p className="text-4xl font-bold text-neon-green">{displayData.yaw.toFixed(2)}°</p>
          </div>
        </div>
        */}

        {/* Environment & Water Quality Display */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
          <div className="bg-gradient-to-br from-slate-800 to-slate-900 border border-slate-700 rounded-lg p-6 shadow-lg flex flex-col justify-between">
            <h3 className="text-sm font-medium text-slate-400 mb-2">TEMP</h3>
            <p className="text-3xl font-bold text-blue-400">{displayData.temp !== undefined ? displayData.temp.toFixed(2) : '--'} <span className="text-lg text-slate-500 font-normal">°C</span></p>
          </div>
          <div className="bg-gradient-to-br from-slate-800 to-slate-900 border border-slate-700 rounded-lg p-6 shadow-lg flex flex-col justify-between">
            <h3 className="text-sm font-medium text-slate-400 mb-2">pH</h3>
            <p className="text-3xl font-bold text-fuchsia-400">{displayData.ph !== undefined ? displayData.ph.toFixed(2) : '--'} <span className="text-lg text-slate-500 font-normal">V</span></p>
          </div>
          <div className="bg-gradient-to-br from-slate-800 to-slate-900 border border-slate-700 rounded-lg p-6 shadow-lg flex flex-col justify-between">
            <h3 className="text-sm font-medium text-slate-400 mb-2">EC</h3>
            <p className="text-3xl font-bold text-yellow-400">{displayData.ec !== undefined ? displayData.ec.toFixed(2) : '--'} <span className="text-lg text-slate-500 font-normal">V</span></p>
          </div>
          <div className="bg-gradient-to-br from-slate-800 to-slate-900 border border-slate-700 rounded-lg p-6 shadow-lg flex flex-col justify-between">
            <h3 className="text-sm font-medium text-slate-400 mb-2">Analog DO</h3>
            <p className="text-3xl font-bold text-emerald-400">{displayData.ado !== undefined ? displayData.ado.toFixed(3) : '--'} <span className="text-lg text-slate-500 font-normal">V</span></p>
          </div>
          <div className="bg-gradient-to-br from-slate-800 to-slate-900 border border-slate-700 rounded-lg p-6 shadow-lg flex flex-col justify-between">
            <h3 className="text-sm font-medium text-slate-400 mb-2">SIGNAL</h3>
            <p className="text-3xl font-bold text-cyan-400">{displayData.rssi !== undefined ? displayData.rssi : '--'} <span className="text-lg text-slate-500 font-normal">dBm</span></p>
          </div>
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