import { useMemo, useState } from 'react';
import { seedFromText } from '../game/random';
import type { CharacterInput } from '../game/types';

interface CharacterCreationProps {
  onBegin: (profile: CharacterInput, seed: number) => void;
  onBack: () => void;
}

const FIRST_NAMES = ['Thomas', 'William', 'George', 'Albert', 'Frederick', 'Henry', 'John', 'Samuel'];
const LAST_NAMES = ['Miller', 'Hughes', 'Carter', 'Taylor', 'Davies', 'Cooper', 'Ward', 'Foster'];
const HOMETOWNS = ['Manchester', 'Leeds', 'Bristol', 'Sheffield', 'Liverpool', 'Norwich', 'Cardiff', 'Nottingham'];
const OCCUPATIONS = ['Railway apprentice', 'Clerk', 'Coal miner', 'Farm labourer', 'Printer’s apprentice', 'Warehouse porter', 'Schoolteacher', 'Carpenter'];
const FAMILIES = ['Parents and a younger sister at home', 'A widowed mother and two brothers', 'A wife waiting at home', 'Parents and three siblings', 'An older sister and her family', 'A father who works on the railway'];
const ENLISTED = ['August 1914', 'May 1915', 'January 1916', 'September 1916', 'December 1916'];

const DEFAULT_PROFILE: CharacterInput = {
  name: 'Thomas Miller',
  age: 19,
  occupation: 'Railway apprentice',
  hometown: 'Manchester',
  family: 'Parents and a younger sister at home',
  enlisted: 'September 1916',
};

function pick<T>(items: T[], seed: number, offset: number): T {
  return items[Math.abs((seed + Math.imul(offset, 1103515245)) >>> 0) % items.length];
}

export function CharacterCreation({ onBegin, onBack }: CharacterCreationProps) {
  const initialSeed = useMemo(() => Math.floor(Date.now() % 2_147_483_647), []);
  const [profile, setProfile] = useState<CharacterInput>(DEFAULT_PROFILE);
  const [seed, setSeed] = useState(initialSeed);

  const update = <K extends keyof CharacterInput>(key: K, value: CharacterInput[K]) => {
    setProfile((current) => ({ ...current, [key]: value }));
  };

  const randomise = () => {
    const nextSeed = (seedFromText(`${Date.now()}-${seed}`) % 2_147_483_647) || 19171111;
    setSeed(nextSeed);
    setProfile({
      name: `${pick(FIRST_NAMES, nextSeed, 1)} ${pick(LAST_NAMES, nextSeed, 2)}`,
      age: 18 + (nextSeed % 18),
      hometown: pick(HOMETOWNS, nextSeed, 3),
      occupation: pick(OCCUPATIONS, nextSeed, 4),
      family: pick(FAMILIES, nextSeed, 5),
      enlisted: pick(ENLISTED, nextSeed, 6),
    });
  };

  const valid = profile.name.trim().length >= 2 && profile.hometown.trim().length >= 2 && profile.occupation.trim().length >= 2;

  return (
    <main className="creation-screen">
      <div className="creation-backdrop" aria-hidden="true"><span>WESTERN FRONT</span><span>FIELD RECORD · 1917</span></div>
      <section className="enlistment-file">
        <header className="file-header">
          <button className="text-button" type="button" onClick={onBack}>← Return</button>
          <div className="file-stamp">B.E.F.<br />ACTIVE SERVICE</div>
          <p>Army Form B. 2067</p>
        </header>
        <div className="file-title">
          <p className="eyebrow">Record of a single life</p>
          <h1>Who were you before the war?</h1>
          <p>These details shape the record, not your combat strength. Nationality is British in this first route.</p>
        </div>
        <form className="character-form" onSubmit={(event) => { event.preventDefault(); if (valid) onBegin(profile, seed); }}>
          <label className="field field-wide">
            <span>Name</span>
            <input value={profile.name} maxLength={48} onChange={(event) => update('name', event.target.value)} autoFocus />
          </label>
          <label className="field">
            <span>Age</span>
            <input type="number" min="18" max="49" value={profile.age} onChange={(event) => update('age', Number(event.target.value))} />
          </label>
          <label className="field">
            <span>Nationality</span>
            <input value="British" disabled />
          </label>
          <label className="field">
            <span>Hometown</span>
            <input value={profile.hometown} maxLength={48} onChange={(event) => update('hometown', event.target.value)} />
          </label>
          <label className="field">
            <span>Occupation before the war</span>
            <input value={profile.occupation} maxLength={56} onChange={(event) => update('occupation', event.target.value)} />
          </label>
          <label className="field field-wide">
            <span>Family</span>
            <input value={profile.family} maxLength={88} onChange={(event) => update('family', event.target.value)} />
          </label>
          <label className="field">
            <span>Enlisted</span>
            <input value={profile.enlisted} maxLength={32} onChange={(event) => update('enlisted', event.target.value)} />
          </label>
          <label className="field">
            <span>Challenge seed</span>
            <input type="number" value={seed} onChange={(event) => setSeed(Number(event.target.value))} />
            <small>Same seed + same choices = same key outcomes.</small>
          </label>
          <div className="form-actions field-wide">
            <button className="button button-ghost dark" type="button" onClick={randomise}>Generate another record</button>
            <button className="button button-primary dark" type="submit" disabled={!valid}>Report to the front</button>
          </div>
        </form>
        <footer className="file-footer">The person is fictional. The historical timeline is not.</footer>
      </section>
    </main>
  );
}
