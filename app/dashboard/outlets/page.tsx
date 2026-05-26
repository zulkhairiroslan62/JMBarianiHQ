'use client'

import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'

const T = {
  bg: (d: boolean) => d ? 'bg-[#0a0f1a]' : 'bg-[#f5f6f8]',
  card: (d: boolean) => d ? 'linear-gradient(180deg, #111827 0%, #0f172a 100%)' : 'linear-gradient(180deg, #fff 0%, #fcfcfc 100%)',
  bd: (d: boolean) => d ? '1px solid rgba(255,255,255,0.06)' : '1px solid rgba(255,255,255,0.7)',
  sh: (d: boolean) => d ? '0 10px 30px rgba(0,0,0,0.3)' : '0 10px 30px rgba(0,0,0,0.06)',
  tc: (d: boolean) => d ? 'text-gray-100' : 'text-gray-900',
  mc: (d: boolean) => d ? 'text-gray-400' : 'text-gray-500',
}

export default function OutletsPage() {
  const [outlets, setOutlets] = useState<any[]>([])
  const [ov, setOv] = useState<any>(null)
  const [alerts, setAlerts] = useState<any[]>([])
  const [activity, setActivity] = useState<any[]>([])
  const [ranking, setRanking] = useState<any[]>([])
  const [loading, setLoading] = useState(true); const [search, setSearch] = useState('')
  const [dark, setDark] = useState(false); const [live, setLive] = useState(true)
  const [lastUpd, setLastUpd] = useState(''); const [qa, setQa] = useState<string|null>(null)
  const [af, setAf] = useState<'all'|'top'|'low'|'critical'>('all')
  const intRef = useRef<NodeJS.Timeout|null>(null)

  const fetchData = async () => {
    try {
      const r = await fetch('/api/outlets/dashboard'); const d = await r.json()
      if (d.outlets) setOutlets(d.outlets); if (d.overview) setOv(d.overview)
      if (d.alerts) setAlerts(d.alerts); if (d.activity) setActivity(d.activity)
      if (d.ranking) setRanking(d.ranking); setLastUpd(new Date().toLocaleTimeString())
    } catch {} finally { setLoading(false) }
  }
  useEffect(() => { fetchData(); if (live) intRef.current = setInterval(fetchData, 10000); return () => { if (intRef.current) clearInterval(intRef.current) } }, [live])

  const filtered = outlets.filter((o: any) =>
    o.name.toLowerCase().includes(search.toLowerCase())
  ).filter((o: any) => af === 'all' ? true : af === 'top' ? o.healthScore >= 80 : af === 'low' ? o.healthScore < 60 : o.healthScore < 50)

  const AlertColor = (t: string) => t === 'critical' ? { bg: 'rgba(239,68,68,0.1)', text: 'text-red-600', dot: '🔴' }
    : t === 'warning' ? { bg: 'rgba(234,179,8,0.1)', text: 'text-amber-600', dot: '⚠️' }
    : { bg: 'rgba(59,130,246,0.1)', text: 'text-blue-600', dot: 'ℹ️' }

  if (loading) return <div className={`min-h-screen ${T.bg(dark)} ${T.tc(dark)} p-8`}><p className={T.mc(dark)}>Loading command center...</p></div>

  return (
    <div className={`min-h-screen ${T.bg(dark)} ${T.tc(dark)} transition-colors duration-300`} style={{fontFamily:"'Inter',sans-serif"}}>
      <div className="max-w-[1600px] mx-auto p-8">
        {/* HEADER */}
        <div className="flex items-center justify-between mb-8 gap-4 flex-wrap">
          <div className="flex items-center gap-4">
            <h1 className="text-[2.2rem] font-extrabold tracking-[-0.03em]">Outlets</h1>
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl" style={{background:dark?'rgba(255,255,255,0.04)':'rgba(0,0,0,0.03)'}}>
              <span className={`w-2 h-2 rounded-full ${live?'bg-green-500 animate-pulse':'bg-gray-400'}`}/>
              <span className="text-[10px] font-semibold uppercase">{live?'Live':'Paused'}</span>
              <span className="text-[10px] text-gray-400">{lastUpd&&`${lastUpd}`}</span>
              <button onClick={()=>setLive(!live)} className="text-[10px] px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-400 font-medium">{live?'ON':'OFF'}</button>
              <button onClick={fetchData} className="text-xs text-amber-500 ml-1">↻</button>
            </div>
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            <button onClick={()=>setDark(!dark)} className="px-3 py-1.5 rounded-xl text-xs transition" style={{background:dark?'rgba(255,255,255,0.07)':'rgba(0,0,0,0.04)'}}>{dark?'☀️':'🌙'}</button>
            {['all','top','low','critical'].map(f=>(
              <button key={f} onClick={()=>setAf(f as any)} className={`px-3 py-1.5 rounded-xl text-xs font-semibold tracking-wide transition ${af===f?(dark?'bg-amber-500/20 text-amber-400':'bg-amber-100 text-amber-700'):''}`}
                style={{background:af===f?undefined:dark?'rgba(255,255,255,0.04)':'rgba(0,0,0,0.03)'}}>
                {f==='all'?'All':f==='top'?'🔥':f==='low'?'⚠':'🔴'}
              </button>
            ))}
            <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search..."
              className={`w-44 px-4 py-2 rounded-2xl text-sm outline-none border ${dark?'bg-[#1e293b] border-[#334155] placeholder:text-gray-500':'bg-white border-gray-100 placeholder:text-gray-400'}`}/>
            <button className="text-white px-5 py-2 rounded-2xl font-semibold shadow-lg transition-all duration-[250ms] hover:scale-[1.02]"
              style={{background:'linear-gradient(135deg,#a86a1c 0%,#d88a28 100%)'}}>+ Add</button>
          </div>
        </div>

        {/* KPI */}
        <div className="grid grid-cols-5 gap-4 mb-7">
          {[
            {l:'Revenue',v:`RM ${(ov?.totalRevenue||0).toLocaleString()}`,ic:'💰'},
            {l:'Orders',v:`${ov?.totalOrders||0}`,ic:'📦'},
            {l:'Best',v:ov?.bestOutlet||'-',ic:'🥇'},
            {l:'Fastest',v:ov?.fastestGrowth||'-',ic:'🚀'},
            {l:'Alerts',v:`${ov?.alerts||0}`,ic:'🔔'},
          ].map((c,i)=>(
            <div key={i} className="rounded-[20px] p-4 transition-all hover:-translate-y-0.5" style={{background:T.card(dark),border:T.bd(dark),boxShadow:T.sh(dark)}}>
              <p className={`${T.mc(dark)} text-xs uppercase tracking-wider font-medium`}>{c.l}</p>
              <p className="text-xl font-extrabold tracking-[-0.02em] mt-1.5">{c.v}</p>
            </div>
          ))}
        </div>

        {/* ALERTS */}
        {alerts.length>0&&<div className="mb-5 space-y-1.5">{alerts.slice(0,3).map((a,i)=>{
          const ac=AlertColor(a.type); return(
            <div key={i} className="rounded-2xl px-4 py-2.5 flex items-center gap-2.5 text-sm" style={{background:ac.bg}}>
              <span>{ac.dot}</span><span className={ac.text}>{a.message}</span>
            </div>)})}</div>}

        {/* RANKING + ACTIVITY */}
        <div className="grid grid-cols-5 gap-5 mb-7">
          <div className="col-span-2 rounded-[20px] p-5" style={{background:T.card(dark),border:T.bd(dark),boxShadow:T.sh(dark)}}>
            <h3 className="font-bold text-sm mb-3">🏆 Ranking</h3>
            <div className="space-y-2">{ranking.slice(0,4).map((r,i)=>(
              <div key={i} className="flex items-center gap-3">
                <span className={`w-6 h-6 rounded-lg flex items-center justify-center text-xs font-bold ${r.rank===1?'bg-amber-400 text-black':r.rank===2?'bg-gray-300 text-gray-700':r.rank===3?'bg-amber-700 text-white':'bg-gray-500/20 text-gray-400'}`}>{r.rank}</span>
                <span className="flex-1 text-sm font-medium">{r.name}</span>
                <span className={`text-sm font-bold ${r.score>=80?'text-green-500':r.score>=60?'text-amber-500':'text-red-500'}`}>{r.score}</span>
              </div>))}</div>
          </div>
          <div className="col-span-3 rounded-[20px] p-5" style={{background:T.card(dark),border:T.bd(dark),boxShadow:T.sh(dark)}}>
            <h3 className="font-bold text-sm mb-3 flex items-center gap-2"><span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"/>Live</h3>
            <div className="space-y-1.5 max-h-[140px] overflow-y-auto">{activity.slice(0,6).map((a,i)=>(
              <div key={i} className="flex items-center gap-3 text-xs py-1 border-b border-gray-500/10 last:border-0">
                <span className="text-gray-400 w-12 flex-shrink-0">{a.time}</span>
                <span className="text-green-500 font-semibold flex-shrink-0">{a.outlet}</span>
                <span className="text-gray-400 truncate">{a.item}</span>
                <span className="text-amber-500 font-semibold ml-auto">RM {a.amount}</span>
              </div>))}</div>
          </div>
        </div>

        {/* OUTLET CARDS */}
        <div className="grid grid-cols-2 gap-5">
          {filtered.map((o:any)=>{
            const maxS=Math.max(...o.sparkline,1); const hc=o.healthScore
            return(<div key={o.id} className="rounded-[20px] p-6 transition-all duration-[250ms] hover:-translate-y-1 relative"
              style={{background:T.card(dark),border:T.bd(dark),boxShadow:T.sh(dark)}}>
              {qa===o.id&&<div className="absolute top-4 right-14 z-10 rounded-2xl p-2 shadow-xl border min-w-[160px]" style={{background:dark?'#1e293b':'white',borderColor:dark?'#334155':'#e5e7eb'}} onClick={()=>setQa(null)}>
                {['Analytics','Inventory','Staff','Report'].map(a=><button key={a} className="w-full text-left px-3 py-2 text-xs rounded-xl hover:bg-gray-500/10">{a}</button>)}</div>}
              <div className="flex gap-4">
                <div className="w-36 h-32 rounded-[18px] overflow-hidden flex-shrink-0 shadow-lg transition-all hover:scale-[1.02]">
                  <img src={o.image} alt={o.name} className="w-full h-full object-cover transition-transform duration-[400ms] hover:scale-110"/></div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-2.5">
                      <div className="relative w-[38px] h-[38px] flex-shrink-0">
                        <svg className="w-full h-full -rotate-90" viewBox="0 0 38 38">
                          <circle cx="19" cy="19" r="15" fill="none" stroke={dark?'#334155':'#e5e7eb'} strokeWidth="3"/>
                          <circle cx="19" cy="19" r="15" fill="none" stroke={hc>=80?'#22c55e':hc>=60?'#eab308':'#ef4444'} strokeWidth="3" strokeLinecap="round"
                            strokeDasharray={`${2*Math.PI*15}`} strokeDashoffset={`${2*Math.PI*15*(1-hc/100)}`} className="transition-all duration-700"/>
                        </svg>
                        <div className="absolute inset-0 flex items-center justify-center"><span className="text-[9px] font-black">{hc}</span></div>
                      </div>
                      <div>
                        <h2 className="text-base font-bold">{o.name}</h2>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <svg width="70" height="24" className="opacity-50">
                        <polyline fill="none" stroke="#d88a28" strokeWidth="1.5"
                          points={o.sparkline.map((v:number,i:number)=>`${(i/6)*70},${24-(v/maxS)*18}`).join(' ')}/>
                      </svg>
                      <button onClick={()=>setQa(qa===o.id?null:o.id)} className="text-lg opacity-40 hover:opacity-100 transition">⋮</button>
                    </div>
                  </div>
                  {/* Metrics */}
                  <div className="grid grid-cols-4 gap-2 mt-3">
                    <div><p className={`${T.mc(dark)} text-[10px] uppercase tracking-wider`}>Revenue</p>
                      <p className="font-extrabold text-base">RM {o.todayRevenue.toLocaleString()}</p>
                      <p className={`text-[10px] font-semibold ${o.growth>=0?'text-green-500':'text-red-500'}`}>{o.growth>=0?'▲':'▼'} {Math.abs(o.growth)}%</p></div>
                    <div><p className={`${T.mc(dark)} text-[10px] uppercase tracking-wider`}>Orders</p><p className="font-extrabold text-base">{o.todayOrders}</p></div>
                    <div><p className={`${T.mc(dark)} text-[10px] uppercase tracking-wider`}>Stock</p><p className="font-extrabold text-base">{o.inventory}</p>
                      {o.lowStockItems?.length>0&&<p className="text-red-400 text-[10px] font-semibold">⚠ {o.lowStockItems.length} low</p>}</div>
                    <div><p className={`${T.mc(dark)} text-[10px] uppercase tracking-wider`}>Staff</p><p className="font-extrabold text-base">{o.staff}</p></div>
                  </div>
                  {/* Progress */}
                  <div className="mt-2.5">
                    <div className="flex justify-between text-[11px] mb-1"><span className={T.mc(dark)}>Target RM {o.dailyTarget.toLocaleString()}</span><span className="font-semibold">{o.targetPct}%</span></div>
                    <div className="w-full rounded-full h-2 overflow-hidden" style={{background:dark?'#1e293b':'#e5e7eb'}}>
                      <div className="h-full rounded-full transition-all duration-700" style={{width:`${o.targetPct}%`,background:o.targetPct>=80?'linear-gradient(90deg,#22c55e,#16a34a)':o.targetPct>=50?'linear-gradient(90deg,#eab308,#d97706)':'linear-gradient(90deg,#ef4444,#dc2626)'}}/></div>
                  </div>
                  {/* Low stock chips */}
                  {o.lowStockItems?.length>0&&<div className="flex flex-wrap gap-1 mt-1.5">{o.lowStockItems.map((i:any,idx:number)=>(
                    <span key={idx} className="bg-rose-500/10 text-rose-500 text-[9px] px-2 py-0.5 rounded-full font-medium">⚠ {i.name} ({i.qty}{i.unit})</span>
                  ))}</div>}
                  {/* Footer */}
                  <div className="flex items-center justify-between mt-3 pt-2.5 border-t" style={{borderColor:dark?'rgba(255,255,255,0.05)':'rgba(0,0,0,0.05)'}}>
                    <span className={`px-3 py-1 rounded-full text-[10px] font-bold tracking-wide border ${
                      o.tagColor==='amber'?dark?'bg-amber-500/10 text-amber-400 border-amber-500/20':'bg-amber-50 text-amber-700 border-amber-200/50'
                      :o.tagColor==='blue'?dark?'bg-blue-500/10 text-blue-400 border-blue-500/20':'bg-blue-50 text-blue-700 border-blue-200/50'
                      :dark?'bg-red-500/10 text-red-400 border-red-500/20':'bg-red-50 text-red-700 border-red-200/50'}`}>{o.tag}</span>
                    <div className="flex gap-2">
                      <Link href="/dashboard/analytics" className={`px-3.5 py-1.5 rounded-2xl text-xs font-semibold transition-all hover:shadow-md ${dark?'border border-gray-700 text-gray-300 hover:bg-gray-800':'border border-gray-200 text-gray-700 hover:bg-gray-50'}`}>Analytics</Link>
                      <button className="text-white px-4 py-1.5 rounded-2xl font-semibold text-xs transition-all hover:scale-[1.02]"
                        style={{background:'linear-gradient(135deg,#a86a1c 0%,#d88a28 100%)'}}>Manage</button>
                    </div>
                  </div>
                </div>
              </div>
            </div>)
          })}
        </div>

        {filtered.length===0&&<div className="text-center py-20"><p className={T.mc(dark)}>No outlets matching &ldquo;{search}&rdquo;</p></div>}
      </div>
    </div>
  )
}
