export type TrendItem = {
  id: string;
  title: string;
  niche: string;
  source: string; // provider id
  score: number; // 0-100 combined score
  searchGrowth90d: number; // %
  competition: 'low' | 'medium' | 'high';
  avgPrice: number; // EUR
  wowClicks: number; // weekly click change
  tags: string[];
};
