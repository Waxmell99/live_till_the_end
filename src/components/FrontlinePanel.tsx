import { FRONTLINE_NOTICE_TEXT, minutesLeft, type FrontlineForecast } from '../game/frontline';
import { FRONTLINE_STAGES, type GameState } from '../game/types';
import { useLanguage } from '../i18n';
import { frontlineCopy } from '../i18n/frontline';

export function FrontlinePanel({ state }: { state: GameState }) {
  const { language } = useLanguage();
  const mission = state.frontline;
  if (!mission) return null;
  const copy = frontlineCopy(language);
  const completed = mission.status === 'completed' || state.status === 'ended';
  const preparation = ['orders', 'route', 'kit'].includes(mission.stage);
  return <aside className="frontline-panel" aria-label={copy.title}>
    <header><b>{copy.title}</b><span>{completed ? copy.completed : `${copy.active} · ${copy.stage} ${FRONTLINE_STAGES.indexOf(mission.stage) + 1}/10`}</span></header>
    {completed || mission.stage === 'aftermath' ? <div className="frontline-summary">
      <p>{mission.edwardOutcome === 'saved' ? copy.saved : mission.edwardOutcome === 'dead' ? copy.lost : copy.pending}</p>
      {mission.commitment === 'edward' && mission.edwardOutcome !== 'pending' && <p>{mission.edwardOutcome === 'saved' ? copy.kept : copy.broken}</p>}
      {mission.georgeWounded && <p>{copy.george}</p>}
      {state.status === 'ended' && mission.playerWound && !mission.playerWound.stabilized && <p>{FRONTLINE_NOTICE_TEXT.playerDied[language]}</p>}
    </div> : <>
      <p>{copy.rule}</p>
      <dl className="frontline-facts">
        {preparation && <div><dt>{copy.prepare}</dt><dd>{minutesLeft(mission.preparationDeadline, state.currentDate)} {copy.minutes}</dd></div>}
        {mission.preparationDelay > 0 && <div><dt>{copy.late}</dt><dd>{mission.preparationDelay} {copy.minutes}</dd></div>}
        {mission.evacuationDeadline && <div><dt>{copy.evacuation}</dt><dd>{minutesLeft(mission.evacuationDeadline, state.currentDate) > 0 ? `${minutesLeft(mission.evacuationDeadline, state.currentDate)} ${copy.minutes}` : copy.gone}</dd></div>}
        <div><dt>{copy.dressings}</dt><dd>{mission.dressings}</dd></div>
        <div><dt>{copy.smoke}</dt><dd>{mission.smoke ? copy.yes : copy.no}</dd></div>
        <div><dt>{copy.route}</dt><dd>{mission.routeKnown ? copy.yes : copy.no}</dd></div>
        <div><dt>{copy.rest}</dt><dd>{mission.rested ? copy.yes : copy.no}</dd></div>
        <div><dt>{copy.support}</dt><dd>{copy[mission.support]}</dd></div>
        <div><dt>{copy.commitment}</dt><dd>{copy[mission.commitment]}</dd></div>
      </dl>
      <div className="frontline-wounds" role="status">
        {mission.georgeWounded && <p>{copy.george}</p>}
        {mission.playerWound && <p><b>{copy.you}: </b>{mission.playerWound.stabilized ? copy.stable : `${minutesLeft(mission.playerWound.deadline, state.currentDate)} ${copy.minutes}`}</p>}
        {mission.edwardWound && mission.edwardOutcome !== 'dead' && <p><b>{copy.edwardBleeding}: </b>{mission.edwardWound.stabilized ? copy.stable : `${minutesLeft(mission.edwardWound.deadline, state.currentDate)} ${copy.minutes}`}</p>}
        {mission.edwardOutcome === 'dead' && <p>{copy.lost}</p>}
      </div>
    </>}
  </aside>;
}

export function FrontlineConsequences({ forecast }: { forecast: FrontlineForecast }) {
  const { language } = useLanguage();
  const copy = frontlineCopy(language);
  return <div className="consequence-group frontline-consequences">
    <strong>{copy.forecast}</strong>
    <div className="consequence-chips">
      <span>{copy.duration}: {forecast.minutes} {copy.minutes}</span>
      {forecast.dressingsDelta !== 0 && <span>{copy.dressingChange}: {forecast.dressingsDelta > 0 ? '+' : ''}{forecast.dressingsDelta}</span>}
      {forecast.smokeUsed && <span>{copy.smokeUsed}</span>}
      {forecast.result.playerWound && !forecast.result.playerWound.stabilized && !forecast.notices.includes('playerDied') && <span>{copy.you}: {minutesLeft(forecast.result.playerWound.deadline, forecast.date)} {copy.minutes}</span>}
      {forecast.result.edwardWound && !forecast.result.edwardWound.stabilized && forecast.result.edwardOutcome === 'pending' && <span>{copy.edwardBleeding}: {minutesLeft(forecast.result.edwardWound.deadline, forecast.date)} {copy.minutes}</span>}
      {forecast.result.evacuationDeadline && !['aftermath'].includes(forecast.result.stage) && <span>{copy.evacuation}: {minutesLeft(forecast.result.evacuationDeadline, forecast.date)} {copy.minutes}</span>}
    </div>
    {forecast.notices.map((notice) => <p key={notice} className={['playerDied', 'edwardDied', 'edwardLeft', 'georgeHit', 'promiseBroken'].includes(notice) ? 'frontline-warning' : ''}>{FRONTLINE_NOTICE_TEXT[notice][language]}</p>)}
  </div>;
}
