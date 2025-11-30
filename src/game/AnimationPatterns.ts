/**
 * Animation Patterns for Galaga-style enemy wave entrances and exits
 * Defines entry/exit animation types, configurations, and presets
 */

// ============================================================================
// ENTRY ANIMATION TYPES
// ============================================================================

export type EntryDirection = 'top' | 'left' | 'right' | 'top-left' | 'top-right'

export type EntryPatternType =
  | 'straight'      // Direct fly-in to position
  | 'curve-in'      // Curve from side to position (bezier)
  | 'dive-arc'      // Dive from top in an arc, go below target then up
  | 'loop'          // Loop-de-loop then settle
  | 'spiral-in'     // Spiral inward to position
  | 'swoop'         // Swoop in from side, curve up then down to settle
  | 'zigzag-in'     // Zigzag approach with dampening
  | 'bounce-in'     // Overshoot then bounce back to position
  // New patterns
  | 'figure-8'      // Classic figure-8 loop path before settling
  | 'pendulum'      // Swing side-to-side while descending
  | 'corkscrew'     // Tight rotating descent
  | 's-curve'       // S-shaped curve path
  | 'split-entry'   // Veer away then curve back to target
  | 'delayed-drop'  // Hover briefly at top then drop to position
  | 'wave-ride'     // Ride a sine wave down to position
  | 'pincer'        // Sharp angled military-style approach

export interface EntryAnimation {
  pattern: EntryPatternType
  direction: EntryDirection
  duration: number          // ms for entry animation
  easeFunction?: string     // Phaser ease (default: 'Sine.easeInOut')
  amplitude?: number        // Curve magnitude in pixels (default: 100)
}

// ============================================================================
// EXIT ANIMATION TYPES
// ============================================================================

export type ExitPatternType =
  | 'none'          // Current behavior - drift off bottom
  | 'dive-attack'   // Dive toward player position then off screen
  | 'swoop-left'    // Swoop off to the left
  | 'swoop-right'   // Swoop off to the right
  | 'scatter'       // Scatter in random direction
  | 'spiral-out'    // Spiral outward off screen
  // New patterns
  | 'loop-out'      // Loop before exiting off bottom
  | 'zigzag-out'    // Zigzag off screen
  | 'boomerang'     // Curve back before exiting
  | 'kamikaze'      // Fast diagonal dive at player
  | 'retreat-top'   // Exit back up through the top
  | 'strafe-exit'   // Strafe horizontally off screen

export interface ExitAnimation {
  pattern: ExitPatternType
  duration: number          // ms for exit animation
  easeFunction?: string     // Phaser ease (default: 'Quad.easeIn')
}

// ============================================================================
// ENTRY ANIMATION PRESETS
// ============================================================================

