import { ALL_EVENTS, eventById } from '../data/events';
import type { HistoricalRecord } from '../game/types';
import type { LetterDefinition, JournalEntry, GameEvent, EventChoice, GameState, NpcDefinition } from '../game/types';
import type { Language } from '.';
import { ZH_COMBAT_EVENTS } from './events-combat.zh';
import type { EventTranslation } from './content-types';
import { ZH_LETTERS, ZH_LETTER_EVENTS, ZH_NPCS } from './events-people.zh';
import { ZH_RELATIONSHIP_EVENTS } from './events-people.zh';
import { ZH_ROUTINE_EVENTS } from './events-routine.zh';
import { ZH_HISTORICAL_EVENTS, ZH_HISTORY } from './history.zh';

export const ZH_EVENTS: Record<string, EventTranslation> = {
  ...ZH_ROUTINE_EVENTS,
  ...ZH_COMBAT_EVENTS,
  ...ZH_RELATIONSHIP_EVENTS,
  ...ZH_LETTER_EVENTS,
  ...ZH_HISTORICAL_EVENTS,
};

const VALUE_ZH: Record<string, string> = {
  'Arras rear area': '阿拉斯后方区域',
  'Arras sector': '阿拉斯防区',
  'Ypres Salient': '伊普尔突出部',
  'Cambrai sector': '康布雷防区',
  'Somme sector': '索姆河防区',
  'Picardy reserve area': '皮卡第预备区',
  'Amiens sector': '亚眠防区',
  'Near Mons, Belgium': '比利时蒙斯附近',
  'Battle of Arras': '阿拉斯战役',
  'Third Battle of Ypres': '第三次伊普尔战役',
  'Battle of Cambrai': '康布雷战役',
  'German spring offensive': '德国春季攻势',
  'Second Battle of the Marne': '第二次马恩河战役',
  'Hundred Days offensive': '百日攻势',
  Armistice: '停战',
  'Railway apprentice': '铁路学徒',
  Clerk: '文员',
  'Coal miner': '煤矿工人',
  'Farm labourer': '农场雇工',
  'Printer’s apprentice': '印刷学徒',
  'Warehouse porter': '仓库搬运工',
  Schoolteacher: '教师',
  Carpenter: '木匠',
  Manchester: '曼彻斯特',
  Leeds: '利兹',
  Bristol: '布里斯托尔',
  Sheffield: '谢菲尔德',
  Liverpool: '利物浦',
  Norwich: '诺里奇',
  Cardiff: '加的夫',
  Nottingham: '诺丁汉',
  'Parents and a younger sister at home': '父母和妹妹在家乡',
  'A widowed mother and two brothers': '寡居的母亲和两个兄弟',
  'A wife waiting at home': '妻子在家等待',
  'Parents and three siblings': '父母和三个兄弟姐妹',
  'An older sister and her family': '姐姐和她的家人',
  'A father who works on the railway': '在铁路工作的父亲',
  'August 1914': '1914年8月',
  'May 1915': '1915年5月',
  'January 1916': '1916年1月',
  'September 1916': '1916年9月',
  'December 1916': '1916年12月',
};

const WEATHER_ZH: Record<string, string> = {
  'Low cloud and drizzle': '低云与细雨',
  'Cold, steady rain': '寒冷而持续的雨',
  'A pale, dry morning': '苍白而干燥的清晨',
  'Hard wind from the west': '强劲西风',
  'Mist lying over the wire': '铁丝网上伏着薄雾',
  'Sleet against the duckboards': '雨夹雪敲打木栈板',
  'Heavy, airless heat': '闷热而无风',
  'Clear sky above the guns': '炮火上空一片晴朗',
};

