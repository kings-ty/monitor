import { useState, useRef, useCallback } from 'react';
import type { GliderData, ConnectionStatus } from '../types';

export const useSerial = () => {
  const [status, setStatus] = useState<ConnectionStatus>('disconnected');
  const [data, setData] = useState<GliderData | null>(null);
  const [history, setHistory] = useState<GliderData[]>([]);
  const portRef = useRef<any>(null);
  const readerRef = useRef<any>(null);
  const keepReadingRef = useRef<boolean>(false);

  const connect = useCallback(async () => {
    try {
      if (!('serial' in navigator)) {
        alert("Web Serial API is not supported in this browser. Please use Chrome or Edge.");
        return;
      }

      setStatus('connecting');
      // @ts-ignore
      const port = await navigator.serial.requestPort();
      await port.open({ baudRate: 9600 });
      
      console.log("Port opened successfully at 9600bps");
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
          // console.log("SYSTEM: Decoded chunk:", decoded);
          buffer += decoded;

          // HACK: If newline is missing, try to parse what we have immediately
          // This is useful if Arduino uses print() instead of println()
          if (!decoded.includes('\n') && decoded.includes(',')) {
             // Treat the whole buffer as one line if it looks like data
             parseLine(buffer);
             buffer = ''; // Clear buffer
          } else {
             const lines = buffer.split('\n');
             // The last element is the remainder (incomplete line), keep it in buffer
             buffer = lines.pop() || '';
   
             for (const line of lines) {
               parseLine(line);
             }
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

    // Debugging: Log the raw data to console
    console.log("Raw Data:", trimmed);

    try {
      // Expected format: Voltage,Depth,O2,Status
      // Example: 12.2,5.5,8.1,0
      const parts = trimmed.split(',');
      
      // Allow partial data for testing (fill missing with 0)
      if (parts.length >= 1) {
        const newData: GliderData = {
          voltage: parseFloat(parts[0]) || 0,
          depth: parseFloat(parts[1]) || 0,
          o2: parseFloat(parts[2]) || 0,
          status: parseInt(parts[3]) || 0,
          timestamp: Date.now(),
        };
        
        // Debugging: Log parsed object
        console.log("Parsed Data:", newData);

        setData(newData);
        setHistory(prev => {
          const newHistory = [...prev, newData];
          // Keep last 60 points (approx 60 seconds) for chart
          if (newHistory.length > 60) {
            return newHistory.slice(newHistory.length - 60);
          }
          return newHistory;
        });
      }
    } catch (e) {
      console.warn("Parse error:", e, line);
    }
  };

  return { status, data, history, connect, disconnect };
};
