/**
 * UI Constants
 *
 * Colors, layout dimensions, and visual styling constants.
 * Centralizing these makes the UI consistent and easy to theme.
 *
 * COLOR FORMAT: Hex strings (e.g., '#ff0000') or hex numbers (e.g., 0xff0000)
 */

// =============================================================================
// COLOR PALETTE
// =============================================================================

export const COLORS = {
  // Primary UI Colors
  PRIMARY: '#ffff00', // Yellow
  SECONDARY: '#00ffff', // Cyan
  SUCCESS: '#00ff00', // Green
  WARNING: '#ff8800', // Orange
  DANGER: '#ff0000', // Red
  INFO: '#00aaff', // Light Blue

  // Character/Damage Type Colors
  PHYSICAL: '#ffff00', // Yellow
  FIRE: '#ff8800', // Orange
  COLD: '#00aaff', // Blue
  NATURE: '#00ff00', // Green
  DARK: '#8800ff', // Purple
  BLOOD: '#ff0000', // Red

  // UI Background Colors
  BG_DARK: '#000000',
  BG_SEMI: 0x000000, // For Phaser (with alpha)
  BG_BUTTON: 0x2a2a4a,
  BG_BUTTON_HOVER: 0x3a3a6a,
  BG_BUTTON_DISABLED: 0x444444,

  // Special UI Colors
  ECLIPSE_PURPLE: '#ff00ff', // Eclipse unlimited rerolls
  CRIT_YELLOW: '#ffff00',
  XP_GREEN: '#00ff00',
  CREDIT_GOLD: '#ffd700',
  HEALTH_RED: '#ff0000',

  // Text Colors
  TEXT_WHITE: '#ffffff',
  TEXT_GRAY: '#888888',
  TEXT_BLACK: '#000000',
} as const

// =============================================================================
// FONTS
// =============================================================================

export const FONTS = {
  /** Primary game font */
  PRIMARY: 'Courier New',

  /** Font sizes */
  SIZE: {
    HUGE: '72px',
    TITLE: '48px',
    LARGE: '32px',
    MEDIUM: '24px',
    NORMAL: '18px',
    SMALL: '16px',
    TINY: '14px',
    MICRO: '12px',
  },

  /** Font weights */
  WEIGHT: {
    NORMAL: 'normal',
    BOLD: 'bold',
  },
} as const

// =============================================================================
// LAYOUT DIMENSIONS
// =============================================================================

export const LAYOUT = {
  /** Screen width (mobile-first) */
  WIDTH: 540,

  /** Screen height */
  HEIGHT: 960,

  /** Top UI bar height */
  TOP_BAR: 100,

  /** Bottom UI bar height */
  BOTTOM_BAR: 80,

  /** Playable area top boundary */
  PLAY_AREA_TOP: 100,

  /** Playable area bottom boundary */
  PLAY_AREA_BOTTOM: 880, // 960 - 80

  /** Safe area margin */
  MARGIN: 20,
} as const

// =============================================================================
// BUTTON STYLES
// =============================================================================

export const BUTTONS = {
  /** Standard button dimensions */
  STANDARD: {
    WIDTH: 180,
    HEIGHT: 50,
  },

  /** Large button (level-up options) */
  LARGE: {
    WIDTH: 460,
    HEIGHT: 120,
  },

  /** Small button (skip, menu) */
  SMALL: {
    WIDTH: 100,
    HEIGHT: 40,
  },

  /** Corner radius for rounded buttons */
  RADIUS: 8,

  /** Button padding */
  PADDING: 10,
} as const

// =============================================================================
// LEVEL-UP MENU
// =============================================================================

export const LEVEL_UP_MENU = {
  /** Overlay alpha (transparency) */
  OVERLAY_ALPHA: 0.7,

  /** Title position Y */
  TITLE_Y: 80,

  /** Subtitle position Y */
  SUBTITLE_Y: 130,

  /** First button Y position */
  BUTTONS_START_Y: 175,

  /** Spacing between buttons */
  BUTTON_SPACING: 10,

  /** Button dimensions */
  BUTTON_WIDTH: 460,
  BUTTON_HEIGHT: 120,

  /** Icon size */
  ICON_SIZE: 48,

  /** Icon offset from left */
  ICON_OFFSET: 40,

  /** Text offset from left */
  TEXT_OFFSET: 100,
} as const

