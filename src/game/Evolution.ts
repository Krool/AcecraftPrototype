import Phaser from 'phaser'
import { WeaponType, Weapon, WeaponConfig, DamageType } from './Weapon'
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
  INFERNAL_CROWN = 'INFERNAL_CROWN',
  CRIMSON_REAPER = 'CRIMSON_REAPER',
  SUPERNOVA_RING = 'SUPERNOVA_RING',
  SPIRAL_TEMPEST = 'SPIRAL_TEMPEST',
  APOCALYPSE_RAY = 'APOCALYPSE_RAY',
  STORM_BREAKER = 'STORM_BREAKER',
  MINEFIELD = 'MINEFIELD',
  VOID_PIERCER = 'VOID_PIERCER',
}

export enum SuperEvolutionType {
  OMEGA_DESTROYER = 'OMEGA_DESTROYER',
  INFERNO_TITAN = 'INFERNO_TITAN',
  FROZEN_APOCALYPSE = 'FROZEN_APOCALYPSE',
  STORM_GOD = 'STORM_GOD',
  VOID_NEXUS = 'VOID_NEXUS',
  PRISMATIC_ANNIHILATOR = 'PRISMATIC_ANNIHILATOR',
}

export interface EvolutionRecipe {
  baseWeapon: WeaponType
  requiredPassive: PassiveType
  evolution: EvolutionType
}

export interface SuperEvolutionRecipe {
  evolution1: EvolutionType
  evolution2: EvolutionType
  superEvolution: SuperEvolutionType
  name: string
  description: string
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
  {
    baseWeapon: WeaponType.FIREBALL_RING,
    requiredPassive: PassiveType.PYROMANIAC,
    evolution: EvolutionType.INFERNAL_CROWN,
  },
  {
    baseWeapon: WeaponType.BLOOD_LANCE,
    requiredPassive: PassiveType.HEMORRHAGE,
    evolution: EvolutionType.CRIMSON_REAPER,
  },
  {
    baseWeapon: WeaponType.PLASMA_AURA,
    requiredPassive: PassiveType.VAMPIRIC_FIRE,
    evolution: EvolutionType.SUPERNOVA_RING,
  },
  {
    baseWeapon: WeaponType.VORTEX_BLADE,
    requiredPassive: PassiveType.FROST_HASTE,
    evolution: EvolutionType.SPIRAL_TEMPEST,
  },
  {
    baseWeapon: WeaponType.ORBITAL_STRIKE,
    requiredPassive: PassiveType.STATIC_FORTUNE,
    evolution: EvolutionType.APOCALYPSE_RAY,
  },
  {
    baseWeapon: WeaponType.MINIGUN,
    requiredPassive: PassiveType.TOXIC_ROUNDS,
    evolution: EvolutionType.STORM_BREAKER,
  },
  {
    baseWeapon: WeaponType.TRAP_LAYER,
    requiredPassive: PassiveType.SHATTER_STRIKE,
    evolution: EvolutionType.MINEFIELD,
  },
  {
    baseWeapon: WeaponType.SNIPER_RIFLE,
    requiredPassive: PassiveType.OVERDRIVE_REACTOR,
    evolution: EvolutionType.VOID_PIERCER,
  },
]

