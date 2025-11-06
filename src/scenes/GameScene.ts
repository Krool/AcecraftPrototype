import Phaser from 'phaser'
import { ProjectileGroup } from '../game/Projectile'
import { EnemyGroup, EnemyType } from '../game/Enemy'
import { EnemyProjectileGroup } from '../game/EnemyProjectile'
import { XPDropGroup, XPSize } from '../game/XPDrop'
import { CreditDropGroup } from '../game/CreditDrop'
import { PowerUpGroup, PowerUpType, POWERUP_CONFIGS } from '../game/PowerUp'
import { Weapon, WeaponType, WeaponFactory, WeaponModifiers, DEFAULT_MODIFIERS } from '../game/Weapon'
import { Passive, PassiveType, PassiveFactory, PlayerStats } from '../game/Passive'
import { Character, CharacterType, CharacterFactory } from '../game/Character'
import { EvolutionManager, EvolutionRecipe, EVOLUTION_RECIPES } from '../game/Evolution'
import { GameState, TutorialStep } from '../game/GameState'
import { CampaignManager } from '../game/Campaign'

export default class GameScene extends Phaser.Scene {
  private gameState!: GameState
  private isTutorial: boolean = false
  private player!: Phaser.GameObjects.Text
  private cursors!: Phaser.Types.Input.Keyboard.CursorKeys
  private playerSpeed: number = 300
  private projectiles!: ProjectileGroup
  private enemies!: EnemyGroup
  private enemyProjectiles!: EnemyProjectileGroup
  private xpDrops!: XPDropGroup
  private creditDrops!: CreditDropGroup
  private powerUps!: PowerUpGroup
  private campaignManager!: CampaignManager
  private campaignLevelText!: Phaser.GameObjects.Text
  private enemiesRemainingText!: Phaser.GameObjects.Text
  private fireRate: number = 250 // Time between shots in milliseconds
  private baseFireRate: number = 250
  private nextFireTime: number = 0
  private enemySpawnRate: number = 1500 // Time between enemy spawns in milliseconds
  private nextEnemySpawnTime: number = 0
  private baseEnemySpawnRate: number = 1500
  private minEnemySpawnRate: number = 400 // Minimum spawn rate (maximum difficulty)
  private totalXP: number = 0
  private xpText!: Phaser.GameObjects.Text
  private level: number = 1
  private xpToNextLevel: number = 10
  private levelText!: Phaser.GameObjects.Text
  private health: number = 100
  private maxHealth: number = 100
  private healthText!: Phaser.GameObjects.Text
  private healthBarBackground!: Phaser.GameObjects.Rectangle
  private healthBarFill!: Phaser.GameObjects.Rectangle
  private xpBarBackground!: Phaser.GameObjects.Rectangle
  private xpBarFill!: Phaser.GameObjects.Rectangle
  private isPaused: boolean = false
  private upgradeContainer!: Phaser.GameObjects.Container

  // Combo system
  private comboCount: number = 0
  private comboTimer: number = 0
  private comboTimeout: number = 3000 // 3 seconds to maintain combo
  private comboText!: Phaser.GameObjects.Text
  private comboMultiplier: number = 1

  // Active power-ups
  private hasShield: boolean = false
  private shieldEndTime: number = 0
  private hasRapidFirePowerUp: boolean = false
  private rapidFireEndTime: number = 0
  private hasMagnet: boolean = false
  private magnetEndTime: number = 0
  private powerUpText!: Phaser.GameObjects.Text

  // Score and timer
  private score: number = 0
  private scoreText!: Phaser.GameObjects.Text
  private survivalTime: number = 0
  private timerText!: Phaser.GameObjects.Text
  private highScore: number = 0

  // Character stats tracking
  private totalDamageDealt: number = 0
  private killCount: number = 0
  private runStartTime: number = 0

  // Player stats
  private projectileDamage: number = 10
  private projectileSpeed: number = 500
  private projectilePierce: number = 0
  private projectileCount: number = 1 // Number of projectiles fired at once
  private hasSpreadShot: boolean = false

  // New weapon/passive/character system
  private weapons: Weapon[] = []
  private passives: Passive[] = []
  private character!: Character
  private maxWeaponSlots: number = 4
  private maxPassiveSlots: number = 4
  private weaponModifiers: WeaponModifiers = { ...DEFAULT_MODIFIERS }
  private playerStats: PlayerStats = {
    maxHealth: 100,
    currentHealth: 100,
    moveSpeed: 300,
    pickupRadius: 100,
    damageReduction: 0,
    dodgeChance: 0,
  }
  private weaponSlotsText!: Phaser.GameObjects.Text
  private passiveSlotsText!: Phaser.GameObjects.Text
  private evolutionManager!: EvolutionManager
  private discoveredEvolutions: Set<string> = new Set() // Track discovered evolutions
  private starFieldTweens: Phaser.Tweens.Tween[] = [] // Track tweens for pausing

  constructor() {
    super('GameScene')
  }

