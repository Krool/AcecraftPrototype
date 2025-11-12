import Phaser from 'phaser'
import { EnemyProjectileGroup } from './EnemyProjectile'
import { soundManager, SoundType } from './SoundManager'

export enum EnemyType {
  // Basic enemies
  DRONE = 'DRONE',           // Fodder - flies straight, fires single shots
  WASP = 'WASP',            // Flanker - fast zigzag arcs
  TANK = 'TANK',            // Brawler - slow, high HP, wide spread fire
  SNIPER = 'SNIPER',        // Precision - charges and fires aimed shots
  SWARMER = 'SWARMER',      // Mob - travels in clusters
  HEALER = 'HEALER',        // Support - heals nearby enemies
  ORBITER = 'ORBITER',      // Field control - circles player
  BOMBER = 'BOMBER',        // Burst - approaches then explodes
  SPLITTER = 'SPLITTER',    // Splits into smaller enemies on death
  HUNTER = 'HUNTER',        // Actively tracks and shoots at player
  TURRET = 'TURRET',        // Stationary, shoots downward
  CHARGER = 'CHARGER',      // Charges at player rapidly
  MINI_BOSS = 'MINI_BOSS',  // Mini-boss with high HP and multi-phase
  BOSS = 'BOSS',            // Level boss with very high HP and complex mechanics
  SPIRAL_SHOOTER = 'SPIRAL_SHOOTER', // Fires projectiles in spiral pattern
  SPAWNER = 'SPAWNER',      // Spawns smaller units periodically
  PATROLLER = 'PATROLLER',  // Patrols left and right
  SHIELDED = 'SHIELDED',    // Has shield that blocks projectiles from below
  EXPLODER = 'EXPLODER',    // Explodes on death damaging everything
  GOLDEN = 'GOLDEN',        // Golden pinata - drops extra credits

  // Level-specific bosses
  SCOUT_COMMANDER = 'SCOUT_COMMANDER',       // Level 1 boss
  TANK_TWIN = 'TANK_TWIN',                   // Level 2 boss (spawns in pairs)
  HIVE_QUEEN = 'HIVE_QUEEN',                 // Level 3 boss
  HIVE_EGG = 'HIVE_EGG',                     // Level 3 boss eggs
  ORBITAL_DEVASTATOR = 'ORBITAL_DEVASTATOR', // Level 4 boss
  ORBITAL_SHIELD = 'ORBITAL_SHIELD',         // Level 4 boss shields
  FRACTURED_TITAN = 'FRACTURED_TITAN',       // Level 5 boss
  FRACTURED_MEDIUM = 'FRACTURED_MEDIUM',     // Level 5 boss split
  FRACTURED_SMALL = 'FRACTURED_SMALL',       // Level 5 boss split
  SHIELD_WARDEN = 'SHIELD_WARDEN',           // Level 6 boss
  PROTOTYPE_BOMBER = 'PROTOTYPE_BOMBER',     // Level 7 mini-boss
  ACE_BOMBER = 'ACE_BOMBER',                 // Level 7 boss
  ESCORT_BOMBER = 'ESCORT_BOMBER',           // Level 7 boss support
  VOID_HERALD = 'VOID_HERALD',               // Level 8 mini-boss
  VOID_NEXUS = 'VOID_NEXUS',                 // Level 8 boss
  SIEGE_ENGINE = 'SIEGE_ENGINE',             // Level 9 boss
  SIEGE_TURRET = 'SIEGE_TURRET',             // Level 9 boss turrets
  ASSAULT_CRUISER = 'ASSAULT_CRUISER',       // Level 10 mini-boss 1
  BATTLE_COORDINATOR = 'BATTLE_COORDINATOR', // Level 10 mini-boss 2
  MOTHERSHIP_OMEGA = 'MOTHERSHIP_OMEGA',     // Level 10 final boss
  WEAPON_PORT = 'WEAPON_PORT',               // Level 10 boss parts
}

export interface EnemyBehavior {
  shootsBack: boolean
  shootInterval?: number
  movementPattern: 'straight' | 'zigzag' | 'circle' | 'stationary' | 'charge' | 'sinwave' | 'patrol'
  specialAbility?: string
}

export interface EnemyTypeConfig {
  symbol: string
  color: string
  fontSize: string
  health: number
  speed: number
  xpValue: number
  behavior: EnemyBehavior
  scoreValue: number
  creditValue?: number // Optional credit value for special enemies like golden
  name?: string
}

