# Sound Resources for Roguecraft

## Sound Effects - IMPLEMENTED ✓
All sound effects are **procedurally generated** using ZzFX and already integrated into the game. No external files needed!

## Background Music - TO BE ADDED

### Recommended Free Music Sources

#### 1. **OpenGameArt.org** (CC0 / CC-BY)
- https://opengameart.org/art-search-advanced?keys=&field_art_type_tid%5B%5D=12&field_art_licenses_tid=All
- Filter by "Music" and "CC0" or "CC-BY 3.0"
- Great selection of chiptune/8-bit music
- **Recommended searches**: "chiptune", "8-bit", "retro space", "arcade"

#### 2. **FreePD.com** (Public Domain)
- https://freepd.com/
- All music is 100% public domain
- Categories: Techno, Electronic, Ambient
- Perfect for space shooter background music

#### 3. **Incompetech** (CC-BY)
- https://incompetech.com/music/royalty-free/music.html
- Kevin MacLeod's famous royalty-free library
- Requires attribution: "Music by Kevin MacLeod (incompetech.com)"
- Filter by: "Electronic", "Techno", "Retro"

#### 4. **Pixabay Music** (Free License)
- https://pixabay.com/music/
- No attribution required
- Search: "8-bit", "video game", "electronic", "space"

#### 5. **Itch.io Music Assets** (Various Licenses)
- https://itch.io/game-assets/free/tag-music
- Many free chiptune packs
- Check individual licenses

### Specific Track Recommendations

**For Space Shooter / Arcade Feel:**
1. Search "space battle" or "arcade action" on OpenGameArt
2. Look for looping tracks (essential for background music)
3. Aim for 1-2 minute loops at 120-140 BPM

**File Format:**
- Prefer `.mp3` or `.ogg` for web (Phaser supports both)
- Keep file size under 2MB for faster loading

### How to Add Music (Once Downloaded)

1. Place music files in: `public/assets/audio/`
2. Load in Phaser's preload:
   ```typescript
   this.load.audio('bgm-main', 'assets/audio/main-theme.mp3')
   ```
3. Play in create:
   ```typescript
   this.music = this.sound.add('bgm-main', { loop: true, volume: 0.3 })
   this.music.play()
   ```

## Sound Implementation Status

### ✅ Implemented Sounds (ZzFX)
- Player weapon sounds (4 variants: basic, laser, missile, plasma)
- Enemy hit
- Enemy explosion
- Player damage
- XP pickup
- Credit pickup
- Power-up pickup
- Chest opening (3 rarities: common, rare, epic)
- Level up
- UI button clicks
- Upgrade selection

### 🎵 Music TO-DO
- Main menu theme
- In-game combat music (looping)
- Victory/game over stinger

### Features Included
- Master volume control
- Separate SFX and Music volume sliders
- Mute toggle
- Settings persist in localStorage
- Weapon-specific firing sounds
- Chest rarity-based sounds

## Testing Sounds

To test the sound system:
```typescript
import { soundManager, SoundType } from './game/SoundManager'

// Play any sound
soundManager.play(SoundType.ENEMY_EXPLODE)

// Play weapon sound
soundManager.playWeaponSound('Laser Beam')

// Play chest sound based on rarity
soundManager.playChestSound(5) // Epic chest (5 upgrades)

// Volume controls
soundManager.setMasterVolume(0.7)
soundManager.setSfxVolume(0.5)
soundManager.toggleMute()
```

## ZzFX Sound Tuning

If you want to adjust sounds, edit `src/game/SoundManager.ts`:

```typescript
// ZzFX parameters:
// [volume, randomness, frequency, attack, sustain, release, shape, shapeCurve, vibrato, vibratoDepth, delay, delayVolume, reverb, reverbDelay, pitchJump, pitchJumpDelay]
```

Use this tool to design custom sounds: https://killedbyapixel.github.io/ZzFX/

## Legal / Attribution

- **ZzFX**: MIT License - No attribution required
- **Background Music**: Check individual licenses for attribution requirements
- Always keep a CREDITS.md if using CC-BY licensed music
