import { EnemyType } from './Enemy'

export interface WaveFormation {
  type: 'single' | 'line' | 'v' | 'circle' | 'wave' | 'diamond' | 'x' | 'arc' | 'cross' | 'wedge' | 'inverted-v' | 'column' | 'scattered' | 'grid' | 'spiral'
  enemyTypes: EnemyType[] // Pool of enemy types to pick from
  count?: number // For single spawns
  spacing?: number
  delay?: number // Delay in milliseconds before this formation spawns (for visual staggering)
}

export interface WaveBucket {
  formations: WaveFormation[]
  minEnemies: number
  maxEnemies: number
}

export interface Wave {
  waveNumber: number
  buckets: WaveBucket[]
  isBoss: boolean
  isMiniBoss: boolean
  description?: string // What enemies are introduced
}

export interface LevelWaves {
  level: number
  totalWaves: number
  waves: Wave[]
}

// Define all 20 enemy types across 10 levels
// Each level introduces 3 new enemies at waves 1, 6, and 11
const LEVEL_ENEMY_SCHEDULE: Record<number, { wave1: EnemyType[], wave6: EnemyType[], wave11: EnemyType[] }> = {
  1: {
    wave1: [EnemyType.DRONE],
    wave6: [EnemyType.WASP],
    wave11: [EnemyType.SWARMER],
  },
  2: {
    wave1: [EnemyType.TANK],
    wave6: [EnemyType.SNIPER],
    wave11: [EnemyType.HUNTER],
  },
  3: {
    wave1: [EnemyType.PATROLLER],
    wave6: [EnemyType.TURRET],
    wave11: [EnemyType.BOMBER],
  },
  4: {
    wave1: [EnemyType.ORBITER],
    wave6: [EnemyType.CHARGER],
    wave11: [EnemyType.SPIRAL_SHOOTER],
  },
  5: {
    wave1: [EnemyType.SPLITTER],
    wave6: [EnemyType.SPAWNER],
    wave11: [EnemyType.HEALER],
  },
  6: {
    wave1: [EnemyType.SHIELDED],
    wave6: [EnemyType.EXPLODER],
    wave11: [EnemyType.DRONE], // Re-use from level 1
  },
  7: {
    wave1: [EnemyType.WASP], // Re-use
    wave6: [EnemyType.TANK], // Re-use
    wave11: [EnemyType.SNIPER], // Re-use
  },
  8: {
    wave1: [EnemyType.HUNTER], // Re-use
    wave6: [EnemyType.PATROLLER], // Re-use
    wave11: [EnemyType.BOMBER], // Re-use
  },
  9: {
    wave1: [EnemyType.CHARGER], // Re-use
    wave6: [EnemyType.SHIELDED], // Re-use
    wave11: [EnemyType.EXPLODER], // Re-use
  },
  10: {
    wave1: [EnemyType.SPAWNER], // Re-use
    wave6: [EnemyType.SPIRAL_SHOOTER], // Re-use
    wave11: [EnemyType.HEALER], // Re-use
  },
}

export class WaveSystem {
  private currentWave: number = 0
  private totalWaves: number = 15
  private levelWaves: LevelWaves
  private screenWidth: number = 540 // Game width

  constructor(level: number, screenWidth: number = 540) {
    this.screenWidth = screenWidth
    this.levelWaves = this.generateLevelWaves(level)
    this.totalWaves = this.levelWaves.totalWaves
  }

  private generateLevelWaves(level: number): LevelWaves {
    // Use level-specific wave structure
    switch (level) {
      case 1:
        return this.generateLevel1Waves()
      case 2:
        return this.generateLevel2Waves()
      case 3:
        return this.generateLevel3Waves()
      case 4:
        return this.generateLevel4Waves()
      case 5:
        return this.generateLevel5Waves()
      case 6:
        return this.generateLevel6Waves()
      case 7:
        return this.generateLevel7Waves()
      case 8:
        return this.generateLevel8Waves()
      case 9:
        return this.generateLevel9Waves()
      case 10:
        return this.generateLevel10Waves()
      default:
        return this.generateGenericWaves(level)
    }
  }

  // Fallback for levels beyond 10
  private generateGenericWaves(level: number): LevelWaves {
    const totalWaves = 15
    const waves: Wave[] = []
    const availableEnemies = this.getAvailableEnemies(level, 0)

    for (let i = 1; i <= 14; i++) {
      const difficulty = i <= 5 ? 'early' : i <= 10 ? 'mid' : 'late'
      waves.push(this.createStandardWave(i, availableEnemies, difficulty))
    }
    waves.push(this.createBossWave(15, availableEnemies))

    return { level, totalWaves, waves }
  }

  // ==================== LEVEL-SPECIFIC WAVE GENERATORS ====================

  private generateLevel1Waves(): LevelWaves {
    // Level 1: Scout Commander (12 waves)
    // Introduces: DRONE (wave 1) → WASP (wave 3) → SWARMER (wave 7)
    const waves: Wave[] = []
    const allEnemies = [EnemyType.DRONE, EnemyType.WASP, EnemyType.SWARMER]

    const waveConfigs = [
      // Wave 1: Tutorial - Only DRONES in simple line formation
      { wave: 1, min: 2, max: 3, enemies: [EnemyType.DRONE],
        formations: [
          { type: 'line' as const, enemyTypes: [EnemyType.DRONE], spacing: 50 },
          { type: 'scattered' as const, enemyTypes: [EnemyType.DRONE], spacing: 60 },
        ]
      },
      // Wave 2: Still mostly DRONES
      { wave: 2, min: 4, max: 6, enemies: [EnemyType.DRONE],
        formations: [
          { type: 'line' as const, enemyTypes: [EnemyType.DRONE], spacing: 45 },
          { type: 'arc' as const, enemyTypes: [EnemyType.DRONE], spacing: 50 },
          { type: 'scattered' as const, enemyTypes: [EnemyType.DRONE], spacing: 55 },
        ]
      },
      // Wave 3: Introduce WASP
      { wave: 3, min: 8, max: 10, enemies: [EnemyType.DRONE, EnemyType.WASP],
        formations: [
          { type: 'v' as const, enemyTypes: [EnemyType.WASP], spacing: 50 },
          { type: 'line' as const, enemyTypes: [EnemyType.DRONE], spacing: 45 },
          { type: 'wave' as const, enemyTypes: [EnemyType.DRONE, EnemyType.WASP], spacing: 50 },
        ]
      },
      // Wave 4: Mix DRONE and WASP
      { wave: 4, min: 10, max: 12, enemies: [EnemyType.DRONE, EnemyType.WASP],
        formations: [
          { type: 'diamond' as const, enemyTypes: [EnemyType.WASP], spacing: 55 },
          { type: 'line' as const, enemyTypes: [EnemyType.DRONE], spacing: 45 },
          { type: 'inverted-v' as const, enemyTypes: [EnemyType.DRONE, EnemyType.WASP], spacing: 50 },
          { type: 'scattered' as const, enemyTypes: [EnemyType.DRONE], spacing: 60 },
        ]
      },
      // Wave 5: Ramp up before mini-boss
      { wave: 5, min: 14, max: 16, enemies: [EnemyType.DRONE, EnemyType.WASP],
        formations: [
          { type: 'circle' as const, enemyTypes: [EnemyType.WASP], spacing: 60 },
          { type: 'x' as const, enemyTypes: [EnemyType.DRONE], spacing: 50 },
          { type: 'wave' as const, enemyTypes: [EnemyType.DRONE, EnemyType.WASP], spacing: 45 },
        ]
      },
      // Wave 7: Introduce SWARMER after mini-boss
      { wave: 7, min: 18, max: 22, enemies: [EnemyType.DRONE, EnemyType.WASP, EnemyType.SWARMER],
        formations: [
          { type: 'wedge' as const, enemyTypes: [EnemyType.SWARMER], spacing: 50 },
          { type: 'arc' as const, enemyTypes: [EnemyType.WASP], spacing: 55 },
          { type: 'line' as const, enemyTypes: [EnemyType.DRONE], spacing: 45 },
          { type: 'scattered' as const, enemyTypes: allEnemies, spacing: 60 },
        ]
      },
      // Wave 8: All three enemy types
      { wave: 8, min: 22, max: 26, enemies: allEnemies,
        formations: [
          { type: 'grid' as const, enemyTypes: [EnemyType.DRONE, EnemyType.SWARMER], spacing: 55 },
          { type: 'v' as const, enemyTypes: [EnemyType.WASP], spacing: 50 },
          { type: 'cross' as const, enemyTypes: allEnemies, spacing: 50 },
          { type: 'wave' as const, enemyTypes: [EnemyType.DRONE], spacing: 45 },
        ]
      },
      // Wave 9: Escalation
      { wave: 9, min: 26, max: 30, enemies: allEnemies,
        formations: [
          { type: 'spiral' as const, enemyTypes: [EnemyType.SWARMER], spacing: 50 },
          { type: 'diamond' as const, enemyTypes: [EnemyType.WASP], spacing: 55 },
          { type: 'line' as const, enemyTypes: allEnemies, spacing: 45 },
          { type: 'inverted-v' as const, enemyTypes: [EnemyType.DRONE], spacing: 50 },
        ]
      },
      // Wave 10: High intensity
      { wave: 10, min: 30, max: 35, enemies: allEnemies,
        formations: [
          { type: 'circle' as const, enemyTypes: [EnemyType.WASP, EnemyType.SWARMER], spacing: 60 },
          { type: 'x' as const, enemyTypes: [EnemyType.DRONE], spacing: 50 },
          { type: 'arc' as const, enemyTypes: allEnemies, spacing: 55 },
          { type: 'grid' as const, enemyTypes: [EnemyType.SWARMER], spacing: 50 },
          { type: 'scattered' as const, enemyTypes: allEnemies, spacing: 60 },
        ]
      },
      // Wave 11: Maximum pressure before boss
      { wave: 11, min: 35, max: 40, enemies: allEnemies,
        formations: [
          { type: 'wedge' as const, enemyTypes: [EnemyType.DRONE, EnemyType.SWARMER], spacing: 50 },
          { type: 'spiral' as const, enemyTypes: [EnemyType.WASP], spacing: 55 },
          { type: 'cross' as const, enemyTypes: allEnemies, spacing: 50 },
          { type: 'wave' as const, enemyTypes: [EnemyType.DRONE], spacing: 45 },
          { type: 'diamond' as const, enemyTypes: allEnemies, spacing: 55 },
        ]
      },
    ]

    // Create waves from configs
    waveConfigs.forEach(config => {
      waves.push({
        waveNumber: config.wave,
        buckets: [{
          formations: config.formations,
          minEnemies: config.min,
          maxEnemies: config.max,
        }],
        isBoss: false,
        isMiniBoss: false,
      })
    })

    // Wave 6: Mini-Boss (Prototype Bomber)
    waves.splice(5, 0, {
      waveNumber: 6,
      buckets: [{
        formations: [
          { type: 'single', enemyTypes: [EnemyType.PROTOTYPE_BOMBER], count: 1 },
          { type: 'arc', enemyTypes: [EnemyType.DRONE, EnemyType.WASP], spacing: 50 },
          { type: 'scattered', enemyTypes: [EnemyType.DRONE], spacing: 60 }
        ],
        minEnemies: 15,
        maxEnemies: 20,
      }],
      isBoss: false,
      isMiniBoss: true,
      description: 'Prototype Bomber',
    })

    // Wave 12: Scout Commander Boss
    waves.push({
      waveNumber: 12,
      buckets: [{
        formations: [
          { type: 'single', enemyTypes: [EnemyType.SCOUT_COMMANDER], count: 1 },
          { type: 'circle', enemyTypes: allEnemies, spacing: 65 },
          { type: 'spiral', enemyTypes: [EnemyType.SWARMER], spacing: 50 },
          { type: 'diamond', enemyTypes: [EnemyType.WASP], spacing: 55 }
        ],
        minEnemies: 20,
        maxEnemies: 30,
      }],
      isBoss: true,
      isMiniBoss: false,
      description: 'Scout Commander',
    })

    return { level: 1, totalWaves: 12, waves }
  }

