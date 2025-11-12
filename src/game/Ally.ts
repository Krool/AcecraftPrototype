import Phaser from 'phaser'
import { ProjectileGroup } from './Projectile'
import { soundManager, SoundType } from './SoundManager'
import { DamageType } from './Weapon'

export enum AllyType {
  WINGMAN = 'WINGMAN',          // Basic shooting ally from WINGMAN_PROTOCOL passive
  RANGED = 'RANGED',            // Ranged ally from building upgrades
  WALL = 'WALL',                // Wall ally that explodes on contact
  REROLL = 'REROLL',            // Reroll ally that generates charges
}

export interface AllyConfig {
  symbol: string
  color: string
  fontSize: string
  health: number
  fireRate: number  // Shots per second
  damage: number
  damageType: DamageType
  icon: string
  name?: string
}

export const ALLY_CONFIGS: Record<AllyType, AllyConfig> = {
  [AllyType.WINGMAN]: {
    symbol: '◈',
    color: '#ffff00',  // Yellow for PHYSICAL (matches Gun Buddy)
    fontSize: '32px',
    health: 50,
    fireRate: 2,  // 2 shots per second
    damage: 10,
    damageType: DamageType.PHYSICAL,
    icon: '◈',
    name: 'Wingman',
  },
  [AllyType.RANGED]: {
    symbol: '◇',
    color: '#00ff00',  // Green for NATURE (provides variety)
    fontSize: '28px',
    health: 40,
    fireRate: 3,  // 3 shots per second
    damage: 8,
    damageType: DamageType.NATURE,
    icon: '◇',
    name: 'Ranged Ally',
  },
  [AllyType.WALL]: {
    symbol: '▣',
    color: '#ff8800',  // Orange for FIRE (explosion damage)
    fontSize: '24px',
    health: 30,
    fireRate: 0,  // Doesn't shoot
    damage: 25,   // Explosion damage
    damageType: DamageType.FIRE,
    icon: '▣',
    name: 'Wall Ally',
  },
  [AllyType.REROLL]: {
    symbol: '⟲',
    color: '#aaaaaa',  // Gray for utility (doesn't deal damage)
    fontSize: '28px',
    health: 35,
    fireRate: 0,  // Doesn't shoot
    damage: 0,
    damageType: DamageType.CONTROL,
    icon: '⟲',
    name: 'Reroll Ally',
  },
}

export class Ally extends Phaser.GameObjects.Text {
  private maxHealth: number
  private currentHealth: number
  private allyType: AllyType
  private originalColor: string
  private config: AllyConfig
  private lastShotTime: number = 0
  private projectileGroup: ProjectileGroup | null = null
  private damageMultiplier: number = 1.0
  private fireRateMultiplier: number = 1.0
  private formationX: number = 0  // Offset from player
  private formationY: number = 0
  private lastRerollTime: number = 0
  private lastCollisionTime: number = 0  // Track collision cooldown
  private collisionCooldown: number = 500  // 500ms between collision damage
  declare body: Phaser.Physics.Arcade.Body

  constructor(
    scene: Phaser.Scene,
    x: number,
    y: number,
    type: AllyType = AllyType.WINGMAN
  ) {
    const config = ALLY_CONFIGS[type]

    super(scene, x, y, config.symbol, {
      fontFamily: 'Courier New',
      fontSize: config.fontSize,
      color: config.color,
    })

    this.setOrigin(0.5)
    this.setStroke('#000000', 2)
    this.setDepth(20) // Above enemies
    this.allyType = type
    this.config = config
    this.originalColor = config.color
    this.maxHealth = config.health
    this.currentHealth = config.health

    // Start inactive
    this.setActive(false)
    this.setVisible(false)
    this.setPosition(-1000, -1000)
  }

  setProjectileGroup(projectiles: ProjectileGroup) {
    this.projectileGroup = projectiles
  }

  setDamageMultiplier(multiplier: number) {
    this.damageMultiplier = multiplier
  }

  setFireRateMultiplier(multiplier: number) {
    this.fireRateMultiplier = multiplier
  }

  setFormationOffset(offsetX: number, offsetY: number) {
    this.formationX = offsetX
    this.formationY = offsetY
  }

  spawn(x: number, y: number, type?: AllyType) {
    // Safety check: ensure scene exists
    if (!this.scene) {
      console.error('[Ally] Cannot spawn - scene is undefined')
      this.setActive(false)
      this.setVisible(false)
      return
    }

    if (type && this.allyType !== type) {
      // Update type
      this.allyType = type
      const config = ALLY_CONFIGS[type]

      this.setText(config.symbol)
      this.setStyle({
        fontFamily: 'Courier New',
        fontSize: config.fontSize,
        color: config.color,
      })
      this.setStroke('#000000', 2)

      this.config = config
      this.originalColor = config.color
      this.maxHealth = config.health
    }

    this.currentHealth = this.maxHealth
    this.lastShotTime = this.scene.time.now
    this.lastRerollTime = this.scene.time.now
    this.lastCollisionTime = 0  // Reset collision cooldown

    // Ensure physics body exists
    if (!this.body) {
      console.error(`[Ally] No physics body found for ally type ${this.allyType}`)
      this.setActive(false)
      this.setVisible(false)
      return
    }

    // Configure body
    const textWidth = this.width
    const textHeight = this.height

    this.body.reset(x, y)
    this.body.setSize(textWidth, textHeight)
    this.body.enable = true
    this.body.updateFromGameObject()

    this.setPosition(x, y)
    this.setActive(true)
    this.setVisible(true)

    // Add subtle pulsing animation
    this.scene.tweens.add({
      targets: this,
      scale: { from: 1, to: 1.08 },
      duration: 600 + Math.random() * 200,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut'
    })
  }

