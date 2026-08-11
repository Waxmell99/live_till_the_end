import type { GameEvent } from '../../game/types';
import { makeEvent, quietAdvance, shortAdvance, statChoice } from './helpers';

export const ROUTINE_EVENTS: GameEvent[] = [
  makeEvent({
    id: 'ration-tea', title: 'Tea in a petrol tin', kicker: 'Stand-to is over',
    text: 'A brazier finally catches. The tea tastes of smoke and the petrol tin it was boiled in, but it is hot.',
    choices: [
      statChoice('Drink it while it is hot', 'Take the small comfort without apology.', 'rest', { morale: 4, fatigue: -3, hunger: -2 }, 'For several minutes, warmth is enough.'),
      statChoice('Give your mug to Edward', 'He has been shivering since dawn.', 'social', { morale: 2, hunger: 2 }, 'Edward cups the mug in both hands.', { effects: { relationships: { edward: 5 } } }),
    ], advance: shortAdvance, tags: ['food', 'quiet'],
  }),
  makeEvent({
    id: 'duckboard-repair', title: 'The missing duckboard', kicker: 'After three days of rain',
    text: 'A length of the trench floor has vanished under brown water. Every passing man sinks to the ankle.',
    choices: [
      statChoice('Repair it properly', 'Find timber and set it firm.', 'duty', { fatigue: 7, morale: 2 }, 'The work holds, at least for now.'),
      statChoice('Lay down loose planks', 'Make the path passable and move on.', 'careful', { fatigue: 2 }, 'The trench is navigable, if not improved.'),
      statChoice('Leave it to the next fatigue party', 'Save your strength.', 'rest', { fatigue: -2, morale: -2 }, 'You step around it for another day.'),
    ], advance: quietAdvance, tags: ['mud', 'work'],
  }),
  makeEvent({
    id: 'lice-seams', title: 'The seams of your shirt', kicker: 'A quiet afternoon',
    text: 'You turn your shirt inside out over a candle. The lice gather in the seams faster than you can crush them.',
    choices: [
      statChoice('Work through every seam', 'Patience is the only weapon here.', 'rest', { stress: -4, fatigue: -2 }, 'For one night, the itching eases.'),
      statChoice('Give up and sleep', 'Exhaustion wins.', 'rest', { fatigue: -7, stress: 2 }, 'You sleep despite the crawling.'),
    ], advance: quietAdvance, tags: ['quiet', 'hygiene'],
  }),
  makeEvent({
    id: 'boots-drying', title: 'Boots by the brazier', kicker: 'Reserve trench',
    text: 'There is room beside the brazier for one more pair of boots. Steam rises from cracked leather all around it.',
    choices: [
      statChoice('Wait for a place', 'Dry feet may matter tomorrow.', 'careful', { health: 2, fatigue: 2, stress: -2 }, 'Your socks are still damp, but no longer soaked.', { effects: { addItems: ['dry_socks'] } }),
      statChoice('Keep your boots on', 'A queue is another kind of duty.', 'duty', { health: -2, fatigue: -1 }, 'The leather stays wet and cold.'),
    ], advance: quietAdvance, tags: ['weather', 'hygiene'],
  }),
  makeEvent({
    id: 'parapet-watch', title: 'Two hours at the parapet', kicker: '02:10',
    text: 'Beyond the sandbags, Very lights lift the same broken posts out of darkness and put them back again.',
    choices: [
      statChoice('Watch every movement', 'Refuse to let tired eyes wander.', 'duty', { fatigue: 7, stress: 3, morale: 1 }, 'Nothing crosses the wire while you watch.'),
      statChoice('Share the watch with James', 'One watches while the other rests his eyes.', 'social', { fatigue: 3, stress: -1 }, 'James whispers bad jokes between flares.', { effects: { relationships: { james: 3 } } }),
    ], advance: shortAdvance, tags: ['night', 'duty'],
  }),
  makeEvent({
    id: 'field-postcard', title: 'The field postcard', kicker: 'Mail leaves at dusk',
    text: 'The printed card lets you cross out phrases: “I am quite well.” “I have been admitted into hospital.” Nothing in between.',
    choices: [
      statChoice('Send “I am quite well”', 'It is close enough for the censor.', 'social', { morale: 3, stress: 2 }, 'Your pencil hesitates, then makes the mark.'),
      statChoice('Write a proper letter later', 'Keep the blank card in your pocket.', 'careful', { stress: 1 }, 'The post bag closes without it.'),
    ], advance: quietAdvance, tags: ['mail', 'quiet'],
  }),
  makeEvent({
    id: 'rum-issue', title: 'The rum jar', kicker: 'Before dawn',
    text: 'A corporal measures a dark mouthful into each mug. The smell cuts through wet wool and tobacco.',
    choices: [
      statChoice('Drink your ration', 'Warmth arrives quickly and leaves quickly.', 'rest', { morale: 4, stress: -4, fatigue: 2 }, 'The trench edges soften for a moment.'),
      statChoice('Trade it for bread', 'Another man wants the rum more.', 'careful', { hunger: -6, morale: 1 }, 'You eat the bread slowly.', { effects: { addItems: ['extra_ration'] } }),
      statChoice('Pass it to George', 'He looks as though he needs it.', 'social', { morale: 2 }, 'George nods once and does not ask why.', { effects: { relationships: { george: 4 } } }),
    ], advance: shortAdvance, tags: ['food'],
  }),
  makeEvent({
    id: 'church-parade', title: 'Church parade', kicker: 'Sunday, somewhere behind the line',
    text: 'Men stand in a farmyard while a chaplain speaks into the wind. A torn roof lifts and settles behind him.',
    choices: [
      statChoice('Listen', 'Let the familiar words pass over you.', 'rest', { morale: 5, stress: -3 }, 'For a while, nobody asks anything of you.'),
      statChoice('Stand at the back with James', 'You are present, more or less.', 'social', { morale: 3, stress: -1 }, 'James keeps quiet until the final prayer.', { effects: { relationships: { james: 2 } } }),
    ], advance: quietAdvance, tags: ['rest'],
  }),
  makeEvent({
    id: 'pay-parade', title: 'Pay parade', kicker: 'Company orderly room',
    text: 'You sign a ledger for money that has almost nowhere to be spent. The officer’s pencil is very sharp.',
    choices: [
      statChoice('Take the full amount', 'There may be a village estaminet later.', 'rest', { morale: 3 }, 'The coins feel strangely civilian.'),
      statChoice('Send most of it home', 'The paymaster marks the allotment.', 'social', { morale: 4, stress: -2 }, 'It is one useful thing the war allows you to do.'),
    ], advance: quietAdvance, tags: ['routine'],
  }),
  makeEvent({
    id: 'sandbag-wall', title: 'A wall of sandbags', kicker: 'Working party',
    text: 'The old revetment is slumping. Mud squeezes between the sandbags whenever a lorry passes behind the line.',
    choices: [
      statChoice('Rebuild from the base', 'Slow work, but it might survive shelling.', 'duty', { fatigue: 8, morale: 2 }, 'By dark, the wall stands straight.'),
      statChoice('Patch the worst gap', 'Conserve strength for tonight.', 'careful', { fatigue: 3 }, 'The bulge remains, but the mud stays back.'),
    ], advance: quietAdvance, tags: ['work'],
  }),
  makeEvent({
    id: 'tin-can-alarm', title: 'Wire and empty tins', kicker: 'Dusk in the support line',
    text: 'You are told to repair a crude alarm across a communication trench. Each tin makes a small, lonely sound.',
    choices: [
      statChoice('Test every length of wire', 'A false alarm is better than no alarm.', 'duty', { fatigue: 5, stress: -1 }, 'The line rings from end to end.'),
      statChoice('Replace only the broken tins', 'Finish before full darkness.', 'careful', { fatigue: 2, stress: 1 }, 'It will probably hold until morning.'),
    ], advance: shortAdvance, tags: ['work', 'night'],
  }),
  makeEvent({
    id: 'stew-kettle', title: 'The company stew', kicker: 'Rations arrive late',
    text: 'The stew is mostly warm water, with three recognisable pieces of turnip and one disputed piece of meat.',
    choices: [
      statChoice('Eat immediately', 'Hunger makes the decision.', 'rest', { hunger: -10, morale: 2 }, 'You scrape the mess tin clean.'),
      statChoice('Save half for night watch', 'Cold stew is still food.', 'careful', { hunger: -5, morale: 1 }, 'You cover half the ration carefully.', { effects: { addItems: ['extra_ration'] } }),
      statChoice('Split it with Alfie', 'He missed the ration party.', 'social', { hunger: -4, morale: 3 }, 'Alfie remembers the gesture.', { effects: { relationships: { alfie: 5 } } }),
    ], advance: quietAdvance, tags: ['food'],
  }),
  makeEvent({
    id: 'battalion-bath', title: 'The battalion bath', kicker: 'A converted brewery',
    text: 'A row of steaming vats waits behind the line. Your uniform disappears through one door and returns hot, damp, and probably not yours.',
    choices: [
      statChoice('Stay in until ordered out', 'Warm water feels impossible.', 'rest', { health: 3, morale: 7, stress: -6, fatigue: -3 }, 'For an hour, you feel almost human.'),
      statChoice('Finish quickly', 'The queue outside is long.', 'social', { health: 2, morale: 3 }, 'The next man gets his turn sooner.'),
    ], advance: quietAdvance, tags: ['hygiene', 'rest'],
  }),
  makeEvent({
    id: 'equipment-inspection', title: 'Equipment inspection', kicker: 'An officer is coming',
    text: 'Mud has entered every buckle and seam. The sergeant says the battalion commander will inspect the platoon at noon.',
    choices: [
      statChoice('Clean every piece', 'Appearances can become punishments.', 'duty', { fatigue: 6, morale: 1 }, 'The officer glances at you for less than a second.'),
      statChoice('Clean what can be seen', 'Use mud to hide the rest.', 'careful', { fatigue: 2, stress: 2 }, 'The sergeant notices, but says nothing.'),
    ], advance: shortAdvance, tags: ['routine'],
  }),
  makeEvent({
    id: 'lost-spoon', title: 'A missing spoon', kicker: 'Breakfast',
    text: 'Your spoon is gone. Without it, the porridge has become an engineering problem.',
    choices: [
      statChoice('Carve one from a ration crate', 'A blunt knife and patience will do.', 'careful', { fatigue: 2, morale: 2 }, 'It is ugly and entirely yours.'),
      statChoice('Borrow Arthur’s', 'Wait until he has finished.', 'social', { hunger: 2, morale: 1 }, 'Arthur wipes it on his sleeve and hands it over.', { effects: { relationships: { arthur: 2 } } }),
    ], advance: quietAdvance, tags: ['food', 'quiet'],
  }),
  makeEvent({
    id: 'estaminet', title: 'Three hours in a village', kicker: 'Out of the line',
    text: 'The estaminet has four chairs, weak beer, and a woman who corrects every soldier’s French without smiling.',
    choices: [
      statChoice('Buy a round for the section', 'Spend the coins from pay parade.', 'social', { morale: 8, stress: -5 }, 'For one round, conversation belongs to peacetime.', { effects: { relationships: { james: 2, george: 2, arthur: 2 } } }),
      statChoice('Sit alone by the window', 'Watch a cart move through the square.', 'rest', { morale: 4, stress: -7, fatigue: -3 }, 'Nobody disturbs you.'),
    ], advance: quietAdvance, tags: ['rest', 'village'],
  }),
  makeEvent({
    id: 'clean-rifle', title: 'Oil and pull-through', kicker: 'After rain',
    text: 'The rifle bolt feels gritty. Around you, men work in silence, each listening for a clean metallic click.',
    choices: [
      statChoice('Strip and clean it twice', 'Trust comes from repetition.', 'duty', { fatigue: 3, stress: -2, morale: 2 }, 'The bolt moves cleanly.'),
      statChoice('Wipe the worst mud away', 'Sleep is also preparation.', 'rest', { fatigue: -4, stress: 1 }, 'It looks clean enough in poor light.'),
    ], advance: shortAdvance, tags: ['equipment'],
  }),
  makeEvent({
    id: 'water-cart', title: 'The water cart', kicker: 'A hot afternoon',
    text: 'The water cart is late. Your bottle smells faintly of chloride and holds less than a mouthful.',
    choices: [
      statChoice('Wait beside the road', 'Miss an hour of rest to fill the bottle.', 'careful', { fatigue: 4, health: 2, hunger: -2 }, 'At last, clean water drums against the tin.', { effects: { addItems: ['clean_water'] } }),
      statChoice('Drink from a doubtful barrel', 'The sign says it was treated yesterday.', 'bold', { hunger: -3 }, 'The water is warm and tastes of sacking.', { risk: { danger: 0.08, fatality: 0.02, healthLoss: [8, 18], cause: 'illness after contaminated water' } }),
    ], advance: quietAdvance, kind: 'survival', tags: ['water'],
  }),
  makeEvent({
    id: 'dawn-mist', title: 'Mist at stand-to', kicker: '04:45',
    text: 'The whole line wakes before dawn. Mist rests beyond the parapet, thick enough to hide an army or nothing.',
    choices: [
      statChoice('Keep your respirator ready', 'Discomfort is better than surprise.', 'careful', { fatigue: 4, stress: 2 }, 'The mist thins. It was only mist.'),
      statChoice('Help Edward settle his breathing', 'Give him something simple to count.', 'social', { fatigue: 3, stress: -2 }, 'His hands stop shaking.', { effects: { relationships: { edward: 4 } } }),
    ], advance: shortAdvance, tags: ['duty', 'weather'],
  }),
  makeEvent({
    id: 'distant-song', title: 'A song across the dark', kicker: 'Night in the line',
    text: 'A voice begins somewhere beyond the wire. You cannot make out the words, only that the tune is slow.',
    choices: [
      statChoice('Listen without speaking', 'For a moment, the distance seems smaller.', 'rest', { morale: 3, stress: -4 }, 'The song stops before the guns begin again.'),
      statChoice('Hum a tune from home', 'James quietly finds the harmony.', 'social', { morale: 6, stress: -2 }, 'Three men join in and none finishes.', { effects: { relationships: { james: 3 } } }),
    ], advance: quietAdvance, tags: ['night', 'quiet'],
  }),
  makeEvent({
    id: 'burial-party', title: 'Beyond the support trench', kicker: 'After sunset',
    text: 'The chaplain reads names from damp paper. Some of the men being buried belonged to another battalion.',
    choices: [
      statChoice('Stay for every name', 'Witness is the only thing you can give.', 'duty', { morale: -3, stress: 5, fatigue: 3 }, 'The paper is folded and put away.'),
      statChoice('Return when your task is done', 'There are limits to what you can carry.', 'careful', { morale: -1, stress: 2 }, 'The chaplain’s voice follows you down the trench.'),
    ], advance: quietAdvance, tags: ['loss'],
  }),
  makeEvent({
    id: 'reserve-barn', title: 'A roof for the night', kicker: 'In reserve',
    text: 'The barn has half a roof, dry straw, and no shell holes in the wall nearest you. It feels luxurious.',
    choices: [
      statChoice('Sleep at once', 'Use every minute available.', 'rest', { fatigue: -15, stress: -5, health: 2 }, 'You wake with straw in your collar and no regret.'),
      statChoice('Write before sleeping', 'There may be no time tomorrow.', 'social', { fatigue: -8, morale: 5, stress: -2 }, 'The pencil line wanders near the end.'),
    ], advance: quietAdvance, tags: ['rest'],
  }),
  makeEvent({
    id: 'football-tin', title: 'Football with a biscuit tin', kicker: 'An idle hour',
    text: 'Someone kicks an empty biscuit tin along the trench. Within a minute, jackets mark two goals.',
    choices: [
      statChoice('Join the match', 'The rules change whenever convenient.', 'social', { morale: 9, fatigue: 5, stress: -5 }, 'Your side wins by a score nobody agrees upon.', { effects: { relationships: { james: 2, edward: 2 } } }),
      statChoice('Watch from a firestep', 'Your legs need the rest.', 'rest', { morale: 4, fatigue: -4 }, 'The argument is nearly as good as the game.'),
    ], advance: quietAdvance, tags: ['rest'],
  }),
  makeEvent({
    id: 'censor-pencil', title: 'Blue pencil', kicker: 'A returned letter',
    text: 'Your last letter comes back with two lines crossed out by the censor. You cannot remember what dangerous thing they said.',
    choices: [
      statChoice('Rewrite it carefully', 'Turn places into weather and fear into jokes.', 'careful', { morale: 3, stress: 1, fatigue: 2 }, 'The new version says less and means more.'),
      statChoice('Put it away', 'Some thoughts will not pass inspection.', 'rest', { morale: -2, stress: 2 }, 'The unsent page stays in your paybook.'),
    ], advance: quietAdvance, tags: ['mail'],
  }),
  makeEvent({
    id: 'wire-party', title: 'Repairing the wire', kicker: 'A moonless night',
    text: 'The party moves beyond the parapet with coils of barbed wire wrapped in sacking. Every metal touch seems too loud.',
    choices: [
      statChoice('Take the forward coil', 'Finish the exposed work quickly.', 'bold', { fatigue: 7, stress: 5, morale: 3 }, 'The new strand is fixed before the moon clears the cloud.', { risk: { danger: 0.08, fatality: 0.2, healthLoss: [10, 28], cause: 'machine-gun fire during a wiring party' }, advance: { min: 3, max: 8, unit: 'hours' } }),
      statChoice('Work close to the parapet', 'Make steady progress within a short crawl of cover.', 'careful', { fatigue: 5, stress: 3 }, 'You return with torn sleeves and no wounds.', { risk: { danger: 0.035, fatality: 0.12, healthLoss: [8, 20], cause: 'stray fire during a wiring party' }, advance: { min: 4, max: 9, unit: 'hours' } }),
    ], kind: 'survival', advance: shortAdvance, tags: ['night', 'danger'],
  }),
  makeEvent({
    id: 'frosted-bread', title: 'Frozen bread', kicker: 'Winter morning',
    text: 'The ration bread is hard with frost. George proposes warming it on a shovel above the brazier.',
    choices: [
      statChoice('Risk the shovel toast', 'Watch closely and turn it often.', 'social', { hunger: -8, morale: 5 }, 'The edges burn. Everyone calls it excellent.', { effects: { relationships: { george: 3 } } }),
      statChoice('Soak it in tea', 'Practicality before cuisine.', 'rest', { hunger: -6, morale: 2 }, 'It becomes edible by degrees.'),
    ], advance: quietAdvance, requirements: { from: '1917-11-01T00:00:00.000Z', until: '1918-03-15T00:00:00.000Z' }, tags: ['winter', 'food'],
  }),
  makeEvent({
    id: 'trench-feet', title: 'Numb toes', kicker: 'Water above the ankle',
    text: 'When you remove your boots, your feet are pale and without much feeling. Alfie tells you not to pretend it is nothing.',
    choices: [
      statChoice('Report to the aid post', 'Let someone inspect them properly.', 'careful', { health: 4, fatigue: -3, morale: -1 }, 'The orderly dries, powders, and wraps your feet.'),
      statChoice('Change socks and stay', 'You do not want to leave the section short.', 'duty', { health: -3, morale: 2, fatigue: 2 }, 'Feeling returns slowly and painfully.', { requirements: { itemsAll: ['dry_socks'] }, effects: { removeItems: ['dry_socks'] } }),
      statChoice('Say nothing', 'Keep your boots on.', 'bold', { health: -6, stress: 2 }, 'By evening, every step hurts.'),
    ], kind: 'survival', advance: shortAdvance, tags: ['weather', 'health'],
  }),
  makeEvent({
    id: 'medical-inspection', title: 'Medical inspection', kicker: 'Behind the line',
    text: 'A tired medical officer checks throats, feet, and skin at a speed that suggests an approaching train.',
    choices: [
      statChoice('Mention every complaint', 'Use the rare chance to be examined.', 'careful', { health: 5, fatigue: -2, morale: -1 }, 'You leave with powder, two tablets, and instructions to rest.'),
      statChoice('Say you are fit', 'Others seem worse.', 'duty', { morale: 2, health: -1 }, 'The officer is already looking at the next man.'),
    ], advance: quietAdvance, kind: 'survival', tags: ['health'],
  }),
  makeEvent({
    id: 'fatigue-carrying', title: 'Crates to the front line', kicker: 'Fatigue party',
    text: 'Each crate holds grenades and grows heavier at every traverse. The communication trench is crowded with men moving both ways.',
    choices: [
      statChoice('Carry two to shorten the job', 'Take the strain now.', 'bold', { fatigue: 11, health: -2, morale: 2 }, 'Your arms shake when you put them down.'),
      statChoice('Keep a steady pace with one', 'Arrive without dropping anything.', 'careful', { fatigue: 6 }, 'The last crate reaches the dugout after dark.'),
    ], advance: shortAdvance, tags: ['work'],
  }),
  makeEvent({
    id: 'map-crease', title: 'A map with no trench', kicker: 'Orderly dugout',
    text: 'Arthur studies a map that shows a communication trench where there is now only a chain of shell holes.',
    choices: [
      statChoice('Help mark the real route', 'Memory may be more current than the paper.', 'duty', { fatigue: 3, morale: 3, stress: -1 }, 'Arthur draws a dotted line in the margin.', { effects: { relationships: { arthur: 4 } } }),
      statChoice('Leave maps to officers', 'Use the hour to sit down.', 'rest', { fatigue: -4 }, 'The old line remains printed in perfect black ink.'),
    ], advance: quietAdvance, tags: ['map', 'quiet'],
  }),
  makeEvent({
    id: 'rat-biscuit', title: 'Teeth marks', kicker: 'Before breakfast',
    text: 'A rat has chewed through your haversack and sampled the last biscuit. It watches from the revetment without shame.',
    choices: [
      statChoice('Eat around the marks', 'Food is food.', 'bold', { hunger: -4, stress: 1 }, 'You try not to think about the rat.', { risk: { danger: 0.025, fatality: 0, healthLoss: [4, 10], cause: 'stomach illness' } }),
      statChoice('Throw the biscuit away', 'Some lines remain uncrossed.', 'careful', { hunger: 5, morale: -1 }, 'The rat retrieves it when you turn away.'),
    ], advance: quietAdvance, kind: 'survival', tags: ['food', 'hygiene'],
  }),
  makeEvent({
    id: 'newspaper-week-old', title: 'A week-old newspaper', kicker: 'Passed along the trench',
    text: 'The paper has weather forecasts, parliamentary speeches, and an advertisement for a seaside holiday.',
    choices: [
      statChoice('Read every column', 'Let another world exist for half an hour.', 'rest', { morale: 5, stress: -4 }, 'Even the advertisements are worth reading.'),
      statChoice('Read it aloud', 'Half the dugout listens and corrects your pronunciation.', 'social', { morale: 7, fatigue: 2 }, 'The holiday advertisement earns the loudest laugh.', { effects: { relationships: { james: 2, edward: 2, george: 2 } } }),
    ], advance: quietAdvance, tags: ['news', 'rest'],
  }),
  makeEvent({
    id: 'false-alarm', title: 'Gas alarm', kicker: 'Three strikes on iron',
    text: 'The alarm races down the trench. Men drag on respirators; someone overturns the brazier. No gas follows.',
    choices: [
      statChoice('Keep the mask on until all-clear', 'Obey the drill despite the heat.', 'duty', { fatigue: 5, stress: 4, morale: 1 }, 'The all-clear comes after eleven minutes.'),
      statChoice('Help check the sentry', 'Find out what he saw.', 'social', { fatigue: 3, stress: 2 }, 'He apologises to nobody. Better a false alarm.', { effects: { relationships: { arthur: 2 } } }),
    ], advance: shortAdvance, kind: 'survival', tags: ['gas'],
  }),
  makeEvent({
    id: 'shell-shockwave', title: 'A shell behind the line', kicker: 'Without warning',
    text: 'A single heavy shell lands somewhere behind the support trench. Dust shakes loose; then nothing follows.',
    choices: [
      statChoice('Return to the task', 'Make your hands continue.', 'duty', { stress: 4, morale: 2, fatigue: 2 }, 'The silence after it feels louder.'),
      statChoice('Sit until the shaking passes', 'Take one minute without pretending.', 'rest', { stress: -2, morale: -1, fatigue: -2 }, 'Your breathing settles before anyone comments.'),
    ], advance: shortAdvance, kind: 'survival', tags: ['shelling'],
  }),
  makeEvent({
    id: 'leave-cancelled', title: 'Leave cancelled', kicker: 'Company notice',
    text: 'Your name had moved near the top of the leave roster. An order arrives: all leave is suspended until further notice.',
    choices: [
      statChoice('Fold the pass away', 'There is nobody here to argue with.', 'careful', { morale: -7, stress: 4 }, 'The pencilled date remains in your pocket.'),
      statChoice('Complain with the others', 'Give the anger somewhere to go.', 'social', { morale: -3, stress: -2 }, 'The sergeant lets the language pass.'),
    ], advance: quietAdvance, tags: ['morale'],
  }),
  makeEvent({
    id: 'unexpected-leave', title: 'Forty-eight hours', kicker: 'A name on the roster',
    text: 'A clerk reads your name. You are given a pass, a time to report back, and no explanation for your luck.',
    choices: [
      statChoice('Go into the nearest town', 'Eat, wash, and look at unbroken windows.', 'rest', { morale: 15, stress: -12, fatigue: -12, hunger: -10, health: 3 }, 'For two days, civilians walk past without saluting.'),
      statChoice('Sleep at the rest camp', 'Use the whole gift on silence and a bed.', 'rest', { morale: 8, stress: -10, fatigue: -20, health: 5 }, 'You sleep through two meals and wake grateful.'),
    ], advance: { min: 4, max: 9, unit: 'days' }, weight: 0.35, tags: ['rest'],
  }),
  makeEvent({
    id: 'cookhouse-fire', title: 'Smoke from the cookhouse', kicker: 'Midday',
    text: 'A stove pipe falls and the canvas cookhouse fills with smoke. The cook emerges holding the stew as if rescuing a child.',
    choices: [
      statChoice('Help put the fire out', 'Save the tent and perhaps dinner.', 'duty', { fatigue: 5, stress: 2, morale: 3 }, 'The tent survives, blackened around one flap.'),
      statChoice('Carry the stew clear', 'Protect what matters most to the platoon.', 'social', { fatigue: 3, morale: 6, hunger: -3 }, 'Your priorities receive unanimous approval.'),
    ], advance: quietAdvance, tags: ['food', 'work'],
  }),
  makeEvent({
    id: 'mending-socks', title: 'A needle and grey wool', kicker: 'Evening in a dugout',
    text: 'Arthur shows you how to turn the heel of a sock. His hands are better at it than anyone expected.',
    choices: [
      statChoice('Learn the stitch', 'Repair your only dry pair.', 'careful', { health: 2, stress: -3, fatigue: 1 }, 'The result is lumpy but serviceable.', { effects: { relationships: { arthur: 3 }, addItems: ['dry_socks'] } }),
      statChoice('Ask about his daughters', 'Let him talk while he works.', 'social', { morale: 4, stress: -2 }, 'He describes their school shoes in exact detail.', { effects: { relationships: { arthur: 5 } } }),
    ], advance: quietAdvance, tags: ['quiet'],
  }),
  makeEvent({
    id: 'stray-dog', title: 'The battalion dog', kicker: 'A visitor in the trench',
    text: 'A mud-coloured terrier appears with no collar and perfect confidence. Nobody admits to feeding it.',
    choices: [
      statChoice('Share a little biscuit', 'The dog sits beside you as if assigned there.', 'social', { morale: 8, hunger: 2, stress: -4 }, 'It accepts the ration and your temporary friendship.'),
      statChoice('Send it toward the cookhouse', 'Someone there can feed it properly.', 'careful', { morale: 4 }, 'The terrier trots away on official business.'),
    ], advance: quietAdvance, tags: ['quiet'],
  }),
  makeEvent({
    id: 'snow-on-wire', title: 'Snow on the wire', kicker: 'A rare clear dawn',
    text: 'Snow outlines every strand of wire and broken tree. For a few minutes, the battlefield looks clean.',
    choices: [
      statChoice('Watch the light change', 'Keep the image for later.', 'rest', { morale: 5, stress: -5 }, 'Then the first shell throws up black earth.'),
      statChoice('Wake Edward to see it', 'Beauty is scarce enough to share.', 'social', { morale: 6, fatigue: 2 }, 'He says it looks like Norfolk and then says it does not.', { effects: { relationships: { edward: 3 } } }),
    ], advance: quietAdvance, requirements: { from: '1917-11-15T00:00:00.000Z', until: '1918-03-20T00:00:00.000Z' }, tags: ['winter', 'quiet'],
  }),
  makeEvent({
    id: 'hot-summer-dust', title: 'White road dust', kicker: 'Summer behind the line',
    text: 'The road is dry enough for dust to coat your face and gather white in every seam of the uniform.',
    choices: [
      statChoice('Use water to wash', 'Sacrifice half a bottle for clean skin.', 'rest', { morale: 4, hunger: 2, stress: -3 }, 'The dust returns, but not immediately.'),
      statChoice('Save every drop', 'Thirst will matter before appearances.', 'careful', { morale: -1, hunger: -1 }, 'Your face feels made of chalk.'),
    ], advance: quietAdvance, requirements: { from: '1917-05-15T00:00:00.000Z', until: '1918-09-15T00:00:00.000Z' }, tags: ['summer', 'water'],
  }),
  makeEvent({
    id: 'barrage-calendar', title: 'Marks on the dugout wall', kicker: 'Another week',
    text: 'Someone has scratched dates into a roof beam. The sequence stops months ago, then begins again in another hand.',
    choices: [
      statChoice('Add today’s date', 'Leave proof that this day existed.', 'careful', { morale: 2, stress: 1 }, 'The fresh line is pale against old timber.'),
      statChoice('Do not count the days', 'Look only toward the next meal.', 'rest', { stress: -2, morale: 1 }, 'You turn away from the beam.'),
    ], advance: quietAdvance, tags: ['quiet'],
  }),
  makeEvent({
    id: 'salvage-cloth', title: 'A dry groundsheet', kicker: 'Abandoned dugout',
    text: 'Under fallen timber you find a serviceable groundsheet. There is no name on it and nobody nearby to claim it.',
    choices: [
      statChoice('Take it for the section', 'Shared shelter will keep several men drier.', 'social', { health: 2, morale: 4 }, 'George rigs it above the worst leak.', { effects: { relationships: { george: 3 }, addFlags: ['section_groundsheet'] } }),
      statChoice('Leave it where it lies', 'Its owner may return.', 'careful', { morale: 1 }, 'The empty dugout keeps its one useful thing.'),
    ], advance: quietAdvance, tags: ['equipment'],
  }),
  makeEvent({
    id: 'orderly-run', title: 'A message to headquarters', kicker: 'Late afternoon',
    text: 'The written message is routine. The route to battalion headquarters passes two batteries and a field kitchen.',
    choices: [
      statChoice('Take the direct trench route', 'Slow, sheltered, and crowded.', 'careful', { fatigue: 5, stress: 1 }, 'The message arrives creased but dry.'),
      statChoice('Use the open road', 'Faster, with a chance of hot food.', 'bold', { fatigue: 2, hunger: -4, morale: 2 }, 'You return before dark with tea inside you.', { risk: { danger: 0.035, fatality: 0.15, healthLoss: [8, 22], cause: 'shellfire on an exposed road' } }),
    ], advance: shortAdvance, tags: ['duty'],
  }),
  makeEvent({
    id: 'nightmare', title: 'Awake before the blast', kicker: '03:18',
    text: 'You wake reaching for your helmet, though the trench is quiet. The explosion was inside the dream.',
    choices: [
      statChoice('Walk to the firestep', 'Cold air may separate waking from sleep.', 'rest', { stress: -4, fatigue: 5, morale: -1 }, 'You watch the dark until your pulse slows.'),
      statChoice('Wake Arthur', 'Admit you do not want to be alone.', 'social', { stress: -7, fatigue: 3, morale: 2 }, 'Arthur makes tea and asks no questions.', { effects: { relationships: { arthur: 4 } } }),
      statChoice('Force yourself back to sleep', 'There are still two hours before stand-to.', 'rest', { fatigue: -3, stress: 2 }, 'Sleep returns in short pieces.'),
    ], advance: shortAdvance, kind: 'survival', requirements: { minStats: { stress: 45 } }, tags: ['stress', 'night'],
  }),
  makeEvent({
    id: 'quiet-sector', title: 'A quiet sector', kicker: 'Nothing happens',
    text: 'For six days, the same duties repeat: stand-to, breakfast, repairs, sentry, sleep. Nobody calls it peace.',
    choices: [
      statChoice('Keep a strict routine', 'Make each day small and predictable.', 'duty', { stress: -5, morale: 3, fatigue: -4, health: 2 }, 'The days pass without leaving clear edges.'),
      statChoice('Sleep whenever possible', 'Store strength for whatever follows.', 'rest', { fatigue: -12, stress: -2, morale: 1 }, 'You learn to sleep through distant guns.'),
    ], advance: { min: 9, max: 16, unit: 'days' }, weight: 1.4, tags: ['quiet', 'rest'], repeat: { cooldownTurns: 12 },
  }),
  makeEvent({
    id: 'sick-horse', title: 'A horse in the road', kicker: 'Supply column',
    text: 'A draught horse has gone down between two wagons. Its driver kneels in the mud, speaking softly while traffic backs up.',
    choices: [
      statChoice('Help free the harness', 'The animal is frightened and heavy.', 'duty', { fatigue: 6, stress: 2, morale: 3 }, 'The horse finds its feet after three attempts.', { risk: { danger: 0.025, fatality: 0, healthLoss: [4, 12], cause: 'an accident with a frightened horse' } }),
      statChoice('Guide traffic around', 'Give the driver room to work.', 'careful', { fatigue: 3, morale: 1 }, 'The column begins moving one wagon at a time.'),
    ], advance: quietAdvance, tags: ['animals', 'work'],
  }),
  makeEvent({
    id: 'broken-watch', title: 'Edward’s watch', kicker: 'A small disaster',
    text: 'Edward’s pocket watch has stopped. He winds it until Arthur takes it gently from his hands.',
    choices: [
      statChoice('Help open the case', 'A grain of trench dirt may be the culprit.', 'social', { fatigue: 2, morale: 3 }, 'The second hand stutters and begins again.', { effects: { relationships: { edward: 5 } } }),
      statChoice('Tell him time hardly matters here', 'You mean it as comfort.', 'careful', { morale: -1, stress: -1 }, 'He puts the silent watch away.', { effects: { relationships: { edward: -2 } } }),
    ], advance: quietAdvance, requirements: { npcActive: 'edward' }, tags: ['quiet'],
  }),
  makeEvent({
    id: 'jam-tin-lamp', title: 'A lamp made from a jam tin', kicker: 'Dugout darkness',
    text: 'George threads a scrap of cloth through candle grease in a tin. The flame is poor but steady.',
    choices: [
      statChoice('Use the light to mend kit', 'Finish one useful task.', 'duty', { fatigue: 3, stress: -2, morale: 2 }, 'The shadows jump while you sew.'),
      statChoice('Tell stories around it', 'Nobody needs much light for that.', 'social', { morale: 7, stress: -4, fatigue: 1 }, 'The little flame becomes a hearth.', { effects: { relationships: { george: 3, james: 2 } } }),
    ], advance: quietAdvance, tags: ['quiet', 'night'],
  }),
  makeEvent({
    id: 'inspection-rumour', title: 'A visiting general', kicker: 'Rumour at breakfast',
    text: 'The trench is ordered swept because a general may visit. Everyone studies the mud and waits for the joke to reveal itself.',
    choices: [
      statChoice('Sweep the duckboards', 'Obey the order exactly.', 'duty', { fatigue: 4, morale: -2 }, 'The general never appears.'),
      statChoice('Repair the parapet instead', 'Do useful work while looking busy.', 'careful', { fatigue: 5, morale: 3 }, 'The sandbags are safer. The general never appears.'),
    ], advance: quietAdvance, tags: ['routine'],
  }),
  makeEvent({
    id: 'orchard-apples', title: 'Apples behind a ruined wall', kicker: 'Late summer',
    text: 'A shell-damaged orchard still carries small green apples. The farmhouse has been empty for years.',
    choices: [
      statChoice('Pick only windfalls', 'Leave the branches alone.', 'careful', { hunger: -5, morale: 3 }, 'The apples are sharp and real.'),
      statChoice('Fill a haversack for the section', 'There are enough to share.', 'social', { hunger: -7, morale: 6, fatigue: 2 }, 'That night, everyone eats one slowly.', { effects: { relationships: { james: 2, arthur: 2, edward: 2, george: 2, alfie: 2 } } }),
    ], advance: quietAdvance, requirements: { from: '1917-08-01T00:00:00.000Z', until: '1918-10-01T00:00:00.000Z' }, tags: ['food', 'summer'],
  }),
  makeEvent({
    id: 'lost-patrol', title: 'Men at the wrong junction', kicker: 'Communication trench',
    text: 'A relief party from another unit stands at a flooded junction, arguing over a map by shielded candle.',
    choices: [
      statChoice('Guide them yourself', 'The route is easier remembered than explained.', 'duty', { fatigue: 6, morale: 3 }, 'You leave them at the correct traverse before dawn.'),
      statChoice('Draw the turns on their map', 'Your own sentry shift begins soon.', 'careful', { fatigue: 2, morale: 1 }, 'They repeat the route until all agree.'),
    ], advance: shortAdvance, tags: ['duty', 'night'],
  }),
  makeEvent({
    id: 'toothache', title: 'A bad tooth', kicker: 'Three nights without sleep',
    text: 'A tooth pulses with every heartbeat. The field ambulance has a dentist and a queue stretching into the yard.',
    choices: [
      statChoice('Join the queue', 'Endure the wait and the forceps.', 'careful', { health: 3, fatigue: 6, stress: 3, morale: 2 }, 'The empty space aches less than the tooth did.'),
      statChoice('Take a tablet and carry on', 'Perhaps it will settle.', 'duty', { health: -2, fatigue: 2, stress: 2 }, 'The pain retreats, but does not leave.'),
    ], advance: quietAdvance, kind: 'survival', tags: ['health'],
  }),
  makeEvent({
    id: 'clean-bandage', title: 'One clean field dressing', kicker: 'Kit check',
    text: 'Your field dressing packet has split at one corner. Alfie offers a sound spare in exchange for nothing.',
    choices: [
      statChoice('Accept it', 'Good equipment is not pride.', 'careful', { morale: 2 }, 'You put the sealed packet where either hand can reach it.', { effects: { relationships: { alfie: 3 }, addItems: ['field_dressing'] } }),
      statChoice('Tell him to keep the spare', 'A stretcher-bearer may need it first.', 'social', { morale: 3 }, 'Alfie calls you an idiot with some affection.', { effects: { relationships: { alfie: 4 } } }),
    ], advance: quietAdvance, tags: ['equipment'],
  }),
  makeEvent({
    id: 'relief-delayed', title: 'Relief overdue', kicker: 'Four hours after midnight',
    text: 'The relieving platoon has not arrived. Nobody knows whether a guide is lost or an order changed.',
    choices: [
      statChoice('Stay alert at the post', 'Treat every extra minute as the first.', 'duty', { fatigue: 10, stress: 3, morale: 2 }, 'Footsteps finally sound in the communication trench.'),
      statChoice('Rest below the firestep', 'Wake at the first signal.', 'rest', { fatigue: 2, stress: 1, morale: -1 }, 'You steal twenty minutes before the relief appears.'),
    ], advance: shortAdvance, tags: ['duty', 'fatigue'],
  }),
  makeEvent({
    id: 'old-photograph', title: 'A photograph in the mud', kicker: 'Near the firestep',
    text: 'The photograph shows an unknown woman beside a painted studio garden. Water has erased half her face.',
    choices: [
      statChoice('Pin it inside the dugout', 'Its owner may recognise it.', 'social', { morale: 2, stress: 1 }, 'By morning, the photograph is gone.'),
      statChoice('Leave it where it fell', 'Some things belong to the person who lost them.', 'careful', { morale: -1, stress: 1 }, 'Rain works slowly on the remaining image.'),
    ], advance: quietAdvance, tags: ['quiet', 'loss'],
  }),
  makeEvent({
    id: 'sunrise-no-shells', title: 'Six minutes of sunrise', kicker: 'Between bombardments',
    text: 'Cloud breaks over the eastern horizon. No gun fires for six minutes; the entire front seems to be holding breath.',
    choices: [
      statChoice('Stand and watch', 'Spend the silence awake.', 'rest', { morale: 6, stress: -6, fatigue: 2 }, 'The first gun makes everyone flinch.'),
      statChoice('Use the silence to sleep', 'Beauty does not replace rest.', 'rest', { fatigue: -6, stress: -2 }, 'You miss the sunrise and wake stronger.'),
    ], advance: quietAdvance, tags: ['quiet'],
  }),
  makeEvent({
    id: 'supply-shortage', title: 'Half rations', kicker: 'Supply road shelled',
    text: 'The quartermaster announces that bread and meat will be halved until the road is open again.',
    choices: [
      statChoice('Eat your saved ration', 'This is why you kept it.', 'careful', { hunger: -8, morale: 3 }, 'The biscuit is stale and welcome.', { requirements: { itemsAll: ['extra_ration'] }, effects: { removeItems: ['extra_ration'] } }),
      statChoice('Share what arrives evenly', 'Nobody eats well; nobody goes without.', 'social', { hunger: 6, morale: 4 }, 'George divides the bread with geometric care.', { effects: { relationships: { george: 3 } } }),
      statChoice('Keep your full portion', 'Your body needs every crumb.', 'bold', { hunger: 2, morale: -3 }, 'No one argues, but the silence has weight.'),
    ], advance: shortAdvance, kind: 'survival', tags: ['food'],
  }),
  makeEvent({
    id: 'influenza-rumour', title: 'The fever ward', kicker: '1918',
    text: 'Men at the aid post speak of an influenza spreading through camps and towns. Two empty places appear at breakfast.',
    choices: [
      statChoice('Wash and avoid shared mugs', 'Precautions are imperfect, not pointless.', 'careful', { health: 2, stress: 2, morale: -1 }, 'You become conscious of every cough.'),
      statChoice('Help Alfie carry supplies', 'The aid post needs hands.', 'duty', { fatigue: 7, morale: 4, stress: 3 }, 'You work among hot faces and rough blankets.', { effects: { relationships: { alfie: 5 } }, risk: { danger: 0.07, fatality: 0.03, healthLoss: [12, 28], cause: 'influenza' } }),
    ], advance: quietAdvance, kind: 'survival', requirements: { from: '1918-05-01T00:00:00.000Z' }, tags: ['health'],
  }),
  makeEvent({
    id: 'replacement-tunic', title: 'A replacement tunic', kicker: 'Quartermaster stores',
    text: 'Your tunic is beyond repair. The replacement has another man’s faded rank stripe removed from the sleeve.',
    choices: [
      statChoice('Take it without asking', 'Clothing travels farther than men.', 'careful', { health: 2, morale: -1, stress: 1 }, 'It fits well enough after the first hour.'),
      statChoice('Ask who wore it', 'The quartermaster does not know and does not guess.', 'social', { morale: -2, stress: 2 }, 'The empty answer follows you back.'),
    ], advance: quietAdvance, tags: ['equipment', 'loss'],
  }),
  makeEvent({
    id: 'training-grenades', title: 'Grenade practice', kicker: 'Behind the line',
    text: 'An instructor demonstrates the new drill in a field cratered by old practice throws.',
    choices: [
      statChoice('Practise until it is automatic', 'Repetition may matter under fire.', 'duty', { fatigue: 6, stress: -2, morale: 4 }, 'Your hands learn the sequence.'),
      statChoice('Conserve your strength', 'Watch closely and throw only when ordered.', 'careful', { fatigue: 2, morale: 1 }, 'The instructor shouts at somebody else.'),
    ], advance: quietAdvance, tags: ['training'],
  }),
  makeEvent({
    id: 'chaplain-letter', title: 'A letter for another family', kicker: 'Quiet request',
    text: 'The chaplain asks whether you remember anything kind about a man from your company who died last week.',
    choices: [
      statChoice('Tell one true, ordinary story', 'Give his family something that belongs only to him.', 'social', { morale: 2, stress: 5, fatigue: 2 }, 'The chaplain writes the detail down exactly.'),
      statChoice('Say you did not know him well', 'Do not invent closeness.', 'careful', { morale: -1, stress: 2 }, 'The chaplain thanks you for the honesty.'),
    ], advance: quietAdvance, tags: ['loss', 'mail'],
  }),
  makeEvent({
    id: 'last-match', title: 'The final match', kicker: 'A matchbook with one left',
    text: 'There is one dry match in the dugout and three pipes waiting. James holds it like a sacred object.',
    choices: [
      statChoice('Light the brazier instead', 'Hot water can serve everyone.', 'social', { morale: 6, hunger: -2, fatigue: -2 }, 'The flame catches on the second scrap of paper.', { effects: { relationships: { james: 2, george: 2 } } }),
      statChoice('Let James choose', 'It is his match.', 'social', { morale: 4, stress: -2 }, 'He lights Arthur’s pipe and passes it around.'),
    ], advance: quietAdvance, tags: ['quiet'],
  }),
];
