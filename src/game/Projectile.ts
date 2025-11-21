import Phaser from 'phaser'
import { DamageType } from './Weapon'

export enum ProjectileType {
  NORMAL = 'NORMAL',
  EXPLOSIVE = 'EXPLOSIVE',      // Fire - explodes on hit
  FREEZING = 'FREEZING',        // Ice - slows/freezes enemies
  CHAINING = 'CHAINING',        // Lightning - chains to nearby enemies
  BOUNCING = 'BOUNCING',        // Ricochet - bounces off enemies
  WAVE = 'WAVE',                // Water - oscillates left/right
  EARTH_ZONE = 'EARTH_ZONE',    // Earth - creates persistent damage zones
  HOMING = 'HOMING',            // Missiles - homes in on enemies
  SPIRALING = 'SPIRALING',      // Blizzard - spirals outward from player
}

export class Projectile extends Phaser.GameObjects.Text {
  private damage: number
  private pierceCount: number
  private remainingPierces: number
  private projectileType: ProjectileType
  private damageType: DamageType
  private explosionRadius: number
  private freezeChance: number
  private freezeDuration: number
  private chainCount: number
  private bounceCount: number
  private waveAmplitude: number
  private waveFrequency: number
  private wavePhase: number
  private initialX: number
  private distanceTraveled: number
  private zoneDuration: number
  private zoneRadius: number
  private lastTrailTime: number = 0
  private homingTurnRate: number = 0
  private homingSpeed: number = 0
  private currentAngle: number = 0
  private enemyGroupRef: any = null
  private weaponName: string = ''
  private orbitOriginX: number = 0
  private orbitOriginY: number = 0
  private maxOrbitDistance: number = 0
  declare body: Phaser.Physics.Arcade.Body

  constructor(
    scene: Phaser.Scene,
    x: number,
    y: number,
    damage: number = 10,
    pierceCount: number = 0,
    velocityX: number = 0,
    velocityY: number = -500,
    icon: string = '|',
    color: string = '#ffff00',
    type: ProjectileType = ProjectileType.NORMAL,
    specialData?: {
      explosionRadius?: number
      freezeChance?: number
      freezeDuration?: number
      chainCount?: number
      bounceCount?: number
      waveAmplitude?: number
      waveFrequency?: number
      wavePhase?: number
      zoneDuration?: number
      zoneRadius?: number
      homingTurnRate?: number
      homingSpeed?: number
      fontSize?: string
      damageType?: DamageType
      weaponName?: string
      orbitOriginX?: number
      orbitOriginY?: number
      maxOrbitDistance?: number
    }
  ) {
    const defaultFontSize = pierceCount > 0 ? '22px' : '19px'
    const fontSize = specialData?.fontSize || defaultFontSize

    super(scene, x, y, icon, {
      fontFamily: 'Courier New',
      fontSize: fontSize,
      color: color,
    })

    this.setOrigin(0.5)
    this.setDepth(20) // Player projectiles render above enemies

    // Set properties
    this.damage = damage
    this.pierceCount = pierceCount
    this.remainingPierces = pierceCount
    this.projectileType = type
    this.damageType = specialData?.damageType || DamageType.PHYSICAL
    this.explosionRadius = specialData?.explosionRadius || 0
    this.freezeChance = specialData?.freezeChance || 0
    this.freezeDuration = specialData?.freezeDuration || 0
    this.chainCount = specialData?.chainCount || 0
    this.bounceCount = specialData?.bounceCount || 0
    this.waveAmplitude = specialData?.waveAmplitude || 50
    this.waveFrequency = specialData?.waveFrequency || 0.01
    this.wavePhase = specialData?.wavePhase || 0
    this.zoneDuration = specialData?.zoneDuration || 0
    this.zoneRadius = specialData?.zoneRadius || 0
    this.homingTurnRate = specialData?.homingTurnRate || 0.05 // Radians per frame (slow turning)
    this.homingSpeed = specialData?.homingSpeed || 350
    this.weaponName = specialData?.weaponName || ''
    this.orbitOriginX = specialData?.orbitOriginX || 0
    this.orbitOriginY = specialData?.orbitOriginY || 0
    this.maxOrbitDistance = specialData?.maxOrbitDistance || 0
    this.initialX = x
    this.distanceTraveled = 0

    // Calculate initial angle from velocity for homing projectiles
    this.currentAngle = Math.atan2(velocityY, velocityX)

    // Add to scene and physics
    scene.add.existing(this)
    scene.physics.add.existing(this)

    // Set fixed body size
    this.body.setSize(16, 24)
    this.body.setVelocity(velocityX, velocityY)
  }