  create(data?: { isTutorial?: boolean }) {
    // Check if this is a tutorial run
    this.isTutorial = data?.isTutorial || false
    console.log('GameScene - isTutorial:', this.isTutorial, 'data:', data)

    // If this is tutorial, set the tutorial step now
    if (this.isTutorial) {
      this.gameState = GameState.getInstance()
      this.gameState.setTutorialStep(TutorialStep.FIRST_BATTLE)
      console.log('Tutorial battle started - set step to FIRST_BATTLE')
    }

    // Reset all game state variables (important for scene restart)
    this.totalXP = 0
    this.level = 1
    this.xpToNextLevel = 10
    this.health = 100
    this.maxHealth = 100
    this.isPaused = false
    this.playerSpeed = 300
    this.projectileDamage = 10
    this.projectileSpeed = 500
    this.projectilePierce = 0
    this.projectileCount = 1
    this.hasSpreadShot = false
    this.fireRate = 250
    this.nextFireTime = 0
    this.enemySpawnRate = 1500
    this.baseEnemySpawnRate = 1500
    this.minEnemySpawnRate = 400
    this.nextEnemySpawnTime = 0
    this.comboCount = 0
    this.comboTimer = 0
    this.comboMultiplier = 1
    this.hasShield = false
    this.shieldEndTime = 0
    this.hasRapidFirePowerUp = false
    this.rapidFireEndTime = 0
    this.hasMagnet = false
    this.magnetEndTime = 0
    this.baseFireRate = 250
    this.score = 0
    this.survivalTime = 0
    this.totalDamageDealt = 0
    this.killCount = 0
    this.runStartTime = 0
    this.discoveredEvolutions = new Set()
    this.starFieldTweens = []
    // Load high score from localStorage
    this.highScore = parseInt(localStorage.getItem('roguecraft_highscore') || '0')

    // Add background
    this.add.rectangle(0, 0, this.cameras.main.width, this.cameras.main.height, 0x1a1a2e)
      .setOrigin(0, 0)

    // Add scrolling star field
    this.createStarField()

    // Create UI containers
    // Top container (semi-transparent dark)
    const topContainerHeight = 60
    this.add.rectangle(
      0, 0,
      this.cameras.main.width,
      topContainerHeight,
      0x000000,
      0.5
    ).setOrigin(0, 0).setDepth(10)

    // Bottom container (semi-transparent dark)
    const bottomContainerHeight = 80
    this.add.rectangle(
      0,
      this.cameras.main.height - bottomContainerHeight,
      this.cameras.main.width,
      bottomContainerHeight,
      0x000000,
      0.5
    ).setOrigin(0, 0).setDepth(10)

    // Setup keyboard controls
    this.cursors = this.input.keyboard!.createCursorKeys()

    // Add score and timer (top right, on same line)
    this.scoreText = this.add.text(
      this.cameras.main.width - 10,
      10,
      `Score: 0 | High: ${this.highScore}`,
      {
        fontFamily: 'Courier New',
        fontSize: '14px',
        color: '#ffff00',
        align: 'right'
      }
    ).setOrigin(1, 0).setDepth(11)

    // Add timer (top right, second line)
    this.timerText = this.add.text(
      this.cameras.main.width - 10,
      30,
      '⏱ 0:00',
      {
        fontFamily: 'Courier New',
        fontSize: '14px',
        color: '#00ffff',
        align: 'right'
      }
    ).setOrigin(1, 0).setDepth(11)

    // Add Level counter
    this.levelText = this.add.text(10, 10, 'Level: 1', {
      fontFamily: 'Courier New',
      fontSize: '16px',
      color: '#00ffff',
    }).setDepth(11)

    // Create XP bar with label
    const xpBarWidth = 200
    const xpBarHeight = 15
    const xpBarX = 10
    const xpBarY = 32

    this.xpBarBackground = this.add.rectangle(
      xpBarX,
      xpBarY,
      xpBarWidth,
      xpBarHeight,
      0x333300
    ).setOrigin(0, 0).setDepth(11)

    this.xpBarFill = this.add.rectangle(
      xpBarX + 2,
      xpBarY + 2,
      0, // Start at 0 width
      xpBarHeight - 4,
      0xffff00
    ).setOrigin(0, 0).setDepth(11)

    // XP text overlaid on bar
    this.xpText = this.add.text(xpBarX + xpBarWidth / 2, xpBarY + xpBarHeight / 2, 'XP: 0 / 10', {
      fontFamily: 'Courier New',
      fontSize: '12px',
      color: '#000000',
      fontStyle: 'bold'
    }).setOrigin(0.5).setDepth(12)

    // Create health bar below player (will be positioned dynamically)
    const healthBarWidth = 60
    const healthBarHeight = 12

    this.healthBarBackground = this.add.rectangle(
      0, 0,
      healthBarWidth,
      healthBarHeight,
      0x550000
    ).setOrigin(0.5, 0).setDepth(50).setVisible(false)

    this.healthBarFill = this.add.rectangle(
      0, 0,
      healthBarWidth - 2,
      healthBarHeight - 2,
      0x00ff00
    ).setOrigin(0, 0).setDepth(51).setVisible(false)

    // Health text (overlaid on bar)
    this.healthText = this.add.text(0, 0, '100', {
      fontFamily: 'Courier New',
      fontSize: '10px',
      color: '#000000',
      fontStyle: 'bold'
    }).setOrigin(0.5).setDepth(52).setVisible(false)

    // Create combo text (below timer)
    this.comboText = this.add.text(
      this.cameras.main.width - 10,
      50,
      '',
      {
        fontFamily: 'Courier New',
        fontSize: '14px',
        color: '#ffaa00',
        fontStyle: 'bold',
        align: 'right'
      }
    ).setOrigin(1, 0).setVisible(false).setDepth(11)

    // Create power-up status text
    this.powerUpText = this.add.text(
      this.cameras.main.centerX,
      this.cameras.main.height - 50,
      '',
      {
        fontFamily: 'Courier New',
        fontSize: '16px',
        color: '#00ffff',
      }
    ).setOrigin(0.5).setDepth(11)

    // Create weapon slots display (bottom left)
    this.weaponSlotsText = this.add.text(
      10,
      this.cameras.main.height - 70,
      '',
      {
        fontFamily: 'Courier New',
        fontSize: '28px',
        color: '#ffaa00',
      }
    ).setOrigin(0, 0).setDepth(11)

    // Create passive slots display (bottom right)
    this.passiveSlotsText = this.add.text(
      this.cameras.main.width - 10,
      this.cameras.main.height - 70,
      '',
      {
        fontFamily: 'Courier New',
        fontSize: '28px',
        color: '#00ffaa',
        align: 'right'
      }
    ).setOrigin(1, 0).setDepth(11)

    // Create projectile group
    this.projectiles = new ProjectileGroup(this, 200)

    // Create enemy group
    this.enemies = new EnemyGroup(this, 100, 50)

    // Create enemy projectile group
    this.enemyProjectiles = new EnemyProjectileGroup(this, 150)

    // Initialize character and starting weapon FIRST (so we know what ship to display)
    this.gameState = GameState.getInstance()
    this.evolutionManager = new EvolutionManager(this)
    const selectedCharacterType = this.gameState.getSelectedCharacter()
    this.character = CharacterFactory.create(this, selectedCharacterType)

    // Create player with character's symbol and color
    const characterConfig = this.character.getConfig()
    this.player = this.add.text(
      this.cameras.main.centerX,
      this.cameras.main.height - 100,
      characterConfig.symbol,
      {
        fontFamily: 'Courier New',
        fontSize: '48px',
        color: characterConfig.color,
      }
    ).setOrigin(0.5)

    // Enable physics on player
    this.physics.add.existing(this.player)
    const playerBody = this.player.body as Phaser.Physics.Arcade.Body
    playerBody.setCollideWorldBounds(true)

    // Now link enemy projectiles and player reference to enemies
    this.enemies.setProjectileGroup(this.enemyProjectiles)
    this.enemies.setPlayerReference(this.player)

    // Create XP drop group
    this.xpDrops = new XPDropGroup(this, 100)

    // Create credit drop group
    this.creditDrops = new CreditDropGroup(this, 50)

    // Create power-up group
    this.powerUps = new PowerUpGroup(this, 20)

    // Initialize campaign manager
    this.campaignManager = new CampaignManager()
    // Start at level 0 for tutorial, level 1 for regular play
    const campaignLevel = this.isTutorial ? 0 : 1
    console.log('GameScene - Setting campaign level:', campaignLevel)
    this.campaignManager.setLevel(campaignLevel)
    console.log('GameScene - Current level:', this.campaignManager.getCurrentLevel())

    // Create campaign level text (top left, under level)
    this.campaignLevelText = this.add.text(
      10, 50,
      `Mission: ${this.campaignManager.getCurrentLevel().name}`,
      {
        fontFamily: 'Courier New',
        fontSize: '12px',
        color: '#ffaa00',
      }
    ).setDepth(11)

    // Enemies remaining text
    this.enemiesRemainingText = this.add.text(
      10, 65,
      'Wave 1/1',
      {
        fontFamily: 'Courier New',
        fontSize: '11px',
        color: '#aaaaaa',
      }
    ).setDepth(11)

    // Setup collision detection
    this.physics.add.overlap(
      this.projectiles,
      this.enemies,
      this.handleProjectileEnemyCollision as Phaser.Types.Physics.Arcade.ArcadePhysicsCallback,
      undefined,
      this
    )

    // Player collision with enemies
    this.physics.add.overlap(
      this.player,
      this.enemies,
      this.handlePlayerEnemyCollision as Phaser.Types.Physics.Arcade.ArcadePhysicsCallback,
      undefined,
      this
    )

    // Player collision with power-ups
    this.physics.add.overlap(
      this.player,
      this.powerUps,
      this.handlePowerUpCollection as Phaser.Types.Physics.Arcade.ArcadePhysicsCallback,
      undefined,
      this
    )

    // Enemy projectiles hit player
    this.physics.add.overlap(
      this.player,
      this.enemyProjectiles,
      this.handleEnemyProjectileHit as Phaser.Types.Physics.Arcade.ArcadePhysicsCallback,
      undefined,
      this
    )

    // Setup event listeners
    this.events.on('enemyDied', this.handleEnemyDied, this)
    this.events.on('xpCollected', this.handleXPCollected, this)
    this.events.on('creditCollected', this.handleCreditCollected, this)
    this.events.on('enemyExplosion', this.handleEnemyExplosion, this)
    this.events.on('enemySplit', this.handleEnemySplit, this)
    this.events.on('healNearbyEnemies', this.handleHealNearby, this)

    // Add touch/mouse controls (invisible joystick simulation)
    this.setupTouchControls()

    // Finish initializing character weapons and stats (player and character were already created above)
    this.finishCharacterInitialization()
  }

