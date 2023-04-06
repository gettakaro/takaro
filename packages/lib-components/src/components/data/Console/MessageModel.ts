export type MessageType = 'info' | 'warning' | 'error' | 'debug' | 'command';

export interface Message {
  type: MessageType;
  timestamp: string;
  data: string;
  // in case it is a command
  result?: string;
}
