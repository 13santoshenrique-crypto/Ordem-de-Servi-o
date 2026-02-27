
import React, { useState, useMemo, useRef } from 'react';
import { Asset, AssetComponent, ServiceType, OSStatus, InventoryItem, AssetDocument } from '../types';
import { useApp } from '../context/AppContext'; 
import { SECTORS } from '../constants';
import { 
  Plus, Search, Edit3, Trash2, X, Activity, Gauge, AlertTriangle, CheckCircle2, 
  RefreshCw, Camera, Layers, Fingerprint, Tag as TagIcon, 
  Wrench, History, Settings2, ShieldAlert, Package, QrCode, Printer, FileText, ExternalLink, LifeBuoy, ShieldCheck, Save, Link as LinkIcon, BarChart3, TrendingUp
} from 'lucide-react';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';

const AssetsRegistry: React.FC<any> = ({ assets, setAssets }) => {
  const { units, activeUnitId, inventory, orders, addNotification } = useApp();
  const [searchTerm, setSearchTerm] = useState('');
  const [showForm, setShowForm] = useState<'add' | 'edit' | null>(null);
  const [showDetails, setShowDetails] = useState<Asset | null>(null);
  const [activeTab, setActiveTab] = useState<'analytics' | 'components' | 'history' | 'docs'>('analytics');
  const [expandedGroups, setExpandedGroups] = useState<Set<string>>(new Set());
  const [formData, setFormData] = useState<Partial<Asset>>({});

  const activeUnit = units.find(u => u.id === activeUnitId) || units[0];

  const groupedAssets = useMemo(() => {
    const filtered = assets.filter((i: Asset) => 
      i.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
      i.tag.toLowerCase().includes(searchTerm.toLowerCase())
    );
    const groups: Record<string, Asset[]> = {};
    filtered.forEach((asset: Asset) => {
      const key = `${asset.name}-${asset.model}`;
      if (!groups[key]) groups[key] = [];
      groups[key].push(asset);
    });
    return groups;
  }, [assets, searchTerm]);

  const toggleGroup = (key: string) => {
    const newSet = new Set(expandedGroups);
    if (newSet.has(key)) newSet.delete(key);
    else newSet.add(key);
    setExpandedGroups(newSet);
  };

  const handleOpenAdd = () => {
    setFormData({
        name: '', tag: '', model: '', serialNumber: '', sector: SECTORS[0], status: 'OPERATIONAL', maintenanceFreqDays: 30, manualUrl: ''
    });
    setShowForm('add');
  };

  const handleOpenEdit = (asset: Asset) => {
    setFormData(asset);
    setShowForm('edit');
  };

  const addDocumentField = () => {
    const newDoc: AssetDocument = { id: Date.now().toString(), name: '', type: 'OTHER' };
    setFormData(prev => ({ ...prev, documents: [...(prev.documents || []), newDoc] }));
  };

  const updateDocument = (index: number, field: keyof AssetDocument, value: string) => {
    const newDocs = [...(formData.documents || [])];
    newDocs[index] = { ...newDocs[index], [field]: value };
    setFormData(prev => ({ ...prev, documents: newDocs }));
  };

  const removeDocument = (index: number) => {
    const newDocs = [...(formData.documents || [])];
    newDocs.splice(index, 1);
    setFormData(prev => ({ ...prev, documents: newDocs }));
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.tag) return;

    if (showForm === 'add') {
       const newAsset = { ...formData, id: `asset-${Date.now()}`, unitId: activeUnitId, reliabilityIndex: 100 } as Asset;
       setAssets((prev: Asset[]) => [...prev, newAsset]);
       addNotification({ type: 'success', title: 'Ativo Criado', message: `${newAsset.name} registrado.` });
    } else if (showForm === 'edit' && formData.id) {
       setAssets((prev: Asset[]) => prev.map((a: Asset) => a.id === formData.id ? { ...a, ...formData } as Asset : a));
       addNotification({ type: 'success', title: 'Ativo Atualizado', message: `${formData.name} editado com sucesso.` });
       if (showDetails?.id === formData.id) setShowDetails({ ...showDetails, ...formData } as Asset);
    }
    setShowForm(null);
  };

  const handleDelete = (id: string) => {
      if(confirm("Confirma a exclusão deste ativo? Esta ação removerá o histórico associado.")) {
          setAssets((prev: Asset[]) => prev.filter((a: Asset) => a.id !== id));
          setShowDetails(null);
          addNotification({ type: 'info', title: 'Ativo Removido', message: 'Registro excluído do inventário.' });
      }
  };

  const handleOpenManual = () => {
    if (showDetails?.manualUrl) {
        window.open(showDetails.manualUrl, '_blank');
    } else {
        alert("Nenhum link de manual cadastrado para este ativo. Edite o ativo para adicionar uma URL.");
    }
  };

  const handleViewCert = () => {
      alert(`Certificado de Biossegurança válido até 12/2025 para o ativo ${showDetails?.tag}.\n\nStatus: CONFORME (Visualização simulada)`);
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-700 pb-20">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex items-center gap-5">
           <div className="w-14 h-14 bg-[#1A3673] rounded-2xl flex items-center justify-center text-white shadow-xl"><Layers size={28} /></div>
           <div>
              <h1 className="text-2xl font-black text-[#1A3673] uppercase tracking-tighter italic">Dossiê de Ativos</h1>
              <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest">{activeUnit.name} • Inventário Industrial</p>
           </div>
        </div>
        <div className="flex items-center gap-4">
           <div className="bg-white border border-slate-200 rounded-xl px-5 py-3 flex items-center gap-3 w-72 shadow-sm focus-within:border-[#1A3673] transition-all">
              <Search size={18} className="text-slate-400" />
              <input type="text" placeholder="LOCALIZAR TAG..." className="bg-transparent border-none text-[10px] text-slate-800 focus:outline-none w-full font-black uppercase" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
           </div>
           <button onClick={handleOpenAdd} className="bg-[#1A3673] text-white px-8 py-4 rounded-xl font-black text-[10px] uppercase shadow-lg hover:bg-slate-900 transition-all"><Plus size={16} /> Registrar Novo</button>
        </div>
      </header>

      <div className="space-y-4">
        {Object.entries(groupedAssets).map(([key, items]) => {
            const assetItems = items as Asset[];
            return (
              <div key={key} className="industrial-card overflow-hidden">
                 <div onClick={() => toggleGroup(key)} className="p-6 flex items-center justify-between cursor-pointer hover:bg-slate-50 transition-colors">
                    <div className="flex items-center gap-6">
                       <div className="w-16 h-16 rounded-2xl bg-slate-100 flex items-center justify-center shrink-0">
                          {assetItems[0].photoUrl ? <img src={assetItems[0].photoUrl} className="w-full h-full object-cover rounded-2xl" /> : <Layers className="text-slate-300" size={24} />}
                       </div>
                       <div>
                          <h3 className="text-lg font-black text-slate-900 uppercase italic tracking-tighter">{assetItems[0].name}</h3>
                          <p className="text-[9px] font-black text-slate-400 uppercase mt-1">{assetItems.length} unidades nesta planta</p>
                       </div>
                    </div>
                    <div className={`p-2 transition-all ${expandedGroups.has(key) ? 'rotate-90 text-[#1A3673]' : 'text-slate-300'}`}><RefreshCw size={20} /></div>
                 </div>

                 {expandedGroups.has(key) && (
                   <div className="bg-slate-50/50 border-t border-slate-100 p-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {assetItems.map(asset => (
                          <div key={asset.id} onClick={() => setShowDetails(asset)} className="bg-white p-6 rounded-2xl border border-slate-100 hover:border-[#1A3673] cursor-pointer transition-all shadow-sm group">
                              <div className="flex justify-between items-start mb-6">
                                 <span className="text-[10px] font-black text-[#E31B23] bg-red-50 px-3 py-1 rounded-lg uppercase tracking-widest">{asset.tag}</span>
                                 <div className={`w-2 h-2 rounded-full ${asset.status === 'OPERATIONAL' ? 'bg-emerald-500' : 'bg-red-500'} animate-pulse`}></div>
                              </div>
                              <div className="space-y-4">
                                 <div className="flex justify-between items-center">
                                    <span className="text-[8px] font-black text-slate-400 uppercase tracking-[0.2em]">Confiabilidade</span>
                                    <span className="text-xs font-black italic text-emerald-600">{asset.reliabilityIndex}%</span>
                                 </div>
                                 <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
                                    <div className="h-full bg-emerald-500" style={{ width: `${asset.reliabilityIndex}%` }}></div>
                                 </div>
                              </div>
                          </div>
                      ))}
                   </div>
                 )}
              </div>
            );
        })}
      </div>

      {/* DETALHES DO ATIVO */}
      {showDetails && (
        <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-md z-[100] flex items-center justify-center p-6 animate-in fade-in">
          <div className="bg-white max-w-6xl w-full h-[90vh] rounded-[3rem] shadow-2xl animate-in zoom-in-95 flex flex-col overflow-hidden">
             <div className="p-10 border-b border-slate-100 flex justify-between items-start bg-slate-50/50">
                <div className="flex items-center gap-8">
                   <div className="w-24 h-24 bg-white rounded-[2rem] flex items-center justify-center text-[#1A3673] shadow-xl overflow-hidden border-2 border-slate-200">
                      {showDetails.photoUrl ? <img src={showDetails.photoUrl} className="w-full h-full object-cover" /> : <Activity size={40} />}
                   </div>
                   <div>
                      <div className="flex items-center gap-3 mb-2"><TagIcon size={14} className="text-[#E31B23]" /><span className="text-sm font-black text-[#E31B23] uppercase tracking-widest">{showDetails.tag}</span></div>
                      <h2 className="text-3xl font-black text-[#1A3673] uppercase italic tracking-tighter">{showDetails.name}</h2>
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.4em] mt-1">{showDetails.model} • S/N: {showDetails.serialNumber}</p>
                   </div>
                </div>
                <div className="flex gap-4">
                   <button onClick={() => handleOpenEdit(showDetails)} className="p-4 bg-white text-slate-400 hover:text-[#1A3673] rounded-2xl border border-slate-200 transition-all shadow-sm" title="Editar Ativo"><Edit3 size={24}/></button>
                   <button onClick={() => handleDelete(showDetails.id)} className="p-4 bg-white text-slate-400 hover:text-red-600 rounded-2xl border border-slate-200 transition-all shadow-sm" title="Excluir Ativo"><Trash2 size={24}/></button>
                   <div className="w-px h-12 bg-slate-200 mx-2"></div>
                   <button onClick={() => setShowDetails(null)} className="p-4 bg-slate-100 text-slate-400 hover:text-red-500 rounded-2xl transition-all"><X size={24}/></button>
                </div>
             </div>
             
             <div className="px-10 pt-6 bg-slate-50/50 border-b border-slate-100 flex gap-4 overflow-x-auto no-scrollbar">
                {['analytics', 'components', 'history', 'docs'].map(t => (
                  <button key={t} onClick={() => setActiveTab(t as any)} className={`px-8 py-4 rounded-t-2xl text-[10px] font-black uppercase tracking-[0.2em] transition-all whitespace-nowrap ${activeTab === t ? 'bg-white text-[#1A3673] border-t border-x border-slate-200 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}>
                    {t === 'analytics' ? 'Analytics' : t === 'components' ? 'Vida Útil' : t === 'history' ? 'Life Log' : 'Docs Hub'}
                  </button>
                ))}
             </div>

             <div className="flex-1 overflow-y-auto p-10 custom-scrollbar">
                 {activeTab === 'analytics' && (
                   <div className="space-y-8 animate-in slide-in-from-right-4">
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                         <div className="p-6 bg-slate-50 rounded-2xl border border-slate-100">
                            <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">MTBF (Médio)</h4>
                            <p className="text-3xl font-black text-[#1A3673] italic">1.420h</p>
                            <p className="text-[9px] font-bold text-emerald-500 mt-1 flex items-center gap-1"><TrendingUp size={10}/> +12% vs mês anterior</p>
                         </div>
                         <div className="p-6 bg-slate-50 rounded-2xl border border-slate-100">
                            <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Disponibilidade</h4>
                            <p className="text-3xl font-black text-[#1A3673] italic">98.5%</p>
                            <p className="text-[9px] font-bold text-emerald-500 mt-1 flex items-center gap-1"><CheckCircle2 size={10}/> Meta Atingida</p>
                         </div>
                         <div className="p-6 bg-slate-50 rounded-2xl border border-slate-100">
                            <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Custo Manutenção (YTD)</h4>
                            <p className="text-3xl font-black text-[#1A3673] italic">R$ 4.250</p>
                            <p className="text-[9px] font-bold text-slate-400 mt-1">Acumulado anual</p>
                         </div>
                      </div>

                      <div className="industrial-card p-10 bg-[#1A3673] text-white flex items-center justify-between border-none">
                         <div className="flex items-center gap-6">
                            <div className="w-16 h-16 bg-white/10 rounded-2xl flex items-center justify-center border border-white/20"><LifeBuoy size={32}/></div>
                            <div>
                               <h4 className="text-xl font-black uppercase italic italic leading-none">Manutenção Sugerida IA</h4>
                               <p className="text-white/60 text-[10px] font-bold uppercase tracking-widest mt-2">Próxima intervenção em: 14 dias (Filtros de Exaustão)</p>
                            </div>
                         </div>
                         <button className="px-8 py-4 bg-white text-[#1A3673] rounded-xl font-black uppercase text-[10px] tracking-widest">Aprovar Preventiva</button>
                      </div>

                      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                         <div className="industrial-card p-6 h-[350px] flex flex-col">
                            <h4 className="text-xs font-black text-slate-900 uppercase tracking-widest mb-6 flex items-center gap-2"><Activity size={16} className="text-[#1A3673]"/> Tendência de Confiabilidade</h4>
                            <div className="flex-1 w-full">
                               <ResponsiveContainer width="100%" height="100%">
                                  <LineChart data={(() => {
                                     // Generate dynamic history based on current reliability
                                     const current = showDetails.reliabilityIndex;
                                     const months = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun'];
                                     const data = [];
                                     let val = current;
                                     // Generate backwards from current month
                                     for (let i = 5; i >= 0; i--) {
                                         data[i] = { month: months[i], value: Math.min(100, Math.max(0, Math.round(val))) };
                                         // Simulate previous months with some variance
                                         val = val + (Math.random() * 14 - 7); 
                                     }
                                     return data;
                                  })()}>
                                     <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
                                     <XAxis dataKey="month" tick={{fontSize: 10, fill: '#94a3b8'}} axisLine={false} tickLine={false} />
                                     <YAxis domain={[0, 100]} tick={{fontSize: 10, fill: '#94a3b8'}} axisLine={false} tickLine={false} />
                                     <Tooltip contentStyle={{borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)'}} />
                                     <Line type="monotone" dataKey="value" stroke="#1A3673" strokeWidth={3} dot={{r: 4, fill: '#1A3673', strokeWidth: 2, stroke: '#fff'}} activeDot={{r: 6}} />
                                  </LineChart>
                               </ResponsiveContainer>
                            </div>
                         </div>

                         <div className="industrial-card p-6 h-[350px] flex flex-col">
                            <h4 className="text-xs font-black text-slate-900 uppercase tracking-widest mb-6 flex items-center gap-2"><BarChart3 size={16} className="text-[#1A3673]"/> Downtime por Mês (Horas)</h4>
                            <div className="flex-1 w-full">
                               <ResponsiveContainer width="100%" height="100%">
                                  <BarChart data={[
                                     { month: 'Jan', hours: 2.5 }, { month: 'Fev', hours: 0 }, { month: 'Mar', hours: 4.2 },
                                     { month: 'Abr', hours: 1.0 }, { month: 'Mai', hours: 0.5 }, { month: 'Jun', hours: 0 }
                                  ]}>
                                     <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
                                     <XAxis dataKey="month" tick={{fontSize: 10, fill: '#94a3b8'}} axisLine={false} tickLine={false} />
                                     <YAxis tick={{fontSize: 10, fill: '#94a3b8'}} axisLine={false} tickLine={false} />
                                     <Tooltip cursor={{fill: '#f1f5f9'}} contentStyle={{borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)'}} />
                                     <Bar dataKey="hours" fill="#E31B23" radius={[4, 4, 0, 0]} barSize={30} />
                                  </BarChart>
                               </ResponsiveContainer>
                            </div>
                         </div>
                      </div>
                   </div>
                )}

                 {activeTab === 'history' && (
                  <div className="space-y-6 animate-in fade-in">
                     <h3 className="text-sm font-black text-slate-900 uppercase italic flex items-center gap-3"><History size={20} className="text-[#1A3673]" /> Dossiê de Intervenções (Life Log)</h3>
                     <div className="space-y-4">
                        {[1, 2, 3].map(i => (
                           <div key={i} className="p-6 bg-slate-50 border border-slate-100 rounded-2xl flex justify-between items-center group hover:bg-white hover:shadow-lg transition-all">
                              <div className="flex gap-6 items-center">
                                 <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center text-[#1A3673] border border-slate-200"><Wrench size={20}/></div>
                                 <div>
                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">12/05/2024 • Corretiva</p>
                                    <h4 className="font-bold text-sm uppercase italic">Substituição do Atuador de Damper</h4>
                                 </div>
                              </div>
                              <div className="text-right">
                                 <p className="text-xs font-black text-[#1A3673] italic">R$ 1.450,00</p>
                                 <button className="text-[9px] font-black text-blue-600 uppercase mt-1 flex items-center gap-1">Ver OS <ExternalLink size={10}/></button>
                              </div>
                           </div>
                        ))}
                     </div>
                  </div>
                )}

                {activeTab === 'docs' && (
                   <div className="space-y-6 animate-in slide-in-from-left-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                          {/* Manual Principal */}
                          <div className="industrial-card p-10 bg-slate-50 border-slate-100 group hover:border-[#1A3673] transition-all flex flex-col items-center justify-center text-center h-full">
                             <div className="w-20 h-20 bg-white rounded-3xl flex items-center justify-center text-[#1A3673] mb-6 shadow-sm"><FileText size={32}/></div>
                             <h4 className="text-lg font-black uppercase italic leading-none">Manual de Operação</h4>
                             <p className="text-[10px] text-slate-400 font-bold uppercase mt-2">{showDetails.manualUrl ? 'Documento Vinculado' : 'Não Cadastrado'}</p>
                             <button 
                                onClick={handleOpenManual}
                                className={`mt-8 px-10 py-4 rounded-xl font-black uppercase text-[10px] tracking-widest shadow-xl transition-all ${showDetails.manualUrl ? 'bg-[#1A3673] text-white hover:bg-slate-900' : 'bg-slate-200 text-slate-400'}`}
                             >
                                {showDetails.manualUrl ? 'Abrir PDF / Link' : 'Link Indisponível'}
                             </button>
                          </div>
                          
                          {/* Lista de Documentos Adicionais */}
                          <div className="space-y-4">
                             <h4 className="text-sm font-black text-[#1A3673] uppercase italic mb-4 flex items-center gap-2"><ShieldCheck size={18}/> Documentação & Conformidade</h4>
                             <div className="space-y-3 max-h-[400px] overflow-y-auto custom-scrollbar pr-2">
                             {showDetails.documents && showDetails.documents.length > 0 ? (
                                showDetails.documents.map(doc => {
                                   const daysToexpire = doc.expirationDate ? Math.ceil((new Date(doc.expirationDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)) : null;
                                   const isExpired = daysToexpire !== null && daysToexpire < 0;
                                   const isNear = daysToexpire !== null && daysToexpire >= 0 && daysToexpire < 30;

                                   return (
                                     <div key={doc.id} className={`bg-white p-4 rounded-xl border flex justify-between items-center shadow-sm transition-all ${isExpired ? 'border-red-200 bg-red-50/30' : 'border-slate-100'}`}>
                                        <div className="flex items-center gap-4">
                                           <div className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 ${isExpired ? 'bg-red-100 text-red-500' : isNear ? 'bg-amber-100 text-amber-500' : 'bg-slate-100 text-slate-400'}`}>
                                              {doc.type === 'CERTIFICATE' ? <ShieldCheck size={20}/> : <FileText size={20}/>}
                                           </div>
                                           <div>
                                              <h5 className="text-xs font-bold text-slate-700 uppercase">{doc.name}</h5>
                                              <div className="flex flex-wrap gap-2 mt-1">
                                                 <span className="text-[9px] font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded uppercase">{doc.type === 'CERTIFICATE' ? 'Certificado' : doc.type === 'LICENSE' ? 'Licença' : doc.type === 'MANUAL' ? 'Manual' : 'Outro'}</span>
                                                 {doc.expirationDate && (
                                                    <span className={`text-[9px] font-bold px-2 py-0.5 rounded uppercase ${isExpired ? 'bg-red-100 text-red-600' : isNear ? 'bg-amber-100 text-amber-600' : 'bg-emerald-50 text-emerald-600'}`}>
                                                       {isExpired ? 'VENCIDO' : `Vence em ${daysToexpire} dias`}
                                                    </span>
                                                 )}
                                              </div>
                                           </div>
                                        </div>
                                        {doc.url && (
                                            <a href={doc.url} target="_blank" rel="noopener noreferrer" className="p-2 text-slate-400 hover:text-[#1A3673] transition-colors bg-slate-50 rounded-lg hover:bg-blue-50">
                                               <ExternalLink size={16} />
                                            </a>
                                        )}
                                     </div>
                                   );
                                })
                             ) : (
                                <div className="text-center py-12 bg-slate-50 rounded-xl border border-dashed border-slate-200 text-slate-400 text-xs flex flex-col items-center gap-2">
                                   <FileText size={24} className="opacity-20"/>
                                   Nenhum documento adicional cadastrado.
                                </div>
                             )}
                             </div>
                          </div>
                      </div>
                   </div>
                )}
             </div>
          </div>
        </div>
      )}

      {/* FORMULÁRIO MODAL DE CADASTRO/EDIÇÃO */}
      {showForm && (
        <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-md z-[200] flex items-center justify-center p-6 animate-in fade-in">
           <div className="bg-white max-w-2xl w-full p-12 rounded-[3.5rem] shadow-3xl animate-in zoom-in-95 max-h-[90vh] overflow-y-auto custom-scrollbar">
              <div className="flex justify-between items-center mb-10">
                 <h2 className="text-2xl font-black text-[#1A3673] uppercase italic">
                    {showForm === 'add' ? 'Registrar Novo Ativo' : 'Editar Propriedades'}
                 </h2>
                 <button onClick={() => setShowForm(null)} className="text-slate-300 hover:text-red-500 transition-colors"><X size={28}/></button>
              </div>

              <form onSubmit={handleSave} className="space-y-8">
                 <div className="grid grid-cols-2 gap-6">
                    <div className="space-y-2">
                       <label className="industrial-label">TAG Identificadora</label>
                       <input type="text" required className="industrial-input uppercase" value={formData.tag} onChange={e => setFormData({...formData, tag: e.target.value.toUpperCase()})} placeholder="EX: INC-01" />
                    </div>
                    <div className="space-y-2">
                       <label className="industrial-label">Nome do Equipamento</label>
                       <input type="text" required className="industrial-input" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
                    </div>
                 </div>

                 <div className="grid grid-cols-2 gap-6">
                    <div className="space-y-2">
                       <label className="industrial-label">Modelo / Fabricante</label>
                       <input type="text" required className="industrial-input" value={formData.model} onChange={e => setFormData({...formData, model: e.target.value})} />
                    </div>
                    <div className="space-y-2">
                       <label className="industrial-label">Número de Série (S/N)</label>
                       <input type="text" className="industrial-input uppercase" value={formData.serialNumber} onChange={e => setFormData({...formData, serialNumber: e.target.value.toUpperCase()})} />
                    </div>
                 </div>

                 <div className="grid grid-cols-2 gap-6">
                    <div className="space-y-2">
                       <label className="industrial-label">Setor Operacional</label>
                       <select className="industrial-input" value={formData.sector} onChange={e => setFormData({...formData, sector: e.target.value})}>
                          {SECTORS.map(s => <option key={s} value={s}>{s.toUpperCase()}</option>)}
                       </select>
                    </div>
                    <div className="space-y-2">
                       <label className="industrial-label">Frequência Manutenção (Dias)</label>
                       <input type="number" className="industrial-input" value={formData.maintenanceFreqDays} onChange={e => setFormData({...formData, maintenanceFreqDays: Number(e.target.value)})} />
                    </div>
                 </div>

                 {/* NOVO CAMPO: URL DO MANUAL */}
                 <div className="space-y-2">
                    <label className="industrial-label">Link do Manual / Documentação (URL)</label>
                    <div className="relative">
                        <LinkIcon className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
                        <input 
                            type="url" 
                            className="industrial-input pl-12" 
                            value={formData.manualUrl || ''} 
                            onChange={e => setFormData({...formData, manualUrl: e.target.value})} 
                            placeholder="https://drive.google.com/..." 
                        />
                    </div>
                 </div>

                 {/* GESTÃO DE DOCUMENTOS */}
                 <div className="space-y-4 border-t border-slate-100 pt-6">
                    <div className="flex justify-between items-center">
                        <label className="industrial-label">Documentos & Certificados</label>
                        <button type="button" onClick={addDocumentField} className="text-xs text-[#1A3673] font-bold flex items-center gap-1 hover:underline">
                        <Plus size={14} /> Adicionar
                        </button>
                    </div>
                    
                    {formData.documents?.map((doc, index) => (
                        <div key={index} className="grid grid-cols-12 gap-2 items-end bg-slate-50 p-3 rounded-xl border border-slate-100">
                        <div className="col-span-3">
                            <label className="text-[9px] font-bold text-slate-400 uppercase block mb-1">Nome</label>
                            <input type="text" className="industrial-input py-2 text-xs" value={doc.name} onChange={e => updateDocument(index, 'name', e.target.value)} placeholder="Ex: Laudo NR-12" />
                        </div>
                        <div className="col-span-3">
                            <label className="text-[9px] font-bold text-slate-400 uppercase block mb-1">Tipo</label>
                            <select className="industrial-input py-2 text-xs" value={doc.type} onChange={e => updateDocument(index, 'type', e.target.value)}>
                            <option value="MANUAL">Manual</option>
                            <option value="CERTIFICATE">Certificado</option>
                            <option value="LICENSE">Licença</option>
                            <option value="OTHER">Outro</option>
                            </select>
                        </div>
                        <div className="col-span-3">
                            <label className="text-[9px] font-bold text-slate-400 uppercase block mb-1">Validade</label>
                            <input type="date" className="industrial-input py-2 text-xs" value={doc.expirationDate || ''} onChange={e => updateDocument(index, 'expirationDate', e.target.value)} />
                        </div>
                        <div className="col-span-2">
                            <label className="text-[9px] font-bold text-slate-400 uppercase block mb-1">URL</label>
                            <input type="text" className="industrial-input py-2 text-xs" value={doc.url || ''} onChange={e => updateDocument(index, 'url', e.target.value)} placeholder="https://..." />
                        </div>
                        <div className="col-span-1 flex justify-center pb-2">
                            <button type="button" onClick={() => removeDocument(index)} className="text-red-400 hover:text-red-600 bg-white p-2 rounded-lg shadow-sm border border-slate-200"><Trash2 size={14} /></button>
                        </div>
                        </div>
                    ))}
                    {(!formData.documents || formData.documents.length === 0) && (
                        <div className="text-center py-4 bg-slate-50 rounded-xl border border-dashed border-slate-300 text-slate-400 text-xs">
                            Nenhum documento adicional vinculado.
                        </div>
                    )}
                 </div>

                 <div className="space-y-2">
                    <label className="industrial-label">Status Atual</label>
                    <div className="flex gap-4">
                       {['OPERATIONAL', 'MAINTENANCE', 'STOPPED'].map(st => (
                          <button 
                             key={st} 
                             type="button" 
                             onClick={() => setFormData({...formData, status: st as any})}
                             className={`flex-1 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${formData.status === st ? (st === 'OPERATIONAL' ? 'bg-emerald-500 text-white' : st === 'MAINTENANCE' ? 'bg-amber-500 text-white' : 'bg-red-500 text-white') : 'bg-slate-100 text-slate-400'}`}
                          >
                             {st === 'OPERATIONAL' ? 'Operacional' : st === 'MAINTENANCE' ? 'Em Manutenção' : 'Parado'}
                          </button>
                       ))}
                    </div>
                 </div>

                 <button type="submit" className="w-full py-6 bg-[#1A3673] text-white rounded-2xl font-black uppercase text-xs tracking-widest shadow-2xl flex items-center justify-center gap-3 hover:bg-slate-900 transition-all">
                    <Save size={20} /> Salvar Registro
                 </button>
              </form>
           </div>
        </div>
      )}
    </div>
  );
};

export default AssetsRegistry;
