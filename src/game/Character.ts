import Phaser from 'phaser'
import { WeaponType } from './Weapon'
import { WeaponModifiers } from './Weapon'
import { PlayerStats } from './Passive'
import { DamageType } from './Weapon'

export enum CharacterType {
  ACE = 'ACE',
  KING = 'KING',
  QUEEN = 'QUEEN',
  JACK = 'JACK',
  TEN = 'TEN',
  JOKER = 'JOKER',
  SPADE = 'SPADE',
  HEART = 'HEART',
  DIAMOND = 'DIAMOND',
  CLUB = 'CLUB',
  PAIR = 'PAIR',
  KING_OF_CLUBS = 'KING_OF_CLUBS',
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
}

export const CHARACTER_CONFIGS: Record<CharacterType, CharacterConfig> = {
  [CharacterType.ACE]: {
    name: 'Ace',
    type: CharacterType.ACE,
    startingWeapon: WeaponType.CANNON,
    innateAbility: '+10% pickup radius per level cleared',
    description: 'Balanced starter ship with growing collection power',
    symbol: '♠',
    color: '#ffffff',
    baseHealth: 100,
    baseMoveSpeed: 200,
    weaponSlots: 4,
    passiveSlots: 4,
  },
  [CharacterType.KING]: {
    name: 'King',
    type: CharacterType.KING,
    startingWeapon: WeaponType.DARK,
    innateAbility: '10% chance enemies revive as allies',
    description: 'Commanding presence that converts foes',
    symbol: '♔',
    color: '#8800ff',
    baseHealth: 120,
    baseMoveSpeed: 180,
    weaponSlots: 4,
    passiveSlots: 4,
  },
  [CharacterType.QUEEN]: {
    name: 'Queen',
    type: CharacterType.QUEEN,
    startingWeapon: WeaponType.ICE,
    innateAbility: '+25% attack speed for Cold weapons',
    description: 'Freezing fury with rapid cold damage',
    symbol: '♕',
    color: '#aaffff',
    baseHealth: 90,
    baseMoveSpeed: 210,
    weaponSlots: 4,
    passiveSlots: 4,
  },
  [CharacterType.JACK]: {
    name: 'Jack',
    type: CharacterType.JACK,
    startingWeapon: WeaponType.FIRE,
    innateAbility: 'All projectiles bounce once',
    description: 'Explosive maverick with unpredictable power',
    symbol: '♦',
    color: '#ff4400',
    baseHealth: 110,
    baseMoveSpeed: 190,
    weaponSlots: 4,
    passiveSlots: 4,
  },
  [CharacterType.TEN]: {
    name: 'Ten',
    type: CharacterType.TEN,
    startingWeapon: WeaponType.LASER_BEAM,
    innateAbility: '+15% damage at max heat, slower overheat',
    description: 'Sustained beam specialist with heat management',
    symbol: '⑩',
    color: '#ff0000',
    baseHealth: 85,
    baseMoveSpeed: 200,
    weaponSlots: 4,
    passiveSlots: 4,
  },
  [CharacterType.JOKER]: {
    name: 'Joker',
    type: CharacterType.JOKER,
    startingWeapon: WeaponType.EARTH,
    innateAbility: 'Generates small shield every 10s if stationary',
    description: 'Defensive trickster with positional gameplay',
    symbol: '🃏',
    color: '#884400',
    baseHealth: 130,
    baseMoveSpeed: 170,
    weaponSlots: 4,
    passiveSlots: 4,
  },
  [CharacterType.SPADE]: {
    name: 'Spade',
    type: CharacterType.SPADE,
    startingWeapon: WeaponType.RICOCHET_DISK,
    innateAbility: '+1 ricochet bounce, +10% projectile speed',
    description: 'Chaos agent with bouncing projectiles',
    symbol: '♠',
    color: '#ffaa00',
    baseHealth: 95,
    baseMoveSpeed: 205,
    weaponSlots: 4,
    passiveSlots: 4,
  },
  [CharacterType.HEART]: {
    name: 'Heart',
    type: CharacterType.HEART,
    startingWeapon: WeaponType.GUN_BUDDY,
    innateAbility: '+1 passive slot, -1 weapon slot',
    description: 'Support specialist focused on passive synergies',
    symbol: '♥',
    color: '#88ff00',
    baseHealth: 100,
    baseMoveSpeed: 195,
    weaponSlots: 3,
    passiveSlots: 5,
  },
  [CharacterType.DIAMOND]: {
    name: 'Diamond',
    type: CharacterType.DIAMOND,
    startingWeapon: WeaponType.LIGHTNING,
    innateAbility: '+20% crit chance on Nature damage',
    description: 'Electric striker with critical power',
    symbol: '♦',
    color: '#00ffff',
    baseHealth: 90,
    baseMoveSpeed: 215,
    weaponSlots: 4,
    passiveSlots: 4,
  },
  [CharacterType.CLUB]: {
    name: 'Club',
    type: CharacterType.CLUB,
    startingWeapon: WeaponType.SHOTGUN,
    innateAbility: '-15% incoming damage',
    description: 'Tough brawler with damage mitigation',
    symbol: '♣',
    color: '#ff8800',
    baseHealth: 125,
    baseMoveSpeed: 175,
    weaponSlots: 4,
    passiveSlots: 4,
  },
  [CharacterType.PAIR]: {
    name: 'Pair',
    type: CharacterType.PAIR,
    startingWeapon: WeaponType.WATER,
    innateAbility: 'Weapons fire twice but deal 50% less damage',
    description: 'High volume attacker with split shots',
    symbol: '♣♣',
    color: '#00aaff',
    baseHealth: 95,
    baseMoveSpeed: 200,
    weaponSlots: 4,
    passiveSlots: 4,
  },
  [CharacterType.KING_OF_CLUBS]: {
    name: 'King of Clubs',
    type: CharacterType.KING_OF_CLUBS,
    startingWeapon: WeaponType.MISSILE_POD,
    innateAbility: '+1 missile per salvo, +10% explosion radius',
    description: 'Heavy weapons platform with area denial',
    symbol: '♔♣',
    color: '#ff6600',
    baseHealth: 140,
    baseMoveSpeed: 160,
    weaponSlots: 4,
    passiveSlots: 4,
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

// Ace Implementation
export class AceCharacter extends Character {
  applyInnateAbility(modifiers: WeaponModifiers, playerStats: PlayerStats): void {
    // +10% pickup radius per level cleared
    const radiusBonus = 1 + (this.levelsCleared * 0.1)
    playerStats.pickupRadius *= radiusBonus
  }
}

// King Implementation
export class KingCharacter extends Character {
  applyInnateAbility(modifiers: WeaponModifiers, playerStats: PlayerStats): void {
    // 10% chance enemies revive as allies
    // This will be handled in enemy death logic in GameScene
  }
}

// Queen Implementation
export class QueenCharacter extends Character {
  applyInnateAbility(modifiers: WeaponModifiers, playerStats: PlayerStats): void {
    // +25% attack speed for Cold weapons
    // This will be checked in weapon firing logic based on damage type
  }
}

// Jack Implementation
export class JackCharacter extends Character {
  applyInnateAbility(modifiers: WeaponModifiers, playerStats: PlayerStats): void {
    // All projectiles bounce once
    // This will be handled in projectile creation logic
  }
}

// Club Implementation
export class ClubCharacter extends Character {
  applyInnateAbility(modifiers: WeaponModifiers, playerStats: PlayerStats): void {
    // -15% incoming damage
    playerStats.damageReduction *= 1.15
  }
}

// Heart Implementation
export class HeartCharacter extends Character {
  applyInnateAbility(modifiers: WeaponModifiers, playerStats: PlayerStats): void {
    // +1 passive slot, -1 weapon slot
    // Already handled in CHARACTER_CONFIGS (weaponSlots: 3, passiveSlots: 5)
  }
}

// Diamond Implementation
export class DiamondCharacter extends Character {
  applyInnateAbility(modifiers: WeaponModifiers, playerStats: PlayerStats): void {
    // +20% crit chance on Nature damage
    // This will be checked in damage calculation based on damage type
  }
}

// Ten Implementation
export class TenCharacter extends Character {
  applyInnateAbility(modifiers: WeaponModifiers, playerStats: PlayerStats): void {
    // +15% damage at max heat, slower overheat
    // This will be handled in laser beam weapon logic
  }
}

// Joker Implementation
export class JokerCharacter extends Character {
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

// Spade Implementation
export class SpadeCharacter extends Character {
  applyInnateAbility(modifiers: WeaponModifiers, playerStats: PlayerStats): void {
    // +1 ricochet bounce already handled in character config
    // +10% projectile speed
    modifiers.projectileSpeedMultiplier += 0.1
  }
}

// Pair Implementation
export class PairCharacter extends Character {
  applyInnateAbility(modifiers: WeaponModifiers, playerStats: PlayerStats): void {
    // Weapons fire twice but deal 50% less damage
    // This will be handled in weapon firing logic
  }
}

// King of Clubs Implementation
export class KingOfClubsCharacter extends Character {
  applyInnateAbility(modifiers: WeaponModifiers, playerStats: PlayerStats): void {
    // +1 missile per salvo, +10% explosion radius
    // This will be handled in missile pod weapon logic
  }
}

// Character Factory
export class CharacterFactory {
  static create(scene: Phaser.Scene, type: CharacterType): Character {
    switch (type) {
      case CharacterType.ACE:
        return new AceCharacter(scene, type)
      case CharacterType.KING:
        return new KingCharacter(scene, type)
      case CharacterType.QUEEN:
        return new QueenCharacter(scene, type)
      case CharacterType.JACK:
        return new JackCharacter(scene, type)
      case CharacterType.CLUB:
        return new ClubCharacter(scene, type)
      case CharacterType.HEART:
        return new HeartCharacter(scene, type)
      case CharacterType.DIAMOND:
        return new DiamondCharacter(scene, type)
      case CharacterType.TEN:
        return new TenCharacter(scene, type)
      case CharacterType.JOKER:
        return new JokerCharacter(scene, type)
      case CharacterType.SPADE:
        return new SpadeCharacter(scene, type)
      case CharacterType.PAIR:
        return new PairCharacter(scene, type)
      case CharacterType.KING_OF_CLUBS:
        return new KingOfClubsCharacter(scene, type)
      default:
        // Default to Ace for unimplemented characters
        return new AceCharacter(scene, CharacterType.ACE)
    }
  }
}