  private finishCharacterInitialization() {

    // Get character's starting weapon and slot configuration
    const startingWeaponType = this.character.getStartingWeapon()
    this.maxWeaponSlots = this.character.getWeaponSlots()
    this.maxPassiveSlots = this.character.getPassiveSlots()

    // Create and add starting weapon
    const startingWeapon = WeaponFactory.create(this, startingWeaponType, this.projectiles)
    this.weapons.push(startingWeapon)

    // Update player stats based on character
    this.playerStats.maxHealth = this.character.getBaseHealth()
    this.playerStats.currentHealth = this.playerStats.maxHealth
    this.playerStats.moveSpeed = this.character.getBaseMoveSpeed()

    this.maxHealth = this.playerStats.maxHealth
    this.health = this.playerStats.currentHealth
    this.playerSpeed = this.playerStats.moveSpeed

    this.updateHealthDisplay()
    this.updateSlotsDisplay()
  }

  private updateSlotsDisplay() {
    // Build weapon slots - just icons with level indicators
    let weaponText = ''
    this.weapons.forEach((weapon, index) => {
      const config = weapon.getConfig()
      const level = weapon.getLevel()
      const levelDots = '•'.repeat(level)
      weaponText += `${config.icon}${levelDots} `
    })
    // Show empty slots
    for (let i = this.weapons.length; i < this.maxWeaponSlots; i++) {
      weaponText += `[ ] `
    }

    // Build passive slots - just icons with level indicators
    let passiveText = ''
    this.passives.forEach((passive, index) => {
      const config = passive.getConfig()
      const level = passive.getLevel()
      const levelDots = '•'.repeat(level)
      passiveText += `${config.icon}${levelDots} `
    })
    // Show empty slots
    for (let i = this.passives.length; i < this.maxPassiveSlots; i++) {
      passiveText += `[ ] `
    }

    this.weaponSlotsText.setText(weaponText.trim())
    this.passiveSlotsText.setText(passiveText.trim())
  }

  private calculateModifiers() {
    // Reset modifiers to defaults
    this.weaponModifiers = { ...DEFAULT_MODIFIERS }

    // Reset player stats to base values
    this.playerStats.maxHealth = this.character.getBaseHealth()
    this.playerStats.moveSpeed = this.character.getBaseMoveSpeed()
    this.playerStats.pickupRadius = 100
    this.playerStats.damageReduction = 0
    this.playerStats.dodgeChance = 0

    // Apply all passive modifiers
    this.passives.forEach(passive => {
      passive.applyModifiers(this.weaponModifiers)
      passive.applyPlayerEffects(this.playerStats)
    })

    // Apply character innate ability
    if (this.character) {
      this.character.applyInnateAbility(this.weaponModifiers, this.playerStats)
    }

    // Apply calculated stats to game state
    this.maxHealth = this.playerStats.maxHealth
    this.playerSpeed = this.playerStats.moveSpeed
  }

  // Check if adding this weapon or passive would create an evolution
  private checkEvolutionHint(weaponType?: WeaponType, passiveType?: PassiveType): string | null {
    // Only show hints if we've discovered at least one evolution
    if (this.discoveredEvolutions.size === 0) {
      return null
    }

    // Get current max level weapons and passives
    const maxLevelWeapons = this.weapons.filter(w => w.isMaxLevel()).map(w => w.getConfig().type)
    const maxLevelPassives = this.passives.filter(p => p.isMaxLevel()).map(p => p.getConfig().type)

    // Check if adding this weapon would create an evolution
    if (weaponType) {
      for (const recipe of EVOLUTION_RECIPES) {
        if (recipe.baseWeapon === weaponType && maxLevelPassives.includes(recipe.requiredPassive)) {
          const recipeKey = `${recipe.baseWeapon}_${recipe.requiredPassive}`
          if (this.discoveredEvolutions.has(recipeKey)) {
            const evolutionConfig = this.evolutionManager.getEvolutionConfig(recipe.evolution)
            return `⚡ Evolves → ${evolutionConfig.name}`
          }
        }
      }
    }

    // Check if adding this passive would create an evolution
    if (passiveType) {
      for (const recipe of EVOLUTION_RECIPES) {
        if (recipe.requiredPassive === passiveType && maxLevelWeapons.includes(recipe.baseWeapon)) {
          const recipeKey = `${recipe.baseWeapon}_${recipe.requiredPassive}`
          if (this.discoveredEvolutions.has(recipeKey)) {
            const evolutionConfig = this.evolutionManager.getEvolutionConfig(recipe.evolution)
            return `⚡ Evolves → ${evolutionConfig.name}`
          }
        }
      }
    }

    return null
  }