export const ENEMY_CONFIGS: Record<EnemyType, EnemyTypeConfig> = {
  [EnemyType.DRONE]: {
    symbol: '<o>',
    color: '#ff3333',
    fontSize: '36px',
    health: 20, // Reduced by 25% from 27 (originally 60, reduced by 40%, then by 25%, then by 25% again)
    speed: 84, // Reduced by 30% (was 120)
    xpValue: 2,
    scoreValue: 8,
    behavior: {
      shootsBack: false, // Fodder enemy - no shooting
      movementPattern: 'straight',
    },
  },
  [EnemyType.WASP]: {
    symbol: 'vv',
    color: '#ff3333',
    fontSize: '42px',
    health: 32, // Reduced by 25% from 42
    speed: 126, // Reduced by 30% (was 180)
    xpValue: 4,
    scoreValue: 15,
    behavior: {
      shootsBack: false,
      movementPattern: 'zigzag',
    },
  },
  [EnemyType.TANK]: {
    symbol: '[■]',
    color: '#ff3333',
    fontSize: '60px',
    health: 210, // Reduced by 25% from 280
    speed: 42, // Reduced by 30% (was 60)
    xpValue: 10,
    scoreValue: 50,
    behavior: {
      shootsBack: true,
      shootInterval: 2500, // Reduced attack speed by 40% (was 1500)
      movementPattern: 'straight',
      specialAbility: 'spread_fire',
    },
  },
  [EnemyType.SNIPER]: {
    symbol: '<+>',
    color: '#ff3333',
    fontSize: '48px',
    health: 63, // Reduced by 25% from 84
    speed: 56, // Reduced by 30% (was 80)
    xpValue: 6,
    scoreValue: 30,
    behavior: {
      shootsBack: true,
      shootInterval: 5000, // Reduced attack speed by 40% (was 3000)
      movementPattern: 'straight',
      specialAbility: 'charged_shot',
    },
  },
  [EnemyType.SWARMER]: {
    symbol: '>x<',
    color: '#ff3333',
    fontSize: '30px',
    health: 21, // Reduced by 25% from 28
    speed: 98, // Reduced by 30% (was 140)
    xpValue: 3,
    scoreValue: 8,
    behavior: {
      shootsBack: false,
      movementPattern: 'sinwave',
      specialAbility: 'chain_death',
    },
  },
  [EnemyType.HEALER]: {
    symbol: '{H}',
    color: '#ff3333',
    fontSize: '48px',
    health: 84, // Reduced by 25% from 112
    speed: 63, // Reduced by 30% (was 90)
    xpValue: 8,
    scoreValue: 40,
    behavior: {
      shootsBack: false,
      movementPattern: 'straight',
      specialAbility: 'heal_nearby',
    },
  },
  [EnemyType.ORBITER]: {
    symbol: '(o)',
    color: '#ff3333',
    fontSize: '42px',
    health: 74, // Reduced by 25% from 98
    speed: 70, // Reduced by 30% (was 100)
    xpValue: 5,
    scoreValue: 25,
    behavior: {
      shootsBack: true,
      shootInterval: 4200, // Reduced attack speed by 40% (was 2500)
      movementPattern: 'circle',
    },
  },
  [EnemyType.BOMBER]: {
    symbol: ')B(',
    color: '#ff3333',
    fontSize: '54px',
    health: 53, // Reduced by 25% from 70
    speed: 84, // Reduced by 30% (was 120)
    xpValue: 7,
    scoreValue: 35,
    behavior: {
      shootsBack: false,
      movementPattern: 'straight',
      specialAbility: 'explode_on_death',
    },
  },
  [EnemyType.SPLITTER]: {
    symbol: '<◆>',
    color: '#ff3333',
    fontSize: '48px',
    health: 95, // Reduced by 25% from 126
    speed: 49, // Reduced by 30% (was 70)
    xpValue: 7,
    scoreValue: 32,
    behavior: {
      shootsBack: false,
      movementPattern: 'straight',
      specialAbility: 'split_on_death',
    },
  },
  [EnemyType.HUNTER]: {
    symbol: '>>►',
    color: '#ff3333',
    fontSize: '45px',
    health: 74, // Reduced by 25% from 98
    speed: 105, // Reduced by 30% (was 150)
    xpValue: 5,
    scoreValue: 28,
    behavior: {
      shootsBack: true,
      shootInterval: 3000, // Reduced attack speed by 40% (was 1800)
      movementPattern: 'charge',
    },
  },
  [EnemyType.TURRET]: {
    symbol: '/▲\\',
    color: '#ff3333',
    fontSize: '54px',
    health: 126, // Reduced by 25% from 168
    speed: 35, // Slow moving turret (slowest enemy)
    xpValue: 5,
    scoreValue: 22,
    behavior: {
      shootsBack: true,
      shootInterval: 1700, // Reduced attack speed by 40% (was 1000)
      movementPattern: 'straight', // Changed from stationary - must move down screen
    },
  },
  [EnemyType.CHARGER]: {
    symbol: '»»»',
    color: '#ff3333',
    fontSize: '48px',
    health: 59, // Reduced by 25% from 78
    speed: 154, // Reduced by 30% (was 220)
    xpValue: 4,
    scoreValue: 20,
    behavior: {
      shootsBack: false,
      movementPattern: 'charge',
    },
  },
  [EnemyType.SPIRAL_SHOOTER]: {
    symbol: '@*@',
    color: '#ff3333',
    fontSize: '52px',
    health: 105, // Reduced by 25% from 140
    speed: 50,
    xpValue: 8,
    scoreValue: 40,
    behavior: {
      shootsBack: true,
      shootInterval: 1350, // Reduced attack speed by 40% (was 800)
      movementPattern: 'straight',
      specialAbility: 'spiral_fire',
    },
  },
  [EnemyType.SPAWNER]: {
    symbol: '[*]',
    color: '#ff3333',
    fontSize: '64px',
    health: 158, // Reduced by 25% from 210
    speed: 35,
    xpValue: 10,
    scoreValue: 60,
    behavior: {
      shootsBack: false,
      movementPattern: 'straight',
      specialAbility: 'spawn_minions',
    },
  },
  [EnemyType.PATROLLER]: {
    symbol: '<=>',
    color: '#ff3333',
    fontSize: '42px',
    health: 74, // Reduced by 25% from 98
    speed: 70,
    xpValue: 5,
    scoreValue: 25,
    behavior: {
      shootsBack: true,
      shootInterval: 3350, // Reduced attack speed by 40% (was 2000)
      movementPattern: 'patrol',
    },
  },
  [EnemyType.SHIELDED]: {
    symbol: '[▼]',
    color: '#ff3333',
    fontSize: '54px',
    health: 126, // Reduced by 25% from 168
    speed: 60,
    xpValue: 9,
    scoreValue: 45,
    behavior: {
      shootsBack: true,
      shootInterval: 2700, // Reduced attack speed by 40% (was 1600)
      movementPattern: 'straight',
      specialAbility: 'shield',
    },
  },
  [EnemyType.EXPLODER]: {
    symbol: '(!))',
    color: '#ff3333',
    fontSize: '48px',
    health: 63, // Reduced by 25% from 84
    speed: 90,
    xpValue: 6,
    scoreValue: 35,
    behavior: {
      shootsBack: false,
      movementPattern: 'charge',
      specialAbility: 'area_explode',
    },
  },
  [EnemyType.MINI_BOSS]: {
    symbol: '▓▓▓',
    color: '#ff0000',
    fontSize: '64px',
    health: 1400, // Reduced by 50% from 2800 (originally 5600, reduced by 50%, then by 50% again)
    speed: 40,
    xpValue: 30,
    scoreValue: 200,
    behavior: {
      shootsBack: true,
      shootInterval: 1350, // Reduced attack speed by 40% (was 800)
      movementPattern: 'sinwave',
      specialAbility: 'mini_boss',
    },
  },
  [EnemyType.BOSS]: {
    symbol: '█████',
    color: '#ff00ff',
    fontSize: '96px',
    health: 3500, // Reduced by 50% from 7000 (originally 14000, reduced by 50%, then by 50% again)
    speed: 30,
    xpValue: 80,
    scoreValue: 1000,
    name: 'ANNIHILATOR',
    behavior: {
      shootsBack: true,
      shootInterval: 850, // Reduced attack speed by 40% (was 500)
      movementPattern: 'sinwave',
      specialAbility: 'boss_barrage',
    },
  },
  [EnemyType.GOLDEN]: {
    symbol: '¤',
    color: '#ffd700',
    fontSize: '32px',
    health: 30,
    speed: 120,
    xpValue: 0, // No XP, only credits
    scoreValue: 100,
    creditValue: 50, // Drops lots of credits
    behavior: {
      shootsBack: false,
      movementPattern: 'zigzag',
    },
  },

  // ==================== LEVEL-SPECIFIC BOSSES ====================

  // Level 1 Boss: Scout Commander
  [EnemyType.SCOUT_COMMANDER]: {
    symbol: '◈◈◈',
    color: '#ff6600',
    fontSize: '72px',
    health: 800,
    speed: 60,
    xpValue: 50,
    scoreValue: 300,
    name: 'SCOUT COMMANDER',
    behavior: {
      shootsBack: true,
      shootInterval: 1200,
      movementPattern: 'sinwave',
      specialAbility: 'scout_swoop',
    },
  },

  // Level 2 Boss: Tank Twin (spawns in pairs)
  [EnemyType.TANK_TWIN]: {
    symbol: '[■■]',
    color: '#cc0000',
    fontSize: '68px',
    health: 600,
    speed: 45,
    xpValue: 40,
    scoreValue: 250,
    name: 'TANK TWIN',
    behavior: {
      shootsBack: true,
      shootInterval: 1000,
      movementPattern: 'patrol',
      specialAbility: 'twin_link',
    },
  },

  // Level 3 Boss: Hive Queen
  [EnemyType.HIVE_QUEEN]: {
    symbol: '♛♛♛',
    color: '#9900ff',
    fontSize: '88px',
    health: 1200,
    speed: 0,
    xpValue: 60,
    scoreValue: 400,
    name: 'HIVE QUEEN',
    behavior: {
      shootsBack: false,
      movementPattern: 'stationary',
      specialAbility: 'hive_spawn',
    },
  },

  [EnemyType.HIVE_EGG]: {
    symbol: '(◉)',
    color: '#cc00ff',
    fontSize: '48px',
    health: 150,
    speed: 0,
    xpValue: 5,
    scoreValue: 20,
    behavior: {
      shootsBack: false,
      movementPattern: 'stationary',
      specialAbility: 'egg_shield',
    },
  },

  // Level 4 Boss: Orbital Devastator
  [EnemyType.ORBITAL_DEVASTATOR]: {
    symbol: '◎◎◎',
    color: '#00ccff',
    fontSize: '80px',
    health: 1400,
    speed: 35,
    xpValue: 70,
    scoreValue: 450,
    name: 'ORBITAL DEVASTATOR',
    behavior: {
      shootsBack: true,
      shootInterval: 1500,
      movementPattern: 'circle',
      specialAbility: 'orbital_laser',
    },
  },

  [EnemyType.ORBITAL_SHIELD]: {
    symbol: '◐',
    color: '#0099cc',
    fontSize: '36px',
    health: 100,
    speed: 0,
    xpValue: 3,
    scoreValue: 10,
    behavior: {
      shootsBack: false,
      movementPattern: 'stationary',
      specialAbility: 'shield_orbit',
    },
  },

  // Level 5 Boss: Fractured Titan
  [EnemyType.FRACTURED_TITAN]: {
    symbol: '╬╬╬',
    color: '#ff0099',
    fontSize: '92px',
    health: 1600,
    speed: 40,
    xpValue: 80,
    scoreValue: 500,
    name: 'FRACTURED TITAN',
    behavior: {
      shootsBack: true,
      shootInterval: 900,
      movementPattern: 'sinwave',
      specialAbility: 'fracture_split',
    },
  },

  [EnemyType.FRACTURED_MEDIUM]: {
    symbol: '╬╬',
    color: '#ff0099',
    fontSize: '64px',
    health: 400,
    speed: 60,
    xpValue: 15,
    scoreValue: 50,
    behavior: {
      shootsBack: true,
      shootInterval: 800,
      movementPattern: 'zigzag',
      specialAbility: 'fracture_split',
    },
  },

  [EnemyType.FRACTURED_SMALL]: {
    symbol: '╬',
    color: '#ff0099',
    fontSize: '42px',
    health: 150,
    speed: 90,
    xpValue: 8,
    scoreValue: 25,
    behavior: {
      shootsBack: true,
      shootInterval: 700,
      movementPattern: 'charge',
      specialAbility: 'none',
    },
  },

  // Level 6 Boss: Shield Warden
  [EnemyType.SHIELD_WARDEN]: {
    symbol: '✦✦✦',
    color: '#ffcc00',
    fontSize: '84px',
    health: 1800,
    speed: 30,
    xpValue: 90,
    scoreValue: 550,
    name: 'SHIELD WARDEN',
    behavior: {
      shootsBack: true,
      shootInterval: 1100,
      movementPattern: 'sinwave',
      specialAbility: 'pulsing_shield',
    },
  },

  // Level 7 Bosses: Bomber Squadron
  [EnemyType.PROTOTYPE_BOMBER]: {
    symbol: '►B◄',
    color: '#ff9900',
    fontSize: '68px',
    health: 1000,
    speed: 55,
    xpValue: 50,
    scoreValue: 300,
    name: 'PROTOTYPE BOMBER',
    behavior: {
      shootsBack: true,
      shootInterval: 1300,
      movementPattern: 'patrol',
      specialAbility: 'explosive_trail',
    },
  },

  [EnemyType.ACE_BOMBER]: {
    symbol: '►►B◄◄',
    color: '#ff3300',
    fontSize: '86px',
    health: 2000,
    speed: 50,
    xpValue: 100,
    scoreValue: 600,
    name: 'ACE BOMBER',
    behavior: {
      shootsBack: true,
      shootInterval: 1000,
      movementPattern: 'sinwave',
      specialAbility: 'bombing_run',
    },
  },

  [EnemyType.ESCORT_BOMBER]: {
    symbol: '►b◄',
    color: '#ff6600',
    fontSize: '58px',
    health: 600,
    speed: 60,
    xpValue: 30,
    scoreValue: 150,
    behavior: {
      shootsBack: true,
      shootInterval: 900,
      movementPattern: 'patrol',
      specialAbility: 'escort_fire',
    },
  },

  // Level 8 Bosses: Void Nexus
  [EnemyType.VOID_HERALD]: {
    symbol: '◈◈◈',
    color: '#6600cc',
    fontSize: '70px',
    health: 1200,
    speed: 45,
    xpValue: 60,
    scoreValue: 350,
    name: 'VOID HERALD',
    behavior: {
      shootsBack: true,
      shootInterval: 1100,
      movementPattern: 'sinwave',
      specialAbility: 'void_pulse',
    },
  },

  [EnemyType.VOID_NEXUS]: {
    symbol: '◉◉◉',
    color: '#3300cc',
    fontSize: '94px',
    health: 2200,
    speed: 40,
    xpValue: 120,
    scoreValue: 700,
    name: 'VOID NEXUS',
    behavior: {
      shootsBack: true,
      shootInterval: 1200,
      movementPattern: 'sinwave',
      specialAbility: 'void_teleport',
    },
  },

  // Level 9 Boss: Siege Engine
  [EnemyType.SIEGE_ENGINE]: {
    symbol: '███',
    color: '#666666',
    fontSize: '98px',
    health: 3000,
    speed: 25,
    xpValue: 150,
    scoreValue: 800,
    name: 'SIEGE ENGINE',
    behavior: {
      shootsBack: true,
      shootInterval: 800,
      movementPattern: 'straight',
      specialAbility: 'siege_phase',
    },
  },

  [EnemyType.SIEGE_TURRET]: {
    symbol: '/▲\\',
    color: '#999999',
    fontSize: '48px',
    health: 300,
    speed: 0,
    xpValue: 10,
    scoreValue: 40,
    behavior: {
      shootsBack: true,
      shootInterval: 1000,
      movementPattern: 'stationary',
      specialAbility: 'turret_fire',
    },
  },

  // Level 10 Bosses: The Final Battle
  [EnemyType.ASSAULT_CRUISER]: {
    symbol: '▬▬▬▬',
    color: '#ff00cc',
    fontSize: '76px',
    health: 1800,
    speed: 35,
    xpValue: 80,
    scoreValue: 400,
    name: 'ASSAULT CRUISER',
    behavior: {
      shootsBack: true,
      shootInterval: 900,
      movementPattern: 'sinwave',
      specialAbility: 'cruiser_barrage',
    },
  },

  [EnemyType.BATTLE_COORDINATOR]: {
    symbol: '◆◆◆◆',
    color: '#cc00ff',
    fontSize: '80px',
    health: 2000,
    speed: 40,
    xpValue: 90,
    scoreValue: 450,
    name: 'BATTLE COORDINATOR',
    behavior: {
      shootsBack: true,
      shootInterval: 1000,
      movementPattern: 'circle',
      specialAbility: 'coordinate_strike',
    },
  },

  [EnemyType.MOTHERSHIP_OMEGA]: {
    symbol: '▓▓▓▓▓',
    color: '#ff0000',
    fontSize: '120px',
    health: 5000,
    speed: 20,
    xpValue: 200,
    scoreValue: 1500,
    name: 'MOTHERSHIP OMEGA',
    behavior: {
      shootsBack: true,
      shootInterval: 600,
      movementPattern: 'sinwave',
      specialAbility: 'omega_phase',
    },
  },

  [EnemyType.WEAPON_PORT]: {
    symbol: '[◈]',
    color: '#cc0000',
    fontSize: '44px',
    health: 250,
    speed: 0,
    xpValue: 8,
    scoreValue: 30,
    behavior: {
      shootsBack: true,
      shootInterval: 1200,
      movementPattern: 'stationary',
      specialAbility: 'port_fire',
    },
  },
}

