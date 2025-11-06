import Phaser from 'phaser'
import { WeaponModifiers } from './Weapon'

export enum PassiveType {
  BALLISTICS = 'BALLISTICS',
  WEAPON_SPEED_UP = 'WEAPON_SPEED_UP',
  SHIP_ARMOR = 'SHIP_ARMOR',
  ENERGY_CORE = 'ENERGY_CORE',
  PICKUP_RADIUS = 'PICKUP_RADIUS',
  EVASION_DRIVE = 'EVASION_DRIVE',
  CRITICAL_SYSTEMS = 'CRITICAL_SYSTEMS',
  THRUSTER_MOD = 'THRUSTER_MOD',
  OVERDRIVE_REACTOR = 'OVERDRIVE_REACTOR',
  SALVAGE_UNIT = 'SALVAGE_UNIT',
  DRONE_BAY_EXPANSION = 'DRONE_BAY_EXPANSION',
}

export interface PassiveConfig {
  name: string
  type: PassiveType
  description: string
  maxLevel: number
  icon: string
  color: string
}

export const PASSIVE_CONFIGS: Record<PassiveType, PassiveConfig> = {
  [PassiveType.BALLISTICS]: {
    name: 'Ballistics',
    type: PassiveType.BALLISTICS,
    description: 'Increased Physical Damage',
    maxLevel: 3,
    icon: '◆',
    color: '#ffaa00',
  },
  [PassiveType.WEAPON_SPEED_UP]: {
    name: 'Weapon Speed Up',
    type: PassiveType.WEAPON_SPEED_UP,
    description: 'Increases fire rate across all weapons',
    maxLevel: 3,
    icon: '»',
    color: '#ff4444',
  },
  [PassiveType.SHIP_ARMOR]: {
    name: 'Ship Armor',
    type: PassiveType.SHIP_ARMOR,
    description: 'Flat damage reduction',
    maxLevel: 3,
    icon: '◘',
    color: '#888888',
  },
  [PassiveType.ENERGY_CORE]: {
    name: 'Energy Core',
    type: PassiveType.ENERGY_CORE,
    description: 'Increases projectile size and range',
    maxLevel: 3,
    icon: '◎',
    color: '#00ffaa',
  },
  [PassiveType.PICKUP_RADIUS]: {
    name: 'Pickup Radius',
    type: PassiveType.PICKUP_RADIUS,
    description: 'Larger magnet for XP/currency',
    maxLevel: 3,
    icon: '⊙',
    color: '#ffff00',
  },
  [PassiveType.EVASION_DRIVE]: {
    name: 'Evasion Drive',
    type: PassiveType.EVASION_DRIVE,
    description: 'Small dodge chance',
    maxLevel: 3,
    icon: '◊',
    color: '#00aaff',
  },
  [PassiveType.CRITICAL_SYSTEMS]: {
    name: 'Critical Systems',
    type: PassiveType.CRITICAL_SYSTEMS,
    description: 'Adds crit chance across weapons',
    maxLevel: 3,
    icon: '✦',
    color: '#ffff00',
  },
  [PassiveType.THRUSTER_MOD]: {
    name: 'Thruster Mod',
    type: PassiveType.THRUSTER_MOD,
    description: 'Faster projectiles and acceleration',
    maxLevel: 3,
    icon: '►',
    color: '#ff8800',
  },
  [PassiveType.OVERDRIVE_REACTOR]: {
    name: 'Overdrive Reactor',
    type: PassiveType.OVERDRIVE_REACTOR,
    description: 'Attack speed burst after collecting XP',
    maxLevel: 3,
    icon: '◈',
    color: '#ff00ff',
  },
  [PassiveType.SALVAGE_UNIT]: {
    name: 'Salvage Unit',
    type: PassiveType.SALVAGE_UNIT,
    description: 'Spawns golden pinata enemies (more meta currency)',
    maxLevel: 3,
    icon: '¤',
    color: '#ffdd00',
  },
  [PassiveType.DRONE_BAY_EXPANSION]: {
    name: 'Drone Bay Expansion',
    type: PassiveType.DRONE_BAY_EXPANSION,
    description: 'Increases ally damage and attack speed',
    maxLevel: 3,
    icon: '⊚',
    color: '#88ff00',
  },
}

export abstract class Passive {
  protected scene: Phaser.Scene
  protected config: PassiveConfig
  protected level: number

  constructor(scene: Phaser.Scene, type: PassiveType) {
    this.scene = scene
    this.config = PASSIVE_CONFIGS[type]
    this.level = 1
  }

  abstract applyModifiers(modifiers: WeaponModifiers): void
  abstract applyPlayerEffects(playerStats: PlayerStats): void

  levelUp(): boolean {
    if (this.level < this.config.maxLevel) {
      this.level++
      return true
    }
    return false
  }

  getLevel(): number {
    return this.level
  }

  getMaxLevel(): number {
    return this.config.maxLevel
  }

  isMaxLevel(): boolean {
    return this.level >= this.config.maxLevel
  }

  getConfig(): PassiveConfig {
    return this.config
  }

  getInfo(): string {
    return `${this.config.name} Lv.${this.level}\n${this.config.description}`
  }
}

export interface PlayerStats {
  maxHealth: number
  currentHealth: number
  moveSpeed: number
  pickupRadius: number
  damageReduction: number
  dodgeChance: number
}

