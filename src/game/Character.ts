import Phaser from 'phaser'
import { WeaponType } from './Weapon'
import { WeaponModifiers } from './Weapon'
import { PlayerStats } from './Passive'
import { DamageType } from './Weapon'

export enum CharacterType {
  VULCAN = 'VULCAN',
  SCATTERSHOT = 'SCATTERSHOT',
  SWARM = 'SWARM',
  TEMPEST = 'TEMPEST',
  GLACIER = 'GLACIER',
  INFERNO = 'INFERNO',
  TSUNAMI = 'TSUNAMI',
  BASTION = 'BASTION',
  ECLIPSE = 'ECLIPSE',
  PHOTON = 'PHOTON',
  REFLEX = 'REFLEX',
  ARSENAL = 'ARSENAL',
  CORONA = 'CORONA',
  REAPER = 'REAPER',
  SUPERNOVA = 'SUPERNOVA',
  CYCLONE = 'CYCLONE',
  ZENITH = 'ZENITH',
  HAVOC = 'HAVOC',
  WARDEN = 'WARDEN',
  PHANTOM = 'PHANTOM',
}

export interface CharacterConfig {
  name: string
  type: CharacterType
  startingWeapon: WeaponType
  innateAbility: string
  description: string
  symbol: string
  color: string
  baseHealth: number
  baseMoveSpeed: number
  weaponSlots: number
  passiveSlots: number
  unlockLevel: number // Which campaign level unlocks this ship (0 = starter)
  cost: number // Credit cost to purchase (0 = free/starter)
  scale: number // Visual scale of ship (0.7-1.0, affects sprite size and collision)
  collisionRadius: number // Collision radius in pixels (smaller = easier to dodge)
}

