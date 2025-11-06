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
    baseDamage: 10,
    baseFireRate: 325, // Reduced by 30% (was 250)
    description: 'Basic pellets fired upward',
    maxLevel: 3,
    icon: '|',
    color: '#ffff00',
  },
  [WeaponType.SHOTGUN]: {
    name: 'Shotgun',
    type: WeaponType.SHOTGUN,
    damageType: DamageType.PHYSICAL,
    baseDamage: 5,
    baseFireRate: 650, // Reduced by 30% (was 500)
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
    baseFireRate: 520, // Reduced by 30% (was 400)
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
    baseFireRate: 780, // Reduced by 30% (was 600)
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
    baseFireRate: 390, // Reduced by 30% (was 300)
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
    baseFireRate: 455, // Reduced by 30% (was 350)
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
    baseFireRate: 585, // Reduced by 30% (was 450)
    description: 'Oscillating wave projectiles',
    maxLevel: 3,
    icon: '≈',
    color: '#00aaff',
  },
  [WeaponType.EARTH]: {
    name: 'Earth',
    type: WeaponType.EARTH,
    damageType: DamageType.NATURE,
    baseDamage: 14,
    baseFireRate: 910, // Reduced by 30% (was 700)
    description: 'Persistent damage zone',
    maxLevel: 3,
    icon: '▓',
    color: '#884400',
  },
  [WeaponType.DARK]: {
    name: 'Dark',
    type: WeaponType.DARK,
    damageType: DamageType.CONTROL,
    baseDamage: 25,
    baseFireRate: 1560, // Reduced by 30% (was 1200)
    description: 'Powerful slow projectiles',
    maxLevel: 3,
    icon: '●',
    color: '#8800ff',
  },
  [WeaponType.LASER_BEAM]: {
    name: 'Laser Beam',
    type: WeaponType.LASER_BEAM,
    damageType: DamageType.FIRE,
    baseDamage: 5,
    baseFireRate: 195, // Reduced by 30% (was 150)
    description: 'Burst fire beam, overheats',
    maxLevel: 3,
    icon: '━',
    color: '#ff0000',
  },
  [WeaponType.RICOCHET_DISK]: {
    name: 'Ricochet Disk',
    type: WeaponType.RICOCHET_DISK,
    damageType: DamageType.PHYSICAL,
    baseDamage: 13,
    baseFireRate: 520, // Reduced by 30% (was 400)
    description: 'Bounces off edges and enemies',
    maxLevel: 3,
    icon: '◇',
    color: '#ffaa00',
  },
  [WeaponType.MISSILE_POD]: {
    name: 'Missile Pod',
    type: WeaponType.MISSILE_POD,
    damageType: DamageType.PHYSICAL,
    baseDamage: 9,
    baseFireRate: 1040, // Reduced by 30% (was 800)
    description: 'Seeking rockets with splash',
    maxLevel: 3,
    icon: '▲',
    color: '#ff6600',
  },
  [WeaponType.FIREBALL_RING]: {
    name: 'Fireball Ring',
    type: WeaponType.FIREBALL_RING,
    damageType: DamageType.FIRE,
    baseDamage: 15,
    baseFireRate: 1300, // Reduced by 30% (was 1000)
    description: 'Rotating fireballs orbit around you',
    maxLevel: 3,
    icon: '◉',
    color: '#ff4400',
  },
  [WeaponType.BLOOD_LANCE]: {
    name: 'Blood Lance',
    type: WeaponType.BLOOD_LANCE,
    damageType: DamageType.PHYSICAL,
    baseDamage: 8,
    baseFireRate: 390, // Reduced by 30% (was 300)
    description: 'Ricochet weapon that applies bleed',
    maxLevel: 3,
    icon: '╬',
    color: '#cc0000',
  },
  [WeaponType.PLASMA_AURA]: {
    name: 'Plasma Aura',
    type: WeaponType.PLASMA_AURA,
    damageType: DamageType.FIRE,
    baseDamage: 5,
    baseFireRate: 800, // Slowed down significantly (fires 12-20 projectiles per shot)
    description: 'Constant AOE damage around you',
    maxLevel: 3,
    icon: '⊛',
    color: '#ff00ff',
  },
  [WeaponType.VORTEX_BLADE]: {
    name: 'Vortex Blade',
    type: WeaponType.VORTEX_BLADE,
    damageType: DamageType.PHYSICAL,
    baseDamage: 12,
    baseFireRate: 650, // Reduced by 30% (was 500)
    description: 'Spiraling projectiles expand outward',
    maxLevel: 3,
    icon: '◈',
    color: '#00ffff',
  },
  [WeaponType.ORBITAL_STRIKE]: {
    name: 'Orbital Strike',
    type: WeaponType.ORBITAL_STRIKE,
    damageType: DamageType.FIRE,
    baseDamage: 3,
    baseFireRate: 1040, // Reduced by 30% (was 800)
    description: 'Row of explosions across screen top',
    maxLevel: 3,
    icon: '▼',
    color: '#ff8800',
  },
  [WeaponType.MINIGUN]: {
    name: 'Minigun',
    type: WeaponType.MINIGUN,
    damageType: DamageType.PHYSICAL,
    baseDamage: 2,
    baseFireRate: 65, // Reduced by 30% (was 50)
    description: 'Rapid-fire low-damage bullets',
    maxLevel: 3,
    icon: '▪',
    color: '#ffff00',
  },
  [WeaponType.TRAP_LAYER]: {
    name: 'Trap Layer',
    type: WeaponType.TRAP_LAYER,
    damageType: DamageType.NATURE,
    baseDamage: 25,
    baseFireRate: 1950, // Reduced by 30% (was 1500)
    description: 'Creates damage traps at your location',
    maxLevel: 3,
    icon: '✻',
    color: '#88ff00',
  },
  [WeaponType.SNIPER_RIFLE]: {
    name: 'Sniper Rifle',
    type: WeaponType.SNIPER_RIFLE,
    damageType: DamageType.PHYSICAL,
    baseDamage: 50,
    baseFireRate: 2600, // Reduced by 30% (was 2000)
    description: 'High damage shots at nearest enemy',
    maxLevel: 3,
    icon: '═',
    color: '#00aaff',
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
    // Base damage + level scaling (20% per level)
    return Math.floor(this.config.baseDamage * (1 + (this.level - 1) * 0.2))
  }

  getFireRate(modifiers: WeaponModifiers = DEFAULT_MODIFIERS): number {
    // Fire rate improves with level (10% faster per level)
    const baseRate = this.config.baseFireRate * (1 - (this.level - 1) * 0.1)
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
    soundManager.playWeaponSound(this.config.name)
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
    soundManager.playWeaponSound(this.config.name)
    const damage = this.getDamage() * modifiers.damageMultiplier
    const pierce = modifiers.pierceCount

    // More pellets and tighter spread at higher levels
    const pelletCount = 3 + this.level
    const spreadAngle = 60 - (this.level - 1) * 10 // Tighter spread at higher levels

    this.projectileGroup.fireSpread(x, y, damage, pierce, pelletCount, spreadAngle, this.config.icon, this.config.color, '14px')
  }
}

