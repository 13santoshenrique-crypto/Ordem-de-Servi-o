
import React, { useState, useEffect } from 'react';
import { Key, ShieldCheck, ExternalLink, AlertCircle } from 'lucide-react';

interface ApiKeySelectorProps {
  onKeySelected: () => void;
}

const ApiKeySelector: React.FC<ApiKeySelectorProps> = ({ onKeySelected }) => {
  const [hasKey, setHasKey] = useState<boolean | null>(null);

  useEffect(() => {
    const checkKey = async () => {
      if (window.aistudio && typeof window.aistudio.hasSelectedApiKey === 'function') {
        const selected = await window.aistudio.hasSelectedApiKey();
        setHasKey(selected);
      } else {
        // Fallback for non-AI Studio environments (like local dev with .env)
        setHasKey(true);
      }
    };
    checkKey();
  }, []);

  const handleOpenSelector = async () => {
    if (window.aistudio && typeof window.aistudio.openSelectKey === 'function') {
      await window.aistudio.openSelectKey();
      // Assume success and proceed as per guidelines
      onKeySelected();
    }
  };

  if (hasKey === true) return null;

  return (
    <div className="fixed inset-0 bg-[#0a0a0a] z-[9999] flex items-center justify-center p-6 font-sans">
      <div className="max-w-md w-full bg-[#141414] border border-white/10 rounded-[2.5rem] p-10 shadow-2xl animate-in zoom-in-95 duration-500">
        <div className="w-16 h-16 bg-emerald-500/10 rounded-2xl flex items-center justify-center text-emerald-500 mb-8 border border-emerald-500/20">
          <Key size={32} />
        </div>
        
        <h2 className="text-3xl font-black text-white uppercase italic tracking-tighter mb-4 leading-none">
          Ativar Inteligência Industrial
        </h2>
        
        <p className="text-slate-400 text-sm leading-relaxed mb-8">
          Para utilizar os recursos de IA preditiva, visão computacional e mentoria técnica, você precisa selecionar uma chave de API do Google Gemini (projeto pago).
        </p>

        <div className="space-y-4 mb-10">
          <div className="flex items-start gap-3 p-4 bg-white/5 rounded-2xl border border-white/5">
            <ShieldCheck className="text-emerald-500 shrink-0" size={18} />
            <p className="text-[11px] text-slate-300 leading-snug">
              Sua chave é armazenada de forma segura e utilizada apenas para processar suas solicitações de IA.
            </p>
          </div>
          
          <a 
            href="https://ai.google.dev/gemini-api/docs/billing" 
            target="_blank" 
            rel="noopener noreferrer"
            className="flex items-center justify-between p-4 bg-white/5 rounded-2xl border border-white/5 hover:bg-white/10 transition-all group"
          >
            <div className="flex items-center gap-3">
              <AlertCircle className="text-blue-400 shrink-0" size={18} />
              <span className="text-[11px] text-slate-300 font-bold uppercase tracking-wider">Documentação de Faturamento</span>
            </div>
            <ExternalLink size={14} className="text-slate-500 group-hover:text-white transition-colors" />
          </a>
        </div>

        <button 
          onClick={handleOpenSelector}
          className="w-full py-5 bg-white text-black rounded-2xl font-black uppercase text-xs tracking-[0.2em] shadow-xl hover:bg-emerald-500 hover:text-white transition-all transform active:scale-95"
        >
          Selecionar Chave de API
        </button>
        
        <p className="text-center mt-6 text-[9px] font-bold text-slate-500 uppercase tracking-widest">
          Aviagen SGI • Módulo de IA Avançada
        </p>
      </div>
    </div>
  );
};

export default ApiKeySelector;
