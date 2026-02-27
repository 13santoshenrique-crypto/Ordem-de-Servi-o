
import React, { useState, useMemo } from 'react';
import { Asset, OSStatus, RecurringTask, ExternalMaintenanceEvent } from '../types';
import { useApp } from '../context/AppContext';
import { SECTORS } from '../constants';
import { 
  Calendar as CalendarIcon, ChevronLeft, ChevronRight, Wrench, AlertCircle, CheckCircle2, Plus, Clock, AlertTriangle, FileText, X, Repeat, Trash2, Save, CloudLightning, RefreshCw, ExternalLink
} from 'lucide-react';

interface MaintenanceScheduleProps {
  onGenerateOS: (asset: Asset | ExternalMaintenanceEvent) => void;
}

type ScheduleEvent = 
  | { type: 'ASSET_MAINTENANCE'; date: string; data: Asset }
  | { type: 'OS_DEADLINE'; date: string; data: any }
  | { type: 'RECURRING_TASK'; date: string; data: RecurringTask }
  | { type: 'EXTERNAL_EVENT'; date: string; data: ExternalMaintenanceEvent };

const MaintenanceSchedule: React.FC<MaintenanceScheduleProps> = ({ onGenerateOS }) => {
  const { assets = [], orders = [], recurringTasks = [], setRecurringTasks, externalEvents = [], units = [], activeUnitId } = useApp();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [showRoutineModal, setShowRoutineModal] = useState(false);
  
  const [newRoutine, setNewRoutine] = useState<Partial<RecurringTask>>({
      title: '', description: '', intervalDays: 30, nextTriggerDate: new Date().toISOString().split('T')[0], sector: SECTORS[0], active: true
  });

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  const activeUnit = units.find(u => u.id === activeUnitId);

  const monthNames = ["Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho", "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"];

  const calendarDays = useMemo(() => {
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const firstDayOfWeek = new Date(year, month, 1).getDay();
    const days = [];
    for (let i = 0; i < firstDayOfWeek; i++) days.push(null);
    for (let i = 1; i <= daysInMonth; i++) days.push(new Date(year, month, i));
    return days;
  }, [year, month]);

  const monthlyEvents = useMemo(() => {
    const events: ScheduleEvent[] = [];
    const prefix = `${year}-${String(month + 1).padStart(2, '0')}`;

    const unitAssets = (assets || []).filter(a => a.unitId === activeUnitId);
    const unitOrders = (orders || []).filter(o => o.unitId === activeUnitId);

    unitAssets.forEach(asset => {
      if (asset.nextMaintenance && asset.nextMaintenance.startsWith(prefix)) {
        events.push({ type: 'ASSET_MAINTENANCE', date: asset.nextMaintenance, data: asset });
      }
    });

    unitOrders.forEach(os => {
      if (os.status !== OSStatus.FINISHED && os.deadline && os.deadline.startsWith(prefix)) {
        events.push({ type: 'OS_DEADLINE', date: os.deadline, data: os });
      }
    });

    (recurringTasks || []).forEach(task => {
        if (task.active && task.nextTriggerDate && task.nextTriggerDate.startsWith(prefix)) {
            events.push({ type: 'RECURRING_TASK', date: task.nextTriggerDate, data: task });
        }
    });

    (externalEvents || []).forEach(evt => {
        if (evt.date && evt.date.startsWith(prefix)) {
            events.push({ type: 'EXTERNAL_EVENT', date: evt.date, data: evt });
        }
    });

    return events.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  }, [assets, orders, recurringTasks, externalEvents, year, month]);

  const getEventsForDay = (date: Date) => {
    const dateStr = date.toISOString().split('T')[0];
    return monthlyEvents.filter(e => e.date === dateStr);
  };

  const isToday = (date: Date) => {
    const today = new Date();
    return date.getDate() === today.getDate() && date.getMonth() === today.getMonth() && date.getFullYear() === today.getFullYear();
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-700 pb-20">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div>
            <h2 className="text-3xl font-black text-[#1A3673] uppercase tracking-tighter italic">Agenda Integrada</h2>
            <p className="text-slate-400 text-xs font-bold uppercase tracking-widest">Preventivas & Rotinas</p>
         </div>
         
         <div className="flex gap-4">
             <button onClick={() => setShowRoutineModal(true)} className="bg-white border border-slate-200 text-[#1A3673] px-6 py-3 rounded-2xl shadow-sm hover:border-[#1A3673] transition-all flex items-center gap-2">
                <Repeat size={18} /><span className="text-[10px] font-black uppercase tracking-widest hidden md:inline">Rotinas</span>
             </button>

             <div className="flex items-center gap-6 bg-white p-2 rounded-2xl border border-slate-200 shadow-sm">
                <button onClick={() => setCurrentDate(new Date(year, month - 1, 1))} className="p-3 text-slate-400 hover:text-[#1A3673] transition-colors"><ChevronLeft size={24} /></button>
                <div className="text-center min-w-[150px]"><h3 className="text-xl font-black text-slate-900 uppercase tracking-tight">{monthNames[month]}</h3><p className="text-xs font-bold text-slate-400">{year}</p></div>
                <button onClick={() => setCurrentDate(new Date(year, month + 1, 1))} className="p-3 text-slate-400 hover:text-[#1A3673] transition-colors"><ChevronRight size={24} /></button>
             </div>
         </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-8">
         <div className="xl:col-span-8 bg-white p-6 lg:p-8 rounded-[2.5rem] border border-slate-200 shadow-xl">
            <div className="grid grid-cols-7 mb-4">
               {['DOM', 'SEG', 'TER', 'QUA', 'QUI', 'SEX', 'SÁB'].map(day => (<div key={day} className="text-center text-[10px] font-black text-slate-400 uppercase tracking-widest py-2">{day}</div>))}
            </div>
            <div className="grid grid-cols-7 gap-2 lg:gap-4">
               {calendarDays.map((date, idx) => {
                  if (!date) return <div key={`empty-${idx}`} className="bg-slate-50/50 rounded-2xl aspect-square"></div>;
                  const dayEvents = getEventsForDay(date);
                  const today = isToday(date);
                  return (
                     <div key={idx} className={`relative aspect-square rounded-2xl border p-2 lg:p-3 flex flex-col justify-between transition-all ${today ? 'border-[#1A3673] bg-blue-50/30' : (dayEvents.length > 0) ? 'border-slate-200 bg-white hover:border-[#1A3673] shadow-sm' : 'border-slate-100 bg-white'}`}>
                        <span className={`text-sm font-black ${today ? 'text-[#1A3673]' : 'text-slate-400'}`}>{date.getDate()}</span>
                        <div className="flex flex-col gap-1.5 items-end">
                           {dayEvents.some(e => e.type === 'OS_DEADLINE') && <div className="w-2 h-2 rounded-full bg-[#E31B23] animate-pulse"></div>}
                           {dayEvents.some(e => e.type === 'EXTERNAL_EVENT') && <div className="w-2 h-2 rounded-full bg-violet-500"></div>}
                           {dayEvents.some(e => e.type === 'ASSET_MAINTENANCE') && <div className="h-1.5 w-8 bg-[#1A3673] rounded-full"></div>}
                           {dayEvents.some(e => e.type === 'RECURRING_TASK') && <div className="w-2 h-2 rounded-full bg-emerald-500"></div>}
                        </div>
                     </div>
                  );
               })}
            </div>
         </div>

         <div className="xl:col-span-4 space-y-6">
            <div className="industrial-card p-8 bg-[#f8fafc] border-slate-200 h-full overflow-y-auto custom-scrollbar max-h-[700px]">
               <h3 className="text-sm font-black uppercase tracking-widest text-slate-500 mb-6 flex items-center gap-2"><Clock size={18} /> Linha do Tempo</h3>
               {monthlyEvents.length === 0 ? (
                  <div className="text-center py-10 opacity-50"><CheckCircle2 size={48} className="mx-auto mb-4 text-slate-300" /><p className="text-xs font-bold uppercase tracking-widest text-slate-400">Agenda livre este mês.</p></div>
               ) : (
                  <div className="space-y-4">
                     {monthlyEvents.map((event, idx) => {
                        const eventDate = new Date(event.date);
                        return (
                            <div key={idx} className="bg-white p-5 rounded-2xl border border-slate-200 hover:border-[#1A3673] transition-all group relative overflow-hidden shadow-sm">
                                <div className={`absolute left-0 top-0 bottom-0 w-1.5 ${event.type === 'EXTERNAL_EVENT' ? 'bg-violet-500' : event.type === 'OS_DEADLINE' ? 'bg-[#E31B23]' : event.type === 'RECURRING_TASK' ? 'bg-emerald-500' : 'bg-[#1A3673]'}`}></div>
                                <div className="flex justify-between items-start mb-2 pl-3">
                                    <span className="font-black text-[10px] px-2 py-1 bg-slate-100 rounded text-slate-600 uppercase">{eventDate.getDate()}/{eventDate.getMonth()+1}</span>
                                    {(event.type === 'ASSET_MAINTENANCE' || event.type === 'EXTERNAL_EVENT') && (
                                        <button onClick={() => onGenerateOS(event.data as any)} className="p-2 bg-slate-100 hover:bg-[#1A3673] hover:text-white rounded-lg transition-all opacity-0 group-hover:opacity-100"><Plus size={14}/></button>
                                    )}
                                </div>
                                <div className="pl-3">
                                    <h4 className="font-bold text-sm text-slate-800 truncate">
                                        {event.type === 'RECURRING_TASK' 
                                            ? (event.data as any).title 
                                            : event.type === 'OS_DEADLINE' 
                                                ? `Deadline OS #${(event.data as any).id?.split('-')?.[2] || (event.data as any).id || 'N/A'}` 
                                                : (event.data as any).name || (event.data as any).title}
                                    </h4>
                                    <p className="text-[10px] text-slate-400 uppercase tracking-widest mt-1">{event.type}</p>
                                </div>
                            </div>
                        );
                     })}
                  </div>
               )}
            </div>
         </div>
      </div>

      {/* Modal de Gestão de Rotinas */}
      {showRoutineModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[1000] flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-4xl rounded-[2.5rem] shadow-2xl overflow-hidden flex flex-col max-h-[90vh] animate-in zoom-in-95 duration-300">
            <div className="p-8 bg-[#1A3673] text-white flex justify-between items-center">
              <div>
                <h3 className="text-2xl font-black uppercase italic leading-none">Gestão de Rotinas</h3>
                <p className="text-white/60 text-[10px] font-bold uppercase tracking-widest mt-2">Tarefas Recorrentes & Checklists</p>
              </div>
              <button onClick={() => setShowRoutineModal(false)} className="p-3 hover:bg-white/10 rounded-2xl transition-all"><X size={24} /></button>
            </div>

            <div className="flex-1 overflow-y-auto p-8 custom-scrollbar">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
                {/* Lista de Rotinas Atuais */}
                <div className="space-y-6">
                  <h4 className="text-xs font-black text-slate-900 uppercase tracking-widest flex items-center gap-2">
                    <Repeat size={16} className="text-[#1A3673]" /> Rotinas Ativas
                  </h4>
                  <div className="space-y-3">
                    {recurringTasks.length === 0 ? (
                      <div className="p-8 border-2 border-dashed border-slate-100 rounded-3xl text-center">
                        <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Nenhuma rotina cadastrada</p>
                      </div>
                    ) : (
                      recurringTasks.map(task => (
                        <div key={task.id} className="p-4 bg-slate-50 rounded-2xl border border-slate-100 flex justify-between items-center group">
                          <div>
                            <p className="font-bold text-sm text-slate-800">{task.title}</p>
                            <p className="text-[10px] text-slate-400 uppercase font-bold">A cada {task.intervalDays} dias • {task.sector}</p>
                          </div>
                          <button 
                            onClick={() => setRecurringTasks(prev => prev.filter(t => t.id !== task.id))}
                            className="p-2 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all opacity-0 group-hover:opacity-100"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      ))
                    )}
                  </div>
                </div>

                {/* Formulário de Nova Rotina */}
                <div className="bg-slate-50 p-8 rounded-[2rem] border border-slate-100 space-y-6">
                  <h4 className="text-xs font-black text-slate-900 uppercase tracking-widest">Nova Rotina</h4>
                  <div className="space-y-4">
                    <div>
                      <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1 block">Título da Tarefa</label>
                      <input 
                        type="text" 
                        value={newRoutine.title}
                        onChange={e => setNewRoutine({...newRoutine, title: e.target.value})}
                        className="w-full bg-white border border-slate-200 rounded-xl px-4 py-3 text-sm font-bold focus:border-[#1A3673] outline-none transition-all"
                        placeholder="Ex: Limpeza de Filtros"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1 block">Intervalo (Dias)</label>
                        <input 
                          type="number" 
                          value={newRoutine.intervalDays}
                          onChange={e => setNewRoutine({...newRoutine, intervalDays: parseInt(e.target.value)})}
                          className="w-full bg-white border border-slate-200 rounded-xl px-4 py-3 text-sm font-bold focus:border-[#1A3673] outline-none transition-all"
                        />
                      </div>
                      <div>
                        <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1 block">Setor</label>
                        <select 
                          value={newRoutine.sector}
                          onChange={e => setNewRoutine({...newRoutine, sector: e.target.value})}
                          className="w-full bg-white border border-slate-200 rounded-xl px-4 py-3 text-sm font-bold focus:border-[#1A3673] outline-none transition-all"
                        >
                          {SECTORS.map(s => <option key={s} value={s}>{s}</option>)}
                        </select>
                      </div>
                    </div>
                    <div>
                      <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1 block">Primeira Execução</label>
                      <input 
                        type="date" 
                        value={newRoutine.nextTriggerDate}
                        onChange={e => setNewRoutine({...newRoutine, nextTriggerDate: e.target.value})}
                        className="w-full bg-white border border-slate-200 rounded-xl px-4 py-3 text-sm font-bold focus:border-[#1A3673] outline-none transition-all"
                      />
                    </div>
                    <button 
                      onClick={() => {
                        if (!newRoutine.title) return;
                        const task: RecurringTask = {
                          ...newRoutine as any,
                          id: `rot-${Date.now()}`,
                          active: true
                        };
                        setRecurringTasks(prev => [...prev, task]);
                        setNewRoutine({ title: '', description: '', intervalDays: 30, nextTriggerDate: new Date().toISOString().split('T')[0], sector: SECTORS[0], active: true });
                      }}
                      className="w-full py-4 bg-[#1A3673] text-white rounded-xl font-black uppercase text-[10px] tracking-widest shadow-lg shadow-blue-900/20 hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-2"
                    >
                      <Save size={16} /> Salvar Rotina
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MaintenanceSchedule;
