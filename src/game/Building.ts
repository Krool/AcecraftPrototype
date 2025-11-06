export enum BuildingType {
  DAMAGE = 'DAMAGE',
  HEALTH = 'HEALTH',
  ATTACK_SPEED = 'ATTACK_SPEED',
  XP_GAIN = 'XP_GAIN',
  CREDIT_GAIN = 'CREDIT_GAIN',
  STARTING_WEAPON_LEVEL = 'STARTING_WEAPON_LEVEL',
  NATURE_DAMAGE = 'NATURE_DAMAGE',
  PHYSICAL_DAMAGE = 'PHYSICAL_DAMAGE',
  ALLY_DAMAGE = 'ALLY_DAMAGE',
  FIRE_DAMAGE = 'FIRE_DAMAGE',
  COLD_DAMAGE = 'COLD_DAMAGE',
  WEAPON_SLOT = 'WEAPON_SLOT',
  PASSIVE_SLOT = 'PASSIVE_SLOT',
  AOE_RADIUS = 'AOE_RADIUS',
  PICKUP_RADIUS = 'PICKUP_RADIUS',
  DAMAGE_REDUCTION = 'DAMAGE_REDUCTION',
  UPGRADE_OPTIONS = 'UPGRADE_OPTIONS',
  // Combat tree additions
  PROJECTILE_SPEED = 'PROJECTILE_SPEED',
  CRIT_CHANCE = 'CRIT_CHANCE',
  BURNING_AMPLIFY = 'BURNING_AMPLIFY',
  POISON_AMPLIFY = 'POISON_AMPLIFY',
  PROJECTILE_COUNT = 'PROJECTILE_COUNT',
  // Survival tree additions
  MOVE_SPEED = 'MOVE_SPEED',
  REGEN = 'REGEN',
  HEALTH_DROP_RATE = 'HEALTH_DROP_RATE',
  HEALTH_PACK_VALUE = 'HEALTH_PACK_VALUE',
  WAVE_HEAL = 'WAVE_HEAL',
  ALLY_WALL_COUNT = 'ALLY_WALL_COUNT',
  ALLY_WALL_DAMAGE = 'ALLY_WALL_DAMAGE',
  ALLY_RANGED_UNLOCK = 'ALLY_RANGED_UNLOCK',
  ALLY_RANGED_COUNT = 'ALLY_RANGED_COUNT',
  ALLY_RANGED_RATE = 'ALLY_RANGED_RATE',
  INVULN_TIME = 'INVULN_TIME',
  REVIVE = 'REVIVE',
  // Growth tree additions
  CREDIT_DROP_RATE = 'CREDIT_DROP_RATE',
  WIN_BONUS = 'WIN_BONUS',
  BOSS_BONUS = 'BOSS_BONUS',
  GOLD_CHEST_CHANCE = 'GOLD_CHEST_CHANCE',
  CHEST_VALUE = 'CHEST_VALUE',
  MAGNET_DURATION = 'MAGNET_DURATION',
  REROLL_UNLOCK = 'REROLL_UNLOCK',
  REROLL_CHARGES = 'REROLL_CHARGES',
  REROLL_ALLY_UNLOCK = 'REROLL_ALLY_UNLOCK',
  REROLL_ALLY_RATE = 'REROLL_ALLY_RATE',
  DISCOUNT = 'DISCOUNT',
  GREED = 'GREED',
  LUCKY = 'LUCKY',
}

export interface BuildingConfig {
  name: string
  type: BuildingType
  description: string
  icon: string
  maxLevel: number
  baseCost: number // Cost for level 1
  costMultiplier: number // Each level costs more
}

