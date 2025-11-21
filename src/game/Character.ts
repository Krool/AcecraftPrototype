import Phaser from 'phaser'
import { WeaponType } from './Weapon'
import { WeaponModifiers } from './Weapon'
import { PlayerStats } from './Passive'
import { DamageType } from './Weapon'
import {
  VULCAN, SCATTERSHOT, TEMPEST, GLACIER, INFERNO, TSUNAMI,
  BASTION, ECLIPSE, PHOTON, REFLEX, ARSENAL, CORONA,
  REAPER, SUPERNOVA, CYCLONE, ZENITH, HAVOC, WARDEN, PHANTOM
} from '../constants'

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
  engineCount: number // Number of engines (1-4, affects thruster particle visual)
}

export const CHARACTER_CONFIGS: Record<CharacterType, CharacterConfig> = {
  [CharacterType.VULCAN]: {
    name: 'Vulcan',
    type: CharacterType.VULCAN,
    startingWeapon: WeaponType.CANNON,
    innateAbility: '+10% pickup radius per 2 waves, +5% XP gain',
    description: 'Heavy Artillery Cruiser with growing collection power',
    symbol: '/█\\',
    color: '#ffff00', // Yellow for Physical damage
    baseHealth: 100,
    baseMoveSpeed: 200,
    weaponSlots: 4,
    passiveSlots: 4,
    unlockLevel: 0,
    cost: 0,
    scale: 1.0, // Starter ship - normal size
    collisionRadius: 18,
    engineCount: 3, // Heavy cruiser needs multiple engines
  },
  [CharacterType.SCATTERSHOT]: {
    name: 'Scattershot',
    type: CharacterType.SCATTERSHOT,
    startingWeapon: WeaponType.SHOTGUN,
    innateAbility: '-15% incoming damage',
    description: 'Close-Range Brawler with damage mitigation',
    symbol: '‹››',
    color: '#ffff00', // Yellow for Physical damage
    baseHealth: 125,
    baseMoveSpeed: 175,
    weaponSlots: 4,
    passiveSlots: 4,
    unlockLevel: 0,
    cost: 500,
    scale: 1.0,
    collisionRadius: 17,
    engineCount: 2, // Standard twin engines
  },
  [CharacterType.SWARM]: {
    name: 'Swarm',
    type: CharacterType.SWARM,
    startingWeapon: WeaponType.GUN_BUDDY,
    innateAbility: '+1 passive slot, -1 weapon slot',
    description: 'Drone Carrier focused on passive synergies',
    symbol: '<◉>',
    color: '#ffff00', // Yellow for Physical damage
    baseHealth: 100,
    baseMoveSpeed: 195,
    weaponSlots: 3,
    passiveSlots: 5,
    unlockLevel: 0,
    scale: 1.0,
    collisionRadius: 16,
    cost: 800,
    engineCount: 4, // Carrier needs power for drones
  },
  [CharacterType.TEMPEST]: {
    name: 'Tempest',
    type: CharacterType.TEMPEST,
    startingWeapon: WeaponType.LIGHTNING,
    innateAbility: '+20% crit chance on Nature damage',
    description: 'Storm Interceptor with critical power',
    symbol: '{‡}',
    color: '#00ff00', // Green for Nature damage
    baseHealth: 90,
    baseMoveSpeed: 215,
    weaponSlots: 4,
    passiveSlots: 4,
    unlockLevel: 0,
    scale: 1.0,
    collisionRadius: 16,
    cost: 1000,
    engineCount: 2, // Fast interceptor
  },
  [CharacterType.GLACIER]: {
    name: 'Glacier',
    type: CharacterType.GLACIER,
    startingWeapon: WeaponType.ICE,
    innateAbility: '+20% attack speed for Cold weapons',
    description: 'Cryo Suppressor with rapid cold damage',
    symbol: '‹❄›',
    color: '#00aaff', // Blue for Cold damage
    baseHealth: 90,
    baseMoveSpeed: 210,
    weaponSlots: 4,
    passiveSlots: 4,
    unlockLevel: 0,
    scale: 0.9,
    collisionRadius: 15,
    cost: 1200,
    engineCount: 2, // Standard twin engines
  },
  [CharacterType.INFERNO]: {
    name: 'Inferno',
    type: CharacterType.INFERNO,
    startingWeapon: WeaponType.FIRE,
    innateAbility: 'All projectiles bounce once',
    description: 'Pyro Bomber with explosive power',
    symbol: '/※\\',
    color: '#ff8800', // Orange for Fire damage
    baseHealth: 110,
    baseMoveSpeed: 190,
    weaponSlots: 4,
    passiveSlots: 4,
    unlockLevel: 0,
    scale: 0.9,
    collisionRadius: 15,
    cost: 1500,
    engineCount: 3, // Heavy bomber
  },
  [CharacterType.TSUNAMI]: {
    name: 'Tsunami',
    type: CharacterType.TSUNAMI,
    startingWeapon: WeaponType.WATER,
    innateAbility: 'Weapons fire twice but deal 65% damage',
    description: 'Hydro Destroyer with high volume attacks',
    symbol: '{≈}',
    color: '#00aaff',
    baseHealth: 95,
    baseMoveSpeed: 200,
    weaponSlots: 4,
    passiveSlots: 4,
    unlockLevel: 0,
    scale: 0.9,
    collisionRadius: 14,
    cost: 2000,
    engineCount: 3, // Destroyer class
  },
  [CharacterType.BASTION]: {
    name: 'Bastion',
    type: CharacterType.BASTION,
    startingWeapon: WeaponType.EARTH,
    innateAbility: 'Cannot move while firing, +75% damage, +50% fire rate',
    description: 'Fortress Turret that roots to unleash devastation',
    symbol: '[▓]',
    color: '#00ff00', // Green for Nature damage
    baseHealth: 130,
    baseMoveSpeed: 170,
    weaponSlots: 4,
    passiveSlots: 4,
    unlockLevel: 0,
    scale: 0.9,
    collisionRadius: 14,
    cost: 2500,
    engineCount: 4, // Heavy fortress needs power
  },
  [CharacterType.ECLIPSE]: {
    name: 'Eclipse',
    type: CharacterType.ECLIPSE,
    startingWeapon: WeaponType.DARK,
    innateAbility: 'Unlimited rerolls, -15% damage',
    description: 'Void Manipulator that bends probability',
    symbol: '(●)',
    color: '#00aaff', // Blue for Cold damage
    baseHealth: 120,
    baseMoveSpeed: 180,
    weaponSlots: 4,
    passiveSlots: 4,
    unlockLevel: 0,
    scale: 0.9,
    collisionRadius: 14,
    cost: 3000,
    engineCount: 1, // Mysterious void ship
  },
  [CharacterType.PHOTON]: {
    name: 'Photon',
    type: CharacterType.PHOTON,
    startingWeapon: WeaponType.LASER_BEAM,
    innateAbility: 'Laser overheats 50% slower',
    description: 'Beam Frigate with superior heat management',
    symbol: '=━=',
    color: '#ff8800', // Orange for Fire damage
    baseHealth: 85,
    baseMoveSpeed: 200,
    weaponSlots: 4,
    passiveSlots: 4,
    unlockLevel: 0,
    scale: 0.9,
    collisionRadius: 14,
    cost: 3500,
    engineCount: 2, // Frigate class
  },
  [CharacterType.REFLEX]: {
    name: 'Reflex',
    type: CharacterType.REFLEX,
    startingWeapon: WeaponType.RICOCHET_DISK,
    innateAbility: '+1 ricochet bounce, +10% projectile speed',
    description: 'Deflector Scout with bouncing projectiles',
    symbol: '<◇>',
    color: '#ffff00', // Yellow for Physical damage
    baseHealth: 95,
    baseMoveSpeed: 205,
    weaponSlots: 4,
    passiveSlots: 4,
    unlockLevel: 1, // Unlocked by beating level 1
    scale: 0.8,
    collisionRadius: 13,
    cost: 250,
    engineCount: 1, // Light scout
  },
  [CharacterType.ARSENAL]: {
    name: 'Arsenal',
    type: CharacterType.ARSENAL,
    startingWeapon: WeaponType.MISSILE_POD,
    innateAbility: '+1 missile per salvo, +10% explosion radius',
    description: 'Missile Cruiser with area denial',
    symbol: '▲▲▲',
    color: '#ffff00', // Yellow for Physical damage
    baseHealth: 140,
    baseMoveSpeed: 160,
    weaponSlots: 4,
    passiveSlots: 4,
    unlockLevel: 2, // Unlocked by beating level 2
    scale: 0.8,
    collisionRadius: 13,
    cost: 250,
    engineCount: 4, // Heavy missile cruiser
  },
  [CharacterType.CORONA]: {
    name: 'Corona',
    type: CharacterType.CORONA,
    startingWeapon: WeaponType.FIREBALL_RING,
    innateAbility: 'Start with +1 Fire projectile, +30% burn duration',
    description: 'Stellar Annihilator wreathed in flames',
    symbol: '(✹)',
    color: '#ff8800', // Orange for Fire damage
    baseHealth: 105,
    baseMoveSpeed: 195,
    weaponSlots: 4,
    passiveSlots: 4,
    unlockLevel: 3, // Unlocked by beating level 3
    scale: 0.8,
    collisionRadius: 12,
    cost: 250,
    engineCount: 3, // Powerful stellar ship
  },
  [CharacterType.REAPER]: {
    name: 'Reaper',
    type: CharacterType.REAPER,
    startingWeapon: WeaponType.BLOOD_LANCE,
    innateAbility: 'Kill enemies under 15% HP instantly, +20% bleed damage',
    description: 'Death Incarnate that executes the weak',
    symbol: '✠✠✠',
    color: '#00ff00', // Green for Nature damage
    baseHealth: 95,
    baseMoveSpeed: 220,
    weaponSlots: 4,
    passiveSlots: 4,
    unlockLevel: 4, // Unlocked by beating level 4
    scale: 0.8,
    collisionRadius: 12,
    cost: 250,
    engineCount: 2, // Fast executioner
  },
  [CharacterType.SUPERNOVA]: {
    name: 'Supernova',
    type: CharacterType.SUPERNOVA,
    startingWeapon: WeaponType.PLASMA_AURA,
    innateAbility: 'Auto-selects upgrades, +30% XP gain',
    description: 'Living Star on autopilot, always growing',
    symbol: '◉⊛◉',
    color: '#ff8800', // Orange for Fire damage
    baseHealth: 80,
    baseMoveSpeed: 185,
    weaponSlots: 5,
    passiveSlots: 4,
    unlockLevel: 5, // Unlocked by beating level 5
    scale: 0.8,
    collisionRadius: 12,
    cost: 250,
    engineCount: 4, // Massive living star
  },
  [CharacterType.CYCLONE]: {
    name: 'Cyclone',
    type: CharacterType.CYCLONE,
    startingWeapon: WeaponType.VORTEX_BLADE,
    innateAbility: '-1 projectile, +100% damage',
    description: 'Focused Vortex of concentrated destruction',
    symbol: '◈◈◈',
    color: '#00aaff', // Blue for Cold damage
    baseHealth: 110,
    baseMoveSpeed: 210,
    weaponSlots: 4,
    passiveSlots: 4,
    unlockLevel: 6, // Unlocked by beating level 6
    scale: 0.8,
    collisionRadius: 12,
    cost: 250,
    engineCount: 3, // Vortex power
  },
  [CharacterType.ZENITH]: {
    name: 'Zenith',
    type: CharacterType.ZENITH,
    startingWeapon: WeaponType.ORBITAL_STRIKE,
    innateAbility: '+1 strike per barrage, +20% explosion radius',
    description: 'Orbital Command Platform of destruction',
    symbol: '▼▼▼',
    color: '#ff8800', // Orange for Fire damage
    baseHealth: 115,
    baseMoveSpeed: 175,
    weaponSlots: 4,
    passiveSlots: 5,
    unlockLevel: 7, // Unlocked by beating level 7
    scale: 0.7,
    collisionRadius: 11,
    cost: 250,
    engineCount: 4, // Orbital platform
  },
  [CharacterType.HAVOC]: {
    name: 'Havoc',
    type: CharacterType.HAVOC,
    startingWeapon: WeaponType.MINIGUN,
    innateAbility: 'Minigun never stops firing, +50% bullet speed',
    description: 'Relentless War Machine of pure violence',
    symbol: '▪▪▪',
    color: '#ffff00', // Yellow for Physical damage
    baseHealth: 120,
    baseMoveSpeed: 205,
    weaponSlots: 5,
    passiveSlots: 3,
    unlockLevel: 8, // Unlocked by beating level 8
    scale: 0.7,
    collisionRadius: 11,
    cost: 250,
    engineCount: 3, // War machine
  },
  [CharacterType.WARDEN]: {
    name: 'Warden',
    type: CharacterType.WARDEN,
    startingWeapon: WeaponType.TRAP_LAYER,
    innateAbility: 'Traps last 2x longer, +1 trap per cast',
    description: 'Defensive Architect controlling the battlefield',
    symbol: '✻✻✻',
    color: '#00ff00', // Green for Nature damage
    baseHealth: 150,
    baseMoveSpeed: 165,
    weaponSlots: 4,
    passiveSlots: 5,
    unlockLevel: 9, // Unlocked by beating level 9
    scale: 0.7,
    collisionRadius: 10,
    cost: 250,
    engineCount: 2, // Defensive platform
  },
  [CharacterType.PHANTOM]: {
    name: 'Phantom',
    type: CharacterType.PHANTOM,
    startingWeapon: WeaponType.SNIPER_RIFLE,
    innateAbility: 'Headshots deal 3x damage, +100% crit on snipers',
    description: 'Ghost Assassin who never misses',
    symbol: '═══',
    color: '#ffff00', // Yellow for Physical damage
    baseHealth: 75,
    baseMoveSpeed: 225,
    weaponSlots: 3,
    passiveSlots: 5,
    unlockLevel: 10, // Unlocked by beating level 10 (final level)
    scale: 0.7,
    collisionRadius: 10,
    cost: 250,
    engineCount: 1, // Ghost assassin
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
  private wavesCleared: number = 0

  applyInnateAbility(modifiers: WeaponModifiers, playerStats: PlayerStats): void {
    // +10% pickup radius per 2 waves cleared (faster scaling)
    const radiusBonus = 1 + (Math.floor(this.wavesCleared / VULCAN.WAVES_PER_BONUS) * VULCAN.RADIUS_BONUS_PER_WAVES)
    playerStats.pickupRadius *= radiusBonus
    // +5% XP gain
    playerStats.xpMultiplier = (playerStats.xpMultiplier || 1) * VULCAN.XP_MULTIPLIER
  }

  onWaveCleared(): void {
    this.wavesCleared++
  }

  getWavesCleared(): number {
    return this.wavesCleared
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
    // +20% crit chance on Nature damage is handled dynamically in GameScene
    // per-projectile based on damage type
  }
}

// Glacier Implementation
export class GlacierCharacter extends Character {
  applyInnateAbility(modifiers: WeaponModifiers, playerStats: PlayerStats): void {
    // +20% attack speed for Cold weapons (all weapons for this ship)
    modifiers.fireRateMultiplier *= GLACIER.FIRE_RATE_MULTIPLIER // 20% faster = 0.833x cooldown
  }
}

// Inferno Implementation
export class InfernoCharacter extends Character {
  applyInnateAbility(modifiers: WeaponModifiers, playerStats: PlayerStats): void {
    // All projectiles bounce once
    modifiers.pierceCount += INFERNO.PIERCE_BONUS // Use pierce for bounce mechanic
  }
}

// Tsunami Implementation
export class TsunamiCharacter extends Character {
  applyInnateAbility(modifiers: WeaponModifiers, playerStats: PlayerStats): void {
    // Weapons fire twice (add extra shot)
    modifiers.additionalShots = (modifiers.additionalShots || 0) + TSUNAMI.ADDITIONAL_SHOTS
    // But deal 65% damage (30% total DPS increase)
    modifiers.damageMultiplier *= TSUNAMI.DAMAGE_PER_SHOT
  }
}

// Bastion Implementation (Turret Mode)
export class BastionCharacter extends Character {
  private isFiring: boolean = false

  applyInnateAbility(modifiers: WeaponModifiers, playerStats: PlayerStats): void {
    // Cannot move while firing, +75% damage, +50% fire rate
    if (this.isFiring) {
      modifiers.damageMultiplier *= BASTION.DAMAGE_BONUS
      modifiers.fireRateMultiplier *= BASTION.FIRE_RATE_MULTIPLIER // 50% faster = 0.667x cooldown
    }
  }

  setFiring(firing: boolean): void {
    this.isFiring = firing
  }

  isFiringWeapons(): boolean {
    return this.isFiring
  }
}

// Eclipse Implementation (Unlimited Rerolls)
export class EclipseCharacter extends Character {
  applyInnateAbility(modifiers: WeaponModifiers, playerStats: PlayerStats): void {
    // Unlimited rerolls, -15% damage
    modifiers.damageMultiplier *= ECLIPSE.DAMAGE_PENALTY
    playerStats.unlimitedRerolls = ECLIPSE.HAS_UNLIMITED_REROLLS
  }
}

// Photon Implementation
export class PhotonCharacter extends Character {
  applyInnateAbility(modifiers: WeaponModifiers, playerStats: PlayerStats): void {
    // Laser overheats 50% slower (50% heat gain)
    modifiers.heatMultiplier = (modifiers.heatMultiplier ?? 1.0) * PHOTON.HEAT_REDUCTION
  }
}

// Reflex Implementation
export class ReflexCharacter extends Character {
  applyInnateAbility(modifiers: WeaponModifiers, playerStats: PlayerStats): void {
    // +1 ricochet bounce already handled in character config
    // +10% projectile speed
    modifiers.projectileSpeedMultiplier += REFLEX.PROJECTILE_SPEED_BONUS
  }
}

// Arsenal Implementation
export class ArsenalCharacter extends Character {
  applyInnateAbility(modifiers: WeaponModifiers, playerStats: PlayerStats): void {
    // +1 missile per salvo (missile-specific bonus)
    modifiers.missileCount = (modifiers.missileCount || 0) + ARSENAL.PROJECTILE_BONUS
    // +10% explosion radius
    modifiers.explosionRadiusMultiplier = (modifiers.explosionRadiusMultiplier || 1) * ARSENAL.EXPLOSION_RADIUS_MULTIPLIER
  }
}

// Corona Implementation
export class CoronaCharacter extends Character {
  applyInnateAbility(modifiers: WeaponModifiers, playerStats: PlayerStats): void {
    // +1 Fire projectile
    modifiers.projectileCount += CORONA.PROJECTILE_BONUS
    // +30% burn duration (increase DoT duration)
    modifiers.dotDurationMultiplier = (modifiers.dotDurationMultiplier || 1) * CORONA.BURN_DURATION_MULTIPLIER
  }
}

// Reaper Implementation
export class ReaperCharacter extends Character {
  applyInnateAbility(modifiers: WeaponModifiers, playerStats: PlayerStats): void {
    // Kill enemies under 15% HP instantly, +20% bleed damage
    // This will be handled in combat logic and blood lance weapon
    modifiers.damageMultiplier += REAPER.BLEED_DAMAGE_BONUS // Extra bleed damage
  }
}

// Supernova Implementation (Autopilot)
export class SupernovaCharacter extends Character {
  applyInnateAbility(modifiers: WeaponModifiers, playerStats: PlayerStats): void {
    // Auto-selects upgrades, +30% XP gain
    playerStats.autoSelectUpgrades = SUPERNOVA.AUTO_SELECT_UPGRADES
    playerStats.xpMultiplier = (playerStats.xpMultiplier || 1) * SUPERNOVA.XP_MULTIPLIER
  }
}

// Cyclone Implementation (Focused Power)
export class CycloneCharacter extends Character {
  applyInnateAbility(modifiers: WeaponModifiers, playerStats: PlayerStats): void {
    // -1 projectile (minimum 1), +100% damage
    modifiers.projectileCount = Math.max(CYCLONE.MIN_PROJECTILES, modifiers.projectileCount - 1)
    modifiers.damageMultiplier *= CYCLONE.DAMAGE_BONUS
  }
}

// Zenith Implementation
export class ZenithCharacter extends Character {
  applyInnateAbility(modifiers: WeaponModifiers, playerStats: PlayerStats): void {
    // +1 strike per barrage
    modifiers.projectileCount += ZENITH.PROJECTILE_BONUS
    // +20% explosion radius
    modifiers.explosionRadiusMultiplier = (modifiers.explosionRadiusMultiplier || 1) * ZENITH.EXPLOSION_RADIUS_MULTIPLIER
  }
}

// Havoc Implementation
export class HavocCharacter extends Character {
  applyInnateAbility(modifiers: WeaponModifiers, playerStats: PlayerStats): void {
    // Minigun never stops firing, +50% bullet speed
    // This will be handled in minigun weapon logic
    modifiers.projectileSpeedMultiplier += HAVOC.PROJECTILE_SPEED_BONUS
  }
}

// Warden Implementation
export class WardenCharacter extends Character {
  applyInnateAbility(modifiers: WeaponModifiers, playerStats: PlayerStats): void {
    // Traps last 2x longer
    modifiers.projectileLifetimeMultiplier = (modifiers.projectileLifetimeMultiplier || 1) * WARDEN.TRAP_DURATION_MULTIPLIER
    // +1 trap per cast
    modifiers.projectileCount += WARDEN.TRAP_COUNT_BONUS
  }
}

// Phantom Implementation
export class PhantomCharacter extends Character {
  applyInnateAbility(modifiers: WeaponModifiers, playerStats: PlayerStats): void {
    // Headshots deal 3x damage, +100% crit on snipers - flat addition
    // This will be handled in sniper rifle weapon logic
    modifiers.critChance += PHANTOM.CRIT_CHANCE_BONUS // 100% crit chance for snipers
    modifiers.critDamage += PHANTOM.CRIT_DAMAGE_BONUS // Additional 1.5x for "headshots" = 3x total
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
