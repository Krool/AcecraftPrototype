import Phaser from 'phaser'
import { GameState, TutorialStep } from '../game/GameState'
import { BuildingType } from '../game/Building'

export default class MainMenuScene extends Phaser.Scene {
  private gameState!: GameState

  constructor() {
    super('MainMenuScene')
  }

  create() {
    this.gameState = GameState.getInstance()

    // Check if tutorial should start
    const tutorialStep = this.gameState.getTutorialStep()
    console.log('MainMenuScene - Tutorial step:', tutorialStep)

    if (tutorialStep === TutorialStep.NOT_STARTED) {
      console.log('Starting tutorial battle...')
      // Don't save state yet - let GameScene handle it
      console.log('Attempting to start GameScene with isTutorial: true')
      this.scene.stop('MainMenuScene')
      this.scene.start('GameScene', { isTutorial: true })
      return
    }

    // Handle tutorial progression
    if (tutorialStep === TutorialStep.BUILD_MARKET) {
      this.showTutorialPrompt('BUILD MARKET', 'Click BUILD and purchase the Market building (50 Credits)')
    } else if (tutorialStep === TutorialStep.OPEN_MARKET) {
      this.showTutorialPrompt('OPEN MARKET', 'Click MARKET to access the ship gacha system')
    }

    // Add background
    this.add.rectangle(0, 0, this.cameras.main.width, this.cameras.main.height, 0x0a0a1e)
      .setOrigin(0, 0)

    // Add scrolling star field
    this.createStarField()

    // Title
    const title = this.add.text(
      this.cameras.main.centerX,
      100,
      'ROGUECRAFT',
      {
        fontFamily: 'Courier New',
        fontSize: '56px',
        color: '#00ffff',
        fontStyle: 'bold',
      }
    ).setOrigin(0.5)

    const subtitle = this.add.text(
      this.cameras.main.centerX,
      160,
      'Vertical Roguelike Shooter',
      {
        fontFamily: 'Courier New',
        fontSize: '18px',
        color: '#aaaaaa',
      }
    ).setOrigin(0.5)

    // Display credits
    const creditsText = this.add.text(
      this.cameras.main.centerX,
      220,
      `Credits: ${this.gameState.getCredits()} ¤`,
      {
        fontFamily: 'Courier New',
        fontSize: '20px',
        color: '#ffdd00',
      }
    ).setOrigin(0.5)

    // $ button to add 1000 credits (debug/cheat button)
    const creditButton = this.add.text(
      this.cameras.main.centerX + 120,
      220,
      '$',
      {
        fontFamily: 'Courier New',
        fontSize: '24px',
        color: '#ffdd00',
        fontStyle: 'bold',
      }
    ).setOrigin(0.5).setInteractive({ useHandCursor: true })

    creditButton.on('pointerover', () => {
      creditButton.setColor('#ffff00')
      creditButton.setScale(1.2)
    })

    creditButton.on('pointerout', () => {
      creditButton.setColor('#ffdd00')
      creditButton.setScale(1)
    })

    creditButton.on('pointerdown', () => {
      this.gameState.addCredits(1000)
      creditsText.setText(`Credits: ${this.gameState.getCredits()} ¤`)
      // Flash effect
      this.tweens.add({
        targets: creditsText,
        scale: 1.3,
        duration: 100,
        yoyo: true,
      })
    })

    // Display gems if Market is unlocked
    const marketBuilding = this.gameState.getBuilding(BuildingType.MARKET)
    if (marketBuilding.isUnlocked()) {
      const gemsText = this.add.text(
        this.cameras.main.centerX,
        250,
        `◆ Gems: ${this.gameState.getGems()}`,
        {
          fontFamily: 'Courier New',
          fontSize: '20px',
          color: '#00ffff',
        }
      ).setOrigin(0.5)

      // $ button to add 1000 gems (debug/cheat button)
      const gemButton = this.add.text(
        this.cameras.main.centerX + 120,
        250,
        '$',
        {
          fontFamily: 'Courier New',
          fontSize: '24px',
          color: '#00ff00',
          fontStyle: 'bold',
        }
      ).setOrigin(0.5).setInteractive({ useHandCursor: true })

      gemButton.on('pointerover', () => {
        gemButton.setColor('#00ffaa')
        gemButton.setScale(1.2)
      })

      gemButton.on('pointerout', () => {
        gemButton.setColor('#00ff00')
        gemButton.setScale(1)
      })

      gemButton.on('pointerdown', () => {
        this.gameState.addGems(1000)
        gemsText.setText(`◆ Gems: ${this.gameState.getGems()}`)
        // Flash effect
        this.tweens.add({
          targets: gemsText,
          scale: 1.3,
          duration: 100,
          yoyo: true,
        })
      })
    }

    // Menu buttons
    const buttonWidth = 400
    const buttonHeight = 80
    const buttonSpacing = 20
    const startY = 300

    // Campaign Button
    const campaignButton = this.add.rectangle(
      this.cameras.main.centerX,
      startY,
      buttonWidth,
      buttonHeight,
      0x2a2a4a
    ).setInteractive({ useHandCursor: true })

    const campaignIcon = this.add.text(
      this.cameras.main.centerX - 150,
      startY,
      '▲',
      {
        fontFamily: 'Courier New',
        fontSize: '48px',
        color: '#00ff00',
      }
    ).setOrigin(0.5)

    const campaignText = this.add.text(
      this.cameras.main.centerX + 20,
      startY,
      'CAMPAIGN\nStart Mission',
      {
        fontFamily: 'Courier New',
        fontSize: '24px',
        color: '#00ff00',
        align: 'center',
      }
    ).setOrigin(0.5)

    campaignButton.on('pointerover', () => {
      campaignButton.setFillStyle(0x3a3a6a)
    })

    campaignButton.on('pointerout', () => {
      campaignButton.setFillStyle(0x2a2a4a)
    })

    campaignButton.on('pointerdown', () => {
      this.scene.start('GameScene')
    })

    // Build Button
    const buildButton = this.add.rectangle(
      this.cameras.main.centerX,
      startY + buttonHeight + buttonSpacing,
      buttonWidth,
      buttonHeight,
      0x2a2a4a
    ).setInteractive({ useHandCursor: true })

    const buildIcon = this.add.text(
      this.cameras.main.centerX - 150,
      startY + buttonHeight + buttonSpacing,
      '⚒',
      {
        fontFamily: 'Courier New',
        fontSize: '48px',
        color: '#ffaa00',
      }
    ).setOrigin(0.5)

    const buildText = this.add.text(
      this.cameras.main.centerX + 20,
      startY + buttonHeight + buttonSpacing,
      'BUILD\nUpgrade Facilities',
      {
        fontFamily: 'Courier New',
        fontSize: '24px',
        color: '#ffaa00',
        align: 'center',
      }
    ).setOrigin(0.5)

    buildButton.on('pointerover', () => {
      buildButton.setFillStyle(0x3a3a6a)
    })

    buildButton.on('pointerout', () => {
      buildButton.setFillStyle(0x2a2a4a)
    })

    buildButton.on('pointerdown', () => {
      this.scene.start('BuildingMenuScene')
    })

    // Hangar Button
    const hangarButton = this.add.rectangle(
      this.cameras.main.centerX,
      startY + (buttonHeight + buttonSpacing) * 2,
      buttonWidth,
      buttonHeight,
      0x2a2a4a
    ).setInteractive({ useHandCursor: true })

    const hangarIcon = this.add.text(
      this.cameras.main.centerX - 150,
      startY + (buttonHeight + buttonSpacing) * 2,
      '♠',
      {
        fontFamily: 'Courier New',
        fontSize: '48px',
        color: '#00ffff',
      }
    ).setOrigin(0.5)

    const hangarText = this.add.text(
      this.cameras.main.centerX + 20,
      startY + (buttonHeight + buttonSpacing) * 2,
      'HANGAR\nSelect Ship',
      {
        fontFamily: 'Courier New',
        fontSize: '24px',
        color: '#00ffff',
        align: 'center',
      }
    ).setOrigin(0.5)

    hangarButton.on('pointerover', () => {
      hangarButton.setFillStyle(0x3a3a6a)
    })

    hangarButton.on('pointerout', () => {
      hangarButton.setFillStyle(0x2a2a4a)
    })

    hangarButton.on('pointerdown', () => {
      this.scene.start('HangarScene')
    })

    // Market Button (only if unlocked)
    if (marketBuilding.isUnlocked()) {
      const marketButton = this.add.rectangle(
        this.cameras.main.centerX,
        startY + (buttonHeight + buttonSpacing) * 3,
        buttonWidth,
        buttonHeight,
        0x2a2a4a
      ).setInteractive({ useHandCursor: true })

      const marketIcon = this.add.text(
        this.cameras.main.centerX - 150,
        startY + (buttonHeight + buttonSpacing) * 3,
        '◎',
        {
          fontFamily: 'Courier New',
          fontSize: '48px',
          color: '#ffaa00',
        }
      ).setOrigin(0.5)

      const marketText = this.add.text(
        this.cameras.main.centerX + 20,
        startY + (buttonHeight + buttonSpacing) * 3,
        'MARKET\nRoll for Ships',
        {
          fontFamily: 'Courier New',
          fontSize: '24px',
          color: '#ffaa00',
          align: 'center',
        }
      ).setOrigin(0.5)

      marketButton.on('pointerover', () => {
        marketButton.setFillStyle(0x3a3a6a)
      })

      marketButton.on('pointerout', () => {
        marketButton.setFillStyle(0x2a2a4a)
      })

      marketButton.on('pointerdown', () => {
        this.scene.start('MarketScene')
      })
    }

    // Stats Button
    const statsButtonY = marketBuilding.isUnlocked()
      ? startY + (buttonHeight + buttonSpacing) * 4
      : startY + (buttonHeight + buttonSpacing) * 3

    const statsButton = this.add.rectangle(
      this.cameras.main.centerX,
      statsButtonY,
      buttonWidth,
      buttonHeight,
      0x2a2a4a
    ).setInteractive({ useHandCursor: true })

    const statsIcon = this.add.text(
      this.cameras.main.centerX - 150,
      statsButtonY,
      '📊',
      {
        fontFamily: 'Courier New',
        fontSize: '48px',
        color: '#00ffff',
      }
    ).setOrigin(0.5)

    const statsButtonText = this.add.text(
      this.cameras.main.centerX + 20,
      statsButtonY,
      'STATS\nCharacter Stats',
      {
        fontFamily: 'Courier New',
        fontSize: '24px',
        color: '#00ffff',
        align: 'center',
      }
    ).setOrigin(0.5)

    statsButton.on('pointerover', () => {
      statsButton.setFillStyle(0x3a3a6a)
    })

    statsButton.on('pointerout', () => {
      statsButton.setFillStyle(0x2a2a4a)
    })

    statsButton.on('pointerdown', () => {
      this.scene.start('StatsScene')
    })

    // Stats display at bottom
    const statsDisplayText = this.add.text(
      this.cameras.main.centerX,
      this.cameras.main.height - 80,
      `Total Runs: ${this.gameState.getTotalRuns()} | Best Score: ${this.gameState.getBestScore()} | Total Kills: ${this.gameState.getTotalKills()}`,
      {
        fontFamily: 'Courier New',
        fontSize: '14px',
        color: '#888888',
        align: 'center',
      }
    ).setOrigin(0.5)

    // Version
    this.add.text(
      10,
      this.cameras.main.height - 10,
      'v0.1.0',
      {
        fontFamily: 'Courier New',
        fontSize: '12px',
        color: '#555555',
      }
    ).setOrigin(0, 1)

    // Reset button (bottom right)
    const resetButton = this.add.text(
      this.cameras.main.width - 10,
      this.cameras.main.height - 10,
      'Reset Save',
      {
        fontFamily: 'Courier New',
        fontSize: '12px',
        color: '#ff6666',
      }
    ).setOrigin(1, 1).setInteractive({ useHandCursor: true })

    resetButton.on('pointerover', () => {
      resetButton.setColor('#ff0000')
    })

    resetButton.on('pointerout', () => {
      resetButton.setColor('#ff6666')
    })

    resetButton.on('pointerdown', () => {
      if (confirm('Are you sure you want to reset all progress? This cannot be undone!')) {
        console.log('Resetting game save...')
        // Clear localStorage first
        localStorage.removeItem('roguecraft_gamestate')
        localStorage.removeItem('roguecraft_highscore')
        // Reset the singleton instance so it creates a fresh one on reload
        GameState.resetInstance()
        // Reload the page to start fresh with tutorial
        window.location.reload()
      }
    })
  }