  takeDamage(damage: number): boolean {
    if (!this.active) {
      return false
    }

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

  canTakeCollisionDamage(currentTime: number): boolean {
    // Check if enough time has passed since last collision
    if (currentTime - this.lastCollisionTime < this.collisionCooldown) {
      return false
    }
    // Update last collision time
    this.lastCollisionTime = currentTime
    return true
  }

  private die() {
    const deathX = this.x
    const deathY = this.y

    // Create death explosion effect
    this.createDeathExplosion(deathX, deathY)

    // Wall ally explodes on death
    if (this.allyType === AllyType.WALL) {
      this.explode()
    }

    // Stop animation
    this.scene.tweens.killTweensOf(this)
    this.setScale(1)

    this.setActive(false)
    this.setVisible(false)
    if (this.body) {
      this.body.setVelocity(0, 0)
      this.body.setSize(1, 1)
      this.body.enable = false
    }
    this.setPosition(-1000, -1000)

    // Emit ally death event
    this.scene.events.emit('allyDied', {
      x: deathX,
      y: deathY,
      type: this.allyType,
    })
  }

  private createDeathExplosion(x: number, y: number) {
    const particleCount = 4
    const explosionColors = [this.config.color, '#ffffff', '#ffaa00']

    for (let i = 0; i < particleCount; i++) {
      const angle = (i / particleCount) * Math.PI * 2
      const speed = 80
      const maxDistance = 30

      const symbol = Phaser.Utils.Array.GetRandom(['●', '◆', '■'])
      const color = Phaser.Utils.Array.GetRandom(explosionColors)

      const particle = this.scene.add.text(x, y, symbol, {
        fontFamily: 'Courier New',
        fontSize: '12px',
        color: color,
      }).setOrigin(0.5).setDepth(45)

      this.scene.tweens.add({
        targets: particle,
        x: x + Math.cos(angle) * maxDistance,
        y: y + Math.sin(angle) * maxDistance,
        alpha: { from: 1, to: 0 },
        scale: { from: 1.2, to: 0.3 },
        duration: 350,
        ease: 'Cubic.easeOut',
        onComplete: () => particle.destroy(),
      })
    }

    // Central flash
    const flash = this.scene.add.circle(x, y, 4, 0xffffff, 1).setDepth(46)
    this.scene.tweens.add({
      targets: flash,
      radius: 20,
      alpha: 0,
      duration: 250,
      ease: 'Cubic.easeOut',
      onComplete: () => flash.destroy(),
    })
  }

  private explode() {
    const explosionRadius = 60
    this.scene.events.emit('allyExplosion', {
      x: this.x,
      y: this.y,
      radius: explosionRadius,
      damage: this.config.damage * this.damageMultiplier,
      damageType: this.config.damageType,
    })

    // Visual explosion effect
    for (let i = 0; i < 8; i++) {
      const angle = (i / 8) * Math.PI * 2
      const particle = this.scene.add.text(this.x, this.y, '※', {
        fontFamily: 'Courier New',
        fontSize: '16px',
        color: '#ff8800',
      }).setOrigin(0.5).setDepth(45)

      this.scene.tweens.add({
        targets: particle,
        x: this.x + Math.cos(angle) * 50,
        y: this.y + Math.sin(angle) * 50,
        alpha: 0,
        scale: 0.3,
        duration: 400,
        onComplete: () => particle.destroy(),
      })
    }
  }

  update(time: number, delta: number, playerX: number, playerY: number, enemies: any) {
    if (!this.active || !this.scene) return

    // Update position to follow formation
    const targetX = playerX + this.formationX
    const targetY = playerY + this.formationY

    // Smoothly move to formation position using physics body
    if (this.body) {
      const lerpFactor = 0.1
      const newX = this.x + (targetX - this.x) * lerpFactor
      const newY = this.y + (targetY - this.y) * lerpFactor

      // Use setPosition to ensure physics body stays synced
      this.setPosition(newX, newY)
    }

    // Handle shooting for shooting allies
    if (this.config.fireRate > 0 && this.projectileGroup) {
      const shootInterval = (1000 / this.config.fireRate) / this.fireRateMultiplier
      if (time - this.lastShotTime > shootInterval) {
        this.shoot(enemies)
        this.lastShotTime = time
      }
    }

    // Handle reroll generation for reroll allies
    if (this.allyType === AllyType.REROLL) {
      const rerollInterval = 10000 / this.fireRateMultiplier  // Base 10 seconds
      if (time - this.lastRerollTime > rerollInterval) {
        this.scene.events.emit('allyRerollGenerated')
        this.lastRerollTime = time

        // Visual effect
        const flash = this.scene.add.circle(this.x, this.y, 5, 0x00ff00, 1).setDepth(46)
        this.scene.tweens.add({
          targets: flash,
          radius: 25,
          alpha: 0,
          duration: 300,
          onComplete: () => flash.destroy(),
        })
      }
    }
  }

  private shoot(enemies: any) {
    if (!this.projectileGroup) return

    // Find nearest enemy with valid on-screen position
    const screenHeight = this.scene.cameras.main.height
    const screenWidth = this.scene.cameras.main.width
    const activeEnemies = enemies.getChildren().filter((e: any) => {
      return e.active && e.y > 0 && e.y < screenHeight &&
             e.x >= 0 && e.x <= screenWidth
    })
    if (activeEnemies.length === 0) return

    // Sort by distance
    activeEnemies.sort((a: any, b: any) => {
      const distA = Phaser.Math.Distance.Between(this.x, this.y, a.x, a.y)
      const distB = Phaser.Math.Distance.Between(this.x, this.y, b.x, b.y)
      return distA - distB
    })

    const target = activeEnemies[0]
    const damage = this.config.damage * this.damageMultiplier

    // Fire projectile toward enemy
    this.projectileGroup.fireProjectile(
      this.x,
      this.y - 10,  // Fire from top of ally
      damage,
      1,  // Pierce count
      0,   // vx
      -400,  // vy (shoot upward)
      this.config.icon,
      this.config.color,
      undefined,  // projectileType
      {
        damageType: this.config.damageType,
        weaponName: `Ally - ${this.config.name}`
      }
    )

    // Play sound
    soundManager.play(SoundType.PLAYER_SHOOT_BASIC, 0.15)
  }

  getType(): AllyType {
    return this.allyType
  }

  getHealth(): number {
    return this.currentHealth
  }

  getMaxHealth(): number {
    return this.maxHealth
  }
}

export class AllyGroup extends Phaser.Physics.Arcade.Group {
  private pool: Ally[] = []
  private maxAllies: number

