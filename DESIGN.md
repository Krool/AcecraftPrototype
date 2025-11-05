# Roguecraft - Design Document

## Overview
A roguelike space shooter game designed for web view on mobile and desktop, with potential standalone app support. This is a prototype for interview purposes.

## Core Concept
Similar to Acecraft/Galaga - a top-down space shooter with roguelike progression elements.

## Technical Requirements
- **Platform**: Web view (mobile/desktop), with standalone app capability
- **Audio**: Multiple channels for background music, UI sounds, weapon sounds, enemy sounds, evolution effects
- **Art Style**: ASCII characters for rapid prototyping
- **Level Duration**: < 5 minutes per level
- **Leveling**: ~15 level-ups per game level

## Core Gameplay

### Player Ship
- Spawns at bottom of screen
- Basic cannon that auto-fires upward periodically
- Controlled via touch/click drag (invisible joystick)
- Supports multi-touch input

### Input System
- Click/tap anywhere creates invisible joystick
- Drag to move ship
- Handle multiple simultaneous touches

### Combat & Progression
- Enemies drop XP (different colored glowing dots for different values)
- Enemies drop meta currency
- Fly near drops to collect them
- Level up to choose between 3 random upgrades:
  - Level up existing weapon/passive
  - Select new weapon/passive (if slots available)

### Player Loadout
- **Default**: 4 weapon slots, 4 passive slots
- Can be expanded via meta progression
- Weapons and passives have 3 upgrade levels by default (configurable for special items)

### Evolution System
- Specific weapon + passive combos unlock evolutions
- Consuming weapon creates evolved version
- Passive remains equipped
- Treasure chests trigger evolution if player has max-level combo, otherwise upgrade 1/3/5 items randomly
- If no items to upgrade, award meta currency instead

### Enemy Waves
- Enemies spawn in patterns
- Progressive difficulty across level chain
- Mini-bosses and bosses with larger reward bumps
- Rewards for each enemy defeated

## Screen Flow

### First Launch
1. **Loading Screen**: Minimum display time with fun ASCII animation
2. **Tutorial Battle**: Drop player directly into combat
3. **Main Hub**: After tutorial victory
   - Hangar (upgrade/change ships)
   - Build menu (city buildings)
   - Campaign screen (level selection)
4. **Forced First Building**: Unlocks next character
5. **Campaign Screen**: Shows level path, centers on highest unlocked level

## Weapons

| Weapon | Damage Type | Description | Upgrades |
|--------|-------------|-------------|----------|
| **Cannon** | Physical | Basic pellets fired upward | More pellets + damage |
| **Shotgun** | Physical | Slow attack speed, wide spread | More pellets + damage |
| **Gun Buddy** | Physical | Floating ally that shoots | More buddies + damage |
| **Lightning** | Nature | Chain lightning | More bounces + damage |
| **Ice** | Cold | Debuffs and freezes enemies (stops attacks) | Freeze chance |
| **Fire** | Fire | Explodes on contact (AOE) | AOE size + damage |
| **Water** | Cold | Wave pattern movement | TBD |
| **Earth** | Nature | Persistent zone (slow + damage) | TBD |
| **Dark** | Special | Converts enemies to allies (can't convert bosses) | Fire rate (very slow base) |
| **Laser Beam** | Fire | Sustained hit-scan, overheats | Reduce heat buildup |
| **Ricochet Disk** | Physical | Bounces off screen edges | TBD |
| **Missile Pod** | Physical + Fire | Seeking rockets with splash | Extra targets/mini-missiles |

## Weapon Evolutions

| Components | Result | Effect |
|------------|--------|--------|
| Crit + Fire | **Combustion Core** | Crits cause small explosions |
| Dark + Drone Bay Expansion | TBD | TBD |
| Earth + Poison | TBD | TBD |
| Cannon + Ballistics | TBD | TBD |
| Shotgun + Weapon Speed Up | TBD | TBD |
| Gun Buddy + Drone Bay Expansion | TBD | TBD |

## Passives

| Passive | Effect |
|---------|--------|
| **Ballistics** | Increased Physical Damage |
| **Weapon Speed Up** | Increases fire rate across all weapons |
| **Ship Armor** | Flat damage reduction or regenerating shields |
| **Energy Core** | Increases projectile size and range |
| **Pickup Radius** | Larger magnet for XP/currency |
| **Evasion Drive** | Small dodge chance |
| **Critical Systems** | Adds crit chance across weapons |
| **Thruster Mod** | Faster projectiles and acceleration |
| **Overdrive Reactor** | Attack speed burst after collecting XP |
| **Salvage Unit** | Spawns golden pinata enemies (more meta currency) |
| **Drone Bay Expansion** | Increases ally damage and attack speed |

## Damage Over Time Effects
- **Freeze**: Deals damage over time
- **Fire**: % of damage dealt as burning DOT
- **Nature**: Causes poison DOT
- **Fire & Poison**: Spread to nearby enemies

## Buildings (Meta Progression)

| Building | Purpose |
|----------|---------|
| **Hangar** | Upgrade base HP, speed, add starting weapon slots |
| **Research Lab** | Permanently unlock new weapons, passives, evolutions |
| **Forge** | Upgrade weapon rarity caps (level 4+, unique modifiers) |
| **Command Center** | Boost XP gain, unlock difficulty scaling (Elite Mode) |
| **Power Reactor** | Improve magnet radius and pickup efficiency |
| **Drone Factory** | Add passive companions/auto-collect drones |
| **Training Simulator** | Preview/test weapons |
| **Archive** | Meta-achievement tracker with permanent boosts |

## Heroes/Ships
- Different ships change starting weapon and stats
- Unlocked via gacha or direct purchase
- First additional ship unlocked by building first building

## Implementation Notes
- Projectile system must be robust and performant
- Handle audio channels properly for web view environment
- ASCII art for all visual elements
- Mobile-first input design
- Short level design (< 5 min)
- Clear progression feedback
