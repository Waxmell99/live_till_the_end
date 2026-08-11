import type { ChoiceEffects, GameEvent } from '../../game/types';
import { makeEvent, quietAdvance, shortAdvance, statChoice } from './helpers';

function continueStory(
  arcId: string,
  stage: number,
  eventId: string | undefined,
  relationships: Record<string, number>,
  flags: string[] = [],
): ChoiceEffects {
  return {
    relationships,
    addFlags: flags,
    setArcStages: { [arcId]: stage },
    scheduleEvents: eventId ? [{ eventId, afterTurns: 4, expiresAfterTurns: 28 }] : undefined,
  };
}

export const RELATIONSHIP_EVENTS: GameEvent[] = [
  makeEvent({
    id: 'james-bread', kind: 'relationship', title: 'Half a ration', kicker: 'James sits beside you',
    text: 'James breaks his bread exactly in half and puts one piece on your mess tin. He insists he has already eaten.',
    choices: [
      statChoice('Accept it', 'Do not make generosity into an argument.', 'social', { hunger: -7, morale: 5 }, 'You eat in companionable silence.', { effects: continueStory('james', 1, 'james-cousin', { james: 6 }, ['james_accepted_bread']) }),
      statChoice('Split your stew in return', 'Make the meal truly shared.', 'social', { hunger: -4, morale: 7 }, 'James says this defeats his original scheme.', { effects: continueStory('james', 1, 'james-cousin', { james: 8 }, ['james_shared_meal']) }),
      statChoice('Tell him to keep it', 'He needs food too.', 'careful', { morale: 1, hunger: 2 }, 'The half ration returns to his pocket.', { effects: continueStory('james', 1, 'james-cousin', { james: -1 }, ['james_refused_bread']) }),
    ], advance: quietAdvance, requirements: { npcActive: 'james', arcStages: { james: 0 } }, focusNpcId: 'james', tags: ['personal'], arcId: 'james', arcStage: 0,
  }),
  makeEvent({
    id: 'james-cousin', kind: 'relationship', title: 'James stops joking', kicker: 'A name in the casualty list',
    text: 'One of James’s cousins is listed missing. James reads the line twice and folds the paper into a very small square.',
    choices: [
      statChoice('Sit beside him', 'Do not demand words.', 'social', { morale: -2, stress: 2 }, 'After a long time, he tells you about the docks.', { effects: continueStory('james', 2, 'james-cousin-letter', { james: 9 }, ['james_sat_with_grief']) }),
      statChoice('Say that missing is not dead', 'Offer the hope available.', 'social', { morale: 1, stress: 1 }, 'James nods without looking up.', { effects: continueStory('james', 2, 'james-cousin-letter', { james: 3 }, ['james_offered_hope']) }),
      statChoice('Leave him privacy', 'Grief is not always company.', 'careful', { morale: -1 }, 'He remains with the folded paper.', { effects: continueStory('james', 2, 'james-cousin-letter', { james: 1 }, ['james_left_alone']) }),
    ], advance: quietAdvance, requirements: { npcActive: 'james', arcStages: { james: 1 } }, focusNpcId: 'james', tags: ['personal', 'loss'], arcId: 'james', arcStage: 1, scheduledOnly: true,
  }),
  makeEvent({
    id: 'james-cousin-letter', kind: 'relationship', title: 'A letter with no certain answer', kicker: 'James borrows your pencil',
    text: 'The family wants to know whether anyone has heard more about his cousin. James has facts for two lines and an empty page after them.',
    choices: [
      statChoice('Help him write only what is known', 'Do not turn hope into a promise.', 'careful', { stress: 1, morale: 2 }, 'The letter is short, honest, and harder to seal than to write.', { effects: continueStory('james', 3, 'james-roll-call', { james: 8 }, ['james_wrote_plainly']) }),
      statChoice('Add a memory from home', 'Give the family something besides uncertainty.', 'social', { stress: -2, morale: 4 }, 'James writes about two boys stealing apples beside the docks.', { effects: continueStory('james', 3, 'james-roll-call', { james: 9 }, ['james_shared_memory']) }),
      statChoice('Tell him to wait for official news', 'A wrong sentence may travel farther than the truth.', 'duty', { stress: 2, morale: -2 }, 'The paper goes back into his tunic, still blank below the date.', { effects: continueStory('james', 3, 'james-roll-call', { james: -2 }, ['james_delayed_letter']) }),
    ], advance: shortAdvance, requirements: { npcActive: 'james', arcStages: { james: 2 } }, focusNpcId: 'james', tags: ['personal', 'mail'], arcId: 'james', arcStage: 2, scheduledOnly: true,
  }),
  makeEvent({
    id: 'james-roll-call', kind: 'relationship', title: 'The joke after roll call', kicker: 'Before the section moves again',
    text: 'James reads the names present, pauses at the gaps, then makes a terrible joke about the transport. Nobody laughs until he does.',
    choices: [
      statChoice('Answer with a worse joke', 'Let laughter carry what it can.', 'social', { morale: 7, stress: -4 }, 'The section groans together, which is close enough to laughter.', { effects: continueStory('james', 4, undefined, { james: 10 }) }),
      statChoice('Tell him he need not perform', 'He is allowed to be quiet with you.', 'social', { morale: 4, stress: -5 }, 'His smile disappears, but he looks relieved rather than exposed.', { effects: continueStory('james', 4, undefined, { james: 9 }) }),
      statChoice('Finish checking the equipment', 'The move will not wait for grief.', 'duty', { fatigue: 3, stress: 1 }, 'James folds the roll and starts on the ammunition boxes.', { effects: continueStory('james', 4, undefined, { james: 1 }) }),
    ], advance: quietAdvance, requirements: { npcActive: 'james', arcStages: { james: 3 } }, focusNpcId: 'james', tags: ['personal', 'loss'], arcId: 'james', arcStage: 3, scheduledOnly: true,
  }),

  makeEvent({
    id: 'arthur-drawing', kind: 'relationship', title: 'Two houses and a blue sun', kicker: 'Arthur unfolds a letter',
    text: 'Arthur’s younger daughter has drawn the family outside two houses: their own and a smaller one labelled FRANCE.',
    choices: [
      statChoice('Ask him about his daughters', 'Let him tell every detail.', 'social', { morale: 5, stress: -3 }, 'He talks until the candle gutters.', { effects: continueStory('arthur', 1, 'arthur-order', { arthur: 7 }, ['arthur_shared_family']) }),
      statChoice('Show your family photograph', 'Trade one piece of home for another.', 'social', { morale: 6, stress: -2 }, 'Arthur studies each face as seriously as a lesson.', { requirements: { itemsAll: ['family_photo'] }, effects: continueStory('arthur', 1, 'arthur-order', { arthur: 8 }, ['arthur_saw_photo']) }),
      statChoice('Say it is a fine drawing', 'There is a sentry shift soon.', 'duty', { morale: 2 }, 'He folds it along its old creases.', { effects: continueStory('arthur', 1, 'arthur-order', { arthur: 2 }, ['arthur_kept_distance']) }),
    ], advance: quietAdvance, requirements: { npcActive: 'arthur', arcStages: { arthur: 0 } }, focusNpcId: 'arthur', tags: ['personal', 'family'], arcId: 'arthur', arcStage: 0,
  }),
  makeEvent({
    id: 'arthur-order', kind: 'relationship', title: 'An order Arthur distrusts', kicker: 'Before a working party',
    text: 'Arthur says the assigned route was under direct observation yesterday. The new officer has not seen it.',
    choices: [
      statChoice('Support Arthur’s objection', 'Ask for the covered route as a section.', 'social', { stress: 3, morale: 4 }, 'The officer relents after inspecting the map.', { effects: continueStory('arthur', 2, 'arthur-route-aftermath', { arthur: 8 }, ['arthur_route_changed']) }),
      statChoice('Follow the written route', 'Orders protect nobody from responsibility.', 'duty', { stress: 5, morale: -1 }, 'Arthur follows and says nothing more.', { effects: continueStory('arthur', 2, 'arthur-route-aftermath', { arthur: -5 }, ['arthur_route_ignored']), risk: { danger: 0.06, fatality: 0.22, npcDanger: 0.04, healthLoss: [10, 26], cause: 'shellfire on an observed route' } }),
      statChoice('Suggest scouting it first', 'Test both judgments before the party moves.', 'careful', { fatigue: 5, stress: 2, morale: 3 }, 'The scout confirms the route is watched.', { effects: continueStory('arthur', 2, 'arthur-route-aftermath', { arthur: 5 }, ['arthur_route_scouted']) }),
    ], advance: shortAdvance, requirements: { npcActive: 'arthur', arcStages: { arthur: 1 } }, focusNpcId: 'arthur', tags: ['personal', 'duty'], arcId: 'arthur', arcStage: 1, scheduledOnly: true,
  }),
  makeEvent({
    id: 'arthur-route-aftermath', kind: 'relationship', title: 'The old route on the map', kicker: 'A report reaches the dugout',
    text: 'Shells struck the exposed track after the working party returned. Arthur marks the impact beside yesterday’s pencil line and waits for you to speak.',
    choices: [
      statChoice('Credit his judgment in front of the officer', 'A good warning should enter the record.', 'duty', { morale: 4, stress: 2 }, 'The officer gives a stiff nod. Arthur erases nothing.', { requirements: { flagsAny: ['arthur_route_changed', 'arthur_route_scouted'] }, effects: continueStory('arthur', 3, 'arthur-blue-sun', { arthur: 10 }, ['arthur_public_credit']) }),
      statChoice('Admit that you should have listened', 'Responsibility survives obedience.', 'social', { morale: -1, stress: 3 }, 'Arthur accepts the words without making them easier.', { requirements: { flagsAll: ['arthur_route_ignored'] }, effects: continueStory('arthur', 3, 'arthur-blue-sun', { arthur: 7 }, ['arthur_apology']) }),
      statChoice('Ask him to update the section map', 'Turn the warning into something useful.', 'careful', { fatigue: 3, morale: 3 }, 'He draws a covered approach in blue pencil.', { effects: continueStory('arthur', 3, 'arthur-blue-sun', { arthur: 6 }, ['arthur_map_updated']) }),
      statChoice('Say that everyone was lucky', 'Do not invite an argument with authority.', 'duty', { stress: 1 }, 'Arthur folds the map with the impact still marked.', { effects: continueStory('arthur', 3, 'arthur-blue-sun', { arthur: -2 }, ['arthur_luck_only']) }),
    ], advance: shortAdvance, requirements: { npcActive: 'arthur', arcStages: { arthur: 2 } }, focusNpcId: 'arthur', tags: ['personal', 'duty'], arcId: 'arthur', arcStage: 2, scheduledOnly: true,
  }),
  makeEvent({
    id: 'arthur-blue-sun', kind: 'relationship', title: 'A third figure under the blue sun', kicker: 'Another drawing from Bath',
    text: 'Arthur’s daughter has drawn the two houses again. This time a third figure stands beside the little house in France, identified only as “Father’s friend.”',
    choices: [
      statChoice('Ask Arthur to send your thanks', 'Answer a child who gave you a place on the page.', 'social', { morale: 8, stress: -5 }, 'Arthur writes your name carefully beneath the figure.', { effects: continueStory('arthur', 4, undefined, { arthur: 10 }) }),
      statChoice('Add a tiny drawing of the dugout', 'Give the invented house a window and chimney.', 'social', { morale: 7, stress: -3 }, 'Your drawing is poor. Arthur says his daughter will approve.', { effects: continueStory('arthur', 4, undefined, { arthur: 9 }) }),
      statChoice('Tell him to keep it safe', 'Some pages should survive without further marks.', 'careful', { morale: 4 }, 'The drawing returns to its oilskin cover.', { effects: continueStory('arthur', 4, undefined, { arthur: 5 }) }),
    ], advance: quietAdvance, requirements: { npcActive: 'arthur', arcStages: { arthur: 3 } }, focusNpcId: 'arthur', tags: ['personal', 'family'], arcId: 'arthur', arcStage: 3, scheduledOnly: true,
  }),

  makeEvent({
    id: 'edward-first-shot', kind: 'relationship', title: 'Edward cannot stop shaking', kicker: 'After his first close shell',
    text: 'Edward grips the rifle so hard his knuckles have lost their colour. He says he is fine before anyone asks.',
    choices: [
      statChoice('Give him a simple task', 'Ask him to count the remaining ammunition.', 'social', { stress: -3, morale: 3 }, 'Numbers give his hands somewhere to go.', { effects: continueStory('edward', 1, 'edward-age', { edward: 8 }, ['edward_supported']) }),
      statChoice('Tell him everyone shakes', 'Refuse the shame he expects.', 'social', { stress: -4, morale: 4 }, 'His grip loosens a little.', { effects: continueStory('edward', 1, 'edward-age', { edward: 9 }, ['edward_supported']) }),
      statChoice('Tell him to pull himself together', 'The next shell will not wait.', 'duty', { morale: -1, stress: 1 }, 'He obeys, but avoids your eyes.', { effects: continueStory('edward', 1, 'edward-age', { edward: -7 }, ['edward_shamed']) }),
    ], advance: shortAdvance, requirements: { npcActive: 'edward', arcStages: { edward: 0 } }, focusNpcId: 'edward', tags: ['personal', 'stress'], arcId: 'edward', arcStage: 0,
  }),
  makeEvent({
    id: 'edward-age', kind: 'relationship', title: 'The date on Edward’s papers', kicker: 'A birthday in the trench',
    text: 'Edward admits he turned eighteen only last month. James produces a candle stub and declares it a cake.',
    choices: [
      statChoice('Organise a proper celebration', 'Find tea, biscuit, and one clean song.', 'social', { morale: 9, fatigue: 3, hunger: 2, stress: -4 }, 'Edward laughs hard enough to spill the tea.', { effects: continueStory('edward', 2, 'edward-before-patrol', { edward: 8, james: 3 }, ['edward_birthday_shared']) }),
      statChoice('Give him your saved ration', 'A birthday deserves something tangible.', 'social', { morale: 6, hunger: 3 }, 'He saves half despite your protests.', { requirements: { itemsAll: ['extra_ration'] }, effects: { ...continueStory('edward', 2, 'edward-before-patrol', { edward: 10 }, ['edward_birthday_gift']), removeItems: ['extra_ration'] } }),
      statChoice('Wish him well quietly', 'Not every occasion survives attention.', 'careful', { morale: 3 }, 'He thanks you with visible relief.', { effects: continueStory('edward', 2, 'edward-before-patrol', { edward: 3 }, ['edward_birthday_quiet']) }),
    ], advance: quietAdvance, requirements: { npcActive: 'edward', arcStages: { edward: 1 } }, focusNpcId: 'edward', tags: ['personal'], arcId: 'edward', arcStage: 1, scheduledOnly: true,
  }),
  makeEvent({
    id: 'edward-before-patrol', kind: 'relationship', title: 'Edward asks the wrong question', kicker: 'Ten minutes before a patrol',
    text: 'Edward checks the same buckle three times. At last he asks whether shaking means a man is a coward, as if the answer has already been written somewhere.',
    choices: [
      statChoice('Give him another simple count', 'Return to the method that helped before.', 'social', { stress: -4, morale: 4 }, 'He counts bombs, magazines, men, and finally breaths.', { requirements: { flagsAll: ['edward_supported'] }, effects: continueStory('edward', 3, 'edward-after-patrol', { edward: 10 }, ['edward_counted_again']) }),
      statChoice('Say your earlier words were wrong', 'Discipline is no excuse for shame.', 'social', { stress: 3, morale: 2 }, 'He looks surprised, then nods once.', { requirements: { flagsAll: ['edward_shamed'] }, effects: continueStory('edward', 3, 'edward-after-patrol', { edward: 9 }, ['edward_received_apology']) }),
      statChoice('Rehearse the route with him', 'Confidence can begin as preparation.', 'careful', { fatigue: 4, stress: -2, morale: 3 }, 'He traces every turn until the paper can be folded away.', { effects: continueStory('edward', 3, 'edward-after-patrol', { edward: 6 }, ['edward_rehearsed_route']) }),
      statChoice('Tell him courage is moving anyway', 'There is no cleaner answer available.', 'duty', { stress: 2, morale: 4 }, 'He stops checking the buckle and joins the file.', { effects: continueStory('edward', 3, 'edward-after-patrol', { edward: 4 }, ['edward_moved_anyway']) }),
    ], advance: shortAdvance, requirements: { npcActive: 'edward', arcStages: { edward: 2 } }, focusNpcId: 'edward', tags: ['personal', 'patrol'], arcId: 'edward', arcStage: 2, scheduledOnly: true,
  }),
  makeEvent({
    id: 'edward-after-patrol', kind: 'relationship', title: 'The buckle stays fastened', kicker: 'After the patrol returns',
    text: 'Edward comes back mud to the waist and reports each detail in order. Only when he finishes does he notice that his hands are steady.',
    choices: [
      statChoice('Let him notice it himself', 'Do not turn survival into a lesson.', 'careful', { morale: 5, stress: -3 }, 'He looks at his hands and begins to laugh quietly.', { effects: continueStory('edward', 4, undefined, { edward: 9 }) }),
      statChoice('Tell him he did well', 'Praise the work, not fearlessness.', 'social', { morale: 7, stress: -4 }, 'He repeats the words once, as if checking their accuracy.', { effects: continueStory('edward', 4, undefined, { edward: 10 }) }),
      statChoice('Ask him to help the next replacement', 'Pass the method forward.', 'duty', { morale: 6, fatigue: 2 }, 'At stand-to, he quietly checks another boy’s equipment.', { effects: continueStory('edward', 4, undefined, { edward: 8 }, ['edward_mentors_others']) }),
    ], advance: quietAdvance, requirements: { npcActive: 'edward', arcStages: { edward: 3 } }, focusNpcId: 'edward', tags: ['personal', 'growth'], arcId: 'edward', arcStage: 3, scheduledOnly: true,
  }),

  makeEvent({
    id: 'george-mining', kind: 'relationship', title: 'George knows that sound', kicker: 'Timber below ground',
    text: 'A support beam cracks in the deep dugout. George tilts his head as he once did underground in Barnsley.',
    choices: [
      statChoice('Follow his instructions', 'Move the sleeping men and brace the weak side.', 'social', { fatigue: 8, stress: 3, morale: 5 }, 'The roof settles against the new brace.', { effects: continueStory('george', 1, 'george-letter', { george: 9 }, ['george_skill_trusted']) }),
      statChoice('Fetch the engineer sergeant', 'Get formal authority before moving supports.', 'duty', { fatigue: 5, stress: 5, morale: 1 }, 'The sergeant arrives and gives George the same instructions.', { effects: continueStory('george', 1, 'george-letter', { george: 2 }, ['george_authority_first']) }),
      statChoice('Say the timber always creaks', 'The dugout has survived worse.', 'rest', { fatigue: -2, stress: 1, morale: -2 }, 'George moves his own bedding nearer the entrance.', { effects: continueStory('george', 1, 'george-letter', { george: -7 }, ['george_warning_ignored']), risk: { danger: 0.05, fatality: 0.25, npcDanger: 0.06, healthLoss: [10, 30], cause: 'a dugout roof collapse' } }),
    ], advance: shortAdvance, requirements: { npcActive: 'george', arcStages: { george: 0 } }, focusNpcId: 'george', tags: ['personal', 'work'], arcId: 'george', arcStage: 0,
  }),
  makeEvent({
    id: 'george-letter', kind: 'relationship', title: 'George asks for a sentence', kicker: 'A difficult letter',
    text: 'George wants to tell his mother that his closest friend was killed. He has written the date and nothing else.',
    choices: [
      statChoice('Help him find plain words', 'Do not make the death noble or tidy.', 'social', { stress: 3, morale: 2 }, 'Together you finish six honest lines.', { effects: continueStory('george', 2, 'george-mother-reply', { george: 9 }, ['george_letter_plain']) }),
      statChoice('Offer to write it for him', 'Take the weight of the pencil.', 'social', { stress: 4, morale: 1 }, 'George dictates slowly, correcting every softened phrase.', { effects: continueStory('george', 2, 'george-mother-reply', { george: 6 }, ['george_letter_dictated']) }),
      statChoice('Say families need not know details', 'Kindness may be omission.', 'careful', { stress: 1 }, 'He folds the unfinished page away.', { effects: continueStory('george', 2, 'george-mother-reply', { george: -2 }, ['george_letter_unfinished']) }),
    ], advance: quietAdvance, requirements: { npcActive: 'george', arcStages: { george: 1 } }, focusNpcId: 'george', tags: ['personal', 'mail'], arcId: 'george', arcStage: 1, scheduledOnly: true,
  }),
  makeEvent({
    id: 'george-mother-reply', kind: 'relationship', title: 'George reads the answer twice', kicker: 'Post from Barnsley',
    text: 'His mother thanks him for writing and asks whether the dead man was afraid. George has carried the question all day without opening it to anyone.',
    choices: [
      statChoice('Say fear does not cancel courage', 'Give him words that remain true.', 'social', { morale: 3, stress: -3 }, 'George adds the sentence below his mother’s letter.', { effects: continueStory('george', 3, 'george-second-crack', { george: 9 }, ['george_named_fear']) }),
      statChoice('Tell him the man was not alone', 'Answer what the family may really be asking.', 'social', { morale: 4, stress: 1 }, 'He folds the reply around that single assurance.', { effects: continueStory('george', 3, 'george-second-crack', { george: 8 }, ['george_named_company']) }),
      statChoice('Say there is no answer fit for paper', 'Some truth cannot pass the censor or the family table.', 'careful', { morale: -1, stress: 2 }, 'George pockets the letter without disagreeing.', { effects: continueStory('george', 3, 'george-second-crack', { george: 2 }, ['george_kept_silence']) }),
    ], advance: quietAdvance, requirements: { npcActive: 'george', arcStages: { george: 2 } }, focusNpcId: 'george', tags: ['personal', 'mail'], arcId: 'george', arcStage: 2, scheduledOnly: true,
  }),
  makeEvent({
    id: 'george-second-crack', kind: 'relationship', title: 'The second crack in the timber', kicker: 'Another night underground',
    text: 'A roof support gives the same dry report as a rifle. George looks toward you before anyone else moves.',
    choices: [
      statChoice('Start clearing the dugout at once', 'Trust the knowledge that kept you alive before.', 'duty', { fatigue: 7, stress: 2, morale: 5 }, 'Everyone is outside before the rotten joint gives way.', { requirements: { flagsAll: ['george_skill_trusted'] }, effects: continueStory('george', 4, undefined, { george: 10 }) }),
      statChoice('Ask George what he hears', 'Make his judgment the order this time.', 'social', { stress: 2, morale: 4 }, 'He points to the weak brace and the section moves without argument.', { effects: continueStory('george', 4, undefined, { george: 9 }) }),
      statChoice('Brace it together', 'Knowledge still needs hands.', 'duty', { fatigue: 10, stress: 3, morale: 6 }, 'The new timber takes the weight. George tests it once and nods.', { effects: continueStory('george', 4, undefined, { george: 8 }) }),
    ], advance: shortAdvance, requirements: { npcActive: 'george', arcStages: { george: 3 } }, focusNpcId: 'george', tags: ['personal', 'work'], arcId: 'george', arcStage: 3, scheduledOnly: true,
  }),

  makeEvent({
    id: 'alfie-recipe', kind: 'relationship', title: 'Bread after the war', kicker: 'A recipe card',
    text: 'Alfie shows you the recipe card he carried from his bakery. Flour and clean ovens seem more imaginary than peace.',
    choices: [
      statChoice('Ask him to describe the bakery', 'Let him build it again in words.', 'social', { morale: 7, stress: -4 }, 'By the end, the whole dugout can smell warm bread.', { effects: continueStory('alfie', 1, 'alfie-exhausted', { alfie: 8 }, ['alfie_described_bakery']) }),
      statChoice('Promise to visit after the war', 'Choose a bun in advance.', 'social', { morale: 8, stress: 1 }, 'He writes your order on the back of the card.', { effects: continueStory('alfie', 1, 'alfie-exhausted', { alfie: 9 }, ['promised_alfie_visit']) }),
      statChoice('Tell him to keep the card dry', 'Hope needs practical protection.', 'careful', { morale: 3 }, 'He wraps it in waxed cloth.', { effects: continueStory('alfie', 1, 'alfie-exhausted', { alfie: 3 }, ['alfie_card_wrapped']) }),
    ], advance: quietAdvance, requirements: { npcActive: 'alfie', arcStages: { alfie: 0 } }, focusNpcId: 'alfie', tags: ['personal', 'future'], arcId: 'alfie', arcStage: 0,
  }),
  makeEvent({
    id: 'alfie-exhausted', kind: 'relationship', title: 'Alfie sits down hard', kicker: 'Outside the aid post',
    text: 'Alfie’s sleeves are stiff with mud. He says there is one more stretcher case, then fails to stand on the first attempt.',
    choices: [
      statChoice('Take his next carry', 'He needs rest more than permission.', 'duty', { fatigue: 12, stress: 5, morale: 6 }, 'Alfie sleeps sitting against the wall.', { effects: continueStory('alfie', 2, 'alfie-list-of-names', { alfie: 10 }, ['alfie_relieved']), risk: { danger: 0.07, fatality: 0.25, healthLoss: [12, 28], cause: 'shellfire on a stretcher route' } }),
      statChoice('Bring him tea and insist he rests', 'Another bearer can be found.', 'social', { fatigue: 3, stress: -2, morale: 4 }, 'He argues until the tea is in his hand.', { effects: continueStory('alfie', 2, 'alfie-list-of-names', { alfie: 8 }, ['alfie_made_to_rest']) }),
      statChoice('Remind him a man is waiting', 'There is no good time to be exhausted.', 'duty', { morale: -3, stress: 3 }, 'Alfie stands without answering.', { effects: continueStory('alfie', 2, 'alfie-list-of-names', { alfie: -8 }, ['alfie_pushed_on']) }),
    ], advance: shortAdvance, requirements: { npcActive: 'alfie', arcStages: { alfie: 1 } }, focusNpcId: 'alfie', tags: ['personal', 'fatigue'], arcId: 'alfie', arcStage: 1, scheduledOnly: true,
  }),
  makeEvent({
    id: 'alfie-list-of-names', kind: 'relationship', title: 'Names behind the casualty numbers', kicker: 'A quiet hour at the aid post',
    text: 'Alfie keeps a private list of men he carried. Beside some names he has written a destination; beside others there is only a blank space.',
    choices: [
      statChoice('Help him finish what can be known', 'Ask the clerk and compare the tags.', 'duty', { fatigue: 5, stress: 3, morale: 3 }, 'Several blank spaces receive hospitals. Two remain blank.', { effects: continueStory('alfie', 3, 'alfie-flour-card', { alfie: 9 }, ['alfie_names_checked']) }),
      statChoice('Read the names aloud with him', 'Make them people again for one hour.', 'social', { stress: 2, morale: 5 }, 'Alfie answers each name with where the man came from.', { effects: continueStory('alfie', 3, 'alfie-flour-card', { alfie: 10 }, ['alfie_names_read']) }),
      statChoice('Tell him the list is hurting him', 'Memory can become another load.', 'careful', { stress: -2, morale: -1 }, 'He closes the notebook but does not put it away.', { effects: continueStory('alfie', 3, 'alfie-flour-card', { alfie: 2 }, ['alfie_list_closed']) }),
    ], advance: quietAdvance, requirements: { npcActive: 'alfie', arcStages: { alfie: 2 } }, focusNpcId: 'alfie', tags: ['personal', 'loss'], arcId: 'alfie', arcStage: 2, scheduledOnly: true,
  }),
  makeEvent({
    id: 'alfie-flour-card', kind: 'relationship', title: 'The order on the recipe card', kicker: 'Alfie checks an old promise',
    text: 'The writing on the back of the recipe card has blurred, but your name is still legible. Alfie asks whether the order still stands.',
    choices: [
      statChoice('Repeat the exact order', 'Prove that the imagined bakery has remained real.', 'social', { morale: 9, stress: -4 }, 'Alfie rewrites it in darker pencil and adds “paid in advance.”', { requirements: { flagsAll: ['promised_alfie_visit'] }, effects: continueStory('alfie', 4, undefined, { alfie: 10 }, ['alfie_promise_confirmed']) }),
      statChoice('Choose something now', 'Make a new promise if there was no old one.', 'social', { morale: 7, stress: -3 }, 'He recommends a currant bun and records no objection.', { effects: continueStory('alfie', 4, undefined, { alfie: 8 }, ['alfie_new_order']) }),
      statChoice('Tell him to keep the card for himself', 'His future does not require your signature.', 'careful', { morale: 4 }, 'He folds it once and puts it close to his chest.', { effects: continueStory('alfie', 4, undefined, { alfie: 5 }) }),
    ], advance: quietAdvance, requirements: { npcActive: 'alfie', arcStages: { alfie: 3 } }, focusNpcId: 'alfie', tags: ['personal', 'future'], arcId: 'alfie', arcStage: 3, scheduledOnly: true,
  }),
];
