import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import { ColorModeProvider } from './theme';
import './index.css';

const root = ReactDOM.createRoot(document.getElementById('root'));

root.render(
  <React.StrictMode>
    <ColorModeProvider>
      <App />
    </ColorModeProvider>
  </React.StrictMode>
);
