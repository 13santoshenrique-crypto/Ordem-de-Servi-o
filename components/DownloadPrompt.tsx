import React, { useState, useEffect } from 'react';
import { Smartphone, Monitor, X, Download, Share, PlusSquare, CheckCircle } from 'lucide-react';

export const DownloadPrompt: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [platform, setPlatform] = useState<'mobile' | 'pc' | null>(null);

  useEffect(() => {
    const hasSeenPrompt = localStorage.getItem('aviagen_download_prompt_seen');
    if (!hasSeenPrompt) {
      // Delay slightly for better UX
      const timer = setTimeout(() => setIsOpen(true), 1000);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleDismiss = () => {
    setIsOpen(false);
    localStorage.setItem('aviagen_download_prompt_seen', 'true');
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-300">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden animate-in zoom-in-95 duration-300 relative">
        <button 
          onClick={handleDismiss}
          className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 transition-colors"
        >
          <X size={20} />
        </button>

        <div className="p-6 text-center">
          <div className="w-16 h-16 bg-blue-50 rounded-2xl flex items-center justify-center mx-auto mb-4 text-[#1A3673]">
            <Download size={32} />
          </div>
          
          <h2 className="text-xl font-bold text-[#1A3673] mb-2">Instalar Aplicativo</h2>
          <p className="text-sm text-slate-500 mb-6">
            Para uma melhor experiência, instale o SGI Aviagen no seu dispositivo.
          </p>

          <div className="grid grid-cols-2 gap-4">
            <button 
              onClick={() => setPlatform('mobile')}
              className={`p-4 rounded-xl border-2 transition-all flex flex-col items-center gap-3 ${platform === 'mobile' ? 'border-[#1A3673] bg-blue-50' : 'border-slate-100 hover:border-blue-100 hover:bg-slate-50'}`}
            >
              <Smartphone size={32} className={platform === 'mobile' ? 'text-[#1A3673]' : 'text-slate-400'} />
              <span className={`text-sm font-bold ${platform === 'mobile' ? 'text-[#1A3673]' : 'text-slate-600'}`}>Mobile</span>
            </button>

            <button 
              onClick={() => setPlatform('pc')}
              className={`p-4 rounded-xl border-2 transition-all flex flex-col items-center gap-3 ${platform === 'pc' ? 'border-[#1A3673] bg-blue-50' : 'border-slate-100 hover:border-blue-100 hover:bg-slate-50'}`}
            >
              <Monitor size={32} className={platform === 'pc' ? 'text-[#1A3673]' : 'text-slate-400'} />
              <span className={`text-sm font-bold ${platform === 'pc' ? 'text-[#1A3673]' : 'text-slate-600'}`}>Desktop</span>
            </button>
          </div>

          {platform === 'mobile' && (
            <div className="mt-6 bg-slate-50 p-4 rounded-xl text-left animate-in fade-in slide-in-from-top-2">
              <h3 className="text-xs font-bold text-[#1A3673] uppercase tracking-wider mb-3">Como instalar no iOS/Android:</h3>
              <ol className="space-y-3 text-xs text-slate-600">
                <li className="flex items-start gap-2">
                  <span className="bg-white p-1 rounded shadow-sm shrink-0"><Share size={14} /></span>
                  <span>Toque no botão <strong>Compartilhar</strong> (iOS) ou <strong>Menu</strong> (Android).</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="bg-white p-1 rounded shadow-sm shrink-0"><PlusSquare size={14} /></span>
                  <span>Selecione <strong>Adicionar à Tela de Início</strong>.</span>
                </li>
              </ol>
            </div>
          )}

          {platform === 'pc' && (
            <div className="mt-6 bg-slate-50 p-4 rounded-xl text-left animate-in fade-in slide-in-from-top-2">
              <h3 className="text-xs font-bold text-[#1A3673] uppercase tracking-wider mb-3">Como instalar no PC:</h3>
              <ol className="space-y-3 text-xs text-slate-600">
                <li className="flex items-start gap-2">
                  <span className="bg-white p-1 rounded shadow-sm shrink-0"><Download size={14} /></span>
                  <span>Clique no ícone de <strong>Instalar</strong> na barra de endereço do navegador.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="bg-white p-1 rounded shadow-sm shrink-0"><CheckCircle size={14} /></span>
                  <span>Confirme a instalação para criar um atalho na área de trabalho.</span>
                </li>
              </ol>
            </div>
          )}
        </div>
        
        <div className="bg-slate-50 p-4 border-t border-slate-100 flex justify-end">
          <button 
            onClick={handleDismiss}
            className="px-6 py-2 bg-[#1A3673] text-white text-sm font-bold rounded-lg hover:bg-[#152c5c] transition-colors"
          >
            Entendi
          </button>
        </div>
      </div>
    </div>
  );
};
