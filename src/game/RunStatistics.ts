import { CharacterType } from './Character'
import { WeaponType } from './Weapon'
import { PassiveType } from './Passive'
import { EvolutionType } from './Evolution'

export interface WeaponDPSData {
  weaponName: string
  totalDamage: number
  activeTime: number  // Time weapon was owned (seconds)
  dps: number
}

interface CharacterStats {
  runs: number
  wins: number
  totalSurvivalTime: number
  totalDamageDealt: number
  totalKills: number
  longestSurvival: number
}

interface WeaponStats {
  timesPicked: number
  wins: number
  totalDamageDealt: number
}

interface PassiveStats {
  timesPicked: number
  wins: number
}

interface EvolutionStats {
  timesAchieved: number
  wins: number
}

interface RunData {
  character: CharacterType
  weapons: WeaponType[]
  passives: PassiveType[]
  evolutions: EvolutionType[]
  won: boolean
  survivalTime: number
  damageDealt: number
  killCount: number
  level: number
  timestamp: number
  weaponDPS?: WeaponDPSData[]  // Per-weapon DPS data for balance analysis
}

interface StatisticsData {
  characters: Map<CharacterType, CharacterStats>
  weapons: Map<WeaponType, WeaponStats>
  passives: Map<PassiveType, PassiveStats>
  evolutions: Map<EvolutionType, EvolutionStats>
  recentRuns: RunData[]
  totalRuns: number
  totalWins: number
}

export class RunStatistics {
  private static instance: RunStatistics
  private data: StatisticsData
  private currentRun: Partial<RunData> = {}
  private readonly STORAGE_KEY = 'acecraft_run_statistics'
  private readonly MAX_RECENT_RUNS = 50

  private constructor() {
    this.data = this.loadFromStorage()
  }

  static getInstance(): RunStatistics {
    if (!RunStatistics.instance) {
      RunStatistics.instance = new RunStatistics()
    }
    return RunStatistics.instance
  }

  // Initialize a new run
  startRun(character: CharacterType) {
    this.currentRun = {
      character,
      weapons: [],
      passives: [],
      evolutions: [],
      timestamp: Date.now()
    }
  }

  // Track when weapons are picked/leveled
  addWeapon(weapon: WeaponType) {
    if (!this.currentRun.weapons) this.currentRun.weapons = []
    if (!this.currentRun.weapons.includes(weapon)) {
      this.currentRun.weapons.push(weapon)
    }
  }

  // Track when passives are picked/leveled
  addPassive(passive: PassiveType) {
    if (!this.currentRun.passives) this.currentRun.passives = []
    if (!this.currentRun.passives.includes(passive)) {
      this.currentRun.passives.push(passive)
    }
  }

  // Track when evolutions are achieved
  addEvolution(evolution: EvolutionType) {
    if (!this.currentRun.evolutions) this.currentRun.evolutions = []
    if (!this.currentRun.evolutions.includes(evolution)) {
      this.currentRun.evolutions.push(evolution)
    }
  }

  // Complete a run and save statistics
  endRun(won: boolean, survivalTime: number, damageDealt: number, killCount: number, level: number, weaponDPS?: WeaponDPSData[]) {
    if (!this.currentRun.character) return // No run in progress

    const runData: RunData = {
      character: this.currentRun.character,
      weapons: this.currentRun.weapons || [],
      passives: this.currentRun.passives || [],
      evolutions: this.currentRun.evolutions || [],
      won,
      survivalTime,
      damageDealt,
      killCount,
      level,
      timestamp: this.currentRun.timestamp || Date.now(),
      weaponDPS
    }

    // Console log weapon DPS data for balance analysis
    if (weaponDPS && weaponDPS.length > 0) {
      console.log('=== WEAPON DPS ANALYSIS ===')
      console.log(`Run: ${won ? 'WON' : 'LOST'} | Level ${level} | Time: ${survivalTime}s`)
      console.log('Weapon Performance:')
      weaponDPS.forEach(data => {
        console.log(`  ${data.weaponName}:`)
        console.log(`    DPS: ${data.dps.toFixed(1)}`)
        console.log(`    Total Damage: ${data.totalDamage.toFixed(0)}`)
        console.log(`    Active Time: ${data.activeTime.toFixed(1)}s`)
      })
      console.log('===========================')
    }

    // Update character stats
    const charStats = this.getOrCreateCharacterStats(runData.character)
    charStats.runs++
    if (won) charStats.wins++
    charStats.totalSurvivalTime += survivalTime
    charStats.totalDamageDealt += damageDealt
    charStats.totalKills += killCount
    if (survivalTime > charStats.longestSurvival) {
      charStats.longestSurvival = survivalTime
    }

    // Update weapon stats
    runData.weapons.forEach(weapon => {
      const weaponStats = this.getOrCreateWeaponStats(weapon)
      weaponStats.timesPicked++
      weaponStats.totalDamageDealt += damageDealt / runData.weapons.length // Distribute damage
      if (won) weaponStats.wins++
    })

    // Update passive stats
    runData.passives.forEach(passive => {
      const passiveStats = this.getOrCreatePassiveStats(passive)
      passiveStats.timesPicked++
      if (won) passiveStats.wins++
    })

    // Update evolution stats
    runData.evolutions.forEach(evolution => {
      const evoStats = this.getOrCreateEvolutionStats(evolution)
      evoStats.timesAchieved++
      if (won) evoStats.wins++
    })

    // Add to recent runs
    this.data.recentRuns.unshift(runData)
    if (this.data.recentRuns.length > this.MAX_RECENT_RUNS) {
      this.data.recentRuns = this.data.recentRuns.slice(0, this.MAX_RECENT_RUNS)
    }

    // Update totals
    this.data.totalRuns++
    if (won) this.data.totalWins++

    // Save to storage
    this.saveToStorage()

    // Clear current run
    this.currentRun = {}
  }

