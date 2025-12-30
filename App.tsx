
import React, { useState, useMemo, useEffect } from 'react';
import { ServiceOrder, User, Unit, UserRole, CloudSyncState, MonthlyExpense, ThemeType, InventoryItem, OSStatus, ServiceType } from './types';
import { INITIAL_OS, INITIAL_USERS, INITIAL_UNITS, INITIAL_INVENTORY } from './constants';
import HeaderNav from './components/HeaderNav';
import Dashboard from './components/Dashboard';
import OSHistory from './components/OSHistory';
import IAModule from './components/IAModule';
import AdminPanel from './components/AdminPanel';
import Login from './components/Login';
import Benchmarking from './components/Benchmarking';
import BoardReports from './components/BoardReports';
import Inventory from './components/Inventory';
import StrategicPlanning from './components/StrategicPlanning';
import FinancialControl from './components/FinancialControl';

const App: React.FC = () => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [currentUnitId, setCurrentUnitId] = useState('');
  const [theme, setTheme] = useState<ThemeType>((localStorage.getItem('aviagen_theme') as ThemeType) || 'deep');
  
  // Estado para OS pré-preenchida vinda da IA
  const [preFilledOSData, setPreFilledOSData] = useState<any>(null);

  const [orders, setOrders] = useState<ServiceOrder[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [units, setUnits] = useState<Unit[]>([]);
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [monthlyExpenses, setMonthlyExpenses] = useState<MonthlyExpense[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  const [syncState, setSyncState] = useState<CloudSyncState>({
    plantKey: localStorage.getItem('aviagen_plant_key') || 'AVI-UNIT-01',
    isSyncing: false,
    lastSync: null,
    status: 'online'
  });

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('aviagen_theme', theme);
  }, [theme]);

  useEffect(() => {
    const loadData = () => {
      try {
        const savedOrders = localStorage.getItem('aviagen_orders');
        const savedInv = localStorage.getItem('aviagen_inventory');
        const savedUnits = localStorage.getItem('aviagen_units');
        const savedUsers = localStorage.getItem('aviagen_users');
        const savedExpenses = localStorage.getItem('aviagen_expenses');
        
        setOrders(savedOrders ? JSON.parse(savedOrders) : INITIAL_OS);
        setInventory(savedInv ? JSON.parse(savedInv) : INITIAL_INVENTORY);
        setUnits(savedUnits ? JSON.parse(savedUnits) : INITIAL_UNITS);
        setUsers(savedUsers ? JSON.parse(savedUsers) : INITIAL_USERS);
        setMonthlyExpenses(savedExpenses ? JSON.parse(savedExpenses) : []);
        setIsLoaded(true);
      } catch (error) {
        setOrders(INITIAL_OS);
        setInventory(INITIAL_INVENTORY);
        setUnits(INITIAL_UNITS);
        setUsers(INITIAL_USERS);
        setIsLoaded(true);
      }
    };
    loadData();
  }, []);

  useEffect(() => {
    if (isLoaded) {
      localStorage.setItem('aviagen_orders', JSON.stringify(orders));
      localStorage.setItem('aviagen_inventory', JSON.stringify(inventory));
      localStorage.setItem('aviagen_units', JSON.stringify(units));
      localStorage.setItem('aviagen_users', JSON.stringify(users));
      localStorage.setItem('aviagen_expenses', JSON.stringify(monthlyExpenses));
      
      setSyncState(prev => ({ ...prev, isSyncing: true }));
      const timer = setTimeout(() => {
        setSyncState(prev => ({ ...prev, isSyncing: false, lastSync: new Date() }));
      }, 800);
      return () => clearTimeout(timer);
    }
  }, [orders, inventory, units, users, monthlyExpenses, isLoaded]);

  useEffect(() => {
    if (currentUser) {
      setCurrentUnitId(currentUser.unitId);
    }
  }, [currentUser]);

  const unitContext = useMemo(() => {
    const fallbackUnit = units[0] || INITIAL_UNITS[0];
    const targetUnitId = currentUnitId || fallbackUnit.id;
    
    return {
      orders: orders.filter(o => o.unitId === targetUnitId),
      inventory: inventory.filter(i => i.unitId === targetUnitId),
      technicians: users.filter(u => u.unitId === targetUnitId),
      expenses: monthlyExpenses.filter(e => e.unitId === targetUnitId),
      activeUnit: units.find(u => u.id === targetUnitId) || fallbackUnit
    };
  }, [orders, inventory, users, units, monthlyExpenses, currentUnitId]);

  const handleUpdateOS = (osId: string, updates: Partial<ServiceOrder>, partsUsed?: any[]) => {
    setOrders(prev => {
      const newOrders = prev.map(o => o.id === osId ? { ...o, ...updates, lastUpdated: Date.now() } : o);
      return [...newOrders];
    });

    if (partsUsed) {
      setInventory(prev => prev.map(item => {
        const used = partsUsed.find(p => p.itemId === item.id);
        return used ? { ...item, stock: Math.max(0, item.stock - Number(used.quantity)) } : item;
      }));
    }
  };

  const handleCreateFromAI = (data: any) => {
    setPreFilledOSData({
      description: `[AUTO-IA] EQUIPAMENTO: ${data.equipment}\nDIAGNÓSTICO: ${data.diagnosis}\nRECOMENDAÇÃO: ${data.suggestedAction}\nPEÇAS: ${data.requiredParts?.join(', ') || 'Não especificadas'}`,
      type: data.suggestedAction?.toLowerCase().includes('preventiv') ? ServiceType.PREVENTIVE : ServiceType.CORRECTIVE,
    });
    setActiveTab('history');
  };

  if (!isLoaded) return <div className="h-screen bg-[#020617] flex flex-col items-center justify-center gap-4"><div className="w-12 h-12 border-2 border-[#0047ba] border-t-white rounded-full animate-spin"></div></div>;

  if (!currentUser) return <Login onLogin={setCurrentUser} />;

  const hasAccess = (tab: string) => {
    const role = currentUser.role;
    if (role === UserRole.GLOBAL_ADMIN) return true;
    if (role === UserRole.ADMIN || role === UserRole.BOARD_MEMBER) {
      return ['dashboard', 'history', 'inventory', 'finance', 'strategic', 'ai', 'benchmarking', 'reports'].includes(tab);
    }
    if (role === UserRole.TECHNICIAN) {
      return ['history', 'ai'].includes(tab);
    }
    return false;
  };

  return (
    <div className="flex flex-col h-screen overflow-hidden text-[var(--text-main)] transition-colors duration-500">
      <HeaderNav 
        activeTab={activeTab} 
        setActiveTab={setActiveTab} 
        role={currentUser.role} 
        userName={currentUser.name}
        unitName={unitContext.activeUnit.name}
        syncState={syncState}
        onLogout={() => setCurrentUser(null)}
        units={units}
        currentUnitId={currentUnitId}
        setCurrentUnitId={setCurrentUnitId}
        isGlobalAdmin={currentUser.role === UserRole.GLOBAL_ADMIN}
        currentTheme={theme}
        setTheme={setTheme}
      />

      <main className="flex-1 overflow-y-auto p-8 custom-scrollbar bg-[var(--bg-main)]">
        <div className="max-w-[1700px] mx-auto pb-12">
          {activeTab === 'dashboard' && hasAccess('dashboard') && (
            <Dashboard 
              orders={unitContext.orders} 
              users={users} 
              inventory={unitContext.inventory} 
              expenses={unitContext.expenses} 
              currentUnitId={currentUnitId} 
              unit={unitContext.activeUnit} 
              role={currentUser.role}
            />
          )}
          {activeTab === 'history' && hasAccess('history') && (
            <OSHistory 
              orders={unitContext.orders} 
              technicians={unitContext.technicians} 
              inventory={unitContext.inventory} 
              onUpdate={handleUpdateOS} 
              onAddOS={(data) => {
                setOrders(prev => [{...data, id: `OS-${Date.now()}`, unitId: currentUnitId, status: OSStatus.OPEN}, ...prev]);
                setPreFilledOSData(null);
              }}
              role={currentUser.role}
              currentUser={currentUser}
              preFilledData={preFilledOSData}
              clearPreFilled={() => setPreFilledOSData(null)}
            />
          )}
          {activeTab === 'inventory' && hasAccess('inventory') && <Inventory inventory={unitContext.inventory} setInventory={setInventory} />}
          {activeTab === 'finance' && hasAccess('finance') && <FinancialControl expenses={unitContext.expenses} onAddExpense={(e) => setMonthlyExpenses(prev => [...prev, {...e, id: `exp-${Date.now()}`}])} unit={unitContext.activeUnit} orders={unitContext.orders} />}
          {activeTab === 'strategic' && hasAccess('strategic') && <StrategicPlanning orders={unitContext.orders} units={units} />}
          {activeTab === 'ai' && hasAccess('ai') && <IAModule orders={unitContext.orders} users={unitContext.technicians} role={currentUser.role} onGenerateOS={handleCreateFromAI} />}
          {activeTab === 'benchmarking' && hasAccess('benchmarking') && <Benchmarking units={units} orders={orders} currentUserUnitId={currentUnitId} />}
          {activeTab === 'reports' && hasAccess('reports') && <BoardReports orders={unitContext.orders} unit={unitContext.activeUnit} />}
          {activeTab === 'admin' && hasAccess('admin') && (
            <AdminPanel 
              users={users} 
              units={units} 
              onAddUser={(u) => setUsers(prev => [...prev, { ...u, id: `user-${Date.now()}` }])}
              onUpdateUser={(id, up) => setUsers(prev => prev.map(u => u.id === id ? { ...u, ...up } : u))}
              onDeleteUser={(id) => setUsers(prev => prev.filter(u => u.id !== id))}
              onAddUnit={(u) => setUnits(prev => [...prev, u])}
              onUpdateUnit={(id, up) => setUnits(prev => prev.map(u => u.id === id ? { ...u, ...up } : u))}
              onDeleteUnit={(id) => setUnits(prev => prev.filter(u => u.id !== id))}
              currentUser={currentUser}
            />
          )}
        </div>
      </main>

      <footer className="h-8 glass border-t border-[var(--border-main)] flex items-center justify-between px-10 shrink-0 text-[8px] font-black uppercase tracking-[0.3em] opacity-40">
        <div className="flex items-center gap-4">
          <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-[0_0_8px_#10b981]"></div>
          SGI-Aviagen • {currentUser.role} • Nível de Acesso: {currentUser.role === UserRole.GLOBAL_ADMIN ? 'IRRESTRITO' : 'OPERACIONAL'}
        </div>
        <span>Platinum Core Inteligência • Emerson Henrique Control System</span>
      </footer>
    </div>
  );
};

export default App;
