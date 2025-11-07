import Phaser from 'phaser'

export enum ProjectileType {
  NORMAL = 'NORMAL',
  EXPLOSIVE = 'EXPLOSIVE',      // Fire - explodes on hit
  FREEZING = 'FREEZING',        // Ice - slows/freezes enemies
  CHAINING = 'CHAINING',        // Lightning - chains to nearby enemies
  BOUNCING = 'BOUNCING',        // Ricochet - bounces off enemies
  WAVE = 'WAVE',                // Water - oscillates left/right
  EARTH_ZONE = 'EARTH_ZONE',    // Earth - creates persistent damage zones
  HOMING = 'HOMING',            // Missiles - homes in on enemies
}

export class Projectile extends Phaser.GameObjects.Text {
  private damage: number
  private pierceCount: number
  private remainingPierces: number
  private projectileType: ProjectileType
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
    }
  ) {
    const defaultFontSize = pierceCount > 0 ? '22px' : '19px'
    const fontSize = specialData?.fontSize || defaultFontSize

    super(scene, x, y, icon, {
      fontFamily: 'Courier New',
      fontSize: fontSize,
      color: pierceCount > 0 ? '#00ffff' : color,
    })

    this.setOrigin(0.5)
    this.setDepth(20) // Player projectiles render above enemies

    // Set properties
    this.damage = damage
    this.pierceCount = pierceCount
    this.remainingPierces = pierceCount
    this.projectileType = type
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
        trailChar = '⚡'
        trailColor = '#ffff00'
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

  update() {
    // Trail particles disabled for performance
    // const currentTime = this.scene.time.now
    // if (currentTime - this.lastTrailTime > 150) {
    //   this.createTrailParticle()
    //   this.lastTrailTime = currentTime
    // }

    // Apply wave motion for WAVE projectiles
    if (this.projectileType === ProjectileType.WAVE) {
      this.distanceTraveled += Math.abs(this.body.velocity.y) * (1/60) // Assuming 60 FPS
      const offset = Math.sin(this.distanceTraveled * this.waveFrequency + this.wavePhase) * this.waveAmplitude
      this.x = this.initialX + offset
    }

    // Bounce off screen edges for BOUNCING projectiles
    if (this.projectileType === ProjectileType.BOUNCING) {
      if (this.bounceCount > 0) {
        const screenWidth = this.scene.cameras.main.width
        const screenHeight = this.scene.cameras.main.height
        let bounced = false

        // Bounce off left/right edges
        if (this.x < 10 && this.body.velocity.x < 0) {
          this.body.setVelocityX(-this.body.velocity.x)
          this.x = 10
          bounced = true
        } else if (this.x > screenWidth - 10 && this.body.velocity.x > 0) {
          this.body.setVelocityX(-this.body.velocity.x)
          this.x = screenWidth - 10
          bounced = true
        }

        // Bounce off bottom edge
        if (this.y > screenHeight - 10 && this.body.velocity.y > 0) {
          this.body.setVelocityY(-this.body.velocity.y)
          this.y = screenHeight - 10
          bounced = true
        }

        // Decrement bounce count if we bounced off an edge
        if (bounced) {
          const stillHasBounces = this.decrementBounce()
          if (!stillHasBounces) {
            // Destroy projectile when it runs out of bounces
            this.destroy()
            return
          }
        }
      } else {
        // No bounces left - destroy projectile
        this.destroy()
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

    // Destroy if off screen (tighter bounds for better cleanup)
    const margin = this.projectileType === ProjectileType.BOUNCING ? 50 : 20
    if (this.y < -margin || this.y > this.scene.cameras.main.height + margin ||
        this.x < -margin || this.x > this.scene.cameras.main.width + margin) {
      this.destroy()
    }
  }
}

export class ProjectileGroup extends Phaser.Physics.Arcade.Group {
  private enemyGroupRef: any = null

  constructor(scene: Phaser.Scene) {
    super(scene.physics.world, scene)
  }

  setEnemyGroup(enemyGroup: any): void {
    this.enemyGroupRef = enemyGroup
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
    }
  ): Projectile {
    // Create new projectile
    const projectile = new Projectile(
      this.scene,
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

    // Add to group (false = already added to scene)
    this.add(projectile, false)

    // Re-apply velocity after adding to group (in case it was reset)
    projectile.body.setVelocity(velocityX, velocityY)

    // Set enemy group reference for homing projectiles
    if (this.enemyGroupRef) {
      projectile.setEnemyGroup(this.enemyGroupRef)
    }

    return projectile
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
    fontSize?: string
  ) {
    const angleStep = spreadAngle / (count - 1)
    const startAngle = -spreadAngle / 2

    for (let i = 0; i < count; i++) {
      const angle = (startAngle + angleStep * i) * (Math.PI / 180)
      const speed = 500
      const velocityX = Math.sin(angle) * speed
      const velocityY = -Math.cos(angle) * speed

      this.fireProjectile(
        x, y, damage, pierceCount, velocityX, velocityY, icon, color,
        ProjectileType.NORMAL,
        fontSize ? { fontSize } : undefined
      )
    }
  }

  update() {
    // Update all projectiles
    this.getChildren().forEach((projectile: any) => {
      if (projectile.update) {
        projectile.update()
      }
    })
  }
}
