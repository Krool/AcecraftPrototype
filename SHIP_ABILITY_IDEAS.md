# Ship Ability Design Document

## Design Philosophy
Every ship ability should have meaningful tradeoffs. Abilities should NOT be strictly better - the benefit should outweigh the drawback, but both should be significant enough to create interesting gameplay decisions.

---

## Future Ship Ability Ideas (Balanced)

### **High-Risk, High-Reward**
1. **"Glass Cannon"** - `-75% max HP, +150% damage`
   - Ultimate glass cannon build for skilled players who can dodge

2. **"Berserker"** - `-30% damage above 50% HP, +60% damage below 50% HP`
   - Rewards aggressive low-HP play, punishes safe play

3. **"Gambler"** - `Non-crits deal 40% damage, crits deal 6x damage instead of 2x, +50% crit chance`
   - High variance, scales with crit builds

4. **"Perfectionist"** - `Can only level up weapons/passives every 3 levels, but gain 2 levels at once`
   - Delayed power spikes but more efficient leveling

5. **"Minimalist"** - `Only 2 weapon slots, each weapon deals +150% damage`
   - Focused build, fewer options but more power per weapon

---

### **Playstyle-Altering**
6. **"Pacifist"** - `Cannot equip weapons (0 weapon slots), +6 passive slots, start with 3 allies`
   - Pure support/passive build, allies do all the work

7. **"Hoarder"** - `+3 passive slots, -1 weapon slot, -15% damage`
   - Passive-focused build with synergy potential

8. **"Tank"** - `+100% HP, -40% move speed, -25% damage`
   - Slow but tanky, facetank playstyle

9. **"Fortress"** - `+150% HP, -60% move speed, cannot dodge, +25% damage reduction`
   - Extreme tank, essentially stationary fortress

---

### **Projectile Transformations** (All with meaningful drawbacks)

10. **"Boomerang"** - `All projectiles return and can hit twice, -40% damage per hit`
    - Double-hit potential but reduced damage per hit

11. **"Piercer"** - `Infinite pierce, -50% damage, projectiles move 50% slower`
    - Great for dense waves, struggles with single targets

12. **"Exploder"** - `All hits explode (80px radius), -60% projectile damage, -40% fire rate`
    - Massive AOE but terrible single-target DPS

13. **"Splitter"** - `Projectiles split into 3 on first hit, -70% damage, splits don't split again`
    - Coverage vs damage tradeoff

14. **"Chainer"** - `Projectiles chain to 3 enemies, -50% damage, -30% chain range`
    - Great for clustered enemies, weak against spread-out waves

---

### **Scaling/Progression**

15. **"Scavenger"** - `Heal 1 HP per 10 credits collected, +100% pickup radius, -20% max HP`
    - Credit-based healing, lower HP ceiling

16. **"Investor"** - `Gain +1% damage per chest opened (stacks indefinitely), -30% starting damage`
    - Weak early, scales infinitely with chests

17. **"Collector"** - `Enemies drop 3x credits but no XP, must buy XP from chests (chests give 2 level-ups)`
    - Fundamentally different progression system

18. **"Snowball"** - `Gain +5% damage per wave cleared, -50% starting damage`
    - Extremely weak early, becomes godlike late

19. **"Late Bloomer"** - `Gain +10% all stats per 5 waves, -40% all stats waves 1-10`
    - Struggle early game for massive late game power

20. **"Early Game"** - `Start with 3 max-level weapons, weapons cannot level up`
    - Dominate early, fall off late game

---

### **Unique Mechanics**

21. **"Overclocked"** - `+100% fire rate, weapons overheat after 5s (3s cooldown), -20% damage`
    - Burst damage windows with downtime management

22. **"Charger"** - `Hold fire to charge (2x→5x damage over 2s), -50% uncharged damage`
    - Timing-based skill mechanic

23. **"Orbiter"** - `All projectiles orbit player (150px radius), +50% projectile count, -30% damage`
    - Defensive projectile pattern, close-range focus

24. **"Reflector"** - `Projectiles bounce off screen edges 3x, -40% projectile speed`
    - Unique coverage pattern, slower hits

---

## REJECTED IDEAS (Too weak or unbalanced)

### **Economic Mechanics** - Don't work because credits aren't valuable mid-run
- ~~"Merchant" - Start with 500¤, gain 2x credits, can buy rerolls~~
- ~~"Investor" - Lose 10¤ per wave, gain +5% damage per 100¤ held~~

### **Speed Mechanics** - Move speed isn't important enough currently
- ~~"Speedster" - +50% move speed, -25% HP~~ (no real benefit)

### **Broken Mechanics**
- ~~"Perfectionist" - Can only pick max-level upgrades~~ (impossible early game)
- ~~"Chaos" - Random rerolls every level~~ (too frustrating, no control)

---

## Implementation Notes

### Difficulty Scaling
- High-risk ships (Glass Cannon, Berserker, Gambler) should be unlocked later
- Beginner-friendly ships should have straightforward mechanics
- Expert ships can have complex conditional effects

### Balance Guidelines
- Benefits should be ~1.5-2x stronger than drawbacks
- Drawbacks should be meaningful (not just -5%)
- Avoid "strictly better" abilities
- Extreme tradeoffs are OK if they create unique playstyles

### Testing Checklist for New Ships
- [ ] Is early game playable? (can survive wave 1-3)
- [ ] Does it scale to late game? (waves 12-15)
- [ ] Is the drawback meaningful?
- [ ] Does it create a unique playstyle?
- [ ] Is it fun to play?

---

## Current Ship Status (20 Ships)

See CHARACTER_ABILITY_STATUS.md for implementation details.