export const BUILDING_CONFIGS: Record<BuildingType, BuildingConfig> = {
  [BuildingType.DAMAGE]: {
    name: '+10% All Damage',
    type: BuildingType.DAMAGE,
    description: 'Increases all damage by 10% per level',
    icon: '⚔',
    maxLevel: 10,
    baseCost: 100,
    costMultiplier: 1.5,
  },
  [BuildingType.HEALTH]: {
    name: '+20 Max Health',
    type: BuildingType.HEALTH,
    description: 'Increases maximum health by 20 per level',
    icon: '♥',
    maxLevel: 10,
    baseCost: 80,
    costMultiplier: 1.4,
  },
  [BuildingType.ATTACK_SPEED]: {
    name: '+5% Attack Speed',
    type: BuildingType.ATTACK_SPEED,
    description: 'Increases attack speed by 5% per level',
    icon: '⚡',
    maxLevel: 10,
    baseCost: 120,
    costMultiplier: 1.6,
  },
  [BuildingType.XP_GAIN]: {
    name: '+10% XP Gain',
    type: BuildingType.XP_GAIN,
    description: 'Increases XP gained from enemies by 10% per level',
    icon: '◆',
    maxLevel: 10,
    baseCost: 100,
    costMultiplier: 1.5,
  },
  [BuildingType.CREDIT_GAIN]: {
    name: '+10% Credit Gain',
    type: BuildingType.CREDIT_GAIN,
    description: 'Increases credits earned from runs by 10% per level',
    icon: '¤',
    maxLevel: 10,
    baseCost: 100,
    costMultiplier: 1.5,
  },
  [BuildingType.STARTING_WEAPON_LEVEL]: {
    name: '+1 Starting Weapon Level',
    type: BuildingType.STARTING_WEAPON_LEVEL,
    description: 'Start each run with weapons at higher level',
    icon: '↑',
    maxLevel: 2,
    baseCost: 500,
    costMultiplier: 3.0,
  },
  [BuildingType.NATURE_DAMAGE]: {
    name: '+15% Nature Damage',
    type: BuildingType.NATURE_DAMAGE,
    description: 'Increases damage from nature/poison weapons by 15% per level',
    icon: '🌿',
    maxLevel: 10,
    baseCost: 120,
    costMultiplier: 1.6,
  },
  [BuildingType.PHYSICAL_DAMAGE]: {
    name: '+15% Physical Damage',
    type: BuildingType.PHYSICAL_DAMAGE,
    description: 'Increases damage from physical/piercing weapons by 15% per level',
    icon: '▶',
    maxLevel: 10,
    baseCost: 120,
    costMultiplier: 1.6,
  },
  [BuildingType.ALLY_DAMAGE]: {
    name: '+15% Ally Damage',
    type: BuildingType.ALLY_DAMAGE,
    description: 'Increases damage from summoned allies/drones by 15% per level',
    icon: '◉',
    maxLevel: 10,
    baseCost: 120,
    costMultiplier: 1.6,
  },
  [BuildingType.FIRE_DAMAGE]: {
    name: '+15% Fire Damage',
    type: BuildingType.FIRE_DAMAGE,
    description: 'Increases damage from fire/explosive weapons by 15% per level',
    icon: '🔥',
    maxLevel: 10,
    baseCost: 120,
    costMultiplier: 1.6,
  },
  [BuildingType.COLD_DAMAGE]: {
    name: '+15% Cold Damage',
    type: BuildingType.COLD_DAMAGE,
    description: 'Increases damage from ice/frost weapons by 15% per level',
    icon: '❄',
    maxLevel: 10,
    baseCost: 120,
    costMultiplier: 1.6,
  },
  [BuildingType.WEAPON_SLOT]: {
    name: '+1 Weapon Slot',
    type: BuildingType.WEAPON_SLOT,
    description: 'Adds one additional weapon slot',
    icon: '⚔',
    maxLevel: 1,
    baseCost: 1000,
    costMultiplier: 2.5,
  },
  [BuildingType.PASSIVE_SLOT]: {
    name: '+1 Passive Slot',
    type: BuildingType.PASSIVE_SLOT,
    description: 'Adds one additional passive slot',
    icon: '◈',
    maxLevel: 1,
    baseCost: 1000,
    costMultiplier: 2.5,
  },
  [BuildingType.AOE_RADIUS]: {
    name: '+10% AOE Radius',
    type: BuildingType.AOE_RADIUS,
    description: 'Increases area of effect radius by 10% per level',
    icon: '◯',
    maxLevel: 10,
    baseCost: 150,
    costMultiplier: 1.5,
  },
  [BuildingType.PICKUP_RADIUS]: {
    name: '+20% Pickup Radius',
    type: BuildingType.PICKUP_RADIUS,
    description: 'Increases pickup range for XP and items by 20% per level',
    icon: '⊕',
    maxLevel: 10,
    baseCost: 100,
    costMultiplier: 1.4,
  },
  [BuildingType.DAMAGE_REDUCTION]: {
    name: '+2 Damage Reduction',
    type: BuildingType.DAMAGE_REDUCTION,
    description: 'Reduces incoming damage by 2 per level',
    icon: '⛊',
    maxLevel: 10,
    baseCost: 150,
    costMultiplier: 1.6,
  },
  [BuildingType.UPGRADE_OPTIONS]: {
    name: '+1 Upgrade Option',
    type: BuildingType.UPGRADE_OPTIONS,
    description: 'Increases the number of upgrade choices when leveling up from 3 to 4',
    icon: '+',
    maxLevel: 1,
    baseCost: 800,
    costMultiplier: 2.0,
  },
  // Combat tree additions
  [BuildingType.PROJECTILE_SPEED]: {
    name: '+15% Projectile Speed',
    type: BuildingType.PROJECTILE_SPEED,
    description: 'Increases projectile velocity by 15% per level',
    icon: '➤',
    maxLevel: 10,
    baseCost: 100,
    costMultiplier: 1.5,
  },
  [BuildingType.CRIT_CHANCE]: {
    name: '+2% Critical Chance',
    type: BuildingType.CRIT_CHANCE,
    description: 'Increases critical hit chance by 2% per level',
    icon: '★',
    maxLevel: 10,
    baseCost: 150,
    costMultiplier: 1.6,
  },
  [BuildingType.BURNING_AMPLIFY]: {
    name: 'Elemental Weakness',
    type: BuildingType.BURNING_AMPLIFY,
    description: 'Burning enemies take +8% more elemental damage per level',
    icon: '🔥',
    maxLevel: 5,
    baseCost: 200,
    costMultiplier: 1.8,
  },
  [BuildingType.POISON_AMPLIFY]: {
    name: 'Physical Weakness',
    type: BuildingType.POISON_AMPLIFY,
    description: 'Poisoned enemies take +8% more physical damage per level',
    icon: '☠',
    maxLevel: 5,
    baseCost: 200,
    costMultiplier: 1.8,
  },
  [BuildingType.PROJECTILE_COUNT]: {
    name: '+1 Projectile',
    type: BuildingType.PROJECTILE_COUNT,
    description: 'Adds one additional projectile to all weapons',
    icon: '⚔',
    maxLevel: 1,
    baseCost: 1200,
    costMultiplier: 2.0,
  },
  // Survival tree additions
  [BuildingType.MOVE_SPEED]: {
    name: '+5% Move Speed',
    type: BuildingType.MOVE_SPEED,
    description: 'Increases movement speed by 5% per level',
    icon: '⚡',
    maxLevel: 10,
    baseCost: 100,
    costMultiplier: 1.5,
  },
  [BuildingType.REGEN]: {
    name: '+0.5 HP Regen/sec',
    type: BuildingType.REGEN,
    description: 'Regenerate 0.5 health per second per level',
    icon: '♥',
    maxLevel: 10,
    baseCost: 150,
    costMultiplier: 1.6,
  },
  [BuildingType.HEALTH_DROP_RATE]: {
    name: '+15% Health Drop Rate',
    type: BuildingType.HEALTH_DROP_RATE,
    description: 'Enemies have +15% chance to drop health packs per level',
    icon: '❤',
    maxLevel: 10,
    baseCost: 120,
    costMultiplier: 1.5,
  },
  [BuildingType.HEALTH_PACK_VALUE]: {
    name: '+20% Health Pack Value',
    type: BuildingType.HEALTH_PACK_VALUE,
    description: 'Health packs restore +20% more health per level',
    icon: '+',
    maxLevel: 10,
    baseCost: 120,
    costMultiplier: 1.5,
  },
  [BuildingType.WAVE_HEAL]: {
    name: 'Wave Heal',
    type: BuildingType.WAVE_HEAL,
    description: 'Heal 1 HP when clearing a wave',
    icon: '∿',
    maxLevel: 5,
    baseCost: 180,
    costMultiplier: 1.7,
  },
  [BuildingType.ALLY_WALL_COUNT]: {
    name: '+2 Wall Allies',
    type: BuildingType.ALLY_WALL_COUNT,
    description: 'Start with +2 wall allies that explode on contact',
    icon: '▮',
    maxLevel: 5,
    baseCost: 200,
    costMultiplier: 1.8,
  },
  [BuildingType.ALLY_WALL_DAMAGE]: {
    name: '+25% Wall Ally Damage',
    type: BuildingType.ALLY_WALL_DAMAGE,
    description: 'Wall ally explosions deal +25% more damage per level',
    icon: '▮',
    maxLevel: 10,
    baseCost: 150,
    costMultiplier: 1.6,
  },
  [BuildingType.ALLY_RANGED_UNLOCK]: {
    name: 'Unlock Ranged Ally',
    type: BuildingType.ALLY_RANGED_UNLOCK,
    description: 'Unlocks ranged ally ship that shoots at enemies',
    icon: '◉',
    maxLevel: 1,
    baseCost: 400,
    costMultiplier: 2.0,
  },
  [BuildingType.ALLY_RANGED_COUNT]: {
    name: '+1 Ranged Ally',
    type: BuildingType.ALLY_RANGED_COUNT,
    description: 'Adds one additional ranged ally',
    icon: '◉',
    maxLevel: 3,
    baseCost: 300,
    costMultiplier: 2.0,
  },
  [BuildingType.ALLY_RANGED_RATE]: {
    name: '+20% Ally Attack Speed',
    type: BuildingType.ALLY_RANGED_RATE,
    description: 'Ranged allies attack 20% faster per level',
    icon: '◎',
    maxLevel: 10,
    baseCost: 150,
    costMultiplier: 1.6,
  },
  [BuildingType.INVULN_TIME]: {
    name: '+10% Invuln Time',
    type: BuildingType.INVULN_TIME,
    description: 'Invulnerability after taking damage lasts +10% longer per level',
    icon: '⛊',
    maxLevel: 10,
    baseCost: 120,
    costMultiplier: 1.5,
  },
  [BuildingType.REVIVE]: {
    name: 'Second Chance',
    type: BuildingType.REVIVE,
    description: 'Revive once per run with 50% health',
    icon: '✦',
    maxLevel: 1,
    baseCost: 1500,
    costMultiplier: 2.0,
  },
  // Growth tree additions
  [BuildingType.CREDIT_DROP_RATE]: {
    name: '+10% Credit Drops',
    type: BuildingType.CREDIT_DROP_RATE,
    description: 'Enemies drop +10% more credits per level',
    icon: '¤',
    maxLevel: 10,
    baseCost: 100,
    costMultiplier: 1.5,
  },
  [BuildingType.WIN_BONUS]: {
    name: '+50 Win Bonus',
    type: BuildingType.WIN_BONUS,
    description: 'Earn +50 credits for completing a run per level',
    icon: '✓',
    maxLevel: 10,
    baseCost: 120,
    costMultiplier: 1.6,
  },
  [BuildingType.BOSS_BONUS]: {
    name: '+25 Boss Bonus',
    type: BuildingType.BOSS_BONUS,
    description: 'Earn +25 credits for killing a boss per level',
    icon: '⚔',
    maxLevel: 10,
    baseCost: 120,
    costMultiplier: 1.6,
  },
  [BuildingType.GOLD_CHEST_CHANCE]: {
    name: '+5% Gold Chest Chance',
    type: BuildingType.GOLD_CHEST_CHANCE,
    description: 'Increases chance for gold chests to spawn by 5% per level',
    icon: '▣',
    maxLevel: 10,
    baseCost: 150,
    costMultiplier: 1.7,
  },
  [BuildingType.CHEST_VALUE]: {
    name: '+15% Chest Value',
    type: BuildingType.CHEST_VALUE,
    description: 'Chests give +15% more credits per level',
    icon: '◆',
    maxLevel: 10,
    baseCost: 130,
    costMultiplier: 1.6,
  },
  [BuildingType.MAGNET_DURATION]: {
    name: '+0.5s Magnet Duration',
    type: BuildingType.MAGNET_DURATION,
    description: 'XP and credit pickups are magnetic for +0.5s longer per level',
    icon: '⊙',
    maxLevel: 10,
    baseCost: 100,
    costMultiplier: 1.4,
  },
  [BuildingType.REROLL_UNLOCK]: {
    name: 'Unlock Reroll',
    type: BuildingType.REROLL_UNLOCK,
    description: 'Unlocks reroll button on level-up screen',
    icon: '↻',
    maxLevel: 1,
    baseCost: 500,
    costMultiplier: 2.0,
  },
  [BuildingType.REROLL_CHARGES]: {
    name: '+1 Reroll Charge',
    type: BuildingType.REROLL_CHARGES,
    description: 'Adds one additional reroll charge per level',
    icon: '↻',
    maxLevel: 3,
    baseCost: 400,
    costMultiplier: 2.2,
  },
  [BuildingType.REROLL_ALLY_UNLOCK]: {
    name: 'Unlock Reroll Ally',
    type: BuildingType.REROLL_ALLY_UNLOCK,
    description: 'Unlocks ally ship that generates reroll charges',
    icon: '◎',
    maxLevel: 1,
    baseCost: 800,
    costMultiplier: 2.0,
  },
  [BuildingType.REROLL_ALLY_RATE]: {
    name: '+25% Reroll Ally Rate',
    type: BuildingType.REROLL_ALLY_RATE,
    description: 'Reroll ally generates charges +25% faster per level',
    icon: '◉',
    maxLevel: 10,
    baseCost: 200,
    costMultiplier: 1.8,
  },
  [BuildingType.DISCOUNT]: {
    name: '-5% Upgrade Cost',
    type: BuildingType.DISCOUNT,
    description: 'All in-run upgrades cost -5% less per level',
    icon: '%',
    maxLevel: 10,
    baseCost: 150,
    costMultiplier: 1.7,
  },
  [BuildingType.GREED]: {
    name: 'Greed',
    type: BuildingType.GREED,
    description: '+1% XP and Credits for every 100 credits held in-run per level',
    icon: '$',
    maxLevel: 5,
    baseCost: 300,
    costMultiplier: 2.0,
  },
  [BuildingType.LUCKY]: {
    name: '+10% Rare Odds',
    type: BuildingType.LUCKY,
    description: '+10% better odds for rare upgrades per level',
    icon: '☆',
    maxLevel: 10,
    baseCost: 200,
    costMultiplier: 1.8,
  },
}

