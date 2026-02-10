
import React, { useState, useRef, useEffect, useMemo } from 'react';
import { 
  Bot, Send, Sparkles, BrainCircuit, 
  Zap, MessageSquare, GraduationCap, Camera, 
  AlertTriangle, Activity, Upload, CheckCircle2, 
  Search, X, TrendingUp, BarChart3, ChevronRight,
  RefreshCw, Hammer, Gauge, ShieldCheck,
  ZapOff, Target, Edit2, Check, Ban, Loader2, Wrench, BookOpen, AlertOctagon, Repeat, Plus
} from 'lucide-react';
import { getTechnicalAdvice, getEducationalTeaching, getPredictiveMaintenance, analyzeIssueImage, detectMaintenancePatterns } from '../services/geminiService';
import { ServiceOrder, User, UserRole, ChatMessage, PredictionRisk, RecurringTask } from '../types';
import { useApp } from '../context/AppContext';
import ReactMarkdown from 'react-markdown'; 

interface IAModuleProps {
  orders: ServiceOrder[];
  users: User[];
  role: UserRole;
  onGenerateOS?: (data: any) => void;
}

const IAModule: React.FC<IAModuleProps> = ({ orders, users, role, onGenerateOS }) => {
  const { setRecurringTasks, addNotification } = useApp();
  const [activeMode, setActiveMode] = useState<'tech' | 'mentor' | 'vision'>('mentor');
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [visionLoading, setVisionLoading] = useState(false);
  const [predictiveLoading, setPredictiveLoading] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [predictiveRisks, setPredictiveRisks] = useState<PredictionRisk[]>([]);
  const [selectedRisk, setSelectedRisk] = useState<PredictionRisk | null>(null);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [visionResult, setVisionResult] = useState<any>(null);
  
  // Estado para Padrões de Rotina
  const [detectedPatterns, setDetectedPatterns] = useState<any[]>([]);
  const [showPatterns, setShowPatterns] = useState(false);

  const [savingGoal, setSavingGoal] = useState<number>(() => {
    return Number(localStorage.getItem('aviagen_saving_goal')) || 25000;
  });
  const [tempGoal, setTempGoal] = useState<string>(savingGoal.toString());
  const [isEditingGoal, setIsEditingGoal] = useState(false);
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  const totalProjectedSaving = useMemo(() => {
    return predictiveRisks.reduce((acc, risk) => acc + (risk.estimatedSaving || 0), 0);
  }, [predictiveRisks]);

  const goalProgress = useMemo(() => {
    if (savingGoal <= 0) return 0;
    return Math.min(100, (totalProjectedSaving / savingGoal) * 100);
  }, [totalProjectedSaving, savingGoal]);

  // FIX: Adicionado timeout para garantir que o render do Markdown terminou antes de rolar
  useEffect(() => {
    if (scrollRef.current) {
        setTimeout(() => {
            if (scrollRef.current) {
                scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
            }
        }, 150);
    }
  }, [messages, loading]);

  // Carregar riscos automaticamente ao entrar no modo Tech, se vazio
  useEffect(() => {
    if (activeMode === 'tech' && predictiveRisks.length === 0) {
      handleFetchPredictive();
    }
  }, [activeMode]);

  const handleFetchPredictive = async () => {
    setPredictiveLoading(true);
    try {
      // 1. Riscos Preditivos
      const risks = await getPredictiveMaintenance(orders);
      setPredictiveRisks(risks && risks.length > 0 ? risks : []);
      if (risks && risks.length > 0) setSelectedRisk(risks[0]);

      // 2. Detectar Padrões de Rotina (Recorrência)
      const patterns = await detectMaintenancePatterns(orders);
      setDetectedPatterns(patterns || []);
      if (patterns && patterns.length > 0) setShowPatterns(true);
      
    } catch (e) {
      console.error("Erro na API Preditiva:", e);
      addNotification({ type: 'warning', title: 'Falha Preditiva', message: 'Não foi possível carregar os insights da IA no momento.' });
    } finally {
      setPredictiveLoading(false);
    }
  };

  const handleCreateRecurringFromPattern = (pattern: any) => {
    const task: RecurringTask = {
        id: `rt-ai-${Date.now()}`,
        title: pattern.title,
        description: pattern.description,
        sector: pattern.sector,
        intervalDays: pattern.intervalDays,
        nextTriggerDate: new Date().toISOString().split('T')[0], // Começa hoje
        active: true
    };
    setRecurringTasks(prev => [...prev, task]);
    addNotification({ type: 'success', title: 'Rotina Criada', message: `Automação "${pattern.title}" configurada com sucesso.` });
    setDetectedPatterns(prev => prev.filter(p => p !== pattern)); // Remove da lista de sugestões
  };

  const handleSend = async () => {
    if (!query.trim() || loading) return;
    const userMsg: ChatMessage = { role: 'user', text: query, timestamp: new Date() };
    setMessages(prev => [...prev, userMsg]);
    const currentQuery = query;
    setQuery('');
    setLoading(true);

    try {
      let responseText = "";
      const history = messages.map(m => ({ role: m.role, text: m.text }));
      
      // No modo Mentor, usamos o endpoint específico de ensino com histórico
      if (activeMode === 'mentor') {
        responseText = await getEducationalTeaching(currentQuery, history);
      } else {
        // Agora o modo técnico também usa histórico!
        responseText = await getTechnicalAdvice(currentQuery, history);
      }
      setMessages(prev => [...prev, { role: 'model', text: responseText, timestamp: new Date() }]);
    } catch (e) {
      setMessages(prev => [...prev, { role: 'model', text: "Desculpe, tive um problema ao processar sua solicitação. Tente novamente.", timestamp: new Date() }]);
    } finally {
      setLoading(false);
    }
  };

  const handleVisionScan = async () => {
    if (!selectedImage || visionLoading) return;
    setVisionLoading(true);
    try {
      const base64Data = selectedImage.split(',')[1];
      const mimeType = selectedImage.split(';')[0].split(':')[1];
      const result = await analyzeIssueImage(base64Data, mimeType);
      if (result) {
        setVisionResult(result);
      } else {
        throw new Error("Resposta inválida da IA");
      }
    } catch (e) {
      console.error(e);
      addNotification({ type: 'critical', title: 'Erro de Visão', message: 'A IA não conseguiu analisar a imagem. Tente uma foto mais clara.' });
    } finally {
      setVisionLoading(false);
    }
  };

  const handleSaveGoal = () => {
    const val = Number(tempGoal);
    if (!isNaN(val) && val >= 0) {
      setSavingGoal(val);
      localStorage.setItem('aviagen_saving_goal', val.toString());
    }
    setIsEditingGoal(false);
  };

  const getRiskColor = (level: string) => {
    const l = level.toLowerCase();
    if (l.includes('alto') || l.includes('crítico')) return 'text-rose-600 bg-rose-50 border-rose-100';
    if (l.includes('médio') || l.includes('moderado')) return 'text-amber-600 bg-amber-50 border-amber-100';
    return 'text-emerald-600 bg-emerald-50 border-emerald-100';
  };

  return (
    <div className="flex flex-col gap-6 animate-in fade-in duration-500 pb-10 lg:pb-0">
      {/* HEADER DINÂMICO */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        <div className="flex items-center gap-4">
           <div className="w-12 h-12 lg:w-16 lg:h-16 bg-[var(--aviagen-blue)] rounded-2xl flex items-center justify-center shadow-2xl">
              <BrainCircuit className="text-white" size={32} />
           </div>
           <div>
              <h2 className="text-2xl lg:text-3xl font-black text-slate-900 uppercase tracking-tighter italic leading-none">Cérebro SGI</h2>
              <p className="text-slate-400 text-[8px] lg:text-[10px] font-black uppercase tracking-[0.3em] mt-1">Aviagen Cognitive Core</p>
           </div>
        </div>

        <div className="flex bg-slate-100 p-1.5 rounded-2xl border border-slate-200 overflow-x-auto no-scrollbar">
          {['mentor', 'tech', 'vision'].map(mode => (
            <button 
              key={mode} 
              onClick={() => setActiveMode(mode as any)}
              className={`flex items-center gap-2 px-6 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all whitespace-nowrap ${
                activeMode === mode ? 'bg-[var(--aviagen-blue)] text-white shadow-xl' : 'text-slate-400 hover:text-slate-900'
              }`}
            >
              {mode === 'tech' ? <Zap size={14}/> : mode === 'mentor' ? <GraduationCap size={14}/> : <Camera size={14}/>}
              {mode === 'vision' ? 'Visão' : mode === 'tech' ? 'IA Preditiva' : 'Mentor Técnico'}
            </button>
          ))}
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-8">
        
        {/* COLUNA PRINCIPAL (DINÂMICA) */}
        <div className="flex-1 flex flex-col gap-6">
          
          {/* MODO MENTOR (CHAT) OU TECH (CHAT HÍBRIDO) */}
          {(activeMode === 'mentor' || (activeMode === 'tech' && !selectedRisk && !showPatterns && !predictiveRisks.length && !predictiveLoading)) && (
            <div className={`industrial-card p-4 lg:p-8 flex flex-col h-[600px] lg:h-[700px] border-l-4 ${activeMode === 'mentor' ? 'border-l-emerald-500' : 'border-l-blue-500'}`}>
               <div className="flex items-center gap-3 mb-6 pb-6 border-b border-slate-100">
                  <div className={`p-3 rounded-xl shadow-sm ${activeMode === 'mentor' ? 'bg-emerald-100 text-emerald-600' : 'bg-blue-100 text-blue-600'}`}>
                    {activeMode === 'mentor' ? <BookOpen size={24} /> : <Zap size={24} />}
                  </div>
                  <div>
                    <h3 className="text-lg font-black text-slate-900 uppercase italic">{activeMode === 'mentor' ? 'Mentor Industrial SGI' : 'Consultor Técnico SGI'}</h3>
                    <p className={`text-[10px] font-black uppercase tracking-widest ${activeMode === 'mentor' ? 'text-emerald-600' : 'text-blue-600'}`}>
                        {activeMode === 'mentor' ? 'Base de Conhecimento: Normas & Manutenção' : 'Resolução de Problemas & Diagnósticos'}
                    </p>
                  </div>
               </div>

               <div ref={scrollRef} className="flex-1 overflow-y-auto space-y-6 pr-2 custom-scrollbar mb-6">
                  {messages.length === 0 ? (
                    <div className="h-full flex flex-col items-center justify-center text-center space-y-6 opacity-80">
                       <div className={`w-20 h-20 rounded-full flex items-center justify-center mb-4 ${activeMode === 'mentor' ? 'bg-emerald-50' : 'bg-blue-50'}`}>
                          {activeMode === 'mentor' ? <GraduationCap size={40} className="text-emerald-500" /> : <Wrench size={40} className="text-blue-500" />}
                       </div>
                       <div className="max-w-md">
                          <h4 className="font-black uppercase text-sm tracking-widest mb-3 text-slate-800">
                              {activeMode === 'mentor' ? 'Olá, sou seu instrutor técnico.' : 'Olá, como posso ajudar no diagnóstico?'}
                          </h4>
                          <p className="text-xs text-slate-500 font-medium leading-relaxed">
                            {activeMode === 'mentor' 
                                ? 'Posso ensinar sobre procedimentos operacionais, normas de segurança (NR), funcionamento de equipamentos ou gestão de manutenção.'
                                : 'Descreva o problema que está enfrentando na linha de produção e eu ajudarei com diagnósticos e soluções técnicas.'}
                          </p>
                       </div>
                       <div className="grid grid-cols-2 gap-3 w-full max-w-lg">
                          {(activeMode === 'mentor' ? [
                            "Resumo da NR-10", 
                            "Como funciona um Soft-Starter?", 
                            "Procedimento LOTO", 
                            "O que é TPM?"
                          ] : [
                            "Motor superaquecendo",
                            "Falha de comunicação PLC",
                            "Vibração excessiva na bomba",
                            "Correia patinando"
                          ]).map(s => (
                             <button 
                                key={s} 
                                onClick={() => setQuery(s)} 
                                className={`bg-white border border-slate-200 px-4 py-3 rounded-xl text-[10px] font-bold uppercase transition-all shadow-sm text-left flex items-center justify-between group ${activeMode === 'mentor' ? 'hover:bg-emerald-50 hover:border-emerald-200 hover:text-emerald-700' : 'hover:bg-blue-50 hover:border-blue-200 hover:text-blue-700'}`}
                             >
                                {s}
                                <ChevronRight size={14} className="opacity-0 group-hover:opacity-100 transition-opacity" />
                             </button>
                          ))}
                       </div>
                    </div>
                  ) : (
                    messages.map((msg, i) => (
                      <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'} animate-in fade-in slide-in-from-bottom-2`}>
                         <div className={`max-w-[85%] p-6 rounded-2xl border shadow-sm ${
                           msg.role === 'user' 
                             ? 'bg-slate-50 border-slate-200 text-slate-800 rounded-tr-none' 
                             : activeMode === 'mentor' 
                                ? 'bg-white border-emerald-100 text-slate-700 rounded-tl-none shadow-emerald-100/50'
                                : 'bg-white border-blue-100 text-slate-700 rounded-tl-none shadow-blue-100/50'
                         }`}>
                            <div className="flex items-center gap-2 mb-3 opacity-60 pb-2 border-b border-dashed border-slate-200/50">
                               {msg.role === 'user' ? <UserRoleIcon role="Você" /> : (activeMode === 'mentor' ? <GraduationCap size={14} className="text-emerald-600" /> : <Bot size={14} className="text-blue-600" />)}
                               <span className="text-[9px] font-black uppercase tracking-widest">{msg.role === 'user' ? 'Sua Pergunta' : (activeMode === 'mentor' ? 'Explicação Didática' : 'Parecer Técnico')}</span>
                            </div>
                            <div className="prose prose-sm prose-slate max-w-none text-xs lg:text-sm font-medium leading-relaxed">
                              <ReactMarkdown>{msg.text}</ReactMarkdown>
                            </div>
                         </div>
                      </div>
                    ))
                  )}
                  {loading && (
                    <div className="flex justify-start animate-in fade-in">
                       <div className="bg-white p-4 rounded-2xl rounded-tl-none border border-slate-100 shadow-sm flex items-center gap-3">
                          <Loader2 size={16} className={`animate-spin ${activeMode === 'mentor' ? 'text-emerald-500' : 'text-blue-500'}`}/>
                          <span className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Processando resposta...</span>
                       </div>
                    </div>
                  )}
               </div>
               
               <div className="relative">
                  <input 
                    type="text" 
                    placeholder={activeMode === 'mentor' ? "Ex: Explique a norma NR-35..." : "Ex: O que pode causar ruído agudo no rolamento?"}
                    className={`w-full bg-slate-50 border-2 border-slate-100 text-slate-900 rounded-2xl pl-6 pr-16 py-5 font-bold text-sm outline-none transition-all shadow-inner ${activeMode === 'mentor' ? 'focus:border-emerald-500 focus:bg-white' : 'focus:border-blue-500 focus:bg-white'}`}
                    value={query}
                    onChange={e => setQuery(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && handleSend()}
                  />
                  <button 
                    onClick={handleSend} 
                    disabled={loading || !query.trim()} 
                    className={`absolute right-2 top-2 bottom-2 w-12 text-white rounded-xl flex items-center justify-center shadow-lg active:scale-90 transition-all disabled:opacity-50 disabled:scale-100 ${activeMode === 'mentor' ? 'bg-emerald-600 hover:bg-emerald-700' : 'bg-blue-600 hover:bg-blue-700'}`}
                  >
                    <Send size={18} />
                  </button>
               </div>
            </div>
          )}

          {/* MODO TÉCNICO / PREDITIVO - DASHBOARD (Só exibe se houver riscos carregados ou carregando) */}
          {activeMode === 'tech' && (predictiveRisks.length > 0 || predictiveLoading || selectedRisk) && (
            <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 h-[700px]">
              
              {/* LISTA DE RISCOS (LADO ESQUERDO) */}
              <div className="xl:col-span-5 flex flex-col gap-4 overflow-y-auto pr-2 custom-scrollbar">
                <div className="flex justify-between items-center mb-2">
                   <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] flex items-center gap-2">
                      <AlertOctagon size={14} /> Riscos Identificados
                   </h3>
                   <button onClick={handleFetchPredictive} disabled={predictiveLoading} className="text-[var(--aviagen-blue)] hover:bg-blue-50 p-2 rounded-lg transition-colors">
                      <RefreshCw size={14} className={predictiveLoading ? 'animate-spin' : ''} />
                   </button>
                </div>

                {/* SUGESTÃO DE PADRÕES (NOVO) */}
                {detectedPatterns.length > 0 && (
                   <div className="mb-4 space-y-3">
                      <h4 className="text-[9px] font-black text-emerald-600 uppercase tracking-widest flex items-center gap-2"><Sparkles size={10} /> Rotinas Sugeridas (IA)</h4>
                      {detectedPatterns.map((pat, idx) => (
                         <div key={`pat-${idx}`} className="bg-emerald-50 border border-emerald-100 p-4 rounded-xl relative group">
                            <h5 className="font-bold text-emerald-900 text-xs">{pat.title}</h5>
                            <p className="text-[9px] text-emerald-700 mt-1">{pat.reason}</p>
                            <div className="flex items-center gap-2 mt-2">
                               <span className="text-[9px] font-black bg-white px-2 py-0.5 rounded text-emerald-600 border border-emerald-100">{pat.intervalDays} Dias</span>
                               <span className="text-[9px] font-black bg-white px-2 py-0.5 rounded text-emerald-600 border border-emerald-100">{pat.sector}</span>
                            </div>
                            <button 
                               onClick={() => handleCreateRecurringFromPattern(pat)}
                               className="absolute top-2 right-2 p-1.5 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors shadow-sm"
                               title="Criar Automação"
                            >
                               <Plus size={14} />
                            </button>
                         </div>
                      ))}
                   </div>
                )}
                
                {predictiveLoading ? (
                  <div className="space-y-3">
                    {[1,2,3].map(i => <div key={i} className="h-24 bg-slate-100 rounded-2xl animate-pulse"></div>)}
                  </div>
                ) : (
                  predictiveRisks.map((risk, i) => {
                     const colorClass = getRiskColor(risk.riskLevel);
                     return (
                        <button 
                           key={i} 
                           onClick={() => setSelectedRisk(risk)} 
                           className={`p-5 rounded-2xl border text-left transition-all group relative overflow-hidden ${selectedRisk === risk ? 'ring-2 ring-offset-2 ring-[var(--aviagen-blue)] bg-white shadow-lg' : 'bg-white border-slate-100 hover:border-blue-200'}`}
                        >
                           <div className="flex justify-between items-start mb-3 relative z-10">
                              <span className={`text-[9px] font-black uppercase px-2.5 py-1 rounded-lg border ${colorClass}`}>
                                 Risco {risk.riskLevel}
                              </span>
                              <span className="text-[10px] font-black text-slate-400 flex items-center gap-1">
                                 <Activity size={12} /> {Math.round(risk.probability * 100)}% Prob.
                              </span>
                           </div>
                           <h4 className="text-sm font-black text-slate-900 uppercase italic truncate mb-1 relative z-10">{risk.equipment}</h4>
                           <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wide relative z-10">{risk.sector}</p>
                           
                           {selectedRisk === risk && <div className="absolute right-0 bottom-0 p-4 opacity-5 text-[var(--aviagen-blue)]"><Target size={60} /></div>}
                        </button>
                     );
                  })
                )}
              </div>

              {/* DETALHES DO RISCO (LADO DIREITO) */}
              <div className="xl:col-span-7 industrial-card p-0 overflow-hidden flex flex-col">
                {selectedRisk ? (
                  <div className="flex flex-col h-full animate-in slide-in-from-right-4 duration-500">
                    {/* Header do Card */}
                    <div className="p-8 bg-slate-50 border-b border-slate-100 flex justify-between items-start">
                       <div>
                          <div className="flex items-center gap-3 mb-2">
                             <div className="p-2 bg-[var(--aviagen-blue)] rounded-lg text-white"><Gauge size={20} /></div>
                             <p className="text-[10px] font-black text-[var(--aviagen-blue)] uppercase tracking-widest">{selectedRisk.sector}</p>
                          </div>
                          <h3 className="text-2xl font-black text-slate-900 uppercase italic tracking-tight">{selectedRisk.equipment}</h3>
                       </div>
                       <div className="text-right bg-white px-4 py-2 rounded-xl border border-slate-100 shadow-sm">
                          <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Impacto Financeiro</p>
                          <p className="text-xl font-black text-emerald-500 italic tracking-tighter">R$ {selectedRisk.estimatedSaving.toLocaleString()}</p>
                       </div>
                    </div>

                    {/* Corpo do Card */}
                    <div className="p-8 flex-1 space-y-8 overflow-y-auto">
                       {/* Medidor de Probabilidade */}
                       <div className="space-y-3">
                          <div className="flex justify-between text-[10px] font-black uppercase tracking-widest text-slate-500">
                             <span>Probabilidade de Falha</span>
                             <span>{Math.round(selectedRisk.probability * 100)}% Crítico</span>
                          </div>
                          <div className="h-4 bg-slate-100 rounded-full overflow-hidden border border-slate-200 relative">
                             <div 
                                className={`h-full transition-all duration-1000 ${selectedRisk.riskLevel.includes('Alto') ? 'bg-gradient-to-r from-rose-400 to-rose-600' : 'bg-gradient-to-r from-amber-400 to-amber-600'}`} 
                                style={{ width: `${selectedRisk.probability * 100}%` }}
                             ></div>
                             {/* Marcadores */}
                             <div className="absolute top-0 left-[25%] h-full w-px bg-white/50"></div>
                             <div className="absolute top-0 left-[50%] h-full w-px bg-white/50"></div>
                             <div className="absolute top-0 left-[75%] h-full w-px bg-white/50"></div>
                          </div>
                       </div>

                       {/* Recomendação */}
                       <div className="bg-blue-50/50 p-6 rounded-2xl border border-blue-100 space-y-3">
                          <div className="flex items-center gap-2 text-[var(--aviagen-blue)]">
                             <Sparkles size={16} />
                             <span className="text-[10px] font-black uppercase tracking-widest">Recomendação IA</span>
                          </div>
                          <p className="text-sm text-slate-700 font-medium leading-relaxed italic">
                             "{selectedRisk.recommendation}"
                          </p>
                       </div>

                       {/* Ações */}
                       <div className="grid grid-cols-2 gap-4 pt-4">
                          <div className="p-4 rounded-2xl border border-slate-100 bg-slate-50 text-center">
                             <p className="text-[9px] text-slate-400 font-black uppercase mb-1">Peças Sugeridas</p>
                             <p className="font-bold text-slate-700 text-xs">Verificar Estoque</p>
                          </div>
                          <div className="p-4 rounded-2xl border border-slate-100 bg-slate-50 text-center">
                             <p className="text-[9px] text-slate-400 font-black uppercase mb-1">Tempo Estimado</p>
                             <p className="font-bold text-slate-700 text-xs">2h 30min</p>
                          </div>
                       </div>
                    </div>

                    {/* Footer com Botão */}
                    <div className="p-6 border-t border-slate-100 bg-slate-50">
                       <button 
                          onClick={() => onGenerateOS && onGenerateOS(selectedRisk)} 
                          className="w-full py-5 bg-[var(--aviagen-blue)] hover:bg-slate-900 text-white rounded-xl font-black uppercase text-xs tracking-widest shadow-xl transition-all flex items-center justify-center gap-3 active:scale-[0.98]"
                       >
                          <Wrench size={18} /> Gerar Ordem Preventiva
                       </button>
                    </div>
                  </div>
                ) : (
                  <div className="h-full flex flex-col items-center justify-center text-center p-10 opacity-30">
                     <BrainCircuit size={80} className="text-slate-400 mb-6" />
                     <h3 className="text-xl font-black text-slate-400 uppercase tracking-widest">Aguardando Seleção</h3>
                     <p className="text-xs font-bold text-slate-300 mt-2 max-w-xs">Selecione um risco ou padrão identificado na lista lateral para ver a análise detalhada.</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* MODO VISÃO (SCANNER) */}
          {activeMode === 'vision' && (
            <div className="industrial-card p-6 lg:p-12 min-h-[600px] flex flex-col">
               {!selectedImage ? (
                  <div className="flex-1 flex flex-col items-center justify-center text-center space-y-6">
                     <div className="w-24 h-24 bg-[var(--aviagen-blue)]/10 rounded-full flex items-center justify-center border-2 border-dashed border-[var(--aviagen-blue)]/40">
                        <Upload className="text-[var(--aviagen-blue)]" size={40} />
                     </div>
                     <h3 className="text-2xl font-black text-slate-900 uppercase italic">Scanner Industrial</h3>
                     <p className="text-slate-400 text-xs font-bold uppercase tracking-widest max-w-sm">Tire uma foto de um componente para análise instantânea de falhas e cadastro automático.</p>
                     <button onClick={() => fileInputRef.current?.click()} className="bg-[var(--aviagen-blue)] text-white px-10 py-5 rounded-2xl font-black uppercase text-xs tracking-widest shadow-2xl hover:bg-slate-900 transition-all">Carregar Imagem</button>
                     <input type="file" hidden ref={fileInputRef} onChange={(e) => {
                       const file = e.target.files?.[0];
                       if (file) {
                         const reader = new FileReader();
                         reader.onloadend = () => setSelectedImage(reader.result as string);
                         reader.readAsDataURL(file);
                       }
                     }} accept="image/*" />
                  </div>
               ) : (
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
                     <div className="space-y-4">
                        <div className="relative rounded-3xl overflow-hidden border border-slate-200 bg-slate-900 shadow-xl">
                           <img src={selectedImage} alt="Preview" className="w-full h-auto max-h-[400px] object-contain" />
                           <button onClick={() => { setSelectedImage(null); setVisionResult(null); }} className="absolute top-4 right-4 p-3 bg-red-600 text-white rounded-xl shadow-xl hover:bg-red-700 transition-all"><X size={20}/></button>
                           {visionLoading && (
                             <div className="absolute inset-0 bg-black/60 flex flex-col items-center justify-center text-white font-black uppercase text-xs">
                                <Loader2 size={32} className="animate-spin mb-2"/>
                                Analisando...
                             </div>
                           )}
                        </div>
                        {!visionResult && !visionLoading && <button onClick={handleVisionScan} className="w-full py-5 bg-[var(--aviagen-blue)] text-white rounded-2xl font-black uppercase text-xs hover:bg-slate-900 transition-all">Iniciar Auditoria IA</button>}
                     </div>
                     <div className="space-y-6">
                        {visionResult ? (
                          <div className="space-y-6 animate-in fade-in">
                             <div className="flex items-center gap-3">
                                <CheckCircle2 className="text-emerald-500" size={24} />
                                <h4 className="text-xl font-black text-slate-900 uppercase">Resultado SGI</h4>
                             </div>
                             <div className="p-6 bg-slate-50 border border-slate-200 rounded-2xl space-y-4 shadow-sm">
                                <div><p className="text-[9px] font-black text-slate-400 uppercase">Equipamento</p><p className="font-black text-slate-900 uppercase">{visionResult.equipment}</p></div>
                                <div><p className="text-[9px] font-black text-slate-400 uppercase">Diagnóstico</p><p className="text-sm font-bold text-slate-700 italic">"{visionResult.diagnosis}"</p></div>
                             </div>
                             <button onClick={() => onGenerateOS && onGenerateOS(visionResult)} className="w-full py-5 bg-emerald-600 text-white rounded-2xl font-black uppercase text-xs hover:bg-emerald-700 transition-all shadow-xl shadow-emerald-100">Registrar OS Automatizada</button>
                          </div>
                        ) : (
                          <div className="h-64 border-2 border-dashed border-slate-200 rounded-3xl flex flex-col items-center justify-center opacity-40 text-slate-400">
                             <Target size={40}/>
                             <p className="text-[10px] font-black uppercase tracking-widest mt-4">Aguardando Análise</p>
                          </div>
                        )}
                     </div>
                  </div>
               )}
            </div>
          )}

        </div>

        {/* SIDEBAR DE MÉTRICAS */}
        <div className="w-full lg:w-[350px] space-y-6 shrink-0">
           <div className="industrial-card p-8 space-y-6 bg-gradient-to-br from-slate-50 to-white">
              <h3 className="text-xs font-black text-slate-900 uppercase tracking-widest flex items-center gap-2 italic">
                <Target size={16} className="text-[var(--aviagen-blue)]" /> Estratégia de Saving
              </h3>
              
              <div className="p-6 bg-white rounded-2xl border border-slate-200 shadow-sm">
                 <div className="flex justify-between items-center mb-2">
                    <span className="text-[8px] font-black text-slate-400 uppercase">Meta Mensal</span>
                    <button onClick={() => setIsEditingGoal(!isEditingGoal)} className="text-slate-400 hover:text-[var(--aviagen-blue)]"><Edit2 size={12}/></button>
                 </div>
                 {isEditingGoal ? (
                    <div className="flex gap-2">
                       <input type="number" className="w-full bg-slate-50 p-2 rounded-lg text-xs font-black text-slate-900 border border-slate-200 outline-none" value={tempGoal} onChange={e => setTempGoal(e.target.value)} />
                       <button onClick={handleSaveGoal} className="p-2 bg-emerald-600 text-white rounded-lg"><Check size={14}/></button>
                    </div>
                 ) : (
                    <p className="text-2xl font-black text-slate-900 italic tracking-tighter">R$ {savingGoal.toLocaleString()}</p>
                 )}
              </div>

              <div className="space-y-2">
                 <div className="flex justify-between text-[10px] font-black uppercase">
                    <span className="text-slate-400">Progresso</span>
                    <span className="text-slate-900">{Math.round(goalProgress)}%</span>
                 </div>
                 <div className="h-3 bg-slate-100 rounded-full overflow-hidden p-0.5 border border-slate-200">
                    <div className="h-full bg-[var(--aviagen-blue)] rounded-full transition-all duration-1000" style={{ width: `${goalProgress}%` }}></div>
                 </div>
              </div>

              <div className="pt-6 border-t border-slate-100 grid grid-cols-2 gap-4">
                 <div><p className="text-[8px] font-black text-slate-400 uppercase">Confiabilidade</p><p className="text-lg font-black text-emerald-500">92%</p></div>
                 <div><p className="text-[8px] font-black text-slate-400 uppercase">ROI IA</p><p className="text-lg font-black text-[var(--aviagen-blue)]">12.4x</p></div>
              </div>
           </div>

           <div className="industrial-card p-6">
              <h4 className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-4 flex items-center gap-2"><BarChart3 size={14}/> Últimas Análises</h4>
              <div className="space-y-4">
                 {orders.slice(0, 3).map((os, i) => (
                    <div key={i} className="flex items-center gap-3">
                       <div className="w-1.5 h-1.5 rounded-full bg-[var(--aviagen-blue)]"></div>
                       <p className="text-[10px] font-bold text-slate-600 uppercase truncate">{os.description}</p>
                    </div>
                 ))}
                 {orders.length === 0 && <p className="text-[10px] text-slate-300 italic">Sem histórico recente.</p>}
              </div>
           </div>
        </div>
      </div>
    </div>
  );
};

const UserRoleIcon = ({ role }: { role: string }) => (
  <span className="w-4 h-4 bg-slate-200 rounded flex items-center justify-center text-[8px] font-black text-slate-500 uppercase">{role.charAt(0)}</span>
);

export default IAModule;
