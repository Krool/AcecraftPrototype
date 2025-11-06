import Phaser from 'phaser'
import { ProjectileGroup } from './Projectile'

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
    baseDamage: 10,
    baseFireRate: 250,
    description: 'Basic pellets fired upward',
    maxLevel: 3,
    icon: '|',
    color: '#ffff00',
  },
  [WeaponType.SHOTGUN]: {
    name: 'Shotgun',
    type: WeaponType.SHOTGUN,
    damageType: DamageType.PHYSICAL,
    baseDamage: 8,
    baseFireRate: 500,
    description: 'Wide spread, slow fire rate',
    maxLevel: 3,
    icon: '╪',
    color: '#ff8800',
  },
  [WeaponType.LIGHTNING]: {
    name: 'Lightning',
    type: WeaponType.LIGHTNING,
    damageType: DamageType.NATURE,
    baseDamage: 12,
    baseFireRate: 400,
    description: 'Chain lightning between enemies',
    maxLevel: 3,
    icon: '⚡',
    color: '#00ffff',
  },
  [WeaponType.FIRE]: {
    name: 'Fire',
    type: WeaponType.FIRE,
    damageType: DamageType.FIRE,
    baseDamage: 15,
    baseFireRate: 600,
    description: 'Explodes on contact (AOE)',
    maxLevel: 3,
    icon: '※',
    color: '#ff4400',
  },
  [WeaponType.GUN_BUDDY]: {
    name: 'Gun Buddy',
    type: WeaponType.GUN_BUDDY,
    damageType: DamageType.PHYSICAL,
    baseDamage: 6,
    baseFireRate: 300,
    description: 'Floating ally that shoots',
    maxLevel: 3,
    icon: '◉',
    color: '#88ff00',
  },
  [WeaponType.ICE]: {
    name: 'Ice',
    type: WeaponType.ICE,
    damageType: DamageType.COLD,
    baseDamage: 10,
    baseFireRate: 350,
    description: 'Freezes and slows enemies',
    maxLevel: 3,
    icon: '❄',
    color: '#aaffff',
  },
  [WeaponType.WATER]: {
    name: 'Water',
    type: WeaponType.WATER,
    damageType: DamageType.COLD,
    baseDamage: 11,
    baseFireRate: 450,
    description: 'Wave pattern movement',
    maxLevel: 3,
    icon: '≈',
    color: '#00aaff',
  },
  [WeaponType.EARTH]: {
    name: 'Earth',
    type: WeaponType.EARTH,
    damageType: DamageType.NATURE,
    baseDamage: 14,
    baseFireRate: 700,
    description: 'Persistent damage zone',
    maxLevel: 3,
    icon: '▓',
    color: '#884400',
  },
  [WeaponType.DARK]: {
    name: 'Dark',
    type: WeaponType.DARK,
    damageType: DamageType.CONTROL,
    baseDamage: 20,
    baseFireRate: 1500,
    description: 'Converts enemies to allies',
    maxLevel: 3,
    icon: '●',
    color: '#8800ff',
  },
  [WeaponType.LASER_BEAM]: {
    name: 'Laser Beam',
    type: WeaponType.LASER_BEAM,
    damageType: DamageType.FIRE,
    baseDamage: 5,
    baseFireRate: 50,
    description: 'Sustained beam, overheats',
    maxLevel: 3,
    icon: '━',
    color: '#ff0000',
  },
  [WeaponType.RICOCHET_DISK]: {
    name: 'Ricochet Disk',
    type: WeaponType.RICOCHET_DISK,
    damageType: DamageType.PHYSICAL,
    baseDamage: 13,
    baseFireRate: 400,
    description: 'Bounces off screen edges',
    maxLevel: 3,
    icon: '◇',
    color: '#ffaa00',
  },
  [WeaponType.MISSILE_POD]: {
    name: 'Missile Pod',
    type: WeaponType.MISSILE_POD,
    damageType: DamageType.PHYSICAL,
    baseDamage: 18,
    baseFireRate: 800,
    description: 'Seeking rockets with splash',
    maxLevel: 3,
    icon: '▲',
    color: '#ff6600',
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

  canFire(currentTime: number): boolean {
    const fireRate = this.getFireRate()
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
    // Base damage + level scaling (20% per level)
    return Math.floor(this.config.baseDamage * (1 + (this.level - 1) * 0.2))
  }

  getFireRate(): number {
    // Fire rate improves with level (10% faster per level)
    return Math.floor(this.config.baseFireRate * (1 - (this.level - 1) * 0.1))
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
}

export const DEFAULT_MODIFIERS: WeaponModifiers = {
  damageMultiplier: 1.0,
  fireRateMultiplier: 1.0,
  pierceCount: 0,
  projectileSpeedMultiplier: 1.0,
  projectileSizeMultiplier: 1.0,
  critChance: 0,
  critDamage: 1.5,
}

// Cannon Implementation
export class CannonWeapon extends Weapon {
  fire(x: number, y: number, modifiers: WeaponModifiers): void {
    const damage = this.getDamage() * modifiers.damageMultiplier
    const pierce = modifiers.pierceCount

    // More projectiles at higher levels
    const projectileCount = this.level
    const spacing = 15

    if (projectileCount === 1) {
      this.projectileGroup.fireProjectile(x, y, damage, pierce, 0, -500, this.config.icon, this.config.color)
    } else {
      const totalWidth = (projectileCount - 1) * spacing
      const startX = x - totalWidth / 2

      for (let i = 0; i < projectileCount; i++) {
        this.projectileGroup.fireProjectile(startX + i * spacing, y, damage, pierce, 0, -500, this.config.icon, this.config.color)
      }
    }
  }
}

// Shotgun Implementation
export class ShotgunWeapon extends Weapon {
  fire(x: number, y: number, modifiers: WeaponModifiers): void {
    const damage = this.getDamage() * modifiers.damageMultiplier
    const pierce = modifiers.pierceCount

    // More pellets and tighter spread at higher levels
    const pelletCount = 3 + this.level * 2
    const spreadAngle = 60 - (this.level - 1) * 10 // Tighter spread at higher levels

    this.projectileGroup.fireSpread(x, y, damage, pierce, pelletCount, spreadAngle, this.config.icon, this.config.color)
  }
}

// Lightning Implementation
export class LightningWeapon extends Weapon {
  fire(x: number, y: number, modifiers: WeaponModifiers): void {
    const damage = this.getDamage() * modifiers.damageMultiplier

    // Lightning is special - create a chain effect
    // For now, fire a projectile that will chain (future: implement actual chaining)
    const pierce = 2 + this.level // Lightning chains through enemies

    this.projectileGroup.fireProjectile(x, y, damage, pierce, 0, -500, this.config.icon, this.config.color)
  }
}

// Fire Implementation
export class FireWeapon extends Weapon {
  fire(x: number, y: number, modifiers: WeaponModifiers): void {
    const damage = this.getDamage() * modifiers.damageMultiplier

    // Fire creates explosions - represented by larger, slower projectiles
    const pierce = 0 // Fire explodes on first hit
    const speed = -400 // Slower than normal

    // More projectiles at higher levels
    const count = this.level
    if (count === 1) {
      this.projectileGroup.fireProjectile(x, y, damage, pierce, 0, speed, this.config.icon, this.config.color)
    } else {
      const spacing = 20
      const totalWidth = (count - 1) * spacing
      const startX = x - totalWidth / 2

      for (let i = 0; i < count; i++) {
        this.projectileGroup.fireProjectile(startX + i * spacing, y, damage, pierce, 0, speed, this.config.icon, this.config.color)
      }
    }
  }
}

// Gun Buddy Implementation
export class GunBuddyWeapon extends Weapon {
  fire(x: number, y: number, modifiers: WeaponModifiers): void {
    const damage = this.getDamage() * modifiers.damageMultiplier
    const pierce = modifiers.pierceCount

    // Gun buddies fire from offset positions (orbiting player)
    const buddyCount = this.level
    const angleStep = (Math.PI * 2) / buddyCount

    for (let i = 0; i < buddyCount; i++) {
      const angle = angleStep * i
      const offsetX = Math.cos(angle) * 40
      const offsetY = Math.sin(angle) * 40

      this.projectileGroup.fireProjectile(
        x + offsetX,
        y + offsetY,
        damage,
        pierce,
        0,
        -500,
        this.config.icon,
        this.config.color
      )
    }
  }
}

// Ice Implementation
export class IceWeapon extends Weapon {
  fire(x: number, y: number, modifiers: WeaponModifiers): void {
    const damage = this.getDamage() * modifiers.damageMultiplier
    const pierce = 1 + this.level // Ice pierces and slows

    // Fire ice lances
    const count = this.level
    if (count === 1) {
      this.projectileGroup.fireProjectile(x, y, damage, pierce, 0, -500, this.config.icon, this.config.color)
    } else {
      const spacing = 20
      const totalWidth = (count - 1) * spacing
      const startX = x - totalWidth / 2

      for (let i = 0; i < count; i++) {
        this.projectileGroup.fireProjectile(startX + i * spacing, y, damage, pierce, 0, -500, this.config.icon, this.config.color)
      }
    }
  }
}

// Water Implementation
export class WaterWeapon extends Weapon {
  fire(x: number, y: number, modifiers: WeaponModifiers): void {
    const damage = this.getDamage() * modifiers.damageMultiplier
    const pierce = modifiers.pierceCount

    // Water creates wave pattern - fire projectiles with horizontal spread
    const waveCount = 3 + this.level
    const waveSpread = 30

    for (let i = 0; i < waveCount; i++) {
      const offset = (i - Math.floor(waveCount / 2)) * waveSpread
      this.projectileGroup.fireProjectile(x + offset, y, damage, pierce, 0, -500, this.config.icon, this.config.color)
    }
  }
}

// Earth Implementation
export class EarthWeapon extends Weapon {
  fire(x: number, y: number, modifiers: WeaponModifiers): void {
    const damage = this.getDamage() * modifiers.damageMultiplier
    const pierce = 0 // Earth creates zones, doesn't pierce

    // Fire slow, large projectiles that create damage zones
    const count = this.level
    const speed = -300 // Slower than normal

    if (count === 1) {
      this.projectileGroup.fireProjectile(x, y, damage, pierce, 0, speed, this.config.icon, this.config.color)
    } else {
      const spacing = 30
      const totalWidth = (count - 1) * spacing
      const startX = x - totalWidth / 2

      for (let i = 0; i < count; i++) {
        this.projectileGroup.fireProjectile(startX + i * spacing, y, damage, pierce, 0, speed, this.config.icon, this.config.color)
      }
    }
  }
}

// Dark Implementation
export class DarkWeapon extends Weapon {
  fire(x: number, y: number, modifiers: WeaponModifiers): void {
    const damage = this.getDamage() * modifiers.damageMultiplier
    const pierce = modifiers.pierceCount

    // Dark fires powerful single projectiles
    const count = this.level
    const speed = -350

    if (count === 1) {
      this.projectileGroup.fireProjectile(x, y, damage, pierce, 0, speed, this.config.icon, this.config.color)
    } else {
      const spacing = 25
      const totalWidth = (count - 1) * spacing
      const startX = x - totalWidth / 2

      for (let i = 0; i < count; i++) {
        this.projectileGroup.fireProjectile(startX + i * spacing, y, damage, pierce, 0, speed, this.config.icon, this.config.color)
      }
    }
  }
}

// Laser Beam Implementation
export class LaserBeamWeapon extends Weapon {
  fire(x: number, y: number, modifiers: WeaponModifiers): void {
    const damage = this.getDamage() * modifiers.damageMultiplier
    const pierce = 10 // Laser pierces many enemies

    // Rapid fire laser beams
    const beamCount = this.level
    const speed = -800 // Very fast

    if (beamCount === 1) {
      this.projectileGroup.fireProjectile(x, y, damage, pierce, 0, speed, this.config.icon, this.config.color)
    } else {
      const spacing = 10
      const totalWidth = (beamCount - 1) * spacing
      const startX = x - totalWidth / 2

      for (let i = 0; i < beamCount; i++) {
        this.projectileGroup.fireProjectile(startX + i * spacing, y, damage, pierce, 0, speed, this.config.icon, this.config.color)
      }
    }
  }
}

// Ricochet Disk Implementation
export class RicochetDiskWeapon extends Weapon {
  fire(x: number, y: number, modifiers: WeaponModifiers): void {
    const damage = this.getDamage() * modifiers.damageMultiplier
    const pierce = 3 + this.level // Disks hit multiple times

    // Fire disks that will bounce (bouncing handled elsewhere)
    const diskCount = this.level
    const speed = -450

    if (diskCount === 1) {
      this.projectileGroup.fireProjectile(x, y, damage, pierce, 0, speed, this.config.icon, this.config.color)
    } else {
      const spacing = 20
      const totalWidth = (diskCount - 1) * spacing
      const startX = x - totalWidth / 2

      for (let i = 0; i < diskCount; i++) {
        this.projectileGroup.fireProjectile(startX + i * spacing, y, damage, pierce, 0, speed, this.config.icon, this.config.color)
      }
    }
  }
}

// Missile Pod Implementation
export class MissilePodWeapon extends Weapon {
  fire(x: number, y: number, modifiers: WeaponModifiers): void {
    const damage = this.getDamage() * modifiers.damageMultiplier
    const pierce = 0 // Missiles explode on impact

    // Fire missiles in a salvo
    const missileCount = 2 + this.level
    const speed = -350
    const spacing = 25

    const totalWidth = (missileCount - 1) * spacing
    const startX = x - totalWidth / 2

    for (let i = 0; i < missileCount; i++) {
      this.projectileGroup.fireProjectile(startX + i * spacing, y, damage, pierce, 0, speed)
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
      default:
        // Default to cannon for unimplemented weapons
        return new CannonWeapon(scene, WeaponType.CANNON, projectileGroup)
    }
  }
}
