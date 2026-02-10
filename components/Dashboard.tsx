
import React, { useMemo, useState } from 'react';
import { 
  Clock, ShieldAlert, Landmark, Wallet, BarChart3, TrendingUp, Zap, Plus, Calendar as CalendarIcon, ArrowUpRight, ArrowDownRight, Radio, Database, Building2, MapPin
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { OSStatus, ServiceType, UserRole } from '../types';
import { ResponsiveContainer, XAxis, YAxis, CartesianGrid, Tooltip, AreaChart, Area } from 'recharts';

interface DashboardProps {
   unit: any;
   currentUnitId: string;
   role: UserRole;
   onRequestNewOS: () => void;
}

const Dashboard: React.FC<DashboardProps> = ({ unit, currentUnitId, role, onRequestNewOS }) => {
  const { orders, expenses, activeUnitId, units } = useApp();
  const [dateFilter, setDateFilter] = useState<'7d' | '30d' | '90d' | 'custom'>('30d');
  const [customStart, setCustomStart] = useState('');
  const [customEnd, setCustomEnd] = useState('');

  // Sincroniza o objeto 'unit' com a unidade ativa selecionada no Header
  const activeUnit = units.find(u => u.id === activeUnitId) || unit;

  // 1. Definição dos Intervalos de Data
  const { startDate, endDate, prevStartDate, prevEndDate } = useMemo(() => {
    const end = new Date();
    end.setHours(23, 59, 59, 999);
    
    let start = new Date();
    start.setHours(0, 0, 0, 0);

    if (dateFilter === 'custom' && customStart && customEnd) {
       start = new Date(customStart);
       const customEndObj = new Date(customEnd);
       customEndObj.setHours(23, 59, 59, 999);
       
       const duration = customEndObj.getTime() - start.getTime();
       const prevEnd = new Date(start.getTime() - 1);
       const prevStart = new Date(prevEnd.getTime() - duration);
       
       return { startDate: start, endDate: customEndObj, prevStartDate: prevStart, prevEndDate: prevEnd };
    }
    
    const days = dateFilter === '7d' ? 7 : dateFilter === '90d' ? 90 : 30;
    start.setDate(end.getDate() - days);

    const prevEnd = new Date(start.getTime() - 1);
    const prevStart = new Date(prevEnd.getTime());
    prevStart.setDate(prevEnd.getDate() - days);

    return { startDate: start, endDate: end, prevStartDate: prevStart, prevEndDate: prevEnd };
  }, [dateFilter, customStart, customEnd]);

  // 2. Função de Filtragem - AGORA USA O activeUnitId DINÂMICO
  const filterDataByRange = (s: Date, e: Date) => {
     return {
        orders: orders.filter(o => {
           const d = new Date(o.requestDate);
           return d >= s && d <= e && o.unitId === activeUnitId;
        }),
        expenses: expenses.filter(exp => {
           const d = new Date(exp.year, exp.month, 1);
           return d >= s && d <= e && exp.unitId === activeUnitId;
        })
     };
  };

  const currentData = useMemo(() => filterDataByRange(startDate, endDate), [orders, expenses, startDate, endDate, activeUnitId]);
  const prevData = useMemo(() => filterDataByRange(prevStartDate, prevEndDate), [orders, expenses, prevStartDate, prevEndDate, activeUnitId]);

  // 3. Cálculo de Estatísticas
  const calculateStats = (data: typeof currentData) => {
    const finished = data.orders.filter(o => o.status === OSStatus.FINISHED);
    const totalHours = finished.reduce((acc, o) => acc + (o.timeSpent || 0), 0);
    const activeCorrective = data.orders.filter(o => o.type === ServiceType.CORRECTIVE && o.status === OSStatus.OPEN).length;
    const totalOPEX = data.expenses.reduce((acc, e) => acc + e.totalRealCost, 0);
    const totalOS = data.orders.length;
    return { totalHours, activeCorrective, totalOPEX, totalOS };
  };

  const currentStats = calculateStats(currentData);
  const prevStats = calculateStats(prevData);

  // 4. Tendências
  const getTrend = (curr: number, prev: number) => {
     if (prev === 0) return curr === 0 ? 0 : 100;
     return ((curr - prev) / prev) * 100;
  };

  const trends = {
     hours: getTrend(currentStats.totalHours, prevStats.totalHours),
     corrective: getTrend(currentStats.activeCorrective, prevStats.activeCorrective),
     opex: getTrend(currentStats.totalOPEX, prevStats.totalOPEX),
     os: getTrend(currentStats.totalOS, prevStats.totalOS)
  };

  // 5. Dados do Gráfico
  const chartData = useMemo(() => {
    const dailyMap: Record<string, number> = {};
    currentData.orders.forEach(o => {
      const day = o.requestDate.split('-').slice(1).reverse().join('/'); // Formato DD/MM
      dailyMap[day] = (dailyMap[day] || 0) + 1;
    });
    
    return Object.entries(dailyMap)
      .map(([date, count]) => ({ date, count }))
      .sort((a, b) => {
         const [dA, mA] = a.date.split('/');
         const [dB, mB] = b.date.split('/');
         return new Date(2024, Number(mA)-1, Number(dA)).getTime() - new Date(2024, Number(mB)-1, Number(dB)).getTime();
      });
  }, [currentData.orders]);

  const budgetBalance = activeUnit.annualBudget - currentStats.totalOPEX; 

  return (
    <div className="space-y-6 lg:space-y-8 animate-in fade-in duration-700 pb-24">
      
      {/* FILTRO DE DATA */}
      <div className="flex flex-col xl:flex-row items-start xl:items-center justify-between gap-6 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
         <div className="flex items-center gap-4">
            <div className="p-3 bg-slate-50 rounded-lg text-[#1A3673]">
               <CalendarIcon size={20} />
            </div>
            <div>
               <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Controle de Intervalo</p>
               <h3 className="text-sm font-extrabold text-[#1A3673] uppercase">Análise Temporal</h3>
            </div>
         </div>

         <div className="flex flex-wrap items-center gap-3 w-full xl:w-auto">
            <div className="flex bg-slate-100 p-1 rounded-lg border border-slate-200 w-full xl:w-auto overflow-x-auto">
               {(['7d', '30d', '90d', 'custom'] as const).map(f => (
                  <button 
                     key={f}
                     onClick={() => setDateFilter(f)}
                     className={`flex-1 xl:flex-none px-4 lg:px-5 py-2 rounded-md text-[10px] font-bold uppercase tracking-wider transition-all whitespace-nowrap ${
                        dateFilter === f ? 'bg-white text-[#1A3673] shadow-sm' : 'text-slate-400 hover:text-slate-600'
                     }`}
                  >
                     {f === 'custom' ? 'Personalizado' : f.toUpperCase()}
                  </button>
               ))}
            </div>

            {dateFilter === 'custom' && (
               <div className="flex items-center gap-2 animate-in slide-in-from-right-2 w-full xl:w-auto">
                  <input 
                     type="date" 
                     className="flex-1 bg-white border border-slate-200 rounded-lg px-3 py-2 text-[10px] font-bold text-slate-700 outline-none focus:border-[#1A3673]"
                     value={customStart}
                     onChange={e => setCustomStart(e.target.value)}
                  />
                  <span className="text-slate-300 text-xs font-black">/</span>
                  <input 
                     type="date" 
                     className="flex-1 bg-white border border-slate-200 rounded-lg px-3 py-2 text-[10px] font-bold text-slate-700 outline-none focus:border-[#1A3673]"
                     value={customEnd}
                     onChange={e => setCustomEnd(e.target.value)}
                  />
               </div>
            )}
         </div>
      </div>

      {/* 1. COMANDO E STATUS DE REDE */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-8">
        <div className="xl:col-span-8 industrial-card p-6 lg:p-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-8 bg-[#1A3673] text-white border-none relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-10 opacity-5 pointer-events-none group-hover:scale-110 transition-transform duration-1000">
             <Building2 size={150} />
          </div>

          <div className="flex items-center gap-6 relative z-10">
            <div className="w-12 h-12 lg:w-16 lg:h-16 bg-white/10 rounded-2xl flex items-center justify-center text-white relative border border-white/20 backdrop-blur-sm shrink-0">
              <Building2 size={24} className="lg:hidden" />
              <Building2 size={32} className="hidden lg:block" />
              <span className="absolute -top-1 -right-1 w-4 h-4 bg-[#E31B23] rounded-full border-4 border-[#1A3673] animate-pulse"></span>
            </div>
            <div>
              <div className="flex items-center gap-2 mb-1">
                 <p className="text-[8px] lg:text-[9px] font-bold text-white/60 uppercase tracking-[0.2em]">Aviagen Latin America</p>
                 <span className="w-1 h-1 rounded-full bg-white/40"></span>
                 <p className="text-[8px] lg:text-[9px] font-bold text-white/60 uppercase tracking-[0.2em] flex items-center gap-1"><MapPin size={8}/> {activeUnit.country}</p>
              </div>
              
              <h2 className="text-2xl lg:text-3xl font-black text-white uppercase tracking-tighter italic leading-none">{activeUnit.name}</h2>
              
              <div className="flex flex-wrap items-center gap-3 mt-3">
                 <div className="flex items-center gap-1.5 bg-black/20 px-3 py-1 rounded-lg border border-white/10">
                    <Radio size={12} className="text-emerald-400 animate-pulse" />
                    <span className="text-[8px] lg:text-[9px] font-bold text-white/90 uppercase tracking-widest">Link Ativo</span>
                 </div>
                 <div className="flex items-center gap-1.5 bg-black/20 px-3 py-1 rounded-lg border border-white/10">
                    <Database size={12} className="text-blue-300" />
                    <span className="text-[8px] lg:text-[9px] font-bold text-white/90 uppercase tracking-widest">DB: Sync</span>
                 </div>
              </div>
            </div>
          </div>
          
          <div className="flex items-center gap-6 relative z-10 w-full md:w-auto justify-between md:justify-end">
             <div className="text-right hidden sm:block">
                <p className="text-[8px] font-bold text-white/50 uppercase tracking-widest">Volume OS no Período</p>
                <div className="flex items-center justify-end gap-2">
                   <p className="text-3xl lg:text-4xl font-black text-white italic tracking-tighter">{currentStats.totalOS}</p>
                   <TrendBadge value={trends.os} inverseTheme />
                </div>
             </div>
             <div className="w-px h-12 bg-white/20 hidden sm:block"></div>
             <button 
                onClick={onRequestNewOS}
                className="w-full md:w-auto bg-white text-[#1A3673] px-6 lg:px-8 py-3 lg:py-4 rounded-xl font-black uppercase text-[10px] tracking-widest shadow-xl hover:bg-slate-100 transition-all flex items-center justify-center gap-2 active:scale-95"
             >
                <Plus size={16} /> Nova OS
             </button>
          </div>
        </div>

        <div className="xl:col-span-4 industrial-card p-8 lg:p-10 bg-white border border-slate-200 relative overflow-hidden">
           <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-emerald-400/20 to-transparent blur-3xl -mr-10 -mt-10 pointer-events-none"></div>
           <div className="flex justify-between items-start mb-4 relative z-10">
              <p className="text-[9px] font-black uppercase tracking-[0.3em] text-slate-400">Health Index</p>
              <Zap size={18} className="text-[#E31B23]" />
           </div>
           <div className="flex items-end justify-between relative z-10">
              <h3 className="text-5xl lg:text-6xl font-black italic tracking-tighter text-[#1A3673]">A+</h3>
              <div className="text-right">
                 <p className="text-[8px] font-black uppercase text-slate-400">Compliance</p>
                 <p className="text-lg lg:text-xl font-black text-emerald-600 italic">ÓTIMO</p>
              </div>
           </div>
        </div>
      </div>

      {/* 2. KPIS DE ALTA DENSIDADE */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
         <MetricBox 
            label="H/H Industrial" 
            value={`${currentStats.totalHours}h`} 
            icon={Clock} 
            trendValue={trends.hours}
         />
         <MetricBox 
            label="Críticas em Aberto" 
            value={currentStats.activeCorrective} 
            icon={ShieldAlert} 
            color={currentStats.activeCorrective > 0 ? "text-[#E31B23]" : "text-emerald-600"}
            alert={currentStats.activeCorrective > 5}
            trendValue={trends.corrective}
            inverse={true} 
         />
         <MetricBox 
            label="OPEX Realizado" 
            value={`${activeUnit.currency} ${(currentStats.totalOPEX/1000).toFixed(1)}k`} 
            icon={Landmark} 
            trendValue={trends.opex}
            inverse={true}
         />
         <MetricBox 
            label="Saldo Budget" 
            value={`${activeUnit.currency} ${(budgetBalance/1000).toFixed(1)}k`} 
            icon={Wallet} 
            color={budgetBalance < 0 ? "text-[#E31B23]" : "text-emerald-600"}
         />
      </div>

      {/* 3. PERFORMANCE ANALYTICS */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-8 h-[400px] lg:h-[500px]">
        <div className="xl:col-span-12 industrial-card p-6 lg:p-10 flex flex-col">
           <div className="flex justify-between items-center mb-6 lg:mb-10">
              <h3 className="text-xs font-black text-[#1A3673] uppercase tracking-[0.2em] flex items-center gap-3">
                 <BarChart3 size={18} /> Volume de Ordens ({activeUnit.name})
              </h3>
              <div className="flex items-center gap-2">
                 <div className="w-2 h-2 rounded-full bg-[#1A3673]"></div>
                 <span className="text-[8px] font-bold text-slate-400 uppercase tracking-widest italic hidden sm:inline">Aberturas Diárias ({dateFilter.toUpperCase()})</span>
              </div>
           </div>
           <div className="flex-1 w-full min-h-[300px]">
              {chartData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={chartData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                      <XAxis dataKey="date" stroke="#94a3b8" fontSize={10} axisLine={false} tickLine={false} fontFamily="JetBrains Mono" />
                      <YAxis stroke="#94a3b8" fontSize={10} axisLine={false} tickLine={false} fontFamily="JetBrains Mono" />
                      <Tooltip contentStyle={{ borderRadius: '12px', border: '1px solid #e2e8f0', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)', fontFamily: 'Plus Jakarta Sans', fontWeight: 'bold', fontSize: '10px' }} />
                      <Area type="monotone" dataKey="count" stroke="#1A3673" strokeWidth={3} fill="url(#colorVal)" />
                      <defs>
                        <linearGradient id="colorVal" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#1A3673" stopOpacity={0.1}/>
                          <stop offset="95%" stopColor="#1A3673" stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                  </AreaChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-full flex items-center justify-center text-slate-300 text-[10px] font-black uppercase tracking-widest italic flex-col gap-2">
                   <TrendingUp size={32} className="opacity-20"/>
                   Sem dados para o período selecionado nesta unidade
                </div>
              )}
           </div>
        </div>
      </div>
    </div>
  );
};

const MetricBox = ({ label, value, icon: Icon, color = 'text-[#1A3673]', alert, trendValue, inverse = false }: any) => {
  let trendColor = 'text-slate-400';
  let TrendIcon = ArrowUpRight;
  
  if (trendValue !== undefined && trendValue !== 0) {
      const isPositive = trendValue > 0;
      const isGood = inverse ? !isPositive : isPositive;
      trendColor = isGood ? 'text-emerald-600' : 'text-[#E31B23]';
      TrendIcon = isPositive ? ArrowUpRight : ArrowDownRight;
  }

  return (
    <div className={`industrial-card p-6 lg:p-8 group relative overflow-hidden ${alert ? 'border-[#E31B23] bg-red-50/10' : ''}`}>
       <div className="flex justify-between items-start relative z-10">
          <div className="space-y-3">
             <p className="text-[8px] font-bold text-slate-400 uppercase tracking-[0.2em]">{label}</p>
             <h4 className={`text-2xl lg:text-3xl font-black italic tracking-tighter ${color}`}>{value}</h4>
             
             {trendValue !== undefined && (
                <div className={`flex items-center gap-1 text-[9px] font-bold uppercase tracking-widest ${trendColor}`}>
                   <TrendIcon size={12} />
                   <span>{Math.abs(trendValue).toFixed(1)}%</span>
                </div>
             )}
          </div>
          <div className={`p-3 rounded-xl transition-all ${alert ? 'bg-[#E31B23] text-white animate-pulse' : 'bg-slate-50 text-[#1A3673] group-hover:bg-[#1A3673] group-hover:text-white'}`}>
             <Icon size={20} />
          </div>
       </div>
    </div>
  );
};

const TrendBadge = ({ value, inverseTheme = false }: { value: number, inverseTheme?: boolean }) => {
   if (value === 0) return null;
   const isPositive = value > 0;
   
   if (inverseTheme) {
      return (
         <span className={`text-[8px] font-black px-1.5 py-0.5 rounded flex items-center gap-0.5 ${isPositive ? 'bg-emerald-500/20 text-emerald-300' : 'bg-red-500/20 text-red-300'}`}>
            {isPositive ? <ArrowUpRight size={8} /> : <ArrowDownRight size={8} />}
            {Math.abs(value).toFixed(0)}%
         </span>
      );
   }

   return (
      <span className={`text-[8px] font-black px-1.5 py-0.5 rounded flex items-center gap-0.5 ${isPositive ? 'bg-emerald-50 text-emerald-600' : 'bg-red-50 text-[#E31B23]'}`}>
         {isPositive ? <ArrowUpRight size={8} /> : <ArrowDownRight size={8} />}
         {Math.abs(value).toFixed(0)}%
      </span>
   );
};

export default Dashboard;