// Ballistics Implementation
export class BallisticsPassive extends Passive {
  applyModifiers(modifiers: WeaponModifiers): void {
    // +20% physical damage per level (applies to physical weapons)
    modifiers.damageMultiplier += 0.2 * this.level
  }

  applyPlayerEffects(playerStats: PlayerStats): void {
    // No direct player effects
  }
}

// Weapon Speed Up Implementation
export class WeaponSpeedUpPassive extends Passive {
  applyModifiers(modifiers: WeaponModifiers): void {
    // +15% fire rate per level (lower is better for fire rate)
    modifiers.fireRateMultiplier *= 1 - (0.15 * this.level)
  }

  applyPlayerEffects(playerStats: PlayerStats): void {
    // No direct player effects
  }
}

// Ship Armor Implementation
export class ShipArmorPassive extends Passive {
  applyModifiers(modifiers: WeaponModifiers): void {
    // No weapon modifiers
  }

  applyPlayerEffects(playerStats: PlayerStats): void {
    // Flat damage reduction: 2/4/6
    playerStats.damageReduction += 2 * this.level
  }
}

// Energy Core Implementation
export class EnergyCorePassive extends Passive {
  applyModifiers(modifiers: WeaponModifiers): void {
    // +25% projectile size per level
    modifiers.projectileSizeMultiplier += 0.25 * this.level
    // Projectile speed slightly increased for "range"
    modifiers.projectileSpeedMultiplier += 0.1 * this.level
  }

  applyPlayerEffects(playerStats: PlayerStats): void {
    // No direct player effects
  }
}

// Pickup Radius Implementation
export class PickupRadiusPassive extends Passive {
  applyModifiers(modifiers: WeaponModifiers): void {
    // No weapon modifiers
  }

  applyPlayerEffects(playerStats: PlayerStats): void {
    // +50 pixels per level
    playerStats.pickupRadius += 50 * this.level
  }
}

// Critical Systems Implementation
export class CriticalSystemsPassive extends Passive {
  applyModifiers(modifiers: WeaponModifiers): void {
    // +10% crit chance per level
    modifiers.critChance += 0.1 * this.level
  }

  applyPlayerEffects(playerStats: PlayerStats): void {
    // No direct player effects
  }
}

// Thruster Mod Implementation
export class ThrusterModPassive extends Passive {
  applyModifiers(modifiers: WeaponModifiers): void {
    // +20% projectile speed per level
    modifiers.projectileSpeedMultiplier += 0.2 * this.level
  }

  applyPlayerEffects(playerStats: PlayerStats): void {
    // +10% player movement speed per level
    playerStats.moveSpeed *= 1 + (0.1 * this.level)
  }
}

// Evasion Drive Implementation
export class EvasionDrivePassive extends Passive {
  applyModifiers(modifiers: WeaponModifiers): void {
    // No weapon modifiers
  }

  applyPlayerEffects(playerStats: PlayerStats): void {
    // +5% dodge chance per level
    playerStats.dodgeChance += 0.05 * this.level
  }
}

// Overdrive Reactor Implementation
export class OverdriveReactorPassive extends Passive {
  applyModifiers(modifiers: WeaponModifiers): void {
    // +10% fire rate per level (implemented as on-pickup burst)
    modifiers.fireRateMultiplier *= 1 - (0.1 * this.level)
  }

  applyPlayerEffects(playerStats: PlayerStats): void {
    // No direct player effects (burst on XP pickup handled in game logic)
  }
}

// Salvage Unit Implementation
export class SalvageUnitPassive extends Passive {
  applyModifiers(modifiers: WeaponModifiers): void {
    // No weapon modifiers
  }

  applyPlayerEffects(playerStats: PlayerStats): void {
    // Spawns golden pinata enemies - handled in game logic
  }
}

// Drone Bay Expansion Implementation
export class DroneBayExpansionPassive extends Passive {
  applyModifiers(modifiers: WeaponModifiers): void {
    // +15% damage per level for gun buddy type weapons
    modifiers.damageMultiplier += 0.15 * this.level
  }

  applyPlayerEffects(playerStats: PlayerStats): void {
    // No direct player effects
  }
}

// Passive Factory
export class PassiveFactory {
  static create(scene: Phaser.Scene, type: PassiveType): Passive {
    switch (type) {
      case PassiveType.BALLISTICS:
        return new BallisticsPassive(scene, type)
      case PassiveType.WEAPON_SPEED_UP:
        return new WeaponSpeedUpPassive(scene, type)
      case PassiveType.SHIP_ARMOR:
        return new ShipArmorPassive(scene, type)
      case PassiveType.ENERGY_CORE:
        return new EnergyCorePassive(scene, type)
      case PassiveType.PICKUP_RADIUS:
        return new PickupRadiusPassive(scene, type)
      case PassiveType.CRITICAL_SYSTEMS:
        return new CriticalSystemsPassive(scene, type)
      case PassiveType.THRUSTER_MOD:
        return new ThrusterModPassive(scene, type)
      case PassiveType.EVASION_DRIVE:
        return new EvasionDrivePassive(scene, type)
      case PassiveType.OVERDRIVE_REACTOR:
        return new OverdriveReactorPassive(scene, type)
      case PassiveType.SALVAGE_UNIT:
        return new SalvageUnitPassive(scene, type)
      case PassiveType.DRONE_BAY_EXPANSION:
        return new DroneBayExpansionPassive(scene, type)
      default:
        // Default to ballistics for unimplemented passives
        return new BallisticsPassive(scene, PassiveType.BALLISTICS)
    }
  }
}
