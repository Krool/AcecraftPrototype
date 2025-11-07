// @ts-ignore - zzfx doesn't have types
import { zzfx } from 'zzfx'

/**
 * Sound Manager for Roguecraft
 * Uses ZzFX for procedurally generated 8-bit sound effects
 *
 * ZzFX parameters: [volume, randomness, frequency, attack, sustain, release, shape, shapeCurve, vibrato, vibratoDepth, delay, delayVolume, reverb, reverbDelay, pitchJump, pitchJumpDelay]
 */

export enum SoundType {
  // Combat
  PLAYER_SHOOT_BASIC = 'PLAYER_SHOOT_BASIC',
  PLAYER_SHOOT_LASER = 'PLAYER_SHOOT_LASER',
  PLAYER_SHOOT_MISSILE = 'PLAYER_SHOOT_MISSILE',
  PLAYER_SHOOT_PLASMA = 'PLAYER_SHOOT_PLASMA',
  ENEMY_HIT = 'ENEMY_HIT',
  ENEMY_HIT_1 = 'ENEMY_HIT_1',
  ENEMY_HIT_2 = 'ENEMY_HIT_2',
  ENEMY_HIT_3 = 'ENEMY_HIT_3',
  ENEMY_HIT_4 = 'ENEMY_HIT_4',
  ENEMY_HIT_5 = 'ENEMY_HIT_5',
  ENEMY_EXPLODE = 'ENEMY_EXPLODE',
  ENEMY_EXPLODE_1 = 'ENEMY_EXPLODE_1',
  ENEMY_EXPLODE_2 = 'ENEMY_EXPLODE_2',
  ENEMY_EXPLODE_3 = 'ENEMY_EXPLODE_3',
  ENEMY_EXPLODE_4 = 'ENEMY_EXPLODE_4',
  ENEMY_EXPLODE_5 = 'ENEMY_EXPLODE_5',
  PLAYER_HIT = 'PLAYER_HIT',

  // Pickups
  XP_PICKUP = 'XP_PICKUP',
  CREDIT_PICKUP = 'CREDIT_PICKUP',
  POWERUP_PICKUP = 'POWERUP_PICKUP',

  // Chests
  CHEST_COMMON = 'CHEST_COMMON',
  CHEST_RARE = 'CHEST_RARE',
  CHEST_EPIC = 'CHEST_EPIC',

  // UI
  LEVEL_UP = 'LEVEL_UP',
  BUTTON_CLICK = 'BUTTON_CLICK',
  UPGRADE_SELECT = 'UPGRADE_SELECT',
  SHIP_UNLOCK = 'SHIP_UNLOCK',
  UPGRADE_PURCHASED = 'UPGRADE_PURCHASED',
}

