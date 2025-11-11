import Phaser from 'phaser'
import { ProjectileGroup, ProjectileType } from './Projectile'
import { soundManager } from './SoundManager'

export enum DamageType {
  PHYSICAL = 'PHYSICAL',
  FIRE = 'FIRE',
  COLD = 'COLD',
  NATURE = 'NATURE',
  CONTROL = 'CONTROL',
}

export enum WeaponType {
  CANNON = 'CANNON',
  SHOTGUN = 'SHOTGUN',
  GUN_BUDDY = 'GUN_BUDDY',
  LIGHTNING = 'LIGHTNING',
  ICE = 'ICE',
  FIRE = 'FIRE',
  WATER = 'WATER',
  EARTH = 'EARTH',
  DARK = 'DARK',
  LASER_BEAM = 'LASER_BEAM',
  RICOCHET_DISK = 'RICOCHET_DISK',
  MISSILE_POD = 'MISSILE_POD',
  FIREBALL_RING = 'FIREBALL_RING',
  BLOOD_LANCE = 'BLOOD_LANCE',
  PLASMA_AURA = 'PLASMA_AURA',
  VORTEX_BLADE = 'VORTEX_BLADE',
  ORBITAL_STRIKE = 'ORBITAL_STRIKE',
  MINIGUN = 'MINIGUN',
  TRAP_LAYER = 'TRAP_LAYER',
  SNIPER_RIFLE = 'SNIPER_RIFLE',
}

export interface WeaponConfig {
  name: string
  type: WeaponType
  damageType: DamageType
  baseDamage: number
  baseFireRate: number // ms between shots
  description: string
  maxLevel: number
  icon: string // ASCII character
  color: string
}

