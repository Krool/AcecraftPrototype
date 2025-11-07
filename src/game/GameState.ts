import { Building, BuildingType, BuildingState, BUILDING_CONFIGS } from './Building'
import { CharacterType } from './Character'
import { gameProgression } from './GameProgression'

export interface CharacterStats {
  timesSelected: number
  totalDamageDealt: number
  totalTimePlayed: number // in milliseconds
  totalKills: number
  totalRuns: number
}

export interface GameStateData {
  buildings: BuildingState[]
  unlockedCharacters: CharacterType[]
  selectedCharacter: CharacterType
  totalRuns: number
  totalKills: number
  bestScore: number
  bestTime: number
  unlockedLevels: number
  characterStats?: { [key: string]: CharacterStats }
  levelHighScores?: { [key: number]: number }
}

export class GameState {
  private static instance: GameState
  private buildings: Map<BuildingType, Building> = new Map()
  private unlockedCharacters: Set<CharacterType> = new Set([CharacterType.VULCAN])
  private selectedCharacter: CharacterType = CharacterType.VULCAN
  private totalRuns: number = 0
  private totalKills: number = 0
  private bestScore: number = 0
  private bestTime: number = 0
  private unlockedLevels: number = 1 // Start with level 1 unlocked (0-indexed)
  private characterStats: Map<CharacterType, CharacterStats> = new Map()
  private levelHighScores: Map<number, number> = new Map() // High scores per level index

  private constructor() {
    // Initialize all buildings at level 0 (all available)
    Object.values(BuildingType).forEach(type => {
      this.buildings.set(type, new Building(type, 0))
    })
  }

  static getInstance(): GameState {
    if (!GameState.instance) {
      GameState.instance = new GameState()
      GameState.instance.load()
    }
    return GameState.instance
  }

  static resetInstance(): void {
    GameState.instance = null as any
  }

  // Currency management - delegate to GameProgression
  getCredits(): number {
    return gameProgression.getCredits()
  }

  addCredits(amount: number): void {
    gameProgression.addCredits(amount)
  }

  spendCredits(amount: number): boolean {
    const credits = gameProgression.getCredits()
    if (credits >= amount) {
      // GameProgression doesn't have spendCredits, so we manually deduct
      gameProgression.addCredits(-amount)
      return true
    }
    return false
  }

  // Level progression management
  getUnlockedLevels(): number {
    return this.unlockedLevels
  }

  unlockNextLevel(): void {
    this.unlockedLevels++
    this.save()
  }

  isLevelUnlocked(levelIndex: number): boolean {
    return levelIndex < this.unlockedLevels
  }

  getLevelHighScore(levelIndex: number): number {
    return this.levelHighScores.get(levelIndex) || 0
  }

  setLevelHighScore(levelIndex: number, score: number): void {
    const currentHigh = this.getLevelHighScore(levelIndex)
    if (score > currentHigh) {
      this.levelHighScores.set(levelIndex, score)
      this.save()
    }
  }

  // Building management
  getBuilding(type: BuildingType): Building {
    return this.buildings.get(type)!
  }

  getAllBuildings(): Building[] {
    return Array.from(this.buildings.values())
  }


  upgradeBuilding(type: BuildingType): boolean {
    const building = this.buildings.get(type)
    if (!building) return false

    const cost = building.getUpgradeCost()
    if (cost > 0 && this.spendCredits(cost)) {
      building.upgrade()
      this.save()
      return true
    }
    return false
  }

  // Character management
  getUnlockedCharacters(): CharacterType[] {
    return Array.from(this.unlockedCharacters)
  }

  unlockCharacter(type: CharacterType): void {
    this.unlockedCharacters.add(type)
    this.save()
  }

  getSelectedCharacter(): CharacterType {
    return this.selectedCharacter
  }

  selectCharacter(type: CharacterType): boolean {
    if (this.unlockedCharacters.has(type)) {
      this.selectedCharacter = type
      // Increment times selected
      const stats = this.getOrCreateCharacterStats(type)
      stats.timesSelected++
      this.save()
      return true
    }
    return false
  }

  // Character stats management
  private getOrCreateCharacterStats(type: CharacterType): CharacterStats {
    if (!this.characterStats.has(type)) {
      this.characterStats.set(type, {
        timesSelected: 0,
        totalDamageDealt: 0,
        totalTimePlayed: 0,
        totalKills: 0,
        totalRuns: 0,
      })
    }
    return this.characterStats.get(type)!
  }

  getCharacterStats(type: CharacterType): CharacterStats {
    return this.getOrCreateCharacterStats(type)
  }

  getAllCharacterStats(): Map<CharacterType, CharacterStats> {
    // Ensure all unlocked characters have stats entries
    this.unlockedCharacters.forEach(type => {
      this.getOrCreateCharacterStats(type)
    })
    return new Map(this.characterStats)
  }

