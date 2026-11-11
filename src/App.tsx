import { useState } from 'react'
import './App.css'
import PhaserGame from './game/PhaserGame'

function App() {
  const [gameStarted, setGameStarted] = useState(false)

  return (
    <div className="app">
      {!gameStarted ? (
        <div className="menu">
          <h1 className="title">RC</h1>
          <button
            className="start-button"
            onClick={() => setGameStarted(true)}
          >
            Start
          </button>
          <a
            className="privacy-link"
            href={`${import.meta.env.BASE_URL}privacy.html`}
            target="_blank"
            rel="noopener"
          >
            Privacy
          </a>
        </div>
      ) : (
        <PhaserGame />
      )}
    </div>
  )
}

export default App
