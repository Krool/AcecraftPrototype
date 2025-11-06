import Phaser from 'phaser'
import { EnemyProjectileGroup } from './EnemyProjectile'

export enum EnemyType {
  // Basic enemies
  DRONE = 'DRONE',           // Fodder - flies straight, fires single shots
  WASP = 'WASP',            // Flanker - fast zigzag arcs
  TANK = 'TANK',            // Brawler - slow, high HP, wide spread fire
  SNIPER = 'SNIPER',        // Precision - charges and fires aimed shots
  SWARMER = 'SWARMER',      // Mob - travels in clusters
  HEALER = 'HEALER',        // Support - heals nearby enemies
  ORBITER = 'ORBITER',      // Field control - circles player
  BOMBER = 'BOMBER',        // Burst - approaches then explodes
  SPLITTER = 'SPLITTER',    // Splits into smaller enemies on death
  HUNTER = 'HUNTER',        // Actively tracks and shoots at player
  TURRET = 'TURRET',        // Stationary, shoots downward
  CHARGER = 'CHARGER',      // Charges at player rapidly
  MINI_BOSS = 'MINI_BOSS',  // Mini-boss with high HP and multi-phase
}

export interface EnemyBehavior {
  shootsBack: boolean
  shootInterval?: number
  movementPattern: 'straight' | 'zigzag' | 'circle' | 'stationary' | 'charge' | 'sinwave'
  specialAbility?: string
}

export interface EnemyTypeConfig {
  symbol: string
  color: string
  fontSize: string
  health: number
  speed: number
  xpValue: number
  behavior: EnemyBehavior
  scoreValue: number
}

