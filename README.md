# Roguecraft – Vertical Roguelike Shooter

A roguelike space shooter prototype built with Phaser 3, React, and Vite. Designed as a case study for vertical shooter design refinement, optimized for mobile web view with desktop support.

## 🎮 Current Implementation Status

### ✅ Completed Features (v0.1)

**Core Gameplay**
- ✅ Portrait mode (540x960 - phone aspect ratio)
- ✅ Touch/drag controls with invisible joystick
- ✅ Auto-fire projectile system with pooling
- ✅ 4 enemy types (Basic, Fast, Tank, Elite)
- ✅ Progressive difficulty scaling (time + level based)
- ✅ XP collection and level-up system

**Combat Systems**
- ✅ Damage numbers with floating animation
- ✅ Particle explosion effects on enemy death
- ✅ Screen shake on player damage
- ✅ Pierce mechanic for projectiles
- ✅ Multi-shot and spread-shot patterns

**Progression & Rewards**
- ✅ 11 unique upgrades (damage, fire rate, multi-shot, pierce, spread, health, speed)
- ✅ Combo system with 4x multiplier (5/10/25/50 kill streaks)
- ✅ 4 power-up types (Shield, Rapid Fire, Nuke, Magnet)
- ✅ Score tracking with localStorage high scores
- ✅ Survival timer display

**Visual & Audio**
- ✅ Scrolling 3-layer parallax star field
- ✅ Color-coded health bar (green → orange → red)
- ✅ XP progress bar
- ✅ Power-up status display with timers
- ✅ Combo display with dynamic colors/sizes

### 🚧 In Progress (v0.2)

**Weapon System**
- 🔨 12 weapon types with unique behaviors
- 🔨 Weapon evolution system (weapon + passive)
- 🔨 Passive ability system

**Character System**
- 🔨 Card-themed characters (Ace, King, Queen, Jack, etc.)
- 🔨 Character innate abilities
- 🔨 Character selection screen

**Boss & Encounters**
- 🔨 Mini-boss spawn system
- 🔨 Boss fights with unique patterns
- 🔨 Reward burst mechanics

### 📋 Planned Features (v0.3+)

**Meta Progression**
- Buildings system (Hangar, Research Lab, Forge, etc.)
- Ship upgrade paths
- Meta currency (Credits)
- Permanent unlocks and progression

**Extended Content**
- Training Simulator (weapon testing)
- Archive (achievements)
- Co-op multiplayer
- Additional weapons and evolutions

---

## 🚀 Getting Started

### Prerequisites
- Node.js (v18 or higher recommended)
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
│   ├── components/        # React UI components
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
- [Roguecraft_Design_Document_v6.docx](./Roguecraft_Design_Document_v6.docx) - Original design case study

---

## 🛠️ Tech Stack

- **Framework**: Phaser 3 (game engine)
- **UI**: React 18 + TypeScript
- **Build**: Vite
- **Art**: ASCII characters
- **Audio**: Multi-channel support (planned)
- **Input**: Touch + mouse with invisible joystick
- **Target**: Web view (mobile-first), standalone app capable

---

## 📊 Current Metrics

- **Enemies**: 4 types with difficulty scaling
- **Upgrades**: 11 unique options
- **Power-ups**: 4 types with timed effects
- **Projectile Types**: 3 (standard, pierce, spread)
- **Max Combo**: 4x multiplier
- **Session Target**: <5 minutes
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