  private generateLevel2Waves(): LevelWaves {
    // Level 2: Tank Twins (10 waves)
    // Introduces: TANK (wave 1) → SNIPER (wave 3) → HUNTER (wave 6)
    // Also has previous level enemies
    const waves: Wave[] = []
    const prevEnemies = [EnemyType.DRONE, EnemyType.WASP, EnemyType.SWARMER]

    const waveConfigs = [
      // Wave 1: Introduce TANK
      { wave: 1, min: 6, max: 8, formations: [
        { type: 'wedge' as const, enemyTypes: [EnemyType.TANK], spacing: 55 },
        { type: 'line' as const, enemyTypes: prevEnemies, spacing: 45 },
        { type: 'scattered' as const, enemyTypes: prevEnemies, spacing: 60 },
      ]},
      // Wave 2: Mix TANK with previous
      { wave: 2, min: 10, max: 12, formations: [
        { type: 'column' as const, enemyTypes: [EnemyType.TANK], spacing: 60 },
        { type: 'arc' as const, enemyTypes: prevEnemies, spacing: 50 },
        { type: 'diamond' as const, enemyTypes: [EnemyType.WASP], spacing: 55 },
      ]},
      // Wave 3: Introduce SNIPER
      { wave: 3, min: 14, max: 16, formations: [
        { type: 'line' as const, enemyTypes: [EnemyType.SNIPER], spacing: 60 },
        { type: 'grid' as const, enemyTypes: [EnemyType.TANK], spacing: 50 },
        { type: 'wave' as const, enemyTypes: prevEnemies, spacing: 45 },
        { type: 'scattered' as const, enemyTypes: [EnemyType.DRONE, EnemyType.SWARMER], spacing: 55 },
      ]},
      // Wave 4: Build up before mini-boss
      { wave: 4, min: 18, max: 20, formations: [
        { type: 'inverted-v' as const, enemyTypes: [EnemyType.SNIPER], spacing: 65 },
        { type: 'x' as const, enemyTypes: [EnemyType.TANK], spacing: 50 },
        { type: 'spiral' as const, enemyTypes: prevEnemies, spacing: 50 },
        { type: 'arc' as const, enemyTypes: [EnemyType.WASP, EnemyType.SWARMER], spacing: 55 },
      ]},
      // Wave 6: Introduce HUNTER after mini-boss
      { wave: 6, min: 22, max: 26, formations: [
        { type: 'v' as const, enemyTypes: [EnemyType.HUNTER], spacing: 50 },
        { type: 'cross' as const, enemyTypes: [EnemyType.TANK, EnemyType.SNIPER], spacing: 55 },
        { type: 'circle' as const, enemyTypes: prevEnemies, spacing: 60 },
        { type: 'wedge' as const, enemyTypes: [EnemyType.DRONE], spacing: 45 },
      ]},
      // Wave 7: All new enemies combined
      { wave: 7, min: 26, max: 30, formations: [
        { type: 'diamond' as const, enemyTypes: [EnemyType.HUNTER, EnemyType.SNIPER], spacing: 60 },
        { type: 'grid' as const, enemyTypes: [EnemyType.TANK], spacing: 50 },
        { type: 'wave' as const, enemyTypes: prevEnemies, spacing: 45 },
        { type: 'scattered' as const, enemyTypes: [EnemyType.WASP, EnemyType.SWARMER], spacing: 55 },
      ]},
      // Wave 8: Escalation
      { wave: 8, min: 30, max: 34, formations: [
        { type: 'spiral' as const, enemyTypes: [EnemyType.HUNTER], spacing: 55 },
        { type: 'column' as const, enemyTypes: [EnemyType.SNIPER], spacing: 65 },
        { type: 'x' as const, enemyTypes: [EnemyType.TANK], spacing: 50 },
        { type: 'arc' as const, enemyTypes: prevEnemies, spacing: 50 },
        { type: 'line' as const, enemyTypes: [EnemyType.DRONE, EnemyType.WASP], spacing: 45 },
      ]},
      // Wave 9: Maximum pressure
      { wave: 9, min: 34, max: 38, formations: [
        { type: 'circle' as const, enemyTypes: [EnemyType.HUNTER, EnemyType.TANK], spacing: 65 },
        { type: 'wedge' as const, enemyTypes: [EnemyType.SNIPER], spacing: 60 },
        { type: 'grid' as const, enemyTypes: prevEnemies, spacing: 50 },
        { type: 'inverted-v' as const, enemyTypes: [EnemyType.WASP, EnemyType.SWARMER], spacing: 50 },
        { type: 'cross' as const, enemyTypes: [EnemyType.DRONE], spacing: 45 },
      ]},
    ]

    waveConfigs.forEach(config => {
      waves.push({
        waveNumber: config.wave,
        buckets: [{ formations: config.formations, minEnemies: config.min, maxEnemies: config.max }],
        isBoss: false,
        isMiniBoss: false,
      })
    })

    // Wave 5: Mini-Boss (Void Herald)
    waves.splice(4, 0, {
      waveNumber: 5,
      buckets: [{
        formations: [
          { type: 'single', enemyTypes: [EnemyType.VOID_HERALD], count: 1 },
          { type: 'spiral', enemyTypes: [EnemyType.TANK, EnemyType.SNIPER], spacing: 55 },
          { type: 'wave', enemyTypes: prevEnemies, spacing: 50 }
        ],
        minEnemies: 18,
        maxEnemies: 24,
      }],
      isBoss: false,
      isMiniBoss: true,
      description: 'Void Herald',
    })

    // Wave 10: Tank Twins Boss
    waves.push({
      waveNumber: 10,
      buckets: [{
        formations: [
          { type: 'single', enemyTypes: [EnemyType.TANK_TWIN], count: 2 },
          { type: 'circle', enemyTypes: [EnemyType.HUNTER, EnemyType.SNIPER], spacing: 65 },
          { type: 'x', enemyTypes: [EnemyType.TANK], spacing: 55 },
          { type: 'diamond', enemyTypes: prevEnemies, spacing: 50 }
        ],
        minEnemies: 25,
        maxEnemies: 35,
      }],
      isBoss: true,
      isMiniBoss: false,
      description: 'Twin Terrors',
    })

    return { level: 2, totalWaves: 10, waves }
  }

  private generateLevel3Waves(): LevelWaves {
    // Level 3: Hive Queen (13 waves)
    // Introduces: PATROLLER (wave 1) → TURRET (wave 4) → BOMBER (wave 8)
    const waves: Wave[] = []
    const prevEnemies = [EnemyType.DRONE, EnemyType.WASP, EnemyType.SWARMER, EnemyType.TANK, EnemyType.SNIPER, EnemyType.HUNTER]

    const waveConfigs = [
      // Wave 1: Introduce PATROLLER
      { wave: 1, min: 8, max: 10, formations: [
        { type: 'circle' as const, enemyTypes: [EnemyType.PATROLLER], spacing: 65 },
        { type: 'line' as const, enemyTypes: prevEnemies, spacing: 45 },
        { type: 'scattered' as const, enemyTypes: [EnemyType.DRONE, EnemyType.WASP], spacing: 55 },
      ]},
      // Wave 2
      { wave: 2, min: 12, max: 14, formations: [
        { type: 'arc' as const, enemyTypes: [EnemyType.PATROLLER], spacing: 60 },
        { type: 'wedge' as const, enemyTypes: [EnemyType.TANK, EnemyType.HUNTER], spacing: 50 },
        { type: 'diamond' as const, enemyTypes: [EnemyType.WASP], spacing: 55 },
      ]},
      // Wave 3
      { wave: 3, min: 16, max: 18, formations: [
        { type: 'spiral' as const, enemyTypes: [EnemyType.PATROLLER], spacing: 55 },
        { type: 'grid' as const, enemyTypes: [EnemyType.TANK, EnemyType.SNIPER], spacing: 50 },
        { type: 'wave' as const, enemyTypes: [EnemyType.DRONE, EnemyType.SWARMER], spacing: 45 },
        { type: 'inverted-v' as const, enemyTypes: [EnemyType.HUNTER], spacing: 50 },
      ]},
      // Wave 4: Introduce TURRET
      { wave: 4, min: 20, max: 22, formations: [
        { type: 'line' as const, enemyTypes: [EnemyType.TURRET], spacing: 70 },
        { type: 'x' as const, enemyTypes: [EnemyType.PATROLLER], spacing: 55 },
        { type: 'cross' as const, enemyTypes: prevEnemies, spacing: 50 },
        { type: 'arc' as const, enemyTypes: [EnemyType.WASP, EnemyType.HUNTER], spacing: 50 },
      ]},
      // Wave 5
      { wave: 5, min: 24, max: 26, formations: [
        { type: 'column' as const, enemyTypes: [EnemyType.TURRET], spacing: 65 },
        { type: 'diamond' as const, enemyTypes: [EnemyType.PATROLLER], spacing: 55 },
        { type: 'wedge' as const, enemyTypes: [EnemyType.TANK, EnemyType.SNIPER], spacing: 50 },
        { type: 'scattered' as const, enemyTypes: [EnemyType.DRONE, EnemyType.SWARMER], spacing: 55 },
      ]},
      // Wave 7: After mini-boss
      { wave: 7, min: 28, max: 32, formations: [
        { type: 'grid' as const, enemyTypes: [EnemyType.TURRET, EnemyType.PATROLLER], spacing: 60 },
        { type: 'v' as const, enemyTypes: [EnemyType.HUNTER, EnemyType.SNIPER], spacing: 50 },
        { type: 'spiral' as const, enemyTypes: [EnemyType.WASP, EnemyType.SWARMER], spacing: 50 },
        { type: 'line' as const, enemyTypes: [EnemyType.TANK], spacing: 45 },
      ]},
      // Wave 8: Introduce BOMBER
      { wave: 8, min: 32, max: 36, formations: [
        { type: 'v' as const, enemyTypes: [EnemyType.BOMBER], spacing: 60 },
        { type: 'circle' as const, enemyTypes: [EnemyType.TURRET], spacing: 65 },
        { type: 'cross' as const, enemyTypes: [EnemyType.PATROLLER, EnemyType.HUNTER], spacing: 55 },
        { type: 'wave' as const, enemyTypes: prevEnemies, spacing: 45 },
      ]},
      // Wave 9
      { wave: 9, min: 36, max: 40, formations: [
        { type: 'wedge' as const, enemyTypes: [EnemyType.BOMBER], spacing: 55 },
        { type: 'x' as const, enemyTypes: [EnemyType.TURRET, EnemyType.PATROLLER], spacing: 55 },
        { type: 'diamond' as const, enemyTypes: [EnemyType.TANK, EnemyType.HUNTER], spacing: 50 },
        { type: 'arc' as const, enemyTypes: [EnemyType.WASP, EnemyType.SNIPER], spacing: 50 },
        { type: 'scattered' as const, enemyTypes: [EnemyType.DRONE, EnemyType.SWARMER], spacing: 55 },
      ]},
      // Wave 10
      { wave: 10, min: 40, max: 44, formations: [
        { type: 'spiral' as const, enemyTypes: [EnemyType.BOMBER, EnemyType.PATROLLER], spacing: 55 },
        { type: 'grid' as const, enemyTypes: [EnemyType.TURRET], spacing: 60 },
        { type: 'inverted-v' as const, enemyTypes: [EnemyType.HUNTER, EnemyType.SNIPER], spacing: 50 },
        { type: 'circle' as const, enemyTypes: [EnemyType.WASP, EnemyType.SWARMER], spacing: 60 },
      ]},
      // Wave 11
      { wave: 11, min: 44, max: 48, formations: [
        { type: 'cross' as const, enemyTypes: [EnemyType.BOMBER, EnemyType.TURRET], spacing: 60 },
        { type: 'wedge' as const, enemyTypes: [EnemyType.PATROLLER], spacing: 50 },
        { type: 'x' as const, enemyTypes: [EnemyType.TANK, EnemyType.HUNTER], spacing: 50 },
        { type: 'wave' as const, enemyTypes: [EnemyType.WASP, EnemyType.SNIPER], spacing: 45 },
        { type: 'diamond' as const, enemyTypes: [EnemyType.DRONE], spacing: 50 },
      ]},
      // Wave 12
      { wave: 12, min: 48, max: 52, formations: [
        { type: 'circle' as const, enemyTypes: [EnemyType.BOMBER, EnemyType.TURRET, EnemyType.PATROLLER], spacing: 65 },
        { type: 'spiral' as const, enemyTypes: [EnemyType.HUNTER, EnemyType.SNIPER], spacing: 55 },
        { type: 'grid' as const, enemyTypes: [EnemyType.TANK], spacing: 50 },
        { type: 'arc' as const, enemyTypes: [EnemyType.WASP, EnemyType.SWARMER], spacing: 50 },
      ]},
    ]

    waveConfigs.forEach(config => {
      waves.push({
        waveNumber: config.wave,
        buckets: [{ formations: config.formations, minEnemies: config.min, maxEnemies: config.max }],
        isBoss: false,
        isMiniBoss: false,
      })
    })

    // Wave 6: Mini-Boss (Assault Cruiser)
    waves.splice(5, 0, {
      waveNumber: 6,
      buckets: [{
        formations: [
          { type: 'single', enemyTypes: [EnemyType.ASSAULT_CRUISER], count: 1 },
          { type: 'circle', enemyTypes: [EnemyType.TURRET, EnemyType.PATROLLER], spacing: 65 },
          { type: 'diamond', enemyTypes: prevEnemies, spacing: 55 }
        ],
        minEnemies: 22,
        maxEnemies: 30,
      }],
      isBoss: false,
      isMiniBoss: true,
      description: 'Assault Cruiser',
    })

    // Wave 13: Hive Queen Boss
    waves.push({
      waveNumber: 13,
      buckets: [{
        formations: [
          { type: 'single', enemyTypes: [EnemyType.HIVE_QUEEN], count: 1 },
          { type: 'spiral', enemyTypes: [EnemyType.BOMBER, EnemyType.TURRET], spacing: 55 },
          { type: 'circle', enemyTypes: [EnemyType.PATROLLER, EnemyType.HUNTER], spacing: 65 },
          { type: 'wave', enemyTypes: prevEnemies, spacing: 45 }
        ],
        minEnemies: 30,
        maxEnemies: 45,
      }],
      isBoss: true,
      isMiniBoss: false,
      description: 'Hive Queen',
    })

    return { level: 3, totalWaves: 13, waves }
  }

