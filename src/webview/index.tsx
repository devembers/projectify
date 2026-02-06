import { createRoot } from 'react-dom/client';
import '@vscode/codicons/dist/codicon.css';
import { App } from './App.js';
import './styles/reset.css';
import './styles/variables.css';
import './styles/components.css';

const root = createRoot(document.getElementById('root')!);
root.render(<App />);
