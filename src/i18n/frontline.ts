import type { Language } from '.';

const EN = {
  title: 'The orchard road', active: 'Front-line task', completed: 'Task record', stage: 'Scene',
  rule: 'The clock advances only when you choose. Complete treatment by the displayed deadline; an untreated wound becomes fatal after it.',
  prepare: 'Preparation time left', late: 'Preparation delay', evacuation: 'Cart departs in', gone: 'Cart departed',
  minutes: 'min', dressings: 'Shared dressings', smoke: 'Smoke pot', yes: 'Available', no: 'None',
  route: 'Scouted lane', rest: 'Rest before carrying', support: 'George’s task', cover: 'Covering fire', stretcher: 'Stretcher and treatment', none: 'Not agreed',
  commitment: 'Your commitment', self: 'Bring yourself home', edward: 'Bring Edward back alive',
  you: 'Your bleeding deadline', edwardBleeding: 'Edward’s bleeding deadline', stable: 'Bleeding controlled; evacuation still needed',
  saved: 'Edward was evacuated alive and is recovering away from the section.', lost: 'Edward did not return alive.',
  pending: 'Edward’s return remains unresolved.', kept: 'Your promise was kept.', broken: 'Your promise could not be kept.',
  george: 'George suffered a shoulder wound while covering you and must leave for treatment.',
  forecast: 'After this action', duration: 'Time spent', dressingChange: 'Dressing change', smokeUsed: 'Smoke consumed',
  unmet: 'Unavailable with your current preparation', caution: 'Consequences in this task follow the shown preparation, resources and game-time deadlines.',
};
const ZH: Record<keyof typeof EN, string> = {
  title: '果园路', active: '前线任务', completed: '任务记录', stage: '场景',
  rule: '只有做出选择才推进时间。必须在显示的期限前完成处理；超过期限的未止血伤口将致命。',
  prepare: '准备剩余时间', late: '准备已耽搁', evacuation: '后送车将在以下时间后离开', gone: '后送车已离开',
  minutes: '分钟', dressings: '共用敷料', smoke: '烟幕罐', yes: '已备妥', no: '无',
  route: '查看过的小路', rest: '搬运前休息', support: 'George 的分工', cover: '火力掩护', stretcher: '担架与协同救治', none: '尚未约定',
  commitment: '你的牵挂', self: '保住自己的归路', edward: '把 Edward 活着带回来',
  you: '你的止血期限', edwardBleeding: 'Edward 的止血期限', stable: '出血已控制；仍需后送',
  saved: 'Edward 活着后送，离队养伤。', lost: 'Edward 没能活着回来。',
  pending: 'Edward 能否回来仍未确定。', kept: '你兑现了承诺。', broken: '承诺没能兑现。',
  george: 'George 在掩护你时肩部负伤，需要离队治疗。',
  forecast: '此选项完成后', duration: '耗时', dressingChange: '敷料变化', smokeUsed: '消耗烟幕',
  unmet: '此前的准备尚未满足这些条件', caution: '本任务的后果由所示准备、物资和游戏时间期限决定。',
};
export const frontlineCopy = (language: Language) => language === 'zh' ? ZH : EN;
