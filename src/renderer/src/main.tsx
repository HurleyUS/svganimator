import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import './index.css'

/** Mounts the React renderer into the provided root element. */
export function mountApp(root: HTMLElement): void {
  ReactDOM.createRoot(root).render(
    <React.StrictMode>
      <App />
    </React.StrictMode>
  )
}

mountApp(document.getElementById('root') as HTMLElement)
