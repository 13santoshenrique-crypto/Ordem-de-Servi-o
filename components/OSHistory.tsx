
import React, { useState, useEffect } from 'react';
import { 
  CheckCircle2, Clock, 
  Tag, User as UserIcon, Wrench, X, PlusCircle, Settings2, ChevronRight, UserCheck,
  Package, Plus, Trash2, ShoppingCart
} from 'lucide-react';
import { ServiceOrder, OSStatus, UserRole, User, ServiceType, InventoryItem } from '../types';
import OSForm from './OSForm';

interface OSHistoryProps {
  orders: ServiceOrder[];
  technicians: User[];
  inventory: InventoryItem[];
  onUpdate: (id: string, updates: Partial<ServiceOrder>, partsUsed?: { itemId: string, quantity: number, cost: number }[]) => void;
  onAddOS: (data: any) => void;
  role: UserRole;
  currentUser: User;
  preFilledData?: any;
  clearPreFilled?: () => void;
}

const OSHistory: React.FC<OSHistoryProps> = ({ orders, technicians, inventory, onUpdate, onAddOS, role, currentUser, preFilledData, clearPreFilled }) => {
  const [selectedOS, setSelectedOS] = useState<ServiceOrder | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [executionTime, setExecutionTime] = useState(1);
  const [finishingTechId, setFinishingTechId] = useState('');
  
  // Estado para peças que serão usadas na baixa
  const [selectedParts, setSelectedParts] = useState<{ itemId: string, quantity: number }[]>([]);
  const [currentPartId, setCurrentPartId] = useState('');
  const [currentPartQty, setCurrentPartQty] = useState(1);

  useEffect(() => {
    if (selectedOS) {
      setFinishingTechId(selectedOS.technicianId);
      setExecutionTime(1);
      setSelectedParts([]);
    }
  }, [selectedOS]);

  useEffect(() => {
    if (preFilledData) {
      setShowForm(true);
    }
  }, [preFilledData]);

  const addPartToOS = () => {
    if (!currentPartId) return;
    const item = inventory.find(i => i.id === currentPartId);
    if (!item) return;
    
    if (currentPartQty > item.stock) {
      alert(`Estoque insuficiente! Disponível: ${item.stock} ${item.unit}`);
      return;
    }

    const existing = selectedParts.find(p => p.itemId === currentPartId);
    if (existing) {
      setSelectedParts(selectedParts.map(p => 
        p.itemId === currentPartId ? { ...p, quantity: p.quantity + currentPartQty } : p
      ));
    } else {
      setSelectedParts([...selectedParts, { itemId: currentPartId, quantity: currentPartQty }]);
    }
    setCurrentPartId('');
    setCurrentPartQty(1);
  };

  const removePart = (itemId: string) => {
    setSelectedParts(selectedParts.filter(p => p.itemId !== itemId));
  };

  const handleFinish = (id: string) => {
    const finalHours = Number(executionTime) || 1;
    const tech = technicians.find(t => t.id === finishingTechId);
    const hourlyCost = tech ? tech.hourlyRate * finalHours : 0;
    
    const partsWithDetails = selectedParts.map(p => {
      const item = inventory.find(i => i.id === p.itemId);
      return {
        itemId: p.itemId,
        quantity: p.quantity,
        cost: (Number(item?.cost) || 0) * p.quantity,
        name: item?.name || 'Item Excluído'
      };
    });

    const totalMaterialsCost = partsWithDetails.reduce((acc, p) => acc + p.cost, 0);

    onUpdate(id, { 
      status: OSStatus.FINISHED, 
      executionDate: new Date().toISOString().split('T')[0],
      timeSpent: finalHours,
      technicianId: finishingTechId, 
      cost: hourlyCost + totalMaterialsCost,
      partsUsed: partsWithDetails // Salvamos o log de peças na OS
    }, partsWithDetails);
    
    setSelectedOS(null);
    setSelectedParts([]);
    setExecutionTime(1);
  };

  const closeForm = () => {
    setShowForm(false);
    if (clearPreFilled) clearPreFilled();
  };

  return (
    <div className="space-y-8">
      <header className="flex items-center justify-between bg-slate-900/40 p-6 border-b-2 border-white/5">
        <div>
          <h2 className="text-2xl font-black text-white uppercase tracking-tighter flex items-center gap-3 italic">
            <Settings2 size={24} className="text-[#0047ba]" />
            Log de <span className="text-[#0047ba]">Manutenção</span>
          </h2>
          <p className="text-white/20 text-[9px] font-black uppercase tracking-[0.4em] mt-1">GMAO PLATINUM // Registro de Eventos</p>
        </div>
        <button 
          onClick={() => setShowForm(true)}
          className="bg-[#0047ba] hover:bg-[#e31b23] text-white px-10 py-4 font-black uppercase text-[11px] tracking-widest flex items-center gap-3 transition-all"
        >
          <PlusCircle size={20} />
          Nova OS
        </button>
      </header>

      <div className="grid grid-cols-1 gap-4">
        {orders.map((os) => (
          <div 
            key={os.id} 
            className="industrial-card p-6 flex flex-col lg:flex-row lg:items-center justify-between gap-6 group border-l-4"
            style={{ borderLeftColor: os.type === ServiceType.CORRECTIVE ? '#e31b23' : '#0047ba' }}
          >
            <div className="flex-1 space-y-4">
              <div className="flex items-center gap-4">
                <span className="mono text-[10px] font-black text-[#0047ba] bg-[#0047ba]/10 px-2 py-1">{os.id}</span>
                <h3 className="text-lg font-black text-white uppercase tracking-tight group-hover:text-[#0047ba] transition-colors">{os.description}</h3>
                <StatusBadge status={os.status} />
              </div>
              
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center text-[10px] font-black text-[#0047ba] border border-white/5">
                    {technicians.find(t => t.id === os.technicianId)?.name.charAt(0) || '?'}
                  </div>
                  <InfoBox label="Responsável" value={technicians.find(t => t.id === os.technicianId)?.name || '---'} icon={UserIcon} />
                </div>
                <InfoBox label="Setor Industrial" value={os.sector} icon={Tag} />
                <InfoBox label="Tipo de Evento" value={os.type} icon={Wrench} color={os.type === ServiceType.CORRECTIVE ? 'text-red-500' : 'text-[#0047ba]'} />
                <InfoBox label="Data Limite" value={os.deadline} icon={Clock} />
              </div>

              {os.status === OSStatus.FINISHED && (
                <div className="flex flex-col gap-3 pt-4 border-t border-white/5">
                   <div className="flex items-center justify-between">
                     <div className="flex items-center gap-2">
                        <UserCheck size={12} className="text-emerald-500" />
                        <span className="text-[8px] font-black text-white/40 uppercase tracking-widest">
                          Finalizado por: <span className="text-white">{technicians.find(t => t.id === os.technicianId)?.name}</span>
                        </span>
                     </div>
                     <span className="text-[10px] font-black text-emerald-400 mono">CUSTO TOTAL: R$ {os.cost?.toLocaleString()}</span>
                   </div>
                   
                   {os.partsUsed && os.partsUsed.length > 0 && (
                     <div className="flex flex-wrap gap-2">
                        {os.partsUsed.map((part: any, i: number) => (
                          <div key={i} className="px-3 py-1 bg-white/5 border border-white/5 rounded-lg flex items-center gap-2">
                             <Package size={10} className="text-[#0047ba]" />
                             <span className="text-[9px] font-bold text-white/60 uppercase">{part.quantity}x {part.name || 'Insumo'}</span>
                          </div>
                        ))}
                     </div>
                   )}
                </div>
              )}
            </div>

            <div className="flex items-center gap-4 pl-6 border-l border-white/5">
              {os.status === OSStatus.OPEN && (
                <button 
                  onClick={() => setSelectedOS(os)}
                  className="bg-emerald-600 hover:bg-emerald-500 text-white px-6 py-3 font-black uppercase text-[10px] tracking-widest transition-all flex items-center gap-2"
                >
                  <CheckCircle2 size={16} />
                  Baixar OS
                </button>
              )}
              {os.status === OSStatus.FINISHED && (
                <div className="text-right">
                   <p className="text-[8px] font-black text-white/20 uppercase">Encerrada em</p>
                   <p className="text-xs font-black text-white mono">{os.executionDate}</p>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {showForm && (
        <div className="fixed inset-0 bg-black/95 backdrop-blur-sm z-[100] flex items-center justify-center p-6">
           <div className="industrial-card max-w-3xl w-full p-10">
              <div className="flex justify-between mb-8">
                 <h2 className="text-2xl font-black uppercase text-white">Gerar Ordem de Serviço</h2>
                 <button onClick={closeForm} className="text-white/40 hover:text-white"><X size={24}/></button>
              </div>
              <OSForm 
                technicians={technicians} 
                onSubmit={(data) => { onAddOS(data); setShowForm(false); }} 
                preFilledData={preFilledData}
              />
           </div>
        </div>
      )}

      {selectedOS && (
        <div className="fixed inset-0 bg-black/95 z-[100] flex items-center justify-center p-6 animate-in fade-in zoom-in-95 duration-300 overflow-y-auto">
           <div className="industrial-card max-w-2xl w-full p-10 border-t-8 border-emerald-600 shadow-3xl my-auto">
              <div className="flex justify-between items-start mb-8">
                <div>
                   <h3 className="text-2xl font-black uppercase text-white tracking-tighter">Baixa de Manutenção</h3>
                   <p className="text-[9px] font-bold text-[#0047ba] uppercase tracking-widest">OS ID: {selectedOS.id}</p>
                </div>
                <button onClick={() => setSelectedOS(null)} className="text-white/20 hover:text-white"><X size={20}/></button>
              </div>
              
              <div className="space-y-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-[9px] font-black uppercase text-white/20 tracking-[0.2em] ml-2 flex items-center gap-2">
                      <UserCheck size={12} /> Técnico Executante
                    </label>
                    <select 
                      className="w-full bg-white/5 border border-white/10 p-4 rounded-xl font-bold text-xs text-white uppercase outline-none focus:border-[#0047ba]"
                      value={finishingTechId}
                      onChange={(e) => setFinishingTechId(e.target.value)}
                    >
                      {technicians.map(t => (
                        <option key={t.id} value={t.id} className="bg-slate-900">{t.name}</option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-2">
                    <label className="text-[9px] font-black uppercase text-white/20 tracking-[0.2em] ml-2">Tempo de Execução (Horas)</label>
                    <div className="relative">
                        <input 
                          type="number" 
                          step="0.5"
                          className="w-full bg-white/5 border border-white/10 p-4 rounded-xl font-black mono text-xl text-[#0047ba] outline-none focus:border-emerald-500 transition-all" 
                          value={executionTime} 
                          onChange={(e) => setExecutionTime(Number(e.target.value))}
                        />
                        <span className="absolute right-4 top-1/2 -translate-y-1/2 text-white/20 font-black text-[10px]">H/H</span>
                    </div>
                  </div>
                </div>

                {/* INTERAÇÃO COM ALMOXARIFADO */}
                <div className="p-6 bg-white/2 border border-white/5 rounded-[2rem] space-y-4">
                   <div className="flex items-center gap-3 mb-2">
                      <Package size={18} className="text-[#0047ba]" />
                      <h4 className="text-[10px] font-black text-white uppercase tracking-widest">Requisição de Insumos (Almoxarifado)</h4>
                   </div>

                   <div className="flex gap-3">
                      <select 
                        className="flex-1 bg-black/40 border border-white/10 p-3 rounded-xl text-xs font-bold text-white outline-none focus:border-[#0047ba]"
                        value={currentPartId}
                        onChange={(e) => setCurrentPartId(e.target.value)}
                      >
                         <option value="">Selecionar Peça...</option>
                         {inventory.map(item => (
                           <option key={item.id} value={item.id} className="bg-slate-900" disabled={item.stock <= 0}>
                             {item.name} ({item.stock} {item.unit} disp.)
                           </option>
                         ))}
                      </select>
                      <input 
                        type="number" 
                        className="w-20 bg-black/40 border border-white/10 p-3 rounded-xl text-xs font-bold text-white text-center outline-none"
                        value={currentPartQty}
                        onChange={(e) => setCurrentPartQty(Number(e.target.value))}
                        min="1"
                      />
                      <button 
                        onClick={addPartToOS}
                        className="p-3 bg-[#0047ba] hover:bg-[#e31b23] text-white rounded-xl transition-all"
                      >
                         <Plus size={20} />
                      </button>
                   </div>

                   {selectedParts.length > 0 && (
                     <div className="space-y-2 mt-4 max-h-40 overflow-y-auto pr-2 custom-scrollbar">
                        {selectedParts.map((p, idx) => {
                          const item = inventory.find(i => i.id === p.itemId);
                          return (
                            <div key={idx} className="flex items-center justify-between p-3 bg-white/5 rounded-xl border border-white/5">
                               <div className="flex items-center gap-3">
                                  <div className="w-8 h-8 rounded-lg bg-[#0047ba]/10 flex items-center justify-center text-[10px] font-black text-[#0047ba]">
                                     {p.quantity}
                                  </div>
                                  <div>
                                     <p className="text-[10px] font-black text-white uppercase">{item?.name}</p>
                                     <p className="text-[8px] font-bold text-white/20 uppercase">R$ {((item?.cost || 0) * p.quantity).toLocaleString()}</p>
                                  </div>
                               </div>
                               <button onClick={() => removePart(p.itemId)} className="text-white/20 hover:text-red-500 p-1"><Trash2 size={14}/></button>
                            </div>
                          );
                        })}
                     </div>
                   )}
                </div>
                
                <div className="pt-4 space-y-3">
                  <button 
                    onClick={() => handleFinish(selectedOS.id)}
                    className="w-full py-5 bg-emerald-600 hover:bg-emerald-500 text-white font-black uppercase text-[11px] tracking-[0.3em] rounded-xl shadow-xl transition-all active:scale-95 flex items-center justify-center gap-3"
                  >
                    <ShoppingCart size={18} /> Confirmar & Baixar Estoque
                  </button>
                  <button 
                    onClick={() => setSelectedOS(null)} 
                    className="w-full py-3 text-white/20 hover:text-white font-black uppercase text-[9px] tracking-widest transition-all"
                  >
                    Cancelar Ação
                  </button>
                </div>
              </div>
           </div>
        </div>
      )}
    </div>
  );
};

const InfoBox = ({ label, value, icon: Icon, color = 'text-white/60' }: any) => (
  <div className="flex items-start gap-3">
    <Icon size={14} className="text-[#0047ba] mt-0.5" />
    <div>
      <p className="text-[8px] font-black text-white/20 uppercase tracking-widest">{label}</p>
      <p className={`text-xs font-bold uppercase ${color}`}>{value}</p>
    </div>
  </div>
);

const StatusBadge = ({ status }: { status: OSStatus }) => (
  <div className={`px-3 py-1 text-[8px] font-black uppercase tracking-widest border ${
    status === OSStatus.OPEN ? 'border-red-600 text-red-600' : 'border-[#0047ba] text-[#0047ba]'
  }`}>
    {status}
  </div>
);

export default OSHistory;
