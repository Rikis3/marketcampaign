import React, { useState, useEffect, useMemo } from 'react';
import { 
  TrendingUp, Users, DollarSign, Activity, Zap, Target, 
  PieChart, ChevronDown, Bell, Search, LayoutDashboard, 
  Megaphone, Settings, ArrowUpRight, ArrowDownRight, Sparkles,
  Download, BrainCircuit, AlertCircle, Filter
} from 'lucide-react';

// --- YOUR LIVE API URL ---
const GOOGLE_SHEET_API_URL = 'https://script.google.com/macros/s/AKfycbxHCiMQs11imMsapjLaBh8TKRzrY55bstTbXYwvasMyaDS-QfIrgXO-Oo5dFACGm9Yf/exec';

// --- ROBUST FALLBACK MOCK DATA ---
// (Used instantly if the API is slow, fails, or has a CORS issue)
const MOCK_FALLBACK = {
  kpis: {
    '7D': { spend: '$42,500', rev: '$128,400', roi: '+202%', cpa: '$18.50', spendTrend: 5, revTrend: 12, roiTrend: 8, cpaTrend: -2, targetPacing: 92 },
    '30D': { spend: '$185,000', rev: '$540,200', roi: '+192%', cpa: '$22.10', spendTrend: 8, revTrend: 15, roiTrend: 5, cpaTrend: -4, targetPacing: 104 },
    '90D': { spend: '$450,000', rev: '$1,420,000', roi: '+215%', cpa: '$19.80', spendTrend: 12, revTrend: 22, roiTrend: 14, cpaTrend: -8, targetPacing: 115 },
  },
  charts: {
    '7D': [40, 55, 45, 70, 65, 85, 100],
    '30D': [30, 40, 35, 50, 45, 60, 55, 75, 70, 85, 80, 100],
    '90D': [20, 25, 30, 45, 40, 55, 60, 80, 75, 90, 85, 100]
  },
  insights: {
    '7D': "Revenue is pacing slightly behind target, primarily due to rising CPA in the TikTok VR segment. Consider reallocating $15k to Holo-Display Ads.",
    '30D': "Strong performance across the board. The new Cyber-Monday mult-channel sequence drove a 15% WoW revenue spike. CPA remains highly efficient.",
    '90D': "Q3 targets exceeded by 15%. AI Influencer collaborations yielded the highest LTV to CAC ratio. Recommend scaling this channel for Q4."
  },
  campaigns: [
    { id: 1, name: 'Holo-Display Ads Q1', platform: 'HoloNet', status: 'Active', spend: 45200, budget: 50000, conversions: 1240, cpa: '$36.29', roas: '2.8x' },
    { id: 2, name: 'Neural-Link Promos', platform: 'NeuralWeb', status: 'Active', spend: 120500, budget: 150000, conversions: 5800, cpa: '$20.68', roas: '4.2x' },
    { id: 3, name: 'TikTok VR Experience', platform: 'TikTok VR', status: 'Paused', spend: 15000, budget: 15000, conversions: 320, cpa: '$46.87', roas: '1.5x' },
    { id: 6, name: 'Cyber-Monday 2026', platform: 'Multi-Channel', status: 'Active', spend: 230000, budget: 500000, conversions: 14500, cpa: '$15.86', roas: '5.1x' },
  ],
  audience: {
    age: [
      { label: '18-24', value: 25 }, { label: '25-34', value: 45 }, { label: '35-44', value: 20 }, { label: '45+', value: 10 },
    ],
    locations: [
      { name: 'Neo-Tokyo', value: 35 }, { name: 'New York (Sector 4)', value: 25 }, { name: 'London Metro', value: 20 }, { name: 'Silicon Valley', value: 15 }, { name: 'Other Nodes', value: 5 },
    ]
  }
};

