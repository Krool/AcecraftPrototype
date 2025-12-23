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

    // Handle visibility changes (app backgrounding on mobile)
    const handleVisibilityChange = () => {
      if (!gameRef.current) return
      if (document.hidden) {
        // Pause game when hidden to prevent issues on resume
        gameRef.current.scene.scenes.forEach(scene => {
          if (scene.scene.isActive()) {
            scene.scene.pause()
          }
        })
      } else {
        // Resume game when visible
        gameRef.current.scene.scenes.forEach(scene => {
          if (scene.scene.isPaused()) {
            scene.scene.resume()
          }
        })
      }
    }
    document.addEventListener('visibilitychange', handleVisibilityChange)

    // Handle WebGL context loss (common on mobile)
    // Canvas is created asynchronously, so we need to wait for it
    const handleContextLost = (e: Event) => {
      e.preventDefault()
      console.warn('[Phaser] WebGL context lost - preventing default')
    }
    const handleContextRestored = () => {
      console.log('[Phaser] WebGL context restored')
    }

    // Wait for canvas to be created, then attach handlers
    const attachCanvasHandlers = () => {
      const canvas = containerRef.current?.querySelector('canvas')
      if (canvas) {
        canvas.addEventListener('webglcontextlost', handleContextLost)
        canvas.addEventListener('webglcontextrestored', handleContextRestored)
        return true
      }
      return false
    }

    // Try immediately, then poll if not ready
    if (!attachCanvasHandlers()) {
      const checkInterval = setInterval(() => {
        if (attachCanvasHandlers()) {
          clearInterval(checkInterval)
        }
      }, 50)
      // Clean up interval after 2 seconds if canvas never appears
      setTimeout(() => clearInterval(checkInterval), 2000)
    }

    // Prevent iOS edge swipe navigation
    const preventEdgeSwipe = (e: TouchEvent) => {
      const touch = e.touches[0]
      if (touch && (touch.clientX < 20 || touch.clientX > window.innerWidth - 20)) {
        e.preventDefault()
      }
    }
    document.addEventListener('touchstart', preventEdgeSwipe, { passive: false })

    // Cleanup on unmount
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange)
      document.removeEventListener('touchstart', preventEdgeSwipe)
      const canvas = containerRef.current?.querySelector('canvas')
      if (canvas) {
        canvas.removeEventListener('webglcontextlost', handleContextLost)
        canvas.removeEventListener('webglcontextrestored', handleContextRestored)
      }
      if (gameRef.current) {
        gameRef.current.destroy(true)
        gameRef.current = null
      }
    }
  }, [])

  return <div ref={containerRef} id="phaser-game" />
}

export default PhaserGame
