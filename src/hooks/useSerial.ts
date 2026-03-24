import { useState, useRef, useCallback, useEffect } from 'react';
import { io } from 'socket.io-client';
import type { GliderData, ConnectionStatus } from '../types';

const socket = io(); // Auto-connects to the server

export const useSerial = () => {
  const [status, setStatus] = useState<ConnectionStatus>('disconnected');
  const [data, setData] = useState<GliderData | null>(null);
  const [history, setHistory] = useState<GliderData[]>([]);
  const portRef = useRef<any>(null);
  const readerRef = useRef<any>(null);
  const keepReadingRef = useRef<boolean>(false);

  // Listen for broadcasted data from other users
  useEffect(() => {
    const handleSensorData = (newData: GliderData) => {
      // If we are locally connected, ignore incoming socket data to avoid echoing/conflicts
      if (status === 'connected') return;

      setData(newData);
      setHistory(prev => {
        const newHistory = [...prev, newData];
        return newHistory.length > 60 ? newHistory.slice(newHistory.length - 60) : newHistory;
      });
    };

    socket.on('sensor_data', handleSensorData);

    return () => {
      socket.off('sensor_data', handleSensorData);
    };
  }, [status]);

  const connect = useCallback(async () => {
    try {
      if (!('serial' in navigator)) {
        alert("Web Serial API is not supported in this browser. Please use Chrome or Edge.");
        return;
      }

      setStatus('connecting');
      // @ts-ignore
      const port = await navigator.serial.requestPort();
      await port.open({ baudRate: 115200 });

      console.log("Port opened successfully at 115200bps");
      portRef.current = port;
      setStatus('connected');
      keepReadingRef.current = true;

      readLoop(port);
    } catch (error) {
      console.error("Connection failed:", error);
      setStatus('error');
    }
  }, []);

  const disconnect = useCallback(async () => {
    keepReadingRef.current = false;
    if (readerRef.current) {
      await readerRef.current.cancel();
    }
    if (portRef.current) {
      await portRef.current.close();
    }
    portRef.current = null;
    setStatus('disconnected');
  }, []);

  const readLoop = async (port: any) => {
    console.log("SYSTEM: Read Loop started, waiting for data...");
    const decoder = new TextDecoder();
    const reader = port.readable.getReader();
    readerRef.current = reader;

    let buffer = '';

    try {
      while (keepReadingRef.current) {
        const { value, done } = await reader.read();
        if (done) {
          console.log("SYSTEM: Stream closed.");
          break;
        }
        if (value) {
          console.log(`SYSTEM: Received ${value.byteLength} bytes`);
          const decoded = decoder.decode(value, { stream: true });
          console.log("SYSTEM: Decoded chunk:", decoded);
          buffer += decoded;

          const lines = buffer.split('\n');
          // The last element in the split array is either an incomplete string (no trailing \n)
          // or an empty string (trailing \n). We keep it in the buffer to process later.
          buffer = lines.pop() || '';

          for (const line of lines) {
            parseLine(line);
          }
        }
      }
    } catch (error) {
      console.error("Read error:", error);
      setStatus('error');
    } finally {
      reader.releaseLock();
    }
  };

  const parseLine = (line: string) => {
    const trimmed = line.trim();
    if (!trimmed) return;

    console.log("Raw Data:", trimmed);

    try {
      const lower = trimmed.toLowerCase();
      const defaultState: GliderData = { voltage: 0, depth: 0, o2: 0, status: 0, tinyml_result: 0, pitch: 0, roll: 0, yaw: 0, timestamp: Date.now() };

      const extractValue = (str: string) => {
        const match = str.match(/-?[\d.]+/);
        return match ? parseFloat(match[0]) : null;
      };

      const updateState = (updater: (prev: GliderData) => GliderData) => {
        setData(prev => {
          const newData = updater(prev || defaultState);
          setHistory(hist => {
            const newHistory = [...hist, newData];
            return newHistory.length > 60 ? newHistory.slice(newHistory.length - 60) : newHistory;
          });

          // Emit this new data to the server!
          socket.emit('sensor_data', newData);

          return newData;
        });
      };

      // New format: D:1.23,T:24.5,PH:1.5,EC:2.1,aDO:0.8,O2:8.5
      // The string might have prefix: "🎉 [Rx Success] Data: D:1.23,T:24..."
      if (trimmed.includes('D:') && trimmed.includes(',') && trimmed.includes('O2:')) {
        const dataMatch = trimmed.match(/(?:Data:\s*)?(D:.*)/);
        const dataStr = dataMatch ? dataMatch[1] : trimmed;

        const parts = dataStr.split(',');
        const parsed: Partial<GliderData> = { timestamp: Date.now() };

        for (const p of parts) {
          const splitIdx = p.indexOf(':');
          if (splitIdx === -1) continue;

          const key = p.substring(0, splitIdx).trim();
          const val = p.substring(splitIdx + 1).trim();

          const numVal = parseFloat(val);
          switch (key) {
            case 'D': parsed.depth = isNaN(numVal) ? 0 : numVal; break;
            case 'T': parsed.temp = isNaN(numVal) ? 0 : numVal; break;
            case 'PH': parsed.ph = isNaN(numVal) ? 0 : numVal; break;
            case 'EC': parsed.ec = isNaN(numVal) ? 0 : numVal; break;
            case 'aDO': parsed.ado = isNaN(numVal) ? 0 : numVal; break;
            case 'VOLT':
            case 'V': parsed.voltage = isNaN(numVal) ? 0 : numVal; break;
            case 'O2':
              if (val === 'Err') {
                parsed.o2Str = 'Err';
              } else {
                parsed.o2 = isNaN(numVal) ? 0 : numVal;
                parsed.o2Str = val;
              }
              break;
          }
        }

        updateState((prev) => ({ ...prev, ...parsed }));
        return;
      }

      if (lower.includes('pressure:') || lower.includes('mean pressure')) {
        const val = extractValue(trimmed);
        if (val !== null) updateState(prev => ({ ...prev, pressure: val, timestamp: Date.now() }));
        return;
      }
      if (lower.includes('temperature:') || lower.includes('mean temp')) {
        const val = extractValue(trimmed.replace('deg c', ''));
        if (val !== null) updateState(prev => ({ ...prev, temp: val, timestamp: Date.now() }));
        return;
      }
      if (lower.includes('depth:') || lower.includes('mean depth')) {
        const val = extractValue(trimmed);
        if (val !== null) updateState(prev => ({ ...prev, depth: val, timestamp: Date.now() }));
        return;
      }
      if (lower.includes('altitude:') || lower.includes('mean altitude')) {
        const val = extractValue(trimmed);
        if (val !== null) updateState(prev => ({ ...prev, altitude: val, timestamp: Date.now() }));
        return;
      }
      if (lower.includes('voltage:') || lower.includes('volt:') || lower.includes('batt:')) {
        const val = extractValue(trimmed);
        if (val !== null) updateState(prev => ({ ...prev, voltage: val, timestamp: Date.now() }));
        return;
      }
      if (lower.includes('signal strength(rssi)')) {
        const val = extractValue(trimmed);
        if (val !== null) updateState(prev => ({ ...prev, rssi: val, timestamp: Date.now() }));
        return;
      }


      const parts = trimmed.split(',');
      if (parts.length >= 1 && !trimmed.includes(':') && trimmed.includes(',')) {
        updateState(prev => ({
          ...prev,
          voltage: parseFloat(parts[0]) || prev.voltage || 0,
          depth: parseFloat(parts[1]) || prev.depth || 0,
          o2: parseFloat(parts[2]) || prev.o2 || 0,
          status: parseInt(parts[3]) || prev.status || 0,
          tinyml_result: parseInt(parts[4]) || prev.tinyml_result || 0,
          pitch: parseFloat(parts[5]) || prev.pitch || 0,
          roll: parseFloat(parts[6]) || prev.roll || 0,
          yaw: parseFloat(parts[7]) || prev.yaw || 0,
          timestamp: Date.now(),
        }));
      }
    } catch (e) {
      console.warn("Parse error:", e, line);
    }
  };

  return { status, data, history, connect, disconnect };
};

