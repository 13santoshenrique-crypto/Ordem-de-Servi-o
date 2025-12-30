
import React, { useMemo, useState, useEffect, useRef } from 'react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, 
  PieChart, Pie, Cell, LabelList
} from 'recharts';
import { 
  Activity, Scale, Settings, 
  ShieldAlert, Clock, UserCheck, 
  PieChart as PieIcon, BarChart3
} from 'lucide-react';
import { ServiceOrder, User, Unit, InventoryItem, MonthlyExpense, UserRole, ServiceType, OSStatus } from '../types';

interface DashboardProps {
  orders: ServiceOrder[];
  users: User[];
  inventory: InventoryItem[];
  expenses: MonthlyExpense[];
  currentUnitId: string;
  unit: Unit;
  role: UserRole;
}

const Dashboard: React.FC<DashboardProps> = ({ orders, users, unit }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [chartWidth, setChartWidth] = useState(0);

  // Efeito para medir o tamanho do card assim que ele aparece
  useEffect(() => {
    const updateSize = () => {
      if (containerRef.current) {
        setChartWidth(containerRef.current.offsetWidth - 40);
      }
    };
    
    // Pequeno delay para a animação de fade-in terminar
    const timer = setTimeout(updateSize, 300);
    window.addEventListener('resize', updateSize);
    
    return () => {
      window.removeEventListener('resize', updateSize);
      clearTimeout(timer);
    };
  }, [orders]);

  // 1. Estatísticas Principais
  const stats = useMemo(() => {
    const finished = orders.filter(o => o.status === OSStatus.FINISHED);
    const totalHours = finished.reduce((acc, o) => acc + (Number(o.timeSpent) || 0), 0);
    
    const activeCorrective = orders.filter(o => o.type === ServiceType.CORRECTIVE && o.status === OSStatus.OPEN).length;
    
    const activePreventive = orders.filter(o => 
      (o.type === ServiceType.PREVENTIVE || o.type === ServiceType.PREDICTIVE) && 
      o.status === OSStatus.OPEN
    ).length;

    const totalCost = orders.reduce((acc, o) => acc + (Number(o.cost) || 0), 0);
    const totalOS = orders.length || 1;
    const preventiveHealth = (orders.filter(o => o.type !== ServiceType.CORRECTIVE).length / totalOS) * 100;

    return { totalHours, activeCorrective, activePreventive, totalCost, preventiveHealth, totalOS, finishedCount: finished.length };
  }, [orders]);

  // 2. Dados do Gráfico de Produtividade
  const technicianWorkload = useMemo(() => {
    const workloadMap: Record<string, number> = {};

    orders.forEach(order => {
      if (order.status === OSStatus.FINISHED) {
        const hours = Number(order.timeSpent);
        if (hours > 0) {
          const techId = order.technicianId;
          workloadMap[techId] = (workloadMap[techId] || 0) + hours;
        }
      }
    });

    return Object.entries(workloadMap)
      .map(([techId, hours]) => {
        const user = users.find(u => u.id === techId);
        return {
          name: user ? user.name.split(' ')[0].toUpperCase() : 'TÉCNICO',
          horas: Number(hours.toFixed(1))
        };
      })
      .sort((a, b) => b.horas - a.horas);
  }, [orders, users]);

  const osTypeData = [
    { name: 'CORRETIVAS', value: orders.filter(o => o.type === ServiceType.CORRECTIVE).length, color: '#e31b23' },
    { name: 'PREVENTIVAS', value: orders.filter(o => o.type === ServiceType.PREVENTIVE).length, color: '#0047ba' },
    { name: 'PREDITIVAS', value: orders.filter(o => o.type === ServiceType.PREDICTIVE).length, color: '#10b981' }
  ].filter(d => d.value > 0);

  return (
    <div className="space-y-8 animate-in fade-in duration-700 pb-12">
      <header className="flex flex-col md:flex-row items-center justify-between gap-6 p-8 industrial-card rounded-[2.5rem]">
        <div className="flex items-center gap-6">
          <div className="w-14 h-14 bg-[#0047ba] flex items-center justify-center text-white shadow-xl rounded-2xl">
            <Settings size={28} />
          </div>
          <div>
            <h1 className="text-2xl font-black text-theme-main tracking-tighter uppercase italic">
              Unidade <span className="text-[#0047ba]">{unit.name}</span>
            </h1>
            <p className="text-[10px] font-black text-theme-muted uppercase tracking-[0.3em] mt-1">Status de Ativos Industrial</p>
          </div>
        </div>
        <div className="flex gap-8">
          <div className="text-right border-r border-theme pr-8">
            <p className="text-[9px] font-black text-theme-muted uppercase tracking-widest">Eventos Totais</p>
            <p className="text-3xl font-black text-theme-main mono">{stats.totalOS}</p>
          </div>
          <div className="text-right">
            <p className="text-[9px] font-black text-theme-muted uppercase tracking-widest">Saúde Preventiva</p>
            <p className={`text-3xl font-black mono ${stats.preventiveHealth > 70 ? 'text-emerald-500' : 'text-amber-500'}`}>
              {Math.round(stats.preventiveHealth)}%
            </p>
          </div>
        </div>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <BigNumberCard 
          label="HORAS TÉCNICAS (H/H)" 
          value={`${stats.totalHours}h`} 
          sub="Tempo Real Consolidado"
          icon={Clock}
          color="text-[#0047ba]"
        />
        <BigNumberCard 
          label="CORRETIVAS ATIVAS" 
          value={stats.activeCorrective} 
          sub="Urgências em Aberto"
          icon={ShieldAlert}
          color="text-[#e31b23]"
          alert={stats.activeCorrective > 0}
        />
        <BigNumberCard 
          label="PLANEJADAS" 
          value={stats.activePreventive} 
          sub="Ações Pendentes"
          icon={Activity}
          color="text-emerald-500"
        />
        <BigNumberCard 
          label="INVESTIMENTO TOTAL" 
          value={`${unit.currency} ${stats.totalCost.toLocaleString()}`} 
          sub="Custo Manutenção"
          icon={Scale}
          color="text-theme-main"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 industrial-card p-10 rounded-[3rem] min-h-[550px] flex flex-col">
          <div className="flex items-center justify-between mb-10">
            <h3 className="text-lg font-black text-theme-main uppercase tracking-widest flex items-center gap-3">
              <UserCheck size={22} className="text-[#0047ba]" /> Produtividade Técnica (H/H)
            </h3>
          </div>
          
          <div ref={containerRef} className="flex-1 w-full flex items-center justify-center bg-black/20 rounded-[2rem] overflow-hidden min-h-[400px]">
            {technicianWorkload.length > 0 && chartWidth > 0 ? (
              <BarChart 
                width={chartWidth} 
                height={400} 
                data={technicianWorkload} 
                layout="vertical" 
                margin={{ left: 10, right: 60, top: 20, bottom: 20 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" horizontal={false} />
                <XAxis type="number" hide domain={[0, 'auto']} />
                <YAxis 
                  dataKey="name" 
                  type="category" 
                  stroke="var(--text-main)" 
                  fontSize={11} 
                  fontWeight="900" 
                  width={90} 
                  axisLine={false} 
                  tickLine={false} 
                />
                <Tooltip 
                  cursor={{ fill: 'rgba(255,255,255,0.03)' }} 
                  contentStyle={{ backgroundColor: '#0f172a', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px' }} 
                />
                <Bar dataKey="horas" fill="#0047ba" radius={[0, 8, 8, 0]} barSize={32}>
                   <LabelList dataKey="horas" position="right" fill="var(--text-main)" fontSize={12} fontWeight="900" formatter={(v: any) => `${v}h`} />
                </Bar>
              </BarChart>
            ) : (
              <div className="flex flex-col items-center justify-center text-center opacity-30 space-y-6">
                 <div className="p-6 rounded-full bg-white/5 border border-white/5 animate-pulse">
                    <BarChart3 size={60} className="text-[#0047ba]" />
                 </div>
                 <div className="space-y-2">
                    <p className="text-xl font-black uppercase tracking-tighter">Aguardando Baixas de OS</p>
                    <p className="text-[9px] font-bold uppercase tracking-widest italic max-w-xs px-6">
                      Os dados aparecerão aqui assim que uma Ordem de Serviço for Finalizada com tempo registrado na aba Manutenção.
                    </p>
                 </div>
              </div>
            )}
          </div>
        </div>

        <div className="industrial-card p-10 rounded-[3rem] flex flex-col items-center">
          <h3 className="text-lg font-black text-theme-main uppercase tracking-widest flex items-center gap-3 mb-10 w-full">
            <PieIcon size={22} className="text-[#e31b23]" /> Mix de Eventos
          </h3>
          <div className="h-[280px] w-full flex items-center justify-center">
            {chartWidth > 0 && osTypeData.length > 0 ? (
              <PieChart width={250} height={250}>
                <Pie
                  data={osTypeData}
                  cx="50%"
                  cy="50%"
                  innerRadius={65}
                  outerRadius={95}
                  paddingAngle={8}
                  dataKey="value"
                >
                  {osTypeData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            ) : (
              <div className="text-center opacity-20 font-black uppercase text-[10px]">Sem dados para o Mix</div>
            )}
          </div>
          <div className="w-full mt-8 space-y-4">
            {osTypeData.map((item) => (
              <div key={item.name} className="flex items-center justify-between p-4 rounded-2xl bg-theme-main/5 border border-theme">
                <div className="flex items-center gap-3">
                  <div className="w-4 h-4 rounded-md" style={{ backgroundColor: item.color }}></div>
                  <span className="text-[10px] font-black text-theme-main uppercase tracking-widest">{item.name}</span>
                </div>
                <span className="text-lg font-black text-theme-main mono">{item.value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

const BigNumberCard = ({ label, value, sub, icon: Icon, color, alert }: any) => (
  <div className={`industrial-card p-8 rounded-[2.5rem] relative overflow-hidden group hover:border-[#0047ba]/40 transition-all ${alert ? 'animate-pulse border-[#e31b23]/40' : ''}`}>
    <div className="absolute top-0 right-0 p-6 opacity-5 group-hover:opacity-10 transition-opacity">
      <Icon size={80} />
    </div>
    <p className="text-[10px] font-black text-theme-muted uppercase tracking-[0.3em] mb-4">{label}</p>
    <div className="flex items-baseline gap-2">
      <h4 className={`text-3xl font-black tracking-tighter italic ${color}`}>{value}</h4>
    </div>
    <div className="mt-6 pt-6 border-t border-theme flex items-center justify-between">
       <span className="text-[9px] font-black text-theme-muted uppercase italic tracking-widest">{sub}</span>
       <Icon size={16} className="text-theme-muted" />
    </div>
  </div>
);

export default Dashboard;
