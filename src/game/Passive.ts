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
  VAMPIRIC_FIRE = 'VAMPIRIC_FIRE',
  FROST_HASTE = 'FROST_HASTE',
  STATIC_FORTUNE = 'STATIC_FORTUNE',
  WINGMAN_PROTOCOL = 'WINGMAN_PROTOCOL',
  TOXIC_ROUNDS = 'TOXIC_ROUNDS',
  PYROMANIAC = 'PYROMANIAC',
  SHATTER_STRIKE = 'SHATTER_STRIKE',
  HEMORRHAGE = 'HEMORRHAGE',
}

export interface PassiveConfig {
  name: string
  type: PassiveType
  description: string // Brief description for level-up popup
  detailedDescription: string // Full description for info pages
  maxLevel: number
  icon: string
  color: string
}

export const PASSIVE_CONFIGS: Record<PassiveType, PassiveConfig> = {
  [PassiveType.BALLISTICS]: {
    name: 'Ballistics',
    type: PassiveType.BALLISTICS,
    description: 'Increased Physical damage (+20% per level)',
    detailedDescription: 'Enhances all Physical damage weapons with precision targeting systems. Level 1: +20% damage. Level 2: +40% damage. Level 3: +60% damage. Synergizes with Cannon, Shotgun, Ricochet Disk, and other kinetic weapons.',
    maxLevel: 3,
    icon: '◆',
    color: '#ffff00',
  },
  [PassiveType.WEAPON_SPEED_UP]: {
    name: 'Weapon Speed Up',
    type: PassiveType.WEAPON_SPEED_UP,
    description: 'Universal fire rate increase (+10% per level)',
    detailedDescription: 'Overclocks all weapon firing mechanisms for universal fire rate increase. Level 1: +10% fire rate. Level 2: +20% fire rate. Level 3: +30% fire rate. Affects every weapon you have equipped, compounding your overall DPS.',
    maxLevel: 3,
    icon: '»',
    color: '#ffffff',
  },
  [PassiveType.SHIP_ARMOR]: {
    name: 'Ship Armor',
    type: PassiveType.SHIP_ARMOR,
    description: 'Flat damage reduction (-5 damage per level)',
    detailedDescription: 'Reinforced hull plating provides flat damage reduction against all incoming damage. Level 1: -5 damage. Level 2: -10 damage. Level 3: -15 damage. Essential for surviving later waves and boss encounters.',
    maxLevel: 3,
    icon: '◘',
    color: '#888888',
  },
  [PassiveType.ENERGY_CORE]: {
    name: 'Energy Core',
    type: PassiveType.ENERGY_CORE,
    description: 'Increases projectile size and speed',
    detailedDescription: 'Amplifies projectile energy matrices, increasing both size and travel speed. Level 1: +15% size, +10% speed. Level 2: +30% size, +20% speed. Level 3: +45% size, +30% speed. Larger projectiles hit more enemies and travel farther.',
    maxLevel: 3,
    icon: '◎',
    color: '#ffffff',
  },
  [PassiveType.PICKUP_RADIUS]: {
    name: 'Pickup Radius',
    type: PassiveType.PICKUP_RADIUS,
    description: 'Larger magnet for XP/currency (+50 pixels per level)',
    detailedDescription: 'Expands magnetic collection field for automatic XP and currency pickup. Level 1: +50 pixels. Level 2: +100 pixels. Level 3: +150 pixels. Dramatically reduces time spent chasing drops and keeps you mobile during intense combat.',
    maxLevel: 3,
    icon: '⊙',
    color: '#ffffff',
  },
  [PassiveType.EVASION_DRIVE]: {
    name: 'Evasion Drive',
    type: PassiveType.EVASION_DRIVE,
    description: 'Chance to dodge incoming damage (+5% per level)',
    detailedDescription: 'Quantum phase shifter grants chance to completely avoid incoming damage. Level 1: 5% dodge. Level 2: 10% dodge. Level 3: 15% dodge. Stacks multiplicatively with other defensive measures.',
    maxLevel: 3,
    icon: '◊',
    color: '#ffffff',
  },
  [PassiveType.CRITICAL_SYSTEMS]: {
    name: 'Critical Systems',
    type: PassiveType.CRITICAL_SYSTEMS,
    description: 'Critical hit chance and damage',
    detailedDescription: 'Advanced targeting computer enables critical hits across all weapons. Level 1: +10% crit chance, +25% crit damage. Level 2: +20% crit chance, +50% crit damage. Level 3: +30% crit chance, +75% crit damage. Transforms consistent DPS into devastating burst damage.',
    maxLevel: 3,
    icon: '✦',
    color: '#ffffff',
  },
  [PassiveType.THRUSTER_MOD]: {
    name: 'Thruster Mod',
    type: PassiveType.THRUSTER_MOD,
    description: 'Faster projectiles and player movement',
    detailedDescription: 'Upgraded thrusters boost both ship movement and projectile velocity. Level 1: +10% player speed, +15% projectile speed. Level 2: +20% player speed, +30% projectile speed. Level 3: +30% player speed, +45% projectile speed. Better mobility and faster projectiles reach enemies quicker.',
    maxLevel: 3,
    icon: '►',
    color: '#ffffff',
  },
  [PassiveType.OVERDRIVE_REACTOR]: {
    name: 'Overdrive Reactor',
    type: PassiveType.OVERDRIVE_REACTOR,
    description: 'Attack speed burst after collecting XP',
    detailedDescription: 'Converts collected XP into temporary power surge, granting attack speed burst. Level 1: +20% fire rate burst. Level 2: +40% fire rate burst. Level 3: +60% fire rate burst. Trigger powerful combos by collecting multiple XP gems rapidly.',
    maxLevel: 3,
    icon: '⊗',
    color: '#ffffff',
  },
  [PassiveType.SALVAGE_UNIT]: {
    name: 'Salvage Unit',
    type: PassiveType.SALVAGE_UNIT,
    description: 'Spawns golden pinata enemies (more meta currency)',
    detailedDescription: 'Automated salvage drones occasionally spawn golden "pinata" enemies that explode into bonus meta currency. Level 1: Rare spawns. Level 2: Uncommon spawns. Level 3: Common spawns. Essential for unlocking permanent upgrades between runs.',
    maxLevel: 3,
    icon: '¤',
    color: '#ffdd00',
  },
  [PassiveType.DRONE_BAY_EXPANSION]: {
    name: 'Drone Bay Expansion',
    type: PassiveType.DRONE_BAY_EXPANSION,
    description: 'Increases ally damage and attack speed',
    detailedDescription: 'Enhances all allied units and automated weapons with improved combat protocols. Level 1: +20% ally damage, +15% ally attack speed. Level 2: +40% ally damage, +30% ally attack speed. Level 3: +60% ally damage, +45% ally attack speed. Synergizes with Gun Buddy and other companion weapons.',
    maxLevel: 3,
    icon: '⊚',
    color: '#ffffff',
  },
  [PassiveType.VAMPIRIC_FIRE]: {
    name: 'Vampiric Fire',
    type: PassiveType.VAMPIRIC_FIRE,
    description: 'Fire damage heals you (10% per level)',
    detailedDescription: 'Experimental energy converter transforms Fire damage into life force restoration. Level 1: 10% of Fire damage heals you. Level 2: 20% of Fire damage heals you. Level 3: 30% of Fire damage heals you. Sustain through intense combat with Fire-based builds.',
    maxLevel: 3,
    icon: '♥',
    color: '#ff8800',
  },
  [PassiveType.FROST_HASTE]: {
    name: 'Frost Haste',
    type: PassiveType.FROST_HASTE,
    description: 'Cold damage increases attack speed (stacking)',
    detailedDescription: 'Cryogenic feedback loop converts Cold damage dealt into stacking attack speed buffs. Level 1: +5% per stack. Level 2: +10% per stack. Level 3: +15% per stack. Stacks last 5 seconds. Ramp up to incredible fire rates with Cold-heavy arsenals.',
    maxLevel: 3,
    icon: '↯',
    color: '#00aaff',
  },
  [PassiveType.STATIC_FORTUNE]: {
    name: 'Static Fortune',
    type: PassiveType.STATIC_FORTUNE,
    description: 'Nature damage has chance to drop credits',
    detailedDescription: 'Electromagnetic disruption causes Nature damage to occasionally ionize credits from defeated enemies. Level 1: 10% chance. Level 2: 20% chance. Level 3: 30% chance. Turn lightning storms into credit fountains.',
    maxLevel: 3,
    icon: '⚛',
    color: '#00ff00',
  },
  [PassiveType.WINGMAN_PROTOCOL]: {
    name: 'Wingman Protocol',
    type: PassiveType.WINGMAN_PROTOCOL,
    description: 'Summons stationary wingmen that shoot',
    detailedDescription: 'Deploys autonomous wingman turrets at fixed positions that fire at nearby enemies. Level 1: 1 wingman. Level 2: 2 wingmen. Level 3: 3 wingmen. Creates defensive zones and covers blind spots during hectic encounters.',
    maxLevel: 3,
    icon: '◁►',
    color: '#ffffff',
  },
  [PassiveType.TOXIC_ROUNDS]: {
    name: 'Toxic Rounds',
    type: PassiveType.TOXIC_ROUNDS,
    description: 'Chance to poison on hit (15% per level)',
    detailedDescription: 'Bio-engineered ammunition applies poisonous debuff dealing damage over time. Level 1: 15% poison chance. Level 2: 30% poison chance. Level 3: 45% poison chance. Let enemies wither while you focus fire elsewhere.',
    maxLevel: 3,
    icon: '☠',
    color: '#00ff00',
  },
  [PassiveType.PYROMANIAC]: {
    name: 'Pyromaniac',
    type: PassiveType.PYROMANIAC,
    description: 'Bonus damage to burning enemies (+25% per level)',
    detailedDescription: 'Specialized incendiary protocols deal devastating bonus damage to burning enemies. Level 1: +25% damage vs burning. Level 2: +50% damage vs burning. Level 3: +75% damage vs burning. Maximize Fire weapon effectiveness.',
    maxLevel: 3,
    icon: '♨',
    color: '#ff8800',
  },
  [PassiveType.SHATTER_STRIKE]: {
    name: 'Shatter Strike',
    type: PassiveType.SHATTER_STRIKE,
    description: 'Frozen enemies take increased damage (+30% per level)',
    detailedDescription: 'Precision strikes exploit crystalline weakness in frozen enemies for massive damage amplification. Level 1: +30% damage vs frozen. Level 2: +60% damage vs frozen. Level 3: +90% damage vs frozen. Transform Ice weapons into boss killers.',
    maxLevel: 3,
    icon: '❖',
    color: '#00aaff',
  },
  [PassiveType.HEMORRHAGE]: {
    name: 'Hemorrhage',
    type: PassiveType.HEMORRHAGE,
    description: 'Apply bleed on hit (damage amplification)',
    detailedDescription: 'Inflicts deep wounds that cause bleed damage and amplify all subsequent damage to affected targets. Level 1: 20% bleed chance, +10% damage taken. Level 2: 40% bleed chance, +20% damage taken. Level 3: 60% bleed chance, +30% damage taken. Excellent for focus fire strategies.',
    maxLevel: 3,
    icon: '♠',
    color: '#ffff00',
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
  healthRegen: number // Health regenerated per second
  invulnFrames: number // Invulnerability frames after taking damage (in milliseconds)
  revives: number // Number of times player can revive
  xpMultiplier?: number // XP gain multiplier (Vulcan, Supernova)
  unlimitedRerolls?: boolean // Eclipse: Unlimited rerolls
  autoSelectUpgrades?: boolean // Supernova: Auto-select upgrades
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
    // +10% fire rate per level (lower is better for fire rate)
    modifiers.fireRateMultiplier *= 1 - (0.10 * this.level)
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
    // Flat damage reduction: 5/10/15
    playerStats.damageReduction += 5 * this.level
  }
}