export const ENEMY_CONFIGS: Record<EnemyType, EnemyTypeConfig> = {
  [EnemyType.DRONE]: {
    symbol: 'o',
    color: '#ff6666',
    fontSize: '24px',
    health: 20,
    speed: 100,
    xpValue: 8,
    scoreValue: 10,
    behavior: {
      shootsBack: true,
      shootInterval: 2000,
      movementPattern: 'straight',
    },
  },
  [EnemyType.WASP]: {
    symbol: 'v',
    color: '#ffaa00',
    fontSize: '28px',
    health: 15,
    speed: 180,
    xpValue: 12,
    scoreValue: 15,
    behavior: {
      shootsBack: false,
      movementPattern: 'zigzag',
    },
  },
  [EnemyType.TANK]: {
    symbol: '■',
    color: '#aa00ff',
    fontSize: '40px',
    health: 100,
    speed: 60,
    xpValue: 40,
    scoreValue: 50,
    behavior: {
      shootsBack: true,
      shootInterval: 1500,
      movementPattern: 'straight',
      specialAbility: 'spread_fire',
    },
  },
  [EnemyType.SNIPER]: {
    symbol: '+',
    color: '#00ffff',
    fontSize: '32px',
    health: 30,
    speed: 80,
    xpValue: 25,
    scoreValue: 30,
    behavior: {
      shootsBack: true,
      shootInterval: 3000,
      movementPattern: 'straight',
      specialAbility: 'charged_shot',
    },
  },
  [EnemyType.SWARMER]: {
    symbol: 'x',
    color: '#ff00ff',
    fontSize: '20px',
    health: 10,
    speed: 140,
    xpValue: 6,
    scoreValue: 8,
    behavior: {
      shootsBack: false,
      movementPattern: 'sinwave',
      specialAbility: 'chain_death',
    },
  },
  [EnemyType.HEALER]: {
    symbol: 'H',
    color: '#00ff88',
    fontSize: '32px',
    health: 40,
    speed: 90,
    xpValue: 35,
    scoreValue: 40,
    behavior: {
      shootsBack: false,
      movementPattern: 'straight',
      specialAbility: 'heal_nearby',
    },
  },
  [EnemyType.ORBITER]: {
    symbol: ')',
    color: '#8888ff',
    fontSize: '28px',
    health: 35,
    speed: 100,
    xpValue: 20,
    scoreValue: 25,
    behavior: {
      shootsBack: true,
      shootInterval: 2500,
      movementPattern: 'circle',
    },
  },
  [EnemyType.BOMBER]: {
    symbol: 'B',
    color: '#ff0000',
    fontSize: '36px',
    health: 25,
    speed: 120,
    xpValue: 30,
    scoreValue: 35,
    behavior: {
      shootsBack: false,
      movementPattern: 'straight',
      specialAbility: 'explode_on_death',
    },
  },
  [EnemyType.SPLITTER]: {
    symbol: '◆',
    color: '#ffff00',
    fontSize: '32px',
    health: 45,
    speed: 70,
    xpValue: 28,
    scoreValue: 32,
    behavior: {
      shootsBack: false,
      movementPattern: 'straight',
      specialAbility: 'split_on_death',
    },
  },
  [EnemyType.HUNTER]: {
    symbol: '►',
    color: '#ff4444',
    fontSize: '30px',
    health: 35,
    speed: 150,
    xpValue: 22,
    scoreValue: 28,
    behavior: {
      shootsBack: true,
      shootInterval: 1800,
      movementPattern: 'charge',
    },
  },
  [EnemyType.TURRET]: {
    symbol: '▲',
    color: '#888888',
    fontSize: '36px',
    health: 60,
    speed: 0,
    xpValue: 18,
    scoreValue: 22,
    behavior: {
      shootsBack: true,
      shootInterval: 1000,
      movementPattern: 'stationary',
    },
  },
  [EnemyType.CHARGER]: {
    symbol: '»',
    color: '#ff8800',
    fontSize: '32px',
    health: 28,
    speed: 220,
    xpValue: 18,
    scoreValue: 20,
    behavior: {
      shootsBack: false,
      movementPattern: 'charge',
    },
  },
  [EnemyType.MINI_BOSS]: {
    symbol: '◉',
    color: '#ff0000',
    fontSize: '64px',
    health: 200,
    speed: 80,
    xpValue: 100,
    scoreValue: 200,
    behavior: {
      shootsBack: true,
      shootInterval: 1000,
      movementPattern: 'sinwave',
      specialAbility: 'multi_phase',
    },
  },
}

export class Enemy extends Phaser.GameObjects.Text {
  private maxHealth: number
  private currentHealth: number
  private speed: number
  private xpValue: number
  private scoreValue: number
  private enemyType: EnemyType
  private originalColor: string
  private behavior: EnemyBehavior
  private lastShotTime: number = 0
  private spawnTime: number = 0
  private zigzagTime: number = 0
  private circleAngle: number = 0
  private playerRef: Phaser.GameObjects.GameObject | null = null
  private enemyProjectiles: EnemyProjectileGroup | null = null
  private isCharging: boolean = false
  private healPulseTime: number = 0
  public body!: Phaser.Physics.Arcade.Body

  constructor(
    scene: Phaser.Scene,
    x: number,
    y: number,
    type: EnemyType = EnemyType.DRONE
  ) {
    const config = ENEMY_CONFIGS[type]

    super(scene, x, y, config.symbol, {
      fontFamily: 'Courier New',
      fontSize: config.fontSize,
      color: config.color,
    })

    this.setOrigin(0.5)
    this.setStroke('#000000', 2)
    this.enemyType = type
    this.originalColor = config.color
    this.maxHealth = config.health
    this.currentHealth = config.health
    this.speed = config.speed
    this.xpValue = config.xpValue
    this.scoreValue = config.scoreValue
    this.behavior = config.behavior

    scene.add.existing(this)
    scene.physics.add.existing(this)

    this.setActive(false)
    this.setVisible(false)
  }

  setPlayerReference(player: Phaser.GameObjects.GameObject) {
    this.playerRef = player
  }