  private generateUpgradeOptions(): Array<{ name: string; description: string; effect: () => void; icon?: string; color?: string }> {
    const options: Array<{ name: string; description: string; effect: () => void; icon?: string; color?: string }> = []

    // Check for evolutions FIRST (highest priority)
    const availableEvolution = this.evolutionManager.checkForEvolutions(this.weapons, this.passives)
    if (availableEvolution) {
      const evolutionConfig = this.evolutionManager.getEvolutionConfig(availableEvolution.evolution)
      options.push({
        name: `⚡ ${evolutionConfig.name} ⚡`,
        description: `[EVOLUTION] ${evolutionConfig.description}`,
        icon: evolutionConfig.icon,
        color: '#ffff00',
        effect: () => {
          // Find and remove the base weapon
          const weaponIndex = this.weapons.findIndex(w => w.getConfig().type === availableEvolution.baseWeapon)
          if (weaponIndex !== -1) {
            this.weapons.splice(weaponIndex, 1)
          }

          // Create and add the evolved weapon
          const evolvedWeapon = this.evolutionManager.createEvolvedWeapon(
            availableEvolution.evolution,
            this.projectiles
          )
          this.weapons.push(evolvedWeapon)

          // Mark this evolution recipe as discovered
          const recipeKey = `${availableEvolution.baseWeapon}_${availableEvolution.requiredPassive}`
          this.discoveredEvolutions.add(recipeKey)
        }
      })
    }

    // Add weapon upgrade options
    this.weapons.forEach(weapon => {
      if (!weapon.isMaxLevel()) {
        const config = weapon.getConfig()
        options.push({
          name: `${config.name} Level Up`,
          description: `Level ${weapon.getLevel()} → ${weapon.getLevel() + 1}`,
          icon: config.icon,
          color: config.color,
          effect: () => {
            weapon.levelUp()
          }
        })
      }
    })

    // Add new weapon options (if slots available)
    if (this.weapons.length < this.maxWeaponSlots) {
      const availableWeapons = [
        WeaponType.SHOTGUN,
        WeaponType.LIGHTNING,
        WeaponType.FIRE,
        WeaponType.GUN_BUDDY,
        WeaponType.ICE,
        WeaponType.WATER,
        WeaponType.EARTH,
        WeaponType.DARK,
        WeaponType.LASER_BEAM,
        WeaponType.RICOCHET_DISK,
        WeaponType.MISSILE_POD
      ]
      const ownedTypes = this.weapons.map(w => w.getConfig().type)

      availableWeapons.forEach(type => {
        if (!ownedTypes.includes(type)) {
          const weapon = WeaponFactory.create(this, type, this.projectiles)
          const config = weapon.getConfig()

          // Check for evolution hint
          const evolutionHint = this.checkEvolutionHint(type, undefined)
          const description = evolutionHint
            ? `${config.description}\n\n${evolutionHint}`
            : config.description

          options.push({
            name: config.name,
            description: description,
            icon: config.icon,
            color: config.color,
            effect: () => {
              const newWeapon = WeaponFactory.create(this, type, this.projectiles)
              this.weapons.push(newWeapon)
            }
          })
        }
      })
    }

    // Add passive upgrade options
    this.passives.forEach(passive => {
      if (!passive.isMaxLevel()) {
        const config = passive.getConfig()
        options.push({
          name: `${config.name} Level Up`,
          description: `Level ${passive.getLevel()} → ${passive.getLevel() + 1}`,
          icon: config.icon,
          color: config.color,
          effect: () => {
            passive.levelUp()
          }
        })
      }
    })

    // Add new passive options (if slots available)
    if (this.passives.length < this.maxPassiveSlots) {
      const availablePassives = [
        PassiveType.BALLISTICS,
        PassiveType.WEAPON_SPEED_UP,
        PassiveType.SHIP_ARMOR,
        PassiveType.ENERGY_CORE,
        PassiveType.PICKUP_RADIUS,
        PassiveType.EVASION_DRIVE,
        PassiveType.CRITICAL_SYSTEMS,
        PassiveType.THRUSTER_MOD,
        PassiveType.OVERDRIVE_REACTOR,
        PassiveType.SALVAGE_UNIT,
        PassiveType.DRONE_BAY_EXPANSION
      ]
      const ownedTypes = this.passives.map(p => p.getConfig().type)

      availablePassives.forEach(type => {
        if (!ownedTypes.includes(type)) {
          const passive = PassiveFactory.create(this, type)
          const config = passive.getConfig()

          // Check for evolution hint
          const evolutionHint = this.checkEvolutionHint(undefined, type)
          const description = evolutionHint
            ? `${config.description}\n\n${evolutionHint}`
            : config.description

          options.push({
            name: config.name,
            description: description,
            icon: config.icon,
            color: config.color,
            effect: () => {
              const newPassive = PassiveFactory.create(this, type)
              this.passives.push(newPassive)
            }
          })
        }
      })
    }

    return options
  }