export interface BuildingState {
  type: BuildingType
  level: number
}

export class Building {
  private config: BuildingConfig
  private level: number

  constructor(type: BuildingType, level: number = 0) {
    this.config = BUILDING_CONFIGS[type]
    if (!this.config) {
      console.warn(`Invalid building type: ${type}`)
      // Fallback to DAMAGE if config is missing
      this.config = BUILDING_CONFIGS[BuildingType.DAMAGE]
    }
    this.level = level
  }

  getConfig(): BuildingConfig {
    return this.config
  }

  getLevel(): number {
    return this.level
  }

  canUpgrade(): boolean {
    return this.level < this.config.maxLevel
  }

  getUpgradeCost(): number {
    if (!this.canUpgrade()) return 0
    return Math.floor(this.config.baseCost * Math.pow(this.config.costMultiplier, this.level))
  }

  upgrade(): boolean {
    if (!this.canUpgrade()) return false
    this.level++
    return true
  }

  // Get benefits based on building type and level
  getBenefits(): { [key: string]: number } {
    switch (this.config.type) {
      case BuildingType.DAMAGE:
        return {
          damageMultiplier: 0.1 * this.level, // 10% per level
        }
      case BuildingType.HEALTH:
        return {
          maxHealth: 20 * this.level,
        }
      case BuildingType.ATTACK_SPEED:
        return {
          attackSpeed: 0.05 * this.level, // 5% per level
        }
      case BuildingType.XP_GAIN:
        return {
          xpMultiplier: 0.1 * this.level, // 10% per level
        }
      case BuildingType.CREDIT_GAIN:
        return {
          creditMultiplier: 0.1 * this.level, // 10% per level
        }
      case BuildingType.STARTING_WEAPON_LEVEL:
        return {
          startingWeaponLevel: this.level,
        }
      case BuildingType.NATURE_DAMAGE:
        return {
          natureDamage: 0.15 * this.level, // 15% per level
        }
      case BuildingType.PHYSICAL_DAMAGE:
        return {
          physicalDamage: 0.15 * this.level, // 15% per level
        }
      case BuildingType.ALLY_DAMAGE:
        return {
          allyDamage: 0.15 * this.level, // 15% per level
        }
      case BuildingType.FIRE_DAMAGE:
        return {
          fireDamage: 0.15 * this.level, // 15% per level
        }
      case BuildingType.COLD_DAMAGE:
        return {
          coldDamage: 0.15 * this.level, // 15% per level
        }
      case BuildingType.WEAPON_SLOT:
        return {
          weaponSlots: this.level, // +1 per level
        }
      case BuildingType.PASSIVE_SLOT:
        return {
          passiveSlots: this.level, // +1 per level
        }
      case BuildingType.AOE_RADIUS:
        return {
          aoeRadiusMultiplier: 0.1 * this.level, // 10% per level
        }
      case BuildingType.PICKUP_RADIUS:
        return {
          pickupRadiusMultiplier: 0.2 * this.level, // 20% per level
        }
      case BuildingType.DAMAGE_REDUCTION:
        return {
          damageReduction: 2 * this.level, // 2 per level
        }
      case BuildingType.UPGRADE_OPTIONS:
        return {
          upgradeOptions: this.level, // +1 upgrade option
        }
      // Combat tree additions
      case BuildingType.PROJECTILE_SPEED:
        return {
          projectileSpeed: 0.15 * this.level, // 15% per level
        }
      case BuildingType.CRIT_CHANCE:
        return {
          critChance: 0.02 * this.level, // 2% per level
        }
      case BuildingType.BURNING_AMPLIFY:
        return {
          burningAmplify: 0.08 * this.level, // 8% per level
        }
      case BuildingType.POISON_AMPLIFY:
        return {
          poisonAmplify: 0.08 * this.level, // 8% per level
        }
      case BuildingType.PROJECTILE_COUNT:
        return {
          projectileCount: this.level, // +1 per level
        }
      // Survival tree additions
      case BuildingType.MOVE_SPEED:
        return {
          moveSpeed: 0.05 * this.level, // 5% per level
        }
      case BuildingType.REGEN:
        return {
          healthRegen: 0.5 * this.level, // 0.5 HP/sec per level
        }
      case BuildingType.HEALTH_DROP_RATE:
        return {
          healthDropRate: 0.15 * this.level, // 15% per level
        }
      case BuildingType.HEALTH_PACK_VALUE:
        return {
          healthPackValue: 0.2 * this.level, // 20% per level
        }
      case BuildingType.WAVE_HEAL:
        return {
          waveHeal: this.level, // 1 HP per level
        }
      case BuildingType.ALLY_WALL_COUNT:
        return {
          allyWallCount: 2 * this.level, // +2 allies per level
        }
      case BuildingType.ALLY_WALL_DAMAGE:
        return {
          allyWallDamage: 0.25 * this.level, // 25% per level
        }
      case BuildingType.ALLY_RANGED_UNLOCK:
        return {
          allyRangedUnlocked: this.level > 0 ? 1 : 0, // Unlocked if level > 0
        }
      case BuildingType.ALLY_RANGED_COUNT:
        return {
          allyRangedCount: this.level, // +1 per level
        }
      case BuildingType.ALLY_RANGED_RATE:
        return {
          allyRangedRate: 0.2 * this.level, // 20% per level
        }
      case BuildingType.INVULN_TIME:
        return {
          invulnTime: 0.1 * this.level, // 10% per level
        }
      case BuildingType.REVIVE:
        return {
          revive: this.level > 0 ? 1 : 0, // 1 revive if level > 0
        }
      // Growth tree additions
      case BuildingType.CREDIT_DROP_RATE:
        return {
          creditDropRate: 0.1 * this.level, // 10% per level
        }
      case BuildingType.WIN_BONUS:
        return {
          winBonus: 50 * this.level, // +50 credits per level
        }
      case BuildingType.BOSS_BONUS:
        return {
          bossBonus: 25 * this.level, // +25 credits per level
        }
      case BuildingType.GOLD_CHEST_CHANCE:
        return {
          goldChestChance: 0.05 * this.level, // 5% per level
        }
      case BuildingType.CHEST_VALUE:
        return {
          chestValue: 0.15 * this.level, // 15% per level
        }
      case BuildingType.MAGNET_DURATION:
        return {
          magnetDuration: 0.5 * this.level, // 0.5s per level
        }
      case BuildingType.REROLL_UNLOCK:
        return {
          rerollUnlocked: this.level > 0 ? 1 : 0, // Unlocked if level > 0
        }
      case BuildingType.REROLL_CHARGES:
        return {
          rerollCharges: this.level, // +1 per level
        }
      case BuildingType.REROLL_ALLY_UNLOCK:
        return {
          rerollAllyUnlocked: this.level > 0 ? 1 : 0, // Unlocked if level > 0
        }
      case BuildingType.REROLL_ALLY_RATE:
        return {
          rerollAllyRate: 0.25 * this.level, // 25% per level
        }
      case BuildingType.DISCOUNT:
        return {
          discount: 0.05 * this.level, // 5% per level
        }
      case BuildingType.GREED:
        return {
          greed: 0.01 * this.level, // 1% per level
        }
      case BuildingType.LUCKY:
        return {
          lucky: 0.1 * this.level, // 10% per level
        }
      default:
        return {}
    }
  }

  serialize(): BuildingState {
    return {
      type: this.config.type,
      level: this.level,
    }
  }

  static deserialize(state: BuildingState): Building {
    return new Building(state.type, state.level)
  }
}
