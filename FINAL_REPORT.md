# Final Report

## Completed features

The project is a complete, locally runnable browser game with a continuous route from **Begin another life** to death, captivity, invaliding, or the armistice.

- Timed black-screen opening and clear onboarding.
- Complete English and Simplified Chinese UI and authored content, with live switching and a remembered browser preference.
- Editable and seeded British character creation with generated alternatives.
- Dynamic calendar from 12 February 1917 to exactly 11:00 on 11 November 1918.
- 63 routine/survival events, 16 combat events, 20 linked NPC story events, six campaign chapter scenes, 10 letters, and 12 historical records.
- Two to four contextual decisions on authored gameplay events, with requirements and non-binary trade-offs.
- Health, morale, stress, hunger, fatigue, hidden luck, weather, equipment, and contextual risk.
- Five persistent comrades with four-stage branching stories, delayed callbacks, biography, relationship, injury, death, capture, transfer, and recovery.
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
- `src/i18n/` contains typed UI dictionaries and the complete Chinese event, history, NPC, letter, diary, and ending presentation pack.
- `src/styles/global.css` contains the responsive visual language without an external asset dependency.

Localization is display-only: canonical engine data and saves remain in English, and stable IDs reconnect journal entries to localized prose. Switching language cannot consume randomness, change a choice, or alter deterministic replay.

## Game systems

### Events and choices

Events declare eligibility, choices, effects, relationships, equipment changes, time ranges, risk, occurrence limits, and cooldowns. Selection resolves pending history first, then due story callbacks, then prefers unseen eligible material inside an appropriate category. Authored daily scenes occur once, combat scenes may recur only after a long cooldown, and the quiet-sector fallback prevents exhaustion from stalling a life.

Choices may update a personal-story stage, preserve a branch flag, and schedule a consequence several turns later. The schedule, occurrence memory, last choice, and story stages are serializable and deterministic.

### Randomness and decision value

Mulberry32 state is stored in every save. Risk uses health, fatigue, stress, morale, hidden luck, posture, weather, protective kit, and authored exposure. A player can understand why caution helps without seeing an exact percentage or discovering a fixed button answer.

### NPCs

Each comrade has a four-stage personal thread. Early responses alter relationship values and flags that expose different choices in later scenes; wounds, death, capture, or transfer can interrupt the thread. Comrades still have no plot armour, and personnel changes remain part of the same diary rather than a separate quest system.

### Time and endings

Routine choices advance several days, while combat advances hours and the final morning advances minutes. Large jumps stop at the final-hour boundary. A fatal final choice is recorded at 10:58; a living character alone advances to 11:00.

### Save system

Every consequential field is plain serializable data, including PRNG position, event occurrence memory, personal-story stages, and delayed events. Refreshing restores rather than rerolls the current situation. Older version-one saves receive safe narrative defaults and continue without a reset.

## Historical system

The archive distinguishes **Recorded history** from **Personal record**. Crossing fixed dates queues historical notices, updates theatre context, and records the public event. Six major milestones schedule a distinct fictional chapter scene tied to the player’s section; choices affect only that personal experience and never the historical outcome.

Campaign language and dates were reviewed against museum, archive, government-history, and scholarly reference material. `docs/HISTORICAL_NOTES.md` lists every boundary, fictional element, simplification, uncertainty, and source. The player, NPCs, families, letters, local incidents, diary, and postwar life are explicitly fictional composites.

## AI functionality

No API is required or called. Version 1 uses authored local prose, so installation, saving, simulation, and a complete playthrough work offline. The design reserves only a future optional surface-text adapter; it would be prohibited from changing history, state, rules, rolls, outcomes, or character knowledge.

## Test results

Final verification commands:

```text
npm test       6 files passed, 30 tests passed
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
- jsdom Chinese click-through, language persistence across remounts, and unchanged canonical save data.
- Translation coverage for all 127 events and their choices, plus all letters, comrades, historical records, journal outcomes, and risk causes.
- Delayed story continuation, choice-dependent later options, historical chapter scheduling, old-save narrative defaults, and long-life repeat-rate limits.
- Local Vite HTTP response and production bundle generation.

Production output at final verification was approximately 0.60 kB HTML, 31.97 kB CSS (8.00 kB gzip), and 418.16 kB JavaScript (143.73 kB gzip).

## Auto Simulation results

Balanced policy, 1,000 deterministic seeds:

```text
Survived to armistice  182
Killed                 540
Died of wounds          84
Invalided home         162
Prisoner of war         32
Stalled                  0
Average turns          79.4
Average days          418.7
```

The direct armistice rate is 18.2%; including invaliding and captivity, 37.6% of simulated characters survive the war. Among armistice survivors, complete lives average 120.4 turns with an 8.7% exact-event repeat rate, 4.9 completed personal arcs, and all six historical chapter scenes. These are gameplay outputs, not historical casualty claims.

Policy audit, 1,000 seeds each:

| Policy | Armistice | Killed | Wounds | Invalided | POW | Stalled |
| --- | ---: | ---: | ---: | ---: | ---: | ---: |
| Always first choice | 39 | 566 | 113 | 242 | 40 | 0 |
| Always second choice | 13 | 593 | 159 | 184 | 51 | 0 |
| Prefer careful posture | 302 | 417 | 74 | 169 | 38 | 0 |
| Prefer bold posture | 7 | 723 | 94 | 136 | 40 | 0 |

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

1. Add choice-dependent variants to the ten letters so replies can echo in later mail.
2. Expand captivity and recovery into short playable survival chapters rather than immediate epilogues.
3. Add a French route with its own researched unit context, event catalogue, names, archive framing, and balance run.
4. Add multiple local save slots and a small seed/share code that contains no personal data.
5. Add browser screenshot regression at desktop and mobile breakpoints in CI.
6. If dynamic prose is added, implement a strict optional adapter with structured inputs, no historical mutation, local fallbacks, and fixture tests.

## Completion judgment

The game starts in under 30 seconds, exposes its objective before the first choice, builds connected histories with named comrades, retains their fate in the final record, and can reach both death and a deliberately quiet armistice. Core tests, production build, save flow, narrative audit, and large simulations pass.