export class Enemy extends Phaser.GameObjects.Text {
  private maxHealth: number
  private currentHealth: number
  private speed: number
  private xpValue: number
  private scoreValue: number
  private enemyType: EnemyType
  private originalColor: string
  private behavior: EnemyBehavior
  private lastShotTime: number = 0
  private spawnTime: number = 0
  private zigzagTime: number = 0
  private circleAngle: number = 0
  private playerRef: Phaser.GameObjects.GameObject | null = null
  private enemyProjectiles: EnemyProjectileGroup | null = null
  private isCharging: boolean = false
  private healPulseTime: number = 0
  // New properties for special enemies
  private spiralAngle: number = 0
  private lastSpawnTime: number = 0
  private patrolDirection: number = 1 // 1 = right, -1 = left
  private patrolStartX: number = 0
  private patrolRange: number = 150
  public shield: Phaser.GameObjects.Arc | null = null
  private config: EnemyTypeConfig
  private colorResetTimer: Phaser.Time.TimerEvent | null = null
  // Status effects
  private statusEffects = {
    isBurning: false,
    burnEndTime: 0,
    isFrozen: false,
    freezeEndTime: 0,
    isPoisoned: false,
    poisonEndTime: 0,
    isBleeding: false,
    bleedEndTime: 0,
    bleedStacks: 0 // HEMORRHAGE stacks for damage amplification
  }

  // Boss-specific properties
  private bossPhase: number = 1
  private linkedBoss: Enemy | null = null // For Tank Twins
  private orbitalShields: Enemy[] = [] // For Orbital Devastator
  private childEnemies: Enemy[] = [] // For bosses with spawned adds
  private lastSpecialAbilityTime: number = 0
  private vulnerableUntil: number = 0 // For time-based vulnerability windows
  private teleportCooldown: number = 0
  private phaseChangeTriggered: boolean = false

  declare body: Phaser.Physics.Arcade.Body

  constructor(
    scene: Phaser.Scene,
    x: number,
    y: number,
    type: EnemyType = EnemyType.DRONE
  ) {
    const config = ENEMY_CONFIGS[type]

    super(scene, x, y, config.symbol, {
      fontFamily: 'Courier New',
      fontSize: config.fontSize,
      color: config.color,
    })

    this.setOrigin(0.5)
    this.setStroke('#000000', 2)
    this.setDepth(15) // Enemies render above enemy projectiles
    this.enemyType = type
    this.config = config
    this.originalColor = config.color
    this.maxHealth = config.health
    this.currentHealth = config.health
    this.speed = config.speed
    this.xpValue = config.xpValue
    this.scoreValue = config.scoreValue
    this.behavior = config.behavior

    // Start inactive and move off-screen to prevent collisions at 0,0
    // Note: Will be added to scene and physics by the EnemyGroup
    this.setActive(false)
    this.setVisible(false)
    this.setPosition(-1000, -1000)
  }

