'use client';

import { useState, useEffect } from 'react';

const T = {
  bg: 'bg-[#0a0f1a]', card: 'bg-[#111827] border border-[#1e293b]',
  card2: 'bg-[#1e293b]', text: 'text-gray-100', muted: 'text-gray-400',
  accent: 'text-amber-400', accentBg: 'bg-amber-400', accentDim: 'bg-amber-400/20',
  blue: 'bg-sky-500', green: 'bg-emerald-500', red: 'bg-rose-500',
};

function fmt(n: number) { return n.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }); }

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

  if (loading) return <div className="min-h-screen bg-[#0a0f1a] p-6"><p className="text-gray-400">Loading analytics...</p></div>;
  if (error) return <div className="min-h-screen bg-[#0a0f1a] p-6"><p className="text-rose-400">Error: {error}</p></div>;
  if (!data) return null;

  const { heatmap, maxHeat, weekComparison, topItems, outletComparison, thisWeekRevenue, lastWeekRevenue, totalOrders } = data;
  const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const hours = [9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22];

  return (
    <div className="min-h-screen bg-[#0a0f1a] text-gray-100 p-4 md:p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">📊 Analytics Dashboard</h1>
        <div className="text-xs text-gray-400">2-week data • {totalOrders} orders</div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-[#111827] border border-[#1e293b] rounded-xl p-4">
          <p className="text-xs text-gray-400">This Week</p>
          <p className="text-xl font-bold text-amber-400">RM {fmt(thisWeekRevenue || 0)}</p>
        </div>
        <div className="bg-[#111827] border border-[#1e293b] rounded-xl p-4">
          <p className="text-xs text-gray-400">Last Week</p>
          <p className="text-xl font-bold text-sky-400">RM {fmt(lastWeekRevenue || 0)}</p>
        </div>
        <div className="bg-[#111827] border border-[#1e293b] rounded-xl p-4">
          <p className="text-xs text-gray-400">Change</p>
          <p className={`text-xl font-bold ${(thisWeekRevenue || 0) >= (lastWeekRevenue || 0) ? 'text-emerald-400' : 'text-rose-400'}`}>
            {lastWeekRevenue > 0 ? `${((((thisWeekRevenue || 0) - lastWeekRevenue) / lastWeekRevenue) * 100).toFixed(1)}%` : 'N/A'}
          </p>
        </div>
        <div className="bg-[#111827] border border-[#1e293b] rounded-xl p-4">
          <p className="text-xs text-gray-400">Total Orders</p>
          <p className="text-xl font-bold">{totalOrders || 0}</p>
        </div>
      </div>

      {/* Row 1: Heatmap + Week Comparison */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Heatmap */}
        <div className="bg-[#111827] border border-[#1e293b] rounded-xl p-5">
          <h2 className="text-lg font-semibold mb-4">Sales Heatmap <span className="text-gray-400 text-sm font-normal">(hour × day)</span></h2>
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr>
                  <th className="p-1 w-8"></th>
                  {days.map(d => <th key={d} className="p-1 text-center font-medium text-gray-400">{d}</th>)}
                </tr>
              </thead>
              <tbody>
                {hours.map((hour) => (
                  <tr key={hour}>
                    <td className="p-1 pr-2 text-right text-gray-400">{hour > 12 ? `${hour - 12}p` : `${hour}a`}</td>
                    {days.map((day) => {
                      const val = heatmap?.[day]?.[hour] || 0;
                      const intensity = maxHeat > 0 ? Math.min(val / maxHeat, 1) : 0.05;
                      return (
                        <td key={day} className="p-0.5">
                          <div className="h-6 w-full rounded cursor-default" title={`${day} ${hour}:00 — RM ${fmt(val)}`}
                            style={{ backgroundColor: `rgba(251,191,36,${Math.max(intensity, 0.06)})` }} />
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="flex items-center gap-2 mt-3 text-xs text-gray-400">
            <span>Low</span>
            {[0.06, 0.2, 0.4, 0.6, 0.8, 1].map(v => (
              <div key={v} className="h-3 w-6 rounded" style={{ backgroundColor: `rgba(251,191,36,${v})` }} />
            ))}
            <span>High</span>
          </div>
        </div>

        {/* Week Comparison */}
        <div className="bg-[#111827] border border-[#1e293b] rounded-xl p-5">
          <h2 className="text-lg font-semibold mb-4">Week-over-Week</h2>
          {(!weekComparison || weekComparison.length === 0) ? (
            <p className="text-gray-400">No data</p>
          ) : (
            <div className="space-y-4">
              {weekComparison.map((w: any, i: number) => {
                const maxVal = Math.max(...weekComparison.map((x: any) => Math.max(x.thisWeek || 0, x.lastWeek || 0)), 1);
                return (
                  <div key={i}>
                    <div className="flex justify-between text-sm mb-1">
                      <span>{w.day}</span>
                      <span className="text-gray-400">RM {fmt(w.thisWeek)} vs RM {fmt(w.lastWeek)}</span>
                    </div>
                    <div className="flex items-center gap-2 text-xs">
                      <span className="w-2 h-2 rounded-full bg-amber-400"></span>
                      <span className="text-amber-400 w-14">This Wk</span>
                      <div className="h-2 flex-1 bg-[#1e293b] rounded-full overflow-hidden">
                        <div className="h-full bg-amber-400 rounded-full" style={{ width: `${(w.thisWeek / maxVal) * 100}%` }} />
                      </div>
                    </div>
                    <div className="flex items-center gap-2 text-xs mt-1">
                      <span className="w-2 h-2 rounded-full bg-sky-500"></span>
                      <span className="text-sky-400 w-14">Last Wk</span>
                      <div className="h-2 flex-1 bg-[#1e293b] rounded-full overflow-hidden">
                        <div className="h-full bg-sky-500 rounded-full" style={{ width: `${(w.lastWeek / maxVal) * 100}%` }} />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Row 2: Top Items + Outlets */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Items */}
        <div className="bg-[#111827] border border-[#1e293b] rounded-xl p-5">
          <h2 className="text-lg font-semibold mb-4">🏆 Top Items</h2>
          {(!topItems || topItems.length === 0) ? (
            <p className="text-gray-400">No data</p>
          ) : (
            <div className="space-y-3">
              {topItems.map((item: any, i: number) => {
                const maxRev = Math.max(...topItems.map((x: any) => x.revenue || 0), 1);
                return (
                  <div key={i} className="flex items-center gap-3">
                    <span className={`w-6 text-center text-sm font-bold ${i < 3 ? 'text-amber-400' : 'text-gray-400'}`}>#{item.rank}</span>
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between text-sm">
                        <span className="truncate">{item.name}</span>
                        <span className="text-gray-400">RM {fmt(item.revenue)}</span>
                      </div>
                      <div className="h-1.5 bg-[#1e293b] rounded-full overflow-hidden">
                        <div className="h-full bg-amber-400 rounded-full" style={{ width: `${(item.revenue / maxRev) * 100}%` }} />
                      </div>
                    </div>
                    <span className="text-xs text-gray-400">{item.count}x</span>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Outlets */}
        <div className="bg-[#111827] border border-[#1e293b] rounded-xl p-5">
          <h2 className="text-lg font-semibold mb-4">🏪 Outlet Comparison</h2>
          {(!outletComparison || outletComparison.length === 0) ? (
            <p className="text-gray-400">No data</p>
          ) : (
            <div className="space-y-4">
              {outletComparison.map((o: any, i: number) => {
                const maxRevenue = Math.max(...outletComparison.map((x: any) => x.revenue || 0), 1);
                const pct = (o.revenue / maxRevenue) * 100;
                return (
                  <div key={i}>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="font-medium">{o.name}</span>
                      <span className="text-amber-400">RM {fmt(o.revenue)}</span>
                    </div>
                    <div className="h-4 bg-[#1e293b] rounded-full overflow-hidden">
                      <div className={`h-full rounded-full ${o.revenue === maxRevenue ? 'bg-amber-400' : 'bg-amber-400/20'}`} style={{ width: `${pct}%` }} />
                    </div>
                    <div className="flex justify-between text-xs text-gray-400 mt-0.5">
                      <span>{o.orders} orders</span>
                      <span>RM {fmt(o.avgOrder)} avg/order</span>
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
