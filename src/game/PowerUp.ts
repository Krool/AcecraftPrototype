import Phaser from 'phaser'

export enum PowerUpType {
  SHIELD = 'SHIELD',         // Temporary invincibility
  RAPID_FIRE = 'RAPID_FIRE', // Temporary damage boost
  NUKE = 'NUKE',             // Instant clear all enemies
  MAGNET = 'MAGNET',         // Attract all XP
  CHEST = 'CHEST',           // Treasure chest: random 1, 3, or 5 upgrades
  HEALTH = 'HEALTH',         // Health potion: heals 20% of max health
}

export interface PowerUpConfig {
  symbol: string
  color: string
  duration: number // Duration in ms (0 for instant effects)
}

export const POWERUP_CONFIGS: Record<PowerUpType, PowerUpConfig> = {
  [PowerUpType.SHIELD]: {
    symbol: '◆',
    color: '#ff88ff', // Consistent pink/magenta for all power-ups
    duration: 5000, // 5 seconds
  },
  [PowerUpType.RAPID_FIRE]: {
    symbol: '↑',
    color: '#ff88ff', // Consistent pink/magenta for all power-ups
    duration: 8000, // 8 seconds
  },
  [PowerUpType.NUKE]: {
    symbol: '※',
    color: '#ff88ff', // Consistent pink/magenta for all power-ups
    duration: 0, // Instant effect
  },
  [PowerUpType.MAGNET]: {
    symbol: '⊕',
    color: '#ff88ff', // Consistent pink/magenta for all power-ups
    duration: 10000, // 10 seconds
  },
  [PowerUpType.CHEST]: {
    symbol: '▣',
    color: '#ffaa00', // Gold for treasure chest
    duration: 0, // Instant effect
  },
  [PowerUpType.HEALTH]: {
    symbol: '+',
    color: '#00ff00', // Green for health
    duration: 0, // Instant effect
  },
}

export class PowerUp extends Phaser.GameObjects.Text {
  private powerUpType: PowerUpType
  private speed: number = 100
  private sparkleParticles: Phaser.GameObjects.Text[] = []
  declare body: Phaser.Physics.Arcade.Body

  constructor(scene: Phaser.Scene, x: number, y: number) {
    super(scene, x, y, '', {
      fontFamily: 'Courier New',
      fontSize: '48px',
      color: '#ffffff',
    })

    this.setOrigin(0.5)
    this.setStroke('#00ff00', 3) // Green outline for pickups
    this.setShadow(2, 2, '#00ff00', 8, false, true) // Green glow
    this.setDepth(35) // Power-ups render above XP/credits
    this.powerUpType = PowerUpType.SHIELD

    // Add to scene and enable physics
    scene.add.existing(this)
    scene.physics.add.existing(this)

    // Make collision body slightly larger for easier pickup (1.5x bigger)
    this.body.setSize(72, 72) // 48px text * 1.5
    this.body.setOffset(-12, -12) // Center the larger body

    // Start inactive and move off-screen to prevent collisions at 0,0
    this.setActive(false)
    this.setVisible(false)
    this.setPosition(-1000, -1000)
  }

  spawn(x: number, y: number, type: PowerUpType) {
    const config = POWERUP_CONFIGS[type]

    // Set properties
    this.powerUpType = type
    this.setText(config.symbol)
    this.setColor(config.color)
    this.setStroke('#00ff00', 3) // Green outline for pickups

    // Reset position first
    this.body.reset(x, y)
    this.setPosition(x, y)
    this.body.setVelocityY(this.speed)

    // Then activate
    this.setActive(true)
    this.setVisible(true)

    // Add pulsing animation
    this.scene.tweens.add({
      targets: this,
      scale: 1.3,
      duration: 500,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut'
    })

    // Add sparkles for treasure chests
    if (type === PowerUpType.CHEST) {
      this.createSparkle()
    }

    // Add healing particles for health potions
    if (type === PowerUpType.HEALTH) {
      this.createHealingParticles()
    }
  }

