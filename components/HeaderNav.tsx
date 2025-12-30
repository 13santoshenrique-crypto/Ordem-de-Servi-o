
import React from 'react';
import { 
  LayoutDashboard, Cpu, Package, DollarSign,
  LogOut, Moon, Sun, HardHat, Drill, Settings
} from 'lucide-react';
import { UserRole, CloudSyncState, Unit, ThemeType } from '../types';

interface HeaderNavProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  role: UserRole;
  userName: string;
  unitName: string;
  syncState: CloudSyncState;
  onLogout: () => void;
  units: Unit[];
  currentUnitId: string;
  setCurrentUnitId: (id: string) => void;
  isGlobalAdmin: boolean;
  currentTheme: ThemeType;
  setTheme: (theme: ThemeType) => void;
}

const HeaderNav: React.FC<HeaderNavProps> = ({ 
  activeTab, setActiveTab, role, userName, unitName, 
  onLogout, currentTheme, setTheme
}) => {
  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, roles: [UserRole.ADMIN, UserRole.GLOBAL_ADMIN, UserRole.BOARD_MEMBER] },
    { id: 'history', label: 'Manutenção', icon: Drill, roles: [UserRole.ADMIN, UserRole.TECHNICIAN, UserRole.GLOBAL_ADMIN] },
    { id: 'inventory', label: 'Almoxarifado', icon: Package, roles: [UserRole.ADMIN, UserRole.GLOBAL_ADMIN] },
    { id: 'finance', label: 'Custo Real', icon: DollarSign, roles: [UserRole.ADMIN, UserRole.GLOBAL_ADMIN, UserRole.BOARD_MEMBER] },
    { id: 'ai', label: 'Cérebro SGI', icon: Cpu, roles: [UserRole.ADMIN, UserRole.TECHNICIAN, UserRole.GLOBAL_ADMIN] },
    { id: 'admin', label: 'Gestão/Infra', icon: Settings, roles: [UserRole.ADMIN, UserRole.GLOBAL_ADMIN] },
  ];

  return (
    <nav className="h-24 bg-[#020617] border-b-2 border-white/5 flex items-center justify-between px-10 shrink-0 z-50 shadow-2xl relative grid-pattern">
      <div className="flex items-center gap-12">
        <div className="flex items-center gap-4 cursor-pointer group" onClick={() => setActiveTab('dashboard')}>
          <div className="w-12 h-12 bg-white flex items-center justify-center p-2 transform group-hover:-rotate-6 transition-all">
             <div className="font-black text-[#0047ba] text-2xl italic tracking-tighter">A</div>
          </div>
          <div className="leading-none">
            <h1 className="font-black text-lg tracking-tighter text-white uppercase italic">SGI-AVIAGEN</h1>
            <p className="text-[7px] text-white/30 font-black tracking-[0.4em] uppercase">GMAO PRO SYSTEM</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {menuItems.map((item) => {
            if (!item.roles.includes(role)) return null;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`flex flex-col items-center justify-center w-24 h-20 transition-all relative border-t-4 ${
                  isActive ? 'border-[#0047ba] bg-white/5 text-white' : 'border-transparent text-white/20 hover:text-white'
                }`}
              >
                <item.icon size={20} className={isActive ? 'text-[#0047ba]' : ''} />
                <span className="font-black text-[8px] uppercase tracking-widest mt-2">{item.label}</span>
                {isActive && (
                   <div className="absolute inset-0 bg-gradient-to-b from-[#0047ba]/10 to-transparent"></div>
                )}
              </button>
            );
          })}
        </div>
      </div>

      <div className="flex items-center gap-8">
        <div className="flex bg-black/40 border border-white/5 p-1 rounded-lg">
           <ThemeBtn active={currentTheme === 'deep'} onClick={() => setTheme('deep')} icon={Moon} />
           <ThemeBtn active={currentTheme === 'light'} onClick={() => setTheme('light')} icon={Sun} />
        </div>

        <div className="text-right border-l border-white/10 pl-8">
           <p className="text-[10px] font-black text-white uppercase mono">{userName}</p>
           <p className="text-[7px] text-[#0047ba] font-black uppercase tracking-widest mt-1">
              {role} {role === UserRole.GLOBAL_ADMIN ? '// MASTER' : '// OPERACIONAL'}
           </p>
        </div>
        
        <button onClick={onLogout} className="p-3 bg-red-600/10 hover:bg-red-600 text-red-600 hover:text-white transition-all rounded-xl">
           <LogOut size={18} />
        </button>
      </div>
      
      <div className="absolute bottom-0 left-0 w-full h-[2px] hazard-strip opacity-30"></div>
    </nav>
  );
};

const ThemeBtn = ({ active, onClick, icon: Icon }: any) => (
  <button onClick={onClick} className={`p-2 rounded transition-all ${active ? 'bg-[#0047ba] text-white' : 'text-white/20 hover:text-white'}`}>
    <Icon size={14} />
  </button>
);

export default HeaderNav;
