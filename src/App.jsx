
import React, { useState, useEffect } from 'react';
import { 
  TrendingUp, Users, DollarSign, Activity, Zap, Target, 
  BarChart3, PieChart, ChevronDown, Bell, Search, LayoutDashboard, 
  Megaphone, Settings, ArrowUpRight, ArrowDownRight, Sparkles 
} from 'lucide-react';

// --- MOCK DATA ---
const KPI_DATA = {
  '7D': { spend: '$42,500', rev: '$128,400', roi: '+202%', cpa: '$18.50', spendTrend: 5, revTrend: 12, roiTrend: 8, cpaTrend: -2 },
  '30D': { spend: '$185,000', rev: '$540,200', roi: '+192%', cpa: '$22.10', spendTrend: 8, revTrend: 15, roiTrend: 5, cpaTrend: -4 },
  '90D': { spend: '$450,000', rev: '$1,420,000', roi: '+215%', cpa: '$19.80', spendTrend: 12, revTrend: 22, roiTrend: 14, cpaTrend: -8 },
};

const CHART_DATA = {
  '7D': [40, 55, 45, 70, 65, 85, 100],
  '30D': [30, 40, 35, 50, 45, 60, 55, 75, 70, 85, 80, 100],
  '90D': [20, 25, 30, 45, 40, 55, 60, 80, 75, 90, 85, 100]
};

const TRAFFIC_SOURCES = [
  { name: 'Organic Search (AI)', value: 45, color: 'bg-cyan-400' },
  { name: 'Social VR', value: 30, color: 'bg-purple-500' },
  { name: 'Direct Neural', value: 15, color: 'bg-pink-500' },
  { name: 'Affiliate Nodes', value: 10, color: 'bg-emerald-400' },
];

const EXTENDED_CAMPAIGNS = [
  { id: 1, name: 'Holo-Display Ads Q1', platform: 'HoloNet', status: 'Active', spend: '$45,200', budget: '$50,000', conversions: 1240, cpa: '$36.29', roas: '2.8x' },
  { id: 2, name: 'Neural-Link Promos', platform: 'NeuralWeb', status: 'Active', spend: '$120,500', budget: '$150,000', conversions: 5800, cpa: '$20.68', roas: '4.2x' },
  { id: 3, name: 'TikTok VR Experience', platform: 'TikTok VR', status: 'Paused', spend: '$15,000', budget: '$15,000', conversions: 320, cpa: '$46.87', roas: '1.5x' },
  { id: 4, name: 'AI Influencer Collab', platform: 'InstaVerse', status: 'Active', spend: '$85,000', budget: '$100,000', conversions: 4100, cpa: '$20.73', roas: '3.9x' },
  { id: 5, name: 'Mars Colony Retargeting', platform: 'StarNet', status: 'Draft', spend: '$0', budget: '$25,000', conversions: 0, cpa: '$0.00', roas: '0.0x' },
  { id: 6, name: 'Cyber-Monday 2026', platform: 'Multi-Channel', status: 'Active', spend: '$230,000', budget: '$500,000', conversions: 14500, cpa: '$15.86', roas: '5.1x' },
];

const AUDIENCE_DATA = {
  age: [
    { label: '18-24', value: 25 },
    { label: '25-34', value: 45 },
    { label: '35-44', value: 20 },
    { label: '45+', value: 10 },
  ],
  locations: [
    { name: 'Neo-Tokyo', value: 35 },
    { name: 'New York (Sector 4)', value: 25 },
    { name: 'London Metro', value: 20 },
    { name: 'Silicon Valley', value: 15 },
    { name: 'Other Nodes', value: 5 },
  ],
  interests: ['AI Enhancements', 'Cyberware', 'VR Gaming', 'Crypto-Assets', 'Smart Home Tech', 'Holo-Entertainment', 'Neural Interfaces']
};

// --- COMPONENTS ---
const GlassCard = ({ children, className = '' }) => (
  <div className={`bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6 shadow-[0_8px_32px_0_rgba(0,0,0,0.36)] ${className}`}>
    {children}
  </div>
);

const KPICard = ({ title, value, trend, icon: Icon, inverseTrend = false }) => {
  const isPositive = trend > 0;
  const isGood = inverseTrend ? !isPositive : isPositive;
  return (
    <GlassCard className="relative overflow-hidden group hover:bg-white/10 transition-all duration-300">
      <div className="absolute -right-6 -top-6 w-24 h-24 bg-gradient-to-br from-cyan-500/20 to-purple-500/20 rounded-full blur-2xl group-hover:blur-3xl transition-all" />
      <div className="flex justify-between items-start mb-4">
        <div>
          <p className="text-slate-400 text-sm font-medium mb-1">{title}</p>
          <h3 className="text-3xl font-bold text-white tracking-tight">{value}</h3>
        </div>
        <div className="p-3 bg-white/5 rounded-xl border border-white/10 text-cyan-400">
          <Icon size={20} />
        </div>
      </div>
      <div className="flex items-center gap-2">
        <div className={`flex items-center text-sm font-medium px-2 py-1 rounded-lg ${isGood ? 'text-emerald-400 bg-emerald-400/10' : 'text-rose-400 bg-rose-400/10'}`}>
          {isPositive ? <ArrowUpRight size={16} className="mr-1" /> : <ArrowDownRight size={16} className="mr-1" />}
          {Math.abs(trend)}%
        </div>
        <span className="text-slate-500 text-sm">vs last period</span>
      </div>
    </GlassCard>
  );
};

