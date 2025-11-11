import Phaser from 'phaser'
import { GameState } from '../game/GameState'
import { CharacterType, CHARACTER_CONFIGS } from '../game/Character'
import { WEAPON_CONFIGS } from '../game/Weapon'
import { soundManager, SoundType } from '../game/SoundManager'
import { gameProgression } from '../game/GameProgression'

export default class HangarScene extends Phaser.Scene {
  private gameState!: GameState
  private selectedCharacter!: CharacterType
  private viewingCharacter!: CharacterType
  private listContainer!: Phaser.GameObjects.Container
  private detailContainer!: Phaser.GameObjects.Container
  private isDragging: boolean = false
  private dragStartY: number = 0
  private scrollY: number = 0
  private maxScroll: number = 0
  private hasDragged: boolean = false

  // Track interactive objects and input listeners for cleanup
  private interactiveObjects: Phaser.GameObjects.GameObject[] = []
  private inputListeners: { event: string, handler: Function }[] = []

  constructor() {
    super('HangarScene')
  }

  create() {
    this.gameState = GameState.getInstance()
    this.selectedCharacter = this.gameState.getSelectedCharacter()
    this.viewingCharacter = this.selectedCharacter // Start by viewing the selected ship

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

    // Credits display - moved left to make room for $ button
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
    creditsText.setName('creditsDisplay') // Tag for updates and animations

    // Credit cheat button ($ key) - positioned top right corner
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
      // GameState now delegates to GameProgression - only need one call
      this.gameState.addCredits(1000)
      creditsText.setText(`${this.gameState.getCredits()} ¤`)
      this.tweens.add({
        targets: creditsText,
        scale: 1.3,
        duration: 100,
        yoyo: true,
        onComplete: () => {
          creditsText.setText(`${this.gameState.getCredits()} ¤`)
          this.refreshScene()
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

    backButton.on('pointerover', () => {
      backButton.setColor('#00ff00')
    })

    backButton.on('pointerout', () => {
      backButton.setColor('#00ffff')
    })

    backButton.on('pointerdown', () => {
      this.scene.start('MainMenuScene')
    })

    // Track for cleanup
    this.interactiveObjects.push(backButton)

    // Create left list container (scrollable)
    this.listContainer = this.add.container(0, 140)

    // Create right detail panel container (fixed)
    this.detailContainer = this.add.container(0, 140)

    // Create ship list
    this.createShipList()

    // Create detail panel for viewing character
    this.createDetailPanel()

    // Set up scrolling for list
    this.setupScrolling()
  }

  private createShipList() {
    const allCharacters = Object.values(CharacterType)
    const highestLevel = gameProgression.getHighestLevel()

    // Only show ships that are unlockable at current progression level
    // Show all ships with unlockLevel <= highestLevel + 1
    const characters = allCharacters.filter(type => {
      const config = CHARACTER_CONFIGS[type]
      return config.unlockLevel <= highestLevel + 1
    })

    const listX = 10
    const screenWidth = this.cameras.main.width
    const itemWidth = (screenWidth / 2) - 20 // 50% of screen width minus margins
    const itemHeight = 45 // Reduced from 60 to fit more ships
    const padding = 3 // Spacing between ships

    characters.forEach((type, index) => {
      const y = index * (itemHeight + padding)
      this.createListItem(type, listX, y, itemWidth, itemHeight)
    })
  }

  private createListItem(type: CharacterType, x: number, y: number, width: number, height: number) {
    const config = CHARACTER_CONFIGS[type]
    // Ships with cost 0 are automatically purchased (free ships)
    const autoPurchased = config.cost === 0
    const unlocked = gameProgression.isShipUnlocked(type)
    const purchased = gameProgression.isShipPurchased(type) || autoPurchased
    const isUnlocked = unlocked && purchased
    const canPurchase = unlocked && !purchased && !autoPurchased
    const isSelected = this.selectedCharacter === type
    const isViewing = this.viewingCharacter === type

    const container = this.add.container(x, y)

    // Background - highlight if viewing
    let bgColor = 0x1a1a2a // Locked
    if (isViewing) {
      bgColor = 0x3a4a5a // Viewing (blue tint)
    } else if (isUnlocked) {
      bgColor = 0x2a2a4a // Unlocked
    }

    const bg = this.add.rectangle(
      0, 0,
      width, height,
      bgColor
    ).setOrigin(0, 0)

    container.add(bg)

    // Selected indicator (green dot)
    if (isSelected) {
      const selectedIndicator = this.add.text(
        10, height / 2,
        '►',
        {
          fontFamily: 'Courier New',
          fontSize: '16px',
          color: '#00ff00',
        }
      ).setOrigin(0, 0.5)

      container.add(selectedIndicator)
    }

    // Ship symbol (ASCII art)
    const symbolText = this.add.text(
      isSelected ? 35 : 20, height / 2, // Adjusted for 50% width
      config.symbol,
      {
        fontFamily: 'Courier New',
        fontSize: '20px', // Increased for wider list
        color: isUnlocked ? config.color : '#555555',
      }
    ).setOrigin(0, 0.5)

    container.add(symbolText)

    // Ship name
    const nameText = this.add.text(
      isSelected ? 75 : 60, height / 2 - 8, // Adjusted for 50% width
      config.name,
      {
        fontFamily: 'Courier New',
        fontSize: '12px', // Increased for wider list
        color: isUnlocked ? '#ffffff' : '#888888',
        fontStyle: 'bold',
      }
    ).setOrigin(0, 0)

    container.add(nameText)

    // Lock indicator or weapon info
    if (!isUnlocked) {
      // Check if ship can be purchased (unlocked but not purchased)
      const lockText = this.add.text(
        isSelected ? 75 : 60, height / 2 + 4, // Adjusted for 50% width
        canPurchase ? `${config.cost}¤` : `Unlock: Lv${config.unlockLevel}`,
        {
          fontFamily: 'Courier New',
          fontSize: '10px', // Increased for wider list
          color: canPurchase ? '#ffdd00' : '#ff6666',
        }
      ).setOrigin(0, 0)

      container.add(lockText)

      // Red dot indicator if affordable and can purchase
      if (canPurchase) {
        const canAfford = gameProgression.getCredits() >= config.cost
        if (canAfford) {
          const affordableDot = this.add.circle(
            width - 10,
            10,
            5,
            0xff0000
          )
          container.add(affordableDot)
        }
      }
    } else {
      const weaponConfig = WEAPON_CONFIGS[config.startingWeapon]
      const weaponText = this.add.text(
        isSelected ? 75 : 60, height / 2 + 4, // Adjusted for 50% width
        `${weaponConfig.icon} ${weaponConfig.name}`,
        {
          fontFamily: 'Courier New',
          fontSize: '10px', // Increased for wider list
          color: '#ffaa00',
        }
      ).setOrigin(0, 0)

      container.add(weaponText)
    }

    // Make clickable to view details
    const hitArea = new Phaser.Geom.Rectangle(0, 0, width, height)
    bg.setInteractive(hitArea, Phaser.Geom.Rectangle.Contains)
      .setData('characterType', type)

    bg.on('pointerover', () => {
      if (!this.isDragging && !this.hasDragged) {
        bg.setFillStyle(isViewing ? 0x4a5a6a : 0x3a3a5a)
      }
    })

    bg.on('pointerout', () => {
      bg.setFillStyle(bgColor)
    })

    bg.on('pointerdown', () => {
      this.hasDragged = false
    })

    bg.on('pointerup', () => {
      // Only change viewing if we didn't drag
      if (!this.hasDragged) {
        this.viewingCharacter = type
        this.refreshScene()
      }
    })

    // Track for cleanup
    this.interactiveObjects.push(bg)

    this.listContainer.add(container)
  }

  private createDetailPanel() {
    const config = CHARACTER_CONFIGS[this.viewingCharacter]
    // Ships with cost 0 are automatically purchased (free ships)
    const autoPurchased = config.cost === 0
    const isUnlocked = gameProgression.isShipUnlocked(this.viewingCharacter) && (gameProgression.isShipPurchased(this.viewingCharacter) || autoPurchased)
    const canPurchase = gameProgression.isShipUnlocked(this.viewingCharacter) && !gameProgression.isShipPurchased(this.viewingCharacter) && !autoPurchased
    const isSelected = this.selectedCharacter === this.viewingCharacter

    const screenWidth = this.cameras.main.width
    const panelX = screenWidth / 2 // Start at 50% of screen width
    const panelY = 0
    const panelWidth = (screenWidth / 2) - 10 // 50% of screen width minus margin
    const panelHeight = this.cameras.main.height - 160

    const container = this.add.container(panelX, panelY)

    // Panel background
    const bg = this.add.rectangle(
      0, 0,
      panelWidth, panelHeight,
      0x2a2a4a
    ).setOrigin(0, 0)

    container.add(bg)

    // Large ship symbol
    const symbolText = this.add.text(
      panelWidth / 2, 60,
      config.symbol,
      {
        fontFamily: 'Courier New',
        fontSize: '72px',
        color: isUnlocked ? config.color : '#555555',
      }
    ).setOrigin(0.5)

    container.add(symbolText)

    // Ship name
    const nameText = this.add.text(
      panelWidth / 2, 140,
      config.name,
      {
        fontFamily: 'Courier New',
        fontSize: '24px',
        color: isUnlocked ? '#ffffff' : '#888888',
        fontStyle: 'bold',
      }
    ).setOrigin(0.5)

    container.add(nameText)

    // Ship class description - Hidden to save vertical space
    // const descText = this.add.text(
    //   panelWidth / 2, 165,
    //   config.description,
    //   {
    //     fontFamily: 'Courier New',
    //     fontSize: '14px',
    //     color: '#aaaaaa',
    //     align: 'center',
    //     wordWrap: { width: panelWidth - 40 }
    //   }
    // ).setOrigin(0.5, 0)
    //
    // container.add(descText)

    let currentY = 170

    // Divider
    const divider1 = this.add.rectangle(
      20, currentY,
      panelWidth - 40, 1,
      0x444466
    ).setOrigin(0, 0)

    container.add(divider1)

    currentY += 20

    // Starting weapon
    const weaponConfig = WEAPON_CONFIGS[config.startingWeapon]
    const weaponLabel = this.add.text(
      20, currentY,
      'STARTING WEAPON:',
      {
        fontFamily: 'Courier New',
        fontSize: '12px',
        color: '#888888',
      }
    ).setOrigin(0, 0)

    container.add(weaponLabel)

    const weaponText = this.add.text(
      20, currentY + 18,
      `${weaponConfig.icon} ${weaponConfig.name}`,
      {
        fontFamily: 'Courier New',
        fontSize: '14px',
        color: isUnlocked ? '#ffaa00' : '#666666',
        fontStyle: 'bold',
      }
    ).setOrigin(0, 0)

    container.add(weaponText)

    const weaponDescText = this.add.text(
      20, currentY + 38,
      weaponConfig.description,
      {
        fontFamily: 'Courier New',
        fontSize: '13px',
        color: '#888888',
        wordWrap: { width: panelWidth - 40 }
      }
    ).setOrigin(0, 0)

    container.add(weaponDescText)

    currentY += 80

    // Divider
    const divider2 = this.add.rectangle(
      20, currentY,
      panelWidth - 40, 1,
      0x444466
    ).setOrigin(0, 0)

    container.add(divider2)

    currentY += 20

    // Stats
    const statsLabel = this.add.text(
      20, currentY,
      'STATS:',
      {
        fontFamily: 'Courier New',
        fontSize: '12px',
        color: '#888888',
      }
    ).setOrigin(0, 0)

    container.add(statsLabel)

    const statsText = this.add.text(
      20, currentY + 18,
      `Health: ${config.baseHealth}\nSpeed: ${config.baseMoveSpeed}\nWeapon Slots: ${config.weaponSlots}\nPassive Slots: ${config.passiveSlots}`,
      {
        fontFamily: 'Courier New',
        fontSize: '15px',
        color: isUnlocked ? '#aaaaaa' : '#555555',
      }
    ).setOrigin(0, 0)

    container.add(statsText)

    currentY += 95

    // Divider
    const divider3 = this.add.rectangle(
      20, currentY,
      panelWidth - 40, 1,
      0x444466
    ).setOrigin(0, 0)

    container.add(divider3)

    currentY += 20

    // Innate ability
    const abilityLabel = this.add.text(
      20, currentY,
      'INNATE ABILITY:',
      {
        fontFamily: 'Courier New',
        fontSize: '12px',
        color: '#888888',
      }
    ).setOrigin(0, 0)

    container.add(abilityLabel)

    const abilityText = this.add.text(
      20, currentY + 18,
      config.innateAbility,
      {
        fontFamily: 'Courier New',
        fontSize: '15px',
        color: isUnlocked ? '#00ffaa' : '#555555',
        wordWrap: { width: panelWidth - 40 }
      }
    ).setOrigin(0, 0)

    container.add(abilityText)

    currentY += 60

    // Action button at bottom
    const buttonY = panelHeight - 50

    if (!isUnlocked && !canPurchase) {
      // Ship is locked - show unlock requirement
      const lockedText = this.add.text(
        panelWidth / 2, buttonY,
        `🔒 LOCKED - Beat Level ${config.unlockLevel}`,
        {
          fontFamily: 'Courier New',
          fontSize: '14px',
          color: '#ff6666',
          fontStyle: 'bold',
          align: 'center',
        }
      ).setOrigin(0.5)

      container.add(lockedText)
    } else if (canPurchase) {
      // Ship is unlocked but not purchased - show buy button
      const canAfford = gameProgression.getCredits() >= config.cost

      const buyButton = this.add.rectangle(
        panelWidth / 2, buttonY,
        panelWidth - 40, 40,
        canAfford ? 0x2a4a2a : 0x4a2a2a
      ).setOrigin(0.5).setInteractive({ useHandCursor: true })

      const buyButtonText = this.add.text(
        panelWidth / 2, buttonY,
        `BUY: ${config.cost}¤`,
        {
          fontFamily: 'Courier New',
          fontSize: '16px',
          color: canAfford ? '#00ff00' : '#ff6666',
          fontStyle: 'bold',
        }
      ).setOrigin(0.5)

      // Name components for feedback animations
      buyButton.setName('buyButton')
      buyButtonText.setName('buyButtonText')

      container.add(buyButton)
      container.add(buyButtonText)

      if (canAfford) {
        buyButton.on('pointerover', () => {
          buyButton.setFillStyle(0x3a5a3a)
        })

        buyButton.on('pointerout', () => {
          buyButton.setFillStyle(0x2a4a2a)
        })
      } else {
        buyButton.on('pointerover', () => {
          buyButton.setFillStyle(0x5a2a2a)
        })

        buyButton.on('pointerout', () => {
          buyButton.setFillStyle(0x4a2a2a)
        })
      }

      buyButton.on('pointerdown', () => {
        if (!canAfford) {
          // Can't afford - play feedback animation
          this.playCannotAffordFeedback()
          return
        }

        // Purchase the ship using gameProgression
        const result = gameProgression.purchaseShip(this.viewingCharacter)

        if (result.success) {
          // Play triumphant sound
          soundManager.play(SoundType.SHIP_UNLOCK)

          // Create particle burst effect at button position
          this.createUnlockParticles(panelWidth / 2, buttonY)

          // Also unlock in old GameState system for backwards compatibility
          this.gameState.unlockCharacter(this.viewingCharacter)

          // Update credits display
          const creditsDisplay = this.children.getByName('creditsDisplay') as Phaser.GameObjects.Text
          if (creditsDisplay) {
            creditsDisplay.setText(`${gameProgression.getCredits()} ¤`)
          }

          // Delay refresh slightly so user sees the effect
          this.time.delayedCall(300, () => {
            this.refreshScene()
          })
        }
      })

      // Track for cleanup
      this.interactiveObjects.push(buyButton)
    } else if (!isSelected) {
      const selectButton = this.add.rectangle(
        panelWidth / 2, buttonY,
        panelWidth - 40, 40,
        0x2a4a6a
      ).setOrigin(0.5).setInteractive({ useHandCursor: true })

      const selectButtonText = this.add.text(
        panelWidth / 2, buttonY,
        'SELECT SHIP',
        {
          fontFamily: 'Courier New',
          fontSize: '16px',
          color: '#00ffff',
          fontStyle: 'bold',
        }
      ).setOrigin(0.5)

      container.add(selectButton)
      container.add(selectButtonText)

      selectButton.on('pointerover', () => {
        selectButton.setFillStyle(0x3a5a7a)
      })

      selectButton.on('pointerout', () => {
        selectButton.setFillStyle(0x2a4a6a)
      })

      selectButton.on('pointerdown', () => {
        soundManager.play(SoundType.BUTTON_CLICK)
        if (this.gameState.selectCharacter(this.viewingCharacter)) {
          this.selectedCharacter = this.viewingCharacter

          // Visual feedback before transitioning
          selectButton.setFillStyle(0x4a6a8a)
          selectButtonText.setText('✓ SELECTED')
          selectButtonText.setColor('#00ff00')

          // Brief delay to show selection, then return to menu
          this.time.delayedCall(300, () => {
            this.scene.start('MainMenuScene')
          })
        }
      })

      // Track for cleanup
      this.interactiveObjects.push(selectButton)
    } else {
      // Show SELECTED indicator
      const selectedText = this.add.text(
        panelWidth / 2, buttonY,
        '✓ SELECTED',
        {
          fontFamily: 'Courier New',
          fontSize: '16px',
          color: '#00ff00',
          fontStyle: 'bold',
        }
      ).setOrigin(0.5)

      container.add(selectedText)
    }

    this.detailContainer.add(container)
  }

  private refreshScene() {
    // Clear existing containers
    this.listContainer.removeAll(true)
    this.detailContainer.removeAll(true)

    // Recreate
    this.createShipList()
    this.createDetailPanel()

    // Restore scroll position
    this.listContainer.y = 140 - this.scrollY
  }

  private setupScrolling() {
    const characters = Object.values(CharacterType)
    const itemHeight = 45 // Match createShipList
    const padding = 3 // Match createShipList
    const totalContentHeight = characters.length * (itemHeight + padding)
    const visibleHeight = this.cameras.main.height - 140
    const screenWidth = this.cameras.main.width

    // Calculate max scroll
    this.maxScroll = Math.max(0, totalContentHeight - visibleHeight + 20)

    // Set up interactive area for dragging (only over list area - 50% of screen)
    const dragZone = this.add.zone(
      0, 140,
      screenWidth / 2, // 50% of screen width
      visibleHeight
    ).setOrigin(0, 0).setDepth(-1).setInteractive()

    const DRAG_THRESHOLD = 5
    let totalDragDistance = 0

    dragZone.on('pointerdown', (pointer: Phaser.Input.Pointer) => {
      this.isDragging = true
      this.hasDragged = false
      this.dragStartY = pointer.y
      totalDragDistance = 0
    })

    // Track for cleanup
    this.interactiveObjects.push(dragZone)

    // Use global input for move to capture drags that go outside the zone
    const pointerMoveHandler = (pointer: Phaser.Input.Pointer) => {
      if (this.isDragging) {
        const dragDelta = pointer.y - this.dragStartY

        // Always update scroll position for smooth dragging
        this.scrollY = Phaser.Math.Clamp(
          this.scrollY - dragDelta,
          0,
          this.maxScroll
        )
        this.listContainer.y = 140 - this.scrollY
        this.dragStartY = pointer.y

        // Track total drag distance to determine if this was a drag vs a tap
        totalDragDistance += Math.abs(dragDelta)
        if (totalDragDistance > DRAG_THRESHOLD) {
          this.hasDragged = true
        }
      }
    }
    this.input.on('pointermove', pointerMoveHandler)
    this.inputListeners.push({ event: 'pointermove', handler: pointerMoveHandler })

    // Use global input for pointerup to ensure drag ends even if outside zone
    const pointerUpHandler = () => {
      if (this.isDragging) {
        this.isDragging = false
      }
    }
    this.input.on('pointerup', pointerUpHandler)
    this.inputListeners.push({ event: 'pointerup', handler: pointerUpHandler })

    // Also handle pointerupoutside for when pointer is released outside the game
    const pointerUpOutsideHandler = () => {
      if (this.isDragging) {
        this.isDragging = false
      }
    }
    this.input.on('pointerupoutside', pointerUpOutsideHandler)
    this.inputListeners.push({ event: 'pointerupoutside', handler: pointerUpOutsideHandler })

    // Add mouse wheel scrolling
    const wheelHandler = (pointer: Phaser.Input.Pointer, gameObjects: any[], deltaX: number, deltaY: number) => {
      // Only scroll if pointer is over the list area (left 50% of screen)
      if (pointer.x < screenWidth / 2 && pointer.y > 140) {
        const scrollSpeed = 30 // Pixels per wheel tick
        this.scrollY = Phaser.Math.Clamp(
          this.scrollY + (deltaY > 0 ? scrollSpeed : -scrollSpeed),
          0,
          this.maxScroll
        )
        this.listContainer.y = 140 - this.scrollY
      }
    }
    this.input.on('wheel', wheelHandler)
    this.inputListeners.push({ event: 'wheel', handler: wheelHandler })

    // Add scroll indicator if content is scrollable
    if (this.maxScroll > 0) {
      this.createScrollIndicator(visibleHeight)
    }
  }

  private createScrollIndicator(visibleHeight: number) {
    const screenWidth = this.cameras.main.width
    const scrollbarX = (screenWidth / 2) - 5 // Position at edge of left 50%

    // Scrollbar background
    const scrollbarBg = this.add.rectangle(
      scrollbarX, 140,
      4, visibleHeight,
      0x333344
    ).setOrigin(0, 0).setDepth(100)

    // Scrollbar thumb
    const thumbHeight = Math.max(40, (visibleHeight / (visibleHeight + this.maxScroll)) * visibleHeight)
    const scrollbarThumb = this.add.rectangle(
      scrollbarX, 140,
      4, thumbHeight,
      0x00ffff
    ).setOrigin(0, 0).setDepth(101)

    scrollbarThumb.setName('scrollbarThumb')

    // Update scrollbar position on scroll
    const postUpdateHandler = () => {
      const thumbY = 140 + (this.scrollY / this.maxScroll) * (visibleHeight - thumbHeight)
      scrollbarThumb.setY(thumbY)
    }
    this.events.on('postupdate', postUpdateHandler)
    // Track scene event separately
    this.inputListeners.push({ event: 'scene:postupdate', handler: postUpdateHandler })
  }

  private playCannotAffordFeedback() {
    // Get button elements from detail container (search through all children)
    let buyButton: Phaser.GameObjects.Rectangle | undefined
    let buyButtonText: Phaser.GameObjects.Text | undefined

    // Search recursively through container children
    this.detailContainer.iterate((child: Phaser.GameObjects.GameObject) => {
      if (child.name === 'buyButton') {
        buyButton = child as Phaser.GameObjects.Rectangle
      } else if (child.name === 'buyButtonText') {
        buyButtonText = child as Phaser.GameObjects.Text
      }
      // If child is a container, search its children too
      if (child instanceof Phaser.GameObjects.Container) {
        child.iterate((subChild: Phaser.GameObjects.GameObject) => {
          if (subChild.name === 'buyButton') {
            buyButton = subChild as Phaser.GameObjects.Rectangle
          } else if (subChild.name === 'buyButtonText') {
            buyButtonText = subChild as Phaser.GameObjects.Text
          }
        })
      }
    })

    const creditsDisplay = this.children.getByName('creditsDisplay') as Phaser.GameObjects.Text

    // Wiggle the button - shake left and right
    if (buyButton && buyButtonText) {
      const originalXButton = buyButton.x
      const originalXText = buyButtonText.x

      // Kill existing tweens to prevent stacking
      this.tweens.killTweensOf(buyButton)
      this.tweens.killTweensOf(buyButtonText)

      this.tweens.add({
        targets: buyButton,
        x: originalXButton - 8,
        duration: 50,
        yoyo: true,
        repeat: 3,
        ease: 'Sine.easeInOut',
        onComplete: () => {
          buyButton.setX(originalXButton) // Reset to original position
        }
      })

      this.tweens.add({
        targets: buyButtonText,
        x: originalXText - 8,
        duration: 50,
        yoyo: true,
        repeat: 3,
        ease: 'Sine.easeInOut',
        onComplete: () => {
          buyButtonText.setX(originalXText) // Reset to original position
        }
      })
    }

    // Flash the credits display - scale pulse and color flash
    if (creditsDisplay) {
      const originalScale = creditsDisplay.scale

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
  }

  private createUnlockParticles(x: number, y: number) {
    // Create a burst of colorful particles
    const colors = [0xffaa00, 0x00ffff, 0xff00ff, 0x00ff00, 0xffff00]
    const particleCount = 30

    for (let i = 0; i < particleCount; i++) {
      const angle = (i / particleCount) * Math.PI * 2
      const speed = Phaser.Math.Between(100, 300)
      const color = colors[i % colors.length]

      // Create particle as a small rectangle
      const particle = this.add.rectangle(
        260 + x, // Offset by panel position
        140 + y, // Offset by detail container position
        4, 4,
        color
      )

      // Animate particle outward
      this.tweens.add({
        targets: particle,
        x: particle.x + Math.cos(angle) * speed,
        y: particle.y + Math.sin(angle) * speed,
        alpha: 0,
        scale: 0,
        duration: 800,
        ease: 'Cubic.easeOut',
        onComplete: () => {
          particle.destroy()
        }
      })
    }

    // Add radial flash effect
    const flash = this.add.circle(
      260 + x,
      140 + y,
      10,
      0xffffff,
      1
    )

    this.tweens.add({
      targets: flash,
      radius: 100,
      alpha: 0,
      duration: 500,
      ease: 'Cubic.easeOut',
      onComplete: () => {
        flash.destroy()
      }
    })
  }

  shutdown(): void {
    // Clean up all game object event listeners
    this.interactiveObjects.forEach(obj => {
      if (obj && obj.active) {
        obj.removeAllListeners()
      }
    })
    this.interactiveObjects = []

    // Clean up input and scene event listeners
    this.inputListeners.forEach(({ event, handler }) => {
      if (event.startsWith('scene:')) {
        // Scene events
        const sceneEvent = event.split(':')[1]
        this.events.off(sceneEvent, handler as any)
      } else {
        // Input events
        this.input.off(event, handler as any)
      }
    })
    this.inputListeners = []
  }
}