const CAUSE_ZH: Record<string, string> = {
  'illness after contaminated water': '饮用污染水源引发的疾病',
  'machine-gun fire during a wiring party': '铁丝网劳役期间的机枪火力',
  'stray fire during a wiring party': '铁丝网劳役期间的流弹',
  'stomach illness': '胃肠疾病',
  'shellfire on an exposed road': '暴露道路上的炮火',
  influenza: '流感',
  'a direct hit on the dugout': '掩蔽部遭到直接命中',
  'a collapsing dugout': '掩蔽部坍塌',
  'shellfire while rescuing a sentry': '营救哨兵时遭遇炮火',
  'poison gas exposure': '毒气侵害',
  'fire during a night patrol': '夜间巡逻时遭到射击',
  'a flare exposing the patrol': '照明弹暴露巡逻队',
  'shellfire while carrying orders': '传递命令时遭遇炮火',
  'machine-gun fire while carrying orders': '传递命令时遭遇机枪射击',
  'shellfire while repairing signal wire': '修理通信线时遭遇炮火',
  'enemy fire during an infantry attack': '步兵进攻中的敌军火力',
  'an enemy trench raid': '敌军战壕突袭',
  'a sniper’s bullet': '狙击手的子弹',
  'stray rifle fire': '步枪流弹',
  'counter-battery shellfire': '反制炮火',
  'a direct shell hit': '炮弹直接命中',
  'shellfire in open ground': '开阔地上的炮火',
  'shellfire while carrying a wounded man': '运送伤员时遭遇炮火',
  'shellfire near a casualty route': '伤员后送路线附近的炮火',
  'shellfire during a retreat': '撤退期间的炮火',
  'aircraft fire on a retreating column': '飞机对撤退纵队的射击',
  'enemy fire during a retreat': '撤退期间的敌军火力',
  'enemy fire during a tank-supported attack': '坦克支援进攻中的敌军火力',
  'enemy fire during an advance': '推进中的敌军火力',
  'artillery fire near a disabled tank': '损坏坦克附近的炮火',
  'machine-gun fire': '机枪火力',
  'close fighting at a strongpoint': '据点内的近距离战斗',
  'rifle fire from a strongpoint': '据点射来的步枪火力',
  'rifle fire in dense fog': '浓雾中的步枪火力',
  'enemy fire in dense fog': '浓雾中的敌军火力',
  'shellfire in dense fog': '浓雾中的炮火',
  'shellfire in the final hour of the war': '战争最后一小时的炮火',
  'fire in the final hour of the war': '战争最后一小时的射击',
  'shellfire on a cratered road': '弹坑道路上的炮火',
  'shellfire among road craters': '道路弹坑间的炮火',
  'an accident with a frightened horse': '受惊马匹造成的事故',
  'a dugout roof collapse': '掩蔽部顶棚坍塌',
  'shellfire on an observed route': '受敌军监视路线上的炮火',
  'shellfire on a stretcher route': '担架运输路线上的炮火',
};

export function localizeProfileValue(value: string, language: Language): string {
  if (language !== 'zh') return value;
  const exact = VALUE_ZH[value];
  if (exact) return exact;
  const insensitive = Object.entries(VALUE_ZH).find(([source]) => source.toLowerCase() === value.toLowerCase());
  return insensitive?.[1] ?? value;
}

export function localizeLocation(value: string, language: Language): string {
  return localizeProfileValue(value, language);
}

export function localizeWeather(value: string, language: Language): string {
  return language === 'zh' ? (WEATHER_ZH[value] ?? value) : value;
}

export function localizeEvent(event: GameEvent, language: Language): GameEvent {
  if (language === 'en') return event;
  const translated = ZH_EVENTS[event.id];
  if (!translated) return event;
  return {
    ...event,
    title: translated.title,
    kicker: translated.kicker,
    text: translated.text,
    choices: event.choices.map((choice, index) => {
      const localized = translated.choices[index];
      return localized ? { ...choice, label: localized[0], detail: localized[1], outcome: localized[2] } : choice;
    }),
  };
}

export function localizeChoice(event: GameEvent, choice: EventChoice, language: Language): EventChoice {
  if (language === 'en') return choice;
  const index = event.choices.findIndex((candidate) => candidate.id === choice.id);
  const translated = ZH_EVENTS[event.id]?.choices[index];
  return translated ? { ...choice, label: translated[0], detail: translated[1], outcome: translated[2] } : choice;
}

export function localizeHistory(record: HistoricalRecord, language: Language): HistoricalRecord {
  if (language === 'en') return record;
  const translated = ZH_HISTORY[record.id];
  return translated ? { ...record, ...translated } : record;
}

export function localizeLetter(letter: LetterDefinition, language: Language): LetterDefinition {
  if (language === 'en') return letter;
  const translated = ZH_LETTERS[letter.id];
  if (!translated) return letter;
  return {
    ...letter,
    from: translated.from,
    subject: translated.subject,
    body: translated.body,
    replyOptions: letter.replyOptions.map((reply, index) => ({
      ...reply,
      label: translated.replies[index]?.[0] ?? reply.label,
      tone: translated.replies[index]?.[1] ?? reply.tone,
    })),
  };
}

