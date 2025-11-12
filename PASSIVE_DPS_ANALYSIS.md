# Passive DPS Analysis - Best Case Scenarios

This document analyzes the maximum theoretical DPS value of each passive at max level (Level 3 for most).

## Methodology

DPS Impact Formula:
```
Effective DPS = Base DPS × Damage Multipliers × Attack Speed Multipliers × Critical Multipliers × Conditional Multipliers
```

Assumptions for calculations:
- Base weapon DPS = 100 (for comparison purposes)
- All conditional effects are active when applicable
- No diminishing returns unless specified
- Stacking effects reach maximum stacks

---

## Direct DPS Passives (Pure Damage Increases)

### 1. **BALLISTICS** - +60% Physical Damage
**Max Level:** 3
**Effect:** +20% damage per level to physical weapons

**DPS Calculation:**
- Level 1: 1.20× multiplier → 120 DPS (+20%)
- Level 2: 1.40× multiplier → 140 DPS (+40%)
- Level 3: 1.60× multiplier → **160 DPS (+60%)**

**Best Case:** +60% DPS for physical damage builds
**Limitations:** Only affects physical damage weapons
**Rating:** ★★★★☆ (Excellent for physical builds)

---

### 2. **WEAPON_SPEED_UP** - +27.1% Effective DPS
**Max Level:** 3
**Effect:** +10% fire rate per level (reduces cooldown)

**Fire Rate Calculation:**
- Level 1: 0.90× cooldown → 1.111× fire rate → 111.1 DPS (+11.1%)
- Level 2: 0.81× cooldown → 1.234× fire rate → 123.4 DPS (+23.4%)
- Level 3: 0.729× cooldown → 1.371× fire rate → **137.1 DPS (+37.1%)**

**Best Case:** +37.1% DPS for all weapons
**Limitations:** None - universal boost
**Rating:** ★★★★★ (Universal, stacks multiplicatively)

---

### 3. **CRITICAL_SYSTEMS** - +63.75% Average DPS
**Max Level:** 3
**Effect:** +10% crit chance, +25% crit damage per level

**Crit Calculation:**
- Base: 0% crit chance, 2.0× crit damage
- Level 1: 10% crit → 1.75× crit damage → 107.5 DPS (+7.5%)
- Level 2: 20% crit → 2.00× crit damage → 120.0 DPS (+20%)
- Level 3: 30% crit → 2.25× crit damage → **122.5 DPS (+22.5%)**

Wait, let me recalculate this properly:
- Base crit multiplier: 2.0×
- Level 3: +30% crit chance, +75% crit damage bonus
- New crit multiplier: 2.0 + 0.75 = 2.75×
- Average damage: (0.7 × 1.0) + (0.3 × 2.75) = 0.7 + 0.825 = **1.525×**

**Best Case:** +52.5% average DPS
**Limitations:** RNG-dependent, better with higher base crit
**Rating:** ★★★★★ (Excellent scaling)

---

### 4. **OVERDRIVE_REACTOR** - +48.8% DPS (with burst)
**Max Level:** 3
**Effect:** +20% fire rate per level (permanent burst effect)

**Fire Rate Calculation:**
- Level 1: 0.80× cooldown → 1.25× fire rate → 125 DPS (+25%)
- Level 2: 0.64× cooldown → 1.5625× fire rate → 156.25 DPS (+56.25%)
- Level 3: 0.512× cooldown → 1.953× fire rate → **195.3 DPS (+95.3%)**

**Best Case:** +95.3% DPS (if burst is permanent)
**Limitations:** Requires XP pickup to activate burst
**Rating:** ★★★★☆ (Excellent if burst uptime is high)

---

### 5. **DRONE_BAY_EXPANSION** - +81.6% DPS for Allies
**Max Level:** 3
**Effect:** +20% damage, +15% attack speed per level for allies/gun buddies

