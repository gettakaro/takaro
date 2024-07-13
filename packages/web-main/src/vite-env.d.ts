/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_API: string;
  readonly VITE_ORY_URL: string;
  readonly VITE_POSTHOG_API_URL: string;
  readonly VITE_POSTHOG_PUBLIC_API_KEY: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
