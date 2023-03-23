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

const container = document.getElementById('root')!;
const root = createRoot(container);

Sentry.init({
  dsn: 'https://680aa3da69d1403087badf79abed972c@o387782.ingest.sentry.io/5632900',
  // TODO: should have events come from different environments.
  environment: 'dev', // also have a 'prod' | 'stg' | 'QA' | 'dev'
  integrations: [
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

root.render(
  <StrictMode>
    <App />
  </StrictMode>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
