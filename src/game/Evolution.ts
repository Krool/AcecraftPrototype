import Phaser from 'phaser'
import { WeaponType, Weapon, WeaponConfig } from './Weapon'
import { PassiveType } from './Passive'
import { ProjectileGroup } from './Projectile'

export enum EvolutionType {
  RAILSTORM_GATLING = 'RAILSTORM_GATLING',
  COMBUSTION_CORE = 'COMBUSTION_CORE',
  STORM_NEXUS = 'STORM_NEXUS',
  AUTO_SCATTER = 'AUTO_SCATTER',
  DRONE_SWARM = 'DRONE_SWARM',
  CRYO_LANCER = 'CRYO_LANCER',
  TIDAL_SURGE = 'TIDAL_SURGE',
  TECTONIC_BLOOM = 'TECTONIC_BLOOM',
  SHADOW_LEGION = 'SHADOW_LEGION',
  SOLAR_LANCE = 'SOLAR_LANCE',
  PINBALL_VORTEX = 'PINBALL_VORTEX',
  NOVA_BARRAGE = 'NOVA_BARRAGE',
}

export interface EvolutionRecipe {
  baseWeapon: WeaponType
  requiredPassive: PassiveType
  evolution: EvolutionType
}

export interface EvolutionConfig extends WeaponConfig {
  evolutionType: EvolutionType
  description: string
}

// Evolution recipes - defines which weapon + passive combos create evolutions
export const EVOLUTION_RECIPES: EvolutionRecipe[] = [
  {
    baseWeapon: WeaponType.CANNON,
    requiredPassive: PassiveType.BALLISTICS,
    evolution: EvolutionType.RAILSTORM_GATLING,
  },
  {
    baseWeapon: WeaponType.SHOTGUN,
    requiredPassive: PassiveType.WEAPON_SPEED_UP,
    evolution: EvolutionType.AUTO_SCATTER,
  },
  {
    baseWeapon: WeaponType.GUN_BUDDY,
    requiredPassive: PassiveType.DRONE_BAY_EXPANSION,
    evolution: EvolutionType.DRONE_SWARM,
  },
  {
    baseWeapon: WeaponType.LIGHTNING,
    requiredPassive: PassiveType.CRITICAL_SYSTEMS,
    evolution: EvolutionType.STORM_NEXUS,
  },
  {
    baseWeapon: WeaponType.ICE,
    requiredPassive: PassiveType.THRUSTER_MOD,
    evolution: EvolutionType.CRYO_LANCER,
  },
  {
    baseWeapon: WeaponType.FIRE,
    requiredPassive: PassiveType.CRITICAL_SYSTEMS,
    evolution: EvolutionType.COMBUSTION_CORE,
  },
  {
    baseWeapon: WeaponType.WATER,
    requiredPassive: PassiveType.PICKUP_RADIUS,
    evolution: EvolutionType.TIDAL_SURGE,
  },
  {
    baseWeapon: WeaponType.EARTH,
    requiredPassive: PassiveType.SHIP_ARMOR,
    evolution: EvolutionType.TECTONIC_BLOOM,
  },
  {
    baseWeapon: WeaponType.DARK,
    requiredPassive: PassiveType.EVASION_DRIVE,
    evolution: EvolutionType.SHADOW_LEGION,
  },
  {
    baseWeapon: WeaponType.LASER_BEAM,
    requiredPassive: PassiveType.ENERGY_CORE,
    evolution: EvolutionType.SOLAR_LANCE,
  },
  {
    baseWeapon: WeaponType.RICOCHET_DISK,
    requiredPassive: PassiveType.BALLISTICS,
    evolution: EvolutionType.PINBALL_VORTEX,
  },
  {
    baseWeapon: WeaponType.MISSILE_POD,
    requiredPassive: PassiveType.SALVAGE_UNIT,
    evolution: EvolutionType.NOVA_BARRAGE,
  },
]