// Energy Core Implementation
export class EnergyCorePassive extends Passive {
  applyModifiers(modifiers: WeaponModifiers): void {
    // +15% projectile size per level
    modifiers.projectileSizeMultiplier += 0.15 * this.level
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
    // +25% crit damage per level
    modifiers.critDamage += 0.25 * this.level
  }

  applyPlayerEffects(playerStats: PlayerStats): void {
    // No direct player effects
  }
}

// Thruster Mod Implementation
export class ThrusterModPassive extends Passive {
  applyModifiers(modifiers: WeaponModifiers): void {
    // +15% projectile speed per level
    modifiers.projectileSpeedMultiplier += 0.15 * this.level
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
    // +20% fire rate per level (implemented as on-pickup burst)
    modifiers.fireRateMultiplier *= 1 - (0.2 * this.level)
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
    // +20% damage per level for gun buddy type weapons
    modifiers.damageMultiplier += 0.20 * this.level
    // +15% attack speed per level for gun buddy type weapons
    modifiers.fireRateMultiplier *= 1 - (0.15 * this.level)
  }

  applyPlayerEffects(playerStats: PlayerStats): void {
    // No direct player effects
  }
}

// Vampiric Fire Implementation
export class VampiricFirePassive extends Passive {
  applyModifiers(modifiers: WeaponModifiers): void {
    // No weapon modifiers (healing handled in game logic)
  }