  recordCharacterRun(type: CharacterType, damageDealt: number, timePlayed: number, kills: number): void {
    const stats = this.getOrCreateCharacterStats(type)
    stats.totalDamageDealt += damageDealt
    stats.totalTimePlayed += timePlayed
    stats.totalKills += kills
    stats.totalRuns++
    this.save()
  }

  // Stats management
  recordRun(score: number, time: number, kills: number): void {
    this.totalRuns++
    this.totalKills += kills
    if (score > this.bestScore) {
      this.bestScore = score
    }
    if (time > this.bestTime) {
      this.bestTime = time
    }
    this.save()
  }

  getTotalRuns(): number {
    return this.totalRuns
  }

  getTotalKills(): number {
    return this.totalKills
  }

  getBestScore(): number {
    return this.bestScore
  }

  getBestTime(): number {
    return this.bestTime
  }

  // Calculate total bonuses from buildings
  getTotalBonuses(): { [key: string]: number } {
    const bonuses: { [key: string]: number } = {}

    this.buildings.forEach(building => {
      const benefits = building.getBenefits()
      Object.entries(benefits).forEach(([key, value]) => {
        if (bonuses[key] !== undefined) {
          bonuses[key] += value
        } else {
          bonuses[key] = value
        }
      })
    })

    return bonuses
  }

  // Persistence
  save(): void {
    const characterStatsObj: { [key: string]: CharacterStats } = {}
    this.characterStats.forEach((stats, type) => {
      characterStatsObj[type] = stats
    })

    const levelHighScoresObj: { [key: number]: number } = {}
    this.levelHighScores.forEach((score, levelIndex) => {
      levelHighScoresObj[levelIndex] = score
    })

    const data: GameStateData = {
      buildings: Array.from(this.buildings.values()).map(b => b.serialize()),
      unlockedCharacters: Array.from(this.unlockedCharacters),
      selectedCharacter: this.selectedCharacter,
      totalRuns: this.totalRuns,
      totalKills: this.totalKills,
      bestScore: this.bestScore,
      bestTime: this.bestTime,
      unlockedLevels: this.unlockedLevels,
      characterStats: characterStatsObj,
      levelHighScores: levelHighScoresObj,
    }

    localStorage.setItem('roguecraft_gamestate', JSON.stringify(data))
  }

  load(): void {
    const saved = localStorage.getItem('roguecraft_gamestate')
    if (!saved) return

    try {
      const data: GameStateData = JSON.parse(saved)
      this.totalRuns = data.totalRuns || 0
      this.totalKills = data.totalKills || 0
      this.bestScore = data.bestScore || 0
      this.bestTime = data.bestTime || 0
      this.unlockedLevels = data.unlockedLevels || 1

      // Load buildings - filter out any invalid types
      if (data.buildings) {
        data.buildings.forEach(state => {
          // Only load if the building type still exists in BUILDING_CONFIGS
          if (BUILDING_CONFIGS[state.type]) {
            this.buildings.set(state.type, Building.deserialize(state))
          }
        })
      }

      // Load characters - validate that they exist in the current CharacterType enum
      if (data.unlockedCharacters) {
        const validCharacters = data.unlockedCharacters.filter(type =>
          Object.values(CharacterType).includes(type)
        )
        this.unlockedCharacters = new Set(validCharacters.length > 0 ? validCharacters : [CharacterType.VULCAN])
      }
      if (data.selectedCharacter && Object.values(CharacterType).includes(data.selectedCharacter)) {
        this.selectedCharacter = data.selectedCharacter
      } else {
        // If saved character is invalid, default to VULCAN
        this.selectedCharacter = CharacterType.VULCAN
        // Ensure VULCAN is unlocked
        this.unlockedCharacters.add(CharacterType.VULCAN)
      }

      // Load character stats
      if (data.characterStats) {
        this.characterStats = new Map()
        Object.entries(data.characterStats).forEach(([type, stats]) => {
          this.characterStats.set(type as CharacterType, stats)
        })
      }

      // Load level high scores
      if (data.levelHighScores) {
        this.levelHighScores = new Map()
        Object.entries(data.levelHighScores).forEach(([levelIndex, score]) => {
          this.levelHighScores.set(parseInt(levelIndex), score)
        })
      }
    } catch (error) {
      console.error('Failed to load game state:', error)
    }
  }

  reset(): void {
    // Reset GameProgression credits too
    gameProgression.resetProgression()
    this.buildings.forEach(building => {
      this.buildings.set(building.getConfig().type, new Building(building.getConfig().type, 0))
    })
    this.unlockedCharacters = new Set([CharacterType.VULCAN])
    this.selectedCharacter = CharacterType.VULCAN
    this.totalRuns = 0
    this.totalKills = 0
    this.bestScore = 0
    this.bestTime = 0
    this.unlockedLevels = 1
    this.characterStats = new Map()
    this.levelHighScores = new Map()
    this.save()
  }
}