// =============================================================================
// HUD ELEMENTS
// =============================================================================

export const HUD = {
  /** Health bar */
  HEALTH_BAR: {
    WIDTH: 200,
    HEIGHT: 20,
    X: 20,
    Y: 45,
    BG_COLOR: 0x440000,
    FILL_COLOR: 0xff0000,
  },

  /** XP bar */
  XP_BAR: {
    WIDTH: 200,
    HEIGHT: 10,
    X: 20,
    Y: 70,
    BG_COLOR: 0x444400,
    FILL_COLOR: 0xffff00,
  },

  /** Wave progress bar */
  WAVE_BAR: {
    WIDTH: 200,
    HEIGHT: 10,
    BG_COLOR: 0x333333,
    FILL_COLOR: 0x00ff00,
  },

  /** Boss health bar */
  BOSS_BAR: {
    WIDTH: 500,
    HEIGHT: 30,
    BG_COLOR: 0x440000,
    FILL_COLOR: 0xff0000,
  },

  /** Buff icon size */
  BUFF_ICON_SIZE: 24,

  /** Weapon/passive slot size */
  SLOT_SIZE: 36,
  SLOT_SPACING: 45,
} as const

// =============================================================================
// ANIMATIONS
// =============================================================================

export const ANIMATIONS = {
  /** Fade in duration */
  FADE_IN: 300,

  /** Fade out duration */
  FADE_OUT: 300,

  /** Button hover scale */
  BUTTON_SCALE: 1.05,

  /** Icon hover scale */
  ICON_SCALE: 1.2,

  /** Damage number rise duration */
  DAMAGE_NUMBER_DURATION: 1000,

  /** Damage number rise distance */
  DAMAGE_NUMBER_RISE: 40,

  /** Hit flash duration */
  HIT_FLASH: 100,

  /** Pickup collection tween duration */
  PICKUP_COLLECT: 300,
} as const

// =============================================================================
// Z-INDEX / DEPTH LAYERS
// =============================================================================

export const DEPTH = {
  BACKGROUND: 0,
  GAME_WORLD: 10,
  PLAYER: 20,
  PROJECTILES: 15,
  ENEMIES: 12,
  EFFECTS: 25,
  UI_BASE: 50,
  UI_TEXT: 60,
  MENU_OVERLAY: 100,
  MENU_CONTENT: 101,
  POPUP: 200,
  POPUP_CONTENT: 201,
  DEBUG: 1000,
} as const

// =============================================================================
// TEXT STYLES (Pre-configured for common use cases)
// =============================================================================

export const TEXT_STYLES = {
  TITLE: {
    fontFamily: FONTS.PRIMARY,
    fontSize: FONTS.SIZE.TITLE,
    color: COLORS.PRIMARY,
    fontStyle: FONTS.WEIGHT.BOLD,
  },

  SUBTITLE: {
    fontFamily: FONTS.PRIMARY,
    fontSize: FONTS.SIZE.MEDIUM,
    color: COLORS.TEXT_WHITE,
  },

  BODY: {
    fontFamily: FONTS.PRIMARY,
    fontSize: FONTS.SIZE.NORMAL,
    color: COLORS.TEXT_WHITE,
  },

  HUD: {
    fontFamily: FONTS.PRIMARY,
    fontSize: FONTS.SIZE.MEDIUM,
    color: COLORS.TEXT_WHITE,
  },

  DAMAGE_NORMAL: {
    fontFamily: FONTS.PRIMARY,
    fontSize: FONTS.SIZE.SMALL,
    color: COLORS.TEXT_WHITE,
  },

  DAMAGE_CRIT: {
    fontFamily: FONTS.PRIMARY,
    fontSize: FONTS.SIZE.LARGE,
    color: COLORS.CRIT_YELLOW,
    fontStyle: FONTS.WEIGHT.BOLD,
  },
} as const

// =============================================================================
// HELPER TYPES
// =============================================================================

/** Type-safe color keys */
export type ColorKey = keyof typeof COLORS

/** Type-safe font size keys */
export type FontSizeKey = keyof typeof FONTS.SIZE

/** Ensure constants are readonly */
export type ReadonlyUIConstants = {
  readonly [K in keyof typeof import('./UIConstants')]: Readonly<
    (typeof import('./UIConstants'))[K]
  >
}