// Super Evolution recipes - combines two evolutions into ultimate weapons
export const SUPER_EVOLUTION_RECIPES: SuperEvolutionRecipe[] = [
  {
    evolution1: EvolutionType.RAILSTORM_GATLING,
    evolution2: EvolutionType.PINBALL_VORTEX,
    superEvolution: SuperEvolutionType.OMEGA_DESTROYER,
    name: 'Omega Destroyer',
    description: 'Physical damage perfection - bouncing gatling chaos',
  },
  {
    evolution1: EvolutionType.COMBUSTION_CORE,
    evolution2: EvolutionType.INFERNAL_CROWN,
    superEvolution: SuperEvolutionType.INFERNO_TITAN,
    name: 'Inferno Titan',
    description: 'Ultimate fire power - screen-filling explosions',
  },
  {
    evolution1: EvolutionType.CRYO_LANCER,
    evolution2: EvolutionType.SPIRAL_TEMPEST,
    superEvolution: SuperEvolutionType.FROZEN_APOCALYPSE,
    name: 'Frozen Apocalypse',
    description: 'Freeze and shatter everything in existence',
  },
  {
    evolution1: EvolutionType.STORM_NEXUS,
    evolution2: EvolutionType.TECTONIC_BLOOM,
    superEvolution: SuperEvolutionType.STORM_GOD,
    name: 'Storm God',
    description: 'Command nature itself - lightning and earth unite',
  },
  {
    evolution1: EvolutionType.SHADOW_LEGION,
    evolution2: EvolutionType.VOID_PIERCER,
    superEvolution: SuperEvolutionType.VOID_NEXUS,
    name: 'Void Nexus',
    description: 'Control reality - pierce dimensions and command shadows',
  },
  {
    evolution1: EvolutionType.SOLAR_LANCE,
    evolution2: EvolutionType.APOCALYPSE_RAY,
    superEvolution: SuperEvolutionType.PRISMATIC_ANNIHILATOR,
    name: 'Prismatic Annihilator',
    description: 'Pure energy incarnate - beam death from above',
  },
]

// Super Evolution configurations
export interface SuperEvolutionConfig extends WeaponConfig {
  superEvolutionType: SuperEvolutionType
  description: string
}

export const SUPER_EVOLUTION_CONFIGS: Record<SuperEvolutionType, SuperEvolutionConfig> = {
  [SuperEvolutionType.OMEGA_DESTROYER]: {
    name: 'Omega Destroyer',
    type: WeaponType.CANNON,
    damageType: DamageType.PHYSICAL,
    baseDamage: 90,
    baseFireRate: 200, // Balanced for ~450 DPS
    description: 'Reality-breaking physical carnage',
    maxLevel: 1,
    icon: '╬╬╬',
    color: '#ffffff',
    superEvolutionType: SuperEvolutionType.OMEGA_DESTROYER,
  },
  [SuperEvolutionType.INFERNO_TITAN]: {
    name: 'Inferno Titan',
    type: WeaponType.FIRE,
    damageType: DamageType.FIRE,
    baseDamage: 90,
    baseFireRate: 225,
    description: 'Apocalyptic inferno that consumes all',
    maxLevel: 1,
    icon: '✹✹✹',
    color: '#ff0000',
    superEvolutionType: SuperEvolutionType.INFERNO_TITAN,
  },
  [SuperEvolutionType.FROZEN_APOCALYPSE]: {
    name: 'Frozen Apocalypse',
    type: WeaponType.ICE,
    damageType: DamageType.COLD,
    baseDamage: 80,
    baseFireRate: 180,
    description: 'Eternal winter freezes time itself',
    maxLevel: 1,
    icon: '❅❅❅',
    color: '#00ffff',
    superEvolutionType: SuperEvolutionType.FROZEN_APOCALYPSE,
  },
  [SuperEvolutionType.STORM_GOD]: {
    name: 'Storm God',
    type: WeaponType.LIGHTNING,
    damageType: DamageType.NATURE,
    baseDamage: 85,
    baseFireRate: 150,
    description: 'Wrath of nature unleashed',
    maxLevel: 1,
    icon: '‡‡‡',
    color: '#ffff00',
    superEvolutionType: SuperEvolutionType.STORM_GOD,
  },
  [SuperEvolutionType.VOID_NEXUS]: {
    name: 'Void Nexus',
    type: WeaponType.DARK,
    damageType: DamageType.CONTROL,
    baseDamage: 125,
    baseFireRate: 300,
    description: 'Harness the void between dimensions',
    maxLevel: 1,
    icon: '◐◐◐',
    color: '#aa00ff',
    superEvolutionType: SuperEvolutionType.VOID_NEXUS,
  },
  [SuperEvolutionType.PRISMATIC_ANNIHILATOR]: {
    name: 'Prismatic Annihilator',
    type: WeaponType.LASER_BEAM,
    damageType: DamageType.FIRE,
    baseDamage: 40,
    baseFireRate: 83, // Balanced for ~482 DPS
    description: 'Pure concentrated energy obliteration',
    maxLevel: 1,
    icon: '━━━',
    color: '#ff00ff',
    superEvolutionType: SuperEvolutionType.PRISMATIC_ANNIHILATOR,
  },
}

