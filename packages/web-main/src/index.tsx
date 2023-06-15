import { StrictMode, useEffect } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import App from './App';
import reportWebVitals from './reportWebVitals';
import * as Sentry from '@sentry/react';
import { BrowserTracing } from '@sentry/react';
import {
  useLocation,
  useNavigationType,
  createRoutesFromChildren,
  matchRoutes,
} from 'react-router-dom';

// styles required for slider component we rely on
import 'rc-slider/assets/index.css';

const container = document.getElementById('root')!;
const root = createRoot(container);

Sentry.init({
  dsn: 'https://1f9c7d5b5d7d43da938d9a3ec6215633@o387782.ingest.sentry.io/4504889880018944',
  integrations: [
    new Sentry.Integrations.Breadcrumbs({
      console: false,
    }),
    new BrowserTracing({
      routingInstrumentation: Sentry.reactRouterV6Instrumentation(
        useEffect,
        useLocation,
        useNavigationType,
        createRoutesFromChildren,
        matchRoutes
      ),
    }),
  ],

  // TODO: We only have x amount of free traces per month.
  // To prevent this from being exceeded, we can should lower the sample to only send e.g. 20% of traces.
  tracesSampleRate: 1,
});

root.render(<App />);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
