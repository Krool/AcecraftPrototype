import { useEffect, useRef } from 'react'
import Phaser from 'phaser'
import { gameConfig } from './config'

const PhaserGame = () => {
  const gameRef = useRef<Phaser.Game | null>(null)
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!containerRef.current || gameRef.current) return

    // Create Phaser game instance
    gameRef.current = new Phaser.Game({
      ...gameConfig,
      parent: containerRef.current,
    })

    // Cleanup on unmount
    return () => {
      if (gameRef.current) {
        gameRef.current.destroy(true)
        gameRef.current = null
      }
    }
  }, [])

  return <div ref={containerRef} id="phaser-game" />
}

export default PhaserGame