  setProjectileGroup(projectiles: EnemyProjectileGroup) {
    this.enemyProjectiles = projectiles
  }

  spawn(x: number, y: number, type?: EnemyType) {
    if (type) {
      this.enemyType = type
      const config = ENEMY_CONFIGS[type]
      this.setText(config.symbol)
      this.setStyle({
        fontFamily: 'Courier New',
        fontSize: config.fontSize,
        color: config.color,
      })
      this.setStroke('#000000', 2)
      this.originalColor = config.color
      this.maxHealth = config.health
      this.speed = config.speed
      this.xpValue = config.xpValue
      this.scoreValue = config.scoreValue
      this.behavior = config.behavior
    }

    this.setPosition(x, y)
    this.currentHealth = this.maxHealth
    this.setActive(true)
    this.setVisible(true)
    this.body.enable = true
    this.body.reset(x, y)
    this.spawnTime = Date.now()
    this.zigzagTime = 0
    this.circleAngle = 0
    this.isCharging = false
    this.lastShotTime = Date.now()
    this.healPulseTime = Date.now()

    // Set initial velocity based on movement pattern
    this.updateMovementPattern()
  }

  private updateMovementPattern() {
    switch (this.behavior.movementPattern) {
      case 'straight':
        this.body.setVelocity(0, this.speed)
        break
      case 'stationary':
        this.body.setVelocity(0, 0)
        break
      case 'charge':
        if (this.playerRef) {
          const player = this.playerRef as Phaser.GameObjects.Text
          const angle = Phaser.Math.Angle.Between(this.x, this.y, player.x, player.y)
          this.body.setVelocity(
            Math.cos(angle) * this.speed,
            Math.sin(angle) * this.speed
          )
          this.isCharging = true
        } else {
          this.body.setVelocity(0, this.speed)
        }
        break
      default:
        this.body.setVelocity(0, this.speed)
    }
  }

  takeDamage(damage: number): boolean {
    if (!this.active) return false

    this.currentHealth -= damage

    // Visual feedback - flash white
    this.setColor('#ffffff')
    this.scene.time.delayedCall(50, () => {
      if (this.active) {
        this.setColor(this.originalColor)
      }
    })

    if (this.currentHealth <= 0) {
      this.die()
      return true
    }

    return false
  }

  private die() {
    // Handle special abilities on death
    if (this.behavior.specialAbility === 'explode_on_death') {
      this.explode()
    } else if (this.behavior.specialAbility === 'split_on_death') {
      this.split()
    }

    this.setActive(false)
    this.setVisible(false)
    this.body.enable = false

    this.scene.events.emit('enemyDied', {
      x: this.x,
      y: this.y,
      xpValue: this.xpValue,
      scoreValue: this.scoreValue,
      type: this.enemyType,
    })
  }

  private explode() {
    // Create explosion effect and damage player if nearby
    const explosionRadius = 80
    this.scene.events.emit('enemyExplosion', {
      x: this.x,
      y: this.y,
      radius: explosionRadius,
      damage: 15,
    })

    // Visual explosion effect
    for (let i = 0; i < 12; i++) {
      const angle = (i / 12) * Math.PI * 2
      const speed = Phaser.Math.Between(80, 150)
      const particle = this.scene.add.text(this.x, this.y, '•', {
        fontFamily: 'Courier New',
        fontSize: '20px',
        color: '#ff4400',
      }).setOrigin(0.5)

      this.scene.tweens.add({
        targets: particle,
        x: this.x + Math.cos(angle) * speed,
        y: this.y + Math.sin(angle) * speed,
        alpha: 0,
        scale: 0.3,
        duration: 600,
        onComplete: () => particle.destroy(),
      })
    }
  }

  private split() {
    // Emit event to spawn smaller enemies
    this.scene.events.emit('enemySplit', {
      x: this.x,
      y: this.y,
      count: 3,
    })
  }

