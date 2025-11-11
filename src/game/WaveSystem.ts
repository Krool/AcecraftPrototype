import { EnemyType } from './Enemy'

export interface WaveFormation {
  type: 'single' | 'line' | 'v' | 'circle' | 'wave'
  enemyTypes: EnemyType[] // Pool of enemy types to pick from
  count?: number // For single spawns
  spacing?: number
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
    const waves: Wave[] = []
    const enemies = [EnemyType.DRONE, EnemyType.WASP, EnemyType.SWARMER]

    // Waves 1-11: Build up
    for (let i = 1; i <= 11; i++) {
      const difficulty = i <= 4 ? 'early' : i <= 8 ? 'mid' : 'late'
      waves.push(this.createStandardWave(i, enemies, difficulty))
    }

    // Wave 12: Scout Commander Boss
    waves.push({
      waveNumber: 12,
      buckets: [{
        formations: [
          { type: 'single', enemyTypes: [EnemyType.SCOUT_COMMANDER], count: 1 },
          { type: 'circle', enemyTypes: enemies, spacing: 60 }
        ],
        minEnemies: 15,
        maxEnemies: 25,
      }],
      isBoss: true,
      isMiniBoss: false,
      description: 'Scout Commander',
    })

    return { level: 1, totalWaves: 12, waves }
  }

  private generateLevel2Waves(): LevelWaves {
    // Level 2: Tank Twins (10 waves)
    const waves: Wave[] = []
    const enemies = [EnemyType.DRONE, EnemyType.WASP, EnemyType.SWARMER, EnemyType.TANK, EnemyType.SNIPER, EnemyType.HUNTER]

    // Waves 1-9: Build up
    for (let i = 1; i <= 9; i++) {
      const difficulty = i <= 3 ? 'early' : i <= 6 ? 'mid' : 'late'
      waves.push(this.createStandardWave(i, enemies, difficulty))
    }

    // Wave 10: Tank Twins Boss (2 bosses)
    waves.push({
      waveNumber: 10,
      buckets: [{
        formations: [
          { type: 'single', enemyTypes: [EnemyType.TANK_TWIN], count: 2 }, // Spawns 2 twins
          { type: 'line', enemyTypes: enemies, spacing: 50 }
        ],
        minEnemies: 20,
        maxEnemies: 30,
      }],
      isBoss: true,
      isMiniBoss: false,
      description: 'Twin Terrors',
    })

    return { level: 2, totalWaves: 10, waves }
  }

  private generateLevel3Waves(): LevelWaves {
    // Level 3: Hive Queen (13 waves)
    const waves: Wave[] = []
    const enemies = [EnemyType.DRONE, EnemyType.WASP, EnemyType.SWARMER, EnemyType.TANK, EnemyType.SNIPER, EnemyType.HUNTER, EnemyType.PATROLLER, EnemyType.TURRET, EnemyType.BOMBER]

    // Waves 1-12: Build up
    for (let i = 1; i <= 12; i++) {
      const difficulty = i <= 4 ? 'early' : i <= 8 ? 'mid' : 'late'
      waves.push(this.createStandardWave(i, enemies, difficulty))
    }

    // Wave 13: Hive Queen Boss (eggs spawned automatically by handleBossSpawn)
    waves.push({
      waveNumber: 13,
      buckets: [{
        formations: [
          { type: 'single', enemyTypes: [EnemyType.HIVE_QUEEN], count: 1 },
          { type: 'wave', enemyTypes: enemies, spacing: 45 }
        ],
        minEnemies: 25,
        maxEnemies: 40,
      }],
      isBoss: true,
      isMiniBoss: false,
      description: 'Hive Queen',
    })

    return { level: 3, totalWaves: 13, waves }
  }

  private generateLevel4Waves(): LevelWaves {
    // Level 4: Orbital Devastator (11 waves)
    const waves: Wave[] = []
    const enemies = [EnemyType.DRONE, EnemyType.WASP, EnemyType.TANK, EnemyType.SNIPER, EnemyType.HUNTER, EnemyType.PATROLLER, EnemyType.TURRET, EnemyType.BOMBER, EnemyType.ORBITER, EnemyType.CHARGER, EnemyType.SPIRAL_SHOOTER]

    // Waves 1-10: Build up
    for (let i = 1; i <= 10; i++) {
      const difficulty = i <= 3 ? 'early' : i <= 7 ? 'mid' : 'late'
      waves.push(this.createStandardWave(i, enemies, difficulty))
    }

    // Wave 11: Orbital Devastator Boss (shields spawned automatically)
    waves.push({
      waveNumber: 11,
      buckets: [{
        formations: [
          { type: 'single', enemyTypes: [EnemyType.ORBITAL_DEVASTATOR], count: 1 },
          { type: 'circle', enemyTypes: enemies, spacing: 70 }
        ],
        minEnemies: 30,
        maxEnemies: 45,
      }],
      isBoss: true,
      isMiniBoss: false,
      description: 'Orbital Devastator',
    })

    return { level: 4, totalWaves: 11, waves }
  }

  private generateLevel5Waves(): LevelWaves {
    // Level 5: Fractured Titan (14 waves)
    const waves: Wave[] = []
    const enemies = [EnemyType.WASP, EnemyType.TANK, EnemyType.SNIPER, EnemyType.HUNTER, EnemyType.PATROLLER, EnemyType.BOMBER, EnemyType.CHARGER, EnemyType.SPLITTER, EnemyType.SPAWNER, EnemyType.HEALER]

    // Waves 1-13: Build up
    for (let i = 1; i <= 13; i++) {
      const difficulty = i <= 4 ? 'early' : i <= 9 ? 'mid' : 'late'
      waves.push(this.createStandardWave(i, enemies, difficulty))
    }

    // Wave 14: Fractured Titan Boss (splits on damage)
    waves.push({
      waveNumber: 14,
      buckets: [{
        formations: [
          { type: 'single', enemyTypes: [EnemyType.FRACTURED_TITAN], count: 1 },
          { type: 'v', enemyTypes: enemies, spacing: 55 }
        ],
        minEnemies: 35,
        maxEnemies: 50,
      }],
      isBoss: true,
      isMiniBoss: false,
      description: 'Fractured Titan',
    })

    return { level: 5, totalWaves: 14, waves }
  }

  private generateLevel6Waves(): LevelWaves {
    // Level 6: Shield Warden (10 waves)
    const waves: Wave[] = []
    const enemies = [EnemyType.DRONE, EnemyType.WASP, EnemyType.TANK, EnemyType.HUNTER, EnemyType.BOMBER, EnemyType.SPLITTER, EnemyType.SPAWNER, EnemyType.HEALER, EnemyType.SHIELDED, EnemyType.EXPLODER]

    // Waves 1-9: Build up
    for (let i = 1; i <= 9; i++) {
      const difficulty = i <= 3 ? 'early' : i <= 6 ? 'mid' : 'late'
      waves.push(this.createStandardWave(i, enemies, difficulty))
    }

    // Wave 10: Shield Warden Boss
    waves.push({
      waveNumber: 10,
      buckets: [{
        formations: [
          { type: 'single', enemyTypes: [EnemyType.SHIELD_WARDEN], count: 1 },
          { type: 'single', enemyTypes: [EnemyType.SHIELDED], count: 8 }, // Shielded minions
          { type: 'wave', enemyTypes: enemies, spacing: 50 }
        ],
        minEnemies: 30,
        maxEnemies: 45,
      }],
      isBoss: true,
      isMiniBoss: false,
      description: 'Shield Warden',
    })

    return { level: 6, totalWaves: 10, waves }
  }

  private generateLevel7Waves(): LevelWaves {
    // Level 7: Bomber Squadron (12 waves with mini-boss)
    const waves: Wave[] = []
    const enemies = [EnemyType.WASP, EnemyType.TANK, EnemyType.SNIPER, EnemyType.HUNTER, EnemyType.BOMBER, EnemyType.EXPLODER, EnemyType.CHARGER]

    // Waves 1-5: Build up
    for (let i = 1; i <= 5; i++) {
      waves.push(this.createStandardWave(i, enemies, 'early'))
    }

    // Wave 6: Prototype Bomber Mini-Boss
    waves.push({
      waveNumber: 6,
      buckets: [{
        formations: [
          { type: 'single', enemyTypes: [EnemyType.PROTOTYPE_BOMBER], count: 1 },
          { type: 'line', enemyTypes: enemies, spacing: 50 }
        ],
        minEnemies: 15,
        maxEnemies: 25,
      }],
      isBoss: false,
      isMiniBoss: true,
      description: 'Prototype Bomber',
    })

    // Waves 7-11: Escalation
    for (let i = 7; i <= 11; i++) {
      waves.push(this.createStandardWave(i, enemies, 'mid'))
    }

    // Wave 12: Ace Bomber with Escorts
    waves.push({
      waveNumber: 12,
      buckets: [{
        formations: [
          { type: 'single', enemyTypes: [EnemyType.ACE_BOMBER], count: 1 },
          { type: 'single', enemyTypes: [EnemyType.ESCORT_BOMBER], count: 2 },
          { type: 'circle', enemyTypes: enemies, spacing: 60 }
        ],
        minEnemies: 30,
        maxEnemies: 45,
      }],
      isBoss: true,
      isMiniBoss: false,
      description: 'Bomber Squadron',
    })

    return { level: 7, totalWaves: 12, waves }
  }

  private generateLevel8Waves(): LevelWaves {
    // Level 8: Void Nexus (15 waves with 2 mini-bosses)
    const waves: Wave[] = []
    const enemies = [EnemyType.HUNTER, EnemyType.PATROLLER, EnemyType.BOMBER, EnemyType.CHARGER, EnemyType.SHIELDED, EnemyType.EXPLODER]

    // Waves 1-4: Build up
    for (let i = 1; i <= 4; i++) {
      waves.push(this.createStandardWave(i, enemies, 'early'))
    }

    // Wave 5: First Void Herald Mini-Boss
    waves.push({
      waveNumber: 5,
      buckets: [{
        formations: [
          { type: 'single', enemyTypes: [EnemyType.VOID_HERALD], count: 1 },
          { type: 'wave', enemyTypes: enemies, spacing: 50 }
        ],
        minEnemies: 20,
        maxEnemies: 30,
      }],
      isBoss: false,
      isMiniBoss: true,
      description: 'Void Herald',
    })

    // Waves 6-9: Mid game
    for (let i = 6; i <= 9; i++) {
      waves.push(this.createStandardWave(i, enemies, 'mid'))
    }

    // Wave 10: Second Void Herald Mini-Boss
    waves.push({
      waveNumber: 10,
      buckets: [{
        formations: [
          { type: 'single', enemyTypes: [EnemyType.VOID_HERALD], count: 1 },
          { type: 'circle', enemyTypes: enemies, spacing: 65 }
        ],
        minEnemies: 25,
        maxEnemies: 35,
      }],
      isBoss: false,
      isMiniBoss: true,
      description: 'Void Herald',
    })

    // Waves 11-14: Late game escalation
    for (let i = 11; i <= 14; i++) {
      waves.push(this.createStandardWave(i, enemies, 'late'))
    }

    // Wave 15: Void Nexus Final Boss
    waves.push({
      waveNumber: 15,
      buckets: [{
        formations: [
          { type: 'single', enemyTypes: [EnemyType.VOID_NEXUS], count: 1 },
          { type: 'wave', enemyTypes: enemies, spacing: 45 },
          { type: 'circle', enemyTypes: enemies, spacing: 70 }
        ],
        minEnemies: 40,
        maxEnemies: 60,
      }],
      isBoss: true,
      isMiniBoss: false,
      description: 'Void Nexus',
    })

    return { level: 8, totalWaves: 15, waves }
  }

  private generateLevel9Waves(): LevelWaves {
    // Level 9: Siege Engine (18 waves - longest level)
    const waves: Wave[] = []
    const enemies = [EnemyType.CHARGER, EnemyType.SHIELDED, EnemyType.EXPLODER, EnemyType.TANK, EnemyType.TURRET, EnemyType.SPAWNER, EnemyType.HEALER]

    // Waves 1-17: Prolonged battle
    for (let i = 1; i <= 17; i++) {
      const difficulty = i <= 6 ? 'early' : i <= 12 ? 'mid' : 'late'
      waves.push(this.createStandardWave(i, enemies, difficulty))
    }

    // Wave 18: Siege Engine Boss (turrets spawned automatically)
    waves.push({
      waveNumber: 18,
      buckets: [{
        formations: [
          { type: 'single', enemyTypes: [EnemyType.SIEGE_ENGINE], count: 1 },
          { type: 'line', enemyTypes: enemies, spacing: 50 },
          { type: 'wave', enemyTypes: enemies, spacing: 45 }
        ],
        minEnemies: 50,
        maxEnemies: 70,
      }],
      isBoss: true,
      isMiniBoss: false,
      description: 'Siege Engine',
    })

    return { level: 9, totalWaves: 18, waves }
  }

  private generateLevel10Waves(): LevelWaves {
    // Level 10: THE MOTHERSHIP OMEGA (20 waves - THE ULTIMATE BATTLE)
    const waves: Wave[] = []
    const allEnemies = [EnemyType.DRONE, EnemyType.WASP, EnemyType.TANK, EnemyType.SNIPER, EnemyType.HUNTER, EnemyType.BOMBER, EnemyType.CHARGER, EnemyType.SHIELDED, EnemyType.EXPLODER, EnemyType.SPAWNER, EnemyType.HEALER]

    // Waves 1-9: Build up to first mini-boss
    for (let i = 1; i <= 9; i++) {
      const difficulty = i <= 3 ? 'early' : 'mid'
      waves.push(this.createStandardWave(i, allEnemies, difficulty))
    }

    // Wave 10: Assault Cruiser Mini-Boss
    waves.push({
      waveNumber: 10,
      buckets: [{
        formations: [
          { type: 'single', enemyTypes: [EnemyType.ASSAULT_CRUISER], count: 1 },
          { type: 'v', enemyTypes: allEnemies, spacing: 55 }
        ],
        minEnemies: 30,
        maxEnemies: 45,
      }],
      isBoss: false,
      isMiniBoss: true,
      description: 'Assault Cruiser',
    })

    // Waves 11-14: Continue escalation
    for (let i = 11; i <= 14; i++) {
      waves.push(this.createStandardWave(i, allEnemies, 'mid'))
    }

    // Wave 15: Battle Coordinator Mini-Boss
    waves.push({
      waveNumber: 15,
      buckets: [{
        formations: [
          { type: 'single', enemyTypes: [EnemyType.BATTLE_COORDINATOR], count: 1 },
          { type: 'circle', enemyTypes: allEnemies, spacing: 65 }
        ],
        minEnemies: 35,
        maxEnemies: 50,
      }],
      isBoss: false,
      isMiniBoss: true,
      description: 'Battle Coordinator',
    })

    // Waves 16-19: Final escalation
    for (let i = 16; i <= 19; i++) {
      waves.push(this.createStandardWave(i, allEnemies, 'late'))
    }

    // Wave 20: MOTHERSHIP OMEGA - THE FINAL BOSS (weapon ports spawned automatically)
    waves.push({
      waveNumber: 20,
      buckets: [{
        formations: [
          { type: 'single', enemyTypes: [EnemyType.MOTHERSHIP_OMEGA], count: 1 },
          { type: 'circle', enemyTypes: allEnemies, spacing: 80 },
          { type: 'wave', enemyTypes: allEnemies, spacing: 45 },
          { type: 'line', enemyTypes: allEnemies, spacing: 50 }
        ],
        minEnemies: 60,
        maxEnemies: 100,
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

    // Gradual ramp for early waves (2-5)
    if (difficulty === 'early') {
      if (waveNum === 2) {
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