export function localizeNpc(npc: NpcDefinition, language: Language): NpcDefinition {
  if (language === 'en') return npc;
  const translated = ZH_NPCS[npc.id];
  return translated ? { ...npc, ...translated } : npc;
}

function translatedCause(cause: string): string {
  return CAUSE_ZH[cause] ?? cause;
}

export function localizeEndingCause(cause: string, language: Language): string {
  if (language === 'en') return cause;
  if (cause === 'The guns fell silent at eleven o’clock.') return '十一点整，枪炮声沉寂了。';
  if (cause === 'Died after accumulated wounds and illness.') return '因累积的伤势与疾病去世。';
  if (cause === 'Invalided home after prolonged illness and wounds.') return '因长期疾病与伤势退役回国。';
  const patterns: Array<[RegExp, (match: RegExpMatchArray) => string]> = [
    [/^Killed by (.+)\.$/, (match) => `死于${translatedCause(match[1])}。`],
    [/^Died of wounds after (.+)\.$/, (match) => `在${translatedCause(match[1])}后伤重不治。`],
    [/^Invalided home after wounds sustained during (.+)\.$/, (match) => `因在${translatedCause(match[1])}中负伤而退役回国。`],
    [/^Captured during (.+)\.$/, (match) => `在${translatedCause(match[1])}中被俘。`],
  ];
  for (const [pattern, translate] of patterns) {
    const match = cause.match(pattern);
    if (match) return translate(match);
  }
  return cause;
}

export function localizeDynamicText(text: string, language: Language): string {
  if (language === 'en' || !text) return text;
  const exact: Record<string, string> = {
    'Cut off from the section, you are taken prisoner.': '你与班组失散，随后被俘。',
    'The section returns without you.': '班组回来时，你已经不在其中。',
    'The medical board rules that you cannot return to front-line service.': '医疗委员会裁定你不能再返回前线。',
    'The guns fell silent at eleven o’clock.': '十一点整，枪炮声沉寂了。',
  };
  if (exact[text]) return exact[text];
  let result = text;
  result = result.replace(/You are wounded \((\d+) health lost\), but remain alive\./g, '你负伤了（健康损失 $1），但仍然活着。');
  result = result.replace(/([A-Za-z”“’\s]+) was killed\. His place in the section is empty\./g, '$1阵亡了。他在班里的位置空了下来。');
  result = result.replace(/([A-Za-z”“’\s]+) is missing after the action\./g, '战斗结束后，$1失踪了。');
  result = result.replace(/([A-Za-z”“’\s]+) is wounded and taken to the aid post\./g, '$1负伤，被送往救护站。');
  result = result.replace(/([A-Za-z”“’\s]+) returns to the section, thinner but walking\./g, '$1回到了班里，瘦了一圈，但能够行走。');
  result = result.replace(/([A-Za-z”“’\s]+) will not return to the section after treatment\./g, '$1接受治疗后不会再回到班里。');
  return result;
}

function translatedEpitaph(text: string): string {
  let match = text.match(/^Killed near (.+)\.$/);
  if (match) return `在${localizeLocation(match[1], 'zh')}附近阵亡。`;
  match = text.match(/^Wounded near (.+); transferred after treatment\.$/);
  if (match) return `在${localizeLocation(match[1], 'zh')}附近负伤，治疗后调离。`;
  match = text.match(/^Wounded near (.+)\.$/);
  if (match) return `在${localizeLocation(match[1], 'zh')}附近负伤。`;
  match = text.match(/^Reported missing near (.+); later confirmed captured\.$/);
  if (match) return `在${localizeLocation(match[1], 'zh')}附近失踪，后来确认被俘。`;
  return localizeDynamicText(text, 'zh');
}

export function localizeNpcEpitaph(text: string, language: Language): string {
  return language === 'zh' ? translatedEpitaph(text) : text;
}

