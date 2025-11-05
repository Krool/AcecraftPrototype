import Phaser from 'phaser'

export default class GameScene extends Phaser.Scene {
  private player!: Phaser.GameObjects.Text
  private cursors!: Phaser.Types.Input.Keyboard.CursorKeys
  private playerSpeed: number = 300

  constructor() {
    super('GameScene')
  }

  create() {
    // Add background
    this.add.rectangle(0, 0, this.cameras.main.width, this.cameras.main.height, 0x000000)
      .setOrigin(0, 0)

    // Create player (ASCII ship)
    this.player = this.add.text(
      this.cameras.main.centerX,
      this.cameras.main.height - 100,
      '▲',
      {
        fontFamily: 'Courier New',
        fontSize: '48px',
        color: '#00ff00',
      }
    ).setOrigin(0.5)

    // Enable physics on player
    this.physics.add.existing(this.player)
    const playerBody = this.player.body as Phaser.Physics.Arcade.Body
    playerBody.setCollideWorldBounds(true)

    // Setup keyboard controls
    this.cursors = this.input.keyboard!.createCursorKeys()

    // Add instructions
    this.add.text(10, 10, 'Arrow keys or WASD to move', {
      fontFamily: 'Courier New',
      fontSize: '16px',
      color: '#00ff00',
    })

    // Add touch/mouse controls (invisible joystick simulation)
    this.setupTouchControls()
  }

  private setupTouchControls() {
    let isDragging = false
    let dragStartX = 0
    let dragStartY = 0

    this.input.on('pointerdown', (pointer: Phaser.Input.Pointer) => {
      isDragging = true
      dragStartX = pointer.x
      dragStartY = pointer.y
    })

    this.input.on('pointermove', (pointer: Phaser.Input.Pointer) => {
      if (isDragging) {
        const deltaX = pointer.x - dragStartX
        const deltaY = pointer.y - dragStartY

        const playerBody = this.player.body as Phaser.Physics.Arcade.Body

        // Move player based on drag direction
        playerBody.setVelocity(
          deltaX * 5,
          deltaY * 5
        )
      }
    })

    this.input.on('pointerup', () => {
      isDragging = false
      const playerBody = this.player.body as Phaser.Physics.Arcade.Body
      playerBody.setVelocity(0, 0)
    })
  }

  update() {
    const playerBody = this.player.body as Phaser.Physics.Arcade.Body

    // Keyboard controls
    if (this.cursors.left.isDown) {
      playerBody.setVelocityX(-this.playerSpeed)
    } else if (this.cursors.right.isDown) {
      playerBody.setVelocityX(this.playerSpeed)
    } else if (!this.input.activePointer.isDown) {
      playerBody.setVelocityX(0)
    }

    if (this.cursors.up.isDown) {
      playerBody.setVelocityY(-this.playerSpeed)
    } else if (this.cursors.down.isDown) {
      playerBody.setVelocityY(this.playerSpeed)
    } else if (!this.input.activePointer.isDown) {
      playerBody.setVelocityY(0)
    }
  }
}