**Combined Calculation:**
- Damage: 1 + (0.20 × 3) = 1.60× multiplier
- Fire Rate: 1 / (1 - 0.15×3) = 1 / 0.55 = 1.818× multiplier
- Combined: 1.60 × 1.818 = **2.909×**

**Best Case:** +190.9% DPS for allies
**Limitations:** Only affects Gun Buddy weapon and ally units
**Rating:** ★★★★★ (Insane for ally builds)

---

## Conditional DPS Passives (Situational Multipliers)

### 6. **PYROMANIAC** - +75% vs Burning
**Max Level:** 3
**Effect:** +25% damage per level to burning enemies

**DPS Calculation:**
- Level 3: 1.75× multiplier vs burning enemies

**Best Case:** +75% DPS vs burning enemies
**Limitations:** Requires fire damage weapon to apply burn
**Synergies:** Fire weapons (Flamethrower, Fireball Ring, Plasma Aura)
**Rating:** ★★★★★ (Exceptional with fire builds)

---

### 7. **SHATTER_STRIKE** - +90% vs Frozen
**Max Level:** 3
**Effect:** +30% damage per level to frozen enemies

**DPS Calculation:**
- Level 3: 1.90× multiplier vs frozen enemies

**Best Case:** +90% DPS vs frozen enemies
**Limitations:** Requires cold damage weapon to apply freeze
**Synergies:** Frost weapons (Cryo Blaster)
**Rating:** ★★★★★ (Highest conditional damage boost)

---

### 8. **HEMORRHAGE** - +30% Amplification (All Sources)
**Max Level:** 3
**Effect:** Applies bleed that increases damage taken by +10% per level

**DPS Calculation:**
- Level 3: Enemies take +30% more damage from ALL sources
- This affects: Player damage, ally damage, DoT damage, explosion damage

**Best Case:** +30% DPS amplification (multiplicative with everything)
**Limitations:** Needs to land hits to apply stacks
**Rating:** ★★★★★ (Universal amplifier, helps entire team)

---

## Damage-over-Time Passives

### 9. **TOXIC_ROUNDS** - +21 DPS (Poison)
**Max Level:** 3
**Effect:** 45% chance to poison for (5 + 3×2) = 11 DPS for 3 seconds

**DoT Calculation:**
- Poison DPS at level 3: 11 DPS
- Total poison damage per application: 11 × 3 = 33 damage
- Chance to apply: 45%
- Average added DPS: 33 × 0.45 / 3 = 4.95 DPS

But if we consider the poison as bonus damage on every hit:
- If hitting 2 times per second: 33 × 0.45 × 2 = **29.7 DPS average**

**Best Case:** ~30 DPS added (depends on hit rate)
**Limitations:** Doesn't stack, needs frequent hits
**Rating:** ★★★☆☆ (Moderate addition, scales with hit rate)

---

## Attack Speed Stacking Passives

### 10. **FROST_HASTE** - Up to +225% Attack Speed
**Max Level:** 3
**Effect:** +5%/+10%/+15% attack speed per cold damage hit (stacking) at L1/L2/L3

**Stacking Calculation:**
- Per stack at level 1: +5% attack speed
- Per stack at level 2: +10% attack speed
- Per stack at level 3: +15% attack speed
- Assuming 10 stacks at level 3: 1 + (0.15 × 10) = 2.5× fire rate (+150%)
- At 15 stacks at level 3 (theoretical max): 1 + (0.15 × 15) = 3.25× fire rate (+225%)

**Best Case:** +150% to +225% DPS with max stacks
**Limitations:** Requires cold damage weapon, stacks decay, hard to maintain
**Synergies:** Fast-hitting cold weapons (Cryo Blaster)
**Rating:** ★★★★★ (Insane scaling potential, hard to maintain)

---

## Summoning Passives (Additional DPS Sources)

### 11. **WINGMAN_PROTOCOL** - +360 DPS (6 Wingmen)
**Max Level:** 3
**Effect:** Summons 2 wingmen per level that shoot automatically