export const CHARACTER_CONFIGS: Record<CharacterType, CharacterConfig> = {
  [CharacterType.VULCAN]: {
    name: 'Vulcan',
    type: CharacterType.VULCAN,
    startingWeapon: WeaponType.CANNON,
    innateAbility: '+10% pickup radius per level cleared',
    description: 'Heavy Artillery Cruiser with growing collection power',
    symbol: '/█\\',
    color: '#ffffff',
    baseHealth: 100,
    baseMoveSpeed: 200,
    weaponSlots: 4,
    passiveSlots: 4,
    unlockLevel: 0,
    cost: 0,
    scale: 1.0, // Starter ship - normal size
    collisionRadius: 18,
  },
  [CharacterType.SCATTERSHOT]: {
    name: 'Scattershot',
    type: CharacterType.SCATTERSHOT,
    startingWeapon: WeaponType.SHOTGUN,
    innateAbility: '-15% incoming damage',
    description: 'Close-Range Brawler with damage mitigation',
    symbol: '‹››',
    color: '#ff8800',
    baseHealth: 125,
    baseMoveSpeed: 175,
    weaponSlots: 4,
    passiveSlots: 4,
    unlockLevel: 1,
    cost: 500,
    scale: 1.0,
    collisionRadius: 17,
  },
  [CharacterType.SWARM]: {
    name: 'Swarm',
    type: CharacterType.SWARM,
    startingWeapon: WeaponType.GUN_BUDDY,
    innateAbility: '+1 passive slot, -1 weapon slot',
    description: 'Drone Carrier focused on passive synergies',
    symbol: '<◉>',
    color: '#88ff00',
    baseHealth: 100,
    baseMoveSpeed: 195,
    weaponSlots: 3,
    passiveSlots: 5,
    unlockLevel: 2,
    scale: 1.0,
    collisionRadius: 16,
    cost: 800,
  },
  [CharacterType.TEMPEST]: {
    name: 'Tempest',
    type: CharacterType.TEMPEST,
    startingWeapon: WeaponType.LIGHTNING,
    innateAbility: '+20% crit chance on Nature damage',
    description: 'Storm Interceptor with critical power',
    symbol: '{⚡}',
    color: '#00ffff',
    baseHealth: 90,
    baseMoveSpeed: 215,
    weaponSlots: 4,
    passiveSlots: 4,
    unlockLevel: 2,
    scale: 1.0,
    collisionRadius: 16,
    cost: 1000,
  },
  [CharacterType.GLACIER]: {
    name: 'Glacier',
    type: CharacterType.GLACIER,
    startingWeapon: WeaponType.ICE,
    innateAbility: '+25% attack speed for Cold weapons',
    description: 'Cryo Suppressor with rapid cold damage',
    symbol: '‹❄›',
    color: '#aaffff',
    baseHealth: 90,
    baseMoveSpeed: 210,
    weaponSlots: 4,
    passiveSlots: 4,
    unlockLevel: 3,
    scale: 0.9,
    collisionRadius: 15,
    cost: 1200,
  },
  [CharacterType.INFERNO]: {
    name: 'Inferno',
    type: CharacterType.INFERNO,
    startingWeapon: WeaponType.FIRE,
    innateAbility: 'All projectiles bounce once',
    description: 'Pyro Bomber with explosive power',
    symbol: '/※\\',
    color: '#ff4400',
    baseHealth: 110,
    baseMoveSpeed: 190,
    weaponSlots: 4,
    passiveSlots: 4,
    unlockLevel: 3,
    scale: 0.9,
    collisionRadius: 15,
    cost: 1500,
  },
  [CharacterType.TSUNAMI]: {
    name: 'Tsunami',
    type: CharacterType.TSUNAMI,
    startingWeapon: WeaponType.WATER,
    innateAbility: 'Weapons fire twice but deal 50% less damage',
    description: 'Hydro Destroyer with high volume attacks',
    symbol: '{≈}',
    color: '#00aaff',
    baseHealth: 95,
    baseMoveSpeed: 200,
    weaponSlots: 4,
    passiveSlots: 4,
    unlockLevel: 4,
    scale: 0.9,
    collisionRadius: 14,
    cost: 2000,
  },
  [CharacterType.BASTION]: {
    name: 'Bastion',
    type: CharacterType.BASTION,
    startingWeapon: WeaponType.EARTH,
    innateAbility: 'Generates small shield every 10s if stationary',
    description: 'Fortress Defender with positional gameplay',
    symbol: '[▓]',
    color: '#884400',
    baseHealth: 130,
    baseMoveSpeed: 170,
    weaponSlots: 4,
    passiveSlots: 4,
    unlockLevel: 4,
    scale: 0.9,
    collisionRadius: 14,
    cost: 2500,
  },
  [CharacterType.ECLIPSE]: {
    name: 'Eclipse',
    type: CharacterType.ECLIPSE,
    startingWeapon: WeaponType.DARK,
    innateAbility: '10% chance enemies revive as allies',
    description: 'Void Striker that converts foes',
    symbol: '(●)',
    color: '#8800ff',
    baseHealth: 120,
    baseMoveSpeed: 180,
    weaponSlots: 4,
    passiveSlots: 4,
    unlockLevel: 5,
    scale: 0.9,
    collisionRadius: 14,
    cost: 3000,
  },
  [CharacterType.PHOTON]: {
    name: 'Photon',
    type: CharacterType.PHOTON,
    startingWeapon: WeaponType.LASER_BEAM,
    innateAbility: '+15% damage at max heat, slower overheat',
    description: 'Beam Frigate with heat management',
    symbol: '=━=',
    color: '#ff0000',
    baseHealth: 85,
    baseMoveSpeed: 200,
    weaponSlots: 4,
    passiveSlots: 4,
    unlockLevel: 5,
    scale: 0.9,
    collisionRadius: 14,
    cost: 3500,
  },
  [CharacterType.REFLEX]: {
    name: 'Reflex',
    type: CharacterType.REFLEX,
    startingWeapon: WeaponType.RICOCHET_DISK,
    innateAbility: '+1 ricochet bounce, +10% projectile speed',
    description: 'Deflector Scout with bouncing projectiles',
    symbol: '<◇>',
    color: '#ffaa00',
    baseHealth: 95,
    baseMoveSpeed: 205,
    weaponSlots: 4,
    passiveSlots: 4,
    unlockLevel: 6,
    scale: 0.8,
    collisionRadius: 13,
    cost: 4000,
  },
  [CharacterType.ARSENAL]: {
    name: 'Arsenal',
    type: CharacterType.ARSENAL,
    startingWeapon: WeaponType.MISSILE_POD,
    innateAbility: '+1 missile per salvo, +10% explosion radius',
    description: 'Missile Cruiser with area denial',
    symbol: '▲▲▲',
    color: '#ff6600',
    baseHealth: 140,
    baseMoveSpeed: 160,
    weaponSlots: 4,
    passiveSlots: 4,
    unlockLevel: 6,
    scale: 0.8,
    collisionRadius: 13,
    cost: 4500,
  },
  [CharacterType.CORONA]: {
    name: 'Corona',
    type: CharacterType.CORONA,
    startingWeapon: WeaponType.FIREBALL_RING,
    innateAbility: 'Start with +2 Fire projectiles, +30% burn duration',
    description: 'Stellar Annihilator wreathed in flames',
    symbol: '(✹)',
    color: '#ff6600',
    baseHealth: 105,
    baseMoveSpeed: 195,
    weaponSlots: 4,
    passiveSlots: 4,
    unlockLevel: 7,
    scale: 0.8,
    collisionRadius: 12,
    cost: 5500,
  },
  [CharacterType.REAPER]: {
    name: 'Reaper',
    type: CharacterType.REAPER,
    startingWeapon: WeaponType.BLOOD_LANCE,
    innateAbility: 'Kill enemies under 15% HP instantly, +20% bleed damage',
    description: 'Death Incarnate that executes the weak',
    symbol: '✠✠✠',
    color: '#cc0000',
    baseHealth: 95,
    baseMoveSpeed: 220,
    weaponSlots: 4,
    passiveSlots: 4,
    unlockLevel: 7,
    scale: 0.8,
    collisionRadius: 12,
    cost: 6000,
  },
  [CharacterType.SUPERNOVA]: {
    name: 'Supernova',
    type: CharacterType.SUPERNOVA,
    startingWeapon: WeaponType.PLASMA_AURA,
    innateAbility: 'Aura heals 1HP per enemy hit, aura radius +40%',
    description: 'Living Star with regenerating energy field',
    symbol: '◉⊛◉',
    color: '#ff00ff',
    baseHealth: 80,
    baseMoveSpeed: 185,
    weaponSlots: 5,
    passiveSlots: 4,
    unlockLevel: 8,
    scale: 0.8,
    collisionRadius: 12,
    cost: 7000,
  },
  [CharacterType.CYCLONE]: {
    name: 'Cyclone',
    type: CharacterType.CYCLONE,
    startingWeapon: WeaponType.VORTEX_BLADE,
    innateAbility: 'Vortex pulls enemies inward, +25% spiral speed',
    description: 'Storm Engine that devours all',
    symbol: '◈◈◈',
    color: '#00ddff',
    baseHealth: 110,
    baseMoveSpeed: 210,
    weaponSlots: 4,
    passiveSlots: 4,
    unlockLevel: 8,
    scale: 0.8,
    collisionRadius: 12,
    cost: 7500,
  },
  [CharacterType.ZENITH]: {
    name: 'Zenith',
    type: CharacterType.ZENITH,
    startingWeapon: WeaponType.ORBITAL_STRIKE,
    innateAbility: '+3 strikes per barrage, strikes track enemies',
    description: 'Orbital Command Platform of destruction',
    symbol: '▼▼▼',
    color: '#ffdd00',
    baseHealth: 115,
    baseMoveSpeed: 175,
    weaponSlots: 4,
    passiveSlots: 5,
    unlockLevel: 9,
    scale: 0.7,
    collisionRadius: 11,
    cost: 8500,
  },
  [CharacterType.HAVOC]: {
    name: 'Havoc',
    type: CharacterType.HAVOC,
    startingWeapon: WeaponType.MINIGUN,
    innateAbility: 'Minigun never stops firing, +50% bullet speed',
    description: 'Relentless War Machine of pure violence',
    symbol: '▪▪▪',
    color: '#ff0000',
    baseHealth: 120,
    baseMoveSpeed: 205,
    weaponSlots: 5,
    passiveSlots: 3,
    unlockLevel: 9,
    scale: 0.7,
    collisionRadius: 11,
    cost: 9000,
  },
  [CharacterType.WARDEN]: {
    name: 'Warden',
    type: CharacterType.WARDEN,
    startingWeapon: WeaponType.TRAP_LAYER,
    innateAbility: 'Traps last 3x longer, +2 traps per cast',
    description: 'Defensive Architect controlling the battlefield',
    symbol: '✻✻✻',
    color: '#88ff00',
    baseHealth: 150,
    baseMoveSpeed: 165,
    weaponSlots: 4,
    passiveSlots: 5,
    unlockLevel: 10,
    scale: 0.7,
    collisionRadius: 10,
    cost: 10000,
  },
  [CharacterType.PHANTOM]: {
    name: 'Phantom',
    type: CharacterType.PHANTOM,
    startingWeapon: WeaponType.SNIPER_RIFLE,
    innateAbility: 'Headshots deal 3x damage, +100% crit on snipers',
    description: 'Ghost Assassin who never misses',
    symbol: '═══',
    color: '#aa00ff',
    baseHealth: 75,
    baseMoveSpeed: 225,
    weaponSlots: 3,
    passiveSlots: 5,
    unlockLevel: 10,
    scale: 0.7,
    collisionRadius: 10,
    cost: 12000,
  },
}

