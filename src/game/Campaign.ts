import { EnemyType } from './Enemy'

export interface EnemyWave {
  type: EnemyType
  count: number
  spawnDelay: number  // ms between spawns for this wave
  clustered?: boolean  // spawn in groups
}

export interface CampaignLevel {
  levelNumber: number
  name: string
  description: string
  waves: EnemyWave[]
  difficulty: number
  creditsReward: number
  xpMultiplier: number
}

export const CAMPAIGN_LEVELS: CampaignLevel[] = [
  // Level 0: Tutorial - Quick intro battle (MOSTLY FODDER + MINI-BOSS FINALE)
  {
    levelNumber: 0,
    name: 'Tutorial Mission',
    description: 'Welcome to Roguecraft. Defeat the enemies!',
    waves: [
      { type: EnemyType.DRONE, count: 20, spawnDelay: 800 },
      { type: EnemyType.WASP, count: 12, spawnDelay: 1000 },
      { type: EnemyType.DRONE, count: 8, spawnDelay: 700 },
      { type: EnemyType.MINI_BOSS, count: 1, spawnDelay: 3000 }, // Boss finale!
    ],
    difficulty: 0.8,
    creditsReward: 100,
    xpMultiplier: 1.5,
  },

  // Level 1: Only basic drones (NO SHOOTING)
  {
    levelNumber: 1,
    name: 'First Contact',
    description: 'Learn the basics. Enemy drones approach.',
    waves: [
      { type: EnemyType.DRONE, count: 40, spawnDelay: 700 },
      { type: EnemyType.DRONE, count: 30, spawnDelay: 600 },
    ],
    difficulty: 1,
    creditsReward: 50,
    xpMultiplier: 1.0,
  },

  // Level 2: Introduce wasps (NO SHOOTING)
  {
    levelNumber: 2,
    name: 'Wasp Nest',
    description: 'Fast zigzagging wasps join the fight.',
    waves: [
      { type: EnemyType.DRONE, count: 35, spawnDelay: 650 },
      { type: EnemyType.WASP, count: 25, spawnDelay: 750 },
      { type: EnemyType.DRONE, count: 20, spawnDelay: 600 },
    ],
    difficulty: 1.2,
    creditsReward: 75,
    xpMultiplier: 1.1,
  },

  // Level 3: Introduce chargers (NO SHOOTING)
  {
    levelNumber: 3,
    name: 'Rapid Response',
    description: 'Chargers rush toward your position.',
    waves: [
      { type: EnemyType.DRONE, count: 40, spawnDelay: 600 },
      { type: EnemyType.WASP, count: 20, spawnDelay: 700 },
      { type: EnemyType.CHARGER, count: 15, spawnDelay: 900 },
    ],
    difficulty: 1.4,
    creditsReward: 100,
    xpMultiplier: 1.2,
  },

  // Level 4: First shooting enemies - introduce tanks SPARINGLY
  {
    levelNumber: 4,
    name: 'Heavy Armor',
    description: 'Tanks with high HP and spread fire appear.',
    waves: [
      { type: EnemyType.DRONE, count: 50, spawnDelay: 550 },
      { type: EnemyType.WASP, count: 30, spawnDelay: 650 },
      { type: EnemyType.CHARGER, count: 20, spawnDelay: 750 },
      { type: EnemyType.TANK, count: 3, spawnDelay: 2500 }, // Only 3 tanks!
    ],
    difficulty: 1.6,
    creditsReward: 125,
    xpMultiplier: 1.3,
  },

  // Level 5: Introduce swarmers (NO NEW SHOOTING)
  {
    levelNumber: 5,
    name: 'Swarm Protocol',
    description: 'Swarmers travel in dangerous clusters.',
    waves: [
      { type: EnemyType.DRONE, count: 45, spawnDelay: 600 },
      { type: EnemyType.SWARMER, count: 50, spawnDelay: 400, clustered: true },
      { type: EnemyType.WASP, count: 30, spawnDelay: 700 },
      { type: EnemyType.CHARGER, count: 20, spawnDelay: 800 },
      { type: EnemyType.TANK, count: 4, spawnDelay: 2300 }, // Still only 4 tanks
    ],
    difficulty: 1.8,
    creditsReward: 150,
    xpMultiplier: 1.4,
  },

  // Level 6: Introduce bombers (NO SHOOTING BUT DANGEROUS)
  {
    levelNumber: 6,
    name: 'Explosive Payload',
    description: 'Bombers explode on death - keep your distance!',
    waves: [
      { type: EnemyType.DRONE, count: 50, spawnDelay: 550 },
      { type: EnemyType.BOMBER, count: 12, spawnDelay: 1100 },
      { type: EnemyType.CHARGER, count: 25, spawnDelay: 700 },
      { type: EnemyType.WASP, count: 30, spawnDelay: 650 },
      { type: EnemyType.TANK, count: 5, spawnDelay: 2200 },
    ],
    difficulty: 2.0,
    creditsReward: 175,
    xpMultiplier: 1.5,
  },

  // Level 7: Introduce snipers SPARINGLY
  {
    levelNumber: 7,
    name: 'Precision Strike',
    description: 'Snipers lock on with charged shots.',
    waves: [
      { type: EnemyType.DRONE, count: 50, spawnDelay: 550 },
      { type: EnemyType.WASP, count: 35, spawnDelay: 650 },
      { type: EnemyType.CHARGER, count: 30, spawnDelay: 700 },
      { type: EnemyType.SNIPER, count: 4, spawnDelay: 2000 }, // Only 4 snipers!
      { type: EnemyType.TANK, count: 6, spawnDelay: 1800 },
    ],
    difficulty: 2.2,
    creditsReward: 200,
    xpMultiplier: 1.6,
  },

  // Level 8: Introduce hunters GRADUALLY
  {
    levelNumber: 8,
    name: 'Hunting Party',
    description: 'Hunters track and fire at your ship.',
    waves: [
      { type: EnemyType.DRONE, count: 55, spawnDelay: 500 },
      { type: EnemyType.WASP, count: 40, spawnDelay: 600 },
      { type: EnemyType.CHARGER, count: 30, spawnDelay: 700 },
      { type: EnemyType.HUNTER, count: 8, spawnDelay: 1500 }, // Only 8 hunters
      { type: EnemyType.TANK, count: 7, spawnDelay: 1700 },
    ],
    difficulty: 2.4,
    creditsReward: 225,
    xpMultiplier: 1.7,
  },

  // Level 9: Introduce turrets SPARINGLY
  {
    levelNumber: 9,
    name: 'Defensive Line',
    description: 'Stationary turrets create danger zones.',
    waves: [
      { type: EnemyType.DRONE, count: 60, spawnDelay: 480 },
      { type: EnemyType.SWARMER, count: 50, spawnDelay: 400, clustered: true },
      { type: EnemyType.WASP, count: 40, spawnDelay: 600 },
      { type: EnemyType.TURRET, count: 5, spawnDelay: 2200 }, // Only 5 turrets
      { type: EnemyType.HUNTER, count: 10, spawnDelay: 1400 },
      { type: EnemyType.TANK, count: 8, spawnDelay: 1600 },
    ],
    difficulty: 2.6,
    creditsReward: 250,
    xpMultiplier: 1.8,
  },

  // Level 10: Introduce splitters (NO SHOOTING)
  {
    levelNumber: 10,
    name: 'Division Protocol',
    description: 'Splitters multiply when destroyed.',
    waves: [
      { type: EnemyType.DRONE, count: 60, spawnDelay: 480 },
      { type: EnemyType.SPLITTER, count: 15, spawnDelay: 1100 },
      { type: EnemyType.SWARMER, count: 60, spawnDelay: 350, clustered: true },
      { type: EnemyType.CHARGER, count: 35, spawnDelay: 650 },
      { type: EnemyType.HUNTER, count: 12, spawnDelay: 1300 },
      { type: EnemyType.TANK, count: 9, spawnDelay: 1500 },
    ],
    difficulty: 2.8,
    creditsReward: 275,
    xpMultiplier: 1.9,
  },

  // Level 11: Introduce orbiters GRADUALLY
  {
    levelNumber: 11,
    name: 'Orbital Assault',
    description: 'Orbiters circle while firing.',
    waves: [
      { type: EnemyType.DRONE, count: 65, spawnDelay: 450 },
      { type: EnemyType.WASP, count: 45, spawnDelay: 580 },
      { type: EnemyType.CHARGER, count: 35, spawnDelay: 650 },
      { type: EnemyType.ORBITER, count: 6, spawnDelay: 1900 }, // Only 6 orbiters
      { type: EnemyType.SNIPER, count: 6, spawnDelay: 1800 },
      { type: EnemyType.HUNTER, count: 14, spawnDelay: 1200 },
    ],
    difficulty: 3.0,
    creditsReward: 300,
    xpMultiplier: 2.0,
  },

  // Level 12: Introduce healers (NO SHOOTING BUT SUPPORT)
  {
    levelNumber: 12,
    name: 'Support Fleet',
    description: 'Healers sustain nearby enemies - prioritize them!',
    waves: [
      { type: EnemyType.DRONE, count: 70, spawnDelay: 430 },
      { type: EnemyType.SWARMER, count: 60, spawnDelay: 380, clustered: true },
      { type: EnemyType.HEALER, count: 5, spawnDelay: 2400 }, // Only 5 healers!
      { type: EnemyType.TANK, count: 10, spawnDelay: 1400 },
      { type: EnemyType.HUNTER, count: 16, spawnDelay: 1100 },
      { type: EnemyType.ORBITER, count: 7, spawnDelay: 1800 },
    ],
    difficulty: 3.2,
    creditsReward: 350,
    xpMultiplier: 2.1,
  },

  // Level 13: Mixed assault - MORE FODDER, SOME SHOOTERS
  {
    levelNumber: 13,
    name: 'Combined Arms',
    description: 'All enemy types coordinate their attack.',
    waves: [
      { type: EnemyType.DRONE, count: 70, spawnDelay: 420 },
      { type: EnemyType.WASP, count: 50, spawnDelay: 520 },
      { type: EnemyType.CHARGER, count: 40, spawnDelay: 620 },
      { type: EnemyType.SWARMER, count: 60, spawnDelay: 380, clustered: true },
      { type: EnemyType.BOMBER, count: 20, spawnDelay: 900 },
      { type: EnemyType.TANK, count: 12, spawnDelay: 1300 },
      { type: EnemyType.HUNTER, count: 18, spawnDelay: 1000 },
      { type: EnemyType.SNIPER, count: 8, spawnDelay: 1700 },
    ],
    difficulty: 3.5,
    creditsReward: 400,
    xpMultiplier: 2.2,
  },

  // Level 14: Chaos level - LOTS OF FODDER, MODERATE SHOOTERS
  {
    levelNumber: 14,
    name: 'Perfect Storm',
    description: 'Overwhelming numbers test your limits.',
    waves: [
      { type: EnemyType.DRONE, count: 80, spawnDelay: 400 },
      { type: EnemyType.SWARMER, count: 80, spawnDelay: 350, clustered: true },
      { type: EnemyType.WASP, count: 60, spawnDelay: 500 },
      { type: EnemyType.SPLITTER, count: 20, spawnDelay: 1000 },
      { type: EnemyType.CHARGER, count: 45, spawnDelay: 600 },
      { type: EnemyType.HEALER, count: 6, spawnDelay: 2200 },
      { type: EnemyType.TANK, count: 14, spawnDelay: 1200 },
      { type: EnemyType.HUNTER, count: 20, spawnDelay: 950 },
      { type: EnemyType.ORBITER, count: 8, spawnDelay: 1700 },
      { type: EnemyType.TURRET, count: 6, spawnDelay: 2000 },
    ],
    difficulty: 3.8,
    creditsReward: 450,
    xpMultiplier: 2.3,
  },

  // Level 15: Final challenge - MASSIVE FODDER, MANY SHOOTERS
  {
    levelNumber: 15,
    name: 'Last Stand',
    description: 'The ultimate test of skill and strategy.',
    waves: [
      { type: EnemyType.DRONE, count: 90, spawnDelay: 380 },
      { type: EnemyType.SWARMER, count: 100, spawnDelay: 330, clustered: true },
      { type: EnemyType.WASP, count: 70, spawnDelay: 480 },
      { type: EnemyType.CHARGER, count: 50, spawnDelay: 580 },
      { type: EnemyType.BOMBER, count: 30, spawnDelay: 850 },
      { type: EnemyType.SPLITTER, count: 25, spawnDelay: 950 },
      { type: EnemyType.HEALER, count: 8, spawnDelay: 2100 },
      { type: EnemyType.TANK, count: 16, spawnDelay: 1150 },
      { type: EnemyType.HUNTER, count: 25, spawnDelay: 900 },
      { type: EnemyType.SNIPER, count: 12, spawnDelay: 1300 },
      { type: EnemyType.ORBITER, count: 10, spawnDelay: 1600 },
      { type: EnemyType.TURRET, count: 8, spawnDelay: 1900 },
    ],
    difficulty: 4.0,
    creditsReward: 500,
    xpMultiplier: 2.5,
  },
]

