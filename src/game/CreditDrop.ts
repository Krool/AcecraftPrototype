import Phaser from 'phaser'

export class CreditDrop extends Phaser.GameObjects.Text {
  private creditValue: number
  private magnetRadius: number = 150
  private magnetSpeed: number = 300
  private isBeingCollected: boolean = false
  public body!: Phaser.Physics.Arcade.Body

  constructor(scene: Phaser.Scene, x: number, y: number) {
    super(scene, x, y, '¤', {
      fontFamily: 'Courier New',
      fontSize: '24px',
      color: '#ffdd00',
    })

    this.setOrigin(0.5)
    this.setStroke('#ffaa00', 3) // Golden outline for credits
    this.creditValue = 1

    // Add to scene and enable physics
    scene.add.existing(this)
    scene.physics.add.existing(this)

    // Start inactive
    this.setActive(false)
    this.setVisible(false)
  }

  spawn(x: number, y: number, creditValue: number = 1) {
    // Reset position and value
    this.setPosition(x, y)
    this.creditValue = creditValue
    this.isBeingCollected = false

    // Set size based on credit value
    if (creditValue <= 2) {
      this.setFontSize('22px')
      this.setStroke('#ffaa00', 3)
    } else if (creditValue <= 5) {
      this.setFontSize('26px')
      this.setStroke('#ffaa00', 4)
    } else {
      this.setFontSize('30px')
      this.setStroke('#ffaa00', 5)
    }

    // Activate the credit drop
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

    // Enable physics body with slight downward drift
    this.body.enable = true
    this.body.reset(x, y)
    this.body.setVelocityY(50) // Slow fall
  }

  getCreditValue(): number {
    return this.creditValue
  }

  update(playerX: number, playerY: number) {
    if (!this.active) return

    // Calculate distance to player
    const distance = Phaser.Math.Distance.Between(this.x, this.y, playerX, playerY)

    // If within magnet radius, move towards player
    if (distance < this.magnetRadius) {
      this.isBeingCollected = true

      // Calculate direction to player
      const angle = Phaser.Math.Angle.Between(this.x, this.y, playerX, playerY)

      // Move towards player
      this.body.setVelocity(
        Math.cos(angle) * this.magnetSpeed,
        Math.sin(angle) * this.magnetSpeed
      )

      // If very close to player, collect it
      if (distance < 30) {
        this.collect()
      }
    } else if (this.isBeingCollected) {
      // Reset velocity if no longer in range - resume default drift
      this.isBeingCollected = false
      this.body.setVelocity(0, 50) // Reset X velocity to 0, Y to default drift
    }

    // Deactivate if off bottom of screen
    if (this.y > this.scene.cameras.main.height + 50) {
      this.setActive(false)
      this.setVisible(false)
      this.body.enable = false
    }
  }

  private collect() {
    // Emit collection event
    this.scene.events.emit('creditCollected', this.creditValue)

    // Stop any tweens on this object
    this.scene.tweens.killTweensOf(this)

    // Deactivate
    this.setActive(false)
    this.setVisible(false)
    this.body.enable = false
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
      this.add(creditDrop, true)
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

  update(playerX: number, playerY: number) {
    // Update all active credit drops
    this.pool.forEach(creditDrop => {
      if (creditDrop.active) {
        creditDrop.update(playerX, playerY)
      }
    })
  }

  getActiveCount(): number {
    return this.pool.filter(credit => credit.active).length
  }
}
