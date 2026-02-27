
import React, { useState, useEffect } from 'react';
import { 
  Mail, Lock, ArrowRight, AlertCircle, Loader2, CheckCircle, ShieldCheck, Building2
} from 'lucide-react';
import { User, Unit } from '../types';
import { useApp } from '../context/AppContext';
import { authService } from '../services/authService';
import { DownloadPrompt } from './DownloadPrompt';
import { LUZIANIA_UNIT_ID } from '../constants';

interface LoginProps {
  onLogin: (user: User, selectedUnitId: string) => void;
}

const Login: React.FC<LoginProps> = ({ onLogin }) => {
  const { addNotification, units, addResetRequest, users } = useApp();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [selectedUnitId, setSelectedUnitId] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  
  const [showForgotModal, setShowForgotModal] = useState(false);
  const [forgotEmail, setForgotEmail] = useState('');
  const [newRequestedPassword, setNewRequestedPassword] = useState('');
  const [isSendingRequest, setIsSendingRequest] = useState(false);
  const [requestSent, setRequestSent] = useState(false);

  // Garante que uma unidade esteja sempre selecionada assim que a lista carregar
  useEffect(() => {
    if (units.length > 0 && !selectedUnitId) {
      setSelectedUnitId(units[0].id);
    }
  }, [units]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const result = await authService.login(email, password, users);
      if (result.success && result.user) {
        onLogin(result.user, selectedUnitId || LUZIANIA_UNIT_ID);
      } else {
        setError(result.error || 'Credenciais inválidas');
      }
    } catch (err) {
      setError('Erro de conexão com o serviço de autenticação.');
    } finally {
      setLoading(false);
    }
  };

  const handleRequestReset = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!forgotEmail || !newRequestedPassword) return;
    setIsSendingRequest(true);
    try {
      await addResetRequest(forgotEmail, newRequestedPassword);
      setRequestSent(true);
    } catch (err) {
      addNotification({ 
        type: 'critical', 
        title: 'Erro no Acesso', 
        message: 'Não foi possível processar seu pedido de recuperação agora.' 
      });
    } finally {
      setIsSendingRequest(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[#F0F4F8] p-4 font-sans text-slate-800">
      <DownloadPrompt />
      
      {/* Cabeçalho da Marca */}
      <div className="mb-8 text-center animate-in fade-in slide-in-from-bottom-4 duration-700">
        <div className="flex items-center justify-center gap-2 mb-2">
            {/* Logo Estilizado */}
            <div className="relative">
                <div className="absolute -top-1 -right-2 text-[10px] font-black text-[#E31B23]">®</div>
                <h1 className="text-5xl font-bold tracking-tighter text-[#1A3673]" style={{ fontFamily: 'Times New Roman, serif', fontStyle: 'italic' }}>
                    Aviagen
                </h1>
            </div>
        </div>
        <h2 className="text-xl font-bold text-[#1A3673]">Sistema de Gestão Industrial</h2>
        <p className="text-slate-400 text-xs font-medium uppercase tracking-[0.2em]">Plataforma GMAO/CMMS</p>
      </div>

      {/* Card de Login */}
      <div className="w-full max-w-[420px] bg-white rounded-[24px] shadow-[0_20px_50px_-12px_rgba(0,0,0,0.1)] border border-slate-100 p-8 md:p-10 animate-in zoom-in-95 duration-500 relative overflow-hidden">
        
        {/* Barra decorativa superior */}
        <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-[#1A3673] to-[#2A4B94]"></div>

        <form onSubmit={handleLogin} className="space-y-6">
          
          <div className="space-y-5">
            <div className="space-y-1.5">
                <label className="text-sm font-bold text-slate-700 ml-1">Email Corporativo</label>
                <div className="relative group">
                    <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-[#1A3673] transition-colors">
                        <Mail size={18} />
                    </div>
                    <input 
                        type="email" 
                        required
                        className="w-full pl-11 pr-4 py-3.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-700 font-medium focus:outline-none focus:bg-white focus:border-[#1A3673] focus:ring-4 focus:ring-[#1A3673]/5 transition-all placeholder:text-slate-300"
                        placeholder="seu.email@aviagen.com"
                        value={email}
                        onChange={e => setEmail(e.target.value)}
                    />
                </div>
            </div>

            <div className="space-y-1.5">
                <label className="text-sm font-bold text-slate-700 ml-1">Senha de Acesso</label>
                <div className="relative group">
                    <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-[#1A3673] transition-colors">
                        <Lock size={18} />
                    </div>
                    <input 
                        type="password" 
                        required
                        className="w-full pl-11 pr-4 py-3.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-700 font-medium focus:outline-none focus:bg-white focus:border-[#1A3673] focus:ring-4 focus:ring-[#1A3673]/5 transition-all placeholder:text-slate-300"
                        placeholder="••••••••"
                        value={password}
                        onChange={e => setPassword(e.target.value)}
                    />
                </div>
            </div>
          </div>

          {error && (
            <div className="flex items-center gap-3 p-4 bg-red-50 text-red-600 rounded-xl text-xs font-bold border border-red-100 animate-in shake">
              <AlertCircle size={16} className="shrink-0"/> {error}
            </div>
          )}

          <button 
            type="submit" 
            disabled={loading}
            className="w-full bg-[#1A3673] hover:bg-[#152c5c] text-white font-bold py-4 rounded-xl shadow-[0_10px_20px_-10px_rgba(26,54,115,0.4)] transition-all flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed group"
          >
            {loading ? <Loader2 size={20} className="animate-spin" /> : (
              <>
                <span>Entrar no Sistema</span>
                <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
              </>
            )}
          </button>

          <div className="text-center pt-2">
             <button 
                type="button" 
                onClick={() => { setShowForgotModal(true); setRequestSent(false); }}
                className="text-xs font-bold text-slate-400 hover:text-[#1A3673] transition-colors"
             >
                Esqueceu sua senha?
             </button>
          </div>
        </form>
      </div>

      {/* Footer Seguro */}
      <div className="mt-10 flex flex-col items-center gap-6 animate-in fade-in duration-1000 delay-300">
         <div className="flex items-center gap-2 text-slate-500 bg-white/50 px-4 py-2 rounded-full border border-slate-200/50 backdrop-blur-sm">
            <ShieldCheck size={14} className="text-[#E31B23]" />
            <span className="text-[10px] font-bold uppercase tracking-widest">Ambiente Seguro & Monitorado</span>
         </div>

         <div className="text-center opacity-70">
            <p className="text-[10px] font-black text-[#1A3673] uppercase tracking-[0.2em]">
               CRIADO E DESENVOLVIDO POR EMERSON HENRIQUE 2026
            </p>
         </div>
      </div>

      {/* Modal de Recuperação */}
      {showForgotModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[2000] flex items-center justify-center p-4 animate-in fade-in duration-300">
          <div className="bg-white max-w-sm w-full p-8 rounded-[24px] shadow-2xl relative animate-in zoom-in-95">
            <button onClick={() => setShowForgotModal(false)} className="absolute top-6 right-6 text-slate-300 hover:text-slate-600 transition-colors"><Building2 className="rotate-45" size={20}/></button>
            
            <div className="text-center mb-6">
              <div className="w-14 h-14 bg-blue-50 text-[#1A3673] rounded-2xl flex items-center justify-center mx-auto mb-4 border border-blue-100">
                <ShieldCheck size={28} />
              </div>
              <h3 className="text-lg font-bold text-slate-900">Recuperação de Acesso</h3>
              <p className="text-xs text-slate-500 mt-1">Informe seu email corporativo para reset.</p>
            </div>

            {requestSent ? (
              <div className="text-center space-y-6">
                <div className="flex items-center justify-center gap-2 text-emerald-600 bg-emerald-50 p-3 rounded-xl border border-emerald-100">
                  <CheckCircle size={18}/>
                  <span className="text-xs font-bold">Solicitação enviada com sucesso!</span>
                </div>
                <button onClick={() => setShowForgotModal(false)} className="w-full py-3 bg-slate-100 text-slate-600 rounded-xl text-xs font-bold hover:bg-slate-200 transition-all">Voltar ao Login</button>
              </div>
            ) : (
              <form onSubmit={handleRequestReset} className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-slate-400 uppercase ml-1">Email Corporativo</label>
                  <input 
                    type="email" 
                    required
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-700 text-sm focus:outline-none focus:border-[#1A3673]"
                    placeholder="email@aviagen.com"
                    value={forgotEmail}
                    onChange={e => setForgotEmail(e.target.value)}
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-slate-400 uppercase ml-1">Nova Senha Desejada</label>
                  <input 
                    type="password" 
                    required
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-700 text-sm focus:outline-none focus:border-[#1A3673]"
                    placeholder="Sua nova senha"
                    value={newRequestedPassword}
                    onChange={e => setNewRequestedPassword(e.target.value)}
                  />
                </div>
                <button 
                  disabled={isSendingRequest}
                  className="w-full py-3 bg-[#1A3673] text-white rounded-xl text-xs font-bold tracking-wide uppercase shadow-lg hover:bg-slate-900 transition-all flex items-center justify-center gap-2 disabled:opacity-70"
                >
                  {isSendingRequest ? <Loader2 size={16} className="animate-spin" /> : 'Enviar Solicitação'}
                </button>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default Login;
