const envMap: Record<keyof TakaroConfig, string> = {
  apiUrl: 'VITE_API',
  oryUrl: 'VITE_ORY_URL',
  posthogApiUrl: 'VITE_POSTHOG_API_URL',
  posthogPublicApiKey: 'VITE_POSTHOG_PUBLIC_API_KEY',
  takaroVersion: 'VITE_TAKARO_VERSION',
} as const;

export interface TakaroConfig {
  apiUrl: string;
  oryUrl: string;
  posthogApiUrl: string;
  posthogPublicApiKey: string;
  takaroVersion: string;
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

export function getTakaroVersionComponents(takaroVersionString: string) {
  const parts = takaroVersionString.split('-');
  return {
    version: parts[0],
    commitHash: parts[1],
    buildData: parts[2],
  };
}
