import Phaser from 'phaser'

export class EnemyProjectile extends Phaser.GameObjects.Text {
  private damage: number = 10
  public body!: Phaser.Physics.Arcade.Body

  constructor(scene: Phaser.Scene, x: number, y: number) {
    super(scene, x, y, '•', {
      fontFamily: 'Courier New',
      fontSize: '16px',
      color: '#ff4444',
    })

    this.setOrigin(0.5)
    scene.add.existing(this)
    scene.physics.add.existing(this)

    this.setActive(false)
    this.setVisible(false)
  }

  fire(x: number, y: number, targetX: number, targetY: number, speed: number = 200, damage: number = 10) {
    this.setPosition(x, y)
    this.damage = damage
    this.setActive(true)
    this.setVisible(true)
    this.body.enable = true

    // Calculate direction to player
    const angle = Phaser.Math.Angle.Between(x, y, targetX, targetY)
    const velocityX = Math.cos(angle) * speed
    const velocityY = Math.sin(angle) * speed

    this.body.setVelocity(velocityX, velocityY)
  }

  fireDown(x: number, y: number, speed: number = 200, damage: number = 10) {
    this.setPosition(x, y)
    this.damage = damage
    this.setActive(true)
    this.setVisible(true)
    this.body.enable = true

    this.body.setVelocity(0, speed)
  }

  getDamage(): number {
    return this.damage
  }

  update() {
    // Deactivate if off screen
    if (this.active) {
      const cam = this.scene.cameras.main
      if (this.y > cam.height + 50 || this.y < -50 || this.x < -50 || this.x > cam.width + 50) {
        this.setActive(false)
        this.setVisible(false)
        this.body.enable = false
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
      this.add(projectile, true)
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
