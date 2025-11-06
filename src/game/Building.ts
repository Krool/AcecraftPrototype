export enum BuildingType {
  HANGAR = 'HANGAR',
  MARKET = 'MARKET',
  RESEARCH_LAB = 'RESEARCH_LAB',
  FORGE = 'FORGE',
  COMMAND_CENTER = 'COMMAND_CENTER',
  POWER_REACTOR = 'POWER_REACTOR',
  DRONE_FACTORY = 'DRONE_FACTORY',
  TRAINING_SIMULATOR = 'TRAINING_SIMULATOR',
  ARCHIVE = 'ARCHIVE',
}

export interface BuildingConfig {
  name: string
  type: BuildingType
  description: string
  icon: string
  maxLevel: number
  baseCost: number // Cost for level 1
  costMultiplier: number // Each level costs more
  requiredHangarLevel: number // Hangar level required to unlock
}

export const BUILDING_CONFIGS: Record<BuildingType, BuildingConfig> = {
  [BuildingType.HANGAR]: {
    name: 'Hangar',
    type: BuildingType.HANGAR,
    description: 'Upgrade ship HP, speed, and weapon slots',
    icon: '▲',
    maxLevel: 10,
    baseCost: 100,
    costMultiplier: 1.5,
    requiredHangarLevel: 0,
  },
  [BuildingType.MARKET]: {
    name: 'Market',
    type: BuildingType.MARKET,
    description: 'Roll for new ships using gems',
    icon: '◎',
    maxLevel: 5,
    baseCost: 50,
    costMultiplier: 1.4,
    requiredHangarLevel: 1,
  },
  [BuildingType.POWER_REACTOR]: {
    name: 'Power Reactor',
    type: BuildingType.POWER_REACTOR,
    description: 'Increase pickup radius and magnet strength',
    icon: '◈',
    maxLevel: 6,
    baseCost: 100,
    costMultiplier: 1.6,
    requiredHangarLevel: 2,
  },
  [BuildingType.COMMAND_CENTER]: {
    name: 'Command Center',
    type: BuildingType.COMMAND_CENTER,
    description: 'Increase XP gain and unlock difficulty modes',
    icon: '◉',
    maxLevel: 8,
    baseCost: 120,
    costMultiplier: 1.8,
    requiredHangarLevel: 3,
  },
  [BuildingType.RESEARCH_LAB]: {
    name: 'Research Lab',
    type: BuildingType.RESEARCH_LAB,
    description: 'Unlock weapons and passives permanently',
    icon: '⚗',
    maxLevel: 5,
    baseCost: 150,
    costMultiplier: 2.0,
    requiredHangarLevel: 4,
  },
  [BuildingType.FORGE]: {
    name: 'Forge',
    type: BuildingType.FORGE,
    description: 'Upgrade weapon/passive max levels',
    icon: '⚒',
    maxLevel: 5,
    baseCost: 200,
    costMultiplier: 2.5,
    requiredHangarLevel: 5,
  },
  [BuildingType.DRONE_FACTORY]: {
    name: 'Drone Factory',
    type: BuildingType.DRONE_FACTORY,
    description: 'Add passive auto-collect drones',
    icon: '◉',
    maxLevel: 5,
    baseCost: 180,
    costMultiplier: 2.2,
    requiredHangarLevel: 6,
  },
  [BuildingType.TRAINING_SIMULATOR]: {
    name: 'Training Simulator',
    type: BuildingType.TRAINING_SIMULATOR,
    description: 'Preview and test weapons before runs',
    icon: '⊕',
    maxLevel: 1,
    baseCost: 250,
    costMultiplier: 1.0,
    requiredHangarLevel: 7,
  },
  [BuildingType.ARCHIVE]: {
    name: 'Archive',
    type: BuildingType.ARCHIVE,
    description: 'Track achievements for permanent boosts',
    icon: '▓',
    maxLevel: 10,
    baseCost: 150,
    costMultiplier: 1.7,
    requiredHangarLevel: 8,
  },
}

export interface BuildingState {
  type: BuildingType
  level: number
  unlocked: boolean
}

export class Building {
  private config: BuildingConfig
  private level: number
  private unlocked: boolean

  constructor(type: BuildingType, level: number = 0, unlocked: boolean = false) {
    this.config = BUILDING_CONFIGS[type]
    this.level = level
    this.unlocked = unlocked
  }

  getConfig(): BuildingConfig {
    return this.config
  }

  getLevel(): number {
    return this.level
  }

  isUnlocked(): boolean {
    return this.unlocked
  }

  unlock(): void {
    this.unlocked = true
  }

  getRequiredHangarLevel(): number {
    return this.config.requiredHangarLevel
  }

  canUnlock(hangarLevel: number): boolean {
    return !this.unlocked && hangarLevel >= this.config.requiredHangarLevel
  }

  canUpgrade(): boolean {
    return this.unlocked && this.level < this.config.maxLevel
  }

  getUpgradeCost(): number {
    if (!this.canUpgrade()) return 0
    return Math.floor(this.config.baseCost * Math.pow(this.config.costMultiplier, this.level))
  }

  upgrade(): boolean {
    if (!this.canUpgrade()) return false
    this.level++
    return true
  }

  // Get benefits based on building type and level
  getBenefits(): { [key: string]: number } {
    switch (this.config.type) {
      case BuildingType.HANGAR:
        return {
          maxHealth: 10 * this.level,
          moveSpeed: 5 * this.level,
          weaponSlots: Math.floor(this.level / 3), // +1 slot every 3 levels
        }
      case BuildingType.RESEARCH_LAB:
        return {
          unlockedWeapons: this.level,
          unlockedPassives: this.level,
        }
      case BuildingType.FORGE:
        return {
          maxWeaponLevel: this.level,
        }
      case BuildingType.COMMAND_CENTER:
        return {
          xpMultiplier: 0.1 * this.level,
        }
      case BuildingType.POWER_REACTOR:
        return {
          pickupRadius: 20 * this.level,
        }
      case BuildingType.DRONE_FACTORY:
        return {
          autoDrones: this.level,
        }
      case BuildingType.ARCHIVE:
        return {
          permanentDamage: 0.05 * this.level,
        }
      default:
        return {}
    }
  }

  serialize(): BuildingState {
    return {
      type: this.config.type,
      level: this.level,
      unlocked: this.unlocked,
    }
  }

  static deserialize(state: BuildingState): Building {
    return new Building(state.type, state.level, state.unlocked)
  }
}
