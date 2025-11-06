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
  public body!: Phaser.Physics.Arcade.Body

  constructor(scene: Phaser.Scene, x: number, y: number) {
    super(scene, x, y, '●', {
      fontFamily: 'Courier New',
      fontSize: '24px',
      color: '#00ff00',
    })

    this.setOrigin(0.5)
    this.setStroke('#00ff00', 3) // Green outline for pickups
    this.xpValue = XPSize.SMALL

    // Add to scene and enable physics
    scene.add.existing(this)
    scene.physics.add.existing(this)

    // Start inactive
    this.setActive(false)
    this.setVisible(false)
  }

  spawn(x: number, y: number, xpValue: number = XPSize.SMALL) {
    // Reset position and value
    this.setPosition(x, y)
    this.xpValue = xpValue
    this.isBeingCollected = false

    // Set color and size based on XP value
    if (xpValue <= XPSize.SMALL) {
      this.setColor('#00ff00') // Green for small
      this.setStroke('#00ff00', 3)
      this.setFontSize('22px')
    } else if (xpValue <= XPSize.MEDIUM) {
      this.setColor('#00ffff') // Cyan for medium
      this.setStroke('#00ffff', 3)
      this.setFontSize('26px')
    } else {
      this.setColor('#ff00ff') // Magenta for large
      this.setStroke('#ff00ff', 4)
      this.setFontSize('30px')
    }

    // Activate the XP drop
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

  getXPValue(): number {
    return this.xpValue
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
    this.scene.events.emit('xpCollected', this.xpValue)

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

export class XPDropGroup extends Phaser.Physics.Arcade.Group {
  private pool: XPDrop[] = []

  constructor(scene: Phaser.Scene, poolSize: number = 100) {
    super(scene.physics.world, scene)

    // Create pool of XP drops
    for (let i = 0; i < poolSize; i++) {
      const xpDrop = new XPDrop(scene, 0, 0)
      this.add(xpDrop, true)
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

  update(playerX: number, playerY: number) {
    // Update all active XP drops
    this.pool.forEach(xpDrop => {
      if (xpDrop.active) {
        xpDrop.update(playerX, playerY)
      }
    })
  }

  getActiveCount(): number {
    return this.pool.filter(xp => xp.active).length
  }
}