// Evolution configurations - stats and appearance for evolved weapons
export const EVOLUTION_CONFIGS: Record<EvolutionType, EvolutionConfig> = {
  [EvolutionType.RAILSTORM_GATLING]: {
    name: 'Railstorm Gatling',
    type: WeaponType.CANNON,
    damageType: 'PHYSICAL' as any,
    baseDamage: 25,
    baseFireRate: 100,
    description: 'Rapid triple-barrel cannon with shockwaves',
    maxLevel: 1,
    icon: '⫸',
    color: '#ffff00',
    evolutionType: EvolutionType.RAILSTORM_GATLING,
  },
  [EvolutionType.AUTO_SCATTER]: {
    name: 'Auto Scatter',
    type: WeaponType.SHOTGUN,
    damageType: 'PHYSICAL' as any,
    baseDamage: 20,
    baseFireRate: 150,
    description: 'Wide-arc auto-fire filling half screen',
    maxLevel: 1,
    icon: '╬',
    color: '#ff8800',
    evolutionType: EvolutionType.AUTO_SCATTER,
  },
  [EvolutionType.DRONE_SWARM]: {
    name: 'Drone Swarm',
    type: WeaponType.GUN_BUDDY,
    damageType: 'PHYSICAL' as any,
    baseDamage: 15,
    baseFireRate: 150,
    description: 'Five orbiting drones firing volleys',
    maxLevel: 1,
    icon: '◉◉',
    color: '#88ff00',
    evolutionType: EvolutionType.DRONE_SWARM,
  },
  [EvolutionType.STORM_NEXUS]: {
    name: 'Storm Nexus',
    type: WeaponType.LIGHTNING,
    damageType: 'NATURE' as any,
    baseDamage: 30,
    baseFireRate: 200,
    description: 'Arc lightning chaining indefinitely',
    maxLevel: 1,
    icon: '⚡⚡',
    color: '#00ffff',
    evolutionType: EvolutionType.STORM_NEXUS,
  },
  [EvolutionType.CRYO_LANCER]: {
    name: 'Cryo Lancer',
    type: WeaponType.ICE,
    damageType: 'COLD' as any,
    baseDamage: 28,
    baseFireRate: 180,
    description: 'Piercing ice lances shatter into shards',
    maxLevel: 1,
    icon: '❄❄',
    color: '#aaffff',
    evolutionType: EvolutionType.CRYO_LANCER,
  },
  [EvolutionType.COMBUSTION_CORE]: {
    name: 'Combustion Core',
    type: WeaponType.FIRE,
    damageType: 'FIRE' as any,
    baseDamage: 35,
    baseFireRate: 300,
    description: 'Explosions trigger chain reactions',
    maxLevel: 1,
    icon: '※※',
    color: '#ff4400',
    evolutionType: EvolutionType.COMBUSTION_CORE,
  },
  [EvolutionType.TIDAL_SURGE]: {
    name: 'Tidal Surge',
    type: WeaponType.WATER,
    damageType: 'COLD' as any,
    baseDamage: 32,
    baseFireRate: 250,
    description: 'Giant wave rippling across screen',
    maxLevel: 1,
    icon: '≈≈',
    color: '#00aaff',
    evolutionType: EvolutionType.TIDAL_SURGE,
  },
  [EvolutionType.TECTONIC_BLOOM]: {
    name: 'Tectonic Bloom',
    type: WeaponType.EARTH,
    damageType: 'NATURE' as any,
    baseDamage: 40,
    baseFireRate: 400,
    description: 'Pulsing ground cracks spread fractally',
    maxLevel: 1,
    icon: '▓▓',
    color: '#884400',
    evolutionType: EvolutionType.TECTONIC_BLOOM,
  },
  [EvolutionType.SHADOW_LEGION]: {
    name: 'Shadow Legion',
    type: WeaponType.DARK,
    damageType: 'CONTROL' as any,
    baseDamage: 45,
    baseFireRate: 800,
    description: 'Converts enemies into permanent allies',
    maxLevel: 1,
    icon: '●●',
    color: '#8800ff',
    evolutionType: EvolutionType.SHADOW_LEGION,
  },
  [EvolutionType.SOLAR_LANCE]: {
    name: 'Solar Lance',
    type: WeaponType.LASER_BEAM,
    damageType: 'FIRE' as any,
    baseDamage: 12,
    baseFireRate: 30,
    description: 'Beam widens into screenwide burn',
    maxLevel: 1,
    icon: '━━',
    color: '#ff0000',
    evolutionType: EvolutionType.SOLAR_LANCE,
  },
  [EvolutionType.PINBALL_VORTEX]: {
    name: 'Pinball Vortex',
    type: WeaponType.RICOCHET_DISK,
    damageType: 'PHYSICAL' as any,
    baseDamage: 38,
    baseFireRate: 200,
    description: 'Multiplying bouncing disks create chaos',
    maxLevel: 1,
    icon: '◇◇',
    color: '#ffaa00',
    evolutionType: EvolutionType.PINBALL_VORTEX,
  },
  [EvolutionType.NOVA_BARRAGE]: {
    name: 'Nova Barrage',
    type: WeaponType.MISSILE_POD,
    damageType: 'FIRE' as any,
    baseDamage: 50,
    baseFireRate: 500,
    description: 'Splitting missiles blanket screen',
    maxLevel: 1,
    icon: '▲▲',
    color: '#ff6600',
    evolutionType: EvolutionType.NOVA_BARRAGE,
  },
}

