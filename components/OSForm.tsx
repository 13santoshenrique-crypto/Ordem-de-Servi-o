
import React, { useState, useEffect, useRef } from 'react';
import { 
  Plus, X, Save, Send, Mic, Loader2, Wrench, Calendar, Tag, ListChecks, Recycle, Camera, AlertTriangle, Check, Package, Trash2, ShieldAlert, Lock, UserCheck, Microscope, ShoppingCart
} from 'lucide-react';
import { ServiceType, User, OSStatus, InventoryItem, SafetyChecklist } from '../types';
import { SECTORS } from '../constants';
import { refineTechnicalDescription, analyze5SWorkspace } from '../services/geminiService';
import { useApp } from '../context/AppContext';

const OSForm: React.FC<any> = ({ onSubmit, onCancel, technicians, preFilledData, initialData }) => {
  const { assets, inventory, activeUnitId } = useApp();
  const [activeTab, setActiveTab] = useState<'details' | 'safety' | 'parts'>('details');
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // Estado para controle de adição de peças
  const [selectedPartId, setSelectedPartId] = useState('');
  const [partQuantity, setPartQuantity] = useState(1);

  const defaultState = {
    technicianId: technicians[0]?.id || '',
    requestDate: new Date().toISOString().split('T')[0],
    deadline: '',
    type: ServiceType.CORRECTIVE,
    description: '',
    sector: SECTORS[0],
    timeSpent: 0,
    assetId: '',
    partsUsed: [] as { itemId: string; quantity: number; cost: number; name: string }[],
    safetyCheck: {
        energyLocked: false,
        ppeVerified: false,
        areaSignaled: false,
        riskAssessmentDone: false,
        sanitizationDone: false // REQUISITO AVIAGEN
    },
    technicalNotes: '',
    cost: 0 // Custo total da OS
  };

  const [formData, setFormData] = useState(defaultState);
  const [isListening, setIsListening] = useState(false);

  useEffect(() => {
    if (initialData) setFormData({ ...defaultState, ...initialData });
    else if (preFilledData) setFormData({ ...defaultState, ...preFilledData });
  }, [initialData, preFilledData]);

  // Recalcula custo total sempre que as peças mudam
  useEffect(() => {
    const partsCost = formData.partsUsed.reduce((acc, p) => acc + (p.cost * p.quantity), 0);
    setFormData(prev => ({ ...prev, cost: partsCost }));
  }, [formData.partsUsed]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.deadline || !formData.description) return alert('Campos obrigatórios pendentes.');
    
    // Validar Biossegurança para serviços em incubação
    if (formData.sector.toLowerCase().includes('incuba') && !formData.safetyCheck.sanitizationDone) {
        return alert("ERRO DE BIOSSEGURANÇA: Para este setor, a confirmação de desinfecção é obrigatória.");
    }

    onSubmit(formData);
  };

  const handleAddPart = () => {
    if (!selectedPartId || partQuantity <= 0) return;
    
    const item = inventory.find((i: InventoryItem) => i.id === selectedPartId);
    if (!item) return;

    if (item.stock < partQuantity) {
        alert(`Estoque insuficiente. Disponível: ${item.stock} ${item.unit}`);
        return;
    }

    const newPart = {
        itemId: item.id,
        name: item.name,
        cost: item.cost,
        quantity: partQuantity
    };

    setFormData(prev => ({
        ...prev,
        partsUsed: [...prev.partsUsed, newPart]
    }));

    setSelectedPartId('');
    setPartQuantity(1);
  };

  const handleRemovePart = (index: number) => {
    setFormData(prev => ({
        ...prev,
        partsUsed: prev.partsUsed.filter((_, i) => i !== index)
    }));
  };

  const currentUnitInventory = inventory.filter((i: InventoryItem) => i.unitId === activeUnitId);

  return (
    <div className="w-full bg-white">
      <div className="flex items-center justify-between mb-10">
        <div className="flex items-center gap-6">
          <div className="w-16 h-16 bg-[#1A3673] rounded-[2rem] flex items-center justify-center text-white shadow-2xl">
            {initialData ? <Save size={32} /> : <Plus size={36} />}
          </div>
          <div>
            <h2 className="text-3xl font-black text-[#1A3673] uppercase tracking-tighter italic leading-none">{initialData ? 'Refinar Protocolo' : 'Nova Ordem Digital'}</h2>
            <p className="text-slate-400 text-[10px] font-black uppercase tracking-[0.4em] mt-2 italic">Standard Operating Procedure v4.2</p>
          </div>
        </div>
        <button onClick={onCancel} className="p-4 text-slate-300 hover:text-red-500 transition-all hover:bg-red-50 rounded-2xl"><X size={32} /></button>
      </div>

      <div className="flex gap-4 mb-10 border-b border-slate-100">
         {['details', 'safety', 'parts'].map(tab => (
            <button 
                key={tab}
                type="button"
                onClick={() => setActiveTab(tab as any)} 
                className={`px-8 py-4 font-black text-[10px] uppercase tracking-widest transition-all border-b-4 ${activeTab === tab ? 'border-[#1A3673] text-[#1A3673]' : 'border-transparent text-slate-400'}`}
            >
                {tab === 'details' ? 'Dados Técnicos' : tab === 'safety' ? 'Biossegurança & LOTO' : 'Peças & BOM'}
            </button>
         ))}
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        
        {activeTab === 'details' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-10 animate-in fade-in slide-in-from-left-4">
                <div className="space-y-4">
                    <div className="space-y-1">
                       <label className="industrial-label">Executor Responsável</label>
                       <select className="industrial-input" value={formData.technicianId} onChange={(e) => setFormData({...formData, technicianId: e.target.value})}>
                           {technicians.map((t: any) => <option key={t.id} value={t.id}>{t.name}</option>)}
                       </select>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                       <div className="space-y-1">
                          <label className="industrial-label">Setor Industrial</label>
                          <select className="industrial-input" value={formData.sector} onChange={(e) => setFormData({...formData, sector: e.target.value})}>
                              {SECTORS.map(s => <option key={s} value={s}>{s.toUpperCase()}</option>)}
                          </select>
                       </div>
                       <div className="space-y-1">
                          <label className="industrial-label">Modalidade OS</label>
                          <select className="industrial-input" value={formData.type} onChange={(e) => setFormData({...formData, type: e.target.value as ServiceType})}>
                              {Object.values(ServiceType).map(t => <option key={t} value={t}>{t.toUpperCase()}</option>)}
                          </select>
                       </div>
                    </div>
                    <div className="space-y-1">
                       <label className="industrial-label">Vincular Ativo (TAG)</label>
                       <select className="industrial-input" value={formData.assetId} onChange={(e) => setFormData({...formData, assetId: e.target.value})}>
                           <option value="">MANUTENÇÃO DE INFRAESTRUTURA</option>
                           {assets.filter((a: any) => a.unitId === activeUnitId).map((a: any) => <option key={a.id} value={a.id}>{a.tag} - {a.name}</option>)}
                       </select>
                    </div>
                    <div className="space-y-1">
                       <label className="industrial-label">Data Limite (Deadline)</label>
                       <input type="date" required className="industrial-input" value={formData.deadline} onChange={(e) => setFormData({...formData, deadline: e.target.value})} />
                    </div>
                </div>

                <div className="space-y-4 flex flex-col">
                    <div className="flex justify-between items-center">
                        <label className="industrial-label">Relato de Falha / Solicitação</label>
                        {isListening && <span className="text-red-500 text-[9px] font-black uppercase animate-pulse flex items-center gap-1"><Mic size={12}/> Escutando IA...</span>}
                    </div>
                    <div className="relative flex-1">
                        <textarea required className="w-full h-full min-h-[250px] industrial-input !px-8 !py-8 resize-none text-lg font-medium" placeholder="Descreva a ocorrência técnica..." value={formData.description} onChange={(e) => setFormData({...formData, description: e.target.value})}></textarea>
                        <button type="button" onClick={() => setIsListening(!isListening)} className={`absolute bottom-6 right-6 p-5 rounded-2xl shadow-2xl transition-all ${isListening ? 'bg-red-500 text-white animate-bounce' : 'bg-[#1A3673] text-white'}`}>
                            <Mic size={24} />
                        </button>
                    </div>
                </div>
            </div>
        )}

        {activeTab === 'safety' && (
           <div className="space-y-10 animate-in zoom-in-95">
              <div className="bg-red-600 text-white p-10 rounded-[3rem] shadow-2xl relative overflow-hidden">
                 <div className="absolute top-0 right-0 p-12 opacity-20 rotate-12"><ShieldAlert size={120} /></div>
                 <h3 className="text-2xl font-black uppercase italic mb-2">Protocolo de Vida e Segurança</h3>
                 <p className="text-white/70 text-xs font-bold uppercase tracking-widest">Confirmações obrigatórias para prosseguir com a manutenção industrial.</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                 {[
                    { key: 'energyLocked', label: 'Energia Zero (Bloqueio de Cadeado)', icon: Lock },
                    { key: 'ppeVerified', label: 'EPIs Pessoais e Coletivos ok', icon: UserCheck },
                    { key: 'sanitizationDone', label: 'Desinfecção de Ferramentas (Biosseguridade)', icon: Microscope },
                    { key: 'riskAssessmentDone', label: 'Área Livre de Riscos de Queda/Incêndio', icon: AlertTriangle }
                 ].map(item => (
                    <label 
                        key={item.key} 
                        className={`flex items-center gap-6 p-8 rounded-[2rem] border-2 transition-all cursor-pointer ${formData.safetyCheck[item.key as keyof SafetyChecklist] ? 'bg-emerald-50 border-emerald-500 text-emerald-900' : 'bg-white border-slate-100 text-slate-400 hover:border-blue-300'}`}
                    >
                       <div className={`p-4 rounded-2xl ${formData.safetyCheck[item.key as keyof SafetyChecklist] ? 'bg-emerald-500 text-white' : 'bg-slate-50 text-slate-300'}`}>
                          <item.icon size={28} />
                       </div>
                       <span className="text-sm font-black uppercase flex-1">{item.label}</span>
                       <input 
                         type="checkbox" 
                         className="hidden" 
                         checked={formData.safetyCheck[item.key as keyof SafetyChecklist]} 
                         onChange={e => setFormData({...formData, safetyCheck: { ...formData.safetyCheck, [item.key]: e.target.checked } })}
                       />
                       <div className={`w-8 h-8 rounded-xl border-2 flex items-center justify-center transition-all ${formData.safetyCheck[item.key as keyof SafetyChecklist] ? 'bg-emerald-500 border-emerald-500 text-white' : 'border-slate-300'}`}>
                          {formData.safetyCheck[item.key as keyof SafetyChecklist] && <Check size={18} />}
                       </div>
                    </label>
                 ))}
              </div>
           </div>
        )}

        {activeTab === 'parts' && (
           <div className="space-y-8 animate-in slide-in-from-right-4">
              <div className="industrial-card p-8 bg-slate-50 border-slate-200">
                 <div className="flex flex-col md:flex-row gap-4 items-end">
                    <div className="flex-1 space-y-2 w-full">
                       <label className="industrial-label">Selecionar Item do Estoque</label>
                       <select 
                          className="industrial-input" 
                          value={selectedPartId} 
                          onChange={(e) => setSelectedPartId(e.target.value)}
                       >
                          <option value="">-- Selecione uma peça --</option>
                          {currentUnitInventory.map((item: InventoryItem) => (
                             <option key={item.id} value={item.id}>
                                {item.name} (Saldo: {item.stock} {item.unit}) - R$ {item.cost.toFixed(2)}
                             </option>
                          ))}
                       </select>
                    </div>
                    <div className="w-full md:w-32 space-y-2">
                       <label className="industrial-label">Qtd.</label>
                       <input 
                          type="number" 
                          className="industrial-input" 
                          min="1" 
                          value={partQuantity} 
                          onChange={(e) => setPartQuantity(Number(e.target.value))} 
                       />
                    </div>
                    <button 
                       type="button" 
                       onClick={handleAddPart}
                       disabled={!selectedPartId}
                       className="w-full md:w-auto bg-[#1A3673] text-white px-6 py-3.5 rounded-xl font-black uppercase text-xs tracking-widest shadow-lg hover:bg-slate-900 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                    >
                       <Plus size={16} /> Adicionar
                    </button>
                 </div>
              </div>

              {formData.partsUsed.length > 0 ? (
                 <div className="space-y-4">
                    {formData.partsUsed.map((part, idx) => (
                       <div key={idx} className="flex items-center justify-between p-4 bg-white border border-slate-100 rounded-2xl shadow-sm">
                          <div className="flex items-center gap-4">
                             <div className="p-3 bg-blue-50 text-[#1A3673] rounded-xl"><Package size={20}/></div>
                             <div>
                                <p className="text-xs font-black text-slate-800 uppercase">{part.name}</p>
                                <p className="text-[10px] text-slate-400 font-bold uppercase">
                                   {part.quantity} un x R$ {part.cost.toFixed(2)}
                                </p>
                             </div>
                          </div>
                          <div className="flex items-center gap-6">
                             <p className="text-sm font-black text-slate-900">R$ {(part.quantity * part.cost).toFixed(2)}</p>
                             <button type="button" onClick={() => handleRemovePart(idx)} className="text-red-400 hover:text-red-600"><Trash2 size={18}/></button>
                          </div>
                       </div>
                    ))}
                    
                    <div className="flex justify-end pt-4 border-t border-slate-100">
                       <div className="text-right">
                          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Custo Total de Materiais</p>
                          <p className="text-2xl font-black text-[#1A3673]">R$ {formData.cost.toFixed(2)}</p>
                       </div>
                    </div>
                 </div>
              ) : (
                 <div className="py-10 text-center opacity-40 flex flex-col items-center">
                    <ShoppingCart size={48} className="text-slate-300 mb-4" />
                    <p className="text-xs font-black text-slate-400 uppercase tracking-widest">Nenhuma peça vinculada a esta ordem.</p>
                 </div>
              )}
           </div>
        )}

        <div className="flex gap-6 pt-12 border-t border-slate-100">
          <button type="button" onClick={onCancel} className="flex-1 py-6 bg-slate-100 text-slate-500 rounded-3xl font-black uppercase text-[10px] tracking-widest hover:bg-slate-200 transition-all">Cancelar</button>
          <button type="submit" className="flex-[2] py-6 bg-[#1A3673] text-white rounded-3xl font-black uppercase text-sm tracking-[0.2em] shadow-2xl hover:bg-slate-900 transition-all flex items-center justify-center gap-3 active:scale-95">
            {initialData ? <Save size={24}/> : <Send size={24} />} {initialData ? 'Atualizar OS Industrial' : 'Publicar Protocolo Digital'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default OSForm;
