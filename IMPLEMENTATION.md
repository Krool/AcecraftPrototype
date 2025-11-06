# Roguecraft Implementation Roadmap

This document outlines the complete development plan for Roguecraft, organized into phases with clear milestones and dependencies.

---

## Implementation Status Overview

**Current Version**: v0.1 (Core Mechanics Complete)
**Target Version**: v1.0 (Full Prototype with Core Content)
**Estimated Timeline**: 8-12 weeks for v1.0

---

## Phase 1: Core Mechanics ✅ COMPLETE

### 1.1 Basic Gameplay Loop ✅
- [x] Portrait mode setup (540x960)
- [x] Touch/drag controls with invisible joystick
- [x] Multi-touch support
- [x] Player ship entity
- [x] Auto-fire projectile system
- [x] Basic enemy spawning
- [x] Collision detection

### 1.2 Progression Systems ✅
- [x] XP drop system with collection
- [x] Level-up mechanic
- [x] Upgrade selection UI (3 random choices)
- [x] Health system with visual feedback
- [x] Death and restart flow

### 1.3 Enemy Variety ✅
- [x] 4 enemy types (Basic, Fast, Tank, Elite)
- [x] Enemy stat differentiation
- [x] Progressive difficulty scaling
- [x] Time-based spawn rate increase
- [x] Level-based enemy distribution

### 1.4 Visual Polish ✅
- [x] Damage numbers with animation
- [x] Particle explosion effects
- [x] Screen shake on damage
- [x] Health bar (color-coded)
- [x] XP progress bar
- [x] Scrolling star field background

### 1.5 Advanced Features ✅
- [x] Projectile pierce mechanic
- [x] Multi-shot system
- [x] Spread-shot patterns
- [x] Combo system (4x multiplier)
- [x] 4 power-up types (Shield, Rapid Fire, Nuke, Magnet)
- [x] Score tracking & high scores
- [x] Survival timer

---

## Phase 2: Weapon & Character Systems 🔨 IN PROGRESS

### 2.1 Weapon System Refactor
**Priority**: HIGH | **Estimated Time**: 1-2 weeks

#### Tasks
- [ ] Create Weapon base class with damage types
- [ ] Implement weapon slot system (4 slots)
- [ ] Add weapon level/upgrade tracking
- [ ] Create weapon pool/factory system
- [ ] Refactor current projectiles to use weapon system

#### Weapons to Implement (First Pass)
1. **Cannon** (Physical)
   - [ ] Basic upward pellet fire
   - [ ] Upgrades: +pellets, +damage
   - [ ] Visual: yellow/white projectiles

2. **Shotgun** (Physical)
   - [ ] Wide spread, slow fire rate
   - [ ] Upgrades: +pellets, +damage, tighter spread
   - [ ] Visual: multiple small pellets

3. **Lightning** (Nature)
   - [ ] Chain lightning effect
   - [ ] Upgrades: +bounces, +damage, +range
   - [ ] Visual: cyan/electric arcs

4. **Fire** (Fire)
   - [ ] Explosion on contact (AOE)
   - [ ] Upgrades: +AOE size, +damage
   - [ ] Visual: orange/red explosions

#### Weapon Upgrade Flow
- [ ] Weapon appears in upgrade choices
- [ ] First selection: unlock weapon
- [ ] Subsequent selections: level up (1→2→3)
- [ ] Display weapon level in upgrade UI
- [ ] Show weapon stats in HUD

**Deliverables**:
- 4 functional weapon types
- Weapon slot management
- Upgrade progression system

---

### 2.2 Passive System
**Priority**: HIGH | **Estimated Time**: 1 week

#### Passive Slot System
- [ ] Create Passive base class
- [ ] Implement passive slot system (4 slots)
- [ ] Add passive level/upgrade tracking
- [ ] Apply passive effects to player/weapons

#### Passives to Implement (First Pass)
1. **Ballistics** - +Physical damage %
2. **Weapon Speed Up** - +Fire rate %
3. **Energy Core** - +Projectile size & range
4. **Pickup Radius** - +Magnet radius
5. **Critical Systems** - +Crit chance

#### Integration
- [ ] Passives appear in upgrade choices
- [ ] Passive effects apply automatically
- [ ] Display active passives in HUD
- [ ] Stack multiple passive levels

**Deliverables**:
- 5 functional passives
- Passive slot management
- Passive effect application system

---

### 2.3 Evolution System
**Priority**: MEDIUM | **Estimated Time**: 2 weeks