// --- OPTIMIZED UI COMPONENTS ---
const GlassCard = ({ children, className = '' }) => (
  <div className={`bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6 shadow-2xl ${className}`}>
    {children}
  </div>
);

const StatusBadge = ({ status }) => {
  const styles = {
    Active: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
    Paused: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
    Draft: 'bg-slate-500/10 text-slate-400 border-slate-500/20',
  };
  return (
    <span className={`px-3 py-1 rounded-full text-xs font-medium border ${styles[status] || styles.Draft}`}>
      {status || 'Unknown'}
    </span>
  );
};

const ProgressBar = ({ current = 0, max = 1 }) => {
  const percent = Math.min(Math.round((current / max) * 100), 100) || 0;
  const isWarning = percent > 90;
  return (
    <div className="w-full">
      <div className="flex justify-between text-xs mb-1">
        <span className="text-slate-400">${Number(current).toLocaleString()}</span>
        <span className="text-slate-500">${Number(max).toLocaleString()}</span>
      </div>
      <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
        <div 
          className={`h-full rounded-full transition-all duration-500 ${isWarning ? 'bg-rose-500' : 'bg-cyan-500'}`} 
          style={{ width: `${percent}%` }}
        />
      </div>
    </div>
  );
};

const KPICard = ({ title, value, trend = 0, icon: Icon, inverseTrend = false }) => {
  const isPositive = trend > 0;
  const isGood = inverseTrend ? !isPositive : isPositive;
  return (
    <GlassCard className="relative overflow-hidden group hover:bg-white/[0.07] transition-all duration-300">
      <div className="absolute -right-6 -top-6 w-24 h-24 bg-gradient-to-br from-cyan-500/20 to-purple-500/20 rounded-full blur-2xl group-hover:blur-3xl transition-all" />
      <div className="flex justify-between items-start mb-4 relative z-10">
        <div>
          <p className="text-slate-400 text-sm font-medium mb-1">{title}</p>
          <h3 className="text-3xl font-bold text-white tracking-tight">{value || '-'}</h3>
        </div>
        <div className="p-3 bg-white/5 rounded-xl border border-white/10 text-cyan-400">
          <Icon size={20} />
        </div>
      </div>
      <div className="flex items-center gap-2 relative z-10">
        <div className={`flex items-center text-sm font-bold px-2 py-1 rounded-lg ${isGood ? 'text-emerald-400 bg-emerald-400/10' : 'text-rose-400 bg-rose-400/10'}`}>
          {isPositive ? <ArrowUpRight size={16} className="mr-1" /> : <ArrowDownRight size={16} className="mr-1" />}
          {Math.abs(trend)}%
        </div>
        <span className="text-slate-500 text-sm">vs prior period</span>
      </div>
    </GlassCard>
  );
};

const CustomLineChart = ({ data = [] }) => {
  if (!data || data.length === 0) data = [0,0]; // Safety fallback
  const max = Math.max(...data);
  const min = Math.min(...data);
  const range = max - min || 1;
  const points = data.map((val, i) => {
    const x = (i / (data.length - 1)) * 100;
    const y = 100 - ((val - min) / range) * 80 - 10;
    return `${x},${y}`;
  }).join(' L ');
  
  return (
    <div className="w-full h-72 relative mt-6">
      <div className="absolute left-0 top-0 bottom-0 w-8 flex flex-col justify-between text-xs text-slate-500 pb-6">
        <span>{max}k</span>
        <span>{Math.round((max+min)/2)}k</span>
        <span>{min}k</span>
      </div>
      <div className="ml-10 h-full">
        <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="w-full h-full overflow-visible">
          <defs>
            <linearGradient id="lineGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#22d3ee" stopOpacity="0.4" />
              <stop offset="100%" stopColor="#22d3ee" stopOpacity="0.0" />
            </linearGradient>
          </defs>
          <line x1="0" y1="10" x2="100" y2="10" stroke="#ffffff" strokeOpacity="0.05" strokeWidth="0.5" />
          <line x1="0" y1="50" x2="100" y2="50" stroke="#ffffff" strokeOpacity="0.05" strokeWidth="0.5" />
          <line x1="0" y1="90" x2="100" y2="90" stroke="#ffffff" strokeOpacity="0.05" strokeWidth="0.5" />
          
          <path d={`M 0,100 L ${points} L 100,100 Z`} fill="url(#lineGradient)" />
          <path d={`M ${points}`} fill="none" stroke="#22d3ee" strokeWidth="2" vectorEffect="non-scaling-stroke" />
          
          {data.map((val, i) => {
            const x = (i / (data.length - 1)) * 100;
            const y = 100 - ((val - min) / range) * 80 - 10;
            return <circle key={i} cx={x} cy={y} r="1.5" fill="#050B14" stroke="#22d3ee" strokeWidth="0.8" vectorEffect="non-scaling-stroke" />;
          })}
        </svg>
      </div>
    </div>
  );
};

