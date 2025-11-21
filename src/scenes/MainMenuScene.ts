import Phaser from 'phaser'
import { GameState } from '../game/GameState'
import { BuildingType } from '../game/Building'
import { CAMPAIGN_LEVELS } from '../game/Campaign'
import { soundManager, SoundType } from '../game/SoundManager'
import { CHARACTER_CONFIGS, CharacterType } from '../game/Character'
import { gameProgression } from '../game/GameProgression'
import { partySystem, PartyState } from '../systems/PartySystem'

// Default 3-character names - real words, clever arrangements
const DEFAULT_NAMES = [
  'ACE', 'MAX', 'REX', 'SKY', 'JET', 'ZAP', 'NEO', 'RAY', 'KAI', 'ZEN',
  'ASH', 'FOX', 'OWL', 'BEE', 'ELF', 'GEM', 'ICE', 'OAK', 'SUN', 'VIP',
  'AXE', 'BOW', 'CAP', 'DOC', 'EGO', 'FLY', 'GUN', 'HEX', 'INK', 'JAM',
  'KEY', 'LUX', 'MOB', 'NUT', 'ORB', 'POP', 'QUE', 'RIP', 'SLY', 'TOP',
  'URN', 'VEX', 'WAX', 'YAK', 'ZIT', 'APE', 'BAT', 'COW', 'DOG', 'EMU',
  'PRO', 'MVP', 'CPU', 'RAM', 'USB', 'LED', 'LCD', 'GPS', 'VHS', 'DVD',
  'WIZ', 'SPY', 'COP', 'DUO', 'TRI', 'UNO', 'DOS', 'SIX', 'TEN', 'NIL',
  'YEP', 'NAH', 'MEH', 'OOF', 'LOL', 'WOW', 'YAY', 'BOO', 'EEK', 'AWW',
  'RED', 'BLU', 'GRN', 'YEL', 'PNK', 'GLD', 'SLV', 'BLK', 'WHT', 'TAN',
  'HOT', 'ICY', 'WET', 'DRY', 'BIG', 'LIL', 'OLD', 'NEW', 'RAW', 'FIT'
]

export default class MainMenuScene extends Phaser.Scene {
  private gameState!: GameState
  private levelSelectionOverlay?: Phaser.GameObjects.Container
  private isLevelSelectionOpen: boolean = false
  private partyContainer?: Phaser.GameObjects.Container
  private partySlots: Phaser.GameObjects.Container[] = []
  private inviteCodeText?: Phaser.GameObjects.Text
  private partyStatusText?: Phaser.GameObjects.Text
  private joinOverlay?: Phaser.GameObjects.Container
  private joinInput: string = ''
  private nameOverlay?: Phaser.GameObjects.Container
  private nameInput: string = ''
  private playerName: string = ''

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

    // Create individual letters for rainbow flowing effect
    const letterSpacing = titleFontSize * 0.6 // Spacing between letters
    const totalWidth = letterSpacing * (titleText.length - 1)
    const startX = this.cameras.main.centerX - totalWidth / 2

    const titleLetters: Phaser.GameObjects.Text[] = []
    for (let i = 0; i < titleText.length; i++) {
      const letter = this.add.text(
        startX + i * letterSpacing,
        titleY,
        titleText[i],
        {
          fontFamily: 'Courier New',
          fontSize: `${titleFontSize}px`,
          color: '#ffffff',
          fontStyle: 'bold',
        }
      ).setOrigin(0.5).setDepth(100)

      titleLetters.push(letter)
    }

    // Flowing rainbow animation - each letter cycles through rainbow with offset
    this.tweens.add({
      targets: {},
      duration: 3000,
      repeat: -1,
      yoyo: false,
      onUpdate: (tween) => {
        const time = tween.progress
        titleLetters.forEach((letter, index) => {
          // Offset each letter's hue based on its position
          const hueOffset = (index / titleText.length) * 360
          const hue = ((time * 360) + hueOffset) % 360
          const color = Phaser.Display.Color.HSVToRGB(hue / 360, 0.9, 1) as Phaser.Types.Display.ColorObject
          letter.setColor(Phaser.Display.Color.RGBToString(color.r, color.g, color.b))
        })
      }
    })

