import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import AppRouter from './app/AppRouter';
import './index.css';
import './modules/hu-01/index.css';
import './modules/hu-02/index.css';
import './modules/hu-03/index.css';
import './modules/hu-04/index.css';
import './modules/hu-05/index.css';
import './modules/hu-07/index.css';
import './modules/hu-13/index.css';
import './modules/hu-14/index.css';
import './modules/hu-15/index.css';
import './modules/hu-19/index.css';

const root = document.getElementById('module-root');

if (!root) {
  throw new Error('No se encontró el contenedor principal de TraceLog.');
}

createRoot(root).render(
  <StrictMode>
    <AppRouter />
  </StrictMode>,
);
