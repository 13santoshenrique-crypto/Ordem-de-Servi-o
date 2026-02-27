
import React, { useState } from 'react';
import { Lock, ShieldCheck, Key, Save, AlertCircle, CheckCircle } from 'lucide-react';
import { useApp } from '../context/AppContext';

const Settings: React.FC = () => {
  const { currentUser, changePassword } = useApp();
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  if (!currentUser) return null;

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess(false);

    if (newPassword.length < 3) {
      setError('A senha deve ter pelo menos 3 caracteres.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setError('As senhas não coincidem.');
      return;
    }

    try {
      await changePassword(currentUser.id, newPassword);
      setSuccess(true);
      setNewPassword('');
      setConfirmPassword('');
    } catch (err) {
      setError('Erro ao atualizar a senha.');
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in duration-500">
      <div className="flex items-center gap-4 pt-6">
        <div className="p-3 bg-blue-50 text-[#1A3673] rounded-2xl">
          <ShieldCheck size={32} />
        </div>
        <div>
          <h2 className="text-3xl font-black text-[#1A3673] uppercase tracking-tighter italic">Configurações de Perfil</h2>
          <p className="text-slate-400 text-[10px] font-bold uppercase tracking-widest mt-1">Gerencie sua segurança e preferências</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Info Card */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm flex flex-col items-center text-center">
            <div className="w-24 h-24 bg-[#1A3673] text-white rounded-[2rem] flex items-center justify-center text-4xl font-black italic mb-6 shadow-xl">
              {currentUser.name.charAt(0)}
            </div>
            <h3 className="text-xl font-black text-slate-900 uppercase italic leading-none">{currentUser.name}</h3>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-2">{currentUser.email}</p>
            <div className="mt-6 px-4 py-1.5 bg-blue-50 text-[#1A3673] rounded-full text-[9px] font-black uppercase tracking-widest">
              {currentUser.role}
            </div>
          </div>
        </div>

        {/* Password Form */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white p-10 rounded-[3rem] border border-slate-100 shadow-sm">
            <div className="flex items-center gap-3 mb-8">
              <Lock className="text-[#1A3673]" size={20} />
              <h3 className="text-lg font-black text-slate-900 uppercase italic">Alterar Senha de Acesso</h3>
            </div>

            <form onSubmit={handleUpdatePassword} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Nova Senha</label>
                  <div className="relative">
                    <Key className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
                    <input 
                      type="password" 
                      required
                      className="w-full pl-12 pr-4 py-4 bg-slate-50 border border-slate-200 rounded-2xl text-slate-700 font-bold focus:outline-none focus:border-[#1A3673] transition-all"
                      placeholder="••••••••"
                      value={newPassword}
                      onChange={e => setNewPassword(e.target.value)}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Confirmar Senha</label>
                  <div className="relative">
                    <Key className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
                    <input 
                      type="password" 
                      required
                      className="w-full pl-12 pr-4 py-4 bg-slate-50 border border-slate-200 rounded-2xl text-slate-700 font-bold focus:outline-none focus:border-[#1A3673] transition-all"
                      placeholder="••••••••"
                      value={confirmPassword}
                      onChange={e => setConfirmPassword(e.target.value)}
                    />
                  </div>
                </div>
              </div>

              {error && (
                <div className="flex items-center gap-3 p-4 bg-red-50 text-red-600 rounded-2xl text-xs font-bold border border-red-100 animate-in shake">
                  <AlertCircle size={16} /> {error}
                </div>
              )}

              {success && (
                <div className="flex items-center gap-3 p-4 bg-emerald-50 text-emerald-600 rounded-2xl text-xs font-bold border border-emerald-100 animate-in slide-in-from-top-2">
                  <CheckCircle size={16} /> Senha atualizada com sucesso!
                </div>
              )}

              <button 
                type="submit"
                className="w-full md:w-auto px-10 py-4 bg-[#1A3673] text-white rounded-2xl font-black uppercase text-[10px] tracking-widest shadow-xl hover:bg-slate-900 transition-all flex items-center justify-center gap-3"
              >
                <Save size={18} /> Salvar Nova Senha
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings;
