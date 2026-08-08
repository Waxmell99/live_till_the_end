import type { GameEvent } from '../../game/types';
import { makeEvent, quietAdvance, shortAdvance, statChoice } from './helpers';

export const RELATIONSHIP_EVENTS: GameEvent[] = [
  makeEvent({
    id: 'james-bread', kind: 'relationship', title: 'Half a ration', kicker: 'James sits beside you',
    text: 'James breaks his bread exactly in half and puts one piece on your mess tin. He insists he has already eaten.',
    choices: [
      statChoice('Accept it', 'Do not make generosity into an argument.', 'social', { hunger: -7, morale: 5 }, 'You eat in companionable silence.', { effects: { relationships: { james: 6 } } }),
      statChoice('Split your stew in return', 'Make the meal truly shared.', 'social', { hunger: -4, morale: 7 }, 'James says this defeats his original scheme.', { effects: { relationships: { james: 8 } } }),
      statChoice('Tell him to keep it', 'He needs food too.', 'careful', { morale: 1, hunger: 2 }, 'The half ration returns to his pocket.', { effects: { relationships: { james: -1 } } }),
    ], advance: quietAdvance, requirements: { npcActive: 'james' }, focusNpcId: 'james', tags: ['personal'],
  }),
  makeEvent({
    id: 'james-cousin', kind: 'relationship', title: 'James stops joking', kicker: 'A name in the casualty list',
    text: 'One of James’s cousins is listed missing. James reads the line twice and folds the paper into a very small square.',
    choices: [
      statChoice('Sit beside him', 'Do not demand words.', 'social', { morale: -2, stress: 2 }, 'After a long time, he tells you about the docks.', { effects: { relationships: { james: 9 } } }),
      statChoice('Say that missing is not dead', 'Offer the hope available.', 'social', { morale: 1, stress: 1 }, 'James nods without looking up.', { effects: { relationships: { james: 3 } } }),
      statChoice('Leave him privacy', 'Grief is not always company.', 'careful', { morale: -1 }, 'He remains with the folded paper.', { effects: { relationships: { james: 1 } } }),
    ], advance: quietAdvance, requirements: { npcActive: 'james' }, focusNpcId: 'james', tags: ['personal', 'loss'],
  }),
  makeEvent({
    id: 'arthur-drawing', kind: 'relationship', title: 'Two houses and a blue sun', kicker: 'Arthur unfolds a letter',
    text: 'Arthur’s younger daughter has drawn the family outside two houses: their own and a smaller one labelled FRANCE.',
    choices: [
      statChoice('Ask him about his daughters', 'Let him tell every detail.', 'social', { morale: 5, stress: -3 }, 'He talks until the candle gutters.', { effects: { relationships: { arthur: 7 } } }),
      statChoice('Show your family photograph', 'Trade one piece of home for another.', 'social', { morale: 6, stress: -2 }, 'Arthur studies each face as seriously as a lesson.', { requirements: { itemsAll: ['family_photo'] }, effects: { relationships: { arthur: 8 } } }),
      statChoice('Say it is a fine drawing', 'There is a sentry shift soon.', 'duty', { morale: 2 }, 'He folds it along its old creases.', { effects: { relationships: { arthur: 2 } } }),
    ], advance: quietAdvance, requirements: { npcActive: 'arthur' }, focusNpcId: 'arthur', tags: ['personal', 'family'],
  }),
  makeEvent({
    id: 'arthur-order', kind: 'relationship', title: 'An order Arthur distrusts', kicker: 'Before a working party',
    text: 'Arthur says the assigned route was under direct observation yesterday. The new officer has not seen it.',
    choices: [
      statChoice('Support Arthur’s objection', 'Ask for the covered route as a section.', 'social', { stress: 3, morale: 4 }, 'The officer relents after inspecting the map.', { effects: { relationships: { arthur: 8 } } }),
      statChoice('Follow the written route', 'Orders protect nobody from responsibility.', 'duty', { stress: 5, morale: -1 }, 'Arthur follows and says nothing more.', { effects: { relationships: { arthur: -5 } }, risk: { danger: 0.06, fatality: 0.22, npcDanger: 0.04, healthLoss: [10, 26], cause: 'shellfire on an observed route' } }),
      statChoice('Suggest scouting it first', 'Test both judgments before the party moves.', 'careful', { fatigue: 5, stress: 2, morale: 3 }, 'The scout confirms the route is watched.', { effects: { relationships: { arthur: 5 } } }),
    ], advance: shortAdvance, requirements: { npcActive: 'arthur' }, focusNpcId: 'arthur', tags: ['personal', 'duty'],
  }),
  makeEvent({
    id: 'edward-first-shot', kind: 'relationship', title: 'Edward cannot stop shaking', kicker: 'After his first close shell',
    text: 'Edward grips the rifle so hard his knuckles have lost their colour. He says he is fine before anyone asks.',
    choices: [
      statChoice('Give him a simple task', 'Ask him to count the remaining ammunition.', 'social', { stress: -3, morale: 3 }, 'Numbers give his hands somewhere to go.', { effects: { relationships: { edward: 8 } } }),
      statChoice('Tell him everyone shakes', 'Refuse the shame he expects.', 'social', { stress: -4, morale: 4 }, 'His grip loosens a little.', { effects: { relationships: { edward: 9 } } }),
      statChoice('Tell him to pull himself together', 'The next shell will not wait.', 'duty', { morale: -1, stress: 1 }, 'He obeys, but avoids your eyes.', { effects: { relationships: { edward: -7 } } }),
    ], advance: shortAdvance, requirements: { npcActive: 'edward' }, focusNpcId: 'edward', tags: ['personal', 'stress'],
  }),
  makeEvent({
    id: 'edward-age', kind: 'relationship', title: 'The date on Edward’s papers', kicker: 'A birthday in the trench',
    text: 'Edward admits he turned eighteen only last month. James produces a candle stub and declares it a cake.',
    choices: [
      statChoice('Organise a proper celebration', 'Find tea, biscuit, and one clean song.', 'social', { morale: 9, fatigue: 3, hunger: 2, stress: -4 }, 'Edward laughs hard enough to spill the tea.', { effects: { relationships: { edward: 8, james: 3 } } }),
      statChoice('Give him your saved ration', 'A birthday deserves something tangible.', 'social', { morale: 6, hunger: 3 }, 'He saves half despite your protests.', { requirements: { itemsAll: ['extra_ration'] }, effects: { relationships: { edward: 10 }, removeItems: ['extra_ration'] } }),
      statChoice('Wish him well quietly', 'Not every occasion survives attention.', 'careful', { morale: 3 }, 'He thanks you with visible relief.', { effects: { relationships: { edward: 3 } } }),
    ], advance: quietAdvance, requirements: { npcActive: 'edward' }, focusNpcId: 'edward', tags: ['personal'],
  }),
  makeEvent({
    id: 'george-mining', kind: 'relationship', title: 'George knows that sound', kicker: 'Timber below ground',
    text: 'A support beam cracks in the deep dugout. George tilts his head as he once did underground in Barnsley.',
    choices: [
      statChoice('Follow his instructions', 'Move the sleeping men and brace the weak side.', 'social', { fatigue: 8, stress: 3, morale: 5 }, 'The roof settles against the new brace.', { effects: { relationships: { george: 9 } } }),
      statChoice('Fetch the engineer sergeant', 'Get formal authority before moving supports.', 'duty', { fatigue: 5, stress: 5, morale: 1 }, 'The sergeant arrives and gives George the same instructions.', { effects: { relationships: { george: 2 } } }),
      statChoice('Say the timber always creaks', 'The dugout has survived worse.', 'rest', { fatigue: -2, stress: 1, morale: -2 }, 'George moves his own bedding nearer the entrance.', { effects: { relationships: { george: -7 } }, risk: { danger: 0.05, fatality: 0.25, npcDanger: 0.06, healthLoss: [10, 30], cause: 'a dugout roof collapse' } }),
    ], advance: shortAdvance, requirements: { npcActive: 'george' }, focusNpcId: 'george', tags: ['personal', 'work'],
  }),
  makeEvent({
    id: 'george-letter', kind: 'relationship', title: 'George asks for a sentence', kicker: 'A difficult letter',
    text: 'George wants to tell his mother that his closest friend was killed. He has written the date and nothing else.',
    choices: [
      statChoice('Help him find plain words', 'Do not make the death noble or tidy.', 'social', { stress: 3, morale: 2 }, 'Together you finish six honest lines.', { effects: { relationships: { george: 9 } } }),
      statChoice('Offer to write it for him', 'Take the weight of the pencil.', 'social', { stress: 4, morale: 1 }, 'George dictates slowly, correcting every softened phrase.', { effects: { relationships: { george: 6 } } }),
      statChoice('Say families need not know details', 'Kindness may be omission.', 'careful', { stress: 1 }, 'He folds the unfinished page away.', { effects: { relationships: { george: -2 } } }),
    ], advance: quietAdvance, requirements: { npcActive: 'george' }, focusNpcId: 'george', tags: ['personal', 'mail'],
  }),
  makeEvent({
    id: 'alfie-exhausted', kind: 'relationship', title: 'Alfie sits down hard', kicker: 'Outside the aid post',
    text: 'Alfie’s sleeves are stiff with mud. He says there is one more stretcher case, then fails to stand on the first attempt.',
    choices: [
      statChoice('Take his next carry', 'He needs rest more than permission.', 'duty', { fatigue: 12, stress: 5, morale: 6 }, 'Alfie sleeps sitting against the wall.', { effects: { relationships: { alfie: 10 } }, risk: { danger: 0.07, fatality: 0.25, healthLoss: [12, 28], cause: 'shellfire on a stretcher route' } }),
      statChoice('Bring him tea and insist he rests', 'Another bearer can be found.', 'social', { fatigue: 3, stress: -2, morale: 4 }, 'He argues until the tea is in his hand.', { effects: { relationships: { alfie: 8 } } }),
      statChoice('Remind him a man is waiting', 'There is no good time to be exhausted.', 'duty', { morale: -3, stress: 3 }, 'Alfie stands without answering.', { effects: { relationships: { alfie: -8 } } }),
    ], advance: shortAdvance, requirements: { npcActive: 'alfie' }, focusNpcId: 'alfie', tags: ['personal', 'fatigue'],
  }),
  makeEvent({
    id: 'alfie-recipe', kind: 'relationship', title: 'Bread after the war', kicker: 'A recipe card',
    text: 'Alfie shows you the recipe card he carried from his bakery. Flour and clean ovens seem more imaginary than peace.',
    choices: [
      statChoice('Ask him to describe the bakery', 'Let him build it again in words.', 'social', { morale: 7, stress: -4 }, 'By the end, the whole dugout can smell warm bread.', { effects: { relationships: { alfie: 8 } } }),
      statChoice('Promise to visit after the war', 'Choose a bun in advance.', 'social', { morale: 8, stress: 1 }, 'He writes your order on the back of the card.', { effects: { relationships: { alfie: 9 }, addFlags: ['promised_alfie_visit'] } }),
      statChoice('Tell him to keep the card dry', 'Hope needs practical protection.', 'careful', { morale: 3 }, 'He wraps it in waxed cloth.', { effects: { relationships: { alfie: 3 } } }),
    ], advance: quietAdvance, requirements: { npcActive: 'alfie' }, focusNpcId: 'alfie', tags: ['personal', 'future'],
  }),
];
