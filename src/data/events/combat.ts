import type { GameEvent } from '../../game/types';
import { dangerAdvance, makeEvent, statChoice } from './helpers';

export const COMBAT_EVENTS: GameEvent[] = [
  makeEvent({
    id: 'bombardment-dugout', kind: 'combat', title: 'The roof begins to lift', kicker: 'Heavy bombardment',
    text: 'Each shell presses air through the dugout entrance. Timber groans above you and powdered chalk falls into every open mouth.',
    choices: [
      statChoice('Brace the roof supports', 'Work with George before the next impact.', 'duty', { fatigue: 7, stress: 6, morale: 3 }, 'The centre post holds through the worst of it.', { effects: { relationships: { george: 4 } }, risk: { danger: 0.09, fatality: 0.35, npcDanger: 0.05, healthLoss: [15, 35], cause: 'a direct hit on the dugout' }, npcId: 'george' }),
      statChoice('Crouch below the rear wall', 'Choose the deepest cover and wait.', 'careful', { stress: 8, fatigue: 3, morale: -1 }, 'The entrance collapses, but the rear pocket remains.', { risk: { danger: 0.045, fatality: 0.28, npcDanger: 0.04, healthLoss: [12, 28], cause: 'a collapsing dugout' } }),
      statChoice('Carry a wounded sentry inside', 'Cross the exposed bay between salvos.', 'bold', { fatigue: 9, stress: 8, morale: 7 }, 'You drag him through as earth begins falling again.', { risk: { danger: 0.14, fatality: 0.38, npcDanger: 0.03, healthLoss: [18, 42], cause: 'shellfire while rescuing a sentry' }, effects: { relationships: { alfie: 4 } }, npcId: 'alfie' }),
    ], advance: dangerAdvance, weight: 1.2, tags: ['shelling'],
  }),
  makeEvent({
    id: 'gas-cloud', kind: 'combat', title: 'Gas gong', kicker: 'The wind changes',
    text: 'A sweet, unfamiliar smell reaches the firestep. Somewhere down the line, metal is struck again and again: gas.',
    choices: [
      statChoice('Mask first, then warn the dugout', 'Trust the drill and move quickly.', 'duty', { stress: 7, fatigue: 5, morale: 3 }, 'The respirator seals before the cloud thickens.', { risk: { danger: 0.045, fatality: 0.18, healthLoss: [14, 32], cause: 'poison gas exposure', mitigationItem: 'gas_mask' } }),
      statChoice('Help Edward fit his mask', 'His hands are pulling at the wrong straps.', 'social', { stress: 9, fatigue: 6, morale: 5 }, 'You seat his mask, then force your own into place.', { effects: { relationships: { edward: 8 } }, risk: { danger: 0.1, fatality: 0.22, npcDanger: 0.05, healthLoss: [18, 38], cause: 'poison gas exposure', mitigationItem: 'gas_mask' }, npcId: 'edward' }),
      statChoice('Climb toward higher ground', 'Move out of the deepest trench bay.', 'careful', { stress: 8, fatigue: 8 }, 'The cloud pools below while you keep low behind the parapet.', { risk: { danger: 0.07, fatality: 0.2, healthLoss: [15, 34], cause: 'poison gas exposure', mitigationItem: 'gas_mask' } }),
    ], advance: dangerAdvance, weight: 0.7, tags: ['gas'],
  }),
  makeEvent({
    id: 'night-patrol', kind: 'combat', title: 'Patrol into no man’s land', kicker: '23:40',
    text: 'Four of you crawl through a gap in the wire to inspect an enemy listening post. The mud shines under each Very light.',
    choices: [
      statChoice('Lead by the shell holes', 'The route is longer but keeps you below ground level.', 'careful', { fatigue: 9, stress: 7, morale: 4 }, 'You count the post, its wire, and the voices inside.', { risk: { danger: 0.065, fatality: 0.28, capture: 0.08, npcDanger: 0.04, healthLoss: [14, 30], cause: 'fire during a night patrol' } }),
      statChoice('Crawl straight to the objective', 'Spend less time exposed.', 'bold', { fatigue: 7, stress: 9, morale: 6 }, 'The listening post appears suddenly beyond a torn bank.', { risk: { danger: 0.12, fatality: 0.32, capture: 0.1, npcDanger: 0.07, healthLoss: [18, 38], cause: 'fire during a night patrol' } }),
      statChoice('Recommend observing from cover', 'Bring back less detail with less risk.', 'careful', { fatigue: 5, stress: 4, morale: -1 }, 'Arthur accepts the limited report without praise.', { effects: { relationships: { arthur: -1 } }, risk: { danger: 0.035, fatality: 0.2, capture: 0.04, healthLoss: [10, 24], cause: 'a flare exposing the patrol' }, npcId: 'arthur' }),
    ], advance: dangerAdvance, tags: ['patrol', 'night'],
  }),
  makeEvent({
    id: 'runner-orders', kind: 'combat', title: 'The telephone is dead', kicker: 'Orders must get through',
    text: 'The signal wire has been cut in six places. A folded order must reach the company on the right before their barrage lifts.',
    choices: [
      statChoice('Take the communication trench', 'Longer, with cover most of the way.', 'careful', { fatigue: 10, stress: 6, morale: 4 }, 'You arrive breathless with the envelope intact.', { risk: { danger: 0.07, fatality: 0.27, healthLoss: [14, 32], cause: 'shellfire while carrying orders' } }),
      statChoice('Run across the open slope', 'Minutes matter more than comfort.', 'bold', { fatigue: 12, stress: 9, morale: 8 }, 'The order arrives before the barrage changes.', { risk: { danger: 0.17, fatality: 0.38, healthLoss: [20, 46], cause: 'machine-gun fire while carrying orders' } }),
      statChoice('Try to repair the wire', 'Restore the quicker method from cover.', 'duty', { fatigue: 8, stress: 5, morale: 3 }, 'The field telephone crackles back to life.', { risk: { danger: 0.09, fatality: 0.3, healthLoss: [15, 35], cause: 'shellfire while repairing signal wire' } }),
    ], advance: dangerAdvance, tags: ['runner', 'shelling'],
  }),
  makeEvent({
    id: 'over-the-top', kind: 'combat', title: 'The whistle', kicker: 'Zero hour',
    text: 'The barrage walks away from the enemy line. The officer raises his whistle; the ladder shakes beneath the first man’s boots.',
    choices: [
      statChoice('Keep close behind the barrage', 'Move before defenders can emerge.', 'bold', { fatigue: 14, stress: 12, morale: 7 }, 'Earth fountains ahead and you keep the measured distance.', { risk: { danger: 0.19, fatality: 0.42, capture: 0.03, npcDanger: 0.09, healthLoss: [22, 50], cause: 'enemy fire during an infantry attack' } }),
      statChoice('Advance by shell holes', 'Trade speed for moments of cover.', 'careful', { fatigue: 16, stress: 10, morale: 3 }, 'You cross the ground in short, exhausting rushes.', { risk: { danger: 0.13, fatality: 0.36, capture: 0.05, npcDanger: 0.07, healthLoss: [18, 42], cause: 'enemy fire during an infantry attack' } }),
      statChoice('Stay beside George’s Lewis gun', 'Move as a group and cover each bound.', 'social', { fatigue: 15, stress: 11, morale: 5 }, 'George’s steady bursts give the section a path.', { effects: { relationships: { george: 6 } }, risk: { danger: 0.145, fatality: 0.37, capture: 0.04, npcDanger: 0.08, healthLoss: [20, 44], cause: 'enemy fire during an infantry attack' }, npcId: 'george' }),
    ], advance: dangerAdvance, weight: 0.8, tags: ['attack'],
  }),
  makeEvent({
    id: 'enemy-raid', kind: 'combat', title: 'Shapes at the wire', kicker: '02:53',
    text: 'A sentry fires. Grenades strike the parapet and dark figures crowd the nearest gap in the wire.',
    choices: [
      statChoice('Hold the fire bay', 'Use the traverse and refuse the gap.', 'duty', { fatigue: 10, stress: 11, morale: 6 }, 'The raiders withdraw before reaching the next bay.', { risk: { danger: 0.14, fatality: 0.38, capture: 0.05, npcDanger: 0.08, healthLoss: [18, 42], cause: 'an enemy trench raid' } }),
      statChoice('Fall back to the next traverse', 'Give ground to gain cover.', 'careful', { fatigue: 8, stress: 9, morale: -2 }, 'You form a second line as flares rise overhead.', { risk: { danger: 0.085, fatality: 0.3, capture: 0.08, npcDanger: 0.05, healthLoss: [14, 34], cause: 'an enemy trench raid' } }),
      statChoice('Reach the wounded sentry', 'Alfie is already moving toward him.', 'social', { fatigue: 12, stress: 12, morale: 8 }, 'Together you pull the sentry behind the traverse.', { effects: { relationships: { alfie: 7 } }, risk: { danger: 0.18, fatality: 0.4, capture: 0.04, npcDanger: 0.07, healthLoss: [20, 46], cause: 'an enemy trench raid' }, npcId: 'alfie' }),
    ], advance: dangerAdvance, tags: ['defence', 'night'],
  }),
  makeEvent({
    id: 'sniper-gap', kind: 'combat', title: 'The exposed traverse', kicker: 'A rifle cracks once',
    text: 'A sniper has sight of the gap ahead. A water carrier lies behind the corner, conscious and calling softly.',
    choices: [
      statChoice('Wait for smoke', 'Ask for two smoke bombs before moving.', 'careful', { stress: 6, fatigue: 5, morale: 3 }, 'White smoke fills the gap long enough to drag him clear.', { risk: { danger: 0.055, fatality: 0.35, healthLoss: [16, 38], cause: 'a sniper’s bullet' } }),
      statChoice('Dash across immediately', 'Do not leave him in the open.', 'bold', { stress: 9, fatigue: 8, morale: 7 }, 'You reach his webbing and pull hard.', { risk: { danger: 0.16, fatality: 0.5, healthLoss: [22, 50], cause: 'a sniper’s bullet' } }),
      statChoice('Find a route behind the parados', 'Take longer without crossing the sightline.', 'careful', { stress: 4, fatigue: 10, morale: 1 }, 'You reach him from a collapsed side trench.', { risk: { danger: 0.035, fatality: 0.28, healthLoss: [12, 30], cause: 'stray rifle fire' } }),
    ], advance: dangerAdvance, tags: ['sniper'],
  }),
  makeEvent({
    id: 'counter-barrage', kind: 'combat', title: 'Caught in the counter-barrage', kicker: 'The return journey',
    text: 'Enemy guns bracket the communication trench. Each new salvo walks closer to the carrying party.',
    choices: [
      statChoice('Spread out and keep moving', 'Reduce the number caught by one shell.', 'duty', { fatigue: 12, stress: 9, morale: 4 }, 'The party reaches the support line one by one.', { risk: { danger: 0.12, fatality: 0.42, npcDanger: 0.07, healthLoss: [18, 42], cause: 'counter-battery shellfire' } }),
      statChoice('Shelter in a deep bay', 'Wait for the concentration to move.', 'careful', { fatigue: 5, stress: 11, morale: -1 }, 'Twenty minutes later, the shelling shifts north.', { risk: { danger: 0.075, fatality: 0.45, npcDanger: 0.05, healthLoss: [20, 46], cause: 'a direct shell hit' } }),
      statChoice('Follow George across open ground', 'Leave the registered trench line.', 'bold', { fatigue: 14, stress: 10, morale: 5 }, 'The mud is deep, but the shells remain behind.', { effects: { relationships: { george: 4 } }, risk: { danger: 0.095, fatality: 0.36, npcDanger: 0.05, healthLoss: [16, 38], cause: 'shellfire in open ground' }, npcId: 'george' }),
    ], advance: dangerAdvance, tags: ['shelling'],
  }),
  makeEvent({
    id: 'stretcher-crater', kind: 'combat', title: 'A stretcher through the craters', kicker: 'Casualty clearing route',
    text: 'Alfie needs a fourth bearer. The wounded man cannot walk, and the usual path has disappeared under shellfire.',
    choices: [
      statChoice('Take the front handle', 'Match Alfie’s pace and do not put it down.', 'duty', { fatigue: 15, stress: 7, morale: 7 }, 'The stretcher reaches the aid post level.', { effects: { relationships: { alfie: 7 } }, risk: { danger: 0.1, fatality: 0.33, npcDanger: 0.07, healthLoss: [16, 38], cause: 'shellfire while carrying a wounded man' }, npcId: 'alfie' }),
      statChoice('Scout a covered route first', 'Make the carry longer but safer.', 'careful', { fatigue: 13, stress: 5, morale: 4 }, 'A sunken track gives the bearers partial cover.', { effects: { relationships: { alfie: 4 } }, risk: { danger: 0.055, fatality: 0.3, npcDanger: 0.04, healthLoss: [14, 32], cause: 'shellfire near a casualty route' }, npcId: 'alfie' }),
      statChoice('Say you cannot manage the weight', 'Your arms are already shaking.', 'rest', { fatigue: -2, morale: -6, stress: 2 }, 'Alfie finds another man and leaves without comment.', { effects: { relationships: { alfie: -6 } }, npcId: 'alfie' }),
    ], advance: dangerAdvance, requirements: { npcActive: 'alfie' }, tags: ['rescue'],
  }),
  makeEvent({
    id: 'retreat-road', kind: 'combat', title: 'The road west', kicker: 'The line has broken',
    text: 'Guns, ambulances, infantry, and civilians crowd the same road. An officer points west and says the next position must be held by dark.',
    choices: [
      statChoice('Stay with the section', 'Keep sight of familiar packs in the crowd.', 'social', { fatigue: 15, stress: 10, morale: 4, hunger: 5 }, 'By dusk, five of you answer the roll together.', { effects: { relationships: { james: 3, arthur: 3, edward: 3, george: 3, alfie: 3 } }, risk: { danger: 0.11, fatality: 0.33, capture: 0.08, npcDanger: 0.08, healthLoss: [16, 38], cause: 'shellfire during a retreat' }, npcId: 'arthur' }),
      statChoice('Help move an abandoned gun', 'The team has lost two horses.', 'duty', { fatigue: 19, stress: 9, morale: 6, hunger: 6 }, 'The gun reaches the crossroads before night.', { risk: { danger: 0.15, fatality: 0.36, capture: 0.06, npcDanger: 0.06, healthLoss: [18, 42], cause: 'aircraft fire on a retreating column' } }),
      statChoice('Leave the road for the fields', 'Avoid the traffic and obvious targets.', 'careful', { fatigue: 17, stress: 8, morale: -2, hunger: 5 }, 'You rejoin the battalion after dark, alone.', { risk: { danger: 0.07, fatality: 0.27, capture: 0.13, healthLoss: [14, 32], cause: 'enemy fire during a retreat' } }),
    ], advance: { min: 5, max: 16, unit: 'hours' }, requirements: { from: '1918-03-21T00:00:00.000Z', until: '1918-05-01T00:00:00.000Z' }, weight: 1.5, tags: ['retreat'],
  }),
  makeEvent({
    id: 'tank-advance', kind: 'combat', title: 'Walking behind the tanks', kicker: 'Morning attack',
    text: 'Engines labour in the fog ahead. The tanks are protection, obstacles, and magnets for every enemy gun that can see them.',
    choices: [
      statChoice('Keep the ordered distance', 'Use their cover without bunching close.', 'duty', { fatigue: 13, stress: 9, morale: 6 }, 'The steel shapes remain just visible in the mist.', { risk: { danger: 0.12, fatality: 0.36, npcDanger: 0.06, healthLoss: [18, 42], cause: 'enemy fire during a tank-supported attack' } }),
      statChoice('Move by the sunken road', 'Lose sight of the tanks but gain earth cover.', 'careful', { fatigue: 15, stress: 7, morale: 2 }, 'The road carries you forward below the machine-gun line.', { risk: { danger: 0.08, fatality: 0.31, npcDanger: 0.04, healthLoss: [15, 36], cause: 'enemy fire during an advance' } }),
      statChoice('Help a tank crew under fire', 'A hatch is open and one crewman is down.', 'bold', { fatigue: 16, stress: 12, morale: 9 }, 'You guide the shaken crew toward a shell hole.', { risk: { danger: 0.2, fatality: 0.43, healthLoss: [22, 50], cause: 'artillery fire near a disabled tank' } }),
    ], advance: dangerAdvance, requirements: { from: '1917-11-20T00:00:00.000Z' }, tags: ['attack', 'tanks'],
  }),
  makeEvent({
    id: 'machine-gun-nest', kind: 'combat', title: 'Fire from the farm wall', kicker: 'Advance halted',
    text: 'A machine gun fires through a gap in a ruined wall. The platoon is pinned along a shallow drainage ditch.',
    choices: [
      statChoice('Work around the flank', 'Crawl the ditch until the angle changes.', 'careful', { fatigue: 16, stress: 10, morale: 5 }, 'The wall disappears behind a fold in the field.', { risk: { danger: 0.12, fatality: 0.38, npcDanger: 0.06, healthLoss: [18, 44], cause: 'machine-gun fire' } }),
      statChoice('Cover George while he moves', 'Fire in short bursts at the wall.', 'duty', { fatigue: 12, stress: 11, morale: 6 }, 'George reaches a better position with the Lewis gun.', { effects: { relationships: { george: 7 } }, risk: { danger: 0.15, fatality: 0.4, npcDanger: 0.08, healthLoss: [20, 46], cause: 'machine-gun fire' }, npcId: 'george' }),
      statChoice('Wait for artillery', 'Stay low and signal the position.', 'careful', { fatigue: 7, stress: 8, morale: -1 }, 'A field gun eventually answers the signal.', { risk: { danger: 0.08, fatality: 0.34, npcDanger: 0.05, healthLoss: [16, 38], cause: 'machine-gun fire' } }),
    ], advance: dangerAdvance, tags: ['attack'],
  }),
  makeEvent({
    id: 'strongpoint-cellar', kind: 'combat', title: 'The cellar strongpoint', kicker: 'Village fighting',
    text: 'Shots come from a cellar beneath a roofless house. A white cloth appears at one window and vanishes.',
    choices: [
      statChoice('Call for surrender', 'Use what German words Arthur remembers.', 'careful', { stress: 8, fatigue: 7, morale: 3 }, 'After a long silence, three men emerge without rifles.', { effects: { relationships: { arthur: 3 } }, risk: { danger: 0.08, fatality: 0.35, capture: 0.03, healthLoss: [16, 38], cause: 'rifle fire from a strongpoint' }, npcId: 'arthur' }),
      statChoice('Enter through the garden wall', 'Approach away from the obvious door.', 'bold', { stress: 12, fatigue: 13, morale: 7 }, 'The section reaches the cellar steps through smoke.', { risk: { danger: 0.19, fatality: 0.43, npcDanger: 0.08, healthLoss: [22, 50], cause: 'close fighting at a strongpoint' } }),
      statChoice('Hold the exits and wait', 'Contain the position until support arrives.', 'duty', { stress: 7, fatigue: 9, morale: 2 }, 'The defenders surrender when a field gun is brought up.', { risk: { danger: 0.065, fatality: 0.3, npcDanger: 0.04, healthLoss: [14, 34], cause: 'rifle fire from a strongpoint' } }),
    ], advance: dangerAdvance, tags: ['attack', 'village'],
  }),
  makeEvent({
    id: 'lost-in-fog', kind: 'combat', title: 'The platoon vanishes in fog', kicker: 'Visibility: twenty yards',
    text: 'The guide’s silhouette disappears. You hear boots ahead, but cannot tell whose direction they face.',
    choices: [
      statChoice('Stop and listen', 'Identify the guns and voices before moving.', 'careful', { stress: 9, fatigue: 5, morale: 1 }, 'Arthur’s low whistle reaches you from the left.', { risk: { danger: 0.07, fatality: 0.3, capture: 0.08, healthLoss: [14, 34], cause: 'rifle fire in dense fog' }, npcId: 'arthur' }),
      statChoice('Follow the nearest footsteps', 'Do not lose contact entirely.', 'bold', { stress: 11, fatigue: 8, morale: 4 }, 'The figures ahead are your own section—this time.', { risk: { danger: 0.13, fatality: 0.34, capture: 0.15, healthLoss: [17, 40], cause: 'enemy fire in dense fog' } }),
      statChoice('Use the compass and map', 'Trust the bearing over every sound.', 'duty', { stress: 7, fatigue: 10, morale: 3 }, 'You find the objective and half the platoon finds you.', { risk: { danger: 0.09, fatality: 0.31, capture: 0.07, healthLoss: [15, 36], cause: 'shellfire in dense fog' } }),
    ], advance: dangerAdvance, tags: ['attack', 'weather'],
  }),
  makeEvent({
    id: 'last-morning-fire', kind: 'combat', title: 'The guns have not stopped', kicker: '11 November 1918 · 10:12',
    text: 'Everyone has heard the armistice is to begin at eleven. An officer still has orders; an enemy gun still answers.',
    choices: [
      statChoice('Carry out the order carefully', 'Use the trench and refuse every unnecessary shortcut.', 'careful', { fatigue: 6, stress: 10, morale: 2 }, 'You return with the minutes still moving.', { risk: { danger: 0.045, fatality: 0.38, healthLoss: [18, 42], cause: 'shellfire in the final hour of the war' }, advance: { min: 12, max: 28, unit: 'minutes' } }),
      statChoice('Stay with the section under cover', 'No ground is worth becoming the last casualty.', 'social', { stress: 6, morale: 4 }, 'Nobody speaks. Watches are checked again.', { effects: { relationships: { arthur: 2, james: 2 } }, advance: { min: 15, max: 35, unit: 'minutes' }, npcId: 'arthur' }),
      statChoice('Volunteer to fetch a stranded runner', 'A man lies moving beyond the traverse.', 'bold', { fatigue: 8, stress: 12, morale: 8 }, 'You pull him back while distant batteries continue.', { risk: { danger: 0.11, fatality: 0.42, healthLoss: [20, 46], cause: 'fire in the final hour of the war' }, advance: { min: 10, max: 24, unit: 'minutes' } }),
    ], advance: { min: 12, max: 30, unit: 'minutes' }, requirements: { from: '1918-11-11T10:00:00.000Z' }, weight: 8, tags: ['final'],
  }),
  makeEvent({
    id: 'cratered-road', kind: 'combat', title: 'The road disappears', kicker: 'Advance under shellfire',
    text: 'The map shows a road. The ground shows overlapping craters, a broken limber, and lengths of telephone cable.',
    choices: [
      statChoice('Follow the buried cable', 'It should lead toward a forward post.', 'duty', { fatigue: 12, stress: 8, morale: 3 }, 'The cable ends at a signal dugout still occupied.', { risk: { danger: 0.1, fatality: 0.35, npcDanger: 0.05, healthLoss: [16, 38], cause: 'shellfire on a cratered road' } }),
      statChoice('Move along the crater lips', 'Avoid the deepest water and wreckage.', 'careful', { fatigue: 14, stress: 7, morale: 2 }, 'The route is slow but keeps you oriented.', { risk: { danger: 0.075, fatality: 0.32, npcDanger: 0.04, healthLoss: [15, 35], cause: 'shellfire among road craters' } }),
      statChoice('Cross directly between salvos', 'Reach the far bank before the pattern repeats.', 'bold', { fatigue: 11, stress: 11, morale: 6 }, 'The next salvo lands behind you.', { risk: { danger: 0.16, fatality: 0.4, npcDanger: 0.06, healthLoss: [20, 46], cause: 'shellfire on an exposed road' } }),
    ], advance: dangerAdvance, tags: ['shelling', 'advance'],
  }),
];
