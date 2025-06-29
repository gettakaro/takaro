/// <reference path="./@tanstack.d.ts" />
import { createRoot } from 'react-dom/client';
import { App } from './App';

// TODO: currently this results in web-main not loading at all.
//import { registerWebVitalCallbacks } from './reportWebVitals';
import 'simplebar-react/dist/simplebar.min.css';
import { StrictMode } from 'react';

const container = document.getElementById('takaro-root');
if (!container) throw new Error('No root element with id "takaro-root" found');
const root = createRoot(container);

root.render(
  <StrictMode>
    <App />
  </StrictMode>,
);

// registerWebVitalCallbacks();
