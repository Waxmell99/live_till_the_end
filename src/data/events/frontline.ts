import { FRONTLINE_STAGES, type EventChoice, type FrontlineStage, type GameEvent } from '../../game/types';
import type { EventTranslation } from '../../i18n/content-types';

type Copy = [label: string, detail: string, outcome: string];
type SceneChoice = { id: string; minutes: number; posture?: EventChoice['posture']; en: Copy; zh: Copy };
type Scene = { stage: FrontlineStage; en: [string, string]; zh: [string, string]; choices: SceneChoice[] };

// Keep both authored languages beside the same choice IDs and rules.
const SCENES: Scene[] = [
  {
    stage: 'orders',
    en: ['The orchard road', 'Edward is taking a message to the orchard post. You and George must bring him back before the casualty cart leaves. You have twenty minutes to prepare; scouting, rest, medical supplies and smoke compete for that time.'],
    zh: ['果园路上的任务', 'Edward 要去果园哨所送信，你和 George 负责接他回来。伤员后送车不会一直等候。准备时间只有二十分钟：认路、休息、医疗物资和烟幕都要占用它。'],
    choices: [
      { id: 'promise', minutes: 0, en: ['Promise to bring Edward back', 'Make his return a personal commitment. This creates no combat bonus.', 'You tell Edward that you will come for him. George hears the promise.'], zh: ['答应把 Edward 带回来', '把他的归来当作自己的牵挂。承诺本身不会增加战斗能力。', '你告诉 Edward，你会去接他。George 听到了这句承诺。'] },
      { id: 'self', minutes: 0, en: ['Keep your own return foremost', 'You can still help Edward, but make no promise you may be unable to keep.', 'You agree to the task without promising that everyone will return.'], zh: ['先保住自己的归路', '仍然可以帮助 Edward，但不许下未必能兑现的承诺。', '你接下任务，没有保证每个人都能回来。'] },
    ],
  },
  {
    stage: 'route',
    en: ['One stretch of quiet', 'A guide can show you the sunken lane, or you can sleep before carrying a man through the mud. There is time for one. The lane makes the rescue and return shorter; rest reduces the cost of carrying.'],
    zh: ['仅有的一段安静', '向导可以带你查看凹陷小路，你也可以趁运送伤员前睡一会儿。这一段时间只能做一件事。认路能缩短救援和返回；休息能减轻搬运的负担。'],
    choices: [
      { id: 'scout', minutes: 12, posture: 'careful', en: ['Walk the sunken lane', '12 minutes. Learn a covered rescue approach and a six-minute return route.', 'You mark the broken gate and the turn beneath the bank. These will be usable routes, not just a memory.'], zh: ['走一遍凹陷小路', '12 分钟。解锁隐蔽接近路线与六分钟返回路线。', '你记住断门和土坡下的转弯。这些会成为实际可用的路线。'] },
      { id: 'rest', minutes: 8, posture: 'rest', en: ['Sleep in the shelter', '8 minutes. Fatigue −16; carrying Edward later is less exhausting. The lane remains unknown.', 'George wakes you after eight minutes. You have steadier legs, but no knowledge of the lane.'], zh: ['在掩体里睡一会儿', '8 分钟。疲劳 −16；之后搬运 Edward 的负担减轻，但仍不认识小路。', '八分钟后 George 叫醒你。你的双腿更有力，却仍不了解那条小路。'] },
    ],
  },
  {
    stage: 'kit',
    en: ['What fits in the satchel', 'The task already has one shared field dressing. Collect another dressing, wait for a smoke pot, or leave now. Any dressing you brought from earlier service has joined this shared supply. Preparation beyond twenty minutes shortens the later evacuation window.'],
    zh: ['挎包里能带走什么', '任务已配发一份共用敷料。可以再领一份、等候烟幕罐，或马上出发。此前随身携带的敷料也已放入共用物资。超过二十分钟的准备会缩短后续撤离窗口。'],
    choices: [
      { id: 'medicine', minutes: 8, en: ['Collect a second dressing', '8 minutes. One extra dressing, no smoke.', 'The orderly gives you another sealed dressing. Each can stop one man’s bleeding.'], zh: ['再领一份敷料', '8 分钟。多一份敷料，没有烟幕。', '勤务兵递给你一份密封敷料。每份只能为一个人止血。'] },
      { id: 'smoke', minutes: 12, en: ['Wait for a smoke pot', '12 minutes. One smoke screen, no extra dressing.', 'The smoke pot arrives late. It can cover one crossing, but cannot bind a wound.'], zh: ['等候烟幕罐', '12 分钟。获得一次烟幕，不增加敷料。', '烟幕罐晚了一些送到。它能掩护一次穿越，却不能包扎伤口。'] },
      { id: 'leave', minutes: 0, en: ['Leave with the issued dressing', 'No delay or extra equipment. Keep the full evacuation window.', 'You leave the stores queue and keep the time instead.'], zh: ['带着配发敷料出发', '不耽搁，也不添装备；保住完整撤离窗口。', '你离开领料队伍，把时间留了下来。'] },
    ],
  },
  {
    stage: 'coordination',
    en: ['George’s hands', 'George can cover the open crossing or bring a stretcher and help with treatment and carrying. He cannot do both. A familiar comrade is useful because of the job you agree on together.'],
    zh: ['George 的双手', 'George 可以掩护开阔地穿越，也可以带上担架协助救治与搬运。他无法同时承担两项工作。互助的作用取决于你们事先约定的分工。'],
    choices: [
      { id: 'cover', minutes: 2, en: ['Agree on covering fire', '2 minutes. George prevents your wound on exposed crossings, but his firing position will be hit and he will need treatment. Covered routes do not require him to fire.', 'You agree on a signal. George can cover you from an exposed emplacement, at a cost to him.'], zh: ['约定火力掩护', '2 分钟。George 能避免你在开阔地负伤，但射击位置会被命中，他将需要离队治疗。走隐蔽路线则不需要他开火。', '你们约定信号。George 可以在暴露的射击点掩护你，但这会让他付出代价。'] },
      { id: 'stretcher', minutes: 2, en: ['Bring the stretcher together', '2 minutes. Six-minute carrying route and assisted treatment. No covering fire.', 'You and George rehearse the lift. He will have both hands on the stretcher, not his gun.'], zh: ['一起带上担架', '2 分钟。解锁六分钟搬运和协同救治，没有火力掩护。', '你和 George 试了一次抬担架。他的双手会握着担架，而不是枪。'] },
    ],
  },
  {
    stage: 'approach',
    en: ['A shot beyond the gate', 'The orchard post has gone silent. George points out the exposed road. A covered route avoids the shot; the open road is faster, but without covering fire you will suffer a bleeding wound.'],
    zh: ['断门外的一声枪响', '果园哨所安静了下来。George 指出暴露的道路。隐蔽路线能避开射击；开阔道路更快，但没有掩护时你将负伤并持续出血。'],
    choices: [
      { id: 'lane', minutes: 6, posture: 'careful', en: ['Use the lane you scouted', '6 minutes. Requires your earlier reconnaissance; no wound.', 'The broken gate is exactly where you remember it. You reach the bank without crossing the sights.'], zh: ['走先前查看的小路', '6 分钟。需要此前认路；不会负伤。', '断门就在你记得的位置。你抵达土坡，没有进入射击线。'] },
      { id: 'crawl', minutes: 10, posture: 'careful', en: ['Crawl along the ditch', '10 minutes. Fatigue +4; no wound. The return route stays unknown.', 'Mud fills your sleeves. The bank hides you until you reach the orchard.'], zh: ['沿沟底匍匐前进', '10 分钟。疲劳 +4；不会负伤，也不会因此认识返回小路。', '泥水灌进袖口。土坡一直遮住你，直到抵达果园。'] },
      { id: 'open', minutes: 2, posture: 'bold', en: ['Cross the open road', '2 minutes. Without cover: health −24 and fourteen minutes to stop bleeding. With cover: George suffers a shoulder wound instead.', 'You cross the short strip of open road. Your agreed preparation determines who is exposed.'], zh: ['穿过开阔道路', '2 分钟。没有掩护：健康 −24，十四分钟内须止血。有掩护：George 将因此肩部负伤。', '你穿过短短一段开阔道路。此前的分工决定谁承受暴露的后果。'] },
    ],
  },
  {
    stage: 'rescue',
    en: ['Edward below the wall', 'Edward is hit in the leg, behind a low wall. He has twelve game minutes before uncontrolled bleeding becomes fatal. The cart leaves twenty-eight minutes from now, less any delay during preparation. Time advances only when you choose.'],
    zh: ['矮墙下的 Edward', 'Edward 腿部中弹，倒在矮墙后。若不控制出血，他将在十二个游戏分钟后死亡。后送车将在二十八分钟后离开，并扣除准备阶段耽搁的时间。只有做出选择才会推进时间。'],
    choices: [
      { id: 'smoke', minutes: 6, posture: 'careful', en: ['Wait for the smoke to spread', '6 minutes. Uses your smoke pot and avoids a new wound; Edward keeps bleeding.', 'The smoke finally fills the gap. You reach Edward with six minutes of his bleeding window spent.'], zh: ['等烟幕铺开', '6 分钟。消耗烟幕罐，避免新增伤口；Edward 仍在出血。', '烟幕终于遮住缺口。你接触到 Edward 时，他的止血窗口已用去六分钟。'] },
      { id: 'flank', minutes: 5, posture: 'careful', en: ['Reach him by the scouted flank', '5 minutes. Requires reconnaissance. Fatigue +8; no new wound.', 'The turn you learned before the task takes you behind the wall beside Edward.'], zh: ['沿查看过的侧路接近', '5 分钟。需要认路。疲劳 +8；不会新增伤口。', '任务前记住的转弯把你带到矮墙后，来到 Edward 身边。'] },
      { id: 'detour', minutes: 10, posture: 'careful', en: ['Feel your way around the long ditch', '10 minutes. Fatigue +12, no new wound; only two minutes remain for Edward. A four-minute dressing will be too late.', 'You stay below the sights, but the ditch is longer than it looked. Edward has almost no time left.'], zh: ['摸索绕过长沟', '10 分钟。疲劳 +12，不新增伤口；Edward 只剩两分钟，四分钟的包扎已经来不及。', '你始终躲在射击线下，但沟比看起来更长。Edward 几乎没有时间了。'] },
      { id: 'rush', minutes: 2, posture: 'bold', en: ['Go straight to him', '2 minutes. Without cover: health −28 and bleeding. With cover: George takes a shoulder wound. The fastest rescue leaves more treatment time.', 'You reach Edward directly. If George is covering you, his fire makes the crossing possible.'], zh: ['直接冲到他身边', '2 分钟。没有掩护：健康 −28 并持续出血。有掩护：George 肩部负伤。最快的救援能留下更多处理时间。', '你径直来到 Edward 身边。如果 George 正在掩护，他的火力让这次穿越成为可能。'] },
      { id: 'abandon', minutes: 1, posture: 'careful', en: ['Withdraw without reaching him', '1 minute. No new wound. Edward will not receive aid; your promise, if made, remains unfulfilled.', 'You stay behind the bank. There is no safe way to bring Edward back without going to him.'], zh: ['不接触他，直接撤回', '1 分钟。不新增伤口。Edward 将无法得到救治；若许过承诺，也无法兑现。', '你留在土坡后。不去接触 Edward，就没有办法把他带回来。'] },
    ],
  },
  {
    stage: 'treatment',
    en: ['Hands on the wound', 'Treatment takes time and uses the shared dressings. Bleeding stops when treatment finishes, not when it starts. George can tend Edward while you bind yourself only if you brought the stretcher together. You can also leave for aid immediately.'],
    zh: ['把手按在伤口上', '处理伤口需要时间，也会消耗共用敷料。止血在处理完成时生效，而不是开始时。如果此前带了担架，George 可以压住 Edward 的伤口，同时让你包扎自己。也可以立即撤往救护站。'],
    choices: [
      { id: 'edward', minutes: 4, en: ['Use one dressing on Edward', '4 minutes and one dressing. Stops Edward’s bleeding if completed before his deadline; does not treat you.', 'You bind Edward’s leg, keeping the last turn of cloth tight.'], zh: ['给 Edward 用一份敷料', '4 分钟，一份敷料。在期限内完成可止住他的出血；不会处理你的伤口。', '你包扎 Edward 的腿，把最后一圈布拉紧。'] },
      { id: 'self', minutes: 4, en: ['Use one dressing on yourself', '4 minutes and one dressing. Stops your bleeding if completed in time; Edward remains untreated.', 'You bind your own wound so you can keep moving.'], zh: ['给自己用一份敷料', '4 分钟，一份敷料。及时完成可止住自己的出血；Edward 仍未得到处理。', '你先包扎自己的伤口，保证还能继续移动。'] },
      { id: 'together', minutes: 4, en: ['Bind yourself while George tends Edward', '4 minutes and one dressing. Requires stretcher support and your own wound. George’s sustained pressure stops Edward’s bleeding during evacuation.', 'George keeps pressure on Edward’s wound while you bind your own. Your earlier division of work makes this possible.'], zh: ['包扎自己，让 George 照料 Edward', '4 分钟，一份敷料。需要担架协助和自己的伤口。George 在后送时持续按压，控制 Edward 的出血。', 'George 持续按住 Edward 的伤口，你包扎自己。此前的分工使这成为可能。'] },
      { id: 'evacuate', minutes: 0, en: ['Go for medical aid immediately', 'No time or dressing spent. Any untreated wound keeps its deadline during the return journey.', 'You leave the dressings closed and put your trust in reaching medical aid in time.'], zh: ['立即撤往救护站', '不耗时间与敷料。返回途中，未经处理的伤口仍按原期限恶化。', '你没有拆开敷料，寄望于及时抵达救护站。'] },
    ],
  },
  {
    stage: 'withdrawal',
    en: ['The return is also a choice', 'The short route you learned and the stretcher George brought are different ways to save time. Carrying on the marked road is slower. At fatigue 65 or above every carrying route takes four extra minutes. Leaving Edward makes your own return easier.'],
    zh: ['返回也是一次选择', '认过的短路和 George 带来的担架都能节省时间。沿标记道路搬运更慢。疲劳达到 65 时，所有搬运路线都要多花四分钟。留下 Edward 会让自己的归路更轻松。'],
    choices: [
      { id: 'lane', minutes: 6, en: ['Carry him through the sunken lane', '6 minutes; requires reconnaissance. Fatigue +16, or +8 if you rested. High fatigue adds four minutes.', 'You carry Edward past the broken gate you marked before the task.'], zh: ['沿凹陷小路把他背回', '6 分钟；需要认路。疲劳 +16；若休息过则 +8。高疲劳额外增加四分钟。', '你背着 Edward 经过任务前标记的断门。'] },
      { id: 'stretcher', minutes: 6, en: ['Lift the stretcher with George', '6 minutes; requires stretcher support. Fatigue +8, or +4 if rested. High fatigue adds four minutes.', 'You lift on the agreed count. George takes half the weight all the way to the aid post.'], zh: ['和 George 一起抬担架', '6 分钟；需要担架协助。疲劳 +8；若休息过则 +4。高疲劳额外增加四分钟。', '你们按约定一起抬起担架。George 一路分担重量，直到救护站。'] },
      { id: 'road', minutes: 10, en: ['Carry him down the marked road', '10 minutes. Fatigue +20, or +10 if rested. High fatigue adds four minutes.', 'Each marker gives you another distance to carry. Knowing the way would have made this shorter.'], zh: ['沿标记道路背回', '10 分钟。疲劳 +20；若休息过则 +10。高疲劳额外增加四分钟。', '每个路标都意味着还要背着他再走一段。如果认过路，这次返回就会更短。'] },
      { id: 'alone', minutes: 4, posture: 'careful', en: ['Return without Edward', '4 minutes. Fatigue +2. Any aid already given cannot save him if you leave him here.', 'You return with George. Edward stays beyond the wall, outside the casualty route.'], zh: ['不带 Edward 返回', '4 分钟。疲劳 +2。即使先前已为他止血，留在这里也无法救他。', '你和 George 回去。Edward 留在矮墙外，无法进入伤员后送路线。'] },
    ],
  },
  {
    stage: 'aid',
    en: ['At the casualty post', 'If the cart is still here, treatment takes two minutes. If it has left, walking to the fallback post takes eight. A remaining dressing can stop your bleeding in four minutes before that journey. The deadlines shown below continue to apply.'],
    zh: ['抵达伤员后送点', '若车仍在，救治需要两分钟；若车已离开，就要步行八分钟到备用救护站。剩余敷料可以在四分钟内先止住自己的出血，再继续赶路。下方显示的伤势期限仍然有效。'],
    choices: [
      { id: 'aid', minutes: 2, en: ['Go straight to the medical staff', 'Two minutes while the cart waits, otherwise eight. Medical staff treat both of you if you arrived together and in time.', 'You put yourself in the hands of the medical staff at the nearest available post.'], zh: ['直接找医护人员', '车仍在时两分钟，否则八分钟。若你们一起及时抵达，医护会处理两人的伤口。', '你把自己交给最近仍在工作的救护站医护人员。'] },
      { id: 'bind', minutes: 6, en: ['Use the remaining dressing before seeking aid', 'Four minutes to stop your bleeding, then two minutes to staff if the cart still waits, otherwise eight. Requires a dressing and your untreated wound.', 'You use the remaining dressing before making the last part of the journey.'], zh: ['用剩余敷料止血，再找医护', '先用四分钟止血；若车仍在，再走两分钟，否则八分钟。需要敷料和自己尚未止血的伤口。', '你先用剩余敷料止血，再走最后一段路。'] },
    ],
  },
  {
    stage: 'aftermath',
    en: ['The empty place by the brazier', 'The report names what happened to Edward and why. The route, equipment and division of work you chose all have consequences. This task ends here; the larger war continues, with the same comrades and the same diary.'],
    zh: ['火盆旁的位置', '报告写下 Edward 的遭遇与原因。路线、装备与此前的分工都留下了后果。任务在这里结束，战争仍会继续，战友和日记也仍是同一份。'],
    choices: [
      { id: 'remember', minutes: 2880, posture: 'social', en: ['Write down what you chose to preserve', 'Two days of recovery. Keep the mission’s record and your promise’s outcome.', 'You write the orchard road into your diary, including the decisions before the shooting.'], zh: ['记下自己想保住的东西', '两天恢复。留下任务记录，以及承诺是否兑现的结果。', '你把果园路写进日记，也记下枪响前所做的决定。'] },
      { id: 'rest', minutes: 2880, posture: 'rest', en: ['Rest beside George', 'Two days of recovery. Fatigue −12; the consequences remain in the personnel record.', 'George sits nearby while you sleep. The next duty will find a changed section.'], zh: ['在 George 身边休息', '两天恢复。疲劳 −12；经历的后果仍保存在人员记录中。', '你睡着时，George 坐在附近。下一次任务将由经历过这件事的班组接下。'] },
    ],
  },
];