  getDamage(): number {
    return this.damage
  }

  getType(): ProjectileType {
    return this.projectileType
  }

  getExplosionRadius(): number {
    return this.explosionRadius
  }

  getFreezeChance(): number {
    return this.freezeChance
  }

  getFreezeDuration(): number {
    return this.freezeDuration
  }

  getChainCount(): number {
    return this.chainCount
  }

  getBounceCount(): number {
    return this.bounceCount
  }

  getZoneDuration(): number {
    return this.zoneDuration
  }

  getZoneRadius(): number {
    return this.zoneRadius
  }

  decrementBounce(): boolean {
    // Returns true if still has bounces left
    if (this.bounceCount > 0) {
      this.bounceCount--
      return this.bounceCount > 0
    }
    return false
  }

  onHit(): boolean {
    // Returns true if projectile should be destroyed
    if (this.remainingPierces > 0) {
      this.remainingPierces--
      return false // Don't destroy, can pierce through
    }
    return true // Destroy projectile
  }

  canPierce(): boolean {
    return this.remainingPierces > 0
  }

  getDamageType(): DamageType {
    return this.damageType
  }

  getWeaponName(): string {
    return this.weaponName
  }

  setEnemyGroup(enemyGroup: any): void {
    this.enemyGroupRef = enemyGroup
  }

  private createTrailParticle() {
    let trailChar = '·'
    let trailColor = this.style.color
    let trailSize = '8px'

    // Different trail effects based on projectile type
    switch (this.projectileType) {
      case ProjectileType.EXPLOSIVE:
        trailChar = '∗'
        trailColor = '#ff6600'
        trailSize = '10px'
        break
      case ProjectileType.FREEZING:
        trailChar = '❄'
        trailColor = '#00ddff'
        trailSize = '8px'
        break
      case ProjectileType.CHAINING:
        trailChar = '‡'
        trailColor = '#00ff00'
        trailSize = '9px'
        break
      case ProjectileType.EARTH_ZONE:
        trailChar = '●'
        trailColor = '#88ff88'
        trailSize = '7px'
        break
      case ProjectileType.WAVE:
        trailChar = '~'
        trailColor = '#00aaff'
        trailSize = '9px'
        break
      case ProjectileType.BOUNCING:
        trailChar = '○'
        trailColor = '#ff88ff'
        trailSize = '8px'
        break
      case ProjectileType.HOMING:
        trailChar = '▪'
        trailColor = '#ff8800'
        trailSize = '6px'
        break
      default:
        // Normal projectiles get a simple trail
        break
    }

    const trail = this.scene.add.text(
      this.x + Phaser.Math.Between(-2, 2),
      this.y,
      trailChar,
      {
        fontFamily: 'Courier New',
        fontSize: trailSize,
        color: trailColor,
      }
    ).setOrigin(0.5).setDepth(19).setAlpha(0.7)

    // Fade out trail
    this.scene.tweens.add({
      targets: trail,
      alpha: 0,
      scale: 0.3,
      duration: 300,
      ease: 'Cubic.easeOut',
      onComplete: () => trail.destroy()
    })
  }