// Lightning Implementation
export class LightningWeapon extends Weapon {
  fire(x: number, y: number, modifiers: WeaponModifiers): void {
    soundManager.playWeaponSound(this.config.name)
    const damage = this.getDamage() * modifiers.damageMultiplier
    const pierce = 0 // Lightning doesn't pierce, it chains

    // Lightning chains increase with level (1 chain at level 1, 2 at level 2, 3 at level 3)
    const chainCount = this.level

    this.projectileGroup.fireProjectile(
      x, y, damage, pierce, 0, -500,
      this.config.icon, this.config.color,
      ProjectileType.CHAINING,
      { chainCount }
    )
  }
}

// Fire Implementation
export class FireWeapon extends Weapon {
  fire(x: number, y: number, modifiers: WeaponModifiers): void {
    soundManager.playWeaponSound(this.config.name)
    const damage = this.getDamage() * modifiers.damageMultiplier

    // Fire creates explosions - represented by larger, slower projectiles
    const pierce = 0 // Fire explodes on first hit
    const speed = -400 // Slower than normal

    // Explosion radius increases with level
    const explosionRadius = 60 + (this.level * 20)

    // More projectiles at higher levels
    const count = this.level
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
    soundManager.playWeaponSound(this.config.name)
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
    soundManager.playWeaponSound(this.config.name)
    const damage = this.getDamage() * modifiers.damageMultiplier
    const pierce = this.level // Ice pierces and slows

    // Freeze chance increases with level (30% base + 20% per level)
    const freezeChance = 30 + (this.level * 20)
    const freezeDuration = 2000 // 2 seconds

    // Fire ice lances
    const count = this.level
    if (count === 1) {
      this.projectileGroup.fireProjectile(
        x, y, damage, pierce, 0, -500,
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
          startX + i * spacing, y, damage, pierce, 0, -500,
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

    // Water creates wave pattern - projectiles oscillate left/right
    const waveCount = this.level
    const waveSpread = 25

    // Wave parameters - more amplitude and frequency at higher levels
    const waveAmplitude = 40 + (this.level * 10)
    const waveFrequency = 0.015 + (this.level * 0.005)

    if (waveCount === 1) {
      this.projectileGroup.fireProjectile(
        x, y, damage, pierce, 0, -500,
        this.config.icon, this.config.color,
        ProjectileType.WAVE,
        { waveAmplitude, waveFrequency }
      )
    } else {
      const totalWidth = (waveCount - 1) * waveSpread
      const startX = x - totalWidth / 2

      for (let i = 0; i < waveCount; i++) {
        // Offset the phase of each wave slightly for visual variety
        const wavePhase = i * Math.PI / 3
        this.projectileGroup.fireProjectile(
          startX + i * waveSpread, y, damage, pierce, 0, -500,
          this.config.icon, this.config.color,
          ProjectileType.WAVE,
          { waveAmplitude, waveFrequency, wavePhase }
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

    // Fire slow, large projectiles that create damage zones
    const count = this.level
    const speed = -300 // Slower than normal

    // Zone parameters scale with level
    const zoneDuration = 3000 + (this.level * 1000) // 4-6 seconds
    const zoneRadius = 50 + (this.level * 10) // 60-80 pixel radius

    if (count === 1) {
      this.projectileGroup.fireProjectile(
        x, y, damage, pierce, 0, speed,
        this.config.icon, this.config.color,
        ProjectileType.EARTH_ZONE,
        { zoneDuration, zoneRadius }
      )
    } else {
      const spacing = 30
      const totalWidth = (count - 1) * spacing
      const startX = x - totalWidth / 2

      for (let i = 0; i < count; i++) {
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

    // Dark fires powerful single projectiles
    const count = this.level
    const speed = -350

    if (count === 1) {
      this.projectileGroup.fireProjectile(
        x, y, damage, pierce, 0, speed,
        this.config.icon, this.config.color,
        undefined,
        { fontSize: '27px' }
      )
    } else {
      const spacing = 25
      const totalWidth = (count - 1) * spacing
      const startX = x - totalWidth / 2

      for (let i = 0; i < count; i++) {
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

    // Fire disks that bounce off screen edges
    const diskCount = this.level
    const speed = -450
    const bounceCount = 3 + this.level // More bounces at higher levels

    if (diskCount === 1) {
      this.projectileGroup.fireProjectile(
        x, y, damage, pierce, 0, speed,
        this.config.icon, this.config.color,
        ProjectileType.BOUNCING,
        { bounceCount }
      )
    } else {
      const spacing = 20
      const totalWidth = (diskCount - 1) * spacing
      const startX = x - totalWidth / 2

      for (let i = 0; i < diskCount; i++) {
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

    // Fire missiles in a salvo
    const missileCount = 2 + this.level
    const speed = 350 // Starting speed
    const spacing = 25

    const totalWidth = (missileCount - 1) * spacing
    const startX = x - totalWidth / 2

    // Missiles should explode on impact and home in on enemies
    const explosionRadius = 50 + (this.level * 15)
    const homingTurnRate = 0.05 // Slow turning rate (radians per frame)
    const homingSpeed = 350

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

    // Rotate fireballs around player
    const fireballCount = this.level
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
        { explosionRadius: 40 }
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

    const lanceCount = this.level
    const speed = -500
    const bounceCount = 5 + (this.level * 2) // Many more bounces

    if (lanceCount === 1) {
      this.projectileGroup.fireProjectile(
        x, y, damage, pierce, 0, speed,
        this.config.icon, this.config.color,
        ProjectileType.BOUNCING,
        { bounceCount }
      )
    } else {
      const spacing = 15
      const totalWidth = (lanceCount - 1) * spacing
      const startX = x - totalWidth / 2

      for (let i = 0; i < lanceCount; i++) {
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

    // Create expanding ring of projectiles around player
    const projectileCount = 8 + (this.level * 4)
    const radius = 60 + (this.level * 20)
    const angleStep = (Math.PI * 2) / projectileCount

    for (let i = 0; i < projectileCount; i++) {
      const angle = angleStep * i
      const velocityX = Math.cos(angle) * 200
      const velocityY = Math.sin(angle) * 200

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

    // Fire projectiles in spiral pattern
    const bladeCount = 2 + this.level
    const angleStep = (Math.PI * 2) / bladeCount

    for (let i = 0; i < bladeCount; i++) {
      const angle = this.spiralAngle + (angleStep * i)
      const velocityX = Math.cos(angle) * 400
      const velocityY = Math.sin(angle) * 400 - 200 // Bias upward

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

    // Create row of explosions at top of screen
    const explosionCount = 3 + (this.level * 2)
    const screenWidth = this.scene.cameras.main.width
    const spacing = screenWidth / (explosionCount + 1)
    const explosionRadius = 50 + (this.level * 10)

    for (let i = 1; i <= explosionCount; i++) {
      const strikeX = spacing * i
      const strikeY = 50

      this.projectileGroup.fireProjectile(
        strikeX, strikeY, damage, pierce, 0, 300,
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

    // Fire rapid bullets with slight spread
    const bulletCount = this.level
    const spread = 30 // Slight inaccuracy

    for (let i = 0; i < bulletCount; i++) {
      const spreadAngle = (Math.random() - 0.5) * spread * (Math.PI / 180)
      const velocityX = Math.sin(spreadAngle) * 500
      const velocityY = Math.cos(spreadAngle) * -600

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

    // Create stationary damage zone at player location
    const zoneCount = this.level
    const zoneDuration = 5000 + (this.level * 2000)
    const zoneRadius = 60 + (this.level * 20)

    if (zoneCount === 1) {
      this.projectileGroup.fireProjectile(
        x, y, damage, pierce, 0, 0,
        this.config.icon, this.config.color,
        ProjectileType.EARTH_ZONE,
        { zoneDuration, zoneRadius }
      )
    } else {
      const spacing = 40
      const totalWidth = (zoneCount - 1) * spacing
      const startX = x - totalWidth / 2

      for (let i = 0; i < zoneCount; i++) {
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

    // Fire powerful single shot with trail effect
    const shotCount = this.level
    const speed = -900 // Very fast

    if (shotCount === 1) {
      this.projectileGroup.fireProjectile(
        x, y, damage, pierce, 0, speed,
        this.config.icon, this.config.color,
        undefined,
        { fontSize: '20px' }
      )
    } else {
      const spacing = 25
      const totalWidth = (shotCount - 1) * spacing
      const startX = x - totalWidth / 2

      for (let i = 0; i < shotCount; i++) {
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
