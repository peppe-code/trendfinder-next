import { TrendItem } from './types';

export const MOCK_DATA: TrendItem[] = [
  {
    id: 'pf-001',
    title: "Fontana d'acqua smart per gatti (UV + filtro)",
    niche: 'Pet',
    source: 'google_trends',
    score: 87,
    searchGrowth90d: 146,
    competition: 'medium',
    avgPrice: 39.9,
    wowClicks: 22,
    tags: ['risolve un problema','acqua sempre fresca','pet']
  },
  {
    id: 'hk-002',
    title: 'Organizzatore lavello 2 livelli (no-drill)',
    niche: 'Home & Kitchen',
    source: 'amazon_bs',
    score: 82,
    searchGrowth90d: 91,
    competition: 'high',
    avgPrice: 24.9,
    wowClicks: 12,
    tags: ['ordine','salvaspazio','cucina']
  },
  {
    id: 'bt-003',
    title: 'Spazzola autopulente per peli animali',
    niche: 'Pet',
    source: 'tiktok_hashtags',
    score: 79,
    searchGrowth90d: 132,
    competition: 'low',
    avgPrice: 18.9,
    wowClicks: 35,
    tags: ['hair remover','virale','pet']
  },
  {
    id: 'bd-004',
    title: 'Rullo viso EMS portatile (anti-gonfiore)',
    niche: 'Beauty',
    source: 'etsy_trends',
    score: 76,
    searchGrowth90d: 68,
    competition: 'medium',
    avgPrice: 34.0,
    wowClicks: 9,
    tags: ['skincare','ems','massager']
  },
  {
    id: 'tr-005',
    title: 'Mini aspirabriciole ricaricabile (auto & casa)',
    niche: 'Home & Tools',
    source: 'aliexpress',
    score: 73,
    searchGrowth90d: 58,
    competition: 'medium',
    avgPrice: 22.0,
    wowClicks: 7,
    tags: ['pulizia','portatile','usb-c']
  },
  // ── Facebook Ads mock ──────────────────────────────────────────────────────
  {
    id: 'fb-001',
    title: 'Cuscino lombare ergonomico con massaggio (USB)',
    niche: 'Health & Wellness',
    source: 'facebook_ads',
    score: 85,
    searchGrowth90d: 112,
    competition: 'medium',
    avgPrice: 45.0,
    wowClicks: 28,
    tags: ['facebook-ad','paid-traffic','risolve un problema','postura','ufficio']
  },
  {
    id: 'fb-002',
    title: 'Depilatore luce pulsata (IPL) uso domestico',
    niche: 'Beauty',
    source: 'facebook_ads',
    score: 81,
    searchGrowth90d: 98,
    competition: 'high',
    avgPrice: 79.0,
    wowClicks: 19,
    tags: ['facebook-ad','paid-traffic','beauty','risolve un problema']
  },
  {
    id: 'fb-003',
    title: 'Tappetino agopressione schiena + cuscino kit',
    niche: 'Health & Wellness',
    source: 'facebook_ads',
    score: 77,
    searchGrowth90d: 74,
    competition: 'low',
    avgPrice: 32.0,
    wowClicks: 14,
    tags: ['facebook-ad','paid-traffic','risolve un problema','relax']
  },
];
