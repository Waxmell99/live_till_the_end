# Design — Survive Until the War Ends

## Experience goal

The player is an ordinary British infantryman on the Western Front. History moves on without asking permission; the player's agency lies in risk, care, duty, avoidance, and the relationships they preserve. Reaching 11:00 on 11 November 1918 is survival, not conquest.

## Game loop

Each turn presents one situated event. A choice applies deterministic effects, resolves contextual risk, advances time, updates historical context and relationships, writes a diary entry, and selects the next eligible event. Quiet routines advance days or weeks. Front-line danger advances hours. This gives roughly 55–100 meaningful turns rather than simulating every day.

## Event system

`GameEvent` data is separate from rendering. Events carry eligibility rules, contextual weights, choices, time ranges, effects, relationship changes, and risks. Risk is modified by health, fatigue, stress, weather, equipment, relationships, choice posture, and the character's hidden luck. Recent-event suppression prevents obvious loops. Historical notices use the same presentation layer but never offer choices that change the recorded outcome.

## Random system

All consequential randomness passes through a serializable Mulberry32 state. A new seed derives character luck and the initial event stream. Saving stores the current PRNG state, so reloading cannot reroll a dangerous choice. The same seed and same choices reproduce the same key outcomes.

## NPC system

Five persistent fictional comrades have background, temperament, relationship value, and status. Choices may build or damage trust. Active comrades can be wounded, killed, captured, or transferred; no NPC has plot armour. Status changes become diary entries and alter later event eligibility and tone.

## History system

Curated timeline records have fixed dates, short factual summaries, locations, and contextual effects. Crossing a date queues a historical notice and updates the theatre context. Fictional incidents are visibly labelled “Personal record”; factual notices are labelled “Historical record.” The player can respond personally but cannot redirect the event.

## Save system

The full serializable `GameState` is written to `localStorage` after character creation and every resolved turn. Saves have a schema version and are validated before use. A corrupt or incompatible save is rejected without crashing, and starting another life replaces it only after confirmation.

## Endings

The engine supports killed in action, death from wounds or illness, invalided home, prisoner of war, and survival to the armistice. The armistice is clamped to exactly 11:00 and receives a quiet final sequence. Endings preserve the diary, relationships, campaign list, and final incident.

## AI boundary

Version 1 has no runtime AI dependency. Narrative is authored local data, so the complete game works offline. A future optional text-enhancement adapter may rewrite surface prose only: it must not change dates, rules, rolls, outcomes, character knowledge, or save data.

## Presentation

The interface uses paper, ink, stamped labels, typewriter-inspired headings, restrained transitions, and a schematic front map. Responsive layouts collapse the dossier columns cleanly. Optional procedural ambience uses the Web Audio API and ships no copyrighted media.
