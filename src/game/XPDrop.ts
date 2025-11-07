import Phaser from 'phaser'

export enum XPSize {
  SMALL = 5,
  MEDIUM = 10,
  LARGE = 25,
}

export class XPDrop extends Phaser.GameObjects.Text {
  private xpValue: number
  private magnetRadius: number = 150
  private magnetSpeed: number = 300
  private isBeingCollected: boolean = false
  private sparkleParticles: Phaser.GameObjects.Text[] = []
  declare body: Phaser.Physics.Arcade.Body

  constructor(scene: Phaser.Scene, x: number, y: number) {
    super(scene, x, y, '●', {
      fontFamily: 'Courier New',
      fontSize: '8px',
      color: '#00ddff',
    })

    this.setOrigin(0.5)
    this.setStroke('#00ddff', 1) // Light blue outline for XP
    this.setDepth(30) // XP renders above player
    this.xpValue = XPSize.SMALL

    // Add to scene and enable physics
    scene.add.existing(this)
    scene.physics.add.existing(this)

    // Start inactive and move off-screen to prevent collisions at 0,0
    this.setActive(false)
    this.setVisible(false)
    this.setPosition(-1000, -1000)
  }

  spawn(x: number, y: number, xpValue: number = XPSize.SMALL) {
    // Reset value
    this.xpValue = xpValue
    this.isBeingCollected = false

    // Set size based on XP value (all same light blue color, 50% smaller)
    if (xpValue <= XPSize.SMALL) {
      this.setColor('#00ddff') // Light blue for all XP
      this.setStroke('#00ddff', 1)
      this.setFontSize('7px')
    } else if (xpValue <= XPSize.MEDIUM) {
      this.setColor('#00ddff') // Light blue for all XP
      this.setStroke('#00ddff', 1)
      this.setFontSize('8px')
    } else {
      this.setColor('#00ddff') // Light blue for all XP
      this.setStroke('#00ddff', 2)
      this.setFontSize('9px')
    }

    // Reset position first
    this.body.reset(x, y)
    this.setPosition(x, y)
    this.body.setVelocityY(50) // Slow fall

    // Then activate
    this.setActive(true)
    this.setVisible(true)
    this.setAlpha(1)

    // Add pulsing animation
    this.scene.tweens.add({
      targets: this,
      scale: { from: 1.2, to: 1 },
      alpha: { from: 1, to: 0.8 },
      duration: 600,
      yoyo: true,
      repeat: -1,
    })

    // Create sparkle effect
    this.createSparkle()
  }

  private createSparkle() {
    // Create sparkles for XP drops (reduced for better performance)
    // Small (5): 1-2 sparkles
    // Medium (10): 2-3 sparkles
    // Large (25): 3-4 sparkles
    let sparkleCount: number
    let sparkleSize: string
    if (this.xpValue <= 5) {
      sparkleCount = Phaser.Math.Between(1, 2)
      sparkleSize = '6px'
    } else if (this.xpValue <= 10) {
      sparkleCount = Phaser.Math.Between(2, 3)
      sparkleSize = '7px'
    } else {
      sparkleCount = Phaser.Math.Between(3, 4)
      sparkleSize = '8px'
    }

    for (let i = 0; i < sparkleCount; i++) {
      const angle = (Math.PI * 2 / sparkleCount) * i
      const distance = 10 + (this.xpValue > 10 ? 3 : 0)
      const offsetX = Math.cos(angle) * distance
      const offsetY = Math.sin(angle) * distance

      const sparkle = this.scene.add.text(
        this.x + offsetX,
        this.y + offsetY,
        '✦',
        {
          fontFamily: 'Courier New',
          fontSize: sparkleSize,
          color: '#ffffff',
        }
      ).setOrigin(0.5).setAlpha(0).setDepth(31) // Sparkles slightly above XP

      this.sparkleParticles.push(sparkle)

      // Animate sparkle - faster and bigger for higher value
      const animDuration = this.xpValue > 10 ? 350 : 400
      this.scene.tweens.add({
        targets: sparkle,
        alpha: { from: 0, to: 1 },
        scale: { from: 0.5, to: this.xpValue > 10 ? 2 : 1.5 },
        duration: animDuration,
        yoyo: true,
        repeat: -1,
        delay: i * 100,
      })
    }
  }