  private generateLevel4Waves(): LevelWaves {
    // Level 4: Orbital Devastator (11 waves)
    // Introduces: ORBITER (wave 1) → CHARGER (wave 4) → SPIRAL_SHOOTER (wave 7)
    const waves: Wave[] = []
    const prevEnemies = [EnemyType.DRONE, EnemyType.WASP, EnemyType.TANK, EnemyType.SNIPER, EnemyType.HUNTER, EnemyType.PATROLLER, EnemyType.TURRET, EnemyType.BOMBER]

    const waveConfigs = [
      { wave: 1, min: 10, max: 12, formations: [
        { type: 'circle' as const, enemyTypes: [EnemyType.ORBITER], spacing: 70 },
        { type: 'wedge' as const, enemyTypes: prevEnemies, spacing: 50 },
        { type: 'scattered' as const, enemyTypes: [EnemyType.DRONE, EnemyType.WASP], spacing: 55 },
      ]},
      { wave: 2, min: 14, max: 16, formations: [
        { type: 'spiral' as const, enemyTypes: [EnemyType.ORBITER], spacing: 60 },
        { type: 'diamond' as const, enemyTypes: [EnemyType.BOMBER, EnemyType.HUNTER], spacing: 55 },
        { type: 'arc' as const, enemyTypes: [EnemyType.TANK, EnemyType.SNIPER], spacing: 50 },
      ]},
      { wave: 3, min: 18, max: 20, formations: [
        { type: 'x' as const, enemyTypes: [EnemyType.ORBITER], spacing: 60 },
        { type: 'grid' as const, enemyTypes: [EnemyType.TURRET, EnemyType.PATROLLER], spacing: 55 },
        { type: 'wave' as const, enemyTypes: prevEnemies, spacing: 45 },
      ]},
      { wave: 4, min: 22, max: 24, formations: [
        { type: 'wedge' as const, enemyTypes: [EnemyType.CHARGER], spacing: 55 },
        { type: 'circle' as const, enemyTypes: [EnemyType.ORBITER], spacing: 65 },
        { type: 'inverted-v' as const, enemyTypes: [EnemyType.BOMBER, EnemyType.HUNTER], spacing: 50 },
        { type: 'line' as const, enemyTypes: [EnemyType.TANK], spacing: 45 },
      ]},
      { wave: 6, min: 26, max: 30, formations: [
        { type: 'v' as const, enemyTypes: [EnemyType.CHARGER, EnemyType.ORBITER], spacing: 55 },
        { type: 'cross' as const, enemyTypes: [EnemyType.TURRET, EnemyType.PATROLLER], spacing: 55 },
        { type: 'diamond' as const, enemyTypes: prevEnemies, spacing: 50 },
        { type: 'scattered' as const, enemyTypes: [EnemyType.WASP, EnemyType.DRONE], spacing: 55 },
      ]},
      { wave: 7, min: 30, max: 34, formations: [
        { type: 'spiral' as const, enemyTypes: [EnemyType.SPIRAL_SHOOTER], spacing: 65 },
        { type: 'grid' as const, enemyTypes: [EnemyType.CHARGER], spacing: 50 },
        { type: 'arc' as const, enemyTypes: [EnemyType.ORBITER], spacing: 60 },
        { type: 'wave' as const, enemyTypes: prevEnemies, spacing: 45 },
      ]},
      { wave: 8, min: 34, max: 38, formations: [
        { type: 'x' as const, enemyTypes: [EnemyType.SPIRAL_SHOOTER, EnemyType.ORBITER], spacing: 60 },
        { type: 'column' as const, enemyTypes: [EnemyType.CHARGER], spacing: 55 },
        { type: 'circle' as const, enemyTypes: [EnemyType.BOMBER, EnemyType.TURRET], spacing: 65 },
        { type: 'wedge' as const, enemyTypes: prevEnemies, spacing: 50 },
      ]},
      { wave: 9, min: 38, max: 42, formations: [
        { type: 'circle' as const, enemyTypes: [EnemyType.SPIRAL_SHOOTER], spacing: 70 },
        { type: 'cross' as const, enemyTypes: [EnemyType.CHARGER, EnemyType.ORBITER], spacing: 55 },
        { type: 'spiral' as const, enemyTypes: [EnemyType.BOMBER, EnemyType.HUNTER], spacing: 55 },
        { type: 'grid' as const, enemyTypes: [EnemyType.TANK, EnemyType.SNIPER], spacing: 50 },
      ]},
      { wave: 10, min: 42, max: 46, formations: [
        { type: 'diamond' as const, enemyTypes: [EnemyType.SPIRAL_SHOOTER, EnemyType.CHARGER], spacing: 60 },
        { type: 'inverted-v' as const, enemyTypes: [EnemyType.ORBITER], spacing: 55 },
        { type: 'x' as const, enemyTypes: [EnemyType.TURRET, EnemyType.PATROLLER], spacing: 50 },
        { type: 'arc' as const, enemyTypes: prevEnemies, spacing: 50 },
      ]},
    ]

    waveConfigs.forEach(config => {
      waves.push({
        waveNumber: config.wave,
        buckets: [{ formations: config.formations, minEnemies: config.min, maxEnemies: config.max }],
        isBoss: false,
        isMiniBoss: false,
      })
    })

    waves.splice(4, 0, {
      waveNumber: 5,
      buckets: [{
        formations: [
          { type: 'single', enemyTypes: [EnemyType.BATTLE_COORDINATOR], count: 1 },
          { type: 'spiral', enemyTypes: [EnemyType.ORBITER, EnemyType.CHARGER], spacing: 60 },
          { type: 'v', enemyTypes: prevEnemies, spacing: 55 }
        ],
        minEnemies: 24,
        maxEnemies: 32,
      }],
      isBoss: false,
      isMiniBoss: true,
      description: 'Battle Coordinator',
    })

    waves.push({
      waveNumber: 11,
      buckets: [{
        formations: [
          { type: 'single', enemyTypes: [EnemyType.ORBITAL_DEVASTATOR], count: 1 },
          { type: 'circle', enemyTypes: [EnemyType.SPIRAL_SHOOTER, EnemyType.ORBITER], spacing: 70 },
          { type: 'spiral', enemyTypes: [EnemyType.CHARGER], spacing: 60 },
          { type: 'diamond', enemyTypes: prevEnemies, spacing: 55 }
        ],
        minEnemies: 35,
        maxEnemies: 50,
      }],
      isBoss: true,
      isMiniBoss: false,
      description: 'Orbital Devastator',
    })

    return { level: 4, totalWaves: 11, waves }
  }

