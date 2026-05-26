'use client';

import { useState, useEffect } from 'react';

// --- Theme (JM Bariani) ---
const T = {
  bg: 'bg-[#0a0f1a]',
  card: 'bg-[#111827] border border-[#1e293b]',
  card2: 'bg-[#1e293b]',
  text: 'text-gray-100',
  muted: 'text-gray-400',
  accent: 'text-amber-400',
  accentBg: 'bg-amber-400',
  accentDim: 'bg-amber-400/20',
  green: 'bg-emerald-500',
  red: 'bg-rose-500',
  blue: 'bg-sky-500',
};

// --- Helpers ---
function fmt(n: number) { return n.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 }); }
function barW(v: number, max: number) { return max > 0 ? (v / max) * 100 : 0; }

// --- Skeleton loader ---
function Skeleton({ h = 'h-4', w = 'w-full' }: { h?: string; w?: string }) {
  return <div className={`${h} ${w} ${T.card2} rounded animate-pulse`} />;
}

// --- Mini bar chart (div-based) ---
function MiniBar({ val, max, color }: { val: number; max: number; color: string }) {
  return (
    <div className={`h-2 w-full ${T.card2} rounded-full overflow-hidden`}>
      <div className={`h-full ${color} rounded-full transition-all duration-500`} style={{ width: `${barW(val, max)}%` }} />
    </div>
  );
}

