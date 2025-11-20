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
  detailedDescription?: string // Optional detailed description for info page
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
    detailedDescription: 'Your starter weapon that fires straightforward kinetic projectiles. Reliable and consistent damage with balanced fire rate. Level 1: 1 projectile, 7 damage. Level 2: 1 projectile, 12 damage. Level 3: 2 projectiles, 7 damage each (14 total). Pairs perfectly with Ballistics passive for increased damage, evolving into Railstorm Gatling at max level.',
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
    detailedDescription: 'Fires a wide arc of pellets covering approximately one-third of the screen. Lower individual projectile damage but excellent area coverage. Level 1: 3 pellets, 60° spread. Level 2: 4 pellets, 50° spread. Level 3: 5 pellets, 40° spread. Evolves with Weapon Speed Up into Auto Scatter for continuous full-screen coverage.',
    maxLevel: 3,
    icon: '╪',
    color: '#ffff00', // Yellow for PHYSICAL
  },
  [WeaponType.LIGHTNING]: {
    name: 'Lightning',
    type: WeaponType.LIGHTNING,
    damageType: DamageType.NATURE,
    baseDamage: 6,
    baseFireRate: 450, // Balanced for ~71 DPS at level 3 (with 6 chains)
    description: 'Chain lightning between enemies',
    detailedDescription: 'Arcing electricity jumps between nearby enemies, dealing damage to multiple targets per shot. Effectiveness scales with enemy density. Level 1: Chains 2 times (hits 3 enemies). Level 2: Chains 4 times (hits 5 enemies). Level 3: Chains 6 times (hits 7 enemies). Evolves with Critical Systems into Storm Nexus for infinite chaining and critical storm reactions.',
    maxLevel: 3,
    icon: '‡',
    color: '#00ff00', // Green for NATURE
  },
  [WeaponType.FIRE]: {
    name: 'Fire',
    type: WeaponType.FIRE,
    damageType: DamageType.FIRE,
    baseDamage: 15,
    baseFireRate: 836, // Reduced attack speed by 30% (585 → 836)
    description: 'Explodes on contact (AOE)',
    detailedDescription: 'Launches explosive fireballs that detonate on impact, dealing area damage to nearby enemies. High damage per shot but slower fire rate. Explosion radius increases with level. Combine with Critical Systems passive to evolve into Combustion Core, creating chain reaction explosions across the battlefield.',
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
    detailedDescription: 'Summons autonomous combat drones that orbit your ship and fire at enemies independently. Each buddy provides consistent DPS without requiring player aim. Level 1: 1 buddy. Level 2: 2 buddies. Level 3: 3 buddies. Combine with Drone Bay Expansion to evolve into Drone Swarm with 5 advanced units.',
    maxLevel: 3,
    icon: '⊕',
    color: '#ffff00', // Yellow for PHYSICAL
  },
  [WeaponType.ICE]: {
    name: 'Ice',
    type: WeaponType.ICE,
    damageType: DamageType.COLD,
    baseDamage: 10,
    baseFireRate: 341, // Reduced by 25% from 455 (faster fire rate)
    description: 'Freezes and slows enemies',
    detailedDescription: 'Fires cryogenic lances that pierce through enemies and have a chance to freeze targets solid. Frozen enemies are vulnerable to shatter effects. Level 1: 1 lance, 1 pierce, 30% freeze chance. Level 2: 1 lance, 2 pierce, 40% freeze chance. Level 3: 2 lances, 3 pierce, 50% freeze chance. Pair with Thruster Mod to create Cryo Lancer with high-velocity piercing lances.',
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
    detailedDescription: 'Fires undulating water projectiles that wave left and right as they travel upward, covering more horizontal area than straight shots. The wavelength creates unpredictable hit patterns. Pairs with Pickup Radius to evolve into Tidal Surge, creating screen-wide waves that pull enemies and resources toward you.',
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
    detailedDescription: 'Creates stationary damage zones at enemy locations that persist and deal continuous damage over time. Zones stack and last several seconds. Excellent for area denial and holding chokepoints. Evolves with Ship Armor into Tectonic Bloom, spreading fractal damage fields while you tank through enemy fire.',
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
    detailedDescription: 'Unleashes corrupted void energy orbs with high damage but very slow fire rate and projectile speed. Each shot packs tremendous punch. Works best against large, slow targets or when you need burst damage. Combine with Evasion Drive to create Shadow Legion, converting defeated enemies into permanent shadowy allies.',
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
    detailedDescription: 'Continuous beam weapon that fires in rapid bursts before overheating. Very high DPS during active periods but requires cooling between bursts. Beam width increases slightly with level. Pair with Energy Core to evolve into Solar Lance, expanding into a screen-wide annihilation ray without overheating.',
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
    detailedDescription: 'Throws spinning disks that bounce off screen edges and enemies, creating chaotic ricochet patterns. Each bounce can hit enemies again. Higher levels add more initial bounces. Evolves with Ballistics into Pinball Vortex, where disks multiply on each bounce to fill the screen with bouncing projectiles.',
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
    detailedDescription: 'Launches homing missiles that track the nearest enemy and explode on impact with splash damage. Slow but guaranteed hits make them reliable. Level 1: 2 missiles. Level 2: 3 missiles. Level 3: 4 missiles. Pair with Salvage Unit to create Nova Barrage, splitting missiles into cluster bombs that blanket the screen.',
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
    detailedDescription: 'Creates a protective ring of orbiting fireballs that damage enemies on contact. Excellent close-range defense. Level 1: 3 fireballs. Level 2: 5 fireballs. Level 3: 7 fireballs. Combine with Pyromaniac passive to evolve into Infernal Crown, creating massive superheated orbs that devastate burning enemies.',
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
    detailedDescription: 'Bio-engineered projectiles that bounce between enemies, spreading poison with each hit. Combines ricochet mechanics with damage-over-time. More bounces at higher levels mean more poison spread. Evolves with Hemorrhage passive into Crimson Reaper, creating bouncing lances that apply catastrophic stacking bleeds.',
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
    detailedDescription: 'Radiates pulsing waves of superheated plasma outward from your ship in expanding rings. Hits all enemies in radius. Perfect for aggressive close-range playstyles. Pulse count and radius increase with level. Pair with Vampiric Fire to create Supernova Ring, healing massive amounts while annihilating everything nearby.',
    maxLevel: 3,
    icon: '⊛',
    color: '#ff8800', // Orange for FIRE
  },
  [WeaponType.VORTEX_BLADE]: {
    name: 'Blizzard',
    type: WeaponType.VORTEX_BLADE,
    damageType: DamageType.COLD,
    baseDamage: 15, // Increased by 25% from 12
    baseFireRate: 488, // Reduced by 25% from 650 (faster fire rate)
    description: 'Spiraling ice projectiles expand outward',
    detailedDescription: 'Fires spiraling ice blades that expand outward in circular patterns, covering a wide radius around your ship. Each blade freezes on contact. More blades spawn at higher levels. Combine with Frost Haste to create Spiral Tempest, where frozen enemies trigger exponential fire rate scaling.',
    maxLevel: 3,
    icon: '◈',
    color: '#00aaff', // Blue for COLD
  },
  [WeaponType.ORBITAL_STRIKE]: {
    name: 'Orbital Strike',
    type: WeaponType.ORBITAL_STRIKE,
    damageType: DamageType.FIRE,
    baseDamage: 8,
    baseFireRate: 1200, // Reduced frequency to 1/3rd (was 400ms)
    description: 'Row of explosions across screen top',
    detailedDescription: 'Calls down devastating beam strikes from above in a horizontal line across the screen. Targets enemies from orbit with delayed but powerful impacts. More strike beams at higher levels. Pair with Static Fortune to evolve into Apocalypse Ray, ionizing credits from every enemy hit while raining divine judgment.',
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
    detailedDescription: 'Extremely high fire rate weapon that sprays a continuous stream of bullets. Individual shots deal low damage but the volume creates impressive sustained DPS. Slight spread increases with fire time. Evolves with Toxic Rounds into Storm Breaker, firing armor-piercing toxic bullets at devastating rate.',
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
    detailedDescription: 'Deploys explosive proximity mines at your current position that detonate when enemies approach. Strategic placement allows you to create defensive perimeters or funnel enemies into kill zones. More traps deployed per activation at higher levels. Combine with Shatter Strike to create Minefield that obliterates frozen targets.',
    maxLevel: 3,
    icon: '✻',
    color: '#00ff00', // Green for NATURE
  },
  [WeaponType.SNIPER_RIFLE]: {
    name: 'Sniper Rifle',
    type: WeaponType.SNIPER_RIFLE,
    damageType: DamageType.PHYSICAL,
    baseDamage: 50,
    baseFireRate: 2925, // Reduced fire rate to 2/3rds (was 1950ms)
    description: 'High damage shots at nearest enemy',
    detailedDescription: 'Precision weapon that automatically targets the nearest enemy with devastating high-damage shots. Very slow fire rate balanced by extreme single-target damage. Perfect for eliminating priority threats. Gains additional piercing at higher levels. Pair with Overdrive Reactor to create Void Piercer with reality-tearing shots that gain damage with distance.',
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
  missileCount?: number // Extra missiles per salvo (missile-specific)
  explosionRadiusMultiplier?: number // Multiplier for explosion radius
  additionalShots?: number // Fire weapon multiple times
  dotDurationMultiplier?: number // Duration multiplier for DoT effects
  homingEnabled?: boolean // Enable homing for projectiles
  projectileLifetimeMultiplier?: number // Lifetime multiplier for projectiles
  heatMultiplier?: number // Heat gain multiplier for heat-based weapons (lower = slower overheat)
}