  setPlayerReference(player: Phaser.GameObjects.GameObject) {
    this.playerRef = player
  }

  setProjectileGroup(projectiles: EnemyProjectileGroup) {
    this.enemyProjectiles = projectiles
  }

  spawn(x: number, y: number, type?: EnemyType, wave: number = 1) {
    // Safety check: ensure scene exists
    if (!this.scene) {
      console.error('[Enemy] Cannot spawn - scene is undefined')
      this.setActive(false)
      this.setVisible(false)
      return
    }

    if (type && this.enemyType !== type) {
      // Only update if changing type
      this.enemyType = type
      const config = ENEMY_CONFIGS[type]

      try {
        // Check if text canvas is valid, if not we need to reinitialize
        // @ts-ignore - accessing internal Phaser property
        if (!this.canvas || !this.context) {
          // Text object is corrupted, recreate it by setting text first
          this.setText(config.symbol)
        }

        // Now safe to set style
        this.setStyle({
          fontFamily: 'Courier New',
          fontSize: config.fontSize,
          color: config.color,
        })
        this.setText(config.symbol)
        this.setStroke('#000000', 2)
      } catch (error) {
        // Fallback: just set basic text without style updates
        try {
          this.setText(config.symbol)
        } catch (e) {
          // If even basic text fails, disable this enemy
          console.error(`[Enemy] setText failed for ${type}, enemy corrupted:`, e)
          this.setActive(false)
          this.setVisible(false)
          return
        }
      }

      this.originalColor = config.color
      // Apply wave-based health scaling: 13% compound per wave (exponential)
      const healthMultiplier = Math.pow(1.13, wave - 1)
      this.maxHealth = Math.floor(config.health * healthMultiplier)
      this.speed = config.speed
      this.xpValue = config.xpValue
      this.scoreValue = config.scoreValue
      this.behavior = config.behavior
    } else if (type) {
      // Same type, just use existing config
      const config = ENEMY_CONFIGS[type]
      // Apply wave-based health scaling: 13% compound per wave (exponential)
      const healthMultiplier = Math.pow(1.13, wave - 1)
      this.maxHealth = Math.floor(config.health * healthMultiplier)
      this.xpValue = config.xpValue
      this.scoreValue = config.scoreValue
      this.behavior = config.behavior
    }

    this.currentHealth = this.maxHealth
    this.spawnTime = this.scene.time.now
    this.zigzagTime = 0
    this.circleAngle = 0
    this.isCharging = false
    this.lastShotTime = this.scene.time.now
    this.healPulseTime = this.scene.time.now
    this.spiralAngle = 0
    this.lastSpawnTime = this.scene.time.now
    this.patrolStartX = x
    this.patrolDirection = 1

    // Reset status effects
    this.statusEffects.isBurning = false
    this.statusEffects.burnEndTime = 0
    this.statusEffects.isFrozen = false
    this.statusEffects.freezeEndTime = 0
    this.statusEffects.isPoisoned = false
    this.statusEffects.poisonEndTime = 0
    this.statusEffects.isBleeding = false
    this.statusEffects.bleedEndTime = 0
    this.statusEffects.bleedStacks = 0

    // Cancel any pending color reset timers from previous life
    if (this.colorResetTimer) {
      this.colorResetTimer.remove()
      this.colorResetTimer = null
    }

    // Always reset color to original (fixes white enemies persisting after respawn)
    this.setColor(this.originalColor)

    // Create shield for shielded enemies
    if (this.behavior.specialAbility === 'shield') {
      this.createShield()
    }

    // Ensure physics body exists (safety check)
    if (!this.body) {
      // Enemy has no body - cannot spawn safely
      console.error(`[Enemy] No physics body found for enemy type ${this.enemyType}`)
      this.setActive(false)
      this.setVisible(false)
      return
    }

    // Configure body FIRST, before activating
    // Update body size based on actual rendered text dimensions
    // This ensures hitbox matches the visual representation of multi-character symbols
    const textWidth = this.width
    const textHeight = this.height

    // Reset body first (this should re-enable it)
    this.body.reset(x, y)
    this.body.setSize(textWidth, textHeight)

    // Ensure body is enabled (some versions of Phaser don't auto-enable on reset)
    if (!this.body.enable) {
      this.body.enable = true
    }

    // Force Phaser to update collision bounds
    this.body.updateFromGameObject()

    // Set position
    this.setPosition(x, y)

    // THEN activate (so collision system sees properly configured body)
    this.setActive(true)
    this.setVisible(true)

    // Add undulation animation - subtle pulsing
    this.scene.tweens.add({
      targets: this,
      scale: { from: 1, to: 1.05 },
      duration: 800 + Math.random() * 400, // Randomize slightly for variety
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut'
    })

    // Set initial velocity based on movement pattern
    this.updateMovementPattern()
  }

  private updateMovementPattern() {
    if (!this.body) return // Safety check

    switch (this.behavior.movementPattern) {
      case 'straight':
        this.body.setVelocity(0, this.speed)
        break
      case 'stationary':
        this.body.setVelocity(0, 0)
        break
      case 'patrol':
        // Move left/right while descending
        this.body.setVelocity(this.speed * this.patrolDirection, this.speed * 0.5)
        break
      case 'charge':
        if (this.playerRef) {
          const player = this.playerRef as Phaser.GameObjects.Text
          const angle = Phaser.Math.Angle.Between(this.x, this.y, player.x, player.y)
          this.body.setVelocity(
            Math.cos(angle) * this.speed,
            Math.sin(angle) * this.speed
          )
          this.isCharging = true
        } else {
          this.body.setVelocity(0, this.speed)
        }
        break
      default:
        this.body.setVelocity(0, this.speed)
    }
  }

  takeDamage(damage: number): boolean {
    if (!this.active) return false

    // Spawn immunity: 200ms grace period after spawning
    const timeSinceSpawn = this.scene.time.now - this.spawnTime
    if (timeSinceSpawn < 200) {
      return false
    }

    // Don't take damage until visible on screen (prevent off-screen kills)
    // Use a more generous buffer to account for text height
    if (this.y < 20) {
      return false
    }

    this.currentHealth -= damage

    // Visual feedback - flash white
    // Cancel any pending color reset to prevent conflicts
    if (this.colorResetTimer) {
      this.colorResetTimer.remove()
    }

    this.setColor('#ffffff')
    this.colorResetTimer = this.scene.time.delayedCall(50, () => {
      if (this.active) {
        this.setColor(this.originalColor)
      }
      this.colorResetTimer = null
    })

    if (this.currentHealth <= 0) {
      this.die()
      return true
    }

    // Play enemy hit sound (only when damaged but not killed)
    soundManager.playEnemyHit(0.2)

    return false
  }

  private die() {
    // Save position before deactivating (for drop spawns)
    const deathX = this.x
    const deathY = this.y

    // Create death explosion effect (scales with enemy size)
    this.createDeathExplosion(deathX, deathY)

    // Handle special abilities on death
    if (this.behavior.specialAbility === 'explode_on_death') {
      this.explode()
    } else if (this.behavior.specialAbility === 'split_on_death') {
      this.split()
    } else if (this.behavior.specialAbility === 'area_explode') {
      this.areaExplode()
    }

    // Destroy shield if present
    if (this.shield) {
      this.shield.destroy()
      this.shield = null
    }

    // Cancel any pending color reset timers
    if (this.colorResetTimer) {
      this.colorResetTimer.remove()
      this.colorResetTimer = null
    }

    // Stop undulation animation
    this.scene.tweens.killTweensOf(this)
    this.setScale(1) // Reset scale

    this.setActive(false)
    this.setVisible(false)
    this.body.setVelocity(0, 0)
    this.setPosition(-1000, -1000)
    // Disable collisions by setting body size to 1x1 and disabling
    this.body.setSize(1, 1)
    this.body.enable = false
    this.body.updateFromGameObject()

    // Emit with saved position so drops spawn correctly
    this.scene.events.emit('enemyDied', {
      x: deathX,
      y: deathY,
      xpValue: this.xpValue,
      scoreValue: this.scoreValue,
      type: this.enemyType,
    })
  }

