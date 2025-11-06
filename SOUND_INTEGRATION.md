# Sound Integration Guide

## ✅ Already Integrated

- ✅ Sound imports added to GameScene
- ✅ Background music loading (all 20 tracks)
- ✅ Random music selection on level start
- ✅ XP pickup sound
- ✅ Credit pickup sound
- ✅ Enemy explosion sound
- ✅ Level up sound

## 🔧 Remaining Sound Effects to Add

### 1. Power-Up Pickup Sound
**Location**: `handlePowerUpCollection()` around line 3173

Add after `const config = POWERUP_CONFIGS[type]`:
```typescript
// Play power-up pickup sound (different sound for chest)
if (type === PowerUpType.CHEST) {
  // Chest sound will be played in openTreasureChest()
} else {
  soundManager.play(SoundType.POWERUP_PICKUP)
}
```

### 2. Chest Opening Sounds
**Location**: Find `openTreasureChest()` method

Add at the beginning based on the number of upgrades:
```typescript
// Play chest sound based on rarity
soundManager.playChestSound(upgradeCount) // where upgradeCount is 1, 3, or 5
```

### 3. Player Damage Sound
**Location**: Find where `this.health -= damage` occurs (likely in collision handlers)

Add after damage is applied:
```typescript
soundManager.play(SoundType.PLAYER_HIT)
```

### 4. Enemy Hit Sound (Non-Fatal)
**Location**: In `Enemy.ts` file, in the `takeDamage()` method

Add when damage is dealt but enemy doesn't die:
```typescript
if (this.currentHealth > 0) {
  soundManager.play(SoundType.ENEMY_HIT, 0.2)
}
```

### 5. Weapon Firing Sounds
**Location**: In `Weapon.ts` file, in the `fire()` method

Add at the beginning of each weapon's fire method:
```typescript
soundManager.playWeaponSound(this.config.name)
```

### 6. UI Button Clicks
**Location**: In `MainMenuScene.ts` and other menu scenes

Add to button pointerdown events:
```typescript
soundManager.play(SoundType.BUTTON_CLICK)
```

### 7. Upgrade Selection Sound
**Location**: When player selects an upgrade during level-up

Add when upgrade is clicked:
```typescript
soundManager.play(SoundType.UPGRADE_SELECT)
```

## Quick Reference: Sound Types

```typescript
// Combat
SoundType.PLAYER_SHOOT_BASIC
SoundType.PLAYER_SHOOT_LASER
SoundType.PLAYER_SHOOT_MISSILE
SoundType.PLAYER_SHOOT_PLASMA
SoundType.ENEMY_HIT
SoundType.ENEMY_EXPLODE
SoundType.PLAYER_HIT

// Pickups
SoundType.XP_PICKUP
SoundType.CREDIT_PICKUP
SoundType.POWERUP_PICKUP

// Chests
SoundType.CHEST_COMMON      // 1 upgrade
SoundType.CHEST_RARE        // 3 upgrades
SoundType.CHEST_EPIC        // 5 upgrades

// UI
SoundType.LEVEL_UP
SoundType.BUTTON_CLICK
SoundType.UPGRADE_SELECT
```

## Helper Methods

```typescript
// For weapons - automatically maps weapon name to correct sound
soundManager.playWeaponSound('Laser Beam')

// For chests - automatically picks sound based on upgrade count
soundManager.playChestSound(upgradeCount)

// For regular sounds with optional volume multiplier
soundManager.play(SoundType.XP_PICKUP, 0.3) // 30% volume
```

## Testing

Once integrated, test by:
1. Starting a level (music should play)
2. Collecting XP (chime sound)
3. Collecting credits (coin sound)
4. Taking damage (impact sound)
5. Killing enemies (explosion sound)
6. Leveling up (fanfare sound)
7. Opening chests (different sounds for each rarity)
8. Firing weapons (pew pew sounds!)

## Volume Controls

Users can adjust volumes via:
- Master volume
- SFX volume
- Music volume
- Mute toggle

All settings persist in localStorage.
