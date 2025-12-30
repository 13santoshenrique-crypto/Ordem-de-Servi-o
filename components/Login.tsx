
import React, { useState, useEffect } from 'react';
import { 
  User as UserIcon, ChevronRight, Fingerprint, Activity, ShieldCheck, Globe
} from 'lucide-react';
import { User } from '../types';
import { INITIAL_USERS } from '../constants';

interface LoginProps {
  onLogin: (user: User) => void;
}

const Login: React.FC<LoginProps> = ({ onLogin }) => {
  const [selectedUserId, setSelectedUserId] = useState(INITIAL_USERS[0].id);
  const [isMounting, setIsMounting] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setIsMounting(false), 500);
    return () => clearTimeout(timer);
  }, []);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    const user = INITIAL_USERS.find(u => u.id === selectedUserId);
    if (user) onLogin(user);
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 relative overflow-hidden bg-[#020617] grid-pattern">
      {/* Background Ambience - Subtle Glows */}
      <div className="absolute top-0 left-0 w-full h-full opacity-20 pointer-events-none">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-blue-600/10 blur-[150px] rounded-full"></div>
      </div>
      
      {/* Login Card */}
      <div className={`max-w-md w-full transition-all duration-1000 transform ${isMounting ? 'opacity-0 translate-y-8' : 'opacity-100 translate-y-0'}`}>
        <div className="glass rounded-[2.5rem] border border-white/10 shadow-3xl overflow-hidden relative">
          {/* Scanner Line Animation */}
          <div className="scanner-line opacity-30"></div>
          
          <div className="p-10 md:p-12 flex flex-col items-center">
            {/* Branding */}
            <div className="mb-10 text-center">
              <div className="w-16 h-16 bg-white flex items-center justify-center rounded-2xl shadow-xl mx-auto mb-6 transform hover:rotate-3 transition-transform">
                <div className="font-black text-[#0047ba] text-3xl italic tracking-tighter">A</div>
              </div>
              <h1 className="text-3xl font-black text-white tracking-tighter uppercase italic">
                SGI <span className="text-[#0047ba]">AVIAGEN</span>
              </h1>
              <p className="text-white/20 text-[8px] font-black tracking-[0.4em] uppercase mt-2">Industrial Management System</p>
            </div>

            <form onSubmit={handleLogin} className="w-full space-y-6">
              {/* User Selection */}
              <div className="space-y-2">
                <label className="text-[9px] font-black text-white/30 uppercase tracking-[0.2em] ml-4">Identificação</label>
                <div className="relative group">
                  <UserIcon className="absolute left-5 top-1/2 -translate-y-1/2 text-white/10 group-focus-within:text-[#0047ba] transition-colors" size={18} />
                  <select 
                    className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-14 pr-10 text-white focus:outline-none focus:border-[#0047ba] appearance-none cursor-pointer font-bold text-xs uppercase tracking-widest transition-all hover:bg-white/10"
                    value={selectedUserId}
                    onChange={(e) => setSelectedUserId(e.target.value)}
                  >
                    {INITIAL_USERS.map(u => (
                      <option key={u.id} value={u.id} className="bg-[#0f172a]">{u.name} • {u.role}</option>
                    ))}
                  </select>
                  <ChevronRight className="absolute right-5 top-1/2 -translate-y-1/2 text-white/10 rotate-90" size={14} />
                </div>
              </div>

              {/* Password Simulation */}
              <div className="space-y-2">
                <label className="text-[9px] font-black text-white/30 uppercase tracking-[0.2em] ml-4">Chave de Acesso</label>
                <div className="relative group">
                  <Fingerprint className="absolute left-5 top-1/2 -translate-y-1/2 text-white/10 group-focus-within:text-[#0047ba] transition-colors" size={18} />
                  <input 
                    type="password" 
                    placeholder="DIGITE SEU PIN"
                    className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-14 pr-8 text-white focus:outline-none focus:border-[#0047ba] font-black text-[10px] tracking-[0.5em] transition-all hover:bg-white/10"
                    defaultValue="********"
                  />
                </div>
              </div>

              {/* Submit */}
              <button 
                type="submit"
                className="w-full py-5 mt-4 bg-[#0047ba] hover:bg-white hover:text-[#0047ba] text-white font-black text-[10px] uppercase tracking-[0.3em] rounded-2xl shadow-xl shadow-blue-900/20 transition-all duration-300 flex items-center justify-center gap-3 group"
              >
                <Activity size={16} className="group-hover:animate-pulse" />
                <span>Iniciar Sessão</span>
                <ChevronRight size={16} className="group-hover:translate-x-1 transition-transform" />
              </button>
            </form>

            {/* Micro details inside card */}
            <div className="mt-10 pt-6 border-t border-white/5 w-full flex justify-between items-center opacity-20">
               <div className="flex items-center gap-2 text-[7px] font-black uppercase tracking-widest text-white">
                 <Globe size={10} />
                 Encrypted Node
               </div>
               <div className="flex items-center gap-2 text-[7px] font-black uppercase tracking-widest text-white">
                 Secure Link
                 <ShieldCheck size={10} />
               </div>
            </div>
          </div>
        </div>
      </div>

      {/* Footer Credit */}
      <div className={`mt-8 transition-all duration-1000 delay-500 transform ${isMounting ? 'opacity-0' : 'opacity-100'}`}>
        <p className="text-[9px] font-black text-white/10 uppercase tracking-[0.3em] hover:text-white/30 transition-colors cursor-default">
          Criado e desenvolvido por <span className="text-[#0047ba]/40">Emerson Henrique</span>
        </p>
      </div>
    </div>
  );
};

export default Login;
