
import React, { useState, useMemo, useRef } from 'react';
import { 
  ListTodo, Plus, Search, Upload, Loader2, Save, X, Trash2, Edit3, 
  CheckCircle2, Clock, DollarSign, Target, User as UserIcon, MapPin, 
  HelpCircle, Info, ChevronRight, FileSpreadsheet, TrendingUp, Filter, Building
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { ActionPlan5W2H, ActionStatus } from '../types';
import { SECTORS } from '../constants';
import { parseExcel5W2H } from '../services/geminiService';
import * as XLSX from 'xlsx';

const FiveWTwoH: React.FC = () => {
  const { actionPlans, setActionPlans, activeUnitId, units, addNotification, logAction, currentUser } = useApp();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'ALL' | ActionStatus>('ALL');
  
  const [showForm, setShowForm] = useState(false);
  const [editingPlan, setEditingPlan] = useState<ActionPlan5W2H | null>(null);
  const [isImporting, setIsImporting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [formData, setFormData] = useState<Omit<ActionPlan5W2H, 'id' | 'unitId' | 'createdAt'>>({
    what: '', why: '', where: '', when: '', who: '', how: '', howMuch: 0, 
    status: ActionStatus.PENDING, sector: ''
  });

  const filteredPlans = useMemo(() => {
    return actionPlans.filter(plan => 
      plan.unitId === activeUnitId && 
      (statusFilter === 'ALL' || plan.status === statusFilter) &&
      (plan.what.toLowerCase().includes(searchTerm.toLowerCase()) || 
       plan.who.toLowerCase().includes(searchTerm.toLowerCase()) ||
       (plan.sector && plan.sector.toLowerCase().includes(searchTerm.toLowerCase())))
    );
  }, [actionPlans, activeUnitId, statusFilter, searchTerm]);

  const stats = useMemo(() => {
    const plans = actionPlans.filter(p => p.unitId === activeUnitId);
    const totalCost = plans.reduce((acc, p) => acc + p.howMuch, 0);
    const completed = plans.filter(p => p.status === ActionStatus.COMPLETED).length;
    const pending = plans.filter(p => p.status === ActionStatus.PENDING).length;
    const progress = plans.length > 0 ? (completed / plans.length) * 100 : 0;
    
    return { totalCost, completed, pending, progress, total: plans.length };
  }, [actionPlans, activeUnitId]);

  const handleOpenForm = (plan?: ActionPlan5W2H) => {
    if (plan) {
      setEditingPlan(plan);
      setFormData(plan);
    } else {
      setEditingPlan(null);
      setFormData({ what: '', why: '', where: '', when: '', who: '', how: '', howMuch: 0, status: ActionStatus.PENDING, sector: '' });
    }
    setShowForm(true);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingPlan) {
      setActionPlans(prev => prev.map(p => p.id === editingPlan.id ? { ...p, ...formData } : p));
      addNotification({ type: 'success', title: 'Plano Atualizado', message: 'Ação estratégica salva com sucesso.' });
    } else {
      const newPlan: ActionPlan5W2H = {
        ...formData,
        id: `5w2h-${Date.now()}`,
        unitId: activeUnitId,
        createdAt: new Date().toISOString()
      };
      setActionPlans(prev => [newPlan, ...prev]);
      addNotification({ type: 'success', title: 'Plano Criado', message: 'Nova diretriz 5W2H registrada.' });
    }
    setShowForm(false);
  };

  const handleDelete = (id: string) => {
    if (confirm("Deseja excluir este item do plano de ação?")) {
      setActionPlans(prev => prev.filter(p => p.id !== id));
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsImporting(true);
    addNotification({ type: 'info', title: 'IA Mapeando 5W2H', message: 'A Gemini Pro está estruturando os dados da sua planilha...' });

    try {
      const reader = new FileReader();
      reader.onload = async (evt) => {
        try {
          const bstr = evt.target?.result;
          const wb = XLSX.read(bstr, { type: 'binary' });
          const ws = wb.Sheets[wb.SheetNames[0]];
          const data = XLSX.utils.sheet_to_json(ws);

          const parsedItems = await parseExcel5W2H(file.name, data);
          
          const newPlans: ActionPlan5W2H[] = parsedItems.map(item => ({
            id: `5w2h-ai-${Math.random().toString(36).substr(2, 9)}`,
            what: item.what || 'Indefinido',
            why: item.why || 'Melhoria de Processo',
            where: item.where || 'Geral',
            when: item.when || '',
            who: item.who || 'Equipe Técnica',
            how: item.how || 'Procedimento Padrão',
            howMuch: Number(item.howMuch) || 0,
            status: ActionStatus.PENDING,
            sector: item.sector || '',
            unitId: activeUnitId,
            createdAt: new Date().toISOString()
          }));

          setActionPlans(prev => [...newPlans, ...prev]);
          addNotification({ 
            type: 'success', 
            title: 'Importação Concluída', 
            message: `${newPlans.length} ações estratégicas importadas via Inteligência Artificial.` 
          });
          logAction("5W2H_IMPORT", `Importadas ${newPlans.length} ações 5W2H na unidade ${activeUnitId}.`, currentUser!);
        } catch (err) {
          addNotification({ type: 'critical', title: 'Erro de Mapeamento', message: 'A IA não conseguiu estruturar os dados. Tente uma planilha mais clara.' });
        } finally {
          setIsImporting(false);
        }
      };
      reader.readAsBinaryString(file);
    } catch (err) {
      setIsImporting(false);
    }
  };

  const activeUnit = units.find(u => u.id === activeUnitId);

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-20">
      {/* HEADER EXECUTIVO */}
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-6 bg-white p-8 rounded-[2.5rem] border border-slate-200 shadow-sm relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-blue-50/50 rounded-full blur-3xl -mr-32 -mt-32 pointer-events-none"></div>
        <div className="flex items-center gap-6 relative z-10">
          <div className="w-16 h-16 bg-[#1A3673] rounded-2xl flex items-center justify-center text-white shadow-xl">
            <ListTodo size={32} />
          </div>
          <div>
            <h1 className="text-2xl font-black text-[#1A3673] uppercase tracking-tighter italic leading-none">Plano de Ação 5W2H</h1>
            <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest mt-2">Matriz de Gestão de Resultados • {activeUnit?.name}</p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-4 relative z-10">
           <input type="file" ref={fileInputRef} hidden accept=".xlsx, .csv" onChange={handleFileUpload} />
           <button 
             onClick={() => fileInputRef.current?.click()} 
             disabled={isImporting}
             className="p-4 bg-slate-50 text-slate-500 rounded-xl hover:bg-slate-100 transition-all flex items-center gap-3 border border-slate-100"
           >
              {isImporting ? <Loader2 size={18} className="animate-spin" /> : <FileSpreadsheet size={18} />}
              <span className="text-[10px] font-black uppercase tracking-widest hidden sm:inline">Importar Excel IA</span>
           </button>
           <button 
             onClick={() => handleOpenForm()} 
             className="bg-[#1A3673] text-white px-8 py-4 rounded-xl font-black text-[10px] uppercase tracking-widest shadow-xl hover:bg-slate-900 transition-all flex items-center gap-2"
           >
             <Plus size={16} /> Nova Ação
           </button>
        </div>
      </header>

      {/* DASHBOARD DE STATUS */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
         <MetricCard label="Custo Previsto" value={`${activeUnit?.currency} ${(stats.totalCost/1000).toFixed(1)}k`} icon={DollarSign} color="text-slate-900" />
         <MetricCard label="Conclusão" value={`${Math.round(stats.progress)}%`} icon={Target} color="text-emerald-600" />
         <MetricCard label="Pendências" value={stats.pending.toString()} icon={Clock} color="text-amber-500" />
         <MetricCard label="Total Ações" value={stats.total.toString()} icon={TrendingUp} color="text-[#1A3673]" />
      </div>

      {/* FILTROS E PESQUISA */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
         <div className="flex bg-white p-1.5 rounded-xl border border-slate-200 shadow-sm overflow-x-auto no-scrollbar">
            {['ALL', ActionStatus.PENDING, ActionStatus.IN_PROGRESS, ActionStatus.COMPLETED].map(st => (
               <button 
                 key={st} 
                 onClick={() => setStatusFilter(st as any)}
                 className={`px-6 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${statusFilter === st ? 'bg-[#1A3673] text-white shadow-md' : 'text-slate-400 hover:text-slate-600'}`}
               >
                 {st === 'ALL' ? 'Todos' : st}
               </button>
            ))}
         </div>
         <div className="bg-white border border-slate-200 rounded-xl px-5 py-3 flex items-center gap-3 w-full lg:w-80 shadow-sm focus-within:border-[#1A3673] transition-all">
            <Search size={18} className="text-slate-400" />
            <input 
              type="text" 
              placeholder="PESQUISAR AÇÃO OU DEPARTAMENTO..." 
              className="bg-transparent border-none text-[10px] text-slate-800 focus:outline-none w-full font-black uppercase tracking-wider"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
         </div>
      </div>

      {/* LISTA DE CARDS 5W2H */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
         {filteredPlans.length === 0 ? (
           <div className="xl:col-span-2 py-20 text-center industrial-card opacity-30">
              <ListTodo size={48} className="mx-auto mb-4 text-slate-300" />
              <p className="text-xs font-black uppercase tracking-widest text-slate-400 italic">Nenhuma ação estratégica registrada no critério selecionado</p>
           </div>
         ) : (
           filteredPlans.map(plan => (
             <div key={plan.id} className="industrial-card p-0 overflow-hidden group hover:border-[#1A3673] transition-all bg-white flex flex-col">
                <div className="p-8 border-b border-slate-50 flex justify-between items-start bg-slate-50/30">
                   <div className="flex items-center gap-4">
                      <div className={`p-3 rounded-xl ${plan.status === ActionStatus.COMPLETED ? 'bg-emerald-100 text-emerald-600' : plan.status === ActionStatus.IN_PROGRESS ? 'bg-blue-100 text-blue-600' : 'bg-amber-100 text-amber-600'}`}>
                         {plan.status === ActionStatus.COMPLETED ? <CheckCircle2 size={24} /> : <Clock size={24} />}
                      </div>
                      <div>
                         <h3 className="text-lg font-black text-slate-900 uppercase italic tracking-tighter leading-tight">{plan.what}</h3>
                         <div className="flex items-center gap-2 mt-1">
                            {plan.sector && (
                              <>
                                <span className="text-[9px] font-black text-[#1A3673] uppercase tracking-widest">{plan.sector}</span>
                                <span className="w-1 h-1 rounded-full bg-slate-300"></span>
                              </>
                            )}
                            <span className={`text-[9px] font-black uppercase ${plan.status === ActionStatus.COMPLETED ? 'text-emerald-500' : plan.status === ActionStatus.IN_PROGRESS ? 'text-blue-500' : 'text-amber-500'}`}>{plan.status}</span>
                         </div>
                      </div>
                   </div>
                   <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button onClick={() => handleOpenForm(plan)} className="p-2.5 bg-white text-slate-400 hover:text-[#1A3673] rounded-xl border border-slate-100 hover:border-blue-200 shadow-sm"><Edit3 size={16} /></button>
                      <button onClick={() => handleDelete(plan.id)} className="p-2.5 bg-white text-slate-400 hover:text-red-600 rounded-xl border border-slate-100 hover:border-red-200 shadow-sm"><Trash2 size={16} /></button>
                   </div>
                </div>

                <div className="p-8 grid grid-cols-2 md:grid-cols-3 gap-6">
                   <MiniInfo label="Why (Por quê?)" value={plan.why} icon={HelpCircle} />
                   <MiniInfo label="Where (Onde?)" value={plan.where} icon={MapPin} />
                   <MiniInfo label="Who (Quem?)" value={plan.who} icon={UserIcon} />
                   <MiniInfo label="When (Quando?)" value={plan.when} icon={Clock} />
                   <MiniInfo label="How Much (Quanto?)" value={`${activeUnit?.currency} ${plan.howMuch.toLocaleString()}`} icon={DollarSign} />
                   <MiniInfo label="How (Como?)" value={plan.how} icon={ChevronRight} fullWidth />
                </div>
             </div>
           ))
         )}
      </div>

      {/* MODAL DE FORMULÁRIO 5W2H */}
      {showForm && (
        <div className="fixed inset-0 bg-slate-900/70 backdrop-blur-md z-[2000] flex items-center justify-center p-6 animate-in fade-in">
           <div className="bg-white max-w-4xl w-full p-10 lg:p-14 rounded-[3.5rem] shadow-3xl border border-slate-100 animate-in zoom-in-95 max-h-[90vh] overflow-y-auto custom-scrollbar">
              <div className="flex justify-between items-center mb-10">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-[#1A3673] text-white rounded-2xl flex items-center justify-center"><ListTodo size={24}/></div>
                  <div>
                    <h2 className="text-2xl font-black text-slate-900 uppercase italic leading-none">{editingPlan ? 'Refinar Plano' : 'Nova Ação 5W2H'}</h2>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">Defina o escopo estratégico da ação</p>
                  </div>
                </div>
                <button onClick={() => setShowForm(false)} className="text-slate-300 hover:text-red-500 transition-colors"><X size={28}/></button>
              </div>

              <form onSubmit={handleSave} className="space-y-8">
                 <div className="space-y-2">
                    <label className="industrial-label">What (O que deve ser feito?)</label>
                    <input type="text" required className="industrial-input uppercase" value={formData.what} onChange={e => setFormData({...formData, what: e.target.value.toUpperCase()})} placeholder="EX: SUBSTITUIÇÃO DO MOTOR DA INCUBADORA 02" />
                 </div>

                 <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="space-y-2">
                        <label className="industrial-label">Why (Por que fazer?)</label>
                        <input type="text" required className="industrial-input" value={formData.why} onChange={e => setFormData({...formData, why: e.target.value})} placeholder="Evitar parada de produção e perda de ovos" />
                    </div>
                    <div className="space-y-2">
                        <label className="industrial-label">Where (Em que local?)</label>
                        <input type="text" required className="industrial-input" value={formData.where} onChange={e => setFormData({...formData, where: e.target.value})} placeholder="Setor de Incubação - Planta 01" />
                    </div>
                    <div className="space-y-2">
                        <label className="industrial-label">Who (Quem é o responsável?)</label>
                        <input type="text" required className="industrial-input" value={formData.who} onChange={e => setFormData({...formData, who: e.target.value})} placeholder="Nome do Técnico ou Supervisor" />
                    </div>
                    <div className="space-y-2">
                        <label className="industrial-label">When (Qual o prazo/frequência?)</label>
                        <input type="text" required className="industrial-input" value={formData.when} onChange={e => setFormData({...formData, when: e.target.value})} placeholder="DD/MM/AAAA ou Imediato" />
                    </div>
                 </div>

                 <div className="space-y-2">
                    <label className="industrial-label">How (Como será executado?)</label>
                    <textarea rows={3} required className="industrial-input resize-none" value={formData.how} onChange={e => setFormData({...formData, how: e.target.value})} placeholder="Passo a passo técnico da execução..." />
                 </div>

                 <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    <div className="space-y-2">
                        <label className="industrial-label">How Much (Custo Estimado)</label>
                        <div className="relative">
                           <DollarSign className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
                           <input type="number" step="0.01" className="industrial-input pl-12" value={formData.howMuch} onChange={e => setFormData({...formData, howMuch: Number(e.target.value)})} />
                        </div>
                    </div>
                    <div className="space-y-2">
                        <label className="industrial-label">Departamento Envolvido (Opcional)</label>
                        <div className="relative">
                           <Building className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
                           <input type="text" className="industrial-input pl-12 uppercase" value={formData.sector} onChange={e => setFormData({...formData, sector: e.target.value.toUpperCase()})} placeholder="EX: MANUTENÇÃO, RH, TI..." />
                        </div>
                    </div>
                    <div className="space-y-2">
                        <label className="industrial-label">Status Inicial</label>
                        <select className="industrial-input" value={formData.status} onChange={e => setFormData({...formData, status: e.target.value as ActionStatus})}>
                           {Object.values(ActionStatus).map(s => <option key={s} value={s}>{s.toUpperCase()}</option>)}
                        </select>
                    </div>
                 </div>

                 <button type="submit" className="w-full py-6 bg-[#1A3673] text-white rounded-2xl font-black uppercase text-xs tracking-[0.2em] shadow-2xl flex items-center justify-center gap-3 hover:bg-slate-900 transition-all">
                    <Save size={20} /> {editingPlan ? 'Atualizar Diretriz SGI' : 'Publicar Plano de Ação'}
                 </button>
              </form>
           </div>
        </div>
      )}
    </div>
  );
};

const MetricCard = ({ label, value, icon: Icon, color }: any) => (
  <div className="industrial-card p-8 bg-white flex items-center gap-6 shadow-sm">
     <div className={`p-4 rounded-2xl bg-slate-50 ${color}`}>
        <Icon size={28} />
     </div>
     <div>
        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">{label}</p>
        <p className={`text-2xl font-black italic tracking-tighter ${color}`}>{value}</p>
     </div>
  </div>
);

const MiniInfo = ({ label, value, icon: Icon, fullWidth, fullColor }: any) => (
  <div className={`space-y-1.5 ${fullWidth ? 'col-span-2 md:col-span-3' : ''}`}>
     <div className="flex items-center gap-2">
        <Icon size={12} className="text-[#1A3673]" />
        <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">{label}</span>
     </div>
     <p className={`text-[11px] font-bold text-slate-700 leading-relaxed uppercase italic ${fullWidth ? 'bg-slate-50 p-4 rounded-2xl border border-slate-100' : ''}`}>
        {value || '--'}
     </p>
  </div>
);

export default FiveWTwoH;