  private createDeathExplosion(x: number, y: number) {
    // Calculate explosion scale based on enemy health and size
    const healthScale = Math.sqrt(this.maxHealth / 60) // Base 60 HP = scale 1
    const sizeScale = parseInt(this.config.fontSize) / 36 // Base 36px = scale 1
    const explosionScale = Math.max(0.5, Math.min(3, (healthScale + sizeScale) / 2))

    // Reduced particle count for performance: 2 for normal enemies, 4 for bosses
    const isBoss = this.maxHealth > 100
    const particleCount = isBoss ? 4 : 2

    // Color variations based on enemy type
    const explosionColors = [this.config.color, '#ff6600', '#ffaa00', '#ffdd00']

    // Create expanding particle ring
    for (let i = 0; i < particleCount; i++) {
      const angle = (i / particleCount) * Math.PI * 2
      const speed = 100 * explosionScale
      const maxDistance = 40 * explosionScale

      // Randomize particle symbols for variety
      const particleSymbols = ['●', '◆', '■', '▲', '✦', '※']
      const symbol = Phaser.Utils.Array.GetRandom(particleSymbols)
      const color = Phaser.Utils.Array.GetRandom(explosionColors)

      const particle = this.scene.add.text(x, y, symbol, {
        fontFamily: 'Courier New',
        fontSize: `${Math.floor(14 * explosionScale)}px`,
        color: color,
      }).setOrigin(0.5).setDepth(45) // Above enemies

      // Animate particle outward
      this.scene.tweens.add({
        targets: particle,
        x: x + Math.cos(angle) * maxDistance,
        y: y + Math.sin(angle) * maxDistance,
        alpha: { from: 1, to: 0 },
        scale: { from: 1.5, to: 0.3 },
        duration: 400 + Math.random() * 200,
        ease: 'Cubic.easeOut',
        onComplete: () => particle.destroy(),
      })
    }

    // Create central flash
    const flash = this.scene.add.circle(x, y, 5 * explosionScale, 0xffffff, 1)
      .setDepth(46)

    this.scene.tweens.add({
      targets: flash,
      radius: 30 * explosionScale,
      alpha: 0,
      duration: 300,
      ease: 'Cubic.easeOut',
      onComplete: () => flash.destroy(),
    })

    // Add shockwave ring
    const shockwave = this.scene.add.circle(x, y, 10 * explosionScale, 0x000000, 0)
      .setStrokeStyle(2 * explosionScale, 0xffffff, 1)
      .setDepth(46)

    this.scene.tweens.add({
      targets: shockwave,
      radius: 50 * explosionScale,
      alpha: { from: 1, to: 0 },
      duration: 350,
      ease: 'Cubic.easeOut',
      onComplete: () => shockwave.destroy(),
    })

    // Extra large enemies - extra flash particles disabled for performance
    // if (explosionScale >= 1.5) {
    //   for (let i = 0; i < 6; i++) {
    //     const angle = (i / 6) * Math.PI * 2 + Math.PI / 6
    //     const offset = 20 * explosionScale
    //
    //     const spark = this.scene.add.text(
    //       x + Math.cos(angle) * offset,
    //       y + Math.sin(angle) * offset,
    //       '✦',
    //       {
    //         fontFamily: 'Courier New',
    //         fontSize: `${Math.floor(20 * explosionScale)}px`,
    //         color: '#ffffff',
    //       }
    //     ).setOrigin(0.5).setDepth(47)
    //
    //     this.scene.tweens.add({
    //       targets: spark,
    //       scale: 2,
    //       alpha: 0,
    //       duration: 400,
    //       ease: 'Cubic.easeOut',
    //       onComplete: () => spark.destroy(),
    //     })
    //   }
    // }
  }

  private explode() {
    // Create explosion effect and damage player if nearby
    const explosionRadius = 80
    this.scene.events.emit('enemyExplosion', {
      x: this.x,
      y: this.y,
      radius: explosionRadius,
      damage: 15,
    })

    // Visual explosion effect
    for (let i = 0; i < 12; i++) {
      const angle = (i / 12) * Math.PI * 2
      const speed = Phaser.Math.Between(80, 150)
      const particle = this.scene.add.text(this.x, this.y, '•', {
        fontFamily: 'Courier New',
        fontSize: '20px',
        color: '#ff4400',
      }).setOrigin(0.5)

      this.scene.tweens.add({
        targets: particle,
        x: this.x + Math.cos(angle) * speed,
        y: this.y + Math.sin(angle) * speed,
        alpha: 0,
        scale: 0.3,
        duration: 600,
        onComplete: () => particle.destroy(),
      })
    }
  }

  private split() {
    // Emit event to spawn smaller enemies
    this.scene.events.emit('enemySplit', {
      x: this.x,
      y: this.y,
      count: 3,
    })
  }

  private areaExplode() {
    // Create massive explosion that damages player, allies, and other enemies
    const explosionRadius = 120
    this.scene.events.emit('areaExplosion', {
      x: this.x,
      y: this.y,
      radius: explosionRadius,
      damage: 25,
    })

    // Large visual explosion effect
    for (let i = 0; i < 20; i++) {
      const angle = (i / 20) * Math.PI * 2
      const speed = Phaser.Math.Between(100, 200)
      const particle = this.scene.add.text(this.x, this.y, '※', {
        fontFamily: 'Courier New',
        fontSize: '24px',
        color: Phaser.Math.Between(0, 1) === 0 ? '#ff4400' : '#ffaa00',
      }).setOrigin(0.5)

      this.scene.tweens.add({
        targets: particle,
        x: this.x + Math.cos(angle) * speed,
        y: this.y + Math.sin(angle) * speed,
        alpha: 0,
        scale: 0.5,
        duration: 700,
        onComplete: () => particle.destroy(),
      })
    }

    // Central explosion flash
    const flash = this.scene.add.circle(this.x, this.y, 10, 0xffffff, 1)
    this.scene.tweens.add({
      targets: flash,
      radius: explosionRadius,
      alpha: 0,
      duration: 500,
      onComplete: () => flash.destroy(),
    })
  }

  private createShield() {
    // Create shield below enemy that blocks projectiles
    const shieldRadius = parseInt(this.config.fontSize) / 2 + 10
    this.shield = this.scene.add.circle(this.x, this.y + 25, shieldRadius, 0x0088ff, 0.3)
      .setStrokeStyle(2, 0x00ffff, 1)
      .setDepth(14) // Below enemy but above projectiles

    // Pulsing shield effect
    this.scene.tweens.add({
      targets: this.shield,
      alpha: { from: 0.3, to: 0.6 },
      scale: { from: 1, to: 1.1 },
      duration: 1000,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut'
    })
  }

  getShield(): Phaser.GameObjects.Arc | null {
    return this.shield
  }

  hasShield(): boolean {
    return this.shield !== null && this.shield.active
  }

  heal(amount: number) {
    this.currentHealth = Math.min(this.maxHealth, this.currentHealth + amount)

    // Visual feedback - flash green
    this.setColor('#00ff00')
    this.scene.time.delayedCall(100, () => {
      if (this.active) {
        this.setColor(this.originalColor)
      }
    })
  }

  getXPValue(): number {
    return this.xpValue
  }

  getScoreValue(): number {
    return this.scoreValue
  }

  getType(): EnemyType {
    return this.enemyType
  }

  getHealth(): number {
    return this.currentHealth
  }

  getMaxHealth(): number {
    return this.maxHealth
  }

  getName(): string | undefined {
    return ENEMY_CONFIGS[this.enemyType].name
  }

  // Status effect methods
  applyBurn(duration: number): void {
    if (!this.active) return
    this.statusEffects.isBurning = true
    this.statusEffects.burnEndTime = this.scene.time.now + duration
  }

  applyFreeze(duration: number): void {
    if (!this.active) return
    this.statusEffects.isFrozen = true
    this.statusEffects.freezeEndTime = this.scene.time.now + duration
  }

  applyPoison(duration: number): void {
    if (!this.active) return
    this.statusEffects.isPoisoned = true
    this.statusEffects.poisonEndTime = this.scene.time.now + duration
  }

  applyBleed(duration: number, maxStacks: number = 3): void {
    if (!this.active) return
    this.statusEffects.isBleeding = true
    this.statusEffects.bleedEndTime = this.scene.time.now + duration
    // Stack bleed up to max stacks
    if (this.statusEffects.bleedStacks < maxStacks) {
      this.statusEffects.bleedStacks++
    }
  }

  isBurning(): boolean {
    return this.statusEffects.isBurning
  }

  isFrozen(): boolean {
    return this.statusEffects.isFrozen
  }

  isPoisoned(): boolean {
    return this.statusEffects.isPoisoned
  }

  isBleeding(): boolean {
    return this.statusEffects.isBleeding
  }

  getBleedStacks(): number {
    return this.statusEffects.bleedStacks
  }

