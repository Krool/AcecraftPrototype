import Phaser from 'phaser'
import { GameState } from '../game/GameState'
import { CharacterType, CHARACTER_CONFIGS } from '../game/Character'
import { WEAPON_CONFIGS } from '../game/Weapon'

export default class HangarScene extends Phaser.Scene {
  private gameState!: GameState
  private selectedCharacter!: CharacterType

  constructor() {
    super('HangarScene')
  }

  create() {
    this.gameState = GameState.getInstance()
    this.selectedCharacter = this.gameState.getSelectedCharacter()

    // Add background
    this.add.rectangle(0, 0, this.cameras.main.width, this.cameras.main.height, 0x0a0a1e)
      .setOrigin(0, 0)

    // Title
    const title = this.add.text(
      this.cameras.main.centerX,
      30,
      'HANGAR',
      {
        fontFamily: 'Courier New',
        fontSize: '40px',
        color: '#00ffff',
        fontStyle: 'bold',
      }
    ).setOrigin(0.5)

    // Subtitle
    const subtitle = this.add.text(
      this.cameras.main.centerX,
      75,
      'Select Your Ship',
      {
        fontFamily: 'Courier New',
        fontSize: '18px',
        color: '#aaaaaa',
      }
    ).setOrigin(0.5)

    // Back button
    const backButton = this.add.text(
      20,
      20,
      '← Back',
      {
        fontFamily: 'Courier New',
        fontSize: '20px',
        color: '#00ffff',
      }
    ).setInteractive({ useHandCursor: true })

    backButton.on('pointerover', () => {
      backButton.setColor('#00ff00')
    })

    backButton.on('pointerout', () => {
      backButton.setColor('#00ffff')
    })

    backButton.on('pointerdown', () => {
      this.scene.start('MainMenuScene')
    })

    // Create character grid (3 columns x 4 rows)
    this.createCharacterGrid()
  }

  private createCharacterGrid() {
    const characters = Object.values(CharacterType)
    const unlockedCharacters = this.gameState.getUnlockedCharacters()
    console.log('HangarScene - Unlocked characters:', unlockedCharacters)

    const cardWidth = 160
    const cardHeight = 220
    const padding = 10
    const columns = 3
    const startX = (this.cameras.main.width - (cardWidth * columns + padding * (columns - 1))) / 2
    const startY = 110

    characters.forEach((type, index) => {
      const row = Math.floor(index / columns)
      const col = index % columns
      const x = startX + col * (cardWidth + padding)
      const y = startY + row * (cardHeight + padding)

      this.createCharacterCard(type, x, y, cardWidth, cardHeight)
    })
  }

  private createCharacterCard(type: CharacterType, x: number, y: number, width: number, height: number) {
    const config = CHARACTER_CONFIGS[type]
    const unlockedCharacters = this.gameState.getUnlockedCharacters()
    const isUnlocked = unlockedCharacters.includes(type)
    const isSelected = this.selectedCharacter === type

    const container = this.add.container(x, y)

    // Card background
    let bgColor = 0x1a1a2a // Locked
    if (isSelected) {
      bgColor = 0x3a5a3a // Selected (green tint)
    } else if (isUnlocked) {
      bgColor = 0x2a2a4a // Unlocked
    }

    const bg = this.add.rectangle(
      0, 0,
      width, height,
      bgColor
    ).setOrigin(0, 0)

    container.add(bg)

    // Selection indicator border
    if (isSelected) {
      const border = this.add.rectangle(
        0, 0,
        width, height
      ).setOrigin(0, 0).setStrokeStyle(3, 0x00ff00)

      container.add(border)
    }

    // Character symbol (large icon)
    const symbolText = this.add.text(
      width / 2, 30,
      config.symbol,
      {
        fontFamily: 'Courier New',
        fontSize: '48px',
        color: isUnlocked ? config.color : '#555555',
      }
    ).setOrigin(0.5)

    container.add(symbolText)

    // Character name
    const nameText = this.add.text(
      width / 2, 80,
      config.name,
      {
        fontFamily: 'Courier New',
        fontSize: '16px',
        color: isUnlocked ? '#ffffff' : '#888888',
        fontStyle: 'bold',
      }
    ).setOrigin(0.5)

    container.add(nameText)

    // Starting weapon info
    const weaponConfig = WEAPON_CONFIGS[config.startingWeapon]
    const weaponText = this.add.text(
      width / 2, 100,
      `${weaponConfig.icon} ${weaponConfig.name}`,
      {
        fontFamily: 'Courier New',
        fontSize: '11px',
        color: isUnlocked ? '#ffaa00' : '#666666',
      }
    ).setOrigin(0.5)

    container.add(weaponText)

    // Stats
    const statsText = this.add.text(
      10, 120,
      `HP: ${config.baseHealth}\nSpd: ${config.baseMoveSpeed}\nW/P: ${config.weaponSlots}/${config.passiveSlots}`,
      {
        fontFamily: 'Courier New',
        fontSize: '11px',
        color: isUnlocked ? '#aaaaaa' : '#555555',
      }
    ).setOrigin(0, 0)

    container.add(statsText)

    // Innate ability (truncated)
    const abilityText = this.add.text(
      width / 2, height - 25,
      this.truncateText(config.innateAbility, 20),
      {
        fontFamily: 'Courier New',
        fontSize: '10px',
        color: isUnlocked ? '#00ffaa' : '#555555',
        align: 'center',
        wordWrap: { width: width - 10 }
      }
    ).setOrigin(0.5)

    container.add(abilityText)

    // Lock indicator
    if (!isUnlocked) {
      const lockText = this.add.text(
        width / 2, height - 5,
        '🔒 LOCKED',
        {
          fontFamily: 'Courier New',
          fontSize: '12px',
          color: '#ff0000',
        }
      ).setOrigin(0.5, 1)

      container.add(lockText)
    }

    // Make interactive if unlocked
    if (isUnlocked) {
      bg.setInteractive({ useHandCursor: true })

      bg.on('pointerover', () => {
        if (!isSelected) {
          bg.setFillStyle(0x3a3a6a)
        }
      })

      bg.on('pointerout', () => {
        if (!isSelected) {
          bg.setFillStyle(0x2a2a4a)
        }
      })

      bg.on('pointerdown', () => {
        // Select this character
        if (this.gameState.selectCharacter(type)) {
          this.selectedCharacter = type
          // Refresh the grid
          this.scene.restart()
        }
      })
    }
  }

  private truncateText(text: string, maxLength: number): string {
    if (text.length <= maxLength) return text
    return text.substring(0, maxLength - 3) + '...'
  }
}
