import { translatedEvent as e, type EventTranslation } from './content-types';

export interface HistoryTranslation {
  title: string;
  shortTitle: string;
  summary: string;
  archive: string;
  location?: string;
  campaign?: string;
}

export const ZH_HISTORY: Record<string, HistoryTranslation> = {
  'unrestricted-submarine-warfare': {
    title: '德国恢复无限制潜艇战', shortTitle: '海上战争扩大',
    summary: '德国恢复了无限制潜艇战。在战壕里，这条消息只是传闻和旧报纸上的一小段文字。',
    archive: '1917年2月1日，德国恢复无限制潜艇战，并接受了攻击航运可能促使美国参战的风险。',
  },
  'america-enters-war': {
    title: '美国加入战争', shortTitle: '美国参战',
    summary: '一份沿战线传来的报纸称，美国已向德国宣战。战壕里没有立刻出现美军士兵，今天的勤务仍要继续。',
    archive: '美国于1917年4月6日向德国宣战。大规模美军仍需要时间征募、训练、装备并运抵欧洲。',
  },
  'battle-of-arras': {
    title: '阿拉斯战役开始', shortTitle: '阿拉斯', location: '阿拉斯防区', campaign: '阿拉斯战役',
    summary: '英国及自治领部队在阿拉斯以东发动进攻。炮火连绵到每一次报告都融进空气中的持续压力。',
    archive: '英国在阿拉斯的攻势始于1917年4月9日。加拿大部队夺取维米岭，防区其他地方的战斗持续到五月中旬。',
  },
  'third-ypres': {
    title: '第三次伊普尔战役开始', shortTitle: '第三次伊普尔', location: '伊普尔突出部', campaign: '第三次伊普尔战役',
    summary: '佛兰德攻势开始。雨水、炮击和被摧毁的排水系统把地面变成吞没装备、耗尽士兵的泥海。',
    archive: '第三次伊普尔战役通常与帕斯尚尔联系在一起，时间为1917年7月31日至11月10日。降雨与被摧毁的排水系统造成了极端恶劣的地面条件。',
  },
  'battle-of-cambrai': {
    title: '康布雷战役开始', shortTitle: '康布雷', location: '康布雷防区', campaign: '康布雷战役',
    summary: '英军在康布雷附近突然进攻，坦克的集中使用达到前所未有的规模。最初的希望传播得很快，混乱报告也是如此。',
    archive: '康布雷英军进攻于1917年11月20日开始，大量坦克与步兵、炮兵和飞机协同行动。德军反击夺回了相当一部分失地。',
  },
  'russian-armistice': {
    title: '东线停战', shortTitle: '东线停火',
    summary: '消息传来：俄国与同盟国之间的战斗暂停了。士兵们猜测还会有多少德军师被调往西线。',
    archive: '苏维埃俄国与同盟国之间的停战于1917年12月生效。东线大规模战斗终止，使德国能够把兵力转移到西方。',
  },
  'operation-michael': {
    title: '德国春季攻势开始', shortTitle: '“米夏埃尔”行动', location: '索姆河防区', campaign: '德国春季攻势',
    summary: '黎明前，德军在浓雾中展开大规模炮击。通信中断、阵地消失，整条战线开始向西移动。',
    archive: '“米夏埃尔”行动于1918年3月21日开始，目标是英军第五集团军和第三集团军。德军取得了巨大推进，却没有实现分割英法军队的决定性目标。',
  },
  'second-marne': {
    title: '第二次马恩河战役', shortTitle: '第二次马恩河', location: '皮卡第预备区', campaign: '第二次马恩河战役',
    summary: '报告描述德军在马恩河发动新进攻，随后盟军展开反击。在你的防区，这种规模只体现在参谋地图和不断移动的列车上。',
    archive: '第二次马恩河战役始于1918年7月15日的德军进攻。7月18日起的盟军反攻帮助终结了德国在战争中的最后一次大规模攻势。',
  },
  'hundred-days': {
    title: '百日攻势开始', shortTitle: '百日攻势', location: '亚眠防区', campaign: '百日攻势',
    summary: '盟军在亚眠附近发动进攻，枪炮、坦克、飞机和步兵都经过周密隐蔽。这一次，防线向东移动。',
    archive: '亚眠战役于1918年8月8日开始，揭开后来被称为“百日攻势”的一系列盟军行动。德军被逐步推回边境方向。',
  },
  'german-unrest': {
    title: '德国国内动荡的报告', shortTitle: '承受重压的德国',
    summary: '报纸和俘虏都提到德国国内的短缺、政治危机和动荡。排里没有人敢相信传闻到提前庆祝。',
    archive: '到1918年10月下旬，德国同时面对军事后退、严重短缺、政治改革和日益加剧的动荡。十月底的海军哗变促成了十一月初更广泛的革命。',
  },
  'armistice-talks': {
    title: '停战代表穿过战线', shortTitle: '停战传闻', location: '比利时蒙斯附近',
    summary: '军官证实，德国代表已经前来商谈停战。火炮仍在射击，士兵们避免说出自己的希望。',
    archive: '德国代表团于1918年11月7日穿过战线，在贡比涅森林与盟军代表会面。谈判进行时，战斗也仍在继续。',
  },
  armistice: {
    title: '枪炮声沉寂', shortTitle: '停战', location: '比利时蒙斯附近', campaign: '停战',
    summary: '十一点整，西线的枪炮声停止了。',
    archive: '在贡比涅签署的停战协定于1918年11月11日11时生效，结束了西线战斗；正式和平条约则在1919年以后签署。',
  },
};

const HISTORY_CHOICES: Array<[string, string, string]> = [
  ['仔细阅读告示', '弄清官方文字究竟说了什么。', '纸上给出了日期和地点，却无法告诉你明天会发生什么。'],
  ['和 Arthur 谈谈', '把已知事实与战壕传言分开。', 'Arthur 对自己不知道的事十分谨慎。不确定仍在，但有了边界。'],
  ['回去完成今天的勤务', '历史并没有取消你的工作。', '告示被塞进口袋。口粮、值哨和泥仍占据着这一天。'],
];

export const ZH_HISTORICAL_EVENTS: Record<string, EventTranslation> = Object.fromEntries(
  Object.entries(ZH_HISTORY)
    .filter(([id]) => id !== 'armistice')
    .map(([id, record]) => [`history:${id}`, e(record.title, record.shortTitle, record.summary, HISTORY_CHOICES)]),
);
