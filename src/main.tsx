/**
 * main.tsx
 * 
 * Application entry point. Renders the root App component into the DOM.
 * Used by Vite's build system to bootstrap the React application.
 */

import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.tsx';
import './index.css';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);