  private createSparkle() {
    // Create 5-6 gold sparkle particles around the chest
    const sparkleCount = Phaser.Math.Between(5, 6)
    for (let i = 0; i < sparkleCount; i++) {
      const angle = (Math.PI * 2 / sparkleCount) * i
      const distance = 20
      const offsetX = Math.cos(angle) * distance
      const offsetY = Math.sin(angle) * distance

      const sparkle = this.scene.add.text(
        this.x + offsetX,
        this.y + offsetY,
        '✦',
        {
          fontFamily: 'Courier New',
          fontSize: '8px',
          color: '#ffdd00',
        }
      ).setOrigin(0.5).setAlpha(0).setDepth(36) // Sparkles slightly above power-ups

      this.sparkleParticles.push(sparkle)

      // Animate sparkle
      this.scene.tweens.add({
        targets: sparkle,
        alpha: { from: 0, to: 1 },
        scale: { from: 0.5, to: 2 },
        duration: 500,
        yoyo: true,
        repeat: -1,
        delay: i * 80,
      })
    }
  }

  private createHealingParticles() {
    // Create 4 green healing particles around the health potion
    const particleCount = 4
    for (let i = 0; i < particleCount; i++) {
      const angle = (Math.PI * 2 / particleCount) * i + Math.PI / 4 // Offset by 45 degrees
      const distance = 18
      const offsetX = Math.cos(angle) * distance
      const offsetY = Math.sin(angle) * distance

      const particle = this.scene.add.text(
        this.x + offsetX,
        this.y + offsetY,
        '+',
        {
          fontFamily: 'Courier New',
          fontSize: '12px',
          color: '#00ff00',
        }
      ).setOrigin(0.5).setAlpha(0).setDepth(36) // Particles slightly above power-ups

      this.sparkleParticles.push(particle)

      // Animate healing particle - rise upward and fade
      this.scene.tweens.add({
        targets: particle,
        alpha: { from: 0, to: 1 },
        scale: { from: 0.3, to: 1.5 },
        y: particle.y - 15,
        duration: 800,
        yoyo: true,
        repeat: -1,
        delay: i * 200,
      })
    }
  }

  getPowerUpType(): PowerUpType {
    return this.powerUpType
  }

  collect() {
    this.cleanupSparkles()
    this.setActive(false)
    this.setVisible(false)
    this.body.setVelocity(0, 0)
    this.setPosition(-1000, -1000)
    this.scene.tweens.killTweensOf(this)
    this.setScale(1) // Reset scale
  }

  private cleanupSparkles() {
    // Destroy all sparkle particles
    this.sparkleParticles.forEach(sparkle => {
      this.scene.tweens.killTweensOf(sparkle)
      sparkle.destroy()
    })
    this.sparkleParticles = []
  }

  update() {
    // Update sparkle positions to follow power-up
    this.sparkleParticles.forEach((sparkle, i) => {
      if (sparkle.active) {
        const angle = (Math.PI * 2 / this.sparkleParticles.length) * i
        const distance = 20
        const offsetX = Math.cos(angle) * distance
        const offsetY = Math.sin(angle) * distance
        sparkle.setPosition(this.x + offsetX, this.y + offsetY)
      }
    })

    // Deactivate if off screen (bottom)
    if (this.active && this.y > this.scene.cameras.main.height + 50) {
      this.cleanupSparkles()
      this.setActive(false)
      this.setVisible(false)
      this.body.setVelocity(0, 0)
      this.setPosition(-1000, -1000)
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
      this.add(powerUp, false)  // false = already added to scene in constructor
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

    if (rand < 32) {
      type = PowerUpType.RAPID_FIRE // 32% chance
    } else if (rand < 59) {
      type = PowerUpType.SHIELD // 27% chance
    } else if (rand < 81) {
      type = PowerUpType.MAGNET // 22% chance
    } else if (rand < 92) {
      type = PowerUpType.NUKE // 11% chance
    } else {
      type = PowerUpType.CHEST // 8% chance (rolls internally for 1/3/5)
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