    // Display credits - moved left to make room for $ button
    const creditsText = this.add.text(
      this.cameras.main.width - 60,
      25,
      `${gameProgression.getCredits()} ¤`,
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
      gameProgression.addCredits(1000)
      creditsText.setText(`${gameProgression.getCredits()} ¤`)
      // Flash effect
      this.tweens.add({
        targets: creditsText,
        scale: 1.3,
        duration: 100,
        yoyo: true,
        onComplete: () => {
          // Ensure text is correct after animation
          creditsText.setText(`${gameProgression.getCredits()} ¤`)

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
    ).setOrigin(0.5).setInteractive({ useHandCursor: true })

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
    ).setOrigin(0, 0.5).setInteractive({ useHandCursor: true })

    // Make ship clickable to open hangar
    const openHangar = () => {
      soundManager.play(SoundType.BUTTON_CLICK)
      this.scene.start('HangarScene')
    }

    shipSymbol.on('pointerover', () => {
      shipSymbol.setScale(1.1)
      shipName.setColor('#00ff00')
    })

    shipSymbol.on('pointerout', () => {
      shipSymbol.setScale(1)
      shipName.setColor('#ffffff')
    })

    shipSymbol.on('pointerdown', openHangar)

    shipName.on('pointerover', () => {
      shipSymbol.setScale(1.1)
      shipName.setColor('#00ff00')
    })

    shipName.on('pointerout', () => {
      shipSymbol.setScale(1)
      shipName.setColor('#ffffff')
    })

    shipName.on('pointerdown', openHangar)

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
    ).setInteractive({ useHandCursor: true }).setName('campaignButton')

    const campaignIcon = this.add.text(
      this.cameras.main.centerX - 150 * scaleFactor,
      startY,
      '►',
      {
        fontFamily: 'Courier New',
        fontSize: `${Math.floor(48 * scaleFactor)}px`,
        color: '#00ff00',
      }
    ).setOrigin(0.5).setName('campaignIcon')

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
    ).setOrigin(0.5).setName('campaignText')

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
        this.launchGame(0)
      } else {
        this.showLevelSelection()
      }
    })

    // Build Button (2nd position)
    const buildButton = this.add.rectangle(
      this.cameras.main.centerX,
      startY + (buttonHeight + buttonSpacing),
      buttonWidth,
      buttonHeight,
      0x2a2a4a
    ).setInteractive({ useHandCursor: true })

    const buildIcon = this.add.text(
      this.cameras.main.centerX - 150 * scaleFactor,
      startY + (buttonHeight + buttonSpacing),
      '⚙',
      {
        fontFamily: 'Courier New',
        fontSize: `${Math.floor(48 * scaleFactor)}px`,
        color: '#ffaa00',
      }
    ).setOrigin(0.5)

    const buildText = this.add.text(
      this.cameras.main.centerX + 20 * scaleFactor,
      startY + (buttonHeight + buttonSpacing),
      'RESEARCH',
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

    // Red dot indicator for affordable upgrades
    const buildButtonY = startY + (buttonHeight + buttonSpacing)
    const upgradeDot = this.add.circle(
      this.cameras.main.centerX + buttonWidth / 2 - 10,
      buildButtonY - buttonHeight / 2 + 10,
      6,
      0xff0000
    ).setVisible(this.hasAffordableUpgrades())
    upgradeDot.setName('upgradeDot')

    // Hangar Button (3rd position)
    const hangarButton = this.add.rectangle(
      this.cameras.main.centerX,
      startY + (buttonHeight + buttonSpacing) * 2,
      buttonWidth,
      buttonHeight,
      0x2a2a4a
    ).setInteractive({ useHandCursor: true })

    const hangarIcon = this.add.text(
      this.cameras.main.centerX - 150 * scaleFactor,
      startY + (buttonHeight + buttonSpacing) * 2,
      '◈',
      {
        fontFamily: 'Courier New',
        fontSize: `${Math.floor(48 * scaleFactor)}px`,
        color: '#00ffff',
      }
    ).setOrigin(0.5)

    const hangarText = this.add.text(
      this.cameras.main.centerX + 20 * scaleFactor,
      startY + (buttonHeight + buttonSpacing) * 2,
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
    const hangarButtonY = startY + (buttonHeight + buttonSpacing) * 2
    const hangarDot = this.add.circle(
      this.cameras.main.centerX + buttonWidth / 2 - 10,
      hangarButtonY - buttonHeight / 2 + 10,
      6,
      0xff0000
    ).setVisible(this.hasAffordableShips())
    hangarDot.setName('hangarDot')

    // Stats Button (4th position)
    const statsButtonY = startY + (buttonHeight + buttonSpacing) * 3

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

    // Party Panel
    this.createPartyPanel(scaleFactor)

    // Setup party event handlers
    partySystem.on('partyUpdated', (state: PartyState) => {
      this.updatePartyUI(state)
    })

    partySystem.on('gameStart', () => {
      this.startCoopGame()
    })

    partySystem.on('disconnected', () => {
      // When disconnected (host left), automatically re-host
      this.autoHostParty()
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
          this.launchGame(index)
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
    const credits = gameProgression.getCredits()
    const SHIP_COST = 250
    const unlockedCharacters = this.gameState.getUnlockedCharacters()

    // Count total characters available
    const totalCharacters = Object.keys(CHARACTER_CONFIGS).length

    // If not all characters are unlocked and player can afford one, return true
    return unlockedCharacters.length < totalCharacters && credits >= SHIP_COST
  }

  private createPartyPanel(scaleFactor: number) {
    this.partyContainer = this.add.container(0, 0)

    // Clear old slots on scene restart
    this.partySlots = []

    // Slot sizes - 32% bigger than original (40 * 1.32 = 53)
    const slotSize = 53
    const slotSpacing = 11
    const margin = 8

    // Slots have origin 0.5, so offset by half size to position left/top edge at margin
    const slot1X = margin + slotSize / 2
    const slot1Y = margin + slotSize / 2

    // Create slot 1 (local player) - will have gold border
    const slot1 = this.createPartySlot(slot1X, slot1Y, slotSize, 0, scaleFactor * 1.32)
    this.partySlots.push(slot1)
    this.partyContainer.add(slot1)

    // Create slot 2 (partner) - positioned after slot 1
    const slot2X = slot1X + slotSize + slotSpacing
    const slot2 = this.createPartySlot(slot2X, slot1Y, slotSize, 1, scaleFactor * 1.32)
    this.partySlots.push(slot2)
    this.partyContainer.add(slot2)

    // Join button to the right of slots - 25% bigger than base
    const joinBtnX = slot2X + slotSize / 2 + 10
    const joinBtnY = slot1Y - 4

    const joinButton = this.add.text(joinBtnX, joinBtnY, 'JOIN', {
      fontFamily: 'Courier New',
      fontSize: `${Math.floor(20 * scaleFactor)}px`,
      color: '#00ffff',
      backgroundColor: '#1a1a2e',
      padding: { x: 15, y: 10 }
    }).setOrigin(0, 0.5).setInteractive({ useHandCursor: true })

    joinButton.on('pointerover', () => joinButton.setColor('#88ffff'))
    joinButton.on('pointerout', () => joinButton.setColor('#00ffff'))
    joinButton.on('pointerdown', () => {
      soundManager.play(SoundType.BUTTON_CLICK)
      this.showJoinOverlay()
    })
    this.partyContainer.add(joinButton)

    // Invite code below join button (no label, just 6 chars) - 25% bigger
    this.inviteCodeText = this.add.text(joinBtnX, joinBtnY + 32, '------', {
      fontFamily: 'Courier New',
      fontSize: `${Math.floor(18 * scaleFactor)}px`,
      color: '#888888',
    }).setOrigin(0, 0.5)
    this.partyContainer.add(this.inviteCodeText)

    // Auto-host on scene start
    this.autoHostParty()

    // Initialize UI with current state
    this.updatePartyUI(partySystem.getState())
  }

  private async autoHostParty() {
    // Automatically create a party when entering the menu
    if (!partySystem.isInParty()) {
      try {
        // Pick a random default name
        this.playerName = DEFAULT_NAMES[Math.floor(Math.random() * DEFAULT_NAMES.length)]
        await partySystem.hostParty(this.playerName)
      } catch (error) {
        console.error('Failed to auto-host party:', error)
      }
    }
  }

  private createPartySlot(x: number, y: number, size: number, slotIndex: number, scaleFactor: number): Phaser.GameObjects.Container {
    const container = this.add.container(x, y)

    // Slot background
    const bg = this.add.rectangle(0, 0, size, size, 0x2a2a4a)
      .setStrokeStyle(2, 0x444444)
      .setName('bg')
    container.add(bg)

    // Make slot 0 (player's slot) clickable for name editing
    if (slotIndex === 0) {
      bg.setInteractive({ useHandCursor: true })
      bg.on('pointerover', () => bg.setFillStyle(0x3a3a6a))
      bg.on('pointerout', () => bg.setFillStyle(0x2a2a4a))
      bg.on('pointerdown', () => {
        soundManager.play(SoundType.BUTTON_CLICK)
        this.showNameOverlay()
      })
    }

    // Ship icon (empty by default)
    const shipIcon = this.add.text(0, 0, '?', {
      fontFamily: 'Courier New',
      fontSize: `${Math.floor(24 * scaleFactor)}px`,
      color: '#444444',
    }).setOrigin(0.5).setName('shipIcon')
    container.add(shipIcon)

    // Player initials below slot (3 chars)
    const nameText = this.add.text(0, size / 2 + 8, '---', {
      fontFamily: 'Courier New',
      fontSize: `${Math.floor(10 * scaleFactor)}px`,
      color: '#666666',
    }).setOrigin(0.5).setName('nameText')
    container.add(nameText)

    return container
  }

  private updatePartyUI(state: PartyState) {
    if (!this.partyContainer) return

    // Update each slot
    state.slots.forEach((slot, index) => {
      const slotContainer = this.partySlots[index]
      if (!slotContainer) return

      const shipIcon = slotContainer.getByName('shipIcon') as Phaser.GameObjects.Text
      const nameText = slotContainer.getByName('nameText') as Phaser.GameObjects.Text
      const bg = slotContainer.getByName('bg') as Phaser.GameObjects.Rectangle

      if (slot.isEmpty) {
        shipIcon.setText('?')
        shipIcon.setColor('#444444')
        nameText.setText('---')
        nameText.setColor('#666666')
        bg.setStrokeStyle(2, 0x444444)
      } else {
        const charConfig = CHARACTER_CONFIGS[slot.character]
        shipIcon.setText(charConfig?.symbol || '?')
        shipIcon.setColor(charConfig?.color || '#ffffff')
        nameText.setText(slot.name)
        nameText.setColor('#ffffff')

        // Gold border for player's own slot, green for partner
        const isLocalPlayer = slot.peerId === partySystem.getState().slots[state.localSlotIndex]?.peerId &&
                              state.localSlotIndex === index
        if (isLocalPlayer) {
          bg.setStrokeStyle(3, 0xffaa00) // Gold border, thicker
        } else {
          bg.setStrokeStyle(2, 0x00ff00) // Green border for partner
        }
      }
    })

    // Update invite code display
    if (this.inviteCodeText) {
      if (state.isInParty && state.inviteCode) {
        this.inviteCodeText.setText(state.inviteCode)
        this.inviteCodeText.setColor('#00ffff')
      } else {
        this.inviteCodeText.setText('------')
        this.inviteCodeText.setColor('#888888')
      }
    }

    // Update campaign button state based on host/client
    this.updateCampaignButtonState()
  }

  private updateCampaignButtonState() {
    // Find campaign button and disable if client
    const campaignButton = this.children.getByName('campaignButton') as Phaser.GameObjects.Rectangle
    const campaignText = this.children.getByName('campaignText') as Phaser.GameObjects.Text
    const campaignIcon = this.children.getByName('campaignIcon') as Phaser.GameObjects.Text

    if (partySystem.isInParty() && !partySystem.isHost()) {
      // Client - disable campaign button
      if (campaignButton) {
        campaignButton.disableInteractive()
        campaignButton.setFillStyle(0x1a1a2a)
      }
      if (campaignText) {
        campaignText.setColor('#666666')
      }
      if (campaignIcon) {
        campaignIcon.setColor('#666666')
      }
    } else {
      // Host or solo - enable campaign button
      if (campaignButton) {
        campaignButton.setInteractive({ useHandCursor: true })
        campaignButton.setFillStyle(0x2a2a4a)
      }
      if (campaignText) {
        campaignText.setColor('#00ff00')
      }
      if (campaignIcon) {
        campaignIcon.setColor('#00ff00')
      }
    }
  }

  private showJoinOverlay() {
    if (this.joinOverlay) return

    this.joinInput = ''
    const centerX = this.cameras.main.centerX
    const centerY = this.cameras.main.centerY

    this.joinOverlay = this.add.container(0, 0).setDepth(1000)

    // Full screen background - interactive to block clicks to main menu
    const bg = this.add.rectangle(0, 0, this.cameras.main.width, this.cameras.main.height, 0x0a0a1e)
      .setOrigin(0, 0)
      .setInteractive()
    this.joinOverlay.add(bg)

    // Title
    const title = this.add.text(centerX, 100, 'JOIN PARTY', {
      fontFamily: 'Courier New',
      fontSize: '32px',
      color: '#00ffff',
      fontStyle: 'bold',
    }).setOrigin(0.5)
    this.joinOverlay.add(title)

    // Instructions
    const instructions = this.add.text(centerX, 180, 'Enter 6-digit invite code:', {
      fontFamily: 'Courier New',
      fontSize: '18px',
      color: '#888888',
    }).setOrigin(0.5)
    this.joinOverlay.add(instructions)

    // Input display - large and prominent
    const inputDisplay = this.add.text(centerX, 280, '______', {
      fontFamily: 'Courier New',
      fontSize: '48px',
      color: '#ffaa00',
      fontStyle: 'bold',
    }).setOrigin(0.5).setName('inputDisplay')
    this.joinOverlay.add(inputDisplay)

    // Status/error message
    const statusText = this.add.text(centerX, 360, '', {
      fontFamily: 'Courier New',
      fontSize: '16px',
      color: '#ff6666',
    }).setOrigin(0.5).setName('statusText')
    this.joinOverlay.add(statusText)

    // Cancel button
    const cancelBtn = this.add.rectangle(centerX, centerY + 150, 200, 50, 0x4a2a2a)
      .setStrokeStyle(2, 0xff6666)
      .setInteractive({ useHandCursor: true })
    this.joinOverlay.add(cancelBtn)

    const cancelText = this.add.text(centerX, centerY + 150, 'CANCEL', {
      fontFamily: 'Courier New',
      fontSize: '20px',
      color: '#ff6666',
    }).setOrigin(0.5)
    this.joinOverlay.add(cancelText)

    cancelBtn.on('pointerover', () => {
      cancelBtn.setFillStyle(0x6a3a3a)
      cancelText.setColor('#ff8888')
    })
    cancelBtn.on('pointerout', () => {
      cancelBtn.setFillStyle(0x4a2a2a)
      cancelText.setColor('#ff6666')
    })
    cancelBtn.on('pointerdown', () => {
      soundManager.play(SoundType.BUTTON_CLICK)
      this.closeJoinOverlay()
    })

    // Help text at bottom
    const helpText = this.add.text(centerX, this.cameras.main.height - 80, 'Press ESC to cancel', {
      fontFamily: 'Courier New',
      fontSize: '12px',
      color: '#666666',
    }).setOrigin(0.5)
    this.joinOverlay.add(helpText)

    // Keyboard input
    this.input.keyboard?.on('keydown', this.handleJoinKeyInput, this)
  }

  private handleJoinKeyInput(event: KeyboardEvent) {
    if (!this.joinOverlay) return

    const key = event.key.toUpperCase()

    if (key === 'ESCAPE') {
      this.closeJoinOverlay()
      return
    }

    if (key === 'BACKSPACE') {
      this.joinInput = this.joinInput.slice(0, -1)
      // Clear any error message when editing
      this.setJoinStatus('', '#888888')
    } else if (key.length === 1 && /[A-Z0-9]/.test(key) && this.joinInput.length < 6) {
      this.joinInput += key
      // Clear any error message when editing
      this.setJoinStatus('', '#888888')
    }

    // Update display
    const inputDisplay = this.joinOverlay.getByName('inputDisplay') as Phaser.GameObjects.Text
    if (inputDisplay) {
      inputDisplay.setText(this.joinInput.padEnd(6, '_'))
    }

    // Auto-submit when 6 characters entered
    if (this.joinInput.length === 6) {
      this.submitJoinCode()
    }
  }

  private setJoinStatus(message: string, color: string) {
    if (!this.joinOverlay) return
    const statusText = this.joinOverlay.getByName('statusText') as Phaser.GameObjects.Text
    if (statusText) {
      statusText.setText(message)
      statusText.setColor(color)
    }
  }

  private async submitJoinCode() {
    if (this.joinInput.length !== 6) return

    // Show connecting status
    this.setJoinStatus('Joining party...', '#ffaa00')

    // Save current party state in case join fails
    const wasInParty = partySystem.isInParty()
    const oldInviteCode = partySystem.getInviteCode()

    try {
      const playerName = 'PLR' // Placeholder - will be set properly later
      await partySystem.joinParty(this.joinInput, playerName)

      // Success - close overlay and update UI
      this.setJoinStatus('Connected!', '#00ff00')

      // Brief delay to show success message
      this.time.delayedCall(500, () => {
        this.closeJoinOverlay()
      })
    } catch (error) {
      console.error('Failed to join party:', error)

      // Show error message
      this.setJoinStatus('Failed to connect. Check code.', '#ff6666')

      // Clear input for retry
      this.joinInput = ''
      const inputDisplay = this.joinOverlay?.getByName('inputDisplay') as Phaser.GameObjects.Text
      if (inputDisplay) {
        inputDisplay.setText('______')
      }

      // If we were in a party before, re-host
      if (wasInParty) {
        try {
          await partySystem.hostParty('PLR')
        } catch (hostError) {
          console.error('Failed to re-host party:', hostError)
        }
      }
    }
  }

  private closeJoinOverlay() {
    if (this.joinOverlay) {
      this.input.keyboard?.off('keydown', this.handleJoinKeyInput, this)
      this.joinOverlay.destroy()
      this.joinOverlay = undefined
    }
  }

  private showNameOverlay() {
    if (this.nameOverlay) return

    this.nameInput = this.playerName
    const centerX = this.cameras.main.centerX
    const centerY = this.cameras.main.centerY

    this.nameOverlay = this.add.container(0, 0).setDepth(1000)

    // Full screen background - interactive to block clicks
    const bg = this.add.rectangle(0, 0, this.cameras.main.width, this.cameras.main.height, 0x0a0a1e, 0.95)
      .setOrigin(0, 0)
      .setInteractive()
    this.nameOverlay.add(bg)

    // Title
    const title = this.add.text(centerX, centerY - 100, 'SET NAME', {
      fontFamily: 'Courier New',
      fontSize: '32px',
      color: '#ffaa00',
      fontStyle: 'bold',
    }).setOrigin(0.5)
    this.nameOverlay.add(title)

    // Instructions
    const instructions = this.add.text(centerX, centerY - 50, 'Enter 3 characters:', {
      fontFamily: 'Courier New',
      fontSize: '16px',
      color: '#888888',
    }).setOrigin(0.5)
    this.nameOverlay.add(instructions)

    // Input display
    const inputDisplay = this.add.text(centerX, centerY + 20, this.nameInput.padEnd(3, '_'), {
      fontFamily: 'Courier New',
      fontSize: '64px',
      color: '#ffaa00',
      fontStyle: 'bold',
    }).setOrigin(0.5).setName('inputDisplay')
    this.nameOverlay.add(inputDisplay)

    // Buttons container
    const buttonY = centerY + 120

    // Random button
    const randomBtn = this.add.rectangle(centerX - 110, buttonY, 80, 40, 0x2a2a4a)
      .setStrokeStyle(2, 0xffaa00)
      .setInteractive({ useHandCursor: true })
    this.nameOverlay.add(randomBtn)

    const randomText = this.add.text(centerX - 110, buttonY, '🎲', {
      fontFamily: 'Courier New',
      fontSize: '20px',
      color: '#ffaa00',
    }).setOrigin(0.5)
    this.nameOverlay.add(randomText)

    randomBtn.on('pointerover', () => {
      randomBtn.setFillStyle(0x3a3a6a)
      randomText.setColor('#ffcc44')
    })
    randomBtn.on('pointerout', () => {
      randomBtn.setFillStyle(0x2a2a4a)
      randomText.setColor('#ffaa00')
    })
    randomBtn.on('pointerdown', () => {
      soundManager.play(SoundType.BUTTON_CLICK)
      this.nameInput = DEFAULT_NAMES[Math.floor(Math.random() * DEFAULT_NAMES.length)]
      const inputDisplay = this.nameOverlay?.getByName('inputDisplay') as Phaser.GameObjects.Text
      if (inputDisplay) {
        inputDisplay.setText(this.nameInput)
      }
    })

    // OK button
    const okBtn = this.add.rectangle(centerX, buttonY, 80, 40, 0x2a4a2a)
      .setStrokeStyle(2, 0x00ff00)
      .setInteractive({ useHandCursor: true })
    this.nameOverlay.add(okBtn)

    const okText = this.add.text(centerX, buttonY, 'OK', {
      fontFamily: 'Courier New',
      fontSize: '18px',
      color: '#00ff00',
    }).setOrigin(0.5)
    this.nameOverlay.add(okText)

    okBtn.on('pointerover', () => {
      okBtn.setFillStyle(0x3a6a3a)
      okText.setColor('#88ff88')
    })
    okBtn.on('pointerout', () => {
      okBtn.setFillStyle(0x2a4a2a)
      okText.setColor('#00ff00')
    })
    okBtn.on('pointerdown', () => {
      soundManager.play(SoundType.BUTTON_CLICK)
      this.submitName()
    })

    // Cancel button
    const cancelBtn = this.add.rectangle(centerX + 110, buttonY, 80, 40, 0x4a2a2a)
      .setStrokeStyle(2, 0xff6666)
      .setInteractive({ useHandCursor: true })
    this.nameOverlay.add(cancelBtn)

    const cancelText = this.add.text(centerX + 110, buttonY, 'X', {
      fontFamily: 'Courier New',
      fontSize: '18px',
      color: '#ff6666',
    }).setOrigin(0.5)
    this.nameOverlay.add(cancelText)

    cancelBtn.on('pointerover', () => {
      cancelBtn.setFillStyle(0x6a3a3a)
      cancelText.setColor('#ff8888')
    })
    cancelBtn.on('pointerout', () => {
      cancelBtn.setFillStyle(0x4a2a2a)
      cancelText.setColor('#ff6666')
    })
    cancelBtn.on('pointerdown', () => {
      soundManager.play(SoundType.BUTTON_CLICK)
      this.closeNameOverlay()
    })

    // Help text
    const helpText = this.add.text(centerX, this.cameras.main.height - 80, 'Press ENTER to confirm, ESC to cancel', {
      fontFamily: 'Courier New',
      fontSize: '12px',
      color: '#666666',
    }).setOrigin(0.5)
    this.nameOverlay.add(helpText)

    // Keyboard input
    this.input.keyboard?.on('keydown', this.handleNameKeyInput, this)
  }

  private handleNameKeyInput(event: KeyboardEvent) {
    if (!this.nameOverlay) return

    const key = event.key.toUpperCase()

    if (key === 'ESCAPE') {
      this.closeNameOverlay()
      return
    }

    if (key === 'ENTER') {
      this.submitName()
      return
    }

    if (key === 'BACKSPACE') {
      this.nameInput = this.nameInput.slice(0, -1)
    } else if (key.length === 1 && /[A-Z0-9]/.test(key) && this.nameInput.length < 3) {
      this.nameInput += key
    }

    // Update display
    const inputDisplay = this.nameOverlay.getByName('inputDisplay') as Phaser.GameObjects.Text
    if (inputDisplay) {
      inputDisplay.setText(this.nameInput.padEnd(3, '_'))
    }
  }

  private submitName() {
    if (this.nameInput.length === 0) return

    // Pad to 3 characters if needed
    this.playerName = this.nameInput.padEnd(3, '_').substring(0, 3)

    // Update party system with new name
    // For now, we need to re-host with the new name
    if (partySystem.isHost()) {
      partySystem.leaveParty()
      partySystem.hostParty(this.playerName).catch(err => {
        console.error('Failed to update name:', err)
      })
    }

    this.closeNameOverlay()
  }

  private closeNameOverlay() {
    if (this.nameOverlay) {
      this.input.keyboard?.off('keydown', this.handleNameKeyInput, this)
      this.nameOverlay.destroy()
      this.nameOverlay = undefined
    }
  }

  private launchGame(levelIndex: number) {
    // If host with partner, notify client
    if (partySystem.isInParty() && partySystem.isHost() && partySystem.getPlayerCount() >= 2) {
      partySystem.startGame()
    }

    // Store coop mode info in registry
    if (partySystem.isInParty() && partySystem.getPlayerCount() >= 2) {
      this.registry.set('isCoopMode', true)
      this.registry.set('partyState', partySystem.getState())
    } else {
      this.registry.set('isCoopMode', false)
    }

    // Fade out and start game
    this.cameras.main.fadeOut(200, 0, 0, 0)
    this.cameras.main.once('camerafadeoutcomplete', () => {
      this.scene.start('LoadingScene', { levelIndex })
    })
  }

  private startCoopGame() {
    // Called when client receives game start from host
    this.registry.set('isCoopMode', true)
    this.registry.set('partyState', partySystem.getState())

    // Fade out and start game
    this.cameras.main.fadeOut(200, 0, 0, 0)
    this.cameras.main.once('camerafadeoutcomplete', () => {
      this.scene.start('LoadingScene', { levelIndex: 0 })
    })
  }
}
