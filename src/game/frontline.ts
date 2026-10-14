import { FRONTLINE_STAGES, type EventChoice, type FrontlineMission, type FrontlineNotice, type FrontlineWound, type GameState } from './types';

const MINUTE = 60_000;
const at = (date: string, minutes: number) => new Date(Date.parse(date) + minutes * MINUTE).toISOString();
export const minutesLeft = (deadline: string, now: string) => Math.max(0, Math.round((Date.parse(deadline) - Date.parse(now)) / MINUTE));

export function startFrontline(state: GameState): void {
  const broughtDressing = state.inventory.includes('field_dressing');
  state.inventory = state.inventory.filter((item) => item !== 'field_dressing');
  state.frontline = {
    stage: 'orders', status: 'active', startedAt: state.currentDate,
    preparationDeadline: at(state.currentDate, 20),
    preparationDelay: 0,
    routeKnown: false, rested: false, dressings: broughtDressing ? 2 : 1,
    smoke: false, support: 'none', commitment: 'self',
    edwardReached: false, edwardCarried: false, edwardOutcome: 'pending', georgeWounded: false, transportMissed: false,
  };
}

export function frontlineChoices(state: GameState, choices: EventChoice[]): EventChoice[] {
  const mission = state.frontline;
  if (!mission || mission.status !== 'active') return choices;
  return choices.filter((choice) => {
    switch (`${mission.stage}:${choice.id}`) {
      case 'approach:lane': case 'rescue:flank': return mission.routeKnown;
      case 'rescue:smoke': return mission.smoke;
      case 'treatment:edward': return mission.dressings > 0 && mission.edwardReached && mission.edwardOutcome === 'pending' && !mission.edwardWound?.stabilized;
      case 'treatment:self': case 'aid:bind': return mission.dressings > 0 && Boolean(mission.playerWound && !mission.playerWound.stabilized);
      case 'treatment:together': return mission.dressings > 0 && mission.support === 'stretcher' && mission.edwardReached && mission.edwardOutcome === 'pending' && Boolean(mission.playerWound && !mission.playerWound.stabilized);
      case 'withdrawal:lane': return mission.routeKnown && mission.edwardReached && mission.edwardOutcome === 'pending';
      case 'withdrawal:stretcher': return mission.support === 'stretcher' && mission.edwardReached && mission.edwardOutcome === 'pending';
      case 'withdrawal:road': return mission.edwardReached && mission.edwardOutcome === 'pending';
      default: return true;
    }
  }).map((choice) => {
    let minutes = choice.advance.min;
    let fatigue = 0;
    if (mission.stage === 'withdrawal') {
      if (choice.id !== 'alone' && state.stats.fatigue >= 65) minutes += 4;
      fatigue = choice.id === 'stretcher' ? (mission.rested ? 4 : 8)
        : choice.id === 'lane' ? (mission.rested ? 8 : 16)
          : choice.id === 'road' ? (mission.rested ? 10 : 20) : 2;
    }
    if (mission.stage === 'aid') {
      const dressingTime = choice.id === 'bind' ? 4 : 0;
      const stillWaiting = mission.evacuationDeadline && Date.parse(at(state.currentDate, dressingTime)) < Date.parse(mission.evacuationDeadline);
      minutes = dressingTime + (stillWaiting ? 2 : 8);
    }
    const stats = mission.stage === 'route' && choice.id === 'rest' ? { fatigue: -16 }
      : mission.stage === 'route' && choice.id === 'scout' ? { fatigue: 4 }
        : mission.stage === 'approach' && choice.id === 'crawl' ? { fatigue: 4 }
          : mission.stage === 'rescue' && choice.id === 'flank' ? { fatigue: 8 }
            : mission.stage === 'rescue' && choice.id === 'detour' ? { fatigue: 12 }
              : mission.stage === 'withdrawal' ? { fatigue }
                : mission.stage === 'aftermath' && choice.id === 'rest' ? { fatigue: -12 } : undefined;
    return { ...choice, advance: { min: minutes, max: minutes, unit: 'minutes' as const }, effects: stats ? { stats } : undefined };
  });
}

