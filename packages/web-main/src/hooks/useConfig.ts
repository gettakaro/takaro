import { useEffect, useState } from 'react';

interface TakaroConfig {
  apiUrl: string;
  oryUrl: string;
}

declare global {
  interface Window {
    __env__: Record<string, string>;
  }
}

export function useConfig() {
  const [config, setConfig] = useState<TakaroConfig | null>(null);

  useEffect(() => {
    const cfg = {
      ...window.__env__,
      ...process.env,
    };

    setConfig(cfg as unknown as TakaroConfig);
  }, []);

  return config;
}