export const ENTRY_PRESETS: Record<string, EntryAnimation> = {
  // Simple/Fast entries (durations increased 25% for smoother feel)
  'dive-top': {
    pattern: 'straight',
    direction: 'top',
    duration: 1000,
    easeFunction: 'Sine.easeOut'
  },
  'dive-top-slow': {
    pattern: 'straight',
    direction: 'top',
    duration: 1500,
    easeFunction: 'Quad.easeOut'
  },

  // Curve entries from sides
  'sweep-left': {
    pattern: 'curve-in',
    direction: 'left',
    duration: 1500,
    amplitude: 150,
    easeFunction: 'Sine.easeInOut'
  },
  'sweep-right': {
    pattern: 'curve-in',
    direction: 'right',
    duration: 1500,
    amplitude: 150,
    easeFunction: 'Sine.easeInOut'
  },
  'sweep-left-wide': {
    pattern: 'curve-in',
    direction: 'left',
    duration: 1875,
    amplitude: 250,
    easeFunction: 'Sine.easeInOut'
  },
  'sweep-right-wide': {
    pattern: 'curve-in',
    direction: 'right',
    duration: 1875,
    amplitude: 250,
    easeFunction: 'Sine.easeInOut'
  },

  // Arc entries (dive below then up)
  'arc-left': {
    pattern: 'dive-arc',
    direction: 'top-left',
    duration: 1875,
    amplitude: 200,
    easeFunction: 'Sine.easeInOut'
  },
  'arc-right': {
    pattern: 'dive-arc',
    direction: 'top-right',
    duration: 1875,
    amplitude: 200,
    easeFunction: 'Sine.easeInOut'
  },
  'arc-top': {
    pattern: 'dive-arc',
    direction: 'top',
    duration: 1750,
    amplitude: 150,
    easeFunction: 'Sine.easeInOut'
  },

  // Loop entries
  'loop-top': {
    pattern: 'loop',
    direction: 'top',
    duration: 2500,
    amplitude: 80,
    easeFunction: 'Linear'
  },
  'loop-left': {
    pattern: 'loop',
    direction: 'top-left',
    duration: 2750,
    amplitude: 100,
    easeFunction: 'Linear'
  },
  'loop-right': {
    pattern: 'loop',
    direction: 'top-right',
    duration: 2750,
    amplitude: 100,
    easeFunction: 'Linear'
  },

  // Spiral entries
  'spiral-center': {
    pattern: 'spiral-in',
    direction: 'top',
    duration: 3125,
    amplitude: 100,
    easeFunction: 'Linear'
  },
  'spiral-tight': {
    pattern: 'spiral-in',
    direction: 'top',
    duration: 2500,
    amplitude: 60,
    easeFunction: 'Linear'
  },

  // Swoop entries (curve up then settle)
  'swoop-left': {
    pattern: 'swoop',
    direction: 'left',
    duration: 2250,
    amplitude: 200,
    easeFunction: 'Sine.easeOut'
  },
  'swoop-right': {
    pattern: 'swoop',
    direction: 'right',
    duration: 2250,
    amplitude: 200,
    easeFunction: 'Sine.easeOut'
  },

  // Zigzag entries
  'zigzag-top': {
    pattern: 'zigzag-in',
    direction: 'top',
    duration: 1750,
    amplitude: 80,
    easeFunction: 'Linear'
  },
  'zigzag-left': {
    pattern: 'zigzag-in',
    direction: 'top-left',
    duration: 2000,
    amplitude: 100,
    easeFunction: 'Linear'
  },
  'zigzag-right': {
    pattern: 'zigzag-in',
    direction: 'top-right',
    duration: 2000,
    amplitude: 100,
    easeFunction: 'Linear'
  },

  // Bounce entries
  'bounce-left': {
    pattern: 'bounce-in',
    direction: 'left',
    duration: 2000,
    amplitude: 50,
    easeFunction: 'Bounce.easeOut'
  },
  'bounce-right': {
    pattern: 'bounce-in',
    direction: 'right',
    duration: 2000,
    amplitude: 50,
    easeFunction: 'Bounce.easeOut'
  },
  'bounce-top': {
    pattern: 'bounce-in',
    direction: 'top',
    duration: 1750,
    amplitude: 40,
    easeFunction: 'Bounce.easeOut'
  },

  // ---- NEW ENTRY PATTERNS ----

  // Figure-8 entries (classic Galaga-style)
  'figure8-top': {
    pattern: 'figure-8',
    direction: 'top',
    duration: 2750,
    amplitude: 100,
    easeFunction: 'Linear'
  },
  'figure8-left': {
    pattern: 'figure-8',
    direction: 'top-left',
    duration: 3000,
    amplitude: 120,
    easeFunction: 'Linear'
  },
  'figure8-right': {
    pattern: 'figure-8',
    direction: 'top-right',
    duration: 3000,
    amplitude: 120,
    easeFunction: 'Linear'
  },

  // Pendulum entries (swinging descent)
  'pendulum-top': {
    pattern: 'pendulum',
    direction: 'top',
    duration: 2500,
    amplitude: 120,
    easeFunction: 'Sine.easeInOut'
  },
  'pendulum-wide': {
    pattern: 'pendulum',
    direction: 'top',
    duration: 3000,
    amplitude: 180,
    easeFunction: 'Sine.easeInOut'
  },

  // Corkscrew entries (tight spiral descent)
  'corkscrew-top': {
    pattern: 'corkscrew',
    direction: 'top',
    duration: 2250,
    amplitude: 60,
    easeFunction: 'Linear'
  },
  'corkscrew-left': {
    pattern: 'corkscrew',
    direction: 'top-left',
    duration: 2500,
    amplitude: 70,
    easeFunction: 'Linear'
  },
  'corkscrew-right': {
    pattern: 'corkscrew',
    direction: 'top-right',
    duration: 2500,
    amplitude: 70,
    easeFunction: 'Linear'
  },

  // S-curve entries
  's-curve-left': {
    pattern: 's-curve',
    direction: 'left',
    duration: 2000,
    amplitude: 150,
    easeFunction: 'Sine.easeInOut'
  },
  's-curve-right': {
    pattern: 's-curve',
    direction: 'right',
    duration: 2000,
    amplitude: 150,
    easeFunction: 'Sine.easeInOut'
  },
  's-curve-top': {
    pattern: 's-curve',
    direction: 'top',
    duration: 1875,
    amplitude: 120,
    easeFunction: 'Sine.easeInOut'
  },

  // Split-entry (veer away then back)
  'split-left': {
    pattern: 'split-entry',
    direction: 'left',
    duration: 2500,
    amplitude: 200,
    easeFunction: 'Quad.easeInOut'
  },
  'split-right': {
    pattern: 'split-entry',
    direction: 'right',
    duration: 2500,
    amplitude: 200,
    easeFunction: 'Quad.easeInOut'
  },

  // Delayed drop entries (hover then drop)
  'delayed-drop-top': {
    pattern: 'delayed-drop',
    direction: 'top',
    duration: 2250,
    amplitude: 50,
    easeFunction: 'Cubic.easeIn'
  },
  'delayed-drop-left': {
    pattern: 'delayed-drop',
    direction: 'top-left',
    duration: 2500,
    amplitude: 60,
    easeFunction: 'Cubic.easeIn'
  },
  'delayed-drop-right': {
    pattern: 'delayed-drop',
    direction: 'top-right',
    duration: 2500,
    amplitude: 60,
    easeFunction: 'Cubic.easeIn'
  },

  // Wave-ride entries (sine wave descent)
  'wave-ride-top': {
    pattern: 'wave-ride',
    direction: 'top',
    duration: 2250,
    amplitude: 80,
    easeFunction: 'Linear'
  },
  'wave-ride-left': {
    pattern: 'wave-ride',
    direction: 'top-left',
    duration: 2500,
    amplitude: 100,
    easeFunction: 'Linear'
  },
  'wave-ride-right': {
    pattern: 'wave-ride',
    direction: 'top-right',
    duration: 2500,
    amplitude: 100,
    easeFunction: 'Linear'
  },

  // Pincer entries (sharp military approach)
  'pincer-left': {
    pattern: 'pincer',
    direction: 'left',
    duration: 1750,
    amplitude: 100,
    easeFunction: 'Quad.easeOut'
  },
  'pincer-right': {
    pattern: 'pincer',
    direction: 'right',
    duration: 1750,
    amplitude: 100,
    easeFunction: 'Quad.easeOut'
  },
  'pincer-top-left': {
    pattern: 'pincer',
    direction: 'top-left',
    duration: 1875,
    amplitude: 120,
    easeFunction: 'Quad.easeOut'
  },
  'pincer-top-right': {
    pattern: 'pincer',
    direction: 'top-right',
    duration: 1875,
    amplitude: 120,
    easeFunction: 'Quad.easeOut'
  },
}

