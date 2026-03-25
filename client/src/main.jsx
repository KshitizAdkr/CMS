import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'

// Apply saved dark mode preference before render
if (localStorage.getItem('medicare_theme') === 'dark') {
  document.body.classList.add('dark-mode');
}

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
