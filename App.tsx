
import React, { useState, useEffect } from 'react';
import { User, ServiceOrder, Unit, UserRole, OSStatus } from './types';
import { AppProvider, useApp } from './context/AppContext';
import HeaderNav from './components/HeaderNav';
import Dashboard from './components/Dashboard';
import OSHistory from './components/OSHistory';
import AdminPanel from './components/AdminPanel';
import Settings from './components/Settings';
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
import ErrorBoundary from './components/ErrorBoundary';
import { DownloadPrompt } from './components/DownloadPrompt';
import { ProactiveAlertSystem } from './components/ProactiveAlertSystem';
import ApiKeySelector from './components/ApiKeySelector';
import { db } from './services/database';
import { LUZIANIA_UNIT_ID } from './constants';

const MainApp: React.FC = () => {
  const { 
    orders, setOrders, users, setUsers, inventory, setInventory, 
    expenses, setExpenses, units, setUnits, assets, setAssets, 
    recurringTasks, setRecurringTasks, tstAudit, setTstAudit,
    actionPlans, setActionPlans, resetRequests,
    addNotification, loading, logAction, currentUser, setCurrentUser,
    activeUnitId, setActiveUnitId
  } = useApp();

  const [activeTab, setActiveTab] = useState('dashboard');
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isSessionChecked, setIsSessionChecked] = useState(false);
  const [isApiKeySelected, setIsApiKeySelected] = useState(false);

  useEffect(() => {
    const checkApiKey = async () => {
      if (window.aistudio && typeof window.aistudio.hasSelectedApiKey === 'function') {
        const selected = await window.aistudio.hasSelectedApiKey();
        setIsApiKeySelected(selected);
      } else {
        setIsApiKeySelected(true);
      }
    };
    checkApiKey();
  }, []);

  useEffect(() => {
    const savedUser = localStorage.getItem('aviagen_session_user');
    const savedUnit = localStorage.getItem('aviagen_active_unit');
    if (savedUser) {
      try {
        const parsedUser = JSON.parse(savedUser);
        setCurrentUser(parsedUser);
        if (savedUnit) setActiveUnitId(savedUnit);
      } catch (e) { localStorage.removeItem('aviagen_session_user'); }
    }
    setIsSessionChecked(true);
  }, [setCurrentUser, setActiveUnitId]);

  useEffect(() => {
    if (!loading && isSessionChecked) {
      const timer = setTimeout(() => {
        db.saveOrders(orders); db.saveInventory(inventory); db.saveUsers(users);
        db.saveExpenses(expenses); db.saveAssets(assets); db.saveUnits(units);
        db.saveRecurringTasks(recurringTasks); db.saveTSTAudit(tstAudit); db.saveActionPlans(actionPlans);
        db.saveResetRequests(resetRequests);
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [orders, inventory, users, expenses, assets, units, recurringTasks, tstAudit, actionPlans, resetRequests, loading, isSessionChecked]);

  const handleLogout = () => {
    localStorage.removeItem('aviagen_session_user');
    localStorage.removeItem('aviagen_active_unit');
    setCurrentUser(null);
  };

  // --- LÓGICA CORE DE NEGÓCIO ---
  const handleCreateOS = (formData: any) => {
    // Garantir que a OS tenha um ID único e esteja vinculada à unidade ativa
    const newOS: ServiceOrder = {
      ...formData,
      id: formData.id || `OS-LHZ-${Date.now()}`,
      unitId: activeUnitId || LUZIANIA_UNIT_ID,
      status: formData.status || OSStatus.OPEN,
      timeSpent: formData.timeSpent || 0
    };

    // 1. Adicionar a Ordem ao Histórico
    setOrders(prev => [newOS, ...prev]);

    // 2. Baixa Automática de Estoque (100% Integração)
    if (newOS.partsUsed && newOS.partsUsed.length > 0) {
        let itemsUpdatedCount = 0;
        setInventory(prevInventory => {
            return prevInventory.map(item => {
                const usedPart = newOS.partsUsed?.find(p => p.itemId === item.id);
                if (usedPart) {
                    itemsUpdatedCount++;
                    // Evita estoque negativo
                    return { ...item, stock: Math.max(0, item.stock - usedPart.quantity) };
                }
                return item;
            });
        });

        if (itemsUpdatedCount > 0) {
            addNotification({
                type: 'info',
                title: 'Almoxarifado Atualizado',
                message: `Baixa automática realizada em ${itemsUpdatedCount} itens do estoque.`
            });
        }
    }
    
    // Log de Auditoria
    if (currentUser) {
        logAction('OS_CREATED', `Nova OS #${newOS.id} criada para o ativo ${newOS.assetId || 'Geral'}.`, currentUser);
    }
  };

  const activeUnit = units.find(u => u.id === activeUnitId) || units[0];

  if (loading || !isSessionChecked) return (
    <div className="h-screen bg-slate-50 flex items-center justify-center">
       <div className="w-12 h-12 bg-[#1A3673] rounded-xl animate-bounce" />
    </div>
  );

  if (!currentUser) return <Login onLogin={(u, unit) => {
    setCurrentUser(u);
    setActiveUnitId(unit);
    localStorage.setItem('aviagen_session_user', JSON.stringify(u));
    localStorage.setItem('aviagen_active_unit', unit);
  }} />;

  return (
    <div className="flex flex-col h-screen bg-[#F8FAFC] overflow-hidden">
      {!isApiKeySelected && <ApiKeySelector onKeySelected={() => setIsApiKeySelected(true)} />}
      <DownloadPrompt />
      <ProactiveAlertSystem />
      <ErrorBoundary>
        <ComplianceAlert />
        <CommandPalette isOpen={isSearchOpen} onClose={() => setIsSearchOpen(false)} onNavigate={(t) => setActiveTab(t)} />
        
        <HeaderNav 
          activeTab={activeTab} 
          setActiveTab={setActiveTab} 
          role={currentUser.role} 
          userName={currentUser.name} 
          onLogout={handleLogout} 
          onOpenSearch={() => setIsSearchOpen(true)} 
        />
        
        <main className="flex-1 overflow-y-auto p-4 lg:p-8 custom-scrollbar">
          <div className="max-w-[1600px] mx-auto pb-20">
            {activeTab === 'dashboard' && <Dashboard unit={activeUnit} onRequestNewOS={() => setActiveTab('history')} onReviewAssets={() => setActiveTab('assets')} />}
            
            {activeTab === 'history' && (
                <OSHistory 
                    orders={orders} 
                    technicians={users} 
                    inventory={inventory} 
                    role={currentUser.role} 
                    currentUser={currentUser} 
                    onUpdate={(id, up) => setOrders(prev => prev.map(o => o.id === id ? {...o, ...up} : o))} 
                    onAddOS={handleCreateOS} 
                />
            )}

            {activeTab === 'schedule' && <MaintenanceSchedule onGenerateOS={(asset) => {
                // Lógica de atalho para criar OS a partir do calendário
                // Neste caso, redirecionamos para a aba History e poderíamos pré-preencher o form
                setActiveTab('history');
            }} />}
            
            {activeTab === 'inventory' && <Inventory inventory={inventory} setInventory={setInventory} />}
            {activeTab === 'assets' && <AssetsRegistry assets={assets} setAssets={setAssets} />}
            {activeTab === 'finance' && <FinancialControl expenses={expenses} onAddExpense={(e) => setExpenses(prev => [e as any, ...prev])} unit={activeUnit} orders={orders} />}
            {activeTab === 'reports' && <BoardReports orders={orders} unit={activeUnit} units={units} />}
            {activeTab === 'tst' && <TSTAudit />}
            {activeTab === 'plans' && <FiveWTwoH />}
            {activeTab === 'settings' && <Settings />}
            {activeTab === 'admin' && <AdminPanel users={users} units={units} currentUser={currentUser} onAddUser={(u) => setUsers(prev => [...prev, u as any])} onUpdateUser={(id, up) => setUsers(prev => prev.map(u => u.id === id ? {...u, ...up} : u))} onDeleteUser={(id) => setUsers(prev => prev.filter(u => u.id !== id))} onAddUnit={(u) => setUnits(prev => [...prev, u as any])} onUpdateUnit={(id, up) => setUnits(prev => prev.map(u => u.id === id ? {...u, ...up} : u))} onDeleteUnit={(id) => setUnits(prev => prev.filter(u => u.id !== id))} />}
          
            <footer className="mt-20 py-8 border-t border-slate-200 flex flex-col items-center justify-center text-center opacity-60 hover:opacity-100 transition-opacity select-none">
               <p className="text-[10px] font-black text-[#1A3673] uppercase tracking-[0.3em]">
                  CRIADO E DESENVOLVIDO POR EMERSON HENRIQUE 2026
               </p>
            </footer>
          </div>
        </main>
      </ErrorBoundary>
    </div>
  );
};

const App: React.FC = () => <AppProvider><MainApp /></AppProvider>;
export default App;