// ============================================================================
// EXIT ANIMATION PRESETS
// ============================================================================

export const EXIT_PRESETS: Record<string, ExitAnimation> = {
  // No exit animation - drift off bottom (current behavior)
  'none': {
    pattern: 'none',
    duration: 0
  },

  // Dive attack toward player (durations increased 25%)
  'dive': {
    pattern: 'dive-attack',
    duration: 1875,
    easeFunction: 'Quad.easeIn'
  },
  'dive-fast': {
    pattern: 'dive-attack',
    duration: 1250,
    easeFunction: 'Cubic.easeIn'
  },
  'dive-slow': {
    pattern: 'dive-attack',
    duration: 2500,
    easeFunction: 'Sine.easeIn'
  },

  // Swoop off to sides
  'swoop-left': {
    pattern: 'swoop-left',
    duration: 1500,
    easeFunction: 'Sine.easeIn'
  },
  'swoop-right': {
    pattern: 'swoop-right',
    duration: 1500,
    easeFunction: 'Sine.easeIn'
  },

  // Scatter in random directions
  'scatter': {
    pattern: 'scatter',
    duration: 1250,
    easeFunction: 'Quad.easeIn'
  },
  'scatter-slow': {
    pattern: 'scatter',
    duration: 1875,
    easeFunction: 'Sine.easeIn'
  },

  // Spiral outward
  'spiral-out': {
    pattern: 'spiral-out',
    duration: 2500,
    easeFunction: 'Linear'
  },

  // ---- NEW EXIT PATTERNS ----

  // Loop before exiting
  'loop-out': {
    pattern: 'loop-out',
    duration: 2000,
    easeFunction: 'Linear'
  },
  'loop-out-fast': {
    pattern: 'loop-out',
    duration: 1500,
    easeFunction: 'Linear'
  },

  // Zigzag off screen
  'zigzag-out': {
    pattern: 'zigzag-out',
    duration: 1750,
    easeFunction: 'Linear'
  },
  'zigzag-out-fast': {
    pattern: 'zigzag-out',
    duration: 1250,
    easeFunction: 'Linear'
  },

  // Boomerang (curve back then exit)
  'boomerang': {
    pattern: 'boomerang',
    duration: 2250,
    easeFunction: 'Sine.easeInOut'
  },
  'boomerang-fast': {
    pattern: 'boomerang',
    duration: 1750,
    easeFunction: 'Quad.easeIn'
  },

  // Kamikaze (fast diagonal at player)
  'kamikaze': {
    pattern: 'kamikaze',
    duration: 1000,
    easeFunction: 'Cubic.easeIn'
  },
  'kamikaze-slow': {
    pattern: 'kamikaze',
    duration: 1500,
    easeFunction: 'Quad.easeIn'
  },

  // Retreat back up through top
  'retreat-top': {
    pattern: 'retreat-top',
    duration: 1500,
    easeFunction: 'Quad.easeIn'
  },
  'retreat-top-fast': {
    pattern: 'retreat-top',
    duration: 1000,
    easeFunction: 'Cubic.easeIn'
  },

  // Strafe horizontally off screen
  'strafe-left': {
    pattern: 'strafe-exit',
    duration: 1250,
    easeFunction: 'Sine.easeIn'
  },
  'strafe-right': {
    pattern: 'strafe-exit',
    duration: 1250,
    easeFunction: 'Sine.easeIn'
  },
}

