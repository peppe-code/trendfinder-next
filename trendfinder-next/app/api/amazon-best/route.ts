import { NextResponse } from 'next/server';
import { z } from 'zod';
import { MOCK_DATA } from '@/lib/mock';
import { TrendItem } from '@/lib/types';

const schema = z.object({
  category: z.string().optional().default('Pet Supplies'),
  country: z.string().optional().default('it')
});

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const parsed = schema.parse({
    category: searchParams.get('category') ?? undefined,
    country: searchParams.get('country') ?? undefined,
  });

  const apiKey = process.env.SERPAPI_API_KEY;
  if (!apiKey) {
    const items = MOCK_DATA.filter(x => x.source === 'amazon_bs');
    return NextResponse.json({ provider: 'amazon_bs', items, note: 'fallback-mock' });
  }

  try {
    const params = new URLSearchParams({
      engine: 'amazon_bestsellers',
      category: parsed.category,
      country: parsed.country,
      api_key: apiKey
    });
    const url = `https://serpapi.com/search.json?${params.toString()}`;
    const res = await fetch(url, { cache: 'no-store' });
    if (!res.ok) throw new Error('SerpAPI failed');
    const data = await res.json();

    const items: TrendItem[] = (data?.bestsellers_results ?? []).slice(0, 8).map((p: any, idx: number) => ({
      id: 'am-' + (p?.asin ?? idx),
      title: p?.title ?? 'Amazon bestseller',
      niche: 'Amazon',
      source: 'amazon_bs',
      score: 70 + Math.min(25, (8-idx)*3),
      searchGrowth90d: 40 + idx * 5,
      competition: idx < 3 ? 'high' : (idx < 6 ? 'medium' : 'low'),
      avgPrice: Number(String(p?.price?.raw ?? '29.90').replace(/[^\d.,]/g,'' ).replace(',','.')) || 29.9,
      wowClicks: 5 + (8-idx)*2,
      tags: ['bestseller','social-proof']
    }));

    return NextResponse.json({ provider: 'amazon_bs', items });
  } catch (e) {
    const items = MOCK_DATA.filter(x => x.source === 'amazon_bs');
    return NextResponse.json({ provider: 'amazon_bs', items, note: 'fallback-mock' }, { status: 200 });
  }
}
