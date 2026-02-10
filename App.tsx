
import React, { useState, useEffect, useCallback } from 'react';
import { User, ServiceOrder, Unit, UserRole } from './types';
import { AppProvider, useApp } from './context/AppContext';
import HeaderNav from './components/HeaderNav';
import Dashboard from './components/Dashboard';
import OSHistory from './components/OSHistory';
import IAModule from './components/IAModule';
import AdminPanel from './components/AdminPanel';
import Login from './components/Login';
import BoardReports from './components/BoardReports';
import Inventory from './components/Inventory';
import FinancialControl from './components/FinancialControl';
import AssetsRegistry from './components/AssetsRegistry';
import MaintenanceSchedule from './components/MaintenanceSchedule'; 
import TSTAudit from './components/TSTAudit';
import FiveWTwoH from './components/FiveWTwoH';
import CommandPalette from './components/CommandPalette';
import ComplianceAlert from './components/ComplianceAlert';
import LiveSupport from './components/LiveSupport';
import ErrorBoundary from './components/ErrorBoundary';
import { db } from './services/database';
import { Globe, ShieldCheck } from 'lucide-react';

const MainApp: React.FC = () => {
  const { 
    orders, setOrders, users, setUsers, inventory, setInventory, 
    expenses, setExpenses, units, setUnits, assets, setAssets, 
    recurringTasks, setRecurringTasks, tstAudit, setTstAudit,
    actionPlans, setActionPlans,
    addNotification, loading, logAction, currentUser, setCurrentUser,
    activeUnitId, setActiveUnitId
  } = useApp();

  const [activeTab, setActiveTab] = useState('dashboard');
  const [preFilledOSData, setPreFilledOSData] = useState<any>(null);
  const [isSessionChecked, setIsSessionChecked] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  // Validação de Sessão Inicial
  useEffect(() => {
    const savedUser = localStorage.getItem('aviagen_session_user');
    const savedUnit = localStorage.getItem('aviagen_active_unit');
    if (savedUser) {
      try {
        const parsedUser = JSON.parse(savedUser);
        setCurrentUser(parsedUser);
        if (savedUnit) setActiveUnitId(savedUnit);
        else if (parsedUser.unitId) setActiveUnitId(parsedUser.unitId);
      } catch (e) { localStorage.removeItem('aviagen_session_user'); }
    }
    setIsSessionChecked(true);
  }, [setCurrentUser, setActiveUnitId]);

  // Validação de Integridade da Unidade Ativa
  useEffect(() => {
    if (!loading && units.length > 0 && activeUnitId) {
      const isValidUnit = units.find(u => u.id === activeUnitId);
      if (!isValidUnit) {
        // Se a unidade salva não existe mais, reverte para a primeira disponível
        const fallbackId = units[0].id;
        setActiveUnitId(fallbackId);
        localStorage.setItem('aviagen_active_unit', fallbackId);
        console.warn(`Unidade ativa inválida detectada. Revertendo para ${fallbackId}`);
      }
    }
  }, [loading, units, activeUnitId, setActiveUnitId]);

  // Auto-Save
  useEffect(() => {
    if (!loading && isSessionChecked) {
      db.saveOrders(orders);
      db.saveInventory(inventory);
      db.saveUsers(users);
      db.saveExpenses(expenses);
      db.saveAssets(assets);
      db.saveUnits(units);
      db.saveRecurringTasks(recurringTasks);
      db.saveTSTAudit(tstAudit);
      db.saveActionPlans(actionPlans);
    }
  }, [orders, inventory, users, expenses, assets, units, recurringTasks, tstAudit, actionPlans, loading, isSessionChecked]);

  const activeUnit = units.find(u => u.id === activeUnitId) || units[0];

  const handleLogin = (user: User, selectedUnitId: string) => {
    localStorage.setItem('aviagen_session_user', JSON.stringify(user));
    localStorage.setItem('aviagen_active_unit', selectedUnitId);
    setCurrentUser(user);
    setActiveUnitId(selectedUnitId);
    logAction("LOGIN", `Acesso validado na unidade ${selectedUnitId}.`, user);
  };

  const handleLogout = () => {
    if (currentUser) logAction("LOGOUT", `Usuário encerrou sessão.`, currentUser);
    localStorage.removeItem('aviagen_session_user');
    localStorage.removeItem('aviagen_active_unit');
    setCurrentUser(null);
  };

  const handleUpdateOrder = useCallback((id: string, updates: Partial<ServiceOrder>, partsUsed?: any[]) => {
    setOrders(prev => prev.map(o => o.id === id ? { ...o, ...updates } : o));
    if (partsUsed && partsUsed.length > 0) {
      setInventory(prevInv => {
        const newInv = [...prevInv];
        partsUsed.forEach(part => {
          const itemIdx = newInv.findIndex(i => i.id === part.itemId);
          if (itemIdx !== -1) {
            const newStock = Math.max(0, newInv[itemIdx].stock - part.quantity);
            newInv[itemIdx] = { ...newInv[itemIdx], stock: newStock };
            if (newStock <= newInv[itemIdx].minStock) {
              addNotification({ type: 'critical', title: 'Estoque Crítico', message: `Item: ${newInv[itemIdx].name}.` });
            }
          }
        });
        return newInv;
      });
    }
  }, [setOrders, setInventory, addNotification]);

  const handleNavigate = (tab: string, data?: any) => {
    setActiveTab(tab);
    if (data) setPreFilledOSData(data);
    setIsSearchOpen(false);
  };

  if (loading || !isSessionChecked) return (
    <div className="h-screen bg-slate-50 flex flex-col items-center justify-center gap-6">
       <div className="w-16 h-16 bg-[#1A3673] rounded-2xl animate-bounce flex items-center justify-center text-white text-2xl font-black italic shadow-2xl">A</div>
       <p className="font-black uppercase text-[10px] tracking-[0.5em] text-[#1A3673]">Iniciando SGI Aviagen...</p>
    </div>
  );

  if (!currentUser) return <Login onLogin={handleLogin} users={users} />;

  return (
    <div className="flex flex-col h-screen overflow-hidden font-sans text-slate-900 bg-[#F8FAFC]">
      <ErrorBoundary>
        <ComplianceAlert />
        <CommandPalette isOpen={isSearchOpen} onClose={() => setIsSearchOpen(false)} onNavigate={handleNavigate} />
        <HeaderNav 
          activeTab={activeTab} setActiveTab={setActiveTab} role={currentUser.role} 
          userName={currentUser.name} onLogout={handleLogout} onOpenSearch={() => setIsSearchOpen(true)}
        />
        <main className="flex-1 overflow-y-auto p-4 lg:p-10 custom-scrollbar">
          <div className="max-w-[1600px] mx-auto min-h-full flex flex-col">
            <div className="flex-1">
                {activeTab === 'dashboard' && <Dashboard unit={activeUnit} currentUnitId={activeUnitId} role={currentUser.role} onRequestNewOS={() => setActiveTab('history')} />}
                {activeTab === 'schedule' && <MaintenanceSchedule onGenerateOS={(data) => handleNavigate('history', data)} />}
                {activeTab === 'history' && (
                  <OSHistory 
                    orders={orders} technicians={users} inventory={inventory} 
                    onUpdate={handleUpdateOrder} 
                    onAddOS={(d) => setOrders(prev => [{...d, unitId: activeUnitId, id: `OS-${activeUnitId}-${Date.now()}`}, ...prev])} 
                    role={currentUser.role} currentUser={currentUser}
                    preFilledData={preFilledOSData} clearPreFilled={() => setPreFilledOSData(null)}
                  />
                )}
                {activeTab === 'tst' && <TSTAudit />}
                {activeTab === 'plans' && <FiveWTwoH />}
                {activeTab === 'support' && <LiveSupport />}
                {activeTab === 'assets' && <AssetsRegistry assets={assets.filter(a => a.unitId === activeUnitId)} setAssets={setAssets} />}
                {activeTab === 'inventory' && <Inventory inventory={inventory.filter(i => i.unitId === activeUnitId)} setInventory={setInventory} />}
                {activeTab === 'finance' && <FinancialControl expenses={expenses.filter(e => e.unitId === activeUnitId)} onAddExpense={(d) => setExpenses(prev => [{ ...d, id: `exp-${Date.now()}` }, ...prev])} unit={activeUnit} orders={orders.filter(o => o.unitId === activeUnitId)} />}
                {activeTab === 'reports' && <BoardReports orders={orders.filter(o => o.unitId === activeUnitId)} unit={activeUnit} units={units} />}
                {activeTab === 'ai' && <IAModule orders={orders.filter(o => o.unitId === activeUnitId)} users={users} role={currentUser.role} onGenerateOS={(data) => handleNavigate('history', data)} />}
                {activeTab === 'admin' && (
                  <AdminPanel 
                    users={users} units={units} 
                    onAddUser={(d) => setUsers(prev => [{ ...d, id: `u-${Date.now()}` }, ...prev])} 
                    onUpdateUser={(id, up) => setUsers(prev => prev.map(u => u.id === id ? {...u, ...up} : u))} 
                    onDeleteUser={(id) => setUsers(prev => prev.filter(u => u.id !== id))} 
                    onAddUnit={(d) => setUnits(prev => [...prev, {...d, id: `u-${Date.now()}`}])} 
                    onUpdateUnit={(id, up) => setUnits(prev => prev.map(u => u.id === id ? {...u, ...up} : u))} 
                    onDeleteUnit={(id) => setUnits(prev => prev.filter(u => u.id !== id))} 
                    currentUser={currentUser} 
                  />
                )}
            </div>

            <footer className="mt-20 mb-10 pt-10 border-t border-slate-200 flex flex-col md:flex-row justify-between items-center gap-6 opacity-60 hover:opacity-100 transition-opacity duration-300">
               <div className="flex items-center gap-3">
                  <div className="p-2 bg-slate-100 rounded-lg text-slate-400">
                     <Globe size={14} />
                  </div>
                  <p className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400">Aviagen Global Governance • Ecosystem v2.7.2</p>
               </div>
               
               <div className="flex items-center gap-4">
                  <div className="h-4 w-px bg-slate-200 hidden md:block"></div>
                  <p className="text-[10px] font-black uppercase tracking-[0.1em] text-slate-500">
                     Criado e desenvolvido por <span className="text-[#1A3673] italic font-black">Emerson Henrique 2026</span>
                  </p>
                  <div className="flex items-center gap-1.5 px-3 py-1 bg-emerald-50 text-emerald-600 rounded-lg border border-emerald-100">
                     <ShieldCheck size={12} />
                     <span className="text-[8px] font-black uppercase tracking-widest">Acesso Seguro</span>
                  </div>
               </div>
            </footer>
          </div>
        </main>
      </ErrorBoundary>
    </div>
  );
};

const App: React.FC = () => (
  <AppProvider>
    <MainApp />
  </AppProvider>
);

export default App;
