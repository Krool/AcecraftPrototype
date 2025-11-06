# Roguecraft – Vertical Roguelike Shooter
## Design Document

**Prepared by Kenneth Preston**

---

## 1. Overview

Roguecraft is a vertical roguelike space shooter prototype built for web view on mobile and desktop, with optional standalone app support. The game follows a Vampire Survivors-inspired formula: survive against endless waves of enemies for a set time period to achieve victory.

**Primary Goal**: Create a streamlined, addictive survival shooter with progressive difficulty, meaningful upgrades, and a focus on moment-to-moment decision-making during intense combat.

---

## 2. Core Design Principles

1. **Immediate Action** – Drop players straight into gameplay, no tutorials
2. **Clear Progression** – Linear level unlocks based on survival victories
3. **Simple Economy** – Single currency (Credits) used for all purchases
4. **Escalating Challenge** – Enemies start slow and ramp to overwhelming hordes
5. **Satisfying Victories** – Clear win conditions with meaningful rewards
6. **Compelling Loop** – Die/win → upgrade ship/buy new ships → try harder level → repeat

---

## 3. Core Gameplay Loop

1. **Select Level** – Choose from unlocked campaign levels
2. **Battle** – Survive against endless enemy spawns for 3-7 minutes
3. **Level Up** – Collect XP, choose upgrades during battle
4. **Win or Die** – Survive the timer to win credits, or die and earn nothing
5. **Upgrade** – Spend credits on new ships or building upgrades
6. **Repeat** – Tackle the next level with better stats

---

## 4. Victory & Defeat System

### Win Condition
- Survive for the level's required time (3-7 minutes depending on level)
- Earn credits reward (100-400 depending on level)
- Unlock next level (if not already unlocked)
- Progress is saved

### Defeat Condition
- Health reaches zero
- Return to main menu
- No credits earned
- Stats still recorded (kills, time survived)
- Can retry immediately

### Progression Philosophy
- **You're not expected to win first try**
- Each attempt makes you better at the game
- Credits from wins let you buy new ships for variety
- Buildings provide permanent stat boosts

---

## 5. Enemy Spawning System (Vampire Survivors Style)

### Dynamic Spawning
- Enemies spawn **continuously** throughout the level
- No predetermined waves or patterns
- Spawn rate **accelerates over time**:
  - Starts at 1 enemy every 2 seconds
  - Ramps to 1 enemy every 0.3 seconds by 2 minutes
  - Creates natural difficulty curve

### Enemy Composition
- **Early** (0-2 min): Mostly basic drones and wasps
- **Mid** (2-4 min): Mix of drones, hunters, tanks
- **Late** (4+ min): Heavy enemies, bombers, complex types

### Difficulty Scaling
- Each level has a difficulty multiplier (1.0x to 2.5x)
- Higher multipliers = slower spawn rate but tougher enemies
- Creates distinct feel between levels

---

## 6. Economy & Monetization

### Single Currency: Credits
- Earned by **winning** levels (100-400 per victory)
- Used to purchase new ships (250 credits each)
- Used to upgrade buildings

### No Premium Currency
- Removed gems/gacha system
- All ships purchaseable with credits
- Clear, fair progression

### Ship Unlocking
- Start with Ace (Cannon ship)
- 11 additional ships available for 250 credits each
- Each ship has unique starting weapon and innate ability
- Provides variety and replayability

### Building Upgrades
- Permanent stat boosts (HP, speed, weapon slots, etc.)
- Costs increase per level
- Provides long-term progression

---

## 7. Weapons, Passives, Evolutions, and Characters

**Every weapon ties to a passive and evolves into a visually powerful form.**
**Each starting character corresponds to a weapon and has an innate passive ability that is unique and additive.**

### Weapon Table

