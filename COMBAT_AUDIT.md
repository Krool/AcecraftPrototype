# Combat System Audit

## Issues Found

### 1. **Enemy Composition is Wrong**
**Current State:**
- Early game: 70% DRONE (shoots back), 20% WASP, 10% SWARMER
- Mid game: 40% DRONE, 25% WASP, 20% HUNTER (shoots back), 15% TANK (shoots back)
- Late game: 20% each of DRONE, WASP, HUNTER, TANK, BOMBER

**Problem:** DRONE is classified as "fodder" but has `shootsBack: true` with 2000ms interval. This means 70% of early enemies shoot back!

**Expected:** "Multiple rows of fodder enemies with only occasional shooters"

**Recommended Fix:**
- Set DRONE to `shootsBack: false` - make it true fodder
- Adjust spawn weights:
  - Early: 80% DRONE + WASP + SWARMER (fodder), 20% shooters
  - Mid: 70% fodder, 30% shooters
  - Late: 60% fodder, 40% shooters

---

### 2. **Weapon Special Effects Not Implemented**

#### Lightning (LIGHTNING)
**Design:** "Chain lightning between enemies - More bounces + damage"
**Current:** Just fires normal projectile with comment "future: implement actual chaining"
**Missing:** Chain/bounce logic

#### Fire (FIRE)
**Design:** "Explodes on contact (AOE) - AOE size + damage"
**Current:** Just fires normal projectile (slightly larger/slower)
**Missing:** Explosion/AOE damage on hit

#### Ice (ICE)
**Design:** "Debuffs and freezes enemies (stops attacks) - Freeze chance"
**Current:** Just fires normal projectile
**Missing:** Freeze/slow effect, stop shooting

#### Ricochet Disk (RICOCHET_DISK)
**Design:** "Bounces off screen edges"
**Current:** Just fires normal projectile
**Missing:** Bounce physics

#### Water (WATER)
**Design:** "Wave pattern movement"
**Current:** Fires projectiles with slight horizontal offset
**Missing:** True wave movement pattern

#### Earth (EARTH)
**Design:** "Persistent zone (slow + damage)"
**Current:** Fires slow projectiles
**Missing:** Persistent damage zone

#### Dark (DARK)
**Design:** "Converts enemies to allies (can't convert bosses)"
**Current:** Fires slow projectiles
**Missing:** Enemy conversion logic

#### All Weapons
**Missing:** DOT (Damage Over Time) effects for Fire/Nature damage types

---

### 3. **Projectile System Too Basic**

**Current Projectile Features:**
- Damage
- Speed (velocityX, velocityY)
- Pierce count
- Icon & color

**Missing Features:**
- Damage type (Physical, Fire, Cold, Nature, Control)
- Special behaviors (chain, explode, freeze, bounce, convert)
- DOT application
- AOE radius
- Status effect application
- Homing
- Lifetime/duration

---

### 4. **Enemy Behavior Issues**

**Problems:**
- No enemy has implemented freeze/slow mechanics
- No indication of DOT effects on enemies
- Spread fire and charged shot abilities exist but may not be working well
- Special abilities (heal, split, explode) need verification

---

### 5. **Balance Issues**

#### Enemy Spawn Rate
- Starts at 1 enemy per 2 seconds
- Ramps to 1 enemy per 0.3 seconds by 2 minutes
- **Problem:** With current spawn weights, this creates too many shooters

#### Weapon Fire Rates
- Cannon: 250ms (4 shots/sec)
- Shotgun: 500ms (2 shots/sec)
- Lightning: 400ms (2.5 shots/sec)
- Fire: 600ms (1.67 shots/sec)

**Relative to Enemy Spawn:** Needs balancing once fodder/shooter ratio is fixed

#### Enemy Health vs Weapon Damage
- DRONE: 20 HP, Cannon damage: 10 → 2 shots to kill
- TANK: 100 HP, Cannon damage: 10 → 10 shots to kill
- WASP: 15 HP → 2 shots to kill
- SWARMER: 10 HP → 1 shot to kill

**Analysis:** Reasonable, but needs testing with proper spawn rates

---

## Recommended Implementation Order

### Phase 1: Fix Enemy Composition (Critical)
1. Set DRONE to `shootsBack: false`
2. Adjust spawn weights to 80/70/60% fodder ratio
3. Test spawn rates feel right

### Phase 2: Implement Core Weapon Effects
1. **Fire Weapon** - Explosion AOE (most impactful)
2. **Ice Weapon** - Freeze/slow enemies
3. **Lightning Weapon** - Chain between enemies
4. **Ricochet Weapon** - Bounce mechanics

### Phase 3: Enhance Projectile System
1. Add damage type to projectiles
2. Add special behavior flags
3. Implement AOE damage system
4. Implement status effect system

### Phase 4: Balance Pass
1. Test with fixed enemy composition
2. Adjust weapon damage/fire rates
3. Adjust enemy health pools
4. Test difficulty curve

### Phase 5: Polish
1. Add DOT visual effects
2. Add freeze visual effects
3. Add explosion particles
4. Add chain lightning visuals