  update(time: number, delta: number) {
    if (!this.active) return

    // Cap delta to prevent physics explosions after long pauses (e.g., window loses focus)
    // Max 100ms per frame = 10 FPS minimum
    const cappedDelta = Math.min(delta, 100)

    // Clear expired status effects
    const now = this.scene.time.now
    if (this.statusEffects.isBurning && now >= this.statusEffects.burnEndTime) {
      this.statusEffects.isBurning = false
    }
    if (this.statusEffects.isFrozen && now >= this.statusEffects.freezeEndTime) {
      this.statusEffects.isFrozen = false
    }
    if (this.statusEffects.isPoisoned && now >= this.statusEffects.poisonEndTime) {
      this.statusEffects.isPoisoned = false
    }
    if (this.statusEffects.isBleeding && now >= this.statusEffects.bleedEndTime) {
      this.statusEffects.isBleeding = false
      this.statusEffects.bleedStacks = 0
    }

    // Helper to check if this is a boss enemy
    const isBossEnemy = this.enemyType === EnemyType.BOSS ||
                        this.enemyType === EnemyType.MINI_BOSS ||
                        this.enemyType === EnemyType.SCOUT_COMMANDER ||
                        this.enemyType === EnemyType.TANK_TWIN ||
                        this.enemyType === EnemyType.HIVE_QUEEN ||
                        this.enemyType === EnemyType.ORBITAL_DEVASTATOR ||
                        this.enemyType === EnemyType.FRACTURED_TITAN ||
                        this.enemyType === EnemyType.SHIELD_WARDEN ||
                        this.enemyType === EnemyType.ACE_BOMBER ||
                        this.enemyType === EnemyType.VOID_NEXUS ||
                        this.enemyType === EnemyType.SIEGE_ENGINE ||
                        this.enemyType === EnemyType.MOTHERSHIP_OMEGA

    // Update movement patterns
    switch (this.behavior.movementPattern) {
      case 'straight':
        // Boss enemies hover at the top instead of descending
        if (isBossEnemy) {
          const hoverY = 180
          if (this.y < hoverY) {
            this.body.setVelocityY(this.speed)
          } else {
            this.body.setVelocityY(0)
          }
        } else {
          this.body.setVelocityY(this.speed)
        }
        break

      case 'zigzag':
        this.zigzagTime += cappedDelta
        const zigzagFrequency = 500
        const zigzagAmplitude = 100
        const xOffset = Math.sin((this.zigzagTime / zigzagFrequency) * Math.PI * 2) * zigzagAmplitude
        this.body.setVelocityX((xOffset - (this.body.x - this.body.prev.x)) * 5)
        this.body.setVelocityY(this.speed)
        break

      case 'sinwave':
        this.zigzagTime += cappedDelta
        const sinFrequency = 800
        const sinAmplitude = 60
        const sinOffset = Math.sin((this.zigzagTime / sinFrequency) * Math.PI * 2) * sinAmplitude
        this.body.setVelocityX((sinOffset - (this.body.x - this.body.prev.x)) * 3)

        // Boss enemies hover at the top instead of descending
        if (isBossEnemy) {
          // Move to hover position at top of screen (y = 180), then stop descending
          const hoverY = 180
          if (this.y < hoverY) {
            this.body.setVelocityY(this.speed)
          } else {
            this.body.setVelocityY(0)
          }
        } else {
          this.body.setVelocityY(this.speed)
        }
        break

      case 'circle':
        if (this.playerRef) {
          this.circleAngle += cappedDelta * 0.002
          const player = this.playerRef as Phaser.GameObjects.Text
          const radius = 150
          const targetX = player.x + Math.cos(this.circleAngle) * radius
          const targetY = player.y + Math.sin(this.circleAngle) * radius

          const dx = targetX - this.x
          const dy = targetY - this.y
          this.body.setVelocity(dx * 1.5, dy * 1.5)
        }
        break

      case 'charge':
        if (!this.isCharging && this.playerRef) {
          const player = this.playerRef as Phaser.GameObjects.Text
          const angle = Phaser.Math.Angle.Between(this.x, this.y, player.x, player.y)
          this.body.setVelocity(
            Math.cos(angle) * this.speed,
            Math.sin(angle) * this.speed
          )
        }
        break

      case 'patrol':
        // Check patrol boundaries and reverse direction
        if (this.x > this.patrolStartX + this.patrolRange) {
          this.patrolDirection = -1
        } else if (this.x < this.patrolStartX - this.patrolRange) {
          this.patrolDirection = 1
        }
        this.body.setVelocityX(this.speed * this.patrolDirection)
        this.body.setVelocityY(this.speed * 0.5) // Slow descent
        break
    }

    // Update shield position
    if (this.shield && this.active) {
      this.shield.setPosition(this.x, this.y + 25)
    }

    // Handle spawning minions (Spawner)
    if (this.behavior.specialAbility === 'spawn_minions') {
      const now = this.scene.time.now
      if (now - this.lastSpawnTime > 3000) { // Spawn every 3 seconds
        this.scene.events.emit('spawnMinion', {
          x: this.x,
          y: this.y,
        })
        this.lastSpawnTime = now

        // Visual effect
        const spawnFlash = this.scene.add.circle(this.x, this.y, 5, 0xff00ff, 1)
        this.scene.tweens.add({
          targets: spawnFlash,
          radius: 40,
          alpha: 0,
          duration: 400,
          onComplete: () => spawnFlash.destroy(),
        })
      }
    }

    // Handle shooting
    if (this.behavior.shootsBack && this.behavior.shootInterval) {
      const now = this.scene.time.now
      if (now - this.lastShotTime > this.behavior.shootInterval && this.enemyProjectiles && this.playerRef) {
        this.shoot()
        this.lastShotTime = now
      }
    }

    // Handle healing
    if (this.behavior.specialAbility === 'heal_nearby') {
      const now = this.scene.time.now
      if (now - this.healPulseTime > 2000) {
        this.scene.events.emit('healNearbyEnemies', {
          x: this.x,
          y: this.y,
          radius: 100,
          amount: 10,
        })
        this.healPulseTime = now

        // Visual effect
        const healCircle = this.scene.add.circle(this.x, this.y, 10, 0x00ff88, 0.5)
        this.scene.tweens.add({
          targets: healCircle,
          radius: 100,
          alpha: 0,
          duration: 500,
          onComplete: () => healCircle.destroy(),
        })
      }
    }

    // Deactivate if off screen - treat as death to avoid stuck waves
    const cam = this.scene.cameras.main
    if (this.y > cam.height + 50 || this.y < -100 || this.x < -100 || this.x > cam.width + 100) {
      // Save position before deactivating
      const deathX = this.x
      const deathY = this.y

      // Determine if this is a "natural" death (reached bottom) vs killed by player
      const reachedBottom = this.y > cam.height + 50

      // Destroy shield if present
      if (this.shield) {
        this.shield.destroy()
        this.shield = null
      }

      // Stop undulation animation
      this.scene.tweens.killTweensOf(this)
      this.setScale(1) // Reset scale

      this.setActive(false)
      this.setVisible(false)
      this.body.setVelocity(0, 0)
      this.setPosition(-1000, -1000)
      // Disable collisions by setting body size to 1x1
      this.body.setSize(1, 1)
      this.body.enable = false
      this.body.updateFromGameObject()

      // Emit death event so wave tracking counts this as defeated
      // Use clamped position to ensure drops don't spawn off-screen
      // Include flag to indicate if enemy reached bottom naturally (no sound/drops)
      this.scene.events.emit('enemyDied', {
        x: Math.max(50, Math.min(cam.width - 50, deathX)),
        y: Math.max(50, Math.min(cam.height - 50, deathY)),
        xpValue: this.xpValue,
        scoreValue: this.scoreValue,
        type: this.enemyType,
        reachedBottom: reachedBottom,
      })
    }
  }

