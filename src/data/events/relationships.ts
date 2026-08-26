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
      statChoice('Follow the written route', 'Orders protect nobody from responsibility.', 'duty', { stress: 5, morale: -1 }, 'Arthur follows and says nothing more.', { effects: continueStory('arthur', 2, 'arthur-route-aftermath', { arthur: -5 }, ['arthur_route_ignored']), risk: { danger: 0.06, fatality: 0.22, npcDanger: 0.04, healthLoss: [10, 26], cause: 'shellfire on an observed route' }, npcId: 'arthur' }),
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
    recap: 'Edward joined the section only days ago and still watches the older men for permission to be afraid.',
    nextHint: 'His eighteenth birthday will reveal whether he believes he can speak honestly to you.',
  }),
  makeEvent({
    id: 'edward-age', kind: 'relationship', title: 'The date on Edward’s papers', kicker: 'A birthday in the trench',
    text: 'Edward admits he turned eighteen only last month. James produces a candle stub and declares it a cake.',
    choices: [
      statChoice('Organise a proper celebration', 'Build on the trust he showed after the shelling.', 'social', { morale: 9, fatigue: 3, hunger: 2, stress: -4 }, 'Edward laughs hard enough to spill the tea and later asks to speak before patrol.', { requirements: { flagsAll: ['edward_supported'] }, effects: continueStory('edward', 2, 'edward-before-patrol', { edward: 8, james: 3 }, ['edward_trust_route']) }),
      statChoice('Apologise away from the others', 'Name the shame your earlier words caused.', 'social', { morale: 2, stress: 3 }, 'Edward does not forgive you at once, but he stays to hear the whole apology.', { requirements: { flagsAll: ['edward_shamed'] }, effects: continueStory('edward', 2, 'edward-apology-patrol', { edward: 7 }, ['edward_repair_route']) }),
      statChoice('Give him your saved ration', 'A tangible kindness can reinforce the trust already begun.', 'social', { morale: 6, hunger: 3 }, 'He saves half despite your protests and asks you to check his patrol kit later.', { requirements: { itemsAll: ['extra_ration'], flagsAll: ['edward_supported'] }, effects: { ...continueStory('edward', 2, 'edward-before-patrol', { edward: 10 }, ['edward_trust_route', 'edward_birthday_gift']), removeItems: ['extra_ration'] } }),
      statChoice('Wish him well and leave early', 'Keep the occasion formal and give him space.', 'careful', { morale: 2 }, 'He thanks you politely. The words he almost says remain unsaid.', { effects: continueStory('edward', 2, 'edward-silent-patrol', { edward: 1 }, ['edward_silence_route']) }),
    ], advance: quietAdvance, requirements: { npcActive: 'edward', arcStages: { edward: 1 } }, focusNpcId: 'edward', tags: ['personal'], arcId: 'edward', arcStage: 1, scheduledOnly: true,
    recap: 'Your response after Edward’s first close shell taught him whether fear could be admitted or had to be hidden.',
    nextHint: 'Tonight’s choice will decide how—and whether—he comes to you before his first patrol.',
  }),
  makeEvent({
    id: 'edward-before-patrol', kind: 'relationship', title: 'Edward asks the wrong question', kicker: 'Ten minutes before a patrol',
    text: 'Edward checks the same buckle three times. At last he asks whether shaking means a man is a coward, as if the answer has already been written somewhere.',
    choices: [
      statChoice('Give him another simple count', 'Return to the method that first helped him.', 'social', { stress: -4, morale: 4 }, 'He counts bombs, magazines, men, and finally breaths.', { effects: continueStory('edward', 3, 'edward-after-patrol', { edward: 10 }, ['edward_counted_again']) }),
      statChoice('Rehearse the route together', 'Turn trust into practical preparation.', 'careful', { fatigue: 4, stress: -2, morale: 3 }, 'He traces every turn until the paper can be folded away.', { effects: continueStory('edward', 3, 'edward-after-patrol', { edward: 8 }, ['edward_rehearsed_route']) }),
      statChoice('Ask him to steady the next man too', 'Treat him as someone capable of giving what he received.', 'duty', { stress: 1, morale: 5 }, 'Edward checks another replacement’s buckle before his own.', { effects: continueStory('edward', 3, 'edward-after-patrol', { edward: 9 }, ['edward_helped_replacement']) }),
    ], advance: shortAdvance, requirements: { npcActive: 'edward', arcStages: { edward: 2 } }, focusNpcId: 'edward', tags: ['personal', 'patrol'], arcId: 'edward', arcStage: 2, scheduledOnly: true,
    recap: 'You answered Edward’s fear without shaming him, and his birthday confirmed that he could come to you openly.',
    nextHint: 'How he carries this trust through patrol may determine what kind of soldier he becomes for the next replacement.',
  }),
  makeEvent({
    id: 'edward-apology-patrol', kind: 'relationship', title: 'An apology is not a method', kicker: 'Before the same patrol',
    text: 'Edward accepts that you regret shaming him, but asks what he should actually do when his hands begin shaking beyond the wire.',
    choices: [
      statChoice('Teach him the ammunition count', 'Give the apology a practical shape.', 'social', { stress: -3, morale: 3 }, 'He repeats the sequence until it belongs to him rather than to you.', { effects: continueStory('edward', 3, 'edward-reconciled', { edward: 9 }, ['edward_apology_became_method']) }),
      statChoice('Admit that your hands shake too', 'Repair the lie beneath the insult.', 'social', { stress: 2, morale: 4 }, 'For the first time, Edward looks at you without measuring himself against you.', { effects: continueStory('edward', 3, 'edward-reconciled', { edward: 10 }, ['edward_shared_fear']) }),
      statChoice('Ask Arthur to rehearse the route with both of you', 'Let repair include another witness and a real plan.', 'careful', { fatigue: 3, stress: -2, morale: 3 }, 'Arthur walks both of you through the route without asking why.', { effects: continueStory('edward', 3, 'edward-reconciled', { edward: 7, arthur: 2 }, ['edward_repair_witnessed']) }),
    ], advance: shortAdvance, requirements: { npcActive: 'edward', arcStages: { edward: 2 } }, focusNpcId: 'edward', tags: ['personal', 'patrol', 'repair'], arcId: 'edward', arcStage: 2, scheduledOnly: true,
    recap: 'You first told Edward to pull himself together, then used his birthday to admit that those words were wrong.',
    nextHint: 'The patrol will show whether an apology can become renewed trust rather than a single better sentence.',
  }),
  makeEvent({
    id: 'edward-silent-patrol', kind: 'relationship', title: 'Edward does not ask', kicker: 'Equipment inspection before patrol',
    text: 'Edward reports his equipment correct in a voice too even to be natural. He has learned to keep fear out of your hearing, not out of his hands.',
    choices: [
      statChoice('Stop the inspection and ask plainly', 'Risk an unwelcome question before the wire.', 'social', { stress: 3, morale: 2 }, 'He says he has not slept and cannot make himself tell the sergeant.', { effects: continueStory('edward', 3, 'edward-medical-transfer', { edward: 5 }, ['edward_finally_spoke']) }),
      statChoice('Send him to Alfie without an audience', 'Treat the shaking as a condition, not a verdict.', 'careful', { fatigue: 2, morale: 1 }, 'Alfie takes him aside and returns alone to the equipment line.', { effects: continueStory('edward', 3, 'edward-medical-transfer', { edward: 4, alfie: 2 }, ['edward_sent_to_alfie']) }),
      statChoice('Accept the report and continue', 'Do not force confidence that has not been offered.', 'duty', { stress: 2, morale: -1 }, 'Edward joins the patrol file, then steps out before it reaches the wire.', { effects: continueStory('edward', 3, 'edward-medical-transfer', { edward: -2 }, ['edward_stepped_out']) }),
    ], advance: shortAdvance, requirements: { npcActive: 'edward', arcStages: { edward: 2 } }, focusNpcId: 'edward', tags: ['personal', 'patrol', 'distance'], arcId: 'edward', arcStage: 2, scheduledOnly: true,
    recap: 'Whatever happened after the first shell, Edward’s quiet birthday left the most important words between you unsaid.',
    nextHint: 'His silence is about to become a decision the section can no longer postpone.',
  }),
  makeEvent({
    id: 'edward-after-patrol', kind: 'relationship', title: 'The buckle stays fastened', kicker: 'After the patrol returns',
    text: 'Edward comes back mud to the waist and reports each detail in order. Only when he finishes does he notice that his hands are steady.',
    choices: [
      statChoice('Let him notice it himself', 'Do not turn survival into a lesson.', 'careful', { morale: 5, stress: -3 }, 'He looks at his hands and begins to laugh quietly.', { effects: continueStory('edward', 4, undefined, { edward: 9 }) }),
      statChoice('Tell him he did well', 'Praise the work, not fearlessness.', 'social', { morale: 7, stress: -4 }, 'He repeats the words once, as if checking their accuracy.', { effects: continueStory('edward', 4, undefined, { edward: 10 }) }),
      statChoice('Ask him to help the next replacement', 'Pass the method forward.', 'duty', { morale: 6, fatigue: 2 }, 'At stand-to, he quietly checks another boy’s equipment.', { effects: continueStory('edward', 4, undefined, { edward: 8 }, ['edward_mentors_others']) }),
    ], advance: quietAdvance, requirements: { npcActive: 'edward', arcStages: { edward: 3 } }, focusNpcId: 'edward', tags: ['personal', 'growth'], arcId: 'edward', arcStage: 3, scheduledOnly: true,
    recap: 'Edward trusted you before patrol and carried the method you gave him beyond the wire.',
  }),
  makeEvent({
    id: 'edward-reconciled', kind: 'relationship', title: 'A place beside the brazier', kicker: 'After the patrol returns',
    text: 'Edward returns exhausted but composed. He leaves a space beside the brazier for you, then says the apology mattered because you gave him something truer to do afterward.',
    choices: [
      statChoice('Thank him for hearing you', 'Do not ask forgiveness to erase what happened.', 'social', { morale: 6, stress: -4 }, 'Edward nods. The space beside the brazier remains yours.', { effects: continueStory('edward', 4, undefined, { edward: 10 }, ['edward_reconciliation_complete']) }),
      statChoice('Ask what helped during patrol', 'Let his experience, not your apology, finish the story.', 'careful', { morale: 5, stress: -3 }, 'He describes the count, the route, and the moment fear stopped being shame.', { effects: continueStory('edward', 4, undefined, { edward: 9 }, ['edward_named_what_helped']) }),
      statChoice('Share the tea without another speech', 'Some repairs need ordinary company afterward.', 'social', { morale: 7, stress: -3 }, 'You drink in silence that no longer feels like distance.', { effects: continueStory('edward', 4, undefined, { edward: 8 }) }),
    ], advance: quietAdvance, requirements: { npcActive: 'edward', arcStages: { edward: 3 } }, focusNpcId: 'edward', tags: ['personal', 'repair'], arcId: 'edward', arcStage: 3, scheduledOnly: true,
    recap: 'After shaming Edward, you apologised and turned that apology into practical help before patrol.',
  }),
  makeEvent({
    id: 'edward-medical-transfer', kind: 'relationship', title: 'Edward’s name leaves the patrol list', kicker: 'A decision at the aid post',
    text: 'The medical officer removes Edward from front-line patrol duty. He will be transferred to a rear signals unit, alive and ashamed of feeling relieved.',
    choices: [
      statChoice('Tell him relief is not cowardice', 'Do not let the transfer become another accusation.', 'social', { morale: 4, stress: -3 }, 'Edward folds the new orders carefully and meets your eyes.', { effects: { ...continueStory('edward', 4, undefined, { edward: 6 }, ['edward_transfer_accepted']), setNpcStatuses: { edward: 'transferred' } } }),
      statChoice('Give him your pencil for signals work', 'Mark the new role as useful rather than lesser.', 'social', { morale: 5, stress: -2 }, 'He tests the point on his thumbnail before putting it in his pocket.', { effects: { ...continueStory('edward', 4, undefined, { edward: 5 }, ['edward_transfer_pencil']), setNpcStatuses: { edward: 'transferred' } } }),
      statChoice('Shake his hand and return to the line', 'The section is already forming up.', 'duty', { morale: -1, stress: 2 }, 'Edward watches you leave, holding transfer papers in both hands.', { effects: { ...continueStory('edward', 4, undefined, { edward: 1 }, ['edward_transfer_formal']), setNpcStatuses: { edward: 'transferred' } } }),
    ], advance: shortAdvance, requirements: { npcActive: 'edward', arcStages: { edward: 3 } }, focusNpcId: 'edward', tags: ['personal', 'transfer'], arcId: 'edward', arcStage: 3, scheduledOnly: true,
    recap: 'Edward learned to hide fear rather than bring it to you. Before patrol, the silence finally broke under its own weight.',
  }),

  makeEvent({
    id: 'george-mining', kind: 'relationship', title: 'George knows that sound', kicker: 'Timber below ground',
    text: 'A support beam cracks in the deep dugout. George tilts his head as he once did underground in Barnsley.',
    choices: [
      statChoice('Follow his instructions', 'Move the sleeping men and brace the weak side.', 'social', { fatigue: 8, stress: 3, morale: 5 }, 'The roof settles against the new brace.', { effects: continueStory('george', 1, 'george-letter', { george: 9 }, ['george_skill_trusted']) }),
      statChoice('Fetch the engineer sergeant', 'Get formal authority before moving supports.', 'duty', { fatigue: 5, stress: 5, morale: 1 }, 'The sergeant arrives and gives George the same instructions.', { effects: continueStory('george', 1, 'george-letter', { george: 2 }, ['george_authority_first']) }),
      statChoice('Say the timber always creaks', 'The dugout has survived worse.', 'rest', { fatigue: -2, stress: 1, morale: -2 }, 'George moves his own bedding nearer the entrance.', { effects: continueStory('george', 1, 'george-letter', { george: -7 }, ['george_warning_ignored']), risk: { danger: 0.05, fatality: 0.25, npcDanger: 0.06, healthLoss: [10, 30], cause: 'a dugout roof collapse' }, npcId: 'george' }),
    ], advance: shortAdvance, requirements: { npcActive: 'george', arcStages: { george: 0 } }, focusNpcId: 'george', tags: ['personal', 'work'], arcId: 'george', arcStage: 0,
    recap: 'George was a miner before the war, but the section has not yet decided whether that knowledge counts as authority.',
    nextHint: 'A difficult letter will show whether you value only his useful hands or the judgments behind them.',
  }),
  makeEvent({
    id: 'george-letter', kind: 'relationship', title: 'George asks for a sentence', kicker: 'A difficult letter',
    text: 'George wants to tell his mother that his closest friend was killed. He has written the date and nothing else.',
    choices: [
      statChoice('Help him find plain words', 'Do not make the death noble or tidy.', 'social', { stress: 3, morale: 2 }, 'Together you finish six honest lines.', { effects: continueStory('george', 2, 'george-mother-reply', { george: 9 }, ['george_letter_plain']) }),
      statChoice('Ask how mining families write such news', 'Let George teach the custom rather than dictate to him.', 'social', { stress: 3, morale: 3 }, 'He explains the knock at the door, the clean shirt, and why every fact must be exact.', { effects: continueStory('george', 2, 'george-timber-lesson', { george: 8 }, ['george_mining_custom_shared']) }),
      statChoice('Say families need not know details', 'Kindness may be omission.', 'careful', { stress: 1 }, 'He folds the unfinished page away.', { effects: continueStory('george', 2, 'george-silent-letter', { george: -3 }, ['george_letter_unfinished']) }),
    ], advance: quietAdvance, requirements: { npcActive: 'george', arcStages: { george: 1 } }, focusNpcId: 'george', tags: ['personal', 'mail'], arcId: 'george', arcStage: 1, scheduledOnly: true,
    recap: 'When the timber cracked, you either trusted George’s mining knowledge, sought formal authority, or dismissed his warning.',
    nextHint: 'What you do with this letter will decide whether his story continues through grief, craft, or distance.',
  }),
  makeEvent({
    id: 'george-mother-reply', kind: 'relationship', title: 'George reads the answer twice', kicker: 'Post from Barnsley',
    text: 'His mother thanks him for writing and asks whether the dead man was afraid. George has carried the question all day without opening it to anyone.',
    choices: [
      statChoice('Say fear does not cancel courage', 'Give him words that remain true.', 'social', { morale: 3, stress: -3 }, 'George adds the sentence below his mother’s letter.', { effects: continueStory('george', 3, 'george-second-crack', { george: 9 }, ['george_named_fear']) }),
      statChoice('Tell him the man was not alone', 'Answer what the family may really be asking.', 'social', { morale: 4, stress: 1 }, 'He folds the reply around that single assurance.', { effects: continueStory('george', 3, 'george-second-crack', { george: 8 }, ['george_named_company']) }),
      statChoice('Say there is no answer fit for paper', 'Some truth cannot pass the censor or the family table.', 'careful', { morale: -1, stress: 2 }, 'George pockets the letter without disagreeing.', { effects: continueStory('george', 3, 'george-second-crack', { george: 2 }, ['george_kept_silence']) }),
    ], advance: quietAdvance, requirements: { npcActive: 'george', arcStages: { george: 2 } }, focusNpcId: 'george', tags: ['personal', 'mail'], arcId: 'george', arcStage: 2, scheduledOnly: true,
    recap: 'You helped George write honestly to the family of his dead friend instead of making the death noble or tidy.',
    nextHint: 'Another failing timber will test whether those honest words changed how readily you trust the living man beside you.',
  }),
  makeEvent({
    id: 'george-timber-lesson', kind: 'relationship', title: 'The lesson beneath the traverse', kicker: 'George draws with a carpenter’s pencil',
    text: 'George marks load, grain, and the sounds that mean a prop is carrying too much. Two young soldiers gather while he explains what miners learn before they are trusted underground.',
    choices: [
      statChoice('Learn every warning sound', 'Treat his knowledge as instruction, not anecdote.', 'careful', { fatigue: 4, stress: -2, morale: 4 }, 'George makes you repeat the sequence until you stop guessing.', { effects: continueStory('george', 3, 'george-engineer-sergeant', { george: 10 }, ['george_lesson_learned']) }),
      statChoice('Ask him to teach the whole section', 'Knowledge is safer when more than one man carries it.', 'duty', { fatigue: 5, morale: 5 }, 'By evening, every dugout has one man assigned to listen to its timber.', { effects: continueStory('george', 3, 'george-engineer-sergeant', { george: 9 }, ['george_lesson_shared']) }),
      statChoice('Take notes for the engineer sergeant', 'Translate experience into the form authority recognises.', 'duty', { fatigue: 3, stress: 1, morale: 3 }, 'George corrects your diagrams until they are fit to show someone with stripes.', { effects: continueStory('george', 3, 'george-engineer-sergeant', { george: 8 }, ['george_lesson_recorded']) }),
    ], advance: shortAdvance, requirements: { npcActive: 'george', arcStages: { george: 2 } }, focusNpcId: 'george', tags: ['personal', 'work', 'teaching'], arcId: 'george', arcStage: 2, scheduledOnly: true,
    recap: 'Instead of taking over George’s difficult letter, you asked him to explain the customs and knowledge he brought from the mine.',
    nextHint: 'The next inspection will decide whether the army treats that knowledge as a curiosity or gives it authority.',
  }),
  makeEvent({
    id: 'george-silent-letter', kind: 'relationship', title: 'The letter remains in George’s pocket', kicker: 'Three mail collections later',
    text: 'The unfinished letter has softened at every fold. George no longer asks for help and has volunteered to move to another Lewis-gun team.',
    choices: [
      statChoice('Ask him to finish it with you now', 'Try to reopen what you helped close.', 'social', { stress: 4, morale: 1 }, 'George says the letter is no longer the only reason he wants distance.', { effects: continueStory('george', 3, 'george-transfer-request', { george: 3 }, ['george_late_offer']) }),
      statChoice('Admit that silence was easier for you', 'Name your part without demanding repair.', 'social', { stress: 3, morale: -1 }, 'He accepts the admission, but does not withdraw the transfer request.', { effects: continueStory('george', 3, 'george-transfer-request', { george: 5 }, ['george_silence_admitted']) }),
      statChoice('Say another gun team needs him', 'Keep the matter professional to the end.', 'duty', { morale: -3 }, 'George nods as if an order has finally been stated clearly.', { effects: continueStory('george', 3, 'george-transfer-request', { george: -4 }, ['george_distance_confirmed']) }),
    ], advance: quietAdvance, requirements: { npcActive: 'george', arcStages: { george: 2 } }, focusNpcId: 'george', tags: ['personal', 'mail', 'distance'], arcId: 'george', arcStage: 2, scheduledOnly: true,
    recap: 'When George asked for help writing to a bereaved family, you advised him to leave the hardest truths unwritten.',
    nextHint: 'The unsent letter has become a decision about whether he remains beside you at all.',
  }),
  makeEvent({
    id: 'george-second-crack', kind: 'relationship', title: 'The second crack in the timber', kicker: 'Another night underground',
    text: 'A roof support gives the same dry report as a rifle. George looks toward you before anyone else moves.',
    choices: [
      statChoice('Start clearing the dugout at once', 'Trust the knowledge that kept you alive before.', 'duty', { fatigue: 7, stress: 2, morale: 5 }, 'Everyone is outside before the rotten joint gives way.', { requirements: { flagsAll: ['george_skill_trusted'] }, effects: continueStory('george', 4, undefined, { george: 10 }) }),
      statChoice('Ask George what he hears', 'Make his judgment the order this time.', 'social', { stress: 2, morale: 4 }, 'He points to the weak brace and the section moves without argument.', { effects: continueStory('george', 4, undefined, { george: 9 }) }),
      statChoice('Brace it together', 'Knowledge still needs hands.', 'duty', { fatigue: 10, stress: 3, morale: 6 }, 'The new timber takes the weight. George tests it once and nods.', { effects: continueStory('george', 4, undefined, { george: 8 }) }),
    ], advance: shortAdvance, requirements: { npcActive: 'george', arcStages: { george: 3 } }, focusNpcId: 'george', tags: ['personal', 'work'], arcId: 'george', arcStage: 3, scheduledOnly: true,
    recap: 'George wrote honestly about fear and company. Now the same practical knowledge that shaped those words is needed underground again.',
  }),
  makeEvent({
    id: 'george-engineer-sergeant', kind: 'relationship', title: 'George’s marks on the official plan', kicker: 'After the engineer inspection',
    text: 'The engineer sergeant copies George’s brace marks onto the company plan and orders every deep dugout checked by his method. George studies the paper without smiling.',
    choices: [
      statChoice('Make sure his name stays on it', 'Credit should survive copying.', 'duty', { morale: 5, stress: -2 }, 'The sergeant adds “Bennett, G.” beside the notes.', { effects: continueStory('george', 4, undefined, { george: 10 }, ['george_credited']) }),
      statChoice('Ask George to lead the inspections', 'Give knowledge a continuing role.', 'social', { fatigue: 5, morale: 6 }, 'He spends the next week listening to timber in every company position.', { effects: continueStory('george', 4, undefined, { george: 9 }, ['george_led_inspections']) }),
      statChoice('Keep your copy of the lesson', 'Recognition matters; retained knowledge matters too.', 'careful', { morale: 4, stress: -2 }, 'George folds the corrected diagram into your pay book.', { effects: continueStory('george', 4, undefined, { george: 8 }, ['george_lesson_kept']) }),
    ], advance: quietAdvance, requirements: { npcActive: 'george', arcStages: { george: 3 } }, focusNpcId: 'george', tags: ['personal', 'work', 'recognition'], arcId: 'george', arcStage: 3, scheduledOnly: true,
    recap: 'George taught you the warning sounds of timber, and you helped carry that knowledge into a form the engineers could recognise.',
  }),
  makeEvent({
    id: 'george-transfer-request', kind: 'relationship', title: 'A different Lewis-gun team', kicker: 'George’s transfer is approved',
    text: 'George packs the coal from Barnsley and the unfinished letter into separate pockets. His new team is only two trenches away, but distance at the front is measured differently.',
    choices: [
      statChoice('Return the unfinished letter', 'Leave him the choice you once discouraged.', 'social', { morale: -1, stress: 2 }, 'George takes it and says he may begin again on clean paper.', { effects: { ...continueStory('george', 4, undefined, { george: 4 }, ['george_letter_returned']), setNpcStatuses: { george: 'transferred' } } }),
      statChoice('Ask to part without pretending', 'Do not call distance friendship.', 'social', { morale: -2, stress: 1 }, 'He shakes your hand once, firmly and without warmth.', { effects: { ...continueStory('george', 4, undefined, { george: 2 }, ['george_parted_plainly']), setNpcStatuses: { george: 'transferred' } } }),
      statChoice('Help carry the ammunition boxes', 'End with useful work when words have failed.', 'duty', { fatigue: 5, morale: -1 }, 'You carry one box to the junction. George carries the other the rest of the way.', { effects: { ...continueStory('george', 4, undefined, { george: 1 }, ['george_boxes_carried']), setNpcStatuses: { george: 'transferred' } } }),
    ], advance: shortAdvance, requirements: { npcActive: 'george', arcStages: { george: 3 } }, focusNpcId: 'george', tags: ['personal', 'transfer', 'distance'], arcId: 'george', arcStage: 3, scheduledOnly: true,
    recap: 'The advice to leave difficult truths unwritten hardened into distance, and George asked to serve with another gun team.',
  }),

  makeEvent({
    id: 'edward-story-wounded', kind: 'relationship', title: 'Edward’s story stops at the aid post', kicker: 'His kit returns without him',
    text: 'Edward is alive, but the next part of his story belongs to surgeons and hospital trains rather than this section.',
    choices: [
      statChoice('Write the unfinished details in your diary', 'Keep the person from becoming only a casualty entry.', 'careful', { morale: -2, stress: 3 }, 'You record the shaking hands, the birthday candle, and what you wish you had said.', { effects: continueStory('edward', 4, undefined, {}, ['edward_story_closed_wounded']) }),
      statChoice('Send his watch with the hospital orderly', 'Return the keepsake to the man while he can still receive it.', 'duty', { morale: 1, stress: 2 }, 'The orderly wraps the watch in gauze and writes Edward’s name twice.', { effects: continueStory('edward', 4, undefined, {}, ['edward_watch_sent']) }),
    ], advance: shortAdvance, requirements: { npcStatuses: { edward: 'wounded' } }, tags: ['personal', 'closure'], arcId: 'edward', arcStage: 3, scheduledOnly: true,
    recap: 'Edward’s personal thread was interrupted before its planned ending by a wound suffered with the section.',
  }),
  makeEvent({
    id: 'edward-story-dead', kind: 'relationship', title: 'Edward’s watch has stopped', kicker: 'After the kit is sorted',
    text: 'The watch in Edward’s pocket survived the action. Its hands show a time that means nothing to anyone who was not there.',
    choices: [
      statChoice('Send it to his family', 'Let one object return when he cannot.', 'duty', { morale: -5, stress: 6 }, 'You wrap the watch beside a letter that takes three attempts.', { effects: continueStory('edward', 4, undefined, {}, ['edward_watch_home']) }),
      statChoice('Record what he was afraid of', 'Refuse the cleaner story people may expect.', 'careful', { morale: -4, stress: 5 }, 'The diary says he was frightened, young, and still present when others needed him.', { effects: continueStory('edward', 4, undefined, {}, ['edward_fear_recorded']) }),
    ], advance: shortAdvance, requirements: { npcStatuses: { edward: 'dead' } }, tags: ['personal', 'closure', 'loss'], arcId: 'edward', arcStage: 3, scheduledOnly: true,
    recap: 'Edward’s personal thread ended in the action before trust, repair, or distance could reach its intended conclusion.',
  }),
  makeEvent({
    id: 'edward-story-transferred', kind: 'relationship', title: 'Edward’s new address', kicker: 'A field-post card from the rear',
    text: 'Edward has been transferred away from the section. The card says only that he is working, sleeping better, and unsure whether that counts as courage.',
    choices: [
      statChoice('Reply that being alive is enough', 'Do not turn survival into another test.', 'social', { morale: 3, stress: -2 }, 'You post the reply before you can improve it into something less honest.', { effects: continueStory('edward', 4, undefined, {}, ['edward_transfer_reply']) }),
      statChoice('Keep the card in the diary', 'Let the unfinished friendship remain unfinished.', 'careful', { morale: 1, stress: 1 }, 'The card stays between two pages from his time in the section.', { effects: continueStory('edward', 4, undefined, {}, ['edward_transfer_card_kept']) }),
    ], advance: shortAdvance, requirements: { npcStatuses: { edward: 'transferred' } }, tags: ['personal', 'closure', 'transfer'], arcId: 'edward', arcStage: 3, scheduledOnly: true,
    recap: 'Edward left the section before his active personal thread reached its planned ending.',
  }),
  makeEvent({
    id: 'edward-story-captured', kind: 'relationship', title: 'Edward is listed missing', kicker: 'Later confirmed prisoner',
    text: 'A corrected list confirms that Edward is alive in enemy hands. No one can say when a letter might cross the lines.',
    choices: [
      statChoice('Write to his family with the confirmed news', 'Give certainty without inventing comfort.', 'duty', { morale: -2, stress: 4 }, 'The letter says alive twice and promises nothing else.', { effects: continueStory('edward', 4, undefined, {}, ['edward_family_informed']) }),
      statChoice('Leave a page for his return', 'Keep room in the diary for a voice you cannot hear.', 'careful', { morale: 1, stress: 3 }, 'The blank page receives his name and the date of confirmation.', { effects: continueStory('edward', 4, undefined, {}, ['edward_page_left']) }),
    ], advance: shortAdvance, requirements: { npcStatuses: { edward: 'captured' } }, tags: ['personal', 'closure', 'capture'], arcId: 'edward', arcStage: 3, scheduledOnly: true,
    recap: 'Edward’s personal thread was cut off when he was separated from the section and taken prisoner.',
  }),
  makeEvent({
    id: 'george-story-wounded', kind: 'relationship', title: 'George’s empty gun position', kicker: 'He is alive at the casualty station',
    text: 'George’s Lewis gun remains with the section, but the man who knew every change in its sound has gone down the evacuation line.',
    choices: [
      statChoice('Send his coal with the next orderly', 'A piece of Barnsley should follow him.', 'duty', { morale: -1, stress: 3 }, 'The cloth-wrapped coal disappears into an orderly’s satchel.', { effects: continueStory('george', 4, undefined, {}, ['george_coal_sent']) }),
      statChoice('Mark his warnings on the dugout plan', 'Keep his knowledge active while he is absent.', 'careful', { fatigue: 3, morale: 2 }, 'His pencil marks remain after the rest of the plan is redrawn.', { effects: continueStory('george', 4, undefined, {}, ['george_warnings_kept']) }),
    ], advance: shortAdvance, requirements: { npcStatuses: { george: 'wounded' } }, tags: ['personal', 'closure'], arcId: 'george', arcStage: 3, scheduledOnly: true,
    recap: 'George’s personal thread was interrupted by a wound before its chosen branch could reach a conclusion.',
  }),
  makeEvent({
    id: 'george-story-dead', kind: 'relationship', title: 'The sound George would have known', kicker: 'Timber settling after stand-to',
    text: 'A roof prop creaks and every man looks toward the place where George would have tilted his head. Nobody moves until the sound comes again.',
    choices: [
      statChoice('Clear the dugout as he taught you', 'Let remembered knowledge perform one final duty.', 'duty', { fatigue: 5, morale: -3, stress: 4 }, 'The weak prop splits after the last man reaches the entrance.', { effects: continueStory('george', 4, undefined, {}, ['george_final_warning']) }),
      statChoice('Write to his mother in plain words', 'Do not make the death noble or tidy.', 'social', { morale: -5, stress: 6 }, 'The letter begins with the truth and keeps it for six lines.', { effects: continueStory('george', 4, undefined, {}, ['george_mother_written']) }),
    ], advance: shortAdvance, requirements: { npcStatuses: { george: 'dead' } }, tags: ['personal', 'closure', 'loss'], arcId: 'george', arcStage: 3, scheduledOnly: true,
    recap: 'George’s personal thread ended in action, leaving behind both unfinished words and practical knowledge.',
  }),
  makeEvent({
    id: 'george-story-transferred', kind: 'relationship', title: 'George two trenches away', kicker: 'News from another gun team',
    text: 'George has been transferred and is still close enough that his gun can sometimes be heard, though you cannot tell which bursts are his.',
    choices: [
      statChoice('Send the corrected timber diagram', 'Return something that acknowledges what he taught.', 'duty', { morale: 2, stress: -1 }, 'The runner comes back with a single pencilled correction.', { effects: continueStory('george', 4, undefined, {}, ['george_diagram_sent']) }),
      statChoice('Let the distance stand', 'Not every transfer needs to be rewritten as reconciliation.', 'careful', { morale: -1, stress: 1 }, 'The other Lewis gun continues beyond the traverse.', { effects: continueStory('george', 4, undefined, {}, ['george_distance_left']) }),
    ], advance: shortAdvance, requirements: { npcStatuses: { george: 'transferred' } }, tags: ['personal', 'closure', 'transfer'], arcId: 'george', arcStage: 3, scheduledOnly: true,
    recap: 'George left the section before his active personal thread reached its planned ending.',
  }),
  makeEvent({
    id: 'george-story-captured', kind: 'relationship', title: 'George beyond the wire', kicker: 'Confirmed prisoner',
    text: 'George is alive in captivity. The Lewis gun came back with another man; the piece of coal from Barnsley did not.',
    choices: [
      statChoice('Write to his mother', 'Give her the confirmed fact that he lives.', 'duty', { morale: -2, stress: 4 }, 'You write that George was not alone when last seen.', { effects: continueStory('george', 4, undefined, {}, ['george_family_informed']) }),
      statChoice('Copy his timber notes into the diary', 'Preserve something that can still cross time, if not the wire.', 'careful', { fatigue: 2, morale: 1 }, 'The copied marks look less certain in your hand.', { effects: continueStory('george', 4, undefined, {}, ['george_notes_copied']) }),
    ], advance: shortAdvance, requirements: { npcStatuses: { george: 'captured' } }, tags: ['personal', 'closure', 'capture'], arcId: 'george', arcStage: 3, scheduledOnly: true,
    recap: 'George’s personal thread was cut off when he was separated from the section and taken prisoner.',
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