  private generateLevel5Waves(): LevelWaves {
    // Level 5: Fractured Titan (14 waves)
    // Introduces: SPLITTER (wave 1) → SPAWNER (wave 4) → HEALER (wave 8)
    const waves: Wave[] = []
    const prevEnemies = [EnemyType.WASP, EnemyType.TANK, EnemyType.SNIPER, EnemyType.HUNTER, EnemyType.PATROLLER, EnemyType.BOMBER, EnemyType.CHARGER]

    const waveConfigs = [
      { wave: 1, min: 12, max: 14, formations: [
        { type: 'diamond' as const, enemyTypes: [EnemyType.SPLITTER], spacing: 60 },
        { type: 'line' as const, enemyTypes: prevEnemies, spacing: 45 },
        { type: 'scattered' as const, enemyTypes: [EnemyType.WASP, EnemyType.HUNTER], spacing: 55 },
      ]},
      { wave: 2, min: 16, max: 18, formations: [
        { type: 'x' as const, enemyTypes: [EnemyType.SPLITTER], spacing: 55 },
        { type: 'wedge' as const, enemyTypes: [EnemyType.BOMBER, EnemyType.CHARGER], spacing: 50 },
        { type: 'arc' as const, enemyTypes: prevEnemies, spacing: 50 },
      ]},
      { wave: 3, min: 20, max: 22, formations: [
        { type: 'grid' as const, enemyTypes: [EnemyType.SPLITTER], spacing: 55 },
        { type: 'spiral' as const, enemyTypes: [EnemyType.TANK, EnemyType.HUNTER], spacing: 50 },
        { type: 'wave' as const, enemyTypes: [EnemyType.WASP], spacing: 45 },
      ]},
      { wave: 4, min: 24, max: 26, formations: [
        { type: 'circle' as const, enemyTypes: [EnemyType.SPAWNER], spacing: 65 },
        { type: 'wedge' as const, enemyTypes: [EnemyType.SPLITTER], spacing: 50 },
        { type: 'inverted-v' as const, enemyTypes: prevEnemies, spacing: 50 },
        { type: 'line' as const, enemyTypes: [EnemyType.CHARGER], spacing: 45 },
      ]},
      { wave: 5, min: 28, max: 30, formations: [
        { type: 'v' as const, enemyTypes: [EnemyType.SPAWNER, EnemyType.SPLITTER], spacing: 55 },
        { type: 'cross' as const, enemyTypes: [EnemyType.BOMBER, EnemyType.PATROLLER], spacing: 55 },
        { type: 'diamond' as const, enemyTypes: prevEnemies, spacing: 50 },
      ]},
      { wave: 6, min: 32, max: 34, formations: [
        { type: 'spiral' as const, enemyTypes: [EnemyType.SPAWNER], spacing: 60 },
        { type: 'grid' as const, enemyTypes: [EnemyType.SPLITTER], spacing: 50 },
        { type: 'arc' as const, enemyTypes: [EnemyType.CHARGER, EnemyType.HUNTER], spacing: 50 },
        { type: 'scattered' as const, enemyTypes: [EnemyType.WASP], spacing: 55 },
      ]},
      { wave: 8, min: 36, max: 40, formations: [
        { type: 'column' as const, enemyTypes: [EnemyType.HEALER], spacing: 65 },
        { type: 'circle' as const, enemyTypes: [EnemyType.SPAWNER, EnemyType.SPLITTER], spacing: 65 },
        { type: 'x' as const, enemyTypes: prevEnemies, spacing: 50 },
        { type: 'wave' as const, enemyTypes: [EnemyType.BOMBER], spacing: 45 },
      ]},
      { wave: 9, min: 40, max: 44, formations: [
        { type: 'diamond' as const, enemyTypes: [EnemyType.HEALER, EnemyType.SPAWNER], spacing: 65 },
        { type: 'wedge' as const, enemyTypes: [EnemyType.SPLITTER], spacing: 50 },
        { type: 'spiral' as const, enemyTypes: [EnemyType.CHARGER, EnemyType.HUNTER], spacing: 55 },
        { type: 'grid' as const, enemyTypes: prevEnemies, spacing: 50 },
      ]},
      { wave: 10, min: 44, max: 48, formations: [
        { type: 'circle' as const, enemyTypes: [EnemyType.HEALER], spacing: 70 },
        { type: 'cross' as const, enemyTypes: [EnemyType.SPAWNER, EnemyType.SPLITTER], spacing: 60 },
        { type: 'inverted-v' as const, enemyTypes: [EnemyType.BOMBER, EnemyType.PATROLLER], spacing: 50 },
        { type: 'arc' as const, enemyTypes: prevEnemies, spacing: 50 },
      ]},
      { wave: 11, min: 48, max: 52, formations: [
        { type: 'spiral' as const, enemyTypes: [EnemyType.HEALER, EnemyType.SPAWNER], spacing: 65 },
        { type: 'x' as const, enemyTypes: [EnemyType.SPLITTER], spacing: 55 },
        { type: 'wedge' as const, enemyTypes: [EnemyType.CHARGER, EnemyType.HUNTER], spacing: 50 },
        { type: 'diamond' as const, enemyTypes: prevEnemies, spacing: 50 },
      ]},
      { wave: 12, min: 52, max: 56, formations: [
        { type: 'grid' as const, enemyTypes: [EnemyType.HEALER, EnemyType.SPAWNER, EnemyType.SPLITTER], spacing: 60 },
        { type: 'circle' as const, enemyTypes: [EnemyType.BOMBER, EnemyType.CHARGER], spacing: 65 },
        { type: 'wave' as const, enemyTypes: prevEnemies, spacing: 45 },
      ]},
      { wave: 13, min: 56, max: 60, formations: [
        { type: 'cross' as const, enemyTypes: [EnemyType.HEALER, EnemyType.SPAWNER], spacing: 65 },
        { type: 'spiral' as const, enemyTypes: [EnemyType.SPLITTER], spacing: 55 },
        { type: 'inverted-v' as const, enemyTypes: [EnemyType.TANK, EnemyType.HUNTER], spacing: 50 },
        { type: 'arc' as const, enemyTypes: [EnemyType.WASP, EnemyType.BOMBER], spacing: 50 },
      ]},
    ]

    waveConfigs.forEach(config => {
      waves.push({
        waveNumber: config.wave,
        buckets: [{ formations: config.formations, minEnemies: config.min, maxEnemies: config.max }],
        isBoss: false,
        isMiniBoss: false,
      })
    })

    waves.splice(6, 0, {
      waveNumber: 7,
      buckets: [{
        formations: [
          { type: 'single', enemyTypes: [EnemyType.PROTOTYPE_BOMBER], count: 1 },
          { type: 'circle', enemyTypes: [EnemyType.SPAWNER, EnemyType.SPLITTER], spacing: 65 },
          { type: 'line', enemyTypes: prevEnemies, spacing: 50 }
        ],
        minEnemies: 28,
        maxEnemies: 36,
      }],
      isBoss: false,
      isMiniBoss: true,
      description: 'Prototype Bomber',
    })

    waves.push({
      waveNumber: 14,
      buckets: [{
        formations: [
          { type: 'single', enemyTypes: [EnemyType.FRACTURED_TITAN], count: 1 },
          { type: 'circle', enemyTypes: [EnemyType.HEALER, EnemyType.SPAWNER], spacing: 70 },
          { type: 'spiral', enemyTypes: [EnemyType.SPLITTER], spacing: 60 },
          { type: 'v', enemyTypes: prevEnemies, spacing: 55 }
        ],
        minEnemies: 40,
        maxEnemies: 55,
      }],
      isBoss: true,
      isMiniBoss: false,
      description: 'Fractured Titan',
    })

    return { level: 5, totalWaves: 14, waves }
  }

  private generateLevel6Waves(): LevelWaves {
    // Level 6: Shield Warden (10 waves)
    // Introduces: SHIELDED (wave 1) → EXPLODER (wave 4) → DRONE (reintroduced wave 7)
    const waves: Wave[] = []
    const prevEnemies = [EnemyType.WASP, EnemyType.TANK, EnemyType.HUNTER, EnemyType.BOMBER, EnemyType.SPLITTER, EnemyType.SPAWNER, EnemyType.HEALER]

    const waveConfigs = [
      { wave: 1, min: 14, max: 16, formations: [
        { type: 'grid' as const, enemyTypes: [EnemyType.SHIELDED], spacing: 60 },
        { type: 'wedge' as const, enemyTypes: prevEnemies, spacing: 50 },
        { type: 'scattered' as const, enemyTypes: [EnemyType.WASP, EnemyType.HUNTER], spacing: 55 },
      ]},
      { wave: 2, min: 18, max: 20, formations: [
        { type: 'inverted-v' as const, enemyTypes: [EnemyType.SHIELDED], spacing: 60 },
        { type: 'spiral' as const, enemyTypes: [EnemyType.BOMBER, EnemyType.SPLITTER], spacing: 55 },
        { type: 'arc' as const, enemyTypes: prevEnemies, spacing: 50 },
      ]},
      { wave: 3, min: 22, max: 24, formations: [
        { type: 'diamond' as const, enemyTypes: [EnemyType.SHIELDED], spacing: 65 },
        { type: 'x' as const, enemyTypes: [EnemyType.TANK, EnemyType.HUNTER], spacing: 50 },
        { type: 'wave' as const, enemyTypes: prevEnemies, spacing: 45 },
      ]},
      { wave: 4, min: 26, max: 28, formations: [
        { type: 'scattered' as const, enemyTypes: [EnemyType.EXPLODER], spacing: 60 },
        { type: 'column' as const, enemyTypes: [EnemyType.SHIELDED], spacing: 65 },
        { type: 'cross' as const, enemyTypes: prevEnemies, spacing: 50 },
        { type: 'line' as const, enemyTypes: [EnemyType.BOMBER], spacing: 45 },
      ]},
      { wave: 6, min: 30, max: 34, formations: [
        { type: 'x' as const, enemyTypes: [EnemyType.EXPLODER, EnemyType.SHIELDED], spacing: 60 },
        { type: 'circle' as const, enemyTypes: [EnemyType.SPAWNER, EnemyType.HEALER], spacing: 65 },
        { type: 'wedge' as const, enemyTypes: prevEnemies, spacing: 50 },
      ]},
      { wave: 7, min: 34, max: 38, formations: [
        { type: 'line' as const, enemyTypes: [EnemyType.DRONE], spacing: 45 },
        { type: 'spiral' as const, enemyTypes: [EnemyType.EXPLODER], spacing: 55 },
        { type: 'grid' as const, enemyTypes: [EnemyType.SHIELDED], spacing: 60 },
        { type: 'arc' as const, enemyTypes: prevEnemies, spacing: 50 },
      ]},
      { wave: 8, min: 38, max: 42, formations: [
        { type: 'v' as const, enemyTypes: [EnemyType.DRONE, EnemyType.EXPLODER], spacing: 50 },
        { type: 'diamond' as const, enemyTypes: [EnemyType.SHIELDED], spacing: 65 },
        { type: 'cross' as const, enemyTypes: [EnemyType.BOMBER, EnemyType.SPLITTER], spacing: 55 },
        { type: 'wave' as const, enemyTypes: prevEnemies, spacing: 45 },
      ]},
      { wave: 9, min: 42, max: 46, formations: [
        { type: 'circle' as const, enemyTypes: [EnemyType.EXPLODER, EnemyType.SHIELDED], spacing: 65 },
        { type: 'wedge' as const, enemyTypes: [EnemyType.DRONE], spacing: 45 },
        { type: 'spiral' as const, enemyTypes: [EnemyType.HEALER, EnemyType.SPAWNER], spacing: 60 },
        { type: 'inverted-v' as const, enemyTypes: prevEnemies, spacing: 50 },
      ]},
    ]

    waveConfigs.forEach(config => {
      waves.push({
        waveNumber: config.wave,
        buckets: [{ formations: config.formations, minEnemies: config.min, maxEnemies: config.max }],
        isBoss: false,
        isMiniBoss: false,
      })
    })

    waves.splice(4, 0, {
      waveNumber: 5,
      buckets: [{
        formations: [
          { type: 'single', enemyTypes: [EnemyType.VOID_HERALD], count: 1 },
          { type: 'circle', enemyTypes: [EnemyType.SHIELDED, EnemyType.EXPLODER], spacing: 65 },
          { type: 'diamond', enemyTypes: prevEnemies, spacing: 55 }
        ],
        minEnemies: 26,
        maxEnemies: 34,
      }],
      isBoss: false,
      isMiniBoss: true,
      description: 'Void Herald',
    })

    waves.push({
      waveNumber: 10,
      buckets: [{
        formations: [
          { type: 'single', enemyTypes: [EnemyType.SHIELD_WARDEN], count: 1 },
          { type: 'single', enemyTypes: [EnemyType.SHIELDED], count: 8 },
          { type: 'spiral', enemyTypes: [EnemyType.EXPLODER], spacing: 55 },
          { type: 'wave', enemyTypes: [EnemyType.DRONE, ...prevEnemies], spacing: 50 }
        ],
        minEnemies: 35,
        maxEnemies: 50,
      }],
      isBoss: true,
      isMiniBoss: false,
      description: 'Shield Warden',
    })

    return { level: 6, totalWaves: 10, waves }
  }

