import Phaser from 'phaser'

export class EnemyProjectile extends Phaser.GameObjects.Text {
  private damage: number = 10
  declare body: Phaser.Physics.Arcade.Body

  constructor(scene: Phaser.Scene, x: number, y: number) {
    super(scene, x, y, '●', {
      fontFamily: 'Courier New',
      fontSize: '48px',
      color: '#ff8888',
    })

    this.setOrigin(0.5)
    this.setShadow(2, 2, '#000000', 4, false, true) // Add shadow for depth
    this.setDepth(10) // Enemy projectiles render below enemies
    scene.add.existing(this)
    scene.physics.add.existing(this)

    // Set body size explicitly
    this.body.setSize(36, 36)

    // Start inactive and move off-screen to prevent collisions at 0,0
    this.setActive(false)
    this.setVisible(false)
    this.setPosition(-1000, -1000)
  }

  fire(x: number, y: number, targetX: number, targetY: number, speed: number = 200, damage: number = 10) {
    this.damage = damage

    // Calculate direction to player
    const angle = Phaser.Math.Angle.Between(x, y, targetX, targetY)
    const velocityX = Math.cos(angle) * speed
    const velocityY = Math.sin(angle) * speed

    // Re-enable physics body (in case it was disabled from previous collision)
    this.body.enable = true

    // Reset position first
    this.body.reset(x, y)
    this.setPosition(x, y)
    this.body.setVelocity(velocityX, velocityY)

    // Then activate
    this.setActive(true)
    this.setVisible(true)
  }

  fireDown(x: number, y: number, speed: number = 200, damage: number = 10) {
    this.damage = damage

    // Re-enable physics body (in case it was disabled from previous collision)
    this.body.enable = true

    // Reset position first
    this.body.reset(x, y)
    this.setPosition(x, y)
    this.body.setVelocity(0, speed)

    // Then activate
    this.setActive(true)
    this.setVisible(true)
  }

  getDamage(): number {
    return this.damage
  }

  update() {
    // Deactivate if off screen (tighter bounds for better cleanup)
    if (this.active) {
      const cam = this.scene.cameras.main
      if (this.y > cam.height + 20 || this.y < -20 || this.x < -20 || this.x > cam.width + 20) {
        this.setActive(false)
        this.setVisible(false)
        this.body.setVelocity(0, 0)
        this.body.enable = false
        this.setPosition(-1000, -1000)
      }
    }
  }
}

export class EnemyProjectileGroup extends Phaser.Physics.Arcade.Group {
  private pool: EnemyProjectile[] = []

  constructor(scene: Phaser.Scene, poolSize: number = 100) {
    super(scene.physics.world, scene)

    for (let i = 0; i < poolSize; i++) {
      const projectile = new EnemyProjectile(scene, 0, 0)
      this.add(projectile, false)  // false = already added to scene in constructor
      this.pool.push(projectile)
    }
  }

  fireAtTarget(x: number, y: number, targetX: number, targetY: number, speed: number = 200, damage: number = 10) {
    const projectile = this.pool.find(p => !p.active)
    if (projectile) {
      projectile.fire(x, y, targetX, targetY, speed, damage)
      return projectile
    }
    return null
  }

  fireDown(x: number, y: number, speed: number = 200, damage: number = 10) {
    const projectile = this.pool.find(p => !p.active)
    if (projectile) {
      projectile.fireDown(x, y, speed, damage)
      return projectile
    }
    return null
  }

  update() {
    this.pool.forEach(projectile => {
      if (projectile.active) {
        projectile.update()
      }
    })
  }
}