  heal(amount: number) {
    this.currentHealth = Math.min(this.maxHealth, this.currentHealth + amount)

    // Visual feedback - flash green
    this.setColor('#00ff00')
    this.scene.time.delayedCall(100, () => {
      if (this.active) {
        this.setColor(this.originalColor)
      }
    })
  }

  getXPValue(): number {
    return this.xpValue
  }

  getScoreValue(): number {
    return this.scoreValue
  }

  getType(): EnemyType {
    return this.enemyType
  }

  update(time: number, delta: number) {
    if (!this.active) return

    // Update movement patterns
    switch (this.behavior.movementPattern) {
      case 'zigzag':
        this.zigzagTime += delta
        const zigzagFrequency = 500
        const zigzagAmplitude = 100
        const xOffset = Math.sin((this.zigzagTime / zigzagFrequency) * Math.PI * 2) * zigzagAmplitude
        this.body.setVelocityX((xOffset - (this.body.x - this.body.prevX)) * 5)
        this.body.setVelocityY(this.speed)
        break

      case 'sinwave':
        this.zigzagTime += delta
        const sinFrequency = 800
        const sinAmplitude = 60
        const sinOffset = Math.sin((this.zigzagTime / sinFrequency) * Math.PI * 2) * sinAmplitude
        this.body.setVelocityX((sinOffset - (this.body.x - this.body.prevX)) * 3)
        this.body.setVelocityY(this.speed)
        break

      case 'circle':
        if (this.playerRef) {
          this.circleAngle += delta * 0.002
          const player = this.playerRef as Phaser.GameObjects.Text
          const radius = 150
          const targetX = player.x + Math.cos(this.circleAngle) * radius
          const targetY = player.y + Math.sin(this.circleAngle) * radius

          const dx = targetX - this.x
          const dy = targetY - this.y
          this.body.setVelocity(dx * 1.5, dy * 1.5)
        }
        break

      case 'charge':
        if (!this.isCharging && this.playerRef) {
          const player = this.playerRef as Phaser.GameObjects.Text
          const angle = Phaser.Math.Angle.Between(this.x, this.y, player.x, player.y)
          this.body.setVelocity(
            Math.cos(angle) * this.speed,
            Math.sin(angle) * this.speed
          )
        }
        break
    }

    // Handle shooting
    if (this.behavior.shootsBack && this.behavior.shootInterval) {
      const now = Date.now()
      if (now - this.lastShotTime > this.behavior.shootInterval && this.enemyProjectiles && this.playerRef) {
        this.shoot()
        this.lastShotTime = now
      }
    }

    // Handle healing
    if (this.behavior.specialAbility === 'heal_nearby') {
      const now = Date.now()
      if (now - this.healPulseTime > 2000) {
        this.scene.events.emit('healNearbyEnemies', {
          x: this.x,
          y: this.y,
          radius: 100,
          amount: 10,
        })
        this.healPulseTime = now

        // Visual effect
        const healCircle = this.scene.add.circle(this.x, this.y, 10, 0x00ff88, 0.5)
        this.scene.tweens.add({
          targets: healCircle,
          radius: 100,
          alpha: 0,
          duration: 500,
          onComplete: () => healCircle.destroy(),
        })
      }
    }

    // Deactivate if off screen
    const cam = this.scene.cameras.main
    if (this.y > cam.height + 50 || this.y < -100 || this.x < -100 || this.x > cam.width + 100) {
      this.setActive(false)
      this.setVisible(false)
      this.body.enable = false
    }
  }

