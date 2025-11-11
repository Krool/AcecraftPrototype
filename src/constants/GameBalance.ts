/**
 * Game Balance Constants
 *
 * Centralized location for all game balance values.
 * Changing these values affects gameplay difficulty and feel.
 *
 * IMPORTANT: These are the single source of truth for balance.
 * Do not use magic numbers in game code - reference these constants instead.
 */

// =============================================================================
// PLAYER STATS
// =============================================================================

export const PLAYER = {
  /** Default max health for most characters */
  DEFAULT_HEALTH: 100,

  /** Default movement speed (pixels per second) */
  DEFAULT_MOVE_SPEED: 300,

  /** Default pickup radius for XP/credits (pixels) */
  DEFAULT_PICKUP_RADIUS: 100,

  /** Invulnerability duration after taking damage (milliseconds) */
  INVULN_FRAMES: 1000,
} as const

// =============================================================================
// WAVE & SPAWNING
// =============================================================================

export const WAVE_SPAWNING = {
  /** Starting time between enemy spawns (milliseconds) */
  BASE_SPAWN_RATE: 1500,

  /** Minimum spawn rate at maximum difficulty (milliseconds) */
  MIN_SPAWN_RATE: 400,

  /** Time before next wave starts after clearing (milliseconds) */
  WAVE_CLEAR_DELAY: 1000,

  /** Time before considering wave stuck (milliseconds) */
  WAVE_TIMEOUT: 120000, // 2 minutes
} as const

// =============================================================================
// CHEST SYSTEM
// =============================================================================

export const CHESTS = {
  /** Maximum chests that can spawn per run */
  MAX_PER_RUN: 5,

  /** Kill counts where guaranteed chests spawn */
  GUARANTEED_MILESTONES: [60, 120] as const,

  /** Base chance for random chest drop (0-100) */
  BASE_DROP_CHANCE: 3,

  /** Boss drop multiplier for random chest chance */
  BOSS_DROP_MULTIPLIER: 8,
} as const

// =============================================================================
// COMBAT SYSTEM
// =============================================================================

export const COMBAT = {
  /** Combo timeout duration (milliseconds) */
  COMBO_TIMEOUT: 3000,

  /** Default critical hit damage multiplier */
  DEFAULT_CRIT_DAMAGE: 1.5,

  /** Projectile spawn offset above player (pixels) */
  PROJECTILE_Y_OFFSET: -30,

  /** Enemy spawn Y position (above screen) */
  ENEMY_SPAWN_Y: -50,

  /** Random horizontal spawn offset range */
  ENEMY_SPAWN_VARIANCE: 60,
} as const

// =============================================================================
// ALLY SYSTEM
// =============================================================================

export const ALLIES = {
  /** Time before downed ally respawns (milliseconds) */
  RESPAWN_DELAY: 5000,
} as const

// =============================================================================
// FROST HASTE PASSIVE
// =============================================================================

export const FROST_HASTE = {
  /** Maximum number of stacks */
  MAX_STACKS: 15,

  /** Duration per stack (milliseconds) */
  STACK_DURATION: 5000,

  /** Attack speed bonus per stack (per level) */
  SPEED_PER_STACK: 0.05,
} as const

// =============================================================================
// UI LAYOUT
// =============================================================================

export const UI = {
  /** Height of top UI area (health, timer, etc.) */
  TOP_HEIGHT: 100,

  /** Height of bottom UI area (weapon/passive slots) */
  BOTTOM_HEIGHT: 80,

  /** HUD text size for primary stats */
  STAT_FONT_SIZE: '24px',

  /** HUD text size for secondary stats */
  DETAIL_FONT_SIZE: '14px',
} as const

// =============================================================================
// UPGRADE SYSTEM
// =============================================================================

export const UPGRADES = {
  /** Base number of upgrade options per level-up */
  BASE_OPTIONS: 3,

  /** Upgrade button width */
  BUTTON_WIDTH: 460,

  /** Upgrade button height */
  BUTTON_HEIGHT: 120,

  /** Spacing between upgrade buttons */
  BUTTON_SPACING: 10,

  /** Starting Y position for upgrade buttons */
  BUTTON_START_Y: 175,
} as const

// =============================================================================
// XP & LEVELING
// =============================================================================

export const XP = {
  /** Starting XP requirement for level 2 */
  INITIAL_REQUIREMENT: 30,

  /** XP requirement scaling per level (polynomial coefficients) */
  SCALING: {
    BASE: 30,
    LINEAR: 10,
    QUADRATIC: 5,
  },
} as const

// =============================================================================
// DAMAGE TRACKING
// =============================================================================

export const TRACKING = {
  /** Time window for DPS calculation (milliseconds) */
  DPS_WINDOW: 1000,

  /** Health spawn tracking window (milliseconds) */
  HEALTH_WINDOW: 1000,
} as const

// =============================================================================
// VISUAL EFFECTS
// =============================================================================

export const VFX = {
  /** Engine trail particle spawn rate (milliseconds) */
  ENGINE_TRAIL_RATE: 50,

  /** Hit flash duration (milliseconds) */
  HIT_FLASH_DURATION: 100,

  /** Damage number rise distance (pixels) */
  DAMAGE_NUMBER_RISE: 40,

  /** Damage number display duration (milliseconds) */
  DAMAGE_NUMBER_DURATION: 1000,
} as const

// =============================================================================
// HELPER TYPE (for TypeScript type safety)
// =============================================================================

// Make all constants deeply readonly at type level
export type DeepReadonly<T> = {
  readonly [P in keyof T]: T[P] extends object ? DeepReadonly<T[P]> : T[P]
}
