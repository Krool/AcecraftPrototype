import Phaser from 'phaser'
import { GameState } from '../game/GameState'
import { BuildingType } from '../game/Building'
import { CAMPAIGN_LEVELS } from '../game/Campaign'
import { soundManager, SoundType } from '../game/SoundManager'
import { CHARACTER_CONFIGS } from '../game/Character'

export default class MainMenuScene extends Phaser.Scene {
  private gameState!: GameState
  private levelSelectionOverlay?: Phaser.GameObjects.Container
  private isLevelSelectionOpen: boolean = false

  constructor() {
    super('MainMenuScene')
  }

  shutdown() {
    // Stop all tweens to prevent errors when scene changes
    this.tweens.killAll()
  }

  create() {
    this.gameState = GameState.getInstance()

    // Add background
    this.add.rectangle(0, 0, this.cameras.main.width, this.cameras.main.height, 0x0a0a1e)
      .setOrigin(0, 0)

    // Add scrolling star field
    this.createStarField()

    // Calculate scale factor based on screen width (base width: 540px)
    const screenWidth = this.cameras.main.width
    const scaleFactor = Math.min(screenWidth / 540, 1.2) // Cap at 1.2x for larger screens

    // Title - centered with animation
    const titleText = 'ROGUECRAFT'
    const baseFontSize = 56
    const titleFontSize = Math.floor(baseFontSize * scaleFactor)
    const titleY = 120 * scaleFactor

    const title = this.add.text(
      this.cameras.main.centerX,
      titleY,
      titleText,
      {
        fontFamily: 'Courier New',
        fontSize: `${titleFontSize}px`,
        color: '#00ffff',
        fontStyle: 'bold',
      }
    ).setOrigin(0.5).setDepth(100)

    // Add pulsing glow/scale animation
    this.tweens.add({
      targets: title,
      scale: 1.1,
      duration: 1500,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut'
    })

    // Add rainbow color cycling animation
    this.tweens.add({
      targets: title,
      duration: 3000,
      repeat: -1,
      yoyo: false,
      onUpdate: (tween) => {
        const progress = tween.progress
        const hue = (progress * 360) % 360
        const color = Phaser.Display.Color.HSVToRGB(hue / 360, 0.8, 1) as Phaser.Types.Display.ColorObject
        title.setColor(Phaser.Display.Color.RGBToString(color.r, color.g, color.b))
      }
    })

    // Display credits - moved left to make room for $ button
    const creditsText = this.add.text(
      this.cameras.main.width - 60,
      25,
      `${this.gameState.getCredits()} ¤`,
      {
        fontFamily: 'Courier New',
        fontSize: '24px',
        color: '#ffdd00',
      }
    ).setOrigin(1, 0.5)
    creditsText.setName('creditsDisplay')

    // $ button to add 1000 credits (debug/cheat button) - positioned top right corner
    const creditButton = this.add.text(
      this.cameras.main.width - 20,
      25,
      '$',
      {
        fontFamily: 'Courier New',
        fontSize: '24px',
        color: '#ffdd00',
        fontStyle: 'bold',
      }
    ).setOrigin(1, 0.5).setInteractive({ useHandCursor: true })

    creditButton.on('pointerover', () => {
      creditButton.setColor('#ffff00')
      creditButton.setScale(1.2)
    })

    creditButton.on('pointerout', () => {
      creditButton.setColor('#ffdd00')
      creditButton.setScale(1)
    })

    creditButton.on('pointerdown', () => {
      soundManager.play(SoundType.BUTTON_CLICK)
      this.gameState.addCredits(1000)
      creditsText.setText(`${this.gameState.getCredits()} ¤`)
      // Flash effect
      this.tweens.add({
        targets: creditsText,
        scale: 1.3,
        duration: 100,
        yoyo: true,
        onComplete: () => {
          // Ensure text is correct after animation
          creditsText.setText(`${this.gameState.getCredits()} ¤`)

          // Update affordability indicators
          const upgradeDot = this.children.getByName('upgradeDot') as Phaser.GameObjects.Arc
          if (upgradeDot) {
            upgradeDot.setVisible(this.hasAffordableUpgrades())
          }

          const hangarDot = this.children.getByName('hangarDot') as Phaser.GameObjects.Arc
          if (hangarDot) {
            hangarDot.setVisible(this.hasAffordableShips())
          }
        }
      })
    })


    // Display currently selected ship
    const selectedCharType = this.gameState.getSelectedCharacter()
    const selectedCharConfig = CHARACTER_CONFIGS[selectedCharType]

    const shipDisplayY = 250 * scaleFactor
    const shipLabel = this.add.text(
      this.cameras.main.centerX,
      shipDisplayY - 45 * scaleFactor,
      'SELECTED SHIP',
      {
        fontFamily: 'Courier New',
        fontSize: `${Math.floor(14 * scaleFactor)}px`,
        color: '#888888',
      }
    ).setOrigin(0.5)

    const shipSymbol = this.add.text(
      this.cameras.main.centerX - 100 * scaleFactor,
      shipDisplayY + 10 * scaleFactor,
      selectedCharConfig.symbol,
      {
        fontFamily: 'Courier New',
        fontSize: `${Math.floor(96 * scaleFactor)}px`,
        color: selectedCharConfig.color,
      }
    ).setOrigin(0.5)

    const shipName = this.add.text(
      this.cameras.main.centerX + 20 * scaleFactor,
      shipDisplayY + 10 * scaleFactor,
      selectedCharConfig.name,
      {
        fontFamily: 'Courier New',
        fontSize: `${Math.floor(24 * scaleFactor)}px`,
        color: '#ffffff',
        fontStyle: 'bold',
      }
    ).setOrigin(0, 0.5)

    // Menu buttons - scale to fit screen
    const baseButtonWidth = 400
    const buttonWidth = Math.min(baseButtonWidth * scaleFactor, screenWidth - 40)
    const buttonHeight = 65 * scaleFactor  // Reduced from 80 to make buttons less tall
    const buttonSpacing = 18 * scaleFactor  // Slightly reduced spacing
    const startY = 380 * scaleFactor  // Moved up from 425

    // Campaign Button (1st position)
    const campaignButton = this.add.rectangle(
      this.cameras.main.centerX,
      startY,
      buttonWidth,
      buttonHeight,
      0x2a2a4a
    ).setInteractive({ useHandCursor: true })

    const campaignIcon = this.add.text(
      this.cameras.main.centerX - 150 * scaleFactor,
      startY,
      '►',
      {
        fontFamily: 'Courier New',
        fontSize: `${Math.floor(48 * scaleFactor)}px`,
        color: '#00ff00',
      }
    ).setOrigin(0.5)

    const campaignText = this.add.text(
      this.cameras.main.centerX + 20 * scaleFactor,
      startY,
      'CAMPAIGN',
      {
        fontFamily: 'Courier New',
        fontSize: `${Math.floor(24 * scaleFactor)}px`,
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
      soundManager.play(SoundType.BUTTON_CLICK)

      // If only 1 level is unlocked, skip level selection and start directly
      const unlockedLevels = this.gameState.getUnlockedLevels()
      if (unlockedLevels === 1) {
        // Fade out before transitioning
        this.cameras.main.fadeOut(200, 0, 0, 0)
        this.cameras.main.once('camerafadeoutcomplete', () => {
          this.scene.start('LoadingScene', { levelIndex: 0 })
        })
      } else {
        this.showLevelSelection()
      }
    })

    // Co-op Button (2nd position - moved up from 5th)
    const coopButtonY = startY + (buttonHeight + buttonSpacing)

    const coopButton = this.add.rectangle(
      this.cameras.main.centerX,
      coopButtonY,
      buttonWidth,
      buttonHeight,
      0x2a2a4a
    ).setInteractive({ useHandCursor: true })

    const coopIcon = this.add.text(
      this.cameras.main.centerX - 150 * scaleFactor,
      coopButtonY,
      '👥',
      {
        fontFamily: 'Courier New',
        fontSize: `${Math.floor(48 * scaleFactor)}px`,
        color: '#ff00ff',
      }
    ).setOrigin(0.5)

    const coopButtonText = this.add.text(
      this.cameras.main.centerX + 20 * scaleFactor,
      coopButtonY,
      'CO-OP',
      {
        fontFamily: 'Courier New',
        fontSize: `${Math.floor(24 * scaleFactor)}px`,
        color: '#ff00ff',
        align: 'center',
      }
    ).setOrigin(0.5)

    coopButton.on('pointerover', () => {
      coopButton.setFillStyle(0x3a3a6a)
    })

    coopButton.on('pointerout', () => {
      coopButton.setFillStyle(0x2a2a4a)
    })

    coopButton.on('pointerdown', () => {
      soundManager.play(SoundType.BUTTON_CLICK)
      // Show floating "Coming Soon" text
      const comingSoonText = this.add.text(
        this.cameras.main.centerX,
        coopButtonY,
        'Synchronous Co-op Coming Soon!',
        {
          fontFamily: 'Courier New',
          fontSize: `${Math.floor(18 * scaleFactor)}px`,
          color: '#ffff00',
          fontStyle: 'bold',
        }
      ).setOrigin(0.5).setDepth(1000)

      // Animate it floating up and fading out
      this.tweens.add({
        targets: comingSoonText,
        y: coopButtonY - 100 * scaleFactor,
        alpha: 0,
        duration: 2000,
        ease: 'Cubic.easeOut',
        onComplete: () => {
          comingSoonText.destroy()
        }
      })
    })

    // Build Button (3rd position - moved down from 2nd)
    const buildButton = this.add.rectangle(
      this.cameras.main.centerX,
      startY + (buttonHeight + buttonSpacing) * 2,
      buttonWidth,
      buttonHeight,
      0x2a2a4a
    ).setInteractive({ useHandCursor: true })

    const buildIcon = this.add.text(
      this.cameras.main.centerX - 150 * scaleFactor,
      startY + (buttonHeight + buttonSpacing) * 2,
      '⚙',
      {
        fontFamily: 'Courier New',
        fontSize: `${Math.floor(48 * scaleFactor)}px`,
        color: '#ffaa00',
      }
    ).setOrigin(0.5)

    const buildText = this.add.text(
      this.cameras.main.centerX + 20 * scaleFactor,
      startY + (buttonHeight + buttonSpacing) * 2,
      'UPGRADES',
      {
        fontFamily: 'Courier New',
        fontSize: `${Math.floor(24 * scaleFactor)}px`,
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
      soundManager.play(SoundType.BUTTON_CLICK)
      this.scene.start('BuildingMenuScene')
    })

    // Red dot indicator for affordableupgrades
    const buildButtonY = startY + (buttonHeight + buttonSpacing) * 2
    const upgradeDot = this.add.circle(
      this.cameras.main.centerX + buttonWidth / 2 - 10,
      buildButtonY - buttonHeight / 2 + 10,
      6,
      0xff0000
    ).setVisible(this.hasAffordableUpgrades())
    upgradeDot.setName('upgradeDot')

    // Hangar Button (4th position - moved down from 3rd)
    const hangarButton = this.add.rectangle(
      this.cameras.main.centerX,
      startY + (buttonHeight + buttonSpacing) * 3,
      buttonWidth,
      buttonHeight,
      0x2a2a4a
    ).setInteractive({ useHandCursor: true })

    const hangarIcon = this.add.text(
      this.cameras.main.centerX - 150 * scaleFactor,
      startY + (buttonHeight + buttonSpacing) * 3,
      '◈',
      {
        fontFamily: 'Courier New',
        fontSize: `${Math.floor(48 * scaleFactor)}px`,
        color: '#00ffff',
      }
    ).setOrigin(0.5)

    const hangarText = this.add.text(
      this.cameras.main.centerX + 20 * scaleFactor,
      startY + (buttonHeight + buttonSpacing) * 3,
      'HANGAR',
      {
        fontFamily: 'Courier New',
        fontSize: `${Math.floor(24 * scaleFactor)}px`,
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
      soundManager.play(SoundType.BUTTON_CLICK)
      this.scene.start('HangarScene')
    })

    // Red dot indicator for affordable ships
    const hangarButtonY = startY + (buttonHeight + buttonSpacing) * 3
    const hangarDot = this.add.circle(
      this.cameras.main.centerX + buttonWidth / 2 - 10,
      hangarButtonY - buttonHeight / 2 + 10,
      6,
      0xff0000
    ).setVisible(this.hasAffordableShips())
    hangarDot.setName('hangarDot')

    // Stats Button (5th position - moved down from 4th)
    const statsButtonY = startY + (buttonHeight + buttonSpacing) * 4

    const statsButton = this.add.rectangle(
      this.cameras.main.centerX,
      statsButtonY,
      buttonWidth,
      buttonHeight,
      0x2a2a4a
    ).setInteractive({ useHandCursor: true })

    const statsIcon = this.add.text(
      this.cameras.main.centerX - 150 * scaleFactor,
      statsButtonY,
      'ℹ',
      {
        fontFamily: 'Courier New',
        fontSize: `${Math.floor(48 * scaleFactor)}px`,
        color: '#ffffff',
      }
    ).setOrigin(0.5)

    const statsButtonText = this.add.text(
      this.cameras.main.centerX + 20 * scaleFactor,
      statsButtonY,
      'INFORMATION',
      {
        fontFamily: 'Courier New',
        fontSize: `${Math.floor(24 * scaleFactor)}px`,
        color: '#ffffff',
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
      soundManager.play(SoundType.BUTTON_CLICK)
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
      soundManager.play(SoundType.BUTTON_CLICK)
      if (confirm('Are you sure you want to reset all progress? This cannot be undone!')) {
        console.log('Resetting game save...')
        // Clear all localStorage data
        localStorage.removeItem('roguecraft_gamestate')
        localStorage.removeItem('roguecraft_highscore')
        localStorage.removeItem('roguecraft_progression') // Clear ship unlocks and purchases
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
        // Start at random Y position to spread out stars evenly
        const y = Phaser.Math.Between(-this.cameras.main.height, this.cameras.main.height)

        const alpha = layer.brightness
        const star = this.add.circle(x, y, layer.size, 0xffffff, alpha)

        // Calculate how far this star needs to travel
        const distanceToBottom = this.cameras.main.height + 10 - y
        const baseDuration = (distanceToBottom / layer.speed) * 1000

        // Animate star scrolling downward
        this.tweens.add({
          targets: star,
          y: this.cameras.main.height + 10,
          duration: baseDuration,
          repeat: -1,
          onRepeat: () => {
            // Reset to top with new random X position
            star.x = Phaser.Math.Between(0, this.cameras.main.width)
            star.y = -10

            // Recalculate duration for consistent speed
            const newDistance = this.cameras.main.height + 20
            const newDuration = (newDistance / layer.speed) * 1000

            // Update the tween duration for next loop
            const tween = this.tweens.getTweensOf(star)[0]
            if (tween) {
              tween.duration = newDuration
            }
          }
        })
      }
    })
  }

