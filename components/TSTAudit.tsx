
import React, { useState, useMemo, useEffect, useRef } from 'react';
import { 
  ShieldCheck, Plus, Search, Calendar, 
  AlertTriangle, CheckCircle2, X, Trash2, 
  Edit3, Clock, Info, FileText, ClipboardCheck, 
  BarChart3, ArrowRight, Save, HelpCircle, Hammer, 
  Upload, FileSpreadsheet, Loader2, Play, TrendingUp, Printer, Share2, Smartphone
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { TSTAuditItem, AuditSimulation, AuditQuestion, AuditTemplate, ServiceType, OSStatus } from '../types';
import { SECTORS } from '../constants';
import * as XLSX from 'xlsx';
import { convertExcelToAuditTemplate } from '../services/geminiService';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const TSTAudit: React.FC = () => {
  const { tstAudit, setTstAudit, currentUser, logAction, addNotification, setOrders, activeUnitId } = useApp();
  const [activeView, setActiveView] = useState<'docs' | 'simulations' | 'templates'>('docs');
  
  // Documentos
  const [searchTerm, setSearchTerm] = useState('');
  const [showDocForm, setShowDocForm] = useState(false);
  const [editingDoc, setEditingDoc] = useState<TSTAuditItem | null>(null);
  const [docFormData, setDocFormData] = useState<Partial<TSTAuditItem>>({
    name: '', category: 'Licenças', expirationDate: '', inspectionDate: new Date().toISOString().split('T')[0]
  });

  // Auditoria e Templates
  const [templates, setTemplates] = useState<AuditTemplate[]>([]);
  const [isImporting, setIsImporting] = useState(false);
  const [showAuditForm, setShowAuditForm] = useState(false);
  const [simulations, setSimulations] = useState<AuditSimulation[]>([]);
  const [currentAudit, setCurrentAudit] = useState<Partial<AuditSimulation> | null>(null);
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Filtra documentos pela unidade ativa
  const filteredDocs = useMemo(() => {
    return tstAudit.filter(item => 
      item.unitId === activeUnitId && (
        item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.category.toLowerCase().includes(searchTerm.toLowerCase())
      )
    );
  }, [tstAudit, searchTerm, activeUnitId]);

  // Persistência Local
  useEffect(() => {
    const savedSims = localStorage.getItem('aviagen_audit_simulations');
    const savedTemps = localStorage.getItem('aviagen_audit_templates');
    if (savedSims) setSimulations(JSON.parse(savedSims));
    if (savedTemps) setTemplates(JSON.parse(savedTemps));
  }, []);

  useEffect(() => {
    localStorage.setItem('aviagen_audit_simulations', JSON.stringify(simulations));
    localStorage.setItem('aviagen_audit_templates', JSON.stringify(templates));
  }, [simulations, templates]);

  // --- GESTÃO DE DOCUMENTOS ---
  const handleOpenDocForm = (doc?: TSTAuditItem) => {
    if (doc) {
      setEditingDoc(doc);
      setDocFormData(doc);
    } else {
      setEditingDoc(null);
      setDocFormData({ name: '', category: 'Licenças', expirationDate: '', inspectionDate: new Date().toISOString().split('T')[0] });
    }
    setShowDocForm(true);
  };

  const handleSaveDoc = (e: React.FormEvent) => {
    e.preventDefault();
    if (!docFormData.name || !docFormData.expirationDate) return;

    if (editingDoc) {
      setTstAudit(prev => prev.map(d => d.id === editingDoc.id ? { ...d, ...docFormData } as TSTAuditItem : d));
      addNotification({ type: 'success', title: 'Atualizado', message: 'Documento atualizado com sucesso.' });
    } else {
      const newDoc: TSTAuditItem = {
        ...(docFormData as TSTAuditItem),
        id: `doc-${Date.now()}`,
        unitId: activeUnitId // CORREÇÃO: Usa a unidade ativa do contexto
      };
      setTstAudit(prev => [newDoc, ...prev]);
      addNotification({ type: 'success', title: 'Registrado', message: 'Novo documento de controle adicionado.' });
    }
    setShowDocForm(false);
  };

  const handleDeleteDoc = (id: string) => {
    if (confirm("Deseja remover este registro de validade?")) {
      setTstAudit(prev => prev.filter(d => d.id !== id));
    }
  };

  // --- IMPORTAÇÃO EXCEL VIA IA ---
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsImporting(true);
    addNotification({ type: 'info', title: 'Lendo Planilha', message: 'A IA está analisando a estrutura do seu arquivo...' });

    try {
      const reader = new FileReader();
      reader.onload = async (evt) => {
        try {
          const bstr = evt.target?.result;
          const wb = XLSX.read(bstr, { type: 'binary' });
          const wsname = wb.SheetNames[0];
          const ws = wb.Sheets[wsname];
          const data = XLSX.utils.sheet_to_json(ws);

          if (data.length === 0) throw new Error("Arquivo vazio");

          const templateData = await convertExcelToAuditTemplate(file.name, data);
          
          if (!templateData || !templateData.questions || templateData.questions.length === 0) {
             throw new Error("Não foi possível identificar questões na planilha.");
          }

          const newTemplate: AuditTemplate = {
            ...templateData,
            id: `tpl-${Date.now()}`,
            importDate: new Date().toISOString()
          };

          setTemplates(prev => [newTemplate, ...prev]);
          addNotification({ 
            type: 'success', 
            title: 'Mapeamento Concluído', 
            message: `${newTemplate.questions.length} itens importados do arquivo "${newTemplate.name}".` 
          });
          logAction("AUDIT_TEMPLATE_IMPORTED", `Nova planilha "${newTemplate.name}" importada e convertida em template digital.`, currentUser!);
          setActiveView('templates');
        
        } catch (innerError: any) {
          addNotification({ 
            type: 'critical', 
            title: 'Erro no Processamento', 
            message: innerError.message || 'Falha ao interpretar a estrutura da planilha.' 
          });
        } finally {
          setIsImporting(false);
          if (fileInputRef.current) fileInputRef.current.value = '';
        }
      };
      reader.readAsBinaryString(file);
    } catch (err) {
      setIsImporting(false);
    }
  };

  // --- MOTOR DE AUDITORIA DINÂMICA ---
  const startAuditFromTemplate = (template: AuditTemplate) => {
    const newAudit: AuditSimulation = {
      id: `audit-${Date.now()}`,
      title: `Simulação: ${template.name}`,
      date: new Date().toISOString(),
      auditorId: currentUser?.id || 'admin',
      unitId: activeUnitId, // CORREÇÃO: Usa a unidade ativa
      templateId: template.id,
      questions: template.questions.map(q => ({ 
        ...q, 
        weight: Number(q.weight),
        score: Math.max(...q.options.map(o => o.value)), 
        na: false 
      })),
      finalScore: 100,
      status: 'DRAFT'
    };
    
    newAudit.finalScore = calculateDynamicScore(newAudit.questions, template.id);
    setCurrentAudit(newAudit);
    setShowAuditForm(true);
  };

  const calculateDynamicScore = (questions: AuditQuestion[], templateId: string) => {
    const template = templates.find(t => t.id === templateId);
    if (!template) return 0;

    let totalMaxPoints = 0;
    let totalEarnedPoints = 0;

    questions.forEach(q => {
      if (q.na) return; 
      const templateQuestion = template.questions.find(tq => tq.id === q.id);
      const maxPossibleOptionValue = templateQuestion 
          ? Math.max(...templateQuestion.options.map(o => o.value)) 
          : 10;
      const weight = Number(q.weight) || 1;
      
      totalMaxPoints += (weight * maxPossibleOptionValue);
      totalEarnedPoints += (weight * q.score);
    });

    if (totalMaxPoints === 0) return 0;
    return Math.round((totalEarnedPoints / totalMaxPoints) * 100);
  };

  const updateQuestion = (qId: string, updates: Partial<AuditQuestion>) => {
    if (!currentAudit) return;
    
    const newQuestions = currentAudit.questions!.map(q => 
      q.id === qId ? { ...q, ...updates } : q
    );

    const newScore = calculateDynamicScore(newQuestions, currentAudit.templateId!);

    setCurrentAudit({
      ...currentAudit,
      questions: newQuestions,
      finalScore: newScore
    });
  };

  const saveAudit = () => {
    if (!currentAudit) return;
    
    const criticalFailures = currentAudit.questions?.filter(q => 
      !q.na && q.score === 0 && q.weight >= 4
    ) || [];

    if (criticalFailures.length > 0) {
      const newOrders = criticalFailures.map(q => ({
        id: `OS-AUDIT-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
        technicianId: currentUser?.id || 'admin',
        requestDate: new Date().toISOString().split('T')[0],
        deadline: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        type: ServiceType.CORRECTIVE,
        status: OSStatus.OPEN,
        description: `[AUDITORIA AUTOMÁTICA] Item Crítico Reprovado: ${q.text} (Categoria: ${q.category})`,
        sector: SECTORS[0],
        unitId: activeUnitId, // CORREÇÃO: Vincula à unidade ativa
        timeSpent: 0
      }));

      setOrders(prev => [...newOrders, ...prev]);
      
      addNotification({ 
        type: 'critical', 
        title: 'Ação Corretiva Automática', 
        message: `${newOrders.length} Ordens de Serviço foram abertas para itens críticos não conformes.` 
      });
    }

    const completed = { ...currentAudit, status: 'COMPLETED' } as AuditSimulation;
    setSimulations(prev => [completed, ...prev]);
    setShowAuditForm(false);
    setCurrentAudit(null);
    addNotification({ type: 'success', title: 'Auditoria Finalizada', message: `Score Oficial: ${completed.finalScore}%` });
  };

  const handlePrintReport = (sim: AuditSimulation) => {
    const template = templates.find(t => t.id === sim.templateId);
    if (!template) return;

    const win = window.open('', '', 'width=900,height=1200');
    if (!win) return;

    const printStyles = `
      @page { size: A4; margin: 15mm; }
      body { font-family: 'Helvetica', 'Arial', sans-serif; color: #1e293b; -webkit-print-color-adjust: exact; }
      .header { border-bottom: 2px solid #1A3673; padding-bottom: 20px; margin-bottom: 30px; display: flex; justify-content: space-between; align-items: center; }
      .logo { font-size: 24px; font-weight: 900; color: #1A3673; text-transform: uppercase; font-style: italic; }
      .meta { text-align: right; font-size: 10px; color: #64748b; font-weight: bold; text-transform: uppercase; }
      .score-box { background: #f8fafc; border: 1px solid #e2e8f0; padding: 20px; border-radius: 12px; margin-bottom: 30px; text-align: center; }
      .score-val { font-size: 48px; font-weight: 900; color: #1A3673; }
      .cat-title { font-size: 14px; font-weight: 900; color: #1A3673; text-transform: uppercase; margin-top: 30px; margin-bottom: 10px; border-left: 4px solid #1A3673; padding-left: 10px; }
      .item { display: flex; justify-content: space-between; align-items: center; padding: 8px 0; border-bottom: 1px solid #f1f5f9; font-size: 11px; }
    `;

    const content = `
      <html>
        <head><title>Relatório - ${sim.title}</title><style>${printStyles}</style></head>
        <body>
          <div class="header">
            <div class="logo">Aviagen Industrial<br/><span style="font-size:12px;color:#ef4444">Compliance Report</span></div>
            <div class="meta">Protocolo: ${sim.id}<br/>Data: ${new Date(sim.date).toLocaleDateString()}<br/>Unidade: ${activeUnitId}</div>
          </div>
          <div class="score-box"><div class="score-val">${sim.finalScore}%</div></div>
          ${Array.from(new Set(sim.questions.map(q => q.category))).map(cat => `
            <div class="cat-title">${cat}</div>
            ${sim.questions.filter(q => q.category === cat).map(q => `<div class="item"><div>${q.text}</div><div>${q.score} pts</div></div>`).join('')}
          `).join('')}
        </body>
      </html>
    `;
    win.document.write(content);
    win.document.close();
    setTimeout(() => win.print(), 500);
  };

  const getCategoryScore = (category: string) => {
     if (!currentAudit || !currentAudit.questions) return { current: 0, max: 0 };
     const catQuestions = currentAudit.questions.filter(q => q.category === category && !q.na);
     const template = templates.find(t => t.id === currentAudit.templateId);
     let current = 0; let max = 0;
     catQuestions.forEach(q => {
        const tq = template?.questions.find(x => x.id === q.id);
        const maxVal = tq ? Math.max(...tq.options.map(o => o.value)) : 10;
        current += (q.weight * q.score);
        max += (q.weight * maxVal);
     });
     return { current, max };
  };

  const evolutionData = useMemo(() => {
    const sorted = [...simulations].filter(s => s.unitId === activeUnitId).sort((a,b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    return sorted.map(sim => ({
       date: new Date(sim.date).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' }),
       score: sim.finalScore,
       name: sim.title
    }));
  }, [simulations, activeUnitId]);

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-20">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-6 bg-white p-8 rounded-[2rem] border border-slate-200 shadow-sm">
        <div className="flex items-center gap-5">
          <div className="w-16 h-16 bg-[#1A3673] rounded-2xl flex items-center justify-center text-white shadow-xl">
            <ShieldCheck size={32} />
          </div>
          <div>
            <h1 className="text-2xl font-black text-[#1A3673] uppercase tracking-tighter italic">Compliance Command</h1>
            <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest">Unidade Visualizada: {activeUnitId}</p>
          </div>
        </div>
        <div className="flex items-center gap-3 bg-slate-100 p-1.5 rounded-xl border border-slate-200 overflow-x-auto">
           {['docs', 'templates', 'simulations'].map(v => (
             <button key={v} onClick={() => setActiveView(v as any)} className={`px-6 py-2.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${activeView === v ? 'bg-white text-[#1A3673] shadow-sm' : 'text-slate-400'}`}>
               {v === 'docs' ? 'Validades' : v === 'templates' ? 'Templates' : 'Evolução'}
             </button>
           ))}
        </div>
      </header>

      {activeView === 'templates' && (
        <div className="space-y-8">
           <div className="flex justify-between items-center">
              <h3 className="text-sm font-black text-slate-400 uppercase tracking-widest">Templates Digitais</h3>
              <input type="file" ref={fileInputRef} hidden accept=".xlsx, .csv" onChange={handleFileUpload} />
              <button onClick={() => fileInputRef.current?.click()} disabled={isImporting} className="bg-[#1A3673] text-white px-8 py-4 rounded-xl font-black text-[10px] uppercase transition-all flex items-center gap-3 shadow-lg hover:bg-slate-900">
                {isImporting ? <Loader2 size={16} className="animate-spin" /> : <Upload size={16} />} Importar Planilha
              </button>
           </div>
           <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {templates.map(tpl => (
                <div key={tpl.id} className="industrial-card p-10 group transition-all hover:border-[#1A3673]">
                   <FileSpreadsheet size={24} className="mb-6 text-[#1A3673]" />
                   <h4 className="text-xl font-black text-slate-900 uppercase italic mb-2">{tpl.name}</h4>
                   <div className="flex gap-4 mt-8">
                      <button onClick={() => startAuditFromTemplate(tpl)} className="flex-1 bg-slate-900 text-white py-4 rounded-xl font-black text-[9px] uppercase tracking-widest">Iniciar</button>
                      <button onClick={() => setTemplates(prev => prev.filter(t => t.id !== tpl.id))} className="p-4 bg-red-50 text-red-400 rounded-xl"><Trash2 size={16} /></button>
                   </div>
                </div>
              ))}
           </div>
        </div>
      )}

      {activeView === 'simulations' && (
        <div className="space-y-8">
          <div className="industrial-card p-8 bg-white border-slate-200 h-[300px]">
             {evolutionData.length > 1 ? (
                <ResponsiveContainer width="100%" height="100%">
                   <LineChart data={evolutionData}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                      <XAxis dataKey="date" stroke="#94a3b8" fontSize={10} axisLine={false} />
                      <YAxis stroke="#94a3b8" fontSize={10} axisLine={false} domain={[0, 100]} />
                      <Tooltip />
                      <Line type="monotone" dataKey="score" stroke="#1A3673" strokeWidth={3} />
                   </LineChart>
                </ResponsiveContainer>
             ) : (
                <div className="h-full flex items-center justify-center text-slate-300 italic">Mínimo de 2 simulações para exibir evolução.</div>
             )}
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
             {simulations.filter(s => s.unitId === activeUnitId).map(sim => (
                <div key={sim.id} className="industrial-card p-8 flex flex-col justify-between">
                   <div>
                      <h4 className="font-black text-slate-900 uppercase italic">{sim.title}</h4>
                      <p className="text-[9px] font-bold text-slate-400 mt-2 uppercase">{new Date(sim.date).toLocaleDateString()}</p>
                   </div>
                   <div className="flex items-end justify-between mt-8">
                      <div className="text-3xl font-black italic text-[#1A3673]">{sim.finalScore}%</div>
                      <button onClick={() => handlePrintReport(sim)} className="p-3 bg-slate-50 text-slate-600 rounded-xl hover:bg-[#1A3673] hover:text-white transition-all"><Printer size={16} /></button>
                   </div>
                </div>
             ))}
          </div>
        </div>
      )}

      {activeView === 'docs' && (
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <div className="bg-white border border-slate-200 rounded-xl px-5 py-3 flex items-center gap-3 w-72 shadow-sm">
              <Search size={18} className="text-slate-400" />
              <input type="text" placeholder="BUSCAR..." className="bg-transparent border-none text-[10px] w-full font-black uppercase" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
            </div>
            <button onClick={() => handleOpenDocForm()} className="bg-[#1A3673] text-white px-8 py-4 rounded-xl font-black text-[10px] uppercase shadow-lg"><Plus size={16} /> Novo Documento</button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredDocs.map(item => {
              const isExpired = new Date(item.expirationDate) < new Date();
              return (
                <div key={item.id} className={`industrial-card p-8 group ${isExpired ? 'border-red-200 bg-red-50/20' : ''}`}>
                  <div className="flex justify-between items-start mb-4">
                     <h4 className="text-lg font-black text-slate-900 uppercase italic leading-tight">{item.name}</h4>
                     <button onClick={() => handleOpenDocForm(item)} className="text-slate-300 hover:text-[#1A3673]"><Edit3 size={16}/></button>
                  </div>
                  <p className="text-[10px] font-black text-[#1A3673] uppercase mb-4">{item.category}</p>
                  <div className="flex items-center justify-between">
                     <p className={`font-bold text-xs flex items-center gap-2 ${isExpired ? 'text-red-600' : 'text-slate-700'}`}>
                        <Calendar size={14}/> {new Date(item.expirationDate).toLocaleDateString()}
                     </p>
                     <button onClick={() => handleDeleteDoc(item.id)} className="opacity-0 group-hover:opacity-100 text-slate-300 hover:text-red-500 transition-all"><Trash2 size={16}/></button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {showDocForm && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[2000] flex items-center justify-center p-6 animate-in fade-in">
           <div className="bg-white max-w-lg w-full p-10 rounded-[2.5rem] shadow-2xl">
              <h3 className="text-2xl font-black text-[#1A3673] uppercase mb-8 italic">{editingDoc ? 'Editar' : 'Novo Registro'}</h3>
              <form onSubmit={handleSaveDoc} className="space-y-6">
                 <div className="space-y-2">
                    <label className="industrial-label">Nome do Documento</label>
                    <input type="text" required className="industrial-input uppercase" value={docFormData.name} onChange={e => setDocFormData({...docFormData, name: e.target.value})} />
                 </div>
                 <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2"><label className="industrial-label">Data Emissão</label><input type="date" required className="industrial-input" value={docFormData.inspectionDate} onChange={e => setDocFormData({...docFormData, inspectionDate: e.target.value})} /></div>
                    <div className="space-y-2"><label className="industrial-label">Data Validade</label><input type="date" required className="industrial-input" value={docFormData.expirationDate} onChange={e => setDocFormData({...docFormData, expirationDate: e.target.value})} /></div>
                 </div>
                 <button type="submit" className="w-full btn-primary !py-4 flex items-center justify-center gap-2"><Save size={18} /> Salvar em {activeUnitId}</button>
              </form>
           </div>
        </div>
      )}

      {showAuditForm && currentAudit && (
        <div className="fixed inset-0 bg-slate-900/95 backdrop-blur-2xl z-[2000] flex items-center justify-center lg:p-6 animate-in fade-in">
           <div className="bg-white w-full h-full lg:max-w-6xl lg:h-[95vh] lg:rounded-[4rem] flex flex-col overflow-hidden">
              <div className="bg-[#1A3673] p-8 text-white flex justify-between items-center">
                 <h2 className="text-2xl lg:text-4xl font-black uppercase italic">{currentAudit.title}</h2>
                 <div className="text-right">
                    <p className="text-[10px] font-black uppercase opacity-60">Score Atual</p>
                    <p className="text-5xl font-black italic">{currentAudit.finalScore}%</p>
                 </div>
              </div>
              <div className="flex-1 overflow-y-auto p-12 bg-slate-50 space-y-12">
                {Array.from(new Set(currentAudit.questions?.map(q => q.category))).map(category => (
                    <div key={category} className="space-y-4">
                       <h3 className="text-sm font-black text-slate-400 uppercase tracking-widest border-b border-slate-200 pb-2">{category}</h3>
                       <div className="space-y-3">
                          {currentAudit.questions?.filter(q => q.category === category).map(q => (
                            <div key={q.id} className="bg-white border border-slate-200 rounded-[2rem] p-8 flex flex-col lg:flex-row lg:items-center justify-between gap-6 hover:shadow-xl transition-all">
                               <div className="flex-1">
                                  <p className="text-lg font-black text-slate-800 italic uppercase">{q.text}</p>
                               </div>
                               <div className="flex items-center gap-3 bg-slate-50 p-2 rounded-2xl">
                                  {templates.find(t => t.id === String(currentAudit.templateId))?.questions.find(tq => tq.id === q.id)?.options.map(opt => (
                                      <button key={opt.label} onClick={() => updateQuestion(q.id, { score: opt.value, na: false })} className={`px-6 py-4 rounded-xl text-[10px] font-black uppercase transition-all ${q.score === opt.value && !q.na ? 'bg-[#1A3673] text-white' : 'bg-white text-slate-400 border border-slate-200'}`}>
                                        {opt.label}
                                      </button>
                                  ))}
                                  <button onClick={() => updateQuestion(q.id, { na: !q.na })} className={`px-6 py-4 rounded-xl text-[10px] font-black uppercase ${q.na ? 'bg-slate-800 text-white' : 'bg-white text-slate-300'}`}>N/A</button>
                               </div>
                            </div>
                          ))}
                       </div>
                    </div>
                ))}
              </div>
              <div className="p-12 bg-white border-t border-slate-100 flex justify-end gap-4">
                <button onClick={() => setShowAuditForm(false)} className="px-12 py-6 bg-slate-100 text-slate-400 rounded-2xl font-black uppercase text-xs">Cancelar</button>
                <button onClick={saveAudit} className="px-16 py-6 bg-[#1A3673] text-white rounded-2xl font-black uppercase text-xs shadow-2xl flex items-center gap-3"><Save size={18} /> Finalizar Auditoria</button>
              </div>
           </div>
        </div>
      )}
    </div>
  );
};

export default TSTAudit;
