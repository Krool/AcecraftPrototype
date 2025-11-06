import Phaser from 'phaser'

export enum PowerUpType {
  SHIELD = 'SHIELD',         // Temporary invincibility
  RAPID_FIRE = 'RAPID_FIRE', // Temporary fire rate boost
  NUKE = 'NUKE',             // Instant clear all enemies
  MAGNET = 'MAGNET',         // Attract all XP
}

export interface PowerUpConfig {
  symbol: string
  color: string
  duration: number // Duration in ms (0 for instant effects)
}

export const POWERUP_CONFIGS: Record<PowerUpType, PowerUpConfig> = {
  [PowerUpType.SHIELD]: {
    symbol: '◆',
    color: '#00ffff',
    duration: 5000, // 5 seconds
  },
  [PowerUpType.RAPID_FIRE]: {
    symbol: '»',
    color: '#ff00ff',
    duration: 8000, // 8 seconds
  },
  [PowerUpType.NUKE]: {
    symbol: '※',
    color: '#ffff00',
    duration: 0, // Instant effect
  },
  [PowerUpType.MAGNET]: {
    symbol: '⊕',
    color: '#00ff00',
    duration: 10000, // 10 seconds
  },
}

export class PowerUp extends Phaser.GameObjects.Text {
  private powerUpType: PowerUpType
  private speed: number = 100
  public body!: Phaser.Physics.Arcade.Body

  constructor(scene: Phaser.Scene, x: number, y: number) {
    super(scene, x, y, '', {
      fontFamily: 'Courier New',
      fontSize: '32px',
      color: '#ffffff',
    })

    this.setOrigin(0.5)
    this.setStroke('#00ff00', 2) // Green outline for pickups
    this.powerUpType = PowerUpType.SHIELD

    // Add to scene and enable physics
    scene.add.existing(this)
    scene.physics.add.existing(this)

    // Start inactive
    this.setActive(false)
    this.setVisible(false)
  }

  spawn(x: number, y: number, type: PowerUpType) {
    const config = POWERUP_CONFIGS[type]

    // Set properties
    this.powerUpType = type
    this.setText(config.symbol)
    this.setColor(config.color)
    this.setStroke('#00ff00', 2) // Green outline for pickups

    // Position and activate
    this.setPosition(x, y)
    this.setActive(true)
    this.setVisible(true)

    // Enable physics and set downward velocity
    this.body.enable = true
    this.body.reset(x, y)
    this.body.setVelocityY(this.speed)

    // Add pulsing animation
    this.scene.tweens.add({
      targets: this,
      scale: 1.3,
      duration: 500,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut'
    })
  }

  getPowerUpType(): PowerUpType {
    return this.powerUpType
  }

  collect() {
    this.setActive(false)
    this.setVisible(false)
    this.body.enable = false
    this.scene.tweens.killTweensOf(this)
    this.setScale(1) // Reset scale
  }

  update() {
    // Deactivate if off screen (bottom)
    if (this.active && this.y > this.scene.cameras.main.height + 50) {
      this.setActive(false)
      this.setVisible(false)
      this.body.enable = false
      this.scene.tweens.killTweensOf(this)
      this.setScale(1)
    }
  }
}

export class PowerUpGroup extends Phaser.Physics.Arcade.Group {
  private pool: PowerUp[] = []

  constructor(scene: Phaser.Scene, poolSize: number = 20) {
    super(scene.physics.world, scene)

    // Create pool of power-ups
    for (let i = 0; i < poolSize; i++) {
      const powerUp = new PowerUp(scene, 0, 0)
      this.add(powerUp, true)
      this.pool.push(powerUp)
    }
  }

  spawnPowerUp(x: number, y: number, type: PowerUpType) {
    // Get an inactive power-up from the pool
    const powerUp = this.pool.find(p => !p.active)

    if (powerUp) {
      powerUp.spawn(x, y, type)
      return powerUp
    }

    return null
  }

  spawnRandomPowerUp(x: number, y: number) {
    // Random power-up type based on weighted probabilities
    const rand = Math.random() * 100
    let type: PowerUpType

    if (rand < 40) {
      type = PowerUpType.RAPID_FIRE // 40% chance
    } else if (rand < 70) {
      type = PowerUpType.SHIELD // 30% chance
    } else if (rand < 90) {
      type = PowerUpType.MAGNET // 20% chance
    } else {
      type = PowerUpType.NUKE // 10% chance
    }

    return this.spawnPowerUp(x, y, type)
  }

  update() {
    // Update all active power-ups
    this.pool.forEach(powerUp => {
      if (powerUp.active) {
        powerUp.update()
      }
    })
  }
}