  // Get stats for a specific character
  getCharacterStats(character: CharacterType): CharacterStats | null {
    return this.data.characters.get(character) || null
  }

  // Get stats for a specific weapon
  getWeaponStats(weapon: WeaponType): WeaponStats | null {
    return this.data.weapons.get(weapon) || null
  }

  // Get stats for a specific passive
  getPassiveStats(passive: PassiveType): PassiveStats | null {
    return this.data.passives.get(passive) || null
  }

  // Get stats for a specific evolution
  getEvolutionStats(evolution: EvolutionType): EvolutionStats | null {
    return this.data.evolutions.get(evolution) || null
  }

  // Get overall stats
  getTotalStats() {
    return {
      totalRuns: this.data.totalRuns,
      totalWins: this.data.totalWins,
      winRate: this.data.totalRuns > 0 ? (this.data.totalWins / this.data.totalRuns) * 100 : 0
    }
  }

  // Get recent runs
  getRecentRuns(): RunData[] {
    return this.data.recentRuns
  }

  // Helper methods to create stats if they don't exist
  private getOrCreateCharacterStats(character: CharacterType): CharacterStats {
    if (!this.data.characters.has(character)) {
      this.data.characters.set(character, {
        runs: 0,
        wins: 0,
        totalSurvivalTime: 0,
        totalDamageDealt: 0,
        totalKills: 0,
        longestSurvival: 0
      })
    }
    return this.data.characters.get(character)!
  }

  private getOrCreateWeaponStats(weapon: WeaponType): WeaponStats {
    if (!this.data.weapons.has(weapon)) {
      this.data.weapons.set(weapon, {
        timesPicked: 0,
        wins: 0,
        totalDamageDealt: 0
      })
    }
    return this.data.weapons.get(weapon)!
  }

  private getOrCreatePassiveStats(passive: PassiveType): PassiveStats {
    if (!this.data.passives.has(passive)) {
      this.data.passives.set(passive, {
        timesPicked: 0,
        wins: 0
      })
    }
    return this.data.passives.get(passive)!
  }

  private getOrCreateEvolutionStats(evolution: EvolutionType): EvolutionStats {
    if (!this.data.evolutions.has(evolution)) {
      this.data.evolutions.set(evolution, {
        timesAchieved: 0,
        wins: 0
      })
    }
    return this.data.evolutions.get(evolution)!
  }

  // Persistence
  private loadFromStorage(): StatisticsData {
    try {
      const stored = localStorage.getItem(this.STORAGE_KEY)
      if (stored) {
        const parsed = JSON.parse(stored)

        // Migrate old character stats to include totalKills if missing
        const characters = new Map(Object.entries(parsed.characters || {}) as [CharacterType, CharacterStats][])
        characters.forEach((stats, character) => {
          if (stats.totalKills === undefined) {
            stats.totalKills = 0 // Initialize to 0 for old save data
          }
        })

        return {
          characters,
          weapons: new Map(Object.entries(parsed.weapons || {}) as [WeaponType, WeaponStats][]),
          passives: new Map(Object.entries(parsed.passives || {}) as [PassiveType, PassiveStats][]),
          evolutions: new Map(Object.entries(parsed.evolutions || {}) as [EvolutionType, EvolutionStats][]),
          recentRuns: parsed.recentRuns || [],
          totalRuns: parsed.totalRuns || 0,
          totalWins: parsed.totalWins || 0
        }
      }
    } catch (e) {
      console.error('Failed to load statistics from storage:', e)
    }

    // Return empty data
    return {
      characters: new Map(),
      weapons: new Map(),
      passives: new Map(),
      evolutions: new Map(),
      recentRuns: [],
      totalRuns: 0,
      totalWins: 0
    }
  }

  private saveToStorage() {
    try {
      const toStore = {
        characters: Object.fromEntries(this.data.characters),
        weapons: Object.fromEntries(this.data.weapons),
        passives: Object.fromEntries(this.data.passives),
        evolutions: Object.fromEntries(this.data.evolutions),
        recentRuns: this.data.recentRuns,
        totalRuns: this.data.totalRuns,
        totalWins: this.data.totalWins
      }
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(toStore))
    } catch (e) {
      console.error('Failed to save statistics to storage:', e)
    }
  }

  // Reset all statistics (for debugging/testing)
  resetAll() {
    this.data = {
      characters: new Map(),
      weapons: new Map(),
      passives: new Map(),
      evolutions: new Map(),
      recentRuns: [],
      totalRuns: 0,
      totalWins: 0
    }
    this.saveToStorage()
  }
}