  private generateLevel7Waves(): LevelWaves {
    // Level 7: Bomber Squadron (12 waves)
    // Re-uses: WASP (wave 1), TANK (wave 4), SNIPER (wave 7)
    const waves: Wave[] = []
    const baseEnemies = [EnemyType.HUNTER, EnemyType.BOMBER, EnemyType.EXPLODER, EnemyType.CHARGER]

    const waveConfigs = [
      { wave: 1, min: 16, max: 18, formations: [
        { type: 'v' as const, enemyTypes: [EnemyType.WASP], spacing: 50 },
        { type: 'line' as const, enemyTypes: baseEnemies, spacing: 45 },
        { type: 'scattered' as const, enemyTypes: [EnemyType.BOMBER, EnemyType.HUNTER], spacing: 55 },
      ]},
      { wave: 2, min: 20, max: 22, formations: [
        { type: 'arc' as const, enemyTypes: [EnemyType.WASP], spacing: 50 },
        { type: 'wedge' as const, enemyTypes: [EnemyType.BOMBER, EnemyType.CHARGER], spacing: 50 },
        { type: 'diamond' as const, enemyTypes: baseEnemies, spacing: 55 },
      ]},
      { wave: 3, min: 24, max: 26, formations: [
        { type: 'spiral' as const, enemyTypes: [EnemyType.WASP], spacing: 50 },
        { type: 'grid' as const, enemyTypes: [EnemyType.BOMBER, EnemyType.EXPLODER], spacing: 55 },
        { type: 'wave' as const, enemyTypes: baseEnemies, spacing: 45 },
      ]},
      { wave: 4, min: 28, max: 30, formations: [
        { type: 'wedge' as const, enemyTypes: [EnemyType.TANK], spacing: 50 },
        { type: 'circle' as const, enemyTypes: [EnemyType.WASP], spacing: 60 },
        { type: 'inverted-v' as const, enemyTypes: [EnemyType.BOMBER], spacing: 50 },
        { type: 'x' as const, enemyTypes: baseEnemies, spacing: 50 },
      ]},
      { wave: 5, min: 32, max: 34, formations: [
        { type: 'column' as const, enemyTypes: [EnemyType.TANK], spacing: 55 },
        { type: 'cross' as const, enemyTypes: [EnemyType.WASP, EnemyType.BOMBER], spacing: 55 },
        { type: 'diamond' as const, enemyTypes: baseEnemies, spacing: 50 },
      ]},
      { wave: 7, min: 36, max: 40, formations: [
        { type: 'line' as const, enemyTypes: [EnemyType.SNIPER], spacing: 60 },
        { type: 'grid' as const, enemyTypes: [EnemyType.TANK], spacing: 50 },
        { type: 'spiral' as const, enemyTypes: [EnemyType.BOMBER, EnemyType.WASP], spacing: 55 },
        { type: 'arc' as const, enemyTypes: baseEnemies, spacing: 50 },
      ]},
      { wave: 8, min: 40, max: 44, formations: [
        { type: 'inverted-v' as const, enemyTypes: [EnemyType.SNIPER], spacing: 60 },
        { type: 'circle' as const, enemyTypes: [EnemyType.BOMBER, EnemyType.EXPLODER], spacing: 65 },
        { type: 'wedge' as const, enemyTypes: [EnemyType.TANK, EnemyType.WASP], spacing: 50 },
        { type: 'wave' as const, enemyTypes: baseEnemies, spacing: 45 },
      ]},
      { wave: 9, min: 44, max: 48, formations: [
        { type: 'x' as const, enemyTypes: [EnemyType.SNIPER, EnemyType.TANK], spacing: 55 },
        { type: 'diamond' as const, enemyTypes: [EnemyType.BOMBER], spacing: 55 },
        { type: 'spiral' as const, enemyTypes: [EnemyType.CHARGER, EnemyType.HUNTER], spacing: 55 },
        { type: 'scattered' as const, enemyTypes: [EnemyType.WASP, EnemyType.EXPLODER], spacing: 55 },
      ]},
      { wave: 10, min: 48, max: 52, formations: [
        { type: 'cross' as const, enemyTypes: [EnemyType.SNIPER, EnemyType.BOMBER], spacing: 60 },
        { type: 'circle' as const, enemyTypes: [EnemyType.TANK, EnemyType.WASP], spacing: 65 },
        { type: 'grid' as const, enemyTypes: [EnemyType.EXPLODER], spacing: 55 },
        { type: 'arc' as const, enemyTypes: baseEnemies, spacing: 50 },
      ]},
      { wave: 11, min: 52, max: 56, formations: [
        { type: 'spiral' as const, enemyTypes: [EnemyType.BOMBER, EnemyType.SNIPER], spacing: 60 },
        { type: 'wedge' as const, enemyTypes: [EnemyType.TANK, EnemyType.CHARGER], spacing: 50 },
        { type: 'inverted-v' as const, enemyTypes: [EnemyType.WASP, EnemyType.HUNTER], spacing: 50 },
        { type: 'diamond' as const, enemyTypes: [EnemyType.EXPLODER], spacing: 55 },
      ]},
    ]

    waveConfigs.forEach(config => {
      waves.push({
        waveNumber: config.wave,
        buckets: [{ formations: config.formations, minEnemies: config.min, maxEnemies: config.max }],
        isBoss: false,
        isMiniBoss: false,
      })
    })

    waves.splice(5, 0, {
      waveNumber: 6,
      buckets: [{
        formations: [
          { type: 'single', enemyTypes: [EnemyType.PROTOTYPE_BOMBER], count: 1 },
          { type: 'spiral', enemyTypes: [EnemyType.TANK, EnemyType.WASP], spacing: 55 },
          { type: 'line', enemyTypes: [...baseEnemies, EnemyType.SNIPER], spacing: 50 }
        ],
        minEnemies: 30,
        maxEnemies: 38,
      }],
      isBoss: false,
      isMiniBoss: true,
      description: 'Prototype Bomber',
    })

    waves.push({
      waveNumber: 12,
      buckets: [{
        formations: [
          { type: 'single', enemyTypes: [EnemyType.ACE_BOMBER], count: 1 },
          { type: 'single', enemyTypes: [EnemyType.ESCORT_BOMBER], count: 2 },
          { type: 'circle', enemyTypes: [EnemyType.SNIPER, EnemyType.TANK, EnemyType.WASP], spacing: 65 },
          { type: 'spiral', enemyTypes: [EnemyType.BOMBER, EnemyType.EXPLODER], spacing: 60 }
        ],
        minEnemies: 40,
        maxEnemies: 55,
      }],
      isBoss: true,
      isMiniBoss: false,
      description: 'Bomber Squadron',
    })

    return { level: 7, totalWaves: 12, waves }
  }