// ============================================================================
// BOSS ENTRY PRESETS (longer, more dramatic - durations increased 25%)
// ============================================================================

export const BOSS_ENTRY_PRESETS: Record<string, EntryAnimation> = {
  'boss-descent': {
    pattern: 'straight',
    direction: 'top',
    duration: 3125,
    easeFunction: 'Quad.easeOut'
  },
  'boss-descent-slow': {
    pattern: 'straight',
    direction: 'top',
    duration: 4375,
    easeFunction: 'Sine.easeOut'
  },
  'boss-strafe-left': {
    pattern: 'curve-in',
    direction: 'left',
    duration: 3750,
    amplitude: 250,
    easeFunction: 'Sine.easeInOut'
  },
  'boss-strafe-right': {
    pattern: 'curve-in',
    direction: 'right',
    duration: 3750,
    amplitude: 250,
    easeFunction: 'Sine.easeInOut'
  },
  'boss-dramatic-loop': {
    pattern: 'loop',
    direction: 'top',
    duration: 4375,
    amplitude: 150,
    easeFunction: 'Linear'
  },
  'boss-spiral': {
    pattern: 'spiral-in',
    direction: 'top',
    duration: 5000,
    amplitude: 180,
    easeFunction: 'Linear'
  },
}

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Resolve an entry animation from a preset name or direct config
 */
