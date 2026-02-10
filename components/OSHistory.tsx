
import React, { useState, useEffect, useRef } from 'react';
import { 
  CheckCircle2, Clock, 
  Tag, User as UserIcon, Wrench, X, Settings2,
  Package, Plus, Trash2, ShoppingCart, Printer, Filter, FileText, ChevronRight, AlertTriangle, Edit,
  LayoutGrid, List as ListIcon, Download, ArrowRight, Eraser, PenTool, Drill, FilePlus
} from 'lucide-react';
import { ServiceOrder, OSStatus, UserRole, User, ServiceType, InventoryItem } from '../types';
import OSForm from './OSForm';
import { useApp } from '../context/AppContext';

interface OSHistoryProps {
  orders: ServiceOrder[];
  technicians: User[];
  inventory: InventoryItem[];
  onUpdate: (id: string, updates: Partial<ServiceOrder>, partsUsed?: { itemId: string, quantity: number, cost: number, name: string }[]) => void;
  onAddOS: (data: any) => void;
  role: UserRole;
  currentUser: User;
  preFilledData?: any;
  clearPreFilled?: () => void;
}

const OSHistory: React.FC<OSHistoryProps> = ({ 
  orders, technicians, inventory, onUpdate, onAddOS, 
  preFilledData, clearPreFilled, currentUser 
}) => {
  const { logAction, activeUnitId, units } = useApp();
  const [selectedOS, setSelectedOS] = useState<ServiceOrder | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [editingOS, setEditingOS] = useState<ServiceOrder | null>(null); 
  const [filter, setFilter] = useState<'ALL' | OSStatus.OPEN | OSStatus.FINISHED>('ALL');
  
  const filteredOrders = orders.filter(os => 
    os.unitId === activeUnitId && (filter === 'ALL' || os.status === filter)
  );

  const currentUnit = units.find(u => u.id === activeUnitId);

  // States para Encerramento
  const [executionTime, setExecutionTime] = useState(1);
  const [finishingTechId, setFinishingTechId] = useState('');

  useEffect(() => {
    if (preFilledData) {
      setEditingOS(null);
      setShowForm(true);
    }
  }, [preFilledData]);

  // Lógica de Impressão de OS Individual
  const handlePrintOS = (os: ServiceOrder) => {
    const techName = technicians.find(t => t.id === os.technicianId)?.name || 'N/A';
    const win = window.open('', '_blank');
    if (!win) return;
    win.document.write(`
      <html>
        <head>
          <title>OS #${os.id}</title>
          <style>
            body { font-family: 'Segoe UI', sans-serif; padding: 40px; color: #1a1a1a; line-height: 1.6; }
            .header { border-bottom: 3px solid #1A3673; padding-bottom: 20px; margin-bottom: 30px; display: flex; justify-content: space-between; align-items: center; }
            .title { font-size: 28px; font-weight: 900; color: #1A3673; text-transform: uppercase; font-style: italic; }
            .label { font-size: 10px; font-weight: 800; color: #64748b; text-transform: uppercase; margin-bottom: 4px; letter-spacing: 1px; }
            .value { font-size: 14px; font-weight: 700; margin-bottom: 25px; border-bottom: 1px solid #f1f5f9; padding-bottom: 5px; }
            .box { border: 1px solid #e2e8f0; padding: 25px; border-radius: 12px; margin-bottom: 25px; background: #f8fafc; }
            .footer { margin-top: 60px; display: grid; grid-template-columns: 1fr 1fr; gap: 40px; }
            .sig-box { border-top: 1px solid #000; text-align: center; padding-top: 10px; font-size: 10px; font-weight: 800; text-transform: uppercase; }
          </style>
        </head>
        <body>
          <div class="header">
            <div><div class="title">AVIAGEN SGI</div><div style="font-size:10px; font-weight:800; color:#64748b; letter-spacing:2px;">SISTEMA DE GESTÃO INDUSTRIAL</div></div>
            <div style="text-align:right"><div class="label">Protocolo</div><div style="font-size:16px; font-weight:900;">${os.id}</div></div>
          </div>
          <div class="box">
            <div class="label">Descrição da Ocorrência</div>
            <div class="value" style="font-size:18px;">${os.description}</div>
            <div style="display:grid; grid-template-columns: 1fr 1fr 1fr; gap: 20px;">
              <div><div class="label">Técnico</div><div class="value">${techName}</div></div>
              <div><div class="label">Setor</div><div class="value">${os.sector}</div></div>
              <div><div class="label">Unidade</div><div class="value">${currentUnit?.name}</div></div>
              <div><div class="label">Data Abertura</div><div class="value">${os.requestDate}</div></div>
              <div><div class="label">Tipo</div><div class="value">${os.type}</div></div>
              <div><div class="label">Prazo</div><div class="value">${os.deadline}</div></div>
            </div>
          </div>
          <div class="box" style="height: 150px;">
            <div class="label">Relatório de Execução / Observações de Campo</div>
          </div>
          <div class="footer">
            <div class="sig-box">Assinatura do Executor</div>
            <div class="sig-box">Assinatura da Supervisão</div>
          </div>
          <div style="text-align:center; margin-top:40px; font-size:8px; color:#94a3b8; font-weight:bold; text-transform:uppercase; letter-spacing:3px;">
            Documento Gerado Eletronicamente via Command Center Aviagen
          </div>
        </body>
      </html>
    `);
    win.document.close();
    win.print();
  };

  // Lógica de Impressão de OS em Branco (Contingência)
  const handlePrintBlankOS = () => {
    const win = window.open('', '_blank');
    if (!win) return;
    win.document.write(`
      <html>
        <head><title>Formulário de Contingência OS</title><style>
          body { font-family: sans-serif; padding: 40px; }
          .header { border-bottom: 2px solid #000; padding-bottom: 10px; margin-bottom: 30px; text-align: center; }
          .border { border: 2px solid #000; padding: 30px; margin-bottom: 20px; }
          .line { border-bottom: 1px solid #aaa; height: 40px; margin-bottom: 15px; position: relative; }
          .line span { position: absolute; bottom: 5px; left: 0; font-size: 8px; font-weight: bold; text-transform: uppercase; color: #666; }
          .title { font-size: 20px; font-weight: 900; }
        </style></head>
        <body>
          <div class="header">
            <div class="title">AVIAGEN - FORMULÁRIO DE MANUTENÇÃO (CONTINGÊNCIA)</div>
            <div style="font-size:10px; margin-top:5px;">Preenchimento manual obrigatório na falta de sistema</div>
          </div>
          <div class="border">
            <div style="display:flex; justify-content:space-between; margin-bottom:30px;">
              <div style="width:30%; border-bottom:1px solid #000; height:30px;"><span>DATA:</span></div>
              <div style="width:30%; border-bottom:1px solid #000; height:30px;"><span>UNIDADE:</span></div>
              <div style="width:30%; border-bottom:1px solid #000; height:30px;"><span>SETOR:</span></div>
            </div>
            <div class="line"><span>EQUIPAMENTO / ATIVO:</span></div>
            <div class="line"><span>DESCRIÇÃO DO PROBLEMA / SINTOMAS:</span></div>
            <div class="line"></div>
            <div class="line"></div>
            <div class="line"><span>AÇÕES EXECUTADAS:</span></div>
            <div class="line"></div>
            <div class="line"></div>
            <div class="line"><span>PEÇAS UTILIZADAS:</span></div>
            <div class="line"></div>
            <div style="display:flex; justify-content:space-between; margin-top:50px;">
              <div style="width:45%; border-top:1px solid #000; text-align:center; padding-top:5px; font-size:9px;">ASSINATURA TÉCNICO</div>
              <div style="width:45%; border-top:1px solid #000; text-align:center; padding-top:5px; font-size:9px;">ASSINATURA SUPERVISOR</div>
            </div>
          </div>
        </body>
      </html>
    `);
    win.document.close();
    win.print();
  };

  const handleFinish = (id: string) => {
    onUpdate(id, { 
      status: OSStatus.FINISHED, 
      executionDate: new Date().toISOString().split('T')[0],
      timeSpent: executionTime,
      technicianId: finishingTechId || currentUser.id, 
    }); 
    logAction("OS_FINISHED", `OS #${id} encerrada por ${currentUser.name}.`, currentUser);
    setSelectedOS(null);
  };

  const handleFormSubmit = (data: any) => {
    if (editingOS) {
      onUpdate(editingOS.id, data);
      logAction("OS_UPDATED", `Dados da OS #${editingOS.id} foram atualizados.`, currentUser);
    } else {
      onAddOS(data);
    }
    setShowForm(false);
    setEditingOS(null);
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-20">
      <header className="flex flex-col lg:flex-row lg:items-center justify-between gap-8 industrial-card p-10 bg-white">
        <div className="flex items-center gap-6">
          <div className="w-16 h-16 bg-[#1A3673] flex items-center justify-center text-white rounded-2xl shadow-lg">
            <Drill size={28} />
          </div>
          <div>
            <h2 className="text-2xl font-black text-[#1A3673] uppercase tracking-tighter italic leading-none">Command Center OS</h2>
            <p className="text-slate-400 text-[10px] font-bold uppercase tracking-[0.3em] mt-2 italic">{currentUnit?.name}</p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-4">
          <button 
            onClick={handlePrintBlankOS} 
            className="p-4 bg-slate-50 text-slate-500 rounded-xl hover:bg-slate-200 transition-all flex items-center gap-2 border border-slate-100"
            title="Gerar formulário físico para preenchimento manual"
          >
            <FilePlus size={18} />
            <span className="text-[10px] font-black uppercase tracking-widest hidden sm:inline">OS em Branco</span>
          </button>
          <div className="h-8 w-px bg-slate-200 mx-2"></div>
          <button 
            onClick={() => { setEditingOS(null); setShowForm(true); }} 
            className="bg-[#1A3673] hover:bg-slate-900 text-white px-8 py-4 rounded-xl font-bold uppercase text-[11px] tracking-widest transition-all shadow-lg flex items-center gap-3"
          >
            <Plus size={18} /> Criar OS Digital
          </button>
        </div>
      </header>

      <div className="flex bg-white w-fit p-1.5 rounded-xl border border-slate-200 shadow-sm mx-auto lg:mx-0">
        {['ALL', OSStatus.OPEN, OSStatus.FINISHED].map(f => (
          <button 
            key={f} 
            onClick={() => setFilter(f as any)} 
            className={`px-6 py-2 rounded-lg text-[10px] font-bold uppercase tracking-widest transition-all ${filter === f ? 'bg-[#1A3673] text-white shadow-md' : 'text-slate-400 hover:text-slate-600'}`}
          >
            {f === 'ALL' ? 'Geral' : f}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-4">
        {filteredOrders.length === 0 ? (
          <div className="py-20 text-center industrial-card opacity-40">
            <p className="text-xs font-black uppercase tracking-widest text-slate-400 italic">Nenhum registro encontrado nesta unidade</p>
          </div>
        ) : (
          filteredOrders.map((os) => (
            <div key={os.id} className="industrial-card p-8 flex flex-col lg:flex-row lg:items-center justify-between gap-8 group hover:border-[#1A3673] transition-all">
              <div className="flex-1 space-y-4">
                <div className="flex items-center gap-4">
                  <span className="text-[9px] font-black text-[#1A3673] bg-blue-50 px-3 py-1 rounded-lg border border-blue-100 uppercase">{os.id}</span>
                  <h3 className="text-lg font-black text-slate-900 uppercase italic tracking-tighter leading-none">{os.description}</h3>
                </div>
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
                   <div className="flex flex-col"><span className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-1">Executor</span><span className="text-xs font-bold text-slate-700">{technicians.find(t => t.id === os.technicianId)?.name || 'N/A'}</span></div>
                   <div className="flex flex-col"><span className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-1">Setor</span><span className="text-xs font-bold text-slate-700">{os.sector}</span></div>
                   <div className="flex flex-col"><span className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-1">Abertura</span><span className="text-xs font-bold text-slate-700">{os.requestDate}</span></div>
                   <div className="flex flex-col"><span className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-1">Status</span><span className={`text-xs font-black uppercase ${os.status === OSStatus.FINISHED ? 'text-emerald-500' : 'text-[#1A3673]'}`}>{os.status}</span></div>
                </div>
              </div>
              
              <div className="flex items-center gap-4">
                 <button 
                  onClick={() => handlePrintOS(os)} 
                  className="p-3 bg-slate-50 text-slate-400 hover:text-[#1A3673] hover:bg-blue-50 rounded-xl transition-all border border-transparent hover:border-blue-100" 
                  title="Gerar Relatório de Impressão"
                 >
                  <Printer size={18} />
                 </button>
                 
                 {os.status === OSStatus.OPEN && (
                   <>
                     <button 
                      onClick={() => { setEditingOS(os); setShowForm(true); }} 
                      className="p-3 bg-slate-50 text-slate-400 hover:text-blue-500 hover:bg-blue-50 rounded-xl transition-all border border-transparent hover:border-blue-100" 
                      title="Editar Informações da OS"
                     >
                      <Edit size={18} />
                     </button>
                     <button 
                      onClick={() => setSelectedOS(os)} 
                      className="bg-emerald-600 hover:bg-emerald-700 text-white px-8 py-3 rounded-xl font-bold uppercase text-[10px] tracking-widest transition-all shadow-lg shadow-emerald-600/10 active:scale-95"
                     >
                      Encerrar
                     </button>
                   </>
                 )}
              </div>
            </div>
          ))
        )}
      </div>

      {showForm && (
        <div className="fixed inset-0 bg-slate-900/70 backdrop-blur-md z-[1000] flex items-center justify-center p-6 animate-in fade-in duration-300">
           <div className="bg-white max-w-4xl w-full p-10 rounded-[3rem] border border-slate-200 shadow-3xl overflow-y-auto max-h-[90vh]">
              <OSForm 
                technicians={technicians.filter(t => t.unitId === activeUnitId)} 
                onSubmit={handleFormSubmit} 
                onCancel={() => { setShowForm(false); setEditingOS(null); }}
                initialData={editingOS} 
              />
           </div>
        </div>
      )}

      {selectedOS && (
        <div className="fixed inset-0 bg-slate-900/70 backdrop-blur-md z-[1000] flex items-center justify-center p-6 animate-in fade-in duration-300">
           <div className="bg-white max-w-lg w-full p-10 rounded-[3rem] shadow-3xl border border-slate-100">
              <div className="flex items-center gap-4 mb-8">
                <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl"><CheckCircle2 size={24}/></div>
                <div>
                   <h3 className="text-xl font-black text-slate-900 uppercase italic tracking-tighter">Baixa no Sistema</h3>
                   <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Protocolo: {selectedOS.id}</p>
                </div>
              </div>
              
              <div className="space-y-6">
                <div className="space-y-2">
                  <label className="industrial-label">Tempo Gasto Efetivo (Horas)</label>
                  <input type="number" min="0.1" step="0.1" className="industrial-input" value={executionTime} onChange={e => setExecutionTime(Number(e.target.value))} />
                </div>
                <div className="space-y-2">
                  <label className="industrial-label">Técnico Executor Final</label>
                  <select className="industrial-input" value={finishingTechId || currentUser.id} onChange={e => setFinishingTechId(e.target.value)}>
                    {technicians.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
                  </select>
                </div>
                <div className="flex gap-4 pt-4">
                   <button onClick={() => setSelectedOS(null)} className="flex-1 py-4 bg-slate-100 text-slate-500 rounded-2xl font-black uppercase text-[10px] tracking-widest hover:bg-slate-200 transition-all">Voltar</button>
                   <button onClick={() => handleFinish(selectedOS.id)} className="flex-[2] py-4 bg-emerald-600 text-white rounded-2xl font-black uppercase text-[10px] tracking-widest shadow-xl shadow-emerald-600/20 hover:bg-emerald-700 transition-all active:scale-95">Confirmar Encerramento</button>
                </div>
              </div>
           </div>
        </div>
      )}
    </div>
  );
};
export default OSHistory;