  private generateLevel8Waves(): LevelWaves {
    // Level 8: Void Nexus (15 waves with 2 mini-bosses)
    // Re-emphasizes: HUNTER, PATROLLER, BOMBER with CHARGER, SHIELDED, EXPLODER
    const waves: Wave[] = []
    const enemies = [EnemyType.HUNTER, EnemyType.PATROLLER, EnemyType.BOMBER, EnemyType.CHARGER, EnemyType.SHIELDED, EnemyType.EXPLODER]

    const waveConfigs = [
      { wave: 1, min: 18, max: 20, formations: [
        { type: 'v' as const, enemyTypes: [EnemyType.HUNTER, EnemyType.PATROLLER], spacing: 50 },
        { type: 'line' as const, enemyTypes: enemies, spacing: 45 },
        { type: 'scattered' as const, enemyTypes: [EnemyType.BOMBER], spacing: 55 },
      ]},
      { wave: 2, min: 22, max: 24, formations: [
        { type: 'arc' as const, enemyTypes: [EnemyType.HUNTER, EnemyType.CHARGER], spacing: 50 },
        { type: 'diamond' as const, enemyTypes: [EnemyType.SHIELDED], spacing: 60 },
        { type: 'wedge' as const, enemyTypes: enemies, spacing: 50 },
      ]},
      { wave: 3, min: 26, max: 28, formations: [
        { type: 'spiral' as const, enemyTypes: [EnemyType.BOMBER, EnemyType.PATROLLER], spacing: 55 },
        { type: 'grid' as const, enemyTypes: [EnemyType.SHIELDED], spacing: 60 },
        { type: 'wave' as const, enemyTypes: enemies, spacing: 45 },
      ]},
      { wave: 4, min: 30, max: 32, formations: [
        { type: 'cross' as const, enemyTypes: [EnemyType.EXPLODER], spacing: 60 },
        { type: 'circle' as const, enemyTypes: [EnemyType.HUNTER, EnemyType.BOMBER], spacing: 65 },
        { type: 'inverted-v' as const, enemyTypes: enemies, spacing: 50 },
      ]},
      { wave: 6, min: 34, max: 38, formations: [
        { type: 'x' as const, enemyTypes: [EnemyType.PATROLLER, EnemyType.HUNTER], spacing: 55 },
        { type: 'wedge' as const, enemyTypes: [EnemyType.EXPLODER, EnemyType.SHIELDED], spacing: 55 },
        { type: 'diamond' as const, enemyTypes: [EnemyType.BOMBER, EnemyType.CHARGER], spacing: 55 },
        { type: 'arc' as const, enemyTypes: enemies, spacing: 50 },
      ]},
      { wave: 7, min: 38, max: 42, formations: [
        { type: 'spiral' as const, enemyTypes: [EnemyType.HUNTER, EnemyType.CHARGER], spacing: 55 },
        { type: 'grid' as const, enemyTypes: [EnemyType.SHIELDED, EnemyType.EXPLODER], spacing: 60 },
        { type: 'v' as const, enemyTypes: [EnemyType.BOMBER, EnemyType.PATROLLER], spacing: 50 },
        { type: 'scattered' as const, enemyTypes: enemies, spacing: 55 },
      ]},
      { wave: 8, min: 42, max: 46, formations: [
        { type: 'circle' as const, enemyTypes: [EnemyType.EXPLODER], spacing: 65 },
        { type: 'cross' as const, enemyTypes: [EnemyType.SHIELDED, EnemyType.HUNTER], spacing: 60 },
        { type: 'wedge' as const, enemyTypes: [EnemyType.BOMBER, EnemyType.PATROLLER], spacing: 50 },
        { type: 'wave' as const, enemyTypes: enemies, spacing: 45 },
      ]},
      { wave: 9, min: 46, max: 50, formations: [
        { type: 'diamond' as const, enemyTypes: [EnemyType.PATROLLER, EnemyType.HUNTER, EnemyType.BOMBER], spacing: 60 },
        { type: 'inverted-v' as const, enemyTypes: [EnemyType.EXPLODER, EnemyType.CHARGER], spacing: 55 },
        { type: 'spiral' as const, enemyTypes: [EnemyType.SHIELDED], spacing: 60 },
        { type: 'arc' as const, enemyTypes: enemies, spacing: 50 },
      ]},
      { wave: 11, min: 50, max: 54, formations: [
        { type: 'grid' as const, enemyTypes: [EnemyType.HUNTER, EnemyType.BOMBER], spacing: 55 },
        { type: 'x' as const, enemyTypes: [EnemyType.SHIELDED, EnemyType.EXPLODER], spacing: 60 },
        { type: 'circle' as const, enemyTypes: [EnemyType.PATROLLER, EnemyType.CHARGER], spacing: 65 },
        { type: 'line' as const, enemyTypes: enemies, spacing: 45 },
      ]},
      { wave: 12, min: 54, max: 58, formations: [
        { type: 'cross' as const, enemyTypes: [EnemyType.BOMBER, EnemyType.PATROLLER], spacing: 60 },
        { type: 'wedge' as const, enemyTypes: [EnemyType.EXPLODER], spacing: 55 },
        { type: 'spiral' as const, enemyTypes: [EnemyType.HUNTER, EnemyType.CHARGER], spacing: 55 },
        { type: 'diamond' as const, enemyTypes: [EnemyType.SHIELDED], spacing: 60 },
      ]},
      { wave: 13, min: 58, max: 62, formations: [
        { type: 'circle' as const, enemyTypes: [EnemyType.HUNTER, EnemyType.BOMBER, EnemyType.PATROLLER], spacing: 65 },
        { type: 'inverted-v' as const, enemyTypes: [EnemyType.EXPLODER, EnemyType.SHIELDED], spacing: 60 },
        { type: 'grid' as const, enemyTypes: [EnemyType.CHARGER], spacing: 50 },
        { type: 'wave' as const, enemyTypes: enemies, spacing: 45 },
      ]},
      { wave: 14, min: 62, max: 66, formations: [
        { type: 'spiral' as const, enemyTypes: [EnemyType.PATROLLER, EnemyType.HUNTER], spacing: 60 },
        { type: 'x' as const, enemyTypes: [EnemyType.BOMBER, EnemyType.CHARGER], spacing: 55 },
        { type: 'column' as const, enemyTypes: [EnemyType.EXPLODER], spacing: 60 },
        { type: 'arc' as const, enemyTypes: [EnemyType.SHIELDED], spacing: 60 },
      ]},
    ]

    waveConfigs.forEach(config => {
      waves.push({
        waveNumber: config.wave,
        buckets: [{ formations: config.formations, minEnemies: config.min, maxEnemies: config.max }],
        isBoss: false,
        isMiniBoss: false,
      })
    })

    waves.splice(4, 0, {
      waveNumber: 5,
      buckets: [{
        formations: [
          { type: 'single', enemyTypes: [EnemyType.VOID_HERALD], count: 1 },
          { type: 'spiral', enemyTypes: [EnemyType.HUNTER, EnemyType.PATROLLER], spacing: 55 },
          { type: 'wave', enemyTypes: enemies, spacing: 50 }
        ],
        minEnemies: 28,
        maxEnemies: 36,
      }],
      isBoss: false,
      isMiniBoss: true,
      description: 'Void Herald',
    })

    waves.splice(9, 0, {
      waveNumber: 10,
      buckets: [{
        formations: [
          { type: 'single', enemyTypes: [EnemyType.VOID_HERALD], count: 1 },
          { type: 'circle', enemyTypes: [EnemyType.SHIELDED, EnemyType.EXPLODER], spacing: 65 },
          { type: 'diamond', enemyTypes: [EnemyType.HUNTER, EnemyType.BOMBER, EnemyType.PATROLLER], spacing: 60 }
        ],
        minEnemies: 32,
        maxEnemies: 40,
      }],
      isBoss: false,
      isMiniBoss: true,
      description: 'Void Herald',
    })

    waves.push({
      waveNumber: 15,
      buckets: [{
        formations: [
          { type: 'single', enemyTypes: [EnemyType.VOID_NEXUS], count: 1 },
          { type: 'circle', enemyTypes: [EnemyType.SHIELDED, EnemyType.EXPLODER], spacing: 70 },
          { type: 'spiral', enemyTypes: [EnemyType.HUNTER, EnemyType.BOMBER, EnemyType.PATROLLER], spacing: 60 },
          { type: 'wave', enemyTypes: enemies, spacing: 45 }
        ],
        minEnemies: 50,
        maxEnemies: 70,
      }],
      isBoss: true,
      isMiniBoss: false,
      description: 'Void Nexus',
    })

    return { level: 8, totalWaves: 15, waves }
  }

  private generateLevel9Waves(): LevelWaves {
    // Level 9: Siege Engine (18 waves - longest level)
    // Re-emphasizes: CHARGER, SHIELDED, EXPLODER, TANK, TURRET, SPAWNER, HEALER
    const waves: Wave[] = []
    const enemies = [EnemyType.CHARGER, EnemyType.SHIELDED, EnemyType.EXPLODER, EnemyType.TANK, EnemyType.TURRET, EnemyType.SPAWNER, EnemyType.HEALER]

    const waveConfigs = [
      { wave: 1, min: 20, max: 22, formations: [
        { type: 'wedge' as const, enemyTypes: [EnemyType.CHARGER, EnemyType.TANK], spacing: 50 },
        { type: 'line' as const, enemyTypes: enemies, spacing: 45 },
        { type: 'scattered' as const, enemyTypes: [EnemyType.TURRET], spacing: 60 },
      ]},
      { wave: 2, min: 24, max: 26, formations: [
        { type: 'grid' as const, enemyTypes: [EnemyType.SHIELDED], spacing: 60 },
        { type: 'arc' as const, enemyTypes: [EnemyType.CHARGER, EnemyType.EXPLODER], spacing: 50 },
        { type: 'diamond' as const, enemyTypes: enemies, spacing: 55 },
      ]},
      { wave: 3, min: 28, max: 30, formations: [
        { type: 'column' as const, enemyTypes: [EnemyType.TURRET], spacing: 65 },
        { type: 'spiral' as const, enemyTypes: [EnemyType.SHIELDED, EnemyType.TANK], spacing: 55 },
        { type: 'wave' as const, enemyTypes: enemies, spacing: 45 },
      ]},
      { wave: 4, min: 32, max: 34, formations: [
        { type: 'circle' as const, enemyTypes: [EnemyType.SPAWNER, EnemyType.HEALER], spacing: 65 },
        { type: 'x' as const, enemyTypes: [EnemyType.EXPLODER], spacing: 55 },
        { type: 'inverted-v' as const, enemyTypes: [EnemyType.CHARGER, EnemyType.TANK], spacing: 50 },
        { type: 'arc' as const, enemyTypes: enemies, spacing: 50 },
      ]},
      { wave: 5, min: 36, max: 38, formations: [
        { type: 'cross' as const, enemyTypes: [EnemyType.TURRET, EnemyType.SHIELDED], spacing: 60 },
        { type: 'wedge' as const, enemyTypes: [EnemyType.SPAWNER], spacing: 55 },
        { type: 'diamond' as const, enemyTypes: [EnemyType.HEALER, EnemyType.CHARGER], spacing: 55 },
        { type: 'scattered' as const, enemyTypes: enemies, spacing: 55 },
      ]},
      { wave: 7, min: 40, max: 44, formations: [
        { type: 'spiral' as const, enemyTypes: [EnemyType.HEALER, EnemyType.SPAWNER], spacing: 60 },
        { type: 'grid' as const, enemyTypes: [EnemyType.TURRET, EnemyType.SHIELDED], spacing: 60 },
        { type: 'v' as const, enemyTypes: [EnemyType.CHARGER, EnemyType.TANK], spacing: 50 },
        { type: 'line' as const, enemyTypes: [EnemyType.EXPLODER], spacing: 45 },
      ]},
      { wave: 8, min: 44, max: 48, formations: [
        { type: 'diamond' as const, enemyTypes: [EnemyType.SPAWNER, EnemyType.HEALER], spacing: 65 },
        { type: 'x' as const, enemyTypes: [EnemyType.SHIELDED, EnemyType.EXPLODER], spacing: 60 },
        { type: 'wedge' as const, enemyTypes: [EnemyType.TURRET, EnemyType.TANK], spacing: 50 },
        { type: 'wave' as const, enemyTypes: enemies, spacing: 45 },
      ]},
      { wave: 9, min: 48, max: 52, formations: [
        { type: 'circle' as const, enemyTypes: [EnemyType.HEALER], spacing: 70 },
        { type: 'cross' as const, enemyTypes: [EnemyType.TURRET, EnemyType.SHIELDED], spacing: 65 },
        { type: 'spiral' as const, enemyTypes: [EnemyType.SPAWNER, EnemyType.CHARGER], spacing: 55 },
        { type: 'inverted-v' as const, enemyTypes: [EnemyType.TANK, EnemyType.EXPLODER], spacing: 50 },
      ]},
      { wave: 10, min: 52, max: 56, formations: [
        { type: 'grid' as const, enemyTypes: [EnemyType.TURRET, EnemyType.SPAWNER], spacing: 60 },
        { type: 'wedge' as const, enemyTypes: [EnemyType.SHIELDED, EnemyType.HEALER], spacing: 55 },
        { type: 'arc' as const, enemyTypes: [EnemyType.CHARGER, EnemyType.TANK], spacing: 50 },
        { type: 'scattered' as const, enemyTypes: [EnemyType.EXPLODER], spacing: 55 },
      ]},
      { wave: 11, min: 56, max: 60, formations: [
        { type: 'spiral' as const, enemyTypes: [EnemyType.HEALER, EnemyType.SPAWNER], spacing: 65 },
        { type: 'diamond' as const, enemyTypes: [EnemyType.TURRET, EnemyType.SHIELDED], spacing: 60 },
        { type: 'x' as const, enemyTypes: [EnemyType.CHARGER, EnemyType.TANK], spacing: 55 },
        { type: 'wave' as const, enemyTypes: [EnemyType.EXPLODER], spacing: 45 },
      ]},
      { wave: 13, min: 60, max: 64, formations: [
        { type: 'circle' as const, enemyTypes: [EnemyType.SPAWNER, EnemyType.HEALER, EnemyType.TURRET], spacing: 70 },
        { type: 'cross' as const, enemyTypes: [EnemyType.SHIELDED, EnemyType.EXPLODER], spacing: 65 },
        { type: 'wedge' as const, enemyTypes: [EnemyType.CHARGER, EnemyType.TANK], spacing: 50 },
        { type: 'arc' as const, enemyTypes: enemies, spacing: 50 },
      ]},
      { wave: 14, min: 64, max: 68, formations: [
        { type: 'inverted-v' as const, enemyTypes: [EnemyType.TURRET, EnemyType.SHIELDED], spacing: 60 },
        { type: 'spiral' as const, enemyTypes: [EnemyType.HEALER, EnemyType.SPAWNER], spacing: 65 },
        { type: 'grid' as const, enemyTypes: [EnemyType.CHARGER, EnemyType.EXPLODER], spacing: 55 },
        { type: 'diamond' as const, enemyTypes: [EnemyType.TANK], spacing: 55 },
      ]},
      { wave: 15, min: 68, max: 72, formations: [
        { type: 'x' as const, enemyTypes: [EnemyType.SPAWNER, EnemyType.HEALER], spacing: 65 },
        { type: 'column' as const, enemyTypes: [EnemyType.TURRET], spacing: 70 },
        { type: 'circle' as const, enemyTypes: [EnemyType.SHIELDED, EnemyType.EXPLODER], spacing: 70 },
        { type: 'wedge' as const, enemyTypes: [EnemyType.CHARGER, EnemyType.TANK], spacing: 50 },
      ]},
      { wave: 16, min: 72, max: 76, formations: [
        { type: 'cross' as const, enemyTypes: [EnemyType.HEALER, EnemyType.SPAWNER, EnemyType.TURRET], spacing: 70 },
        { type: 'spiral' as const, enemyTypes: [EnemyType.SHIELDED, EnemyType.CHARGER], spacing: 60 },
        { type: 'diamond' as const, enemyTypes: [EnemyType.TANK, EnemyType.EXPLODER], spacing: 55 },
        { type: 'arc' as const, enemyTypes: enemies, spacing: 50 },
      ]},
      { wave: 17, min: 76, max: 80, formations: [
        { type: 'circle' as const, enemyTypes: [EnemyType.TURRET, EnemyType.HEALER, EnemyType.SPAWNER], spacing: 75 },
        { type: 'grid' as const, enemyTypes: [EnemyType.SHIELDED, EnemyType.EXPLODER], spacing: 60 },
        { type: 'wedge' as const, enemyTypes: [EnemyType.CHARGER, EnemyType.TANK], spacing: 50 },
        { type: 'wave' as const, enemyTypes: enemies, spacing: 45 },
      ]},
    ]

    waveConfigs.forEach(config => {
      waves.push({
        waveNumber: config.wave,
        buckets: [{ formations: config.formations, minEnemies: config.min, maxEnemies: config.max }],
        isBoss: false,
        isMiniBoss: false,
      })
    })

    waves.splice(5, 0, {
      waveNumber: 6,
      buckets: [{
        formations: [
          { type: 'single', enemyTypes: [EnemyType.ASSAULT_CRUISER], count: 1 },
          { type: 'circle', enemyTypes: [EnemyType.SPAWNER, EnemyType.HEALER], spacing: 65 },
          { type: 'v', enemyTypes: enemies, spacing: 55 }
        ],
        minEnemies: 32,
        maxEnemies: 42,
      }],
      isBoss: false,
      isMiniBoss: true,
      description: 'Assault Cruiser',
    })

    waves.splice(11, 0, {
      waveNumber: 12,
      buckets: [{
        formations: [
          { type: 'single', enemyTypes: [EnemyType.BATTLE_COORDINATOR], count: 1 },
          { type: 'spiral', enemyTypes: [EnemyType.TURRET, EnemyType.SHIELDED], spacing: 65 },
          { type: 'circle', enemyTypes: [EnemyType.HEALER, EnemyType.SPAWNER], spacing: 70 }
        ],
        minEnemies: 38,
        maxEnemies: 48,
      }],
      isBoss: false,
      isMiniBoss: true,
      description: 'Battle Coordinator',
    })

    waves.push({
      waveNumber: 18,
      buckets: [{
        formations: [
          { type: 'single', enemyTypes: [EnemyType.SIEGE_ENGINE], count: 1 },
          { type: 'circle', enemyTypes: [EnemyType.TURRET, EnemyType.SHIELDED], spacing: 75 },
          { type: 'spiral', enemyTypes: [EnemyType.HEALER, EnemyType.SPAWNER], spacing: 70 },
          { type: 'line', enemyTypes: [EnemyType.CHARGER, EnemyType.TANK], spacing: 50 },
          { type: 'wave', enemyTypes: [EnemyType.EXPLODER], spacing: 45 }
        ],
        minEnemies: 60,
        maxEnemies: 80,
      }],
      isBoss: true,
      isMiniBoss: false,
      description: 'Siege Engine',
    })

    return { level: 9, totalWaves: 18, waves }
  }

