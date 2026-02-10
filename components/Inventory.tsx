
import React, { useState, useRef } from 'react';
import { InventoryItem } from '../types';
import { useApp } from '../context/AppContext'; 
import { 
  Package, Plus, AlertCircle, Search, 
  Edit3, Trash2, X, Save, QrCode, Camera, Loader2, CheckCircle2
} from 'lucide-react';

interface InventoryProps {
  inventory: InventoryItem[];
  setInventory: React.Dispatch<React.SetStateAction<InventoryItem[]>>;
}

const Inventory: React.FC<InventoryProps> = ({ inventory, setInventory }) => {
  const { units, addNotification } = useApp();
  const [searchTerm, setSearchTerm] = useState('');
  const [showForm, setShowForm] = useState<'add' | 'edit' | null>(null);
  const [activeItem, setActiveItem] = useState<InventoryItem | null>(null);
  const [showQR, setShowQR] = useState<InventoryItem | null>(null);
  const [showScanner, setShowScanner] = useState(false);
  
  const videoRef = useRef<HTMLVideoElement>(null);
  const currentUnitId = inventory[0]?.unitId || 'u1';

  const [formData, setFormData] = useState<Omit<InventoryItem, 'id' | 'unitId'>>({
    name: '', cost: 0, stock: 0, minStock: 0, unit: 'un'
  });

  const filtered = inventory.filter(i => i.name.toLowerCase().includes(searchTerm.toLowerCase()));

  const handleOpenAdd = () => {
    setFormData({ name: '', cost: 0, stock: 0, minStock: 0, unit: 'un' });
    setShowForm('add');
  };

  const handleOpenEdit = (item: InventoryItem) => {
    setActiveItem(item);
    setFormData({ 
      name: item.name, 
      cost: item.cost, 
      stock: item.stock, 
      minStock: item.minStock, 
      unit: item.unit 
    });
    setShowForm('edit');
  };

  const startScanner = async () => {
    setShowScanner(true);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
      // Simulação de detecção após 2 segundos (num app real usaria jsQR ou similar)
      setTimeout(() => {
        const randomItem = inventory[Math.floor(Math.random() * inventory.length)];
        if (randomItem) {
            setSearchTerm(randomItem.name);
            addNotification({ type: 'success', title: 'Item Detectado', message: `QR Code de "${randomItem.name}" identificado.` });
        }
        stopScanner();
      }, 2500);
    } catch (err) {
      addNotification({ type: 'critical', title: 'Erro de Câmera', message: 'Não foi possível acessar a câmera para o scanner.' });
      setShowScanner(false);
    }
  };

  const stopScanner = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      stream.getTracks().forEach(track => track.stop());
    }
    setShowScanner(false);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (showForm === 'add') {
      setInventory(prev => [...prev, { ...formData, id: `P-${Date.now()}`, unitId: currentUnitId }]);
    } else if (showForm === 'edit' && activeItem) {
      setInventory(prev => prev.map(item => 
        item.id === activeItem.id ? { ...item, ...formData } : item
      ));
    }
    setShowForm(null);
    setActiveItem(null);
  };

  const handleDelete = (id: string) => {
    if (confirm('Atenção: A exclusão deste item é permanente. Deseja prosseguir?')) {
      setInventory(prev => prev.filter(i => i.id !== id));
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      <header className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        <div className="flex items-center gap-5">
           <div className="w-14 h-14 bg-[#1A3673] rounded-2xl flex items-center justify-center text-white shadow-xl">
              <Package size={28} />
           </div>
           <div>
              <h1 className="text-2xl font-black text-[#1A3673] uppercase tracking-tighter italic">Almoxarifado</h1>
              <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest">Gestão de Insumos • Aviagen SGI</p>
           </div>
        </div>

        <div className="flex items-center gap-4">
           <div className="bg-white border border-slate-200 rounded-xl px-5 py-3 flex items-center gap-3 w-72 shadow-sm">
              <Search size={18} className="text-slate-400" />
              <input 
                type="text" 
                placeholder="LOCALIZAR MATERIAL..." 
                className="bg-transparent border-none text-[10px] text-slate-800 focus:outline-none w-full font-black uppercase tracking-wider"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
           </div>
           <button 
             onClick={startScanner}
             className="p-4 bg-slate-100 text-[#1A3673] rounded-xl hover:bg-blue-50 transition-all border border-slate-200 shadow-sm"
             title="Scanner de Câmera"
           >
              <Camera size={20} />
           </button>
           <button 
             onClick={handleOpenAdd}
             className="bg-[#1A3673] hover:bg-slate-900 text-white px-8 py-4 rounded-xl font-black text-[10px] uppercase tracking-widest transition-all flex items-center gap-3 shadow-lg"
           >
              <Plus size={16} /> Cadastrar Item
           </button>
        </div>
      </header>

      {/* VISUALIZAÇÃO DE SCANNER */}
      {showScanner && (
        <div className="fixed inset-0 z-[2000] bg-slate-900 flex flex-col items-center justify-center p-6">
            <div className="relative w-full max-w-lg aspect-square bg-black rounded-[3rem] overflow-hidden border-4 border-white/20 shadow-3xl">
                <video ref={videoRef} autoPlay playsInline className="w-full h-full object-cover opacity-60" />
                <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-64 h-64 border-2 border-dashed border-emerald-400 rounded-3xl animate-pulse flex items-center justify-center">
                        <div className="w-full h-0.5 bg-emerald-400 animate-bounce"></div>
                    </div>
                </div>
                <div className="absolute bottom-10 left-0 right-0 text-center">
                    <p className="text-white font-black uppercase text-xs tracking-widest animate-pulse">Aguardando QR Code...</p>
                </div>
            </div>
            <button onClick={stopScanner} className="mt-8 bg-white/10 hover:bg-white/20 text-white px-10 py-5 rounded-2xl font-black uppercase text-xs tracking-widest border border-white/20 transition-all flex items-center gap-3">
                <X size={20} /> Cancelar Leitura
            </button>
        </div>
      )}

      <div className="industrial-card rounded-[2.5rem] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200">
                <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Insumo / Código</th>
                <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Status de Estoque</th>
                <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Valor Unitário</th>
                <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.map(item => (
                <tr key={item.id} className="hover:bg-slate-50 transition-colors group">
                  <td className="px-8 py-6">
                    <div className="flex flex-col">
                      <span className="font-bold text-slate-900 text-sm uppercase italic">{item.name}</span>
                      <span className="text-[9px] text-slate-400 font-black mono tracking-tighter">REF: {item.id}</span>
                    </div>
                  </td>
                  <td className="px-8 py-6">
                     <div className="flex items-center gap-3">
                        <span className={`px-4 py-1.5 rounded-lg font-black text-[10px] min-w-[80px] text-center ${item.stock <= item.minStock ? 'bg-red-500 text-white shadow-lg shadow-red-500/20' : 'bg-blue-50 text-[#1A3673] border border-blue-100'}`}>
                          {item.stock} {item.unit.toUpperCase()}
                        </span>
                        {item.stock <= item.minStock && (
                          <div className="flex items-center gap-1.5 text-red-500 animate-pulse">
                            <AlertCircle size={14} />
                            <span className="text-[8px] font-black uppercase tracking-tight">Reposição Crítica</span>
                          </div>
                        )}
                     </div>
                  </td>
                  <td className="px-8 py-6 font-bold text-slate-700 text-sm mono italic">R$ {item.cost.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</td>
                  <td className="px-8 py-6 text-right">
                     <div className="flex justify-end gap-2 opacity-40 group-hover:opacity-100 transition-opacity">
                        <button onClick={() => setShowQR(item)} className="p-2.5 bg-slate-100 hover:bg-[#1A3673] text-slate-500 hover:text-white rounded-xl transition-all"><QrCode size={16}/></button>
                        <button onClick={() => handleOpenEdit(item)} className="p-2.5 bg-slate-100 hover:bg-[#1A3673] text-slate-500 hover:text-white rounded-xl transition-all"><Edit3 size={16}/></button>
                        <button onClick={() => handleDelete(item.id)} className="p-2.5 bg-slate-100 hover:bg-red-500 text-slate-500 hover:text-white rounded-xl transition-all"><Trash2 size={16}/></button>
                     </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {showQR && (
        <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-md z-[100] flex items-center justify-center p-6 animate-in fade-in duration-300">
           <div className="bg-white max-w-sm w-full p-8 rounded-[2.5rem] shadow-2xl animate-in zoom-in-95 flex flex-col items-center text-center relative">
               <button onClick={() => setShowQR(null)} className="absolute top-6 right-6 p-2 text-slate-300 hover:text-red-500 transition-colors"><X size={24}/></button>
               <h3 className="text-xl font-black text-[#1A3673] uppercase italic">Tag de Inventário</h3>
               <div className="p-6 bg-white rounded-2xl border-2 border-dashed border-slate-200 my-6">
                 <img src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=AVIAGEN-INVENTORY:${showQR.id}`} alt="QR" className="w-48 h-48" />
               </div>
               <p className="text-xs font-bold text-slate-700 uppercase mb-6">{showQR.name}</p>
               <button onClick={() => window.print()} className="w-full py-4 bg-[#1A3673] text-white rounded-xl font-black uppercase text-xs tracking-widest shadow-xl">Imprimir Etiqueta</button>
           </div>
        </div>
      )}

      {showForm && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-md z-[100] flex items-center justify-center p-6 animate-in fade-in">
           <div className="bg-white max-w-xl w-full p-12 rounded-[3.5rem] shadow-3xl animate-in zoom-in-95">
              <h2 className="text-2xl font-black text-[#1A3673] uppercase italic mb-8">{showForm === 'add' ? 'Registrar Insumo' : 'Atualizar Dados'}</h2>
              <form onSubmit={handleSubmit} className="space-y-6">
                 <div className="space-y-2">
                    <label className="industrial-label">Nome do Material</label>
                    <input 
                      type="text" required className="industrial-input uppercase"
                      value={formData.name} onChange={e => setFormData({...formData, name: e.target.value.toUpperCase()})}
                    />
                 </div>
                 <div className="grid grid-cols-2 gap-6">
                    <div className="space-y-2"><label className="industrial-label">Custo Unitário</label><input type="number" step="0.01" className="industrial-input" value={formData.cost} onChange={e => setFormData({...formData, cost: Number(e.target.value)})} /></div>
                    <div className="space-y-2">
                       <label className="industrial-label">Unidade</label>
                       <select className="industrial-input" value={formData.unit} onChange={e => setFormData({...formData, unit: e.target.value})}>
                          <option value="un">UNIDADE</option><option value="kg">QUILO</option><option value="lt">LITRO</option>
                       </select>
                    </div>
                 </div>
                 <div className="grid grid-cols-2 gap-6">
                    <div className="space-y-2"><label className="industrial-label">Estoque Atual</label><input type="number" className="industrial-input" value={formData.stock} onChange={e => setFormData({...formData, stock: Number(e.target.value)})} /></div>
                    <div className="space-y-2"><label className="industrial-label">Mínimo Crítico</label><input type="number" className="industrial-input" value={formData.minStock} onChange={e => setFormData({...formData, minStock: Number(e.target.value)})} /></div>
                 </div>
                 <button type="submit" className="w-full py-5 bg-[#1A3673] text-white rounded-2xl font-black uppercase text-xs shadow-xl">Salvar Registro Industrial</button>
              </form>
           </div>
        </div>
      )}
    </div>
  );
};

export default Inventory;