export const DEFAULT_MODIFIERS: WeaponModifiers = {
  damageMultiplier: 1.0,
  fireRateMultiplier: 1.0,
  pierceCount: 0,
  projectileSpeedMultiplier: 1.0,
  projectileSizeMultiplier: 1.0,
  critChance: 5, // 5% base crit chance
  critDamage: 1.5,
  projectileCount: 0,
  missileCount: 0,
  explosionRadiusMultiplier: 1.0,
  additionalShots: 0,
  dotDurationMultiplier: 1.0,
  homingEnabled: false,
  projectileLifetimeMultiplier: 1.0,
}

// Cannon Implementation
export class CannonWeapon extends Weapon {
  // Custom damage scaling for balanced DPS progression
  getDamage(): number {
    // Level 1: 7 damage (20 DPS)
    // Level 2: 12 damage (36 DPS, +80%)
    // Level 3: 7 damage per projectile x2 = 14 total (44 DPS, +120%)
    const damageByLevel = [7, 12, 7]
    return damageByLevel[this.level - 1] || 7
  }

  fire(x: number, y: number, modifiers: WeaponModifiers): void {
    soundManager.playWeaponSound(this.config.name)
    const damage = this.getDamage() * modifiers.damageMultiplier
    const pierce = modifiers.pierceCount

    // Add 1 extra projectile only at max level, plus building/character bonuses
    const projectileCount = (this.level === 3 ? 2 : 1) + (modifiers.projectileCount || 0)
    const spacing = 15

    // Apply projectile speed multiplier
    const speed = -500 * modifiers.projectileSpeedMultiplier

    // Apply projectile size multiplier
    const baseSize = pierce > 0 ? 22 : 19
    const fontSize = `${Math.round(baseSize * modifiers.projectileSizeMultiplier)}px`

    if (projectileCount === 1) {
      this.projectileGroup.fireProjectile(x, y, damage, pierce, 0, speed, this.config.icon, this.config.color, undefined, { damageType: this.config.damageType, weaponName: this.config.name, fontSize })
    } else {
      const totalWidth = (projectileCount - 1) * spacing
      const startX = x - totalWidth / 2

      for (let i = 0; i < projectileCount; i++) {
        this.projectileGroup.fireProjectile(startX + i * spacing, y, damage, pierce, 0, speed, this.config.icon, this.config.color, undefined, { damageType: this.config.damageType, weaponName: this.config.name, fontSize })
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

    // Pellet count increases per level: 3 -> 4 -> 5, plus building/character bonuses
    const pelletCount = 3 + (this.level - 1) + (modifiers.projectileCount || 0)
    const spreadAngle = 60 - (this.level - 1) * 10 // Tighter spread at higher levels

    // Apply projectile speed multiplier
    const speed = 500 * modifiers.projectileSpeedMultiplier

    // Apply projectile size multiplier
    const baseSize = 14
    const fontSize = `${Math.round(baseSize * modifiers.projectileSizeMultiplier)}px`

    this.projectileGroup.fireSpread(x, y, damage, pierce, pelletCount, spreadAngle, this.config.icon, this.config.color, fontSize, speed)
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

    // Apply projectile size multiplier
    const baseSize = pierce > 0 ? 22 : 19
    const fontSize = `${Math.round(baseSize * modifiers.projectileSizeMultiplier)}px`

    if (projectileCount === 1) {
      this.projectileGroup.fireProjectile(
        x, y, damage, pierce, 0, speed,
        this.config.icon, this.config.color,
        ProjectileType.CHAINING,
        { chainCount, weaponName: this.config.name, fontSize, damageType: this.config.damageType }
      )
    } else {
      const totalWidth = (projectileCount - 1) * spacing
      const startX = x - totalWidth / 2

      for (let i = 0; i < projectileCount; i++) {
        this.projectileGroup.fireProjectile(
          startX + i * spacing, y, damage, pierce, 0, speed,
          this.config.icon, this.config.color,
          ProjectileType.CHAINING,
          { chainCount, weaponName: this.config.name, fontSize, damageType: this.config.damageType }
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

    // Explosion radius increases significantly with level (60 -> 80 -> 100)
    const explosionRadius = (60 + (this.level - 1) * 20) * modifiers.explosionRadiusMultiplier

    // Visual size scales with explosion radius and projectile size multiplier
    const baseSize = 27 + (this.level - 1) * 5 // 27px -> 32px -> 37px
    const fontSize = `${Math.round(baseSize * modifiers.projectileSizeMultiplier)}px`

    // No extra projectiles from leveling, only building/character bonuses
    const count = 1 + (modifiers.projectileCount || 0)
    if (count === 1) {
      this.projectileGroup.fireProjectile(
        x, y, damage, pierce, 0, speed,
        this.config.icon, this.config.color,
        ProjectileType.EXPLOSIVE,
        { explosionRadius, fontSize, weaponName: this.config.name, damageType: this.config.damageType }
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
          { explosionRadius, fontSize, weaponName: this.config.name, damageType: this.config.damageType }
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

    // Apply projectile size multiplier
    const baseSize = 31
    const fontSize = `${Math.round(baseSize * modifiers.projectileSizeMultiplier)}px`

    // Add 1 extra lance only at max level, plus building/character bonuses
    const count = (this.level === 3 ? 2 : 1) + (modifiers.projectileCount || 0)
    if (count === 1) {
      this.projectileGroup.fireProjectile(
        x, y, damage, pierce, 0, speed,
        this.config.icon, this.config.color,
        ProjectileType.FREEZING,
        { freezeChance, freezeDuration, fontSize, weaponName: this.config.name, damageType: this.config.damageType }
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
          { freezeChance, freezeDuration, fontSize, weaponName: this.config.name, damageType: this.config.damageType }
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

    // Apply projectile size multiplier
    const baseSize = pierce > 0 ? 22 : 19
    const fontSize = `${Math.round(baseSize * modifiers.projectileSizeMultiplier)}px`

    // Add building/character bonuses for additional projectiles
    const projectileCount = 1 + (modifiers.projectileCount || 0)
    const spacing = 20

    if (projectileCount === 1) {
      this.projectileGroup.fireProjectile(
        x, y, damage, pierce, 0, speed,
        this.config.icon, this.config.color,
        ProjectileType.WAVE,
        { waveAmplitude, waveFrequency, weaponName: this.config.name, fontSize, damageType: this.config.damageType }
      )
    } else {
      const totalWidth = (projectileCount - 1) * spacing
      const startX = x - totalWidth / 2

      for (let i = 0; i < projectileCount; i++) {
        this.projectileGroup.fireProjectile(
          startX + i * spacing, y, damage, pierce, 0, speed,
          this.config.icon, this.config.color,
          ProjectileType.WAVE,
          { waveAmplitude, waveFrequency, weaponName: this.config.name, fontSize, damageType: this.config.damageType }
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

    // Apply projectile size multiplier
    const baseSize = 19
    const fontSize = `${Math.round(baseSize * modifiers.projectileSizeMultiplier)}px`

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
        { zoneDuration, zoneRadius, weaponName: this.config.name, fontSize, damageType: this.config.damageType }
      )
    } else {
      const totalWidth = (projectileCount - 1) * spacing
      const startX = x - totalWidth / 2

      for (let i = 0; i < projectileCount; i++) {
        this.projectileGroup.fireProjectile(
          startX + i * spacing, y, damage, pierce, 0, speed,
          this.config.icon, this.config.color,
          ProjectileType.EARTH_ZONE,
          { zoneDuration, zoneRadius, weaponName: this.config.name, fontSize, damageType: this.config.damageType }
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

    // Apply projectile size multiplier
    const baseSize = 27
    const fontSize = `${Math.round(baseSize * modifiers.projectileSizeMultiplier)}px`

    // Add building/character bonuses for additional projectiles
    const projectileCount = 1 + (modifiers.projectileCount || 0)
    const spacing = 20

    if (projectileCount === 1) {
      this.projectileGroup.fireProjectile(
        x, y, damage, pierce, 0, speed,
        this.config.icon, this.config.color,
        undefined,
        { fontSize, weaponName: this.config.name, damageType: this.config.damageType }
      )
    } else {
      const totalWidth = (projectileCount - 1) * spacing
      const startX = x - totalWidth / 2

      for (let i = 0; i < projectileCount; i++) {
        this.projectileGroup.fireProjectile(
          startX + i * spacing, y, damage, pierce, 0, speed,
          this.config.icon, this.config.color,
          undefined,
          { fontSize, weaponName: this.config.name, damageType: this.config.damageType }
        )
      }
    }
  }
}

// Laser Beam Implementation
export class LaserBeamWeapon extends Weapon {
  private heat: number = 0
  private maxHeat: number = 100
  private heatPerShot: number = 5 // Heat gained per shot (overheats after ~3 seconds of continuous fire)
  private cooldownRate: number = 3 // Heat lost per 100ms when not firing
  private lastCooldownTime: number = 0
  private isOverheated: boolean = false
  private overheatCooldownDuration: number = 2000 // 2 seconds cooldown when overheated
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

    // Apply passive cooling only when weapon has been idle for 1 second
    const idleTime = 1000 // 1 second of not firing before cooling starts
    if (!this.isOverheated && currentTime >= this.lastFireTime + idleTime) {
      if (currentTime >= this.lastCooldownTime + 100) {
        this.heat = Math.max(0, this.heat - this.cooldownRate)
        this.lastCooldownTime = currentTime
      }
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
      color: this.config.color,
      weaponName: this.config.name,
      damageType: this.config.damageType
    })

    // Increase heat (apply heat multiplier from character/modifiers)
    const heatGain = this.heatPerShot * (modifiers.heatMultiplier ?? 1.0)
    this.heat += heatGain
    if (this.heat >= this.maxHeat && !this.isOverheated) {
      this.isOverheated = true
      this.overheatStartTime = this.scene.time.now // Use current time as overheat start
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

    // Apply projectile size multiplier
    const baseSize = 22 // Base size for piercing projectiles
    const fontSize = `${Math.round(baseSize * modifiers.projectileSizeMultiplier)}px`

    // Add building/character bonuses for additional projectiles
    const projectileCount = 1 + (modifiers.projectileCount || 0)
    const spacing = 20

    if (projectileCount === 1) {
      this.projectileGroup.fireProjectile(
        x, y, damage, pierce, 0, speed,
        this.config.icon, this.config.color,
        ProjectileType.BOUNCING,
        { bounceCount, weaponName: this.config.name, fontSize, damageType: this.config.damageType }
      )
    } else {
      const totalWidth = (projectileCount - 1) * spacing
      const startX = x - totalWidth / 2

      for (let i = 0; i < projectileCount; i++) {
        this.projectileGroup.fireProjectile(
          startX + i * spacing, y, damage, pierce, 0, speed,
          this.config.icon, this.config.color,
          ProjectileType.BOUNCING,
          { bounceCount, weaponName: this.config.name, fontSize, damageType: this.config.damageType }
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

    // Modest missile count increase with level, plus missile-specific bonuses
    const missileCount = 2 + Math.floor((this.level - 1) * 0.5) + (modifiers.missileCount || 0)

    // Apply projectile speed multiplier
    const speed = 350 * modifiers.projectileSpeedMultiplier
    const spacing = 25

    // Apply projectile size multiplier
    const baseSize = 14
    const fontSize = `${Math.round(baseSize * modifiers.projectileSizeMultiplier)}px`

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
        { explosionRadius, homingTurnRate, homingSpeed, fontSize, weaponName: this.config.name, damageType: this.config.damageType }
      )
    }
  }
}

// Fireball Ring Implementation (Placeholder)
export class FireballRingWeapon extends Weapon {
  private angle: number = 0
  private readonly MAX_FIREBALLS = 21 // Max 3 cycles of 7 fireballs

  fire(x: number, y: number, modifiers: WeaponModifiers): void {
    // Count active fireballs with this weapon name
    const activeFireballs = this.projectileGroup.getChildren().filter((proj: any) =>
      proj.active && proj.getWeaponName && proj.getWeaponName() === this.config.name
    ).length

    // Don't fire if we're at max fireballs
    if (activeFireballs >= this.MAX_FIREBALLS) {
      return
    }

    soundManager.playWeaponSound(this.config.name)
    const damage = this.getDamage() * modifiers.damageMultiplier
    const pierce = 0

    // Scale number of fireballs with level, plus building/character bonuses
    const fireballCount = (4 + this.level) + (modifiers.projectileCount || 0)
    const radius = 60 + (this.level - 1) * 5
    const angleStep = (Math.PI * 2) / fireballCount

    // Maximum distance fireballs can get from player before being destroyed
    const maxOrbitDistance = 150

    // Orbital speed - faster with projectile speed multiplier
    const orbitalSpeed = 300 * modifiers.projectileSpeedMultiplier

    // Apply projectile size multiplier
    const baseSize = 24
    const fontSize = `${Math.round(baseSize * modifiers.projectileSizeMultiplier)}px`

    for (let i = 0; i < fireballCount; i++) {
      const currentAngle = this.angle + (angleStep * i)
      const offsetX = Math.cos(currentAngle) * radius
      const offsetY = Math.sin(currentAngle) * radius

      // Tangential velocity for circular orbit (perpendicular to radius)
      const velocityX = -Math.sin(currentAngle) * orbitalSpeed
      const velocityY = Math.cos(currentAngle) * orbitalSpeed

      this.projectileGroup.fireProjectile(
        x + offsetX, y + offsetY, damage, pierce, velocityX, velocityY,
        this.config.icon, this.config.color,
        ProjectileType.EXPLOSIVE,
        {
          explosionRadius: (40 + (this.level - 1) * 5) * modifiers.explosionRadiusMultiplier,
          weaponName: this.config.name,
          fontSize,
          orbitOriginX: x,
          orbitOriginY: y,
          maxOrbitDistance,
          damageType: this.config.damageType
        }
      )
    }

    // Rotate angle for next fire to create continuous rotating ring effect
    this.angle += 0.1
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

    // Apply projectile size multiplier
    const baseSize = 22 // Base size for piercing projectiles
    const fontSize = `${Math.round(baseSize * modifiers.projectileSizeMultiplier)}px`

    // Add building/character bonuses for additional projectiles
    const projectileCount = 1 + (modifiers.projectileCount || 0)
    const spacing = 20

    if (projectileCount === 1) {
      this.projectileGroup.fireProjectile(
        x, y, damage, pierce, 0, speed,
        this.config.icon, this.config.color,
        ProjectileType.BOUNCING,
        { bounceCount, weaponName: this.config.name, fontSize, damageType: this.config.damageType }
      )
    } else {
      const totalWidth = (projectileCount - 1) * spacing
      const startX = x - totalWidth / 2

      for (let i = 0; i < projectileCount; i++) {
        this.projectileGroup.fireProjectile(
          startX + i * spacing, y, damage, pierce, 0, speed,
          this.config.icon, this.config.color,
          ProjectileType.BOUNCING,
          { bounceCount, weaponName: this.config.name, fontSize, damageType: this.config.damageType }
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

    // Apply projectile size multiplier
    const baseSize = 19
    const fontSize = `${Math.round(baseSize * modifiers.projectileSizeMultiplier)}px`

    for (let i = 0; i < projectileCount; i++) {
      const angle = angleStep * i
      const velocityX = Math.cos(angle) * speed
      const velocityY = Math.sin(angle) * speed

      this.projectileGroup.fireProjectile(
        x, y, damage, pierce, velocityX, velocityY,
        this.config.icon, this.config.color,
        undefined,
        { weaponName: this.config.name, fontSize, damageType: this.config.damageType }
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

    // Freeze chance increases with level
    const freezeChance = 20 + (this.level - 1) * 10
    const freezeDuration = 1500 // 1.5 seconds

    // More blades with level, plus building/character bonuses
    const bladeCount = 3 + this.level + (modifiers.projectileCount || 0)
    const angleStep = (Math.PI * 2) / bladeCount

    // Apply projectile speed multiplier - pure outward spiral
    const speed = 350 * modifiers.projectileSpeedMultiplier

    // Apply projectile size multiplier
    const baseSize = pierce > 0 ? 22 : 19
    const fontSize = `${Math.round(baseSize * modifiers.projectileSizeMultiplier)}px`

    for (let i = 0; i < bladeCount; i++) {
      const angle = this.spiralAngle + (angleStep * i)
      const velocityX = Math.cos(angle) * speed
      const velocityY = Math.sin(angle) * speed // Pure radial movement, spiraling handled in projectile update

      this.projectileGroup.fireProjectile(
        x, y, damage, pierce, velocityX, velocityY,
        this.config.icon, this.config.color,
        ProjectileType.SPIRALING,
        { freezeChance, freezeDuration, weaponName: this.config.name, fontSize, damageType: this.config.damageType }
      )
    }

    // Increment spiral for next fire - creates rotating spiral effect
    this.spiralAngle += 0.4
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

    // Apply projectile size multiplier
    const baseSize = 20
    const fontSize = `${Math.round(baseSize * modifiers.projectileSizeMultiplier)}px`

    for (let i = 1; i <= explosionCount; i++) {
      const strikeX = spacing * i
      const strikeY = 50

      this.projectileGroup.fireProjectile(
        strikeX, strikeY, damage, pierce, 0, speed,
        this.config.icon, this.config.color,
        ProjectileType.EXPLOSIVE,
        { explosionRadius, weaponName: this.config.name, fontSize, damageType: this.config.damageType }
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

    // Apply projectile size multiplier
    const baseSize = 8
    const fontSize = `${Math.round(baseSize * modifiers.projectileSizeMultiplier)}px`

    for (let i = 0; i < projectileCount; i++) {
      const spreadAngle = (Math.random() - 0.5) * spread * (Math.PI / 180)
      // Fast bullets for quick screen clearing (3x faster for performance)
      const velocityX = Math.sin(spreadAngle) * baseSpeedX
      const velocityY = Math.cos(spreadAngle) * -baseSpeedY

      this.projectileGroup.fireProjectile(
        x, y, damage, pierce, velocityX, velocityY,
        this.config.icon, this.config.color,
        undefined,
        { fontSize, weaponName: this.config.name, damageType: this.config.damageType }
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

    // Apply projectile size multiplier
    const baseSize = 22
    const fontSize = `${Math.round(baseSize * modifiers.projectileSizeMultiplier)}px`

    // Add building/character bonuses for additional projectiles
    const projectileCount = 1 + (modifiers.projectileCount || 0)
    const spacing = 40 // Wider spacing for trap zones

    if (projectileCount === 1) {
      this.projectileGroup.fireProjectile(
        x, y, damage, pierce, 0, 0,
        this.config.icon, this.config.color,
        ProjectileType.EARTH_ZONE,
        { zoneDuration, zoneRadius, weaponName: this.config.name, fontSize, damageType: this.config.damageType }
      )
    } else {
      const totalWidth = (projectileCount - 1) * spacing
      const startX = x - totalWidth / 2

      for (let i = 0; i < projectileCount; i++) {
        this.projectileGroup.fireProjectile(
          startX + i * spacing, y, damage, pierce, 0, 0,
          this.config.icon, this.config.color,
          ProjectileType.EARTH_ZONE,
          { zoneDuration, zoneRadius, weaponName: this.config.name, fontSize, damageType: this.config.damageType }
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

    // Apply projectile size multiplier
    const baseSize = 20
    const fontSize = `${Math.round(baseSize * modifiers.projectileSizeMultiplier)}px`

    // Add building/character bonuses for additional projectiles
    const projectileCount = 1 + (modifiers.projectileCount || 0)
    const spacing = 25

    if (projectileCount === 1) {
      this.projectileGroup.fireProjectile(
        x, y, damage, pierce, 0, speed,
        this.config.icon, this.config.color,
        undefined,
        { fontSize, weaponName: this.config.name, damageType: this.config.damageType }
      )
    } else {
      const totalWidth = (projectileCount - 1) * spacing
      const startX = x - totalWidth / 2

      for (let i = 0; i < projectileCount; i++) {
        this.projectileGroup.fireProjectile(
          startX + i * spacing, y, damage, pierce, 0, speed,
          this.config.icon, this.config.color,
          undefined,
          { fontSize, weaponName: this.config.name, damageType: this.config.damageType }
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
