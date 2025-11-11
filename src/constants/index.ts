/**
 * Constants Index
 *
 * Central export point for all game constants.
 * Import from here to get any constants you need.
 *
 * USAGE:
 *   import { PLAYER, CYCLONE, COLORS } from '../constants'
 *
 * OR import specific files for better tree-shaking:
 *   import { PLAYER } from '../constants/GameBalance'
 */

// Re-export all constants from their respective files
export * from './GameBalance'
export * from './CharacterBalance'
export * from './UIConstants'

/**
 * MIGRATION GUIDE FOR DEVELOPERS:
 *
 * When replacing magic numbers with constants:
 *
 * 1. Find the magic number in code
 *    Example: `this.health = 100`
 *
 * 2. Check if constant exists in constants/ files
 *    Search for "100" or "DEFAULT_HEALTH" in constants/
 *
 * 3. Import the constant at top of file
 *    `import { PLAYER } from '../constants'`
 *
 * 4. Replace the magic number
 *    `this.health = PLAYER.DEFAULT_HEALTH`
 *
 * 5. Test thoroughly!
 *
 * 6. Commit with message:
 *    "refactor: replace magic number with CONSTANT_NAME in FileName.ts"
 *
 * TIPS:
 * - Replace one file/section at a time
 * - Test after each change
 * - Don't batch changes - makes debugging harder
 * - If unsure, ask or create a TODO comment
 */