  private generateLevel10Waves(): LevelWaves {
    // Level 10: THE MOTHERSHIP OMEGA (20 waves - THE ULTIMATE BATTLE)
    // Uses all enemy types for maximum variety and challenge
    const waves: Wave[] = []
    const allEnemies = [EnemyType.DRONE, EnemyType.WASP, EnemyType.TANK, EnemyType.SNIPER, EnemyType.HUNTER, EnemyType.BOMBER, EnemyType.CHARGER, EnemyType.SHIELDED, EnemyType.EXPLODER, EnemyType.SPAWNER, EnemyType.HEALER]

    const waveConfigs = [
      { wave: 1, min: 22, max: 24, formations: [
        { type: 'v' as const, enemyTypes: [EnemyType.DRONE, EnemyType.WASP], spacing: 45 },
        { type: 'line' as const, enemyTypes: [EnemyType.TANK, EnemyType.SNIPER], spacing: 50 },
        { type: 'scattered' as const, enemyTypes: allEnemies, spacing: 55 },
      ]},
      { wave: 2, min: 26, max: 28, formations: [
        { type: 'wedge' as const, enemyTypes: [EnemyType.HUNTER, EnemyType.BOMBER], spacing: 50 },
        { type: 'arc' as const, enemyTypes: [EnemyType.CHARGER], spacing: 50 },
        { type: 'diamond' as const, enemyTypes: allEnemies, spacing: 55 },
      ]},
      { wave: 3, min: 30, max: 32, formations: [
        { type: 'spiral' as const, enemyTypes: [EnemyType.SHIELDED, EnemyType.EXPLODER], spacing: 55 },
        { type: 'grid' as const, enemyTypes: [EnemyType.SPAWNER, EnemyType.HEALER], spacing: 60 },
        { type: 'wave' as const, enemyTypes: allEnemies, spacing: 45 },
      ]},
      { wave: 4, min: 34, max: 36, formations: [
        { type: 'circle' as const, enemyTypes: [EnemyType.SPAWNER, EnemyType.HEALER], spacing: 65 },
        { type: 'x' as const, enemyTypes: [EnemyType.DRONE, EnemyType.WASP, EnemyType.HUNTER], spacing: 50 },
        { type: 'inverted-v' as const, enemyTypes: allEnemies, spacing: 50 },
      ]},
      { wave: 6, min: 38, max: 42, formations: [
        { type: 'cross' as const, enemyTypes: [EnemyType.TANK, EnemyType.SNIPER, EnemyType.BOMBER], spacing: 60 },
        { type: 'wedge' as const, enemyTypes: [EnemyType.CHARGER, EnemyType.SHIELDED], spacing: 50 },
        { type: 'arc' as const, enemyTypes: allEnemies, spacing: 50 },
      ]},
      { wave: 7, min: 42, max: 46, formations: [
        { type: 'diamond' as const, enemyTypes: [EnemyType.EXPLODER, EnemyType.BOMBER], spacing: 60 },
        { type: 'spiral' as const, enemyTypes: [EnemyType.SPAWNER, EnemyType.HEALER], spacing: 60 },
        { type: 'grid' as const, enemyTypes: allEnemies, spacing: 55 },
      ]},
      { wave: 8, min: 46, max: 50, formations: [
        { type: 'circle' as const, enemyTypes: [EnemyType.HEALER, EnemyType.SPAWNER], spacing: 70 },
        { type: 'x' as const, enemyTypes: [EnemyType.SHIELDED, EnemyType.EXPLODER], spacing: 60 },
        { type: 'v' as const, enemyTypes: [EnemyType.HUNTER, EnemyType.BOMBER, EnemyType.CHARGER], spacing: 50 },
        { type: 'line' as const, enemyTypes: allEnemies, spacing: 45 },
      ]},
      { wave: 9, min: 50, max: 54, formations: [
        { type: 'wedge' as const, enemyTypes: [EnemyType.TANK, EnemyType.SNIPER], spacing: 55 },
        { type: 'inverted-v' as const, enemyTypes: [EnemyType.DRONE, EnemyType.WASP], spacing: 45 },
        { type: 'cross' as const, enemyTypes: [EnemyType.CHARGER, EnemyType.BOMBER], spacing: 60 },
        { type: 'scattered' as const, enemyTypes: allEnemies, spacing: 55 },
      ]},
      { wave: 11, min: 54, max: 58, formations: [
        { type: 'spiral' as const, enemyTypes: [EnemyType.SPAWNER, EnemyType.HEALER], spacing: 65 },
        { type: 'diamond' as const, enemyTypes: [EnemyType.SHIELDED, EnemyType.EXPLODER], spacing: 60 },
        { type: 'arc' as const, enemyTypes: [EnemyType.HUNTER, EnemyType.BOMBER], spacing: 50 },
        { type: 'wave' as const, enemyTypes: allEnemies, spacing: 45 },
      ]},
      { wave: 12, min: 58, max: 62, formations: [
        { type: 'grid' as const, enemyTypes: [EnemyType.TANK, EnemyType.SNIPER, EnemyType.CHARGER], spacing: 55 },
        { type: 'circle' as const, enemyTypes: [EnemyType.HEALER, EnemyType.SPAWNER], spacing: 70 },
        { type: 'x' as const, enemyTypes: [EnemyType.BOMBER, EnemyType.HUNTER], spacing: 55 },
        { type: 'wedge' as const, enemyTypes: allEnemies, spacing: 50 },
      ]},
      { wave: 13, min: 62, max: 66, formations: [
        { type: 'cross' as const, enemyTypes: [EnemyType.EXPLODER, EnemyType.SHIELDED], spacing: 65 },
        { type: 'spiral' as const, enemyTypes: [EnemyType.SPAWNER, EnemyType.HEALER], spacing: 65 },
        { type: 'diamond' as const, enemyTypes: [EnemyType.CHARGER, EnemyType.BOMBER], spacing: 60 },
        { type: 'arc' as const, enemyTypes: allEnemies, spacing: 50 },
      ]},
      { wave: 14, min: 66, max: 70, formations: [
        { type: 'inverted-v' as const, enemyTypes: [EnemyType.TANK, EnemyType.SNIPER], spacing: 55 },
        { type: 'circle' as const, enemyTypes: [EnemyType.HUNTER, EnemyType.BOMBER], spacing: 70 },
        { type: 'grid' as const, enemyTypes: [EnemyType.SHIELDED, EnemyType.EXPLODER], spacing: 60 },
        { type: 'line' as const, enemyTypes: allEnemies, spacing: 45 },
      ]},
      { wave: 16, min: 70, max: 74, formations: [
        { type: 'spiral' as const, enemyTypes: [EnemyType.HEALER, EnemyType.SPAWNER], spacing: 70 },
        { type: 'x' as const, enemyTypes: [EnemyType.CHARGER, EnemyType.HUNTER, EnemyType.BOMBER], spacing: 60 },
        { type: 'wedge' as const, enemyTypes: [EnemyType.TANK, EnemyType.SNIPER], spacing: 50 },
        { type: 'diamond' as const, enemyTypes: allEnemies, spacing: 60 },
      ]},
      { wave: 17, min: 74, max: 78, formations: [
        { type: 'circle' as const, enemyTypes: [EnemyType.SPAWNER, EnemyType.HEALER, EnemyType.SHIELDED], spacing: 75 },
        { type: 'cross' as const, enemyTypes: [EnemyType.EXPLODER, EnemyType.BOMBER], spacing: 65 },
        { type: 'grid' as const, enemyTypes: [EnemyType.CHARGER, EnemyType.HUNTER], spacing: 55 },
        { type: 'wave' as const, enemyTypes: allEnemies, spacing: 45 },
      ]},
      { wave: 18, min: 78, max: 82, formations: [
        { type: 'v' as const, enemyTypes: [EnemyType.TANK, EnemyType.SNIPER, EnemyType.BOMBER], spacing: 55 },
        { type: 'spiral' as const, enemyTypes: [EnemyType.HEALER, EnemyType.SPAWNER], spacing: 70 },
        { type: 'diamond' as const, enemyTypes: [EnemyType.SHIELDED, EnemyType.EXPLODER], spacing: 65 },
        { type: 'arc' as const, enemyTypes: allEnemies, spacing: 50 },
      ]},
      { wave: 19, min: 82, max: 86, formations: [
        { type: 'circle' as const, enemyTypes: [EnemyType.HEALER, EnemyType.SPAWNER], spacing: 80 },
        { type: 'x' as const, enemyTypes: [EnemyType.CHARGER, EnemyType.HUNTER, EnemyType.BOMBER], spacing: 65 },
        { type: 'cross' as const, enemyTypes: [EnemyType.SHIELDED, EnemyType.EXPLODER], spacing: 70 },
        { type: 'wedge' as const, enemyTypes: [EnemyType.TANK, EnemyType.SNIPER], spacing: 50 },
        { type: 'scattered' as const, enemyTypes: allEnemies, spacing: 55 },
      ]},
    ]

    waveConfigs.forEach(config => {
      waves.push({
        waveNumber: config.wave,
        buckets: [{ formations: config.formations, minEnemies: config.min, maxEnemies: config.max }],
        isBoss: false,
        isMiniBoss: false,
      })
    })

    waves.splice(4, 0, {
      waveNumber: 5,
      buckets: [{
        formations: [
          { type: 'single', enemyTypes: [EnemyType.PROTOTYPE_BOMBER], count: 1 },
          { type: 'circle', enemyTypes: [EnemyType.SPAWNER, EnemyType.HEALER], spacing: 65 },
          { type: 'line', enemyTypes: allEnemies, spacing: 50 }
        ],
        minEnemies: 32,
        maxEnemies: 40,
      }],
      isBoss: false,
      isMiniBoss: true,
      description: 'Prototype Bomber',
    })

    waves.splice(9, 0, {
      waveNumber: 10,
      buckets: [{
        formations: [
          { type: 'single', enemyTypes: [EnemyType.ASSAULT_CRUISER], count: 1 },
          { type: 'spiral', enemyTypes: [EnemyType.HEALER, EnemyType.SPAWNER], spacing: 65 },
          { type: 'v', enemyTypes: [EnemyType.SHIELDED, EnemyType.EXPLODER], spacing: 60 }
        ],
        minEnemies: 40,
        maxEnemies: 50,
      }],
      isBoss: false,
      isMiniBoss: true,
      description: 'Assault Cruiser',
    })

    waves.splice(14, 0, {
      waveNumber: 15,
      buckets: [{
        formations: [
          { type: 'single', enemyTypes: [EnemyType.BATTLE_COORDINATOR], count: 1 },
          { type: 'circle', enemyTypes: [EnemyType.SPAWNER, EnemyType.HEALER, EnemyType.SHIELDED], spacing: 75 },
          { type: 'diamond', enemyTypes: [EnemyType.BOMBER, EnemyType.HUNTER, EnemyType.CHARGER], spacing: 65 }
        ],
        minEnemies: 48,
        maxEnemies: 60,
      }],
      isBoss: false,
      isMiniBoss: true,
      description: 'Battle Coordinator',
    })

    waves.push({
      waveNumber: 20,
      buckets: [{
        formations: [
          { type: 'single', enemyTypes: [EnemyType.MOTHERSHIP_OMEGA], count: 1 },
          { type: 'circle', enemyTypes: [EnemyType.HEALER, EnemyType.SPAWNER, EnemyType.SHIELDED], spacing: 85 },
          { type: 'spiral', enemyTypes: [EnemyType.CHARGER, EnemyType.HUNTER, EnemyType.BOMBER, EnemyType.EXPLODER], spacing: 75 },
          { type: 'wave', enemyTypes: [EnemyType.DRONE, EnemyType.WASP], spacing: 45 },
          { type: 'line', enemyTypes: [EnemyType.TANK, EnemyType.SNIPER], spacing: 50 }
        ],
        minEnemies: 70,
        maxEnemies: 110,
      }],
      isBoss: true,
      isMiniBoss: false,
      description: 'MOTHERSHIP OMEGA',
    })

    return { level: 10, totalWaves: 20, waves }
  }

