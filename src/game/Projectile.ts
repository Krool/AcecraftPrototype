import Phaser from 'phaser'

export class Projectile extends Phaser.GameObjects.Text {
  private damage: number = 10
  private speed: number = -500 // Negative for upward movement
  private pierceCount: number = 0 // How many enemies it can pierce through
  private remainingPierces: number = 0
  public body!: Phaser.Physics.Arcade.Body

  constructor(scene: Phaser.Scene, x: number, y: number) {
    super(scene, x, y, '|', {
      fontFamily: 'Courier New',
      fontSize: '24px',
      color: '#ffff00',
    })

    this.setOrigin(0.5)

    // Add to scene and enable physics
    scene.add.existing(this)
    scene.physics.add.existing(this)

    // Start inactive
    this.setActive(false)
    this.setVisible(false)
  }

  fire(x: number, y: number, damage: number = 10, pierceCount: number = 0, velocityX: number = 0, velocityY: number = -500, icon: string = '|', color: string = '#ffff00') {
    // Reset position
    this.setPosition(x, y)

    // Set damage and pierce
    this.damage = damage
    this.pierceCount = pierceCount
    this.remainingPierces = pierceCount

    // Set visual based on icon and pierce
    this.setText(icon)
    if (pierceCount > 0) {
      this.setColor('#00ffff')
      this.setFontSize('28px')
    } else {
      this.setColor(color)
      this.setFontSize('24px')
    }

    // Activate the projectile
    this.setActive(true)
    this.setVisible(true)

    // Enable physics body and set velocity
    this.body.enable = true
    this.body.reset(x, y)
    this.body.setVelocity(velocityX, velocityY)
  }

  getDamage(): number {
    return this.damage
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

  update() {
    // Deactivate if off screen (top of screen)
    if (this.active && this.y < -50) {
      this.setActive(false)
      this.setVisible(false)
      this.body.enable = false
    }
  }
}

export class ProjectileGroup extends Phaser.Physics.Arcade.Group {
  private pool: Projectile[] = []

  constructor(scene: Phaser.Scene, poolSize: number = 200) {
    super(scene.physics.world, scene)

    // Create pool of projectiles
    for (let i = 0; i < poolSize; i++) {
      const projectile = new Projectile(scene, 0, 0)
      this.add(projectile, true)
      this.pool.push(projectile)
    }
  }

  fireProjectile(x: number, y: number, damage: number = 10, pierceCount: number = 0, velocityX: number = 0, velocityY: number = -500, icon: string = '|', color: string = '#ffff00') {
    // Get an inactive projectile from the pool
    const projectile = this.pool.find(p => !p.active)

    if (projectile) {
      projectile.fire(x, y, damage, pierceCount, velocityX, velocityY, icon, color)
    }
  }

  // Fire multiple projectiles in a spread pattern
  fireSpread(x: number, y: number, damage: number, pierceCount: number, count: number, spreadAngle: number = 30, icon: string = '|', color: string = '#ffff00') {
    const angleStep = spreadAngle / (count - 1)
    const startAngle = -spreadAngle / 2

    for (let i = 0; i < count; i++) {
      const projectile = this.pool.find(p => !p.active)
      if (!projectile) break

      const angle = (startAngle + angleStep * i) * (Math.PI / 180)
      const speed = 500
      const velocityX = Math.sin(angle) * speed
      const velocityY = -Math.cos(angle) * speed

      projectile.fire(x, y, damage, pierceCount, velocityX, velocityY, icon, color)
    }
  }

  update() {
    // Update all active projectiles
    this.pool.forEach(projectile => {
      if (projectile.active) {
        projectile.update()
      }
    })
  }
}
