/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_API: string;
  readonly VITE_ORY_URL: string;
  readonly VITE_POSTHOG_API_URL: string;
  readonly VITE_POSTHOG_PUBLIC_API_KEY: string;
  readonly VITE_BILLING_API_URL: string;
  readonly VITE_BILLING_MANAGE_URL: string;
  readonly VITE_BILLING_ENABLED: boolean;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