export const WEAPON_CONFIGS: Record<WeaponType, WeaponConfig> = {
  [WeaponType.CANNON]: {
    name: 'Cannon',
    type: WeaponType.CANNON,
    damageType: DamageType.PHYSICAL,
    baseDamage: 7,
    baseFireRate: 350, // Balanced for ~48 DPS at level 3
    description: 'Basic pellets fired upward',
    maxLevel: 3,
    icon: '|',
    color: '#ffff00', // Yellow for PHYSICAL
  },
  [WeaponType.SHOTGUN]: {
    name: 'Shotgun',
    type: WeaponType.SHOTGUN,
    damageType: DamageType.PHYSICAL,
    baseDamage: 5,
    baseFireRate: 488, // Reduced by 25% from 650 (faster fire rate)
    description: 'Wide spread, slow fire rate',
    maxLevel: 3,
    icon: '╪',
    color: '#ffff00', // Yellow for PHYSICAL
  },
  [WeaponType.LIGHTNING]: {
    name: 'Lightning',
    type: WeaponType.LIGHTNING,
    damageType: DamageType.NATURE,
    baseDamage: 5,
    baseFireRate: 450, // Balanced for ~71 DPS at level 3 (with 6 chains)
    description: 'Chain lightning between enemies',
    maxLevel: 3,
    icon: '‡',
    color: '#00ff00', // Green for NATURE
  },
  [WeaponType.FIRE]: {
    name: 'Fire',
    type: WeaponType.FIRE,
    damageType: DamageType.FIRE,
    baseDamage: 15,
    baseFireRate: 585, // Reduced by 25% from 780 (faster fire rate)
    description: 'Explodes on contact (AOE)',
    maxLevel: 3,
    icon: '※',
    color: '#ff8800', // Orange for FIRE
  },
  [WeaponType.GUN_BUDDY]: {
    name: 'Gun Buddy',
    type: WeaponType.GUN_BUDDY,
    damageType: DamageType.PHYSICAL,
    baseDamage: 6,
    baseFireRate: 293, // Reduced by 25% from 390 (faster fire rate)
    description: 'Floating ally that shoots',
    maxLevel: 3,
    icon: '◉',
    color: '#ffff00', // Yellow for PHYSICAL
  },
  [WeaponType.ICE]: {
    name: 'Ice',
    type: WeaponType.ICE,
    damageType: DamageType.COLD,
    baseDamage: 10,
    baseFireRate: 341, // Reduced by 25% from 455 (faster fire rate)
    description: 'Freezes and slows enemies',
    maxLevel: 3,
    icon: '❄',
    color: '#00aaff', // Blue for COLD
  },
  [WeaponType.WATER]: {
    name: 'Water',
    type: WeaponType.WATER,
    damageType: DamageType.COLD,
    baseDamage: 11,
    baseFireRate: 439, // Reduced by 25% from 585 (faster fire rate)
    description: 'Oscillating wave projectiles',
    maxLevel: 3,
    icon: '≈',
    color: '#00aaff', // Blue for COLD
  },
  [WeaponType.EARTH]: {
    name: 'Earth',
    type: WeaponType.EARTH,
    damageType: DamageType.NATURE,
    baseDamage: 14,
    baseFireRate: 683, // Reduced by 25% from 910 (faster fire rate)
    description: 'Persistent damage zone',
    maxLevel: 3,
    icon: '▓',
    color: '#00ff00', // Green for NATURE
  },
  [WeaponType.DARK]: {
    name: 'Dark',
    type: WeaponType.DARK,
    damageType: DamageType.COLD,
    baseDamage: 25,
    baseFireRate: 1170, // Reduced by 25% from 1560 (faster fire rate)
    description: 'Powerful slow projectiles',
    maxLevel: 3,
    icon: '●',
    color: '#00aaff', // Blue for COLD
  },
  [WeaponType.LASER_BEAM]: {
    name: 'Laser Beam',
    type: WeaponType.LASER_BEAM,
    damageType: DamageType.FIRE,
    baseDamage: 5,
    baseFireRate: 146, // Reduced by 25% from 195 (faster fire rate)
    description: 'Burst fire beam, overheats',
    maxLevel: 3,
    icon: '━',
    color: '#ff8800', // Orange for FIRE
  },
  [WeaponType.RICOCHET_DISK]: {
    name: 'Ricochet Disk',
    type: WeaponType.RICOCHET_DISK,
    damageType: DamageType.PHYSICAL,
    baseDamage: 13,
    baseFireRate: 390, // Reduced by 25% from 520 (faster fire rate)
    description: 'Bounces off edges and enemies',
    maxLevel: 3,
    icon: '◇',
    color: '#ffff00', // Yellow for PHYSICAL
  },
  [WeaponType.MISSILE_POD]: {
    name: 'Missile Pod',
    type: WeaponType.MISSILE_POD,
    damageType: DamageType.PHYSICAL,
    baseDamage: 12,
    baseFireRate: 500, // Balanced for ~29 DPS at level 3 (AOE splash)
    description: 'Seeking rockets with splash',
    maxLevel: 3,
    icon: '▲',
    color: '#ffff00', // Yellow for PHYSICAL
  },
  [WeaponType.FIREBALL_RING]: {
    name: 'Fireball Ring',
    type: WeaponType.FIREBALL_RING,
    damageType: DamageType.FIRE,
    baseDamage: 14,
    baseFireRate: 450, // Balanced for ~38 DPS at level 3 (orbital damage)
    description: 'Rotating fireballs orbit around you',
    maxLevel: 3,
    icon: '◉',
    color: '#ff8800', // Orange for FIRE
  },
  [WeaponType.BLOOD_LANCE]: {
    name: 'Quill',
    type: WeaponType.BLOOD_LANCE,
    damageType: DamageType.NATURE,
    baseDamage: 8,
    baseFireRate: 293, // Reduced by 25% from 390 (faster fire rate)
    description: 'Ricochet weapon that applies poison',
    maxLevel: 3,
    icon: '╬',
    color: '#00ff00', // Green for NATURE
  },
  [WeaponType.PLASMA_AURA]: {
    name: 'Plasma Aura',
    type: WeaponType.PLASMA_AURA,
    damageType: DamageType.FIRE,
    baseDamage: 12,
    baseFireRate: 400, // Balanced for ~37 DPS at level 3 (constant AOE)
    description: 'Constant AOE damage around you',
    maxLevel: 3,
    icon: '⊛',
    color: '#ff8800', // Orange for FIRE
  },
  [WeaponType.VORTEX_BLADE]: {
    name: 'Blizzard',
    type: WeaponType.VORTEX_BLADE,
    damageType: DamageType.COLD,
    baseDamage: 12,
    baseFireRate: 488, // Reduced by 25% from 650 (faster fire rate)
    description: 'Spiraling ice projectiles expand outward',
    maxLevel: 3,
    icon: '◈',
    color: '#00aaff', // Blue for COLD
  },
  [WeaponType.ORBITAL_STRIKE]: {
    name: 'Orbital Strike',
    type: WeaponType.ORBITAL_STRIKE,
    damageType: DamageType.FIRE,
    baseDamage: 8,
    baseFireRate: 400, // Balanced for ~24 DPS at level 3 (multi-hit)
    description: 'Row of explosions across screen top',
    maxLevel: 3,
    icon: '▼',
    color: '#ff8800', // Orange for FIRE
  },
  [WeaponType.MINIGUN]: {
    name: 'Minigun',
    type: WeaponType.MINIGUN,
    damageType: DamageType.PHYSICAL,
    baseDamage: 4, // Doubled from 2 for performance (fewer projectiles)
    baseFireRate: 130, // Halved fire rate for performance (was 65ms)
    description: 'Rapid-fire low-damage bullets',
    maxLevel: 3,
    icon: '▪',
    color: '#ffff00',
  },
  [WeaponType.TRAP_LAYER]: {
    name: 'Trap Layer',
    type: WeaponType.TRAP_LAYER,
    damageType: DamageType.NATURE,
    baseDamage: 18,
    baseFireRate: 700, // Balanced for ~31 DPS at level 3 (persistent damage)
    description: 'Creates damage traps at your location',
    maxLevel: 3,
    icon: '✻',
    color: '#00ff00', // Green for NATURE
  },
  [WeaponType.SNIPER_RIFLE]: {
    name: 'Sniper Rifle',
    type: WeaponType.SNIPER_RIFLE,
    damageType: DamageType.PHYSICAL,
    baseDamage: 50,
    baseFireRate: 1950, // Reduced by 25% from 2600 (faster fire rate)
    description: 'High damage shots at nearest enemy',
    maxLevel: 3,
    icon: '═',
    color: '#ffff00', // Yellow for PHYSICAL
  },
}

