import type { GameEvent } from '../../game/types';
import { dangerAdvance, makeEvent, quietAdvance, shortAdvance, statChoice } from './helpers';

export const HISTORY_FOLLOWUPS: Record<string, string> = {
  'battle-of-arras': 'chapter-arras-tunnel',
  'third-ypres': 'chapter-ypres-duckboards',
  'battle-of-cambrai': 'chapter-cambrai-tanks',
  'operation-michael': 'chapter-spring-retreat',
  'second-marne': 'chapter-marne-trains',
  'hundred-days': 'chapter-hundred-days-village',
};

export const CHAPTER_EVENTS: GameEvent[] = [
  makeEvent({
    id: 'chapter-arras-tunnel', title: 'Chalk beneath Arras', kicker: 'The Arras offensive · below the town',
    text: 'Your section waits in old quarry tunnels joined and enlarged for the attack. Electric bulbs reveal chalk walls covered with names, arrows, and dates left by men moving toward the same exits.',
    choices: [
      statChoice('Learn the marked route', 'Know which stair and tunnel lead back from the line.', 'careful', { fatigue: 3, stress: -2, morale: 3 }, 'Arthur makes you repeat the junctions until the map can stay folded.', { effects: { relationships: { arthur: 4 }, addFlags: ['arras_route_learned'] } }),
      statChoice('Carry ammunition toward the exits', 'Use the waiting hours for work.', 'duty', { fatigue: 8, stress: 2, morale: 4 }, 'The boxes form a wall beside the upward stair.', { effects: { addFlags: ['arras_ammunition_carried'] } }),
      statChoice('Sleep against the chalk', 'The guns above will provide the alarm.', 'rest', { fatigue: -9, stress: -3, morale: 1 }, 'Chalk dust whitens your coat while the tunnel trembles.', { effects: { addFlags: ['arras_slept_below'] } }),
    ], advance: shortAdvance, requirements: { historyTriggered: 'battle-of-arras' }, tags: ['chapter', 'arras', 'underground'], scheduledOnly: true,
  }),
  makeEvent({
    id: 'chapter-ypres-duckboards', kind: 'survival', title: 'One step off the duckboards', kicker: 'Third Ypres · carrying rations forward',
    text: 'The path across the flooded ground is a narrow run of boards. A ration box slips from the man ahead and drags him knee-deep into mud that will not release his boots.',
    choices: [
      statChoice('Use a rope before stepping off', 'Spread the weight and pull from the boards.', 'careful', { fatigue: 9, stress: 5, morale: 5 }, 'Three men haul together until the mud gives him back.', { effects: { relationships: { george: 3, james: 3 }, addFlags: ['ypres_man_recovered'] } }),
      statChoice('Drop your load and reach him', 'Move before he sinks farther.', 'bold', { fatigue: 12, stress: 7, morale: 7 }, 'You lose two tins of meat but keep hold of his webbing.', { risk: { danger: 0.07, fatality: 0.08, healthLoss: [8, 22], cause: 'exhaustion in flooded shell holes' }, effects: { addFlags: ['ypres_rations_lost'] } }),
      statChoice('Call the following party forward', 'More hands are safer than one more casualty.', 'duty', { fatigue: 5, stress: 4, morale: 2 }, 'The column stops, curses, and forms a human chain.', { effects: { addFlags: ['ypres_column_helped'] } }),
    ], advance: shortAdvance, requirements: { historyTriggered: 'third-ypres' }, tags: ['chapter', 'ypres', 'mud', 'food'], scheduledOnly: true,
  }),
  makeEvent({
    id: 'chapter-cambrai-tanks', title: 'Tracks in the morning frost', kicker: 'Cambrai · tanks moving up',
    text: 'Before dawn, tanks pass close enough to shake frost from the hedge. Their crews carry spanners, revolvers, and the exhausted look of men trusted with a new answer to an old problem.',
    choices: [
      statChoice('Guide one around a collapsed bridge', 'The map does not show yesterday’s shell hole.', 'duty', { fatigue: 7, stress: 3, morale: 6 }, 'The tank turns between two trees and reaches the forming-up road.', { effects: { relationships: { arthur: 3 }, addFlags: ['cambrai_tank_guided'] } }),
      statChoice('Help a crew repair a track', 'Lend hands while they hammer the pin home.', 'social', { fatigue: 9, morale: 5 }, 'The engine catches and the machine lurches forward again.', { effects: { relationships: { george: 4 }, addFlags: ['cambrai_track_helped'] } }),
      statChoice('Watch and conserve your strength', 'A machine is not a promise of safety.', 'careful', { fatigue: -3, stress: 1, morale: 2 }, 'The tanks disappear into mist, leaving deep parallel cuts.', { effects: { addFlags: ['cambrai_watched'] } }),
    ], advance: shortAdvance, requirements: { historyTriggered: 'battle-of-cambrai' }, tags: ['chapter', 'cambrai', 'tanks'], scheduledOnly: true,
  }),
  makeEvent({
    id: 'chapter-spring-retreat', kind: 'combat', title: 'The crossroads will not hold everyone', kicker: 'German spring offensive · the line moving west',
    text: 'Transport, guns, wounded men, and marching companies meet at one cratered crossroads. An officer points west while shell bursts walk steadily along the road from the east.',
    choices: [
      statChoice('Keep the section together', 'Count familiar faces at every ditch and turning.', 'social', { fatigue: 13, stress: 9, morale: 5 }, 'At dusk the same cluster of men answers your count.', { risk: { danger: 0.1, fatality: 0.28, capture: 0.06, npcDanger: 0.04, healthLoss: [14, 34], cause: 'shellfire during a retreat' }, effects: { relationships: { james: 3, arthur: 3, edward: 3, george: 3, alfie: 3 }, addFlags: ['spring_section_together'] } }),
      statChoice('Help clear a wagon from the road', 'Hundreds behind it need the turning.', 'duty', { fatigue: 16, stress: 8, morale: 6 }, 'The wheel rises from the crater as the first shells reach the fields.', { risk: { danger: 0.13, fatality: 0.3, healthLoss: [16, 38], cause: 'shellfire on a cratered road' }, effects: { addFlags: ['spring_crossroads_cleared'] } }),
      statChoice('Leave the road for a mapped track', 'Trade speed for distance from the obvious target.', 'careful', { fatigue: 15, stress: 6, morale: 1 }, 'The track brings you west after dark, alone but ahead of the shelling.', { risk: { danger: 0.055, fatality: 0.22, capture: 0.08, healthLoss: [10, 28], cause: 'enemy fire during a retreat' }, effects: { addFlags: ['spring_track_taken'] } }),
    ], advance: dangerAdvance, requirements: { historyTriggered: 'operation-michael' }, tags: ['chapter', 'spring-offensive', 'retreat'], scheduledOnly: true,
  }),
  makeEvent({
    id: 'chapter-marne-trains', title: 'Trains through the reserve area', kicker: 'Second Marne · a junction behind the line',
    text: 'One train carries fresh troops east while another brings wounded men west. Chalk marks on the wagons name places you have only seen in newspapers and casualty reports.',
    choices: [
      statChoice('Help unload the ambulance train', 'The platform staff have too few hands.', 'duty', { fatigue: 10, stress: 5, morale: 4 }, 'You carry stretchers beneath signs pointing toward civilian platforms.', { effects: { relationships: { alfie: 4 }, addFlags: ['marne_wounded_unloaded'] } }),
      statChoice('Read the wagon markings with Arthur', 'Work out what the movement may mean without inventing certainty.', 'careful', { stress: -2, morale: 3 }, 'The pattern suggests reserves moving, but not where tomorrow will place you.', { effects: { relationships: { arthur: 4 }, addFlags: ['marne_movements_read'] } }),
      statChoice('Sleep beside the kit bags', 'Use the delay before another order finds you.', 'rest', { fatigue: -10, stress: -3, morale: 1 }, 'Whistles and boots enter your sleep without waking you fully.', { effects: { addFlags: ['marne_station_rest'] } }),
    ], advance: quietAdvance, requirements: { historyTriggered: 'second-marne' }, tags: ['chapter', 'marne', 'rest'], scheduledOnly: true,
  }),
  makeEvent({
    id: 'chapter-hundred-days-village', kind: 'survival', title: 'A village left open', kicker: 'Hundred Days · the advance east',
    text: 'The section enters a village abandoned so recently that washing still hangs behind one house. The well may be safe, the cellars may be trapped, and the road ahead is already filling with guns.',
    choices: [
      statChoice('Test the well before anyone drinks', 'Clean water is worth the delay.', 'careful', { fatigue: 4, hunger: -5, morale: 3 }, 'The medical orderly treats it and fills every bottle.', { effects: { addItems: ['clean_water'], addFlags: ['hundred_days_well_tested'] } }),
      statChoice('Search only for civilian documents', 'Leave food and property where they are.', 'duty', { fatigue: 5, stress: 2, morale: 4 }, 'A family photograph goes to headquarters with the village name attached.', { effects: { relationships: { arthur: 2 }, addFlags: ['hundred_days_documents_saved'] } }),
      statChoice('Keep moving with the guns', 'Do not let shelter separate you from the section.', 'social', { fatigue: 8, stress: 3, morale: 5 }, 'The houses close behind you before anyone begins pretending they are safe.', { effects: { relationships: { james: 2, george: 2 }, addFlags: ['hundred_days_kept_moving'] } }),
    ], advance: shortAdvance, requirements: { historyTriggered: 'hundred-days' }, tags: ['chapter', 'hundred-days', 'village'], scheduledOnly: true,
  }),
];
