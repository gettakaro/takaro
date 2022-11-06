export type MessageType = 'info' | 'warning' | 'error' | 'debug' | 'command';

export interface Message {
  type: MessageType;
  timestamp: string;
  data: string;
  trace?: string;
}