| Weapon | Damage Type | Passive | Evolution | Effect | Character | Innate Ability |
|--------|-------------|---------|-----------|--------|-----------|----------------|
| **Cannon** | Physical | Ballistics | Railstorm Gatling | Rapid triple-barrel cannon emitting shockwaves | Ace | +10% pickup radius per level cleared |
| **Shotgun** | Physical | Weapon Speed Up | Auto Scatter | Wide-arc auto-fire filling half screen | Club | -15% incoming damage |
| **Gun Buddy** | Physical | Drone Bay Expansion | Drone Swarm | Five orbiting drones firing volleys | Heart | +1 passive slot, -1 weapon slot |
| **Lightning** | Nature | Critical Systems | Storm Nexus | Arc lightning chaining indefinitely | Diamond | +20% crit chance on Nature damage |
| **Ice** | Cold | Thruster Mod | Cryo Lancer | Piercing ice lances shatter into shards | Queen | +25% attack speed for Cold weapons |
| **Fire** | Fire | Overdrive Reactor | Combustion Core | Explosions trigger chain reactions, screen flashes | Jack | All projectiles bounce once |
| **Water** | Cold | Pickup Radius | Tidal Surge | Giant wave rippling across screen | Pair | Weapons fire twice but deal 50% less damage |
| **Earth** | Nature | Ship Armor | Tectonic Bloom | Pulsing ground cracks spread fractally | Joker | Generates small shield every 10s if stationary |
| **Dark** | Control | Evasion Drive | Shadow Legion | Converts enemies into permanent allies | King | 10% chance enemies revive as allies |
| **Laser Beam** | Fire | Energy Core | Solar Lance | Beam widens and intensifies into screenwide burn | Ten | +15% damage at max heat, slower overheat |
| **Ricochet Disk** | Physical | Ballistics | Pinball Vortex | Multiplying bouncing disks create chaos | Spade | +1 ricochet bounce, +10% projectile speed |
| **Missile Pod** | Fire + Physical | Salvage Unit | Nova Barrage | Splitting missiles blanket screen | King of Clubs | +1 missile per salvo, +10% explosion radius |

### Design Notes
- **Evolutions create strong visual spectacle**
- **Each character's innate passive shifts playstyle tone**
- **Card theme implies rarity and hierarchy** (Ace–King)

---

## 8. Passives

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

---

## 9. Buildings & Meta Progression

| Building | Purpose |
|----------|---------|
| **Hangar** | Ship upgrade hub - base HP, speed, starting weapon slots |
| **Research Lab** | Unlock weapons and passives permanently |
| **Forge** | Upgrade rarity caps (level 4+, unique modifiers) |
| **Command Center** | XP/difficulty scaling, unlock Elite Mode |
| **Power Reactor** | Pickup efficiency and magnet radius improvements |
| **Drone Factory** | Adds passive companions/auto-collect drones |
| **Training Simulator** | Preview/test weapons before runs |
| **Archive** | Achievement tracking with permanent boosts |

---

## 10. Session & Screen Flow

### Game Flow (Revised - No Tutorial)

1. **First Launch** → Main Menu
2. **Start Campaign** → GameScene (Level 0)
3. **Play** → Survive or die
4. **Victory** → Credits earned, next level unlocked, return to menu
5. **Defeat** → Return to menu
6. **Upgrade** → Buy ships or upgrade buildings
7. **Repeat** → Try next level

### No Tutorial
- Players learn by playing
- First level (3 minutes) is forgiving
- Natural difficulty ramp teaches mechanics
- Death is cheap - just try again

### Main Menu Structure
- **Campaign** – Start playing (shows current unlocked level)
- **Build** – Upgrade buildings for permanent boosts
- **Hangar** – Buy and select ships
- **Stats** – View character performance stats

---

## 11. Damage Over Time (DOT) Effects

| Effect | Description |
|--------|-------------|
| **Freeze** | Deals damage over time while slowing enemy |
| **Fire** | % of damage dealt as burning DOT |
| **Nature** | Causes poison DOT |
| **Fire & Poison** | Spreads to nearby enemies |

---

## 12. Technical Plan

| Component | Technology/Approach |
|-----------|-------------------|
| **Framework** | Phaser 3 + React + Vite |
| **Art** | ASCII assets for rapid prototyping |
| **Input** | Drag / multi-touch invisible joystick |
| **Audio** | Multi-channel mixing (music, UI, weapons, enemies, evolutions) |
| **Build** | Web view with offline support |
| **Session Target** | <5 minutes per level |
| **Optimization** | Projectile pooling, readable pacing |