#### Core Evolution Mechanics
- [ ] Track weapon + passive combinations
- [ ] Detect max-level combos (level 3 + level 3)
- [ ] Create evolution trigger system
- [ ] Evolution consumes weapon, keeps passive
- [ ] Evolved weapon occupies weapon slot

#### Evolutions to Implement (First Pass)
1. **Cannon + Ballistics** → **Railstorm Gatling**
   - [ ] Triple-barrel rapid fire
   - [ ] Shockwave effects
   - [ ] Visual spectacle

2. **Fire + Critical Systems** → **Combustion Core**
   - [ ] Crits cause chain explosions
   - [ ] Screen flash effects
   - [ ] Area denial

3. **Lightning + Critical Systems** → **Storm Nexus**
   - [ ] Infinite chain lightning
   - [ ] Screen-wide coverage
   - [ ] Electric visual intensity

#### Evolution UI
- [ ] Special evolution notification
- [ ] Evolution animation/transition
- [ ] Evolution preview in upgrade screen
- [ ] Evolution unlock tracking

**Deliverables**:
- Evolution detection system
- 3 evolved weapons
- Evolution UI/feedback

---

### 2.4 Character System
**Priority**: HIGH | **Estimated Time**: 2 weeks

#### Character Infrastructure
- [ ] Create Character base class
- [ ] Character selection screen
- [ ] Character data structure
- [ ] Save/load selected character

#### Characters to Implement (First Pass)
1. **Ace** (Starter - Cannon)
   - [ ] Starting weapon: Cannon
   - [ ] Innate: +10% pickup radius per level
   - [ ] Visual: Green triangle ship

2. **King** (Dark)
   - [ ] Starting weapon: Dark conversion
   - [ ] Innate: 10% enemy revive as ally
   - [ ] Visual: Purple/dark ship

3. **Queen** (Ice)
   - [ ] Starting weapon: Ice
   - [ ] Innate: +25% Cold weapon attack speed
   - [ ] Visual: Cyan/blue ship

4. **Jack** (Fire)
   - [ ] Starting weapon: Fire
   - [ ] Innate: All projectiles bounce once
   - [ ] Visual: Red/orange ship

#### Character Features
- [ ] Character-specific starting stats
- [ ] Innate ability implementation
- [ ] Character unlock system
- [ ] Character visual differentiation

#### Character Selection UI
- [ ] Main menu character select
- [ ] Character preview with stats
- [ ] Lock/unlock states
- [ ] Card-themed presentation

**Deliverables**:
- 4 playable characters
- Character selection screen
- Innate ability system
- Character unlock flow

---

## Phase 3: Boss & Encounter Systems 📋 PLANNED

### 3.1 Boss Enemy System
**Priority**: HIGH | **Estimated Time**: 2 weeks

#### Boss Infrastructure
- [ ] Boss enemy base class
- [ ] Boss spawn triggers
- [ ] Boss health bar UI
- [ ] Boss defeat rewards

#### Boss Behaviors
- [ ] Movement patterns
- [ ] Attack patterns
- [ ] Phase transitions
- [ ] Bullet patterns (danmaku-lite)

#### Boss Types (First Pass)
1. **Mini-Boss** (Every 3-5 minutes)
   - [ ] 3x normal enemy HP
   - [ ] Special attack pattern
   - [ ] Guaranteed power-up drop
   - [ ] XP/score bonus

2. **Stage Boss** (End of level)
   - [ ] Large HP pool
   - [ ] 3-phase battle
   - [ ] Unique bullet patterns
   - [ ] Major reward burst

#### Boss Integration
- [ ] Boss warning UI
- [ ] Boss music trigger
- [ ] Camera shake on attacks
- [ ] Victory celebration

**Deliverables**:
- 2 mini-boss variants
- 1 stage boss
- Boss spawn system
- Boss reward flow

---

### 3.2 Treasure & Reward Systems
**Priority**: MEDIUM | **Estimated Time**: 1 week

#### Treasure Chests
- [ ] Chest spawn system
- [ ] Chest types (bronze, silver, gold)
- [ ] Evolution check on chest open
- [ ] Random upgrade fallback
- [ ] Meta currency fallback

#### Reward Bursts
- [ ] Boss defeat rewards
- [ ] Mini-boss rewards
- [ ] Level completion rewards
- [ ] Combo milestone rewards

**Deliverables**:
- Treasure chest system
- Reward burst mechanics
- Visual reward feedback

---

## Phase 4: Meta Progression 📋 PLANNED

### 4.1 Currency System
**Priority**: HIGH | **Estimated Time**: 1 week