  fire(
    x: number,
    y: number,
    damage: number,
    pierceCount: number,
    velocityX: number,
    velocityY: number,
    icon: string,
    color: string,
    type: ProjectileType,
    specialData?: {
      explosionRadius?: number
      freezeChance?: number
      freezeDuration?: number
      chainCount?: number
      bounceCount?: number
      waveAmplitude?: number
      waveFrequency?: number
      wavePhase?: number
      zoneDuration?: number
      zoneRadius?: number
      homingTurnRate?: number
      homingSpeed?: number
      fontSize?: string
      damageType?: DamageType
      weaponName?: string
      orbitOriginX?: number
      orbitOriginY?: number
      maxOrbitDistance?: number
    }
  ) {
    // Reset body first to ensure proper physics state
    this.body.reset(x, y)
    this.body.enable = true

    this.setPosition(x, y)
    this.setActive(true)
    this.setVisible(true)
    this.setRotation(0) // Reset rotation from previous use (e.g., homing missiles)

    const defaultFontSize = pierceCount > 0 ? '22px' : '19px'
    const fontSize = specialData?.fontSize || defaultFontSize

    this.setText(icon)
    this.setStyle({
      fontFamily: 'Courier New',
      fontSize: fontSize,
      color: color,
    })

    this.setOrigin(0.5)
    this.setDepth(20)

    // Set properties
    this.damage = damage
    this.pierceCount = pierceCount
    this.remainingPierces = pierceCount
    this.projectileType = type
    this.damageType = specialData?.damageType || DamageType.PHYSICAL
    this.explosionRadius = specialData?.explosionRadius || 0
    this.freezeChance = specialData?.freezeChance || 0
    this.freezeDuration = specialData?.freezeDuration || 0
    this.chainCount = specialData?.chainCount || 0
    this.bounceCount = specialData?.bounceCount || 0
    this.waveAmplitude = specialData?.waveAmplitude || 50
    this.waveFrequency = specialData?.waveFrequency || 0.01
    this.wavePhase = specialData?.wavePhase || 0
    this.zoneDuration = specialData?.zoneDuration || 0
    this.zoneRadius = specialData?.zoneRadius || 0
    this.homingTurnRate = specialData?.homingTurnRate || 0.05
    this.homingSpeed = specialData?.homingSpeed || 350
    this.weaponName = specialData?.weaponName || ''
    this.orbitOriginX = specialData?.orbitOriginX || 0
    this.orbitOriginY = specialData?.orbitOriginY || 0
    this.maxOrbitDistance = specialData?.maxOrbitDistance || 0
    this.initialX = x
    this.distanceTraveled = 0
    this.lastTrailTime = 0

    // Calculate initial angle from velocity for homing projectiles
    this.currentAngle = Math.atan2(velocityY, velocityX)

    // Set fixed body size
    this.body.setSize(16, 24)
    this.body.setVelocity(velocityX, velocityY)
  }