/** Deterministic actions are shared by resolution and the visible consequence forecast. */
export function resolveFrontlineAction(state: GameState, choice: EventChoice, previousDate: string): FrontlineNotice[] {
  const mission = state.frontline!;
  const notices: FrontlineNotice[] = [];
  const now = state.currentDate;
  const npc = state.npcs.find((person) => person.id === 'edward')!;
  const expireEdward = (date: string) => {
    if (mission.edwardWound && !mission.edwardWound.stabilized && Date.parse(date) > Date.parse(mission.edwardWound.deadline) && mission.edwardOutcome === 'pending') {
      mission.edwardOutcome = 'dead'; npc.status = 'dead'; npc.statusDate = mission.edwardWound.deadline;
      notices.push('edwardDied');
    }
  };
  const bindingSelf = mission.stage === 'treatment' && ['self', 'together'].includes(choice.id);
  const bindingBeforeAid = mission.stage === 'aid' && choice.id === 'bind';
  const selfTreatmentAt = bindingBeforeAid ? at(previousDate, 4) : now;
  const willStopBleeding = (bindingSelf || mission.stage === 'aid') && mission.playerWound
    && Date.parse(selfTreatmentAt) <= Date.parse(mission.playerWound.deadline);
  if (mission.playerWound && !mission.playerWound.stabilized && Date.parse(now) > Date.parse(mission.playerWound.deadline) && !willStopBleeding) {
    state.currentDate = mission.playerWound.deadline;
    expireEdward(state.currentDate);
    state.stats.health = 0;
    notices.push('playerDied');
    return notices;
  }
  const aliveInTime = (wound?: FrontlineWound, date = now) => wound && Date.parse(date) <= Date.parse(wound.deadline);
  const stabilizePlayer = (date = now) => {
    if (mission.playerWound && aliveInTime(mission.playerWound, date)) {
      mission.playerWound.stabilized = true;
      notices.push('playerStable');
    }
  };
  const stabilizeEdward = () => {
    if (mission.edwardOutcome === 'pending' && aliveInTime(mission.edwardWound)) {
      mission.edwardWound!.stabilized = true;
      notices.push('edwardStable');
    }
  };
  const woundPlayer = (loss: number) => {
    state.stats.health = Math.max(1, state.stats.health - loss);
    // A second hit cannot reset the clock on an earlier untreated wound.
    const deadline = at(now, 14);
    mission.playerWound = {
      deadline: mission.playerWound && !mission.playerWound.stabilized && mission.playerWound.deadline < deadline ? mission.playerWound.deadline : deadline,
      stabilized: false,
    };
    notices.push('playerHit', 'playerBleeding');
  };
  const exposeCoveringGeorge = () => {
    if (!mission.georgeWounded) {
      mission.georgeWounded = true;
      notices.push('georgeHit');
    }
  };
  switch (mission.stage) {
    case 'orders': mission.commitment = choice.id === 'promise' ? 'edward' : 'self'; break;
    case 'route': mission.routeKnown = choice.id === 'scout'; mission.rested = choice.id === 'rest'; break;
    case 'kit':
      if (choice.id === 'medicine') mission.dressings += 1;
      if (choice.id === 'smoke') mission.smoke = true;
      mission.preparationDelay = Math.max(0, (Date.parse(now) - Date.parse(mission.preparationDeadline)) / MINUTE);
      break;
    case 'coordination': mission.support = choice.id === 'cover' ? 'cover' : 'stretcher'; break;
    case 'approach': {
      if (choice.id === 'open' && mission.support !== 'cover') woundPlayer(24);
      if (choice.id === 'open' && mission.support === 'cover') exposeCoveringGeorge();
      mission.edwardWound = { deadline: at(now, 12), stabilized: false };
      // Only preparation lateness reduces the window; movement has its own costs.
      mission.evacuationDeadline = at(now, Math.max(0, 28 - mission.preparationDelay));
      npc.status = 'wounded'; npc.statusDate = now;
      notices.push('edwardHit');
      break;
    }
    case 'rescue':
      mission.edwardReached = choice.id !== 'abandon';
      if (choice.id === 'smoke') mission.smoke = false;
      if (choice.id === 'rush' && mission.support !== 'cover') woundPlayer(28);
      if (choice.id === 'rush' && mission.support === 'cover') exposeCoveringGeorge();
      break;
    case 'treatment':
      if (choice.id !== 'evacuate') mission.dressings -= 1;
      if (choice.id === 'edward' || choice.id === 'together') stabilizeEdward();
      if (choice.id === 'self' || choice.id === 'together') stabilizePlayer();
      break;
    case 'withdrawal':
      mission.edwardCarried = choice.id !== 'alone';
      if (!mission.edwardCarried && mission.edwardOutcome === 'pending') notices.push('edwardLeft');
      break;
    case 'aid': {
      if (choice.id === 'bind') { mission.dressings -= 1; stabilizePlayer(at(previousDate, 4)); }
      mission.transportMissed = !mission.evacuationDeadline || Date.parse(at(previousDate, choice.id === 'bind' ? 4 : 0)) >= Date.parse(mission.evacuationDeadline);
      if (mission.transportMissed) notices.push('transportMissed');
      stabilizePlayer();
      if (mission.edwardCarried) stabilizeEdward();
      break;
    }
    case 'aftermath':
      mission.status = 'completed';
      if (mission.dressings > 0 && !state.inventory.includes('field_dressing')) state.inventory.push('field_dressing');
      mission.dressings = 0;
      if (mission.routeKnown) {
        state.flags.push('orchard-route-known');
        notices.push('routeRemembered');
      }
      break;
  }

  expireEdward(now);
  if (mission.stage === 'aid') {
    state.stats.health = Math.min(100, state.stats.health + 12);
    if (mission.edwardOutcome === 'pending') {
      mission.edwardOutcome = mission.edwardCarried ? 'saved' : 'dead';
      notices.push(mission.edwardCarried ? 'edwardSaved' : 'edwardLeft');
      npc.status = mission.edwardCarried ? 'wounded' : 'dead'; npc.statusDate = now;
    }
    const george = state.npcs.find((person) => person.id === 'george')!;
    george.relationship = Math.min(100, george.relationship + 4);
    if (mission.georgeWounded) {
      george.status = 'wounded'; george.statusDate = now;
      george.epitaph = 'Wounded while covering the orchard road; evacuated for treatment.';
    }
    if (mission.edwardOutcome === 'saved') npc.relationship = Math.min(100, npc.relationship + 12);
    if (mission.commitment === 'edward') notices.push(mission.edwardOutcome === 'saved' ? 'promiseKept' : 'promiseBroken');
    state.flags.push(mission.edwardOutcome === 'saved' ? 'orchard-edward-saved' : 'orchard-edward-lost');
    if (mission.commitment === 'edward') state.flags.push(mission.edwardOutcome === 'saved' ? 'orchard-promise-kept' : 'orchard-promise-broken');
    npc.epitaph = mission.edwardOutcome === 'saved' ? 'Evacuated alive from the orchard road.' : 'Lost on the orchard road before medical aid.';
  }
  const index = FRONTLINE_STAGES.indexOf(mission.stage);
  if (mission.status === 'active') mission.stage = FRONTLINE_STAGES[index + 1] ?? 'aftermath';
  return notices;
}

