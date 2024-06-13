const envMap: Record<keyof TakaroConfig, string> = {
  apiUrl: 'VITE_API',
} as const;

export interface TakaroConfig {
  apiUrl: string;
}

declare global {
  interface Window {
    __env__: TakaroConfig;
  }
}

export function getConfigVar(name: keyof typeof envMap) {
  const envVarKey = envMap[name];

  if (window.__env__[envVarKey as keyof TakaroConfig]) {
    return window.__env__[envVarKey as keyof TakaroConfig];
  }
  const metaEnvVar = import.meta.env[envVarKey];
  if (metaEnvVar) {
    return metaEnvVar;
  }
  throw new Error(`Environment variable ${envVarKey} is not defined`);
}
