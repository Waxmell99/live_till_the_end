# Development Log

## 2026-08-08 — Project foundation

- Read the full autonomous development brief and prioritised a complete P0 loop before enhancements.
- Selected React, TypeScript, and Vite with authored CSS. A pure front-end architecture keeps the game playable without an API key or server.
- Defined separate data, engine, save, simulation, UI, and documentation layers in `docs/DESIGN.md`.
- Chose a serializable deterministic PRNG so saves, tests, shared seeds, and balance simulations use the same rules.
- Began from an otherwise empty workspace; package installation and build verification follow after the first implementation slice.

## 2026-08-08 — Engine and content

- Implemented a serializable `GameState` and pure `resolveChoice` engine with deterministic event selection, dynamic time, contextual danger, passive condition pressure, and five endings.
- Added 63 routine/survival events, 16 combat events, 10 relationship events, five persistent comrades, 10 letters, and 12 historical records.
- Historical records are queued when their fixed dates are crossed. The notice layer offers personal responses only and cannot alter the record.
- Added NPC wound, death, capture, transfer, and possible recovery paths; all status changes enter the same war diary as player choices.
- Implemented versioned local storage. The saved PRNG state prevents reload-to-reroll behaviour.
- First 20-run simulation found zero armistice survivors because abstract multi-day turns accumulated hunger and fatigue as if no ordinary rations or sleep occurred between authored scenes. Reduced only this background drift; explicit event effects and combat risk were kept meaningful.

## 2026-08-08 — Interface

- Built the complete opening → creation → play → ending flow in React.
- Created an authored 1910s archive visual system with paper texture, ink, stamps, field-map SVG, typewritten controls, responsive layouts, and reduced-motion behaviour.
- Added war diary, letters, historical archive, personnel records, supplies, qualitative relationships, autosave notice, and an optional procedural ambient sound layer.
- Added a deliberately quiet armistice sequence. A casualty during the final event is timestamped at 10:58; only a surviving character reaches 11:00.
- Production build succeeded with no external runtime assets.

## 2026-08-08 — Verification and balance

- Added 21 tests covering content scale, time, stats, event choices, fixed history, death, NPC death, the exact armistice boundary, seeded replay, saves, simulation completion, and a jsdom click-through from title to a saved turn and diary.
- All 5 test files and 21 tests pass.
- Ran 1,000 complete games with the balanced automatic policy: 152 armistice survivors, 531 killed, 87 deaths from wounds, 200 invalided home, 30 prisoners, and zero stalls. Average run length was 83.3 turns.
- Audited fixed and posture-heavy policies over another 4,000 runs. Always taking the first choice reached the armistice 27/1,000 times; always taking the second reached it 23/1,000 times; careful posture reached it 234/1,000 times; bold posture reached it 10/1,000 times. Caution has the intended advantage without becoming a guaranteed route, and fixed button positions do not win reliably.
- Confirmed the local Vite server returned the game document and the production bundle built successfully.
- Reviewed campaign and daily-life wording against Imperial War Museums, the National Army Museum, the U.S. Army Center of Military History, the U.S. State Department historian, The National Archives, and 1914–1918 Online. Sources and simplifications are recorded in `docs/HISTORICAL_NOTES.md`.
