# Roguecraft – Vertical Roguelike Shooter

A roguelike space shooter prototype built with Phaser 3, React, and Vite. Designed as a case study for vertical shooter design refinement, optimized for mobile web view with desktop support.

**Play:** https://krool.github.io/AcecraftPrototype/ or https://krool.itch.io/roguecraft

Pushing to `master` deploys to GitHub Pages and itch.io (see `.github/workflows`).

## 🎮 Current Implementation Status

### ✅ Completed Features

**Core Gameplay**
- ✅ Portrait mode (540x960 - phone aspect ratio)
- ✅ Touch/drag controls with invisible joystick
- ✅ Auto-fire projectile system with pooling
- ✅ 20+ enemy types with unique behaviors
- ✅ Progressive difficulty scaling (time + level based)
- ✅ XP collection and level-up system
- ✅ Campaign system with 10 levels

**Weapon System**
- ✅ 20 unique weapon types (Physical, Fire, Cold, Nature, Control)
- ✅ 3 upgrade levels per weapon
- ✅ Weapon slot system (4 default, expandable)
- ✅ Weapon evolution system (20 evolutions)
- ✅ Super evolution system (6 super evolutions)

**Character System**
- ✅ 19 unique character types
- ✅ Character innate abilities
- ✅ Character selection and purchase system
- ✅ Character progression tracking

**Passive System**
- ✅ 19 unique passive abilities
- ✅ Passive slot system (4 default, expandable)
- ✅ 3 upgrade levels per passive

**Combat Systems**
- ✅ Damage numbers with floating animation
- ✅ Particle explosion effects on enemy death
- ✅ Screen shake on player damage
- ✅ Pierce mechanic for projectiles
- ✅ Multi-shot and spread-shot patterns
- ✅ Combo system with 4x multiplier (5/10/25/50 kill streaks)

**Progression & Rewards**
- ✅ Building system with 50+ upgrade types
- ✅ 3 building trees (Combat, Survival, Growth)
- ✅ Meta currency (Credits) system
- ✅ 5 power-up types (Shield, Rapid Fire, Nuke, Magnet, Chest)
- ✅ Score tracking with localStorage high scores
- ✅ Survival timer display
- ✅ Wave system with progressive enemy compositions

**Visual & Audio**
- ✅ Scrolling 3-layer parallax star field
- ✅ Color-coded health bar (green → orange → red)
- ✅ XP progress bar
- ✅ Power-up status display with timers
- ✅ Combo display with dynamic colors/sizes
- ✅ Procedural sound effects (ZzFX)
- ✅ Multi-channel audio system
- ✅ Volume controls (Master, SFX, Music)

**UI & Menus**
- ✅ Main menu with navigation
- ✅ Building menu with upgrade trees
- ✅ Hangar (character selection/purchase)
- ✅ Stats screen
- ✅ Game scene with full HUD

### 🔨 Partially Implemented (Needs Polish)

**Status Effects**
- 🔨 Burn, Freeze, Poison, Bleed status effects (structure exists, needs implementation)
- 🔨 Status visual indicators
- 🔨 Status-based passive interactions

**Special Weapon Behaviors**
- 🔨 Lightning chain logic
- 🔨 Fire explosion AOE
- 🔨 Ice freeze/slow effects
- 🔨 Water wave movement
- 🔨 Earth persistent zones
- 🔨 Dark enemy conversion

**Boss Fights**
- 🔨 Mini-boss and Boss enemy types exist
- 🔨 Boss fight mechanics need polish
- 🔨 Boss health bars need integration

### 📋 Future Enhancements

**Extended Content**
- Training Simulator (weapon testing)
- Archive (achievements)
- Additional visual polish

---

## 🚀 Getting Started

### Prerequisites
- Node.js 22 or newer
- npm or yarn

### Installation

```bash
npm install
```

### Development

```bash
npm run dev
```

Open your browser to `http://localhost:3000`

### Build

```bash
npm run build
```

---

## 📁 Project Structure

