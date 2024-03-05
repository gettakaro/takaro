/// <reference path="./@tanstack.d.ts" />
import { createRoot } from 'react-dom/client';
import './index.css';
import { App } from './App';
import reportWebVitals from './reportWebVitals';
import * as Sentry from '@sentry/react';
import * as SentryIntegration from '@sentry/integrations';

// styles required for slider component we rely on
import 'rc-slider/assets/index.css';
import 'simplebar-react/dist/simplebar.min.css';

const container = document.getElementById('takaro-root');
if (!container) throw new Error('No root element with id "takaro-root" found');
const root = createRoot(container);

Sentry.init({
  dsn: 'https://1f9c7d5b5d7d43da938d9a3ec6215633@o387782.ingest.sentry.io/4504889880018944',
  // To prevent this from being exceeded, we should lower the sample to only send e.g. 20% of traces.

  integrations: [
    new Sentry.Integrations.Breadcrumbs({
      console: false,
    }),
    SentryIntegration.captureConsoleIntegration({
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

root.render(<App />);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