export abstract class Weapon {
  protected scene: Phaser.Scene
  protected config: WeaponConfig
  protected level: number
  protected projectileGroup: ProjectileGroup
  protected lastFireTime: number = 0

  constructor(scene: Phaser.Scene, type: WeaponType, projectileGroup: ProjectileGroup) {
    this.scene = scene
    this.config = WEAPON_CONFIGS[type]
    this.level = 1
    this.projectileGroup = projectileGroup
  }

  abstract fire(x: number, y: number, modifiers: WeaponModifiers): void

  canFire(currentTime: number, modifiers: WeaponModifiers = DEFAULT_MODIFIERS): boolean {
    const fireRate = this.getFireRate(modifiers)
    return currentTime >= this.lastFireTime + fireRate
  }

  setLastFireTime(time: number): void {
    this.lastFireTime = time
  }

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

  getDamage(): number {
    // Base damage + level scaling (6% per level for ~10% total DPS increase)
    return Math.floor(this.config.baseDamage * (1 + (this.level - 1) * 0.06))
  }

  getFireRate(modifiers: WeaponModifiers = DEFAULT_MODIFIERS): number {
    // Fire rate improves with level (4% faster per level for ~10% total DPS increase)
    const baseRate = this.config.baseFireRate * (1 - (this.level - 1) * 0.04)
    // Apply fire rate multiplier (lower multiplier = faster fire rate)
    return Math.floor(baseRate / modifiers.fireRateMultiplier)
  }

  getConfig(): WeaponConfig {
    return this.config
  }

  getInfo(): string {
    return `${this.config.name} Lv.${this.level}\n${this.config.description}\nDamage: ${this.getDamage()}`
  }
}

export interface WeaponModifiers {
  damageMultiplier: number
  fireRateMultiplier: number
  pierceCount: number
  projectileSpeedMultiplier: number
  projectileSizeMultiplier: number
  critChance: number
  critDamage: number
  projectileCount?: number // Extra projectiles per shot
  explosionRadiusMultiplier?: number // Multiplier for explosion radius
  additionalShots?: number // Fire weapon multiple times
  dotDurationMultiplier?: number // Duration multiplier for DoT effects
  homingEnabled?: boolean // Enable homing for projectiles
  projectileLifetimeMultiplier?: number // Lifetime multiplier for projectiles
}

export const DEFAULT_MODIFIERS: WeaponModifiers = {
  damageMultiplier: 1.0,
  fireRateMultiplier: 1.0,
  pierceCount: 0,
  projectileSpeedMultiplier: 1.0,
  projectileSizeMultiplier: 1.0,
  critChance: 0,
  critDamage: 1.5,
  projectileCount: 0,
  explosionRadiusMultiplier: 1.0,
  additionalShots: 0,
  dotDurationMultiplier: 1.0,
  homingEnabled: false,
  projectileLifetimeMultiplier: 1.0,
}

// Cannon Implementation
export class CannonWeapon extends Weapon {
  fire(x: number, y: number, modifiers: WeaponModifiers): void {
    soundManager.playWeaponSound(this.config.name)
    const damage = this.getDamage() * modifiers.damageMultiplier
    const pierce = modifiers.pierceCount

    // Add 1 extra projectile only at max level, plus building/character bonuses
    const projectileCount = (this.level === 3 ? 2 : 1) + (modifiers.projectileCount || 0)
    const spacing = 15

    // Apply projectile speed multiplier
    const speed = -500 * modifiers.projectileSpeedMultiplier

    if (projectileCount === 1) {
      this.projectileGroup.fireProjectile(x, y, damage, pierce, 0, speed, this.config.icon, this.config.color, undefined, { damageType: this.config.damageType })
    } else {
      const totalWidth = (projectileCount - 1) * spacing
      const startX = x - totalWidth / 2

      for (let i = 0; i < projectileCount; i++) {
        this.projectileGroup.fireProjectile(startX + i * spacing, y, damage, pierce, 0, speed, this.config.icon, this.config.color, undefined, { damageType: this.config.damageType })
      }
    }
  }
}

// Shotgun Implementation
export class ShotgunWeapon extends Weapon {
  fire(x: number, y: number, modifiers: WeaponModifiers): void {
    soundManager.playWeaponSound(this.config.name)
    const damage = this.getDamage() * modifiers.damageMultiplier
    const pierce = modifiers.pierceCount

    // Modest pellet increase and tighter spread at higher levels, plus building/character bonuses
    const pelletCount = 3 + Math.floor((this.level - 1) * 0.5) + (modifiers.projectileCount || 0)
    const spreadAngle = 60 - (this.level - 1) * 10 // Tighter spread at higher levels

    // Apply projectile speed multiplier
    const speed = 500 * modifiers.projectileSpeedMultiplier

    this.projectileGroup.fireSpread(x, y, damage, pierce, pelletCount, spreadAngle, this.config.icon, this.config.color, '14px', speed)
  }
}