  private shoot() {
    if (!this.enemyProjectiles || !this.playerRef) return

    const player = this.playerRef as Phaser.GameObjects.Text

    if (this.behavior.specialAbility === 'spread_fire') {
      // Tank shoots 3 projectiles in a spread
      for (let i = -1; i <= 1; i++) {
        const offsetX = i * 30
        this.enemyProjectiles.fireAtTarget(
          this.x + offsetX,
          this.y + 20,
          player.x + offsetX * 50,
          player.y,
          180,
          8
        )
      }
    } else if (this.behavior.specialAbility === 'charged_shot') {
      // Sniper charges up (flash effect)
      // Cancel any pending color reset to prevent conflicts
      if (this.colorResetTimer) {
        this.colorResetTimer.remove()
      }

      this.setColor('#ffffff')
      this.colorResetTimer = this.scene.time.delayedCall(500, () => {
        if (this.active && this.playerRef) {
          const player = this.playerRef as Phaser.GameObjects.Text
          this.enemyProjectiles?.fireAtTarget(this.x, this.y + 20, player.x, player.y, 300, 20)
          this.setColor(this.originalColor)
        }
        this.colorResetTimer = null
      })
    } else if (this.behavior.specialAbility === 'multi_pattern') {
      // Mini-boss (DEVASTATOR) shoots in varied patterns based on health phase
      const healthPercent = this.currentHealth / this.maxHealth
      const shotCount = (this.scene.time.now - this.spawnTime) / this.behavior.shootInterval!
      const pattern = Math.floor(shotCount) % 3 // Cycle through 3 patterns

      if (healthPercent > 0.66) {
        // Phase 1: Alternating between spray and shotgun
        if (pattern === 0) {
          // Wide spray pattern - 7 projectiles in arc
          for (let i = -3; i <= 3; i++) {
            const angle = Math.PI / 2 + (i * Math.PI / 12) // Downward arc
            const targetX = this.x + Math.cos(angle) * 400
            const targetY = this.y + Math.sin(angle) * 400
            this.enemyProjectiles.fireAtTarget(this.x, this.y + 30, targetX, targetY, 200, 12)
          }
        } else {
          // Triple shotgun blast toward player
          for (let i = -1; i <= 1; i++) {
            const offsetX = i * 40
            this.enemyProjectiles.fireAtTarget(this.x + offsetX, this.y + 30, player.x, player.y, 220, 14)
          }
        }
      } else if (healthPercent > 0.33) {
        // Phase 2: More aggressive - line of constant fire + spread
        if (pattern === 0 || pattern === 1) {
          // Rapid line of fire straight down
          for (let i = 0; i < 5; i++) {
            const offsetX = (i - 2) * 20
            this.enemyProjectiles.fireAtTarget(this.x + offsetX, this.y + 30, this.x + offsetX, player.y + 200, 240, 16)
          }
        } else {
          // 5-way aimed spread
          for (let i = -2; i <= 2; i++) {
            const angle = Math.atan2(player.y - this.y, player.x - this.x) + (i * Math.PI / 10)
            const targetX = this.x + Math.cos(angle) * 350
            const targetY = this.y + Math.sin(angle) * 350
            this.enemyProjectiles.fireAtTarget(this.x, this.y + 30, targetX, targetY, 230, 16)
          }
        }
      } else {
        // Phase 3: Desperate - maximum firepower!
        if (pattern === 0) {
          // Massive 9-way spray
          for (let i = -4; i <= 4; i++) {
            const angle = Math.PI / 2 + (i * Math.PI / 10)
            const targetX = this.x + Math.cos(angle) * 400
            const targetY = this.y + Math.sin(angle) * 400
            this.enemyProjectiles.fireAtTarget(this.x, this.y + 30, targetX, targetY, 260, 18)
          }
        } else {
          // Shotgun barrage - 5 tight shots at player
          for (let i = -2; i <= 2; i++) {
            const offsetX = i * 25
            const offsetY = i * 10
            this.enemyProjectiles.fireAtTarget(this.x + offsetX, this.y + 30, player.x + offsetX, player.y + offsetY, 270, 20)
          }
        }
      }
    } else if (this.behavior.specialAbility === 'boss_barrage') {
      // Final Boss (ANNIHILATOR) - extremely aggressive patterns
      const healthPercent = this.currentHealth / this.maxHealth
      const shotCount = (this.scene.time.now - this.spawnTime) / this.behavior.shootInterval!
      const pattern = Math.floor(shotCount) % 4 // Cycle through 4 patterns

      if (healthPercent > 0.75) {
        // Phase 1: Intimidation - rotating spray
        if (pattern === 0) {
          // 360-degree spray (downward hemisphere)
          for (let i = 0; i < 12; i++) {
            const angle = Math.PI / 4 + (i * Math.PI / 8)
            const targetX = this.x + Math.cos(angle) * 500
            const targetY = this.y + Math.sin(angle) * 500
            this.enemyProjectiles.fireAtTarget(this.x, this.y + 30, targetX, targetY, 220, 16)
          }
        } else {
          // Converging lines - 3 streams aimed at player
          for (let i = -1; i <= 1; i++) {
            for (let j = 0; j < 3; j++) {
              const offsetX = i * 60
              const offsetY = j * 15
              this.enemyProjectiles.fireAtTarget(this.x + offsetX, this.y + 30 + offsetY, player.x, player.y, 240, 18)
            }
          }
        }
      } else if (healthPercent > 0.5) {
        // Phase 2: Escalation - dense patterns
        if (pattern === 0 || pattern === 2) {
          // Dense curtain of fire - 15-way spread
          for (let i = -7; i <= 7; i++) {
            const angle = Math.PI / 2 + (i * Math.PI / 16)
            const targetX = this.x + Math.cos(angle) * 450
            const targetY = this.y + Math.sin(angle) * 450
            this.enemyProjectiles.fireAtTarget(this.x, this.y + 30, targetX, targetY, 250, 20)
          }
        } else {
          // Spiral burst
          for (let i = 0; i < 8; i++) {
            const angle = this.spiralAngle + (i * Math.PI / 4)
            const targetX = this.x + Math.cos(angle) * 400
            const targetY = this.y + Math.sin(angle) * 400
            this.enemyProjectiles.fireAtTarget(this.x, this.y + 30, targetX, targetY, 260, 20)
          }
          this.spiralAngle += 0.5
        }
      } else if (healthPercent > 0.25) {
        // Phase 3: Fury - overwhelming firepower
        if (pattern === 0) {
          // Double spray - two overlapping arcs
          for (let i = -6; i <= 6; i++) {
            const angle1 = Math.PI / 2 + (i * Math.PI / 14)
            const angle2 = Math.PI / 2 + (i * Math.PI / 14) + Math.PI / 24
            const targetX1 = this.x + Math.cos(angle1) * 480
            const targetY1 = this.y + Math.sin(angle1) * 480
            const targetX2 = this.x + Math.cos(angle2) * 480
            const targetY2 = this.y + Math.sin(angle2) * 480
            this.enemyProjectiles.fireAtTarget(this.x, this.y + 30, targetX1, targetY1, 270, 22)
            this.enemyProjectiles.fireAtTarget(this.x, this.y + 30, targetX2, targetY2, 270, 22)
          }
        } else {
          // Shotgun massacre - massive spread at player
          for (let i = -4; i <= 4; i++) {
            for (let j = 0; j < 2; j++) {
              const offsetX = i * 30 + (j * 15)
              const offsetY = i * 8
              this.enemyProjectiles.fireAtTarget(this.x + offsetX, this.y + 30, player.x + offsetX, player.y + offsetY, 280, 24)
            }
          }
        }
      } else {
        // Phase 4: Desperation - absolute chaos!
        if (pattern % 2 === 0) {
          // Ultimate spray - 20+ projectiles
          for (let i = -10; i <= 10; i++) {
            const angle = Math.PI / 2 + (i * Math.PI / 18)
            const targetX = this.x + Math.cos(angle) * 500
            const targetY = this.y + Math.sin(angle) * 500
            this.enemyProjectiles.fireAtTarget(this.x, this.y + 30, targetX, targetY, 300, 26)
          }
        } else {
          // Spiral barrage combined with aimed shots
          for (let i = 0; i < 10; i++) {
            const angle = this.spiralAngle + (i * Math.PI / 5)
            const targetX = this.x + Math.cos(angle) * 450
            const targetY = this.y + Math.sin(angle) * 450
            this.enemyProjectiles.fireAtTarget(this.x, this.y + 30, targetX, targetY, 290, 26)
          }
          // Add aimed shots at player
          for (let i = -2; i <= 2; i++) {
            const offsetX = i * 50
            this.enemyProjectiles.fireAtTarget(this.x + offsetX, this.y + 30, player.x, player.y, 310, 28)
          }
          this.spiralAngle += 0.6
        }
      }
    } else if (this.behavior.specialAbility === 'spiral_fire') {
      // Spiral shooter fires in a rotating pattern
      const projectileCount = 3
      for (let i = 0; i < projectileCount; i++) {
        const angle = this.spiralAngle + (i * (Math.PI * 2 / projectileCount))
        const targetX = this.x + Math.cos(angle) * 300
        const targetY = this.y + Math.sin(angle) * 300
        this.enemyProjectiles.fireAtTarget(this.x, this.y + 20, targetX, targetY, 220, 12)
      }
      // Increment spiral for next shot
      this.spiralAngle += 0.4
    } else {
      // Standard aimed shot
      this.enemyProjectiles.fireAtTarget(this.x, this.y + 20, player.x, player.y, 200, 10)
    }
  }

