import { EnvVars } from 'EnvVars';
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

export function getConfigVar(name: EnvVars) {
  if (window.__env__[name]) {
    return window.__env__[name];
  }

  // if not found in env.js, vite automatically loads all env vars with VITE_ prefix
  switch (name) {
    case EnvVars.VITE_API:
      return import.meta.env.VITE_API;
    case EnvVars.VITE_ORY_URL:
      return import.meta.env.VITE_ORY_URL;
  }
}

export const ConfigContext = createContext<TakaroConfig>(null as unknown as TakaroConfig);