  private createStarField() {
    // Create multiple layers of stars for parallax effect (reduced for less distraction)
    const starLayers = [
      { count: 20, speed: 20, size: 1, brightness: 0.15 },
      { count: 10, speed: 40, size: 1, brightness: 0.25 },
      { count: 5, speed: 60, size: 2, brightness: 0.35 },
    ]

    starLayers.forEach(layer => {
      for (let i = 0; i < layer.count; i++) {
        const x = Phaser.Math.Between(0, this.cameras.main.width)
        const y = Phaser.Math.Between(0, this.cameras.main.height)

        const alpha = layer.brightness
        const star = this.add.circle(x, y, layer.size, 0xffffff, alpha)

        // Animate star scrolling downward
        const tween = this.tweens.add({
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

        // Store tween for pausing later
        this.starFieldTweens.push(tween)
      }
    })
  }

  private setupTouchControls() {
    let isDragging = false
    let lastPlayerX = 0
    let lastPlayerY = 0

    this.input.on('pointerdown', (pointer: Phaser.Input.Pointer) => {
      if (!this.isPaused) {
        isDragging = true
        lastPlayerX = this.player.x
        lastPlayerY = this.player.y
      }
    })

    this.input.on('pointermove', (pointer: Phaser.Input.Pointer) => {
      if (isDragging && !this.isPaused) {
        const playerBody = this.player.body as Phaser.Physics.Arcade.Body

        // Directly set player position based on pointer movement
        const newX = lastPlayerX + pointer.x - pointer.downX
        const newY = lastPlayerY + pointer.y - pointer.downY

        // Clamp to world bounds
        const clampedX = Phaser.Math.Clamp(newX, 0, this.cameras.main.width)
        const clampedY = Phaser.Math.Clamp(newY, 0, this.cameras.main.height)

        this.player.setPosition(clampedX, clampedY)
        playerBody.updateFromGameObject()
      }
    })

    this.input.on('pointerup', () => {
      isDragging = false
    })
  }

  private updateDifficulty(time: number) {
    // Gradually increase difficulty over time
    // Reduce spawn rate by 1ms per second (capped at minimum)
    const timeInSeconds = time / 1000
    const difficultyReduction = timeInSeconds * 1
    this.enemySpawnRate = Math.max(
      this.minEnemySpawnRate,
      this.baseEnemySpawnRate - difficultyReduction
    )
  }

  private spawnEnemyBasedOnDifficulty(x: number, y: number) {
    // Enemy spawn probabilities change based on level
    // Higher levels = more difficult enemies
    const rand = Math.random() * 100
    let type: EnemyType

    if (this.level <= 2) {
      // Early game: mostly basic enemies
      if (rand < 70) {
        type = EnemyType.BASIC
      } else if (rand < 90) {
        type = EnemyType.FAST
      } else {
        type = EnemyType.ELITE
      }
    } else if (this.level <= 5) {
      // Mid game: more variety
      if (rand < 40) {
        type = EnemyType.BASIC
      } else if (rand < 65) {
        type = EnemyType.FAST
      } else if (rand < 85) {
        type = EnemyType.ELITE
      } else {
        type = EnemyType.TANK
      }
    } else {
      // Late game: harder enemies more common
      if (rand < 20) {
        type = EnemyType.BASIC
      } else if (rand < 45) {
        type = EnemyType.FAST
      } else if (rand < 70) {
        type = EnemyType.ELITE
      } else {
        type = EnemyType.TANK
      }
    }

    this.enemies.spawnEnemy(x, y, type)
  }

  update(time: number, delta: number) {
    // Set run start time on first update
    if (this.runStartTime === 0 && !this.isPaused) {
      this.runStartTime = time
    }

    const playerBody = this.player.body as Phaser.Physics.Arcade.Body

    // Only allow player movement if not paused
    if (!this.isPaused) {
      // Keyboard controls
      if (this.cursors.left.isDown) {
        playerBody.setVelocityX(-this.playerSpeed)
      } else if (this.cursors.right.isDown) {
        playerBody.setVelocityX(this.playerSpeed)
      } else if (!this.input.activePointer.isDown) {
        playerBody.setVelocityX(0)
      }

      if (this.cursors.up.isDown) {
        playerBody.setVelocityY(-this.playerSpeed)
      } else if (this.cursors.down.isDown) {
        playerBody.setVelocityY(this.playerSpeed)
      } else if (!this.input.activePointer.isDown) {
        playerBody.setVelocityY(0)
      }
    } else {
      // Stop player movement when paused
      playerBody.setVelocityX(0)
      playerBody.setVelocityY(0)
    }

    // Auto-fire weapons (only if not paused)
    if (!this.isPaused) {
      // Calculate modifiers from passives and character
      this.calculateModifiers()

      // Fire all equipped weapons
      this.weapons.forEach(weapon => {
        if (weapon.canFire(time)) {
          weapon.fire(this.player.x, this.player.y - 30, this.weaponModifiers)
          weapon.setLastFireTime(time)
        }
      })
    }

    // Spawn enemies from campaign (only if not paused)
    if (!this.isPaused) {
      const nextEnemy = this.campaignManager.getNextEnemy(time)
      if (nextEnemy) {
        console.log('Spawning enemy:', nextEnemy.type, 'at time:', time)
        const randomX = Phaser.Math.Between(50, this.cameras.main.width - 50)

        // Spawn in cluster if specified
        if (nextEnemy.clustered) {
          const clusterSize = 3
          for (let i = 0; i < clusterSize; i++) {
            const offsetX = (i - 1) * 30 // Spread them out
            this.enemies.spawnEnemy(randomX + offsetX, -50, nextEnemy.type)
          }
        } else {
          this.enemies.spawnEnemy(randomX, -50, nextEnemy.type)
        }
      }

      // Check for level completion
      if (this.campaignManager.isLevelComplete() && this.enemies.getActiveCount() === 0) {
        console.log('Level complete! All waves done and all enemies defeated.')
        this.levelCompleted()
      }

      // Update campaign progress display
      const progress = this.campaignManager.getProgress()
      this.enemiesRemainingText.setText(`Wave ${progress.wave}/${progress.totalWaves}`)

      // Debug: Log when waves complete
      if (this.campaignManager.isLevelComplete()) {
        const activeEnemies = this.enemies.getActiveCount()
        if (activeEnemies > 0 && time % 1000 < 16) { // Log once per second
          console.log(`All waves complete! Waiting for ${activeEnemies} enemies to be defeated...`)
        }
      }
    }

    // Update projectiles, enemies, and XP drops (only if not paused)
    if (!this.isPaused) {
      this.projectiles.update()
      this.enemies.update(time, delta)
      this.enemyProjectiles.update()

      // Update XP drops with magnet effect if active
      if (this.hasMagnet) {
        this.xpDrops.update(this.player.x, this.player.y, 300) // Larger attraction radius
      } else {
        this.xpDrops.update(this.player.x, this.player.y)
      }

      // Update credit drops with same magnet effect
      if (this.hasMagnet) {
        this.creditDrops.update(this.player.x, this.player.y, 300)
      } else {
        this.creditDrops.update(this.player.x, this.player.y)
      }

      this.powerUps.update()

      // Update combo timer
      if (this.comboCount > 0) {
        this.comboTimer -= delta
        if (this.comboTimer <= 0) {
          this.resetCombo()
        }
      }

      // Update power-up timers
      this.updatePowerUpTimers(time)

      // Update survival timer
      this.survivalTime = Math.floor(time / 1000)
      const minutes = Math.floor(this.survivalTime / 60)
      const seconds = this.survivalTime % 60
      this.timerText.setText(`⏱ ${minutes}:${seconds.toString().padStart(2, '0')}`)

      // Update health bar position to follow player
      this.updateHealthDisplay()
    }
  }

  private handleEnemyDied(data: { x: number; y: number; xpValue: number }) {
    // Increment combo and kill count
    this.comboCount++
    this.killCount++
    this.comboTimer = this.comboTimeout
    this.updateCombo()

    // Apply combo multiplier to XP and score
    const multipliedXP = Math.floor(data.xpValue * this.comboMultiplier)
    const scoreGain = Math.floor(data.xpValue * 10 * this.comboMultiplier)

    // Add to score
    this.score += scoreGain
    this.scoreText.setText(`Score: ${this.score} | High: ${Math.max(this.score, this.highScore)}`)

    // Award meta currency (credits) - 1 credit per 5 XP
    const creditsEarned = Math.floor(multipliedXP / 5)
    if (creditsEarned > 0) {
      this.gameState.addCredits(creditsEarned)
    }

    // Spawn XP drop at enemy position
    this.xpDrops.spawnXP(data.x, data.y, multipliedXP)

    // Chance to spawn credit drop (25% chance)
    if (Math.random() < 0.25) {
      const creditAmount = Math.max(1, Math.floor(data.xpValue / 10))
      this.creditDrops.spawnCredit(data.x, data.y, creditAmount)
    }

    // Chance to spawn power-up (10% chance)
    if (Math.random() < 0.10) {
      this.powerUps.spawnRandomPowerUp(data.x, data.y)
    }

    // Create particle explosion effect
    this.createExplosionEffect(data.x, data.y)
  }

  private updateCombo() {
    // Calculate multiplier based on combo
    if (this.comboCount >= 50) {
      this.comboMultiplier = 4
    } else if (this.comboCount >= 25) {
      this.comboMultiplier = 3
    } else if (this.comboCount >= 10) {
      this.comboMultiplier = 2
    } else if (this.comboCount >= 5) {
      this.comboMultiplier = 1.5
    } else {
      this.comboMultiplier = 1
    }

    // Update combo display
    if (this.comboCount >= 5) {
      this.comboText.setText(`${this.comboCount}x COMBO`)
      this.comboText.setVisible(true)

      // Color based on multiplier
      if (this.comboMultiplier >= 4) {
        this.comboText.setColor('#ff00ff') // Purple
      } else if (this.comboMultiplier >= 3) {
        this.comboText.setColor('#ff0000') // Red
      } else if (this.comboMultiplier >= 2) {
        this.comboText.setColor('#ff6600') // Orange
      } else {
        this.comboText.setColor('#ffaa00') // Yellow
      }
    } else {
      this.comboText.setVisible(false)
    }
  }

  private resetCombo() {
    this.comboCount = 0
    this.comboMultiplier = 1
    this.comboText.setVisible(false)
  }

  private createExplosionEffect(x: number, y: number) {
    // Create multiple particles that fly outward
    const particleCount = 8
    const colors = ['#ff0000', '#ff6600', '#ffff00', '#ffffff']

    for (let i = 0; i < particleCount; i++) {
      const angle = (i / particleCount) * Math.PI * 2
      const speed = Phaser.Math.Between(100, 200)
      const color = Phaser.Utils.Array.GetRandom(colors)

      const particle = this.add.text(x, y, '•', {
        fontFamily: 'Courier New',
        fontSize: '16px',
        color: color
      }).setOrigin(0.5)

      // Animate particle
      this.tweens.add({
        targets: particle,
        x: x + Math.cos(angle) * speed,
        y: y + Math.sin(angle) * speed,
        alpha: 0,
        scale: 0.5,
        duration: 500,
        ease: 'Power2',
        onComplete: () => {
          particle.destroy()
        }
      })
    }
  }

  private handleXPCollected(xpValue: number) {
    // Update total XP
    this.totalXP += xpValue
    this.updateXPDisplay()

    // Check for level up
    if (this.totalXP >= this.xpToNextLevel) {
      this.levelUp()
    }
  }

  private handleCreditCollected(creditValue: number) {
    // Add credits to game state
    this.gameState.addCredits(creditValue)
  }

  private updateXPDisplay() {
    // Update XP text overlaid on bar
    this.xpText.setText(`XP: ${this.totalXP} / ${this.xpToNextLevel}`)

    // Update XP bar width
    const xpBarMaxWidth = 196 // 200 - 4 for padding
    const xpPercent = this.totalXP / this.xpToNextLevel
    const newWidth = xpBarMaxWidth * xpPercent

    this.xpBarFill.width = newWidth
  }

  private levelUp() {
    this.level++
    this.totalXP = 0
    this.xpToNextLevel = Math.floor(this.xpToNextLevel * 1.5) // XP requirement increases by 50% each level

    // Update UI
    this.levelText.setText(`Level: ${this.level}`)
    this.updateXPDisplay()

    // Pause game and show upgrades
    this.isPaused = true
    this.physics.pause()
    // Pause star field
    this.starFieldTweens.forEach(tween => tween.pause())
    this.showUpgradeOptions()
  }

  private showUpgradeOptions() {
    // Create semi-transparent overlay
    const overlay = this.add.rectangle(
      0, 0,
      this.cameras.main.width,
      this.cameras.main.height,
      0x000000,
      0.7
    ).setOrigin(0, 0).setDepth(100)

    // Title
    const title = this.add.text(
      this.cameras.main.centerX,
      150,
      'LEVEL UP!',
      {
        fontFamily: 'Courier New',
        fontSize: '48px',
        color: '#ffff00',
      }
    ).setOrigin(0.5).setDepth(101)

    const subtitle = this.add.text(
      this.cameras.main.centerX,
      200,
      'Choose an upgrade:',
      {
        fontFamily: 'Courier New',
        fontSize: '24px',
        color: '#ffffff',
      }
    ).setOrigin(0.5).setDepth(101)

    // Generate upgrade options from weapons, passives, and utility upgrades
    const upgrades = this.generateUpgradeOptions()

    // Randomly select 3 upgrades
    const shuffled = Phaser.Utils.Array.Shuffle([...upgrades])
    const selectedUpgrades = shuffled.slice(0, 3)

    // Create upgrade buttons
    const buttonHeight = 140
    const buttonWidth = 480
    const buttonSpacing = 15
    const startY = 280

    const buttons: Phaser.GameObjects.GameObject[] = [overlay, title, subtitle]

    selectedUpgrades.forEach((upgrade, index) => {
      const y = startY + (buttonHeight + buttonSpacing) * index

      // Button background
      const button = this.add.rectangle(
        this.cameras.main.centerX,
        y,
        buttonWidth,
        buttonHeight,
        0x2a2a4a
      ).setDepth(101).setInteractive({ useHandCursor: true })

      // Icon (if available)
      let iconText: Phaser.GameObjects.Text | null = null
      if (upgrade.icon) {
        iconText = this.add.text(
          this.cameras.main.centerX - 210,
          y,
          upgrade.icon,
          {
            fontFamily: 'Courier New',
            fontSize: '56px',
            color: upgrade.color || '#ffffff',
          }
        ).setOrigin(0.5).setDepth(102)
      }

      // Button text
      const nameText = this.add.text(
        this.cameras.main.centerX - 135,
        y - 40,
        upgrade.name,
        {
          fontFamily: 'Courier New',
          fontSize: '22px',
          color: '#00ff00',
          wordWrap: { width: 320, useAdvancedWrap: true }
        }
      ).setOrigin(0, 0).setDepth(102)

      const descText = this.add.text(
        this.cameras.main.centerX - 135,
        y + 0,
        upgrade.description,
        {
          fontFamily: 'Courier New',
          fontSize: '16px',
          color: '#aaaaaa',
          wordWrap: { width: 320, useAdvancedWrap: true }
        }
      ).setOrigin(0, 0).setDepth(102)

      // Hover effects
      button.on('pointerover', () => {
        button.setFillStyle(0x3a3a6a)
      })

      button.on('pointerout', () => {
        button.setFillStyle(0x2a2a4a)
      })

      // Click handler
      button.on('pointerdown', () => {
        upgrade.effect()
        // Update slots display after upgrade
        this.updateSlotsDisplay()
        // Remove all upgrade UI elements
        buttons.forEach(obj => obj.destroy())
        nameText.destroy()
        descText.destroy()
        if (iconText) iconText.destroy()
        button.destroy()
        this.isPaused = false
        this.physics.resume()
        // Resume star field
        this.starFieldTweens.forEach(tween => tween.resume())
      })

      buttons.push(button, nameText, descText)
      if (iconText) buttons.push(iconText)
    })

    // Store container reference for cleanup if needed
    this.upgradeContainer = this.add.container(0, 0)
  }

  private handleProjectileEnemyCollision(
    projectileObj: Phaser.GameObjects.GameObject,
    enemyObj: Phaser.GameObjects.GameObject
  ) {
    const projectile = projectileObj as Phaser.GameObjects.Text & {
      getDamage: () => number
      onHit: () => boolean
    }
    const enemy = enemyObj as Phaser.GameObjects.Text & { takeDamage: (damage: number) => boolean, active: boolean }

    // Check if both are still active (prevent multiple hits in same frame)
    if (!projectile.active || !enemy.active) {
      return
    }

    // Get damage amount
    const damage = projectile.getDamage()

    // Track damage dealt
    this.totalDamageDealt += damage

    // Show damage number
    this.showDamageNumber(enemy.x, enemy.y, damage)

    // Apply damage to enemy
    const enemyDied = enemy.takeDamage(damage)

    // Check if projectile should be destroyed (based on pierce)
    const shouldDestroy = projectile.onHit()
    if (shouldDestroy) {
      projectile.setActive(false)
      projectile.setVisible(false)
      const body = projectile.body as Phaser.Physics.Arcade.Body
      if (body) {
        body.enable = false
      }
    }
  }

  private showDamageNumber(x: number, y: number, damage: number) {
    const damageText = this.add.text(x, y, Math.floor(damage).toString(), {
      fontFamily: 'Courier New',
      fontSize: '20px',
      color: '#ffff00',
      fontStyle: 'bold'
    }).setOrigin(0.5)

    // Animate the damage number
    this.tweens.add({
      targets: damageText,
      y: y - 50,
      alpha: 0,
      duration: 800,
      ease: 'Power2',
      onComplete: () => {
        damageText.destroy()
      }
    })
  }

  private handlePlayerEnemyCollision(
    playerObj: Phaser.GameObjects.GameObject,
    enemyObj: Phaser.GameObjects.GameObject
  ) {
    const enemy = enemyObj as Phaser.GameObjects.Text & { active: boolean, takeDamage: (damage: number) => boolean }

    // Check if enemy is still active
    if (!enemy.active) {
      return
    }

    // Damage player
    this.takeDamage(10)

    // Destroy the enemy
    enemy.takeDamage(999) // Kill enemy instantly

    // Visual feedback - flash player red briefly
    this.player.setColor('#ff0000')
    this.time.delayedCall(100, () => {
      this.player.setColor('#00ff00')
    })
  }

  private handlePowerUpCollection(
    playerObj: Phaser.GameObjects.GameObject,
    powerUpObj: Phaser.GameObjects.GameObject
  ) {
    const powerUp = powerUpObj as any

    if (!powerUp.active) return

    const type = powerUp.getPowerUpType() as PowerUpType
    const config = POWERUP_CONFIGS[type]

    // Apply power-up effect
    switch (type) {
      case PowerUpType.SHIELD:
        this.hasShield = true
        this.shieldEndTime = this.time.now + config.duration
        this.player.setColor('#00ffff')
        break

      case PowerUpType.RAPID_FIRE:
        this.hasRapidFirePowerUp = true
        this.rapidFireEndTime = this.time.now + config.duration
        this.fireRate = this.baseFireRate * 0.25 // 4x faster
        break

      case PowerUpType.NUKE:
        // Kill all enemies on screen
        this.enemies.getChildren().forEach((enemy: any) => {
          if (enemy.active) {
            enemy.takeDamage(9999)
          }
        })
        // Screen flash
        this.cameras.main.flash(300, 255, 255, 0)
        break

      case PowerUpType.MAGNET:
        this.hasMagnet = true
        this.magnetEndTime = this.time.now + config.duration
        break
    }

    // Collect the power-up
    powerUp.collect()
    this.updatePowerUpDisplay()
  }

  private updatePowerUpTimers(currentTime: number) {
    let updated = false

    // Check shield
    if (this.hasShield && currentTime >= this.shieldEndTime) {
      this.hasShield = false
      this.player.setColor('#00ff00')
      updated = true
    }

    // Check rapid fire
    if (this.hasRapidFirePowerUp && currentTime >= this.rapidFireEndTime) {
      this.hasRapidFirePowerUp = false
      this.fireRate = this.baseFireRate
      updated = true
    }

    // Check magnet
    if (this.hasMagnet && currentTime >= this.magnetEndTime) {
      this.hasMagnet = false
      updated = true
    }

    if (updated) {
      this.updatePowerUpDisplay()
    }
  }

  private updatePowerUpDisplay() {
    const activePowerUps: string[] = []

    if (this.hasShield) {
      const remaining = Math.ceil((this.shieldEndTime - this.time.now) / 1000)
      activePowerUps.push(`SHIELD (${remaining}s)`)
    }

    if (this.hasRapidFirePowerUp) {
      const remaining = Math.ceil((this.rapidFireEndTime - this.time.now) / 1000)
      activePowerUps.push(`RAPID FIRE (${remaining}s)`)
    }

    if (this.hasMagnet) {
      const remaining = Math.ceil((this.magnetEndTime - this.time.now) / 1000)
      activePowerUps.push(`MAGNET (${remaining}s)`)
    }

    if (activePowerUps.length > 0) {
      this.powerUpText.setText(activePowerUps.join(' | '))
    } else {
      this.powerUpText.setText('')
    }
  }

  private takeDamage(amount: number) {
    // Shield blocks damage
    if (this.hasShield) {
      return
    }

    this.health -= amount
    this.health = Math.max(0, this.health)
    this.updateHealthDisplay()

    // Screen shake on damage
    this.cameras.main.shake(200, 0.01)

    // Check for game over
    if (this.health <= 0) {
      this.gameOver()
    }
  }

  private updateHealthDisplay() {
    const healthPercent = this.health / this.maxHealth
    const isHurt = this.health < this.maxHealth

    // Only show health bar when hurt
    this.healthBarBackground.setVisible(isHurt)
    this.healthBarFill.setVisible(isHurt)
    this.healthText.setVisible(isHurt)

    if (isHurt) {
      // Position health bar below player
      const playerY = this.player.y + 35 // 35 pixels below player
      const playerX = this.player.x

      this.healthBarBackground.setPosition(playerX, playerY)
      this.healthBarFill.setPosition(playerX - 29, playerY + 1) // Center the fill (60/2 - 1 for padding)
      this.healthText.setPosition(playerX, playerY - 2)

      // Update health text
      this.healthText.setText(`${this.health}`)

      // Update health bar width
      const healthBarMaxWidth = 56 // 60 - 4 for padding
      const newWidth = healthBarMaxWidth * healthPercent
      this.healthBarFill.width = newWidth

      // Change color based on health percentage
      if (healthPercent > 0.6) {
        this.healthBarFill.setFillStyle(0x00ff00) // Green
      } else if (healthPercent > 0.3) {
        this.healthBarFill.setFillStyle(0xffaa00) // Orange
      } else {
        this.healthBarFill.setFillStyle(0xff0000) // Red
      }
    }
  }

  private gameOver() {
    this.isPaused = true
    this.physics.pause()
    // Pause star field
    this.starFieldTweens.forEach(tween => tween.pause())

    // Record run stats
    const enemyKills = this.killCount
    this.gameState.recordRun(this.score, this.survivalTime, enemyKills)

    // Record character-specific stats
    const timePlayed = this.time.now - this.runStartTime
    this.gameState.recordCharacterRun(
      this.character.getConfig().type,
      this.totalDamageDealt,
      timePlayed,
      enemyKills
    )

    // Save high score if beaten
    if (this.score > this.highScore) {
      this.highScore = this.score
      localStorage.setItem('roguecraft_highscore', this.highScore.toString())
    }

    // Create game over overlay
    const overlay = this.add.rectangle(
      0, 0,
      this.cameras.main.width,
      this.cameras.main.height,
      0x000000,
      0.8
    ).setOrigin(0, 0).setDepth(200)

    const gameOverText = this.add.text(
      this.cameras.main.centerX,
      this.cameras.main.centerY - 150,
      'GAME OVER',
      {
        fontFamily: 'Courier New',
        fontSize: '64px',
        color: '#ff0000',
      }
    ).setOrigin(0.5).setDepth(201)

    const minutes = Math.floor(this.survivalTime / 60)
    const seconds = this.survivalTime % 60

    const statsText = this.add.text(
      this.cameras.main.centerX,
      this.cameras.main.centerY - 50,
      `Score: ${this.score}\nLevel: ${this.level}\nTime: ${minutes}:${seconds.toString().padStart(2, '0')}\n\n${this.score === this.highScore && this.score > 0 ? 'NEW HIGH SCORE!' : `High Score: ${this.highScore}`}`,
      {
        fontFamily: 'Courier New',
        fontSize: '24px',
        color: this.score === this.highScore && this.score > 0 ? '#ffff00' : '#ffffff',
        align: 'center'
      }
    ).setOrigin(0.5).setDepth(201)

    // Credits earned display
    const creditsEarned = this.gameState.getCredits() // Show current total
    const creditsText = this.add.text(
      this.cameras.main.centerX,
      this.cameras.main.centerY + 50,
      `Credits Earned: ${creditsEarned} ¤`,
      {
        fontFamily: 'Courier New',
        fontSize: '20px',
        color: '#ffdd00',
      }
    ).setOrigin(0.5).setDepth(201)

    const mainMenuButton = this.add.rectangle(
      this.cameras.main.centerX,
      this.cameras.main.centerY + 120,
      300,
      80,
      0x2a2a4a
    ).setDepth(201).setInteractive({ useHandCursor: true })

    const mainMenuText = this.add.text(
      this.cameras.main.centerX,
      this.cameras.main.centerY + 120,
      'MAIN MENU',
      {
        fontFamily: 'Courier New',
        fontSize: '32px',
        color: '#00ff00',
      }
    ).setOrigin(0.5).setDepth(202)

    // Hover effects
    mainMenuButton.on('pointerover', () => {
      mainMenuButton.setFillStyle(0x3a3a6a)
    })

    mainMenuButton.on('pointerout', () => {
      mainMenuButton.setFillStyle(0x2a2a4a)
    })

    // Main menu handler
    mainMenuButton.on('pointerdown', () => {
      this.scene.start('MainMenuScene')
    })
  }

  private handleEnemyProjectileHit(
    playerObj: Phaser.GameObjects.GameObject,
    projectileObj: Phaser.GameObjects.GameObject
  ) {
    const projectile = projectileObj as any

    if (!projectile.active) return

    // Damage player
    this.takeDamage(projectile.getDamage())

    // Destroy projectile
    projectile.setActive(false)
    projectile.setVisible(false)
    projectile.body.enable = false
  }

  private handleEnemyExplosion(data: { x: number; y: number; radius: number; damage: number }) {
    // Check if player is in explosion radius
    const distance = Phaser.Math.Distance.Between(this.player.x, this.player.y, data.x, data.y)

    if (distance <= data.radius) {
      this.takeDamage(data.damage)
      // Screen shake
      this.cameras.main.shake(300, 0.015)
    }
  }

  private handleEnemySplit(data: { x: number; y: number; count: number }) {
    // Spawn smaller enemies (swarmers) at the split location
    for (let i = 0; i < data.count; i++) {
      const angle = (i / data.count) * Math.PI * 2
      const offsetX = Math.cos(angle) * 40
      const offsetY = Math.sin(angle) * 40
      this.enemies.spawnEnemy(data.x + offsetX, data.y + offsetY, EnemyType.SWARMER)
    }
  }

  private handleHealNearby(data: { x: number; y: number; radius: number; amount: number }) {
    // Find all enemies within radius and heal them
    const nearbyEnemies = this.enemies.getNearbyEnemies(data.x, data.y, data.radius)
    nearbyEnemies.forEach(enemy => {
      enemy.heal(data.amount)
    })
  }

  private levelCompleted() {
    console.log('levelCompleted() called')
    this.isPaused = true
    this.physics.pause()
    this.starFieldTweens.forEach(tween => tween.pause())

    const currentLevel = this.campaignManager.getCurrentLevel()
    console.log('Current level:', currentLevel.levelNumber, currentLevel.name)
    console.log('Is tutorial?', this.isTutorial)

    // Award credits and bonus XP
    this.gameState.addCredits(currentLevel.creditsReward)

    // Record character-specific stats
    const timePlayed = this.time.now - this.runStartTime
    const enemyKills = this.killCount
    this.gameState.recordCharacterRun(
      this.character.getConfig().type,
      this.totalDamageDealt,
      timePlayed,
      enemyKills
    )

    // Tutorial: Complete first battle and move to BUILD_MARKET step
    if (this.isTutorial && currentLevel.levelNumber === 0) {
      console.log('Tutorial complete! Setting BUILD_MARKET step and returning to menu...')
      this.gameState.setTutorialStep(TutorialStep.BUILD_MARKET)
      // Short delay then return to main menu
      this.time.delayedCall(2000, () => {
        console.log('Transitioning to MainMenuScene...')
        this.scene.start('MainMenuScene')
      })

      // Show tutorial completion message
      const overlay = this.add.rectangle(
        0, 0,
        this.cameras.main.width,
        this.cameras.main.height,
        0x000000,
        0.7
      ).setOrigin(0, 0).setDepth(200)

      const titleText = this.add.text(
        this.cameras.main.centerX,
        this.cameras.main.centerY - 50,
        'TUTORIAL COMPLETE!',
        {
          fontFamily: 'Courier New',
          fontSize: '48px',
          color: '#00ff00',
        }
      ).setOrigin(0.5).setDepth(201)

      const instructionText = this.add.text(
        this.cameras.main.centerX,
        this.cameras.main.centerY + 20,
        `Credits Earned: ${currentLevel.creditsReward} ¤\n\nReturning to Main Menu...`,
        {
          fontFamily: 'Courier New',
          fontSize: '24px',
          color: '#ffffff',
          align: 'center'
        }
      ).setOrigin(0.5).setDepth(201)

      return
    }

    // Create level complete overlay
    const overlay = this.add.rectangle(
      0, 0,
      this.cameras.main.width,
      this.cameras.main.height,
      0x000000,
      0.7
    ).setOrigin(0, 0).setDepth(200)

    const titleText = this.add.text(
      this.cameras.main.centerX,
      this.cameras.main.centerY - 120,
      'LEVEL COMPLETE!',
      {
        fontFamily: 'Courier New',
        fontSize: '48px',
        color: '#00ff00',
      }
    ).setOrigin(0.5).setDepth(201)

    const statsText = this.add.text(
      this.cameras.main.centerX,
      this.cameras.main.centerY - 40,
      `${currentLevel.name}\n\nScore: ${this.score}\nCredits Earned: ${currentLevel.creditsReward} ¤`,
      {
        fontFamily: 'Courier New',
        fontSize: '24px',
        color: '#ffffff',
        align: 'center'
      }
    ).setOrigin(0.5).setDepth(201)

    // Continue button (if more levels available)
    if (this.campaignManager.getLevelCount() > currentLevel.levelNumber) {
      const continueButton = this.add.rectangle(
        this.cameras.main.centerX,
        this.cameras.main.centerY + 80,
        300,
        70,
        0x2a4a2a
      ).setDepth(201).setInteractive({ useHandCursor: true })

      const continueText = this.add.text(
        this.cameras.main.centerX,
        this.cameras.main.centerY + 80,
        'NEXT LEVEL',
        {
          fontFamily: 'Courier New',
          fontSize: '28px',
          color: '#00ff00',
        }
      ).setOrigin(0.5).setDepth(202)

      continueButton.on('pointerover', () => {
        continueButton.setFillStyle(0x3a5a3a)
      })

      continueButton.on('pointerout', () => {
        continueButton.setFillStyle(0x2a4a2a)
      })

      continueButton.on('pointerdown', () => {
        this.campaignManager.nextLevel()
        this.scene.restart()
      })
    }

    // Main menu button
    const menuButton = this.add.rectangle(
      this.cameras.main.centerX,
      this.cameras.main.centerY + 160,
      300,
      70,
      0x2a2a4a
    ).setDepth(201).setInteractive({ useHandCursor: true })

    const menuText = this.add.text(
      this.cameras.main.centerX,
      this.cameras.main.centerY + 160,
      'MAIN MENU',
      {
        fontFamily: 'Courier New',
        fontSize: '28px',
        color: '#00ffff',
      }
    ).setOrigin(0.5).setDepth(202)

    menuButton.on('pointerover', () => {
      menuButton.setFillStyle(0x3a3a6a)
    })

    menuButton.on('pointerout', () => {
      menuButton.setFillStyle(0x2a2a4a)
    })

    menuButton.on('pointerdown', () => {
      this.scene.start('MainMenuScene')
    })
  }
}
