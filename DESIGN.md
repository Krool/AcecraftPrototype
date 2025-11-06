# Roguecraft – Vertical Roguelike Shooter
## Design Case Study & Prototype Proposal

**Prepared by Kenneth Preston**

---

## 1. Overview

Roguecraft is a vertical roguelike space shooter prototype built for web view on mobile and desktop, with optional standalone app support. The project serves as a case study for evaluating design thinking, rhythm refinement, and player experience flow in the vertical shooter genre.

**Primary Goal**: Redesign the traditional shoot-'em-up formula (Ace Craft / Galaga) into a cleaner, more readable, and rewarding experience optimized for fast onboarding and repeat play.

---

## 2A. Market Context & Product Viability

Ace Craft has maintained strong download velocity and visible ad placement across platforms for over a year, suggesting it's a financially viable live product with solid retention. Its Cuphead-inspired art direction, approachable gameplay loop, and roguelike systems appeal to the same hybrid casual-core audience that supports games like Survivor.io and Archero.

This longevity indicates healthy DAU and consistent ad budget—meaning the product performs well commercially. **Our goal isn't to reinvent the formula but to streamline and evolve it**, addressing friction that prevents it from reaching broader audiences.

---

## 2B. Player Feedback & Pain Points

Community reviews and forum discussions highlight recurring issues that affect player experience even in a successful product:

1. **Visual Clarity** – Hard to distinguish enemy vs friendly bullets during chaotic sequences
2. **Input Friction** – The absorb mechanic interrupts control by requiring players to lift their finger mid-battle
3. **UI & Meta Complexity** – Too many overlapping menus, currencies, and upgrade paths overwhelm new users
4. **Weak Gacha Impact** – Early pulls feel meaningless; they rarely change gameplay
5. **Tight Camera View** – The play area is too small for comfortable dodging
6. **Weak Weapon Feedback** – Most weapons feel similar and lack satisfying sound or impact
7. **Co-op Accessibility** – The feature is buried behind progress gates and lacks immediacy

These issues form the basis for our redesign. **Each change we propose directly resolves a measurable player pain point** without discarding the systems that make Ace Craft commercially viable.

---

## 3. Design Goals

**Simplify** input, **improve** clarity, **enhance** weapon feedback, and **increase** early rewards.

**Shift** gacha focus from gear to characters, **expand** the camera view, and **integrate** co-op accessibility from the first session.

Each change is justified by user feedback and grounded in commercial performance insights.

---

## 4. Core Experience

### Target Player Feeling
**"Tactile chaos under control."**

Every tap, upgrade, and projectile should feel satisfying and legible.

### Session Design
- **Duration**: <5 minutes per level
- **Level-ups**: ~15 per run
- **Rewards**: Enemies drop XP and meta currency
- **Spike Moments**: Mini-boss and boss encounters with reward bursts

---

## 5. Core Loop

1. **Battle Start** – Player spawns with default ship and base cannon
2. **Combat Phase** – Continuous shooting, player dodges and collects XP orbs
3. **Level-Up Phase** – Choose between 3 random upgrades
4. **Mini-Boss / Boss Fights** – Short, high-reward pattern encounters
5. **Reward Phase** – Treasure or meta gain
6. **Meta Upgrade** – Upgrade ships, unlock evolutions
7. **Next Mission** – Increased difficulty and variety

---

## 6. Key Redesign Features and Rationales

### Simplified Input (Remove Finger-Lift Absorb)
**Problem**: Interrupts flow and control
**Change**: Continuous drag; absorb becomes a companion ability
**Rationale**: Maintains tension while eliminating frustration

### Character-Based Gacha
**Problem**: Early pulls lack excitement
**Change**: Ships/pilots instead of gear
**Rationale**: Creates immediate gameplay impact and emotional engagement

### Vehicle Upgrades
**Problem**: Gear meta is over-complicated
**Change**: Ship-based upgrades only
**Rationale**: Reduces cognitive load while enhancing clarity

### Expanded Camera View & Ricochet Projectiles
**Problem**: Tight space and off-screen bullet loss
**Change**: Pull camera back, add ricochet behavior
**Rationale**: Improves visibility and engagement

### Weapon Feel Overhaul
**Problem**: Weapons lack differentiation
**Change**: Add unique visual, audio, and physical identity
**Rationale**: Reinforces mastery and reward feedback

### Co-op Onboarding
**Problem**: Social play hidden late
**Change**: Invite prompt post-tutorial
**Rationale**: Boosts early retention and connection

### Meta Simplification
**Problem**: Too many currencies
**Change**: Collapse into XP and Credits
**Rationale**: Easier to follow progression and maintain pacing

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

### First Launch Sequence

1. **Loading Screen** – ASCII animation
2. **Tutorial Battle** – Instant action (drop directly into combat)
3. **Reward** – Unlock building → unlock new ship
4. **Main Menu** – Hangar, Build, Campaign
5. **Campaign Flow** – Centers camera on latest unlock

### Main Menu Structure
- **Hangar** – Upgrade/change ships
- **Build** – City buildings menu
- **Campaign** – Level selection path

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

## 14. Next Steps

1. ✅ Implement core mechanics and progression loop
2. 🔨 Implement 3-4 weapons and passives in prototype
3. 🔨 Add weapon evolution system
4. 🔨 Add character selection and innate abilities
5. 📋 Add visual feedback for upgrades
6. 📋 Record demo footage
7. 📋 Insert before/after comparisons from Ace Craft
8. 📋 Submit final document + playable prototype link

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

## 18. Success Metrics

**Core KPIs**
- Session length: <5 minutes
- Level-ups per run: ~15
- Player comprehension time: <30 seconds
- Retention D1/D7/D30
- Average session count per day

**Engagement Metrics**
- Weapon variety usage
- Evolution unlock rate
- Building upgrade progression
- Co-op session frequency

---

This design document serves as the foundation for the Roguecraft prototype, ensuring every feature decision ties back to measurable player pain points and commercial viability insights from the vertical shooter genre.
