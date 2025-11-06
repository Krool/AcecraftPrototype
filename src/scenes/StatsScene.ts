import Phaser from 'phaser'
import { GameState, CharacterStats } from '../game/GameState'
import { CharacterType, CHARACTER_CONFIGS } from '../game/Character'

export default class StatsScene extends Phaser.Scene {
  private gameState!: GameState

  constructor() {
    super('StatsScene')
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
      'CHARACTER STATISTICS',
      {
        fontFamily: 'Courier New',
        fontSize: '40px',
        color: '#00ffff',
        fontStyle: 'bold',
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

    // Get all character stats
    const allStats = this.gameState.getAllCharacterStats()
    const unlockedCharacters = this.gameState.getUnlockedCharacters()

    // Find most selected character
    let mostSelected: CharacterType | null = null
    let maxSelections = 0
    allStats.forEach((stats, type) => {
      if (stats.timesSelected > maxSelections) {
        maxSelections = stats.timesSelected
        mostSelected = type
      }
    })

    // Display stats for each unlocked character
    const startY = 100
    const cardHeight = 160
    const cardSpacing = 10
    let currentY = startY

    unlockedCharacters.forEach(type => {
      this.createStatCard(type, currentY, type === mostSelected)
      currentY += cardHeight + cardSpacing
    })

    // If no unlocked characters have stats yet, show a message
    if (unlockedCharacters.length === 0 || allStats.size === 0) {
      this.add.text(
        this.cameras.main.centerX,
        this.cameras.main.centerY,
        'No statistics yet!\nComplete a mission to start tracking stats.',
        {
          fontFamily: 'Courier New',
          fontSize: '24px',
          color: '#888888',
          align: 'center',
        }
      ).setOrigin(0.5)
    }
  }

  private createStatCard(type: CharacterType, y: number, isMostSelected: boolean) {
    const config = CHARACTER_CONFIGS[type]
    const stats = this.gameState.getCharacterStats(type)

    const cardWidth = 700
    const cardHeight = 150
    const x = this.cameras.main.centerX - cardWidth / 2

    // Card background
    const bgColor = isMostSelected ? 0x2a4a2a : 0x1a1a3a
    const bg = this.add.rectangle(
      x,
      y,
      cardWidth,
      cardHeight,
      bgColor
    ).setOrigin(0, 0)

    // Border
    const borderColor = isMostSelected ? 0x00ff00 : 0x4a4a6a
    const border = this.add.rectangle(
      x,
      y,
      cardWidth,
      cardHeight
    ).setOrigin(0, 0).setStrokeStyle(2, borderColor)

    // Character symbol and name
    const symbol = this.add.text(
      x + 20,
      y + cardHeight / 2,
      config.symbol,
      {
        fontFamily: 'Courier New',
        fontSize: '64px',
        color: config.color,
      }
    ).setOrigin(0, 0.5)

    const name = this.add.text(
      x + 100,
      y + 20,
      config.name,
      {
        fontFamily: 'Courier New',
        fontSize: '24px',
        color: '#ffffff',
        fontStyle: 'bold',
      }
    )

    // Most selected indicator
    if (isMostSelected) {
      this.add.text(
        x + cardWidth - 20,
        y + 20,
        '⭐ FAVORITE',
        {
          fontFamily: 'Courier New',
          fontSize: '14px',
          color: '#ffaa00',
          fontStyle: 'bold',
        }
      ).setOrigin(1, 0)
    }

    // Calculate derived stats
    const avgDPS = stats.totalTimePlayed > 0
      ? (stats.totalDamageDealt / (stats.totalTimePlayed / 1000)).toFixed(1)
      : '0.0'

    const totalTimeSeconds = Math.floor(stats.totalTimePlayed / 1000)
    const minutes = Math.floor(totalTimeSeconds / 60)
    const seconds = totalTimeSeconds % 60
    const timeStr = `${minutes}:${seconds.toString().padStart(2, '0')}`

    const avgKillsPerRun = stats.totalRuns > 0
      ? (stats.totalKills / stats.totalRuns).toFixed(1)
      : '0.0'

    // Stats display (2 rows)
    const statsRow1 = this.add.text(
      x + 100,
      y + 55,
      `Runs: ${stats.totalRuns}  |  Selections: ${stats.timesSelected}  |  Total Time: ${timeStr}`,
      {
        fontFamily: 'Courier New',
        fontSize: '14px',
        color: '#aaaaaa',
      }
    )

    const statsRow2 = this.add.text(
      x + 100,
      y + 80,
      `Kills: ${stats.totalKills} (${avgKillsPerRun}/run)  |  Damage: ${Math.floor(stats.totalDamageDealt)}  |  Avg DPS: ${avgDPS}`,
      {
        fontFamily: 'Courier New',
        fontSize: '14px',
        color: '#aaaaaa',
      }
    )
  }
}
