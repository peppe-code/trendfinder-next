'use client';
import React, { useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { TrendItem } from '@/lib/types';
import { createClient } from '@supabase/supabase-js';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
const supabase = (supabaseUrl && supabaseAnon) ? createClient(supabaseUrl, supabaseAnon) : null;

const formatEUR = (n: number) => new Intl.NumberFormat('it-IT', { style: 'currency', currency: 'EUR' }).format(n);
const compClass = (c: TrendItem['competition']) => ({ low:'bg-green-100 text-green-700', medium:'bg-amber-100 text-amber-700', high:'bg-red-100 text-red-700' }[c]);

export default function TrendFinderApp() {
  const [query, setQuery] = useState('pet fountain');
  const [geo, setGeo] = useState('IT');
  const [category, setCategory] = useState('Pet Supplies');
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<TrendItem[]>([]);
  const [minGrowth, setMinGrowth] = useState(30);
  const [maxPrice, setMaxPrice] = useState(80);
  const [onlyProblemSolvers, setOnlyProblemSolvers] = useState(true);

  const filtered = useMemo(() => {
    return results
      .filter(i => i.searchGrowth90d >= minGrowth)
      .filter(i => i.avgPrice <= maxPrice)
      .filter(i => !onlyProblemSolvers || i.tags.includes('risolve un problema'))
      .sort((a,b) => b.score - a.score);
  }, [results, minGrowth, maxPrice, onlyProblemSolvers]);

  const growthData = useMemo(() => filtered.map(i => ({ name: i.title.slice(0, 16) + (i.title.length>16?'…':''), growth: i.searchGrowth90d })), [filtered]);

  async function runScan() {
    setLoading(true);
    try {
      const [gt, am] = await Promise.all([
        fetch(`/api/google-trends?q=${encodeURIComponent(query)}&geo=${geo}`).then(r=>r.json()),
        fetch(`/api/amazon-best?category=${encodeURIComponent(category)}&country=${geo.toLowerCase()}`).then(r=>r.json()),
      ]);
      const merged: TrendItem[] = [...(gt?.items||[]), ...(am?.items||[])];
      setResults(merged);

      if (supabase) {
        await supabase.from('trend_scans').insert({ query, geo, results: merged });
      }
    } finally {
      setLoading(false);
    }
  }

  useEffect(()=>{ runScan(); /* initial */ }, []);

  function copyJSON() {
    navigator.clipboard.writeText(JSON.stringify(filtered, null, 2));
  }

  function exportCSV() {
    const headers = ['id','title','niche','source','score','searchGrowth90d','competition','avgPrice','wowClicks','tags'];
    const lines = [headers.join(',')].concat(filtered.map(i => [
      i.id, i.title.replace(/,/g,' '), i.niche, i.source, i.score, i.searchGrowth90d, i.competition, i.avgPrice, i.wowClicks, i.tags.join('|')
    ].join(',')));
    const blob = new Blob([lines.join('\n')], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'trendfinder_export.csv';
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="min-h-screen w-full bg-gradient-to-b from-white to-slate-50 p-4 md:p-8">
      <div className="mx-auto max-w-6xl">
        <motion.h1 initial={{opacity:0,y:-8}} animate={{opacity:1,y:0}} transition={{duration:0.4}} className="text-2xl md:text-4xl font-semibold tracking-tight">
          TrendFinder <span className="text-slate-400">— Ricerca prodotti in trend</span>
        </motion.h1>

        <p className="text-slate-500 mt-2">Google Trends + Amazon Best Sellers. Export CSV. (Supabase opzionale)</p>

        <div className="mt-4 grid grid-cols-1 md:grid-cols-5 gap-3 items-end">
          <div className="md:col-span-2">
            <label className="text-sm text-slate-500">Parola chiave (Google Trends)</label>
            <input className="w-full border rounded p-2" placeholder="es. pet fountain" value={query} onChange={e=>setQuery(e.target.value)} />
          </div>
          <div>
            <label className="text-sm text-slate-500">Paese</label>
            <select className="w-full border rounded p-2" value={geo} onChange={e=>setGeo(e.target.value)}>
              {['IT','US','UK','DE','FR','ES','NL'].map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
          <div>
            <label className="text-sm text-slate-500">Categoria Amazon</label>
            <select className="w-full border rounded p-2" value={category} onChange={e=>setCategory(e.target.value)}>
              {['Pet Supplies','Home & Kitchen','Beauty','Tools & Home Improvement','Health & Household'].map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
          <div className="md:col-span-1 flex gap-2">
            <button onClick={runScan} disabled={loading} className="w-full border rounded p-2">{loading? 'Scansione...' : 'Scansiona'}</button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
          <div>
            <div className="flex justify-between text-sm text-slate-600 mb-2"><span>Min crescita 90 giorni</span><span>{minGrowth}%</span></div>
            <input type="range" min={0} max={200} value={minGrowth} onChange={e=>setMinGrowth(parseInt(e.target.value))} className="w-full" />
          </div>
          <div>
            <div className="flex justify-between text-sm text-slate-600 mb-2"><span>Prezzo medio max</span><span>{formatEUR(maxPrice)}</span></div>
            <input type="range" min={5} max={150} value={maxPrice} onChange={e=>setMaxPrice(parseInt(e.target.value))} className="w-full" />
          </div>
          <div className="flex items-center gap-3 mt-4 md:mt-0">
            <input id="prob" type="checkbox" className="h-4 w-4" checked={onlyProblemSolvers} onChange={e=>setOnlyProblemSolvers(e.target.checked)} />
            <label htmlFor="prob" className="text-sm text-slate-700">Mostra solo prodotti che <b>risolvono un problema</b></label>

          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-4 mt-6">
          <div className="lg:col-span-3 order-2 lg:order-1 border rounded p-4 bg-white">
            <div className="flex items-center gap-2 mb-4">
              <h2 className="text-lg font-semibold">Prodotti suggeriti ({filtered.length})</h2>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full text-sm">
                <thead>
                  <tr className="text-left text-slate-500 border-b">
                    <th className="py-2 pr-3">Prodotto</th>
                    <th className="py-2 pr-3">Niche</th>
                    <th className="py-2 pr-3">Score</th>
                    <th className="py-2 pr-3">Crescita 90g</th>
                    <th className="py-2 pr-3">Competizione</th>
                    <th className="py-2 pr-3">Prezzo medio</th>
                    <th className="py-2">Tags</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map(item => (
                    <tr key={item.id} className="border-b last:border-b-0">
                      <td className="py-2 pr-3 font-medium">{item.title}</td>
                      <td className="py-2 pr-3">{item.niche}</td>
                      <td className="py-2 pr-3">{item.score}</td>
                      <td className="py-2 pr-3">+{item.searchGrowth90d}%</td>
                      <td className="py-2 pr-3"><span className={`px-2 py-1 rounded text-xs ${compClass(item.competition)}`}>{item.competition}</span></td>
                      <td className="py-2 pr-3">{formatEUR(item.avgPrice)}</td>
                      <td className="py-2">
                        <div className="flex flex-wrap gap-1">
                          {item.tags.map(t => <span key={t} className="px-2 py-1 rounded border text-xs">{t}</span>)}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="lg:col-span-2 order-1 lg:order-2 border rounded p-4 bg-white">
            <h2 className="text-lg font-semibold mb-4">Crescita ricerche (proxy)</h2>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={growthData}>
                  <XAxis dataKey="name" interval={0} tick={{ fontSize: 10 }} angle={-20} textAnchor="end" height={60} />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="growth" />
                </BarChart>
              </ResponsiveContainer>
            </div>
            <div className="mt-6 flex gap-2">
              <button onClick={exportCSV} className="w-full border rounded p-2">Export CSV</button>
              <button onClick={copyJSON} className="w-full border rounded p-2">Copia JSON</button>
            </div>
            <p className="text-xs text-slate-500 mt-3">Se non imposti le chiavi, le API usano mock di fallback.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
