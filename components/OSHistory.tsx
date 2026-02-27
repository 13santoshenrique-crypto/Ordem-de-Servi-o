
import React, { useState, useEffect, useMemo, useRef } from 'react';
import { 
  CheckCircle2, Clock, 
  Tag, User as UserIcon, Wrench, X, Settings2,
  Package, Plus, Trash2, ShoppingCart, Printer, Filter, FileText, ChevronRight, AlertTriangle, Edit,
  LayoutGrid, List as ListIcon, Download, ArrowRight, Eraser, PenTool, Drill, FilePlus, ChevronLeft, Camera, Image as ImageIcon, MapPin, MousePointer2
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

const ITEMS_PER_PAGE = 10;

const OSHistory: React.FC<OSHistoryProps> = ({ 
  orders, technicians, inventory, onUpdate, onAddOS, 
  preFilledData, clearPreFilled, currentUser 
}) => {
  const { logAction, activeUnitId, units, addNotification } = useApp();
  const [selectedOS, setSelectedOS] = useState<ServiceOrder | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [editingOS, setEditingOS] = useState<ServiceOrder | null>(null); 
  const [filter, setFilter] = useState<'ALL' | OSStatus.OPEN | OSStatus.FINISHED>('ALL');
  const [sectorFilter, setSectorFilter] = useState<string>('ALL');
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  
  // Encerramento
  const [executionTime, setExecutionTime] = useState(1);
  const [evidencePhoto, setEvidencePhoto] = useState<string | null>(null);
  const [signature, setSignature] = useState<string | null>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);

  useEffect(() => { setCurrentPage(1); }, [filter, searchTerm, sectorFilter]);

  const allFilteredOrders = useMemo(() => {
    return orders
      .filter(os => os.unitId === activeUnitId && (filter === 'ALL' || os.status === filter))
      .filter(os => sectorFilter === 'ALL' || os.sector === sectorFilter)
      .filter(os => os.description.toLowerCase().includes(searchTerm.toLowerCase()) || os.id.toLowerCase().includes(searchTerm.toLowerCase()))
      .sort((a, b) => new Date(b.requestDate).getTime() - new Date(a.requestDate).getTime());
  }, [orders, activeUnitId, filter, searchTerm, sectorFilter]);

  const totalPages = Math.ceil(allFilteredOrders.length / ITEMS_PER_PAGE);
  const paginatedOrders = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    return allFilteredOrders.slice(start, start + ITEMS_PER_PAGE);
  }, [allFilteredOrders, currentPage]);

  const currentUnit = units.find(u => u.id === activeUnitId);

  // --- Funções de Assinatura ---
  const startDrawing = (e: React.MouseEvent | React.TouchEvent) => {
    setIsDrawing(true);
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const rect = canvas.getBoundingClientRect();
    const x = ('touches' in e) ? e.touches[0].clientX - rect.left : (e as React.MouseEvent).clientX - rect.left;
    const y = ('touches' in e) ? e.touches[0].clientY - rect.top : (e as React.MouseEvent).clientY - rect.top;
    ctx.beginPath();
    ctx.moveTo(x, y);
  };

  const draw = (e: React.MouseEvent | React.TouchEvent) => {
    if (!isDrawing) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const rect = canvas.getBoundingClientRect();
    const x = ('touches' in e) ? e.touches[0].clientX - rect.left : (e as React.MouseEvent).clientX - rect.left;
    const y = ('touches' in e) ? e.touches[0].clientY - rect.top : (e as React.MouseEvent).clientY - rect.top;
    ctx.lineTo(x, y);
    ctx.stroke();
    ctx.lineWidth = 2;
    ctx.lineCap = 'round';
    ctx.strokeStyle = '#1A3673';
  };

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    ctx?.clearRect(0, 0, canvas.width, canvas.height);
    setSignature(null);
  };

  const saveSignature = () => {
    const canvas = canvasRef.current;
    if (canvas) setSignature(canvas.toDataURL());
  };

  const handleFinish = (id: string) => {
    if (!signature) return alert("Assinatura obrigatória para conformidade técnica.");
    onUpdate(id, { 
      status: OSStatus.FINISHED, 
      executionDate: new Date().toISOString().split('T')[0],
      timeSpent: executionTime,
      signature: signature,
      evidencePhoto: evidencePhoto || undefined
    }); 
    logAction("OS_FINISHED", `OS #${id} encerrada com assinatura e evidência por ${currentUser.name}.`, currentUser);
    setSelectedOS(null);
    setEvidencePhoto(null);
    setSignature(null);
  };

  const handlePrintOS = (os: ServiceOrder) => {
    const techName = technicians.find(t => t.id === os.technicianId)?.name || 'N/A';
    const win = window.open('', '_blank');
    if (!win) return;
    win.document.write(`
      <html>
        <head>
          <title>Protocolo Digital Aviagen - #${os.id}</title>
          <style>
            @page { size: A4; margin: 0; }
            body { font-family: 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; padding: 40px; color: #1a1a1a; line-height: 1.5; background: #fff; }
            .container { max-width: 800px; margin: 0 auto; border: 1px solid #eee; padding: 40px; border-radius: 8px; }
            .header { border-bottom: 5px solid #1A3673; padding-bottom: 20px; margin-bottom: 30px; display: flex; justify-content: space-between; align-items: center; }
            .logo-area h1 { color: #1A3673; margin: 0; font-size: 28px; font-weight: 900; font-style: italic; letter-spacing: -1px; }
            .logo-area p { margin: 0; font-size: 10px; font-weight: 800; color: #64748b; letter-spacing: 3px; text-transform: uppercase; }
            .badge { background: #1A3673; color: white; padding: 6px 12px; border-radius: 4px; font-size: 10px; font-weight: 900; text-transform: uppercase; letter-spacing: 1px; }
            .os-number { font-size: 24px; font-weight: 900; color: #1e293b; margin-top: 8px; }
            
            .section-title { font-size: 11px; font-weight: 900; color: #1A3673; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 15px; border-left: 4px solid #1A3673; padding-left: 10px; background: #f8fafc; padding-top: 5px; padding-bottom: 5px; }
            .grid { display: grid; grid-template-columns: 1fr 1fr; gap: 30px; margin-bottom: 30px; }
            .field { margin-bottom: 15px; }
            .label { font-size: 9px; color: #94a3b8; font-weight: 800; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 4px; }
            .value { font-size: 14px; font-weight: 700; color: #1e293b; }
            
            .description-box { background: #f8fafc; border: 1px solid #e2e8f0; padding: 20px; border-radius: 8px; margin-bottom: 30px; }
            .description-text { font-size: 15px; font-weight: 600; color: #1e293b; }
            
            .photo-container { margin-top: 30px; page-break-inside: avoid; }
            .photo-box { width: 100%; max-height: 400px; border: 2px solid #f1f5f9; border-radius: 12px; object-fit: contain; background: #fafafa; }
            
            .footer-sig { margin-top: 60px; display: grid; grid-template-columns: 1fr 1fr; gap: 50px; page-break-inside: avoid; }
            .sig-item { text-align: center; }
            .sig-line { border-top: 2px solid #1e293b; padding-top: 10px; margin-top: 10px; }
            .sig-label { font-size: 10px; font-weight: 900; text-transform: uppercase; color: #1e293b; }
            .sig-img { height: 70px; margin-bottom: -10px; }
            
            @media print {
              body { padding: 0; }
              .container { border: none; width: 100%; max-width: 100%; }
            }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <div class="logo-area">
                <h1>AVIAGEN SGI</h1>
                <p>Inteligência Industrial & Manutenção</p>
              </div>
              <div style="text-align:right">
                <div class="badge">Ordem de Serviço</div>
                <div class="os-number">#${os.id}</div>
              </div>
            </div>

            <div class="section-title">Informações Gerais</div>
            <div class="description-box">
              <div class="label">Descrição da Ocorrência</div>
              <div class="description-text">${os.description}</div>
            </div>

            <div class="grid">
              <div class="field"><div class="label">Setor / Localização</div><div class="value">${os.sector}</div></div>
              <div class="field"><div class="label">Tipo de Manutenção</div><div class="value">${os.type}</div></div>
              <div class="field"><div class="label">Responsável Técnico</div><div class="value">${techName}</div></div>
              <div class="field"><div class="label">Status Atual</div><div class="value">${os.status}</div></div>
              <div class="field"><div class="label">Data de Abertura</div><div class="value">${new Date(os.requestDate).toLocaleString()}</div></div>
              <div class="field"><div class="label">Data de Conclusão</div><div class="value">${os.executionDate ? new Date(os.executionDate).toLocaleDateString() : 'Pendente'}</div></div>
              <div class="field"><div class="label">Tempo de Execução</div><div class="value">${os.timeSpent} Horas</div></div>
              <div class="field"><div class="label">Unidade</div><div class="value">${currentUnit?.name || 'Aviagen'}</div></div>
            </div>

            ${os.evidencePhoto ? `
            <div class="photo-container">
              <div class="section-title">Evidência Fotográfica</div>
              <img src="${os.evidencePhoto}" class="photo-box" />
            </div>` : ''}

            <div class="footer-sig">
              <div class="sig-item">
                ${os.signature ? `<img src="${os.signature}" class="sig-img" />` : '<div style="height:70px"></div>'}
                <div class="sig-line"></div>
                <div class="sig-label">Assinatura do Executor</div>
                <div style="font-size:8px; color:#64748b; margin-top:4px;">${techName}</div>
              </div>
              <div class="sig-item">
                <div style="height:70px"></div>
                <div class="sig-line"></div>
                <div class="sig-label">Assinatura da Supervisão</div>
                <div style="font-size:8px; color:#64748b; margin-top:4px;">Emerson Henrique - Admin</div>
              </div>
            </div>

            <div style="margin-top:40px; text-align:center; font-size:8px; color:#cbd5e1; text-transform:uppercase; letter-spacing:2px;">
              Documento gerado eletronicamente pelo Sistema SGI Aviagen - ${new Date().toLocaleString()}
            </div>
          </div>
        </body>
      </html>
    `);
    win.document.close();
    win.print();
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-20">
      <header className="flex flex-col lg:flex-row lg:items-center justify-between gap-8 industrial-card p-10 bg-white">
        <div className="flex items-center gap-6">
          <div className="w-16 h-16 bg-[#1A3673] flex items-center justify-center text-white rounded-2xl shadow-lg">
            <Drill size={28} />
          </div>
          <div>
            <h2 className="text-2xl font-black text-[#1A3673] uppercase tracking-tighter italic leading-none">Protocolos Digitais</h2>
            <p className="text-slate-400 text-[10px] font-bold uppercase tracking-[0.3em] mt-2 italic">{currentUnit?.name} • {allFilteredOrders.length} Registros</p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-4">
          <div className="bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 flex items-center gap-3 w-64 focus-within:border-[#1A3673] transition-all">
             <Filter size={16} className="text-slate-400" />
             <input type="text" placeholder="BUSCAR OS..." className="bg-transparent border-none text-[10px] font-black uppercase outline-none w-full" value={searchTerm} onChange={e => setSearchTerm(e.target.value)} />
          </div>
          <button 
            onClick={() => { setEditingOS(null); setShowForm(true); }} 
            className="bg-[#1A3673] hover:bg-slate-900 text-white px-8 py-4 rounded-xl font-bold uppercase text-[11px] tracking-widest transition-all shadow-lg flex items-center gap-3"
          >
            <Plus size={18} /> Nova OS
          </button>
        </div>
      </header>

      <div className="flex justify-between items-center">
         <div className="flex items-center gap-3">
            <div className="flex bg-white p-1.5 rounded-xl border border-slate-200 shadow-sm">
                {['ALL', OSStatus.OPEN, OSStatus.FINISHED].map(f => (
                  <button 
                      key={f} 
                      onClick={() => setFilter(f as any)} 
                      className={`px-6 py-2 rounded-lg text-[10px] font-bold uppercase tracking-widest transition-all ${filter === f ? 'bg-[#1A3673] text-white shadow-md' : 'text-slate-400 hover:text-slate-600'}`}
                  >
                      {f === 'ALL' ? 'Todos' : f}
                  </button>
                ))}
            </div>

            <div className="flex items-center gap-2 bg-white p-1.5 rounded-xl border border-slate-200 shadow-sm">
                <Filter size={14} className="text-slate-400 ml-2" />
                <select 
                  className="bg-transparent border-none text-[10px] font-black uppercase outline-none text-slate-600 pr-4"
                  value={sectorFilter}
                  onChange={e => setSectorFilter(e.target.value)}
                >
                  <option value="ALL">Todos Setores</option>
                  <option value="SALA DE MÁQUINAS">Sala de Máquinas</option>
                  <option value="EXPEDIÇÃO">Expedição</option>
                  <option value="INCUBAÇÃO">Incubação</option>
                  <option value="NASCEDOUROS">Nascedouros</option>
                  <option value="VACINAÇÃO">Vacinação</option>
                  <option value="ADMINISTRATIVO">Administrativo</option>
                  <option value="EXTERNO">Externo</option>
                </select>
            </div>
         </div>

         {totalPages > 1 && (
            <div className="flex items-center gap-4 bg-white px-4 py-2 rounded-xl border border-slate-200 shadow-sm">
               <button disabled={currentPage === 1} onClick={() => setCurrentPage(p => Math.max(1, p - 1))} className="p-1.5 hover:bg-slate-50 disabled:opacity-30 rounded-lg text-[#1A3673]"><ChevronLeft size={20} /></button>
               <span className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Página {currentPage} / {totalPages}</span>
               <button disabled={currentPage === totalPages} onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} className="p-1.5 hover:bg-slate-50 disabled:opacity-30 rounded-lg text-[#1A3673]"><ChevronRight size={20} /></button>
            </div>
         )}
      </div>

      <div className="grid grid-cols-1 gap-4">
        {paginatedOrders.length === 0 ? (
          <div className="py-20 text-center industrial-card opacity-40">
            <p className="text-xs font-black uppercase tracking-widest text-slate-400 italic">Nenhum protocolo encontrado</p>
          </div>
        ) : (
          paginatedOrders.map((os) => (
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
                   <div className="flex items-center gap-2">
                      <div className={`w-2 h-2 rounded-full ${os.status === OSStatus.FINISHED ? 'bg-emerald-500' : 'bg-[#1A3673] animate-pulse'}`}></div>
                      <span className={`text-xs font-black uppercase ${os.status === OSStatus.FINISHED ? 'text-emerald-500' : 'text-[#1A3673]'}`}>{os.status}</span>
                   </div>
                </div>
              </div>
              
              <div className="flex items-center gap-4">
                 <button onClick={() => handlePrintOS(os)} className="p-3 bg-slate-50 text-slate-400 hover:text-[#1A3673] rounded-xl transition-all" title="Gerar PDF de Auditoria"><Printer size={18} /></button>
                 {os.status === OSStatus.OPEN && (
                   <>
                     <button onClick={() => { setEditingOS(os); setShowForm(true); }} className="p-3 bg-slate-50 text-slate-400 hover:text-blue-500 rounded-xl transition-all"><Edit size={18} /></button>
                     <button onClick={() => setSelectedOS(os)} className="bg-emerald-600 hover:bg-emerald-700 text-white px-8 py-3 rounded-xl font-bold uppercase text-[10px] tracking-widest shadow-lg">Finalizar Entrega</button>
                   </>
                 )}
              </div>
            </div>
          ))
        )}
      </div>

      {/* FORMULÁRIO DE OS */}
      {showForm && (
        <div className="fixed inset-0 bg-slate-900/70 backdrop-blur-md z-[1000] flex items-center justify-center p-6 animate-in fade-in duration-300">
           <div className="bg-white max-w-4xl w-full p-10 rounded-[3rem] border border-slate-200 shadow-3xl overflow-y-auto max-h-[90vh]">
              <OSForm 
                technicians={technicians.filter(t => t.unitId === activeUnitId)} 
                onSubmit={(data) => {
                    // Simular captura de GPS ao abrir OS
                    if (navigator.geolocation) {
                        navigator.geolocation.getCurrentPosition((pos) => {
                            onAddOS({ ...data, location: { lat: pos.coords.latitude, lng: pos.coords.longitude } });
                        }, () => onAddOS(data));
                    } else onAddOS(data);
                    setShowForm(false);
                }} 
                onCancel={() => { setShowForm(false); setEditingOS(null); }}
                initialData={editingOS} 
              />
           </div>
        </div>
      )}

      {/* MODAL DE ENCERRAMENTO COM ASSINATURA E FOTO */}
      {selectedOS && (
        <div className="fixed inset-0 bg-slate-900/90 backdrop-blur-xl z-[2000] flex items-center justify-center p-4 lg:p-10 animate-in fade-in duration-300">
           <div className="bg-white max-w-3xl w-full p-8 lg:p-12 rounded-[4rem] shadow-3xl flex flex-col max-h-full overflow-y-auto custom-scrollbar">
              <div className="flex justify-between items-start mb-8">
                 <div>
                    <div className="flex items-center gap-2 text-emerald-600 mb-1">
                       <CheckCircle2 size={20} />
                       <span className="text-[10px] font-black uppercase tracking-widest">Protocolo de Conformidade</span>
                    </div>
                    <h3 className="text-2xl font-black text-slate-900 uppercase italic tracking-tighter">Encerrar Ordem #{selectedOS.id?.split('-')?.[2] || selectedOS.id}</h3>
                 </div>
                 <button onClick={() => setSelectedOS(null)} className="p-2 text-slate-300 hover:text-red-500"><X size={28}/></button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                 {/* Coluna Dados e Foto */}
                 <div className="space-y-6">
                    <div className="space-y-2">
                       <label className="industrial-label">Horas Técnicas Aplicadas</label>
                       <input type="number" step="0.1" className="industrial-input" value={executionTime} onChange={e => setExecutionTime(Number(e.target.value))} />
                    </div>

                    <div className="space-y-2">
                        <label className="industrial-label">Evidência do Serviço (Foto)</label>
                        <div 
                           onClick={() => fileInputRef.current?.click()}
                           className={`h-48 border-2 border-dashed rounded-3xl flex flex-col items-center justify-center cursor-pointer transition-all overflow-hidden ${evidencePhoto ? 'border-emerald-200' : 'border-slate-200 hover:border-[#1A3673] bg-slate-50'}`}
                        >
                           {evidencePhoto ? (
                              <img src={evidencePhoto} className="w-full h-full object-cover" />
                           ) : (
                              <>
                                 <Camera size={32} className="text-slate-300 mb-2" />
                                 <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Tirar ou Carregar Foto</p>
                              </>
                           )}
                        </div>
                        <input type="file" hidden ref={fileInputRef} accept="image/*" onChange={(e) => {
                           const file = e.target.files?.[0];
                           if (file) {
                              const reader = new FileReader();
                              reader.onloadend = () => setEvidencePhoto(reader.result as string);
                              reader.readAsDataURL(file);
                           }
                        }} />
                    </div>
                 </div>

                 {/* Coluna Assinatura */}
                 <div className="space-y-2">
                    <label className="industrial-label">Assinatura Digital do Executor</label>
                    <div className="border-2 border-slate-100 rounded-3xl bg-slate-50 p-2 relative">
                        <canvas 
                           ref={canvasRef}
                           width={400}
                           height={200}
                           className="w-full h-48 cursor-crosshair touch-none"
                           onMouseDown={startDrawing}
                           onMouseMove={draw}
                           onMouseUp={() => { setIsDrawing(false); saveSignature(); }}
                           onMouseLeave={() => setIsDrawing(false)}
                           onTouchStart={startDrawing}
                           onTouchMove={draw}
                           onTouchEnd={() => { setIsDrawing(false); saveSignature(); }}
                        />
                        <button 
                           onClick={clearCanvas}
                           className="absolute bottom-4 right-4 p-3 bg-white text-slate-400 hover:text-red-500 rounded-xl shadow-sm border border-slate-100 transition-all"
                           title="Limpar Assinatura"
                        >
                           <Eraser size={16} />
                        </button>
                        {!signature && (
                           <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-20">
                              <MousePointer2 size={40} className="text-slate-400" />
                           </div>
                        )}
                    </div>
                    <p className="text-[8px] font-bold text-slate-400 uppercase tracking-widest mt-2">Validação biométrica por toque em tela ou mouse</p>
                 </div>
              </div>

              <div className="flex gap-4 mt-12">
                 <button onClick={() => setSelectedOS(null)} className="flex-1 py-5 bg-slate-100 text-slate-500 rounded-2xl font-black uppercase text-[10px]">Voltar</button>
                 <button 
                    onClick={() => handleFinish(selectedOS.id)} 
                    disabled={!signature}
                    className="flex-[2] py-5 bg-emerald-600 text-white rounded-2xl font-black uppercase text-[10px] shadow-xl disabled:opacity-50 disabled:grayscale transition-all flex items-center justify-center gap-3"
                 >
                    <CheckCircle2 size={18} /> Confirmar Baixa no Sistema
                 </button>
              </div>
           </div>
        </div>
      )}
    </div>
  );
};
export default OSHistory;