// Evolution Manager - handles detection and creation
export class EvolutionManager {
  private scene: Phaser.Scene

  constructor(scene: Phaser.Scene) {
    this.scene = scene
  }

  // Check if any evolutions are available based on current weapons and passives
  checkForEvolutions(weapons: Weapon[], passives: any[]): EvolutionRecipe | null {
    // Get max level weapons
    const maxLevelWeapons = weapons.filter(w => w.isMaxLevel())

    // Get max level passives
    const maxLevelPassives = passives.filter(p => p.isMaxLevel())

    // Check each recipe
    for (const recipe of EVOLUTION_RECIPES) {
      const hasWeapon = maxLevelWeapons.some(w => w.getConfig().type === recipe.baseWeapon)
      const hasPassive = maxLevelPassives.some(p => p.getConfig().type === recipe.requiredPassive)

      if (hasWeapon && hasPassive) {
        return recipe
      }
    }

    return null
  }

  // Create an evolved weapon
  createEvolvedWeapon(
    evolutionType: EvolutionType,
    projectileGroup: ProjectileGroup
  ): EvolvedWeapon {
    return new EvolvedWeapon(this.scene, evolutionType, projectileGroup)
  }

  // Get evolution config
  getEvolutionConfig(evolutionType: EvolutionType): EvolutionConfig {
    return EVOLUTION_CONFIGS[evolutionType]
  }
}

// Evolved Weapon class - represents an evolved weapon
export class EvolvedWeapon extends Weapon {
  private evolutionConfig: EvolutionConfig

  constructor(scene: Phaser.Scene, evolutionType: EvolutionType, projectileGroup: ProjectileGroup) {
    // Get the evolution config
    const config = EVOLUTION_CONFIGS[evolutionType]

    // Create weapon with evolution config
    super(scene, config.type, projectileGroup)

    this.evolutionConfig = config
    this.config = config as any
    this.level = 1 // Evolutions start at level 1 and don't level up further
  }

  fire(x: number, y: number, modifiers: any): void {
    const damage = this.getDamage() * modifiers.damageMultiplier
    const pierce = modifiers.pierceCount + 5 // Evolutions have bonus pierce

    // Evolutions fire more powerful versions of their base weapons
    const evolutionType = this.evolutionConfig.evolutionType

    switch (evolutionType) {
      case EvolutionType.RAILSTORM_GATLING:
        // Triple barrel rapid fire
        for (let i = 0; i < 3; i++) {
          const offsetX = (i - 1) * 25
          this.projectileGroup.fireProjectile(x + offsetX, y, damage, pierce)
        }
        break

      case EvolutionType.COMBUSTION_CORE:
        // Massive explosions
        for (let i = 0; i < 5; i++) {
          const offsetX = (i - 2) * 30
          this.projectileGroup.fireProjectile(x + offsetX, y, damage * 1.5, pierce, 0, -350)
        }
        break

      case EvolutionType.STORM_NEXUS:
        // Screen-wide lightning
        this.projectileGroup.fireSpread(x, y, damage, pierce + 10, 7, 60)
        break

      case EvolutionType.AUTO_SCATTER:
        // Constant shotgun spread
        this.projectileGroup.fireSpread(x, y, damage, pierce, 15, 90)
        break

      case EvolutionType.DRONE_SWARM:
        // 5 orbiting drones
        for (let i = 0; i < 5; i++) {
          const angle = (Math.PI * 2 / 5) * i
          const offsetX = Math.cos(angle) * 50
          const offsetY = Math.sin(angle) * 50
          this.projectileGroup.fireProjectile(x + offsetX, y + offsetY, damage, pierce)
        }
        break

      default:
        // Default evolution behavior - powerful multi-shot
        for (let i = 0; i < 7; i++) {
          const offsetX = (i - 3) * 20
          this.projectileGroup.fireProjectile(x + offsetX, y, damage, pierce)
        }
        break
    }
  }

  // Evolutions can't level up further
  levelUp(): boolean {
    return false
  }

  isMaxLevel(): boolean {
    return true
  }

  getInfo(): string {
    return `${this.config.name}\n[EVOLVED]\n${this.evolutionConfig.description}\nDamage: ${this.getDamage()}`
  }
}