  update(delta?: number) {
    // Trail particles disabled for performance
    // const currentTime = this.scene.time.now
    // if (currentTime - this.lastTrailTime > 150) {
    //   this.createTrailParticle()
    //   this.lastTrailTime = currentTime
    // }

    // Apply spiral motion for SPIRALING projectiles (Vortex Blade/Blizzard)
    if (this.projectileType === ProjectileType.SPIRALING) {
      const currentVelX = this.body.velocity.x
      const currentVelY = this.body.velocity.y

      // Calculate perpendicular vector (rotate 90 degrees)
      const perpX = -currentVelY
      const perpY = currentVelX

      // Normalize perpendicular vector
      const perpMag = Math.sqrt(perpX * perpX + perpY * perpY)
      if (perpMag > 0) {
        const normalizedPerpX = perpX / perpMag
        const normalizedPerpY = perpY / perpMag

        // Add perpendicular component (spiral strength)
        const spiralStrength = 100 // Pixels per frame to spiral (increased for faster expansion)
        this.body.setVelocity(
          currentVelX + normalizedPerpX * spiralStrength,
          currentVelY + normalizedPerpY * spiralStrength
        )
      }
    }

    // Apply wave motion for WAVE projectiles
    if (this.projectileType === ProjectileType.WAVE) {
      // Use delta time instead of assuming 60 FPS (delta is in milliseconds, convert to seconds)
      const deltaSeconds = delta ? delta / 1000 : 1 / 60
      this.distanceTraveled += Math.abs(this.body.velocity.y) * deltaSeconds
      const offset = Math.sin(this.distanceTraveled * this.waveFrequency + this.wavePhase) * this.waveAmplitude
      this.x = this.initialX + offset
    }

    // Bounce off screen edges for BOUNCING projectiles
    if (this.projectileType === ProjectileType.BOUNCING) {
      if (this.bounceCount > 0) {
        const screenWidth = this.scene.cameras.main.width
        const screenHeight = this.scene.cameras.main.height
        let bounced = false
        const speedIncrease = 1.1 // 10% speed increase per bounce

        // Bounce off left/right edges
        if (this.x < 10 && this.body.velocity.x < 0) {
          this.body.setVelocityX(-this.body.velocity.x * speedIncrease)
          this.x = 10
          bounced = true
        } else if (this.x > screenWidth - 10 && this.body.velocity.x > 0) {
          this.body.setVelocityX(-this.body.velocity.x * speedIncrease)
          this.x = screenWidth - 10
          bounced = true
        }

        // Bounce off bottom edge
        if (this.y > screenHeight - 10 && this.body.velocity.y > 0) {
          this.body.setVelocityY(-this.body.velocity.y * speedIncrease)
          this.y = screenHeight - 10
          bounced = true
        }

        // Decrement bounce count if we bounced off an edge
        if (bounced) {
          const stillHasBounces = this.decrementBounce()
          if (!stillHasBounces) {
            // Deactivate projectile when it runs out of bounces
            this.setActive(false)
            this.setVisible(false)
            this.setPosition(-1000, -1000)
            this.body.setVelocity(0, 0)
            this.body.enable = false
            return
          }
        }
      } else {
        // No bounces left - deactivate projectile
        this.setActive(false)
        this.setVisible(false)
        this.setPosition(-1000, -1000)
        this.body.setVelocity(0, 0)
        this.body.enable = false
        return
      }
    }

    // Homing behavior for HOMING projectiles
    if (this.projectileType === ProjectileType.HOMING && this.enemyGroupRef) {
      // Find nearest enemy
      let nearestEnemy: any = null
      let nearestDistance = Infinity

      const enemies = this.enemyGroupRef.getChildren()
      enemies.forEach((enemy: any) => {
        if (enemy.active && enemy.visible) {
          const distance = Phaser.Math.Distance.Between(this.x, this.y, enemy.x, enemy.y)
          if (distance < nearestDistance) {
            nearestDistance = distance
            nearestEnemy = enemy
          }
        }
      })

      // If we found a target, slowly turn towards it
      if (nearestEnemy) {
        const targetAngle = Phaser.Math.Angle.Between(this.x, this.y, nearestEnemy.x, nearestEnemy.y)

        // Calculate the shortest angular difference
        let angleDiff = targetAngle - this.currentAngle

        // Normalize angle difference to [-PI, PI]
        while (angleDiff > Math.PI) angleDiff -= Math.PI * 2
        while (angleDiff < -Math.PI) angleDiff += Math.PI * 2

        // Gradually turn towards target (slow turning)
        if (Math.abs(angleDiff) < this.homingTurnRate) {
          this.currentAngle = targetAngle
        } else {
          this.currentAngle += Math.sign(angleDiff) * this.homingTurnRate
        }

        // Update velocity based on new angle
        this.body.setVelocity(
          Math.cos(this.currentAngle) * this.homingSpeed,
          Math.sin(this.currentAngle) * this.homingSpeed
        )

        // Rotate the missile sprite to face direction of travel
        this.setRotation(this.currentAngle + Math.PI / 2) // +90 degrees because ▲ points up
      }
    }

    // Check orbit distance constraint for orbiting projectiles (e.g., Fireball Ring)
    if (this.maxOrbitDistance > 0) {
      const distanceFromOrigin = Phaser.Math.Distance.Between(
        this.x, this.y,
        this.orbitOriginX, this.orbitOriginY
      )
      if (distanceFromOrigin > this.maxOrbitDistance) {
        this.setActive(false)
        this.setVisible(false)
        this.setPosition(-1000, -1000)
        this.body.setVelocity(0, 0)
        this.body.enable = false
        return
      }
    }

    // Deactivate if off screen (tighter bounds for better cleanup)
    const margin = this.projectileType === ProjectileType.BOUNCING ? 50 : 20
    if (this.y < -margin || this.y > this.scene.cameras.main.height + margin ||
      this.x < -margin || this.x > this.scene.cameras.main.width + margin) {
      this.setActive(false)
      this.setVisible(false)
      this.setPosition(-1000, -1000)
      this.body.setVelocity(0, 0)
      this.body.enable = false
    }

    // Safety: Check for projectiles with disabled body but still active (invalid state)
    if (this.active && !this.body.enable) {
      console.warn(`[Projectile] Invalid state: active but body disabled at (${this.x}, ${this.y}) type: ${this.projectileType}`)
      this.setActive(false)
      this.setVisible(false)
      this.setPosition(-1000, -1000)
    }
  }
}

