import React from 'react';
import ReactDOM from 'react-dom/client';
import '@fontsource/fredoka/600.css';
import '@fontsource/fredoka/700.css';
import '@fontsource/inter/400.css';
import '@fontsource/inter/600.css';
import '@/styles/tokens.css';
import '@/styles/global.css';
import { App } from '@/app/App';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
