
import React, { useState, useEffect } from 'react';
import { Asset, AssetComponent, EagleTraxTelemetry } from '../types';
import { useApp } from '../context/AppContext'; 
import { SECTORS } from '../constants';
import { iotService } from '../services/iotService';
import { 
  Server, Plus, Search, Edit3, Trash2, X, Save, Activity, Gauge, AlertTriangle, CheckCircle2, 
  CloudLightning, RefreshCw, Loader2, Wifi, Lock, Thermometer, Droplets, Wind, RotateCw, ExternalLink, Link as LinkIcon, ChevronRight
} from 'lucide-react';

interface AssetsRegistryProps {
  assets: Asset[];
  setAssets: React.Dispatch<React.SetStateAction<Asset[]>>;
}

const AssetsRegistry: React.FC<AssetsRegistryProps> = ({ assets, setAssets }) => {
  const { units, activeUnitId } = useApp();
  const [searchTerm, setSearchTerm] = useState('');
  const [showForm, setShowForm] = useState<'add' | 'edit' | null>(null);
  const [showDetails, setShowDetails] = useState<Asset | null>(null);
  const [activeTab, setActiveTab] = useState<'eagleTrax' | 'components'>('eagleTrax');
  
  const [showComponentForm, setShowComponentForm] = useState(false);
  const [newComponent, setNewComponent] = useState<{name: string, lifespan: number, current: number}>({
    name: '', lifespan: 5000, current: 0
  });
  
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncStatus, setSyncStatus] = useState<string>('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const [formData, setFormData] = useState<Omit<Asset, 'id' | 'unitId' | 'status'>>({
    name: '', model: '', serialNumber: '', sector: SECTORS[0], eagleTraxUrl: ''
  });

  const filtered = assets.filter(i => 
    i.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    i.serialNumber.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const activeUnit = units.find(u => u.id === activeUnitId) || units[0];

  const handleOpenAdd = () => {
    setFormData({ name: '', model: '', serialNumber: '', sector: SECTORS[0], eagleTraxUrl: '' });
    setShowForm('add');
  };

  const handleOpenEdit = (asset: Asset) => {
    setFormData({ 
      name: asset.name, 
      model: asset.model, 
      serialNumber: asset.serialNumber, 
      sector: asset.sector,
      eagleTraxUrl: asset.eagleTraxUrl || ''
    });
    setShowForm('edit');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (showForm === 'add') {
      const newId = `a-${Date.now()}`;
      setAssets(prev => [...prev, { 
        ...formData, 
        id: newId, 
        unitId: activeUnitId, // CORREÇÃO: Usa a unidade ativa
        status: 'OPERATIONAL',
        components: [],
        eagleTraxData: iotService.getTelemetryStream(newId)
      }]);
    } else if (showForm === 'edit' && showDetails) {
      setAssets(prev => prev.map(item => 
        item.id === showDetails.id ? { ...item, ...formData } : item
      ));
    }
    setShowForm(null);
  };

  const handleDelete = (id: string) => {
    if (confirm('Excluir este ativo permanentemente?')) {
      setAssets(prev => prev.filter(i => i.id !== id));
    }
  };

  const handleSaveComponent = () => {
     if(!showDetails || !newComponent.name || newComponent.lifespan <= 0) return;
     
     const newComp: AssetComponent = {
        id: `c-${Date.now()}`,
        name: newComponent.name,
        installDate: new Date().toISOString().split('T')[0],
        lifespanHours: newComponent.lifespan,
        currentHours: newComponent.current,
        status: calculateStatus(newComponent.current, newComponent.lifespan)
     };

     setAssets(prev => prev.map(a => {
        if (a.id !== showDetails.id) return a;
        return { ...a, components: [...(a.components || []), newComp] };
     }));

     setShowDetails(prev => prev ? {...prev, components: [...(prev.components || []), newComp]} : null);
     setNewComponent({ name: '', lifespan: 5000, current: 0 });
     setShowComponentForm(false);
  };

  const calculateStatus = (current: number, max: number): 'OK' | 'WARNING' | 'CRITICAL' => {
     const p = (current / max) * 100;
     if (p >= 95) return 'CRITICAL';
     if (p >= 80) return 'WARNING';
     return 'OK';
  };

  const handleSyncEagleTrax = async () => {
    setErrorMessage(null);
    if (!showDetails) return;

    if (!activeUnit.eagleTraxApiKey || activeUnit.eagleTraxStatus !== 'CONNECTED') {
        setErrorMessage("API Eagle Trax não configurada para " + activeUnit.name);
        setTimeout(() => setErrorMessage(null), 5000);
        return;
    }
    
    setIsSyncing(true);
    setSyncStatus('Recebendo pacotes de dados...');
    await new Promise(r => setTimeout(r, 1200));

    const newTelemetry = iotService.getTelemetryStream(showDetails.id);

    // FIX: Incremento realista para simulação (0.1 a 0.5h) em vez de 24h fixas
    const updatedComponents = (showDetails.components || []).map(comp => {
        const timeIncrement = 0.1 + Math.random() * 0.4;
        const newHours = comp.currentHours + timeIncrement;
        return { ...comp, currentHours: newHours, status: calculateStatus(newHours, comp.lifespanHours) };
    });

    setAssets(prev => prev.map(a => 
        a.id === showDetails.id 
        ? { ...a, components: updatedComponents, eagleTraxData: newTelemetry, lastMaintenance: new Date().toISOString().split('T')[0] } 
        : a
    ));

    setShowDetails(prev => prev ? { ...prev, components: updatedComponents, eagleTraxData: newTelemetry } : null);
    setIsSyncing(false);
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-700 pb-20">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex items-center gap-5">
           <div className="w-14 h-14 bg-[#1A3673] rounded-2xl flex items-center justify-center text-white shadow-xl">
              <Server size={28} />
           </div>
           <div>
              <h1 className="text-2xl font-black text-[#1A3673] uppercase tracking-tighter">Ativos Industriais</h1>
              <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest">{activeUnit.name}</p>
           </div>
        </div>

        <div className="flex items-center gap-4">
           <div className="bg-white border border-slate-200 rounded-xl px-5 py-3 flex items-center gap-3 w-72 shadow-sm">
              <Search size={18} className="text-slate-400" />
              <input 
                type="text" 
                placeholder="BUSCAR PATRIMÔNIO..." 
                className="bg-transparent border-none text-[10px] text-slate-800 focus:outline-none w-full font-black uppercase tracking-wider"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
           </div>
           <button 
             onClick={handleOpenAdd}
             className="bg-[#1A3673] hover:bg-[#2A4B94] text-white px-8 py-4 rounded-xl font-black text-[10px] uppercase tracking-widest transition-all flex items-center gap-3 shadow-lg"
           >
              <Plus size={16} /> Novo Ativo
           </button>
        </div>
      </header>

      <div className="industrial-card rounded-[2.5rem] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200">
                <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Identificação</th>
                <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Modelo / Série</th>
                <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Monitoramento</th>
                <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.map(asset => (
                  <tr key={asset.id} className="hover:bg-slate-50 transition-colors group cursor-pointer" onClick={() => setShowDetails(asset)}>
                    <td className="px-8 py-6">
                      <div className="flex flex-col">
                        <span className="font-bold text-slate-900 text-sm uppercase">{asset.name}</span>
                        <span className="text-[9px] text-slate-400 font-black mono tracking-tighter">ID: {asset.id}</span>
                      </div>
                    </td>
                    <td className="px-8 py-6">
                      <div className="flex flex-col">
                        <span className="font-bold text-slate-700 text-xs uppercase">{asset.model}</span>
                        <span className="text-[9px] text-slate-400 font-bold tracking-wider">SN: {asset.serialNumber}</span>
                      </div>
                    </td>
                    <td className="px-8 py-6">
                      {asset.eagleTraxData ? (
                         <div className="flex items-center gap-2">
                            <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></span>
                            <span className="text-[9px] font-black text-emerald-600 uppercase tracking-wide">Live Telemetry</span>
                         </div>
                      ) : (
                         <div className="flex items-center gap-2">
                            <span className="w-2 h-2 bg-slate-300 rounded-full"></span>
                            <span className="text-[9px] font-black text-slate-400 uppercase tracking-wide">Standard</span>
                         </div>
                      )}
                    </td>
                    <td className="px-8 py-6 text-right">
                      <div className="flex justify-end gap-2 opacity-40 group-hover:opacity-100 transition-opacity" onClick={e => e.stopPropagation()}>
                          <button onClick={() => { setShowDetails(asset); handleOpenEdit(asset); }} className="p-2.5 bg-slate-100 hover:bg-[#1A3673] text-slate-500 hover:text-white rounded-xl transition-all"><Edit3 size={16}/></button>
                          <button onClick={() => handleDelete(asset.id)} className="p-2.5 bg-slate-100 hover:bg-red-500 text-slate-500 hover:text-white rounded-xl transition-all"><Trash2 size={16}/></button>
                      </div>
                    </td>
                  </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {showDetails && (
        <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-md z-[100] flex items-center justify-center p-6 animate-in fade-in">
          <div className="bg-white max-w-5xl w-full h-[90vh] rounded-[2.5rem] shadow-2xl animate-in zoom-in-95 flex flex-col overflow-hidden relative">
             
             {isSyncing && (
                <div className="absolute inset-0 bg-slate-900/90 z-[110] flex flex-col items-center justify-center text-white space-y-4 animate-in fade-in">
                   <CloudLightning className="text-emerald-500 animate-pulse" size={64} />
                   <h3 className="text-xl font-black uppercase tracking-widest animate-pulse">Eagle Trax Sync...</h3>
                   <p className="text-xs font-bold text-slate-400 uppercase tracking-widest font-mono">{syncStatus}</p>
                </div>
             )}

             <div className="p-8 border-b border-slate-100 flex justify-between items-start bg-slate-50 shrink-0">
                <div className="flex items-center gap-6">
                   <div className="w-16 h-16 bg-[#1A3673] rounded-2xl flex items-center justify-center text-white shadow-lg">
                      <Activity size={32} />
                   </div>
                   <div>
                      <h2 className="text-2xl font-black text-[#1A3673] uppercase italic tracking-tighter">{showDetails.name}</h2>
                      <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mt-1">SGI Asset Registry • {activeUnit.name}</p>
                   </div>
                </div>
                <button onClick={() => setShowDetails(null)} className="p-2 text-slate-300 hover:text-[#e31b23] transition-colors"><X size={28}/></button>
             </div>
             
             <div className="px-8 pt-4 bg-slate-50 border-b border-slate-100 flex gap-1">
                {['eagleTrax', 'components'].map(t => (
                  <button key={t} onClick={() => setActiveTab(t as any)} className={`px-6 py-3 rounded-t-xl text-xs font-black uppercase transition-all ${activeTab === t ? 'bg-white text-[#1A3673] border-t border-x border-slate-100' : 'text-slate-400'}`}>
                    {t === 'eagleTrax' ? 'Telemetria' : 'Componentes'}
                  </button>
                ))}
             </div>

             <div className="flex-1 overflow-y-auto p-8 custom-scrollbar bg-[#f8fafc]">
                {errorMessage && (
                    <div className="mb-6 bg-red-50 border-l-4 border-[#e31b23] p-4 rounded-r-xl flex items-center gap-3 shadow-sm animate-in slide-in-from-top-2">
                        <AlertTriangle className="text-[#e31b23]" size={20} />
                        <p className="text-xs text-red-800 font-bold">{errorMessage}</p>
                    </div>
                )}

                {activeTab === 'eagleTrax' && (
                  <div className="space-y-8 animate-in slide-in-from-right-4">
                     <div className="flex justify-between items-center mb-4">
                        <p className="text-xs font-black text-slate-700 uppercase tracking-widest">Status Petersime Live</p>
                        <div className="flex gap-2">
                           <button onClick={handleSyncEagleTrax} className="bg-[#1A3673] text-white px-6 py-2 rounded-lg text-[10px] font-black uppercase flex items-center gap-2"><RefreshCw size={14} /> Sync</button>
                        </div>
                     </div>

                     <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                        <SensorCard label="Temp" value={showDetails.eagleTraxData?.temperature.toFixed(1) || '--'} unit="°F" icon={Thermometer} color="text-rose-500" bg="bg-rose-50" subtext="Incubação"/>
                        <SensorCard label="Humid" value={showDetails.eagleTraxData?.humidity.toFixed(1) || '--'} unit="%" icon={Droplets} color="text-blue-500" bg="bg-blue-50" subtext="Controle"/>
                        <SensorCard label="CO2" value={Math.round(showDetails.eagleTraxData?.co2 || 0).toString()} unit="ppm" icon={CloudLightning} color="text-slate-700" bg="bg-slate-100" subtext="Exaustão"/>
                        <SensorCard label="Damper" value={Math.round(showDetails.eagleTraxData?.damper || 0).toString()} unit="%" icon={Wind} color="text-emerald-600" bg="bg-emerald-50" subtext="Abertura"/>
                     </div>

                     <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        <div className="lg:col-span-2 bg-white rounded-3xl p-6 border border-slate-200 shadow-sm flex items-center justify-around py-8">
                           <div className="text-center">
                              <div className={`w-20 h-20 rounded-full flex items-center justify-center border-4 ${showDetails.eagleTraxData?.turning !== 'LEVEL' ? 'border-emerald-400' : 'border-slate-200'}`}>
                                 <RotateCw size={32} className={`text-emerald-600 ${showDetails.eagleTraxData?.turning !== 'LEVEL' ? 'animate-spin' : ''}`} />
                              </div>
                              <p className="text-[10px] font-black uppercase mt-2">Viragem {showDetails.eagleTraxData?.turning}</p>
                           </div>
                           <div className="text-center">
                              <p className="text-[9px] font-bold text-slate-400 uppercase">Fase do Ciclo</p>
                              <p className="text-4xl font-black text-[#1A3673]">DIA {showDetails.eagleTraxData?.programStep || 1}</p>
                              <p className="text-[10px] font-bold text-slate-400 uppercase">Petersime Program</p>
                           </div>
                        </div>
                        <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm flex flex-col items-center justify-center text-center opacity-60">
                           <CheckCircle2 size={40} className="text-emerald-500 mb-2" />
                           <p className="text-[10px] font-black uppercase">Estabilidade OK</p>
                        </div>
                     </div>
                  </div>
                )}

                {activeTab === 'components' && (
                  <div className="animate-in slide-in-from-right-4 space-y-6">
                     <div className="flex justify-between items-center">
                        <h3 className="text-lg font-black text-slate-900 uppercase tracking-tight">Lifecycle Management</h3>
                        <button onClick={() => setShowComponentForm(true)} className="px-4 py-2 border border-slate-200 hover:border-[#1A3673] rounded-xl font-black uppercase text-[10px] transition-all flex items-center gap-2"><Plus size={14} /> Nova Peça</button>
                     </div>
                     <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {(showDetails.components || []).map((comp) => {
                           const percent = Math.min(100, (comp.currentHours / comp.lifespanHours) * 100);
                           const color = percent >= 95 ? 'bg-red-500' : percent >= 80 ? 'bg-amber-500' : 'bg-emerald-500';
                           return (
                              <div key={comp.id} className="p-6 rounded-3xl border border-slate-200 bg-white shadow-sm">
                                 <div className="flex justify-between items-start mb-4">
                                    <h4 className="font-black text-slate-800 uppercase text-xs">{comp.name}</h4>
                                    <span className={`px-2 py-1 rounded text-[8px] font-black uppercase text-white ${color}`}>{Math.round(percent)}% USO</span>
                                 </div>
                                 <div className="h-4 bg-slate-100 rounded-full overflow-hidden border border-slate-100">
                                    <div className={`h-full rounded-full transition-all ${color}`} style={{ width: `${percent}%` }}></div>
                                 </div>
                              </div>
                           );
                        })}
                     </div>
                  </div>
                )}
             </div>
          </div>
        </div>
      )}

      {showForm && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md z-[100] flex items-center justify-center p-6">
           <div className="bg-white max-w-xl w-full p-12 rounded-[2.5rem] shadow-2xl animate-in zoom-in-95">
              <h2 className="text-2xl font-black text-[#1A3673] uppercase italic mb-10">{showForm === 'add' ? 'Registrar Máquina' : 'Editar Ativo'}</h2>
              <form onSubmit={handleSubmit} className="space-y-8">
                 <div className="space-y-2">
                    <label className="industrial-label">Nome</label>
                    <input type="text" required className="industrial-input uppercase" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value.toUpperCase()})} />
                 </div>
                 <div className="grid grid-cols-2 gap-6">
                    <div className="space-y-2">
                       <label className="industrial-label">Modelo</label>
                       <input type="text" required className="industrial-input" value={formData.model} onChange={e => setFormData({...formData, model: e.target.value})} />
                    </div>
                    <div className="space-y-2">
                       <label className="industrial-label">Setor</label>
                       <select className="industrial-input uppercase" value={formData.sector} onChange={e => setFormData({...formData, sector: e.target.value})}>
                           {SECTORS.map(s => <option key={s} value={s}>{s}</option>)}
                       </select>
                    </div>
                 </div>
                 <button type="submit" className="w-full py-5 bg-[#1A3673] text-white font-black uppercase rounded-2xl shadow-xl hover:bg-[#2A4B94]">Salvar no Inventário de {activeUnitId}</button>
              </form>
           </div>
        </div>
      )}

      {showComponentForm && (
        <div className="fixed inset-0 bg-slate-900/70 backdrop-blur-sm z-[2000] flex items-center justify-center p-6 animate-in fade-in">
           <div className="bg-white max-w-sm w-full p-8 rounded-[2.5rem] shadow-2xl">
              <h3 className="text-xl font-black text-[#1A3673] uppercase italic mb-6">Novo Componente</h3>
              <div className="space-y-4">
                 <input type="text" placeholder="Nome da Peça" className="industrial-input uppercase !text-xs" value={newComponent.name} onChange={e => setNewComponent({...newComponent, name: e.target.value})} />
                 <div className="grid grid-cols-2 gap-4">
                    <input type="number" placeholder="Vida Útil (h)" className="industrial-input !text-xs" value={newComponent.lifespan} onChange={e => setNewComponent({...newComponent, lifespan: Number(e.target.value)})} />
                    <input type="number" placeholder="Uso Atual (h)" className="industrial-input !text-xs" value={newComponent.current} onChange={e => setNewComponent({...newComponent, current: Number(e.target.value)})} />
                 </div>
                 <button onClick={handleSaveComponent} className="w-full py-4 bg-[#1A3673] text-white rounded-xl font-black uppercase text-[10px] shadow-lg">Salvar Peça</button>
              </div>
           </div>
        </div>
      )}
    </div>
  );
};

const SensorCard = ({ label, value, unit, icon: Icon, color, bg, subtext }: any) => (
   <div className={`p-5 rounded-2xl border border-slate-100 flex items-start justify-between ${bg}`}>
      <div>
         <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">{label}</p>
         <div className="flex items-baseline gap-1">
            <span className={`text-2xl font-black ${color} tracking-tighter`}>{value}</span>
            <span className="text-[10px] font-bold text-slate-500">{unit}</span>
         </div>
         <p className="text-[8px] font-bold text-slate-400 uppercase mt-2 opacity-60">{subtext}</p>
      </div>
      <div className={`p-2 rounded-lg bg-white/50 ${color}`}><Icon size={18} /></div>
   </div>
);

export default AssetsRegistry;
