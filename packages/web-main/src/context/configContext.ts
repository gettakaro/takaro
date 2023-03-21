import { createContext } from 'react';

export interface TakaroConfig {
  apiUrl: string;
  oryUrl: string;
}

declare global {
  interface Window {
    __env__: TakaroConfig;
  }
}

export function getConfigVar(name: string) {
  return window.__env__[name] || process.env[name];
}

export const ConfigContext = createContext<TakaroConfig>(
  null as unknown as TakaroConfig
);