// ZzFX sound definitions - tuned for 8-bit retro aesthetic
const SOUND_DEFINITIONS: Record<SoundType, number[]> = {
  // === COMBAT SOUNDS ===

  // Basic weapon - short pew
  [SoundType.PLAYER_SHOOT_BASIC]: [0.3, 0, 400, 0.01, 0.02, 0.1, 0, 1.5, 0, 0, 0, 0, 0, 0, 0, 0],

  // Laser - sustained beam sound
  [SoundType.PLAYER_SHOOT_LASER]: [0.3, 0, 800, 0.01, 0.08, 0.05, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0],

  // Missile - whoosh with slight delay
  [SoundType.PLAYER_SHOOT_MISSILE]: [0.4, 0, 300, 0.03, 0.1, 0.2, 1, 1, -10, 0, 0, 0, 0, 0, 0, 0],

  // Plasma - electric zap
  [SoundType.PLAYER_SHOOT_PLASMA]: [0.3, 0.1, 600, 0.01, 0.05, 0.05, 0, 2, 20, 0, 0, 0, 0, 0, 0, 0],

  // Enemy hit - impact sound (base)
  [SoundType.ENEMY_HIT]: [0.2, 0, 200, 0.01, 0.02, 0.05, 2, 0, 0, 0, 0, 0, 0, 0, 0, 0],

  // Enemy hit variations
  [SoundType.ENEMY_HIT_1]: [0.2, 0, 180, 0.01, 0.02, 0.05, 2, 0, 0, 0, 0, 0, 0, 0, 0, 0],
  [SoundType.ENEMY_HIT_2]: [0.2, 0, 220, 0.01, 0.025, 0.06, 2, 0.5, 0, 0, 0, 0, 0, 0, 0, 0],
  [SoundType.ENEMY_HIT_3]: [0.2, 0, 190, 0.01, 0.018, 0.05, 2, 1, 0, 0, 0, 0, 0, 0, 0, 0],
  [SoundType.ENEMY_HIT_4]: [0.2, 0, 210, 0.01, 0.022, 0.055, 2, 0.3, 0, 0, 0, 0, 0, 0, 0, 0],
  [SoundType.ENEMY_HIT_5]: [0.2, 0, 195, 0.01, 0.02, 0.05, 2, 0.7, 0, 0, 0, 0, 0, 0, 0, 0],

  // Enemy explosion - big boom (base)
  [SoundType.ENEMY_EXPLODE]: [0.5, 0, 100, 0.02, 0.3, 0.4, 3, 0, 0, 0, 0, 0, 0.2, 0, 0, 0],

  // Enemy explosion variations
  [SoundType.ENEMY_EXPLODE_1]: [0.5, 0, 90, 0.02, 0.3, 0.4, 3, 0.2, 0, 0, 0, 0, 0.2, 0, 0, 0],
  [SoundType.ENEMY_EXPLODE_2]: [0.5, 0, 110, 0.02, 0.32, 0.42, 3, 0.5, 0, 0, 0, 0, 0.22, 0, 0, 0],
  [SoundType.ENEMY_EXPLODE_3]: [0.5, 0, 95, 0.02, 0.28, 0.38, 3, 0.3, 0, 0, 0, 0, 0.18, 0, 0, 0],
  [SoundType.ENEMY_EXPLODE_4]: [0.5, 0, 105, 0.02, 0.31, 0.41, 3, 0.4, 0, 0, 0, 0, 0.21, 0, 0, 0],
  [SoundType.ENEMY_EXPLODE_5]: [0.5, 0, 98, 0.02, 0.29, 0.39, 3, 0.1, 0, 0, 0, 0, 0.19, 0, 0, 0],

  // Player hit - damage taken
  [SoundType.PLAYER_HIT]: [0.4, 0, 300, 0.01, 0.1, 0.2, 2, 1.5, -20, 0, 0, 0, 0, 0, 0, 0],

  // === PICKUP SOUNDS ===

  // XP pickup - light chime
  [SoundType.XP_PICKUP]: [0.2, 0, 800, 0.01, 0.03, 0.05, 0, 0, 0, 0, 0, 0, 0, 0, 50, 0.01],

  // Credit pickup - coin sound
  [SoundType.CREDIT_PICKUP]: [0.3, 0, 600, 0.01, 0.05, 0.1, 0, 2, 0, 0, 0, 0, 0, 0, 100, 0.02],

  // Power-up pickup - power up sound
  [SoundType.POWERUP_PICKUP]: [0.4, 0, 400, 0.01, 0.2, 0.3, 0, 1, 10, 0, 0, 0, 0, 0, 200, 0.05],

  // === CHEST SOUNDS ===

  // Common chest - simple open
  [SoundType.CHEST_COMMON]: [0.3, 0, 300, 0.02, 0.1, 0.2, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],

  // Rare chest - magical open
  [SoundType.CHEST_RARE]: [0.4, 0, 400, 0.02, 0.15, 0.3, 0, 1, 20, 0, 0, 0, 0.1, 0, 100, 0.03],

  // Epic chest - grand fanfare
  [SoundType.CHEST_EPIC]: [0.5, 0, 500, 0.03, 0.3, 0.5, 0, 2, 30, 0, 0, 0, 0.2, 0, 200, 0.05],

  // === UI SOUNDS ===

  // Level up - achievement sound
  [SoundType.LEVEL_UP]: [0.5, 0, 600, 0.02, 0.3, 0.4, 0, 2, 0, 0, 0, 0, 0.1, 0, 300, 0.1],

  // Button click - simple blip
  [SoundType.BUTTON_CLICK]: [0.2, 0, 500, 0.01, 0.02, 0.05, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],

  // Upgrade selected - confirmation
  [SoundType.UPGRADE_SELECT]: [0.3, 0, 700, 0.01, 0.1, 0.2, 0, 1, 10, 0, 0, 0, 0, 0, 100, 0.02],

  // Ship unlock - triumphant fanfare (happy upward arpeggio)
  [SoundType.SHIP_UNLOCK]: [1, 0, 1046, 0.01, 0.4, 0.7, 1, 1.5, 0, 0, 0, 0, 0, 0, 0, 0, 0.05, 0.6],

  // Upgrade purchased - satisfying confirmation (cha-ching coin sound)
  [SoundType.UPGRADE_PURCHASED]: [0.8, 0, 1318, 0.01, 0.15, 0.3, 1, 1.2, 0, 0, 0, 0, 0, 0, 0, 0.1, 0.08, 0.5],
}

