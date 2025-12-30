
import React, { useState, useRef, useEffect, useMemo } from 'react';
import { 
  Bot, Send, Sparkles, BrainCircuit, 
  Zap, MessageSquare, GraduationCap, Camera, 
  AlertTriangle, ArrowRight, Activity, Layers, 
  Upload, CheckCircle2, Search, X, TrendingUp,
  ShieldAlert, Clock, BarChart3, ChevronRight,
  RefreshCw, Info, Hammer, Gauge, ShieldCheck,
  ZapOff, Target, Edit2, Check, Ban, Loader2, Wrench
} from 'lucide-react';
import { getTechnicalAdvice, getEducationalTeaching, getPredictiveMaintenance, analyzeIssueImage } from '../services/geminiService';
import { ServiceOrder, User, UserRole, ChatMessage, PredictionRisk } from '../types';

interface IAModuleProps {
  orders: ServiceOrder[];
  users: User[];
  role: UserRole;
  onGenerateOS?: (data: any) => void;
}

const IAModule: React.FC<IAModuleProps> = ({ orders, users, role, onGenerateOS }) => {
  const [activeMode, setActiveMode] = useState<'tech' | 'mentor' | 'vision'>('tech');
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [visionLoading, setVisionLoading] = useState(false);
  const [predictiveLoading, setPredictiveLoading] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [predictiveRisks, setPredictiveRisks] = useState<PredictionRisk[]>([]);
  const [selectedRisk, setSelectedRisk] = useState<PredictionRisk | null>(null);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [visionResult, setVisionResult] = useState<any>(null);
  
  const [savingGoal, setSavingGoal] = useState<number>(() => {
    return Number(localStorage.getItem('aviagen_saving_goal')) || 25000;
  });
  const [tempGoal, setTempGoal] = useState<string>(savingGoal.toString());
  const [isEditingGoal, setIsEditingGoal] = useState(false);
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const goalInputRef = useRef<HTMLInputElement>(null);

  const totalProjectedSaving = useMemo(() => {
    return predictiveRisks.reduce((acc, risk) => acc + (risk.estimatedSaving || 0), 0);
  }, [predictiveRisks]);

  const goalProgress = useMemo(() => {
    if (savingGoal <= 0) return 0;
    return Math.min(100, (totalProjectedSaving / savingGoal) * 100);
  }, [totalProjectedSaving, savingGoal]);

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [messages, loading]);

  useEffect(() => {
    if (activeMode === 'tech' && predictiveRisks.length === 0) {
      handleFetchPredictive();
    }
  }, [activeMode]);

  const handleFetchPredictive = async () => {
    setPredictiveLoading(true);
    try {
      const risks = await getPredictiveMaintenance(orders);
      const demoRisks: PredictionRisk[] = risks.length > 0 ? risks : [
        { sector: 'Elétrica', equipment: 'Motor Exaustor 05', riskLevel: 'Crítico', probability: 0.89, recommendation: 'Substituir contatoras da fase B e verificar aquecimento excessivo nos cabos.', estimatedSaving: 4500 },
        { sector: 'Mecânica', equipment: 'Esteira Transportadora', riskLevel: 'Médio', probability: 0.54, recommendation: 'Lubrificação preventiva dos rolamentos principais em 72h.', estimatedSaving: 1200 },
        { sector: 'TI', equipment: 'Switch Industrial Core', riskLevel: 'Baixo', probability: 0.12, recommendation: 'Verificar logs de redundância de fonte.', estimatedSaving: 800 }
      ];
      setPredictiveRisks(demoRisks.sort((a, b) => b.probability - a.probability));
      if (demoRisks.length > 0) setSelectedRisk(demoRisks[0]);
    } catch (e) {
      console.error("Erro ao carregar preditivas:", e);
    } finally {
      setPredictiveLoading(false);
    }
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
      if (activeMode === 'tech') responseText = await getTechnicalAdvice(currentQuery);
      else {
        const history = messages.map(m => ({ role: m.role, text: m.text }));
        responseText = await getEducationalTeaching(currentQuery, history);
      }
      setMessages(prev => [...prev, { role: 'model', text: responseText, timestamp: new Date() }]);
    } catch (e) {
      setMessages(prev => [...prev, { role: 'model', text: "Erro de conexão com o Cérebro SGI.", timestamp: new Date() }]);
    } finally {
      setLoading(false);
    }
  };

  const handleVisionScan = async () => {
    if (!selectedImage || visionLoading) return;
    setVisionLoading(true);
    setVisionResult(null);
    try {
      const base64Data = selectedImage.split(',')[1];
      const mimeType = selectedImage.split(';')[0].split(':')[1];
      const result = await analyzeIssueImage(base64Data, mimeType);
      setVisionResult(result);
    } catch (e) {
      console.error("Erro na análise de visão:", e);
      alert("Erro ao processar imagem. Verifique sua chave de API.");
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

  const handleCancelGoal = () => {
    setTempGoal(savingGoal.toString());
    setIsEditingGoal(false);
  };

  const getRiskColor = (level: string) => {
    const l = level.toLowerCase();
    if (l.includes('alto') || l.includes('crítico')) return '#e31b23';
    if (l.includes('médio') || l.includes('moderado')) return '#f59e0b';
    return '#10b981';
  };

  return (
    <div className="flex flex-col h-[calc(100vh-12rem)] space-y-6 animate-in fade-in duration-500">
      <header className="flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="flex items-center gap-4">
           <div className="w-14 h-14 bg-white rounded-[1.5rem] flex items-center justify-center shadow-2xl p-3">
              <div className="font-black text-[#0047ba] text-2xl italic">A</div>
           </div>
           <div>
              <h2 className="text-3xl font-black text-white flex items-center gap-3 uppercase tracking-tighter">
                Cérebro <span className="text-[#e31b23]">SGI</span>
              </h2>
              <p className="text-white/40 text-[10px] font-black uppercase tracking-[0.4em]">Predictive Intelligence Node v5.2</p>
           </div>
        </div>
        
        <div className="flex bg-white/5 rounded-3xl p-1.5 border border-white/5 shadow-2xl">
          {['tech', 'mentor', 'vision'].map((mode) => (
            <button 
              key={mode}
              onClick={() => { setActiveMode(mode as any); setVisionResult(null); }}
              className={`flex items-center gap-3 px-8 py-3 rounded-2xl text-[11px] font-black uppercase tracking-widest transition-all duration-500 ${
                activeMode === mode ? 'bg-white text-[#0047ba] shadow-2xl' : 'text-white/30 hover:text-white'
              }`}
            >
              {mode === 'mentor' && <GraduationCap size={18} />}
              {mode === 'tech' && <Zap size={18} />}
              {mode === 'vision' && <Camera size={18} />}
              {mode === 'vision' ? 'Visão' : mode === 'tech' ? 'IA Preditiva' : 'Mentor'}
            </button>
          ))}
        </div>
      </header>

      <div className="flex-1 flex flex-col lg:flex-row gap-8 overflow-hidden">
        {activeMode === 'tech' ? (
          <div className="flex-1 flex flex-col gap-6 overflow-hidden">
            <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 flex-1 overflow-hidden">
              <div className="xl:col-span-4 flex flex-col gap-4 overflow-y-auto pr-2 custom-scrollbar">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-xs font-black text-white/30 uppercase tracking-[0.3em]">Insights Preditivos</h3>
                  <button onClick={handleFetchPredictive} disabled={predictiveLoading} className="p-2 hover:bg-white/5 rounded-lg text-white/20 hover:text-white transition-all">
                    <RefreshCw size={14} className={predictiveLoading ? 'animate-spin' : ''} />
                  </button>
                </div>

                {predictiveLoading ? (
                  [1,2,3,4].map(i => <div key={i} className="h-28 glass rounded-3xl animate-pulse"></div>)
                ) : (
                  predictiveRisks.map((risk, idx) => (
                    <button key={idx} onClick={() => setSelectedRisk(risk)} className={`p-5 rounded-3xl border text-left transition-all duration-300 group ${selectedRisk === risk ? 'bg-white/10 border-white/20 shadow-2xl' : 'bg-white/2 border-white/5 hover:bg-white/5'}`}>
                      <div className="flex justify-between items-start mb-4">
                        <div className="px-2 py-0.5 rounded text-[8px] font-black uppercase tracking-widest" style={{ backgroundColor: `${getRiskColor(risk.riskLevel)}20`, color: getRiskColor(risk.riskLevel) }}>{risk.riskLevel}</div>
                        <span className="text-[10px] font-black text-white/20">{Math.round(risk.probability * 100)}%</span>
                      </div>
                      <h4 className="text-sm font-black text-white uppercase tracking-tight">{risk.equipment}</h4>
                      <p className="text-[10px] text-white/40 font-bold uppercase tracking-widest mt-1">{risk.sector}</p>
                      <div className="mt-4 h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                        <div className="h-full transition-all duration-1000" style={{ width: `${risk.probability * 100}%`, backgroundColor: getRiskColor(risk.riskLevel) }}></div>
                      </div>
                    </button>
                  ))
                )}
              </div>

              <div className="xl:col-span-8 glass rounded-[3rem] border border-white/5 p-10 flex flex-col gap-8 shadow-3xl overflow-y-auto custom-scrollbar relative">
                {selectedRisk ? (
                  <div className="space-y-10 animate-in fade-in zoom-in-95 duration-500">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                      <div className="flex items-center gap-5">
                        <div className="w-16 h-16 rounded-[1.5rem] flex items-center justify-center text-white shadow-2xl" style={{ backgroundColor: getRiskColor(selectedRisk.riskLevel), boxShadow: `0 20px 40px ${getRiskColor(selectedRisk.riskLevel)}30` }}>
                          <AlertTriangle size={32} />
                        </div>
                        <div>
                          <h3 className="text-3xl font-black text-white uppercase tracking-tighter">{selectedRisk.equipment}</h3>
                          <div className="flex items-center gap-3">
                             <span className="text-[10px] font-black text-[#0047ba] uppercase tracking-[0.4em]">{selectedRisk.sector}</span>
                             <div className="w-1 h-1 rounded-full bg-white/20"></div>
                             <span className="text-[10px] font-black text-white/40 uppercase tracking-widest">Identificado há 2h</span>
                          </div>
                        </div>
                      </div>
                      <div className="flex flex-col items-end">
                        <span className="text-[10px] font-black text-white/20 uppercase tracking-[0.3em] mb-1">Economy Prediction</span>
                        <div className="flex items-center gap-3 text-emerald-400">
                          <TrendingUp size={20} />
                          <span className="text-3xl font-black">R$ {selectedRisk.estimatedSaving.toLocaleString()}</span>
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      <div className="p-8 bg-white/5 rounded-[2rem] border border-white/5 flex flex-col items-center text-center gap-4">
                        <Gauge size={32} className="text-[#0047ba]" />
                        <div>
                           <p className="text-[9px] font-black text-white/20 uppercase tracking-[0.2em] mb-1">Probabilidade</p>
                           <p className="text-3xl font-black text-white">{Math.round(selectedRisk.probability * 100)}%</p>
                        </div>
                      </div>
                      <div className="p-8 bg-white/5 rounded-[2rem] border border-white/5 flex flex-col items-center text-center gap-4">
                        <Clock size={32} className="text-[#e31b23]" />
                        <div>
                           <p className="text-[9px] font-black text-white/20 uppercase tracking-[0.2em] mb-1">MTTF Est.</p>
                           <p className="text-3xl font-black text-white">12 Dias</p>
                        </div>
                      </div>
                      <div className="p-8 bg-white/5 rounded-[2rem] border border-white/5 flex flex-col items-center text-center gap-4">
                        <ShieldCheck size={32} className="text-emerald-400" />
                        <div>
                           <p className="text-[9px] font-black text-white/20 uppercase tracking-[0.2em] mb-1">Status Global</p>
                           <p className="text-sm font-black text-white uppercase" style={{ color: getRiskColor(selectedRisk.riskLevel) }}>{selectedRisk.riskLevel}</p>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-6">
                      <h4 className="text-[10px] font-black text-white/30 uppercase tracking-[0.5em] flex items-center gap-3">
                        <Hammer size={16} className="text-[#0047ba]" /> Recomendação da IA Técnica
                      </h4>
                      <div className="p-8 bg-[#0047ba]/5 border border-[#0047ba]/20 rounded-[2.5rem] relative overflow-hidden">
                        <div className="absolute top-0 left-0 w-1.5 h-full bg-[#0047ba]"></div>
                        <p className="text-xl font-bold text-white/90 leading-relaxed italic">"{selectedRisk.recommendation}"</p>
                      </div>
                    </div>

                    <div className="flex gap-4">
                      <button className="flex-1 py-5 bg-white/5 hover:bg-white/10 text-white rounded-2xl font-black uppercase tracking-widest text-[10px] transition-all border border-white/5">Ignorar</button>
                      <button 
                        onClick={() => onGenerateOS && onGenerateOS({ equipment: selectedRisk.equipment, diagnosis: selectedRisk.recommendation, suggestedAction: 'Preventivo', requiredParts: [] })}
                        className="flex-[2] py-5 bg-[#0047ba] hover:bg-[#e31b23] text-white rounded-2xl font-black uppercase tracking-widest text-[10px] shadow-2xl flex items-center justify-center gap-3 transition-all active:scale-95"
                      >
                        <CheckCircle2 size={18} /> Autorizar Preventiva
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="h-full flex flex-col items-center justify-center text-center space-y-8 opacity-20">
                    <ZapOff size={80} />
                    <p className="text-2xl font-black uppercase tracking-tighter">Selecione um ativo para auditoria IA</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        ) : activeMode === 'vision' ? (
          <div className="flex-1 flex flex-col glass rounded-[3rem] p-8 lg:p-12 border border-white/5 shadow-3xl overflow-hidden">
             {!selectedImage ? (
                <div className="h-full flex flex-col items-center justify-center text-center space-y-8 animate-in fade-in duration-500">
                   <div className="w-32 h-32 bg-[#0047ba]/10 rounded-full flex items-center justify-center mx-auto border-4 border-dashed border-[#0047ba]/30">
                      <Upload className="text-[#0047ba]" size={48} />
                   </div>
                   <div className="space-y-3">
                      <h3 className="text-3xl font-black text-white uppercase tracking-tighter">Diagnóstico Visual</h3>
                      <p className="text-white/40 text-[10px] font-black uppercase tracking-[0.3em]">IA Reconhecimento de Ativos e Falhas</p>
                   </div>
                   <button onClick={() => fileInputRef.current?.click()} className="bg-[#0047ba] hover:bg-[#e31b23] text-white px-12 py-6 rounded-3xl font-black uppercase tracking-widest shadow-2xl active:scale-95 transition-all">Carregar Foto do Equipamento</button>
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
                <div className="w-full h-full flex flex-col lg:flex-row gap-10 overflow-y-auto custom-scrollbar pr-2">
                   <div className="w-full lg:w-5/12 space-y-6">
                      <div className="relative rounded-[2.5rem] overflow-hidden border-4 border-white/10 shadow-3xl group">
                         <img src={selectedImage} alt="Equipamento" className="w-full h-auto object-cover max-h-[500px]" />
                         <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                         <button onClick={() => { setSelectedImage(null); setVisionResult(null); }} className="absolute top-4 right-4 p-4 bg-red-600/80 backdrop-blur-md text-white rounded-2xl shadow-xl hover:bg-red-600 transition-all"><X size={20}/></button>
                         {visionLoading && (
                            <div className="absolute inset-0 bg-[#0047ba]/40 backdrop-blur-sm flex flex-col items-center justify-center text-white space-y-4">
                               <div className="w-full h-1 bg-white/10 absolute top-0 overflow-hidden">
                                  <div className="h-full bg-white animate-scan-line"></div>
                               </div>
                               <Loader2 className="animate-spin" size={48} />
                               <p className="font-black uppercase tracking-widest text-[10px]">Analisando Geometria e Falhas...</p>
                            </div>
                         )}
                      </div>
                      {!visionResult && !visionLoading && (
                         <button onClick={handleVisionScan} className="w-full py-6 bg-[#0047ba] hover:bg-[#e31b23] text-white rounded-[2rem] font-black uppercase tracking-widest shadow-2xl flex items-center justify-center gap-4 transition-all">
                            <Search size={24} /> Iniciar Scanner Industrial
                         </button>
                      )}
                   </div>

                   <div className="flex-1 flex flex-col">
                      {visionResult ? (
                         <div className="space-y-8 animate-in slide-in-from-right-4 duration-500 pb-10">
                            <div className="flex items-center gap-5">
                               <div className="w-14 h-14 bg-emerald-500 rounded-2xl flex items-center justify-center text-white shadow-xl">
                                  <CheckCircle2 size={32} />
                               </div>
                               <div>
                                  <h4 className="text-3xl font-black text-white uppercase tracking-tighter">Diagnóstico Concluído</h4>
                                  <p className="text-emerald-400 text-[10px] font-black uppercase tracking-widest">Confiança da IA: {Math.round(visionResult.confidence * 100)}%</p>
                               </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                               <div className="p-6 bg-white/5 rounded-3xl border border-white/5 space-y-2">
                                  <p className="text-[9px] font-black text-white/20 uppercase tracking-widest">Equipamento Identificado</p>
                                  <p className="text-lg font-black text-white uppercase">{visionResult.equipment}</p>
                                </div>
                                <div className="p-6 bg-white/5 rounded-3xl border border-white/5 space-y-2">
                                  <p className="text-[9px] font-black text-white/20 uppercase tracking-widest">Ação Recomendada</p>
                                  <p className="text-lg font-black text-[#0047ba] uppercase">{visionResult.suggestedAction}</p>
                                </div>
                            </div>

                            <div className="p-8 bg-[#0047ba]/5 border border-[#0047ba]/10 rounded-[2.5rem]">
                               <h5 className="text-[10px] font-black text-white/30 uppercase tracking-[0.4em] mb-4">Relatório Detalhado</h5>
                               <p className="text-white/80 font-bold leading-relaxed">{visionResult.diagnosis}</p>
                            </div>

                            <button 
                              onClick={() => onGenerateOS && onGenerateOS(visionResult)}
                              className="w-full py-6 bg-emerald-600 hover:bg-emerald-500 text-white rounded-3xl font-black uppercase tracking-widest shadow-2xl transition-all active:scale-95 flex items-center justify-center gap-3"
                            >
                               <Wrench size={20} /> Gerar Ordem de Serviço Automática
                            </button>
                         </div>
                      ) : !visionLoading && (
                         <div className="h-full flex flex-col items-center justify-center text-center space-y-8 opacity-20 border-2 border-dashed border-white/10 rounded-[3rem]">
                            <Target size={80} />
                            <div className="space-y-2">
                               <p className="text-2xl font-black uppercase tracking-tighter">Aguardando Captura</p>
                               <p className="text-[9px] font-bold uppercase tracking-widest">Posicione a câmera frontal ao ativo para análise precisa</p>
                            </div>
                         </div>
                      )}
                      {visionLoading && (
                        <div className="h-full flex flex-col items-center justify-center text-center space-y-8 opacity-40">
                          <Activity size={80} className="animate-pulse text-[#0047ba]" />
                          <p className="text-xl font-black uppercase tracking-widest">Processando Redes Neurais...</p>
                        </div>
                      )}
                   </div>
                </div>
             )}
          </div>
        ) : (
          <div className="flex-1 flex flex-col glass rounded-[3rem] p-8 border border-white/5 shadow-3xl overflow-hidden">
             <div ref={scrollRef} className="flex-1 overflow-y-auto space-y-8 pr-4 mb-6 custom-scrollbar">
               {messages.length === 0 ? (
                 <div className="h-full flex flex-col items-center justify-center text-center space-y-8 opacity-20">
                   <BrainCircuit size={100} className="text-[#0047ba] animate-pulse" />
                   <h3 className="text-2xl font-black text-white uppercase tracking-tighter">Mentor Industrial SGI</h3>
                 </div>
               ) : (
                 messages.map((msg, i) => (
                   <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'} animate-in fade-in`}>
                     <div className={`max-w-[85%] flex gap-4 ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
                       <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 shadow-2xl ${msg.role === 'user' ? 'bg-white text-[#0047ba]' : 'bg-[#0047ba] text-white'}`}>
                         {msg.role === 'user' ? <MessageSquare size={18} /> : <Sparkles size={18} />}
                       </div>
                       <div className={`p-5 rounded-[1.8rem] text-sm font-bold border ${msg.role === 'user' ? 'bg-white/5 text-white/90 border-white/10' : 'bg-[#0047ba]/10 text-white border-[#0047ba]/20'}`}>
                         <div className="whitespace-pre-wrap">{msg.text}</div>
                       </div>
                     </div>
                   </div>
                 ))
               )}
               {loading && <div className="text-white/20 text-[10px] font-black uppercase tracking-widest animate-pulse p-4">Processando consulta...</div>}
             </div>
             <div className="relative pt-6 border-t border-white/5">
               <textarea rows={1} placeholder="Como realizar a manutenção do exaustor LHZ-400?" className="w-full bg-white/5 border border-white/10 rounded-2xl py-5 pl-8 pr-20 text-white focus:outline-none focus:ring-4 focus:ring-[#0047ba]/20 font-bold text-sm resize-none" value={query} onChange={(e) => setQuery(e.target.value)} onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(); } }} />
               <button onClick={handleSend} disabled={loading || !query.trim()} className="absolute right-3 bottom-3 w-14 h-14 bg-[#0047ba] hover:bg-[#e31b23] rounded-2xl flex items-center justify-center text-white transition-all shadow-2xl"><Send size={20} /></button>
             </div>
          </div>
        )}

        {/* SIDEBAR DE STATUS (DIREITA) */}
        <div className="w-full lg:w-[420px] flex flex-col gap-6 shrink-0 overflow-y-auto custom-scrollbar pr-1">
           {/* CARD DE META FINANCEIRA */}
           <div className="glass rounded-[2.5rem] p-8 border border-white/10 flex flex-col gap-6 shadow-3xl bg-gradient-to-br from-[#0047ba]/20 to-transparent relative overflow-visible min-h-fit">
              <h3 className="text-lg font-black flex items-center gap-3 text-white uppercase tracking-tighter">
                <Target size={22} className="text-[#0047ba]" /> Planejamento de Saving
              </h3>
              
              <div className="space-y-4">
                 <div className={`p-6 bg-white/5 rounded-3xl border transition-all duration-300 min-h-[140px] flex flex-col justify-center ${isEditingGoal ? 'border-[#0047ba] ring-4 ring-[#0047ba]/20 bg-black/40' : 'border-white/10 hover:border-[#0047ba]/30'}`}>
                    <div className="flex justify-between items-center mb-3">
                       <span className="text-[9px] font-black text-white/40 uppercase tracking-[0.2em]">Meta Mensal (R$)</span>
                       {!isEditingGoal && (
                        <button onClick={() => setIsEditingGoal(true)} className="p-2 rounded-lg text-white/20 hover:text-[#0047ba] hover:bg-[#0047ba]/10 transition-all">
                          <Edit2 size={16} />
                        </button>
                       )}
                    </div>

                    {isEditingGoal ? (
                       <div className="flex flex-col gap-4 animate-in fade-in slide-in-from-top-2">
                          <div className="flex items-center gap-3 bg-white/5 p-3 rounded-2xl border border-white/10">
                            <span className="text-xl font-black text-[#0047ba] mono">R$</span>
                            <input 
                              ref={goalInputRef}
                              type="number" 
                              className="bg-transparent border-none text-2xl font-black text-white outline-none w-full mono focus:ring-0"
                              value={tempGoal}
                              onChange={(e) => setTempGoal(e.target.value)}
                              onKeyDown={(e) => {
                                if (e.key === 'Enter') handleSaveGoal();
                                if (e.key === 'Escape') handleCancelGoal();
                              }}
                            />
                          </div>
                          <div className="flex gap-2">
                            <button onClick={handleSaveGoal} className="flex-1 py-3 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-[10px] font-black uppercase flex items-center justify-center gap-2 transition-all">
                              <Check size={14} /> Salvar
                            </button>
                            <button onClick={handleCancelGoal} className="flex-1 py-3 bg-white/5 hover:bg-red-500/20 text-white/40 hover:text-red-500 rounded-xl text-[10px] font-black uppercase flex items-center justify-center gap-2 transition-all">
                              <Ban size={14} /> Cancelar
                            </button>
                          </div>
                       </div>
                    ) : (
                       <div onClick={() => setIsEditingGoal(true)} className="cursor-pointer flex items-baseline gap-2 group/val">
                          <p className="text-3xl font-black text-white mono tracking-tighter truncate italic">
                            R$ {savingGoal.toLocaleString('pt-BR')}
                          </p>
                       </div>
                    )}
                 </div>

                 <div className="p-6 bg-black/20 rounded-[2rem] border border-white/5 space-y-4">
                   <div className="flex justify-between items-end">
                      <div className="shrink-0">
                        <p className="text-[10px] font-black text-white/20 uppercase tracking-[0.3em] mb-1">Alcance</p>
                        <span className="text-2xl font-black text-white mono">{Math.round(goalProgress)}%</span>
                      </div>
                      <div className="text-right min-w-0">
                        <p className="text-[9px] font-black text-white/20 uppercase tracking-widest mb-1">Diferença</p>
                        <span className={`text-xs font-black mono truncate block ${totalProjectedSaving >= savingGoal ? 'text-emerald-400' : 'text-white/60'}`}>
                          R$ {Math.abs(savingGoal - totalProjectedSaving).toLocaleString('pt-BR')}
                        </span>
                      </div>
                   </div>
                   <div className="h-4 bg-white/5 rounded-full overflow-hidden p-1">
                      <div className={`h-full rounded-full transition-all duration-1000 ${goalProgress >= 100 ? 'bg-emerald-500 shadow-[0_0_20px_#10b981]' : 'bg-gradient-to-r from-[#0047ba] to-[#e31b23]'}`} style={{ width: `${goalProgress}%` }}></div>
                   </div>
                   <p className="text-[9px] font-black text-white/30 uppercase text-center tracking-[0.2em] italic leading-tight">
                     {goalProgress >= 100 ? 'Meta estratégica alcançada!' : `Identifique +R$ ${Math.max(0, savingGoal - totalProjectedSaving).toLocaleString('pt-BR')}`}
                   </p>
                </div>
              </div>
           </div>

           <div className="glass rounded-[2.5rem] p-8 border border-white/5 flex flex-col gap-6 shadow-3xl bg-gradient-to-br from-[#e31b23]/5 to-transparent shrink-0">
              <h3 className="text-lg font-black flex items-center gap-3 text-white uppercase tracking-tighter">
                <BarChart3 size={20} className="text-[#e31b23]" /> Métricas
              </h3>
              <div className="space-y-4">
                <div className="p-5 bg-white/5 rounded-[1.5rem] border border-white/5">
                   <p className="text-[10px] font-black text-white/20 uppercase tracking-widest mb-3">Confiabilidade</p>
                   <div className="flex items-center gap-4">
                      <div className="flex-1 h-2 bg-white/5 rounded-full overflow-hidden">
                         <div className="h-full bg-emerald-500 shadow-[0_0_15px_#10b981]" style={{ width: '92%' }}></div>
                      </div>
                      <span className="text-xs font-black text-white">92%</span>
                   </div>
                </div>
                <div className="p-5 bg-white/5 rounded-[1.5rem] border border-white/5">
                   <p className="text-[10px] font-black text-white/20 uppercase tracking-widest mb-2">Saving Atual</p>
                   <div className="flex items-center gap-3">
                      <TrendingUp size={20} className="text-[#0047ba]" />
                      <span className="text-2xl font-black text-white italic">R$ {totalProjectedSaving.toLocaleString()}</span>
                   </div>
                </div>
              </div>
           </div>

           <div className="glass rounded-[2.5rem] p-8 border border-white/5 flex flex-col gap-6 shadow-3xl flex-1 min-h-[300px]">
              <h3 className="text-lg font-black flex items-center gap-3 text-white uppercase tracking-tighter">
                <Activity size={20} className="text-[#0047ba]" /> Eventos
              </h3>
              <div className="space-y-3 overflow-y-auto pr-2 custom-scrollbar flex-1">
                {orders.filter(o => o.status === 'Aberta').slice(0, 8).map((os, idx) => (
                  <div key={idx} className="bg-white/5 p-4 rounded-2xl border border-white/5 flex items-center gap-4 hover:border-[#0047ba]/30 transition-all group">
                    <div className="w-2 h-2 rounded-full bg-[#e31b23] animate-pulse"></div>
                    <div className="flex-1 min-w-0">
                       <p className="text-[10px] font-bold text-white truncate">{os.description}</p>
                    </div>
                    <ChevronRight size={14} className="text-white/10 group-hover:text-white" />
                  </div>
                ))}
              </div>
           </div>
        </div>
      </div>
    </div>
  );
};

export default IAModule;