// Evolution configurations - stats and appearance for evolved weapons
export const EVOLUTION_CONFIGS: Record<EvolutionType, EvolutionConfig> = {
  [EvolutionType.RAILSTORM_GATLING]: {
    name: 'Railstorm Gatling',
    type: WeaponType.CANNON,
    damageType: DamageType.PHYSICAL,
    baseDamage: 10,
    baseFireRate: 300, // Balanced for ~100 DPS (3 barrels)
    description: 'Rapid triple-barrel cannon with shockwaves',
    maxLevel: 1,
    icon: '⦿⦿⦿',
    color: '#ffff00',
    evolutionType: EvolutionType.RAILSTORM_GATLING,
  },
  [EvolutionType.AUTO_SCATTER]: {
    name: 'Auto Scatter',
    type: WeaponType.SHOTGUN,
    damageType: DamageType.PHYSICAL,
    baseDamage: 6,
    baseFireRate: 750, // Balanced for ~120 DPS (15 pellets)
    description: 'Wide-arc auto-fire filling half screen',
    maxLevel: 1,
    icon: '✺✺✺',
    color: '#ff8800',
    evolutionType: EvolutionType.AUTO_SCATTER,
  },
  [EvolutionType.DRONE_SWARM]: {
    name: 'Drone Swarm',
    type: WeaponType.GUN_BUDDY,
    damageType: DamageType.PHYSICAL,
    baseDamage: 7,
    baseFireRate: 350, // Balanced for ~100 DPS (5 drones)
    description: 'Five orbiting drones firing volleys',
    maxLevel: 1,
    icon: '⚙◉⚙',
    color: '#88ff00',
    evolutionType: EvolutionType.DRONE_SWARM,
  },
  [EvolutionType.STORM_NEXUS]: {
    name: 'Storm Nexus',
    type: WeaponType.LIGHTNING,
    damageType: DamageType.NATURE,
    baseDamage: 15,
    baseFireRate: 300,
    description: 'Arc lightning chaining indefinitely',
    maxLevel: 1,
    icon: '‡⟡‡',
    color: '#00ffff',
    evolutionType: EvolutionType.STORM_NEXUS,
  },
  [EvolutionType.CRYO_LANCER]: {
    name: 'Cryo Lancer',
    type: WeaponType.ICE,
    damageType: DamageType.COLD,
    baseDamage: 14,
    baseFireRate: 270,
    description: 'Piercing ice lances shatter into shards',
    maxLevel: 1,
    icon: '❅━❅',
    color: '#aaffff',
    evolutionType: EvolutionType.CRYO_LANCER,
  },
  [EvolutionType.COMBUSTION_CORE]: {
    name: 'Combustion Core',
    type: WeaponType.FIRE,
    damageType: DamageType.FIRE,
    baseDamage: 18,
    baseFireRate: 450,
    description: 'Explosions trigger chain reactions',
    maxLevel: 1,
    icon: '✹※✹',
    color: '#ff4400',
    evolutionType: EvolutionType.COMBUSTION_CORE,
  },
  [EvolutionType.TIDAL_SURGE]: {
    name: 'Tidal Surge',
    type: WeaponType.WATER,
    damageType: DamageType.COLD,
    baseDamage: 16,
    baseFireRate: 375,
    description: 'Giant wave rippling across screen',
    maxLevel: 1,
    icon: '≋≋≋',
    color: '#00aaff',
    evolutionType: EvolutionType.TIDAL_SURGE,
  },
  [EvolutionType.TECTONIC_BLOOM]: {
    name: 'Tectonic Bloom',
    type: WeaponType.EARTH,
    damageType: DamageType.NATURE,
    baseDamage: 20,
    baseFireRate: 600,
    description: 'Pulsing ground cracks spread fractally',
    maxLevel: 1,
    icon: '✤▓✤',
    color: '#884400',
    evolutionType: EvolutionType.TECTONIC_BLOOM,
  },
  [EvolutionType.SHADOW_LEGION]: {
    name: 'Shadow Legion',
    type: WeaponType.DARK,
    damageType: DamageType.CONTROL,
    baseDamage: 21,
    baseFireRate: 300, // Balanced for ~70 DPS (converts enemies as bonus)
    description: 'Converts enemies into permanent allies',
    maxLevel: 1,
    icon: '◐◑◐',
    color: '#8800ff',
    evolutionType: EvolutionType.SHADOW_LEGION,
  },
  [EvolutionType.SOLAR_LANCE]: {
    name: 'Solar Lance',
    type: WeaponType.LASER_BEAM,
    damageType: DamageType.FIRE,
    baseDamage: 5,
    baseFireRate: 45, // Balanced for ~111 DPS (wide beam)
    description: 'Beam widens into screenwide burn',
    maxLevel: 1,
    icon: '☀━☀',
    color: '#ff0000',
    evolutionType: EvolutionType.SOLAR_LANCE,
  },
  [EvolutionType.PINBALL_VORTEX]: {
    name: 'Pinball Vortex',
    type: WeaponType.RICOCHET_DISK,
    damageType: DamageType.PHYSICAL,
    baseDamage: 19,
    baseFireRate: 300,
    description: 'Multiplying bouncing disks create chaos',
    maxLevel: 1,
    icon: '◊◇◈',
    color: '#ffaa00',
    evolutionType: EvolutionType.PINBALL_VORTEX,
  },
  [EvolutionType.NOVA_BARRAGE]: {
    name: 'Nova Barrage',
    type: WeaponType.MISSILE_POD,
    damageType: DamageType.FIRE,
    baseDamage: 25,
    baseFireRate: 750,
    description: 'Splitting missiles blanket screen',
    maxLevel: 1,
    icon: '▲▼▲',
    color: '#ff6600',
    evolutionType: EvolutionType.NOVA_BARRAGE,
  },
  [EvolutionType.INFERNAL_CROWN]: {
    name: 'Infernal Crown',
    type: WeaponType.FIREBALL_RING,
    damageType: DamageType.FIRE,
    baseDamage: 19,
    baseFireRate: 375,
    description: 'Massive orbiting fireballs ignite everything',
    maxLevel: 1,
    icon: '✹◉✹',
    color: '#ff2200',
    evolutionType: EvolutionType.INFERNAL_CROWN,
  },
  [EvolutionType.CRIMSON_REAPER]: {
    name: 'Crimson Reaper',
    type: WeaponType.BLOOD_LANCE,
    damageType: DamageType.PHYSICAL,
    baseDamage: 14,
    baseFireRate: 300,
    description: 'Endless bouncing lances spread hemorrhage',
    maxLevel: 1,
    icon: '✠╬✠',
    color: '#aa0000',
    evolutionType: EvolutionType.CRIMSON_REAPER,
  },
  [EvolutionType.SUPERNOVA_RING]: {
    name: 'Supernova Ring',
    type: WeaponType.PLASMA_AURA,
    damageType: DamageType.FIRE,
    baseDamage: 8,
    baseFireRate: 90,
    description: 'Pulsing waves heal as they annihilate',
    maxLevel: 1,
    icon: '⊛✧⊛',
    color: '#ff00aa',
    evolutionType: EvolutionType.SUPERNOVA_RING,
  },
  [EvolutionType.SPIRAL_TEMPEST]: {
    name: 'Spiral Tempest',
    type: WeaponType.VORTEX_BLADE,
    damageType: DamageType.PHYSICAL,
    baseDamage: 18,
    baseFireRate: 525,
    description: 'Accelerating spiral blades freeze on contact',
    maxLevel: 1,
    icon: '◈✦◈',
    color: '#00ffee',
    evolutionType: EvolutionType.SPIRAL_TEMPEST,
  },
  [EvolutionType.APOCALYPSE_RAY]: {
    name: 'Apocalypse Ray',
    type: WeaponType.ORBITAL_STRIKE,
    damageType: DamageType.FIRE,
    baseDamage: 18,
    baseFireRate: 300, // Balanced for ~60 DPS (spawns credits as bonus)
    description: 'Cascading orbital beams rain credits',
    maxLevel: 1,
    icon: '▼✹▼',
    color: '#ffaa00',
    evolutionType: EvolutionType.APOCALYPSE_RAY,
  },
  [EvolutionType.STORM_BREAKER]: {
    name: 'Storm Breaker',
    type: WeaponType.MINIGUN,
    damageType: DamageType.PHYSICAL,
    baseDamage: 3,
    baseFireRate: 45,
    description: 'Toxic bullet storm melts armor',
    maxLevel: 1,
    icon: '▪▪▪',
    color: '#88ff00',
    evolutionType: EvolutionType.STORM_BREAKER,
  },
  [EvolutionType.MINEFIELD]: {
    name: 'Minefield',
    type: WeaponType.TRAP_LAYER,
    damageType: DamageType.NATURE,
    baseDamage: 25,
    baseFireRate: 400, // Balanced for ~63 DPS (persistent explosions)
    description: 'Explosive traps shatter frozen enemies',
    maxLevel: 1,
    icon: '✻✦✻',
    color: '#ffff00',
    evolutionType: EvolutionType.MINEFIELD,
  },
  [EvolutionType.VOID_PIERCER]: {
    name: 'Void Piercer',
    type: WeaponType.SNIPER_RIFLE,
    damageType: DamageType.PHYSICAL,
    baseDamage: 70,
    baseFireRate: 2100,
    description: 'Accelerating shots pierce everything',
    maxLevel: 1,
    icon: '═══',
    color: '#8800ff',
    evolutionType: EvolutionType.VOID_PIERCER,
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

  // Check if any super evolutions are available based on current evolved weapons
  checkForSuperEvolutions(weapons: Weapon[]): SuperEvolutionRecipe | null {
    // Get all evolved weapons
    const evolvedWeapons = weapons.filter(w => w instanceof EvolvedWeapon) as EvolvedWeapon[]

    if (evolvedWeapons.length < 2) {
      return null
    }

    // Get evolution types from evolved weapons
    const evolutionTypes = evolvedWeapons.map(w => w.getEvolutionType())

    // Check each super evolution recipe
    for (const recipe of SUPER_EVOLUTION_RECIPES) {
      const hasEvolution1 = evolutionTypes.includes(recipe.evolution1)
      const hasEvolution2 = evolutionTypes.includes(recipe.evolution2)

      if (hasEvolution1 && hasEvolution2) {
        return recipe
      }
    }

    return null
  }

  // Create a super evolved weapon
  createSuperEvolvedWeapon(
    superEvolutionType: SuperEvolutionType,
    projectileGroup: ProjectileGroup
  ): SuperEvolvedWeapon {
    return new SuperEvolvedWeapon(this.scene, superEvolutionType, projectileGroup)
  }

  // Get super evolution config
  getSuperEvolutionConfig(superEvolutionType: SuperEvolutionType): SuperEvolutionConfig {
    return SUPER_EVOLUTION_CONFIGS[superEvolutionType]
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
    const bonusCount = modifiers.projectileCount || 0 // Building/character projectile bonuses

    // Evolutions fire more powerful versions of their base weapons
    const evolutionType = this.evolutionConfig.evolutionType

    switch (evolutionType) {
      case EvolutionType.RAILSTORM_GATLING:
        // Triple barrel rapid fire
        for (let i = 0; i < 3 + bonusCount; i++) {
          const offsetX = (i - (3 + bonusCount - 1) / 2) * 25
          this.projectileGroup.fireProjectile(x + offsetX, y, damage, pierce)
        }
        break

      case EvolutionType.COMBUSTION_CORE:
        // Massive explosions
        for (let i = 0; i < 5 + bonusCount; i++) {
          const offsetX = (i - (5 + bonusCount - 1) / 2) * 30
          this.projectileGroup.fireProjectile(x + offsetX, y, damage * 1.5, pierce, 0, -350)
        }
        break

      case EvolutionType.STORM_NEXUS:
        // Screen-wide lightning
        this.projectileGroup.fireSpread(x, y, damage, pierce + 10, 7 + bonusCount, 60)
        break

      case EvolutionType.AUTO_SCATTER:
        // Constant shotgun spread
        this.projectileGroup.fireSpread(x, y, damage, pierce, 15 + bonusCount, 90)
        break

      case EvolutionType.DRONE_SWARM:
        // 5 orbiting drones
        const droneCount = 5 + bonusCount
        for (let i = 0; i < droneCount; i++) {
          const angle = (Math.PI * 2 / droneCount) * i
          const offsetX = Math.cos(angle) * 50
          const offsetY = Math.sin(angle) * 50
          this.projectileGroup.fireProjectile(x + offsetX, y + offsetY, damage, pierce)
        }
        break

      case EvolutionType.INFERNAL_CROWN:
        // Massive fireballs orbiting with explosions
        const crownCount = 8 + bonusCount
        for (let i = 0; i < crownCount; i++) {
          const angle = (Math.PI * 2 / crownCount) * i
          const offsetX = Math.cos(angle) * 80
          const offsetY = Math.sin(angle) * 80
          this.projectileGroup.fireProjectile(x + offsetX, y + offsetY, damage, pierce, 0, -350)
        }
        break

      case EvolutionType.CRIMSON_REAPER:
        // Many bouncing lances
        for (let i = 0; i < 7 + bonusCount; i++) {
          const offsetX = (i - (7 + bonusCount - 1) / 2) * 15
          this.projectileGroup.fireProjectile(x + offsetX, y, damage, pierce + 10, 0, -600)
        }
        break

      case EvolutionType.SUPERNOVA_RING:
        // Dense expanding ring
        const ringCount = 24 + bonusCount
        for (let i = 0; i < ringCount; i++) {
          const angle = (Math.PI * 2 / ringCount) * i
          const velocityX = Math.cos(angle) * 250
          const velocityY = Math.sin(angle) * 250
          this.projectileGroup.fireProjectile(x, y, damage, pierce, velocityX, velocityY)
        }
        break

      case EvolutionType.SPIRAL_TEMPEST:
        // Multiple spiraling projectiles
        const tempestCount = 12 + bonusCount
        for (let i = 0; i < tempestCount; i++) {
          const angle = (Math.PI * 2 / tempestCount) * i
          const velocityX = Math.cos(angle) * 450
          const velocityY = Math.sin(angle) * 450 - 250
          this.projectileGroup.fireProjectile(x, y, damage, pierce, velocityX, velocityY)
        }
        break

      case EvolutionType.APOCALYPSE_RAY:
        // Multiple orbital strikes
        const screenWidth = this.scene.cameras.main.width
        for (let i = 0; i < 10 + bonusCount; i++) {
          const strikeX = (screenWidth / (10 + bonusCount + 1)) * (i + 1)
          this.projectileGroup.fireProjectile(strikeX, 30, damage, pierce, 0, 400)
        }
        break

      case EvolutionType.STORM_BREAKER:
        // Rapid fire bullets in tight spread
        for (let i = 0; i < 10 + bonusCount; i++) {
          const offsetX = (Math.random() - 0.5) * 40
          const velocityX = (Math.random() - 0.5) * 100
          this.projectileGroup.fireProjectile(x + offsetX, y, damage, pierce, velocityX, -700)
        }
        break

      case EvolutionType.MINEFIELD:
        // Multiple large traps
        for (let i = 0; i < 5 + bonusCount; i++) {
          const offsetX = (i - (5 + bonusCount - 1) / 2) * 60
          this.projectileGroup.fireProjectile(x + offsetX, y, damage, pierce, 0, 0)
        }
        break

      case EvolutionType.VOID_PIERCER:
        // Powerful piercing shots
        for (let i = 0; i < 3 + bonusCount; i++) {
          const offsetX = (i - (3 + bonusCount - 1) / 2) * 30
          this.projectileGroup.fireProjectile(x + offsetX, y, damage, pierce + 15, 0, -1000)
        }
        break

      default:
        // Default evolution behavior - powerful multi-shot
        for (let i = 0; i < 7 + bonusCount; i++) {
          const offsetX = (i - (7 + bonusCount - 1) / 2) * 20
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

  getEvolutionType(): EvolutionType {
    return this.evolutionConfig.evolutionType
  }
}

// Super Evolved Weapon class - represents the ultimate evolution
export class SuperEvolvedWeapon extends Weapon {
  private superEvolutionConfig: SuperEvolutionConfig

  constructor(scene: Phaser.Scene, superEvolutionType: SuperEvolutionType, projectileGroup: ProjectileGroup) {
    // Get the super evolution config
    const config = SUPER_EVOLUTION_CONFIGS[superEvolutionType]

    // Create weapon with super evolution config
    super(scene, config.type, projectileGroup)

    this.superEvolutionConfig = config
    this.config = config as any
    this.level = 1
  }

  fire(x: number, y: number, modifiers: any): void {
    const damage = this.getDamage() * modifiers.damageMultiplier
    const pierce = modifiers.pierceCount + 20 // Super evolutions have massive pierce
    const bonusCount = modifiers.projectileCount || 0 // Building/character projectile bonuses

    const superEvolutionType = this.superEvolutionConfig.superEvolutionType

    switch (superEvolutionType) {
      case SuperEvolutionType.OMEGA_DESTROYER:
        // Gatling + bouncing = screen-filling chaos
        for (let i = 0; i < 20 + bonusCount; i++) {
          const offsetX = (i - (20 + bonusCount - 1) / 2) * 10
          const velocityX = (Math.random() - 0.5) * 200
          this.projectileGroup.fireProjectile(x + offsetX, y, damage, pierce, velocityX, -700)
        }
        break

      case SuperEvolutionType.INFERNO_TITAN:
        // Massive explosions everywhere
        const titanCount = 16 + bonusCount
        for (let i = 0; i < titanCount; i++) {
          const angle = (Math.PI * 2 / titanCount) * i
          const distance = 100
          const offsetX = Math.cos(angle) * distance
          const offsetY = Math.sin(angle) * distance
          this.projectileGroup.fireProjectile(x + offsetX, y + offsetY, damage, pierce, 0, -400)
        }
        break

      case SuperEvolutionType.FROZEN_APOCALYPSE:
        // Freezing spiral that expands
        const frozenCount = 30 + bonusCount
        for (let i = 0; i < frozenCount; i++) {
          const angle = (Math.PI * 2 / frozenCount) * i
          const velocityX = Math.cos(angle) * 500
          const velocityY = Math.sin(angle) * 500
          this.projectileGroup.fireProjectile(x, y, damage, pierce, velocityX, velocityY)
        }
        break

      case SuperEvolutionType.STORM_GOD:
        // Lightning chains + earth zones
        for (let i = 0; i < 15 + bonusCount; i++) {
          const offsetX = (i - (15 + bonusCount - 1) / 2) * 30
          this.projectileGroup.fireProjectile(x + offsetX, y, damage, pierce + 10, 0, -600)
        }
        break

      case SuperEvolutionType.VOID_NEXUS:
        // Piercing void shots that split reality
        const voidCount = 8 + bonusCount
        for (let i = 0; i < voidCount; i++) {
          const angle = (Math.PI * 2 / voidCount) * i
          const velocityX = Math.cos(angle) * 600
          const velocityY = Math.sin(angle) * 600
          this.projectileGroup.fireProjectile(x, y, damage, pierce + 25, velocityX, velocityY)
        }
        break

      case SuperEvolutionType.PRISMATIC_ANNIHILATOR:
        // Screen-wide beam death
        const screenWidth = this.scene.cameras.main.width
        for (let i = 0; i < 20 + bonusCount; i++) {
          const offsetX = (screenWidth / (20 + bonusCount + 1)) * (i + 0.5) - screenWidth / 2
          this.projectileGroup.fireProjectile(x + offsetX, y, damage, pierce, 0, -1200)
        }
        break

      default:
        // Default super evolution - ultimate multi-shot
        for (let i = 0; i < 25 + bonusCount; i++) {
          const offsetX = (i - (25 + bonusCount - 1) / 2) * 15
          this.projectileGroup.fireProjectile(x + offsetX, y, damage, pierce)
        }
        break
    }
  }

  // Super evolutions can't level up
  levelUp(): boolean {
    return false
  }

  isMaxLevel(): boolean {
    return true
  }

  getInfo(): string {
    return `${this.config.name}\n[SUPER EVOLVED]\n${this.superEvolutionConfig.description}\nDamage: ${this.getDamage()}`
  }

  getSuperEvolutionType(): SuperEvolutionType {
    return this.superEvolutionConfig.superEvolutionType
  }
}
