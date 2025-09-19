import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.tsx'
import './index.css'

console.log('Main.tsx loaded');
console.log('Root element:', document.getElementById('root'));



try {
  const root = ReactDOM.createRoot(document.getElementById('root')!);
  console.log('React root created');
  
  root.render(
    <React.StrictMode>
      <App />
    </React.StrictMode>,
  );
  console.log('App rendered');
} catch (error) {
  console.error('Error rendering app:', error);
}