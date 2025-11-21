import Phaser from 'phaser'
import { GameState } from '../game/GameState'
import { BuildingType, BUILDING_CONFIGS } from '../game/Building'
import { soundManager, SoundType } from '../game/SoundManager'
import { partySystem } from '../systems/PartySystem'

interface SkillNode {
  id: BuildingType
  x: number  // Position in tree (0-4 for columns)
  y: number  // Position in tree (0-5 for rows, 0 is bottom)
  requires?: BuildingType[] // Previous nodes required (need at least 1 level)
}

interface SkillTree {
  name: string
  icon: string
  color: string
  nodes: SkillNode[]
}

type TreeType = 'combat' | 'survival' | 'growth'

export default class BuildingMenuScene extends Phaser.Scene {
  private gameState!: GameState
  private currentTree: TreeType = 'combat'
  private selectedNode: BuildingType | null = null
  private treeContainer!: Phaser.GameObjects.Container
  private detailContainer!: Phaser.GameObjects.Container
  private tabObjects: Map<TreeType, { bg: Phaser.GameObjects.Rectangle, border: Phaser.GameObjects.Rectangle, text: Phaser.GameObjects.Text, dot: Phaser.GameObjects.Arc }> = new Map()

  // Track interactive objects for cleanup
  private interactiveObjects: Phaser.GameObjects.GameObject[] = []

  // Game start handler for coop
  private gameStartHandler?: () => void