  private showLevelSelection() {
    if (this.isLevelSelectionOpen) return
    this.isLevelSelectionOpen = true

    const centerX = this.cameras.main.centerX
    const centerY = this.cameras.main.centerY

    // Create overlay container
    this.levelSelectionOverlay = this.add.container(0, 0)

    // Semi-transparent background
    const bgOverlay = this.add.rectangle(
      0, 0,
      this.cameras.main.width,
      this.cameras.main.height,
      0x000000,
      0.85
    ).setOrigin(0, 0).setInteractive()

    // Prevent clicks from passing through
    bgOverlay.on('pointerdown', () => {
      this.closeLevelSelection()
    })

    // Level selection panel
    const panelWidth = 500
    const panelHeight = 600
    const panel = this.add.rectangle(
      centerX, centerY,
      panelWidth, panelHeight,
      0x1a1a2e
    ).setStrokeStyle(2, 0x00ffff)

    // Title
    const title = this.add.text(
      centerX, centerY - panelHeight / 2 + 40,
      'SELECT MISSION',
      {
        fontFamily: 'Courier New',
        fontSize: '32px',
        color: '#00ffff',
        fontStyle: 'bold',
      }
    ).setOrigin(0.5)

    // Close button
    const closeButton = this.add.text(
      centerX + panelWidth / 2 - 40,
      centerY - panelHeight / 2 + 40,
      'X',
      {
        fontFamily: 'Courier New',
        fontSize: '28px',
        color: '#ff6666',
        fontStyle: 'bold',
      }
    ).setOrigin(0.5).setInteractive({ useHandCursor: true })

    closeButton.on('pointerover', () => {
      closeButton.setColor('#ff0000')
      closeButton.setScale(1.2)
    })

    closeButton.on('pointerout', () => {
      closeButton.setColor('#ff6666')
      closeButton.setScale(1)
    })

    closeButton.on('pointerdown', () => {
      soundManager.play(SoundType.BUTTON_CLICK)
      this.closeLevelSelection()
    })

    // Add all elements to container
    this.levelSelectionOverlay.add([bgOverlay, panel, title, closeButton])

    // Create level list
    const unlockedLevels = this.gameState.getUnlockedLevels()
    const levelStartY = centerY - panelHeight / 2 + 100
    const levelHeight = 45
    const levelSpacing = 2

    CAMPAIGN_LEVELS.forEach((level, index) => {
      const yPos = levelStartY + (levelHeight + levelSpacing) * index
      const isUnlocked = this.gameState.isLevelUnlocked(index)

      // Level container
      const levelBg = this.add.rectangle(
        centerX, yPos,
        panelWidth - 60, levelHeight,
        isUnlocked ? 0x2a2a4a : 0x1a1a2a
      )

      if (isUnlocked) {
        levelBg.setInteractive({ useHandCursor: true })

        levelBg.on('pointerover', () => {
          levelBg.setFillStyle(0x3a3a6a)
        })

        levelBg.on('pointerout', () => {
          levelBg.setFillStyle(0x2a2a4a)
        })

        levelBg.on('pointerdown', () => {
          soundManager.play(SoundType.BUTTON_CLICK)
          this.closeLevelSelection()

          // Fade out before transitioning
          this.cameras.main.fadeOut(200, 0, 0, 0)
          this.cameras.main.once('camerafadeoutcomplete', () => {
            this.scene.start('LoadingScene', { levelIndex: index })
          })
        })
      }

      // Level number and name
      const levelName = this.add.text(
        centerX - (panelWidth - 60) / 2 + 15,
        yPos,
        `${index + 1}. ${level.name}`,
        {
          fontFamily: 'Courier New',
          fontSize: '18px',
          color: isUnlocked ? '#00ff00' : '#666666',
          fontStyle: 'bold',
        }
      ).setOrigin(0, 0.5)

      // Difficulty indicator
      const difficultyText = this.add.text(
        centerX + (panelWidth - 60) / 2 - 15,
        yPos - 8,
        isUnlocked ? `Difficulty: ${level.difficulty.toFixed(1)}x` : '🔒',
        {
          fontFamily: 'Courier New',
          fontSize: '13px',
          color: isUnlocked ? '#ffaa00' : '#666666',
        }
      ).setOrigin(1, 0.5)

      // High score display (below level name on the right)
      const highScore = this.gameState.getLevelHighScore(index)
      const highScoreText = this.add.text(
        centerX + (panelWidth - 60) / 2 - 15,
        yPos + 8,
        isUnlocked && highScore > 0 ? `High Score: ${highScore}` : (isUnlocked ? 'No score yet' : ''),
        {
          fontFamily: 'Courier New',
          fontSize: '13px',
          color: highScore > 0 ? '#ffff00' : '#666666',
        }
      ).setOrigin(1, 0.5)

      this.levelSelectionOverlay!.add([levelBg, levelName, difficultyText, highScoreText])
    })

    // Set depth to be on top
    this.levelSelectionOverlay.setDepth(1000)
  }

  private closeLevelSelection() {
    if (this.levelSelectionOverlay) {
      this.levelSelectionOverlay.destroy()
      this.levelSelectionOverlay = undefined
      this.isLevelSelectionOpen = false
    }
  }

  private hasAffordableUpgrades(): boolean {
    const credits = this.gameState.getCredits()
    const buildings = this.gameState.getAllBuildings()

    // Check if any building can be upgraded and is affordable
    return buildings.some(building => {
      if (!building.canUpgrade()) return false
      const cost = building.getUpgradeCost()
      return cost > 0 && credits >= cost
    })
  }

  private hasAffordableShips(): boolean {
    const credits = this.gameState.getCredits()
    const SHIP_COST = 250
    const unlockedCharacters = this.gameState.getUnlockedCharacters()

    // Count total characters available
    const totalCharacters = Object.keys(CHARACTER_CONFIGS).length

    // If not all characters are unlocked and player can afford one, return true
    return unlockedCharacters.length < totalCharacters && credits >= SHIP_COST
  }
}