export interface FrontlineForecast {
  minutes: number;
  dressingsDelta: number;
  smokeUsed: boolean;
  notices: FrontlineNotice[];
  result: FrontlineMission;
  date: string;
}

export function isFrontlineEvent(id: string): boolean { return id.startsWith('frontline-'); }

export const FRONTLINE_NOTICE_TEXT: Record<FrontlineNotice, { en: string; zh: string }> = {
  playerHit: { en: 'You are hit on the exposed crossing; the wound requires treatment.', zh: '你在暴露地带中弹，伤口需要处理。' },
  playerBleeding: { en: 'Your bleeding must be stopped within fourteen game minutes of the first untreated hit.', zh: '你必须在第一次尚未处理的中弹后十四个游戏分钟内止血。' },
  playerStable: { en: 'Your bleeding is controlled before its deadline.', zh: '你的出血在期限内得到控制。' },
  playerDied: { en: 'You die when your untreated bleeding deadline expires. A dressing or timely medical aid could have stopped it.', zh: '未经处理的出血超过期限，你因此死亡。使用敷料或及时求医原本可以止血。' },
  edwardHit: { en: 'Edward is wounded. Stop his bleeding or reach medical aid within twelve game minutes.', zh: 'Edward 负伤。须在十二个游戏分钟内为他止血，或带他抵达医护处。' },
  edwardStable: { en: 'Edward’s bleeding is controlled in time; he still needs evacuation.', zh: 'Edward 的出血及时得到控制，但仍然需要后送。' },
  edwardDied: { en: 'Edward dies because his bleeding remained uncontrolled past the twelve-minute deadline.', zh: 'Edward 的出血始终未得到控制，超过十二分钟期限后死亡。' },
  edwardSaved: { en: 'Edward reaches treatment alive. He will recover away from the section; saving him does not erase his wound.', zh: 'Edward 活着抵达救治处。他会离开班组养伤；救回他不意味着伤口消失。' },
  edwardLeft: { en: 'Edward was left outside the casualty route. No medical help reaches him.', zh: 'Edward 被留在伤员后送路线之外，没有医护能接触到他。' },
  georgeHit: { en: 'George’s exposed firing position is hit while he covers you. He finishes the task with a shoulder wound, then must leave the section for treatment.', zh: 'George 掩护你时，暴露的射击位置遭到命中。他带着肩伤完成任务，随后必须离队治疗。' },
  transportMissed: { en: 'The casualty cart has departed. The fallback aid post costs eight minutes instead of two.', zh: '伤员后送车已经离开。备用救护站需要八分钟，而非两分钟。' },
  promiseKept: { en: 'You kept your promise to bring Edward back alive.', zh: '你兑现了把 Edward 活着带回来的承诺。' },
  promiseBroken: { en: 'Your promise to bring Edward back could not be kept.', zh: '把 Edward 带回来的承诺没能兑现。' },
  routeRemembered: { en: 'Your knowledge of the orchard lane remains in the record after the mission.', zh: '任务结束后，你对果园小路的了解仍留在记录中。' },
};