// Lightning Implementation
export class LightningWeapon extends Weapon {
  fire(x: number, y: number, modifiers: WeaponModifiers): void {
    soundManager.playWeaponSound(this.config.name)
    const damage = this.getDamage() * modifiers.damageMultiplier
    const pierce = 0 // Lightning doesn't pierce, it chains

    // Lightning chains increase with level (2 chains at level 1, 4 at level 2, 6 at level 3)
    const chainCount = this.level * 2

    // Add building/character bonuses for additional projectiles
    const projectileCount = 1 + (modifiers.projectileCount || 0)
    const spacing = 15

    // Apply projectile speed multiplier
    const speed = -500 * modifiers.projectileSpeedMultiplier

    if (projectileCount === 1) {
      this.projectileGroup.fireProjectile(
        x, y, damage, pierce, 0, speed,
        this.config.icon, this.config.color,
        ProjectileType.CHAINING,
        { chainCount }
      )
    } else {
      const totalWidth = (projectileCount - 1) * spacing
      const startX = x - totalWidth / 2

      for (let i = 0; i < projectileCount; i++) {
        this.projectileGroup.fireProjectile(
          startX + i * spacing, y, damage, pierce, 0, speed,
          this.config.icon, this.config.color,
          ProjectileType.CHAINING,
          { chainCount }
        )
      }
    }
  }
}

// Fire Implementation
export class FireWeapon extends Weapon {
  fire(x: number, y: number, modifiers: WeaponModifiers): void {
    soundManager.playWeaponSound(this.config.name)
    const damage = this.getDamage() * modifiers.damageMultiplier

    // Fire creates explosions - represented by larger, slower projectiles
    const pierce = 0 // Fire explodes on first hit

    // Apply projectile speed multiplier
    const speed = -400 * modifiers.projectileSpeedMultiplier

    // Explosion radius increases modestly with level
    const explosionRadius = (60 + (this.level - 1) * 10) * modifiers.explosionRadiusMultiplier

    // Add 1 extra projectile only at max level, plus building/character bonuses
    const count = (this.level === 3 ? 2 : 1) + (modifiers.projectileCount || 0)
    if (count === 1) {
      this.projectileGroup.fireProjectile(
        x, y, damage, pierce, 0, speed,
        this.config.icon, this.config.color,
        ProjectileType.EXPLOSIVE,
        { explosionRadius, fontSize: '27px' }
      )
    } else {
      const spacing = 20
      const totalWidth = (count - 1) * spacing
      const startX = x - totalWidth / 2

      for (let i = 0; i < count; i++) {
        this.projectileGroup.fireProjectile(
          startX + i * spacing, y, damage, pierce, 0, speed,
          this.config.icon, this.config.color,
          ProjectileType.EXPLOSIVE,
          { explosionRadius, fontSize: '27px' }
        )
      }
    }
  }
}

// Gun Buddy Implementation
export class GunBuddyWeapon extends Weapon {
  fire(x: number, y: number, modifiers: WeaponModifiers): void {
    // Gun Buddy weapon spawns visual ally entities that shoot automatically
    // The allies are managed by the ally system in GameScene
    // This weapon doesn't fire projectiles directly
  }
}

// Ice Implementation
export class IceWeapon extends Weapon {
  fire(x: number, y: number, modifiers: WeaponModifiers): void {
    soundManager.playWeaponSound(this.config.name)
    const damage = this.getDamage() * modifiers.damageMultiplier
    const pierce = this.level // Ice pierces and slows

    // Freeze chance increases modestly with level
    const freezeChance = 30 + (this.level - 1) * 10
    const freezeDuration = 2000 // 2 seconds

    // Apply projectile speed multiplier
    const speed = -500 * modifiers.projectileSpeedMultiplier

    // Add 1 extra lance only at max level, plus building/character bonuses
    const count = (this.level === 3 ? 2 : 1) + (modifiers.projectileCount || 0)
    if (count === 1) {
      this.projectileGroup.fireProjectile(
        x, y, damage, pierce, 0, speed,
        this.config.icon, this.config.color,
        ProjectileType.FREEZING,
        { freezeChance, freezeDuration, fontSize: '31px' }
      )
    } else {
      const spacing = 20
      const totalWidth = (count - 1) * spacing
      const startX = x - totalWidth / 2

      for (let i = 0; i < count; i++) {
        this.projectileGroup.fireProjectile(
          startX + i * spacing, y, damage, pierce, 0, speed,
          this.config.icon, this.config.color,
          ProjectileType.FREEZING,
          { freezeChance, freezeDuration, fontSize: '31px' }
        )
      }
    }
  }
}

// Water Implementation
export class WaterWeapon extends Weapon {
  fire(x: number, y: number, modifiers: WeaponModifiers): void {
    soundManager.playWeaponSound(this.config.name)
    const damage = this.getDamage() * modifiers.damageMultiplier
    const pierce = modifiers.pierceCount

    // Wave parameters - more amplitude and frequency at higher levels
    const waveAmplitude = 40 + (this.level - 1) * 5
    const waveFrequency = 0.015 + (this.level - 1) * 0.0025

    // Apply projectile speed multiplier
    const speed = -500 * modifiers.projectileSpeedMultiplier

    // Add building/character bonuses for additional projectiles
    const projectileCount = 1 + (modifiers.projectileCount || 0)
    const spacing = 20

    if (projectileCount === 1) {
      this.projectileGroup.fireProjectile(
        x, y, damage, pierce, 0, speed,
        this.config.icon, this.config.color,
        ProjectileType.WAVE,
        { waveAmplitude, waveFrequency }
      )
    } else {
      const totalWidth = (projectileCount - 1) * spacing
      const startX = x - totalWidth / 2

      for (let i = 0; i < projectileCount; i++) {
        this.projectileGroup.fireProjectile(
          startX + i * spacing, y, damage, pierce, 0, speed,
          this.config.icon, this.config.color,
          ProjectileType.WAVE,
          { waveAmplitude, waveFrequency }
        )
      }
    }
  }
}