  private shoot() {
    if (!this.enemyProjectiles || !this.playerRef) return

    const player = this.playerRef as Phaser.GameObjects.Text

    if (this.behavior.specialAbility === 'spread_fire') {
      // Tank shoots 3 projectiles in a spread
      for (let i = -1; i <= 1; i++) {
        const offsetX = i * 30
        this.enemyProjectiles.fireAtTarget(
          this.x + offsetX,
          this.y + 20,
          player.x + offsetX * 50,
          player.y,
          180,
          8
        )
      }
    } else if (this.behavior.specialAbility === 'charged_shot') {
      // Sniper charges up (flash effect)
      this.setColor('#ffffff')
      this.scene.time.delayedCall(500, () => {
        if (this.active && this.playerRef) {
          const player = this.playerRef as Phaser.GameObjects.Text
          this.enemyProjectiles?.fireAtTarget(this.x, this.y + 20, player.x, player.y, 300, 20)
          this.setColor(this.originalColor)
        }
      })
    } else if (this.behavior.specialAbility === 'multi_phase') {
      // Mini-boss shoots in a pattern based on health phase
      const healthPercent = this.currentHealth / this.maxHealth

      if (healthPercent > 0.66) {
        // Phase 1: Single aimed shot
        this.enemyProjectiles.fireAtTarget(this.x, this.y + 30, player.x, player.y, 220, 15)
      } else if (healthPercent > 0.33) {
        // Phase 2: 3-way spread
        for (let i = -1; i <= 1; i++) {
          const angle = Math.atan2(player.y - this.y, player.x - this.x) + (i * Math.PI / 8)
          const targetX = this.x + Math.cos(angle) * 300
          const targetY = this.y + Math.sin(angle) * 300
          this.enemyProjectiles.fireAtTarget(this.x, this.y + 30, targetX, targetY, 220, 15)
        }
      } else {
        // Phase 3: 5-way burst
        for (let i = -2; i <= 2; i++) {
          const angle = Math.atan2(player.y - this.y, player.x - this.x) + (i * Math.PI / 10)
          const targetX = this.x + Math.cos(angle) * 300
          const targetY = this.y + Math.sin(angle) * 300
          this.enemyProjectiles.fireAtTarget(this.x, this.y + 30, targetX, targetY, 240, 20)
        }
      }
    } else {
      // Standard aimed shot
      this.enemyProjectiles.fireAtTarget(this.x, this.y + 20, player.x, player.y, 200, 10)
    }
  }
}

export class EnemyGroup extends Phaser.Physics.Arcade.Group {
  private pool: Enemy[] = []
  private maxEnemies: number
  private enemyProjectiles: EnemyProjectileGroup | null = null

  constructor(scene: Phaser.Scene, poolSize: number = 100, maxActive: number = 50) {
    super(scene.physics.world, scene)

    this.maxEnemies = maxActive

    for (let i = 0; i < poolSize; i++) {
      const enemy = new Enemy(scene, 0, 0, EnemyType.DRONE)
      this.add(enemy, true)
      this.pool.push(enemy)
    }
  }

  setPlayerReference(player: Phaser.GameObjects.GameObject) {
    this.pool.forEach(enemy => enemy.setPlayerReference(player))
  }

  setProjectileGroup(projectiles: EnemyProjectileGroup) {
    this.enemyProjectiles = projectiles
    this.pool.forEach(enemy => enemy.setProjectileGroup(projectiles))
  }

  spawnEnemy(x: number, y: number, type: EnemyType = EnemyType.DRONE) {
    const activeCount = this.pool.filter(e => e.active).length
    if (activeCount >= this.maxEnemies) {
      return null
    }

    const enemy = this.pool.find(e => !e.active)

    if (enemy) {
      enemy.spawn(x, y, type)
      return enemy
    }

    return null
  }

  update(time: number, delta: number) {
    this.pool.forEach(enemy => {
      if (enemy.active) {
        enemy.update(time, delta)
      }
    })
  }

  getActiveCount(): number {
    return this.pool.filter(e => e.active).length
  }

  getNearbyEnemies(x: number, y: number, radius: number): Enemy[] {
    return this.pool.filter(enemy => {
      if (!enemy.active) return false
      const distance = Phaser.Math.Distance.Between(x, y, enemy.x, enemy.y)
      return distance <= radius
    })
  }
}
