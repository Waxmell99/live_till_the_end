# Survive Until the War Ends

**Survive Until the War Ends** is a complete browser survival game set on the Western Front from February 1917 to the armistice at 11:00 on 11 November 1918.

You are not a general and cannot redirect history. You are one ordinary British soldier trying to preserve health, judgment, relationships, and enough hope to come home. Quiet weeks, bad food, letters, working parties, rumours, and waiting matter alongside shellfire.

## Run it

Requirements: Node.js 20 or newer.

```bash
npm install
npm run dev
```

Open the local address printed by Vite. No API key, account, database, or network connection is needed after dependencies are installed.

The complete interface and authored narrative are available in English and Simplified Chinese. Use **EN / 中文** on the opening screen, character record, field diary, or ending screen; the preference is remembered in the browser and can be changed without restarting a life.

Production and verification commands:

```bash
npm run build       # type-check and create dist/
npm test            # run the deterministic engine and browser-flow tests
npm run simulate    # automatically play 1,000 complete lives
npm run preview     # serve the production build locally
```

Pass a smaller or larger simulation count with `npm run simulate -- 250`. An optional second argument audits a policy: `balanced`, `first`, `second`, `careful`, or `bold` (for example, `npm run simulate -- 1000 careful`).

## How to play

1. Choose **EN** or **中文**, then begin another life and create or generate a service record.
2. Read the current scene and choose one response. Every available choice works; none is guaranteed safe.
3. Watch health and morale. High stress, hunger, and fatigue are dangerous.
4. Open the section roll, war diary, letters, and archive as the months pass.
5. Survive, be invalided home, or endure captivity—or die before the armistice.

The game autosaves after character creation and every choice. `Continue` restores the full date, PRNG state, NPC status, letters, diary, and current event. A manual **Save record** control is also available.

## What is implemented

- Opening sequence, character generation, seeded challenge runs, and one complete British route.
- Complete English and Simplified Chinese presentation for UI, events, choices, outcomes, diaries, letters, comrades, history, and endings, with a persistent in-game language switcher.
- Dynamic time: ordinary events jump days; dangerous actions advance hours or minutes.
- 63 routine/survival events, 16 combat events, 20 linked NPC story events, six campaign chapter scenes, 10 letters, and 12 fixed historical records.
- Health, morale, stress, hunger, fatigue, hidden luck, equipment, weather, and contextual danger.
- Five persistent fictional comrades with four-stage personal arcs, branching callbacks, relationships, injury, death, capture, transfer, and recovery.
- Historically fixed Arras, Third Ypres, Cambrai, German spring offensive, Second Marne, Hundred Days, and armistice context.
- War diary, kept letters, personnel roll, field map, historical archive, and visible fact/fiction labels.
- Killed in action, died of wounds, invalided home, prisoner of war, and armistice survival endings.
- Quiet 10:58–11:00 armistice sequence and seeded postwar life notes.
- Optional locally generated wind/drone ambience with a mute control; no external audio assets.
- Responsive desktop/mobile presentation and reduced-motion support.

## Mechanics

Each choice has authored effects and, where appropriate, a base danger. The engine modifies risk with physical condition, fatigue, stress, morale, hidden luck, posture, weather, and equipment. A careful answer can still fail; a bold answer can succeed; neither randomness nor a single repeated letter dominates the decision.

All consequential random draws come from the saved Mulberry32 state. The same seed and the same choices reproduce the same key results, including event selection and casualties. Audio texture is cosmetic and does not use game randomness.

Historical events trigger when the clock crosses their dates. The player may read, discuss, or return to work, but none of those responses changes the event itself.

Events remember how often and how recently they appeared. One-off scenes cannot repeat, combat scenes have a long cooldown, unseen material is preferred, and choices can schedule a later consequence. Six major historical milestones open authored chapter scenes, while each comrade’s personal thread advances through four connected stages and may be interrupted by wounds or death.

## Technology and architecture

- React 19, TypeScript, Vite
- Authored CSS (no external fonts, images, or style runtime)
- Pure TypeScript rules and JSON-like local data
- `localStorage` save schema
- Vitest + jsdom

```text
src/
├── components/      opening, creation, game, dossier, and ending views
├── data/            historical records, letters, NPCs, event catalogues
├── game/            types, PRNG, engine, saves, simulation, presentation
├── hooks/           optional procedural ambience
├── i18n/            UI dictionaries and complete Chinese authored-content pack
└── styles/          archive-inspired responsive visual system
scripts/
└── simulate.ts      balance runner using the real game rules
docs/
├── DESIGN.md
├── HISTORICAL_NOTES.md
└── screenshots/     release screenshot location
```

The engine does not import React. English authored text remains the canonical saved representation, while localization happens in the presentation layer; changing language therefore cannot change a seed, roll, event result, or saved life. Tests and the simulator exercise the same `resolveChoice` path used by the UI.

## AI layer

There is deliberately no AI dependency in version 1. The complete game works offline. A future optional adapter may embellish surface prose, but must not alter the timeline, rules, random rolls, outcomes, save state, or what an ordinary soldier can know.

## Historical design

Fixed public events are distinct from invented personal incidents everywhere in the interface. All five comrades, the player, their families, letters, diary prose, and local incidents are fictional composites. Dates and research sources are listed in [Historical Notes](docs/HISTORICAL_NOTES.md); implementation boundaries are in [Design](docs/DESIGN.md).

## Screenshots

Release screenshots are stored under [`docs/screenshots/`](docs/screenshots/README.md). The interface is designed at 1440×900 and also collapses for tablet and phone widths.

## Balance snapshot

The final 1,000-run balanced simulation produced:

```text
Survived to armistice: 182
Killed in action:      540
Died of wounds:         84
Invalided home:        162
Prisoner of war:        32
Stalled:                 0
Average turns:        79.4
```

Among armistice survivors, the average complete life lasted 120.4 turns, the exact-event repeat rate was 8.7%, 4.9 of five personal arcs were completed, and all six campaign chapter scenes appeared.

This is a game balance target, not a claim about the statistical experience of a real 1917 British unit.