export abstract class Character {
  protected scene: Phaser.Scene
  protected config: CharacterConfig
  protected levelsCleared: number = 0

  constructor(scene: Phaser.Scene, type: CharacterType) {
    this.scene = scene
    this.config = CHARACTER_CONFIGS[type]
  }

  abstract applyInnateAbility(modifiers: WeaponModifiers, playerStats: PlayerStats): void

  // Called when a level is cleared
  onLevelCleared(): void {
    this.levelsCleared++
  }

  getLevelsCleared(): number {
    return this.levelsCleared
  }

  getConfig(): CharacterConfig {
    return this.config
  }

  getStartingWeapon(): WeaponType {
    return this.config.startingWeapon
  }

  getBaseHealth(): number {
    return this.config.baseHealth
  }

  getBaseMoveSpeed(): number {
    return this.config.baseMoveSpeed
  }

  getWeaponSlots(): number {
    return this.config.weaponSlots
  }

  getPassiveSlots(): number {
    return this.config.passiveSlots
  }

  getInfo(): string {
    return `${this.config.name}\n${this.config.innateAbility}\n${this.config.description}`
  }
}

// Vulcan Implementation
export class VulcanCharacter extends Character {
  applyInnateAbility(modifiers: WeaponModifiers, playerStats: PlayerStats): void {
    // +10% pickup radius per level cleared
    const radiusBonus = 1 + (this.levelsCleared * 0.1)
    playerStats.pickupRadius *= radiusBonus
  }
}