  applyPlayerEffects(playerStats: PlayerStats): void {
    // Fire damage healing handled in game logic
  }
}

// Frost Haste Implementation
export class FrostHastePassive extends Passive {
  applyModifiers(modifiers: WeaponModifiers): void {
    // Attack speed buff applied in game logic when dealing cold damage
  }

  applyPlayerEffects(playerStats: PlayerStats): void {
    // Stacking buff handled in game logic
  }
}

// Static Fortune Implementation
export class StaticFortunePassive extends Passive {
  applyModifiers(modifiers: WeaponModifiers): void {
    // No weapon modifiers (credit drop chance handled in game logic)
  }

  applyPlayerEffects(playerStats: PlayerStats): void {
    // Credit drops handled in game logic
  }
}

// Wingman Protocol Implementation
export class WingmanProtocolPassive extends Passive {
  applyModifiers(modifiers: WeaponModifiers): void {
    // No weapon modifiers
  }

  applyPlayerEffects(playerStats: PlayerStats): void {
    // Wingman spawning handled in game logic
  }
}

// Toxic Rounds Implementation
export class ToxicRoundsPassive extends Passive {
  applyModifiers(modifiers: WeaponModifiers): void {
    // No weapon modifiers (poison application handled in game logic)
  }

  applyPlayerEffects(playerStats: PlayerStats): void {
    // Poison mechanics handled in game logic
  }
}