**Wingman Stats (from Ally.ts):**
- Per Wingman: 10 damage × 2 shots/sec = 20 DPS
- Level 1: 2 wingmen = 40 DPS
- Level 2: 4 wingmen = 80 DPS
- Level 3: 6 wingmen = **120 DPS**

**Best Case:** +120 DPS (independent source)
**Limitations:** Wingmen can die, need to respawn
**Rating:** ★★★★☆ (Strong passive DPS source)

---

## Utility/Survival Passives (Indirect DPS)

### 12. **SHIP_ARMOR** - 0% Direct DPS, +100% Effective DPS
**Max Level:** 3
**Effect:** -15 flat damage reduction

**Survival → DPS Calculation:**
- No direct DPS increase
- Reduces damage taken → survive longer → deal more total damage
- Against 25 damage hits: 15/25 = 40% damage reduction
- Effective DPS over time: +40% (from increased survival time)

**Best Case:** 0% direct DPS, ~40-100% effective DPS from survival
**Rating:** ★★★★☆ (Essential for survival, indirect DPS)

---

### 13. **EVASION_DRIVE** - 0% Direct DPS, +18% Effective DPS
**Max Level:** 3
**Effect:** +15% dodge chance

**Survival → DPS Calculation:**
- 15% of attacks dodged = 15% less damage taken
- Survival increase → DPS uptime increase
- Effective DPS: ~18% (1 / (1 - 0.15) = 1.176)

**Best Case:** 0% direct DPS, ~18% effective DPS from survival
**Rating:** ★★★☆☆ (Good survival, indirect DPS)

---

### 14. **VAMPIRIC_FIRE** - Healing = Indirect DPS
**Max Level:** 3
**Effect:** Heal 4% of fire damage dealt

**Survival → DPS Calculation:**
- At 100 DPS fire damage: 4 HP/sec healing
- Against 10 DPS enemy damage: 40% damage negation
- Effective survival: ~67% increase
- Effective DPS: ~67% (from increased uptime)

**Best Case:** 0% direct DPS, ~50-100% effective DPS from sustain
**Limitations:** Only works with fire damage builds
**Rating:** ★★★★☆ (Excellent for fire builds, sustain = DPS)

---

### 15. **ENERGY_CORE** - +0% to +30% Effective DPS
**Max Level:** 3
**Effect:** +45% projectile size, +30% projectile speed

**Indirect DPS Calculation:**
- Larger projectiles = more hits = ~20-30% DPS increase
- Faster projectiles = more hits before despawn = ~10-15% DPS increase
- Combined: ~30-45% effective DPS

**Best Case:** +30-45% effective DPS (from increased hit rate)
**Rating:** ★★★★☆ (Strong quality-of-life and DPS)

---

### 16. **THRUSTER_MOD** - +45% Projectile Speed
**Max Level:** 3
**Effect:** +45% projectile speed, +30% player move speed

**Indirect DPS Calculation:**
- Faster projectiles = hit more enemies before despawn
- +30% player speed = better positioning = more uptime
- Effective DPS: ~15-25%

**Best Case:** +15-25% effective DPS
**Rating:** ★★★☆☆ (Good utility, minor DPS)

---

### 17. **PICKUP_RADIUS** - 0% Direct DPS
**Max Level:** 3
**Effect:** +150 pickup radius

**Best Case:** 0% direct DPS (levels faster → stronger faster)
**Rating:** ★★☆☆☆ (Quality of life, no direct DPS)

---

### 18. **STATIC_FORTUNE** - 0% Direct DPS
**Max Level:** 3
**Effect:** 30% chance for nature damage to drop credits

**Best Case:** 0% direct DPS (economy boost only)
**Rating:** ★★☆☆☆ (Meta progression, no direct DPS)

---

### 19. **SALVAGE_UNIT** - 0% Direct DPS
**Max Level:** 3
**Effect:** Spawns golden pinata enemies

**Best Case:** 0% direct DPS (economy boost only)
**Rating:** ★★☆☆☆ (Meta progression, no direct DPS)