// Scattershot Implementation
export class ScattershotCharacter extends Character {
  applyInnateAbility(modifiers: WeaponModifiers, playerStats: PlayerStats): void {
    // -15% incoming damage
    playerStats.damageReduction *= 1.15
  }
}

// Swarm Implementation
export class SwarmCharacter extends Character {
  applyInnateAbility(modifiers: WeaponModifiers, playerStats: PlayerStats): void {
    // +1 passive slot, -1 weapon slot
    // Already handled in CHARACTER_CONFIGS (weaponSlots: 3, passiveSlots: 5)
  }
}

// Tempest Implementation
export class TempestCharacter extends Character {
  applyInnateAbility(modifiers: WeaponModifiers, playerStats: PlayerStats): void {
    // +20% crit chance on Nature damage
    // This will be checked in damage calculation based on damage type
  }
}

// Glacier Implementation
export class GlacierCharacter extends Character {
  applyInnateAbility(modifiers: WeaponModifiers, playerStats: PlayerStats): void {
    // +25% attack speed for Cold weapons
    // This will be checked in weapon firing logic based on damage type
  }
}

// Inferno Implementation
export class InfernoCharacter extends Character {
  applyInnateAbility(modifiers: WeaponModifiers, playerStats: PlayerStats): void {
    // All projectiles bounce once
    // This will be handled in projectile creation logic
  }
}

