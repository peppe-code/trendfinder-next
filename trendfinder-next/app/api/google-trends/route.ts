import { NextResponse } from 'next/server';
import googleTrends from 'google-trends-api';
import { z } from 'zod';
import { MOCK_DATA } from '@/lib/mock';
import { TrendItem } from '@/lib/types';

const schema = z.object({
  q: z.string().optional().default('pet fountain'),
  geo: z.string().optional().default('IT')
});

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const parsed = schema.parse({
    q: searchParams.get('q') ?? undefined,
    geo: searchParams.get('geo') ?? undefined,
  });

  try {
    const now = Date.now();
    const startTime = new Date(now - 1000 * 60 * 60 * 24 * 90); // last 90 days

    const interest = await googleTrends.interestOverTime({
      keyword: parsed.q,
      startTime,
      geo: parsed.geo
    });

    // Basic proxy for growth: compare last week avg vs first week avg
    const points = JSON.parse(interest).default.timelineData as Array<{ formattedAxisTime: string; value: number[] }>;
    if (!points?.length) throw new Error('No data');

    const n = points.length;
    const headAvg = points.slice(0, Math.max(1, Math.floor(n*0.15))).reduce((a,p)=>a+p.value[0],0) / Math.max(1, Math.floor(n*0.15));
    const tailAvg = points.slice(Math.max(0, n - Math.floor(n*0.15))).reduce((a,p)=>a+p.value[0],0) / Math.max(1, Math.floor(n*0.15));
    const growth = headAvg === 0 ? (tailAvg>0?100:0) : Math.round(((tailAvg - headAvg) / max(headAvg,1)) * 100);

    function max(a:number,b:number){ return a>b?a:b; }

    const items: TrendItem[] = [
      {
        id: 'gt-' + Buffer.from(parsed.q).toString('base64').slice(0,6),
        title: parsed.q + ' (trend)',
        niche: 'Mixed',
        source: 'google_trends',
        score: Math.min(95, Math.max(60, tailAvg)),
        searchGrowth90d: Math.max(-100, Math.min(200, growth)),
        competition: 'medium',
        avgPrice: 29.9,
        wowClicks: Math.round((tailAvg - headAvg) / 2),
        tags: ['trend','proxy','risolve un problema']
      }
    ];

    return NextResponse.json({ provider: 'google_trends', items });
  } catch (e) {
    // Fallback mock if quota/error
    const items = MOCK_DATA.filter(x => x.source === 'google_trends');
    return NextResponse.json({ provider: 'google_trends', items, note: 'fallback-mock' }, { status: 200 });
  }
}