  // Get all enemies available up to a specific wave in a level
  private getAvailableEnemies(level: number, upToWave: number): EnemyType[] {
    const enemies: EnemyType[] = []

    // Add enemies from all previous levels
    for (let lvl = 1; lvl < level; lvl++) {
      const schedule = LEVEL_ENEMY_SCHEDULE[lvl]
      if (schedule) {
        enemies.push(...schedule.wave1, ...schedule.wave6, ...schedule.wave11)
      }
    }

    // Add enemies from current level up to specified wave
    const currentSchedule = LEVEL_ENEMY_SCHEDULE[level]
    if (currentSchedule) {
      enemies.push(...currentSchedule.wave1)
      if (upToWave >= 6) enemies.push(...currentSchedule.wave6)
      if (upToWave >= 11) enemies.push(...currentSchedule.wave11)
    }

    // Remove duplicates
    return Array.from(new Set(enemies))
  }

  private createIntroWave(waveNum: number, newEnemies: EnemyType[], allEnemies: EnemyType[], description: string): Wave {
    // Focus on new enemies with some supporting cast
    const mainPool = newEnemies.length > 0 ? newEnemies : allEnemies
    const supportPool = allEnemies.length > 0 ? allEnemies : mainPool

    // Wave 1 should be much gentler (5 enemies)
    const isFirstWave = waveNum === 1
    const minEnemies = isFirstWave ? 5 : 8
    const maxEnemies = isFirstWave ? 8 : 15

    return {
      waveNumber: waveNum,
      buckets: [{
        formations: [
          { type: 'line', enemyTypes: mainPool, spacing: 50 },
          { type: 'single', enemyTypes: mainPool, count: isFirstWave ? 3 : 5 },
          { type: 'wave', enemyTypes: supportPool, spacing: 50 },
        ],
        minEnemies,
        maxEnemies,
      }],
      isBoss: false,
      isMiniBoss: false,
      description,
    }
  }

  private createStandardWave(waveNum: number, availableEnemies: EnemyType[], difficulty: 'early' | 'mid' | 'late'): Wave {
    const configs = {
      early: { min: 12, max: 20, formations: 3 },
      mid: { min: 20, max: 35, formations: 4 },
      late: { min: 35, max: 60, formations: 5 },
    }

    let config = configs[difficulty]

    // Gradual ramp for early waves (1-5)
    if (difficulty === 'early') {
      if (waveNum === 1) {
        config = { min: 5, max: 8, formations: 2 }   // Wave 1: ~6 enemies (tutorial wave)
      } else if (waveNum === 2) {
        config = { min: 8, max: 10, formations: 2 }  // Wave 2: ~8 enemies
      } else if (waveNum === 3) {
        config = { min: 10, max: 15, formations: 3 }  // Wave 3: ~12 enemies
      } else if (waveNum === 4) {
        config = { min: 12, max: 18, formations: 3 }  // Wave 4: ~15 enemies
      }
      // Wave 5 keeps default early config (12-20)
    }

    const formations: WaveFormation[] = [
      { type: 'line', enemyTypes: availableEnemies, spacing: 45 },
      { type: 'v', enemyTypes: availableEnemies, spacing: 50 },
    ]

    if (config.formations >= 3) {
      formations.push({ type: 'circle', enemyTypes: availableEnemies, spacing: 60 })
    }

    if (config.formations >= 4) {
      formations.push({ type: 'wave', enemyTypes: availableEnemies, spacing: 45 })
    }

    if (config.formations >= 5) {
      formations.push({ type: 'single', enemyTypes: availableEnemies, count: 10 })
    }

    return {
      waveNumber: waveNum,
      buckets: [{
        formations,
        minEnemies: config.min,
        maxEnemies: config.max,
      }],
      isBoss: false,
      isMiniBoss: false,
    }
  }

  private createMiniBossWave(waveNum: number, availableEnemies: EnemyType[]): Wave {
    console.log(`[WaveSystem] Creating Mini-Boss wave for wave number ${waveNum}`)
    return {
      waveNumber: waveNum,
      buckets: [{
        formations: [
          {
            type: 'single',
            enemyTypes: [EnemyType.MINI_BOSS],
            count: 1,
          },
          {
            type: 'circle',
            enemyTypes: availableEnemies,
            spacing: 70,
          },
          {
            type: 'line',
            enemyTypes: availableEnemies,
            spacing: 50,
          }
        ],
        minEnemies: 20,
        maxEnemies: 35,
      }],
      isBoss: false,
      isMiniBoss: true,
      description: 'Mini-Boss Assault',
    }
  }

  private createBossWave(waveNum: number, availableEnemies: EnemyType[]): Wave {
    return {
      waveNumber: waveNum,
      buckets: [{
        formations: [
          {
            type: 'single',
            enemyTypes: [EnemyType.BOSS],
            count: 1,
          },
          {
            type: 'circle',
            enemyTypes: availableEnemies,
            spacing: 80,
          },
          {
            type: 'wave',
            enemyTypes: availableEnemies,
            spacing: 45,
          },
          {
            type: 'line',
            enemyTypes: availableEnemies,
            spacing: 50,
          }
        ],
        minEnemies: 40,
        maxEnemies: 80,
      }],
      isBoss: true,
      isMiniBoss: false,
      description: 'Final Boss',
    }
  }

  getCurrentWave(): number {
    return this.currentWave
  }

  setCurrentWave(wave: number): void {
    this.currentWave = wave
  }

  getTotalWaves(): number {
    return this.totalWaves
  }

  getWaveData(): Wave | null {
    if (this.currentWave < 1 || this.currentWave > this.totalWaves) {
      return null
    }
    return this.levelWaves.waves[this.currentWave - 1]
  }

  startNextWave(): Wave | null {
    if (this.currentWave >= this.totalWaves) {
      return null // No more waves
    }
    this.currentWave++
    const waveData = this.getWaveData()
    if (waveData) {
      console.log(`[WaveSystem] Starting wave ${this.currentWave}, isMiniBoss: ${waveData.isMiniBoss}, isBoss: ${waveData.isBoss}`)
    }
    return waveData
  }

  isComplete(): boolean {
    return this.currentWave >= this.totalWaves
  }

  getProgress(): number {
    return this.currentWave / this.totalWaves
  }

  // Get a random formation from the current wave's bucket
  getRandomFormation(): WaveFormation | null {
    const waveData = this.getWaveData()
    if (!waveData || waveData.buckets.length === 0) {
      return null
    }

    // Pick a random bucket
    const bucket = waveData.buckets[Math.floor(Math.random() * waveData.buckets.length)]

    // Pick a random formation from that bucket
    const formation = bucket.formations[Math.floor(Math.random() * bucket.formations.length)]

    return formation
  }
}