// Tsunami Implementation
export class TsunamiCharacter extends Character {
  applyInnateAbility(modifiers: WeaponModifiers, playerStats: PlayerStats): void {
    // Weapons fire twice but deal 50% less damage
    // This will be handled in weapon firing logic
  }
}

// Bastion Implementation
export class BastionCharacter extends Character {
  private stationaryTime: number = 0
  private lastShieldTime: number = 0

  applyInnateAbility(modifiers: WeaponModifiers, playerStats: PlayerStats): void {
    // Generates small shield every 10s if stationary
    // This will be handled in update loop based on player velocity
  }

  updateStationaryTime(delta: number, isStationary: boolean): void {
    if (isStationary) {
      this.stationaryTime += delta
    } else {
      this.stationaryTime = 0
    }
  }

  shouldGenerateShield(): boolean {
    const now = Date.now()
    if (this.stationaryTime >= 10000 && now - this.lastShieldTime >= 10000) {
      this.lastShieldTime = now
      this.stationaryTime = 0
      return true
    }
    return false
  }
}

// Eclipse Implementation
export class EclipseCharacter extends Character {
  applyInnateAbility(modifiers: WeaponModifiers, playerStats: PlayerStats): void {
    // 10% chance enemies revive as allies
    // This will be handled in enemy death logic in GameScene
  }
}

// Photon Implementation
export class PhotonCharacter extends Character {
  applyInnateAbility(modifiers: WeaponModifiers, playerStats: PlayerStats): void {
    // +15% damage at max heat, slower overheat
    // This will be handled in laser beam weapon logic
  }
}

// Reflex Implementation
export class ReflexCharacter extends Character {
  applyInnateAbility(modifiers: WeaponModifiers, playerStats: PlayerStats): void {
    // +1 ricochet bounce already handled in character config
    // +10% projectile speed
    modifiers.projectileSpeedMultiplier += 0.1
  }
}

// Arsenal Implementation
export class ArsenalCharacter extends Character {
  applyInnateAbility(modifiers: WeaponModifiers, playerStats: PlayerStats): void {
    // +1 missile per salvo, +10% explosion radius
    // This will be handled in missile pod weapon logic
  }
}

// Corona Implementation
export class CoronaCharacter extends Character {
  applyInnateAbility(modifiers: WeaponModifiers, playerStats: PlayerStats): void {
    // Start with +2 Fire projectiles, +30% burn duration
    // This will be handled in fireball ring weapon logic
  }
}

// Reaper Implementation
export class ReaperCharacter extends Character {
  applyInnateAbility(modifiers: WeaponModifiers, playerStats: PlayerStats): void {
    // Kill enemies under 15% HP instantly, +20% bleed damage
    // This will be handled in combat logic and blood lance weapon
    modifiers.damageMultiplier += 0.2 // Extra bleed damage
  }
}