export class ProjectileGroup extends Phaser.Physics.Arcade.Group {
  private enemyGroupRef: any = null
  private pool: Projectile[] = []
  private maxProjectiles: number = 500

  constructor(scene: Phaser.Scene, poolSize: number = 500) {
    super(scene.physics.world, scene)

    this.maxProjectiles = poolSize

    // Pre-create all projectiles for the pool
    for (let i = 0; i < poolSize; i++) {
      const projectile = new Projectile(scene, -1000, -1000)

      // Deactivate for pool
      projectile.setActive(false)
      projectile.setVisible(false)
      if (projectile.body) {
        projectile.body.enable = false
      }

      this.add(projectile, false) // false = already added to scene in constructor
      this.pool.push(projectile)
    }
  }

  setEnemyGroup(enemyGroup: any): void {
    this.enemyGroupRef = enemyGroup
    // Update all projectiles in pool with enemy group reference
    this.pool.forEach(p => p.setEnemyGroup(enemyGroup))
  }

  fireProjectile(
    x: number,
    y: number,
    damage: number = 10,
    pierceCount: number = 0,
    velocityX: number = 0,
    velocityY: number = -500,
    icon: string = '|',
    color: string = '#ffff00',
    type: ProjectileType = ProjectileType.NORMAL,
    specialData?: {
      explosionRadius?: number
      freezeChance?: number
      freezeDuration?: number
      chainCount?: number
      bounceCount?: number
      waveAmplitude?: number
      waveFrequency?: number
      wavePhase?: number
      zoneDuration?: number
      zoneRadius?: number
      homingTurnRate?: number
      homingSpeed?: number
      fontSize?: string
      damageType?: DamageType
      weaponName?: string
      orbitOriginX?: number
      orbitOriginY?: number
      maxOrbitDistance?: number
    }
  ): Projectile | null {
    // Find inactive projectile from pool
    const projectile = this.pool.find(p => !p.active)
    const activeCount = this.pool.filter(p => p.active).length

    if (!projectile) {
      // Pool is full - log for debugging
      console.warn(`[ProjectileGroup] Pool exhausted! Active: ${activeCount}/${this.maxProjectiles}`)
      return null
    }

    // Log when pool usage is high (over 80%)
    if (activeCount > this.maxProjectiles * 0.8) {
      console.warn(`[ProjectileGroup] High usage: ${activeCount}/${this.maxProjectiles} active`)
    }

    // Initialize the projectile
    projectile.fire(
      x,
      y,
      damage,
      pierceCount,
      velocityX,
      velocityY,
      icon,
      color,
      type,
      specialData
    )

    // Set enemy group reference for homing projectiles
    if (this.enemyGroupRef) {
      projectile.setEnemyGroup(this.enemyGroupRef)
    }

    return projectile
  }

  // Get active projectile count for debugging
  getActiveCount(): number {
    return this.pool.filter(p => p.active).length
  }

  // Update all active projectiles
  update(delta: number) {
    let activeCount = 0
    this.pool.forEach(projectile => {
      if (projectile.active) {
        activeCount++
        projectile.update(delta)
      }
    })
    // Debug: log if we have stuck projectiles (over 90% usage)
    if (activeCount > this.maxProjectiles * 0.9) {
      console.error(`[ProjectileGroup] CRITICAL: ${activeCount}/${this.maxProjectiles} active projectiles - likely leak!`)
    }
  }

  // Fire multiple projectiles in a spread pattern
  fireSpread(
    x: number,
    y: number,
    damage: number,
    pierceCount: number,
    count: number,
    spreadAngle: number = 30,
    icon: string = '|',
    color: string = '#ffff00',
    fontSize?: string,
    speed: number = 500
  ) {
    const angleStep = spreadAngle / (count - 1)
    const startAngle = -spreadAngle / 2

    for (let i = 0; i < count; i++) {
      const angle = (startAngle + angleStep * i) * (Math.PI / 180)
      const velocityX = Math.sin(angle) * speed
      const velocityY = -Math.cos(angle) * speed

      this.fireProjectile(
        x, y, damage, pierceCount, velocityX, velocityY, icon, color,
        ProjectileType.NORMAL,
        fontSize ? { fontSize } : undefined
      )
    }
  }
}