  // Define all skill trees
  private skillTrees: Record<TreeType, SkillTree> = {
    combat: {
      name: 'COMBAT',
      icon: '⚔',
      color: '#ff4444',
      nodes: [
        // Row 0 (bottom) - basics (tree trunk)
        { id: BuildingType.DAMAGE, x: 1.5, y: 0 },
        { id: BuildingType.ATTACK_SPEED, x: 2.5, y: 0 },

        // Row 1 - elemental specialization (tree splits into 4 branches)
        { id: BuildingType.PHYSICAL_DAMAGE, x: 0.75, y: 1, requires: [BuildingType.DAMAGE] },
        { id: BuildingType.FIRE_DAMAGE, x: 1.75, y: 1, requires: [BuildingType.DAMAGE] },
        { id: BuildingType.COLD_DAMAGE, x: 2.75, y: 1, requires: [BuildingType.ATTACK_SPEED] },
        { id: BuildingType.NATURE_DAMAGE, x: 3.75, y: 1, requires: [BuildingType.ATTACK_SPEED] },

        // Row 2 - specialized (4 separate branches)
        { id: BuildingType.AOE_RADIUS, x: 0.75, y: 2, requires: [BuildingType.PHYSICAL_DAMAGE] },
        { id: BuildingType.PROJECTILE_SPEED, x: 1.75, y: 2, requires: [BuildingType.FIRE_DAMAGE] },
        { id: BuildingType.CRIT_CHANCE, x: 2.75, y: 2, requires: [BuildingType.COLD_DAMAGE] },
        { id: BuildingType.ALLY_DAMAGE, x: 3.75, y: 2, requires: [BuildingType.NATURE_DAMAGE] },

        // Row 3 - synergies (branches converge)
        { id: BuildingType.BURNING_AMPLIFY, x: 1.25, y: 3, requires: [BuildingType.AOE_RADIUS, BuildingType.PROJECTILE_SPEED] },
        { id: BuildingType.POISON_AMPLIFY, x: 3.25, y: 3, requires: [BuildingType.ALLY_DAMAGE, BuildingType.CRIT_CHANCE] },

        // Row 4 - convergence
        { id: BuildingType.WEAPON_SLOT, x: 2.25, y: 4, requires: [BuildingType.BURNING_AMPLIFY, BuildingType.POISON_AMPLIFY] },

        // Row 5 - ultimate (top of tree)
        { id: BuildingType.PROJECTILE_COUNT, x: 2.25, y: 5, requires: [BuildingType.WEAPON_SLOT] },
      ]
    },
    survival: {
      name: 'SURVIVAL',
      icon: '♥',
      color: '#44ff44',
      nodes: [
        // Row 0 (bottom) - base (trident handle)
        { id: BuildingType.HEALTH, x: 1.5, y: 0 },
        { id: BuildingType.MOVE_SPEED, x: 2.5, y: 0 },

        // Row 1 - three prongs split
        { id: BuildingType.DAMAGE_REDUCTION, x: 0.75, y: 1, requires: [BuildingType.HEALTH] }, // Left prong
        { id: BuildingType.REGEN, x: 2, y: 1, requires: [BuildingType.HEALTH, BuildingType.MOVE_SPEED] }, // Middle prong
        { id: BuildingType.INVULN_TIME, x: 3.25, y: 1, requires: [BuildingType.MOVE_SPEED] }, // Right prong

        // Row 2 - prongs continue
        { id: BuildingType.PICKUP_RADIUS, x: 0.5, y: 2, requires: [BuildingType.DAMAGE_REDUCTION] }, // Left
        { id: BuildingType.HEALTH_DROP_RATE, x: 1.5, y: 2, requires: [BuildingType.REGEN] }, // Middle-left
        { id: BuildingType.HEALTH_PACK_VALUE, x: 2.5, y: 2, requires: [BuildingType.REGEN] }, // Middle-right
        { id: BuildingType.ALLY_WALL_COUNT, x: 3.5, y: 2, requires: [BuildingType.INVULN_TIME] }, // Right

        // Row 3 - prongs extend
        { id: BuildingType.WAVE_HEAL, x: 0.5, y: 3, requires: [BuildingType.PICKUP_RADIUS] }, // Left
        { id: BuildingType.ALLY_WALL_DAMAGE, x: 3.5, y: 3, requires: [BuildingType.ALLY_WALL_COUNT] }, // Right

        // Row 4 - prongs continue
        { id: BuildingType.ALLY_RANGED_COUNT, x: 3.5, y: 4, requires: [BuildingType.ALLY_WALL_DAMAGE] }, // Right (combined unlock + count)

        // Row 5 - terminals (prong tips)
        { id: BuildingType.PASSIVE_SLOT, x: 0.5, y: 5, requires: [BuildingType.WAVE_HEAL] }, // Left tip
        { id: BuildingType.ALLY_RANGED_RATE, x: 3.5, y: 5, requires: [BuildingType.ALLY_RANGED_COUNT] }, // Right tip
      ]
    },
    growth: {
      name: 'GROWTH',
      icon: '◆',
      color: '#ffaa00',
      nodes: [
        // ===== XP CLUSTER (bottom left) =====
        { id: BuildingType.XP_GAIN, x: 0.5, y: 0 },
        { id: BuildingType.STARTING_WEAPON_LEVEL, x: 0.5, y: 1, requires: [BuildingType.XP_GAIN] },
        { id: BuildingType.UPGRADE_OPTIONS, x: 0.5, y: 2, requires: [BuildingType.STARTING_WEAPON_LEVEL] },

        // ===== CREDITS CLUSTER (bottom right) =====
        { id: BuildingType.CREDIT_GAIN, x: 2.5, y: 0 },
        { id: BuildingType.CREDIT_DROP_RATE, x: 3.5, y: 0 },
        { id: BuildingType.WIN_BONUS, x: 2.5, y: 1, requires: [BuildingType.CREDIT_GAIN] },
        { id: BuildingType.BOSS_BONUS, x: 3.5, y: 1, requires: [BuildingType.CREDIT_DROP_RATE] },

        // ===== CHEST CLUSTER (middle) =====
        { id: BuildingType.MAGNET_DURATION, x: 1.5, y: 2, requires: [BuildingType.WIN_BONUS] },
        { id: BuildingType.CHEST_VALUE, x: 3.5, y: 2, requires: [BuildingType.WIN_BONUS, BuildingType.BOSS_BONUS] },
        { id: BuildingType.DISCOUNT, x: 0.5, y: 3, requires: [BuildingType.UPGRADE_OPTIONS] },

        // ===== REROLL CLUSTER (middle-top) =====
        { id: BuildingType.REROLL_CHARGES, x: 1.5, y: 3, requires: [BuildingType.MAGNET_DURATION] }, // Combined unlock + charges

        // ===== GOLD CHEST PATH (right side) =====
        { id: BuildingType.GOLD_CHEST_CHANCE, x: 3.5, y: 3, requires: [BuildingType.CHEST_VALUE] },
        { id: BuildingType.CHEST_LEVEL_BONUS, x: 3.5, y: 4, requires: [BuildingType.GOLD_CHEST_CHANCE] },

        // ===== TERMINAL CLUSTER (top) =====
        { id: BuildingType.GREED, x: 1.5, y: 5, requires: [BuildingType.REROLL_CHARGES, BuildingType.DISCOUNT] },
      ]
    }
  }

