import { Building, BuildingType, BuildingState, BUILDING_CONFIGS } from './Building'
import { CharacterType } from './Character'

export enum TutorialStep {
  NOT_STARTED = 'NOT_STARTED',
  FIRST_BATTLE = 'FIRST_BATTLE',
  BUILD_MARKET = 'BUILD_MARKET',
  OPEN_MARKET = 'OPEN_MARKET',
  ROLL_GACHA = 'ROLL_GACHA',
  COMPLETE = 'COMPLETE',
}

export interface CharacterStats {
  timesSelected: number
  totalDamageDealt: number
  totalTimePlayed: number // in milliseconds
  totalKills: number
  totalRuns: number
}

export interface GameStateData {
  credits: number
  gems: number
  buildings: BuildingState[]
  unlockedCharacters: CharacterType[]
  selectedCharacter: CharacterType
  totalRuns: number
  totalKills: number
  bestScore: number
  bestTime: number
  tutorialComplete: boolean
  tutorialStep: TutorialStep
  characterStats?: { [key: string]: CharacterStats }
}

export class GameState {
  private static instance: GameState
  private credits: number = 0
  private gems: number = 400 // Premium currency for gacha
  private buildings: Map<BuildingType, Building> = new Map()
  private unlockedCharacters: Set<CharacterType> = new Set([CharacterType.ACE])
  private selectedCharacter: CharacterType = CharacterType.ACE
  private totalRuns: number = 0
  private totalKills: number = 0
  private bestScore: number = 0
  private bestTime: number = 0
  private tutorialComplete: boolean = false
  private tutorialStep: TutorialStep = TutorialStep.NOT_STARTED
  private characterStats: Map<CharacterType, CharacterStats> = new Map()

  private constructor() {
    // Initialize all buildings as locked, level 0
    Object.values(BuildingType).forEach(type => {
      this.buildings.set(type, new Building(type, 0, false))
    })

    // Unlock Hangar by default
    this.buildings.get(BuildingType.HANGAR)!.unlock()
  }

  static getInstance(): GameState {
    if (!GameState.instance) {
      GameState.instance = new GameState()
      console.log('GameState - Initial tutorial step:', GameState.instance.tutorialStep)
      GameState.instance.load()
      console.log('GameState - After load tutorial step:', GameState.instance.tutorialStep)
    }
    return GameState.instance
  }

  static resetInstance(): void {
    GameState.instance = null as any
  }

  // Currency management
  getCredits(): number {
    return this.credits
  }

  addCredits(amount: number): void {
    this.credits += amount
    this.save()
  }

  spendCredits(amount: number): boolean {
    if (this.credits >= amount) {
      this.credits -= amount
      this.save()
      return true
    }
    return false
  }

  // Premium currency (Gems) management
  getGems(): number {
    return this.gems
  }

  addGems(amount: number): void {
    this.gems += amount
    this.save()
  }

  spendGems(amount: number): boolean {
    if (this.gems >= amount) {
      this.gems -= amount
      this.save()
      return true
    }
    return false
  }

  // Tutorial management
  isTutorialComplete(): boolean {
    return this.tutorialComplete
  }

  completeTutorial(): void {
    this.tutorialComplete = true
    this.tutorialStep = TutorialStep.COMPLETE
    this.save()
  }

  getTutorialStep(): TutorialStep {
    return this.tutorialStep
  }

  setTutorialStep(step: TutorialStep): void {
    this.tutorialStep = step
    if (step === TutorialStep.COMPLETE) {
      this.tutorialComplete = true
    }
    this.save()
  }

  // Building management
  getBuilding(type: BuildingType): Building {
    return this.buildings.get(type)!
  }

  getAllBuildings(): Building[] {
    return Array.from(this.buildings.values())
  }

  getHangarLevel(): number {
    const hangar = this.buildings.get(BuildingType.HANGAR)
    return hangar ? hangar.getLevel() : 0
  }

  unlockBuilding(type: BuildingType): boolean {
    const building = this.buildings.get(type)
    if (!building || building.isUnlocked()) {
      return false
    }

    // Check if hangar level requirement is met
    const hangarLevel = this.getHangarLevel()
    if (!building.canUnlock(hangarLevel)) {
      return false
    }

    building.unlock()
    this.save()
    return true
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
    const bonuses: { [key: string]: number } = {
      maxHealth: 0,
      moveSpeed: 0,
      weaponSlots: 0,
      xpMultiplier: 0,
      pickupRadius: 0,
      permanentDamage: 0,
    }

    this.buildings.forEach(building => {
      if (building.isUnlocked()) {
        const benefits = building.getBenefits()
        Object.entries(benefits).forEach(([key, value]) => {
          if (bonuses[key] !== undefined) {
            bonuses[key] += value
          } else {
            bonuses[key] = value
          }
        })
      }
    })

    return bonuses
  }

  // Persistence
  save(): void {
    const characterStatsObj: { [key: string]: CharacterStats } = {}
    this.characterStats.forEach((stats, type) => {
      characterStatsObj[type] = stats
    })

    const data: GameStateData = {
      credits: this.credits,
      gems: this.gems,
      buildings: Array.from(this.buildings.values()).map(b => b.serialize()),
      unlockedCharacters: Array.from(this.unlockedCharacters),
      selectedCharacter: this.selectedCharacter,
      totalRuns: this.totalRuns,
      totalKills: this.totalKills,
      bestScore: this.bestScore,
      bestTime: this.bestTime,
      tutorialComplete: this.tutorialComplete,
      tutorialStep: this.tutorialStep,
      characterStats: characterStatsObj,
    }

    localStorage.setItem('roguecraft_gamestate', JSON.stringify(data))
  }

  load(): void {
    const saved = localStorage.getItem('roguecraft_gamestate')
    if (!saved) return

    try {
      const data: GameStateData = JSON.parse(saved)
      this.credits = data.credits || 0
      this.gems = data.gems !== undefined ? data.gems : 400 // Default to 400 gems if not set
      this.totalRuns = data.totalRuns || 0
      this.totalKills = data.totalKills || 0
      this.bestScore = data.bestScore || 0
      this.bestTime = data.bestTime || 0
      this.tutorialComplete = data.tutorialComplete || false
      this.tutorialStep = data.tutorialStep || TutorialStep.NOT_STARTED

      // Load buildings
      if (data.buildings) {
        data.buildings.forEach(state => {
          this.buildings.set(state.type, Building.deserialize(state))
        })
      }

      // Load characters
      if (data.unlockedCharacters) {
        this.unlockedCharacters = new Set(data.unlockedCharacters)
      }
      if (data.selectedCharacter) {
        this.selectedCharacter = data.selectedCharacter
      }

      // Load character stats
      if (data.characterStats) {
        this.characterStats = new Map()
        Object.entries(data.characterStats).forEach(([type, stats]) => {
          this.characterStats.set(type as CharacterType, stats)
        })
      }
    } catch (error) {
      console.error('Failed to load game state:', error)
    }
  }

  reset(): void {
    this.credits = 0
    this.gems = 400
    this.buildings.forEach(building => {
      this.buildings.set(building.getConfig().type, new Building(building.getConfig().type, 0, false))
    })
    this.buildings.get(BuildingType.HANGAR)!.unlock()
    this.unlockedCharacters = new Set([CharacterType.ACE])
    this.selectedCharacter = CharacterType.ACE
    this.totalRuns = 0
    this.totalKills = 0
    this.bestScore = 0
    this.bestTime = 0
    this.tutorialComplete = false
    this.tutorialStep = TutorialStep.NOT_STARTED
    this.characterStats = new Map()
    this.save()
  }
}
