
import React, { useState, useEffect } from 'react';
import { 
  Plus, X, Save, Send, Mic, Loader2, Wrench, Calendar, Tag, Info, ListChecks, Server
} from 'lucide-react';
import { ServiceType, User, OSStatus } from '../types';
import { SECTORS } from '../constants';
import { refineTechnicalDescription } from '../services/geminiService';
import { useApp } from '../context/AppContext';

interface OSFormProps {
  onSubmit: (data: any) => void;
  onCancel: () => void;
  technicians: User[];
  preFilledData?: any;
  initialData?: any;
}

const OSForm: React.FC<OSFormProps> = ({ onSubmit, onCancel, technicians, preFilledData, initialData }) => {
  const { assets } = useApp();
  
  const defaultState = {
    technicianId: technicians[0]?.id || '',
    requestDate: new Date().toISOString().split('T')[0],
    deadline: '',
    type: ServiceType.CORRECTIVE,
    description: '',
    sector: SECTORS[0],
    timeSpent: 0,
    assetId: '',
    checklist: [] as { task: string; checked: boolean }[]
  };

  const [formData, setFormData] = useState(defaultState);
  const [isListening, setIsListening] = useState(false);
  const [isProcessingAudio, setIsProcessingAudio] = useState(false);

  const availableAssets = assets.filter(a => a.sector === formData.sector);

  useEffect(() => {
    if (initialData) {
      setFormData({
        technicianId: initialData.technicianId || technicians[0]?.id || '',
        requestDate: initialData.requestDate || new Date().toISOString().split('T')[0],
        deadline: initialData.deadline || '',
        type: initialData.type || ServiceType.CORRECTIVE,
        description: initialData.description || '',
        sector: initialData.sector || SECTORS[0],
        timeSpent: initialData.timeSpent || 0,
        assetId: initialData.assetId || '',
        checklist: initialData.checklist || []
      });
    } else if (preFilledData) {
      setFormData(prev => ({
        ...defaultState, 
        description: preFilledData.description || '',
        type: preFilledData.type || ServiceType.PREVENTIVE,
        sector: preFilledData.sector || SECTORS[0],
        assetId: preFilledData.assetId || '',
      }));
    } else {
      setFormData(defaultState);
    }
  }, [preFilledData, initialData, technicians]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.deadline || !formData.description) return alert('Por favor, preencha todos os campos obrigatórios.');
    onSubmit(formData);
  };

  const handleVoiceInput = () => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) return alert("Navegador sem suporte a reconhecimento de voz.");
    const recognition = new SpeechRecognition();
    recognition.lang = 'pt-BR';
    recognition.onstart = () => setIsListening(true);
    recognition.onend = () => setIsListening(false);
    recognition.onresult = async (event: any) => {
      const rawTranscript = event.results[0][0].transcript;
      setIsProcessingAudio(true);
      try {
        const refinedText = await refineTechnicalDescription(rawTranscript);
        setFormData(prev => ({ ...prev, description: prev.description ? `${prev.description}\n${refinedText}` : refinedText }));
      } catch (error) {
        setFormData(prev => ({ ...prev, description: prev.description ? `${prev.description}\n${rawTranscript}` : rawTranscript }));
      } finally {
        setIsProcessingAudio(false);
      }
    };
    recognition.start();
  };

  return (
    <div className="w-full bg-white">
      <div className="flex items-center justify-between mb-10">
        <div className="flex items-center gap-6">
          <div className={`w-14 h-14 rounded-2xl flex items-center justify-center text-white shadow-xl ${initialData ? 'bg-blue-600' : 'bg-[#1A3673]'}`}>
            {initialData ? <Save size={28} /> : <Plus size={32} />}
          </div>
          <div>
            <h2 className="text-2xl font-black text-[#1A3673] uppercase tracking-tighter italic leading-none">
              {initialData ? 'Editar Protocolo' : 'Nova Ordem Digital'}
            </h2>
            <p className="text-slate-400 text-[10px] font-black uppercase tracking-[0.3em] mt-2 italic">Aviagen Industrial Core v2.7</p>
          </div>
        </div>
        <button onClick={onCancel} className="p-3 text-slate-300 hover:text-red-500 transition-all hover:bg-red-50 rounded-xl">
          <X size={28} />
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="space-y-2">
            <label className="industrial-label">Técnico Responsável</label>
            <div className="relative">
               <Wrench className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
               <select className="industrial-input pl-12" value={formData.technicianId} onChange={(e) => setFormData({...formData, technicianId: e.target.value})}>
                 {technicians.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
               </select>
            </div>
          </div>
          
          <div className="space-y-2">
            <label className="industrial-label">Setor de Manutenção</label>
            <div className="relative">
               <Server className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
               <select className="industrial-input pl-12" value={formData.sector} onChange={(e) => setFormData({...formData, sector: e.target.value, assetId: ''})}>
                 {SECTORS.map(s => <option key={s} value={s}>{s.toUpperCase()}</option>)}
               </select>
            </div>
          </div>

          <div className="space-y-2 md:col-span-2">
            <label className="industrial-label">Equipamento Vinculado</label>
            <select className="industrial-input" value={formData.assetId} onChange={(e) => setFormData({...formData, assetId: e.target.value})}>
              <option value="">NENHUM ATIVO ESPECÍFICO (CHAMADO GERAL)</option>
              {availableAssets.map(a => <option key={a.id} value={a.id}>{a.name} - S/N: {a.serialNumber}</option>)}
            </select>
          </div>

          <div className="space-y-2">
            <label className="industrial-label">Prazo Final (Deadline)</label>
            <div className="relative">
               <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
               <input type="date" required className="industrial-input pl-12" value={formData.deadline} onChange={(e) => setFormData({...formData, deadline: e.target.value})} />
            </div>
          </div>

          <div className="space-y-2">
            <label className="industrial-label">Modalidade de Serviço</label>
            <div className="relative">
               <Tag className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
               <select className="industrial-input pl-12" value={formData.type} onChange={(e) => setFormData({...formData, type: e.target.value as ServiceType})}>
                 {Object.values(ServiceType).map(t => <option key={t} value={t}>{t}</option>)}
               </select>
            </div>
          </div>

          <div className="md:col-span-2 space-y-2">
            <div className="flex justify-between items-center mb-1">
               <label className="industrial-label">Diagnóstico Técnico / Problema</label>
               {isListening && <span className="text-red-500 text-[9px] font-black uppercase animate-pulse flex items-center gap-1"><Mic size={10}/> Capturando Áudio...</span>}
            </div>
            <div className="relative group">
              <textarea 
                required 
                rows={5} 
                className="industrial-input resize-none !px-6 !py-5 text-sm font-medium leading-relaxed group-focus-within:border-[#1A3673]" 
                placeholder="Descreva detalhadamente a falha ou dita o procedimento realizado..." 
                value={formData.description} 
                onChange={(e) => setFormData({...formData, description: e.target.value})}
              ></textarea>
              <button 
                type="button" 
                onClick={handleVoiceInput} 
                disabled={isProcessingAudio} 
                className={`absolute bottom-4 right-4 p-4 rounded-2xl shadow-xl transition-all active:scale-90 ${isListening ? 'bg-red-500 text-white' : 'bg-[#1A3673] text-white hover:bg-slate-900'}`}
                title="Usar Voz (IA)"
              >
                {isProcessingAudio ? <Loader2 size={20} className="animate-spin" /> : <Mic size={20} />}
              </button>
            </div>
          </div>
        </div>

        <div className="flex gap-4 pt-10 border-t border-slate-100">
          <button 
            type="button" 
            onClick={onCancel} 
            className="flex-1 py-6 bg-slate-100 text-slate-500 rounded-2xl font-black uppercase text-[10px] tracking-widest hover:bg-red-50 hover:text-red-500 transition-all border border-transparent hover:border-red-100"
          >
            Cancelar Operação
          </button>
          <button 
            type="submit" 
            className="flex-[2] py-6 bg-[#1A3673] text-white rounded-2xl font-black uppercase text-[10px] tracking-widest shadow-2xl shadow-blue-900/10 hover:bg-slate-900 transition-all flex items-center justify-center gap-3 active:scale-[0.98]"
          >
            {initialData ? <Save size={20}/> : <Send size={20} />}
            {initialData ? 'Atualizar Protocolo' : 'Publicar Ordem de Serviço'}
          </button>
        </div>
      </form>
    </div>
  );
};
export default OSForm;