#### Currency Types
- [ ] **XP** - In-run progression (existing)
- [ ] **Credits** - Meta currency (new)
- [ ] Currency UI display
- [ ] Currency persistence

#### Credit Sources
- [ ] Enemy drops (% chance)
- [ ] Boss rewards
- [ ] Level completion
- [ ] Treasure chests
- [ ] Salvage Unit passive (golden enemies)

**Deliverables**:
- Credit system
- Credit drop mechanics
- Currency display UI

---

### 4.2 Building System
**Priority**: HIGH | **Estimated Time**: 3-4 weeks

#### Building Infrastructure
- [ ] Building data structure
- [ ] Building unlock/upgrade system
- [ ] Building UI/menu
- [ ] Persistent building state

#### Buildings to Implement

##### 1. Hangar (Tier 1)
- [ ] Unlock: Tutorial completion
- [ ] Upgrades:
  - [ ] +Base HP (5 levels)
  - [ ] +Movement speed (5 levels)
  - [ ] +Starting weapon slot (2 levels)
- [ ] UI: Ship stat display

##### 2. Research Lab (Tier 1)
- [ ] Unlock: Credits cost
- [ ] Function: Permanently unlock weapons/passives
- [ ] UI: Tech tree/unlock grid
- [ ] Track unlocked content

##### 3. Forge (Tier 2)
- [ ] Unlock: Credits + progress gate
- [ ] Function: Increase weapon rarity caps (level 4+)
- [ ] Unique modifiers at high levels
- [ ] UI: Weapon enhancement screen

##### 4. Command Center (Tier 2)
- [ ] Unlock: Credits + progress gate
- [ ] Upgrades:
  - [ ] +XP gain % (5 levels)
  - [ ] Unlock Elite Mode difficulty
  - [ ] +Starting level option
- [ ] UI: Difficulty settings

##### 5. Power Reactor (Tier 2)
- [ ] Unlock: Credits + progress gate
- [ ] Upgrades:
  - [ ] +Magnet radius (5 levels)
  - [ ] +Pickup efficiency (5 levels)
- [ ] UI: Pickup stat display

##### 6. Drone Factory (Tier 3)
- [ ] Unlock: Credits + late game
- [ ] Function: Passive companion drones
- [ ] Types:
  - [ ] XP collector drone
  - [ ] Attack drone
  - [ ] Shield drone
- [ ] UI: Drone management

##### 7. Training Simulator (Tier 2)
- [ ] Unlock: Credits
- [ ] Function: Test weapons/builds
- [ ] No rewards, pure sandbox
- [ ] UI: Loadout customizer

##### 8. Archive (Tier 3)
- [ ] Unlock: Credits + achievement
- [ ] Function: Achievement tracking
- [ ] Permanent boost rewards
- [ ] UI: Achievement gallery

#### Building UI
- [ ] Main building menu
- [ ] Individual building screens
- [ ] Upgrade confirmation dialogs
- [ ] Resource requirement display
- [ ] Progress gates/locks

**Deliverables**:
- 8 functional buildings
- Building progression system
- Building UI screens
- Resource management

---

### 4.3 Main Menu & Flow
**Priority**: MEDIUM | **Estimated Time**: 2 weeks

#### Screen Structure
- [ ] Main menu hub
- [ ] Hangar screen
- [ ] Build menu
- [ ] Campaign/level select
- [ ] Settings screen

#### First Launch Flow
1. [ ] Loading screen with ASCII animation
2. [ ] Tutorial battle (instant action)
3. [ ] Tutorial completion rewards
4. [ ] First building unlock prompt
5. [ ] Main menu unlock

#### Navigation
- [ ] Screen transitions
- [ ] Back button handling
- [ ] State persistence
- [ ] Tutorial flags

**Deliverables**:
- Complete menu system
- First-time user experience
- Screen flow logic

---

## Phase 5: Extended Weapon Content 📋 PLANNED

### 5.1 Additional Weapons (Second Pass)
**Priority**: MEDIUM | **Estimated Time**: 2-3 weeks

#### Weapons to Add
1. **Gun Buddy** (Physical + Drone)
2. **Ice** (Cold + Freeze)
3. **Water** (Cold + Wave)
4. **Earth** (Nature + Zone)
5. **Dark** (Control + Conversion)
6. **Laser Beam** (Fire + Sustained)
7. **Ricochet Disk** (Physical + Bounce)
8. **Missile Pod** (Fire + Physical + Seeking)