  private createStarField() {
    // Create multiple layers of stars for parallax effect
    const starLayers = [
      { count: 50, speed: 20, size: 1, brightness: 0.3 },
      { count: 30, speed: 40, size: 2, brightness: 0.6 },
      { count: 20, speed: 60, size: 3, brightness: 1 },
    ]

    starLayers.forEach(layer => {
      for (let i = 0; i < layer.count; i++) {
        const x = Phaser.Math.Between(0, this.cameras.main.width)
        const y = Phaser.Math.Between(0, this.cameras.main.height)

        const alpha = layer.brightness
        const star = this.add.circle(x, y, layer.size, 0xffffff, alpha)

        // Animate star scrolling downward
        this.tweens.add({
          targets: star,
          y: this.cameras.main.height + 10,
          duration: (this.cameras.main.height / layer.speed) * 1000,
          repeat: -1,
          onRepeat: () => {
            // Reset to top with new random X position
            star.x = Phaser.Math.Between(0, this.cameras.main.width)
            star.y = -10
          }
        })
      }
    })
  }

  private showTutorialPrompt(title: string, message: string) {
    // Create tutorial prompt overlay
    const promptBg = this.add.rectangle(
      this.cameras.main.centerX,
      100,
      500,
      120,
      0x1a1a3a
    ).setDepth(1000).setStrokeStyle(3, 0xffaa00)

    const promptTitle = this.add.text(
      this.cameras.main.centerX,
      70,
      title,
      {
        fontFamily: 'Courier New',
        fontSize: '24px',
        color: '#ffaa00',
        fontStyle: 'bold',
      }
    ).setOrigin(0.5).setDepth(1001)

    const promptText = this.add.text(
      this.cameras.main.centerX,
      105,
      message,
      {
        fontFamily: 'Courier New',
        fontSize: '14px',
        color: '#ffffff',
        align: 'center',
        wordWrap: { width: 480 }
      }
    ).setOrigin(0.5).setDepth(1001)

    // Pulse animation
    this.tweens.add({
      targets: [promptBg, promptTitle, promptText],
      alpha: 0.7,
      duration: 800,
      yoyo: true,
      repeat: -1,
    })
  }
}
