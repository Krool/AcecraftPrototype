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
}

export interface LevelWaves {
  level: number
  totalWaves: number
  waves: Wave[]
}

// Wave buckets for different difficulty tiers
const VERY_EASY_BUCKET: WaveBucket = {
  formations: [
    {
      type: 'line',
      enemyTypes: [EnemyType.DRONE],
      spacing: 60,
    },
    {
      type: 'single',
      enemyTypes: [EnemyType.DRONE],
      count: 3,
    },
    {
      type: 'wave',
      enemyTypes: [EnemyType.DRONE],
      spacing: 60,
    },
  ],
  minEnemies: 3,
  maxEnemies: 6,
}

const EASY_BUCKET: WaveBucket = {
  formations: [
    {
      type: 'line',
      enemyTypes: [EnemyType.DRONE, EnemyType.WASP],
      spacing: 60,
    },
    {
      type: 'single',
      enemyTypes: [EnemyType.DRONE, EnemyType.WASP],
      count: 5,
    },
    {
      type: 'wave',
      enemyTypes: [EnemyType.DRONE],
      spacing: 60,
    },
  ],
  minEnemies: 5,
  maxEnemies: 9,
}

const MEDIUM_BUCKET: WaveBucket = {
  formations: [
    {
      type: 'line',
      enemyTypes: [EnemyType.DRONE, EnemyType.WASP, EnemyType.TANK],
      spacing: 60,
    },
    {
      type: 'v',
      enemyTypes: [EnemyType.DRONE, EnemyType.SNIPER],
      spacing: 60,
    },
    {
      type: 'circle',
      enemyTypes: [EnemyType.WASP, EnemyType.SNIPER],
      spacing: 80,
    },
    {
      type: 'wave',
      enemyTypes: [EnemyType.TANK, EnemyType.SNIPER],
      spacing: 60,
    },
  ],
  minEnemies: 8,
  maxEnemies: 14,
}

const HARD_BUCKET: WaveBucket = {
  formations: [
    {
      type: 'line',
      enemyTypes: [EnemyType.TANK, EnemyType.SNIPER, EnemyType.SPIRAL_SHOOTER],
      spacing: 60,
    },
    {
      type: 'v',
      enemyTypes: [EnemyType.SNIPER, EnemyType.SPIRAL_SHOOTER, EnemyType.SPAWNER],
      spacing: 60,
    },
    {
      type: 'circle',
      enemyTypes: [EnemyType.WASP, EnemyType.SPIRAL_SHOOTER, EnemyType.PATROLLER],
      spacing: 80,
    },
    {
      type: 'wave',
      enemyTypes: [EnemyType.TANK, EnemyType.SHIELDED, EnemyType.SPAWNER],
      spacing: 60,
    },
  ],
  minEnemies: 13,
  maxEnemies: 20,
}

const ELITE_BUCKET: WaveBucket = {
  formations: [
    {
      type: 'v',
      enemyTypes: [EnemyType.TANK, EnemyType.SPIRAL_SHOOTER, EnemyType.SHIELDED],
      spacing: 60,
    },
    {
      type: 'circle',
      enemyTypes: [EnemyType.SPIRAL_SHOOTER, EnemyType.SHIELDED, EnemyType.EXPLODER],
      spacing: 80,
    },
    {
      type: 'line',
      enemyTypes: [EnemyType.SPAWNER, EnemyType.SHIELDED, EnemyType.TANK],
      spacing: 60,
    },
  ],
  minEnemies: 15,
  maxEnemies: 25,
}

export class WaveSystem {
  private currentWave: number = 0
  private totalWaves: number = 15
  private levelWaves: LevelWaves

  constructor(level: number) {
    this.levelWaves = this.generateLevelWaves(level)
    this.totalWaves = this.levelWaves.totalWaves
  }

  private generateLevelWaves(level: number): LevelWaves {
    const totalWaves = 15
    const waves: Wave[] = []

    // Waves 1-2: Very Easy (only basic drones)
    for (let i = 1; i <= 2; i++) {
      waves.push({
        waveNumber: i,
        buckets: [VERY_EASY_BUCKET],
        isBoss: false,
        isMiniBoss: false,
      })
    }

    // Waves 3-4: Easy (small formations with sidewinders)
    for (let i = 3; i <= 4; i++) {
      waves.push({
        waveNumber: i,
        buckets: [EASY_BUCKET],
        isBoss: false,
        isMiniBoss: false,
      })
    }

    // Wave 5: First Mini-boss
    waves.push({
      waveNumber: 5,
      buckets: [{
        formations: [{
          type: 'single',
          enemyTypes: [EnemyType.MINI_BOSS],
          count: 1,
        }],
        minEnemies: 1,
        maxEnemies: 1,
      }],
      isBoss: false,
      isMiniBoss: true,
    })

    // Waves 6-9: Medium
    for (let i = 6; i <= 9; i++) {
      waves.push({
        waveNumber: i,
        buckets: [MEDIUM_BUCKET],
        isBoss: false,
        isMiniBoss: false,
      })
    }

    // Wave 10: Second Mini-boss
    waves.push({
      waveNumber: 10,
      buckets: [{
        formations: [{
          type: 'single',
          enemyTypes: [EnemyType.MINI_BOSS],
          count: 1,
        }],
        minEnemies: 1,
        maxEnemies: 1,
      }],
      isBoss: false,
      isMiniBoss: true,
    })

    // Waves 11-14: Hard (large formations) and Elite
    for (let i = 11; i <= 12; i++) {
      waves.push({
        waveNumber: i,
        buckets: [HARD_BUCKET],
        isBoss: false,
        isMiniBoss: false,
      })
    }

    for (let i = 13; i <= 14; i++) {
      waves.push({
        waveNumber: i,
        buckets: [ELITE_BUCKET],
        isBoss: false,
        isMiniBoss: false,
      })
    }

    // Wave 15: Final Boss
    waves.push({
      waveNumber: 15,
      buckets: [{
        formations: [{
          type: 'single',
          enemyTypes: [EnemyType.BOSS],
          count: 1,
        }],
        minEnemies: 1,
        maxEnemies: 1,
      }],
      isBoss: true,
      isMiniBoss: false,
    })

    return {
      level,
      totalWaves,
      waves,
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
    return this.getWaveData()
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
