import Phaser from 'phaser'
import { GameState } from '../game/GameState'
import { Building, BuildingType } from '../game/Building'

export default class BuildingMenuScene extends Phaser.Scene {
  private gameState!: GameState
  private creditsText!: Phaser.GameObjects.Text
  private buildingCards: Phaser.GameObjects.Container[] = []

  constructor() {
    super('BuildingMenuScene')
  }

  create() {
    this.gameState = GameState.getInstance()

    // Add background
    this.add.rectangle(0, 0, this.cameras.main.width, this.cameras.main.height, 0x0a0a1e)
      .setOrigin(0, 0)

    // Title
    const title = this.add.text(
      this.cameras.main.centerX,
      30,
      'BUILDINGS',
      {
        fontFamily: 'Courier New',
        fontSize: '40px',
        color: '#ffaa00',
        fontStyle: 'bold',
      }
    ).setOrigin(0.5)

    // Credits display
    this.creditsText = this.add.text(
      this.cameras.main.centerX,
      80,
      `Credits: ${this.gameState.getCredits()} ¤`,
      {
        fontFamily: 'Courier New',
        fontSize: '20px',
        color: '#ffdd00',
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

    // Create building cards
    this.createBuildingCards()
  }

  private createBuildingCards() {
    const buildings = this.gameState.getAllBuildings()
    const cardWidth = 240
    const cardHeight = 160
    const padding = 10
    const cardsPerRow = 2
    const startX = (this.cameras.main.width - (cardWidth * cardsPerRow + padding * (cardsPerRow - 1))) / 2
    const startY = 120

    buildings.forEach((building, index) => {
      const row = Math.floor(index / cardsPerRow)
      const col = index % cardsPerRow
      const x = startX + col * (cardWidth + padding)
      const y = startY + row * (cardHeight + padding)

      this.createBuildingCard(building, x, y, cardWidth, cardHeight)
    })
  }

  private createBuildingCard(building: Building, x: number, y: number, width: number, height: number) {
    const container = this.add.container(x, y)
    const config = building.getConfig()
    const isUnlocked = building.isUnlocked()
    const level = building.getLevel()
    const canUpgrade = building.canUpgrade()
    const upgradeCost = building.getUpgradeCost()

    // Card background
    const bg = this.add.rectangle(
      0, 0,
      width, height,
      isUnlocked ? 0x2a2a4a : 0x1a1a2a
    ).setOrigin(0, 0)

    container.add(bg)

    // Icon
    const icon = this.add.text(
      20, 20,
      config.icon,
      {
        fontFamily: 'Courier New',
        fontSize: '40px',
        color: isUnlocked ? '#ffaa00' : '#555555',
      }
    ).setOrigin(0, 0)

    container.add(icon)

    // Name
    const nameText = this.add.text(
      80, 20,
      config.name,
      {
        fontFamily: 'Courier New',
        fontSize: '18px',
        color: isUnlocked ? '#ffffff' : '#888888',
        fontStyle: 'bold',
      }
    ).setOrigin(0, 0)

    container.add(nameText)

    // Level
    const levelText = this.add.text(
      80, 45,
      isUnlocked ? `Level ${level}/${config.maxLevel}` : 'LOCKED',
      {
        fontFamily: 'Courier New',
        fontSize: '14px',
        color: isUnlocked ? '#00ffff' : '#555555',
      }
    ).setOrigin(0, 0)

    container.add(levelText)

    // Description
    const descText = this.add.text(
      20, 75,
      config.description,
      {
        fontFamily: 'Courier New',
        fontSize: '12px',
        color: '#aaaaaa',
        wordWrap: { width: width - 40 },
      }
    ).setOrigin(0, 0)

    container.add(descText)

    // Upgrade button (if can upgrade)
    if (canUpgrade) {
      const buttonBg = this.add.rectangle(
        width / 2, height - 25,
        width - 40, 40,
        0x4a4a6a
      ).setInteractive({ useHandCursor: true })

      const buttonText = this.add.text(
        width / 2, height - 25,
        `Upgrade - ${upgradeCost} ¤`,
        {
          fontFamily: 'Courier New',
          fontSize: '14px',
          color: this.gameState.getCredits() >= upgradeCost ? '#00ff00' : '#ff0000',
          fontStyle: 'bold',
        }
      ).setOrigin(0.5)

      container.add(buttonBg)
      container.add(buttonText)

      buttonBg.on('pointerover', () => {
        buttonBg.setFillStyle(0x5a5a7a)
      })

      buttonBg.on('pointerout', () => {
        buttonBg.setFillStyle(0x4a4a6a)
      })

      buttonBg.on('pointerdown', () => {
        if (this.gameState.upgradeBuilding(config.type)) {
          // Refresh the display
          this.buildingCards.forEach(card => card.destroy())
          this.buildingCards = []
          this.createBuildingCards()
          this.creditsText.setText(`Credits: ${this.gameState.getCredits()} ¤`)
        }
      })
    } else if (!isUnlocked) {
      // Show required hangar level
      const requiredLevel = building.getRequiredHangarLevel()
      const currentHangarLevel = this.gameState.getHangarLevel()
      const canUnlock = building.canUnlock(currentHangarLevel)

      const lockedText = this.add.text(
        width / 2, height - 25,
        canUnlock ? `Requires Hangar Lv.${requiredLevel} ✓` : `Requires Hangar Lv.${requiredLevel}`,
        {
          fontFamily: 'Courier New',
          fontSize: '12px',
          color: canUnlock ? '#00ff00' : '#888888',
        }
      ).setOrigin(0.5)

      container.add(lockedText)

      // If can unlock, make it interactive
      if (canUnlock) {
        bg.setInteractive({ useHandCursor: true })

        bg.on('pointerover', () => {
          bg.setFillStyle(0x2a2a3a)
        })

        bg.on('pointerout', () => {
          bg.setFillStyle(0x1a1a2a)
        })

        bg.on('pointerdown', () => {
          if (this.gameState.unlockBuilding(config.type)) {
            // Refresh the display
            this.buildingCards.forEach(card => card.destroy())
            this.buildingCards = []
            this.createBuildingCards()
            this.creditsText.setText(`Credits: ${this.gameState.getCredits()} ¤`)
          }
        })
      }
    } else if (level >= config.maxLevel) {
      // Max level
      const maxText = this.add.text(
        width / 2, height - 25,
        'MAX LEVEL',
        {
          fontFamily: 'Courier New',
          fontSize: '14px',
          color: '#00ff00',
          fontStyle: 'bold',
        }
      ).setOrigin(0.5)

      container.add(maxText)
    }

    this.buildingCards.push(container)
  }
}
