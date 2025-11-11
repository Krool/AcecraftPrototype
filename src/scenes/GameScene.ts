import Phaser from 'phaser'
import { ProjectileGroup, ProjectileType, Projectile } from '../game/Projectile'
import { EnemyGroup, EnemyType, ENEMY_CONFIGS, Enemy } from '../game/Enemy'
import { EnemyProjectileGroup } from '../game/EnemyProjectile'
import { AllyGroup, AllyType, ALLY_CONFIGS } from '../game/Ally'
import { XPDropGroup } from '../game/XPDrop'
import { CreditDropGroup } from '../game/CreditDrop'
import { PowerUpGroup, PowerUpType, POWERUP_CONFIGS } from '../game/PowerUp'
import { Weapon, WeaponType, WeaponFactory, WeaponModifiers, DEFAULT_MODIFIERS, DamageType } from '../game/Weapon'
import { Passive, PassiveType, PassiveFactory, PlayerStats } from '../game/Passive'
import { Character, CharacterType, CharacterFactory, CHARACTER_CONFIGS, BastionCharacter } from '../game/Character'
import { EvolutionManager, EVOLUTION_RECIPES, EvolvedWeapon, SuperEvolvedWeapon, EvolutionType } from '../game/Evolution'
import { GameState } from '../game/GameState'
import { CampaignManager } from '../game/Campaign'
import { soundManager, SoundType } from '../game/SoundManager'
import { WaveSystem } from '../game/WaveSystem'
import { gameProgression } from '../game/GameProgression'
import { MobileDetection } from '../utils/MobileDetection'
import { RunStatistics } from '../game/RunStatistics'
import { PLAYER, WAVE_SPAWNING, COMBAT, ALLIES, FROST_HASTE, CHESTS, LAYOUT } from '../constants'

// XP requirements for each level (index 0 = level 1→2, index 1 = level 2→3, etc.)
// Curve accelerates significantly starting at level 6, much steeper in late game
const XP_REQUIREMENTS = [
  20,    // Level 1→2 (reduced for faster first level-up)
  60,    // Level 2→3
  83,    // Level 3→4
  105,   // Level 4→5
  135,   // Level 5→6
  188,   // Level 6→7 (steeper acceleration begins)
  263,   // Level 7→8
  375,   // Level 8→9
  525,   // Level 9→10
  713,   // Level 10→11
  938,   // Level 11→12
  1200,  // Level 12→13
  1575,  // Level 13→14
  2025,  // Level 14→15
  2625,  // Level 15→16
  3375,  // Level 16→17
  4500,  // Level 17→18
  6000,  // Level 18→19
  8250,  // Level 19→20
  11250, // Level 20→21
  15000, // Level 21→22
  20250, // Level 22→23
  26250, // Level 23→24
  33750, // Level 24→25
  45000, // Level 25+
]

export default class GameScene extends Phaser.Scene {
  private gameState!: GameState
  private player!: Phaser.GameObjects.Text
  private cursors!: Phaser.Types.Input.Keyboard.CursorKeys
  private playerSpeed: number = 300
  private projectiles!: ProjectileGroup
  private enemies!: EnemyGroup
  private allies!: AllyGroup
  private enemyProjectiles!: EnemyProjectileGroup
  private xpDrops!: XPDropGroup
  private creditDrops!: CreditDropGroup
  private powerUps!: PowerUpGroup
  private damageZones: DamageZone[] = []
  private campaignManager!: CampaignManager
  private campaignLevelText!: Phaser.GameObjects.Text
  private enemySpawnRate: number = WAVE_SPAWNING.BASE_SPAWN_RATE // Time between enemy spawns in milliseconds
  private nextEnemySpawnTime: number = 0
  private baseEnemySpawnRate: number = WAVE_SPAWNING.BASE_SPAWN_RATE
  private minEnemySpawnRate: number = WAVE_SPAWNING.MIN_SPAWN_RATE // Minimum spawn rate (maximum difficulty)
  private allyRespawnTimers: Map<string, number> = new Map() // Track respawn timers for allies
  private allyRespawnDelay: number = ALLIES.RESPAWN_DELAY
  private totalXP: number = 0
  private xpText!: Phaser.GameObjects.Text
  private level: number = 1
  private xpToNextLevel: number = 30 // Will be set from XP_REQUIREMENTS table
  private levelText!: Phaser.GameObjects.Text
  private health: number = PLAYER.DEFAULT_HEALTH
  private maxHealth: number = PLAYER.DEFAULT_HEALTH
  private healthText!: Phaser.GameObjects.Text
  private healthBarBackground!: Phaser.GameObjects.Rectangle
  private healthBarFill!: Phaser.GameObjects.Rectangle
  private xpBarBackground!: Phaser.GameObjects.Rectangle
  private xpBarFill!: Phaser.GameObjects.Rectangle
  private isPaused: boolean = false
  private upgradeContainer!: Phaser.GameObjects.Container
  private pendingLevelUps: number = 0 // Queue of pending level ups to show

  // Reroll system
  private rerollsRemaining: number = 0
  private maxRerolls: number = 0
  private rerollText!: Phaser.GameObjects.Text

  // Frost Haste system
  private frostHasteStacks: number = 0
  private frostHasteMaxStacks: number = 15 // Cap at 15 stacks for +225% attack speed at max
  private frostHasteStackDuration: number = 5000 // 5 seconds per stack
  private frostHasteExpireTimes: number[] = [] // Track individual stack expiration

  // Combo system
  private comboCount: number = 0
  private comboTimer: number = 0
  private comboTimeout: number = 3000 // 3 seconds to maintain combo
  private comboText!: Phaser.GameObjects.Text
  private comboMultiplier: number = 1

  // Active power-ups
  private hasShield: boolean = false
  private shieldEndTime: number = 0
  private shieldFlashTween?: Phaser.Tweens.Tween
  private hasRapidFirePowerUp: boolean = false
  private rapidFireEndTime: number = 0
  private hasMagnet: boolean = false
  private magnetEndTime: number = 0
  private hasOverdrive: boolean = false
  private overdriveEndTime: number = 0
  private buffIconsContainer!: Phaser.GameObjects.Container
  private buffDisplays: Map<string, { bg: Phaser.GameObjects.Rectangle, fill: Phaser.GameObjects.Rectangle, icon: Phaser.GameObjects.Text, startTime: number, duration: number }> = new Map()


  // Score and waves
  private score: number = 0
  private scoreText!: Phaser.GameObjects.Text
  private survivalTime: number = 0
  // timerText removed - no countdown display in combat
  private waveSystem!: WaveSystem
  private waveText!: Phaser.GameObjects.Text
  private waveProgressBar!: Phaser.GameObjects.Rectangle
  private waveProgressBarBg!: Phaser.GameObjects.Rectangle
  private bossHealthBar!: Phaser.GameObjects.Rectangle
  private bossHealthBarBg!: Phaser.GameObjects.Rectangle
  private bossHealthText!: Phaser.GameObjects.Text
  private currentWaveEnemyCount: number = 0
  private waveInProgress: boolean = false
  private waveStartPending: boolean = false // Track if a wave start is already scheduled
  private waveStartTime: number = 0 // Failsafe: track when wave started
  private waveStartPausedTime: number = 0 // Track totalPausedTime when wave started (to calculate wave-specific pause duration)
  private lastPoolLogTime: number = 0 // Track last pool status log
  private consecutiveFailedWaves: number = 0 // Track consecutive waves that failed to spawn enemies
  private highScore: number = 0

  // Character stats tracking
  private totalDamageDealt: number = 0
  private killCount: number = 0
  private bossesKilled: number = 0
  private runStartTime: number = 0
  private pauseStartTime: number = 0
  private totalPausedTime: number = 0

  // Debug metrics
  private damageDealtLastSecond: number = 0
  private healthSpawnedLastSecond: number = 0
  private damageTrackingWindow: { timestamp: number, damage: number }[] = []
  private healthTrackingWindow: { timestamp: number, health: number }[] = []

  // Per-weapon DPS tracking
  private weaponDamageTracking: Map<string, {
    totalDamage: number,
    acquisitionGameTime: number,  // Game time when acquired (excludes pauses)
    lastDamageTime: number
  }> = new Map()

  private creditsCollectedThisRun: number = 0
  private creditsCollectedText!: Phaser.GameObjects.Text
  private lastEngineTrailTime: number = 0
  private lastHitTime: number = 0
  private gameOverUI: Phaser.GameObjects.GameObject[] = []

  // Guaranteed chest system
  private chestsSpawnedThisRun: number = 0
  private readonly maxChestsPerRun: number = 5 // Increased from 4 to allow mini-boss + milestone + occasional random
  private readonly guaranteedChestMilestones: number[] = [60, 120] // Reduced from 4 to 2 milestones (removed 20 & 200)
  private chestPopupClickState: number = 0 // 0 = showing animation, 1 = showing rewards, 2+ = can close

  // New weapon/passive/character system
  private weapons: Weapon[] = []
  private passives: Passive[] = []
  private character!: Character
  private characterColor!: string
  private bastionFiredLastFrame: boolean = false // Track if Bastion fired weapons last frame

  // Performance optimization: Cache values to reduce per-frame calculations
  private cachedActiveEnemyCount: number = 0
  private modifiersNeedRecalculation: boolean = true
  private lastPowerUpDisplayState: string = '' // Track power-up state to avoid unnecessary updates
  private wasInvulnerable: boolean = false // Track if we need to restore color/scale
  private maxWeaponSlots: number = 4
  private maxPassiveSlots: number = 4
  private weaponModifiers: WeaponModifiers = { ...DEFAULT_MODIFIERS }
  private playerStats: PlayerStats = {
    maxHealth: PLAYER.DEFAULT_HEALTH,
    currentHealth: PLAYER.DEFAULT_HEALTH,
    moveSpeed: PLAYER.DEFAULT_MOVE_SPEED,
    pickupRadius: PLAYER.DEFAULT_PICKUP_RADIUS,
    damageReduction: 0,
    dodgeChance: 0,
    healthRegen: 0,
    invulnFrames: PLAYER.INVULN_FRAMES,
    revives: 0,
  }
  private weaponSlotsContainer!: Phaser.GameObjects.Container
  private passiveSlotsContainer!: Phaser.GameObjects.Container
  private evolutionManager!: EvolutionManager
  private discoveredEvolutions: Set<string> = new Set() // Track discovered evolutions
  private starFieldTweens: Phaser.Tweens.Tween[] = [] // Track tweens for pausing
  private bgMusic?: Phaser.Sound.BaseSound
  private runStatistics!: RunStatistics

  constructor() {
    super('GameScene')
  }

  create(data?: { levelIndex?: number }) {
    // Fade in from black
    this.cameras.main.fadeIn(500, 0, 0, 0)

    // Initialize game state
    this.gameState = GameState.getInstance()

    // Start random background music (lazy loaded on-demand)
    const randomTrack = Phaser.Math.Between(1, 20)
    if (this.bgMusic) {
      this.bgMusic.stop()
    }
    this.loadAndPlayMusic(randomTrack)

    // Reset all game state variables (important for scene restart)
    this.totalXP = 0
    this.level = 1
    this.xpToNextLevel = XP_REQUIREMENTS[0] // Level 1→2 requires 30 XP
    this.health = PLAYER.DEFAULT_HEALTH
    this.maxHealth = PLAYER.DEFAULT_HEALTH
    this.isPaused = false
    this.playerSpeed = PLAYER.DEFAULT_MOVE_SPEED
    this.enemySpawnRate = WAVE_SPAWNING.BASE_SPAWN_RATE
    this.baseEnemySpawnRate = WAVE_SPAWNING.BASE_SPAWN_RATE
    this.minEnemySpawnRate = WAVE_SPAWNING.MIN_SPAWN_RATE
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
    this.score = 0
    this.survivalTime = 0
    this.totalDamageDealt = 0
    this.killCount = 0
    this.bossesKilled = 0
    this.runStartTime = 0
    this.pauseStartTime = 0
    this.lastHitTime = 0
    this.wasInvulnerable = false
    this.totalPausedTime = 0
    this.waveStartPausedTime = 0
    this.chestsSpawnedThisRun = 0
    this.discoveredEvolutions = new Set()
    this.starFieldTweens = []

    // Reset wave state flags (CRITICAL for scene restart)
    this.waveInProgress = false
    this.waveStartPending = false
    this.currentWaveEnemyCount = 0
    this.waveStartTime = 0

    // Clear buff displays map to ensure clean state on restart
    // IMPORTANT: Destroy visual elements before clearing to prevent memory leak
    this.buffDisplays.forEach((display) => {
      display.bg.destroy()
      display.fill.destroy()
      display.icon.destroy()
    })
    this.buffDisplays.clear()

    // Clear tracking arrays to prevent memory leaks
    this.frostHasteExpireTimes = []
    this.damageTrackingWindow = []
    this.healthTrackingWindow = []

    // Clear ally respawn timers
    this.allyRespawnTimers.clear()

    // Clear weapons and passives arrays
    this.weapons = []
    this.passives = []

    // Reset weapon modifiers and player stats to defaults
    this.weaponModifiers = { ...DEFAULT_MODIFIERS }
    this.playerStats = {
      maxHealth: 100,
      currentHealth: 100,
      moveSpeed: 300,
      pickupRadius: 100,
      damageReduction: 0,
      dodgeChance: 0,
      healthRegen: 0,
      invulnFrames: 1000,
      revives: 0,
    }

    // Initialize campaign manager early (needed for background creation)
    const levelIndex = data?.levelIndex ?? this.gameState.getUnlockedLevels() - 1
    this.campaignManager = new CampaignManager(levelIndex)

    // Initialize wave system
    this.waveSystem = new WaveSystem(levelIndex + 1, this.cameras.main.width)

    // Load high score for this specific level
    this.highScore = this.gameState.getLevelHighScore(levelIndex)

    // Add level-specific background
    this.createLevelBackground(levelIndex)

    // Add scrolling star field with level-specific theme
    this.createStarField(levelIndex)

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
    const bottomContainerHeight = LAYOUT.BOTTOM_BAR
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
      `Score: 0 | 👑: ${this.highScore}`,
      {
        fontFamily: 'Courier New',
        fontSize: '14px',
        color: '#ffff00',
        align: 'right'
      }
    ).setOrigin(1, 0).setDepth(11)

    // Timer removed - no countdown display in combat
    // (survivalTime still tracked internally for stats)

    // Add wave counter (top right, second line)
    this.waveText = this.add.text(
      this.cameras.main.width - 10,
      30,
      'Wave 0/15',
      {
        fontFamily: 'Courier New',
        fontSize: '16px',
        color: '#ffaa00',
        align: 'right',
        fontStyle: 'bold'
      }
    ).setOrigin(1, 0).setDepth(11)

    // Add wave progress bar (below wave counter)
    const progressBarWidth = 200
    const progressBarHeight = 8
    this.waveProgressBarBg = this.add.rectangle(
      this.cameras.main.width - 10 - progressBarWidth,
      55,
      progressBarWidth,
      progressBarHeight,
      0x333333
    ).setOrigin(0, 0).setDepth(11)

    this.waveProgressBar = this.add.rectangle(
      this.cameras.main.width - 10 - progressBarWidth,
      55,
      0,
      progressBarHeight,
      0x00ffff
    ).setOrigin(0, 0).setDepth(11)

    // Boss health bar (initially hidden)
    const bossBarWidth = 400
    const bossBarHeight = 20
    this.bossHealthBarBg = this.add.rectangle(
      this.cameras.main.centerX,
      80,
      bossBarWidth,
      bossBarHeight,
      0x330000
    ).setOrigin(0.5, 0).setDepth(11).setVisible(false).setStrokeStyle(2, 0xff0000)

    this.bossHealthBar = this.add.rectangle(
      this.cameras.main.centerX - bossBarWidth / 2,
      80,
      bossBarWidth,
      bossBarHeight,
      0xff0000
    ).setOrigin(0, 0).setDepth(11).setVisible(false)

    this.bossHealthText = this.add.text(
      this.cameras.main.centerX,
      105,
      'BOSS',
      {
        fontFamily: 'Courier New',
        fontSize: '16px',
        color: '#ff0000',
        align: 'center',
        fontStyle: 'bold'
      }
    ).setOrigin(0.5, 0).setDepth(11).setVisible(false)

    // Add credits collected counter (to the right of menu button, below score)
    this.creditsCollectedThisRun = 0
    this.creditsCollectedText = this.add.text(
      this.cameras.main.centerX + 70,
      30,
      '0¤',
      {
        fontFamily: 'Courier New',
        fontSize: '14px',
        color: '#ffdd00',
        align: 'left'
      }
    ).setOrigin(0, 0).setDepth(11)

    // Add reroll counter (to the right of credits, below score)
    this.rerollText = this.add.text(
      this.cameras.main.centerX + 140,
      30,
      '↻0',
      {
        fontFamily: 'Courier New',
        fontSize: '14px',
        color: '#00ffff',
        align: 'left'
      }
    ).setOrigin(0, 0).setDepth(11).setVisible(false)

    // Add menu button (top center)
    const menuButton = this.add.rectangle(
      this.cameras.main.centerX,
      10,
      120,
      40,
      0x2a2a4a,
      0.8
    ).setOrigin(0.5, 0).setDepth(11).setInteractive({ useHandCursor: true })

    this.add.text(
      this.cameras.main.centerX,
      30,
      'MENU',
      {
        fontFamily: 'Courier New',
        fontSize: '18px',
        color: '#ffffff',
      }
    ).setOrigin(0.5).setDepth(12)

    // Hover effects for menu button
    menuButton.on('pointerover', () => {
      menuButton.setFillStyle(0x3a3a6a, 0.9)
    })

    menuButton.on('pointerout', () => {
      menuButton.setFillStyle(0x2a2a4a, 0.8)
    })

    // Click handler for menu button
    menuButton.on('pointerdown', () => {
      // Pause the game
      this.isPaused = true
      this.pauseStartTime = this.time.now
      this.physics.pause()
      this.starFieldTweens.forEach(tween => tween.pause())

      // Show confirmation dialog
      this.showMenuConfirmation()
    })

    // Add Level counter (just the number)
    this.levelText = this.add.text(10, 18, '1', {
      fontFamily: 'Courier New',
      fontSize: '20px',
      color: '#00ffff',
      fontStyle: 'bold'
    }).setDepth(11)

