// Minimal type definitions for Web Serial API
interface SerialPort {
  open(options: { baudRate: number }): Promise<void>;
  close(): Promise<void>;
  readable: ReadableStream;
  writable: WritableStream;
}

interface Navigator {
  serial: {
    requestPort(options?: any): Promise<SerialPort>;
  };
}
