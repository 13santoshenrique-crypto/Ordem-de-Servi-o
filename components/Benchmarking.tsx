
import React, { useMemo, useState } from 'react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  Radar, RadarChart, PolarGrid, PolarAngleAxis, Legend, Cell
} from 'recharts';
import { GitCompare, Trophy, TrendingDown, Target, Calendar } from 'lucide-react';
import { Unit, ServiceOrder } from '../types';

interface BenchmarkingProps {
  units: Unit[];
  orders: ServiceOrder[];
  currentUserUnitId: string;
}

const Benchmarking: React.FC<BenchmarkingProps> = ({ units, orders, currentUserUnitId }) => {
  const [dateFilter, setDateFilter] = useState('30d');

  // Filtragem de ordens por data
  const filteredOrdersByDate = useMemo(() => {
    const now = new Date();
    return orders.filter(order => {
      const orderDate = new Date(order.requestDate);
      if (dateFilter === '7d') return (now.getTime() - orderDate.getTime()) <= 7 * 24 * 60 * 60 * 1000;
      if (dateFilter === '30d') return (now.getTime() - orderDate.getTime()) <= 30 * 24 * 60 * 60 * 1000;
      if (dateFilter === '90d') return (now.getTime() - orderDate.getTime()) <= 90 * 24 * 60 * 60 * 1000;
      return true; // 'Anual' ou todos
    });
  }, [orders, dateFilter]);

  const visibleUnits = useMemo(() => {
    // Mostra unidade atual + unidades que autorizaram compartilhamento
    return units.filter(u => u.id === currentUserUnitId || u.shareDashboard);
  }, [units, currentUserUnitId]);

  const comparativeData = useMemo(() => {
    return visibleUnits.map(unit => {
      const unitOrders = filteredOrdersByDate.filter(o => o.unitId === unit.id);
      const totalCost = unitOrders.reduce((a, b) => a + (b.cost || 0), 0);
      const avgCost = unitOrders.length ? totalCost / unitOrders.length : 0;
      const finished = unitOrders.filter(o => o.status === 'Finalizada').length;
      const efficiency = unitOrders.length ? (finished / unitOrders.length) * 100 : 0;
      const preventive = unitOrders.filter(o => o.type === 'Preventivo').length;
      const prevRatio = unitOrders.length ? (preventive / unitOrders.length) * 100 : 0;

      return {
        name: unit.name,
        avgCost: Math.round(avgCost),
        efficiency: Math.round(efficiency),
        prevRatio: Math.round(prevRatio),
        isCurrent: unit.id === currentUserUnitId
      };
    });
  }, [visibleUnits, filteredOrdersByDate, currentUserUnitId]);

  const radarData = comparativeData.map(d => ({
    subject: d.name,
    A: d.efficiency,
    B: d.prevRatio,
    fullMark: 100,
  }));

  return (
    <div className="space-y-6">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-white flex items-center gap-2">
            <GitCompare className="text-indigo-400" />
            Comparativo entre Unidades
          </h2>
          <p className="text-white/40 text-sm">Análise de desempenho e custos entre unidades Aviagen</p>
        </div>
        
        <div className="flex items-center gap-2 p-1 bg-white/5 rounded-xl border border-white/10">
          <Calendar size={16} className="text-white/30 ml-2" />
          {['7d', '30d', '90d', 'Anual'].map((range) => (
            <button
              key={range}
              onClick={() => setDateFilter(range)}
              className={`px-4 py-1.5 text-[10px] font-black uppercase tracking-widest rounded-lg transition-all ${
                dateFilter === range ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/20' : 'text-white/40 hover:text-white/60'
              }`}
            >
              {range}
            </button>
          ))}
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Gráfico de Custo Médio por Unidade */}
        <div className="glass p-8 rounded-[2.5rem] border border-white/10 shadow-2xl relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-600/5 blur-3xl -mr-16 -mt-16 group-hover:bg-indigo-600/10 transition-colors"></div>
          
          <h3 className="text-lg font-bold mb-8 flex items-center gap-3">
            <div className="p-2 bg-emerald-500/10 rounded-lg text-emerald-400">
              <TrendingDown size={20} />
            </div>
            Custo Médio por OS (R$)
          </h3>
          
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={comparativeData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#ffffff05" vertical={false} />
                <XAxis 
                  dataKey="name" 
                  stroke="#ffffff40" 
                  fontSize={10} 
                  tickLine={false} 
                  axisLine={false} 
                  dy={10}
                  tickFormatter={(val) => val.split(' ')[1] || val}
                />
                <YAxis stroke="#ffffff40" fontSize={10} tickLine={false} axisLine={false} />
                <Tooltip 
                  cursor={{ fill: 'rgba(255,255,255,0.03)' }}
                  contentStyle={{ backgroundColor: '#1e293b', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '16px', boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.5)' }}
                  itemStyle={{ color: '#fff', fontSize: '12px', fontWeight: 'bold' }}
                  labelStyle={{ color: '#6366f1', marginBottom: '4px', fontSize: '10px', fontWeight: '900', textTransform: 'uppercase' }}
                />
                <Bar dataKey="avgCost" radius={[12, 12, 0, 0]} barSize={45}>
                  {comparativeData.map((entry, index) => (
                    <Cell 
                      key={`cell-${index}`} 
                      fill={entry.isCurrent ? '#6366f1' : '#334155'} 
                      fillOpacity={entry.isCurrent ? 1 : 0.4}
                      className="transition-all duration-500"
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
          
          <div className="mt-6 flex items-center justify-center gap-6">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-indigo-600"></div>
              <span className="text-[10px] font-bold text-white/50 uppercase tracking-wider">Unidade Atual</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-[#334155]"></div>
              <span className="text-[10px] font-bold text-white/50 uppercase tracking-wider">Outras Unidades</span>
            </div>
          </div>
        </div>

        {/* Radar de Eficiência Operacional */}
        <div className="glass p-8 rounded-[2.5rem] border border-white/10 shadow-2xl relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-32 h-32 bg-purple-600/5 blur-3xl -mr-16 -mt-16 group-hover:bg-purple-600/10 transition-colors"></div>
          
          <h3 className="text-lg font-bold mb-8 flex items-center gap-3">
            <div className="p-2 bg-indigo-500/10 rounded-lg text-indigo-400">
              <Target size={20} />
            </div>
            Eficiência vs Ratio Preventivo
          </h3>
          
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart cx="50%" cy="50%" outerRadius="80%" data={radarData}>
                <PolarGrid stroke="#ffffff10" />
                <PolarAngleAxis dataKey="subject" stroke="#ffffff40" fontSize={10} />
                <Radar name="Eficiência (%)" dataKey="A" stroke="#6366f1" fill="#6366f1" fillOpacity={0.4} />
                <Radar name="Preventiva (%)" dataKey="B" stroke="#10b981" fill="#10b981" fillOpacity={0.4} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#1e293b', border: 'none', borderRadius: '12px' }}
                />
                <Legend iconType="circle" wrapperStyle={{ fontSize: '10px', fontWeight: 'bold', paddingTop: '20px' }} />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Leaderboard Refinado */}
      <div className="glass rounded-[2.5rem] border border-white/10 overflow-hidden shadow-2xl">
        <div className="p-8 border-b border-white/5 bg-white/2 flex items-center justify-between">
          <h3 className="font-bold text-xl flex items-center gap-3">
            <Trophy size={24} className="text-amber-400" />
            Ranking de Excelência Operacional
          </h3>
          <span className="text-[10px] font-black bg-emerald-500/20 text-emerald-400 px-3 py-1 rounded-full uppercase tracking-tighter">
            Atualizado em tempo real
          </span>
        </div>
        <div className="p-8 grid grid-cols-1 md:grid-cols-2 gap-4">
          {comparativeData.sort((a, b) => b.efficiency - a.efficiency).map((unit, idx) => (
            <div 
              key={unit.name} 
              className={`flex items-center justify-between p-5 rounded-2xl transition-all duration-300 hover:scale-[1.02] ${
                unit.isCurrent 
                  ? 'bg-indigo-600/10 border border-indigo-500/20 shadow-lg shadow-indigo-600/5' 
                  : 'bg-white/5 border border-white/5'
              }`}
            >
              <div className="flex items-center gap-5">
                <span className={`text-3xl font-black italic ${idx === 0 ? 'text-amber-400' : 'text-white/10'}`}>
                  {String(idx + 1).padStart(2, '0')}
                </span>
                <div>
                  <div className="flex items-center gap-2">
                    <p className="font-bold text-white text-lg">{unit.name}</p>
                    {unit.isCurrent && <span className="bg-indigo-600 text-[8px] font-black px-1.5 py-0.5 rounded text-white uppercase tracking-widest">Sua Unidade</span>}
                  </div>
                  <p className="text-xs text-white/40 font-medium">Preventiva: {unit.prevRatio}%</p>
                </div>
              </div>
              <div className="text-right">
                <div className="flex flex-col items-end">
                  <span className="text-xs font-bold text-white/30 uppercase tracking-widest mb-1">Eficiência</span>
                  <p className={`text-2xl font-black ${unit.efficiency > 90 ? 'text-emerald-400' : 'text-indigo-400'}`}>
                    {unit.efficiency}%
                  </p>
                </div>
                <div className="h-1.5 w-32 bg-white/5 rounded-full mt-2 overflow-hidden">
                  <div 
                    className={`h-full rounded-full transition-all duration-1000 ${unit.efficiency > 90 ? 'bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.5)]' : 'bg-indigo-500'}`} 
                    style={{ width: `${unit.efficiency}%` }}
                  ></div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Benchmarking;