export const FRONTLINE_EVENTS: GameEvent[] = SCENES.map((scene) => ({
  id: `frontline-${scene.stage}`,
  kind: ['approach', 'rescue', 'withdrawal'].includes(scene.stage) ? 'combat' : scene.stage === 'treatment' || scene.stage === 'aid' ? 'survival' : 'relationship',
  title: scene.en[0],
  kicker: `The orchard road · ${FRONTLINE_STAGES.indexOf(scene.stage) + 1}/10`,
  text: [scene.en[1]],
  source: 'fictional',
  weight: 0,
  scheduledOnly: true,
  tags: ['frontline'],
  choices: scene.choices.map((choice) => ({
    id: choice.id, label: choice.en[0], detail: choice.en[1], outcome: choice.en[2],
    posture: choice.posture ?? 'duty',
    advance: { min: choice.minutes, max: choice.minutes, unit: 'minutes' },
  })),
}));

export const ZH_FRONTLINE_EVENTS: Record<string, EventTranslation> = Object.fromEntries(SCENES.map((scene) => [
  `frontline-${scene.stage}`,
  { title: scene.zh[0], kicker: `果园路任务 · ${FRONTLINE_STAGES.indexOf(scene.stage) + 1}/10`, text: [scene.zh[1]], choices: scene.choices.map((choice) => choice.zh) },
]));
