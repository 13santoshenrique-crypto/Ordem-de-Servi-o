
import React, { useState, useRef, useEffect } from 'react';
import { 
  LayoutDashboard, Cpu, Package, DollarSign,
  LogOut, Drill, Settings, Bell, ShieldCheck, FileBarChart, Menu, X, Server, Calendar, Building2, ChevronDown, Search, Headphones, Check, Clock, AlertTriangle, AlertCircle, Info
} from 'lucide-react';
import { UserRole } from './types';
import { useApp } from './context/AppContext';

const HeaderNav: React.FC<any> = ({ 
  activeTab, setActiveTab, role, userName, onLogout, onOpenSearch
}) => {
  const { notifications, units, activeUnitId, setActiveUnitId, markAsRead, markAllAsRead } = useApp();
  const [showNotifications, setShowNotifications] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [showUnitSwitcher, setShowUnitSwitcher] = useState(false);
  const notificationRef = useRef<HTMLDivElement>(null);

  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, roles: [UserRole.GLOBAL_ADMIN, UserRole.ADMIN] },
    { id: 'schedule', label: 'Cronograma', icon: Calendar, roles: [UserRole.GLOBAL_ADMIN, UserRole.ADMIN, UserRole.TECHNICIAN] },
    { id: 'history', label: 'Ordens (OS)', icon: Drill, roles: [UserRole.GLOBAL_ADMIN, UserRole.ADMIN, UserRole.TECHNICIAN] },
    { id: 'tst', label: 'TST Compliance', icon: ShieldCheck, roles: [UserRole.GLOBAL_ADMIN, UserRole.ADMIN] },
    { id: 'support', label: 'Suporte Live', icon: Headphones, roles: [UserRole.GLOBAL_ADMIN, UserRole.ADMIN, UserRole.TECHNICIAN] },
    { id: 'assets', label: 'Ativos', icon: Server, roles: [UserRole.GLOBAL_ADMIN, UserRole.ADMIN] },
    { id: 'inventory', label: 'Estoque', icon: Package, roles: [UserRole.GLOBAL_ADMIN, UserRole.ADMIN, UserRole.TECHNICIAN] },
    { id: 'finance', label: 'Financeiro', icon: DollarSign, roles: [UserRole.GLOBAL_ADMIN, UserRole.ADMIN] },
    { id: 'reports', label: 'Relatórios', icon: FileBarChart, roles: [UserRole.GLOBAL_ADMIN, UserRole.ADMIN] },
    { id: 'ai', label: 'IA Industrial', icon: Cpu, roles: [UserRole.GLOBAL_ADMIN, UserRole.ADMIN, UserRole.TECHNICIAN] },
    { id: 'admin', label: 'Governança', icon: Settings, roles: [UserRole.GLOBAL_ADMIN, UserRole.ADMIN] },
  ];

  const currentUnit = units.find(u => u.id === activeUnitId);
  const unreadCount = notifications.filter(n => !n.read).length;

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (notificationRef.current && !notificationRef.current.contains(event.target as Node)) {
        setShowNotifications(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleMobileNav = (tabId: string) => {
    setActiveTab(tabId);
    setIsMobileMenuOpen(false);
  };

  const getNotifIcon = (type: string) => {
    switch (type) {
        case 'critical': return <AlertCircle className="text-red-500" size={16} />;
        case 'warning': return <AlertTriangle className="text-amber-500" size={16} />;
        case 'success': return <Check className="text-emerald-500" size={16} />;
        default: return <Info className="text-blue-500" size={16} />;
    }
  };

  return (
    <nav className="h-16 lg:h-20 bg-white border-b border-slate-200 flex items-center justify-between px-4 lg:px-10 shrink-0 z-[500] relative shadow-sm">
      <div className="flex items-center gap-4 lg:gap-8">
        <button 
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          className="lg:hidden p-2 text-[#1A3673] hover:bg-slate-100 rounded-lg transition-colors"
        >
          {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>

        <div className="flex items-center gap-3">
          <div className="w-8 h-8 lg:w-10 lg:h-10 bg-[#1A3673] flex items-center justify-center rounded-lg shadow-md">
             <div className="font-black text-white text-lg lg:text-xl italic tracking-tighter">A</div>
          </div>
          <div className="leading-none">
            <h1 className="font-extrabold text-sm lg:text-lg tracking-tight text-[#1A3673] uppercase italic">Aviagen</h1>
            <div className="hidden sm:flex items-center gap-1">
               <span className="text-[8px] lg:text-[10px] font-bold text-slate-400 uppercase tracking-widest">Industrial SGI</span>
            </div>
          </div>
        </div>

        <div className="hidden xl:flex items-center border-l border-slate-100 pl-8 relative">
           <button 
             onClick={() => role === UserRole.GLOBAL_ADMIN && setShowUnitSwitcher(!showUnitSwitcher)}
             className={`flex items-center gap-3 px-4 py-2 rounded-xl transition-all ${role === UserRole.GLOBAL_ADMIN ? 'hover:bg-slate-50 cursor-pointer' : 'cursor-default'}`}
           >
              <div className="p-2 bg-blue-50 text-[#1A3673] rounded-lg">
                 <Building2 size={16} />
              </div>
              <div className="text-left">
                 <p className="text-[8px] font-bold text-slate-400 uppercase tracking-widest">Unidade Atual</p>
                 <p className="text-[11px] font-black text-[#1A3673] uppercase tracking-tight flex items-center gap-1">
                   {currentUnit?.name || 'Aviagen'}
                   {role === UserRole.GLOBAL_ADMIN && <ChevronDown size={12} className={`transition-transform ${showUnitSwitcher ? 'rotate-180' : ''}`} />}
                 </p>
              </div>
           </button>

           {showUnitSwitcher && role === UserRole.GLOBAL_ADMIN && (
              <div className="absolute top-full left-8 mt-2 w-64 bg-white rounded-2xl shadow-2xl border border-slate-100 p-2 animate-in slide-in-from-top-2">
                 <p className="px-4 py-2 text-[9px] font-black text-slate-400 uppercase tracking-[0.2em]">Gestão Multi-Unidade</p>
                 {units.map(u => (
                    <button 
                      key={u.id}
                      onClick={() => { setActiveUnitId(u.id); setShowUnitSwitcher(false); }}
                      className={`w-full flex items-center justify-between px-4 py-3 rounded-xl text-left text-[11px] font-bold uppercase transition-all ${activeUnitId === u.id ? 'bg-[#1A3673] text-white' : 'text-slate-600 hover:bg-slate-50'}`}
                    >
                       {u.name}
                       {activeUnitId === u.id && <ShieldCheck size={14} />}
                    </button>
                 ))}
              </div>
           )}
        </div>
      </div>

      <div className="hidden lg:flex items-center gap-1 bg-slate-50 p-1 rounded-xl border border-slate-200">
        {menuItems.map((item) => {
          if (!item.roles.includes(role)) return null;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all ${
                isActive 
                  ? 'bg-[#1A3673] text-white shadow-md' 
                  : 'text-slate-500 hover:text-[#1A3673] hover:bg-slate-100'
              }`}
            >
              <item.icon size={14} className={isActive ? 'text-white' : 'text-slate-400'} />
              <span className="font-bold text-[10px] uppercase tracking-wide">{item.label}</span>
            </button>
          );
        })}
      </div>

      <div className="flex items-center gap-2 lg:gap-6">
        <button onClick={onOpenSearch} className="p-2 text-slate-400 hover:text-[#1A3673] transition-colors">
            <Search size={20} />
        </button>

        <div className="relative" ref={notificationRef}>
          <button 
            onClick={() => setShowNotifications(!showNotifications)} 
            className={`p-2 text-slate-400 hover:text-[#1A3673] relative transition-colors ${showNotifications ? 'text-[#1A3673]' : ''}`}
          >
             <Bell size={20} />
             {unreadCount > 0 && (
               <span className="absolute top-1 right-1 w-4 h-4 bg-[#E31B23] text-white text-[8px] font-black flex items-center justify-center rounded-full border-2 border-white animate-in zoom-in">
                 {unreadCount > 9 ? '+9' : unreadCount}
               </span>
             )}
          </button>

          {showNotifications && (
            <div className="absolute top-full right-0 mt-3 w-80 bg-white rounded-[2rem] shadow-[0_20px_50px_rgba(0,0,0,0.1)] border border-slate-100 overflow-hidden animate-in slide-in-from-top-2 duration-300">
               <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
                  <h3 className="text-xs font-black text-slate-900 uppercase tracking-widest">Notificações SGI</h3>
                  {unreadCount > 0 && (
                    <button onClick={markAllAsRead} className="text-[9px] font-black text-[#1A3673] uppercase tracking-widest hover:text-blue-700">Lidas</button>
                  )}
               </div>
               <div className="max-h-96 overflow-y-auto custom-scrollbar">
                  {notifications.length === 0 ? (
                    <div className="p-10 text-center space-y-3 opacity-30">
                       <Bell size={32} className="mx-auto text-slate-400" />
                       <p className="text-[10px] font-black uppercase tracking-widest">Nenhuma atividade</p>
                    </div>
                  ) : (
                    notifications.map(n => (
                      <div 
                        key={n.id} 
                        onClick={() => markAsRead(n.id)}
                        className={`p-5 border-b border-slate-50 last:border-none cursor-pointer transition-all hover:bg-slate-50 relative ${!n.read ? 'bg-blue-50/20' : ''}`}
                      >
                         {!n.read && <div className="absolute left-0 top-0 bottom-0 w-1 bg-[#1A3673]"></div>}
                         <div className="flex gap-4">
                            <div className="mt-1">{getNotifIcon(n.type)}</div>
                            <div className="flex-1">
                               <p className="text-xs font-black text-slate-900 uppercase leading-none mb-1">{n.title}</p>
                               <p className="text-[10px] text-slate-500 font-medium leading-relaxed">{n.message}</p>
                               <div className="flex items-center gap-1.5 mt-2 text-slate-300">
                                  <Clock size={10} />
                                  <span className="text-[8px] font-bold uppercase">{n.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                               </div>
                            </div>
                         </div>
                      </div>
                    ))
                  )}
               </div>
               {notifications.length > 0 && (
                 <div className="p-3 bg-slate-50/80 text-center">
                    <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Monitoramento Aviagen em Tempo Real</p>
                 </div>
               )}
            </div>
          )}
        </div>
        
        <div className="hidden sm:flex flex-col items-end leading-none border-l border-slate-200 pl-6">
          <p className="text-xs font-bold text-slate-800 uppercase tracking-wide">{userName.split(' ')[0]}</p>
          <div className="flex items-center gap-1 mt-1">
             <ShieldCheck size={10} className={role === UserRole.GLOBAL_ADMIN ? 'text-emerald-500' : 'text-[#E31B23]'} />
             <p className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">
               {role === UserRole.GLOBAL_ADMIN ? 'Diretoria' : role === UserRole.ADMIN ? 'Supervisor' : 'Manutenção'}
             </p>
          </div>
        </div>

        <button onClick={onLogout} className="p-2 text-slate-400 hover:text-[#E31B23] hover:bg-red-50 rounded-lg transition-all" title="Sair">
          <LogOut size={20} />
        </button>
      </div>

      {isMobileMenuOpen && (
        <div className="absolute top-16 left-0 w-full bg-white border-b border-slate-200 shadow-xl lg:hidden flex flex-col p-4 gap-2 animate-in slide-in-from-top-2 z-[999]">
           <div className="p-4 bg-slate-50 rounded-xl mb-2 flex justify-between items-center">
              <div>
                 <p className="text-[9px] font-black text-slate-400 uppercase">Unidade</p>
                 <p className="text-xs font-black text-[#1A3673] uppercase">{currentUnit?.name}</p>
              </div>
           </div>
           {menuItems.map((item) => {
              if (!item.roles.includes(role)) return null;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => handleMobileNav(item.id)}
                  className={`flex items-center gap-4 px-4 py-4 rounded-xl transition-all w-full text-left ${
                    isActive 
                      ? 'bg-[#1A3673] text-white shadow-md' 
                      : 'text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  <item.icon size={20} className={isActive ? 'text-white' : 'text-slate-400'} />
                  <span className="font-black text-sm uppercase tracking-wide">{item.label}</span>
                </button>
              );
            })}
        </div>
      )}
    </nav>
  );
};

export default HeaderNav;
