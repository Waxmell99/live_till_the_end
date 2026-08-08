import { useLanguage } from '../i18n';

export function LanguageSwitcher({ compact = false }: { compact?: boolean }) {
  const { language, setLanguage, t } = useLanguage();
  return (
    <div className={`language-switcher ${compact ? 'language-compact' : ''}`} role="group" aria-label={t('language.label')}>
      <button type="button" className={language === 'en' ? 'active' : ''} onClick={() => setLanguage('en')} aria-pressed={language === 'en'}>{t('language.english')}</button>
      <span aria-hidden="true">/</span>
      <button type="button" className={language === 'zh' ? 'active' : ''} onClick={() => setLanguage('zh')} aria-pressed={language === 'zh'}>{t('language.chinese')}</button>
    </div>
  );
}
