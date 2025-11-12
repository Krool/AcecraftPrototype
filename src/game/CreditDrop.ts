import Phaser from 'phaser'

export class CreditDrop extends Phaser.GameObjects.Text {
  private creditValue: number
  private magnetRadius: number = 150
  private magnetSpeed: number = 300
  private isBeingCollected: boolean = false
  private sparkleParticles: Phaser.GameObjects.Text[] = []
  declare body: Phaser.Physics.Arcade.Body

  constructor(scene: Phaser.Scene, x: number, y: number) {
    super(scene, x, y, '¤', {
      fontFamily: 'Courier New',
      fontSize: '24px',
      color: '#ffcc00',
    })

    this.setOrigin(0.5)
    this.setStroke('#ffaa00', 2) // Golden outline for credits
    this.setDepth(30) // Credits render above player
    this.creditValue = 1

    // Add to scene and enable physics
    scene.add.existing(this)
    scene.physics.add.existing(this)

    // Start inactive and move off-screen to prevent collisions at 0,0
    this.setActive(false)
    this.setVisible(false)
    this.setPosition(-1000, -1000)
  }

  spawn(x: number, y: number, creditValue: number = 1) {
    // Reset value
    this.creditValue = creditValue
    this.isBeingCollected = false

    // Set size based on credit value (all same gold color)
    if (creditValue <= 2) {
      this.setColor('#ffcc00')
      this.setFontSize('18px')
      this.setStroke('#ffaa00', 2)
    } else if (creditValue <= 5) {
      this.setColor('#ffcc00')
      this.setFontSize('20px')
      this.setStroke('#ffaa00', 2)
    } else {
      this.setColor('#ffcc00')
      this.setFontSize('22px')
      this.setStroke('#ffaa00', 3)
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
    // Fixed at 2 sparkles for visual quality (balanced performance)
    const sparkleCount = 2
    let sparkleSize: string
    if (this.creditValue <= 2) {
      sparkleSize = '6px'
    } else if (this.creditValue <= 5) {
      sparkleSize = '7px'
    } else {
      sparkleSize = '8px'
    }

    for (let i = 0; i < sparkleCount; i++) {
      const angle = (Math.PI * 2 / sparkleCount) * i
      const distance = 10 + (this.creditValue > 5 ? 3 : 0)
      const offsetX = Math.cos(angle) * distance
      const offsetY = Math.sin(angle) * distance

      const sparkle = this.scene.add.text(
        this.x + offsetX,
        this.y + offsetY,
        '✦',
        {
          fontFamily: 'Courier New',
          fontSize: sparkleSize,
          color: '#ffdd00',
        }
      ).setOrigin(0.5).setAlpha(0).setDepth(31) // Sparkles slightly above credits

      this.sparkleParticles.push(sparkle)

      // Animate sparkle - faster animation for higher value
      const animDuration = this.creditValue > 5 ? 350 : 400
      this.scene.tweens.add({
        targets: sparkle,
        alpha: { from: 0, to: 1 },
        scale: { from: 0.5, to: this.creditValue > 5 ? 2 : 1.5 },
        duration: animDuration,
        yoyo: true,
        repeat: -1,
        delay: i * 100,
      })
    }
  }

  getCreditValue(): number {
    return this.creditValue
  }

  update(playerX: number, playerY: number, pickupRadius?: number) {
    if (!this.active) return

    // Use provided pickup radius or fall back to default
    const effectiveRadius = pickupRadius !== undefined ? pickupRadius : this.magnetRadius

    // Update sparkle positions to follow credit
    this.sparkleParticles.forEach((sparkle, i) => {
      if (sparkle.active) {
        const angle = (Math.PI * 2 / this.sparkleParticles.length) * i
        const distance = 10
        const offsetX = Math.cos(angle) * distance
        const offsetY = Math.sin(angle) * distance
        sparkle.setPosition(this.x + offsetX, this.y + offsetY)
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
      // Kill tweens to prevent memory leak when reusing pooled object
      this.scene.tweens.killTweensOf(this)
      this.cleanupSparkles()
      this.setActive(false)
      this.setVisible(false)
      this.body.setVelocity(0, 0)
      this.setPosition(-1000, -1000)
      this.setScale(1)
      this.setAlpha(1)
    }
  }

  private cleanupSparkles() {
    // Check if scene still exists before cleanup (prevents crash on scene destroy)
    if (!this.scene || !this.scene.sys) {
      this.sparkleParticles = []
      return
    }

    // Destroy all sparkle particles
    this.sparkleParticles.forEach(sparkle => {
      if (sparkle && sparkle.scene) {
        this.scene.tweens.killTweensOf(sparkle)
        sparkle.destroy()
      }
    })
    this.sparkleParticles = []
  }

  preDestroy() {
    // Clean up sparkles when CreditDrop itself is destroyed
    this.cleanupSparkles()
  }

  private collect() {
    // Emit collection event
    this.scene.events.emit('creditCollected', this.creditValue)

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
}

export class CreditDropGroup extends Phaser.Physics.Arcade.Group {
  private pool: CreditDrop[] = []

  constructor(scene: Phaser.Scene, poolSize: number = 50) {
    super(scene.physics.world, scene)

    // Create pool of credit drops
    for (let i = 0; i < poolSize; i++) {
      const creditDrop = new CreditDrop(scene, 0, 0)
      this.add(creditDrop, false)  // false = already added to scene in constructor
      this.pool.push(creditDrop)
    }
  }

  spawnCredit(x: number, y: number, creditValue: number = 1) {
    // Get an inactive credit drop from the pool
    const creditDrop = this.pool.find(credit => !credit.active)

    if (creditDrop) {
      creditDrop.spawn(x, y, creditValue)
      return creditDrop
    }

    return null
  }

  update(playerX: number, playerY: number, pickupRadius?: number) {
    // Update all active credit drops
    this.pool.forEach(creditDrop => {
      if (creditDrop.active) {
        creditDrop.update(playerX, playerY, pickupRadius)
      }
    })
  }

  getActiveCount(): number {
    return this.pool.filter(credit => credit.active).length
  }
}