// Supernova Implementation
export class SupernovaCharacter extends Character {
  applyInnateAbility(modifiers: WeaponModifiers, playerStats: PlayerStats): void {
    // Aura heals 1HP per enemy hit, aura radius +40%
    // This will be handled in plasma aura weapon logic
  }
}

// Cyclone Implementation
export class CycloneCharacter extends Character {
  applyInnateAbility(modifiers: WeaponModifiers, playerStats: PlayerStats): void {
    // Vortex pulls enemies inward, +25% spiral speed
    // This will be handled in vortex blade weapon logic
    modifiers.projectileSpeedMultiplier += 0.25
  }
}

// Zenith Implementation
export class ZenithCharacter extends Character {
  applyInnateAbility(modifiers: WeaponModifiers, playerStats: PlayerStats): void {
    // +3 strikes per barrage, strikes track enemies
    // This will be handled in orbital strike weapon logic
  }
}

// Havoc Implementation
export class HavocCharacter extends Character {
  applyInnateAbility(modifiers: WeaponModifiers, playerStats: PlayerStats): void {
    // Minigun never stops firing, +50% bullet speed
    // This will be handled in minigun weapon logic
    modifiers.projectileSpeedMultiplier += 0.5
  }
}

// Warden Implementation
export class WardenCharacter extends Character {
  applyInnateAbility(modifiers: WeaponModifiers, playerStats: PlayerStats): void {
    // Traps last 3x longer, +2 traps per cast
    // This will be handled in trap layer weapon logic
  }
}

// Phantom Implementation
export class PhantomCharacter extends Character {
  applyInnateAbility(modifiers: WeaponModifiers, playerStats: PlayerStats): void {
    // Headshots deal 3x damage, +100% crit on snipers
    // This will be handled in sniper rifle weapon logic
    modifiers.critChance += 1.0 // 100% crit chance for snipers
    modifiers.critDamage += 1.5 // Additional 1.5x for "headshots" = 3x total
  }
}

// Character Factory
export class CharacterFactory {
  static create(scene: Phaser.Scene, type: CharacterType): Character {
    switch (type) {
      case CharacterType.VULCAN:
        return new VulcanCharacter(scene, type)
      case CharacterType.SCATTERSHOT:
        return new ScattershotCharacter(scene, type)
      case CharacterType.SWARM:
        return new SwarmCharacter(scene, type)
      case CharacterType.TEMPEST:
        return new TempestCharacter(scene, type)
      case CharacterType.GLACIER:
        return new GlacierCharacter(scene, type)
      case CharacterType.INFERNO:
        return new InfernoCharacter(scene, type)
      case CharacterType.TSUNAMI:
        return new TsunamiCharacter(scene, type)
      case CharacterType.BASTION:
        return new BastionCharacter(scene, type)
      case CharacterType.ECLIPSE:
        return new EclipseCharacter(scene, type)
      case CharacterType.PHOTON:
        return new PhotonCharacter(scene, type)
      case CharacterType.REFLEX:
        return new ReflexCharacter(scene, type)
      case CharacterType.ARSENAL:
        return new ArsenalCharacter(scene, type)
      case CharacterType.CORONA:
        return new CoronaCharacter(scene, type)
      case CharacterType.REAPER:
        return new ReaperCharacter(scene, type)
      case CharacterType.SUPERNOVA:
        return new SupernovaCharacter(scene, type)
      case CharacterType.CYCLONE:
        return new CycloneCharacter(scene, type)
      case CharacterType.ZENITH:
        return new ZenithCharacter(scene, type)
      case CharacterType.HAVOC:
        return new HavocCharacter(scene, type)
      case CharacterType.WARDEN:
        return new WardenCharacter(scene, type)
      case CharacterType.PHANTOM:
        return new PhantomCharacter(scene, type)
      default:
        // Default to Vulcan for unimplemented characters
        return new VulcanCharacter(scene, CharacterType.VULCAN)
    }
  }
}