export function resolveEntryAnimation(
  config: EntryAnimation | string | undefined
): EntryAnimation | null {
  if (!config) return null

  if (typeof config === 'string') {
    // Check regular presets first, then boss presets
    return ENTRY_PRESETS[config] || BOSS_ENTRY_PRESETS[config] || null
  }

  return config
}

/**
 * Resolve an exit animation from a preset name or direct config
 */
export function resolveExitAnimation(
  config: ExitAnimation | string | undefined
): ExitAnimation | null {
  if (!config) return null

  if (typeof config === 'string') {
    return EXIT_PRESETS[config] || null
  }

  return config
}

/**
 * Get a random entry preset from a category
 */
export type EntryCategory =
  | 'simple' | 'curve' | 'arc' | 'loop' | 'spiral' | 'swoop' | 'zigzag' | 'bounce'
  | 'figure8' | 'pendulum' | 'corkscrew' | 'scurve' | 'split' | 'delayed' | 'waveride' | 'pincer'
  | 'any'

export function getRandomEntryPreset(category: EntryCategory): string {
  const categoryPresets: Record<string, string[]> = {
    simple: ['dive-top', 'dive-top-slow'],
    curve: ['sweep-left', 'sweep-right', 'sweep-left-wide', 'sweep-right-wide'],
    arc: ['arc-left', 'arc-right', 'arc-top'],
    loop: ['loop-top', 'loop-left', 'loop-right'],
    spiral: ['spiral-center', 'spiral-tight'],
    swoop: ['swoop-left', 'swoop-right'],
    zigzag: ['zigzag-top', 'zigzag-left', 'zigzag-right'],
    bounce: ['bounce-left', 'bounce-right', 'bounce-top'],
    // New categories
    figure8: ['figure8-top', 'figure8-left', 'figure8-right'],
    pendulum: ['pendulum-top', 'pendulum-wide'],
    corkscrew: ['corkscrew-top', 'corkscrew-left', 'corkscrew-right'],
    scurve: ['s-curve-left', 's-curve-right', 's-curve-top'],
    split: ['split-left', 'split-right'],
    delayed: ['delayed-drop-top', 'delayed-drop-left', 'delayed-drop-right'],
    waveride: ['wave-ride-top', 'wave-ride-left', 'wave-ride-right'],
    pincer: ['pincer-left', 'pincer-right', 'pincer-top-left', 'pincer-top-right'],
    any: Object.keys(ENTRY_PRESETS),
  }

  const presets = categoryPresets[category] || categoryPresets.any
  return presets[Math.floor(Math.random() * presets.length)]
}

/**
 * Get a random exit preset from a category
 */
export type ExitCategory =
  | 'dive' | 'swoop' | 'scatter' | 'spiral'
  | 'loop' | 'zigzag' | 'boomerang' | 'kamikaze' | 'retreat' | 'strafe'
  | 'any' | 'aggressive' | 'evasive'

export function getRandomExitPreset(
  category: ExitCategory = 'any',
  includeNone: boolean = false
): string {
  const categoryPresets: Record<string, string[]> = {
    dive: ['dive', 'dive-fast', 'dive-slow'],
    swoop: ['swoop-left', 'swoop-right'],
    scatter: ['scatter', 'scatter-slow'],
    spiral: ['spiral-out'],
    // New categories
    loop: ['loop-out', 'loop-out-fast'],
    zigzag: ['zigzag-out', 'zigzag-out-fast'],
    boomerang: ['boomerang', 'boomerang-fast'],
    kamikaze: ['kamikaze', 'kamikaze-slow'],
    retreat: ['retreat-top', 'retreat-top-fast'],
    strafe: ['strafe-left', 'strafe-right'],
    // Grouped categories
    aggressive: ['dive', 'dive-fast', 'kamikaze', 'kamikaze-slow'],
    evasive: ['retreat-top', 'strafe-left', 'strafe-right', 'scatter'],
    any: Object.keys(EXIT_PRESETS).filter(k => k !== 'none'),
  }

  const presets = categoryPresets[category] || categoryPresets.any
  if (includeNone) presets.push('none')

  return presets[Math.floor(Math.random() * presets.length)]
}
