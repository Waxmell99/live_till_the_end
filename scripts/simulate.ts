import { simulateMany, type SimulationPolicy } from '../src/game/simulation';

const requestedRuns = Number.parseInt(process.argv[2] ?? '1000', 10);
const runs = Number.isFinite(requestedRuns) && requestedRuns > 0 ? requestedRuns : 1000;
const policies: SimulationPolicy[] = ['balanced', 'first', 'second', 'careful', 'bold'];
const requestedPolicy = process.argv[3] as SimulationPolicy | undefined;
const policy = requestedPolicy && policies.includes(requestedPolicy) ? requestedPolicy : 'balanced';
const summary = simulateMany(runs, 19171111, policy);

console.log(`${summary.runs} simulations · ${policy} policy`);
console.log('');
console.log(`Survived:     ${summary.survived}`);
console.log(`Killed:       ${summary.killed}`);
console.log(`Died wounds:  ${summary.wounds}`);
console.log(`Wounded home: ${summary.invalided}`);
console.log(`POW:          ${summary.pow}`);
console.log(`Stalled:      ${summary.stalled}`);
console.log('');
console.log(`Average turns: ${summary.averageTurns}`);
console.log(`Average days:  ${summary.averageDays}`);
