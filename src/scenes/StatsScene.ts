import Phaser from 'phaser'
import { GameState } from '../game/GameState'
import { CharacterType, CHARACTER_CONFIGS, CharacterConfig } from '../game/Character'
import { WeaponType, WEAPON_CONFIGS, WeaponConfig, DamageType } from '../game/Weapon'
import { PassiveType, PASSIVE_CONFIGS, PassiveConfig } from '../game/Passive'
import { EvolutionType, EVOLUTION_RECIPES, EvolutionRecipe, EVOLUTION_CONFIGS } from '../game/Evolution'
import { gameProgression } from '../game/GameProgression'
import { RunStatistics } from '../game/RunStatistics'

type TabType = 'ships' | 'weapons' | 'passives' | 'evolutions'

export default class StatsScene extends Phaser.Scene {
  private gameState!: GameState
  private runStats!: RunStatistics
  private currentTab: TabType = 'ships'
  private selectedItem: any = null
  private itemListContainer!: Phaser.GameObjects.Container
  private detailContainer!: Phaser.GameObjects.Container

  constructor() {
    super('StatsScene')
  }

  create() {
    this.gameState = GameState.getInstance()
    this.runStats = RunStatistics.getInstance()

    // Add background
    this.add.rectangle(0, 0, this.cameras.main.width, this.cameras.main.height, 0x0a0a1e)
      .setOrigin(0, 0)

    // Title
    this.add.text(
      this.cameras.main.centerX,
      30,
      'INFORMATION',
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

    backButton.on('pointerover', () => backButton.setColor('#00ff00'))
    backButton.on('pointerout', () => backButton.setColor('#00ffff'))
    backButton.on('pointerdown', () => this.scene.start('MainMenuScene'))

    // Create tabs
    this.createTabs()

    // Create containers for item list and detail view
    this.itemListContainer = this.add.container(0, 0)
    this.detailContainer = this.add.container(0, 0)

    // Load initial tab content
    this.displayItemList()
  }

  private tabObjects: Map<TabType, { bg: Phaser.GameObjects.Rectangle, border: Phaser.GameObjects.Rectangle, text: Phaser.GameObjects.Text }> = new Map()

  private createTabs() {
    const tabs: { label: string, type: TabType }[] = [
      { label: 'SHIPS', type: 'ships' },
      { label: 'WEAPONS', type: 'weapons' },
      { label: 'PASSIVES', type: 'passives' },
      { label: 'EVOLUTIONS', type: 'evolutions' },
    ]

    const tabWidth = 115
    const tabHeight = 40
    const tabPadding = 3
    const totalTabWidth = tabs.length * tabWidth + (tabs.length - 1) * tabPadding
    const startX = this.cameras.main.centerX - totalTabWidth / 2
    const tabY = 80

    tabs.forEach((tab, index) => {
      const x = startX + index * (tabWidth + tabPadding)
      const isActive = this.currentTab === tab.type

      const bg = this.add.rectangle(x, tabY, tabWidth, tabHeight, isActive ? 0x2a4a6a : 0x1a1a3a)
        .setOrigin(0, 0)
        .setInteractive({ useHandCursor: true })

      const border = this.add.rectangle(x, tabY, tabWidth, tabHeight)
        .setOrigin(0, 0)
        .setStrokeStyle(2, isActive ? 0x00ffff : 0x4a4a6a)

      const text = this.add.text(
        x + tabWidth / 2,
        tabY + tabHeight / 2,
        tab.label,
        {
          fontFamily: 'Courier New',
          fontSize: '16px',
          color: isActive ? '#00ffff' : '#aaaaaa',
        }
      ).setOrigin(0.5)

      // Store tab objects for later updating
      this.tabObjects.set(tab.type, { bg, border, text })

      // Make tab clickable
      bg.on('pointerdown', () => this.switchTab(tab.type))
      bg.on('pointerover', () => {
        if (this.currentTab !== tab.type) {
          bg.setFillStyle(0x2a2a4a)
        }
      })
      bg.on('pointerout', () => {
        if (this.currentTab !== tab.type) {
          bg.setFillStyle(0x1a1a3a)
        }
      })
    })
  }

  private switchTab(tab: TabType) {
    if (this.currentTab === tab) return // Already on this tab

    this.currentTab = tab
    this.selectedItem = null

    // Update tab visuals
    this.tabObjects.forEach((objects, tabType) => {
      const isActive = tabType === tab
      objects.bg.setFillStyle(isActive ? 0x2a4a6a : 0x1a1a3a)
      objects.border.setStrokeStyle(2, isActive ? 0x00ffff : 0x4a4a6a)
      objects.text.setColor(isActive ? '#00ffff' : '#aaaaaa')
    })

    // Clear containers
    this.itemListContainer.removeAll(true)
    this.detailContainer.removeAll(true)

    // Display items for the current tab
    this.displayItemList()
  }

  private displayItemList() {
    let items: any[] = []

    switch (this.currentTab) {
      case 'ships':
        // Only show ships that are unlockable at current progression level
        const highestLevel = gameProgression.getHighestLevel()
        items = Object.values(CharacterType)
          .filter(type => {
            const config = CHARACTER_CONFIGS[type]
            return config.unlockLevel <= highestLevel + 1
          })
          .map(type => ({
            type,
            config: CHARACTER_CONFIGS[type]
          }))
        break
      case 'weapons':
        items = Object.values(WeaponType).map(type => ({
          type,
          config: WEAPON_CONFIGS[type]
        }))
        break
      case 'passives':
        items = Object.values(PassiveType).map(type => ({
          type,
          config: PASSIVE_CONFIGS[type]
        }))
        break
      case 'evolutions':
        items = EVOLUTION_RECIPES.map(recipe => ({
          recipe,
          evolution: recipe.evolution
        }))
        break
    }

    // Display items in a grid
    const startX = 50
    const startY = 140
    const iconSize = 60
    const spacing = 20
    const itemsPerRow = 6

    items.forEach((item, index) => {
      const row = Math.floor(index / itemsPerRow)
      const col = index % itemsPerRow
      const x = startX + col * (iconSize + spacing)
      const y = startY + row * (iconSize + spacing)

      this.createItemIcon(item, x, y, iconSize)
    })
  }

  private createItemIcon(item: any, x: number, y: number, size: number) {
    const bg = this.add.rectangle(x, y, size, size, 0x2a2a4a)
      .setOrigin(0, 0)
      .setInteractive({ useHandCursor: true })

    const border = this.add.rectangle(x, y, size, size)
      .setOrigin(0, 0)
      .setStrokeStyle(2, 0x4a4a6a)

    let icon: string
    let color: string

    if (this.currentTab === 'ships') {
      icon = item.config.symbol
      color = item.config.color
    } else if (this.currentTab === 'evolutions') {
      // For evolutions, use the evolution's unique icon
      const evolutionConfig = EVOLUTION_CONFIGS[item.recipe.evolution]
      icon = evolutionConfig.icon
      color = evolutionConfig.color
    } else {
      icon = item.config.icon
      color = item.config.color
    }

    // Use smaller font size for evolutions to prevent overflow
    const fontSize = this.currentTab === 'evolutions' ? '24px' : '32px'

    const iconText = this.add.text(
      x + size / 2,
      y + size / 2,
      icon,
      {
        fontFamily: 'Courier New',
        fontSize: fontSize,
        color: color,
      }
    ).setOrigin(0.5)

    // Hover effect
    bg.on('pointerover', () => {
      bg.setFillStyle(0x3a3a5a)
      border.setStrokeStyle(2, 0x00ffff)
    })
    bg.on('pointerout', () => {
      bg.setFillStyle(0x2a2a4a)
      border.setStrokeStyle(2, 0x4a4a6a)
    })
    bg.on('pointerdown', () => this.selectItem(item))

    this.itemListContainer.add([bg, border, iconText])
  }

  private selectItem(item: any) {
    this.selectedItem = item
    this.displayItemDetails()
  }

  private displayItemDetails() {
    this.detailContainer.removeAll(true)

    if (!this.selectedItem) return

    const detailX = 50
    const detailY = 450
    const detailWidth = 440
    const detailHeight = 450

    // Background
    const bg = this.add.rectangle(detailX, detailY, detailWidth, detailHeight, 0x1a1a3a)
      .setOrigin(0, 0)

    const border = this.add.rectangle(detailX, detailY, detailWidth, detailHeight)
      .setOrigin(0, 0)
      .setStrokeStyle(2, 0x4a4a6a)

    this.detailContainer.add([bg, border])

    let config: any
    let name: string
    let description: string
    let icon: string
    let color: string

    if (this.currentTab === 'ships') {
      config = this.selectedItem.config
      name = config.name
      description = config.description || 'No description available'
      icon = config.symbol
      color = config.color
    } else if (this.currentTab === 'evolutions') {
      const recipe = this.selectedItem.recipe
      const weaponConfig = WEAPON_CONFIGS[recipe.baseWeapon]
      const passiveConfig = PASSIVE_CONFIGS[recipe.requiredPassive]
      const evolutionConfig = EVOLUTION_CONFIGS[recipe.evolution]
      name = evolutionConfig.name
      description = evolutionConfig.detailedDescription
      icon = evolutionConfig.icon
      color = evolutionConfig.color

      // Show components
      const componentText = this.add.text(
        detailX + 20,
        detailY + 120,
        `Components:\n${weaponConfig.icon} ${weaponConfig.name} + ${passiveConfig.icon} ${passiveConfig.name}`,
        {
          fontFamily: 'Courier New',
          fontSize: '14px',
          color: '#aaaaaa',
        }
      )
      this.detailContainer.add(componentText)
    } else {
      config = this.selectedItem.config
      name = config.name
      // Use detailedDescription if available, otherwise use regular description
      description = config.detailedDescription || config.description
      icon = config.icon
      color = config.color
    }

    // Icon - use smaller size for evolutions to prevent overlap
    const iconFontSize = this.currentTab === 'evolutions' ? '32px' : '40px'
    const iconText = this.add.text(
      detailX + 20,
      detailY + 30,
      icon,
      {
        fontFamily: 'Courier New',
        fontSize: iconFontSize,
        color: color,
      }
    )

    // Name - positioned to avoid icon overlap
    const nameText = this.add.text(
      detailX + 100,
      detailY + 20,
      name,
      {
        fontFamily: 'Courier New',
        fontSize: '18px',
        color: '#ffffff',
        fontStyle: 'bold',
      }
    )

    this.detailContainer.add([iconText, nameText])

    // Add more vertical space for passives, evolutions, and ships to prevent icon overlap
    let currentY = this.currentTab === 'weapons' ? detailY + 50 : detailY + 70

    // Add damage type for weapons
    if (this.currentTab === 'weapons') {
      const weaponConfig = config as WeaponConfig
      const damageTypeColor = this.getDamageTypeColor(weaponConfig.damageType)
      const damageTypeText = this.add.text(
        detailX + 100,
        currentY,
        `Damage Type: ${weaponConfig.damageType}`,
        {
          fontFamily: 'Courier New',
          fontSize: '14px',
          color: damageTypeColor,
          fontStyle: 'bold',
        }
      )
      this.detailContainer.add(damageTypeText)
      currentY += 30
    }

    // Stats
    const statsText = this.add.text(
      detailX + 20,
      currentY,
      this.getItemStats(),
      {
        fontFamily: 'Courier New',
        fontSize: '14px',
        color: '#aaaaaa',
        lineSpacing: 6
      }
    )
    this.detailContainer.add(statsText)
    currentY += 140

    // Description at the bottom - most variable in size
    const descText = this.add.text(
      detailX + 20,
      currentY,
      description,
      {
        fontFamily: 'Courier New',
        fontSize: '13px',
        color: '#888888',
        wordWrap: { width: detailWidth - 40 },
        lineSpacing: 4
      }
    )
    this.detailContainer.add(descText)
  }

  private getItemStats(): string {
    if (!this.selectedItem) return ''

    let stats: any = null
    let timesUsed = 0
    let wins = 0
    let winRate = 0
    let avgDPS = 'N/A'

    if (this.currentTab === 'weapons') {
      const weaponType = this.selectedItem.type
      stats = this.runStats.getWeaponStats(weaponType)
      if (stats) {
        timesUsed = stats.timesPicked
        wins = stats.wins
        winRate = timesUsed > 0 ? (wins / timesUsed) * 100 : 0

        // Calculate average DPS from recent runs
        const recentRuns = this.runStats.getRecentRuns()
          .filter((run: any) => run.weapons.includes(weaponType) && run.weaponDPS)

        if (recentRuns.length > 0) {
          let totalDPS = 0
          let dpsCount = 0
          recentRuns.forEach((run: any) => {
            const weaponConfig = WEAPON_CONFIGS[weaponType]
            const weaponDPSData = run.weaponDPS?.find((w: any) => w.weaponName === weaponConfig.name)
            if (weaponDPSData) {
              totalDPS += weaponDPSData.dps
              dpsCount++
            }
          })
          if (dpsCount > 0) {
            avgDPS = (totalDPS / dpsCount).toFixed(1)
          }
        }
      }
    } else if (this.currentTab === 'passives') {
      const passiveType = this.selectedItem.type
      stats = this.runStats.getPassiveStats(passiveType)
      if (stats) {
        timesUsed = stats.timesPicked
        wins = stats.wins
        winRate = timesUsed > 0 ? (wins / timesUsed) * 100 : 0
      }
    } else if (this.currentTab === 'evolutions') {
      const evolutionType = this.selectedItem.recipe.evolution
      stats = this.runStats.getEvolutionStats(evolutionType)
      if (stats) {
        timesUsed = stats.timesAchieved
        wins = stats.wins
        winRate = timesUsed > 0 ? (wins / timesUsed) * 100 : 0
      }
    } else if (this.currentTab === 'ships') {
      const characterType = this.selectedItem.type
      stats = this.runStats.getCharacterStats(characterType)
      if (stats) {
        timesUsed = stats.runs
        wins = stats.wins
        winRate = timesUsed > 0 ? (wins / timesUsed) * 100 : 0

        return `Times Selected: ${timesUsed}
Wins: ${wins}
Win Rate: ${winRate.toFixed(1)}%

Total Damage: ${Math.round(stats.totalDamageDealt).toLocaleString()}
Total Kills: ${stats.totalKills || 0}
Longest Survival: ${Math.floor(stats.longestSurvival / 60)}m ${Math.floor(stats.longestSurvival % 60)}s`
      }
    }

    if (!stats) {
      return `Times Used: 0
Wins: 0
Win Rate: 0%

Average DPS: N/A

No runs recorded yet`
    }

    return `Times Used: ${timesUsed}
Wins: ${wins}
Win Rate: ${winRate.toFixed(1)}%

Average DPS: ${avgDPS}`
  }

  private getDamageTypeColor(damageType: DamageType): string {
    switch (damageType) {
      case DamageType.FIRE:
        return '#ff4400'  // Orange-red
      case DamageType.COLD:
        return '#00ddff'  // Cyan-blue
      case DamageType.NATURE:
        return '#44ff44'  // Green
      case DamageType.CONTROL:
        return '#aa44ff'  // Purple
      case DamageType.PHYSICAL:
      default:
        return '#ffffff'  // White
    }
  }
}
