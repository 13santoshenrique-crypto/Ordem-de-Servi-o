
import React from 'react';
import { 
  LayoutDashboard, Cpu, Package, DollarSign,
  Drill, Settings, ShieldCheck, FileBarChart, Server, Calendar, Headphones, ListTodo, ChevronRight, Activity, X
} from 'lucide-react';
import { UserRole } from '../types';

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  role: UserRole;
  isOpen: boolean;
  onClose: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ activeTab, setActiveTab, role, isOpen, onClose }) => {
  const menuGroups = [
    {
      label: 'Operação',
      items: [
        { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, roles: [UserRole.GLOBAL_ADMIN, UserRole.ADMIN] },
        { id: 'schedule', label: 'Cronograma', icon: Calendar, roles: [UserRole.GLOBAL_ADMIN, UserRole.ADMIN, UserRole.MAINTENANCE_OFFICER, UserRole.UTILITIES_OFFICER] },
        { id: 'history', label: 'Ordens (OS)', icon: Drill, roles: [UserRole.GLOBAL_ADMIN, UserRole.ADMIN, UserRole.MAINTENANCE_OFFICER, UserRole.UTILITIES_OFFICER] },
      ]
    },
    {
      label: 'Estratégia',
      items: [
        { id: 'plans', label: 'Plano 5W2H', icon: ListTodo, roles: [UserRole.GLOBAL_ADMIN, UserRole.ADMIN] },
        { id: 'tst', label: 'TST Compliance', icon: ShieldCheck, roles: [UserRole.GLOBAL_ADMIN, UserRole.ADMIN] },
        { id: 'support', label: 'Suporte Live', icon: Headphones, roles: [UserRole.GLOBAL_ADMIN, UserRole.ADMIN, UserRole.MAINTENANCE_OFFICER, UserRole.UTILITIES_OFFICER] },
      ]
    },
    {
      label: 'Administrativo',
      items: [
        { id: 'assets', label: 'Ativos', icon: Server, roles: [UserRole.GLOBAL_ADMIN, UserRole.ADMIN] },
        { id: 'inventory', label: 'Estoque', icon: Package, roles: [UserRole.GLOBAL_ADMIN, UserRole.ADMIN, UserRole.MAINTENANCE_OFFICER, UserRole.UTILITIES_OFFICER] },
        { id: 'finance', label: 'Financeiro', icon: DollarSign, roles: [UserRole.GLOBAL_ADMIN, UserRole.ADMIN] },
      ]
    },
    {
      label: 'Configurações',
      items: [
        { id: 'reports', label: 'Relatórios', icon: FileBarChart, roles: [UserRole.GLOBAL_ADMIN, UserRole.ADMIN] },
        { id: 'ai', label: 'IA Industrial', icon: Cpu, roles: [UserRole.GLOBAL_ADMIN, UserRole.ADMIN, UserRole.MAINTENANCE_OFFICER, UserRole.UTILITIES_OFFICER] },
        { id: 'admin', label: 'Governança', icon: Settings, roles: [UserRole.GLOBAL_ADMIN, UserRole.ADMIN] },
      ]
    }
  ];

  return (
    <>
      {isOpen && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-[1000] lg:hidden" onClick={onClose} />
      )}

      <aside className={`
        fixed inset-y-0 left-0 z-[1001] w-64 bg-[#1A3673] text-white transition-transform duration-300 ease-in-out lg:relative lg:translate-x-0
        ${isOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        <div className="flex flex-col h-full">
          <div className="p-6 border-b border-white/10 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-white rounded flex items-center justify-center">
                <Activity className="text-[#1A3673]" size={18} />
              </div>
              <h2 className="font-bold text-lg tracking-tight uppercase">SGI Aviagen</h2>
            </div>
            <button onClick={onClose} className="lg:hidden text-white/50 hover:text-white">
              <X size={20} />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto custom-scrollbar py-4 px-3 space-y-6">
            {menuGroups.map((group, gIdx) => {
              const visibleItems = group.items.filter(item => item.roles.includes(role));
              if (visibleItems.length === 0) return null;

              return (
                <div key={gIdx}>
                  <h3 className="px-3 mb-2 text-[10px] font-bold text-white/40 uppercase tracking-widest">{group.label}</h3>
                  <div className="space-y-1">
                    {visibleItems.map((item) => {
                      const isActive = activeTab === item.id;
                      return (
                        <button
                          key={item.id}
                          onClick={() => {
                            setActiveTab(item.id);
                            if (window.innerWidth < 1024) onClose();
                          }}
                          className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg transition-colors text-sm font-medium ${
                            isActive 
                              ? 'bg-white/10 text-white' 
                              : 'text-white/70 hover:text-white hover:bg-white/5'
                          }`}
                        >
                          <div className="flex items-center gap-3">
                            <item.icon size={18} />
                            <span>{item.label}</span>
                          </div>
                          {isActive && <ChevronRight size={14} />}
                        </button>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>

          <div className="p-4 border-t border-white/10">
             <p className="text-[10px] text-white/30 font-bold uppercase tracking-tighter">Versão 2.9.5-STD</p>
          </div>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