// Pyromaniac Implementation
export class PyromaniacPassive extends Passive {
  applyModifiers(modifiers: WeaponModifiers): void {
    // +25% damage per level against burning enemies (conditionally checked in game logic)
    // No unconditional modifiers - bonus only applies when enemy is burning
  }

  applyPlayerEffects(playerStats: PlayerStats): void {
    // No direct player effects
  }
}

// Shatter Strike Implementation
export class ShatterStrikePassive extends Passive {
  applyModifiers(modifiers: WeaponModifiers): void {
    // +30% damage per level against frozen enemies (conditionally checked in game logic)
    // No unconditional modifiers - bonus only applies when enemy is frozen
  }

  applyPlayerEffects(playerStats: PlayerStats): void {
    // No direct player effects
  }
}

// Hemorrhage Implementation
export class HemorrhagePassive extends Passive {
  applyModifiers(modifiers: WeaponModifiers): void {
    // No weapon modifiers (bleed application handled in game logic)
  }

  applyPlayerEffects(playerStats: PlayerStats): void {
    // Bleed mechanics handled in game logic
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
      case PassiveType.VAMPIRIC_FIRE:
        return new VampiricFirePassive(scene, type)
      case PassiveType.FROST_HASTE:
        return new FrostHastePassive(scene, type)
      case PassiveType.STATIC_FORTUNE:
        return new StaticFortunePassive(scene, type)
      case PassiveType.WINGMAN_PROTOCOL:
        return new WingmanProtocolPassive(scene, type)
      case PassiveType.TOXIC_ROUNDS:
        return new ToxicRoundsPassive(scene, type)
      case PassiveType.PYROMANIAC:
        return new PyromaniacPassive(scene, type)
      case PassiveType.SHATTER_STRIKE:
        return new ShatterStrikePassive(scene, type)
      case PassiveType.HEMORRHAGE:
        return new HemorrhagePassive(scene, type)
      default:
        // Default to ballistics for unimplemented passives
        return new BallisticsPassive(scene, PassiveType.BALLISTICS)
    }
  }
}