export default function App() {
  const [timeframe, setTimeframe] = useState('30D');
  const [activeTab, setActiveTab] = useState('Dashboard');
  const [isDownloading, setIsDownloading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  
  // Data States
  const [isLoading, setIsLoading] = useState(true);
  const [data, setData] = useState(null);
  const [dataSource, setDataSource] = useState('LIVE'); // 'LIVE' or 'MOCK'

  // Fetch Logic with Timeout and Memory Leak Protection
  useEffect(() => {
    let isMounted = true;
    const controller = new AbortController();

    const fetchLiveData = async () => {
      setIsLoading(true);
      try {
        // 8 second timeout to prevent infinite loading screens
        const timeoutId = setTimeout(() => controller.abort(), 8000);
        
        const response = await fetch(GOOGLE_SHEET_API_URL, { signal: controller.signal });
        clearTimeout(timeoutId);

        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        
        const sheetData = await response.json();
        
        if (isMounted) {
          setData(sheetData);
          setDataSource('LIVE');
          setIsLoading(false);
        }
      } catch (error) {
        console.warn("Live API failed/timeout, utilizing local fallback memory.", error);
        if (isMounted) {
          setData(MOCK_FALLBACK);
          setDataSource('MOCK Fallback');
          setIsLoading(false);
        }
      }
    };

    fetchLiveData();

    return () => {
      isMounted = false;
      controller.abort();
    };
  }, []);

  const handleExport = () => {
    setIsDownloading(true);
    setTimeout(() => setIsDownloading(false), 1500); 
  };

  // Safe Data Extraction (Prevents crashes if API is missing fields)
  const currentKPIs = data?.kpis?.[timeframe] || MOCK_FALLBACK.kpis[timeframe];
  const currentChart = data?.charts?.[timeframe] || MOCK_FALLBACK.charts[timeframe];
  const currentInsight = data?.insights?.[timeframe] || MOCK_FALLBACK.insights[timeframe];
  
  // Filter campaigns safely
  const filteredCampaigns = useMemo(() => {
    const camps = data?.campaigns || MOCK_FALLBACK.campaigns;
    if (!searchQuery) return camps;
    return camps.filter(c => c.name?.toLowerCase().includes(searchQuery.toLowerCase()) || c.platform?.toLowerCase().includes(searchQuery.toLowerCase()));
  }, [data, searchQuery]);

  const currentAudience = data?.audience || MOCK_FALLBACK.audience;

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#050B14] flex flex-col items-center justify-center gap-6 relative overflow-hidden">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-cyan-600/10 rounded-full blur-[100px]" />
        <BrainCircuit size={56} className="text-cyan-400 animate-pulse relative z-10" />
        <div className="text-center relative z-10">
          <h2 className="text-2xl font-bold text-white tracking-widest mb-2">NEXUS<span className="text-cyan-400 font-light">.BI</span></h2>
          <p className="text-slate-400 font-medium animate-pulse">Syncing Secure Database...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#050B14] text-slate-200 font-sans selection:bg-cyan-500/30 flex overflow-hidden">
      {/* Dynamic Background */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] bg-purple-600/10 rounded-full blur-[150px]" />
        <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] bg-cyan-600/10 rounded-full blur-[150px]" />
      </div>

      {/* Sidebar */}
      <aside className="w-20 lg:w-64 border-r border-white/5 bg-[#050B14]/50 backdrop-blur-3xl z-10 flex flex-col">
        <div className="h-20 flex items-center justify-center lg:justify-start lg:px-6 border-b border-white/5">
          <div className="w-10 h-10 bg-gradient-to-br from-cyan-400 to-purple-600 rounded-xl flex items-center justify-center shadow-[0_0_20px_rgba(34,211,238,0.3)]">
            <Zap className="text-white" size={24} />
          </div>
          <span className="hidden lg:block ml-3 font-bold text-xl text-white tracking-wide">
            NEXUS<span className="text-cyan-400 font-light">.BI</span>
          </span>
        </div>
        <nav className="flex-1 py-8 flex flex-col gap-2 px-4">
          {[
            { id: 'Dashboard', icon: LayoutDashboard }, 
            { id: 'Campaigns', icon: Megaphone }, 
            { id: 'Audience', icon: Users }
          ].map((item) => (
            <button 
              key={item.id} 
              onClick={() => setActiveTab(item.id)} 
              className={`flex items-center gap-4 px-4 py-3.5 rounded-xl transition-all duration-200 ${activeTab === item.id ? 'bg-gradient-to-r from-cyan-500/20 to-transparent border-l-2 border-cyan-400 text-cyan-400' : 'text-slate-400 hover:bg-white/5 hover:text-white'}`}
            >
              <item.icon size={20} />
              <span className="hidden lg:block font-medium">{item.id}</span>
            </button>
          ))}
        </nav>
        
        {/* User Profile */}
        <div className="p-4 border-t border-white/5 hidden lg:flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-slate-800 border border-white/10 flex items-center justify-center text-sm font-bold text-cyan-400">VP</div>
          <div>
            <p className="text-sm font-bold text-white">Executive View</p>
            <div className="flex items-center gap-1 mt-0.5">
              <span className={`w-2 h-2 rounded-full ${dataSource === 'LIVE' ? 'bg-emerald-500' : 'bg-amber-500'}`}></span>
              <p className="text-[10px] text-slate-500 uppercase tracking-wider">{dataSource} DATA</p>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto z-10 relative">
        <header className="h-20 px-4 md:px-8 flex items-center justify-between border-b border-white/5 sticky top-0 bg-[#050B14]/80 backdrop-blur-xl z-20">
          <div>
            <h1 className="text-xl md:text-2xl font-bold text-white">{activeTab}</h1>
            <p className="hidden md:block text-xs text-slate-400 mt-0.5">Data retrieved from Nexus Cloud Services</p>
          </div>
          <div className="flex items-center gap-4">
            <div className="bg-white/5 p-1 rounded-xl border border-white/5 flex">
              {['7D', '30D', '90D'].map(tf => (
                <button 
                  key={tf} 
                  onClick={() => setTimeframe(tf)} 
                  className={`px-3 md:px-5 py-1.5 rounded-lg text-sm font-medium transition-all ${timeframe === tf ? 'bg-cyan-500 text-[#050B14] shadow-lg' : 'text-slate-400 hover:text-white'}`}
                >
                  {tf}
                </button>
              ))}
            </div>
            <button 
              onClick={handleExport}
              className="hidden lg:flex items-center gap-2 px-4 py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-sm font-medium text-white transition-all"
            >
              <Download size={16} className={isDownloading ? 'animate-bounce text-cyan-400' : ''} />
              {isDownloading ? 'Generating PDF...' : 'Export Report'}
            </button>
          </div>
        </header>

        <div className="p-4 md:p-8 space-y-6 md:space-y-8 max-w-7xl mx-auto">
          {/* Executive AI Insights Banner */}
          <div className="bg-gradient-to-r from-cyan-900/40 to-purple-900/40 border border-cyan-500/20 rounded-2xl p-4 md:p-5 flex items-start gap-4">
            <div className="p-2 bg-cyan-500/20 rounded-lg shrink-0">
              <BrainCircuit className="text-cyan-400" size={24} />
            </div>
            <div>
              <h4 className="text-sm font-bold text-cyan-400 mb-1 flex items-center gap-2">
                Nexus Copilot Insight 
                <Sparkles size={14} />
              </h4>
              <p className="text-slate-300 text-sm leading-relaxed">{currentInsight}</p>
            </div>
          </div>

          {activeTab === 'Dashboard' && (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
                <KPICard title="Total Spend" value={currentKPIs.spend} trend={currentKPIs.spendTrend} icon={DollarSign} inverseTrend />
                <KPICard title="Total Revenue" value={currentKPIs.rev} trend={currentKPIs.revTrend} icon={TrendingUp} />
                <KPICard title="Blended ROAS" value={currentKPIs.roi} trend={currentKPIs.roiTrend} icon={Target} />
                <KPICard title="Acquisition Cost" value={currentKPIs.cpa} trend={currentKPIs.cpaTrend} icon={Users} inverseTrend />
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <GlassCard className="col-span-1 lg:col-span-2">
                  <div className="flex justify-between items-center mb-6">
                    <h3 className="text-xl font-bold text-white">Revenue Trajectory</h3>
                    <button className="text-slate-400 hover:text-white"><Filter size={18} /></button>
                  </div>
                  <CustomLineChart data={currentChart} />
                </GlassCard>

                {/* Target Pacing Card */}
                <GlassCard className="col-span-1 flex flex-col justify-between">
                  <div>
                    <h3 className="text-xl font-bold text-white mb-2">Target Pacing</h3>
                    <p className="text-sm text-slate-400 mb-6">Current performance vs {timeframe} financial goal</p>
                    
                    <div className="flex items-end gap-2 mb-2">
                      <span className="text-4xl font-bold text-white">{currentKPIs.targetPacing || 0}%</span>
                      <span className="text-slate-400 pb-1">to goal</span>
                    </div>
                  </div>
                  
                  <div className="space-y-4">
                    <div className="h-4 w-full bg-white/5 rounded-full overflow-hidden relative">
                      <div className="absolute left-[100%] top-0 bottom-0 border-l border-dashed border-slate-500 z-10" />
                      <div 
                        className={`h-full rounded-full transition-all duration-1000 ${currentKPIs.targetPacing >= 100 ? 'bg-gradient-to-r from-emerald-500 to-cyan-400' : 'bg-gradient-to-r from-amber-500 to-amber-400'}`} 
                        style={{ width: `${Math.min(currentKPIs.targetPacing || 0, 100)}%` }}
                      />
                    </div>
                    {currentKPIs.targetPacing < 100 ? (
                      <div className="flex items-center gap-2 text-amber-400 text-sm bg-amber-400/10 p-3 rounded-xl border border-amber-400/20">
                        <AlertCircle size={16} />
                        <span>Tracking ${(100 - currentKPIs.targetPacing)}k behind target</span>
                      </div>
                    ) : (
                      <div className="flex items-center gap-2 text-emerald-400 text-sm bg-emerald-400/10 p-3 rounded-xl border border-emerald-400/20">
                        <TrendingUp size={16} />
                        <span>Pacing to exceed period targets</span>
                      </div>
                    )}
                  </div>
                </GlassCard>
              </div>
            </>
          )}

          {activeTab === 'Campaigns' && (
            <GlassCard className="!p-0 overflow-hidden">
              <div className="p-4 md:p-6 border-b border-white/5 flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 bg-white/[0.02]">
                <h3 className="text-lg font-bold text-white">Active Deployments</h3>
                <div className="relative w-full sm:w-auto">
                  <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                  <input 
                    type="text" 
                    placeholder="Search campaigns..." 
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full sm:w-auto bg-black/20 border border-white/10 rounded-lg pl-9 pr-4 py-2 text-sm text-white focus:outline-none focus:border-cyan-500/50"
                  />
                </div>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm whitespace-nowrap min-w-[800px]">
                  <thead>
                    <tr className="bg-black/40 text-slate-400 uppercase text-xs tracking-wider">
                      <th className="p-4 pl-6 font-medium">Campaign Name</th>
                      <th className="p-4 font-medium">Status</th>
                      <th className="p-4 font-medium w-48">Budget Pacing</th>
                      <th className="p-4 font-medium">Conversions</th>
                      <th className="p-4 font-medium">CPA</th>
                      <th className="p-4 font-medium">ROAS</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {filteredCampaigns.map((c, idx) => (
                      <tr key={c.id || idx} className="text-white hover:bg-white/[0.02] transition-colors">
                        <td className="p-4 pl-6 font-medium">
                          {c.name}
                          <div className="text-xs text-slate-500 font-normal mt-0.5">{c.platform}</div>
                        </td>
                        <td className="p-4"><StatusBadge status={c.status} /></td>
                        <td className="p-4"><ProgressBar current={c.spend} max={c.budget} /></td>
                        <td className="p-4">{Number(c.conversions || 0).toLocaleString()}</td>
                        <td className="p-4 text-slate-300">{c.cpa}</td>
                        <td className="p-4 font-bold text-cyan-400">{c.roas}</td>
                      </tr>
                    ))}
                    {filteredCampaigns.length === 0 && (
                      <tr>
                        <td colSpan="6" className="p-8 text-center text-slate-500">No campaigns found matching "{searchQuery}"</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </GlassCard>
          )}

          {activeTab === 'Audience' && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <GlassCard>
                <div className="flex items-center gap-2 mb-6">
                  <PieChart size={20} className="text-cyan-400" />
                  <h3 className="text-white font-bold">Demographic Distribution</h3>
                </div>
                <div className="space-y-5">
                  {currentAudience?.age?.map(a => (
                    <div key={a.label} className="text-sm">
                      <div className="flex justify-between mb-1">
                        <span className="text-slate-300">Age {a.label}</span>
                        <span className="text-white font-medium">{a.value}%</span>
                      </div>
                      <div className="h-2 bg-black/40 rounded-full overflow-hidden border border-white/5">
                        <div className="h-full bg-gradient-to-r from-purple-500 to-cyan-400 rounded-full" style={{width: `${a.value}%`}} />
                      </div>
                    </div>
                  ))}
                </div>
              </GlassCard>
              <GlassCard>
                <div className="flex items-center gap-2 mb-6">
                  <Activity size={20} className="text-purple-400" />
                  <h3 className="text-white font-bold">Geographic Performance</h3>
                </div>
                <div className="space-y-4">
                  {currentAudience?.locations?.map((l, index) => (
                    <div key={l.name} className="flex items-center p-3 rounded-xl bg-white/5 border border-white/5 hover:border-white/10 transition-colors">
                      <div className="w-8 h-8 rounded-full bg-black/40 flex items-center justify-center text-xs font-bold text-slate-400 mr-4 border border-white/5">
                        #{index + 1}
                      </div>
                      <div className="flex-1">
                        <div className="text-sm text-white font-medium">{l.name}</div>
                      </div>
                      <div className="text-right">
                        <div className="text-sm font-bold text-cyan-400">{l.value}%</div>
                        <div className="text-xs text-slate-500">of total volume</div>
                      </div>
                    </div>
                  ))}
                </div>
              </GlassCard>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