// Earth Implementation
export class EarthWeapon extends Weapon {
  fire(x: number, y: number, modifiers: WeaponModifiers): void {
    soundManager.playWeaponSound(this.config.name)
    const damage = this.getDamage() * modifiers.damageMultiplier
    const pierce = 0 // Earth creates zones, doesn't pierce

    // Apply projectile speed multiplier
    const speed = -300 * modifiers.projectileSpeedMultiplier

    // Zone parameters scale modestly with level
    const zoneDuration = 3000 + (this.level - 1) * 500 // 3-4 seconds
    const zoneRadius = (50 + (this.level - 1) * 5) * modifiers.explosionRadiusMultiplier // 50-60 pixel radius

    // Add building/character bonuses for additional projectiles
    const projectileCount = 1 + (modifiers.projectileCount || 0)
    const spacing = 25

    if (projectileCount === 1) {
      this.projectileGroup.fireProjectile(
        x, y, damage, pierce, 0, speed,
        this.config.icon, this.config.color,
        ProjectileType.EARTH_ZONE,
        { zoneDuration, zoneRadius }
      )
    } else {
      const totalWidth = (projectileCount - 1) * spacing
      const startX = x - totalWidth / 2

      for (let i = 0; i < projectileCount; i++) {
        this.projectileGroup.fireProjectile(
          startX + i * spacing, y, damage, pierce, 0, speed,
          this.config.icon, this.config.color,
          ProjectileType.EARTH_ZONE,
          { zoneDuration, zoneRadius }
        )
      }
    }
  }
}

// Dark Implementation
export class DarkWeapon extends Weapon {
  fire(x: number, y: number, modifiers: WeaponModifiers): void {
    soundManager.playWeaponSound(this.config.name)
    const damage = this.getDamage() * modifiers.damageMultiplier
    const pierce = modifiers.pierceCount

    // Apply projectile speed multiplier
    const speed = -350 * modifiers.projectileSpeedMultiplier

    // Add building/character bonuses for additional projectiles
    const projectileCount = 1 + (modifiers.projectileCount || 0)
    const spacing = 20

    if (projectileCount === 1) {
      this.projectileGroup.fireProjectile(
        x, y, damage, pierce, 0, speed,
        this.config.icon, this.config.color,
        undefined,
        { fontSize: '27px' }
      )
    } else {
      const totalWidth = (projectileCount - 1) * spacing
      const startX = x - totalWidth / 2

      for (let i = 0; i < projectileCount; i++) {
        this.projectileGroup.fireProjectile(
          startX + i * spacing, y, damage, pierce, 0, speed,
          this.config.icon, this.config.color,
          undefined,
          { fontSize: '27px' }
        )
      }
    }
  }
}

// Laser Beam Implementation
export class LaserBeamWeapon extends Weapon {
  private heat: number = 0
  private maxHeat: number = 100
  private heatPerShot: number = 3 // Heat gained per shot (balances to ~5 seconds of firing)
  private cooldownRate: number = 2 // Heat lost per 100ms when not firing
  private lastCooldownTime: number = 0
  private isOverheated: boolean = false
  private overheatCooldownDuration: number = 5000 // 5 seconds cooldown when overheated
  private overheatStartTime: number = 0

  canFire(currentTime: number, modifiers: WeaponModifiers = DEFAULT_MODIFIERS): boolean {
    // Check overheat status
    if (this.isOverheated) {
      if (currentTime >= this.overheatStartTime + this.overheatCooldownDuration) {
        this.isOverheated = false
        this.heat = 0 // Reset heat after overheat cooldown
        this.lastCooldownTime = currentTime
      } else {
        return false // Can't fire while overheated
      }
    }

    // Apply passive cooling when not firing (and not overheated)
    if (!this.isOverheated && currentTime >= this.lastCooldownTime + 100) {
      this.heat = Math.max(0, this.heat - this.cooldownRate)
      this.lastCooldownTime = currentTime
    }

    return super.canFire(currentTime, modifiers)
  }

  fire(x: number, y: number, modifiers: WeaponModifiers): void {
    soundManager.playWeaponSound(this.config.name)
    const damage = this.getDamage() * modifiers.damageMultiplier

    // RAYCAST implementation - instant hit, no projectiles!
    // Add 1 extra beam only at max level, plus building/character bonuses
    const beamCount = (this.level === 3 ? 2 : 1) + (modifiers.projectileCount || 0)
    const maxRange = 600 // Max laser range

    // Emit laser fire event for GameScene to handle damage + visual effects
    // This avoids creating projectiles entirely
    this.scene.events.emit('laserFire', {
      x,
      y,
      damage,
      beamCount,
      maxRange,
      color: this.config.color
    })

    // Increase heat
    this.heat += this.heatPerShot
    if (this.heat >= this.maxHeat && !this.isOverheated) {
      this.isOverheated = true
      this.overheatStartTime = this.lastFireTime // Use last fire time as overheat start
    }
  }

