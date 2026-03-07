import { NextResponse } from 'next/server';
import { z } from 'zod';
import { MOCK_DATA } from '@/lib/mock';
import { TrendItem } from '@/lib/types';

const schema = z.object({
  q: z.string().optional().default('pet fountain'),
  geo: z.string().optional().default('IT'),
});

// Meta Ad Library API
// Docs: https://www.facebook.com/ads/library/api/
const FB_API_BASE = 'https://graph.facebook.com/v19.0/ads_archive';

function computeScore(ad: any, idx: number): number {
  // Heuristic score based on position + presence of spend data
  return Math.max(50, Math.min(95, 85 - idx * 4));
}

function guessCompetition(idx: number): TrendItem['competition'] {
  if (idx < 3) return 'high';
  if (idx < 7) return 'medium';
  return 'low';
}

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const parsed = schema.parse({
    q: searchParams.get('q') ?? undefined,
    geo: searchParams.get('geo') ?? undefined,
  });

  const accessToken = process.env.FACEBOOK_ADS_ACCESS_TOKEN;
  if (!accessToken) {
    const items = MOCK_DATA.filter(x => x.source === 'facebook_ads');
    return NextResponse.json({ provider: 'facebook_ads', items, note: 'fallback-mock' });
  }

  try {
    const params = new URLSearchParams({
      access_token: accessToken,
      ad_type: 'ALL',
      ad_reached_countries: JSON.stringify([parsed.geo]),
      search_terms: parsed.q,
      fields: 'id,ad_creative_bodies,ad_creative_link_titles,page_name,spend,impressions,ad_delivery_start_time',
      limit: '10',
    });

    const res = await fetch(`${FB_API_BASE}?${params.toString()}`, { cache: 'no-store' });
    if (!res.ok) throw new Error(`Meta API error: ${res.status}`);
    const data = await res.json();

    const ads: any[] = data?.data ?? [];
    if (!ads.length) throw new Error('No ads found');

    const items: TrendItem[] = ads.slice(0, 8).map((ad, idx) => {
      const title =
        ad?.ad_creative_link_titles?.[0] ||
        ad?.ad_creative_bodies?.[0]?.slice(0, 60) ||
        `Facebook Ad — ${ad?.page_name ?? 'Sponsor'}`;

      const spendLower = Number(ad?.spend?.lower_bound ?? 0);
      const impressionsLower = Number(ad?.impressions?.lower_bound ?? 0);
      const growth = spendLower > 1000 ? 80 : spendLower > 100 ? 50 : 30;

      return {
        id: 'fb-' + ad.id,
        title,
        niche: 'Facebook Ads',
        source: 'facebook_ads',
        score: computeScore(ad, idx),
        searchGrowth90d: growth + idx * 5,
        competition: guessCompetition(idx),
        avgPrice: 29.9,
        wowClicks: Math.round(impressionsLower / 1000) || (8 - idx) * 4,
        tags: ['facebook-ad', 'paid-traffic', 'risolve un problema'],
      };
    });

    return NextResponse.json({ provider: 'facebook_ads', items });
  } catch (e) {
    const items = MOCK_DATA.filter(x => x.source === 'facebook_ads');
    return NextResponse.json({ provider: 'facebook_ads', items, note: 'fallback-mock' }, { status: 200 });
  }
}