export class SoundManager {
  private static instance: SoundManager
  private masterVolume: number = 0.5
  private sfxVolume: number = 1.0 // 100% louder (was 0.7)
  private musicVolume: number = 0.15 // 50% as loud (was 0.3)
  private muted: boolean = false

  // Track playing sounds for potential management
  private activeSounds: Set<AudioBufferSourceNode> = new Set()

  private constructor() {
    // Load volume settings from localStorage
    const savedMasterVolume = localStorage.getItem('roguecraft_master_volume')
    const savedSfxVolume = localStorage.getItem('roguecraft_sfx_volume')
    const savedMusicVolume = localStorage.getItem('roguecraft_music_volume')
    const savedMuted = localStorage.getItem('roguecraft_muted')

    if (savedMasterVolume) this.masterVolume = parseFloat(savedMasterVolume)
    if (savedSfxVolume) this.sfxVolume = parseFloat(savedSfxVolume)
    if (savedMusicVolume) this.musicVolume = parseFloat(savedMusicVolume)
    if (savedMuted) this.muted = savedMuted === 'true'
  }

  static getInstance(): SoundManager {
    if (!SoundManager.instance) {
      SoundManager.instance = new SoundManager()
    }
    return SoundManager.instance
  }

  /**
   * Play a sound effect
   */
  play(soundType: SoundType, volumeMultiplier: number = 1.0): void {
    if (this.muted) return

    const soundDef = SOUND_DEFINITIONS[soundType]
    if (!soundDef) {
      console.warn(`Sound not found: ${soundType}`)
      return
    }

    try {
      // Calculate final volume
      const finalVolume = soundDef[0] * this.masterVolume * this.sfxVolume * volumeMultiplier

      // Create a modified sound definition with adjusted volume
      const modifiedDef = [...soundDef]
      modifiedDef[0] = finalVolume

      // Play the sound using ZzFX
      zzfx(...modifiedDef)
    } catch (error) {
      console.error(`Error playing sound ${soundType}:`, error)
    }
  }

