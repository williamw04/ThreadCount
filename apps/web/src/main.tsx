import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { App } from './App';
// Global CSS tokens (--page-px, --header-h, --bg, etc.) from design-docs/visual-style.md
import './styles/globals.css';

const root = document.getElementById('root');
if (!root) throw new Error('Root element not found');

// Provider hierarchy (outermost → innermost):
//   StrictMode → double-effect checks in dev
//   BrowserRouter → client-side routing via React Router v7
//   App → auth initialization + route tree
createRoot(root).render(
  <StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </StrictMode>,
);