/** Reject malformed new mission data instead of discarding a wound or restarting its clock. */
export function validFrontlineMission(value: unknown): value is FrontlineMission {
  if (!value || typeof value !== 'object') return false;
  const mission = value as FrontlineMission;
  const validDate = (date: unknown) => typeof date === 'string' && Number.isFinite(Date.parse(date));
  const validWound = (wound: unknown) => {
    if (wound === undefined) return true;
    if (!wound || typeof wound !== 'object') return false;
    const candidate = wound as FrontlineWound;
    return validDate(candidate.deadline) && typeof candidate.stabilized === 'boolean';
  };
  return FRONTLINE_STAGES.includes(mission.stage)
    && ['active', 'completed'].includes(mission.status)
    && validDate(mission.startedAt) && validDate(mission.preparationDeadline)
    && (mission.evacuationDeadline === undefined || validDate(mission.evacuationDeadline))
    && Number.isInteger(mission.preparationDelay) && mission.preparationDelay >= 0
    && Number.isInteger(mission.dressings) && mission.dressings >= 0 && mission.dressings <= 3
    && ['none', 'cover', 'stretcher'].includes(mission.support)
    && ['self', 'edward'].includes(mission.commitment)
    && ['pending', 'saved', 'dead'].includes(mission.edwardOutcome)
    && [mission.routeKnown, mission.rested, mission.smoke, mission.edwardReached, mission.edwardCarried, mission.georgeWounded, mission.transportMissed].every((flag) => typeof flag === 'boolean')
    && validWound(mission.playerWound) && validWound(mission.edwardWound)
    && (FRONTLINE_STAGES.indexOf(mission.stage) <= FRONTLINE_STAGES.indexOf('approach') || Boolean(mission.edwardWound && mission.evacuationDeadline));
}