  getXPValue(): number {
    return this.xpValue
  }

  update(playerX: number, playerY: number, pickupRadius?: number) {
    if (!this.active) return

    // Use provided pickup radius or fall back to default
    const effectiveRadius = pickupRadius !== undefined ? pickupRadius : this.magnetRadius

    // Update sparkle positions to follow XP
    this.sparkleParticles.forEach((sparkle, i) => {
      if (sparkle.active) {
        const angle = (Math.PI * 2 / this.sparkleParticles.length) * i
        const distance = 10
        sparkle.setPosition(
          this.x + Math.cos(angle) * distance,
          this.y + Math.sin(angle) * distance
        )
      }
    })

    // Calculate distance to player
    const distance = Phaser.Math.Distance.Between(this.x, this.y, playerX, playerY)

    // If within magnet radius OR already being collected, move towards player
    if (distance < effectiveRadius || this.isBeingCollected) {
      this.isBeingCollected = true

      // Calculate direction to player
      const angle = Phaser.Math.Angle.Between(this.x, this.y, playerX, playerY)

      // Move towards player
      this.body.setVelocity(
        Math.cos(angle) * this.magnetSpeed,
        Math.sin(angle) * this.magnetSpeed
      )

      // If very close to player, collect it (increased from 30 to 60 for easier pickup)
      if (distance < 60) {
        this.collect()
      }
    }

    // Deactivate if off bottom of screen
    if (this.y > this.scene.cameras.main.height + 50) {
      this.cleanupSparkles()
      this.setActive(false)
      this.setVisible(false)
      this.body.setVelocity(0, 0)
      this.setPosition(-1000, -1000)
    }
  }

  private collect() {
    // Emit collection event
    this.scene.events.emit('xpCollected', this.xpValue)

    // Stop any tweens on this object
    this.scene.tweens.killTweensOf(this)

    // Clean up sparkles
    this.cleanupSparkles()

    // Deactivate
    this.setActive(false)
    this.setVisible(false)
    this.body.setVelocity(0, 0)
    this.setPosition(-1000, -1000)
    this.setScale(1)
    this.setAlpha(1)
  }

  private cleanupSparkles() {
    // Destroy all sparkle particles
    this.sparkleParticles.forEach(sparkle => {
      this.scene.tweens.killTweensOf(sparkle)
      sparkle.destroy()
    })
    this.sparkleParticles = []
  }
}

export class XPDropGroup extends Phaser.Physics.Arcade.Group {
  private pool: XPDrop[] = []

  constructor(scene: Phaser.Scene, poolSize: number = 100) {
    super(scene.physics.world, scene)

    // Create pool of XP drops
    for (let i = 0; i < poolSize; i++) {
      const xpDrop = new XPDrop(scene, 0, 0)
      this.add(xpDrop, false)  // false = already added to scene in constructor
      this.pool.push(xpDrop)
    }
  }

  spawnXP(x: number, y: number, xpValue: number = XPSize.SMALL) {
    // Get an inactive XP drop from the pool
    const xpDrop = this.pool.find(xp => !xp.active)

    if (xpDrop) {
      xpDrop.spawn(x, y, xpValue)
      return xpDrop
    }

    return null
  }

  update(playerX: number, playerY: number, pickupRadius?: number) {
    // Update all active XP drops
    this.pool.forEach(xpDrop => {
      if (xpDrop.active) {
        xpDrop.update(playerX, playerY, pickupRadius)
      }
    })
  }

  getActiveCount(): number {
    return this.pool.filter(xp => xp.active).length
  }
}