---

## Tier Rankings (Pure DPS Impact)

### S-Tier (>100% DPS Increase)
1. **FROST_HASTE** - Up to +225% with max stacks (conditional)
2. **DRONE_BAY_EXPANSION** - +190% for ally builds
3. **OVERDRIVE_REACTOR** - +95% with permanent burst

### A-Tier (50-100% DPS Increase)
4. **SHATTER_STRIKE** - +90% vs frozen enemies
5. **PYROMANIAC** - +75% vs burning enemies
6. **BALLISTICS** - +60% for physical builds
7. **CRITICAL_SYSTEMS** - +52.5% average
8. **ENERGY_CORE** - +30-45% effective

### B-Tier (25-50% DPS Increase)
9. **WEAPON_SPEED_UP** - +37.1% universal
10. **HEMORRHAGE** - +30% amplification
11. **VAMPIRIC_FIRE** - +50% effective (sustain)
12. **SHIP_ARMOR** - +40-100% effective (survival)

### C-Tier (<25% DPS Increase)
13. **WINGMAN_PROTOCOL** - +120 flat DPS (depends on base DPS)
14. **TOXIC_ROUNDS** - ~30 DPS added
15. **THRUSTER_MOD** - +15-25% effective
16. **EVASION_DRIVE** - +18% effective

### D-Tier (Utility Only)
17. **PICKUP_RADIUS** - 0% direct DPS
18. **STATIC_FORTUNE** - 0% direct DPS
19. **SALVAGE_UNIT** - 0% direct DPS

---

## Best Synergy Combinations

### Maximum Physical Burst
- **BALLISTICS** (+60%)
- **WEAPON_SPEED_UP** (+37.1%)
- **CRITICAL_SYSTEMS** (+52.5%)
- **Combined:** 1.6 × 1.371 × 1.525 = **3.34× multiplier (+234% DPS)**

### Maximum Fire Damage
- **PYROMANIAC** (+75%)
- **WEAPON_SPEED_UP** (+37.1%)
- **VAMPIRIC_FIRE** (sustain)
- **Combined:** 1.75 × 1.371 = **2.40× multiplier (+140% DPS)** + sustain

### Maximum Cold Damage
- **SHATTER_STRIKE** (+90%)
- **FROST_HASTE** (+150% at 10 stacks with level 3: 10 × 15%)
- **WEAPON_SPEED_UP** (+37.1%)
- **Combined:** 1.9 × 2.5 × 1.371 = **6.51× multiplier (+551% DPS)**

### Maximum Ally Damage
- **DRONE_BAY_EXPANSION** (+190% for allies)
- **WINGMAN_PROTOCOL** (+120 DPS from wingmen)
- **WEAPON_SPEED_UP** (+37.1%)
- **Ally Multiplier:** 2.909 × 1.371 = **3.99× (+299% DPS for allies)**

---

## Conclusion

**Top 5 Best Pure DPS Passives:**
1. **FROST_HASTE** - Highest potential (+225%) but hard to maintain
2. **DRONE_BAY_EXPANSION** - Best for ally/gun buddy builds (+191%)
3. **OVERDRIVE_REACTOR** - Strong universal boost (+95%)
4. **SHATTER_STRIKE** - Highest conditional damage (+90%)
5. **PYROMANIAC** - Strong conditional damage (+75%)

**Most Consistent Universal Boost:**
- **WEAPON_SPEED_UP** - Works with everything, no conditions (+37.1%)
- **CRITICAL_SYSTEMS** - Works with everything, slight RNG (+52.5%)

**Best Build-Enabling Passives:**
- Fire builds: **PYROMANIAC** + **VAMPIRIC_FIRE**
- Cold builds: **SHATTER_STRIKE** + **FROST_HASTE**
- Physical builds: **BALLISTICS** + **HEMORRHAGE**
- Ally builds: **DRONE_BAY_EXPANSION** + **WINGMAN_PROTOCOL**
