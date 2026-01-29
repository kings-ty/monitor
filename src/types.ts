export interface GliderData {
  voltage: number;
  depth: number;
  o2: number;
  status: number;
  timestamp: number;
}

export type ConnectionStatus = 'disconnected' | 'connecting' | 'connected' | 'error';