#### Per Weapon Implementation
- [ ] Base weapon behavior
- [ ] 3 upgrade levels
- [ ] Unique visual effects
- [ ] Associated passive
- [ ] Evolution form

**Deliverables**:
- 8 additional weapons
- 8 weapon evolutions
- Complete weapon roster (12 total)

---

### 5.2 Additional Passives
**Priority**: MEDIUM | **Estimated Time**: 1 week

#### Passives to Add
1. **Ship Armor** - Damage reduction/shields
2. **Evasion Drive** - Dodge chance
3. **Thruster Mod** - Faster projectiles
4. **Overdrive Reactor** - Attack speed burst
5. **Salvage Unit** - Golden enemies
6. **Drone Bay Expansion** - Drone buffs

**Deliverables**:
- 6 additional passives
- Complete passive roster (11 total)

---

### 5.3 Additional Characters
**Priority**: MEDIUM | **Estimated Time**: 2 weeks

#### Characters to Add
1. **Diamond** (Lightning)
2. **Club** (Shotgun)
3. **Heart** (Gun Buddy)
4. **Spade** (Ricochet Disk)
5. **Ten** (Laser Beam)
6. **Joker** (Earth)
7. **Pair** (Water)
8. **King of Clubs** (Missile Pod)

**Deliverables**:
- 8 additional characters
- Complete character roster (12 total)

---

## Phase 6: Polish & Content Expansion 📋 PLANNED

### 6.1 Visual Polish
**Priority**: MEDIUM | **Estimated Time**: 2 weeks

#### Visual Enhancements
- [ ] Improved ASCII art assets
- [ ] Enhanced particle effects
- [ ] Evolution visual spectacle
- [ ] Boss intro animations
- [ ] Victory/defeat sequences
- [ ] Menu animations
- [ ] Transition effects

#### UI Polish
- [ ] Tooltips and help text
- [ ] Tutorial hints
- [ ] Stat explanations
- [ ] Damage type indicators
- [ ] Upgrade comparison

**Deliverables**:
- Polished visual effects
- Enhanced UI/UX
- Tutorial improvements

---

### 6.2 Audio System
**Priority**: MEDIUM | **Estimated Time**: 2 weeks

#### Audio Architecture
- [ ] Multi-channel audio manager
- [ ] Background music system
- [ ] Sound effect system
- [ ] Volume controls
- [ ] Audio settings

#### Sound Effects
- [ ] Weapon firing sounds (per weapon)
- [ ] Enemy death sounds
- [ ] XP collection sound
- [ ] Level-up sound
- [ ] Evolution sound
- [ ] Power-up collection
- [ ] Boss entrance/defeat
- [ ] UI interaction sounds

#### Music Tracks
- [ ] Main menu theme
- [ ] Battle theme
- [ ] Boss battle theme
- [ ] Victory theme
- [ ] Defeat theme

**Deliverables**:
- Complete audio system
- Sound effect library
- Music tracks

---

### 6.3 DOT & Status Effects
**Priority**: LOW | **Estimated Time**: 1 week

#### Status Effects
- [ ] **Freeze** - Slow + DOT
- [ ] **Burn** - Fire DOT + spread
- [ ] **Poison** - Nature DOT + spread
- [ ] Effect visual indicators
- [ ] Effect stacking/duration

#### Integration
- [ ] Weapon-based effect application
- [ ] Enemy effect resistance
- [ ] Effect damage calculation
- [ ] Effect spread mechanics

**Deliverables**:
- 3 status effect systems
- Visual effect indicators

---

### 6.4 Advanced Features
**Priority**: LOW | **Estimated Time**: Varies

#### Elite Mode
- [ ] Difficulty scaling system
- [ ] Elite enemy variants
- [ ] Enhanced rewards
- [ ] Leaderboard integration

#### Co-op System (Phase 7+)
- [ ] Multiplayer infrastructure
- [ ] Session hosting/joining
- [ ] Synced gameplay
- [ ] Co-op rewards
- [ ] Friend invite system

#### Achievement System
- [ ] Achievement tracking
- [ ] Achievement rewards
- [ ] Achievement UI
- [ ] Stat tracking

**Deliverables**:
- Elite mode
- Achievement system
- (Co-op in future phase)

---

## Phase 7: Testing & Optimization 📋 PLANNED

### 7.1 Performance Optimization
**Priority**: HIGH | **Estimated Time**: 2 weeks

#### Optimization Targets
- [ ] Projectile pooling optimization
- [ ] Particle system efficiency
- [ ] Collision detection optimization
- [ ] Memory management
- [ ] Mobile performance testing

