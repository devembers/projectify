import { createRoot } from 'react-dom/client';
import '@vscode/codicons/dist/codicon.css';
import { App } from './App.js';
import { ThemeProvider } from './utils/themeUtils.js';
import './styles/reset.css';
import './styles/variables.css';
import './styles/components.css';

const root = createRoot(document.getElementById('root')!);
root.render(
  <ThemeProvider>
    <App />
  </ThemeProvider>,
);
