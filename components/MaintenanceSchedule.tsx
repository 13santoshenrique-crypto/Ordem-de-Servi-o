
import React, { useState, useMemo } from 'react';
import { Asset, ServiceType, OSStatus, RecurringTask, ExternalMaintenanceEvent } from '../types';
import { useApp } from '../context/AppContext';
import { SECTORS, LUZIANIA_UNIT_ID } from '../constants';
import { 
  Calendar as CalendarIcon, ChevronLeft, ChevronRight, Wrench, AlertCircle, CheckCircle2, Plus, Clock, AlertTriangle, FileText, Settings, X, Repeat, Trash2, Save, CloudLightning, Activity, RefreshCw, DownloadCloud, WifiOff, ExternalLink
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
  const { assets, orders, recurringTasks, setRecurringTasks, externalEvents, syncEagleTrax, units } = useApp();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [showRoutineModal, setShowRoutineModal] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncError, setSyncError] = useState(false);
  
  // State do formulário de rotina
  const [newRoutine, setNewRoutine] = useState<Partial<RecurringTask>>({
      title: '', description: '', intervalDays: 30, nextTriggerDate: new Date().toISOString().split('T')[0], sector: SECTORS[0], active: true
  });

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const activeUnit = units.find(u => u.id === LUZIANIA_UNIT_ID);

  const monthNames = [
    "Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho",
    "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"
  ];

  // Gera os dias do calendário
  const calendarDays = useMemo(() => {
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const firstDayOfWeek = new Date(year, month, 1).getDay(); // 0 = Domingo
    
    const days = [];
    // Dias vazios do mês anterior
    for (let i = 0; i < firstDayOfWeek; i++) {
      days.push(null);
    }
    // Dias do mês atual
    for (let i = 1; i <= daysInMonth; i++) {
      days.push(new Date(year, month, i));
    }
    return days;
  }, [year, month]);

  // COMBINAÇÃO DE EVENTOS
  const monthlyEvents = useMemo(() => {
    const events: ScheduleEvent[] = [];
    const prefix = `${year}-${String(month + 1).padStart(2, '0')}`;

    assets.forEach(asset => {
      if (asset.nextMaintenance && asset.nextMaintenance.startsWith(prefix)) {
        events.push({ type: 'ASSET_MAINTENANCE', date: asset.nextMaintenance, data: asset });
      }
    });

    orders.forEach(os => {
      if (os.status !== OSStatus.FINISHED && os.deadline.startsWith(prefix)) {
        events.push({ type: 'OS_DEADLINE', date: os.deadline, data: os });
      }
    });

    recurringTasks.forEach(task => {
        if (task.active && task.nextTriggerDate.startsWith(prefix)) {
            events.push({ type: 'RECURRING_TASK', date: task.nextTriggerDate, data: task });
        }
    });

    externalEvents.forEach(evt => {
        if (evt.date.startsWith(prefix)) {
            events.push({ type: 'EXTERNAL_EVENT', date: evt.date, data: evt });
        }
    });

    return events.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  }, [assets, orders, recurringTasks, externalEvents, year, month]);

  const getEventsForDay = (date: Date) => {
    const dateStr = date.toISOString().split('T')[0];
    return monthlyEvents.filter(e => e.date === dateStr);
  };

  const handlePrevMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1));
  };

  const handleSaveRoutine = () => {
      if(!newRoutine.title || !newRoutine.intervalDays) return;
      const task: RecurringTask = {
          ...newRoutine as RecurringTask,
          id: `rt-${Date.now()}`,
          active: true
      };
      setRecurringTasks(prev => [...prev, task]);
      setNewRoutine({ title: '', description: '', intervalDays: 30, nextTriggerDate: new Date().toISOString().split('T')[0], sector: SECTORS[0], active: true });
  };

  const handleDeleteRoutine = (id: string) => {
      setRecurringTasks(prev => prev.filter(t => t.id !== id));
  };

  const handleManualSync = async () => {
      setIsSyncing(true);
      setSyncError(false);
      
      const success = await syncEagleTrax(LUZIANIA_UNIT_ID);
      
      if (!success) {
        setSyncError(true);
      }
      setIsSyncing(false);
  };

  const isToday = (date: Date) => {
    const today = new Date();
    return date.getDate() === today.getDate() && 
           date.getMonth() === today.getMonth() && 
           date.getFullYear() === today.getFullYear();
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-700 pb-20">
      
      {/* HEADER DO CRONOGRAMA */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
         <div>
            <h2 className="text-3xl font-black text-[#1A3673] uppercase tracking-tighter italic">Agenda Integrada</h2>
            <p className="text-slate-400 text-xs font-bold uppercase tracking-widest">Preventivas, Deadlines & IoT Eagle Trax</p>
         </div>
         
         <div className="flex gap-4">
             {/* Link Externo Eagle Trax */}
             <a 
                href="https://eagletrax.mypetersime.com/home" 
                target="_blank" 
                rel="noreferrer"
                className="bg-[#1A3673] text-white px-6 py-3 rounded-2xl shadow-lg hover:bg-[#2A4B94] transition-all flex items-center gap-2"
                title="Abrir Portal Oficial MyPetersime"
             >
                <ExternalLink size={18} />
                <span className="text-[10px] font-black uppercase tracking-widest hidden md:inline">Portal Eagle Trax</span>
             </a>

             {/* Botão Sync Eagle Trax */}
             <button 
                onClick={handleManualSync}
                disabled={isSyncing}
                className={`border px-6 py-3 rounded-2xl shadow-sm transition-all flex items-center gap-2 ${
                    syncError 
                    ? 'border-red-200 bg-red-50 text-red-700' 
                    : activeUnit?.eagleTraxStatus === 'CONNECTED' 
                        ? 'border-emerald-200 bg-emerald-50 text-emerald-700' 
                        : 'border-slate-200 bg-white text-[#1A3673] hover:border-[#1A3673]'
                }`}
                title={syncError ? "Falha na conexão API" : "Sincronizar Dados"}
             >
                {isSyncing ? (
                    <RefreshCw size={18} className="animate-spin" />
                ) : syncError ? (
                    <WifiOff size={18} />
                ) : (
                    <DownloadCloud size={18} />
                )}
                <div className="flex flex-col items-start leading-none">
                    <span className="text-[10px] font-black uppercase tracking-widest hidden md:inline">
                        {isSyncing ? 'Sincronizando...' : syncError ? 'Erro de Sync' : 'Atualizar Dados'}
                    </span>
                    {syncError && (
                        <span className="text-[8px] font-bold hidden md:inline opacity-70">Acesse o Portal &rarr;</span>
                    )}
                </div>
             </button>

             <button 
                onClick={() => setShowRoutineModal(true)}
                className="bg-white border border-slate-200 text-[#1A3673] px-6 py-3 rounded-2xl shadow-sm hover:border-[#1A3673] transition-all flex items-center gap-2"
             >
                <Repeat size={18} />
                <span className="text-[10px] font-black uppercase tracking-widest hidden md:inline">Rotinas</span>
             </button>

             <div className="flex items-center gap-6 bg-white p-2 rounded-2xl border border-slate-200 shadow-sm">
                <button onClick={handlePrevMonth} className="p-3 hover:bg-slate-50 text-slate-400 hover:text-[#1A3673] rounded-xl transition-colors">
                <ChevronLeft size={24} />
                </button>
                <div className="text-center min-w-[150px]">
                <h3 className="text-xl font-black text-slate-900 uppercase tracking-tight">{monthNames[month]}</h3>
                <p className="text-xs font-bold text-slate-400">{year}</p>
                </div>
                <button onClick={handleNextMonth} className="p-3 hover:bg-slate-50 text-slate-400 hover:text-[#1A3673] rounded-xl transition-colors">
                <ChevronRight size={24} />
                </button>
             </div>
         </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-8">
         
         {/* CALENDÁRIO VISUAL */}
         <div className="xl:col-span-8 bg-white p-6 lg:p-8 rounded-[2.5rem] border border-slate-200 shadow-xl">
            <div className="grid grid-cols-7 mb-4">
               {['DOM', 'SEG', 'TER', 'QUA', 'QUI', 'SEX', 'SÁB'].map(day => (
                  <div key={day} className="text-center text-[10px] font-black text-slate-400 uppercase tracking-widest py-2">
                     {day}
                  </div>
               ))}
            </div>
            
            <div className="grid grid-cols-7 gap-2 lg:gap-4">
               {calendarDays.map((date, idx) => {
                  if (!date) return <div key={`empty-${idx}`} className="bg-slate-50/50 rounded-2xl aspect-square"></div>;
                  
                  const dayEvents = getEventsForDay(date);
                  const hasAssetMaint = dayEvents.some(e => e.type === 'ASSET_MAINTENANCE');
                  const hasOSDeadline = dayEvents.some(e => e.type === 'OS_DEADLINE');
                  const hasRecurring = dayEvents.some(e => e.type === 'RECURRING_TASK');
                  const hasExternal = dayEvents.some(e => e.type === 'EXTERNAL_EVENT');
                  const today = isToday(date);

                  return (
                     <div 
                        key={idx} 
                        className={`relative aspect-square rounded-2xl border p-2 lg:p-3 flex flex-col justify-between transition-all group ${
                           today ? 'border-[#1A3673] bg-blue-50/30' : 
                           (dayEvents.length > 0) ? 'border-slate-200 bg-white hover:border-[#1A3673] hover:shadow-md' : 'border-slate-100 bg-white hover:border-slate-200'
                        }`}
                     >
                        <span className={`text-sm font-black ${today ? 'text-[#1A3673]' : 'text-slate-400'}`}>
                           {date.getDate()}
                        </span>
                        
                        <div className="flex flex-col gap-1.5 items-end">
                           {hasOSDeadline && (
                              <div className="w-2 h-2 rounded-full bg-[#E31B23] shadow-sm animate-pulse" title="Prazo de OS"></div>
                           )}
                           {hasExternal && (
                              <div className="w-2 h-2 rounded-full bg-violet-500 shadow-sm" title="Eagle Trax AI"></div>
                           )}
                           {hasAssetMaint && (
                              <div className="h-1.5 w-8 bg-[#1A3673] rounded-full opacity-80" title="Manutenção Programada"></div>
                           )}
                           {hasRecurring && (
                              <div className="w-2 h-2 rounded-full bg-emerald-500 shadow-sm" title="Automação Prevista"></div>
                           )}
                        </div>
                     </div>
                  );
               })}
            </div>
            
            <div className="flex gap-6 mt-6 ml-2 overflow-x-auto pb-2">
                <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-[#1A3673] rounded-full"></div>
                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wide">Preventiva SGI</span>
                </div>
                <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-[#E31B23] rounded-full"></div>
                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wide">Prazo Limite OS</span>
                </div>
                <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-violet-500 rounded-full"></div>
                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wide">Eagle Trax (IoT)</span>
                </div>
                <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-emerald-500 rounded-full"></div>
                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wide">Automação</span>
                </div>
            </div>
         </div>

         {/* LISTA DE TAREFAS DO MÊS */}
         <div className="xl:col-span-4 space-y-6">
            <div className="industrial-card p-8 bg-[#f8fafc] border-slate-200 h-full overflow-y-auto custom-scrollbar max-h-[700px]">
               <h3 className="text-sm font-black uppercase tracking-widest text-slate-500 mb-6 flex items-center gap-2">
                  <Clock size={18} /> Linha do Tempo
               </h3>

               {monthlyEvents.length === 0 ? (
                  <div className="text-center py-10 opacity-50">
                     <CheckCircle2 size={48} className="mx-auto mb-4 text-slate-300" />
                     <p className="text-xs font-bold uppercase tracking-widest text-slate-400">Agenda livre este mês.</p>
                  </div>
               ) : (
                  <div className="space-y-4">
                     {monthlyEvents.map((event, idx) => {
                        const eventDate = new Date(event.date);
                        const isOverdue = eventDate < new Date() && !isToday(eventDate);
                        
                        if (event.type === 'EXTERNAL_EVENT') {
                            const ext = event.data as ExternalMaintenanceEvent;
                            return (
                                <div key={`evt-${idx}`} className="bg-violet-50 p-5 rounded-2xl border border-violet-100 hover:border-violet-300 transition-all group relative overflow-hidden shadow-sm animate-in slide-in-from-right-2 duration-500">
                                    <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-violet-500"></div>
                                    <div className="flex justify-between items-start mb-2 pl-3">
                                        <div className="flex items-center gap-2">
                                            <div className="bg-white text-violet-600 font-black text-[10px] px-2 py-1 rounded-lg uppercase tracking-wide flex items-center gap-1 border border-violet-100">
                                                <CloudLightning size={10} /> {eventDate.getDate()}/{eventDate.getMonth()+1} • Eagle Trax
                                            </div>
                                        </div>
                                        <button 
                                            onClick={() => onGenerateOS(ext)}
                                            className="p-2 bg-violet-600 text-white rounded-lg opacity-0 group-hover:opacity-100 transition-opacity hover:scale-110 active:scale-95 shadow-md"
                                            title="Gerar OS Recomendada"
                                        >
                                            <Plus size={14} />
                                        </button>
                                    </div>
                                    <div className="pl-3">
                                        <h4 className="font-bold text-sm text-violet-900 mb-1 truncate">{ext.title}</h4>
                                        <p className="text-[10px] text-violet-700 font-bold uppercase tracking-wider">{ext.assetName}</p>
                                        <p className="text-[9px] text-violet-500 mt-1 line-clamp-2 leading-relaxed">{ext.description}</p>
                                    </div>
                                </div>
                            );
                        } else if (event.type === 'ASSET_MAINTENANCE') {
                            const asset = event.data as Asset;
                            return (
                                <div key={`evt-${idx}`} className="bg-white p-5 rounded-2xl border border-slate-200 hover:border-[#1A3673] transition-all group relative overflow-hidden shadow-sm">
                                    <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-[#1A3673]"></div>
                                    <div className="flex justify-between items-start mb-2 pl-3">
                                        <div className="flex items-center gap-2">
                                            <div className="bg-slate-100 text-[#1A3673] font-black text-[10px] px-2 py-1 rounded-lg uppercase tracking-wide">
                                            {eventDate.getDate()}/{eventDate.getMonth()+1} • Programado
                                            </div>
                                        </div>
                                        <button 
                                            onClick={() => onGenerateOS(asset)}
                                            className="p-2 bg-[#1A3673] text-white rounded-lg opacity-0 group-hover:opacity-100 transition-opacity hover:scale-110 active:scale-95 shadow-md"
                                            title="Gerar OS Preventiva"
                                        >
                                            <Plus size={14} />
                                        </button>
                                    </div>
                                    <div className="pl-3">
                                        <h4 className="font-bold text-sm text-slate-800 mb-1 truncate">{asset.name}</h4>
                                        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">{asset.maintenancePlanName || 'Preventiva Periódica'}</p>
                                    </div>
                                </div>
                            );
                        } else if (event.type === 'RECURRING_TASK') {
                            const task = event.data as RecurringTask;
                            return (
                                <div key={`evt-${idx}`} className="bg-white p-5 rounded-2xl border border-slate-200 hover:border-emerald-500 transition-all group relative overflow-hidden shadow-sm">
                                    <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-emerald-500"></div>
                                    <div className="flex justify-between items-start mb-2 pl-3">
                                        <div className="flex items-center gap-2">
                                            <div className="bg-emerald-50 text-emerald-600 font-black text-[10px] px-2 py-1 rounded-lg uppercase tracking-wide flex items-center gap-1">
                                            <Repeat size={10} /> {eventDate.getDate()}/{eventDate.getMonth()+1} • Automático
                                            </div>
                                        </div>
                                    </div>
                                    <div className="pl-3">
                                        <h4 className="font-bold text-sm text-slate-800 mb-1 truncate">{task.title}</h4>
                                        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">A cada {task.intervalDays} dias</p>
                                    </div>
                                </div>
                            );
                        } else {
                            const os = event.data as any; // ServiceOrder
                            return (
                                <div key={`evt-${idx}`} className="bg-white p-5 rounded-2xl border border-slate-200 hover:border-[#E31B23] transition-all group relative overflow-hidden shadow-sm">
                                    <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-[#E31B23]"></div>
                                    <div className="flex justify-between items-start mb-2 pl-3">
                                        <div className="flex items-center gap-2">
                                            <div className={`font-black text-[10px] px-2 py-1 rounded-lg uppercase tracking-wide flex items-center gap-1 ${isOverdue ? 'bg-red-100 text-[#E31B23]' : 'bg-slate-100 text-slate-600'}`}>
                                                {isOverdue && <AlertTriangle size={10}/>}
                                                {eventDate.getDate()}/{eventDate.getMonth()+1} • Deadline
                                            </div>
                                        </div>
                                    </div>
                                    <div className="pl-3">
                                        <h4 className="font-bold text-sm text-slate-800 mb-1 truncate flex items-center gap-2">
                                            <FileText size={14} className="text-[#E31B23]"/> OS #{os.id.split('-')[2]}
                                        </h4>
                                        <p className="text-[10px] text-slate-500 font-medium line-clamp-2">{os.description}</p>
                                        <div className="mt-2 flex items-center gap-2">
                                            <span className="text-[9px] font-black bg-slate-100 px-2 py-0.5 rounded text-slate-400 uppercase">{os.sector}</span>
                                        </div>
                                    </div>
                                </div>
                            )
                        }
                     })}
                  </div>
               )}
            </div>
         </div>
      </div>

      {/* MODAL GESTÃO DE ROTINAS */}
      {showRoutineModal && (
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[1000] flex items-center justify-center p-6 animate-in fade-in">
              <div className="bg-white max-w-4xl w-full p-10 rounded-[2.5rem] shadow-2xl animate-in zoom-in-95 flex flex-col h-[80vh]">
                  <div className="flex justify-between items-center mb-8 shrink-0">
                      <div>
                          <h2 className="text-2xl font-black text-[#1A3673] uppercase italic tracking-tighter">Rotinas Automáticas</h2>
                          <p className="text-slate-400 text-[10px] font-bold uppercase tracking-widest mt-1">Configuração de Geração de OS Recorrente</p>
                      </div>
                      <button onClick={() => setShowRoutineModal(false)} className="text-slate-300 hover:text-rose-600"><X size={28}/></button>
                  </div>

                  <div className="flex gap-8 flex-1 overflow-hidden">
                      {/* Lado Esquerdo: Lista */}
                      <div className="flex-1 overflow-y-auto custom-scrollbar space-y-4 pr-2">
                          <h3 className="text-xs font-black text-slate-500 uppercase tracking-widest mb-4">Rotinas Ativas</h3>
                          {recurringTasks.length === 0 ? (
                              <div className="text-center py-10 border-2 border-dashed border-slate-200 rounded-2xl">
                                  <p className="text-xs font-bold text-slate-400">Nenhuma rotina cadastrada.</p>
                              </div>
                          ) : (
                              recurringTasks.map(task => (
                                  <div key={task.id} className="bg-slate-50 p-5 rounded-2xl border border-slate-100 flex justify-between items-center group">
                                      <div>
                                          <h4 className="font-bold text-slate-800 text-sm uppercase">{task.title}</h4>
                                          <div className="flex items-center gap-3 mt-1">
                                            <span className="text-[9px] font-black bg-white px-2 py-1 rounded text-slate-500 uppercase border border-slate-200">{task.sector}</span>
                                            <span className="text-[9px] font-black text-emerald-600 flex items-center gap-1"><Repeat size={10}/> {task.intervalDays} Dias</span>
                                          </div>
                                          <p className="text-[9px] text-slate-400 mt-2">Próxima: {task.nextTriggerDate.split('-').reverse().join('/')}</p>
                                      </div>
                                      <button onClick={() => handleDeleteRoutine(task.id)} className="p-2 text-slate-300 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-all">
                                          <Trash2 size={18} />
                                      </button>
                                  </div>
                              ))
                          )}
                      </div>

                      {/* Lado Direito: Form */}
                      <div className="w-[350px] bg-slate-50 p-6 rounded-3xl border border-slate-100 h-fit shrink-0">
                          <h3 className="text-xs font-black text-[#1A3673] uppercase tracking-widest mb-6 flex items-center gap-2"><Plus size={14}/> Nova Rotina</h3>
                          <div className="space-y-4">
                              <div className="space-y-1">
                                  <label className="text-[9px] font-black text-slate-400 uppercase ml-1">Título</label>
                                  <input type="text" className="industrial-input" placeholder="Ex: Limpeza Caixa D'água" value={newRoutine.title} onChange={e => setNewRoutine({...newRoutine, title: e.target.value})} />
                              </div>
                              <div className="space-y-1">
                                  <label className="text-[9px] font-black text-slate-400 uppercase ml-1">Descrição</label>
                                  <textarea className="industrial-input resize-none" rows={2} placeholder="Procedimento..." value={newRoutine.description} onChange={e => setNewRoutine({...newRoutine, description: e.target.value})} />
                              </div>
                              <div className="grid grid-cols-2 gap-3">
                                  <div className="space-y-1">
                                      <label className="text-[9px] font-black text-slate-400 uppercase ml-1">Setor</label>
                                      <select className="industrial-input text-xs" value={newRoutine.sector} onChange={e => setNewRoutine({...newRoutine, sector: e.target.value})}>
                                          {SECTORS.map(s => <option key={s} value={s}>{s.toUpperCase()}</option>)}
                                      </select>
                                  </div>
                                  <div className="space-y-1">
                                      <label className="text-[9px] font-black text-slate-400 uppercase ml-1">Intervalo (Dias)</label>
                                      <input type="number" className="industrial-input" value={newRoutine.intervalDays} onChange={e => setNewRoutine({...newRoutine, intervalDays: Number(e.target.value)})} />
                                  </div>
                              </div>
                              <div className="space-y-1">
                                  <label className="text-[9px] font-black text-slate-400 uppercase ml-1">Próxima Execução</label>
                                  <input type="date" className="industrial-input" value={newRoutine.nextTriggerDate} onChange={e => setNewRoutine({...newRoutine, nextTriggerDate: e.target.value})} />
                              </div>

                              <button onClick={handleSaveRoutine} className="w-full btn-primary mt-4 text-xs py-4 flex items-center justify-center gap-2">
                                  <Save size={16} /> Salvar Rotina
                              </button>
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
