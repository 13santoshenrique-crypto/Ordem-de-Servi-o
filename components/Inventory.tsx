
import React, { useState } from 'react';
import { InventoryItem } from '../types';
import { 
  Package, Plus, AlertCircle, Search, 
  Edit3, Trash2, X, Save
} from 'lucide-react';

interface InventoryProps {
  inventory: InventoryItem[];
  setInventory: React.Dispatch<React.SetStateAction<InventoryItem[]>>;
}

const Inventory: React.FC<InventoryProps> = ({ inventory, setInventory }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [showForm, setShowForm] = useState<'add' | 'edit' | null>(null);
  const [activeItem, setActiveItem] = useState<InventoryItem | null>(null);
  
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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (showForm === 'add') {
      setInventory(prev => [...prev, { ...formData, id: `P-${Date.now()}`, unitId: 'u1' }]);
    } else if (showForm === 'edit' && activeItem) {
      setInventory(prev => prev.map(item => 
        item.id === activeItem.id ? { ...item, ...formData } : item
      ));
    }
    setShowForm(null);
    setActiveItem(null);
  };

  const handleDelete = (id: string) => {
    if (confirm('Deseja realmente excluir este item do inventário industrial?')) {
      setInventory(prev => prev.filter(i => i.id !== id));
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex items-center gap-5">
           <div className="w-14 h-14 bg-[#0047ba] rounded-2xl flex items-center justify-center text-white shadow-xl">
              <Package size={28} />
           </div>
           <div>
              <h1 className="text-2xl font-black text-theme-main uppercase tracking-tighter">Almoxarifado</h1>
              <p className="text-theme-muted text-[10px] font-black uppercase tracking-widest">Gestão de Insumos Aviagen</p>
           </div>
        </div>

        <div className="flex items-center gap-4">
           <div className="glass rounded-xl px-5 py-3 flex items-center gap-3 w-72">
              <Search size={18} className="text-theme-muted" />
              <input 
                type="text" 
                placeholder="BUSCAR ITEM..." 
                className="bg-transparent border-none text-[10px] text-theme-main focus:outline-none w-full font-black uppercase"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
           </div>
           <button 
             onClick={handleOpenAdd}
             className="bg-[#0047ba] hover:bg-[#e31b23] text-white px-8 py-4 rounded-xl font-black text-[10px] uppercase tracking-widest transition-all flex items-center gap-3 shadow-lg"
           >
              <Plus size={16} /> Novo Cadastro
           </button>
        </div>
      </header>

      <div className="industrial-card rounded-[2.5rem] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-[#0047ba]/5 border-b border-theme">
                <th className="px-8 py-6 text-[10px] font-black text-theme-muted uppercase tracking-widest">Descrição Técnica</th>
                <th className="px-8 py-6 text-[10px] font-black text-theme-muted uppercase tracking-widest">Estoque Atual</th>
                <th className="px-8 py-6 text-[10px] font-black text-theme-muted uppercase tracking-widest">Custo Unit.</th>
                <th className="px-8 py-6 text-[10px] font-black text-theme-muted uppercase tracking-widest text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-theme">
              {filtered.map(item => (
                <tr key={item.id} className="hover:bg-[#0047ba]/2 transition-colors group">
                  <td className="px-8 py-6">
                    <div className="flex flex-col">
                      <span className="font-bold text-theme-main text-sm uppercase">{item.name}</span>
                      <span className="text-[9px] text-theme-muted font-black mono">{item.id}</span>
                    </div>
                  </td>
                  <td className="px-8 py-6">
                     <div className="flex items-center gap-3">
                        <span className={`px-4 py-1.5 rounded-lg font-black text-[10px] min-w-[80px] text-center ${item.stock <= item.minStock ? 'bg-red-500 text-white shadow-lg shadow-red-500/20' : 'bg-[#0047ba]/10 text-[#0047ba]'}`}>
                          {item.stock} {item.unit}
                        </span>
                        {item.stock <= item.minStock && (
                          <div className="flex items-center gap-1.5 text-red-500 animate-pulse">
                            <AlertCircle size={14} />
                            <span className="text-[8px] font-black uppercase">Crítico</span>
                          </div>
                        )}
                     </div>
                  </td>
                  <td className="px-8 py-6 font-bold text-theme-main text-sm mono">R$ {item.cost.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</td>
                  <td className="px-8 py-6 text-right">
                     <div className="flex justify-end gap-2 opacity-40 group-hover:opacity-100 transition-opacity">
                        <button 
                          onClick={() => handleOpenEdit(item)}
                          className="p-2.5 bg-theme-main/5 hover:bg-[#0047ba] text-theme-muted hover:text-white rounded-xl transition-all"
                          title="Editar Item"
                        >
                          <Edit3 size={16}/>
                        </button>
                        <button 
                          onClick={() => handleDelete(item.id)}
                          className="p-2.5 bg-theme-main/5 hover:bg-red-500 text-theme-muted hover:text-white rounded-xl transition-all"
                          title="Excluir Item"
                        >
                          <Trash2 size={16}/>
                        </button>
                     </div>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={4} className="px-8 py-20 text-center text-theme-muted font-black text-[10px] uppercase tracking-[0.2em]">Nenhum item encontrado no almoxarifado</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {showForm && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-md z-[100] flex items-center justify-center p-6 animate-in fade-in duration-300">
           <div className="bg-theme-card max-w-xl w-full p-12 rounded-[3.5rem] border border-theme shadow-3xl animate-in zoom-in-95 duration-300">
              <div className="flex justify-between items-center mb-10">
                 <div className="flex items-center gap-4">
                    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-white ${showForm === 'add' ? 'bg-[#0047ba]' : 'bg-emerald-500'}`}>
                       {showForm === 'add' ? <Plus size={24} /> : <Edit3 size={24} />}
                    </div>
                    <div>
                       <h2 className="text-2xl font-black text-theme-main uppercase italic tracking-tighter">
                          {showForm === 'add' ? 'Novo Registro SGI' : 'Ajuste de Inventário'}
                       </h2>
                       <p className="text-[10px] font-black text-theme-muted uppercase tracking-widest">Módulo de Almoxarifado Industrial</p>
                    </div>
                 </div>
                 <button onClick={() => setShowForm(null)} className="p-2 text-theme-muted hover:text-[#e31b23] transition-colors"><X size={24}/></button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-8">
                 <div className="space-y-2">
                    <label className="text-[9px] font-black text-theme-muted uppercase tracking-widest ml-2">Descrição Completa do Insumo</label>
                    <input 
                      type="text" required placeholder="EX: CABO FLEXÍVEL 2.5MM PRETO"
                      className="w-full rounded-2xl py-5 px-6 text-sm font-bold uppercase outline-none focus:ring-2 focus:ring-[#0047ba]/20"
                      value={formData.name} onChange={e => setFormData({...formData, name: e.target.value.toUpperCase()})}
                    />
                 </div>

                 <div className="grid grid-cols-2 gap-6">
                    <div className="space-y-2">
                       <label className="text-[9px] font-black text-theme-muted uppercase tracking-widest ml-2">Custo Unitário (R$)</label>
                       <input 
                         type="number" required step="0.01"
                         className="w-full rounded-2xl py-5 px-6 text-sm font-bold outline-none"
                         value={formData.cost} onChange={e => setFormData({...formData, cost: Number(e.target.value)})}
                       />
                    </div>
                    <div className="space-y-2">
                       <label className="text-[9px] font-black text-theme-muted uppercase tracking-widest ml-2">Unidade de Medida</label>
                       <select 
                         className="w-full rounded-2xl py-5 px-6 text-sm font-bold outline-none uppercase cursor-pointer"
                         value={formData.unit} onChange={e => setFormData({...formData, unit: e.target.value})}
                       >
                          <option value="un">UNIDADE (UN)</option>
                          <option value="mt">METRO (MT)</option>
                          <option value="kg">QUILO (KG)</option>
                          <option value="lt">LITRO (LT)</option>
                       </select>
                    </div>
                 </div>

                 <div className="grid grid-cols-2 gap-6">
                    <div className="space-y-2">
                       <label className="text-[9px] font-black text-theme-muted uppercase tracking-widest ml-2">Saldo em Estoque</label>
                       <input 
                         type="number" required
                         className="w-full rounded-2xl py-5 px-6 text-sm font-bold outline-none"
                         value={formData.stock} onChange={e => setFormData({...formData, stock: Number(e.target.value)})}
                       />
                    </div>
                    <div className="space-y-2">
                       <label className="text-[9px] font-black text-theme-muted uppercase tracking-widest ml-2">Estoque de Segurança</label>
                       <input 
                         type="number" required
                         className="w-full rounded-2xl py-5 px-6 text-sm font-bold outline-none"
                         value={formData.minStock} onChange={e => setFormData({...formData, minStock: Number(e.target.value)})}
                       />
                    </div>
                 </div>

                 <div className="flex gap-4 pt-4">
                    <button 
                      type="button" 
                      onClick={() => setShowForm(null)}
                      className="flex-1 py-5 bg-theme-main/5 text-theme-muted font-black uppercase text-[10px] tracking-widest rounded-2xl border border-theme hover:bg-theme-main/10 transition-all"
                    >
                      Cancelar
                    </button>
                    <button 
                      type="submit" 
                      className={`flex-[2] py-5 text-white font-black uppercase text-[10px] tracking-widest rounded-2xl shadow-xl transition-all active:scale-95 flex items-center justify-center gap-3 ${showForm === 'add' ? 'bg-[#0047ba] shadow-[#0047ba]/20' : 'bg-emerald-600 shadow-emerald-500/20'}`}
                    >
                       {showForm === 'add' ? <Plus size={16} /> : <Save size={16} />}
                       {showForm === 'add' ? 'Confirmar Cadastro' : 'Salvar Alterações'}
                    </button>
                 </div>
              </form>
           </div>
        </div>
      )}
    </div>
  );
};

export default Inventory;