    // Create XP bar next to level number
    const xpBarWidth = 105 // 30% smaller than original 150
    const xpBarHeight = 20
    const xpBarX = 40
    const xpBarY = 13

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
      fontSize: '12px',
      color: '#ffffff',
      fontStyle: 'bold'
    }).setOrigin(0.5).setDepth(52).setVisible(false)
    this.healthText.setStroke('#000000', 2) // Black outline for visibility

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

    // Create buff icons container (bottom center, in UI tray)
    this.buffIconsContainer = this.add.container(
      this.cameras.main.centerX,
      this.cameras.main.height - 35
    ).setDepth(11)

    // Create weapon slots container (bottom left)
    this.weaponSlotsContainer = this.add.container(
      10,
      this.cameras.main.height - 70
    ).setDepth(11)

    // Create passive slots container (bottom right)
    this.passiveSlotsContainer = this.add.container(
      this.cameras.main.width - 10,
      this.cameras.main.height - 70
    ).setDepth(11)

    // Create projectile group (no pooling - creates/destroys as needed)
    this.projectiles = new ProjectileGroup(this)

    // Create enemy group with large pool to support hundreds of enemies
    this.enemies = new EnemyGroup(this, 200, 150)

    // Create ally group for squadron support
    this.allies = new AllyGroup(this, 20, 10)
    this.allies.setProjectileGroup(this.projectiles)

    // Give projectiles access to enemy group for homing missiles
    this.projectiles.setEnemyGroup(this.enemies)

    // Create enemy projectile group (start small, grows dynamically)
    this.enemyProjectiles = new EnemyProjectileGroup(this, 50)

    // Initialize character and starting weapon FIRST (so we know what ship to display)
    this.gameState = GameState.getInstance()
    this.evolutionManager = new EvolutionManager(this)
    const selectedCharacterType = this.gameState.getSelectedCharacter()
    this.character = CharacterFactory.create(this, selectedCharacterType)

    // Initialize run statistics tracking
    this.runStatistics = RunStatistics.getInstance()
    this.runStatistics.startRun(selectedCharacterType)

    // Create player with character's symbol and color
    const characterConfig = this.character.getConfig()
    this.characterColor = characterConfig.color // Store the character's color
    this.player = this.add.text(
      this.cameras.main.centerX,
      this.cameras.main.height - 100,
      characterConfig.symbol,
      {
        fontFamily: 'Courier New',
        fontSize: '72px',
        color: this.characterColor,
      }
    )
      .setOrigin(0.5)
      .setDepth(25) // Player renders above projectiles and enemies
      .setScale(characterConfig.scale) // Apply ship-specific scaling

    // Enable physics on player
    this.physics.add.existing(this.player)
    const playerBody = this.player.body as Phaser.Physics.Arcade.Body
    playerBody.setCollideWorldBounds(true)

    // Set collision radius from character config (scaled for gameplay)
    const collisionSize = characterConfig.collisionRadius * 2 // Diameter
    playerBody.setSize(collisionSize, collisionSize)
    playerBody.setCircle(characterConfig.collisionRadius) // Use circular collision for better hit detection

    // Now link enemy projectiles and player reference to enemies
    this.enemies.setProjectileGroup(this.enemyProjectiles)
    this.enemies.setPlayerReference(this.player)

    // Create XP drop group (start small, grows dynamically)
    this.xpDrops = new XPDropGroup(this, 50)

    // Create credit drop group (start small, grows dynamically)
    this.creditDrops = new CreditDropGroup(this, 30)

    // Create power-up group (start small, grows dynamically)
    this.powerUps = new PowerUpGroup(this, 20)

    // Campaign manager already initialized earlier for background creation

    // Create campaign level text (top left, under level+xp bar)
    this.campaignLevelText = this.add.text(
      10, 40,
      `Mission: ${this.campaignManager.getCurrentLevel().name}`,
      {
        fontFamily: 'Courier New',
        fontSize: '12px',
        color: '#ffaa00',
      }
    ).setDepth(11)


    // Setup collision detection
    this.physics.add.overlap(
      this.projectiles,
      this.enemies,
      this.handleProjectileEnemyCollision as Phaser.Types.Physics.Arcade.ArcadePhysicsCallback,
      (projObj, enemObj) => {
        // Process callback - only collide with enemies that have enabled bodies
        const enem = enemObj as any
        return enem.body && enem.body.enable && enem.active
      },
      this
    )

    // Player collision with enemies
    this.physics.add.overlap(
      this.player,
      this.enemies,
      this.handlePlayerEnemyCollision as Phaser.Types.Physics.Arcade.ArcadePhysicsCallback,
      (playerObj, enemObj) => {
        // Process callback - only collide with enemies that have enabled bodies
        const enem = enemObj as any
        return enem.body && enem.body.enable && enem.active
      },
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

    // Enemy projectiles hit allies
    this.physics.add.overlap(
      this.allies,
      this.enemyProjectiles,
      this.handleAllyEnemyProjectileHit as Phaser.Types.Physics.Arcade.ArcadePhysicsCallback,
      (allyObj, projObj) => {
        const ally = allyObj as any
        return ally.body && ally.body.enable && ally.active
      },
      this
    )

    // Allies collision with enemies
    this.physics.add.overlap(
      this.allies,
      this.enemies,
      this.handleAllyEnemyCollision as Phaser.Types.Physics.Arcade.ArcadePhysicsCallback,
      (allyObj, enemObj) => {
        const ally = allyObj as any
        const enemy = enemObj as any
        // All combat allies (wingman, ranged, wall) collide with enemies, but not utility allies (reroll)
        const allyType = ally.getType ? ally.getType() : null
        const isCombatAlly = allyType === AllyType.WINGMAN || allyType === AllyType.RANGED || allyType === AllyType.WALL
        return ally.active && isCombatAlly &&
               enemy.body && enemy.body.enable && enemy.active
      },
      this
    )

    // Setup event listeners (remove first to prevent duplicates)
    this.events.off('enemyDied', this.handleEnemyDied, this)
    this.events.off('xpCollected', this.handleXPCollected, this)
    this.events.off('creditCollected', this.handleCreditCollected, this)
    this.events.off('enemyExplosion', this.handleEnemyExplosion, this)
    this.events.off('enemySplit', this.handleEnemySplit, this)
    this.events.off('healNearbyEnemies', this.handleHealNearby, this)
    this.events.off('allyExplosion', this.handleAllyExplosion, this)
    this.events.off('allyRerollGenerated', this.handleAllyRerollGenerated, this)
    this.events.off('allyDied', this.handleAllyDied, this)

    this.events.on('enemyDied', this.handleEnemyDied, this)
    this.events.on('xpCollected', this.handleXPCollected, this)
    this.events.on('creditCollected', this.handleCreditCollected, this)
    this.events.on('enemyExplosion', this.handleEnemyExplosion, this)
    this.events.on('enemySplit', this.handleEnemySplit, this)
    this.events.on('healNearbyEnemies', this.handleHealNearby, this)
    this.events.on('laserFire', this.handleLaserFire, this)
    this.events.on('allyExplosion', this.handleAllyExplosion, this)
    this.events.on('allyRerollGenerated', this.handleAllyRerollGenerated, this)
    this.events.on('allyDied', this.handleAllyDied, this)

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

    // Apply building bonuses from GameState
    const bonuses = this.gameState.getTotalBonuses()

    // Apply weapon and passive slot bonuses
    if (bonuses.weaponSlots) {
      this.maxWeaponSlots += bonuses.weaponSlots
    }
    if (bonuses.passiveSlots) {
      this.maxPassiveSlots += bonuses.passiveSlots
    }

    // Create and add starting weapon
    const startingWeapon = WeaponFactory.create(this, startingWeaponType, this.projectiles)

    // Apply starting weapon level bonus from buildings
    if (bonuses.startingWeaponLevel && bonuses.startingWeaponLevel > 0) {
      for (let i = 0; i < bonuses.startingWeaponLevel; i++) {
        startingWeapon.levelUp()
      }
    }

    this.weapons.push(startingWeapon)
    this.runStatistics.addWeapon(startingWeaponType)
    this.initializeWeaponTracking(startingWeapon.getConfig().name)

    // Update player stats based on character
    this.playerStats.maxHealth = this.character.getBaseHealth()
    this.playerStats.currentHealth = this.playerStats.maxHealth
    this.playerStats.moveSpeed = this.character.getBaseMoveSpeed()

    // Apply building bonuses to stats
    if (bonuses.maxHealth) {
      this.playerStats.maxHealth += bonuses.maxHealth
      this.playerStats.currentHealth = this.playerStats.maxHealth
    }
    if (bonuses.pickupRadiusMultiplier) {
      this.playerStats.pickupRadius = Math.floor(this.playerStats.pickupRadius * (1 + bonuses.pickupRadiusMultiplier))
    }
    if (bonuses.damageReduction) {
      this.playerStats.damageReduction += bonuses.damageReduction
    }

    this.maxHealth = this.playerStats.maxHealth
    this.health = this.playerStats.currentHealth
    this.playerSpeed = this.playerStats.moveSpeed

    this.updateHealthDisplay()
    this.updateSlotsDisplay()

    // Apply character innate ability early to set special flags (Eclipse unlimitedRerolls, etc.)
    if (this.character) {
      this.character.applyInnateAbility(this.weaponModifiers, this.playerStats)
    }

    // Initialize reroll system from building bonuses
    if (bonuses.rerollUnlocked) {
      this.maxRerolls = bonuses.rerollCharges || 0
      this.rerollsRemaining = this.maxRerolls
      this.updateRerollDisplay()
    } else if (this.playerStats.unlimitedRerolls) {
      // Eclipse gets rerolls even without building unlock
      this.updateRerollDisplay()
    }

    // Initialize allies based on passives and building upgrades
    this.updateAllies()
  }

  private updateSlotsDisplay() {
    // Clear existing containers
    this.weaponSlotsContainer.removeAll(true)
    this.passiveSlotsContainer.removeAll(true)

    const iconSize = 28
    const pipSize = 14
    const slotSpacing = 45

    // Build weapon slots - icons with level pips below
    let xOffset = 0
    this.weapons.forEach((weapon, index) => {
      const config = weapon.getConfig()
      const level = weapon.getLevel()
      const isMaxLevel = level >= config.maxLevel

      // Create icon
      const icon = this.add.text(
        xOffset,
        0,
        config.icon,
        {
          fontFamily: 'Courier New',
          fontSize: `${iconSize}px`,
          color: isMaxLevel ? '#ffff00' : '#ffaa00', // Gold color for max level
        }
      ).setOrigin(0, 0).setInteractive({ useHandCursor: true })

      // Add click handler to open stats popup
      icon.on('pointerdown', () => {
        if (!this.isPaused) {
          this.showStatsPopup()
        }
      })

      // Add sparkle indicator for max level weapons
      if (isMaxLevel) {
        const maxSparkle = this.add.text(
          xOffset + iconSize - 8,
          -4,
          '✦',
          {
            fontFamily: 'Courier New',
            fontSize: '10px',
            color: '#ffff00',
          }
        ).setOrigin(0, 0)

        // Animate the sparkle
        this.tweens.add({
          targets: maxSparkle,
          alpha: { from: 0.5, to: 1 },
          scale: { from: 0.8, to: 1.2 },
          duration: 800,
          yoyo: true,
          repeat: -1,
        })

        this.weaponSlotsContainer.add(maxSparkle)
      }

      // Create level pips below icon
      const levelDots = '•'.repeat(level)
      const pips = this.add.text(
        xOffset,
        iconSize + 2,
        levelDots,
        {
          fontFamily: 'Courier New',
          fontSize: `${pipSize}px`,
          color: isMaxLevel ? '#ffff00' : '#ffaa00',
        }
      ).setOrigin(0, 0)

      this.weaponSlotsContainer.add(icon)
      this.weaponSlotsContainer.add(pips)
      xOffset += slotSpacing
    })

    // Show empty weapon slots
    for (let i = this.weapons.length; i < this.maxWeaponSlots; i++) {
      const emptySlot = this.add.text(
        xOffset,
        0,
        '[ ]',
        {
          fontFamily: 'Courier New',
          fontSize: `${iconSize}px`,
          color: '#ffaa00',
        }
      ).setOrigin(0, 0)
      this.weaponSlotsContainer.add(emptySlot)
      xOffset += slotSpacing
    }

    // Build passive slots - icons with level pips below
    xOffset = 0
    this.passives.forEach((passive, index) => {
      const config = passive.getConfig()
      const level = passive.getLevel()
      const isMaxLevel = level >= config.maxLevel

      // Create icon
      const icon = this.add.text(
        -xOffset,
        0,
        config.icon,
        {
          fontFamily: 'Courier New',
          fontSize: `${iconSize}px`,
          color: isMaxLevel ? '#00ffff' : '#00ffaa', // Brighter cyan for max level
        }
      ).setOrigin(1, 0).setInteractive({ useHandCursor: true })

      // Add click handler to open stats popup
      icon.on('pointerdown', () => {
        if (!this.isPaused) {
          this.showStatsPopup()
        }
      })

      // Add sparkle indicator for max level passives
      if (isMaxLevel) {
        const maxSparkle = this.add.text(
          -xOffset - iconSize + 8,
          -4,
          '✦',
          {
            fontFamily: 'Courier New',
            fontSize: '10px',
            color: '#00ffff',
          }
        ).setOrigin(1, 0)

        // Animate the sparkle
        this.tweens.add({
          targets: maxSparkle,
          alpha: { from: 0.5, to: 1 },
          scale: { from: 0.8, to: 1.2 },
          duration: 800,
          yoyo: true,
          repeat: -1,
        })

        this.passiveSlotsContainer.add(maxSparkle)
      }

      // Create level pips below icon
      const levelDots = '•'.repeat(level)
      const pips = this.add.text(
        -xOffset,
        iconSize + 2,
        levelDots,
        {
          fontFamily: 'Courier New',
          fontSize: `${pipSize}px`,
          color: isMaxLevel ? '#00ffff' : '#00ffaa',
        }
      ).setOrigin(1, 0)

      this.passiveSlotsContainer.add(icon)
      this.passiveSlotsContainer.add(pips)
      xOffset += slotSpacing
    })

    // Show empty passive slots
    for (let i = this.passives.length; i < this.maxPassiveSlots; i++) {
      const emptySlot = this.add.text(
        -xOffset,
        0,
        '[ ]',
        {
          fontFamily: 'Courier New',
          fontSize: `${iconSize}px`,
          color: '#00ffaa',
        }
      ).setOrigin(1, 0)
      this.passiveSlotsContainer.add(emptySlot)
      xOffset += slotSpacing
    }
  }

  private initializeWeaponTracking(weaponName: string) {
    if (!this.weaponDamageTracking.has(weaponName)) {
      // Store game time (excluding pauses) when weapon was acquired
      const gameTime = this.time.now - this.runStartTime - this.totalPausedTime
      this.weaponDamageTracking.set(weaponName, {
        totalDamage: 0,
        acquisitionGameTime: gameTime,
        lastDamageTime: 0
      })
    }
  }

  private trackWeaponDamage(weaponName: string, damage: number) {
    const tracking = this.weaponDamageTracking.get(weaponName)
    if (tracking) {
      tracking.totalDamage += damage
      tracking.lastDamageTime = this.time.now
    } else {
      // Initialize if not already tracked
      this.initializeWeaponTracking(weaponName)
      this.trackWeaponDamage(weaponName, damage)
    }
  }

  private getWeaponDPS(weaponName: string): number {
    const tracking = this.weaponDamageTracking.get(weaponName)
    if (!tracking || tracking.totalDamage === 0) {
      return 0
    }

    // Calculate active time: current game time - game time when acquired
    const currentGameTime = this.time.now - this.runStartTime - this.totalPausedTime
    const activeTime = (currentGameTime - tracking.acquisitionGameTime) / 1000 // Convert to seconds

    if (activeTime <= 0) {
      return 0
    }

    return tracking.totalDamage / activeTime
  }

  private calculateModifiers() {
    // Reset modifiers to defaults
    this.weaponModifiers = { ...DEFAULT_MODIFIERS }

    // Reset player stats to base values
    this.playerStats.maxHealth = this.character.getBaseHealth()
    this.playerStats.moveSpeed = this.character.getBaseMoveSpeed()
    this.playerStats.pickupRadius = PLAYER.DEFAULT_PICKUP_RADIUS
    this.playerStats.damageReduction = 0
    this.playerStats.dodgeChance = 0
    this.playerStats.healthRegen = 0
    this.playerStats.invulnFrames = PLAYER.INVULN_FRAMES
    this.playerStats.revives = 0

    // Apply building bonuses from GameState
    const bonuses = this.gameState.getTotalBonuses()

    // ========== PLAYER STAT BONUSES ==========

    // Health & Defense
    if (bonuses.maxHealth) {
      this.playerStats.maxHealth += bonuses.maxHealth
    }
    if (bonuses.damageReduction) {
      this.playerStats.damageReduction += bonuses.damageReduction
    }
    if (bonuses.healthRegen) {
      this.playerStats.healthRegen += bonuses.healthRegen
    }
    if (bonuses.invulnTime) {
      this.playerStats.invulnFrames = Math.floor(this.playerStats.invulnFrames * (1 + bonuses.invulnTime))
    }
    if (bonuses.revive) {
      this.playerStats.revives += bonuses.revive
    }

    // Movement & Pickup
    if (bonuses.moveSpeed) {
      this.playerStats.moveSpeed *= (1 + bonuses.moveSpeed)
    }
    if (bonuses.pickupRadiusMultiplier) {
      this.playerStats.pickupRadius = Math.floor(this.playerStats.pickupRadius * (1 + bonuses.pickupRadiusMultiplier))
    }

    // ========== WEAPON MODIFIER BONUSES ==========

    // Base damage modifiers
    if (bonuses.damageMultiplier) {
      this.weaponModifiers.damageMultiplier *= (1 + bonuses.damageMultiplier)
    }
    if (bonuses.physicalDamage) {
      this.weaponModifiers.damageMultiplier *= (1 + bonuses.physicalDamage)
    }
    if (bonuses.fireDamage) {
      this.weaponModifiers.damageMultiplier *= (1 + bonuses.fireDamage)
    }
    if (bonuses.coldDamage) {
      this.weaponModifiers.damageMultiplier *= (1 + bonuses.coldDamage)
    }
    if (bonuses.natureDamage) {
      this.weaponModifiers.damageMultiplier *= (1 + bonuses.natureDamage)
    }
    if (bonuses.allyDamage) {
      this.weaponModifiers.damageMultiplier *= (1 + bonuses.allyDamage)
    }

    // Attack speed & projectiles
    if (bonuses.attackSpeed) {
      this.weaponModifiers.fireRateMultiplier *= (1 + bonuses.attackSpeed)
    }
    if (bonuses.projectileSpeed) {
      this.weaponModifiers.projectileSpeedMultiplier *= (1 + bonuses.projectileSpeed)
    }
    if (bonuses.projectileCount) {
      this.weaponModifiers.projectileCount = (this.weaponModifiers.projectileCount || 0) + bonuses.projectileCount
    }

    // Critical hits
    if (bonuses.critChance) {
      this.weaponModifiers.critChance += bonuses.critChance
    }

    // AOE
    if (bonuses.aoeRadiusMultiplier) {
      this.weaponModifiers.projectileSizeMultiplier *= (1 + bonuses.aoeRadiusMultiplier)
    }

    // ========== APPLY PASSIVE & CHARACTER MODIFIERS ==========

    // Apply all passive modifiers
    this.passives.forEach(passive => {
      passive.applyModifiers(this.weaponModifiers)
      passive.applyPlayerEffects(this.playerStats)
    })

    // Apply character innate ability
    if (this.character) {
      this.character.applyInnateAbility(this.weaponModifiers, this.playerStats)
    }

    // Apply power-up effects
    if (this.hasRapidFirePowerUp) {
      this.weaponModifiers.damageMultiplier *= 3.0 // 3x damage boost
    }

    // Apply FROST_HASTE attack speed stacks
    const frostHastePassive = this.passives.find(p => p.getConfig().type === PassiveType.FROST_HASTE)
    if (frostHastePassive && this.frostHasteStacks > 0) {
      const level = frostHastePassive.getLevel()
      const attackSpeedPerStack = 0.05 * level // 5%, 10%, or 15% per stack
      const attackSpeedBonus = 1 + (attackSpeedPerStack * this.frostHasteStacks)
      // Attack speed reduces fire rate cooldown
      this.weaponModifiers.fireRateMultiplier /= attackSpeedBonus
    }

    // Apply OVERDRIVE_REACTOR attack speed burst
    const overdrivePassive = this.passives.find(p => p.getConfig().type === PassiveType.OVERDRIVE_REACTOR)
    if (overdrivePassive && this.hasOverdrive) {
      const level = overdrivePassive.getLevel()
      const attackSpeedBonus = 1 + (0.20 * level) // 20%, 40%, or 60% attack speed
      // Attack speed reduces fire rate cooldown
      this.weaponModifiers.fireRateMultiplier /= attackSpeedBonus
    }

    // Apply calculated stats to game state
    this.maxHealth = this.playerStats.maxHealth
    this.playerSpeed = this.playerStats.moveSpeed
  }

  // Check if adding this weapon or passive would create an evolution
  private checkEvolutionHint(weaponType?: WeaponType, passiveType?: PassiveType): { text: string; partnerIcon?: string; partnerColor?: string; partnerName?: string } | null {
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
            // Get partner passive info
            const partnerPassive = PassiveFactory.create(this, recipe.requiredPassive)
            const partnerConfig = partnerPassive.getConfig()
            return {
              text: `‡ Evolves → ${evolutionConfig.name}`,
              partnerIcon: partnerConfig.icon,
              partnerColor: partnerConfig.color,
              partnerName: partnerConfig.name
            }
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
            // Get partner weapon info
            const partnerWeapon = WeaponFactory.create(this, recipe.baseWeapon, this.projectiles)
            const partnerConfig = partnerWeapon.getConfig()
            return {
              text: `‡ Evolves → ${evolutionConfig.name}`,
              partnerIcon: partnerConfig.icon,
              partnerColor: partnerConfig.color,
              partnerName: partnerConfig.name
            }
          }
        }
      }
    }

    return null
  }

  private getPassiveBenefit(type: PassiveType): string {
    switch (type) {
      case PassiveType.BALLISTICS:
        return '+20% damage per level'
      case PassiveType.WEAPON_SPEED_UP:
        return '+15% fire rate per level'
      case PassiveType.SHIP_ARMOR:
        return '+2 damage reduction per level'
      case PassiveType.ENERGY_CORE:
        return '+25% projectile size, +10% speed'
      case PassiveType.PICKUP_RADIUS:
        return '+50 pickup radius per level'
      case PassiveType.EVASION_DRIVE:
        return '+5% dodge chance per level'
      case PassiveType.CRITICAL_SYSTEMS:
        return '+10% crit chance per level'
      case PassiveType.THRUSTER_MOD:
        return '+20% projectile speed, +10% move speed'
      case PassiveType.OVERDRIVE_REACTOR:
        return 'Attack speed burst on XP pickup'
      case PassiveType.SALVAGE_UNIT:
        return 'Spawns golden pinata enemies'
      case PassiveType.DRONE_BAY_EXPANSION:
        return '+15% ally damage & attack speed'
      default:
        return ''
    }
  }

  private getDamageTypeName(damageType: DamageType): string {
    switch (damageType) {
      case DamageType.FIRE:
        return 'Fire'
      case DamageType.COLD:
        return 'Cold'
      case DamageType.NATURE:
        return 'Nature'
      case DamageType.CONTROL:
        return 'Control'
      case DamageType.PHYSICAL:
      default:
        return 'Physical'
    }
  }

  private generateUpgradeOptions(): Array<{ name: string; description: string; effect: () => void; icon?: string; color?: string; recommended?: boolean; enablesEvolution?: boolean; synergyPartnerIcon?: string; synergyPartnerColor?: string; synergyPartnerName?: string }> {
    const options: Array<{ name: string; description: string; effect: () => void; icon?: string; color?: string; recommended?: boolean; enablesEvolution?: boolean; synergyPartnerIcon?: string; synergyPartnerColor?: string; synergyPartnerName?: string }> = []

    // Check for evolutions FIRST (highest priority - always recommended)
    const availableEvolution = this.evolutionManager.checkForEvolutions(this.weapons, this.passives)
    if (availableEvolution) {
      const evolutionConfig = this.evolutionManager.getEvolutionConfig(availableEvolution.evolution)
      options.push({
        name: `‡ ${evolutionConfig.name} ‡`,
        description: `[EVOLUTION] ${evolutionConfig.description}`,
        icon: evolutionConfig.icon,
        color: '#ffff00',
        recommended: true, // Evolutions are always recommended
        enablesEvolution: false, // Evolutions themselves don't enable other evolutions
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
          this.runStatistics.addEvolution(availableEvolution.evolution)
          this.initializeWeaponTracking(evolvedWeapon.getConfig().name)
          this.modifiersNeedRecalculation = true

          // Mark this evolution recipe as discovered
          const recipeKey = `${availableEvolution.baseWeapon}_${availableEvolution.requiredPassive}`
          this.discoveredEvolutions.add(recipeKey)
        }
      })
    }

    // Add weapon upgrade options
    this.weapons.forEach(weapon => {
      // Exclude evolved weapons from level up options
      if (!weapon.isMaxLevel() && !(weapon instanceof EvolvedWeapon) && !(weapon instanceof SuperEvolvedWeapon)) {
        const config = weapon.getConfig()
        const currentLevel = weapon.getLevel()
        const maxLevel = config.maxLevel
        // Recommend if weapon is close to max level (within 1 level)
        const isNearMaxLevel = currentLevel >= maxLevel - 1

        // Calculate current and next level stats
        const currentDamage = weapon.getDamage()
        const currentFireRate = weapon.getFireRate(this.weaponModifiers)

        // Temporarily level up to see next stats
        const nextDamage = Math.floor(config.baseDamage * (1 + currentLevel * 0.2))
        const nextFireRate = Math.floor((config.baseFireRate * (1 - currentLevel * 0.1)) / this.weaponModifiers.fireRateMultiplier)

        const damageTypeName = this.getDamageTypeName(config.damageType)
        const description = `Level ${currentLevel} → ${currentLevel + 1}\n` +
          `Damage: ${currentDamage} → ${nextDamage} (+${nextDamage - currentDamage})\n` +
          `Fire Rate: ${Math.round(currentFireRate)}ms → ${Math.round(nextFireRate)}ms\n` +
          `Damage Type: ${damageTypeName}`

        options.push({
          name: `${config.name} Level Up`,
          description: description,
          icon: config.icon,
          color: config.color,
          recommended: isNearMaxLevel,
          effect: () => {
            weapon.levelUp()
            this.modifiersNeedRecalculation = true
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
        WeaponType.MISSILE_POD,
        WeaponType.FIREBALL_RING,
        WeaponType.BLOOD_LANCE,
        WeaponType.PLASMA_AURA,
        WeaponType.VORTEX_BLADE,
        WeaponType.ORBITAL_STRIKE,
        WeaponType.MINIGUN,
        WeaponType.TRAP_LAYER,
        WeaponType.SNIPER_RIFLE
      ]
      const ownedTypes = this.weapons.map(w => w.getConfig().type)

      availableWeapons.forEach(type => {
        if (!ownedTypes.includes(type)) {
          const weapon = WeaponFactory.create(this, type, this.projectiles)
          const config = weapon.getConfig()

          // Check for evolution hint
          const evolutionHint = this.checkEvolutionHint(type, undefined)

          // Show initial stats for new weapon
          const damageTypeName = this.getDamageTypeName(config.damageType)
          const statsInfo = `Damage: ${config.baseDamage} | Fire Rate: ${config.baseFireRate}ms\nDamage Type: ${damageTypeName}`
          const description = evolutionHint
            ? `${config.description}\n${statsInfo}\n\n${evolutionHint.text}`
            : `${config.description}\n${statsInfo}`

          // Recommend if first weapon slot is empty OR creates evolution
          const isFirstWeapon = this.weapons.length === 0
          const createsEvolution = evolutionHint !== null

          options.push({
            name: config.name,
            description: description,
            icon: config.icon,
            color: config.color,
            recommended: isFirstWeapon || createsEvolution,
            enablesEvolution: createsEvolution,
            synergyPartnerIcon: evolutionHint?.partnerIcon,
            synergyPartnerColor: evolutionHint?.partnerColor,
            synergyPartnerName: evolutionHint?.partnerName,
            effect: () => {
              const newWeapon = WeaponFactory.create(this, type, this.projectiles)
              this.weapons.push(newWeapon)
              this.initializeWeaponTracking(newWeapon.getConfig().name)
              this.modifiersNeedRecalculation = true
            }
          })
        }
      })
    }

    // Add passive upgrade options
    this.passives.forEach(passive => {
      if (!passive.isMaxLevel()) {
        const config = passive.getConfig()
        const currentLevel = passive.getLevel()
        const maxLevel = config.maxLevel
        // Recommend if passive is close to max level (within 1 level)
        const isNearMaxLevel = currentLevel >= maxLevel - 1

        // Get detailed per-level benefits
        const benefit = this.getPassiveBenefit(config.type)

        const description = `Level ${currentLevel} → ${currentLevel + 1}\n` +
          `${config.description}\n` +
          `${benefit}`

        options.push({
          name: `${config.name} Level Up`,
          description: description,
          icon: config.icon,
          color: config.color,
          recommended: isNearMaxLevel,
          effect: () => {
            passive.levelUp()
            this.modifiersNeedRecalculation = true
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
        PassiveType.DRONE_BAY_EXPANSION,
        PassiveType.VAMPIRIC_FIRE,
        PassiveType.FROST_HASTE,
        PassiveType.STATIC_FORTUNE,
        PassiveType.WINGMAN_PROTOCOL,
        PassiveType.TOXIC_ROUNDS,
        PassiveType.PYROMANIAC,
        PassiveType.SHATTER_STRIKE,
        PassiveType.HEMORRHAGE
      ]
      const ownedTypes = this.passives.map(p => p.getConfig().type)

      availablePassives.forEach(type => {
        if (!ownedTypes.includes(type)) {
          const passive = PassiveFactory.create(this, type)
          const config = passive.getConfig()

          // Check for evolution hint
          const evolutionHint = this.checkEvolutionHint(undefined, type)

          // Show benefit for new passive
          const benefit = this.getPassiveBenefit(type)
          const description = evolutionHint
            ? `${config.description}\n${benefit}\n\n${evolutionHint.text}`
            : `${config.description}\n${benefit}`

          // Recommend if first passive slot is empty OR creates evolution
          const isFirstPassive = this.passives.length === 0
          const createsEvolution = evolutionHint !== null

          options.push({
            name: config.name,
            description: description,
            icon: config.icon,
            color: config.color,
            recommended: isFirstPassive || createsEvolution,
            enablesEvolution: createsEvolution,
            synergyPartnerIcon: evolutionHint?.partnerIcon,
            synergyPartnerColor: evolutionHint?.partnerColor,
            synergyPartnerName: evolutionHint?.partnerName,
            effect: () => {
              const newPassive = PassiveFactory.create(this, type)
              this.passives.push(newPassive)
              this.modifiersNeedRecalculation = true
            }
          })
        }
      })
    }

    return options
  }

  private createLevelBackground(levelIndex: number) {
    // Define level-specific background themes
    const backgroundThemes = [
      { bgColor: 0x1a1a3a, hasCity: false, hasClouds: false },        // 0: Dark blue space (lightened)
      { bgColor: 0x2a1a3e, hasCity: false, hasClouds: false },        // 1: Purple-tinted space (lightened)
      { bgColor: 0x1a2a3e, hasCity: false, hasClouds: true },         // 2: Blue space with clouds (lightened)
      { bgColor: 0x3e1a1a, hasCity: false, hasClouds: false },        // 3: Red-tinted space (lightened)
      { bgColor: 0x3e2a1a, hasCity: false, hasClouds: false },        // 4: Orange space (lightened)
      { bgColor: 0x2a2a1a, hasCity: true, hasClouds: false },         // 5: Dark yellow with city (lightened)
      { bgColor: 0x1a3e1a, hasCity: false, hasClouds: true },         // 6: Green nebula with clouds (lightened)
      { bgColor: 0x1a1a1a, hasCity: false, hasClouds: false },        // 7: Nearly black (eclipse, slightly lightened)
      { bgColor: 0x4e2a1a, hasCity: false, hasClouds: true },         // 8: Dark orange-red with thick clouds (lightened)
      { bgColor: 0x5e1a1a, hasCity: false, hasClouds: true },         // 9: Dark red with apocalyptic clouds (lightened)
    ]

    const theme = backgroundThemes[Math.min(levelIndex, backgroundThemes.length - 1)]

    // Base background rectangle
    this.add.rectangle(0, 0, this.cameras.main.width, this.cameras.main.height, theme.bgColor)
      .setOrigin(0, 0)

    // Add city silhouette at bottom if applicable
    if (theme.hasCity) {
      this.createCitySilhouette()
    }

    // Add cloud layers if applicable
    if (theme.hasClouds) {
      this.createCloudLayer(levelIndex)
    }
  }

  private createCitySilhouette() {
    // Create a simple city skyline using rectangles at the bottom
    const cityHeight = 120
    const buildingCount = 15
    const cityY = this.cameras.main.height - cityHeight

    for (let i = 0; i < buildingCount; i++) {
      const buildingWidth = Phaser.Math.Between(30, 80)
      const buildingHeight = Phaser.Math.Between(40, 100)
      const x = (this.cameras.main.width / buildingCount) * i

      const building = this.add.rectangle(
        x, this.cameras.main.height - buildingHeight,
        buildingWidth, buildingHeight,
        0x000000, 0.4
      ).setOrigin(0, 0)

      // Add occasional windows (small yellow rectangles)
      const windowCount = Phaser.Math.Between(2, 5)
      for (let w = 0; w < windowCount; w++) {
        const windowX = x + Phaser.Math.Between(5, buildingWidth - 10)
        const windowY = this.cameras.main.height - buildingHeight + Phaser.Math.Between(10, buildingHeight - 20)
        this.add.rectangle(windowX, windowY, 4, 6, 0xffff88, 0.6).setOrigin(0, 0)
      }
    }
  }

  private createCloudLayer(levelIndex: number) {
    // Create scrolling clouds with varying opacity
    const cloudCount = levelIndex >= 8 ? 15 : 8 // More clouds for apocalyptic levels
    const cloudOpacity = levelIndex >= 8 ? 0.3 : 0.15

    for (let i = 0; i < cloudCount; i++) {
      const x = Phaser.Math.Between(0, this.cameras.main.width)
      const y = Phaser.Math.Between(0, this.cameras.main.height)
      const width = Phaser.Math.Between(80, 200)
      const height = Phaser.Math.Between(30, 60)

      // Cloud color varies by level (whitish for most, darker for apocalypse)
      const cloudColor = levelIndex >= 8 ? 0x553333 : 0xffffff

      const cloud = this.add.ellipse(x, y, width, height, cloudColor, cloudOpacity)

      // Animate cloud scrolling downward slowly
      this.tweens.add({
        targets: cloud,
        y: this.cameras.main.height + height,
        duration: Phaser.Math.Between(15000, 25000), // Very slow drift
        repeat: -1,
        onRepeat: () => {
          cloud.x = Phaser.Math.Between(0, this.cameras.main.width)
          cloud.y = -height
        }
      })
    }
  }

  private createStarField(levelIndex: number) {
    // Define level-specific star themes
    const levelThemes = [
      { starColor: 0xffffff, density: 1.0 },    // 0: White stars
      { starColor: 0xccaaff, density: 1.1 },    // 1: Purple-tinted stars
      { starColor: 0x88ddff, density: 1.2 },    // 2: Cyan stars
      { starColor: 0xffaaaa, density: 1.3 },    // 3: Red-tinted stars
      { starColor: 0xffcc88, density: 1.5 },    // 4: Orange stars (denser)
      { starColor: 0xffffaa, density: 1.4 },    // 5: Yellow stars
      { starColor: 0xaaffaa, density: 1.2 },    // 6: Green-tinted stars
      { starColor: 0x8888ff, density: 0.8 },    // 7: Dark purple stars (eclipse - sparse)
      { starColor: 0xff8844, density: 1.6 },    // 8: Red-orange stars (apocalypse - very dense)
      { starColor: 0xff4444, density: 1.8 },    // 9: Red stars (armageddon - densest)
    ]

    const theme = levelThemes[Math.min(levelIndex, levelThemes.length - 1)]

    // Create multiple layers of stars for parallax effect (adjusted by level density)
    const baseCounts = [20, 10, 5]
    const starLayers = baseCounts.map((count, i) => ({
      count: Math.floor(count * theme.density),
      speed: 20 + i * 20,
      size: i === 2 ? 2 : 1,
      brightness: 0.15 + i * 0.1,
    }))

    starLayers.forEach(layer => {
      for (let i = 0; i < layer.count; i++) {
        const x = Phaser.Math.Between(0, this.cameras.main.width)
        // Start at random Y position to spread out particles evenly and prevent clumping
        const y = Phaser.Math.Between(-this.cameras.main.height, this.cameras.main.height)

        const alpha = layer.brightness

        // Randomly choose particle type
        const particleType = Phaser.Math.Between(0, 100)
        let particle: Phaser.GameObjects.GameObject

        if (particleType < 70) {
          // 70% chance: Regular star (circle)
          particle = this.add.circle(x, y, layer.size, theme.starColor, alpha)
        } else if (particleType < 85) {
          // 15% chance: Asteroid (diamond/square shapes)
          const asteroidSymbols = ['◆', '◇', '▪', '▫']
          const symbol = Phaser.Utils.Array.GetRandom(asteroidSymbols)
          const hexColor = '#' + theme.starColor.toString(16).padStart(6, '0')
          particle = this.add.text(x, y, symbol, {
            fontFamily: 'Courier New',
            fontSize: `${8 + layer.size * 4}px`,
            color: hexColor,
          }).setOrigin(0.5).setAlpha(alpha * 0.6)
        } else {
          // 15% chance: Cloud/nebula (text symbols or ellipses)
          const cloudType = Phaser.Math.Between(0, 1)
          if (cloudType === 0) {
            // Text cloud symbol
            const hexColor = '#' + theme.starColor.toString(16).padStart(6, '0')
            particle = this.add.text(x, y, '☁', {
              fontFamily: 'Courier New',
              fontSize: `${12 + layer.size * 6}px`,
              color: hexColor,
            }).setOrigin(0.5).setAlpha(alpha * 0.4)
          } else {
            // Ellipse cloud
            particle = this.add.ellipse(x, y, 8 + layer.size * 3, 4 + layer.size * 2, theme.starColor, alpha * 0.3)
          }
        }

        // Calculate how far this particle needs to travel
        const distanceToBottom = this.cameras.main.height + 10 - y
        const baseDuration = (distanceToBottom / layer.speed) * 1000

        // Animate particle scrolling downward
        const tween = this.tweens.add({
          targets: particle,
          y: this.cameras.main.height + 10,
          duration: baseDuration,
          repeat: -1,
          onRepeat: () => {
            // Reset to top with new random X position
            (particle as any).x = Phaser.Math.Between(0, this.cameras.main.width)
            ;(particle as any).y = -10

            // Recalculate duration for consistent speed
            const newDistance = this.cameras.main.height + 20
            const newDuration = (newDistance / layer.speed) * 1000

            // Update the tween duration for next loop
            const particleTween = this.tweens.getTweensOf(particle)[0]
            if (particleTween) {
              particleTween.duration = newDuration
            }
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
        // BASTION: Block touch movement if firing (turret mode)
        const isBastionFiring = this.character && this.character.getConfig().type === 'BASTION' && this.bastionFiredLastFrame
        if (isBastionFiring) {
          return // Cannot move while firing
        }

        const playerBody = this.player.body as Phaser.Physics.Arcade.Body

        // Directly set player position based on pointer movement
        const newX = lastPlayerX + pointer.x - pointer.downX
        const newY = lastPlayerY + pointer.y - pointer.downY

        // Clamp to world bounds, excluding UI areas
        const topUIHeight = LAYOUT.TOP_BAR // Top UI area (health, timer, etc.)
        const bottomUIHeight = LAYOUT.BOTTOM_BAR // Bottom UI area (weapon/passive slots, buffs)

        const clampedX = Phaser.Math.Clamp(newX, 0, this.cameras.main.width)
        const clampedY = Phaser.Math.Clamp(newY, topUIHeight, this.cameras.main.height - bottomUIHeight)

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
    // Enemy spawn probabilities based on campaign level AND survival time
    const rand = Math.random() * 100
    let type: EnemyType
    const campaignLevel = this.campaignManager.getCurrentLevelIndex()
    const survivalTime = this.survivalTime // Time survived in seconds

    // Campaign Level 0 (First Contact): Only 4 enemy types, gradual shooter introduction
    if (campaignLevel === 0) {
      // First 60 seconds: Only non-shooting enemies
      if (survivalTime < 60) {
        if (rand < 60) {
          type = EnemyType.DRONE        // 60% - Basic fodder
        } else if (rand < 90) {
          type = EnemyType.WASP         // 30% - Fast zigzag
        } else {
          type = EnemyType.SWARMER      // 10% - Sinwave
        }
      }
      // 60-120 seconds: Introduce hunters (first shooter)
      else if (survivalTime < 120) {
        if (rand < 50) {
          type = EnemyType.DRONE        // 50% - Basic fodder
        } else if (rand < 75) {
          type = EnemyType.WASP         // 25% - Fast zigzag
        } else if (rand < 90) {
          type = EnemyType.SWARMER      // 15% - Sinwave
        } else {
          type = EnemyType.HUNTER       // 10% - First shooter
        }
      }
      // 120+ seconds: Full level 1 composition with all 4 types
      else {
        if (rand < 45) {
          type = EnemyType.DRONE        // 45% - Basic fodder
        } else if (rand < 70) {
          type = EnemyType.WASP         // 25% - Fast zigzag
        } else if (rand < 85) {
          type = EnemyType.SWARMER      // 15% - Sinwave
        } else {
          type = EnemyType.HUNTER       // 15% - Shooter
        }
      }
    }
    // Higher campaign levels: More variety
    else if (this.level <= 3) {
      // Early game: 85% fodder, 15% shooters
      if (rand < 50) {
        type = EnemyType.DRONE        // 50% - Basic fodder
      } else if (rand < 75) {
        type = EnemyType.WASP         // 25% - Fast fodder
      } else if (rand < 85) {
        type = EnemyType.SWARMER      // 10% - Swarm fodder
      } else if (rand < 95) {
        type = EnemyType.HUNTER       // 10% - Shooter
      } else {
        type = EnemyType.TANK         // 5% - Heavy shooter
      }
    } else if (this.level <= 7) {
      // Mid game: 70% fodder, 30% shooters
      if (rand < 35) {
        type = EnemyType.DRONE        // 35% - Basic fodder
      } else if (rand < 55) {
        type = EnemyType.WASP         // 20% - Fast fodder
      } else if (rand < 70) {
        type = EnemyType.SWARMER      // 15% - Swarm fodder
      } else if (rand < 85) {
        type = EnemyType.HUNTER       // 15% - Shooter
      } else if (rand < 95) {
        type = EnemyType.TANK         // 10% - Heavy shooter
      } else {
        type = EnemyType.SNIPER       // 5% - Elite shooter
      }
    } else {
      // Late game: 60% fodder, 40% shooters + special enemies
      if (rand < 25) {
        type = EnemyType.DRONE        // 25% - Basic fodder
      } else if (rand < 40) {
        type = EnemyType.WASP         // 15% - Fast fodder
      } else if (rand < 52) {
        type = EnemyType.SWARMER      // 12% - Swarm fodder
      } else if (rand < 60) {
        type = EnemyType.BOMBER       // 8% - Exploding fodder
      } else if (rand < 75) {
        type = EnemyType.HUNTER       // 15% - Shooter
      } else if (rand < 88) {
        type = EnemyType.TANK         // 13% - Heavy shooter
      } else if (rand < 96) {
        type = EnemyType.SNIPER       // 8% - Elite shooter
      } else {
        type = EnemyType.ORBITER      // 4% - Circling shooter
      }
    }

    // SALVAGE_UNIT: Chance to spawn golden pinata enemy instead
    const salvagePassive = this.passives.find(p => p.getConfig().type === PassiveType.SALVAGE_UNIT)
    if (salvagePassive) {
      const level = salvagePassive.getLevel()
      const goldenChance = 10 * level // 10%, 20%, or 30% chance
      if (Math.random() * 100 < goldenChance) {
        type = EnemyType.GOLDEN
      }
    }

    // Get current wave for health scaling
    const currentWave = this.waveSystem.getCurrentWave()
    const enemy = this.enemies.spawnEnemy(x, y, type, currentWave)

    // Update cached active enemy count if spawn was successful (performance optimization)
    if (enemy) {
      this.cachedActiveEnemyCount++
    }

    // Track health spawned for debug metrics (use scaled health)
    const baseHealth = ENEMY_CONFIGS[type].health
    const healthMultiplier = Math.pow(1.10, currentWave - 1)
    const enemyHealth = Math.floor(baseHealth * healthMultiplier)
    this.healthTrackingWindow.push({ timestamp: this.time.now, health: enemyHealth })
  }

  private spawnFormation(centerX: number, y: number, formationType: 'line' | 'v' | 'circle' | 'wave') {
    // Spawn enemies in interesting formations (increased sizes)
    const spacing = 60

    switch (formationType) {
      case 'line':
        // Horizontal line of 9 enemies (was 5)
        for (let i = -4; i <= 4; i++) {
          const spawnX = this.clampSpawnX(centerX + i * spacing)
          this.spawnEnemyBasedOnDifficulty(spawnX, y)
        }
        break

      case 'v':
        // V formation (5-7-5-3 pattern - was 3-5-3)
        for (let i = -2; i <= 2; i++) {
          const spawnX = this.clampSpawnX(centerX + i * spacing)
          this.spawnEnemyBasedOnDifficulty(spawnX, y)
        }
        for (let i = -3; i <= 3; i++) {
          const spawnX = this.clampSpawnX(centerX + i * spacing)
          this.spawnEnemyBasedOnDifficulty(spawnX, y - 40)
        }
        for (let i = -2; i <= 2; i++) {
          const spawnX = this.clampSpawnX(centerX + i * spacing)
          this.spawnEnemyBasedOnDifficulty(spawnX, y - 80)
        }
        for (let i = -1; i <= 1; i++) {
          const spawnX = this.clampSpawnX(centerX + i * spacing)
          this.spawnEnemyBasedOnDifficulty(spawnX, y - 120)
        }
        break

      case 'circle':
        // Circle of 10 enemies (was 6)
        for (let i = 0; i < 10; i++) {
          const angle = (i / 10) * Math.PI * 2
          const offsetX = Math.cos(angle) * 80
          const offsetY = Math.sin(angle) * 40
          const spawnX = this.clampSpawnX(centerX + offsetX)
          this.spawnEnemyBasedOnDifficulty(spawnX, y + offsetY)
        }
        break

      case 'wave':
        // Wave pattern (11 enemies - was 7)
        for (let i = -5; i <= 5; i++) {
          const waveOffset = Math.sin((i / 5) * Math.PI) * 30
          const spawnX = this.clampSpawnX(centerX + i * spacing)
          this.spawnEnemyBasedOnDifficulty(spawnX, y + waveOffset)
        }
        break
    }
  }

  private startNextWave() {
    // Clear the pending flag since we're starting now
    this.waveStartPending = false

    // Prevent starting a new wave if one is already in progress
    if (this.waveInProgress) {
      console.warn('Attempted to start wave while one is already in progress - ignoring')
      return
    }

    // Safety check: ensure enemy pool is still valid (prevent crashes during scene shutdown)
    if (!this.enemies || !this.scene.isActive('GameScene')) {
      console.warn('Cannot start wave - scene is shutting down or enemies destroyed')
      return
    }

    const waveData = this.waveSystem.startNextWave()
    if (!waveData) {
      console.log('No more waves - level complete')
      return // No more waves
    }

    console.log(`Starting wave ${this.waveSystem.getCurrentWave()}/${this.waveSystem.getTotalWaves()}`)

    // CRITICAL: Check if pool is too full before spawning
    // If more than 100 enemies are still active, force clear them first to prevent cascading spawn failures
    const poolStatus = this.enemies.getPoolStatus()
    if (poolStatus.active > 100) {
      console.warn(`[Wave Start] Pool has ${poolStatus.active} active enemies - force clearing to prevent spawn failures`)
      this.enemies.getChildren().forEach((enemy: any) => {
        if (enemy.active) {
          // Properly deactivate without visual effects
          enemy.setActive(false)
          enemy.setVisible(false)
          enemy.setPosition(-1000, -1000)
          if (enemy.body) {
            enemy.body.setVelocity(0, 0)
            enemy.body.enable = false
          }
        }
      })
    }

    this.waveInProgress = true
    this.currentWaveEnemyCount = 0
    this.waveStartTime = this.time.now // Track when wave started for failsafe
    this.waveStartPausedTime = this.totalPausedTime // Track paused time at wave start

    // Show/hide boss health bar
    if (waveData.isBoss || waveData.isMiniBoss) {
      this.bossHealthBarBg.setVisible(true)
      this.bossHealthBar.setVisible(true)
      this.bossHealthText.setVisible(true)
      // Boss name will be set when boss is spawned and updateWaveUI is called
      this.bossHealthText.setText(waveData.isBoss ? 'BOSS INCOMING...' : 'MINI-BOSS INCOMING...')
    } else {
      this.bossHealthBarBg.setVisible(false)
      this.bossHealthBar.setVisible(false)
      this.bossHealthText.setVisible(false)
    }

    // Spawn enemies for each bucket in the wave
    waveData.buckets.forEach(bucket => {
      // Determine how many enemies to spawn from this bucket
      const enemyCount = Phaser.Math.Between(bucket.minEnemies, bucket.maxEnemies)

      // For boss/mini-boss waves, spawn the boss first
      if (waveData.isBoss || waveData.isMiniBoss) {
        // Find formation containing any boss type
        const bossFormation = bucket.formations.find(f =>
          f.enemyTypes.some(et => this.isBossType(et) || this.isMiniBossType(et))
        )
        if (bossFormation) {
          const bossType = bossFormation.enemyTypes[0]
          console.log(`[GameScene] Spawning ${waveData.isBoss ? 'BOSS' : 'MINI-BOSS'}: ${bossType}`)
          const actualSpawned = this.spawnWaveFormation(bossFormation, bossType)
          this.currentWaveEnemyCount += actualSpawned
        }
      }

      // Get random formations and spawn them
      let spawnedFromBucket = waveData.isBoss || waveData.isMiniBoss ? 1 : 0 // Start at 1 if we already spawned boss
      while (spawnedFromBucket < enemyCount) {
        const formation = bucket.formations[Math.floor(Math.random() * bucket.formations.length)]
        const enemyType = formation.enemyTypes[Math.floor(Math.random() * formation.enemyTypes.length)]

        // Skip boss/mini-boss formations for supporting enemies (they're already spawned)
        if (this.isBossType(enemyType) || this.isMiniBossType(enemyType)) {
          continue
        }

        // Get actual spawned count (may be less than expected if pool is full)
        const actualSpawned = this.spawnWaveFormation(formation, enemyType)

        // Only count enemies that were actually spawned
        spawnedFromBucket += actualSpawned
        this.currentWaveEnemyCount += actualSpawned

        // Break if we couldn't spawn any enemies (pool exhausted)
        if (actualSpawned === 0) {
          console.warn('Enemy pool exhausted, ending wave spawn early')
          break
        }
      }
    })

    // Log pool status after spawning
    const poolStatusAfter = this.enemies.getPoolStatus()
    console.log(`Wave ${this.waveSystem.getCurrentWave()} spawned ${this.currentWaveEnemyCount} enemies`)
    console.log(`[Pool Status] Total: ${poolStatusAfter.total}, Active: ${poolStatusAfter.active}, Inactive: ${poolStatusAfter.inactive}, Body Disabled: ${poolStatusAfter.bodyDisabled}`)

    // If no enemies could be spawned, check for cascading failure
    if (this.currentWaveEnemyCount === 0) {
      this.consecutiveFailedWaves++
      console.warn(`No enemies spawned for wave (${this.consecutiveFailedWaves} consecutive failures)`)

      // If we've had 3+ consecutive failed spawns, something is seriously wrong
      // Stop trying to advance waves and let the failsafe timer handle it
      if (this.consecutiveFailedWaves >= 3) {
        console.error('CRITICAL: 3+ consecutive wave spawn failures detected. Halting automatic wave advancement to prevent cascading failure.')
        console.error('Pool will be cleared by failsafe timer, then wave will advance naturally.')
        this.waveInProgress = false
        return
      }

      // Try next wave with a longer delay to allow pool cleanup
      this.waveInProgress = false
      this.waveStartPending = true
      this.time.delayedCall(2000, () => {
        this.startNextWave()
      })
      return
    }

    // Successfully spawned enemies - reset failure counter
    this.consecutiveFailedWaves = 0

    // Update wave UI
    this.updateWaveUI()
  }

  // Helper functions to identify boss types
  private isBossType(type?: EnemyType): boolean {
    if (!type) return false
    return type === EnemyType.BOSS ||
           type === EnemyType.SCOUT_COMMANDER ||
           type === EnemyType.TANK_TWIN ||
           type === EnemyType.HIVE_QUEEN ||
           type === EnemyType.ORBITAL_DEVASTATOR ||
           type === EnemyType.FRACTURED_TITAN ||
           type === EnemyType.SHIELD_WARDEN ||
           type === EnemyType.ACE_BOMBER ||
           type === EnemyType.VOID_NEXUS ||
           type === EnemyType.SIEGE_ENGINE ||
           type === EnemyType.MOTHERSHIP_OMEGA
  }

  private isMiniBossType(type?: EnemyType): boolean {
    if (!type) return false
    return type === EnemyType.MINI_BOSS ||
           type === EnemyType.PROTOTYPE_BOMBER ||
           type === EnemyType.VOID_HERALD ||
           type === EnemyType.ASSAULT_CRUISER ||
           type === EnemyType.BATTLE_COORDINATOR
  }

  private clampSpawnX(x: number): number {
    // Clamp spawn X position to be within game bounds with padding
    const padding = 20 // Keep enemies at least 20px from edges
    return Phaser.Math.Clamp(x, padding, this.cameras.main.width - padding)
  }

  private spawnWaveFormation(formation: any, enemyType: EnemyType): number {
    // Add random offsets to prevent multiple formations from spawning at exact same positions
    const centerXOffset = Phaser.Math.Between(-60, 60) // Random horizontal offset
    const yOffset = Phaser.Math.Between(-30, 30) // Random vertical offset

    const centerX = this.cameras.main.centerX + centerXOffset
    const y = -50 + yOffset // Spawn above the screen with variation
    const spacing = formation.spacing || 60
    const currentWave = this.waveSystem.getCurrentWave()
    let spawnedCount = 0

    switch (formation.type) {
      case 'single':
        const count = formation.count || 1
        const spawnedEnemies: Enemy[] = []

        for (let i = 0; i < count; i++) {
          const offsetX = (i - (count - 1) / 2) * 100
          const spawnX = this.clampSpawnX(centerX + offsetX)
          const enemy = this.enemies.spawnEnemy(spawnX, y, enemyType, currentWave)
          if (enemy) {
            spawnedCount++
            spawnedEnemies.push(enemy)
            this.cachedActiveEnemyCount++
          }
        }

        // Handle boss-specific spawning logic
        this.handleBossSpawn(enemyType, spawnedEnemies, centerX, y)
        break

      case 'line':
        for (let i = -4; i <= 4; i++) {
          const spawnX = this.clampSpawnX(centerX + i * spacing)
          const enemy = this.enemies.spawnEnemy(spawnX, y, enemyType, currentWave)
          if (enemy) {
            spawnedCount++
            this.cachedActiveEnemyCount++
          }
        }
        break

      case 'v':
        for (let i = -2; i <= 2; i++) {
          const spawnX = this.clampSpawnX(centerX + i * spacing)
          const enemy = this.enemies.spawnEnemy(spawnX, y, enemyType, currentWave)
          if (enemy) {
            spawnedCount++
            this.cachedActiveEnemyCount++
          }
        }
        for (let i = -3; i <= 3; i++) {
          const spawnX = this.clampSpawnX(centerX + i * spacing)
          const enemy = this.enemies.spawnEnemy(spawnX, y - 40, enemyType, currentWave)
          if (enemy) {
            spawnedCount++
            this.cachedActiveEnemyCount++
          }
        }
        for (let i = -2; i <= 2; i++) {
          const spawnX = this.clampSpawnX(centerX + i * spacing)
          const enemy = this.enemies.spawnEnemy(spawnX, y - 80, enemyType, currentWave)
          if (enemy) {
            spawnedCount++
            this.cachedActiveEnemyCount++
          }
        }
        for (let i = -1; i <= 1; i++) {
          const spawnX = this.clampSpawnX(centerX + i * spacing)
          const enemy = this.enemies.spawnEnemy(spawnX, y - 120, enemyType, currentWave)
          if (enemy) {
            spawnedCount++
            this.cachedActiveEnemyCount++
          }
        }
        break

      case 'circle':
        for (let i = 0; i < 10; i++) {
          const angle = (i / 10) * Math.PI * 2
          const offsetX = Math.cos(angle) * 80
          const offsetY = Math.sin(angle) * 40
          const spawnX = this.clampSpawnX(centerX + offsetX)
          const enemy = this.enemies.spawnEnemy(spawnX, y + offsetY, enemyType, currentWave)
          if (enemy) {
            spawnedCount++
            this.cachedActiveEnemyCount++
          }
        }
        break

      case 'wave':
        for (let i = -5; i <= 5; i++) {
          const waveOffset = Math.sin((i / 5) * Math.PI) * 30
          const spawnX = this.clampSpawnX(centerX + i * spacing)
          const enemy = this.enemies.spawnEnemy(spawnX, y + waveOffset, enemyType, currentWave)
          if (enemy) {
            spawnedCount++
            this.cachedActiveEnemyCount++
          }
        }
        break
    }

    return spawnedCount
  }

  private getFormationSize(formation: any): number {
    switch (formation.type) {
      case 'single':
        return formation.count || 1
      case 'line':
        return 9 // -4 to 4
      case 'v':
        return 20 // 5 + 7 + 5 + 3
      case 'circle':
        return 10
      case 'wave':
        return 11 // -5 to 5
      default:
        return 1
    }
  }

  // Boss-specific spawn handlers
  private handleBossSpawn(enemyType: EnemyType, spawnedEnemies: Enemy[], centerX: number, y: number) {
    const currentWave = this.waveSystem.getCurrentWave()

    switch (enemyType) {
      case EnemyType.TANK_TWIN:
        // Link Tank Twins together - requires exactly 2 twins
        if (spawnedEnemies.length === 2 && spawnedEnemies[0] && spawnedEnemies[1]) {
          spawnedEnemies[0].setLinkedBoss(spawnedEnemies[1])
          spawnedEnemies[1].setLinkedBoss(spawnedEnemies[0])
        }
        break

      case EnemyType.HIVE_QUEEN:
        if (spawnedEnemies.length >= 1 && spawnedEnemies[0]) {
          const queen = spawnedEnemies[0]
          const eggPos = [{ x: -60, y: -40 }, { x: 60, y: -40 }, { x: -60, y: 40 }, { x: 60, y: 40 }]
          eggPos.forEach(pos => {
            const egg = this.enemies.spawnEnemy(this.clampSpawnX(centerX + pos.x), y + pos.y, EnemyType.HIVE_EGG, currentWave)
            if (egg) {
              queen.addChildEnemy(egg)
              this.cachedActiveEnemyCount++
            }
          })
        }
        break

      case EnemyType.ORBITAL_DEVASTATOR:
        if (spawnedEnemies.length >= 1 && spawnedEnemies[0]) {
          const boss = spawnedEnemies[0]
          for (let i = 0; i < 6; i++) {
            const angle = (i / 6) * Math.PI * 2
            const shield = this.enemies.spawnEnemy(this.clampSpawnX(centerX + Math.cos(angle) * 80), y + Math.sin(angle) * 80, EnemyType.ORBITAL_SHIELD, currentWave)
            if (shield) {
              boss.addOrbitalShield(shield)
              this.cachedActiveEnemyCount++
            }
          }
        }
        break

      case EnemyType.SIEGE_ENGINE:
        if (spawnedEnemies.length >= 1 && spawnedEnemies[0]) {
          const boss = spawnedEnemies[0]
          ;[-100, 0, 100].forEach(offsetX => {
            const turret = this.enemies.spawnEnemy(this.clampSpawnX(centerX + offsetX), y + 60, EnemyType.SIEGE_TURRET, currentWave)
            if (turret) {
              boss.addChildEnemy(turret)
              this.cachedActiveEnemyCount++
            }
          })
        }
        break

      case EnemyType.MOTHERSHIP_OMEGA:
        if (spawnedEnemies.length >= 1 && spawnedEnemies[0]) {
          const boss = spawnedEnemies[0]
          for (let i = 0; i < 6; i++) {
            const angle = (i / 6) * Math.PI * 2
            const port = this.enemies.spawnEnemy(this.clampSpawnX(centerX + Math.cos(angle) * 100), y + Math.sin(angle) * 100, EnemyType.WEAPON_PORT, currentWave)
            if (port) {
              boss.addChildEnemy(port)
              this.cachedActiveEnemyCount++
            }
          }
        }
        break
    }
  }

  private updateWaveUI() {
    const currentWave = this.waveSystem.getCurrentWave()
    const totalWaves = this.waveSystem.getTotalWaves()

    // Update wave counter
    this.waveText.setText(`Wave ${currentWave}/${totalWaves}`)

    // Update progress bar based on remaining enemies
    if (this.currentWaveEnemyCount > 0) {
      const activeEnemyCount = this.enemies.getChildren().filter((e: any) => e.active).length
      const progress = 1 - (activeEnemyCount / this.currentWaveEnemyCount)
      const progressBarWidth = 200
      this.waveProgressBar.width = progressBarWidth * Math.max(0, Math.min(1, progress))
    } else {
      this.waveProgressBar.width = 0
    }

    // Update boss health bar if boss wave is active
    const waveData = this.waveSystem.getWaveData()
    if (waveData && (waveData.isBoss || waveData.isMiniBoss)) {
      // Keep health bar visible during entire boss wave
      this.bossHealthBarBg.setVisible(true)
      this.bossHealthBar.setVisible(true)
      this.bossHealthText.setVisible(true)

      // Find boss enemy (includes all custom boss types)
      const boss = this.enemies.getChildren().find((e: any) => {
        const enemy = e as Enemy
        const enemyType = enemy.getType ? enemy.getType() : null
        return enemy.active && (this.isBossType(enemyType) || this.isMiniBossType(enemyType))
      }) as Enemy | undefined

      if (boss) {
        const bossHealth = boss.getHealth()
        const bossMaxHealth = boss.getMaxHealth()
        const healthPercent = bossHealth / bossMaxHealth
        const bossBarWidth = 400
        this.bossHealthBar.width = bossBarWidth * healthPercent
        const bossName = boss.getName() || (waveData.isBoss ? 'BOSS' : 'MINI-BOSS')
        this.bossHealthText.setText(`${bossName} - ${Math.ceil(bossHealth)} / ${bossMaxHealth}`)
      } else {
        // Boss not found yet or already defeated, show waiting message
        this.bossHealthText.setText(waveData.isBoss ? 'BOSS INCOMING...' : 'MINI-BOSS INCOMING...')
      }
    } else {
      // Hide health bar when not in boss wave
      this.bossHealthBarBg.setVisible(false)
      this.bossHealthBar.setVisible(false)
      this.bossHealthText.setVisible(false)
    }
  }

  update(time: number, delta: number) {
    // Cap delta to prevent physics explosions after long pauses (e.g., window loses focus)
    // Max 100ms per frame = 10 FPS minimum
    const cappedDelta = Math.min(delta, 100)

    // Set run start time on first update
    if (this.runStartTime === 0 && !this.isPaused) {
      this.runStartTime = time
    }

    const playerBody = this.player.body as Phaser.Physics.Arcade.Body

    // Star power invulnerability visual effect
    if (!this.isPaused) {
      const timeSinceHit = time - this.lastHitTime
      const isInvulnerable = timeSinceHit < this.playerStats.invulnFrames

      if (isInvulnerable) {
        // Currently invulnerable - show star effect (unless shield is active)
        if (!this.hasShield) {
          // Create rainbow flash effect like Mario star power
          // Cycle through colors rapidly (every 50ms)
          const colorIndex = Math.floor(time / 50) % 7
          const rainbowColors = [
            '#ff0000', // Red
            '#ff7f00', // Orange
            '#ffff00', // Yellow
            '#00ff00', // Green
            '#00ffff', // Cyan
            '#0000ff', // Blue
            '#ff00ff', // Magenta
          ]
          this.player.setColor(rainbowColors[colorIndex])

          // Add a subtle glow effect by pulsing scale
          const glowPhase = Math.sin(time / 100) * 0.05 + 1
          this.player.setScale(glowPhase)
        }
        this.wasInvulnerable = true
      } else if (this.wasInvulnerable) {
        // Just finished being invulnerable - restore color/scale once
        this.wasInvulnerable = false

        // Only restore if no other effects are active
        if (!this.hasShield) {
          this.player.setColor(this.characterColor)
        }
        this.player.setScale(1)
      }
    }

    // BASTION: Block movement if fired weapons last frame (turret mode)
    const isBastionFiring = this.character.getConfig().type === 'BASTION' && this.bastionFiredLastFrame

    // Only allow player movement if not paused and not Bastion firing
    if (!this.isPaused && !isBastionFiring) {
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
      // Stop player movement when paused or Bastion firing
      playerBody.setVelocityX(0)
      playerBody.setVelocityY(0)
    }

    // Create engine trail particles (only if not paused)
    if (!this.isPaused && time - this.lastEngineTrailTime > 50) {
      this.createEngineTrail()
      this.lastEngineTrailTime = time
    }

    // Auto-fire weapons (only if not paused)
    if (!this.isPaused) {
      // Calculate modifiers from passives and character (only when needed for performance)
      if (this.modifiersNeedRecalculation) {
        this.calculateModifiers()
        this.modifiersNeedRecalculation = false
      }

      // Expire old FROST_HASTE stacks
      if (this.frostHasteStacks > 0) {
        const expiredStacks = this.frostHasteExpireTimes.filter(expireTime => time >= expireTime).length
        if (expiredStacks > 0) {
          this.frostHasteExpireTimes = this.frostHasteExpireTimes.filter(expireTime => time < expireTime)
          this.frostHasteStacks = Math.max(0, this.frostHasteStacks - expiredStacks)
          this.modifiersNeedRecalculation = true // Attack speed changed
        }
      }

      // Apply health regeneration
      if (this.playerStats.healthRegen > 0) {
        const regenAmount = (this.playerStats.healthRegen * cappedDelta) / 1000 // Convert to per-second
        this.health = Math.floor(Math.min(this.maxHealth, this.health + regenAmount))
      }

      // Fire all equipped weapons
      this.bastionFiredLastFrame = false // Reset Bastion firing tracker
      this.weapons.forEach(weapon => {
        // Apply character-specific modifiers per weapon
        const weaponModifiers = { ...this.weaponModifiers }

        // NOTE: Glacier bonus is now applied in GlacierCharacter.applyInnateAbility(), not here

        // Havoc: Minigun never stops firing (near-instant fire rate)
        if (this.character.getConfig().type === 'HAVOC' && weapon.getConfig().type === 'MINIGUN') {
          weaponModifiers.fireRateMultiplier *= 0.01 // 99% faster = continuous fire
        }

        if (weapon.canFire(time, weaponModifiers)) {
          weapon.fire(this.player.x, this.player.y - 30, weaponModifiers)
          weapon.setLastFireTime(time)

          // Track for Bastion turret mode
          if (this.character.getConfig().type === 'BASTION') {
            this.bastionFiredLastFrame = true
            if (this.character instanceof BastionCharacter) {
              this.character.setFiring(true)
            }
          }
        }
      })

      // Update Bastion firing state if didn't fire
      if (!this.bastionFiredLastFrame && this.character.getConfig().type === 'BASTION') {
        if (this.character instanceof BastionCharacter) {
          this.character.setFiring(false)
        }
      }
    }

    // Wave-based spawning (only if not paused)
    if (!this.isPaused) {
      // Periodic pool status logging (every 10 seconds)
      if (time - this.lastPoolLogTime > 10000) {
        const poolStatus = this.enemies.getPoolStatus()
        console.log(`[Pool Health Check] Active: ${poolStatus.active}/${this.enemies.getChildren().length}, Inactive: ${poolStatus.inactive}, Body Disabled: ${poolStatus.bodyDisabled}`)

        // Periodic sync of cached count to prevent drift (performance optimization)
        this.cachedActiveEnemyCount = poolStatus.active

        this.lastPoolLogTime = time
      }

      // Use cached active enemy count instead of filtering entire pool every frame (performance optimization)
      const activeEnemyCount = this.cachedActiveEnemyCount

      // Start first wave if not started yet
      if (this.waveSystem.getCurrentWave() === 0 && !this.waveInProgress && !this.waveStartPending) {
        this.startNextWave()
      }

      // Check if all enemies are cleared and wave is in progress
      // Add grace period: don't check for completion until at least 2 seconds after wave starts
      const pausedDuringWave = this.totalPausedTime - this.waveStartPausedTime
      const timeSinceWaveStart = time - this.waveStartTime - pausedDuringWave
      if (this.waveInProgress && activeEnemyCount === 0 && this.currentWaveEnemyCount > 0 && timeSinceWaveStart > 2000) {
        console.log(`Wave ${this.waveSystem.getCurrentWave()} complete! Time: ${timeSinceWaveStart}ms, Enemies spawned: ${this.currentWaveEnemyCount}`)
        // Wave cleared! Apply wave heal bonus
        const bonuses = this.gameState.getTotalBonuses()
        if (bonuses.waveHeal && bonuses.waveHeal > 0) {
          this.health = Math.floor(Math.min(this.maxHealth, this.health + bonuses.waveHeal))

          // Show healing text
          const healText = this.add.text(
            this.player.x,
            this.player.y - 50,
            `+${Math.floor(bonuses.waveHeal)} HP`,
            {
              fontFamily: 'Courier New',
              fontSize: '20px',
              color: '#00ff00',
              fontStyle: 'bold',
            }
          ).setOrigin(0.5).setDepth(100)

          // Animate heal text rising and fading
          this.tweens.add({
            targets: healText,
            y: healText.y - 40,
            alpha: 0,
            duration: 1000,
            onComplete: () => {
              healText.destroy()
            }
          })
        }

        // Track wave clear for Vulcan character
        if (this.character && 'onWaveCleared' in this.character) {
          (this.character as any).onWaveCleared()
        }

        // Start next wave immediately
        this.waveInProgress = false
        this.currentWaveEnemyCount = 0
        this.consecutiveFailedWaves = 0 // Reset failure counter on successful wave completion
        this.waveStartPending = true
        this.time.delayedCall(1000, () => {
          this.startNextWave()
        })
      }

      // Failsafe 1: If wave has been running for too long, force advance
      // This prevents the game from getting stuck if an enemy doesn't register as dead
      // Use longer timeout for boss waves since they take longer to defeat
      if (this.waveInProgress && this.waveStartTime > 0) {
        const pausedDuringWave = this.totalPausedTime - this.waveStartPausedTime
        const waveDuration = time - this.waveStartTime - pausedDuringWave
        const waveData = this.waveSystem.getWaveData()
        const isBossWave = waveData && (waveData.isBoss || waveData.isMiniBoss)
        const WAVE_TIMEOUT = isBossWave ? 180000 : 45000 // 180 seconds for boss waves, 45 for normal (increased to allow enemies to despawn naturally)

        if (waveDuration > WAVE_TIMEOUT) {
          console.warn(`Wave failsafe triggered! Wave has been running for ${waveDuration / 1000}s. Active enemies: ${activeEnemyCount}`)

          // Force clear any remaining enemies
          this.enemies.getChildren().forEach((enemy: any) => {
            if (enemy.active) {
              enemy.destroy()
            }
          })

          // Start next wave
          this.waveInProgress = false
          this.currentWaveEnemyCount = 0
          this.waveStartPending = true
          this.time.delayedCall(1000, () => {
            this.startNextWave()
          })
        }
      }

      // Failsafe 2: If no wave is in progress and no enemies are active, start next wave
      // This handles cases where the wave system got stuck
      // Increased delay to 10 seconds to avoid rapid wave advancement and allow time for enemies to despawn
      if (!this.waveInProgress && !this.waveStartPending && activeEnemyCount === 0 && this.waveSystem.getCurrentWave() > 0 && !this.waveSystem.isComplete()) {
        const pausedDuringWave = this.totalPausedTime - this.waveStartPausedTime
        const timeSinceWaveStart = time - this.waveStartTime - pausedDuringWave
        // Only trigger if it's been at least 10 seconds since last wave start (avoid rapid re-trigger)
        if (timeSinceWaveStart > 10000) {
          console.warn('Wave system stuck - no wave in progress but no enemies. Starting next wave.')
          this.waveStartPending = true
          this.startNextWave()
        }
      }

      // Update wave UI
      this.updateWaveUI()

      // Check for win condition (all waves complete)
      if (this.waveSystem.isComplete() && activeEnemyCount === 0) {
        this.levelWon()
      }

    }

    // Update projectiles, enemies, and XP drops (only if not paused)
    if (!this.isPaused) {
      this.projectiles.update(cappedDelta)
      this.enemies.update(time, cappedDelta)
      this.allies.update(time, cappedDelta, this.player.x, this.player.y, this.enemies)
      this.enemyProjectiles.update(cappedDelta)

      // Check for ally respawns
      this.allyRespawnTimers.forEach((respawnTime, allyKey) => {
        if (time >= respawnTime) {
          // Remove from timer map
          this.allyRespawnTimers.delete(allyKey)

          // Respawn ONLY the Gun Buddy and Wingman allies (not building allies)
          this.respawnAutoRespawnAllies()

          // Show respawn notification
          const text = this.add.text(this.player.x, this.player.y - 40, 'Ally Respawned!', {
            fontFamily: 'Courier New',
            fontSize: '16px',
            color: '#00ff00',
            stroke: '#000000',
            strokeThickness: 2
          }).setOrigin(0.5).setDepth(100)

          this.tweens.add({
            targets: text,
            y: this.player.y - 70,
            alpha: { from: 1, to: 0 },
            duration: 1500,
            onComplete: () => text.destroy()
          })
        }
      })

      // Update XP drops (pass player's pickup radius from stats)
      this.xpDrops.update(this.player.x, this.player.y, this.playerStats.pickupRadius)

      // Update credit drops
      this.creditDrops.update(this.player.x, this.player.y, this.playerStats.pickupRadius)

      this.powerUps.update()

      // Update damage zones
      this.damageZones = this.damageZones.filter(zone => {
        const isActive = zone.update(time, this.enemies)
        if (!isActive) {
          zone.destroy()
        }
        return isActive
      })

      // Update combo timer
      if (this.comboCount > 0) {
        this.comboTimer -= cappedDelta
        if (this.comboTimer <= 0) {
          this.resetCombo()
        }
      }

      // Update power-up timers
      this.updatePowerUpTimers(time)

      // Update buff display only when power-up state changes (performance optimization)
      const currentPowerUpState = `${this.hasShield}-${this.hasRapidFirePowerUp}-${this.hasMagnet}-${this.hasOverdrive}`
      if (currentPowerUpState !== this.lastPowerUpDisplayState) {
        this.updatePowerUpDisplay()
        this.lastPowerUpDisplayState = currentPowerUpState
      } else if (this.buffDisplays.size > 0) {
        // Still update fill bars for smooth depletion
        const currentTime = this.time.now
        this.buffDisplays.forEach((display) => {
          const elapsed = currentTime - display.startTime
          const remaining = Math.max(0, display.duration - elapsed)
          const fillPercent = remaining / display.duration
          display.fill.width = (40 - 4) * fillPercent
        })
      }

      // Update survival timer (excluding paused time) - no display, just tracking for stats
      this.survivalTime = Math.floor((time - this.runStartTime - this.totalPausedTime) / 1000)

      // Update health bar position to follow player
      this.updateHealthDisplay()
    }
  }

  private handleEnemyDied(data: { x: number; y: number; xpValue: number; reachedBottom?: boolean; type?: EnemyType }) {
    // Update cached active enemy count for performance
    this.cachedActiveEnemyCount = Math.max(0, this.cachedActiveEnemyCount - 1)

    // If enemy reached bottom naturally, don't play sounds or spawn drops
    if (data.reachedBottom) {
      return
    }

    // Play enemy explosion sound
    soundManager.playEnemyExplode(0.3)

    // Increment combo and kill count
    this.comboCount++
    this.killCount++
    this.comboTimer = this.comboTimeout
    this.updateCombo()

    // Apply combo multiplier to XP and score
    let multipliedXP = Math.floor(data.xpValue * this.comboMultiplier)
    const scoreGain = Math.floor(data.xpValue * 10 * this.comboMultiplier)

    // Apply building XP bonus
    const bonuses = this.gameState.getTotalBonuses()
    if (bonuses.xpMultiplier) {
      multipliedXP = Math.floor(multipliedXP * (1 + bonuses.xpMultiplier))
    }

    // Add to score
    this.score += scoreGain
    this.scoreText.setText(`Score: ${this.score} | 👑: ${Math.max(this.score, this.highScore)}`)

    // Award meta currency (credits) - 1 credit per 5 XP
    let creditsEarned = Math.floor(multipliedXP / 5)
    if (bonuses.creditMultiplier) {
      creditsEarned = Math.floor(creditsEarned * (1 + bonuses.creditMultiplier))
    }
    if (creditsEarned > 0) {
      this.gameState.addCredits(creditsEarned)
      this.creditsCollectedThisRun += creditsEarned
      this.creditsCollectedText.setText(`${this.creditsCollectedThisRun}¤`)
    }

    // Check if this is a boss or mini-boss (includes all custom bosses)
    const isBoss = this.isBossType(data.type)
    const isMiniBoss = this.isMiniBossType(data.type)

    if (isBoss || isMiniBoss) {
      // Boss/Mini-boss drops: spawn lots of XP, credits, and guaranteed health pack
      const xpDropCount = isBoss ? 15 : 8 // Boss drops 15 XP items, Mini-boss drops 8
      const creditDropCount = isBoss ? 10 : 5 // Boss drops 10 credit items, Mini-boss drops 5

      // Spawn XP items in a circle around boss
      for (let i = 0; i < xpDropCount; i++) {
        const angle = (i / xpDropCount) * Math.PI * 2
        const radius = 60 + Math.random() * 40 // 60-100 pixel radius
        const offsetX = Math.cos(angle) * radius
        const offsetY = Math.sin(angle) * radius
        this.xpDrops.spawnXP(data.x + offsetX, data.y + offsetY, Math.floor(multipliedXP / xpDropCount))
      }

      // Spawn credit items in a circle around boss
      for (let i = 0; i < creditDropCount; i++) {
        const angle = (i / creditDropCount) * Math.PI * 2 + Math.PI / creditDropCount // Offset from XP items
        const radius = 40 + Math.random() * 30 // 40-70 pixel radius
        const offsetX = Math.cos(angle) * radius
        const offsetY = Math.sin(angle) * radius
        const creditAmount = isBoss ? 5 : 3 // Boss credits worth more
        this.creditDrops.spawnCredit(data.x + offsetX, data.y + offsetY, creditAmount)
      }

      // Always spawn health pack at boss center
      this.powerUps.spawnPowerUp(data.x, data.y, PowerUpType.HEALTH)

      // Mini-bosses always drop a treasure chest (slightly offset from center)
      if (isMiniBoss) {
        const chestOffsetX = Phaser.Math.Between(-20, 20)
        const chestOffsetY = Phaser.Math.Between(-20, 20)
        this.powerUps.spawnPowerUp(data.x + chestOffsetX, data.y + chestOffsetY, PowerUpType.CHEST)
        this.chestsSpawnedThisRun++
      }
    } else {
      // Normal enemy drops: spawn single XP drop at enemy position
      this.xpDrops.spawnXP(data.x, data.y, multipliedXP)
    }

    // Golden enemy special drops: lots of credits in a circle
    const isGolden = data.type === EnemyType.GOLDEN
    if (isGolden) {
      const creditDropCount = 8 // 8 credit drops in a circle
      for (let i = 0; i < creditDropCount; i++) {
        const angle = (i / creditDropCount) * Math.PI * 2
        const radius = 40 + Math.random() * 30 // 40-70 pixel radius
        const offsetX = Math.cos(angle) * radius
        const offsetY = Math.sin(angle) * radius
        const creditAmount = 6 // 6 credits per drop, 48 total
        this.creditDrops.spawnCredit(data.x + offsetX, data.y + offsetY, creditAmount)
      }
    }

    // Chance to spawn credit drop OR health potion (25% chance) - only for normal enemies
    if (!isBoss && !isMiniBoss && !isGolden && Math.random() < 0.25) {
      // If player is hurt, chance to drop health potion instead of credits
      const isHurt = this.health < this.maxHealth
      const bonuses = this.gameState.getTotalBonuses()
      const baseHealthDropRate = 0.10 // 10% base
      const healthDropRate = baseHealthDropRate + (bonuses.healthDropRate || 0)
      const shouldDropHealth = isHurt && Math.random() < healthDropRate

      if (shouldDropHealth) {
        // Spawn health potion instead of credits
        const angle = Math.random() * Math.PI * 2
        const radius = 30 + Math.random() * 20
        const offsetX = Math.cos(angle) * radius
        const offsetY = Math.sin(angle) * radius
        this.powerUps.spawnPowerUp(data.x + offsetX, data.y + offsetY, PowerUpType.HEALTH)
      } else {
        // Spawn credits normally
        const creditAmount = Math.max(1, Math.floor(data.xpValue / 10))

        // Spawn credit in a random ring around the enemy (30-50 pixels away)
        const angle = Math.random() * Math.PI * 2
        const radius = 30 + Math.random() * 20 // Random radius between 30-50
        const offsetX = Math.cos(angle) * radius
        const offsetY = Math.sin(angle) * radius

        this.creditDrops.spawnCredit(data.x + offsetX, data.y + offsetY, creditAmount)
      }
    }

    // Guaranteed chest system + random power-ups
    let shouldSpawnChest = false

    // Check if we hit a guaranteed chest milestone
    if (this.guaranteedChestMilestones.includes(this.killCount) &&
        this.chestsSpawnedThisRun < this.maxChestsPerRun) {
      shouldSpawnChest = true
    }

    if (shouldSpawnChest) {
      // Spawn guaranteed chest
      this.powerUps.spawnPowerUp(data.x, data.y, PowerUpType.CHEST)
      this.chestsSpawnedThisRun++
    } else {
      // Regular random power-up spawn (3% chance)
      if (Math.random() < 0.03) {
        const powerUp = this.powerUps.spawnRandomPowerUp(data.x, data.y)

        // Track if a chest was randomly spawned to enforce max cap
        if (powerUp && powerUp.getPowerUpType() === PowerUpType.CHEST) {
          this.chestsSpawnedThisRun++

          // If we exceeded max chests, destroy this one and spawn a different power-up
          if (this.chestsSpawnedThisRun > this.maxChestsPerRun) {
            powerUp.setActive(false)
            powerUp.setVisible(false)
            this.chestsSpawnedThisRun--

            // Spawn a different random power-up (non-chest)
            const rand = Math.random() * 92 // Exclude chest (which starts at 92)
            let type: PowerUpType
            if (rand < 32) {
              type = PowerUpType.RAPID_FIRE
            } else if (rand < 59) {
              type = PowerUpType.SHIELD
            } else if (rand < 81) {
              type = PowerUpType.MAGNET
            } else {
              type = PowerUpType.NUKE
            }
            this.powerUps.spawnPowerUp(data.x, data.y, type)
          }
        }
      }
    }

    // Boss-specific death mechanics
    this.handleBossDeath(data)

    // Create particle explosion effect
    this.createExplosionEffect(data.x, data.y)
  }

  // Boss death mechanics
  private handleBossDeath(data: { x: number; y: number; type?: EnemyType }) {
    if (!data.type) return
    const currentWave = this.waveSystem.getCurrentWave()

    switch (data.type) {
      case EnemyType.FRACTURED_TITAN:
        for (let i = 0; i < 2; i++) {
          const offsetX = (i === 0 ? -40 : 40)
          const spawned = this.enemies.spawnEnemy(this.clampSpawnX(data.x + offsetX), data.y, EnemyType.FRACTURED_MEDIUM, currentWave)
          if (spawned) this.cachedActiveEnemyCount++
        }
        break

      case EnemyType.FRACTURED_MEDIUM:
        for (let i = 0; i < 2; i++) {
          const offsetX = (i === 0 ? -30 : 30)
          const spawned = this.enemies.spawnEnemy(this.clampSpawnX(data.x + offsetX), data.y, EnemyType.FRACTURED_SMALL, currentWave)
          if (spawned) this.cachedActiveEnemyCount++
        }
        break

      case EnemyType.PROTOTYPE_BOMBER:
      case EnemyType.ACE_BOMBER:
      case EnemyType.ESCORT_BOMBER:
        this.createExplosiveTrail(data.x, data.y, 3)
        break
    }
  }

  private createExplosiveTrail(x: number, y: number, count: number) {
    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2
      const distance = 40 + Math.random() * 60
      const offsetX = Math.cos(angle) * distance
      const offsetY = Math.sin(angle) * distance
      const marker = this.add.circle(x + offsetX, y + offsetY, 20, 0xff6600, 0.6).setDepth(5)

      this.time.delayedCall(500 + i * 200, () => {
        if (marker.active) {
          const distToPlayer = Phaser.Math.Distance.Between(marker.x, marker.y, this.player.x, this.player.y)
          if (distToPlayer < 40) this.takeDamage(15)
          this.createExplosionEffect(marker.x, marker.y)
          marker.destroy()
        }
      })
    }
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
    // Play XP pickup sound
    soundManager.play(SoundType.XP_PICKUP, 0.3)

    // OVERDRIVE_REACTOR: Trigger attack speed burst on XP pickup
    const overdrivePassive = this.passives.find(p => p.getConfig().type === PassiveType.OVERDRIVE_REACTOR)
    if (overdrivePassive) {
      const level = overdrivePassive.getLevel()
      const duration = (2 + level) * 1000 // 3s/4s/5s duration

      // Add or refresh the buff
      this.hasOverdrive = true
      this.overdriveEndTime = this.time.now + duration
    }

    // Apply character XP multiplier (Vulcan, Supernova)
    if (this.playerStats.xpMultiplier && this.playerStats.xpMultiplier > 1) {
      xpValue = Math.floor(xpValue * this.playerStats.xpMultiplier)
    }

    // Update total XP
    this.totalXP += xpValue
    this.updateXPDisplay()

    // Check for level up (only allow one level up per XP collection)
    // This prevents multiple level up prompts from stacking
    if (this.totalXP >= this.xpToNextLevel && !this.isPaused) {
      // Calculate how many levels we can gain
      let levelsGained = 0
      let remainingXP = this.totalXP
      let nextLevelRequirement = this.xpToNextLevel

      while (remainingXP >= nextLevelRequirement && levelsGained < 1) {
        remainingXP -= nextLevelRequirement
        nextLevelRequirement = Math.floor(nextLevelRequirement * 1.5)
        levelsGained++
      }

      // Queue up level ups (but only trigger the first one immediately)
      this.pendingLevelUps = levelsGained
      this.levelUp()
    }
  }

  private handleCreditCollected(creditValue: number) {
    // Play credit pickup sound
    soundManager.play(SoundType.CREDIT_PICKUP, 0.4)

    // Add credits to game state
    this.gameState.addCredits(creditValue)

    // Update run counter
    this.creditsCollectedThisRun += creditValue
    this.creditsCollectedText.setText(`${this.creditsCollectedThisRun}¤`)
  }

  private handleLaserFire(data: { x: number; y: number; damage: number; beamCount: number; maxRange: number; color: string; weaponName?: string }) {
    // RAYCAST laser implementation - no projectiles!
    // Find nearest enemies and draw laser lines to them

    const activeEnemies = this.enemies.getChildren().filter((e: any) => {
      // Filter for active enemies with valid on-screen positions
      return e.active && e.y > 0 && e.y < this.cameras.main.height &&
             e.x >= 0 && e.x <= this.cameras.main.width
    }) as any[]

    if (activeEnemies.length === 0) return

    // Sort enemies by distance
    activeEnemies.sort((a: any, b: any) => {
      const distA = Phaser.Math.Distance.Between(data.x, data.y, a.x, a.y)
      const distB = Phaser.Math.Distance.Between(data.x, data.y, b.x, b.y)
      return distA - distB
    })

    // Fire beams at nearest enemies (up to beamCount)
    const targetsToHit = Math.min(data.beamCount, activeEnemies.length)

    for (let i = 0; i < targetsToHit; i++) {
      const enemy = activeEnemies[i]
      const distance = Phaser.Math.Distance.Between(data.x, data.y, enemy.x, enemy.y)

      // Only hit enemies within range and with valid positions
      if (distance <= data.maxRange && enemy.active && enemy.x >= 0 && enemy.y > 0) {
        // Apply damage directly
        enemy.takeDamage(data.damage)

        // Track damage dealt
        this.totalDamageDealt += data.damage
        this.damageTrackingWindow.push({ timestamp: this.time.now, damage: data.damage })
        if (data.weaponName) {
          this.trackWeaponDamage(data.weaponName, data.damage)
        }

        // Draw visual laser line from player to enemy
        // Set line position to player, then draw from (0,0) to relative enemy position
        const laserLine = this.add.line(
          data.x,
          data.y,
          0,
          0,
          enemy.x - data.x,
          enemy.y - data.y,
          Phaser.Display.Color.HexStringToColor(data.color).color
        )
        laserLine.setOrigin(0, 0) // Fix: Set origin to (0,0) so line starts from player position, not centered
        laserLine.setLineWidth(2)
        laserLine.setDepth(25)

        // Fade out and destroy the line
        this.tweens.add({
          targets: laserLine,
          alpha: 0,
          duration: 150,
          onComplete: () => laserLine.destroy()
        })
      }
    }
  }

  private updateXPDisplay() {
    // Update XP text overlaid on bar
    this.xpText.setText(`XP: ${this.totalXP} / ${this.xpToNextLevel}`)

    // Update XP bar width
    const xpBarMaxWidth = 101 // 105 - 4 for padding (30% smaller than original)
    const xpPercent = this.totalXP / this.xpToNextLevel
    const newWidth = xpBarMaxWidth * xpPercent

    this.xpBarFill.width = newWidth
  }

  private levelUp() {
    // Play level up sound
    soundManager.play(SoundType.LEVEL_UP)

    this.level++
    this.totalXP = 0
    // Use predefined XP requirements table, or use last value for levels beyond the table
    const nextLevelIndex = this.level - 1 // level 2 uses index 1 (level 2→3)
    this.xpToNextLevel = nextLevelIndex < XP_REQUIREMENTS.length
      ? XP_REQUIREMENTS[nextLevelIndex]
      : XP_REQUIREMENTS[XP_REQUIREMENTS.length - 1]

    // Decrement pending level ups
    if (this.pendingLevelUps > 0) {
      this.pendingLevelUps--
    }

    // Create sparkle burst effect around player
    this.createLevelUpBurst()

    // Update UI
    this.levelText.setText(`${this.level}`)
    this.updateXPDisplay()

    // Pause game and show upgrades
    this.isPaused = true
    this.pauseStartTime = this.time.now
    this.physics.pause()
    // Pause star field
    this.starFieldTweens.forEach(tween => tween.pause())
    this.showUpgradeOptions()
  }

  private resumeGame() {
    // Track paused time before unpausing
    if (this.pauseStartTime > 0) {
      this.totalPausedTime += this.time.now - this.pauseStartTime
      this.pauseStartTime = 0
    }

    // Check if there are pending level ups to show
    if (this.pendingLevelUps > 0) {
      // Don't unpause, show next level up instead
      this.levelUp()
    } else {
      // Resume game normally
      this.isPaused = false
      this.physics.resume()
      this.starFieldTweens.forEach(tween => tween.resume())
    }
  }

  private createLevelUpBurst() {
    // Create 16-20 sparkle particles that burst outward from player
    const sparkleCount = Phaser.Math.Between(16, 20)
    const playerX = this.player.x
    const playerY = this.player.y

    for (let i = 0; i < sparkleCount; i++) {
      const angle = (Math.PI * 2 / sparkleCount) * i
      const distance = 80 + Phaser.Math.Between(-20, 20)
      const speed = 200 + Phaser.Math.Between(-50, 50)

      const sparkle = this.add.text(
        playerX,
        playerY,
        '✦',
        {
          fontFamily: 'Courier New',
          fontSize: '14px',
          color: Phaser.Display.Color.HSLToColor(i / sparkleCount, 1, 0.6).rgba,
        }
      ).setOrigin(0.5).setDepth(100)

      // Animate sparkle bursting outward and fading
      this.tweens.add({
        targets: sparkle,
        x: playerX + Math.cos(angle) * distance,
        y: playerY + Math.sin(angle) * distance,
        alpha: { from: 1, to: 0 },
        scale: { from: 1.5, to: 0.5 },
        duration: 800,
        ease: 'Cubic.easeOut',
        onComplete: () => sparkle.destroy()
      })
    }
  }

  private createEngineTrail() {
    // Create subtle sparkle trail behind the player ship
    const trail = this.add.text(
      this.player.x + Phaser.Math.Between(-5, 5),
      this.player.y + 20, // Behind the ship
      '·',
      {
        fontFamily: 'Courier New',
        fontSize: '12px',
        color: '#00ccff',
      }
    ).setOrigin(0.5).setDepth(9).setAlpha(0.6)

    // Fade out and fall behind
    this.tweens.add({
      targets: trail,
      y: trail.y + 40,
      alpha: 0,
      scale: 0.5,
      duration: 400,
      ease: 'Cubic.easeOut',
      onComplete: () => trail.destroy()
    })
  }

  private createCriticalHitBurst(x: number, y: number) {
    // Create 8-10 sparkle particles that burst outward from the hit point
    const sparkleCount = Phaser.Math.Between(8, 10)

    for (let i = 0; i < sparkleCount; i++) {
      const angle = (Math.PI * 2 / sparkleCount) * i + Phaser.Math.FloatBetween(-0.2, 0.2)
      const distance = 40 + Phaser.Math.Between(-10, 10)

      const sparkle = this.add.text(
        x,
        y,
        '★',
        {
          fontFamily: 'Courier New',
          fontSize: '16px',
          color: '#ff4400',
        }
      ).setOrigin(0.5).setDepth(50)

      // Animate sparkle bursting outward and fading
      this.tweens.add({
        targets: sparkle,
        x: x + Math.cos(angle) * distance,
        y: y + Math.sin(angle) * distance,
        alpha: { from: 1, to: 0 },
        scale: { from: 1.5, to: 0.3 },
        rotation: Phaser.Math.FloatBetween(-Math.PI, Math.PI),
        duration: 400,
        ease: 'Cubic.easeOut',
        onComplete: () => sparkle.destroy()
      })
    }
  }

  private createVictoryConfetti() {
    // Create 40-50 colorful confetti particles that rain down from the top
    const confettiCount = Phaser.Math.Between(40, 50)
    const confettiChars = ['✦', '★', '◆', '●', '♦', '■']
    const colors = ['#ff4444', '#44ff44', '#4444ff', '#ffff44', '#ff44ff', '#44ffff', '#ff8844', '#88ff44']

    for (let i = 0; i < confettiCount; i++) {
      const char = Phaser.Utils.Array.GetRandom(confettiChars)
      const color = Phaser.Utils.Array.GetRandom(colors)
      const startX = Phaser.Math.Between(0, this.cameras.main.width)
      const startY = -50 - Phaser.Math.Between(0, 200)
      const endY = this.cameras.main.height + 50

      const confetti = this.add.text(
        startX,
        startY,
        char,
        {
          fontFamily: 'Courier New',
          fontSize: '20px',
          color: color,
        }
      ).setOrigin(0.5).setDepth(202)

      // Animate confetti falling down with rotation
      this.tweens.add({
        targets: confetti,
        y: endY,
        x: startX + Phaser.Math.Between(-100, 100),
        rotation: Phaser.Math.FloatBetween(-Math.PI * 4, Math.PI * 4),
        alpha: { from: 1, to: 0.3 },
        duration: 3000 + Phaser.Math.Between(0, 2000),
        delay: i * 40,
        ease: 'Cubic.easeIn',
        onComplete: () => confetti.destroy()
      })
    }
  }

  private displayUnlockedShips(newlyUnlockedShips: CharacterType[], baseY: number): number {
    // Returns the height of the unlock section so caller can position elements below it
    if (newlyUnlockedShips.length === 0) {
      return 0
    }

    const unlockHeaderText = this.add.text(
      this.cameras.main.centerX,
      baseY,
      '🔓 NEW SHIPS UNLOCKED!',
      {
        fontFamily: 'Courier New',
        fontSize: '22px',
        color: '#00ffaa',
        fontStyle: 'bold',
      }
    ).setOrigin(0.5).setDepth(201)

    // Pulse animation on the header
    this.tweens.add({
      targets: unlockHeaderText,
      scale: { from: 1, to: 1.1 },
      duration: 800,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut'
    })

    // Display each unlocked ship
    let shipYOffset = baseY + 50
    newlyUnlockedShips.forEach((shipType, index) => {
      const shipConfig = CHARACTER_CONFIGS[shipType]

      // Ship container background
      const shipBg = this.add.rectangle(
        this.cameras.main.centerX,
        shipYOffset,
        this.cameras.main.width - 100,
        50,
        0x1a3a3a,
        0.8
      ).setOrigin(0.5).setDepth(201)

      // Ship symbol
      const shipSymbol = this.add.text(
        this.cameras.main.centerX - 180,
        shipYOffset,
        shipConfig.symbol,
        {
          fontFamily: 'Courier New',
          fontSize: '28px',
          color: shipConfig.color,
        }
      ).setOrigin(0.5).setDepth(202)

      // Ship name and cost
      const shipName = this.add.text(
        this.cameras.main.centerX - 100,
        shipYOffset - 8,
        shipConfig.name,
        {
          fontFamily: 'Courier New',
          fontSize: '18px',
          color: '#ffffff',
          fontStyle: 'bold',
        }
      ).setOrigin(0, 0.5).setDepth(202)

      const shipCost = this.add.text(
        this.cameras.main.centerX - 100,
        shipYOffset + 8,
        `Cost: ${shipConfig.cost} ¤`,
        {
          fontFamily: 'Courier New',
          fontSize: '14px',
          color: '#ffdd00',
        }
      ).setOrigin(0, 0.5).setDepth(202)

      // Starting weapon
      const weaponText = this.add.text(
        this.cameras.main.centerX + 100,
        shipYOffset,
        shipConfig.startingWeapon,
        {
          fontFamily: 'Courier New',
          fontSize: '14px',
          color: '#ffaa00',
        }
      ).setOrigin(1, 0.5).setDepth(202)

      // Slide-in animation with delay for each ship
      const delay = index * 200
      shipBg.setAlpha(0).setX(this.cameras.main.centerX + 300)
      shipSymbol.setAlpha(0).setX(this.cameras.main.centerX - 180 + 300)
      shipName.setAlpha(0).setX(this.cameras.main.centerX - 100 + 300)
      shipCost.setAlpha(0).setX(this.cameras.main.centerX - 100 + 300)
      weaponText.setAlpha(0).setX(this.cameras.main.centerX + 100 + 300)

      this.tweens.add({
        targets: [shipBg, shipSymbol, shipName, shipCost, weaponText],
        alpha: 1,
        x: (target: any) => {
          if (target === shipBg) return this.cameras.main.centerX
          if (target === shipSymbol) return this.cameras.main.centerX - 180
          if (target === shipName || target === shipCost) return target.x - 300
          if (target === weaponText) return this.cameras.main.centerX + 100
          return target.x
        },
        duration: 500,
        delay: delay,
        ease: 'Back.easeOut'
      })

      shipYOffset += 60
    })

    return 40 + (newlyUnlockedShips.length * 60)
  }

  private createWeaponPassiveDisplay(baseY: number): Phaser.GameObjects.GameObject[] {
    // Create interactive weapon and passive displays with icons and pips
    const elements: Phaser.GameObjects.GameObject[] = []
    const centerX = this.cameras.main.centerX
    const iconSize = 36
    const pipSize = 6
    const itemSpacing = 50

    // Weapons Title
    const weaponsTitle = this.add.text(
      centerX,
      baseY,
      'WEAPONS',
      {
        fontFamily: 'Courier New',
        fontSize: '18px',
        color: '#00ffff',
        fontStyle: 'bold',
      }
    ).setOrigin(0.5).setDepth(201)
    elements.push(weaponsTitle)

    // Display each weapon
    const maxWeapons = 6
    const weaponsY = baseY + 30
    const totalWeaponsWidth = Math.min(this.weapons.length, maxWeapons) * itemSpacing
    const weaponsStartX = centerX - (totalWeaponsWidth / 2) + (itemSpacing / 2)

    this.weapons.slice(0, maxWeapons).forEach((weapon, index) => {
      const config = weapon.getConfig()
      const x = weaponsStartX + index * itemSpacing
      const y = weaponsY

      // Background
      const bg = this.add.rectangle(x, y, iconSize, iconSize, 0x1a3a3a, 0.8)
        .setOrigin(0.5).setDepth(201).setInteractive({ useHandCursor: true })
      elements.push(bg)

      // Icon
      const icon = this.add.text(x, y, config.icon, {
        fontFamily: 'Courier New',
        fontSize: '24px',
        color: config.color,
      }).setOrigin(0.5).setDepth(202)
      elements.push(icon)

      // Level pips
      const level = weapon.getLevel()
      const maxLevel = config.maxLevel
      const pipsY = y + iconSize / 2 + 10
      const pipsWidth = maxLevel * (pipSize + 2)
      const pipsStartX = x - (pipsWidth / 2) + (pipSize / 2)

      for (let i = 0; i < maxLevel; i++) {
        const pipX = pipsStartX + i * (pipSize + 2)
        const pip = this.add.circle(pipX, pipsY, pipSize / 2, i < level ? 0x00ffaa : 0x333333)
          .setDepth(202)
        elements.push(pip)
      }

      // Hover effects
      bg.on('pointerover', () => {
        bg.setFillStyle(0x2a4a5a, 1)
        icon.setScale(1.2)
      })

      bg.on('pointerout', () => {
        bg.setFillStyle(0x1a3a3a, 0.8)
        icon.setScale(1)
      })

      // Click to show detail
      bg.on('pointerdown', () => {
        this.showItemDetail(config, level, maxLevel, 'weapon')
      })
    })

    // Passives Title
    const passivesY = weaponsY + iconSize + 40
    const passivesTitle = this.add.text(
      centerX,
      passivesY,
      'PASSIVES',
      {
        fontFamily: 'Courier New',
        fontSize: '18px',
        color: '#ffaa00',
        fontStyle: 'bold',
      }
    ).setOrigin(0.5).setDepth(201)
    elements.push(passivesTitle)

    // Display each passive
    const maxPassives = 6
    const passivesDisplayY = passivesY + 30
    const totalPassivesWidth = Math.min(this.passives.length, maxPassives) * itemSpacing
    const passivesStartX = centerX - (totalPassivesWidth / 2) + (itemSpacing / 2)

    this.passives.slice(0, maxPassives).forEach((passive, index) => {
      const config = passive.getConfig()
      const x = passivesStartX + index * itemSpacing
      const y = passivesDisplayY

      // Background
      const bg = this.add.rectangle(x, y, iconSize, iconSize, 0x3a2a1a, 0.8)
        .setOrigin(0.5).setDepth(201).setInteractive({ useHandCursor: true })
      elements.push(bg)

      // Icon
      const icon = this.add.text(x, y, config.icon, {
        fontFamily: 'Courier New',
        fontSize: '24px',
        color: config.color,
      }).setOrigin(0.5).setDepth(202)
      elements.push(icon)

      // Level pips
      const level = passive.getLevel()
      const maxLevel = config.maxLevel
      const pipsY = y + iconSize / 2 + 10
      const pipsWidth = maxLevel * (pipSize + 2)
      const pipsStartX = x - (pipsWidth / 2) + (pipSize / 2)

      for (let i = 0; i < maxLevel; i++) {
        const pipX = pipsStartX + i * (pipSize + 2)
        const pip = this.add.circle(pipX, pipsY, pipSize / 2, i < level ? 0xffaa00 : 0x333333)
          .setDepth(202)
        elements.push(pip)
      }

      // Hover effects
      bg.on('pointerover', () => {
        bg.setFillStyle(0x4a3a2a, 1)
        icon.setScale(1.2)
      })

      bg.on('pointerout', () => {
        bg.setFillStyle(0x3a2a1a, 0.8)
        icon.setScale(1)
      })

      // Click to show detail
      bg.on('pointerdown', () => {
        this.showItemDetail(config, level, maxLevel, 'passive')
      })
    })

    return elements
  }

  private showItemDetail(config: any, level: number, maxLevel: number, type: 'weapon' | 'passive') {
    // Create detail panel overlay
    const overlay = this.add.rectangle(
      0, 0,
      this.cameras.main.width,
      this.cameras.main.height,
      0x000000,
      0.7
    ).setOrigin(0, 0).setDepth(300).setInteractive()

    const panelWidth = 400
    const panelHeight = 300
    const panelX = this.cameras.main.centerX
    const panelY = this.cameras.main.centerY

    const panel = this.add.rectangle(
      panelX, panelY,
      panelWidth, panelHeight,
      0x1a1a3a
    ).setDepth(301)

    const border = this.add.rectangle(
      panelX, panelY,
      panelWidth, panelHeight
    ).setStrokeStyle(2, type === 'weapon' ? 0x00ffff : 0xffaa00).setDepth(301)

    // Icon
    const icon = this.add.text(
      panelX,
      panelY - panelHeight / 2 + 60,
      config.icon,
      {
        fontFamily: 'Courier New',
        fontSize: '48px',
        color: config.color,
      }
    ).setOrigin(0.5).setDepth(302)

    // Name
    const name = this.add.text(
      panelX,
      panelY - panelHeight / 2 + 120,
      config.name,
      {
        fontFamily: 'Courier New',
        fontSize: '20px',
        color: '#ffffff',
        fontStyle: 'bold',
      }
    ).setOrigin(0.5).setDepth(302)

    // Level
    const levelText = this.add.text(
      panelX,
      panelY - panelHeight / 2 + 150,
      `Level: ${level}/${maxLevel}`,
      {
        fontFamily: 'Courier New',
        fontSize: '16px',
        color: '#aaaaaa',
      }
    ).setOrigin(0.5).setDepth(302)

    // Description with detailed stats
    let descriptionText = config.description

    // Add level-specific stats
    if (type === 'passive') {
      const currentStats = this.getPassiveStatsInfo(config.type, level)
      const maxStats = level < maxLevel ? this.getPassiveStatsInfo(config.type, maxLevel) : null

      if (currentStats) {
        descriptionText = `${config.description}\n\nCurrent (Lv.${level}):\n${currentStats}`
        if (maxStats) {
          descriptionText += `\n\nMax (Lv.${maxLevel}):\n${maxStats}`
        }
      }
    } else if (type === 'weapon') {
      const weaponStats = this.getWeaponStatsInfo(config.type, level, maxLevel)
      if (weaponStats) {
        descriptionText = `${config.description}\n\n${weaponStats}`
      }
    }

    const desc = this.add.text(
      panelX,
      panelY - panelHeight / 2 + 190,
      descriptionText,
      {
        fontFamily: 'Courier New',
        fontSize: '14px',
        color: '#cccccc',
        align: 'center',
        wordWrap: { width: panelWidth - 40 }
      }
    ).setOrigin(0.5, 0).setDepth(302)

    // Close button
    const closeButton = this.add.text(
      panelX,
      panelY + panelHeight / 2 - 40,
      'CLOSE',
      {
        fontFamily: 'Courier New',
        fontSize: '18px',
        color: '#00ff00',
      }
    ).setOrigin(0.5).setDepth(302).setInteractive({ useHandCursor: true })

    // Close on click
    const closePanel = () => {
      overlay.destroy()
      panel.destroy()
      border.destroy()
      icon.destroy()
      name.destroy()
      levelText.destroy()
      desc.destroy()
      closeButton.destroy()
    }

    overlay.on('pointerdown', closePanel)
    closeButton.on('pointerdown', closePanel)

    closeButton.on('pointerover', () => closeButton.setColor('#00ffff'))
    closeButton.on('pointerout', () => closeButton.setColor('#00ff00'))
  }

  private getPassiveStatsInfo(passiveType: PassiveType, level: number): string | null {
    switch (passiveType) {
      case PassiveType.BALLISTICS:
        return `+${20 * level}% Physical Damage`
      case PassiveType.WEAPON_SPEED_UP:
        return `+${10 * level}% Fire Rate`
      case PassiveType.SHIP_ARMOR:
        return `${5 * level} Damage Reduction`
      case PassiveType.ENERGY_CORE:
        return `+${15 * level}% Projectile Size\n+${10 * level}% Range`
      case PassiveType.PICKUP_RADIUS:
        return `+${50 * level} Pickup Radius`
      case PassiveType.EVASION_DRIVE:
        return `${5 * level}% Dodge Chance`
      case PassiveType.CRITICAL_SYSTEMS:
        return `+${10 * level}% Crit Chance\n+${25 * level}% Crit Damage`
      case PassiveType.THRUSTER_MOD:
        return `+${15 * level}% Projectile Speed\n+${10 * level}% Move Speed`
      case PassiveType.OVERDRIVE_REACTOR:
        return `+${level * 20}% Attack Speed\nfor ${2 + level}s after XP pickup`
      case PassiveType.SALVAGE_UNIT:
        return `${level * 10}% Chance for\nGolden Pinata Enemies`
      case PassiveType.DRONE_BAY_EXPANSION:
        return `+${20 * level}% Drone Damage\n+${15 * level}% Drone Attack Speed`
      case PassiveType.VAMPIRIC_FIRE:
        return `Heal ${1 + level}% of\nFire Damage Dealt`
      case PassiveType.FROST_HASTE:
        return `+${5 * level}% Attack Speed\nper Cold Damage Hit (stacks)`
      case PassiveType.STATIC_FORTUNE:
        return `${10 * level}% Chance for\nNature Damage to Drop Credits`
      case PassiveType.WINGMAN_PROTOCOL:
        return `Summon ${level} Wingmen\n(${10 + level * 5} damage each)`
      case PassiveType.TOXIC_ROUNDS:
        return `${15 * level}% Poison Chance\n(${5 + level * 2} DPS for 3s)`
      case PassiveType.PYROMANIAC:
        return `+${30 * level}% Damage to\nBurning Enemies`
      case PassiveType.SHATTER_STRIKE:
        return `+${25 * level}% Damage to\nFrozen Enemies`
      case PassiveType.HEMORRHAGE:
        return `Apply Bleed on Hit\n+${10 * level}% Damage Taken`
      default:
        return null
    }
  }

  private getWeaponStatsInfo(weaponType: WeaponType, level: number, maxLevel: number): string | null {
    const weapon = this.weapons.find(w => w.getConfig().type === weaponType)
    if (!weapon) return null

    const config = weapon.getConfig()
    let info = `Current (Lv.${level}):\n`

    // Add weapon-specific stats based on type
    switch (weaponType) {
      case WeaponType.CANNON:
        info += `${20 + (level - 1) * 5} Damage\n${1200 - (level - 1) * 100}ms Cooldown`
        if (level < maxLevel) {
          info += `\n\nMax (Lv.${maxLevel}):\n${20 + (maxLevel - 1) * 5} Damage\n${1200 - (maxLevel - 1) * 100}ms Cooldown`
        }
        break
      case WeaponType.LIGHTNING:
        info += `${12 + (level - 1) * 4} Damage\nChain ${2 + level} times\nInstant hit`
        if (level < maxLevel) {
          info += `\n\nMax (Lv.${maxLevel}):\n${12 + (maxLevel - 1) * 4} Damage\nChain ${2 + maxLevel} times`
        }
        break
      case WeaponType.GUN_BUDDY:
        info += `${10 + (level - 1) * 3} Damage\n${level} Buddy(ies)\nAuto-targeting`
        if (level < maxLevel) {
          info += `\n\nMax (Lv.${maxLevel}):\n${10 + (maxLevel - 1) * 3} Damage\n${maxLevel} Buddies`
        }
        break
      case WeaponType.BLOOD_LANCE:
        info += `${18 + (level - 1) * 6} Damage\nBounces ${5 + level * 2} times\nPierces ${5 + level * 2}`
        if (level < maxLevel) {
          info += `\n\nMax (Lv.${maxLevel}):\n${18 + (maxLevel - 1) * 6} Damage\nBounces ${5 + maxLevel * 2} times`
        }
        break
      default:
        return null
    }

    return info
  }

  private showUpgradeOptions() {
    // Create semi-transparent overlay (exact height to touch bottom UI area)
    const overlayHeight = this.cameras.main.height - 70 // Touch exactly at top of bottom UI (weapon/passive slots)
    const overlay = this.add.rectangle(
      0, 0,
      this.cameras.main.width,
      overlayHeight,
      0x000000,
      0.7
    ).setOrigin(0, 0).setDepth(100)

    // Title (moved up to accommodate 4 skills + buttons)
    const title = this.add.text(
      this.cameras.main.centerX,
      80,
      'LEVEL UP!',
      {
        fontFamily: 'Courier New',
        fontSize: '48px',
        color: '#ffff00',
      }
    ).setOrigin(0.5).setDepth(101)

    const subtitle = this.add.text(
      this.cameras.main.centerX,
      130,
      'Choose an upgrade:',
      {
        fontFamily: 'Courier New',
        fontSize: '24px',
        color: '#ffffff',
      }
    ).setOrigin(0.5).setDepth(101)

    // Generate upgrade options from weapons, passives, and utility upgrades
    const upgrades = this.generateUpgradeOptions()

    // If no upgrades available, give 50 credits instead
    if (upgrades.length === 0) {
      const creditAmount = 50
      this.gameState.addCredits(creditAmount)
      this.creditsCollectedThisRun += creditAmount
      this.creditsCollectedText.setText(`${this.creditsCollectedThisRun}¤`)

      // Show message
      const message = this.add.text(
        this.cameras.main.centerX,
        this.cameras.main.centerY,
        `No upgrades available!\nReceived ${creditAmount}¤ instead`,
        {
          fontFamily: 'Courier New',
          fontSize: '24px',
          color: '#ffff00',
          align: 'center',
          stroke: '#000000',
          strokeThickness: 4
        }
      ).setOrigin(0.5).setDepth(101)

      // Fade out and clean up after a short delay
      this.time.delayedCall(1500, () => {
        this.tweens.add({
          targets: [overlay, title, subtitle, message],
          alpha: 0,
          duration: 300,
          onComplete: () => {
            // Safety check: ensure scene still exists
            if (this.scene && this.scene.isActive()) {
              overlay.destroy()
              title.destroy()
              subtitle.destroy()
              message.destroy()
              this.resumeGame()
            }
          }
        })
      })

      return
    }

    // Determine number of upgrade options (3 base, +1 per upgradeOptions bonus)
    const bonuses = this.gameState.getTotalBonuses()
    const upgradeCount = 3 + (bonuses.upgradeOptions || 0)

    // Randomly select upgrades based on available options
    const shuffled = Phaser.Utils.Array.Shuffle([...upgrades])
    const selectedUpgrades = shuffled.slice(0, Math.min(upgradeCount, upgrades.length))

    // SUPERNOVA: Auto-select upgrades without showing UI
    if (this.playerStats.autoSelectUpgrades) {
      // Apply all selected upgrades automatically
      selectedUpgrades.forEach(upgrade => {
        upgrade.effect()
      })

      // Update slots display
      this.updateSlotsDisplay()

      // Clean up UI
      overlay.destroy()
      title.destroy()
      subtitle.destroy()

      // Resume game immediately
      this.resumeGame()
      return
    }

    // Create upgrade buttons (adjusted for 4 skills + reroll/skip buttons)
    const buttonHeight = 120  // Reduced from 140 to fit more content
    const buttonWidth = 460  // Reduced to fit 540px screen with proper margins
    const buttonSpacing = 10  // Reduced from 15 for tighter spacing
    const startY = 175  // Moved up from 280 to fit all 4 skills + buttons

    const buttons: Phaser.GameObjects.GameObject[] = [overlay, title, subtitle]

    selectedUpgrades.forEach((upgrade, index) => {
      const y = startY + (buttonHeight + buttonSpacing) * index

      // Button background (highlight if recommended) - start invisible and offset
      const bgColor = upgrade.recommended ? 0x1a2a1a : 0x0a0a1e
      const button = this.add.rectangle(
        this.cameras.main.centerX - 50, // Start offset to the left
        y,
        buttonWidth,
        buttonHeight,
        bgColor
      ).setDepth(101).setAlpha(0).disableInteractive() // Start invisible and non-interactive

      // Add recommendation star indicator (positioned within button bounds)
      let starIcon: Phaser.GameObjects.Text | null = null
      if (upgrade.recommended) {
        starIcon = this.add.text(
          this.cameras.main.centerX + 150, // Offset with button
          y - 20,
          '★',
          {
            fontFamily: 'Courier New',
            fontSize: '48px',
            color: '#ffff00',
          }
        ).setOrigin(0.5).setDepth(102).setAlpha(0)
      }

      // Icon (if available)
      let iconText: Phaser.GameObjects.Text | null = null
      if (upgrade.icon) {
        iconText = this.add.text(
          this.cameras.main.centerX - 245, // Offset with button
          y,
          upgrade.icon,
          {
            fontFamily: 'Courier New',
            fontSize: '56px',
            color: upgrade.color || '#ffffff',
          }
        ).setOrigin(0.5).setDepth(102).setAlpha(0)
      }

      // Synergy partner icon (if available) - shows what it synergizes with
      let synergyIcon: Phaser.GameObjects.Text | null = null
      let synergyPlus: Phaser.GameObjects.Text | null = null
      if (upgrade.synergyPartnerIcon && upgrade.enablesEvolution) {
        // Show "+" symbol
        synergyPlus = this.add.text(
          this.cameras.main.centerX - 245, // Offset with button
          y - 50,
          '+',
          {
            fontFamily: 'Courier New',
            fontSize: '24px',
            color: '#ffff00',
          }
        ).setOrigin(0.5).setDepth(102).setAlpha(0)

        // Show partner icon above
        synergyIcon = this.add.text(
          this.cameras.main.centerX - 245, // Offset with button
          y - 70,
          upgrade.synergyPartnerIcon,
          {
            fontFamily: 'Courier New',
            fontSize: '32px',
            color: upgrade.synergyPartnerColor || '#ffffff',
          }
        ).setOrigin(0.5).setDepth(102).setAlpha(0)
      }

      // EVO badge for items that enable evolutions (below the icon)
      let evoBadge: Phaser.GameObjects.Text | null = null
      if (upgrade.enablesEvolution) {
        evoBadge = this.add.text(
          this.cameras.main.centerX - 245, // Offset with button
          y + 45,
          'EVO',
          {
            fontFamily: 'Courier New',
            fontSize: '16px',
            color: '#000000',
            backgroundColor: '#ffff00',
            padding: { x: 4, y: 2 }
          }
        ).setOrigin(0.5).setDepth(102).setAlpha(0)
      }

      // Button text
      const nameText = this.add.text(
        this.cameras.main.centerX - 175, // Offset with button
        y - 40,
        upgrade.name,
        {
          fontFamily: 'Courier New',
          fontSize: '22px',
          color: '#00ff00',
          wordWrap: { width: 300, useAdvancedWrap: true }
        }
      ).setOrigin(0, 0).setDepth(102).setAlpha(0)

      const descText = this.add.text(
        this.cameras.main.centerX - 175, // Offset with button
        y + 0,
        upgrade.description,
        {
          fontFamily: 'Courier New',
          fontSize: '16px',
          color: '#aaaaaa',
          wordWrap: { width: 300, useAdvancedWrap: true }
        }
      ).setOrigin(0, 0).setDepth(102).setAlpha(0)

      // Collect all elements to animate together
      const elementsToAnimate: Phaser.GameObjects.GameObject[] = [button, nameText, descText]
      if (iconText) elementsToAnimate.push(iconText)
      if (starIcon) elementsToAnimate.push(starIcon)
      if (evoBadge) elementsToAnimate.push(evoBadge)
      if (synergyIcon) elementsToAnimate.push(synergyIcon)
      if (synergyPlus) elementsToAnimate.push(synergyPlus)

      // Staggered animation: each button slides in from left with delay
      const animDelay = 150 + (index * 100) // 150ms base delay + 100ms per button
      this.time.delayedCall(animDelay, () => {
        // Animate all elements sliding in and fading in
        this.tweens.add({
          targets: elementsToAnimate,
          alpha: 1,
          x: '+=50', // Slide 50px to the right to final position
          duration: 250,
          ease: 'Back.easeOut',
          onComplete: () => {
            // Safety check: ensure button and scene still exist
            if (!button.scene || button.scene !== this) {
              return
            }

            // Enable interaction after animation completes
            button.setInteractive({ useHandCursor: true })

            // Hover effects
            button.on('pointerover', () => {
              button.setFillStyle(upgrade.recommended ? 0x2a3a2a : 0x1a1a3e)
            })

            button.on('pointerout', () => {
              button.setFillStyle(upgrade.recommended ? 0x1a2a1a : 0x0a0a1e)
            })

            // Click handler
            button.on('pointerdown', () => {
              soundManager.play(SoundType.UPGRADE_SELECT)

              // Check if this upgrade adds a new Gun Buddy weapon or Wingman passive
              const weaponCountBefore = this.weapons.length
              const passiveCountBefore = this.passives.length

              upgrade.effect()

              // Update slots display after upgrade
              this.updateSlotsDisplay()

              // Only update allies if we added a NEW Gun Buddy weapon or Wingman Protocol passive
              const weaponCountAfter = this.weapons.length
              const passiveCountAfter = this.passives.length

              const addedNewWeapon = weaponCountAfter > weaponCountBefore
              const addedNewPassive = passiveCountAfter > passiveCountBefore

              if (addedNewWeapon || addedNewPassive) {
                // Check if it's a Gun Buddy or Wingman
                const lastWeapon = this.weapons[this.weapons.length - 1]
                const lastPassive = this.passives[this.passives.length - 1]

                const isGunBuddy = addedNewWeapon && lastWeapon && lastWeapon.getConfig().type === WeaponType.GUN_BUDDY
                const isWingman = addedNewPassive && lastPassive && lastPassive.getConfig().type === PassiveType.WINGMAN_PROTOCOL

                if (isGunBuddy || isWingman) {
                  this.updateAllies()
                }
              }

              // Remove all upgrade UI elements
              buttons.forEach(obj => obj.destroy())
              nameText.destroy()
              descText.destroy()
              if (iconText) iconText.destroy()
              if (evoBadge) evoBadge.destroy()
              if (synergyIcon) synergyIcon.destroy()
              if (synergyPlus) synergyPlus.destroy()
              button.destroy()

              // Resume game (will handle pending level ups automatically)
              this.resumeGame()
            })
          }
        })
      })

      buttons.push(button, nameText, descText)
      if (iconText) buttons.push(iconText)
      if (starIcon) buttons.push(starIcon)
      if (evoBadge) buttons.push(evoBadge)
      if (synergyIcon) buttons.push(synergyIcon)
      if (synergyPlus) buttons.push(synergyPlus)
    })

    // Add Reroll button (only if unlocked and have charges, OR Eclipse with unlimited rerolls)
    const hasUnlimitedRerolls = this.playerStats.unlimitedRerolls === true
    const rerollUnlocked = hasUnlimitedRerolls || (bonuses.rerollUnlocked && this.rerollsRemaining > 0)
    if (rerollUnlocked) {
      const rerollButtonY = startY + (buttonHeight + buttonSpacing) * selectedUpgrades.length + 20
      const rerollButton = this.add.rectangle(
        this.cameras.main.centerX - 120,
        rerollButtonY,
        180,
        50,
        0x1a1a3e
      ).setDepth(101).setInteractive({ useHandCursor: true })

      // Eclipse: Show "FREE" if unlimited rerolls, otherwise show count
      const rerollButtonText = hasUnlimitedRerolls ? '↻ Reroll (∞)' : `↻ Reroll (${this.rerollsRemaining})`
      const rerollText = this.add.text(
        this.cameras.main.centerX - 120,
        rerollButtonY,
        rerollButtonText,
        {
          fontFamily: 'Courier New',
          fontSize: '18px',
          color: hasUnlimitedRerolls ? '#ff00ff' : '#00ffff', // Purple for Eclipse unlimited
        }
      ).setOrigin(0.5).setDepth(102)

      rerollButton.on('pointerover', () => {
        rerollButton.setFillStyle(0x2a2a4e)
      })

      rerollButton.on('pointerout', () => {
        rerollButton.setFillStyle(0x1a1a3e)
      })

      rerollButton.on('pointerdown', () => {
        soundManager.play(SoundType.UPGRADE_SELECT)

        // Deduct reroll charge (only if not unlimited)
        if (!hasUnlimitedRerolls) {
          this.rerollsRemaining--
          this.updateRerollDisplay()
        }

        // Remove all upgrade UI elements
        buttons.forEach(obj => obj.destroy())
        rerollButton.destroy()
        rerollText.destroy()
        if (skipButton) skipButton.destroy()
        if (skipText) skipText.destroy()

        // Show level up screen again with new options
        this.showUpgradeOptions()
      })

      buttons.push(rerollButton, rerollText)
    }

    // Add Skip button (always visible)
    let skipButton: Phaser.GameObjects.Rectangle | null = null
    let skipText: Phaser.GameObjects.Text | null = null

    const skipButtonY = startY + (buttonHeight + buttonSpacing) * selectedUpgrades.length + 20
    const skipButtonX = rerollUnlocked ? this.cameras.main.centerX + 120 : this.cameras.main.centerX

    skipButton = this.add.rectangle(
      skipButtonX,
      skipButtonY,
      180,
      50,
      0x3a1a1a
    ).setDepth(101).setInteractive({ useHandCursor: true })

    skipText = this.add.text(
      skipButtonX,
      skipButtonY,
      'Skip',
      {
        fontFamily: 'Courier New',
        fontSize: '18px',
        color: '#ff8888',
      }
    ).setOrigin(0.5).setDepth(102)

    skipButton.on('pointerover', () => {
      skipButton!.setFillStyle(0x4a2a2a)
    })

    skipButton.on('pointerout', () => {
      skipButton!.setFillStyle(0x3a1a1a)
    })

    skipButton.on('pointerdown', () => {
      soundManager.play(SoundType.BUTTON_CLICK)

      // Remove all upgrade UI elements
      buttons.forEach(obj => obj.destroy())
      if (skipButton) skipButton.destroy()
      if (skipText) skipText.destroy()

      // Resume game without selecting anything
      this.resumeGame()
    })

    buttons.push(skipButton, skipText)

    // Store container reference for cleanup if needed
    this.upgradeContainer = this.add.container(0, 0)
  }

  private openTreasureChest() {
    // Reset click state
    this.chestPopupClickState = 0

    // Randomly determine reward tier with weighted probabilities (+ building bonuses)
    const bonuses = this.gameState.getTotalBonuses()
    const baseGoldChance = 0.10 // 10% base
    const goldChance = baseGoldChance + (bonuses.goldChestChance || 0)
    const goldThreshold = 100 - (goldChance * 100) // Invert so higher chance = lower threshold

    const rand = Math.random() * 100
    let upgradeCount: number
    let tierName: string
    let tierColor: string
    let chestSymbol: string

    if (rand >= goldThreshold) {
      // Gold chest - scales with building bonus
      upgradeCount = 5
      tierName = 'GOLD'
      tierColor = '#ffd700'
      chestSymbol = '◙'
    } else if (rand >= 60) {
      // 30% - Silver chest (default, no building bonus)
      upgradeCount = 3
      tierName = 'SILVER'
      tierColor = '#c0c0c0'
      chestSymbol = '▦'
    } else {
      // 60% - Bronze chest (default, no building bonus)
      upgradeCount = 1
      tierName = 'BRONZE'
      tierColor = '#cd7f32'
      chestSymbol = '▣'
    }

    // Apply chest value bonus (increases upgrade count)
    if (bonuses.chestValue && bonuses.chestValue > 0) {
      upgradeCount = Math.ceil(upgradeCount * (1 + bonuses.chestValue))
    }

    // Award gold based on chest tier (base values: Bronze=50, Silver=100, Gold=200)
    let goldReward = 0
    if (tierName === 'BRONZE') {
      goldReward = 50
    } else if (tierName === 'SILVER') {
      goldReward = 100
    } else if (tierName === 'GOLD') {
      goldReward = 200
    }

    // Apply chest value bonus to gold reward
    if (bonuses.chestValue && bonuses.chestValue > 0) {
      goldReward = Math.ceil(goldReward * (1 + bonuses.chestValue))
    }

    // Award the gold
    if (goldReward > 0) {
      this.gameState.addCredits(goldReward)
      this.creditsCollectedThisRun += goldReward
      this.creditsCollectedText.setText(`${this.creditsCollectedThisRun}¤`)
    }

    // Play chest sound based on rarity
    soundManager.playChestSound(upgradeCount)

    // Pause game immediately
    this.isPaused = true
    this.pauseStartTime = this.time.now
    this.physics.pause()
    this.starFieldTweens.forEach(tween => tween.pause())

    // Create dark overlay (make it interactive for click handling)
    const overlay = this.add.rectangle(
      0, 0,
      this.cameras.main.width,
      this.cameras.main.height,
      0x000000,
      0.85
    ).setOrigin(0, 0).setDepth(100).setInteractive()

    // Create chest icon (starts closed)
    const chestIcon = this.add.text(
      this.cameras.main.centerX,
      this.cameras.main.centerY,
      '▣', // Starts as closed chest
      {
        fontFamily: 'Courier New',
        fontSize: '120px',
        color: '#8b7355',
      }
    ).setOrigin(0.5).setDepth(101).setAlpha(0)

    // Store references to tweens/timers so they can be cancelled
    let fadeInTween: Phaser.Tweens.Tween | null = null
    let delayedCallTimer: Phaser.Time.TimerEvent | null = null

    // Click handler to skip animations
    const handleClick = () => {
      if (this.chestPopupClickState === 0) {
        // First click: skip to end state (show rewards immediately)
        // Cancel any ongoing animations
        if (fadeInTween) fadeInTween.stop()
        if (delayedCallTimer) delayedCallTimer.remove()
        this.tweens.killTweensOf(chestIcon)

        // Show final chest state
        chestIcon.setText(chestSymbol)
        chestIcon.setColor(tierColor)
        chestIcon.setAlpha(1)
        chestIcon.setScale(1.2)

        // Jump straight to showing rewards
        this.showChestReward(tierName, tierColor, upgradeCount, overlay, chestIcon)
      }
    }

    overlay.on('pointerdown', handleClick)

    // Fade in chest
    fadeInTween = this.tweens.add({
      targets: chestIcon,
      alpha: 1,
      scale: { from: 0.5, to: 1.2 },
      duration: 400,
      ease: 'Back.easeOut',
      onComplete: () => {
        // Safety check: ensure scene still exists
        if (!this.scene || !this.scene.isActive()) {
          return
        }
        // Wait a moment, then start opening animation
        delayedCallTimer = this.time.delayedCall(300, () => {
          this.playChestOpeningAnimation(chestIcon, chestSymbol, tierColor, tierName, upgradeCount, overlay)
        })
      }
    })
  }

  private playChestOpeningAnimation(
    chestIcon: Phaser.GameObjects.Text,
    finalSymbol: string,
    tierColor: string,
    tierName: string,
    upgradeCount: number,
    overlay: Phaser.GameObjects.Rectangle
  ) {
    // Shake animation (same for all tiers)
    this.tweens.add({
      targets: chestIcon,
      x: this.cameras.main.centerX + 10,
      duration: 50,
      yoyo: true,
      repeat: 5,
      onComplete: () => {
        // Safety check: ensure chest icon and scene still exist
        if (!chestIcon.scene || chestIcon.scene !== this) {
          return
        }
        // Change to open chest symbol and tier color
        chestIcon.setText(finalSymbol)
        chestIcon.setColor(tierColor)

        // Different animations based on tier
        if (upgradeCount === 1) {
          // Bronze - simple pop
          this.tweens.add({
            targets: chestIcon,
            scale: 1.4,
            duration: 200,
            ease: 'Back.easeOut',
            onComplete: () => {
              this.showChestReward(tierName, tierColor, upgradeCount, overlay, chestIcon)
            }
          })
        } else if (upgradeCount === 3) {
          // Silver - double bounce
          this.tweens.add({
            targets: chestIcon,
            scale: 1.6,
            y: this.cameras.main.centerY - 30,
            duration: 150,
            ease: 'Quad.easeOut',
            yoyo: true,
            repeat: 1,
            onComplete: () => {
              // Sparkle effect
              for (let i = 0; i < 8; i++) {
                const angle = (Math.PI * 2 / 8) * i
                const sparkle = this.add.text(
                  this.cameras.main.centerX,
                  this.cameras.main.centerY,
                  '✦',
                  {
                    fontFamily: 'Courier New',
                    fontSize: '24px',
                    color: tierColor,
                  }
                ).setOrigin(0.5).setDepth(102)

                this.tweens.add({
                  targets: sparkle,
                  x: this.cameras.main.centerX + Math.cos(angle) * 80,
                  y: this.cameras.main.centerY + Math.sin(angle) * 80,
                  alpha: 0,
                  duration: 600,
                  ease: 'Quad.easeOut',
                  onComplete: () => sparkle.destroy()
                })
              }

              this.time.delayedCall(400, () => {
                this.showChestReward(tierName, tierColor, upgradeCount, overlay, chestIcon)
              })
            }
          })
        } else {
          // Gold - explosive burst
          this.tweens.add({
            targets: chestIcon,
            scale: 2.0,
            y: this.cameras.main.centerY - 50,
            duration: 200,
            ease: 'Quad.easeOut',
            onComplete: () => {
              // Screen flash
              this.cameras.main.flash(200, 255, 215, 0, false, undefined, 0.5)

              // Multiple sparkle rings
              for (let ring = 0; ring < 3; ring++) {
                this.time.delayedCall(ring * 100, () => {
                  for (let i = 0; i < 12; i++) {
                    const angle = (Math.PI * 2 / 12) * i
                    const sparkle = this.add.text(
                      this.cameras.main.centerX,
                      this.cameras.main.centerY - 50,
                      ring === 0 ? '★' : '✦',
                      {
                        fontFamily: 'Courier New',
                        fontSize: ring === 0 ? '32px' : '24px',
                        color: tierColor,
                      }
                    ).setOrigin(0.5).setDepth(102)

                    this.tweens.add({
                      targets: sparkle,
                      x: this.cameras.main.centerX + Math.cos(angle) * (100 + ring * 30),
                      y: this.cameras.main.centerY - 50 + Math.sin(angle) * (100 + ring * 30),
                      alpha: 0,
                      rotation: Math.PI * 2,
                      duration: 800,
                      ease: 'Quad.easeOut',
                      onComplete: () => sparkle.destroy()
                    })
                  }
                })
              }

              this.time.delayedCall(600, () => {
                this.showChestReward(tierName, tierColor, upgradeCount, overlay, chestIcon)
              })
            }
          })
        }
      }
    })
  }

  private showChestReward(
    tierName: string,
    tierColor: string,
    upgradeCount: number,
    overlay: Phaser.GameObjects.Rectangle,
    chestIcon: Phaser.GameObjects.Text
  ) {
    // Update click state - now showing rewards
    this.chestPopupClickState = 1

    // Fade out chest icon
    this.tweens.add({
      targets: chestIcon,
      alpha: 0,
      scale: 0.5,
      duration: 300,
      onComplete: () => chestIcon.destroy()
    })

    // Generate upgrade options - only level-ups for existing items
    const allUpgrades = this.generateUpgradeOptions()

    // Filter to only level-ups (exclude new weapons/passives/evolutions)
    let availableLevelUps = allUpgrades.filter(upgrade =>
      upgrade.name.includes('Level Up')
    )

    // Select upgrades, allowing duplicates if item can continue leveling
    let selectedUpgrades: Array<{
      upgrade: typeof allUpgrades[0]
      beforeLevel: number
      afterLevel: number
    }> = []
    let creditsEarned = 0

    for (let i = 0; i < upgradeCount; i++) {
      if (availableLevelUps.length === 0) {
        // No more level-ups available, give 50 credits instead
        creditsEarned += 50
        continue
      }

      // Pick a random upgrade from available pool
      const randomIndex = Math.floor(Math.random() * availableLevelUps.length)
      const selectedUpgrade = availableLevelUps[randomIndex]

      // Capture before/after levels for display BEFORE applying
      let beforeLevel = 0
      let afterLevel = 0
      if (selectedUpgrade.name.includes('Level Up')) {
        const levelMatch = selectedUpgrade.name.match(/Lv\.(\d+)/)
        if (levelMatch) {
          beforeLevel = parseInt(levelMatch[1]) - 1 // Current level is one less
          afterLevel = parseInt(levelMatch[1])
        }
      }

      selectedUpgrades.push({
        upgrade: selectedUpgrade,
        beforeLevel,
        afterLevel
      })

      // Apply the upgrade immediately
      selectedUpgrade.effect()

      // Regenerate upgrades to see if items can still level up
      const newUpgrades = this.generateUpgradeOptions()
      availableLevelUps = newUpgrades.filter(upgrade =>
        upgrade.name.includes('Level Up')
      )
    }

    // Award credits if any slots couldn't be filled
    if (creditsEarned > 0) {
      this.gameState.addCredits(creditsEarned)
    }

    // upgradeInfos now contains the applied upgrades with their level info
    const upgradeInfos = selectedUpgrades

    // Update slots display
    this.updateSlotsDisplay()

    // Create glowing background based on chest tier
    const glowRadius = 300
    const glowGraphics = this.add.graphics().setDepth(100)

    // Determine glow color based on tier
    let glowColor: number
    if (tierName === 'GOLD') {
      glowColor = 0xffd700
    } else if (tierName === 'SILVER') {
      glowColor = 0xc0c0c0
    } else {
      glowColor = 0xcd7f32
    }

    // Draw radial gradient glow
    for (let i = glowRadius; i > 0; i -= 20) {
      const alpha = (1 - (i / glowRadius)) * 0.15
      glowGraphics.fillStyle(glowColor, alpha)
      glowGraphics.fillCircle(this.cameras.main.centerX, this.cameras.main.centerY, i)
    }

    // Pulsing animation for the glow
    this.tweens.add({
      targets: glowGraphics,
      alpha: { from: 0.8, to: 1 },
      scale: { from: 0.9, to: 1.1 },
      duration: 1000,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut'
    })

    // Tier title
    const tierText = this.add.text(
      this.cameras.main.centerX,
      80,
      `${tierName} CHEST!`,
      {
        fontFamily: 'Courier New',
        fontSize: '56px',
        color: tierColor,
        stroke: '#000000',
        strokeThickness: 4
      }
    ).setOrigin(0.5).setDepth(103).setAlpha(0)

    // Fade in tier text
    this.tweens.add({
      targets: tierText,
      alpha: 1,
      scale: { from: 0.5, to: 1 },
      duration: 300,
      ease: 'Back.easeOut'
    })

    // Array to hold all animated elements for cleanup
    const rewardElements: Phaser.GameObjects.GameObject[] = [glowGraphics, tierText]
    // Array to hold all delayed timers for cleanup
    const delayedTimers: Phaser.Time.TimerEvent[] = []

    // Display credits earned if any
    if (creditsEarned > 0) {
      const creditsText = this.add.text(
        this.cameras.main.centerX,
        150,
        `+${creditsEarned} Credits\n(No upgrades available)`,
        {
          fontFamily: 'Courier New',
          fontSize: '32px',
          color: '#ffd700',
          stroke: '#000000',
          strokeThickness: 3,
          align: 'center'
        }
      ).setOrigin(0.5).setDepth(103).setAlpha(0)

      rewardElements.push(creditsText)

      this.tweens.add({
        targets: creditsText,
        alpha: 1,
        y: 140,
        duration: 500,
        ease: 'Back.easeOut'
      })
    }

    // Animate each upgrade in a spiral pattern
    const centerX = this.cameras.main.centerX
    const centerY = this.cameras.main.centerY
    const spiralRadius = 120 // Distance from center
    const angleStep = (Math.PI * 2) / Math.max(upgradeInfos.length, 3) // Distribute evenly in a circle

    upgradeInfos.forEach((info, index) => {
      const delay = 300 + (index * 150) // Staggered appearance

      // Calculate spiral position
      const angle = angleStep * index
      const targetX = centerX + Math.cos(angle) * spiralRadius
      const targetY = centerY + Math.sin(angle) * spiralRadius

      const timer = this.time.delayedCall(delay, () => {
        const upgrade = info.upgrade
        // Create upgrade icon background
        const iconBg = this.add.rectangle(
          centerX,
          centerY,
          80,
          80,
          upgrade.recommended ? 0xffff00 : 0x00ff00,
          0.3
        ).setDepth(102).setAlpha(0)

        // Create upgrade icon
        const icon = this.add.text(
          centerX,
          centerY,
          upgrade.icon || '⬆',
          {
            fontFamily: 'Courier New',
            fontSize: '48px',
            color: upgrade.color || '#00ff00',
            stroke: '#000000',
            strokeThickness: 3
          }
        ).setOrigin(0.5).setDepth(103).setAlpha(0)

        // Create level pip indicator if it's a level up
        let pipContainer: Phaser.GameObjects.Container | null = null
        if (upgrade.name.includes('Level Up')) {
          // Extract level from name (e.g., "Blaster Level Up (Lv.4)")
          const levelMatch = upgrade.name.match(/Lv\.(\d+)/)
          if (levelMatch) {
            const level = parseInt(levelMatch[1])
            const pips: Phaser.GameObjects.GameObject[] = []

            // Create 8 pip slots (max level is usually 8)
            for (let i = 0; i < 8; i++) {
              const pipX = -35 + (i * 10)
              const pipY = 45
              const isFilled = i < level

              const pip = this.add.circle(
                pipX,
                pipY,
                3,
                isFilled ? 0x00ff00 : 0x333333
              ).setDepth(103).setAlpha(0)

              pips.push(pip)
            }

            pipContainer = this.add.container(centerX, centerY, pips).setDepth(103)
          }
        }

        // Create upgrade name text with level progression
        let displayName = upgrade.name.replace(' Level Up', '').split('(')[0].trim()
        if (info.beforeLevel > 0 && info.afterLevel > 0) {
          displayName += `\nLv.${info.beforeLevel} → Lv.${info.afterLevel}`
        }

        const nameText = this.add.text(
          centerX,
          centerY + 50,
          displayName,
          {
            fontFamily: 'Courier New',
            fontSize: '14px',
            color: '#ffffff',
            align: 'center',
            stroke: '#000000',
            strokeThickness: 2,
            wordWrap: { width: 120 }
          }
        ).setOrigin(0.5).setDepth(103).setAlpha(0)

        // Burst particle effect from center
        const particles: Phaser.GameObjects.Text[] = []
        for (let i = 0; i < 12; i++) {
          const particleAngle = (Math.PI * 2 / 12) * i
          const particle = this.add.text(
            centerX,
            centerY,
            '✦',
            {
              fontFamily: 'Courier New',
              fontSize: '16px',
              color: upgrade.color || '#00ff00',
            }
          ).setOrigin(0.5).setDepth(102)

          particles.push(particle)
          rewardElements.push(particle)

          this.tweens.add({
            targets: particle,
            x: centerX + Math.cos(particleAngle) * 60,
            y: centerY + Math.sin(particleAngle) * 60,
            alpha: 0,
            scale: { from: 1, to: 0.5 },
            duration: 400,
            ease: 'Quad.easeOut',
            onComplete: () => {
              particle.destroy()
              // Remove from rewardElements array
              const idx = rewardElements.indexOf(particle)
              if (idx > -1) rewardElements.splice(idx, 1)
            }
          })
        }

        // Animate elements spiraling out to final position
        const elementsToAnimate: any[] = [iconBg, icon, nameText]
        if (pipContainer) {
          elementsToAnimate.push(pipContainer)
          // Also animate pips individually
          pipContainer.list.forEach(pip => elementsToAnimate.push(pip))
        }

        this.tweens.add({
          targets: elementsToAnimate,
          x: `+=${targetX - centerX}`,
          y: `+=${targetY - centerY}`,
          alpha: 1,
          scale: { from: 0.3, to: 1 },
          rotation: Math.PI * 2,
          duration: 500,
          ease: 'Back.easeOut'
        })

        rewardElements.push(iconBg, icon, nameText)
        if (pipContainer) rewardElements.push(pipContainer)
      })

      // Store timer for cleanup
      delayedTimers.push(timer)
    })

    // Store auto-close timer so it can be cancelled
    let autoCloseTimer: Phaser.Time.TimerEvent | null = null

    // Add click handler for second click (close immediately)
    const closeHandler = () => {
      if (this.chestPopupClickState >= 1) {
        // Cancel auto-close timer
        if (autoCloseTimer) autoCloseTimer.remove()

        // Cancel all pending delayed timers
        delayedTimers.forEach(timer => timer.remove())

        // Kill any ongoing tweens
        this.tweens.killTweensOf(rewardElements)

        // Close immediately - safely destroy all elements
        rewardElements.forEach(el => {
          if (el && el.active) {
            el.destroy()
          }
        })
        if (overlay && overlay.active) {
          overlay.destroy()
        }

        // Resume game (will handle pending level ups automatically)
        this.resumeGame()
      }
    }

    // Remove old handler and add new one
    overlay.removeAllListeners('pointerdown')
    overlay.on('pointerdown', closeHandler)

    // Wait for all animations to complete, then auto-close
    const totalAnimDuration = 300 + (upgradeInfos.length * 150) + 500
    autoCloseTimer = this.time.delayedCall(totalAnimDuration + 1500, () => {
      this.tweens.add({
        targets: rewardElements,
        alpha: 0,
        duration: 300,
        onComplete: () => {
          rewardElements.forEach(el => el.destroy())
          overlay.destroy()

          // Resume game (will handle pending level ups automatically)
          this.resumeGame()
        }
      })
    })
  }

  private showStatsPopup() {
    // Pause game
    this.isPaused = true
    this.pauseStartTime = this.time.now
    this.physics.pause()
    this.starFieldTweens.forEach(tween => tween.pause())

    // Create overlay
    const overlay = this.add.rectangle(
      0, 0,
      this.cameras.main.width,
      this.cameras.main.height,
      0x000000,
      0.8
    ).setOrigin(0, 0).setDepth(200).setInteractive()

    const uiElements: Phaser.GameObjects.GameObject[] = [overlay]

    // Title
    const title = this.add.text(
      this.cameras.main.centerX,
      50,
      'DETAILED STATS',
      {
        fontFamily: 'Courier New',
        fontSize: '36px',
        color: '#ffff00',
      }
    ).setOrigin(0.5).setDepth(201)
    uiElements.push(title)

    let yOffset = 100

    // === ACTIVE BUFFS SECTION ===
    const buffsTitle = this.add.text(
      this.cameras.main.centerX,
      yOffset,
      '═══ ACTIVE BUFFS ═══',
      {
        fontFamily: 'Courier New',
        fontSize: '20px',
        color: '#ff88ff',
      }
    ).setOrigin(0.5).setDepth(201)
    uiElements.push(buffsTitle)
    yOffset += 30

    if (this.buffDisplays.size === 0) {
      const noBuffs = this.add.text(
        this.cameras.main.centerX,
        yOffset,
        'No active buffs',
        {
          fontFamily: 'Courier New',
          fontSize: '14px',
          color: '#888888',
        }
      ).setOrigin(0.5).setDepth(201)
      uiElements.push(noBuffs)
      yOffset += 25
    } else {
      this.buffDisplays.forEach((buff, key) => {
        const timeRemaining = Math.max(0, Math.ceil((buff.duration - (this.time.now - buff.startTime)) / 1000))
        const buffName = key === 'shield' ? 'Shield' :
                        key === 'rapidFire' ? 'Damage Boost' :
                        key === 'magnet' ? 'Magnet' : key

        const buffText = this.add.text(
          this.cameras.main.centerX,
          yOffset,
          `${buff.icon.text} ${buffName}: ${timeRemaining}s remaining`,
          {
            fontFamily: 'Courier New',
            fontSize: '16px',
            color: '#ff88ff',
          }
        ).setOrigin(0.5).setDepth(201)
        uiElements.push(buffText)
        yOffset += 22
      })
    }

    yOffset += 15

    // === WEAPONS SECTION ===
    const weaponsTitle = this.add.text(
      this.cameras.main.centerX,
      yOffset,
      '═══ WEAPONS ═══',
      {
        fontFamily: 'Courier New',
        fontSize: '20px',
        color: '#ffaa00',
      }
    ).setOrigin(0.5).setDepth(201)
    uiElements.push(weaponsTitle)
    yOffset += 30

    if (this.weapons.length === 0) {
      const noWeapons = this.add.text(
        this.cameras.main.centerX,
        yOffset,
        'No weapons equipped',
        {
          fontFamily: 'Courier New',
          fontSize: '14px',
          color: '#888888',
        }
      ).setOrigin(0.5).setDepth(201)
      uiElements.push(noWeapons)
      yOffset += 25
    } else {
      this.weapons.forEach(weapon => {
        const config = weapon.getConfig()
        const damage = weapon.getDamage() * this.weaponModifiers.damageMultiplier
        const fireRate = weapon.getFireRate(this.weaponModifiers)
        const theoreticalDps = Math.round((damage / (fireRate / 1000)) * 10) / 10
        const actualDps = Math.round(this.getWeaponDPS(config.name) * 10) / 10

        const weaponIcon = this.add.text(
          80,
          yOffset,
          config.icon,
          {
            fontFamily: 'Courier New',
            fontSize: '24px',
            color: config.color,
          }
        ).setOrigin(0.5).setDepth(201)
        uiElements.push(weaponIcon)

        const weaponText = this.add.text(
          110,
          yOffset - 8,
          `${config.name} Lv.${weapon.getLevel()}`,
          {
            fontFamily: 'Courier New',
            fontSize: '16px',
            color: '#00ff00',
          }
        ).setOrigin(0, 0).setDepth(201)
        uiElements.push(weaponText)

        const statsText = this.add.text(
          110,
          yOffset + 8,
          `DMG: ${Math.round(damage)} | Fire Rate: ${Math.round(fireRate)}ms`,
          {
            fontFamily: 'Courier New',
            fontSize: '12px',
            color: '#aaaaaa',
          }
        ).setOrigin(0, 0).setDepth(201)
        uiElements.push(statsText)

        const dpsText = this.add.text(
          110,
          yOffset + 22,
          `Theoretical DPS: ${theoreticalDps} | Actual DPS: ${actualDps === 0 ? 'N/A' : actualDps}`,
          {
            fontFamily: 'Courier New',
            fontSize: '12px',
            color: actualDps > 0 ? '#00ff00' : '#888888',
          }
        ).setOrigin(0, 0).setDepth(201)
        uiElements.push(dpsText)

        yOffset += 50
      })
    }

    yOffset += 15

    // === PASSIVES SECTION ===
    const passivesTitle = this.add.text(
      this.cameras.main.centerX,
      yOffset,
      '═══ PASSIVES ═══',
      {
        fontFamily: 'Courier New',
        fontSize: '20px',
        color: '#00ffaa',
      }
    ).setOrigin(0.5).setDepth(201)
    uiElements.push(passivesTitle)
    yOffset += 30

    if (this.passives.length === 0) {
      const noPassives = this.add.text(
        this.cameras.main.centerX,
        yOffset,
        'No passives equipped',
        {
          fontFamily: 'Courier New',
          fontSize: '14px',
          color: '#888888',
        }
      ).setOrigin(0.5).setDepth(201)
      uiElements.push(noPassives)
      yOffset += 25
    } else {
      this.passives.forEach(passive => {
        const config = passive.getConfig()
        const benefit = this.getPassiveBenefit(config.type)

        const passiveIcon = this.add.text(
          80,
          yOffset,
          config.icon,
          {
            fontFamily: 'Courier New',
            fontSize: '24px',
            color: config.color,
          }
        ).setOrigin(0.5).setDepth(201)
        uiElements.push(passiveIcon)

        const passiveText = this.add.text(
          110,
          yOffset - 8,
          `${config.name} Lv.${passive.getLevel()}`,
          {
            fontFamily: 'Courier New',
            fontSize: '16px',
            color: '#00ffaa',
          }
        ).setOrigin(0, 0).setDepth(201)
        uiElements.push(passiveText)

        const benefitText = this.add.text(
          110,
          yOffset + 8,
          benefit,
          {
            fontFamily: 'Courier New',
            fontSize: '12px',
            color: '#aaaaaa',
          }
        ).setOrigin(0, 0).setDepth(201)
        uiElements.push(benefitText)

        // Check if this passive has associated damage (e.g., allies)
        let allyDpsName: string | null = null
        if (config.type === PassiveType.WINGMAN_PROTOCOL) {
          allyDpsName = `Ally - ${ALLY_CONFIGS[AllyType.WINGMAN].name}`
        }

        if (allyDpsName) {
          const allyDps = Math.round(this.getWeaponDPS(allyDpsName) * 10) / 10
          const allyDpsText = this.add.text(
            110,
            yOffset + 22,
            `Ally DPS: ${allyDps === 0 ? 'N/A' : allyDps}`,
            {
              fontFamily: 'Courier New',
              fontSize: '12px',
              color: allyDps > 0 ? '#00ff00' : '#888888',
            }
          ).setOrigin(0, 0).setDepth(201)
          uiElements.push(allyDpsText)
          yOffset += 50
        } else {
          yOffset += 40
        }
      })
    }

    // Close button
    const closeButton = this.add.rectangle(
      this.cameras.main.centerX,
      this.cameras.main.height - 60,
      200,
      50,
      0x2a2a4a
    ).setDepth(201).setInteractive({ useHandCursor: true })

    const closeText = this.add.text(
      this.cameras.main.centerX,
      this.cameras.main.height - 60,
      'CLOSE',
      {
        fontFamily: 'Courier New',
        fontSize: '24px',
        color: '#ffffff',
      }
    ).setOrigin(0.5).setDepth(202)

    closeButton.on('pointerover', () => {
      closeButton.setFillStyle(0x3a3a6a)
    })

    closeButton.on('pointerout', () => {
      closeButton.setFillStyle(0x2a2a4a)
    })

    closeButton.on('pointerdown', () => {
      // Clean up all UI elements
      uiElements.forEach(obj => obj.destroy())
      closeButton.destroy()
      closeText.destroy()

      // Resume game
      this.resumeGame()
    })

    uiElements.push(closeButton, closeText)
  }

  private showTreasureChest(upgradeCount: number) {
    // Game is already paused from openTreasureChest()
    // Create semi-transparent overlay (exact height to touch bottom UI area)
    const overlayHeight = this.cameras.main.height - 70 // Touch exactly at top of bottom UI (weapon/passive slots)
    const overlay = this.add.rectangle(
      0, 0,
      this.cameras.main.width,
      overlayHeight,
      0x000000,
      0.7
    ).setOrigin(0, 0).setDepth(100)

    // Title
    const title = this.add.text(
      this.cameras.main.centerX,
      150,
      'Select Your Rewards',
      {
        fontFamily: 'Courier New',
        fontSize: '42px',
        color: '#ffaa00',
      }
    ).setOrigin(0.5).setDepth(101)

    const subtitle = this.add.text(
      this.cameras.main.centerX,
      200,
      `Choose ${upgradeCount} upgrade${upgradeCount > 1 ? 's' : ''}:`,
      {
        fontFamily: 'Courier New',
        fontSize: '24px',
        color: '#ffffff',
      }
    ).setOrigin(0.5).setDepth(101)

    // Generate upgrade options
    const allUpgrades = this.generateUpgradeOptions()

    // Check for evolution - if present, automatically include it
    const evolutionUpgrade = allUpgrades.find(u => u.name.includes('‡'))
    const otherUpgrades = allUpgrades.filter(u => !u.name.includes('‡'))

    let selectedUpgrades: typeof allUpgrades = []

    if (evolutionUpgrade && upgradeCount >= 1) {
      // Evolution gets first slot
      selectedUpgrades.push(evolutionUpgrade)
      // Fill remaining slots with random upgrades
      const shuffled = Phaser.Utils.Array.Shuffle([...otherUpgrades])
      selectedUpgrades = selectedUpgrades.concat(shuffled.slice(0, upgradeCount - 1))
    } else {
      // No evolution, just random selection
      const shuffled = Phaser.Utils.Array.Shuffle([...allUpgrades])
      selectedUpgrades = shuffled.slice(0, Math.min(upgradeCount, allUpgrades.length))
    }

    // Track selections
    const selections: number[] = []
    const uiElements: Phaser.GameObjects.GameObject[] = [overlay, title, subtitle]

    // Create upgrade buttons (adjust sizes for large chests)
    const buttonHeight = upgradeCount >= 5 ? 100 : 120
    const buttonWidth = 460
    const buttonSpacing = upgradeCount >= 5 ? 8 : 10
    const startY = upgradeCount >= 5 ? 240 : 260

    selectedUpgrades.forEach((upgrade, index) => {
      const y = startY + (buttonHeight + buttonSpacing) * index

      // Button background (highlight if recommended or selected)
      const bgColor = upgrade.recommended ? 0x3a4a2a : 0x2a2a4a
      const button = this.add.rectangle(
        this.cameras.main.centerX,
        y,
        buttonWidth,
        buttonHeight,
        bgColor
      ).setDepth(101).setInteractive({ useHandCursor: true })

      // Selection indicator (initially hidden)
      const checkmark = this.add.text(
        this.cameras.main.centerX - 220,
        y - 40,
        '✓',
        {
          fontFamily: 'Courier New',
          fontSize: '40px',
          color: '#00ff00',
        }
      ).setOrigin(0.5).setDepth(103).setVisible(false)

      // Add recommendation star indicator (bigger and positioned to avoid clipping)
      let starIcon: Phaser.GameObjects.Text | null = null
      if (upgrade.recommended) {
        starIcon = this.add.text(
          this.cameras.main.centerX + 210,
          y - 15,
          '★',
          {
            fontFamily: 'Courier New',
            fontSize: '40px',
            color: '#ffff00',
          }
        ).setOrigin(0.5).setDepth(102)
        uiElements.push(starIcon)
      }

      // EVO badge (below the icon, not the star)
      let evoBadge: Phaser.GameObjects.Text | null = null
      if (upgrade.enablesEvolution) {
        evoBadge = this.add.text(
          this.cameras.main.centerX - 190,
          y + 40,
          'EVO',
          {
            fontFamily: 'Courier New',
            fontSize: '14px',
            color: '#000000',
            backgroundColor: '#ffff00',
            padding: { x: 4, y: 2 }
          }
        ).setOrigin(0.5).setDepth(102)
        uiElements.push(evoBadge)
      }

      // Icon (if available)
      let iconText: Phaser.GameObjects.Text | null = null
      if (upgrade.icon) {
        iconText = this.add.text(
          this.cameras.main.centerX - 190,
          y,
          upgrade.icon,
          {
            fontFamily: 'Courier New',
            fontSize: '48px',
            color: upgrade.color || '#ffffff',
          }
        ).setOrigin(0.5).setDepth(102)
      }

      // Synergy partner icon (if available) - shows what it synergizes with
      let synergyIcon: Phaser.GameObjects.Text | null = null
      let synergyPlus: Phaser.GameObjects.Text | null = null
      if (upgrade.synergyPartnerIcon && upgrade.enablesEvolution) {
        // Show "+" symbol
        synergyPlus = this.add.text(
          this.cameras.main.centerX - 190,
          y - 40,
          '+',
          {
            fontFamily: 'Courier New',
            fontSize: '20px',
            color: '#ffff00',
          }
        ).setOrigin(0.5).setDepth(102)
        uiElements.push(synergyPlus)

        // Show partner icon above
        synergyIcon = this.add.text(
          this.cameras.main.centerX - 190,
          y - 55,
          upgrade.synergyPartnerIcon,
          {
            fontFamily: 'Courier New',
            fontSize: '28px',
            color: upgrade.synergyPartnerColor || '#ffffff',
          }
        ).setOrigin(0.5).setDepth(102)
        uiElements.push(synergyIcon)
      }

      // Button text
      const nameText = this.add.text(
        this.cameras.main.centerX - 120,
        y - 35,
        upgrade.name,
        {
          fontFamily: 'Courier New',
          fontSize: '20px',
          color: '#00ff00',
          wordWrap: { width: 300, useAdvancedWrap: true }
        }
      ).setOrigin(0, 0).setDepth(102)

      const descText = this.add.text(
        this.cameras.main.centerX - 120,
        y + 5,
        upgrade.description,
        {
          fontFamily: 'Courier New',
          fontSize: '14px',
          color: '#aaaaaa',
          wordWrap: { width: 300, useAdvancedWrap: true }
        }
      ).setOrigin(0, 0).setDepth(102)

      // Click handler
      button.on('pointerdown', () => {
        const selectionIndex = selections.indexOf(index)

        if (selectionIndex >= 0) {
          // Deselect
          selections.splice(selectionIndex, 1)
          checkmark.setVisible(false)
          button.setFillStyle(upgrade.recommended ? 0x3a4a2a : 0x2a2a4a)
        } else if (selections.length < upgradeCount) {
          // Select
          selections.push(index)
          checkmark.setVisible(true)
          button.setFillStyle(0x2a4a6a)
        }

        // If all selections made, enable confirm button
        if (selections.length === upgradeCount) {
          confirmButton.setFillStyle(0x2a6a2a)
        } else {
          confirmButton.setFillStyle(0x444444)
        }
      })

      // Hover effects
      button.on('pointerover', () => {
        if (!selections.includes(index)) {
          button.setFillStyle(upgrade.recommended ? 0x4a5a3a : 0x3a3a6a)
        }
      })

      button.on('pointerout', () => {
        if (!selections.includes(index)) {
          button.setFillStyle(upgrade.recommended ? 0x3a4a2a : 0x2a2a4a)
        }
      })

      uiElements.push(button, nameText, descText, checkmark)
      if (iconText) uiElements.push(iconText)
    })

    // Confirm button
    const confirmButtonY = startY + (buttonHeight + buttonSpacing) * selectedUpgrades.length + 20
    const confirmButton = this.add.rectangle(
      this.cameras.main.centerX,
      confirmButtonY,
      200,
      50,
      0x444444
    ).setDepth(101).setInteractive({ useHandCursor: true })

    const confirmText = this.add.text(
      this.cameras.main.centerX,
      confirmButtonY,
      'CONFIRM',
      {
        fontFamily: 'Courier New',
        fontSize: '24px',
        color: '#ffffff',
      }
    ).setOrigin(0.5).setDepth(102)

    confirmButton.on('pointerdown', () => {
      if (selections.length === upgradeCount) {
        soundManager.play(SoundType.UPGRADE_SELECT)
        // Apply all selected upgrades
        selections.forEach(selectionIndex => {
          selectedUpgrades[selectionIndex].effect()
        })

        // Update slots display
        this.updateSlotsDisplay()

        // Clean up UI
        uiElements.forEach(obj => obj.destroy())
        confirmButton.destroy()
        confirmText.destroy()

        // Resume game
        this.resumeGame()
      }
    })

    confirmButton.on('pointerover', () => {
      if (selections.length === upgradeCount) {
        confirmButton.setFillStyle(0x3a7a3a)
      }
    })

    confirmButton.on('pointerout', () => {
      if (selections.length === upgradeCount) {
        confirmButton.setFillStyle(0x2a6a2a)
      } else {
        confirmButton.setFillStyle(0x444444)
      }
    })

    uiElements.push(confirmButton, confirmText)
  }

  private handleProjectileEnemyCollision(
    projectileObj: Phaser.GameObjects.GameObject,
    enemyObj: Phaser.GameObjects.GameObject
  ) {
    const projectile = projectileObj as Phaser.GameObjects.Text & {
      getDamage: () => number
      onHit: () => boolean
      getType: () => ProjectileType
      getDamageType: () => DamageType
      getExplosionRadius: () => number
      getFreezeChance: () => number
      getFreezeDuration: () => number
      getChainCount: () => number
      getBounceCount: () => number
      decrementBounce: () => boolean
      getZoneDuration: () => number
      getZoneRadius: () => number
      getWeaponName: () => string
      active: boolean
      body: Phaser.Physics.Arcade.Body
    }
    const enemy = enemyObj as Phaser.GameObjects.Text & { takeDamage: (damage: number) => boolean, active: boolean, body: Phaser.Physics.Arcade.Body }

    // Get base damage amount
    let damage = projectile.getDamage()

    // Check for critical hit (with character bonuses)
    let critChance = this.weaponModifiers.critChance

    // Tempest: +20% crit chance on Nature damage
    if (this.character.getConfig().type === 'TEMPEST' && projectile.getDamageType() === DamageType.NATURE) {
      critChance += 20
    }

    const isCritical = Math.random() * 100 < critChance
    if (isCritical) {
      damage = Math.floor(damage * this.weaponModifiers.critDamage)
      // Create critical hit sparkle burst
      this.createCriticalHitBurst(enemy.x, enemy.y)
    }

    // Apply status effect damage bonuses (PYROMANIAC, SHATTER_STRIKE, HEMORRHAGE)
    // These are conditional bonuses that only apply when enemy has matching status
    if ('isBurning' in enemy && (enemy as any).isBurning()) {
      // PYROMANIAC: +25% damage per level vs burning enemies
      const pyromaniacPassive = this.passives.find(p => p.getConfig().type === PassiveType.PYROMANIAC)
      if (pyromaniacPassive) {
        const bonusMultiplier = 1 + (0.25 * pyromaniacPassive.getLevel())
        damage = Math.floor(damage * bonusMultiplier)
      }
    }

    if ('isFrozen' in enemy && (enemy as any).isFrozen()) {
      // SHATTER_STRIKE: +30% damage per level vs frozen enemies
      const shatterStrikePassive = this.passives.find(p => p.getConfig().type === PassiveType.SHATTER_STRIKE)
      if (shatterStrikePassive) {
        const bonusMultiplier = 1 + (0.30 * shatterStrikePassive.getLevel())
        damage = Math.floor(damage * bonusMultiplier)
      }
    }

    if ('isBleeding' in enemy && (enemy as any).isBleeding()) {
      // HEMORRHAGE: +10% damage per level per bleed stack (max 3 stacks)
      const hemorrhagePassive = this.passives.find(p => p.getConfig().type === PassiveType.HEMORRHAGE)
      if (hemorrhagePassive && 'getBleedStacks' in enemy) {
        const bleedStacks = (enemy as any).getBleedStacks()
        const bonusPerStack = 0.10 * hemorrhagePassive.getLevel()
        const bonusMultiplier = 1 + (bonusPerStack * bleedStacks)
        damage = Math.floor(damage * bonusMultiplier)
      }
    }

    // Track damage dealt
    this.totalDamageDealt += damage
    this.damageTrackingWindow.push({ timestamp: this.time.now, damage })

    // Track damage per weapon
    const weaponName = projectile.getWeaponName()
    if (weaponName) {
      this.trackWeaponDamage(weaponName, damage)
    }

    // VAMPIRIC_FIRE: Heal player for % of fire damage dealt
    if (projectile.getDamageType() === DamageType.FIRE) {
      const vampiricFirePassive = this.passives.find(p => p.getConfig().type === PassiveType.VAMPIRIC_FIRE)
      if (vampiricFirePassive) {
        const level = vampiricFirePassive.getLevel()
        const healPercent = (1 + level) / 100 // 2%, 3%, or 4%
        const healAmount = Math.floor(damage * healPercent)
        if (healAmount > 0) {
          this.health = Math.floor(Math.min(this.maxHealth, this.health + healAmount))
          this.updateHealthDisplay()

          // Show healing visual effect
          const healText = this.add.text(this.player.x, this.player.y - 20, `+${healAmount}`, {
            fontFamily: 'Courier New',
            fontSize: '14px',
            color: '#00ff00',
            fontStyle: 'bold'
          }).setOrigin(0.5).setDepth(50)

          this.tweens.add({
            targets: healText,
            y: this.player.y - 40,
            alpha: { from: 1, to: 0 },
            duration: 800,
            onComplete: () => healText.destroy()
          })
        }
      }
    }

    // FROST_HASTE: Gain attack speed stack on cold damage hit
    if (projectile.getDamageType() === DamageType.COLD) {
      const frostHastePassive = this.passives.find(p => p.getConfig().type === PassiveType.FROST_HASTE)
      if (frostHastePassive && this.frostHasteStacks < this.frostHasteMaxStacks) {
        this.frostHasteStacks++
        this.frostHasteExpireTimes.push(this.time.now + this.frostHasteStackDuration)

        // Visual effect for stack gain
        const stackText = this.add.text(this.player.x + 30, this.player.y - 10, `❄+1`, {
          fontFamily: 'Courier New',
          fontSize: '12px',
          color: '#00ffff',
          fontStyle: 'bold'
        }).setOrigin(0.5).setDepth(50)

        this.tweens.add({
          targets: stackText,
          y: this.player.y - 30,
          alpha: { from: 1, to: 0 },
          duration: 600,
          onComplete: () => stackText.destroy()
        })
      }
    }

    // STATIC_FORTUNE: Chance to drop credits on nature damage
    if (projectile.getDamageType() === DamageType.NATURE) {
      const staticFortunePassive = this.passives.find(p => p.getConfig().type === PassiveType.STATIC_FORTUNE)
      if (staticFortunePassive) {
        const level = staticFortunePassive.getLevel()
        const dropChance = 10 * level // 10%, 20%, or 30%
        if (Math.random() * 100 < dropChance) {
          // Save enemy position for credit drop
          const creditX = enemy.x
          const creditY = enemy.y
          // Spawn a small credit drop (1-2 credits)
          const creditAmount = 1 + Math.floor(Math.random() * 2)
          this.creditDrops.spawnCredit(creditX, creditY, creditAmount)
        }
      }
    }

    // Show damage number
    this.showDamageNumber(enemy.x, enemy.y, damage, isCritical)

    // Save enemy position before damage (in case enemy dies)
    const enemyX = enemy.x
    const enemyY = enemy.y

    // REAPER: Execute enemies under 15% HP instantly
    if (this.character.getConfig().type === 'REAPER' && 'getHealth' in enemy && 'getMaxHealth' in enemy) {
      const enemyHealth = (enemy as any).getHealth()
      const enemyMaxHealth = (enemy as any).getMaxHealth()
      const healthPercent = enemyHealth / enemyMaxHealth

      if (healthPercent < 0.15 && healthPercent > 0) {
        // Execute! Deal massive damage to instantly kill
        damage = enemyHealth + 1000 // Ensure death
      }
    }

    // Apply damage to enemy
    const enemyDied = enemy.takeDamage(damage)

    // TOXIC_ROUNDS: Chance to apply poison on any hit
    const toxicRoundsPassive = this.passives.find(p => p.getConfig().type === PassiveType.TOXIC_ROUNDS)
    if (toxicRoundsPassive && enemy.active) {
      const level = toxicRoundsPassive.getLevel()
      const poisonChance = 15 * level // 15%, 30%, or 45%
      if (Math.random() * 100 < poisonChance) {
        const poisonDuration = 3000 // 3 seconds
        if ('applyPoison' in enemy) {
          (enemy as any).applyPoison(poisonDuration)
        }
        // Show poison status effect indicator
        this.showStatusEffect(enemyX, enemyY, '☠', '#88ff88')
      }
    }

    // HEMORRHAGE: Apply bleed on every hit (damage amplification)
    const hemorrhagePassive = this.passives.find(p => p.getConfig().type === PassiveType.HEMORRHAGE)
    if (hemorrhagePassive && enemy.active) {
      const bleedDuration = 5000 // 5 seconds
      const maxStacks = 3 // Max 3 stacks
      if ('applyBleed' in enemy) {
        (enemy as any).applyBleed(bleedDuration, maxStacks)
      }
      // Show bleed status effect indicator
      this.showStatusEffect(enemyX, enemyY, '♠', '#ff0000')
    }

    // Apply special effects based on projectile type
    const projectileType = projectile.getType()

    // EXPLOSIVE: Create explosion that damages nearby enemies
    if (projectileType === ProjectileType.EXPLOSIVE) {
      const explosionRadius = projectile.getExplosionRadius()
      if (explosionRadius > 0) {
        // Apply burn status to primary target (3 second duration)
        const burnDuration = 3000
        if (enemy.active && 'applyBurn' in enemy) {
          (enemy as any).applyBurn(burnDuration)
        }

        // Show burn status effect indicator on primary target
        this.showStatusEffect(enemyX, enemyY, '🔥', '#ff4400')

        // Find all enemies within radius
        const nearbyEnemies = this.enemies.getNearbyEnemies(projectile.x, projectile.y, explosionRadius)

        // Damage all nearby enemies (50% of projectile damage)
        nearbyEnemies.forEach(nearbyEnemy => {
          if (nearbyEnemy.active && nearbyEnemy !== enemy) {
            const distance = Phaser.Math.Distance.Between(projectile.x, projectile.y, nearbyEnemy.x, nearbyEnemy.y)
            if (distance <= explosionRadius) {
              const aoeDamage = Math.floor(damage * 0.5)
              nearbyEnemy.takeDamage(aoeDamage)
              this.totalDamageDealt += aoeDamage
              this.damageTrackingWindow.push({ timestamp: this.time.now, damage: aoeDamage })
              if (weaponName) {
                this.trackWeaponDamage(weaponName, aoeDamage)
              }
              this.showDamageNumber(nearbyEnemy.x, nearbyEnemy.y, aoeDamage)

              // Apply burn status to AOE targets too
              if ('applyBurn' in nearbyEnemy) {
                (nearbyEnemy as any).applyBurn(burnDuration)
              }

              // Show burn effect on AOE targets too
              this.showStatusEffect(nearbyEnemy.x, nearbyEnemy.y, '🔥', '#ff4400')
            }
          }
        })

        // Visual effect - create explosion circle
        const explosion = this.add.circle(projectile.x, projectile.y, explosionRadius, 0xff4400, 0.3)
        this.tweens.add({
          targets: explosion,
          scaleX: 1.5,
          scaleY: 1.5,
          alpha: 0,
          duration: 200,
          onComplete: () => explosion.destroy()
        })
      }
    }

    // FREEZING: Chance to slow/freeze enemy
    if (projectileType === ProjectileType.FREEZING) {
      const freezeChance = projectile.getFreezeChance()
      if (Math.random() * 100 < freezeChance) {
        const freezeDuration = projectile.getFreezeDuration()

        // Apply freeze status to enemy
        if (enemy.active && 'applyFreeze' in enemy) {
          (enemy as any).applyFreeze(freezeDuration)
        }

        // Show freeze status effect indicator
        this.showStatusEffect(enemyX, enemyY, '❄', '#00ffff')

        // Visual: Change enemy color to cyan temporarily
        const enemyText = enemy as Phaser.GameObjects.Text
        const originalColor = enemyText.style.color
        enemyText.setColor('#00ffff')

        this.time.delayedCall(freezeDuration, () => {
          if (enemy.active) {
            enemyText.setColor(originalColor)
          }
        })
      }
    }

    // CHAINING: Chain lightning to nearby enemies
    if (projectileType === ProjectileType.CHAINING && projectile.getChainCount() > 0) {
      const chainCount = projectile.getChainCount()
      const chainRange = 150 * this.weaponModifiers.explosionRadiusMultiplier

      // Find nearby enemies to chain to (filter for valid on-screen positions)
      const nearbyEnemies = this.enemies.getNearbyEnemies(enemy.x, enemy.y, chainRange)
        .filter(e => {
          // Don't chain to same enemy, and ensure valid on-screen position
          return e !== enemy && e.active &&
                 e.y > 0 && e.y < this.cameras.main.height &&
                 e.x >= 0 && e.x <= this.cameras.main.width
        })
        .slice(0, chainCount)

      // Deal reduced damage to chained enemies
      nearbyEnemies.forEach(chainedEnemy => {
        // Extra safety check: ensure both enemies have valid positions
        if (!chainedEnemy.active || chainedEnemy.x < 0 || chainedEnemy.y <= 0) {
          return
        }

        const chainDamage = Math.floor(damage * 0.7)
        chainedEnemy.takeDamage(chainDamage)
        this.totalDamageDealt += chainDamage
        this.damageTrackingWindow.push({ timestamp: this.time.now, damage: chainDamage })
        if (weaponName) {
          this.trackWeaponDamage(weaponName, chainDamage)
        }
        this.showDamageNumber(chainedEnemy.x, chainedEnemy.y, chainDamage)

        // Visual: Draw lightning arc from primary target to chained enemy
        const lightning = this.add.line(
          0, 0,
          enemy.x, enemy.y,
          chainedEnemy.x, chainedEnemy.y,
          0x00ffff, 0.8
        ).setLineWidth(2).setOrigin(0, 0)

        this.time.delayedCall(100, () => lightning.destroy())
      })
    }

    // BOUNCING: Ricochet off enemies
    if (projectileType === ProjectileType.BOUNCING) {
      // BLOOD_LANCE (NATURE damage BOUNCING projectiles) apply poison
      if (projectile.getDamageType() === DamageType.NATURE && enemy.active) {
        const poisonDuration = 3000
        if ('applyPoison' in enemy) {
          (enemy as any).applyPoison(poisonDuration)
        }
        // Show poison status effect indicator
        this.showStatusEffect(enemyX, enemyY, '☠', '#88ff88')
      }

      if (projectile.getBounceCount() > 0) {
        // Calculate bounce direction away from enemy
        const angle = Phaser.Math.Angle.Between(enemy.x, enemy.y, projectile.x, projectile.y)
        const speed = Math.sqrt(projectile.body.velocity.x ** 2 + projectile.body.velocity.y ** 2)

        // Add some randomness to bounce angle (±30 degrees)
        const randomOffset = (Math.random() - 0.5) * Math.PI / 3
        const bounceAngle = angle + randomOffset

        // Apply new velocity in bounce direction
        projectile.body.setVelocity(
          Math.cos(bounceAngle) * speed * 1.2, // Slightly faster on bounce
          Math.sin(bounceAngle) * speed * 1.2
        )

        // Decrement bounce count
        const stillHasBounces = projectile.decrementBounce()

        // Visual feedback - flash the projectile
        const originalColor = (projectile as Phaser.GameObjects.Text).style.color
        ;(projectile as Phaser.GameObjects.Text).setColor('#ffff00')
        this.time.delayedCall(50, () => {
          if (projectile.active) {
            ;(projectile as Phaser.GameObjects.Text).setColor(originalColor)
          }
        })

        // If no bounces left, destroy on next hit
        if (!stillHasBounces) {
          // Let it continue one more frame, but it will be destroyed in Projectile.update()
        }

        // Don't destroy on bounce - projectile continues
        return
      } else {
        // No bounces left - destroy projectile
        projectile.destroy()
        return
      }
    }

    // EARTH_ZONE: Create persistent damage zone
    if (projectileType === ProjectileType.EARTH_ZONE) {
      const zoneDuration = projectile.getZoneDuration()
      const zoneRadius = projectile.getZoneRadius()

      if (zoneDuration > 0 && zoneRadius > 0) {
        // Apply poison status to primary target (3 second duration)
        const poisonDuration = 3000
        if (enemy.active && 'applyPoison' in enemy) {
          (enemy as any).applyPoison(poisonDuration)
        }

        // Show poison status effect on primary target
        this.showStatusEffect(enemy.x, enemy.y, '☠', '#88ff88')

        // Create damage zone at projectile position
        const zone = new DamageZone(
          this,
          projectile.x,
          projectile.y,
          zoneRadius,
          damage * 0.3, // Zone does 30% of weapon damage per tick
          zoneDuration,
          500, // Damage tick every 500ms
          (x, y, dmg) => this.showDamageNumber(x, y, dmg) // Callback to show damage numbers
        )
        this.damageZones.push(zone)
      }

      // Earth projectiles always destroy on hit (don't pierce)
      projectile.destroy()
      return
    }

    // Check if projectile should be destroyed (based on pierce)
    const shouldDestroy = projectile.onHit()
    if (shouldDestroy) {
      projectile.destroy()
    }
  }

  private showDamageNumber(x: number, y: number, damage: number, isCritical: boolean = false) {
    // Only show damage numbers for critical hits
    if (!isCritical) {
      return
    }

    // Ensure damage is a number and convert to string explicitly
    const damageValue = typeof damage === 'number' ? Math.floor(damage) : parseInt(String(damage))
    const damageString = `${damageValue}`

    const damageText = this.add.text(x, y, damageString, {
      fontFamily: 'Courier New',
      fontSize: isCritical ? '48px' : '36px',
      color: isCritical ? '#ff4400' : '#ffff00',
      fontStyle: 'bold',
      stroke: '#000000',
      strokeThickness: 3
    }).setOrigin(0.5).setDepth(50)

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

  private showStatusEffect(x: number, y: number, effect: string, color: string) {
    const statusText = this.add.text(x, y - 20, effect, {
      fontFamily: 'Courier New',
      fontSize: '28px',
      color: color,
      fontStyle: 'bold'
    }).setOrigin(0.5).setDepth(50)

    // Animate the status effect indicator - pop up and fade
    this.tweens.add({
      targets: statusText,
      y: y - 60,
      scale: { from: 0.5, to: 1.2 },
      alpha: { from: 1, to: 0 },
      duration: 1000,
      ease: 'Back.easeOut',
      onComplete: () => {
        statusText.destroy()
      }
    })
  }

  private handlePlayerEnemyCollision(
    playerObj: Phaser.GameObjects.GameObject,
    enemyObj: Phaser.GameObjects.GameObject
  ) {
    const enemy = enemyObj as any

    // Check if enemy is still active
    if (!enemy.active) {
      return
    }

    // Check invulnerability frames
    const timeSinceHit = this.time.now - this.lastHitTime
    if (timeSinceHit < this.playerStats.invulnFrames) {
      return // Still invulnerable
    }

    // Play player hit sound
    soundManager.play(SoundType.PLAYER_HIT)

    // Damage player
    this.takeDamage(10)

    // Set last hit time for invulnerability
    this.lastHitTime = this.time.now

    // Contact damage to enemy
    const enemyType = enemy.getType ? enemy.getType() : null
    const isBoss = this.isBossType(enemyType)
    const isMiniBoss = this.isMiniBossType(enemyType)

    if (isBoss || isMiniBoss) {
      // Bosses/mini-bosses take minor contact damage (5% of max health)
      const maxHealth = enemy.getMaxHealth ? enemy.getMaxHealth() : 100
      const contactDamage = Math.max(10, Math.floor(maxHealth * 0.05))
      enemy.takeDamage(contactDamage)
    } else {
      // Regular enemies die on contact (original behavior)
      enemy.takeDamage(999)
    }
  }

  private handlePowerUpCollection(
    playerObj: Phaser.GameObjects.GameObject,
    powerUpObj: Phaser.GameObjects.GameObject
  ) {
    const powerUp = powerUpObj as any

    if (!powerUp.active) return

    const type = powerUp.getPowerUpType() as PowerUpType
    const config = POWERUP_CONFIGS[type]

    // Play power-up pickup sound (chest sound played in openTreasureChest)
    if (type !== PowerUpType.CHEST) {
      soundManager.play(SoundType.POWERUP_PICKUP)
    }

    // Apply power-up effect
    switch (type) {
      case PowerUpType.SHIELD:
        this.hasShield = true
        this.shieldEndTime = this.time.now + config.duration

        // Create flashing shield effect
        if (this.shieldFlashTween) {
          this.shieldFlashTween.stop()
        }

        // Reset scale (in case invulnerability glow was active)
        this.player.setScale(1)

        // Reset to normal color first
        this.player.setColor(this.characterColor)

        // Create flashing tween that alternates between normal character color and cyan
        this.shieldFlashTween = this.tweens.add({
          targets: this.player,
          duration: 200,
          repeat: -1,
          yoyo: true,
          onUpdate: (tween) => {
            const progress = tween.progress
            if (progress < 0.5) {
              this.player.setColor('#00ffff') // Cyan shield effect
            } else {
              this.player.setColor(this.characterColor) // Character's original color
            }
          }
        })
        break

      case PowerUpType.RAPID_FIRE:
        this.hasRapidFirePowerUp = true
        this.rapidFireEndTime = this.time.now + config.duration
        break

      case PowerUpType.NUKE:
        // Kill all enemies on screen (except bosses and mini-bosses)
        this.enemies.getChildren().forEach((enemy: any) => {
          if (enemy.active) {
            const enemyType = enemy.getType()
            // Don't instantly kill bosses or mini-bosses - damage them for 25% of max health instead
            const isBoss = this.isBossType(enemyType)
            const isMiniBoss = this.isMiniBossType(enemyType)

            if (isBoss || isMiniBoss) {
              // Bosses take 25% max health damage from nuke (still significant but not instant kill)
              const maxHealth = enemy.getMaxHealth()
              const nukeDamage = Math.floor(maxHealth * 0.25)
              enemy.takeDamage(nukeDamage)
            } else {
              // Regular enemies die instantly
              enemy.takeDamage(9999)
            }
          }
        })
        // Screen flash
        this.cameras.main.flash(300, 255, 255, 0)
        break

      case PowerUpType.MAGNET:
        // Apply magnet duration bonus
        const bonuses3 = this.gameState.getTotalBonuses()
        const magnetDuration = config.duration + ((bonuses3.magnetDuration || 0) * 1000) // Convert seconds to ms
        this.hasMagnet = true
        this.magnetEndTime = this.time.now + magnetDuration
        break

      case PowerUpType.HEALTH:
        // Heal 20% of max health (+ building bonuses)
        const bonuses2 = this.gameState.getTotalBonuses()
        const baseHealPercent = 0.2
        const healPercent = baseHealPercent * (1 + (bonuses2.healthPackValue || 0))
        const healAmount = Math.floor(this.maxHealth * healPercent)
        this.health = Math.floor(Math.min(this.maxHealth, this.health + healAmount))

        // Visual feedback - flash green
        this.cameras.main.flash(200, 0, 255, 0)

        // Show healing text
        const healText = this.add.text(
          this.player.x,
          this.player.y - 40,
          `+${healAmount}`,
          {
            fontFamily: 'Courier New',
            fontSize: '24px',
            color: '#00ff00',
            fontStyle: 'bold',
          }
        ).setOrigin(0.5).setDepth(100)

        // Animate heal text rising and fading
        this.tweens.add({
          targets: healText,
          y: healText.y - 50,
          alpha: 0,
          duration: 1000,
          onComplete: () => healText.destroy()
        })
        break

      case PowerUpType.CHEST:
        // Random reward tier
        this.openTreasureChest()
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

      // Stop the flashing tween
      if (this.shieldFlashTween) {
        this.shieldFlashTween.stop()
        this.shieldFlashTween = undefined
      }

      // Only restore color if not invulnerable (star effect takes priority)
      const timeSinceHit = currentTime - this.lastHitTime
      const isInvulnerable = timeSinceHit < this.playerStats.invulnFrames
      if (!isInvulnerable) {
        this.player.setColor(this.characterColor)
      }
      updated = true
    }

    // Check rapid fire
    if (this.hasRapidFirePowerUp && currentTime >= this.rapidFireEndTime) {
      this.hasRapidFirePowerUp = false
      updated = true
    }

    // Check magnet
    if (this.hasMagnet && currentTime >= this.magnetEndTime) {
      this.hasMagnet = false
      updated = true
    }

    // Check overdrive
    if (this.hasOverdrive && currentTime >= this.overdriveEndTime) {
      this.hasOverdrive = false
      updated = true
    }

    if (updated) {
      this.updatePowerUpDisplay()
    }
  }

  private updatePowerUpDisplay() {
    const currentTime = this.time.now
    const iconSize = 40
    const iconSpacing = 10

    // Update existing buffs
    this.buffDisplays.forEach((display, key) => {
      const elapsed = currentTime - display.startTime
      const remaining = Math.max(0, display.duration - elapsed)
      const fillPercent = remaining / display.duration

      // Update fill rectangle width to show depletion
      display.fill.width = (iconSize - 4) * fillPercent
    })

    // Determine which buffs should be displayed
    const buffsToShow: Array<{ key: string, icon: string, color: number, startTime: number, endTime: number, duration: number }> = []

    if (this.hasShield) {
      buffsToShow.push({
        key: 'shield',
        icon: '◆',
        color: 0xff88ff, // Consistent pink/magenta for all buffs
        startTime: this.shieldEndTime - 5000,
        endTime: this.shieldEndTime,
        duration: 5000
      })
    }

    if (this.hasRapidFirePowerUp) {
      buffsToShow.push({
        key: 'rapidfire',
        icon: '↑',
        color: 0xff88ff, // Consistent pink/magenta for all buffs
        startTime: this.rapidFireEndTime - 8000,
        endTime: this.rapidFireEndTime,
        duration: 8000
      })
    }

    if (this.hasMagnet) {
      buffsToShow.push({
        key: 'magnet',
        icon: '⊕',
        color: 0xff88ff, // Consistent pink/magenta for all buffs
        startTime: this.magnetEndTime - 10000,
        endTime: this.magnetEndTime,
        duration: 10000
      })
    }

    if (this.hasOverdrive) {
      const overdrivePassive = this.passives.find(p => p.getConfig().type === PassiveType.OVERDRIVE_REACTOR)
      if (overdrivePassive) {
        const level = overdrivePassive.getLevel()
        const duration = (2 + level) * 1000 // 3s/4s/5s duration
        buffsToShow.push({
          key: 'overdrive',
          icon: '◈',
          color: 0xff88ff, // Consistent pink/magenta for all buffs
          startTime: this.overdriveEndTime - duration,
          endTime: this.overdriveEndTime,
          duration: duration
        })
      }
    }

    // Remove buffs that are no longer active
    this.buffDisplays.forEach((display, key) => {
      if (!buffsToShow.find(b => b.key === key)) {
        display.bg.destroy()
        display.fill.destroy()
        display.icon.destroy()
        this.buffDisplays.delete(key)
      }
    })

    // Add new buffs and position all
    buffsToShow.forEach((buff, index) => {
      if (!this.buffDisplays.has(buff.key)) {
        // Create new buff display
        const xOffset = (index - buffsToShow.length / 2 + 0.5) * (iconSize + iconSpacing)

        // Background rectangle (dark)
        const bg = this.add.rectangle(xOffset, 0, iconSize, iconSize, 0x000000, 0.7)
          .setOrigin(0.5)

        // Fill rectangle (colored, depletes over time)
        const fill = this.add.rectangle(xOffset - iconSize / 2 + 2, 2, iconSize - 4, iconSize - 4, buff.color, 0.5)
          .setOrigin(0, 0.5)

        // Icon text
        const icon = this.add.text(xOffset, 0, buff.icon, {
          fontFamily: 'Courier New',
          fontSize: '28px',
          color: '#ffffff',
        }).setOrigin(0.5).setInteractive({ useHandCursor: true })

        // Add click handler to open stats popup
        icon.on('pointerdown', () => {
          if (!this.isPaused) {
            this.showStatsPopup()
          }
        })

        this.buffIconsContainer.add([bg, fill, icon])
        this.buffDisplays.set(buff.key, {
          bg,
          fill,
          icon,
          startTime: buff.startTime,
          duration: buff.duration
        })
      }

      // Update position for all buffs
      const display = this.buffDisplays.get(buff.key)!
      const xOffset = (index - buffsToShow.length / 2 + 0.5) * (iconSize + iconSpacing)
      display.bg.x = xOffset
      display.fill.x = xOffset - iconSize / 2 + 2
      display.icon.x = xOffset
    })
  }

  private takeDamage(amount: number) {
    // Shield blocks damage
    if (this.hasShield) {
      return
    }

    this.health -= amount
    this.health = Math.floor(Math.max(0, this.health))
    this.updateHealthDisplay()

    // Reset combo when hit
    this.resetCombo()

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
      const healthBarHeight = 12

      this.healthBarBackground.setPosition(playerX, playerY)
      this.healthBarFill.setPosition(playerX - 29, playerY + 1) // Center the fill (60/2 - 1 for padding)
      this.healthText.setPosition(playerX, playerY + healthBarHeight / 2) // Center text inside bar

      // Update health text (always show as integer)
      this.healthText.setText(`${Math.floor(this.health)}`)

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

    // Save high score for this level if beaten
    const currentLevelIndex = this.campaignManager.getCurrentLevelIndex()
    this.gameState.setLevelHighScore(currentLevelIndex, this.score)
    if (this.score > this.highScore) {
      this.highScore = this.score
    }

    // Clear any existing game over UI
    this.gameOverUI.forEach(obj => obj.destroy())
    this.gameOverUI = []

    // Create game over overlay
    const overlay = this.add.rectangle(
      0, 0,
      this.cameras.main.width,
      this.cameras.main.height,
      0x000000,
      0.8
    ).setOrigin(0, 0).setDepth(200)
    this.gameOverUI.push(overlay)

    const gameOverText = this.add.text(
      this.cameras.main.centerX,
      this.cameras.main.centerY - 260,
      'RUN COMPLETE',
      {
        fontFamily: 'Courier New',
        fontSize: '64px',
        color: '#aaaaaa',
      }
    ).setOrigin(0.5).setDepth(201)
    this.gameOverUI.push(gameOverText)

    const minutes = Math.floor(this.survivalTime / 60)
    const seconds = this.survivalTime % 60

    // Calculate DPS
    const dps = this.survivalTime > 0 ? Math.floor(this.totalDamageDealt / this.survivalTime) : 0

    // Get weapon names
    const weaponNames = this.weapons.map(w => w.getConfig().name).join(', ')

    // Get passive names
    const passiveNames = this.passives.map(p => p.getConfig().name).join(', ')

    const statsText = this.add.text(
      this.cameras.main.centerX,
      this.cameras.main.centerY - 160,
      `Score: ${this.score}\nLevel: ${this.level}\nTime: ${minutes}:${seconds.toString().padStart(2, '0')}\nDPS: ${dps}\n\n${this.score === this.highScore && this.score > 0 ? 'NEW HIGH SCORE!' : `High Score: ${this.highScore}`}`,
      {
        fontFamily: 'Courier New',
        fontSize: '24px',
        color: this.score === this.highScore && this.score > 0 ? '#ffff00' : '#ffffff',
        align: 'center'
      }
    ).setOrigin(0.5).setDepth(201)
    this.gameOverUI.push(statsText)

    // Interactive Weapons and Passives display with icons and pips
    const weaponPassiveElements = this.createWeaponPassiveDisplay(this.cameras.main.centerY - 50)
    this.gameOverUI.push(...weaponPassiveElements)

    // Revive button - positioned after weapons/passives display
    const reviveButtonY = this.cameras.main.centerY + 240
    const reviveButton = this.add.rectangle(
      this.cameras.main.centerX,
      reviveButtonY,
      300,
      70,
      0x4a2a4a
    ).setDepth(201).setInteractive({ useHandCursor: true })
    this.gameOverUI.push(reviveButton)

    const reviveText = this.add.text(
      this.cameras.main.centerX,
      reviveButtonY,
      'Revive Watch Ad',
      {
        fontFamily: 'Courier New',
        fontSize: '28px',
        color: '#ffaa00',
      }
    ).setOrigin(0.5).setDepth(202)
    this.gameOverUI.push(reviveText)

    // Revive hover effects
    reviveButton.on('pointerover', () => {
      reviveButton.setFillStyle(0x6a3a6a)
    })

    reviveButton.on('pointerout', () => {
      reviveButton.setFillStyle(0x4a2a4a)
    })

    // Revive handler - Coming Soon
    reviveButton.on('pointerdown', () => {
      // Show floating "Coming Soon" text
      const comingSoonText = this.add.text(
        this.cameras.main.centerX,
        this.cameras.main.centerY + 240,
        'Revive Feature Coming Soon!',
        {
          fontFamily: 'Courier New',
          fontSize: '18px',
          color: '#ffff00',
          fontStyle: 'bold',
        }
      ).setOrigin(0.5).setDepth(1000)

      // Animate it floating up and fading out
      this.tweens.add({
        targets: comingSoonText,
        y: this.cameras.main.centerY + 140,
        alpha: 0,
        duration: 2000,
        ease: 'Cubic.easeOut',
        onComplete: () => {
          comingSoonText.destroy()
        }
      })
    })

    // Main menu button (positioned lower)
    const mainMenuButtonY = this.cameras.main.centerY + 340
    const mainMenuButton = this.add.rectangle(
      this.cameras.main.centerX,
      mainMenuButtonY,
      300,
      70,
      0x2a2a4a
    ).setDepth(201).setInteractive({ useHandCursor: true })
    this.gameOverUI.push(mainMenuButton)

    const mainMenuText = this.add.text(
      this.cameras.main.centerX,
      mainMenuButtonY,
      'MAIN MENU',
      {
        fontFamily: 'Courier New',
        fontSize: '28px',
        color: '#00ff00',
      }
    ).setOrigin(0.5).setDepth(202)
    this.gameOverUI.push(mainMenuText)

    // Hover effects
    mainMenuButton.on('pointerover', () => {
      mainMenuButton.setFillStyle(0x3a3a6a)
    })

    mainMenuButton.on('pointerout', () => {
      mainMenuButton.setFillStyle(0x2a2a4a)
    })

    // Main menu handler
    mainMenuButton.on('pointerdown', () => {
      this.scene.stop('GameScene')
      this.scene.start('MainMenuScene')
    })
  }

  private revivePlayer() {
    // Clear game over UI
    this.gameOverUI.forEach(obj => obj.destroy())
    this.gameOverUI = []

    // Restore health to full
    this.health = this.maxHealth
    this.updateHealthDisplay()

    // Clear all enemies and projectiles to give player breathing room
    // Deactivate all active enemies manually to preserve pool
    this.enemies.getChildren().forEach((enemy: any) => {
      if (enemy.active) {
        enemy.setActive(false)
        enemy.setVisible(false)
        if (enemy.body) {
          enemy.body.enable = false
        }
      }
    })

    // Clear enemy projectiles
    this.enemyProjectiles.clear(false, false)

    // Clear player projectiles
    this.projectiles.clear(false, false)

    // Reset wave state to continue where we left off
    this.waveInProgress = true
    this.currentWaveEnemyCount = 0

    // Give brief invulnerability
    this.lastHitTime = this.time.now

    // Unpause game
    this.isPaused = false
    this.physics.resume()

    // Resume star field
    this.starFieldTweens.forEach(tween => tween.resume())
  }

  private levelWon() {
    this.isPaused = true
    this.physics.pause()
    // Pause star field
    this.starFieldTweens.forEach(tween => tween.pause())

    // Award credits with building bonus
    let creditsReward = this.campaignManager.getCreditsReward()
    const bonuses = this.gameState.getTotalBonuses()

    // Apply credit multiplier
    if (bonuses.creditMultiplier) {
      creditsReward = Math.floor(creditsReward * (1 + bonuses.creditMultiplier))
    }

    // Add win bonus
    if (bonuses.winBonus) {
      creditsReward += bonuses.winBonus
    }

    // Add boss bonus (multiply by bosses killed this run)
    if (bonuses.bossBonus && this.bossesKilled > 0) {
      creditsReward += bonuses.bossBonus * this.bossesKilled
    }

    // Add credits once (GameState now delegates to GameProgression)
    this.gameState.addCredits(creditsReward)
    this.creditsCollectedThisRun += creditsReward
    this.creditsCollectedText.setText(`${this.creditsCollectedThisRun}¤`)

    // Unlock next level if available
    const currentLevel = this.campaignManager.getCurrentLevelIndex()
    if (currentLevel + 1 < this.campaignManager.getLevelCount()) {
      if (this.gameState.getUnlockedLevels() <= currentLevel + 1) {
        this.gameState.unlockNextLevel()
      }
    }

    // Track ships before completing level
    const shipsBefore = gameProgression.getUnlockedUnpurchasedShips()

    // Complete level in progression system (unlocks ships)
    const levelNumber = currentLevel + 1 // Convert 0-based to 1-based
    gameProgression.completeLevel(levelNumber)

    // Check for newly unlocked ships
    const shipsAfter = gameProgression.getUnlockedUnpurchasedShips()
    const newlyUnlockedShips = shipsAfter.filter(ship => !shipsBefore.includes(ship))

    // Record stats
    this.gameState.recordRun(this.score, this.survivalTime, this.killCount)

    // Record character-specific stats
    const timePlayed = this.time.now - this.runStartTime
    this.gameState.recordCharacterRun(
      this.character.getConfig().type,
      this.totalDamageDealt,
      timePlayed,
      this.killCount
    )

    // Save high score for this level if beaten
    const currentLevelIndex = this.campaignManager.getCurrentLevelIndex()
    this.gameState.setLevelHighScore(currentLevelIndex, this.score)
    if (this.score > this.highScore) {
      this.highScore = this.score
    }

    // Show victory overlay with newly unlocked ships
    this.showVictoryOverlay(creditsReward, newlyUnlockedShips)
  }

  private showVictoryOverlay(creditsEarned: number, newlyUnlockedShips: CharacterType[] = []) {
    // Create victory overlay
    const overlay = this.add.rectangle(
      0, 0,
      this.cameras.main.width,
      this.cameras.main.height,
      0x000000,
      0.8
    ).setOrigin(0, 0).setDepth(200)

    // Create victory confetti burst
    this.createVictoryConfetti()

    const victoryText = this.add.text(
      this.cameras.main.centerX,
      80,
      'VICTORY!',
      {
        fontFamily: 'Courier New',
        fontSize: '52px',
        color: '#00ff00',
      }
    ).setOrigin(0.5).setDepth(201)

    const minutes = Math.floor(this.survivalTime / 60)
    const seconds = this.survivalTime % 60

    // Calculate DPS
    const dps = this.survivalTime > 0 ? Math.floor(this.totalDamageDealt / this.survivalTime) : 0

    // Get weapon names
    const weaponNames = this.weapons.map(w => w.getConfig().name).join(', ')

    // Get passive names
    const passiveNames = this.passives.map(p => p.getConfig().name).join(', ')

    const statsText = this.add.text(
      this.cameras.main.centerX,
      150,
      `Time: ${minutes}:${seconds.toString().padStart(2, '0')} | Kills: ${this.killCount} | Score: ${this.score} | DPS: ${dps}`,
      {
        fontFamily: 'Courier New',
        fontSize: '16px',
        color: '#ffffff',
        align: 'center'
      }
    ).setOrigin(0.5).setDepth(201)

    // Interactive Weapons and Passives display with icons and pips - closer to stats
    this.createWeaponPassiveDisplay(165)

    // Credits earned display - moved up
    const creditsText = this.add.text(
      this.cameras.main.centerX,
      400,
      `REWARDS`,
      {
        fontFamily: 'Courier New',
        fontSize: '18px',
        color: '#ffdd00',
        fontStyle: 'bold',
      }
    ).setOrigin(0.5).setDepth(201)

    const creditsValue = this.add.text(
      this.cameras.main.centerX,
      425,
      `${creditsEarned} ¤`,
      {
        fontFamily: 'Courier New',
        fontSize: '24px',
        color: '#ffdd00',
      }
    ).setOrigin(0.5).setDepth(201)

    // Display newly unlocked ships - moved up
    const unlockSectionHeight = this.displayUnlockedShips(newlyUnlockedShips, 470)

    // Position continue button at bottom of screen
    const continueButtonY = this.cameras.main.height - 60

    const continueButton = this.add.rectangle(
      this.cameras.main.centerX,
      continueButtonY,
      300,
      80,
      0x2a4a2a
    ).setDepth(201).setInteractive({ useHandCursor: true })

    const continueText = this.add.text(
      this.cameras.main.centerX,
      continueButtonY,
      'CONTINUE',
      {
        fontFamily: 'Courier New',
        fontSize: '32px',
        color: '#00ff00',
      }
    ).setOrigin(0.5).setDepth(202)

    // Hover effects
    continueButton.on('pointerover', () => {
      continueButton.setFillStyle(0x3a5a3a)
    })

    continueButton.on('pointerout', () => {
      continueButton.setFillStyle(0x2a4a2a)
    })

    // Continue handler
    continueButton.on('pointerdown', () => {
      this.scene.stop('GameScene')
      this.scene.start('MainMenuScene')
    })
  }

  private handleEnemyProjectileHit(
    playerObj: Phaser.GameObjects.GameObject,
    projectileObj: Phaser.GameObjects.GameObject
  ) {
    const projectile = projectileObj as any

    if (!projectile.active) return

    // Check invulnerability frames
    const timeSinceHit = this.time.now - this.lastHitTime
    if (timeSinceHit < this.playerStats.invulnFrames) {
      return // Still invulnerable
    }

    // Play player hit sound
    soundManager.play(SoundType.PLAYER_HIT)

    // Damage player
    this.takeDamage(projectile.getDamage())

    // Set last hit time for invulnerability
    this.lastHitTime = this.time.now

    // Destroy projectile
    const projectileBody = projectile.body as Phaser.Physics.Arcade.Body
    projectile.setActive(false)
    projectile.setVisible(false)
    projectile.setPosition(-1000, -1000)
    projectileBody.setVelocity(0, 0)
    projectileBody.enable = false
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
    const swarmerHealth = ENEMY_CONFIGS[EnemyType.SWARMER].health
    let actuallySpawned = 0

    for (let i = 0; i < data.count; i++) {
      const angle = (i / data.count) * Math.PI * 2
      const offsetX = Math.cos(angle) * 40
      const offsetY = Math.sin(angle) * 40
      const enemy = this.enemies.spawnEnemy(this.clampSpawnX(data.x + offsetX), data.y + offsetY, EnemyType.SWARMER)
      if (enemy) {
        this.healthTrackingWindow.push({ timestamp: this.time.now, health: swarmerHealth })
        actuallySpawned++
        this.cachedActiveEnemyCount++
      }
    }

    // Update wave enemy count to track the newly spawned enemies (only ones that actually spawned)
    if (this.waveInProgress) {
      this.currentWaveEnemyCount += actuallySpawned
    }
  }

  private showMenuConfirmation() {
    // Create overlay
    const overlay = this.add.rectangle(
      0, 0,
      this.cameras.main.width,
      this.cameras.main.height,
      0x000000,
      0.7
    ).setOrigin(0, 0).setDepth(300)

    // Title
    const title = this.add.text(
      this.cameras.main.centerX,
      this.cameras.main.centerY - 80,
      'Return to Menu?',
      {
        fontFamily: 'Courier New',
        fontSize: '32px',
        color: '#ffff00',
      }
    ).setOrigin(0.5).setDepth(301)

    const subtitle = this.add.text(
      this.cameras.main.centerX,
      this.cameras.main.centerY - 30,
      'Your progress will be lost',
      {
        fontFamily: 'Courier New',
        fontSize: '18px',
        color: '#aaaaaa',
      }
    ).setOrigin(0.5).setDepth(301)

    // Yes button
    const yesButton = this.add.rectangle(
      this.cameras.main.centerX - 80,
      this.cameras.main.centerY + 50,
      140,
      60,
      0x4a2a2a
    ).setDepth(301).setInteractive({ useHandCursor: true })

    const yesText = this.add.text(
      this.cameras.main.centerX - 80,
      this.cameras.main.centerY + 50,
      'YES',
      {
        fontFamily: 'Courier New',
        fontSize: '24px',
        color: '#ff6666',
      }
    ).setOrigin(0.5).setDepth(302)

    // No button
    const noButton = this.add.rectangle(
      this.cameras.main.centerX + 80,
      this.cameras.main.centerY + 50,
      140,
      60,
      0x2a4a2a
    ).setDepth(301).setInteractive({ useHandCursor: true })

    const noText = this.add.text(
      this.cameras.main.centerX + 80,
      this.cameras.main.centerY + 50,
      'NO',
      {
        fontFamily: 'Courier New',
        fontSize: '24px',
        color: '#66ff66',
      }
    ).setOrigin(0.5).setDepth(302)

    // Hover effects
    yesButton.on('pointerover', () => {
      yesButton.setFillStyle(0x6a3a3a)
    })

    yesButton.on('pointerout', () => {
      yesButton.setFillStyle(0x4a2a2a)
    })

    noButton.on('pointerover', () => {
      noButton.setFillStyle(0x3a6a3a)
    })

    noButton.on('pointerout', () => {
      noButton.setFillStyle(0x2a4a2a)
    })

    // Yes - go to menu
    yesButton.on('pointerdown', () => {
      overlay.destroy()
      title.destroy()
      subtitle.destroy()
      yesButton.destroy()
      yesText.destroy()
      noButton.destroy()
      noText.destroy()
      this.scene.stop('GameScene')
      this.scene.start('MainMenuScene')
    })

    // No - resume game
    noButton.on('pointerdown', () => {
      overlay.destroy()
      title.destroy()
      subtitle.destroy()
      yesButton.destroy()
      yesText.destroy()
      noButton.destroy()
      noText.destroy()

      // Resume game
      this.resumeGame()
    })
  }

  private handleHealNearby(data: { x: number; y: number; radius: number; amount: number }) {
    // Find all enemies within radius and heal them
    const nearbyEnemies = this.enemies.getNearbyEnemies(data.x, data.y, data.radius)
    nearbyEnemies.forEach(enemy => {
      enemy.heal(data.amount)
    })
  }

  private handleAllyExplosion(data: { x: number; y: number; radius: number; damage: number }) {
    // Damage all enemies within explosion radius (use getNearbyEnemies for better performance)
    const nearbyEnemies = this.enemies.getNearbyEnemies(data.x, data.y, data.radius)

    nearbyEnemies.forEach((enemy: any) => {
      enemy.takeDamage(data.damage)
    })

    // Visual shockwave
    const shockwave = this.add.circle(data.x, data.y, 10, 0xff8800, 0)
      .setStrokeStyle(2, 0xff8800, 1)
      .setDepth(46)

    this.tweens.add({
      targets: shockwave,
      radius: data.radius,
      alpha: { from: 1, to: 0 },
      duration: 400,
      ease: 'Cubic.easeOut',
      onComplete: () => shockwave.destroy(),
    })
  }

  private handleAllyRerollGenerated() {
    // Add a reroll charge
    if (this.rerollsRemaining < this.maxRerolls) {
      this.rerollsRemaining++
      this.updateRerollDisplay()

      // Show notification
      const text = this.add.text(this.cameras.main.width - 120, 60, '+1 Reroll!', {
        fontFamily: 'Courier New',
        fontSize: '16px',
        color: '#00ff00',
        fontStyle: 'bold'
      }).setDepth(100)

      this.tweens.add({
        targets: text,
        y: 40,
        alpha: { from: 1, to: 0 },
        duration: 1500,
        onComplete: () => text.destroy()
      })
    }
  }

  private updateRerollDisplay() {
    // Eclipse: Show infinity symbol if unlimited rerolls
    if (this.playerStats.unlimitedRerolls) {
      this.rerollText.setText(`↻∞`)
      this.rerollText.setColor('#ff00ff') // Purple for Eclipse
      this.rerollText.setVisible(true)
    } else {
      this.rerollText.setText(`↻${this.rerollsRemaining}`)
      this.rerollText.setColor('#00ffff') // Cyan for normal rerolls
      this.rerollText.setVisible(this.rerollsRemaining > 0 || this.maxRerolls > 0)
    }
  }

  private handleAllyEnemyProjectileHit(allyObj: Phaser.GameObjects.GameObject, projObj: Phaser.GameObjects.GameObject) {
    const ally = allyObj as any
    const projectile = projObj as any

    if (projectile.active && ally.active) {
      // Ally takes damage
      const damage = projectile.getDamage ? projectile.getDamage() : 10
      ally.takeDamage(damage)

      // Deactivate projectile
      projectile.setActive(false)
      projectile.setVisible(false)
    }
  }

  private handleAllyEnemyCollision(allyObj: Phaser.GameObjects.GameObject, enemObj: Phaser.GameObjects.GameObject) {
    const ally = allyObj as any
    const enemy = enemObj as any

    if (!ally.active || !enemy.active || !ally.getType) return

    const allyType = ally.getType()

    // Get ally config for tracking name
    const allyConfig = ALLY_CONFIGS[allyType]
    const allyTrackingName = `Ally - ${allyConfig.name}`

    if (allyType === AllyType.WALL) {
      // Wall ally dies instantly on contact with enemy, triggering explosion
      ally.takeDamage(999)
      // Also damage the enemy
      const wallDamage = 50
      enemy.takeDamage(wallDamage)

      // Track damage dealt
      this.totalDamageDealt += wallDamage
      this.damageTrackingWindow.push({ timestamp: this.time.now, damage: wallDamage })
      this.trackWeaponDamage(allyTrackingName, wallDamage)
    } else if (allyType === AllyType.WINGMAN || allyType === AllyType.RANGED) {
      // Combat allies take damage from collision (with cooldown to prevent frame-by-frame damage)
      if (ally.canTakeCollisionDamage && ally.canTakeCollisionDamage(this.time.now)) {
        ally.takeDamage(20)
        // Also damage the enemy a small amount
        const allyDamage = 10
        enemy.takeDamage(allyDamage)

        // Track damage dealt
        this.totalDamageDealt += allyDamage
        this.damageTrackingWindow.push({ timestamp: this.time.now, damage: allyDamage })
        this.trackWeaponDamage(allyTrackingName, allyDamage)
      }
    }
  }

  private handleAllyDied(data: { x: number; y: number; type: AllyType }) {
    // Only respawn Gun Buddy and Wingman allies, not building upgrade allies
    const shouldRespawn = data.type === AllyType.WINGMAN

    if (shouldRespawn) {
      // Generate a unique key for this ally type
      const allyKey = `${data.type}_respawn`

      // Set respawn timer (5 seconds from now)
      this.allyRespawnTimers.set(allyKey, this.time.now + this.allyRespawnDelay)

      // Show respawn notification
      const text = this.add.text(data.x, data.y, 'Ally Down!\nRespawning...', {
        fontFamily: 'Courier New',
        fontSize: '14px',
        color: '#ffaa00',
        align: 'center',
        stroke: '#000000',
        strokeThickness: 2
      }).setOrigin(0.5).setDepth(100)

      this.tweens.add({
        targets: text,
        y: data.y - 50,
        alpha: { from: 1, to: 0 },
        duration: 2000,
        onComplete: () => text.destroy()
      })
    }
  }

  private respawnAutoRespawnAllies() {
    // Only respawn Gun Buddy and Wingman allies (not building allies)
    // This method is called when allies auto-respawn after death

    // Get current ally counts
    const gunBuddyWeapon = this.weapons.find(w => w.getConfig().type === WeaponType.GUN_BUDDY)
    const gunBuddyCount = gunBuddyWeapon ? gunBuddyWeapon.getLevel() : 0

    const wingmanPassive = this.passives.find(p => p.getConfig().type === PassiveType.WINGMAN_PROTOCOL)
    const wingmanCount = wingmanPassive ? wingmanPassive.getLevel() * 2 : 0

    const totalRespawnAllies = gunBuddyCount + wingmanCount

    // Get existing non-respawning allies (building allies)
    const existingAllies = this.allies.getChildren().filter((a: any) => {
      return a.active && (a.getType() === AllyType.RANGED || a.getType() === AllyType.WALL || a.getType() === AllyType.REROLL)
    })

    // Clear only the wingman type allies (Gun Buddy and Wingman Protocol)
    this.allies.getChildren().forEach((a: any) => {
      if (a.active && a.getType() === AllyType.WINGMAN) {
        a.setActive(false)
        a.setVisible(false)
        if (a.body) {
          a.body.enable = false
        }
      }
    })

    // Get bonuses
    const bonuses = this.gameState.getTotalBonuses()
    const allyDamageMultiplier = 1 + (bonuses.allyDamage || 0)
    const allyFireRateMultiplier = 1 + (bonuses.allyRangedRate || 0)

    let totalAlliesSpawned = existingAllies.length
    const totalAllies = totalRespawnAllies + existingAllies.length

    // Spawn Gun Buddy allies
    for (let i = 0; i < gunBuddyCount; i++) {
      const formation = this.calculateAllyFormation(totalAlliesSpawned, totalAllies)
      const ally = this.allies.spawnAlly(
        this.player.x + formation.x,
        this.player.y + formation.y,
        AllyType.WINGMAN,
        allyDamageMultiplier,
        allyFireRateMultiplier * 1.5
      )

      if (ally) {
        ally.setFormationOffset(formation.x, formation.y)
      }
      totalAlliesSpawned++
    }

    // Spawn Wingman Protocol allies
    for (let i = 0; i < wingmanCount; i++) {
      const formation = this.calculateAllyFormation(totalAlliesSpawned, totalAllies)
      const ally = this.allies.spawnAlly(
        this.player.x + formation.x,
        this.player.y + formation.y,
        AllyType.WINGMAN,
        allyDamageMultiplier,
        allyFireRateMultiplier
      )

      if (ally) {
        ally.setFormationOffset(formation.x, formation.y)
      }
      totalAlliesSpawned++
    }
  }

  updateAllies() {
    // First clear all existing allies
    this.allies.clearAll()

    // Get building bonuses for ally stats and counts
    const bonuses = this.gameState.getTotalBonuses()
    const allyDamageMultiplier = 1 + (bonuses.allyDamage || 0)
    const allyFireRateMultiplier = 1 + (bonuses.allyRangedRate || 0)
    const allyWallDamageMultiplier = 1 + (bonuses.allyWallDamage || 0)
    const rerollAllyRateMultiplier = 1 + (bonuses.rerollAllyRate || 0)

    let totalAlliesSpawned = 0

    // Count wingman allies from WINGMAN_PROTOCOL passive
    const wingmanPassive = this.passives.find(p => p.getConfig().type === PassiveType.WINGMAN_PROTOCOL)
    const wingmanCount = wingmanPassive ? wingmanPassive.getLevel() * 2 : 0  // 2 wingmen per level

    // Count Gun Buddy allies (visual allies from Gun Buddy weapon)
    const gunBuddyWeapon = this.weapons.find(w => w.getConfig().type === WeaponType.GUN_BUDDY)
    const gunBuddyCount = gunBuddyWeapon ? gunBuddyWeapon.getLevel() : 0  // 1 per level

    // Count ranged allies from building upgrades
    const rangedAllyUnlocked = (bonuses.allyRangedUnlocked || 0) > 0
    // ALLY_RANGED_UNLOCK grants 1 base ally, ALLY_RANGED_COUNT adds additional allies
    const rangedAllyCount = rangedAllyUnlocked ? (1 + (bonuses.allyRangedCount || 0)) : 0

    // Count wall allies from building upgrades
    const wallAllyCount = bonuses.allyWallCount || 0

    // Count reroll allies from building upgrades
    const rerollAllyUnlocked = (bonuses.rerollAllyUnlocked || 0) > 0
    const rerollAllyCount = rerollAllyUnlocked ? 1 : 0  // Only 1 reroll ally max


    // Total allies to spawn
    const totalAllies = wingmanCount + gunBuddyCount + rangedAllyCount + wallAllyCount + rerollAllyCount

    // Spawn wingman allies
    for (let i = 0; i < wingmanCount; i++) {
      const formation = this.calculateAllyFormation(totalAlliesSpawned, totalAllies)
      const ally = this.allies.spawnAlly(
        this.player.x + formation.x,
        this.player.y + formation.y,
        AllyType.WINGMAN,
        allyDamageMultiplier,
        allyFireRateMultiplier
      )

      if (ally) {
        ally.setFormationOffset(formation.x, formation.y)
      }
      totalAlliesSpawned++
    }

    // Spawn Gun Buddy allies (visual allies from Gun Buddy weapon)
    for (let i = 0; i < gunBuddyCount; i++) {
      const formation = this.calculateAllyFormation(totalAlliesSpawned, totalAllies)
      const ally = this.allies.spawnAlly(
        this.player.x + formation.x,
        this.player.y + formation.y,
        AllyType.WINGMAN,  // Use wingman type for gun buddies
        allyDamageMultiplier,
        allyFireRateMultiplier * 1.5  // Gun buddies shoot faster
      )

      if (ally) {
        ally.setFormationOffset(formation.x, formation.y)
      }
      totalAlliesSpawned++
    }

    // Spawn ranged allies
    for (let i = 0; i < rangedAllyCount; i++) {
      const formation = this.calculateAllyFormation(totalAlliesSpawned, totalAllies)
      const ally = this.allies.spawnAlly(
        this.player.x + formation.x,
        this.player.y + formation.y,
        AllyType.RANGED,
        allyDamageMultiplier,
        allyFireRateMultiplier
      )

      if (ally) {
        ally.setFormationOffset(formation.x, formation.y)
      }
      totalAlliesSpawned++
    }

    // Spawn wall allies
    for (let i = 0; i < wallAllyCount; i++) {
      const formation = this.calculateAllyFormation(totalAlliesSpawned, totalAllies)
      const ally = this.allies.spawnAlly(
        this.player.x + formation.x,
        this.player.y + formation.y,
        AllyType.WALL,
        allyWallDamageMultiplier,
        1.0  // Wall allies don't shoot
      )

      if (ally) {
        ally.setFormationOffset(formation.x, formation.y)
      }
      totalAlliesSpawned++
    }

    // Spawn reroll ally
    for (let i = 0; i < rerollAllyCount; i++) {
      const formation = this.calculateAllyFormation(totalAlliesSpawned, totalAllies)
      const ally = this.allies.spawnAlly(
        this.player.x + formation.x,
        this.player.y + formation.y,
        AllyType.REROLL,
        1.0,  // Reroll allies don't deal damage
        rerollAllyRateMultiplier
      )

      if (ally) {
        ally.setFormationOffset(formation.x, formation.y)
      }
      totalAlliesSpawned++
    }
  }

  private calculateAllyFormation(index: number, totalCount: number): { x: number, y: number } {
    // Position allies in a wing formation to the left and right of the player
    const spacing = 60
    const verticalOffset = -20  // Slightly behind player

    if (totalCount === 1) {
      // Single ally - position to the left
      return { x: -spacing, y: verticalOffset }
    } else if (totalCount === 2) {
      // Two allies - one on each side
      return index === 0
        ? { x: -spacing, y: verticalOffset }
        : { x: spacing, y: verticalOffset }
    } else {
      // Multiple allies - alternate left and right
      const side = index % 2 === 0 ? -1 : 1
      const row = Math.floor(index / 2)
      return {
        x: side * (spacing + row * 20),
        y: verticalOffset - row * 30
      }
    }
  }

  private getTrackName(trackNumber: number): string {
    const trackNames = [
      'Whispers from a Forgotten Console',
      'Beyond the Pixelated Horizon',
      'The Gentle Descent into the Cosmic Ruin',
      'A Lullaby for the Digital Sun',
      'Searching for a Signal in the Void',
      'The Solitary Synth\'s Cosmic Hymn',
      'The Surveyor\'s Quiet, Amiga Reverie',
      'The Echo of a Lost Binary Heart',
      'Reaching for the Starlight Echo',
      'Through the Whispering Data Streams',
      'The Ambient Glitch of a Fading Past',
      'A Soft, Slow Journey through the Nebula',
      'The Coded Serenity of the Ancient Star',
      'Finding the Heart of the Digital Ruins',
      'The Ethereal Rhythm of the Cosmic Dust',
      'A Quiet Contemplation on a Ghostly Starfield',
      'The Architect\'s Final Mod Symphony',
      'Uncovering the Sunken Astro-Beacon',
      'The Gentle Drift to the Crystal Maze',
      'A Circuitry Dream on a Distant Shore'
    ]
    return trackNames[trackNumber - 1]
  }

  private loadAndPlayMusic(trackNumber: number) {
    const trackNumberStr = trackNumber.toString().padStart(3, '0')
    const trackName = this.getTrackName(trackNumber)
    const trackKey = `bgm-${trackNumber}`

    // Check if track is already loaded
    if (this.cache.audio.exists(trackKey)) {
      // Already loaded, play immediately
      this.bgMusic = this.sound.add(trackKey, {
        loop: true,
        volume: soundManager.getMusicVolume() * soundManager.getMasterVolume()
      })
      if (!soundManager.isMuted()) {
        this.bgMusic.play()
      }

      // Start lazy loading other tracks in background
      this.lazyLoadRemainingTracks(trackNumber)
    } else {
      // Need to load this track first
      console.log(`[Music] Loading track ${trackNumber}: ${trackName}`)

      this.load.audio(trackKey, `assets/audio/8 Bit atmosphere/8 Bit atmosphere - ${trackNumberStr} - ${trackName}.mp3`)

      this.load.once('complete', () => {
        console.log(`[Music] Track ${trackNumber} loaded, playing now`)
        this.bgMusic = this.sound.add(trackKey, {
          loop: true,
          volume: soundManager.getMusicVolume() * soundManager.getMasterVolume()
        })
        if (!soundManager.isMuted()) {
          this.bgMusic.play()
        }

        // Start lazy loading other tracks in background
        this.lazyLoadRemainingTracks(trackNumber)
      })

      this.load.once('loaderror', (file: any) => {
        console.error(`[Music] Failed to load track ${trackNumber}:`, file)
        // Game continues without music
      })

      this.load.start()
    }
  }

  private lazyLoadRemainingTracks(excludeTrack: number) {
    // Lazy load the remaining 19 tracks in the background
    // This allows the game to start immediately while music loads progressively
    console.log('[Music] Starting background lazy load of remaining tracks')

    let tracksToLoad: number[] = []
    for (let i = 1; i <= 20; i++) {
      if (i !== excludeTrack && !this.cache.audio.exists(`bgm-${i}`)) {
        tracksToLoad.push(i)
      }
    }

    // Load tracks one at a time to avoid overwhelming the network
    const loadNextTrack = () => {
      if (tracksToLoad.length === 0) {
        console.log('[Music] All tracks loaded')
        return
      }

      const trackNumber = tracksToLoad.shift()!
      const trackNumberStr = trackNumber.toString().padStart(3, '0')
      const trackName = this.getTrackName(trackNumber)
      const trackKey = `bgm-${trackNumber}`

      this.load.audio(trackKey, `assets/audio/8 Bit atmosphere/8 Bit atmosphere - ${trackNumberStr} - ${trackName}.mp3`)

      this.load.once('filecomplete', () => {
        console.log(`[Music] Background loaded: track ${trackNumber}`)
        // Load next track after a short delay to avoid blocking
        this.time.delayedCall(500, loadNextTrack)
      })

      this.load.once('loaderror', () => {
        console.warn(`[Music] Failed to load track ${trackNumber}, skipping`)
        // Continue with next track
        this.time.delayedCall(500, loadNextTrack)
      })

      this.load.start()
    }

    // Start loading after a 2 second delay to let the game settle
    this.time.delayedCall(2000, loadNextTrack)
  }

  shutdown() {
    // Clean up event listeners
    this.events.off('enemyDied', this.handleEnemyDied, this)
    this.events.off('xpCollected', this.handleXPCollected, this)
    this.events.off('creditCollected', this.handleCreditCollected, this)
    this.events.off('enemyExplosion', this.handleEnemyExplosion, this)
    this.events.off('enemySplit', this.handleEnemySplit, this)
    this.events.off('healNearbyEnemies', this.handleHealNearby, this)
    this.events.off('allyExplosion', this.handleAllyExplosion, this)
    this.events.off('allyRerollGenerated', this.handleAllyRerollGenerated, this)
    this.events.off('allyDied', this.handleAllyDied, this)

    // Clear ally respawn timers
    this.allyRespawnTimers.clear()

    // Remove all pending delayed calls to prevent callbacks after shutdown
    this.time.removeAllEvents()

    // Stop all tweens
    this.starFieldTweens.forEach(tween => {
      if (tween && !tween.isDestroyed()) {
        tween.stop()
      }
    })
    this.starFieldTweens = []

    // Clear arrays
    this.weapons = []
    this.passives = []
    this.frostHasteExpireTimes = []
    this.damageTrackingWindow = []
    this.healthTrackingWindow = []
    this.gameOverUI = []

    // Clear buff displays and destroy visual elements
    this.buffDisplays.forEach((display) => {
      display.bg.destroy()
      display.fill.destroy()
      display.icon.destroy()
    })
    this.buffDisplays.clear()

    // Clear discovered evolutions
    this.discoveredEvolutions.clear()

    // Destroy groups (will clean up all children)
    if (this.projectiles) {
      this.projectiles.clear(true, true)
    }
    if (this.enemies) {
      this.enemies.clear(true, true)
    }
    if (this.allies) {
      this.allies.clear(true, true)
    }
    if (this.enemyProjectiles) {
      this.enemyProjectiles.clear(true, true)
    }
    if (this.xpDrops) {
      this.xpDrops.clear(true, true)
    }
    if (this.creditDrops) {
      this.creditDrops.clear(true, true)
    }
    if (this.powerUps) {
      this.powerUps.clear(true, true)
    }

    // Clear damage zones
    this.damageZones.forEach(zone => zone.destroy())
    this.damageZones = []
  }
}

// DamageZone class - represents a persistent damage area on the ground
class DamageZone {
  private scene: Phaser.Scene
  private x: number
  private y: number
  private radius: number
  private damage: number
  private duration: number
  private tickRate: number
  private creationTime: number
  private lastTickTime: number
  private visual: Phaser.GameObjects.Arc
  private pulseAnim?: Phaser.Tweens.Tween
  private onDamageCallback?: (x: number, y: number, damage: number) => void

  constructor(scene: Phaser.Scene, x: number, y: number, radius: number, damage: number, duration: number, tickRate: number = 500, onDamageCallback?: (x: number, y: number, damage: number) => void) {
    this.scene = scene
    this.x = x
    this.y = y
    this.radius = radius
    this.damage = damage
    this.duration = duration
    this.tickRate = tickRate
    this.creationTime = scene.time.now
    this.lastTickTime = scene.time.now
    this.onDamageCallback = onDamageCallback

    // Create visual effect - pulsing circle
    this.visual = scene.add.circle(x, y, radius, 0x88ff88, 0.4)
    this.visual.setDepth(5)

    // Add pulsing animation
    this.pulseAnim = scene.tweens.add({
      targets: this.visual,
      alpha: 0.2,
      scale: 1.1,
      duration: 800,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut'
    })
  }

  update(currentTime: number, enemies: any): boolean {
    // Check if zone should expire
    if (currentTime >= this.creationTime + this.duration) {
      return false // Zone expired
    }

    // Check if it's time to deal damage
    if (currentTime >= this.lastTickTime + this.tickRate) {
      this.lastTickTime = currentTime
      this.damageEnemiesInZone(enemies)
    }

    return true // Zone still active
  }

  private damageEnemiesInZone(enemies: any) {
    enemies.getChildren().forEach((enemy: any) => {
      if (enemy.active && enemy.body) {
        const distance = Phaser.Math.Distance.Between(this.x, this.y, enemy.x, enemy.y)
        if (distance <= this.radius) {
          enemy.takeDamage(this.damage)
          // Show damage number if callback is provided
          if (this.onDamageCallback) {
            this.onDamageCallback(enemy.x, enemy.y, this.damage)
          }
        }
      }
    })
  }

  destroy() {
    if (this.pulseAnim) {
      this.pulseAnim.stop()
    }
    if (this.visual) {
      this.visual.destroy()
    }
  }

  getPosition(): { x: number, y: number } {
    return { x: this.x, y: this.y }
  }
}
