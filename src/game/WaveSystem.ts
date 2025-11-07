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
    const totalWaves = 15
    const waves: Wave[] = []

    // Get cumulative enemy pool up to this level
    const availableEnemies = this.getAvailableEnemies(level, 0) // All enemies unlocked so far

    // Wave 1: Introduce first new enemy type
    const wave1Enemies = LEVEL_ENEMY_SCHEDULE[level]?.wave1 || []
    waves.push(this.createIntroWave(1, wave1Enemies, availableEnemies, 'Introduction Wave'))

    // Waves 2-5: Build up with available enemies
    for (let i = 2; i <= 5; i++) {
      waves.push(this.createStandardWave(i, availableEnemies, 'early'))
    }

    // Wave 6: Introduce second new enemy type
    const wave6Enemies = LEVEL_ENEMY_SCHEDULE[level]?.wave6 || []
    const enemiesUpToWave6 = this.getAvailableEnemies(level, 6)
    waves.push(this.createIntroWave(6, wave6Enemies, enemiesUpToWave6, 'New Threat'))

    // Wave 7: First Mini-Boss + support
    waves.push(this.createMiniBossWave(7, enemiesUpToWave6))

    // Waves 8-10: Escalation
    for (let i = 8; i <= 10; i++) {
      waves.push(this.createStandardWave(i, enemiesUpToWave6, 'mid'))
    }

    // Wave 11: Introduce third new enemy type
    const wave11Enemies = LEVEL_ENEMY_SCHEDULE[level]?.wave11 || []
    const allEnemies = this.getAvailableEnemies(level, 11)
    waves.push(this.createIntroWave(11, wave11Enemies, allEnemies, 'Elite Force'))

    // Wave 12: Second Mini-Boss + heavy support
    waves.push(this.createMiniBossWave(12, allEnemies))

    // Waves 13-14: Final escalation
    for (let i = 13; i <= 14; i++) {
      waves.push(this.createStandardWave(i, allEnemies, 'late'))
    }

    // Wave 15: Final Boss + full army
    waves.push(this.createBossWave(15, allEnemies))

    return {
      level,
      totalWaves,
      waves,
    }
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
