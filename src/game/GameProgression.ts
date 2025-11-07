import { CharacterType, CHARACTER_CONFIGS } from './Character'

export interface ProgressionData {
  levelsCompleted: number[] // Array of completed level numbers (1-10)
  unlockedShips: CharacterType[] // Ships that are unlocked (available for purchase)
  purchasedShips: CharacterType[] // Ships that have been purchased
  totalCredits: number // Total credits earned across all runs
  highestLevelReached: number // Highest level player has reached
}

export class GameProgression {
  private static STORAGE_KEY = 'roguecraft_progression'
  private data: ProgressionData

  constructor() {
    this.data = this.loadProgression()
  }

  private loadProgression(): ProgressionData {
    const saved = localStorage.getItem(GameProgression.STORAGE_KEY)

    let data: ProgressionData
    if (saved) {
      try {
        data = JSON.parse(saved)
        console.log('[GameProgression] Loaded progression from localStorage:', data)
      } catch (e) {
        console.error('Failed to load progression data:', e)
        // Default progression - start with Vulcan unlocked and purchased
        console.log('[GameProgression] No saved data, using default progression')
        data = {
          levelsCompleted: [],
          unlockedShips: [CharacterType.VULCAN],
          purchasedShips: [CharacterType.VULCAN],
          totalCredits: 0,
          highestLevelReached: 0,
        }
      }
    } else {
      // Default progression - start with Vulcan unlocked and purchased
      console.log('[GameProgression] No saved data, using default progression')
      data = {
        levelsCompleted: [],
        unlockedShips: [CharacterType.VULCAN],
        purchasedShips: [CharacterType.VULCAN],
        totalCredits: 0,
        highestLevelReached: 0,
      }
    }

    // Auto-unlock all ships with unlockLevel: 0 (starter ships)
    Object.values(CHARACTER_CONFIGS).forEach(config => {
      if (config.unlockLevel === 0 && !data.unlockedShips.includes(config.type)) {
        data.unlockedShips.push(config.type)
        console.log(`[GameProgression] Auto-unlocked ${config.name} (unlockLevel: 0)`)
      }
    })

    return data
  }

  private saveProgression(): void {
    try {
      localStorage.setItem(GameProgression.STORAGE_KEY, JSON.stringify(this.data))
    } catch (e) {
      console.error('Failed to save progression data:', e)
    }
  }

  // Mark a level as completed and unlock associated ships
  completeLevel(levelNumber: number): void {
    if (!this.data.levelsCompleted.includes(levelNumber)) {
      this.data.levelsCompleted.push(levelNumber)
      this.data.highestLevelReached = Math.max(this.data.highestLevelReached, levelNumber)

      // Unlock all ships that require this level or lower
      this.updateUnlockedShips()

      this.saveProgression()
    }
  }

  private updateUnlockedShips(): void {
    const highestCompleted = Math.max(...this.data.levelsCompleted, 0)

    // Unlock all ships where unlockLevel <= highestCompleted
    Object.values(CHARACTER_CONFIGS).forEach(config => {
      if (config.unlockLevel <= highestCompleted &&
          !this.data.unlockedShips.includes(config.type)) {
        this.data.unlockedShips.push(config.type)
      }
    })
  }

  // Add credits earned from a run
  addCredits(amount: number): void {
    this.data.totalCredits += amount
    this.saveProgression()
  }

  // Attempt to purchase a ship
  purchaseShip(shipType: CharacterType): { success: boolean; message: string } {
    const config = CHARACTER_CONFIGS[shipType]

    if (!config) {
      return { success: false, message: 'Ship not found' }
    }

    // Check if already purchased
    if (this.data.purchasedShips.includes(shipType)) {
      return { success: false, message: 'Already purchased' }
    }

    // Check if unlocked
    if (!this.data.unlockedShips.includes(shipType)) {
      return { success: false, message: 'Ship not unlocked yet' }
    }

    // Check if player has enough credits
    if (this.data.totalCredits < config.cost) {
      return {
        success: false,
        message: `Not enough credits (need ${config.cost}, have ${this.data.totalCredits})`
      }
    }

    // Purchase the ship
    this.data.totalCredits -= config.cost
    this.data.purchasedShips.push(shipType)
    this.saveProgression()

    return { success: true, message: `${config.name} purchased!` }
  }

  // Check if a ship is unlocked
  isShipUnlocked(shipType: CharacterType): boolean {
    return this.data.unlockedShips.includes(shipType)
  }

  // Check if a ship is purchased
  isShipPurchased(shipType: CharacterType): boolean {
    return this.data.purchasedShips.includes(shipType)
  }

  // Get all available ships for selection
  getAvailableShips(): CharacterType[] {
    return this.data.purchasedShips
  }

  // Get all unlocked but not yet purchased ships
  getUnlockedUnpurchasedShips(): CharacterType[] {
    return this.data.unlockedShips.filter(
      ship => !this.data.purchasedShips.includes(ship)
    )
  }

  // Get locked ships with their unlock requirements
  getLockedShips(): Array<{ ship: CharacterType; requiresLevel: number }> {
    const allShips = Object.values(CHARACTER_CONFIGS)
    const locked = allShips.filter(
      config => !this.data.unlockedShips.includes(config.type)
    )

    return locked.map(config => ({
      ship: config.type,
      requiresLevel: config.unlockLevel,
    }))
  }

  // Get current credits
  getCredits(): number {
    return this.data.totalCredits
  }

  // Get highest level reached
  getHighestLevel(): number {
    return this.data.highestLevelReached
  }

  // Get total levels completed
  getLevelsCompleted(): number[] {
    return [...this.data.levelsCompleted]
  }

  // Check if a level is completed
  isLevelCompleted(levelNumber: number): boolean {
    return this.data.levelsCompleted.includes(levelNumber)
  }

  // Reset progression (for debugging/testing)
  resetProgression(): void {
    this.data = {
      levelsCompleted: [],
      unlockedShips: [CharacterType.VULCAN],
      purchasedShips: [CharacterType.VULCAN],
      totalCredits: 0,
      highestLevelReached: 0,
    }

    // Auto-unlock all ships with unlockLevel: 0 (starter ships)
    Object.values(CHARACTER_CONFIGS).forEach(config => {
      if (config.unlockLevel === 0 && !this.data.unlockedShips.includes(config.type)) {
        this.data.unlockedShips.push(config.type)
      }
    })

    this.saveProgression()
  }

  // Get progression summary for display
  getProgressionSummary(): {
    levelsCompleted: number
    totalLevels: number
    shipsUnlocked: number
    totalShips: number
    shipsPurchased: number
    credits: number
  } {
    const totalShips = Object.keys(CHARACTER_CONFIGS).length

    return {
      levelsCompleted: this.data.levelsCompleted.length,
      totalLevels: 10,
      shipsUnlocked: this.data.unlockedShips.length,
      totalShips,
      shipsPurchased: this.data.purchasedShips.length,
      credits: this.data.totalCredits,
    }
  }
}

// Singleton instance
export const gameProgression = new GameProgression()
