/**
 * Character Balance Constants
 *
 * All character-specific balance values and ability modifiers.
 * These values define the unique playstyle of each ship.
 *
 * NAMING CONVENTION:
 * - UPPERCASE_CHARACTER_PROPERTY format (e.g., CYCLONE_DAMAGE_BONUS)
 * - Multipliers: 1.0 = no change, >1.0 = buff, <1.0 = nerf
 * - Fire rate: <1.0 = faster, >1.0 = slower (inverse)
 */

// =============================================================================
// CYCLONE - Focused Power
// =============================================================================

export const CYCLONE = {
  /** Damage multiplier when focused to single projectile */
  DAMAGE_BONUS: 2.0,

  /** Projectile count reduction (applied as minimum cap) */
  MIN_PROJECTILES: 1,
} as const

// =============================================================================
// ECLIPSE - Void Manipulator
// =============================================================================

export const ECLIPSE = {
  /** Damage penalty for unlimited rerolls */
  DAMAGE_PENALTY: 0.85, // -15% damage

  /** Flag value for unlimited rerolls */
  HAS_UNLIMITED_REROLLS: true,
} as const

// =============================================================================
// BASTION - Turret Mode
// =============================================================================

export const BASTION = {
  /** Damage bonus when rooted/firing */
  DAMAGE_BONUS: 1.75, // +75% damage

  /** Fire rate multiplier when rooted (inverse: lower = faster) */
  FIRE_RATE_MULTIPLIER: 0.667, // +50% attack speed

  /** Time window to check if fired recently (milliseconds) */
  FIRING_CHECK_WINDOW: 100,
} as const

// =============================================================================
// GLACIER - Cryo Suppressor
// =============================================================================

export const GLACIER = {
  /** Fire rate multiplier for Cold weapons (inverse: lower = faster) */
  FIRE_RATE_MULTIPLIER: 0.833, // +20% attack speed
} as const

// =============================================================================
// HAVOC - Continuous Fire
// =============================================================================

export const HAVOC = {
  /** Fire rate multiplier for Minigun (near-instant) */
  FIRE_RATE_MULTIPLIER: 0.01, // 99% faster

  /** Projectile speed bonus */
  PROJECTILE_SPEED_BONUS: 0.5, // +50%
} as const

// =============================================================================
// ZENITH - Orbital Command
// =============================================================================

export const ZENITH = {
  /** Additional strikes per barrage */
  PROJECTILE_BONUS: 1,

  /** Explosion radius multiplier */
  EXPLOSION_RADIUS_MULTIPLIER: 1.2, // +20%
} as const

// =============================================================================
// CORONA - Stellar Annihilator
// =============================================================================

export const CORONA = {
  /** Additional Fire projectiles */
  PROJECTILE_BONUS: 1,

  /** Burn duration multiplier */
  BURN_DURATION_MULTIPLIER: 1.3, // +30%
} as const

// =============================================================================
// WARDEN - Defensive Architect
// =============================================================================

export const WARDEN = {
  /** Trap lifetime multiplier */
  TRAP_DURATION_MULTIPLIER: 2.0, // 2x longer

  /** Additional traps per cast */
  TRAP_COUNT_BONUS: 1,
} as const

// =============================================================================
// REAPER - Soul Harvester
// =============================================================================

export const REAPER = {
  /** Execute threshold (health percentage) */
  EXECUTE_THRESHOLD: 0.15, // 15% HP

  /** Bleed damage bonus */
  BLEED_DAMAGE_BONUS: 0.2, // +20%
} as const

// =============================================================================
// SUPERNOVA - Living Star
// =============================================================================

export const SUPERNOVA = {
  /** XP gain multiplier */
  XP_MULTIPLIER: 1.30, // +30%

  /** Flag for auto-selecting upgrades */
  AUTO_SELECT_UPGRADES: true,
} as const

// =============================================================================
// VULCAN - Heavy Artillery
// =============================================================================

export const VULCAN = {
  /** Pickup radius bonus per X waves cleared */
  RADIUS_BONUS_PER_WAVES: 0.10, // +10%

  /** Number of waves required per bonus */
  WAVES_PER_BONUS: 2,

  /** XP gain multiplier */
  XP_MULTIPLIER: 1.05, // +5%
} as const

// =============================================================================
// SCATTERSHOT - Area Denial
// =============================================================================

export const SCATTERSHOT = {
  /** Damage reduction (incoming) */
  DAMAGE_REDUCTION: 0.15, // -15% incoming damage
} as const

// =============================================================================
// TSUNAMI - Hydro Destroyer
// =============================================================================

export const TSUNAMI = {
  /** Additional shots per attack */
  ADDITIONAL_SHOTS: 1,

  /** Damage multiplier per shot */
  DAMAGE_PER_SHOT: 0.65, // 65% damage per shot
} as const

// =============================================================================
// TEMPEST - Storm Caller
// =============================================================================

export const TEMPEST = {
  /** Crit chance bonus for Nature damage (additive %) */
  CRIT_CHANCE_BONUS: 20, // +20%
} as const

// =============================================================================
// INFERNO - Flame Weaver
// =============================================================================

export const INFERNO = {
  /** Pierce/bounce count bonus */
  PIERCE_BONUS: 1,
} as const

// =============================================================================
// REFLEX - Precision Fighter
// =============================================================================

export const REFLEX = {
  /** Ricochet/bounce count bonus */
  RICOCHET_BONUS: 1,

  /** Projectile speed bonus */
  PROJECTILE_SPEED_BONUS: 0.10, // +10%
} as const

// =============================================================================
// ARSENAL - Missile Platform
// =============================================================================

export const ARSENAL = {
  /** Additional missiles per salvo */
  PROJECTILE_BONUS: 1,

  /** Explosion radius multiplier */
  EXPLOSION_RADIUS_MULTIPLIER: 1.10, // +10%
} as const

// =============================================================================
// PHANTOM - Ghost Operative
// =============================================================================

export const PHANTOM = {
  /** Crit chance bonus for Snipers (additive %) */
  CRIT_CHANCE_BONUS: 100, // +100% crit

  /** Additional crit damage multiplier */
  CRIT_DAMAGE_BONUS: 1.5, // Combined with base = 3x total
} as const

// =============================================================================
// PHOTON - Energy Manipulator
// =============================================================================

export const PHOTON = {
  /** Heat gain multiplier (0.5 = overheats 50% slower) */
  HEAT_REDUCTION: 0.5, // 50% heat gain
} as const

// =============================================================================
// HELPER TYPES
// =============================================================================

/** Type-safe character constant keys */
export type CharacterConstantKey = keyof typeof import('./CharacterBalance')

/** Ensure all constants are readonly */
export type ReadonlyConstants = {
  readonly [K in keyof typeof import('./CharacterBalance')]: Readonly<
    (typeof import('./CharacterBalance'))[K]
  >
}