export function localizeJournalEntry(entry: JournalEntry, state: GameState, language: Language): JournalEntry {
  if (language === 'en') return entry;
  if (entry.eventId === 'initial-record' || entry.id === 'enlistment-record') {
    return {
      ...entry,
      title: '派往西线',
      body: `${state.character.name}来自${localizeProfileValue(state.character.hometown, language)}，战前是${localizeProfileValue(state.character.occupation, language)}，如今加入前线班组。`,
    };
  }
  const historyId = entry.historyId ?? Object.keys(ZH_HISTORY).find((id) => entry.id === `history-${id}`);
  if (historyId) {
    const history = ZH_HISTORY[historyId];
    if (history) return { ...entry, title: history.shortTitle, body: history.summary };
  }
  const npcId = entry.npcId ?? Object.keys(ZH_NPCS).find((id) => entry.id.startsWith(`npc-${id}-`));
  if (npcId) return { ...entry, body: translatedEpitaph(entry.body) };
  if (entry.endingType || entry.id.startsWith('ending-')) {
    return {
      ...entry,
      title: entry.endingType === 'survived' || entry.body === 'The guns fell silent at eleven o’clock.' ? '枪炮声沉寂' : '最终记录',
      body: localizeEndingCause(entry.body, language),
    };
  }

  let sourceEvent: GameEvent | undefined;
  if (entry.eventId && entry.eventId !== 'initial-record') {
    try { sourceEvent = eventById(entry.eventId); } catch { /* older or removed content */ }
  }
  sourceEvent ??= ALL_EVENTS.find((event) => event.title === entry.title);
  if (!sourceEvent) return { ...entry, body: localizeDynamicText(entry.body, language) };
  const translated = ZH_EVENTS[sourceEvent.id];
  if (!translated) return entry;
  const choiceIndex = entry.choiceId
    ? sourceEvent.choices.findIndex((choice) => choice.id === entry.choiceId)
    : sourceEvent.choices.findIndex((choice) => entry.body.startsWith(choice.outcome));
  const sourceOutcome = sourceEvent.choices[choiceIndex]?.outcome ?? '';
  const translatedOutcome = translated.choices[choiceIndex]?.[2] ?? '';
  const remainder = sourceOutcome && entry.body.startsWith(sourceOutcome)
    ? entry.body.slice(sourceOutcome.length).trim()
    : entry.body;
  return {
    ...entry,
    title: translated.title,
    body: [translatedOutcome, localizeDynamicText(remainder, language)].filter(Boolean).join(' '),
  };
}

export function localizePostwarLine(line: string, language: Language): string {
  if (language === 'en') return line;
  let match = line.match(/^Returned to (.+) in 1919\.$/);
  if (match) return `1919年回到${localizeProfileValue(match[1], language)}。`;
  match = line.match(/^Went back to work as a (.+)\.$/);
  if (match) return `重新从事${localizeProfileValue(match[1], language)}的工作。`;
  match = line.match(/^Eventually returned to (.+)\.$/);
  if (match) return `最终回到${localizeProfileValue(match[1], language)}。`;
  match = line.match(/^Returned to Britain for treatment in (\d+)\.$/);
  if (match) return `${match[1]}年回到英国接受治疗。`;
  match = line.match(/^Returned to (.+) after repatriation\.$/);
  if (match) return `获释遣返后回到${localizeProfileValue(match[1], language)}。`;
  const exact: Record<string, string> = {
    'Found work near home and kept it for many years.': '在家附近找到工作，并做了很多年。',
    'Changed trades after returning, but kept the old tools.': '回乡后改了行，却一直留着从前的工具。',
    'Married in the early 1920s and raised a family.': '二十世纪二十年代初结婚，养育了自己的家庭。',
    'Remained close to the families of men from the section.': '此后一直与班里战友的家人保持联系。',
    'Kept the wartime diary in a drawer with family papers.': '把战争日记和家庭文件一起收在抽屉里。',
    'Rarely spoke about the war.': '很少谈起战争。',
    'Spoke about the men more often than the battles.': '谈起战友的时候比谈起战役更多。',
    'Remembered particular sounds long after dates had faded.': '日期已经模糊以后，仍记得某些声音。',
    'Kept the promise to visit Alfie’s bakery.': '履行承诺，去拜访了 Alfie 的面包房。',
    'Was discharged from front-line service and survived the war.': '离开前线服役，并活过了战争。',
    'Was held as a prisoner of war until the fighting ended.': '作为战俘被关押，直到战斗结束。',
    'Survival did not feel like a victory, but it was life.': '活下来并不像胜利，但那仍然是生命。',
  };
  return exact[line] ?? line;
}

export function untranslatedEventIds(): string[] {
  return ALL_EVENTS.filter((event) => !ZH_EVENTS[event.id]).map((event) => event.id);
}
