import Phaser from 'phaser'

export default class LoadingScene extends Phaser.Scene {
  private loadingText!: Phaser.GameObjects.Text
  private progressBar!: Phaser.GameObjects.Rectangle
  private progressBarBg!: Phaser.GameObjects.Rectangle
  private minLoadTime: number = 1000 // Quick 1 second transition
  private levelIndex: number = 0
  private transitionComplete: boolean = false

  constructor() {
    super('LoadingScene')
  }

  create(data?: { levelIndex?: number }) {
    this.levelIndex = data?.levelIndex ?? 0

    // Black background
    this.add.rectangle(0, 0, this.cameras.main.width, this.cameras.main.height, 0x000000)
      .setOrigin(0, 0)

    // Fade in from black
    this.cameras.main.fadeIn(200, 0, 0, 0)

    // ASCII art title
    const title = `
    ██████╗  ██████╗  ██████╗ ██╗   ██╗███████╗
    ██╔══██╗██╔═══██╗██╔════╝ ██║   ██║██╔════╝
    ██████╔╝██║   ██║██║  ███╗██║   ██║█████╗
    ██╔══██╗██║   ██║██║   ██║██║   ██║██╔══╝
    ██║  ██║╚██████╔╝╚██████╔╝╚██████╔╝███████╗
    ╚═╝  ╚═╝ ╚═════╝  ╚═════╝  ╚═════╝ ╚══════╝

         ██████╗██████╗  █████╗ ███████╗████████╗
        ██╔════╝██╔══██╗██╔══██╗██╔════╝╚══██╔══╝
        ██║     ██████╔╝███████║█████╗     ██║
        ██║     ██╔══██╗██╔══██║██╔══╝     ██║
        ╚██████╗██║  ██║██║  ██║██║        ██║
         ╚═════╝╚═╝  ╚═╝╚═╝  ╚═╝╚═╝        ╚═╝
    `

    this.add.text(this.cameras.main.centerX, 200, title, {
      fontFamily: 'Courier New',
      fontSize: '12px',
      color: '#00ff00',
    }).setOrigin(0.5)

    // Progress bar background
    const barWidth = 400
    const barHeight = 30
    this.progressBarBg = this.add.rectangle(
      this.cameras.main.centerX,
      this.cameras.main.centerY + 80,
      barWidth,
      barHeight,
      0x222222
    )

    // Progress bar fill
    this.progressBar = this.add.rectangle(
      this.cameras.main.centerX - barWidth / 2,
      this.cameras.main.centerY + 80,
      0,
      barHeight,
      0x00ff00
    ).setOrigin(0, 0.5)

    this.loadingText = this.add.text(
      this.cameras.main.centerX,
      this.cameras.main.centerY + 120,
      'INITIALIZING',
      {
        fontFamily: 'Courier New',
        fontSize: '24px',
        color: '#00ff00',
      }
    ).setOrigin(0.5)

    // Quick progress animation
    let progress = 0
    const progressTimer = this.time.addEvent({
      delay: 25, // Update every 25ms
      callback: () => {
        progress += 0.05 // 25ms * 20 steps = 500ms
        if (progress >= 1) {
          progress = 1
          progressTimer.remove()
          this.transitionComplete = true
        }
        this.progressBar.width = barWidth * progress
      },
      loop: true
    })

    // Wait for minimum time then transition
    this.time.delayedCall(this.minLoadTime, () => {
      this.cameras.main.fadeOut(300, 0, 0, 0)
      this.cameras.main.once('camerafadeoutcomplete', () => {
        this.scene.start('GameScene', { levelIndex: this.levelIndex })
      })
    })
  }
}