  constructor() {
    super('BuildingMenuScene')
  }

  create() {
    this.gameState = GameState.getInstance()

    // Background
    this.add.rectangle(0, 0, this.cameras.main.width, this.cameras.main.height, 0x0a0a1e)
      .setOrigin(0, 0)

    // Title
    this.add.text(
      this.cameras.main.centerX,
      25,
      'RESEARCH',
      {
        fontFamily: 'Courier New',
        fontSize: '36px',
        color: '#00ffff',
        fontStyle: 'bold',
      }
    ).setOrigin(0.5)

    // Credits display - moved left to make room for $ button
    const credits = this.gameState.getCredits()
    const creditsText = this.add.text(
      this.cameras.main.width - 60,
      25,
      `${credits} ¤`,
      {
        fontFamily: 'Courier New',
        fontSize: '24px',
        color: '#ffdd00',
      }
    ).setOrigin(1, 0.5)
    creditsText.setName('creditsDisplay') // Tag for updates

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
          creditsText.setText(`${this.gameState.getCredits()} ¤`)
          this.updateAffordabilityIndicators()
        }
      })
    })

    // Track for cleanup
    this.interactiveObjects.push(creditButton)

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

    // Track for cleanup
    this.interactiveObjects.push(backButton)

    // Create tree tabs
    this.createTreeTabs()

    // Create containers
    this.treeContainer = this.add.container(0, 0)
    this.detailContainer = this.add.container(0, 0).setDepth(10)

    // Display current tree
    this.displayTree()

    // Setup game start handler for coop (in case host starts while we're here)
    this.gameStartHandler = () => {
      if (this.scene.isActive()) {
        this.startCoopGame()
      }
    }
    partySystem.on('gameStart', this.gameStartHandler)
  }

  private startCoopGame() {
    // Called when host starts game while we're in research
    this.registry.set('isCoopMode', true)
    this.registry.set('partyState', partySystem.getState())

    // Fade out and start game
    this.cameras.main.fadeOut(200, 0, 0, 0)
    this.cameras.main.once('camerafadeoutcomplete', () => {
      this.scene.start('LoadingScene', { levelIndex: 0 })
    })
  }

  private createTreeTabs() {
    const trees: { label: string, type: TreeType }[] = [
      { label: 'COMBAT', type: 'combat' },
      { label: 'SURVIVAL', type: 'survival' },
      { label: 'GROWTH', type: 'growth' },
    ]

    const tabWidth = 115
    const tabHeight = 40
    const tabPadding = 3
    const totalTabWidth = trees.length * tabWidth + (trees.length - 1) * tabPadding
    const startX = this.cameras.main.centerX - totalTabWidth / 2
    const tabY = 60

    trees.forEach((tree, index) => {
      const x = startX + index * (tabWidth + tabPadding)
      const isActive = this.currentTree === tree.type
      const treeData = this.skillTrees[tree.type]

      const bg = this.add.rectangle(x, tabY, tabWidth, tabHeight, isActive ? 0x2a4a6a : 0x1a1a3a)
        .setOrigin(0, 0)
        .setInteractive({ useHandCursor: true })

      const border = this.add.rectangle(x, tabY, tabWidth, tabHeight)
        .setOrigin(0, 0)
        .setStrokeStyle(2, isActive ? 0x00ffff : 0x4a4a6a)

      const icon = this.add.text(
        x + 20,
        tabY + tabHeight / 2,
        treeData.icon,
        {
          fontFamily: 'Courier New',
          fontSize: '20px',
          color: treeData.color,
        }
      ).setOrigin(0, 0.5)

      const text = this.add.text(
        x + 45,
        tabY + tabHeight / 2,
        tree.label,
        {
          fontFamily: 'Courier New',
          fontSize: '14px',
          color: isActive ? '#ffffff' : '#aaaaaa',
        }
      ).setOrigin(0, 0.5)

      // Red dot indicator for affordable nodes in this tree
      const dot = this.add.circle(
        x + tabWidth - 8,
        tabY + 8,
        5,
        0xff0000
      ).setVisible(this.hasAffordableNodesInTree(tree.type))

      this.tabObjects.set(tree.type, { bg, border, text, dot })

      bg.on('pointerdown', () => this.switchTree(tree.type))
      bg.on('pointerover', () => {
        if (this.currentTree !== tree.type) {
          bg.setFillStyle(0x2a2a4a)
        }
      })
      bg.on('pointerout', () => {
        if (this.currentTree !== tree.type) {
          bg.setFillStyle(0x1a1a3a)
        }
      })

      // Track for cleanup
      this.interactiveObjects.push(bg)
    })
  }

  private switchTree(tree: TreeType) {
    if (this.currentTree === tree) return

    this.currentTree = tree
    this.selectedNode = null

    // Update tab visuals
    this.tabObjects.forEach((objects, tabType) => {
      const isActive = tabType === tree
      objects.bg.setFillStyle(isActive ? 0x2a4a6a : 0x1a1a3a)
      objects.border.setStrokeStyle(2, isActive ? 0x00ffff : 0x4a4a6a)
      objects.text.setColor(isActive ? '#ffffff' : '#aaaaaa')
    })

    // Refresh tree display
    this.treeContainer.removeAll(true)
    this.detailContainer.removeAll(true)
    this.displayTree()
  }

  private displayTree() {
    const tree = this.skillTrees[this.currentTree]

    // Tree display area
    const treeX = 50
    const treeY = 165  // Centered vertically in available space
    const treeWidth = 300
    const treeHeight = 670  // Adjusted for centering
    const nodeSize = 60  // Increased from 50 for easier selection
    const columnPadding = 2  // Padding between columns

    // Calculate spacing based on number of columns/rows
    // Distribute nodes evenly within the tree area
    const numColumns = 5 // Columns 0-4
    const numRows = 6 // Rows 0-5
    const xSpacing = (treeWidth - nodeSize) / (numColumns - 1) // Space between column centers
    const ySpacing = (treeHeight - nodeSize) / (numRows - 1) // Space between row centers

    // Draw connections first (behind nodes)
    tree.nodes.forEach(node => {
      if (node.requires) {
        node.requires.forEach(requiredId => {
          const requiredNode = tree.nodes.find(n => n.id === requiredId)
          if (requiredNode) {
            // Line is highlighted if the parent node has level >= 1
            const requiredBuilding = this.gameState.getBuilding(requiredId)
            const isUnlocked = requiredBuilding.getLevel() >= 1

            // Calculate node center positions for connections (with column padding)
            const fromPadding = Math.floor(requiredNode.x) * columnPadding
            const fromX = treeX + requiredNode.x * xSpacing + fromPadding + nodeSize / 2
            const fromY = treeY + treeHeight - nodeSize - (requiredNode.y * ySpacing) + nodeSize / 2
            const toPadding = Math.floor(node.x) * columnPadding
            const toX = treeX + node.x * xSpacing + toPadding + nodeSize / 2
            const toY = treeY + treeHeight - nodeSize - (node.y * ySpacing) + nodeSize / 2

            this.drawConnection(fromX, fromY, toX, toY, isUnlocked)
          }
        })
      }
    })

    // Draw nodes
    tree.nodes.forEach(node => {
      const nodePadding = Math.floor(node.x) * columnPadding
      const x = treeX + node.x * xSpacing + nodePadding
      const y = treeY + treeHeight - nodeSize - (node.y * ySpacing) // Invert Y so bottom is 0

      this.createNode(node.id, x, y, nodeSize)
    })

    // Draw detail panel
    this.createDetailPanel()
  }

  private drawConnection(x1: number, y1: number, x2: number, y2: number, unlocked: boolean) {
    const color = 0x00ffff // Same cyan color for both
    const alpha = unlocked ? 1 : 0.2 // Dimmed version when locked

    // Calculate line dimensions
    const lineHeight = Math.abs(y2 - y1)
    const lineWidth = Math.abs(x2 - x1)

    // Move lines down by half their height
    const yOffset = lineHeight / 2

    // Non-vertical lines (any line with horizontal component) need additional right offset
    const isVertical = lineWidth < 1 // Purely vertical line
    const xOffset = isVertical ? 0 : (lineWidth / 2)

    const line = this.add.line(0, 0, x1 + xOffset, y1 + yOffset, x2 + xOffset, y2 + yOffset, color, alpha)
    line.setLineWidth(3)
    this.treeContainer.add(line)
  }

  private createNode(type: BuildingType, x: number, y: number, size: number) {
    const config = BUILDING_CONFIGS[type]
    const building = this.gameState.getBuilding(type)
    const level = building.getLevel()
    const maxLevel = config.maxLevel
    const isMaxed = level >= maxLevel
    const isAvailable = this.isNodeAvailable(type)
    const isLocked = !isAvailable

    // Determine node state color
    let bgColor: number
    let borderColor: number
    if (isMaxed) {
      bgColor = 0x2a4a2a
      borderColor = 0x00ff00
    } else if (isLocked) {
      bgColor = 0x1a1a2a // Slightly lighter and more blue for locked
      borderColor = 0x444444 // Lighter border for visibility
    } else if (level > 0) {
      bgColor = 0x2a3a4a
      borderColor = 0x00aaff
    } else {
      bgColor = 0x2a2a2a
      borderColor = 0x666666
    }

    const bg = this.add.rectangle(x, y, size, size, bgColor)
      .setOrigin(0, 0)
      .setInteractive({ useHandCursor: true }) // All nodes are clickable

    const border = this.add.rectangle(x, y, size, size)
      .setOrigin(0, 0)
      .setStrokeStyle(3, borderColor)

    // Icon
    const icon = this.add.text(
      x + size / 2,
      y + size / 2 - 5,
      config.icon,
      {
        fontFamily: 'Courier New',
        fontSize: '24px',
        color: isLocked ? '#888888' : '#ffffff', // Lighter gray for locked icons
      }
    ).setOrigin(0.5)

    // Level display
    const levelText = this.add.text(
      x + size / 2,
      y + size - 8,
      `${level}/${maxLevel}`,
      {
        fontFamily: 'Courier New',
        fontSize: '10px',
        color: isLocked ? '#666666' : '#aaaaaa', // Lighter gray for locked text
      }
    ).setOrigin(0.5)

    // Red dot indicator if affordable (added last so it renders on top)
    const cost = building.getUpgradeCost()
    const canAfford = cost > 0 && this.gameState.getCredits() >= cost && isAvailable && !isMaxed

    // Hover effects for all nodes
    bg.on('pointerover', () => {
      bg.setFillStyle(isLocked ? 0x2a2a2a : 0x3a3a5a)
      border.setStrokeStyle(3, isLocked ? 0x888888 : 0x00ffff)
    })
    bg.on('pointerout', () => {
      bg.setFillStyle(bgColor)
      border.setStrokeStyle(3, borderColor)
    })
    bg.on('pointerdown', () => this.selectNode(type))

    // Track for cleanup
    this.interactiveObjects.push(bg)

    this.treeContainer.add([bg, border, icon, levelText])

    // Add affordability dot last so it renders on top
    if (canAfford) {
      const affordableDot = this.add.circle(
        x + size - 8,
        y + 8,
        6, // Slightly larger for visibility
        0xff0000
      ).setAlpha(0.9) // Slightly transparent so it doesn't completely hide the corner
      this.treeContainer.add(affordableDot)
    }
  }

  private isNodeAvailable(type: BuildingType, treeType?: TreeType): boolean {
    const tree = this.skillTrees[treeType || this.currentTree]
    const node = tree.nodes.find(n => n.id === type)

    if (!node) return false
    if (!node.requires || node.requires.length === 0) return true

    // Check if at least one required node has level >= 1
    return node.requires.some(requiredType => {
      const requiredBuilding = this.gameState.getBuilding(requiredType)
      return requiredBuilding.getLevel() >= 1
    })
  }

  private selectNode(type: BuildingType) {
    this.selectedNode = type
    this.createDetailPanel()
  }

  private createDetailPanel() {
    this.detailContainer.removeAll(true)

    const panelX = 380
    const panelY = 165  // Centered to match tree position
    const panelWidth = 140
    const panelHeight = 670  // Adjusted to match tree height

    // Background
    const bg = this.add.rectangle(panelX, panelY, panelWidth, panelHeight, 0x1a1a3a)
      .setOrigin(0, 0)

    const border = this.add.rectangle(panelX, panelY, panelWidth, panelHeight)
      .setOrigin(0, 0)
      .setStrokeStyle(2, 0x4a4a6a)

    this.detailContainer.add([bg, border])

    if (!this.selectedNode) {
      // Show instruction text
      const infoText = this.add.text(
        panelX + panelWidth / 2,
        panelY + panelHeight / 2,
        'Select a node\nto view details',
        {
          fontFamily: 'Courier New',
          fontSize: '14px',
          color: '#888888',
          align: 'center',
        }
      ).setOrigin(0.5)
      this.detailContainer.add(infoText)
      return
    }

    const config = BUILDING_CONFIGS[this.selectedNode]
    const building = this.gameState.getBuilding(this.selectedNode)
    const level = building.getLevel()
    const maxLevel = config.maxLevel
    const cost = building.getUpgradeCost()
    const canAfford = this.gameState.getCredits() >= cost
    const isMaxed = level >= maxLevel
    const isAvailable = this.isNodeAvailable(this.selectedNode)

    // Icon
    const icon = this.add.text(
      panelX + panelWidth / 2,
      panelY + 30,
      config.icon,
      {
        fontFamily: 'Courier New',
        fontSize: '48px',
        color: '#ffffff',
      }
    ).setOrigin(0.5)

    // Name
    const name = this.add.text(
      panelX + panelWidth / 2,
      panelY + 90,
      config.name,
      {
        fontFamily: 'Courier New',
        fontSize: '12px',
        color: '#ffffff',
        align: 'center',
        wordWrap: { width: panelWidth - 20 }
      }
    ).setOrigin(0.5)

    // Level (moved up)
    const levelText = this.add.text(
      panelX + panelWidth / 2,
      panelY + 130,
      `Level: ${level}/${maxLevel}`,
      {
        fontFamily: 'Courier New',
        fontSize: '14px',
        color: '#ffffff',
      }
    ).setOrigin(0.5)

    // Description (moved down to use more space)
    const desc = this.add.text(
      panelX + 10,
      panelY + 170,
      config.description,
      {
        fontFamily: 'Courier New',
        fontSize: '13px',
        color: '#aaaaaa',
        wordWrap: { width: panelWidth - 20 },
        lineSpacing: 4
      }
    )

    this.detailContainer.add([icon, name, levelText, desc])

    // Upgrade button
    if (!isMaxed && isAvailable) {
      const buttonY = panelY + panelHeight - 80
      const buttonHeight = 50
      const buttonBg = this.add.rectangle(
        panelX + panelWidth / 2,
        buttonY,
        panelWidth - 20,
        buttonHeight,
        canAfford ? 0x2a4a2a : 0x4a2a2a
      ).setInteractive({ useHandCursor: canAfford })

      const buttonBorder = this.add.rectangle(
        panelX + panelWidth / 2,
        buttonY,
        panelWidth - 20,
        buttonHeight
      ).setStrokeStyle(2, canAfford ? 0x00ff00 : 0xff4444)

      const buttonText = this.add.text(
        panelX + panelWidth / 2,
        buttonY - 10,
        'UPGRADE',
        {
          fontFamily: 'Courier New',
          fontSize: '16px',
          color: canAfford ? '#00ff00' : '#ff4444',
        }
      ).setOrigin(0.5)

      const costText = this.add.text(
        panelX + panelWidth / 2,
        buttonY + 10,
        `${cost} ¤`,
        {
          fontFamily: 'Courier New',
          fontSize: '14px',
          color: canAfford ? '#ffdd00' : '#ff4444',
        }
      ).setOrigin(0.5)

      // Name components for feedback animations
      buttonBg.setName('upgradeButton')
      buttonBorder.setName('upgradeButtonBorder')
      buttonText.setName('upgradeButtonText')
      costText.setName('upgradeButtonCost')

      if (canAfford) {
        buttonBg.on('pointerover', () => buttonBg.setFillStyle(0x3a5a3a))
        buttonBg.on('pointerout', () => buttonBg.setFillStyle(0x2a4a2a))
      } else {
        buttonBg.on('pointerover', () => buttonBg.setFillStyle(0x5a2a2a))
        buttonBg.on('pointerout', () => buttonBg.setFillStyle(0x4a2a2a))
      }

      buttonBg.on('pointerdown', () => this.upgradeNode())

      // Track for cleanup
      this.interactiveObjects.push(buttonBg)

      this.detailContainer.add([buttonBg, buttonBorder, buttonText, costText])
    } else if (isMaxed) {
      const maxText = this.add.text(
        panelX + panelWidth / 2,
        panelY + panelHeight - 60,
        'MAX LEVEL',
        {
          fontFamily: 'Courier New',
          fontSize: '16px',
          color: '#00ff00',
        }
      ).setOrigin(0.5)
      this.detailContainer.add(maxText)
    } else {
      const lockedText = this.add.text(
        panelX + panelWidth / 2,
        panelY + panelHeight - 80,
        'LOCKED\n\nRequires previous\nnode at level 1+',
        {
          fontFamily: 'Courier New',
          fontSize: '12px',
          color: '#ff4444',
          align: 'center',
        }
      ).setOrigin(0.5)
      this.detailContainer.add(lockedText)
    }
  }

  private upgradeNode() {
    if (!this.selectedNode) return

    const building = this.gameState.getBuilding(this.selectedNode)
    const cost = building.getUpgradeCost()
    const canAfford = this.gameState.getCredits() >= cost

    if (!canAfford) {
      // Can't afford - play feedback animations
      this.playCannotAffordFeedback()
      return
    }

    const success = this.gameState.upgradeBuilding(this.selectedNode)
    if (success) {
      // Play satisfying sound
      soundManager.play(SoundType.UPGRADE_PURCHASED)

      // Find the node position on screen for particle effect
      const tree = this.skillTrees[this.currentTree]
      const nodeInfo = tree.nodes.find(n => n.id === this.selectedNode)
      if (nodeInfo) {
        const treeX = 50
        const treeY = 165
        const treeWidth = 300
        const treeHeight = 670
        const nodeSize = 60
        const numColumns = 5
        const numRows = 6
        const xSpacing = (treeWidth - nodeSize) / (numColumns - 1)
        const ySpacing = (treeHeight - nodeSize) / (numRows - 1)

        const nodeX = treeX + nodeInfo.x * xSpacing + nodeSize / 2
        const nodeY = treeY + treeHeight - nodeSize - (nodeInfo.y * ySpacing) + nodeSize / 2
        this.createUpgradeParticles(nodeX, nodeY)
      }

      // Delay refresh slightly so user sees the effect
      this.time.delayedCall(200, () => {
        // Refresh the display - this recreates all nodes with fresh affordability dots
        this.treeContainer.removeAll(true)
        this.detailContainer.removeAll(true)
        this.displayTree()

        // Update credits display
        const creditsDisplay = this.children.getByName('creditsDisplay') as Phaser.GameObjects.Text
        if (creditsDisplay) {
          creditsDisplay.setText(`${this.gameState.getCredits()} ¤`)
        }

        // Update tab affordability indicators
        this.updateAffordabilityIndicators()
      })
    }
  }

  private playCannotAffordFeedback() {
    // Get button elements
    const buttonBg = this.detailContainer.getByName('upgradeButton') as Phaser.GameObjects.Rectangle
    const buttonBorder = this.detailContainer.getByName('upgradeButtonBorder') as Phaser.GameObjects.Rectangle
    const buttonText = this.detailContainer.getByName('upgradeButtonText') as Phaser.GameObjects.Text
    const costText = this.detailContainer.getByName('upgradeButtonCost') as Phaser.GameObjects.Text
    const creditsDisplay = this.children.getByName('creditsDisplay') as Phaser.GameObjects.Text

    // Wiggle the button - shake left and right
    if (buttonBg && buttonBorder && buttonText && costText) {
      const originalX = buttonBg.x

      // Kill existing tweens to prevent stacking
      this.tweens.killTweensOf([buttonBg, buttonBorder, buttonText, costText])

      this.tweens.add({
        targets: [buttonBg, buttonBorder, buttonText, costText],
        x: originalX - 8,
        duration: 50,
        yoyo: true,
        repeat: 3,
        ease: 'Sine.easeInOut'
      })
    }

    // Flash the credits display - scale pulse and color flash
    if (creditsDisplay) {
      const originalScale = creditsDisplay.scale

      // Kill existing tweens to prevent stacking
      this.tweens.killTweensOf(creditsDisplay)

      this.tweens.add({
        targets: creditsDisplay,
        scaleX: originalScale * 1.3,
        scaleY: originalScale * 1.3,
        duration: 100,
        yoyo: true,
        repeat: 2,
        ease: 'Sine.easeInOut'
      })

      // Color flash from yellow to red and back
      this.tweens.addCounter({
        from: 0,
        to: 1,
        duration: 100,
        yoyo: true,
        repeat: 2,
        onUpdate: (tween) => {
          const value = tween.getValue()
          const color = Phaser.Display.Color.Interpolate.ColorWithColor(
            Phaser.Display.Color.ValueToColor(0xffdd00), // Yellow
            Phaser.Display.Color.ValueToColor(0xff4444), // Red
            1,
            value
          )
          creditsDisplay.setColor(Phaser.Display.Color.RGBToString(color.r, color.g, color.b))
        },
        onComplete: () => {
          creditsDisplay.setColor('#ffdd00') // Reset to yellow
        }
      })
    }

    // Optional: Play a "denied" sound effect
    // soundManager.play(SoundType.PURCHASE_DENIED)
  }

  private createUpgradeParticles(x: number, y: number) {
    // Create a burst of green/gold particles for upgrade
    const colors = [0x00ff00, 0xffaa00, 0xffdd00, 0x88ff00]
    const particleCount = 20

    for (let i = 0; i < particleCount; i++) {
      const angle = (i / particleCount) * Math.PI * 2
      const speed = Phaser.Math.Between(80, 200)
      const color = colors[i % colors.length]

      // Create particle as a small rectangle
      const particle = this.add.rectangle(x, y, 3, 3, color)

      // Animate particle outward
      this.tweens.add({
        targets: particle,
        x: particle.x + Math.cos(angle) * speed,
        y: particle.y + Math.sin(angle) * speed,
        alpha: 0,
        scale: 0,
        duration: 600,
        ease: 'Cubic.easeOut',
        onComplete: () => {
          particle.destroy()
        }
      })
    }

    // Add radial flash effect
    const flash = this.add.circle(x, y, 8, 0xffff00, 1)

    this.tweens.add({
      targets: flash,
      radius: 60,
      alpha: 0,
      duration: 400,
      ease: 'Cubic.easeOut',
      onComplete: () => {
        flash.destroy()
      }
    })
  }

  private hasAffordableNodesInTree(treeType: TreeType): boolean {
    const credits = this.gameState.getCredits()
    const tree = this.skillTrees[treeType]

    // Check if any node in this tree can be upgraded and is affordable
    return tree.nodes.some(node => {
      const building = this.gameState.getBuilding(node.id)
      if (!building.canUpgrade()) return false

      // Check if node is available (requirements met) - pass the tree type
      if (!this.isNodeAvailable(node.id, treeType)) return false

      const cost = building.getUpgradeCost()
      return cost > 0 && credits >= cost
    })
  }

  updateAffordabilityIndicators(): void {
    // Update all tab dots
    this.tabObjects.forEach((objects, treeType) => {
      objects.dot.setVisible(this.hasAffordableNodesInTree(treeType))
    })
  }

  shutdown(): void {
    // Clean up party event handler
    if (this.gameStartHandler) {
      partySystem.off('gameStart', this.gameStartHandler)
    }

    // Clean up all event listeners
    this.interactiveObjects.forEach(obj => {
      if (obj && obj.active) {
        obj.removeAllListeners()
      }
    })
    this.interactiveObjects = []

    // Clear containers (they will be destroyed by Phaser)
    this.tabObjects.clear()
  }
}