  // ==================== BOSS-SPECIFIC METHODS ====================

  getBossPhase(): number {
    return this.bossPhase
  }

  setBossPhase(phase: number) {
    this.bossPhase = phase
    this.phaseChangeTriggered = false
  }

  hasChangedPhase(): boolean {
    return this.phaseChangeTriggered
  }

  checkPhaseChange(): boolean {
    const healthPercent = (this.currentHealth / this.maxHealth) * 100
    const newPhase = this.calculatePhaseFromHealth(healthPercent)

    if (newPhase !== this.bossPhase) {
      this.bossPhase = newPhase
      this.phaseChangeTriggered = true
      return true
    }
    return false
  }

  private calculatePhaseFromHealth(healthPercent: number): number {
    // 4-phase bosses (MOTHERSHIP_OMEGA, SIEGE_ENGINE)
    if (this.enemyType === EnemyType.MOTHERSHIP_OMEGA) {
      if (healthPercent > 75) return 1
      if (healthPercent > 50) return 2
      if (healthPercent > 25) return 3
      return 4
    }

    if (this.enemyType === EnemyType.SIEGE_ENGINE) {
      if (healthPercent > 50) return 1
      if (healthPercent > 25) return 2
      return 3
    }

    // 2-phase bosses
    if (healthPercent > 66) return 1
    if (healthPercent > 33) return 2
    return 3
  }

  setLinkedBoss(boss: Enemy) {
    this.linkedBoss = boss
  }

  getLinkedBoss(): Enemy | null {
    return this.linkedBoss
  }

  addOrbitalShield(shield: Enemy) {
    this.orbitalShields.push(shield)
  }

  getOrbitalShields(): Enemy[] {
    return this.orbitalShields
  }

  clearOrbitalShields() {
    this.orbitalShields = []
  }

  addChildEnemy(enemy: Enemy) {
    this.childEnemies.push(enemy)
  }

  getChildEnemies(): Enemy[] {
    return this.childEnemies.filter(e => e.active)
  }

  clearChildEnemies() {
    this.childEnemies = []
  }

  canUseSpecialAbility(cooldown: number = 3000): boolean {
    return this.scene.time.now - this.lastSpecialAbilityTime >= cooldown
  }

  useSpecialAbility() {
    this.lastSpecialAbilityTime = this.scene.time.now
  }

  setVulnerable(duration: number) {
    this.vulnerableUntil = this.scene.time.now + duration
  }

  isVulnerable(): boolean {
    if (this.vulnerableUntil === 0) return true // Always vulnerable by default
    return this.scene.time.now < this.vulnerableUntil
  }

  setTeleportCooldown(cooldown: number) {
    this.teleportCooldown = cooldown
  }

  canTeleport(): boolean {
    return this.scene.time.now >= this.teleportCooldown
  }

  preDestroy() {
    // Clean up timer to prevent memory leak
    if (this.colorResetTimer) {
      this.colorResetTimer.remove()
      this.colorResetTimer = null
    }

    // Break circular references with linked boss to prevent memory leak
    if (this.linkedBoss) {
      // Remove reverse reference from linked boss
      if (this.linkedBoss.linkedBoss === this) {
        this.linkedBoss.linkedBoss = null
      }
      this.linkedBoss = null
    }

    // Properly unlink orbital shields
    if (this.orbitalShields.length > 0) {
      this.orbitalShields.forEach(shield => {
        if (shield && shield.active) {
          // Break the reverse reference
          shield.clearOrbitalShields()
        }
      })
      this.orbitalShields = []
    }

    // Properly unlink child enemies to break circular references
    if (this.childEnemies.length > 0) {
      this.childEnemies.forEach(child => {
        if (child && child.active) {
          // If child has a parent reference, clear it
          if (child.linkedBoss === this) {
            child.linkedBoss = null
          }
        }
      })
      this.childEnemies = []
    }
  }
}

export class EnemyGroup extends Phaser.Physics.Arcade.Group {
  private pool: Enemy[] = []
  private maxEnemies: number
  private enemyProjectiles: EnemyProjectileGroup | null = null

  constructor(scene: Phaser.Scene, poolSize: number = 100, maxActive: number = 50) {
    super(scene.physics.world, scene)

    this.maxEnemies = maxActive

    for (let i = 0; i < poolSize; i++) {
      const enemy = new Enemy(scene, 0, 0, EnemyType.DRONE)

      // Add to scene first
      scene.add.existing(enemy)

      // Explicitly enable physics on this text object
      scene.physics.add.existing(enemy)

      // Now add to group
      this.add(enemy, false)  // false because already added to scene
      this.pool.push(enemy)

      // Ensure body is set up after physics is enabled
      if (enemy.body) {
        enemy.body.setSize(1, 1)
        enemy.body.enable = false
      } else {
        console.error('[EnemyGroup] Failed to create physics body for enemy in pool')
      }
    }
  }

  setPlayerReference(player: Phaser.GameObjects.GameObject) {
    this.pool.forEach(enemy => enemy.setPlayerReference(player))
  }

  setProjectileGroup(projectiles: EnemyProjectileGroup) {
    this.enemyProjectiles = projectiles
    this.pool.forEach(enemy => enemy.setProjectileGroup(projectiles))
  }

  spawnEnemy(x: number, y: number, type: EnemyType = EnemyType.DRONE, wave: number = 1) {
    const activeCount = this.pool.filter(e => e.active).length
    if (activeCount >= this.maxEnemies) {
      console.warn(`[EnemyGroup] Cannot spawn - pool at max capacity: ${activeCount}/${this.maxEnemies}`)
      return null
    }

    const enemy = this.pool.find(e => !e.active)

    if (enemy) {
      // Verify enemy has valid scene reference before spawning
      if (!enemy.scene) {
        console.error(`[EnemyGroup] Found enemy without scene - pool may be corrupted`)
        return null
      }

      enemy.spawn(x, y, type, wave)
      // Check if enemy is actually active after spawn (spawn might fail silently)
      if (!enemy.active) {
        console.error(`[EnemyGroup] Enemy spawn failed - enemy not active after spawn() call`)
        return null
      }
      return enemy
    }

    console.error(`[EnemyGroup] No inactive enemy found in pool. Active: ${activeCount}, Pool size: ${this.pool.length}`)
    return null
  }

  update(time: number, delta: number) {
    this.pool.forEach(enemy => {
      if (enemy.active) {
        enemy.update(time, delta)
      }
    })
  }

  getActiveCount(): number {
    return this.pool.filter(e => e.active).length
  }

  getNearbyEnemies(x: number, y: number, radius: number): Enemy[] {
    return this.pool.filter(enemy => {
      if (!enemy.active) return false
      const distance = Phaser.Math.Distance.Between(x, y, enemy.x, enemy.y)
      return distance <= radius
    })
  }

  // Debug method to check pool health
  getPoolStatus(): { total: number, active: number, inactive: number, bodyDisabled: number } {
    let active = 0
    let inactive = 0
    let bodyDisabled = 0

    this.pool.forEach(e => {
      if (e.active) {
        active++
      } else {
        inactive++
      }
      if (e.body && !e.body.enable) {
        bodyDisabled++
      }
    })

    return { total: this.pool.length, active, inactive, bodyDisabled }
  }

  // Reset all enemies in pool to inactive state (for wave transitions or cleanup)
  resetPool() {
    console.log('[EnemyGroup] Resetting enemy pool')
    this.pool.forEach(enemy => {
      if (enemy.active) {
        // Stop any tweens
        enemy.scene.tweens.killTweensOf(enemy)
        enemy.setScale(1)

        // Destroy shield if present
        if (enemy.shield) {
          enemy.shield.destroy()
          enemy.shield = null
        }

        // Deactivate
        enemy.setActive(false)
        enemy.setVisible(false)
        enemy.setPosition(-1000, -1000)

        if (enemy.body) {
          enemy.body.setVelocity(0, 0)
          enemy.body.setSize(1, 1)
          enemy.body.enable = false
        }
      }
    })
  }
}