---

## 13. Rationale & Expected Impact

By addressing observed friction while keeping what works, Roguecraft strengthens a proven genre loop. Removing redundant complexity and clarifying feedback loops create smoother onboarding and stronger retention.

### Benefits
- **Faster comprehension** and immediate satisfaction
- **More readable combat** with better differentiation
- **Greater player variety** through ship-based gacha
- **Clearer long-term progression**

### Risks
- Simplified visuals may limit appeal
- Frequent upgrades could disrupt pacing
- Co-op syncing requires optimization

---

## 14. Campaign Levels

| Level | Name | Duration | Difficulty | Credits |
|-------|------|----------|------------|---------|
| 0 | First Contact | 3:00 | 1.0x | 100 |
| 1 | Rising Storm | 4:00 | 1.3x | 150 |
| 2 | Overwhelming Force | 5:00 | 1.6x | 200 |
| 3 | Endless Swarm | 6:00 | 2.0x | 300 |
| 4 | Inferno | 7:00 | 2.5x | 400 |

### Level Unlock System
- Start with Level 0 unlocked
- Win a level to unlock the next
- Can replay any unlocked level for practice (but no credit rewards on repeat wins)
- Linear progression (no branching paths)

---

## 15. Player Loadout System

**Default Configuration**
- 4 weapon slots
- 4 passive slots
- Expandable via meta progression

**Upgrade Paths**
- Weapons and passives have 3 upgrade levels by default
- Special items can have custom upgrade counts
- Max-level combinations trigger evolutions

**Level-Up Flow**
1. Choose between 3 random options:
   - Level up existing weapon/passive
   - Select new weapon/passive (if slots available)
2. Evolution trigger: weapon + passive at max level
3. Treasure chests grant evolution or random upgrades
4. If nothing to upgrade, award meta currency

---

## 16. Implementation Notes

### Performance Considerations
- Projectile system must be robust and performant
- Object pooling for all game entities
- Efficient particle systems

### Mobile-First Design
- Touch controls prioritized
- Clear, large UI elements
- Readable at small screen sizes
- Portrait orientation (540x960)

### Audio Architecture
- Separate channels for:
  - Background music
  - UI sounds
  - Weapon sounds
  - Enemy sounds
  - Evolution/power-up effects

### Visual Clarity
- ASCII art style for rapid iteration
- Clear color coding for damage types
- Distinct enemy silhouettes
- Readable projectile differentiation

---

## 17. Character Roster (Card Theme)

**Unlockable Ships**
- Ace (Starter - Cannon)
- King (Dark)
- Queen (Ice)
- Jack (Fire)
- Ten (Laser Beam)
- Joker (Earth)
- Spade (Ricochet Disk)
- Heart (Gun Buddy)
- Diamond (Lightning)
- Club (Shotgun)
- Pair (Water)
- King of Clubs (Missile Pod)

**Unlock Methods**
- First additional ship: Build first building
- Others: Gacha or direct purchase
- Each ship changes starting weapon and stats

---

## 18. Current Implementation Status

### ✅ Completed
- Vampire Survivors-style enemy spawning (continuous, accelerating)
- Win condition (survive for X time)
- Victory screen with credit rewards
- Defeat screen returning to menu
- Level unlock progression
- Single currency economy (Credits only)
- Ship purchasing in Hangar (250 credits each)
- Combo system that resets when hit
- Campaign levels with difficulty scaling
- No tutorial - direct gameplay

### 🔨 In Progress
- Full weapon system (12 types planned)
- Passive abilities (11 types planned)
- Evolution system (weapon + passive combos)
- Character innate abilities

### 📋 Planned
- Polish and balance
- Additional visual/audio feedback
- Building system expansion
- More enemy types and behaviors

---

This design document reflects the current Vampire Survivors-inspired implementation of Roguecraft, focusing on immediate action, clear progression, and addictive gameplay loops.