#### Testing
- [ ] Load testing (100+ projectiles)
- [ ] Boss fight stress test
- [ ] Long session stability
- [ ] Mobile device testing
- [ ] Different screen sizes

**Deliverables**:
- Optimized performance
- Stable 60 FPS on mobile
- Memory leak fixes

---

### 7.2 Balance & Playtesting
**Priority**: HIGH | **Estimated Time**: 3-4 weeks

#### Balance Areas
- [ ] Weapon balance (damage, fire rate)
- [ ] Passive effectiveness
- [ ] Evolution power levels
- [ ] Enemy HP/damage scaling
- [ ] XP progression curve
- [ ] Credit economy
- [ ] Building costs
- [ ] Difficulty scaling

#### Playtesting
- [ ] Internal testing sessions
- [ ] Feedback collection
- [ ] Iteration on feedback
- [ ] Balance adjustments

**Deliverables**:
- Balanced game systems
- Playtested progression
- Documented feedback

---

### 7.3 Bug Fixes & Polish
**Priority**: HIGH | **Estimated Time**: Ongoing

#### Bug Categories
- [ ] Critical bugs (crashes, blockers)
- [ ] Gameplay bugs
- [ ] UI bugs
- [ ] Visual bugs
- [ ] Audio bugs
- [ ] Edge cases

#### Final Polish
- [ ] Animation cleanup
- [ ] Visual consistency
- [ ] UI/UX refinement
- [ ] Performance tweaks
- [ ] Code cleanup

**Deliverables**:
- Bug-free experience
- Polished presentation
- Clean codebase

---

## Phase 8: Release Preparation 📋 PLANNED

### 8.1 Documentation
**Priority**: HIGH | **Estimated Time**: 1 week

#### Documentation Needs
- [ ] Player-facing guide
- [ ] Weapon/passive reference
- [ ] Character abilities guide
- [ ] Building upgrade paths
- [ ] Strategy tips

#### Technical Documentation
- [ ] Code documentation
- [ ] API documentation
- [ ] Build instructions
- [ ] Deployment guide

**Deliverables**:
- Complete documentation
- Player guides
- Technical docs

---

### 8.2 Demo & Showcase
**Priority**: HIGH | **Estimated Time**: 1 week

#### Demo Content
- [ ] Record gameplay footage
- [ ] Create demo reel
- [ ] Screenshot gallery
- [ ] Feature highlights
- [ ] Before/after comparisons

#### Presentation Materials
- [ ] Pitch deck
- [ ] Design case study presentation
- [ ] Portfolio entry
- [ ] Playable demo link

**Deliverables**:
- Demo video
- Presentation materials
- Showcase assets

---

## Development Principles

### Code Quality
- Write clean, documented code
- Use TypeScript types throughout
- Follow consistent naming conventions
- Keep components modular and reusable

### Performance
- Always use object pooling for entities
- Optimize render calls
- Profile regularly on mobile
- Target 60 FPS minimum

### Player Experience
- Every feature must feel satisfying
- Visual feedback for all interactions
- Clear, readable UI
- Minimal friction in core loop

### Iteration
- Prototype first, polish later
- Playtest early and often
- Balance based on data
- Iterate on feedback quickly

---

## Milestone Timeline

| Milestone | Target | Status |
|-----------|--------|--------|
| **v0.1** - Core Mechanics | Week 4 | ✅ Complete |
| **v0.2** - Weapons & Characters | Week 8 | 🔨 In Progress |
| **v0.3** - Bosses & Meta | Week 12 | 📋 Planned |
| **v0.4** - Extended Content | Week 16 | 📋 Planned |
| **v0.5** - Polish & Audio | Week 20 | 📋 Planned |
| **v0.6** - Testing & Balance | Week 24 | 📋 Planned |
| **v1.0** - Release Candidate | Week 26 | 📋 Planned |

---

## Current Sprint (Week 5-6)

### Active Tasks
1. **Weapon System Refactor**
   - Create weapon base class
   - Implement 4 weapons (Cannon, Shotgun, Lightning, Fire)
   - Add weapon slot management

2. **Passive System**
   - Create passive base class
   - Implement 5 passives
   - Passive effect application

3. **Character Foundation**
   - Character data structure
   - Character selection UI prototype

### Next Sprint Goals
1. Evolution system implementation
2. Complete 4 character implementations
3. Begin boss system prototype

---

This implementation plan will be updated as development progresses. All phases are subject to adjustment based on playtesting feedback and technical constraints.
