import Phaser from 'phaser'

export default class LoadingScene extends Phaser.Scene {
  private loadingText!: Phaser.GameObjects.Text
  private dots: string = ''
  private timer: number = 0
  private minLoadTime: number = 2000 // Minimum 2 seconds
  private startTime: number = 0

  constructor() {
    super('LoadingScene')
  }

  create() {
    this.startTime = Date.now()

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

    this.loadingText = this.add.text(
      this.cameras.main.centerX,
      this.cameras.main.centerY + 100,
      'INITIALIZING',
      {
        fontFamily: 'Courier New',
        fontSize: '24px',
        color: '#00ff00',
      }
    ).setOrigin(0.5)

    // Animated loading dots
    this.time.addEvent({
      delay: 500,
      callback: this.updateLoadingText,
      callbackScope: this,
      loop: true,
    })

    // Check if minimum load time has passed
    this.time.addEvent({
      delay: this.minLoadTime,
      callback: this.startGame,
      callbackScope: this,
    })
  }

  private updateLoadingText() {
    this.dots += '.'
    if (this.dots.length > 3) {
      this.dots = ''
    }
    this.loadingText.setText('INITIALIZING' + this.dots)
  }

  private startGame() {
    this.scene.start('GameScene')
  }
}
