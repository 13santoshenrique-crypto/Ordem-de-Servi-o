
import React, { useState, useRef, useEffect } from 'react';
import { 
  LayoutDashboard, Cpu, Package, DollarSign,
  LogOut, Drill, Settings, Bell, ShieldCheck, FileBarChart, Menu, X, Server, Calendar, Building2, ChevronDown, Search, Headphones, Check, Clock, AlertTriangle, AlertCircle, Info, ListTodo
} from 'lucide-react';
import { UserRole } from '../types';
import { useApp } from '../context/AppContext';

const HeaderNav: React.FC<any> = ({ 
  activeTab, setActiveTab, role, userName, onLogout, onOpenSearch
}) => {
  const { notifications, units, activeUnitId, setActiveUnitId, markAsRead, markAllAsRead } = useApp();
  const [showNotifications, setShowNotifications] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [showUnitSwitcher, setShowUnitSwitcher] = useState(false);
  const notificationRef = useRef<HTMLDivElement>(null);

  // Refs e State para Drag-to-Scroll
  const scrollRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [scrollLeft, setScrollLeft] = useState(0);

  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, roles: [UserRole.GLOBAL_ADMIN, UserRole.ADMIN] },
    { id: 'schedule', label: 'Cronograma', icon: Calendar, roles: [UserRole.GLOBAL_ADMIN] },
    { id: 'history', label: 'Ordens', icon: Drill, roles: [UserRole.GLOBAL_ADMIN, UserRole.ADMIN, UserRole.MAINTENANCE_OFFICER, UserRole.UTILITIES_OFFICER] },
    { id: 'plans', label: '5W2H', icon: ListTodo, roles: [UserRole.GLOBAL_ADMIN, UserRole.ADMIN] },
    { id: 'tst', label: 'TST', icon: ShieldCheck, roles: [UserRole.GLOBAL_ADMIN, UserRole.ADMIN] },
    { id: 'assets', label: 'Ativos', icon: Server, roles: [UserRole.GLOBAL_ADMIN, UserRole.ADMIN] },
    { id: 'inventory', label: 'Estoque', icon: Package, roles: [UserRole.GLOBAL_ADMIN, UserRole.ADMIN, UserRole.MAINTENANCE_OFFICER, UserRole.UTILITIES_OFFICER] },
    { id: 'finance', label: 'Financeiro', icon: DollarSign, roles: [UserRole.GLOBAL_ADMIN] },
    { id: 'reports', label: 'Relatórios', icon: FileBarChart, roles: [UserRole.GLOBAL_ADMIN] },
    { id: 'settings', label: 'Perfil', icon: Settings, roles: [UserRole.GLOBAL_ADMIN, UserRole.ADMIN, UserRole.MAINTENANCE_OFFICER, UserRole.UTILITIES_OFFICER] },
    { id: 'admin', label: 'Admin', icon: ShieldCheck, roles: [UserRole.GLOBAL_ADMIN, UserRole.ADMIN] },
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

  // Funções de Drag-to-Scroll
  const handleMouseDown = (e: React.MouseEvent) => {
    if (!scrollRef.current) return;
    setIsDragging(true);
    setStartX(e.pageX - scrollRef.current.offsetLeft);
    setScrollLeft(scrollRef.current.scrollLeft);
  };

  const handleMouseLeave = () => {
    setIsDragging(false);
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging || !scrollRef.current) return;
    e.preventDefault();
    const x = e.pageX - scrollRef.current.offsetLeft;
    const walk = (x - startX) * 2; // Velocidade do scroll
    scrollRef.current.scrollLeft = scrollLeft - walk;
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
    <nav className="h-16 lg:h-20 bg-white/80 backdrop-blur-md border-b border-slate-200 flex items-center justify-between px-4 lg:px-8 shrink-0 z-[500] relative shadow-sm sticky top-0">
      <style>{`
        .hide-scrollbar::-webkit-scrollbar { display: none; }
        .hide-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>

      {/* Esquerda: Logo e Unidade */}
      <div className="flex items-center gap-4 lg:gap-6 shrink-0">
        <button 
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          className="xl:hidden p-2 text-[#1A3673] hover:bg-slate-50 rounded-xl transition-colors"
        >
          {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>

        <div className="flex items-center gap-3 pr-6 border-r border-slate-100">
          <div className="w-9 h-9 bg-[#1A3673] flex items-center justify-center rounded-xl shadow-md shadow-blue-900/20">
             <div className="font-black text-white text-lg italic tracking-tighter">A</div>
          </div>
          <div className="leading-none hidden sm:block">
            <h1 className="font-extrabold text-lg tracking-tight text-[#1A3673] uppercase italic">Aviagen</h1>
          </div>
        </div>

        <div className="hidden md:flex items-center relative">
           <div className="flex items-center gap-3 px-3 py-1.5 rounded-xl transition-all border border-transparent">
              <div className="p-1.5 bg-blue-50 text-[#1A3673] rounded-lg">
                 <Building2 size={16} />
              </div>
              <div className="text-left">
                 <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Unidade</p>
                 <p className="text-xs font-black text-[#1A3673] uppercase tracking-tight flex items-center gap-1">
                   {currentUnit?.name || 'Aviagen'}
                 </p>
              </div>
           </div>
        </div>
      </div>

      {/* Centro: Menu Horizontal (Arrastável e Sem Scrollbar) */}
      <div 
        ref={scrollRef}
        onMouseDown={handleMouseDown}
        onMouseLeave={handleMouseLeave}
        onMouseUp={handleMouseUp}
        onMouseMove={handleMouseMove}
        className={`hidden xl:flex flex-1 items-center gap-2 overflow-x-auto mx-6 px-2 mask-linear-fade hide-scrollbar cursor-grab ${isDragging ? 'cursor-grabbing' : ''}`}
      >
        {menuItems.map((item) => {
          if (!item.roles.includes(role)) return null;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => !isDragging && setActiveTab(item.id)} // Evita clique acidental ao arrastar
              className={`flex items-center gap-2 px-4 py-2.5 rounded-full transition-all whitespace-nowrap text-[11px] font-bold uppercase tracking-wide border select-none ${
                isActive 
                  ? 'bg-[#1A3673] text-white border-[#1A3673] shadow-md shadow-blue-900/20 transform scale-[1.02]' 
                  : 'text-slate-500 border-transparent hover:text-[#1A3673] hover:bg-slate-50'
              }`}
            >
              <item.icon size={16} className={isActive ? 'text-white' : 'text-slate-400 group-hover:text-[#1A3673]'} />
              <span>{item.label}</span>
            </button>
          );
        })}
      </div>

      {/* Direita: Ações e Perfil */}
      <div className="flex items-center gap-3 lg:gap-5 pl-6 border-l border-slate-100 shrink-0">
        <button onClick={onOpenSearch} className="p-2.5 text-slate-400 hover:text-[#1A3673] hover:bg-slate-50 rounded-xl transition-all">
            <Search size={20} />
        </button>

        <div className="relative" ref={notificationRef}>
          <button 
            onClick={() => setShowNotifications(!showNotifications)} 
            className={`p-2.5 text-slate-400 hover:text-[#1A3673] relative transition-colors rounded-xl hover:bg-slate-50 ${showNotifications ? 'text-[#1A3673] bg-blue-50' : ''}`}
          >
             <Bell size={20} />
             {unreadCount > 0 && (
               <span className="absolute top-2 right-2 w-2.5 h-2.5 bg-[#E31B23] rounded-full border-2 border-white"></span>
             )}
          </button>

          {showNotifications && (
            <div className="absolute top-full right-0 mt-4 w-80 bg-white rounded-2xl shadow-2xl border border-slate-100 overflow-hidden animate-in slide-in-from-top-2 duration-300 z-[600]">
               <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/80 backdrop-blur-sm">
                  <h3 className="text-[10px] font-black text-slate-900 uppercase tracking-widest">Notificações</h3>
                  {unreadCount > 0 && (
                    <button onClick={markAllAsRead} className="text-[9px] font-bold text-[#1A3673] hover:underline">Limpar Tudo</button>
                  )}
               </div>
               <div className="max-h-80 overflow-y-auto custom-scrollbar">
                  {notifications.length === 0 ? (
                    <div className="p-8 text-center text-slate-400 text-xs font-medium">Sem novas notificações</div>
                  ) : (
                    notifications.map(n => (
                      <div 
                        key={n.id} 
                        onClick={() => markAsRead(n.id)}
                        className={`p-4 border-b border-slate-50 cursor-pointer hover:bg-slate-50 transition-colors ${!n.read ? 'bg-blue-50/30' : ''}`}
                      >
                         <div className="flex gap-3">
                            <div className="mt-0.5">{getNotifIcon(n.type)}</div>
                            <div className="flex-1">
                               <p className="text-[11px] font-black text-slate-800 uppercase mb-1 leading-tight">{n.title}</p>
                               <p className="text-[10px] text-slate-500 leading-relaxed">{n.message}</p>
                               <span className="text-[9px] text-slate-300 font-bold mt-1 block">{n.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                            </div>
                         </div>
                      </div>
                    ))
                  )}
               </div>
            </div>
          )}
        </div>
        
        <div className="hidden md:flex flex-col items-end leading-none select-none">
          <p className="text-xs font-bold text-slate-800 uppercase">{userName?.split(' ')[0] || 'Usuário'}</p>
          <div className="flex items-center gap-1 mt-0.5">
             <div className={`w-1.5 h-1.5 rounded-full ${role === UserRole.GLOBAL_ADMIN ? 'bg-[#E31B23]' : 'bg-emerald-500'}`}></div>
             <p className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">
               {role === UserRole.GLOBAL_ADMIN ? 'Diretoria' : role === UserRole.ADMIN ? 'Gestão' : 'Operacional'}
             </p>
          </div>
        </div>

        <button onClick={onLogout} className="p-2.5 text-slate-300 hover:text-[#E31B23] hover:bg-red-50 rounded-xl transition-all" title="Sair do Sistema">
          <LogOut size={18} />
        </button>
      </div>

      {/* Mobile Menu (Drawer) */}
      {isMobileMenuOpen && (
        <div className="absolute top-[63px] left-0 w-full bg-white border-b border-slate-200 shadow-2xl xl:hidden flex flex-col p-2 gap-1 animate-in slide-in-from-top-2 z-[999] max-h-[85vh] overflow-y-auto">
           {menuItems.map((item) => {
              if (!item.roles.includes(role)) return null;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => handleMobileNav(item.id)}
                  className={`flex items-center gap-4 px-4 py-3.5 rounded-xl transition-all w-full text-left border ${
                    isActive 
                      ? 'bg-[#1A3673] text-white border-[#1A3673] shadow-md' 
                      : 'text-slate-600 hover:bg-slate-50 border-transparent'
                  }`}
                >
                  <item.icon size={18} className={isActive ? 'text-white' : 'text-slate-400'} />
                  <span className="font-black text-xs uppercase tracking-wide">{item.label}</span>
                </button>
              );
            })}
        </div>
      )}
    </nav>
  );
};

export default HeaderNav;