  getHeat(): number {
    return this.heat
  }

  getMaxHeat(): number {
    return this.maxHeat
  }

  isWeaponOverheated(): boolean {
    return this.isOverheated
  }
}

// Ricochet Disk Implementation
export class RicochetDiskWeapon extends Weapon {
  fire(x: number, y: number, modifiers: WeaponModifiers): void {
    soundManager.playWeaponSound(this.config.name)
    const damage = this.getDamage() * modifiers.damageMultiplier
    const pierce = 3 + this.level // Disks hit multiple times

    // Apply projectile speed multiplier
    const speed = -450 * modifiers.projectileSpeedMultiplier
    const bounceCount = 3 + this.level // More bounces at higher levels

    // Add building/character bonuses for additional projectiles
    const projectileCount = 1 + (modifiers.projectileCount || 0)
    const spacing = 20

    if (projectileCount === 1) {
      this.projectileGroup.fireProjectile(
        x, y, damage, pierce, 0, speed,
        this.config.icon, this.config.color,
        ProjectileType.BOUNCING,
        { bounceCount }
      )
    } else {
      const totalWidth = (projectileCount - 1) * spacing
      const startX = x - totalWidth / 2

      for (let i = 0; i < projectileCount; i++) {
        this.projectileGroup.fireProjectile(
          startX + i * spacing, y, damage, pierce, 0, speed,
          this.config.icon, this.config.color,
          ProjectileType.BOUNCING,
          { bounceCount }
        )
      }
    }
  }

  getInfo(): string {
    const bounceCount = 3 + this.level
    return `${this.config.name} Lv.${this.level}\n${this.config.description}\nDamage: ${this.getDamage()}\nBounces: ${bounceCount}`
  }
}

// Missile Pod Implementation
export class MissilePodWeapon extends Weapon {
  fire(x: number, y: number, modifiers: WeaponModifiers): void {
    soundManager.playWeaponSound(this.config.name)
    const damage = this.getDamage() * modifiers.damageMultiplier
    const pierce = 0 // Missiles explode on impact

    // Modest missile count increase with level, plus building/character bonuses
    const missileCount = 2 + Math.floor((this.level - 1) * 0.5) + (modifiers.projectileCount || 0)

    // Apply projectile speed multiplier
    const speed = 350 * modifiers.projectileSpeedMultiplier
    const spacing = 25

    const totalWidth = (missileCount - 1) * spacing
    const startX = x - totalWidth / 2

    // Missiles should explode on impact and home in on enemies
    const explosionRadius = (50 + (this.level - 1) * 8) * modifiers.explosionRadiusMultiplier
    const homingTurnRate = 0.05 // Slow turning rate (radians per frame)
    const homingSpeed = 350 * modifiers.projectileSpeedMultiplier

    for (let i = 0; i < missileCount; i++) {
      this.projectileGroup.fireProjectile(
        startX + i * spacing, y, damage, pierce, 0, -speed,
        this.config.icon, this.config.color,
        ProjectileType.HOMING,
        { explosionRadius, homingTurnRate, homingSpeed, fontSize: '14px' }
      )
    }
  }
}

// Fireball Ring Implementation (Placeholder)
export class FireballRingWeapon extends Weapon {
  private angle: number = 0

  fire(x: number, y: number, modifiers: WeaponModifiers): void {
    soundManager.playWeaponSound(this.config.name)
    const damage = this.getDamage() * modifiers.damageMultiplier
    const pierce = 0

    // Add 1 extra fireball only at max level, plus building/character bonuses
    const fireballCount = (this.level === 3 ? 2 : 1) + (modifiers.projectileCount || 0)
    const radius = 60
    const angleStep = (Math.PI * 2) / fireballCount

    for (let i = 0; i < fireballCount; i++) {
      const currentAngle = this.angle + (angleStep * i)
      const offsetX = Math.cos(currentAngle) * radius
      const offsetY = Math.sin(currentAngle) * radius

      this.projectileGroup.fireProjectile(
        x + offsetX, y + offsetY, damage, pierce, 0, -400,
        this.config.icon, this.config.color,
        ProjectileType.EXPLOSIVE,
        { explosionRadius: (40 + (this.level - 1) * 5) * modifiers.explosionRadiusMultiplier }
      )
    }

    // Rotate for next fire
    this.angle += 0.3
  }
}

