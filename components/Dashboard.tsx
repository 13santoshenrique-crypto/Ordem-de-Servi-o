
import React, { useMemo, useState } from 'react';
import { 
  Building2, Plus, Users, CheckCircle, Clock, AlertTriangle, Briefcase, Filter
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { OSStatus, ServiceType } from '../types';
import { 
  ResponsiveContainer, XAxis, YAxis, CartesianGrid, Tooltip, 
  BarChart, Bar, Legend
} from 'recharts';

const Dashboard: React.FC<any> = ({ onRequestNewOS, onReviewAssets }) => {
  const { orders, units, activeUnitId, users } = useApp();
  const [sectorFilter, setSectorFilter] = useState('ALL');
  const activeUnit = units.find(u => u.id === activeUnitId) || units[0] || { name: 'Unidade não encontrada' };

  // Cálculo de Métricas Principais
  const metrics = useMemo(() => {
    const unitOrders = orders.filter(o => o.unitId === activeUnitId && (sectorFilter === 'ALL' || o.sector === sectorFilter));
    
    const open = unitOrders.filter(o => o.status === OSStatus.OPEN).length;
    const finished = unitOrders.filter(o => o.status === OSStatus.FINISHED).length;
    
    // Total de horas registradas
    const totalHours = unitOrders.reduce((acc, o) => acc + (o.timeSpent || 0), 0);
    
    return { open, finished, totalHours, total: unitOrders.length };
  }, [orders, activeUnitId]);

  // Dados para o Gráfico de Produtividade (Horas por Técnico)
  const techData = useMemo(() => {
    const unitUsers = users.filter(u => u.unitId === activeUnitId);
    const unitOrders = orders.filter(o => o.unitId === activeUnitId && (sectorFilter === 'ALL' || o.sector === sectorFilter));

    return unitUsers.map(user => {
        const userOrders = unitOrders.filter(o => o.technicianId === user.id);
        const hours = userOrders.reduce((acc, o) => acc + (o.timeSpent || 0), 0);
        const count = userOrders.length;
        return {
            name: user.name?.split(' ')[0] || 'Colaborador', // Primeiro nome
            fullName: user.name,
            hours: Number(hours.toFixed(1)),
            count
        };
    }).filter(u => u.count > 0).sort((a, b) => b.hours - a.hours);
  }, [orders, users, activeUnitId]);

  return (
    <div className="space-y-6 pb-12 animate-in fade-in duration-500">
      
      {/* Cabeçalho */}
      <div className="industrial-card p-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-l-4 border-l-[#1A3673]">
        <div className="flex items-center gap-4">
           <div className="p-3 bg-blue-50 text-[#1A3673] rounded-xl"><Building2 size={24} /></div>
           <div>
              <h2 className="text-xl font-bold text-slate-800">{activeUnit.name}</h2>
              <p className="text-sm text-slate-500">Visão Geral da Operação</p>
           </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 bg-slate-50 p-2 rounded-xl border border-slate-200">
            <Filter size={14} className="text-slate-400 ml-2" />
            <select 
              className="bg-transparent border-none text-[10px] font-black uppercase outline-none text-slate-600 pr-4"
              value={sectorFilter}
              onChange={e => setSectorFilter(e.target.value)}
            >
              <option value="ALL">Todos Setores</option>
              <option value="SALA DE MÁQUINAS">Sala de Máquinas</option>
              <option value="EXPEDIÇÃO">Expedição</option>
              <option value="INCUBAÇÃO">Incubação</option>
              <option value="NASCEDOUROS">Nascedouros</option>
              <option value="VACINAÇÃO">Vacinação</option>
              <option value="ADMINISTRATIVO">Administrativo</option>
              <option value="EXTERNO">Externo</option>
            </select>
          </div>
          <button onClick={onRequestNewOS} className="btn-primary flex items-center gap-2">
            <Plus size={16} /> Nova Ordem
          </button>
        </div>
      </div>

      {/* Cards de KPI */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
         {/* Card OS Abertas */}
         <div className="industrial-card p-6 flex items-center justify-between relative overflow-hidden group">
            <div className="absolute right-0 top-0 p-6 opacity-5 group-hover:opacity-10 transition-opacity"><AlertTriangle size={80} /></div>
            <div>
                <p className="text-sm font-bold text-slate-500 uppercase mb-1">OS em Aberto</p>
                <h3 className="text-4xl font-black text-[#E31B23]">{metrics.open}</h3>
            </div>
            <div className="p-3 bg-red-50 text-[#E31B23] rounded-lg">
                <Clock size={24} />
            </div>
         </div>

         {/* Card OS Fechadas */}
         <div className="industrial-card p-6 flex items-center justify-between relative overflow-hidden group">
            <div className="absolute right-0 top-0 p-6 opacity-5 group-hover:opacity-10 transition-opacity"><CheckCircle size={80} /></div>
            <div>
                <p className="text-sm font-bold text-slate-500 uppercase mb-1">OS Finalizadas</p>
                <h3 className="text-4xl font-black text-[#1A3673]">{metrics.finished}</h3>
            </div>
            <div className="p-3 bg-blue-50 text-[#1A3673] rounded-lg">
                <CheckCircle size={24} />
            </div>
         </div>

         {/* Card Horas Totais */}
         <div className="industrial-card p-6 flex items-center justify-between relative overflow-hidden group">
            <div className="absolute right-0 top-0 p-6 opacity-5 group-hover:opacity-10 transition-opacity"><Briefcase size={80} /></div>
            <div>
                <p className="text-sm font-bold text-slate-500 uppercase mb-1">Horas Trabalhadas</p>
                <h3 className="text-4xl font-black text-emerald-600">{metrics.totalHours.toFixed(1)}h</h3>
            </div>
            <div className="p-3 bg-emerald-50 text-emerald-600 rounded-lg">
                <Users size={24} />
            </div>
         </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Gráfico de Horas por Técnico */}
        <div className="lg:col-span-8 industrial-card p-6">
           <div className="flex justify-between items-center mb-6">
              <div>
                 <h3 className="font-bold text-slate-800 text-lg">Produtividade da Equipe</h3>
                 <p className="text-xs text-slate-400 font-bold uppercase">Horas aplicadas por técnico</p>
              </div>
           </div>
           
           <div className="h-[350px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={techData} margin={{ top: 20, right: 30, left: 0, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F5F9" />
                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#64748B', fontSize: 12, fontWeight: 600 }} dy={10} />
                    <YAxis axisLine={false} tickLine={false} tick={{ fill: '#64748B', fontSize: 12 }} />
                    <Tooltip 
                        cursor={{ fill: '#F8FAFC' }}
                        contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}
                    />
                    <Bar name="Horas Trabalhadas" dataKey="hours" fill="#1A3673" radius={[4, 4, 0, 0]} barSize={40} />
                </BarChart>
              </ResponsiveContainer>
           </div>
        </div>

        {/* Lista Resumida */}
        <div className="lg:col-span-4 industrial-card p-6 flex flex-col">
            <h3 className="font-bold text-slate-800 text-lg mb-4">Top Executores</h3>
            <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar space-y-4">
                {techData.length === 0 ? (
                    <p className="text-slate-400 text-sm text-center py-10">Sem dados registrados.</p>
                ) : (
                    techData.map((tech, idx) => (
                        <div key={idx} className="flex items-center justify-between p-3 rounded-lg hover:bg-slate-50 transition-colors border border-transparent hover:border-slate-100">
                           <div className="flex items-center gap-3">
                               <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-xs font-black text-white ${idx === 0 ? 'bg-[#E31B23]' : 'bg-slate-300'}`}>
                                   {idx + 1}
                               </div>
                               <div>
                                   <p className="text-sm font-bold text-slate-700">{tech.fullName}</p>
                                   <p className="text-[10px] font-bold text-slate-400 uppercase">{tech.count} Ordens Fechadas</p>
                               </div>
                           </div>
                           <span className="text-sm font-black text-[#1A3673]">{tech.hours}h</span>
                        </div>
                    ))
                )}
            </div>
            <button onClick={onReviewAssets} className="w-full mt-4 py-3 border border-slate-200 text-slate-500 rounded-lg text-xs font-bold hover:bg-slate-50 hover:text-[#1A3673] transition-all">
                Ver Inventário de Ativos
            </button>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