export class CampaignManager {
  private currentLevel: number = 1
  private currentWaveIndex: number = 0
  private currentEnemyInWave: number = 0
  private lastSpawnTime: number = 0
  private levelComplete: boolean = false

  constructor() {}

  setLevel(levelNumber: number) {
    // Allow level 0 (tutorial)
    this.currentLevel = Math.max(0, Math.min(levelNumber, CAMPAIGN_LEVELS.length - 1))
    this.reset()
  }

  getCurrentLevel(): CampaignLevel {
    return CAMPAIGN_LEVELS[this.currentLevel]
  }

  getLevelCount(): number {
    return CAMPAIGN_LEVELS.length
  }

  reset() {
    this.currentWaveIndex = 0
    this.currentEnemyInWave = 0
    this.lastSpawnTime = 0 // Start at 0 to match Phaser's time system
    this.levelComplete = false
  }

  // Returns the next enemy to spawn, or null if wave is complete
  getNextEnemy(currentTime: number): { type: EnemyType; clustered: boolean } | null {
    if (this.levelComplete) return null

    const level = this.getCurrentLevel()

    // Check if all waves are complete
    if (this.currentWaveIndex >= level.waves.length) {
      this.levelComplete = true
      return null
    }

    const currentWave = level.waves[this.currentWaveIndex]

    // Check if current wave is complete
    if (this.currentEnemyInWave >= currentWave.count) {
      this.currentWaveIndex++
      this.currentEnemyInWave = 0
      this.lastSpawnTime = currentTime
      return this.getNextEnemy(currentTime) // Recursively check next wave
    }

    // Check if enough time has passed for next spawn
    if (currentTime - this.lastSpawnTime < currentWave.spawnDelay) {
      return null
    }

    // Spawn next enemy
    this.currentEnemyInWave++
    this.lastSpawnTime = currentTime

    return {
      type: currentWave.type,
      clustered: currentWave.clustered || false,
    }
  }

  isLevelComplete(): boolean {
    return this.levelComplete
  }

  getProgress(): { wave: number; totalWaves: number; enemiesInWave: number; totalInWave: number } {
    const level = this.getCurrentLevel()
    const currentWave = this.currentWaveIndex < level.waves.length ? level.waves[this.currentWaveIndex] : null

    return {
      wave: this.currentWaveIndex + 1,
      totalWaves: level.waves.length,
      enemiesInWave: this.currentEnemyInWave,
      totalInWave: currentWave?.count || 0,
    }
  }

  nextLevel(): boolean {
    if (this.currentLevel < CAMPAIGN_LEVELS.length) {
      this.currentLevel++
      this.reset()
      return true
    }
    return false
  }

  getDifficulty(): number {
    return this.getCurrentLevel().difficulty
  }
}
