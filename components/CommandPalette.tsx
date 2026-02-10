
import React, { useState, useEffect, useRef } from 'react';
import { Search, Drill, Server, Package, User, ArrowRight, X, Command } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { ServiceOrder, Asset, InventoryItem } from '../types';

interface CommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigate: (tab: string, data?: any) => void;
}

const CommandPalette: React.FC<CommandPaletteProps> = ({ isOpen, onClose, onNavigate }) => {
  const { orders, assets, inventory } = useApp();
  const [query, setQuery] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 100);
      setQuery('');
    }
  }, [isOpen]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  if (!isOpen) return null;

  const filteredOrders = orders.filter(o => o.description.toLowerCase().includes(query.toLowerCase()) || o.id.toLowerCase().includes(query.toLowerCase())).slice(0, 3);
  const filteredAssets = assets.filter(a => a.name.toLowerCase().includes(query.toLowerCase()) || a.serialNumber.toLowerCase().includes(query.toLowerCase())).slice(0, 3);
  const filteredParts = inventory.filter(i => i.name.toLowerCase().includes(query.toLowerCase())).slice(0, 3);

  return (
    <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-md z-[2000] flex items-start justify-center pt-[15vh] px-4 animate-in fade-in duration-200">
      <div className="bg-white w-full max-w-2xl rounded-[2rem] shadow-3xl border border-slate-200 overflow-hidden animate-in zoom-in-95 duration-200">
        
        {/* Input Area */}
        <div className="p-6 border-b border-slate-100 flex items-center gap-4 bg-slate-50/50">
          <Search className="text-[#1A3673]" size={24} />
          <input 
            ref={inputRef}
            type="text" 
            placeholder="O que você deseja localizar? (OS, Máquina, Peça...)"
            className="flex-1 bg-transparent border-none outline-none text-lg font-bold text-slate-800 placeholder:text-slate-400"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
          <div className="flex items-center gap-2">
            <span className="px-2 py-1 bg-white border border-slate-200 rounded text-[10px] font-black text-slate-400 shadow-sm">ESC</span>
            <button onClick={onClose} className="text-slate-300 hover:text-red-500 transition-colors"><X size={20}/></button>
          </div>
        </div>

        {/* Results Area */}
        <div className="max-h-[60vh] overflow-y-auto custom-scrollbar p-4 space-y-6">
          {query.length > 0 ? (
            <>
              {/* ORDENS DE SERVIÇO */}
              {filteredOrders.length > 0 && (
                <section>
                  <h3 className="px-4 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-3">Ordens de Serviço</h3>
                  <div className="space-y-1">
                    {filteredOrders.map(o => (
                      <button key={o.id} onClick={() => { onNavigate('history'); onClose(); }} className="w-full flex items-center justify-between p-4 hover:bg-blue-50 rounded-2xl transition-all group">
                        <div className="flex items-center gap-4">
                          <div className="p-2 bg-blue-100 text-blue-600 rounded-lg group-hover:bg-blue-600 group-hover:text-white transition-colors"><Drill size={18}/></div>
                          <div className="text-left">
                            <p className="text-sm font-black text-slate-800 uppercase tracking-tight">{o.id}</p>
                            <p className="text-xs text-slate-400 font-medium truncate max-w-[300px]">{o.description}</p>
                          </div>
                        </div>
                        <ArrowRight size={16} className="text-slate-200 group-hover:text-blue-600 group-hover:translate-x-1 transition-all" />
                      </button>
                    ))}
                  </div>
                </section>
              )}

              {/* ATIVOS */}
              {filteredAssets.length > 0 && (
                <section>
                  <h3 className="px-4 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-3">Ativos & Máquinas</h3>
                  <div className="space-y-1">
                    {filteredAssets.map(a => (
                      <button key={a.id} onClick={() => { onNavigate('assets'); onClose(); }} className="w-full flex items-center justify-between p-4 hover:bg-emerald-50 rounded-2xl transition-all group">
                        <div className="flex items-center gap-4">
                          <div className="p-2 bg-emerald-100 text-emerald-600 rounded-lg group-hover:bg-emerald-600 group-hover:text-white transition-colors"><Server size={18}/></div>
                          <div className="text-left">
                            <p className="text-sm font-black text-slate-800 uppercase tracking-tight">{a.name}</p>
                            <p className="text-xs text-slate-400 font-medium italic">{a.serialNumber}</p>
                          </div>
                        </div>
                        <ArrowRight size={16} className="text-slate-200 group-hover:text-emerald-600 group-hover:translate-x-1 transition-all" />
                      </button>
                    ))}
                  </div>
                </section>
              )}

              {/* PEÇAS */}
              {filteredParts.length > 0 && (
                <section>
                  <h3 className="px-4 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-3">Almoxarifado</h3>
                  <div className="space-y-1">
                    {filteredParts.map(p => (
                      <button key={p.id} onClick={() => { onNavigate('inventory'); onClose(); }} className="w-full flex items-center justify-between p-4 hover:bg-amber-50 rounded-2xl transition-all group">
                        <div className="flex items-center gap-4">
                          <div className="p-2 bg-amber-100 text-amber-600 rounded-lg group-hover:bg-amber-600 group-hover:text-white transition-colors"><Package size={18}/></div>
                          <div className="text-left">
                            <p className="text-sm font-black text-slate-800 uppercase tracking-tight">{p.name}</p>
                            <p className="text-xs text-slate-400 font-bold uppercase">Estoque: {p.stock} {p.unit}</p>
                          </div>
                        </div>
                        <ArrowRight size={16} className="text-slate-200 group-hover:text-amber-600 group-hover:translate-x-1 transition-all" />
                      </button>
                    ))}
                  </div>
                </section>
              )}
            </>
          ) : (
            <div className="py-20 text-center space-y-4 opacity-30">
              <Command size={48} className="mx-auto text-slate-400" />
              <p className="text-xs font-black uppercase tracking-[0.3em] text-slate-500">Digite para buscar globalmente</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CommandPalette;
