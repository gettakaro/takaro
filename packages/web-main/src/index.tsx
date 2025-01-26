/// <reference path="./@tanstack.d.ts" />
import { createRoot } from 'react-dom/client';
import { App } from './App';

// TODO: currently this results in web-main not loading at all.
//import { registerWebVitalCallbacks } from './reportWebVitals';
import * as Sentry from '@sentry/react';
import 'simplebar-react/dist/simplebar.min.css';
import { StrictMode } from 'react';

const container = document.getElementById('takaro-root');
if (!container) throw new Error('No root element with id "takaro-root" found');
const root = createRoot(container);

Sentry.init({
  dsn: 'https://1f9c7d5b5d7d43da938d9a3ec6215633@o387782.ingest.sentry.io/4504889880018944',
  // To prevent this from being exceeded, we should lower the sample to only send e.g. 20% of traces.

  integrations: [
    Sentry.breadcrumbsIntegration({
      console: false,
    }),
    Sentry.captureConsoleIntegration({
      levels: ['error'],
    }),

    // TODO: setup sentry routing for tanstack/react-router
    // https://github.com/getsentry/sentry-javascript/issues/7927
    // tracesSampleRate: 1.0,
    /*
    new Sentry.BrowserTracing({
      routingInstrumentation: Sentry.reactRouterV6Instrumentation(
        useEffect,
        useLocation,
        useNavigationType,
        createRoutesFromChildren,
        matchRoutes
      ),
    }),
    */
  ],
});

root.render(
  <StrictMode>
    <App />
  </StrictMode>,
);

// registerWebVitalCallbacks();
