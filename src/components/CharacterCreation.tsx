import { useMemo, useState } from 'react';
import { seedFromText } from '../game/random';
import type { CharacterInput } from '../game/types';
import { useLanguage } from '../i18n';
import { localizeProfileValue } from '../i18n/content';
import { LanguageSwitcher } from './LanguageSwitcher';

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
  const { language, t } = useLanguage();
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
    <main className={`creation-screen lang-${language}`}>
      <div className="creation-backdrop" aria-hidden="true"><span>{t('creation.backdropFront')}</span><span>{t('creation.backdropRecord')}</span></div>
      <section className="enlistment-file">
        <header className="file-header">
          <button className="text-button" type="button" onClick={onBack}>← {t('creation.back')}</button>
          <div className="file-stamp">{t('creation.stamp').split('\n').map((line) => <span key={line}>{line}<br /></span>)}</div>
          <p>{t('creation.formNumber')}</p>
          <LanguageSwitcher compact />
        </header>
        <div className="file-title">
          <p className="eyebrow">{t('creation.eyebrow')}</p>
          <h1>{t('creation.title')}</h1>
          <p>{t('creation.help')}</p>
        </div>
        <form className="character-form" onSubmit={(event) => { event.preventDefault(); if (valid) onBegin(profile, seed); }}>
          <label className="field field-wide">
            <span>{t('creation.name')}</span>
            <input value={profile.name} maxLength={48} onChange={(event) => update('name', event.target.value)} autoFocus />
          </label>
          <label className="field">
            <span>{t('creation.age')}</span>
            <input type="number" min="18" max="49" value={profile.age} onChange={(event) => update('age', Number(event.target.value))} />
          </label>
          <label className="field">
            <span>{t('creation.nationality')}</span>
            <input value={t('creation.british')} disabled />
          </label>
          <label className="field">
            <span>{t('creation.hometown')}</span>
            <input value={localizeProfileValue(profile.hometown, language)} maxLength={48} onChange={(event) => update('hometown', event.target.value)} />
          </label>
          <label className="field">
            <span>{t('creation.occupation')}</span>
            <input value={localizeProfileValue(profile.occupation, language)} maxLength={56} onChange={(event) => update('occupation', event.target.value)} />
          </label>
          <label className="field field-wide">
            <span>{t('creation.family')}</span>
            <input value={localizeProfileValue(profile.family, language)} maxLength={88} onChange={(event) => update('family', event.target.value)} />
          </label>
          <label className="field">
            <span>{t('creation.enlisted')}</span>
            <input value={localizeProfileValue(profile.enlisted, language)} maxLength={32} onChange={(event) => update('enlisted', event.target.value)} />
          </label>
          <label className="field">
            <span>{t('creation.seed')}</span>
            <input type="number" value={seed} onChange={(event) => setSeed(Number(event.target.value))} />
            <small>{t('creation.seedHelp')}</small>
          </label>
          <div className="form-actions field-wide">
            <button className="button button-ghost dark" type="button" onClick={randomise}>{t('creation.generate')}</button>
            <button className="button button-primary dark" type="submit" disabled={!valid}>{t('creation.report')}</button>
          </div>
        </form>
        <footer className="file-footer">{t('creation.factNote')}</footer>
      </section>
    </main>
  );
}
