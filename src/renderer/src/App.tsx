import React from 'react'
import { Canvas } from './components/Canvas'
import { PropertiesPanel } from './components/PropertiesPanel'
import { Sidebar } from './components/Sidebar'
import { Timeline } from './components/Timeline'
import { Toolbar } from './components/Toolbar'
import './components/Sidebar.css'
import './components/Toolbar.css'
import './components/Timeline.css'
import './components/PropertiesPanel.css'

function Login({ onLogin }: { onLogin: () => void }) {
  const [username, setUsername] = React.useState('')
  const [password, setPassword] = React.useState('')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    // Mock login
    if (username && password) onLogin()
  }

  return (
    <div className="login-container">
      <form onSubmit={handleSubmit} className="login-form">
        <h2>SVG Animator Login</h2>
        <input
          type="text"
          placeholder="Username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <button type="submit">Login</button>
      </form>
    </div>
  )
}

function App(): JSX.Element {
  const [isLoggedIn, setIsLoggedIn] = React.useState(false)

  if (!isLoggedIn) {
    return <Login onLogin={() => setIsLoggedIn(true)} />
  }

  return (
    <div className="container">
      <Toolbar />
      <main>
        <div className="sidebar">
          <Sidebar />
        </div>
        <div className="canvas">
          <Canvas />
        </div>
        <div className="properties">
          <PropertiesPanel />
        </div>
      </main>
      <footer>
        <Timeline />
      </footer>
    </div>
  )
}

/** Top-level desktop renderer that gates mock login and lays out the editor workspace. */
export default App
