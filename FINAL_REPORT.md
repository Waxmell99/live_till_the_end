# Final Report

## Completed features

The project is a complete, locally runnable browser game with a continuous route from **Begin another life** to death, captivity, invaliding, or the armistice.

- Timed black-screen opening and clear onboarding.
- Editable and seeded British character creation with generated alternatives.
- Dynamic calendar from 12 February 1917 to exactly 11:00 on 11 November 1918.
- 63 routine/survival events, 16 combat events, 10 NPC events, 10 letters, and 12 historical records.
- Two to four contextual decisions on authored gameplay events, with requirements and non-binary trade-offs.
- Health, morale, stress, hunger, fatigue, hidden luck, weather, equipment, and contextual risk.
- Five persistent comrades with biography, relationship, status, individual scenes, injury, death, capture, transfer, and recovery.
- War diary, letters and replies, personnel files, historical archive, schematic map, and campaign record.
- Exact seeded replay, automatic local save, manual save, safe corrupt-save rejection, and continue flow.
- Killed in action, died of wounds, invalided home, prisoner of war, and survived endings.
- Restrained casualty presentation and a quiet 10:58–11:00 armistice sequence.
- Seeded postwar epilogues and complete end-of-life diary review.
- Responsive archive visual system, reduced-motion support, and optional muted-by-default procedural ambience.

## Project architecture

The implementation separates authored data, deterministic rules, browser storage, simulation, and React views.

```text
UI components ───────────────┐
                            v
event / history / NPC data → pure game engine → serializable GameState
                            │                       │
                            v                       v
                      auto simulator           localStorage
```

- `src/data/` contains public history and fictional content.
- `src/game/engine.ts` is the only choice-resolution authority.
- `src/game/random.ts` owns consequential randomness.
- `src/game/save.ts` owns schema validation and browser persistence.
- `src/game/simulation.ts` plays the same rules without React.
- `src/components/` renders state and sends choice IDs back to the engine.
- `src/styles/global.css` contains the responsive visual language without an external asset dependency.

## Game systems

### Events and choices

Events declare eligibility, choices, effects, relationships, equipment changes, time ranges, and risk. Selection first chooses an appropriate category, then an eligible weighted event, while suppressing the seven most recent events. Campaign windows raise combat frequency; they do not replace daily life.

### Randomness and decision value

Mulberry32 state is stored in every save. Risk uses health, fatigue, stress, morale, hidden luck, posture, weather, protective kit, and authored exposure. A player can understand why caution helps without seeing an exact percentage or discovering a fixed button answer.

### NPCs

Comrades have no plot armour. A contextual incident may wound, kill, or separate one active comrade. Wounded comrades may return or transfer after treatment. Personnel changes affect player condition, later eligibility, the roster portrait, and the diary.

### Time and endings

Routine choices advance several days, while combat advances hours and the final morning advances minutes. Large jumps stop at the final-hour boundary. A fatal final choice is recorded at 10:58; a living character alone advances to 11:00.

### Save system

Every consequential field is plain serializable data, including PRNG position. Refreshing restores rather than rerolls the current situation. The current schema supports one local life and rejects incompatible or malformed data instead of applying partial state.

## Historical system

The archive distinguishes **Recorded history** from **Personal record**. Crossing fixed dates queues historical notices, updates theatre context, and records the public event. Choices around a notice alter only personal response.

Campaign language and dates were reviewed against museum, archive, government-history, and scholarly reference material. `docs/HISTORICAL_NOTES.md` lists every boundary, fictional element, simplification, uncertainty, and source. The player, NPCs, families, letters, local incidents, diary, and postwar life are explicitly fictional composites.

## AI functionality

No API is required or called. Version 1 uses authored local prose, so installation, saving, simulation, and a complete playthrough work offline. The design reserves only a future optional surface-text adapter; it would be prohibited from changing history, state, rules, rolls, outcomes, or character knowledge.

## Test results

Final verification commands:

```text
npm test       5 files passed, 21 tests passed
npm run build  TypeScript passed, Vite production build passed
```

Coverage by behaviour includes:

- Day/hour advancement and exact final boundary.
- Attribute effects and clamping.
- Choice application and diary writes.
- NPC death without protection.
- Fixed historical triggers and queued notices.
- Player death and all engine ending infrastructure.
- Same-seed/same-choice state reproduction.
- Save serialization, storage round-trip, and corrupt-save rejection.
- Content-count acceptance checks.
- Complete automatic games without stalls.
- jsdom click-through: title → creation → first choice → autosave → diary, with no console errors.
- Local Vite HTTP response and production bundle generation.

Production output at final verification was approximately 0.60 kB HTML, 30.76 kB CSS (7.75 kB gzip), and 308.37 kB JavaScript (98.31 kB gzip).

## Auto Simulation results

Balanced policy, 1,000 deterministic seeds:

```text
Survived to armistice  152
Killed                 531
Died of wounds          87
Invalided home         200
Prisoner of war         30
Stalled                  0
Average turns          83.3
Average days          385.4
```

The direct armistice rate is 15.2%; including invaliding and captivity, 38.2% of simulated characters survive the war. These are gameplay outputs, not historical casualty claims.

Policy audit, 1,000 seeds each:

| Policy | Armistice | Killed | Wounds | Invalided | POW | Stalled |
| --- | ---: | ---: | ---: | ---: | ---: | ---: |
| Always first choice | 27 | 567 | 126 | 257 | 23 | 0 |
| Always second choice | 23 | 596 | 132 | 200 | 49 | 0 |
| Prefer careful posture | 234 | 445 | 72 | 221 | 28 | 0 |
| Prefer bold posture | 10 | 708 | 114 | 128 | 40 | 0 |

The audit confirms that fixed button positions are not winning routes. Caution improves survival as intended, but does not guarantee it; bold play carries substantially more risk while often providing morale and relationship gains during an individual run.

## Known issues and deliberate limits

- Only the British infantry route is complete. The types and data boundaries allow more national routes, but none is presented as playable.
- A POW or invalided ending summarises the remainder of the war instead of adding a second internment or hospital campaign.
- One browser stores one active life. Multiple named save slots and cross-device export are not implemented.
- The field map is intentionally schematic and must not be read as a precise unit-position map.
- Procedural ambience is atmospheric rather than a historically reconstructed soundscape and depends on Web Audio support.
- There is no runtime AI prose adapter; this is a safe P2 omission, not a missing core dependency.
- Automated interaction is covered in jsdom, while visual regression screenshots remain a release workflow rather than a test dependency.

## Next-stage recommendations

1. Add a French route with its own researched unit context, event catalogue, names, archive framing, and balance run.
2. Expand captivity and recovery into short playable survival chapters rather than immediate epilogues.
3. Add multiple local save slots and a small seed/share code that contains no personal data.
4. Commission or create historically reviewed, fictional portrait/landscape assets while retaining explicit fact/fiction labels.
5. Add browser screenshot regression at desktop and mobile breakpoints in CI.
6. If dynamic prose is added, implement a strict optional adapter with structured inputs, no historical mutation, local fallbacks, and fixture tests.

## Completion judgment

The game starts in under 30 seconds, exposes its objective before the first choice, gives repeated opportunities to care about named comrades, retains their fate in the final record, and can reach both death and a deliberately quiet armistice. Core tests, production build, save flow, and large simulations pass. Remaining work is expansion rather than repair of the required game loop.