  constructor(scene: Phaser.Scene, poolSize: number = 20, maxActive: number = 10) {
    super(scene.physics.world, scene)

    this.maxAllies = maxActive

    // Create ally pool
    for (let i = 0; i < poolSize; i++) {
      const ally = new Ally(scene, 0, 0, AllyType.WINGMAN)

      scene.add.existing(ally)
      scene.physics.add.existing(ally)
      this.add(ally, false)
      this.pool.push(ally)

      if (ally.body) {
        ally.body.setSize(1, 1)
        ally.body.enable = false
      }
    }
  }

  setProjectileGroup(projectiles: ProjectileGroup) {
    this.pool.forEach(ally => ally.setProjectileGroup(projectiles))
  }

  spawnAlly(x: number, y: number, type: AllyType, damageMultiplier: number = 1.0, fireRateMultiplier: number = 1.0): Ally | null {
    const activeCount = this.pool.filter(a => a.active).length
    if (activeCount >= this.maxAllies) {
      console.warn(`[AllyGroup] Cannot spawn - pool at max capacity: ${activeCount}/${this.maxAllies}`)
      return null
    }

    const ally = this.pool.find(a => !a.active)

    if (ally) {
      if (!ally.scene) {
        console.error(`[AllyGroup] Found ally without scene - pool may be corrupted`)
        return null
      }

      ally.setDamageMultiplier(damageMultiplier)
      ally.setFireRateMultiplier(fireRateMultiplier)
      ally.spawn(x, y, type)

      if (!ally.active) {
        console.error(`[AllyGroup] Ally spawn failed - ally not active after spawn() call`)
        return null
      }

      return ally
    }

    console.error(`[AllyGroup] No inactive ally found in pool`)
    return null
  }

  update(time: number, delta: number, playerX: number, playerY: number, enemies: any) {
    this.pool.forEach(ally => {
      if (ally.active) {
        ally.update(time, delta, playerX, playerY, enemies)
      }
    })
  }

  getActiveCount(): number {
    return this.pool.filter(a => a.active).length
  }

  getActiveAlliesByType(type: AllyType): Ally[] {
    return this.pool.filter(a => a.active && a.getType() === type)
  }

  clearAll() {
    this.pool.forEach(ally => {
      if (ally.active) {
        this.scene.tweens.killTweensOf(ally)
        ally.setScale(1)
        ally.setActive(false)
        ally.setVisible(false)
        ally.setPosition(-1000, -1000)

        if (ally.body) {
          ally.body.setVelocity(0, 0)
          ally.body.setSize(1, 1)
          ally.body.enable = false
        }
      }
    })
  }
}
