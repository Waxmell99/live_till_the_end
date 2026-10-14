# Design — Survive Until the War Ends

## Experience goal

The player is an ordinary British infantryman on the Western Front. History moves on without asking permission; the player's agency lies in risk, care, duty, avoidance, and the relationships they preserve. Reaching 11:00 on 11 November 1918 is survival, not conquest.

## Game loop

Each turn presents one situated event. A choice applies deterministic effects, advances time, resolves contextual risk, updates historical context and relationships, writes a diary entry, and selects the next eligible event. Quiet routines advance days or weeks. Front-line danger advances hours. Ended lives average roughly 90 turns; a full armistice life averages roughly 120 because it crosses the complete historical timeline.

## First playable mission: the orchard road

New lives enter a ten-scene fictional mission immediately after their arrival choice: orders, route preparation, shared kit, George's assignment, approach, Edward's rescue, wound treatment, withdrawal, medical aid and aftermath. Edward and George remain the same persistent NPCs used by the rest of the game. The mission runs without unrelated random events interrupting it, then returns to normal historical and personal-event scheduling. Existing mid-game saves continue their current lives; they are not reset into the mission.

The mission is a small prototype of decisions with understandable causes. Its outcomes follow deterministic rules, not the ordinary casualty rolls. An exposed crossing without George's covering fire causes a player wound, with fourteen saved game minutes to control bleeding. Edward's injury has a twelve-minute deadline. Treatment takes effect on completion; timely aid or a dressing can intervene. A second untreated wound never resets the first wound's clock. Expired bleeding ends the player's life with the specific cause and deadline in the diary. There is no hidden instant-death roll in this chapter.

Preparation has a twenty-minute budget. Reconnaissance unlocks shorter routes; rest reduces fatigue and carrying costs. Collecting another dressing or smoke competes for time, and preparing late subtracts from the later twenty-eight-minute evacuation window. George can cover exposed movement or carry a stretcher and assist treatment, with distinct capabilities. Shared dressings are counted and consumed. High fatigue adds four minutes to carrying; missing the cart makes medical aid take eight minutes instead of two. These rules and the exact projected results are displayed before choosing, including options unavailable because of earlier preparation. Time advances on a choice only; these are game-clock deadlines, not real-time timers.

The player can commit to Edward's return or place their own return first. The game records that commitment's outcome without a moral score. Edward can be evacuated alive, die from delayed treatment, or be left outside the casualty route even after being stabilized. Successful evacuation leaves him wounded and away from the section, with his relationship and personnel record updated. George's shared task, leftover medical kit, journal and mission summary persist into later play and the ending. The mission's saved state includes preparation, supplies, wound deadlines and every stage; reloads and language switches cannot reset them.

Two useful comparison routes are reconnaissance → George's cover → flank rescue → dress Edward → known return, and rest → stretcher support → fast exposed rescue → assisted treatment → shared carry. The latter saves time and supplies at the cost of a player wound that requires intervention. Taking the longest safe detour avoids the player's wound but leaves too little time for Edward. This prototype demonstrates the decision structure; it does not replace casualty handling or random scheduling throughout the rest of the game, and its fixed rules are not yet a balance claim for all strategies.

Validation includes the existing full-life simulation, a Chinese UI save/resume flow, and traversal of every reachable mission branch, comparing visible forecasts to resolution, checking for dead ends and negative supplies, and round-tripping saved state at each transition.

Covering fire is not free protection: when used on an exposed crossing, George's firing position is hit, leaving him with a shoulder wound and requiring evacuation after the task. The forecast names this cost before the action. Choosing cover but using the scouted concealed routes does not expose him. Thus preparation and safe movement can preserve George at a fatigue cost; rapid movement with stretcher assistance can preserve him at a player-health cost; using his exposed cover protects the player but leaves George away from the section. His wound is not an unannounced random punishment for helping.

## Event system

`GameEvent` data is separate from rendering. Events carry eligibility rules, contextual weights, choices, internal time ranges, effects, relationship changes, risks, occurrence limits, cooldowns, and optional story metadata. Every choice previews its exact immediate effects and its current risk range after health, fatigue, stress, morale, weather, equipment, posture, and elapsed-time pressure are applied. Time still advances the historical calendar, but event-duration chips are deliberately omitted from choices so the preview concentrates on player-facing consequences.

The selector resolves fixed history first, then due personal or chapter callbacks, then prefers unseen eligible content inside a category. Ordinary authored scenes appear once; combat scenes may recur only after a long cooldown. Exact occurrence history and the choice that caused it are stored in `GameState`, replacing the former seven-event-only suppression as the primary repetition control.

## Random system

All consequential randomness passes through a serializable Mulberry32 state. Saving stores the current PRNG state, so reloading cannot reroll a dangerous choice. The same seed and same choices reproduce the same key outcomes. There is no hidden luck attribute in the casualty formula.

## NPC system

Five persistent fictional comrades have background, temperament, relationship value, status, and a four-stage personal arc. A choice advances the arc, records branch flags, and schedules the next scene after other events have passed. Edward and George are the complete branching templates: each has three genuinely different middle routes and three authored endings, while recap and next-step text make the active thread legible between delayed scenes. If either story is interrupted by a wound, death, capture, or transfer, its pending branch is replaced by a status-specific closure scene instead of silently disappearing. Active comrades can still suffer those outcomes; every casualty roll names its exposed comrade in advance instead of selecting an unrelated active NPC after the choice.

## History system

Curated timeline records have fixed dates, short factual summaries, locations, and contextual effects. Crossing a date queues a historical notice and updates the theatre context. Arras, Third Ypres, Cambrai, the spring offensive, Second Marne, and the Hundred Days each schedule a distinct fictional section-level chapter scene. The player can change only the personal response and never redirect the recorded event.

## Save system

The full serializable `GameState` is written to `localStorage` after character creation and every resolved turn. This includes PRNG state, event memory, arc stages, branch flags, and delayed-event deadlines. Saves have a schema version and are validated before use; older version-one saves receive empty narrative defaults and are enriched from their journal on the next choice.

## Localization

The complete game supports English and Simplified Chinese. A typed UI dictionary covers interface chrome, while ID-keyed content dictionaries cover events, choices, outcomes, letters, NPCs, history, diary entries, and endings. English remains the engine's canonical authored and saved representation. Journal entries retain event, choice, history, NPC, and ending IDs so either language can be reconstructed without migrating old saves or touching the PRNG. Language is a separate browser preference and can be changed during play.

## Endings

The engine supports killed in action, death from wounds or illness, invalided home, prisoner of war, and survival to the armistice. Casualties resolve in layers: exposure, capture or injury severity, health loss, field treatment, and a medical-board result. Low-risk scenes can injure or ultimately kill through untreated wounds but cannot cause an unmediated killed-in-action result; catastrophic instant death is reserved for explicitly high-exposure actions. The armistice is clamped to exactly 11:00 and receives a quiet final sequence. Endings preserve the diary, relationships, campaign list, and final incident.

## AI boundary

Version 1 has no runtime AI dependency. Narrative is authored local data, so the complete game works offline. A future optional text-enhancement adapter may rewrite surface prose only: it must not change dates, rules, rolls, outcomes, character knowledge, or save data.

## Presentation

The interface uses paper, ink, stamped labels, typewriter-inspired headings, restrained transitions, and a schematic front map. Responsive layouts collapse the dossier columns cleanly. Optional procedural ambience uses the Web Audio API and ships no copyrighted media.
