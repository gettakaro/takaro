/// <reference path="./@tanstack.d.ts" />
import { createRoot } from 'react-dom/client';
import './index.css';
import { App } from './App';

import 'rc-slider/assets/index.css';
import 'simplebar-react/dist/simplebar.min.css';

const container = document.getElementById('takaro-root');
if (!container) throw new Error('No root element with id "takaro-root" found');
const root = createRoot(container);

root.render(<App />);