```
roguecraft/
├── src/
│   ├── game/              # Game entity classes
│   │   ├── Enemy.ts       # Enemy types & spawning
│   │   ├── Projectile.ts  # Weapon projectiles
│   │   ├── XPDrop.ts      # XP collection system
│   │   ├── PowerUp.ts     # Power-up drops
│   │   └── config.ts      # Phaser configuration
│   ├── scenes/            # Phaser scenes
│   │   ├── GameScene.ts   # Main gameplay scene
│   │   └── LoadingScene.ts
│   ├── App.tsx            # React app wrapper
│   └── main.tsx           # Entry point
├── public/                # Static assets
├── DESIGN.md              # Full design document
├── IMPLEMENTATION.md      # Implementation roadmap
└── package.json
```

---

## 🎯 Design Goals

**Target Player Feeling**: "Tactile chaos under control"
- Every input, upgrade, and projectile should feel satisfying and legible
- Session length: <5 minutes per level
- ~15 level-ups per run
- Immediate action with minimal onboarding friction

**Key Improvements Over Genre Conventions**
1. **Simplified Input** - Continuous drag, no finger-lift absorb mechanic
2. **Visual Clarity** - Clear enemy types, readable projectiles, better feedback
3. **Character-Based Gacha** - Ships/pilots instead of gear for immediate impact
4. **Expanded Camera View** - Better visibility and dodging space
5. **Weapon Feel** - Unique audio, visual, and physical identity per weapon
6. **Early Co-op Access** - Social features from first session

---

## 📖 Documentation

- [DESIGN.md](./DESIGN.md) - Complete design document
- [IMPLEMENTATION.md](./IMPLEMENTATION.md) - Development roadmap
- [Roguecraft_Design_Document_v10.docx](./Roguecraft_Design_Document_v10.docx) - Original design case study

---

## 🛠️ Tech Stack

- **Framework**: Phaser 3 (game engine)
- **UI**: React 19 + TypeScript
- **Build**: Vite
- **Art**: ASCII characters
- **Audio**: zzfx generated SFX, streamed background music
- **Multiplayer**: 2-player co-op over PeerJS (WebRTC)
- **Input**: Touch + mouse with invisible joystick
- **Target**: Web view (mobile-first), standalone app capable

---

## 📊 Current Metrics

- **Weapons**: 20 unique types
- **Characters**: 19 unique ships
- **Passives**: 19 unique abilities
- **Evolutions**: 20 regular + 6 super = 26 total
- **Enemies**: 20+ types with progressive difficulty
- **Buildings**: 50+ upgrade types across 3 trees
- **Campaign Levels**: 10 levels with increasing difficulty
- **Power-ups**: 5 types (Shield, Rapid Fire, Nuke, Magnet, Chest)
- **Projectile Types**: Multiple (standard, pierce, spread, chain, etc.)
- **Max Combo**: 4x multiplier
- **Session Target**: 3 minutes per level
- **Average Level-ups**: ~15 per run

---

## 🎮 Controls

**Desktop**
- Arrow Keys / WASD - Move ship
- Mouse - Click and drag to move

**Mobile**
- Touch anywhere and drag to move ship
- Multi-touch supported

**Gameplay**
- Ship auto-fires continuously
- Collect XP orbs by flying near them
- Choose upgrades on level-up
- Collect power-ups for temporary boosts
- Avoid enemies and enemy projectiles

---

## 🏗️ Development Roadmap

See [IMPLEMENTATION.md](./IMPLEMENTATION.md) for the complete development plan.

**Phase 1 (Current)**: Core mechanics ✅
**Phase 2**: Weapon & character systems 🔨
**Phase 3**: Meta progression & buildings 📋
**Phase 4**: Polish & content expansion 📋

---

## 📝 License

This is a prototype project for portfolio/interview purposes.

---

## 👤 Author

**Kenneth Preston**
- Design Case Study & Prototype Development
- Focus: Player experience flow, rhythm refinement, and genre evolution