// --- Main Component ---
export default function AnalyticsPage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch('/api/analytics')
      .then((r) => r.ok ? r.json() : Promise.reject('Failed to load'))
      .then((d) => { setData(d); setLoading(false); })
      .catch((e) => { setError(e?.message || String(e)); setLoading(false); });
  }, []);

  if (loading) return <LoadingSkeleton />;
  if (error) return <ErrorState msg={error} />;
  if (!data) return null;

  const { heatmap, weekComparison, topItems, outletComparison } = data;
  const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  return (
    <div className={`min-h-screen ${T.bg} ${T.text} p-4 md:p-6 space-y-6`}>
      <h1 className="text-2xl font-bold tracking-tight">Analytics Dashboard</h1>

      {/* Row 1: Sales Heatmap + Week Comparison */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* --- Sales Heatmap --- */}
        <div className={`${T.card} rounded-xl p-5`}>
          <h2 className="text-lg font-semibold mb-4">Sales Heatmap <span className={T.muted + ' text-sm font-normal'}>(last 7 days)</span></h2>
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr>
                  <th className="p-1 text-left font-medium" />
                  {Array.from({ length: 7 }, (_, d) => (
                    <th key={d} className={`p-1 text-center font-medium ${T.muted}`}>{days[(new Date().getDay() - 6 + d + 7) % 7].slice(0, 3)}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {[9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22].map((hour) => (
                  <tr key={hour}>
                    <td className={`p-1 pr-2 text-right ${T.muted} w-8`}>{hour > 12 ? (hour - 12) + 'p' : hour + 'a'}</td>
                    {Array.from({ length: 7 }, (_, d) => {
                      const val = heatmap?.[d]?.[hour] ?? 0;
                      const intensity = Math.min(val / 5000, 1);
                      return (
                        <td key={d} className="p-0.5">
                          <div
                            className="h-6 w-full rounded transition-colors cursor-default"
                            style={{ backgroundColor: `rgba(251,191,36,${Math.max(intensity, 0.06)})` }}
                            title={`${days[(new Date().getDay() - 6 + d + 7) % 7]} ${hour}:00 — $${fmt(val)}`}
                          />
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="flex items-center gap-2 mt-3 text-xs ${T.muted}">
            <span>Low</span>
            {[0.06, 0.2, 0.4, 0.6, 0.8, 1].map((v) => (
              <div key={v} className="h-3 w-6 rounded" style={{ backgroundColor: `rgba(251,191,36,${v})` }} />
            ))}
            <span>High</span>
          </div>
        </div>

        {/* --- Week Comparison --- */}
        <div className={`${T.card} rounded-xl p-5`}>
          <h2 className="text-lg font-semibold mb-4">Week Comparison</h2>
          {(!weekComparison || weekComparison.length === 0) ? (
            <p className={T.muted}>No data</p>
          ) : (
            <div className="space-y-4">
              {weekComparison.map((w: any, i: number) => {
                const maxVal = Math.max(...weekComparison.map((x: any) => Math.max(x.current || 0, x.previous || 0)));
                return (
                  <div key={i}>
                    <div className="flex justify-between text-sm mb-1">
                      <span>{w.label || `Week ${i + 1}`}</span>
                      <span className={T.muted}>${fmt(w.current)} vs ${fmt(w.previous)}</span>
                    </div>
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 text-xs">
                        <span className={`w-2 h-2 rounded-full ${T.accentBg}`} />
                        <span className={T.accent}>This Wk</span>
                        <MiniBar val={w.current} max={maxVal} color={T.accentBg} />
                      </div>
                      <div className="flex items-center gap-2 text-xs">
                        <span className={`w-2 h-2 rounded-full ${T.blue}`} />
                        <span className="text-sky-400">Last Wk</span>
                        <MiniBar val={w.previous} max={maxVal} color={T.blue} />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Row 2: Top Items + Outlet Comparison */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* --- Top Items --- */}
        <div className={`${T.card} rounded-xl p-5`}>
          <h2 className="text-lg font-semibold mb-4">Top Items <span className={T.muted + ' text-sm font-normal'}>(by revenue)</span></h2>
          {(!topItems || topItems.length === 0) ? (
            <p className={T.muted}>No data</p>
          ) : (
            <div className="space-y-3">
              {topItems.map((item: any, i: number) => {
                const maxRev = Math.max(...topItems.map((x: any) => x.revenue || 0));
                return (
                  <div key={i} className="flex items-center gap-3">
                    <span className={`w-6 text-center text-sm font-bold ${i < 3 ? T.accent : T.muted}`}>#{i + 1}</span>
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between text-sm">
                        <span className="truncate">{item.name}</span>
                        <span>${fmt(item.revenue)}</span>
                      </div>
                      <MiniBar val={item.revenue} max={maxRev} color={T.accentBg} />
                    </div>
                    <span className={`text-xs px-2 py-0.5 rounded-full ${item.growth >= 0 ? 'bg-emerald-500/20 text-emerald-400' : 'bg-rose-500/20 text-rose-400'}`}>
                      {item.growth >= 0 ? '+' : ''}{item.growth}%
                    </span>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* --- Outlet Comparison --- */}
        <div className={`${T.card} rounded-xl p-5`}>
          <h2 className="text-lg font-semibold mb-4">Outlet Comparison</h2>
          {(!outletComparison || outletComparison.length === 0) ? (
            <p className={T.muted}>No data</p>
          ) : (
            <div className="space-y-4">
              {outletComparison.map((o: any, i: number) => {
                const maxSales = Math.max(...outletComparison.map((x: any) => x.sales || 0));
                const pct = maxSales > 0 ? ((o.sales / maxSales) * 100) : 0;
                return (
                  <div key={i}>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="font-medium">{o.name}</span>
                      <span className={T.muted}>${fmt(o.sales)}</span>
                    </div>
                    <div className={`h-4 w-full ${T.card2} rounded-full overflow-hidden`}>
                      <div
                        className={`h-full rounded-full transition-all duration-700 ${o.sales === maxSales ? T.accentBg : T.accentDim}`}
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                    <div className="flex justify-between text-xs ${T.muted} mt-0.5">
                      <span>{o.orders || 0} orders</span>
                      <span>${fmt(o.avgOrder || 0)} avg</span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// --- Sub-components ---
function LoadingSkeleton() {
  return (
    <div className={`min-h-screen ${T.bg} p-4 md:p-6 space-y-6`}>
      <Skeleton h="h-8" w="w-64" />
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className={`${T.card} rounded-xl p-5 space-y-3`}>
          <Skeleton h="h-6" w="w-40" />
          {Array.from({ length: 10 }, (_, i) => <Skeleton key={i} h="h-5" w="w-full" />)}
        </div>
        <div className={`${T.card} rounded-xl p-5 space-y-3`}>
          <Skeleton h="h-6" w="w-40" />
          {Array.from({ length: 5 }, (_, i) => <Skeleton key={i} h="h-12" w="w-full" />)}
        </div>
      </div>
    </div>
  );
}

function ErrorState({ msg }: { msg: string }) {
  return (
    <div className={`min-h-screen ${T.bg} flex items-center justify-center p-6`}>
      <div className={`${T.card} rounded-xl p-8 max-w-md text-center`}>
        <div className="text-4xl mb-4">⚠️</div>
        <h2 className="text-xl font-semibold mb-2">Something went wrong</h2>
        <p className={T.muted}>{msg}</p>
        <button
          onClick={() => window.location.reload()}
          className="mt-6 px-5 py-2 bg-amber-500 hover:bg-amber-400 text-black font-medium rounded-lg transition-colors"
        >
          Retry
        </button>
      </div>
    </div>
  );
}
