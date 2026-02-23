export interface GliderData {
  voltage: number;
  depth: number;
  o2: number;
  status: number;
  tinyml_result: number;
  pitch: number;
  roll: number;
  yaw: number;
  timestamp: number;
  temp?: number;
  altitude?: number;
  pressure?: number;
  ph?: number;
  ec?: number;
  ado?: number;
  o2Str?: string;
  rssi?: number;
}

export type ConnectionStatus = 'disconnected' | 'connecting' | 'connected' | 'error';