  /**
   * Play a random weapon firing sound based on weapon type
   */
  playWeaponSound(weaponName: string): void {
    // Map weapon names to sound types
    const weaponSoundMap: Record<string, SoundType> = {
      'Cannon': SoundType.PLAYER_SHOOT_BASIC,
      'Shotgun': SoundType.PLAYER_SHOOT_BASIC,
      'Gun Buddy': SoundType.PLAYER_SHOOT_BASIC,
      'Ricochet Disk': SoundType.PLAYER_SHOOT_BASIC,
      'Dark': SoundType.PLAYER_SHOOT_BASIC,
      'Laser Beam': SoundType.PLAYER_SHOOT_LASER,
      'Missile Pod': SoundType.PLAYER_SHOOT_MISSILE,
      'Lightning': SoundType.PLAYER_SHOOT_PLASMA,
      'Fire': SoundType.PLAYER_SHOOT_PLASMA,
      'Ice': SoundType.PLAYER_SHOOT_PLASMA,
      'Water': SoundType.PLAYER_SHOOT_PLASMA,
      'Earth': SoundType.PLAYER_SHOOT_PLASMA,
    }

    const soundType = weaponSoundMap[weaponName] || SoundType.PLAYER_SHOOT_BASIC
    this.play(soundType, 0.5) // Quieter since weapons fire frequently
  }

  /**
   * Play chest opening sound based on number of upgrades
   */
  playChestSound(upgradeCount: number): void {
    if (upgradeCount === 1) {
      this.play(SoundType.CHEST_COMMON)
    } else if (upgradeCount === 3) {
      this.play(SoundType.CHEST_RARE)
    } else if (upgradeCount === 5) {
      this.play(SoundType.CHEST_EPIC)
    }
  }

  /**
   * Play a random enemy hit sound variation
   */
  playEnemyHit(volumeMultiplier: number = 1.0): void {
    const hitSounds = [
      SoundType.ENEMY_HIT_1,
      SoundType.ENEMY_HIT_2,
      SoundType.ENEMY_HIT_3,
      SoundType.ENEMY_HIT_4,
      SoundType.ENEMY_HIT_5,
    ]
    const randomSound = hitSounds[Math.floor(Math.random() * hitSounds.length)]
    this.play(randomSound, volumeMultiplier)
  }

  /**
   * Play a random enemy explosion sound variation
   */
  playEnemyExplode(volumeMultiplier: number = 1.0): void {
    const explodeSounds = [
      SoundType.ENEMY_EXPLODE_1,
      SoundType.ENEMY_EXPLODE_2,
      SoundType.ENEMY_EXPLODE_3,
      SoundType.ENEMY_EXPLODE_4,
      SoundType.ENEMY_EXPLODE_5,
    ]
    const randomSound = explodeSounds[Math.floor(Math.random() * explodeSounds.length)]
    this.play(randomSound, volumeMultiplier)
  }

  // === VOLUME CONTROLS ===

  setMasterVolume(volume: number): void {
    this.masterVolume = Math.max(0, Math.min(1, volume))
    localStorage.setItem('roguecraft_master_volume', this.masterVolume.toString())
  }

  setSfxVolume(volume: number): void {
    this.sfxVolume = Math.max(0, Math.min(1, volume))
    localStorage.setItem('roguecraft_sfx_volume', this.sfxVolume.toString())
  }

  setMusicVolume(volume: number): void {
    this.musicVolume = Math.max(0, Math.min(1, volume))
    localStorage.setItem('roguecraft_music_volume', this.musicVolume.toString())
  }

  getMasterVolume(): number {
    return this.masterVolume
  }

  getSfxVolume(): number {
    return this.sfxVolume
  }

  getMusicVolume(): number {
    return this.musicVolume
  }

  toggleMute(): void {
    this.muted = !this.muted
    localStorage.setItem('roguecraft_muted', this.muted.toString())
  }

  setMuted(muted: boolean): void {
    this.muted = muted
    localStorage.setItem('roguecraft_muted', this.muted.toString())
  }

  isMuted(): boolean {
    return this.muted
  }

  /**
   * Stop all currently playing sounds
   */
  stopAll(): void {
    this.activeSounds.forEach(sound => {
      try {
        sound.stop()
      } catch (e) {
        // Sound may have already stopped
      }
    })
    this.activeSounds.clear()
  }
}

// Export singleton instance
export const soundManager = SoundManager.getInstance()
