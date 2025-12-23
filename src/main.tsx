import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.tsx'
import './index.css'

// Global error handlers to catch crashes (helpful for debugging mobile issues)
window.onerror = (message, source, lineno, colno, error) => {
  console.error('[Global Error]', { message, source, lineno, colno, error })
  // Prevent default browser error handling which might cause reload
  return true
}

window.addEventListener('unhandledrejection', (event) => {
  console.error('[Unhandled Promise Rejection]', event.reason)
  // Prevent default handling
  event.preventDefault()
})

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)

// Register service worker for PWA offline support
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker
      .register('/AcecraftPrototype/sw.js')
      .then(registration => {
        console.log('Service Worker registered:', registration)
      })
      .catch(error => {
        console.log('Service Worker registration failed:', error)
      })
  })
}
