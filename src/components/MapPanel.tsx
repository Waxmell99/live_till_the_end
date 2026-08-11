import { currentCampaign } from '../game/engine';
import type { GameState } from '../game/types';
import { useLanguage } from '../i18n';
import { localizeLocation, localizeProfileValue } from '../i18n/content';

interface MapPanelProps {
  state: GameState;
}

export function MapPanel({ state }: MapPanelProps) {
  const { language, t } = useLanguage();
  const campaign = currentCampaign(state);
  const location = localizeLocation(state.location, language);
  // const start = Date.parse('1917-02-01T00:00:00.000Z');
  // const end = Date.parse('1918-11-11T11:00:00.000Z');
  // const progress = Math.max(0, Math.min(1, (Date.parse(state.currentDate) - start) / (end - start)));
  // const markerX = 28 + progress * 160;

  return (
    <section className="map-card" aria-label={t('map.aria', { location })}>
      <div className="map-heading"><span>{t('map.front')}</span><b>{t('map.sketch')}</b></div>
      <svg viewBox="0 0 240 126" role="img" aria-label={t('map.aria', { location })}>
        <path className="map-river" d="M18 18 C55 34 46 62 80 71 S132 62 145 94 S190 112 225 102" />
        <path className="map-front-shadow" d="M46 7 C62 22 51 38 70 48 S77 75 99 84 S104 111 121 121" />
        <path className="map-front" d="M46 7 C62 22 51 38 70 48 S77 75 99 84 S104 111 121 121" />
        <path className="map-road" d="M11 104 L51 83 L91 65 L134 46 L218 25" />
        <circle className="map-city" cx="68" cy="48" r="2.8" /><text x="74" y="46">{language === 'zh' ? '伊普尔' : 'YPRES'}</text>
        <circle className="map-city" cx="91" cy="78" r="2.8" /><text x="98" y="77">{language === 'zh' ? '阿拉斯' : 'ARRAS'}</text>
        <circle className="map-city" cx="112" cy="103" r="2.8" /><text x="120" y="106">{language === 'zh' ? '索姆河' : 'SOMME'}</text>
        {/* <circle className="map-progress" cx={markerX} cy="116" r="3.5" /> */}
        {/* <line className="map-timeline" x1="28" y1="116" x2="188" y2="116" /> */}
      </svg>
      <p className="map-location"><span>{t('map.position')}</span><strong>{location}</strong></p>
      <p className="map-campaign">{campaign?.campaign ? localizeProfileValue(campaign.campaign, language) : t('map.routine')}</p>
    </section>
  );
}