// Blood Lance Implementation (Placeholder - uses ricochet like Ricochet Disk)
export class BloodLanceWeapon extends Weapon {
  fire(x: number, y: number, modifiers: WeaponModifiers): void {
    soundManager.playWeaponSound(this.config.name)
    const damage = this.getDamage() * modifiers.damageMultiplier
    const pierce = 5 + (this.level * 2) // More ricochets than Ricochet Disk

    // Apply projectile speed multiplier
    const speed = -500 * modifiers.projectileSpeedMultiplier
    const bounceCount = 5 + (this.level * 2) // Many more bounces

    // Add building/character bonuses for additional projectiles
    const projectileCount = 1 + (modifiers.projectileCount || 0)
    const spacing = 20

    if (projectileCount === 1) {
      this.projectileGroup.fireProjectile(
        x, y, damage, pierce, 0, speed,
        this.config.icon, this.config.color,
        ProjectileType.BOUNCING,
        { bounceCount }
      )
    } else {
      const totalWidth = (projectileCount - 1) * spacing
      const startX = x - totalWidth / 2

      for (let i = 0; i < projectileCount; i++) {
        this.projectileGroup.fireProjectile(
          startX + i * spacing, y, damage, pierce, 0, speed,
          this.config.icon, this.config.color,
          ProjectileType.BOUNCING,
          { bounceCount }
        )
      }
    }
  }
}

// Plasma Aura Implementation (Placeholder - uses explosion pattern)
export class PlasmaAuraWeapon extends Weapon {
  fire(x: number, y: number, modifiers: WeaponModifiers): void {
    soundManager.playWeaponSound(this.config.name)
    const damage = this.getDamage() * modifiers.damageMultiplier
    const pierce = 0

    // Modest increase in projectile count with level, plus building/character bonuses
    const projectileCount = 8 + (this.level - 1) * 2 + (modifiers.projectileCount || 0)
    const radius = 60 + (this.level - 1) * 10
    const angleStep = (Math.PI * 2) / projectileCount

    // Apply projectile speed multiplier
    const speed = 200 * modifiers.projectileSpeedMultiplier

    for (let i = 0; i < projectileCount; i++) {
      const angle = angleStep * i
      const velocityX = Math.cos(angle) * speed
      const velocityY = Math.sin(angle) * speed

      this.projectileGroup.fireProjectile(
        x, y, damage, pierce, velocityX, velocityY,
        this.config.icon, this.config.color
      )
    }
  }
}

// Vortex Blade Implementation (Placeholder - uses spiral pattern)
export class VortexBladeWeapon extends Weapon {
  private spiralAngle: number = 0

  fire(x: number, y: number, modifiers: WeaponModifiers): void {
    soundManager.playWeaponSound(this.config.name)
    const damage = this.getDamage() * modifiers.damageMultiplier
    const pierce = modifiers.pierceCount

    // Modest blade count increase with level, plus building/character bonuses
    const bladeCount = 2 + Math.floor((this.level - 1) * 0.5) + (modifiers.projectileCount || 0)
    const angleStep = (Math.PI * 2) / bladeCount

    // Apply projectile speed multiplier
    const speed = 400 * modifiers.projectileSpeedMultiplier

    for (let i = 0; i < bladeCount; i++) {
      const angle = this.spiralAngle + (angleStep * i)
      const velocityX = Math.cos(angle) * speed
      const velocityY = Math.sin(angle) * speed - 200 // Bias upward

      this.projectileGroup.fireProjectile(
        x, y, damage, pierce, velocityX, velocityY,
        this.config.icon, this.config.color
      )
    }

    // Increment spiral for next fire
    this.spiralAngle += 0.5
  }
}

// Orbital Strike Implementation (Placeholder)
export class OrbitalStrikeWeapon extends Weapon {
  fire(x: number, y: number, modifiers: WeaponModifiers): void {
    soundManager.playWeaponSound(this.config.name)
    const damage = this.getDamage() * modifiers.damageMultiplier
    const pierce = 0

    // Modest increase in explosion count with level, plus building/character bonuses
    const explosionCount = 3 + (this.level - 1) + (modifiers.projectileCount || 0)
    const screenWidth = this.scene.cameras.main.width
    const spacing = screenWidth / (explosionCount + 1)
    const explosionRadius = 50 + (this.level - 1) * 5

    // Apply projectile speed multiplier
    const speed = 300 * modifiers.projectileSpeedMultiplier

    for (let i = 1; i <= explosionCount; i++) {
      const strikeX = spacing * i
      const strikeY = 50

      this.projectileGroup.fireProjectile(
        strikeX, strikeY, damage, pierce, 0, speed,
        this.config.icon, this.config.color,
        ProjectileType.EXPLOSIVE,
        { explosionRadius }
      )
    }
  }
}

// Minigun Implementation (Placeholder)
export class MinigunWeapon extends Weapon {
  fire(x: number, y: number, modifiers: WeaponModifiers): void {
    soundManager.playWeaponSound(this.config.name)
    const damage = this.getDamage() * modifiers.damageMultiplier
    const pierce = modifiers.pierceCount

    const spread = 30 // Slight inaccuracy

    // Add building/character bonuses for additional projectiles
    const projectileCount = 1 + (modifiers.projectileCount || 0)

    // Apply projectile speed multiplier
    const baseSpeedX = 1500 * modifiers.projectileSpeedMultiplier
    const baseSpeedY = 2100 * modifiers.projectileSpeedMultiplier

    for (let i = 0; i < projectileCount; i++) {
      const spreadAngle = (Math.random() - 0.5) * spread * (Math.PI / 180)
      // Fast bullets for quick screen clearing (3x faster for performance)
      const velocityX = Math.sin(spreadAngle) * baseSpeedX
      const velocityY = Math.cos(spreadAngle) * -baseSpeedY

      this.projectileGroup.fireProjectile(
        x, y, damage, pierce, velocityX, velocityY,
        this.config.icon, this.config.color,
        undefined,
        { fontSize: '8px' }
      )
    }
  }
}

