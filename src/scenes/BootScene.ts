import Phaser from 'phaser'
import { GameState } from '../game/GameState'

export default class BootScene extends Phaser.Scene {
  private loadingText!: Phaser.GameObjects.Text
  private progressBar!: Phaser.GameObjects.Rectangle
  private progressBarBg!: Phaser.GameObjects.Rectangle

  constructor() {
    super('BootScene')
  }

  preload() {
    // Create loading UI first (this happens before actual loading)
    this.createLoadingUI()

    let filesLoaded = 0
    const totalFiles = 20
    const barWidth = 400

    // Load all 20 background music tracks
    for (let i = 1; i <= 20; i++) {
      const trackNumber = i.toString().padStart(3, '0')
      this.load.audio(`bgm-${i}`, `assets/audio/8 Bit atmosphere/8 Bit atmosphere - ${trackNumber} - ${this.getTrackName(i)}.mp3`)
    }

    // Track when each file completes loading
    this.load.on('filecomplete', (key: string) => {
      filesLoaded++
      const percent = Math.floor((filesLoaded / totalFiles) * 100)
      this.loadingText.setText(`Loading Audio ${filesLoaded}/${totalFiles} (${percent}%)`)
      this.progressBar.width = barWidth * (filesLoaded / totalFiles)
    })

    this.load.on('complete', () => {
      this.loadingText.setText('Loading Complete! (100%)')
      this.progressBar.width = barWidth
    })
  }

  private createLoadingUI() {
    // Black background
    this.add.rectangle(0, 0, this.cameras.main.width, this.cameras.main.height, 0x000000)
      .setOrigin(0, 0)

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
      'LOADING 0%',
      {
        fontFamily: 'Courier New',
        fontSize: '24px',
        color: '#00ff00',
      }
    ).setOrigin(0.5)
  }

  private getTrackName(trackNumber: number): string {
    const trackNames = [
      'Whispers from a Forgotten Console',
      'Beyond the Pixelated Horizon',
      'The Gentle Descent into the Cosmic Ruin',
      'A Lullaby for the Digital Sun',
      'Searching for a Signal in the Void',
      'The Solitary Synth\'s Cosmic Hymn',
      'The Surveyor\'s Quiet, Amiga Reverie',
      'The Echo of a Lost Binary Heart',
      'Reaching for the Starlight Echo',
      'Through the Whispering Data Streams',
      'The Ambient Glitch of a Fading Past',
      'A Soft, Slow Journey through the Nebula',
      'The Coded Serenity of the Ancient Star',
      'Finding the Heart of the Digital Ruins',
      'The Ethereal Rhythm of the Cosmic Dust',
      'A Quiet Contemplation on a Ghostly Starfield',
      'The Architect\'s Final Mod Symphony',
      'Uncovering the Sunken Astro-Beacon',
      'The Gentle Drift to the Crystal Maze',
      'A Circuitry Dream on a Distant Shore'
    ]
    return trackNames[trackNumber - 1]
  }

  create() {
    // Update text to show we're in create phase
    if (this.loadingText) {
      this.loadingText.setText('Initializing...')
    }

    // Check if this is a fresh save (no runs completed yet)
    const gameState = GameState.getInstance()
    const isFreshSave = !localStorage.getItem('roguecraft_gamestate')

    // Wait a moment then transition
    this.time.delayedCall(500, () => {
      if (this.loadingText) {
        this.loadingText.setText('Starting...')
      }
      this.cameras.main.fadeOut(300, 0, 0, 0)
      this.cameras.main.once('camerafadeoutcomplete', () => {
        // If fresh save, start the game directly. Otherwise go to main menu
        if (isFreshSave) {
          this.scene.start('GameScene', { levelIndex: 0 })
        } else {
          this.scene.start('MainMenuScene')
        }
      })
    })
  }
}