const CustomLineChart = ({ data }) => {
  const max = Math.max(...data);
  const min = Math.min(...data);
  const range = max - min || 1;
  const points = data.map((val, i) => {
    const x = (i / (data.length - 1)) * 100;
    const y = 100 - ((val - min) / range) * 80 - 10;
    return `${x},${y}`;
  }).join(' L ');
  return (
    <div className="w-full h-64 relative mt-4">
      <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="w-full h-full overflow-visible">
        <defs>
          <linearGradient id="lineGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#22d3ee" stopOpacity="0.5" />
            <stop offset="100%" stopColor="#22d3ee" stopOpacity="0.0" />
          </linearGradient>
        </defs>
        <path d={`M 0,100 L ${points} L 100,100 Z`} fill="url(#lineGradient)" />
        <path d={`M ${points}`} fill="none" stroke="#22d3ee" strokeWidth="1.5" vectorEffect="non-scaling-stroke" />
      </svg>
    </div>
  );
};

export default function App() {
  const [timeframe, setTimeframe] = useState('30D');
  const [activeTab, setActiveTab] = useState('Dashboard');
  const [isLoaded, setIsLoaded] = useState(false);
  useEffect(() => { setIsLoaded(true); }, []);
  const currentKPIs = KPI_DATA[timeframe];
  const currentChart = CHART_DATA[timeframe];

  return (
    <div className="min-h-screen bg-[#050B14] text-slate-200 font-sans selection:bg-cyan-500/30 flex overflow-hidden">
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-purple-600/20 rounded-full blur-[120px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-cyan-600/20 rounded-full blur-[120px]" />
      </div>
      <aside className="w-20 lg:w-64 border-r border-white/5 bg-black/20 backdrop-blur-3xl z-10 flex flex-col">
        <div className="h-20 flex items-center justify-center lg:justify-start lg:px-6 border-b border-white/5">
          <div className="w-10 h-10 bg-gradient-to-br from-cyan-400 to-purple-600 rounded-xl flex items-center justify-center"><Zap className="text-white" size={24} /></div>
          <span className="hidden lg:block ml-3 font-bold text-xl text-white">NEXUS<span className="text-cyan-400">.OS</span></span>
        </div>
        <nav className="flex-1 py-8 flex flex-col gap-2 px-4">
          {['Dashboard', 'Campaigns', 'Audience'].map((id) => (
            <button key={id} onClick={() => setActiveTab(id)} className={`flex items-center gap-4 px-4 py-3 rounded-xl ${activeTab === id ? 'bg-cyan-500/20 text-cyan-400' : 'text-slate-400'}`}>
              <LayoutDashboard size={20} />
              <span className="hidden lg:block">{id}</span>
            </button>
          ))}
        </nav>
      </aside>
      <main className="flex-1 overflow-y-auto z-10 relative">
        <header className="h-20 px-8 flex items-center justify-between border-b border-white/5 sticky top-0 bg-[#050B14]/80 backdrop-blur-xl z-20">
          <h1 className="text-2xl font-bold text-white">{activeTab}</h1>
          <div className="flex gap-2">
            {['7D', '30D', '90D'].map(tf => (
              <button key={tf} onClick={() => setTimeframe(tf)} className={`px-4 py-1.5 rounded-full text-sm ${timeframe === tf ? 'bg-cyan-500 text-white' : 'text-slate-400'}`}>{tf}</button>
            ))}
          </div>
        </header>
        <div className="p-8 space-y-8">
          {activeTab === 'Dashboard' && (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <KPICard title="Total Spend" value={currentKPIs.spend} trend={currentKPIs.spendTrend} icon={DollarSign} inverseTrend />
                <KPICard title="Total Revenue" value={currentKPIs.rev} trend={currentKPIs.revTrend} icon={TrendingUp} />
                <KPICard title="Average ROI" value={currentKPIs.roi} trend={currentKPIs.roiTrend} icon={Activity} />
                <KPICard title="Blended CPA" value={currentKPIs.cpa} trend={currentKPIs.cpaTrend} icon={Users} inverseTrend />
              </div>
              <GlassCard><h3 className="text-xl font-bold text-white mb-6">Revenue Performance</h3><CustomLineChart data={currentChart} /></GlassCard>
            </>
          )}
          {activeTab === 'Campaigns' && (
            <GlassCard className="!p-0">
              <table className="w-full text-left text-sm">
                <thead><tr className="bg-white/5 text-slate-400">
                  <th className="p-4 pl-6">Campaign</th><th className="p-4">Status</th><th className="p-4">ROAS</th>
                </tr></thead>
                <tbody>{EXTENDED_CAMPAIGNS.map(c => (
                  <tr key={c.id} className="border-b border-white/5 text-white">
                    <td className="p-4 pl-6">{c.name}</td><td className="p-4">{c.status}</td><td className="p-4 font-bold">{c.roas}</td>
                  </tr>
                ))}</tbody>
              </table>
            </GlassCard>
          )}
          {activeTab === 'Audience' && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <GlassCard><h3 className="text-white font-bold mb-4">Age Groups</h3>{AUDIENCE_DATA.age.map(a => (
                <div key={a.label} className="mb-4 text-sm"><span>{a.label}</span><div className="h-2 bg-white/5 w-full rounded mt-1"><div className="h-full bg-cyan-500 rounded" style={{width: `${a.value}%`}} /></div></div>
              ))}</GlassCard>
              <GlassCard><h3 className="text-white font-bold mb-4">Locations</h3>{AUDIENCE_DATA.locations.map(l => (
                <div key={l.name} className="flex justify-between text-sm mb-2 text-slate-300"><span>{l.name}</span><span className="text-white font-bold">{l.value}%</span></div>
              ))}</GlassCard>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