// Trap Layer Implementation (Placeholder)
export class TrapLayerWeapon extends Weapon {
  fire(x: number, y: number, modifiers: WeaponModifiers): void {
    soundManager.playWeaponSound(this.config.name)
    const damage = this.getDamage() * modifiers.damageMultiplier
    const pierce = 0

    // Improve properties with level
    const zoneDuration = 5000 + (this.level - 1) * 1000
    const zoneRadius = (60 + (this.level - 1) * 10) * modifiers.explosionRadiusMultiplier

    // Add building/character bonuses for additional projectiles
    const projectileCount = 1 + (modifiers.projectileCount || 0)
    const spacing = 40 // Wider spacing for trap zones

    if (projectileCount === 1) {
      this.projectileGroup.fireProjectile(
        x, y, damage, pierce, 0, 0,
        this.config.icon, this.config.color,
        ProjectileType.EARTH_ZONE,
        { zoneDuration, zoneRadius }
      )
    } else {
      const totalWidth = (projectileCount - 1) * spacing
      const startX = x - totalWidth / 2

      for (let i = 0; i < projectileCount; i++) {
        this.projectileGroup.fireProjectile(
          startX + i * spacing, y, damage, pierce, 0, 0,
          this.config.icon, this.config.color,
          ProjectileType.EARTH_ZONE,
          { zoneDuration, zoneRadius }
        )
      }
    }
  }
}

// Sniper Rifle Implementation (Placeholder)
export class SniperRifleWeapon extends Weapon {
  fire(x: number, y: number, modifiers: WeaponModifiers): void {
    soundManager.playWeaponSound(this.config.name)
    const damage = this.getDamage() * modifiers.damageMultiplier
    const pierce = 5 + this.level // High pierce

    // Apply projectile speed multiplier
    const speed = -1500 * modifiers.projectileSpeedMultiplier

    // Add building/character bonuses for additional projectiles
    const projectileCount = 1 + (modifiers.projectileCount || 0)
    const spacing = 25

    if (projectileCount === 1) {
      this.projectileGroup.fireProjectile(
        x, y, damage, pierce, 0, speed,
        this.config.icon, this.config.color,
        undefined,
        { fontSize: '20px' }
      )
    } else {
      const totalWidth = (projectileCount - 1) * spacing
      const startX = x - totalWidth / 2

      for (let i = 0; i < projectileCount; i++) {
        this.projectileGroup.fireProjectile(
          startX + i * spacing, y, damage, pierce, 0, speed,
          this.config.icon, this.config.color,
          undefined,
          { fontSize: '20px' }
        )
      }
    }
  }
}

// Weapon Factory
export class WeaponFactory {
  static create(scene: Phaser.Scene, type: WeaponType, projectileGroup: ProjectileGroup): Weapon {
    switch (type) {
      case WeaponType.CANNON:
        return new CannonWeapon(scene, type, projectileGroup)
      case WeaponType.SHOTGUN:
        return new ShotgunWeapon(scene, type, projectileGroup)
      case WeaponType.LIGHTNING:
        return new LightningWeapon(scene, type, projectileGroup)
      case WeaponType.FIRE:
        return new FireWeapon(scene, type, projectileGroup)
      case WeaponType.GUN_BUDDY:
        return new GunBuddyWeapon(scene, type, projectileGroup)
      case WeaponType.ICE:
        return new IceWeapon(scene, type, projectileGroup)
      case WeaponType.WATER:
        return new WaterWeapon(scene, type, projectileGroup)
      case WeaponType.EARTH:
        return new EarthWeapon(scene, type, projectileGroup)
      case WeaponType.DARK:
        return new DarkWeapon(scene, type, projectileGroup)
      case WeaponType.LASER_BEAM:
        return new LaserBeamWeapon(scene, type, projectileGroup)
      case WeaponType.RICOCHET_DISK:
        return new RicochetDiskWeapon(scene, type, projectileGroup)
      case WeaponType.MISSILE_POD:
        return new MissilePodWeapon(scene, type, projectileGroup)
      case WeaponType.FIREBALL_RING:
        return new FireballRingWeapon(scene, type, projectileGroup)
      case WeaponType.BLOOD_LANCE:
        return new BloodLanceWeapon(scene, type, projectileGroup)
      case WeaponType.PLASMA_AURA:
        return new PlasmaAuraWeapon(scene, type, projectileGroup)
      case WeaponType.VORTEX_BLADE:
        return new VortexBladeWeapon(scene, type, projectileGroup)
      case WeaponType.ORBITAL_STRIKE:
        return new OrbitalStrikeWeapon(scene, type, projectileGroup)
      case WeaponType.MINIGUN:
        return new MinigunWeapon(scene, type, projectileGroup)
      case WeaponType.TRAP_LAYER:
        return new TrapLayerWeapon(scene, type, projectileGroup)
      case WeaponType.SNIPER_RIFLE:
        return new SniperRifleWeapon(scene, type, projectileGroup)
      default:
        // Default to cannon for unimplemented weapons
        return new CannonWeapon(scene, WeaponType.CANNON, projectileGroup)
    }
  }
}
