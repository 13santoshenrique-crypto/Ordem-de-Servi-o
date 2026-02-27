
import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { ServiceOrder, User, Unit, InventoryItem, MonthlyExpense, AppNotification, ThemeType, Asset, RecurringTask, ExternalMaintenanceEvent, AuditLogEntry, TSTAuditItem, ActionPlan5W2H, GlobalAlert, PasswordResetRequest } from '../types';
import { db } from '../services/database';
import { INITIAL_UNITS, LUZIANIA_UNIT_ID } from '../constants';

interface AppContextType {
  orders: ServiceOrder[];
  setOrders: React.Dispatch<React.SetStateAction<ServiceOrder[]>>;
  users: User[];
  setUsers: React.Dispatch<React.SetStateAction<User[]>>;
  units: Unit[];
  setUnits: React.Dispatch<React.SetStateAction<Unit[]>>;
  inventory: InventoryItem[];
  setInventory: React.Dispatch<React.SetStateAction<InventoryItem[]>>;
  assets: Asset[];
  setAssets: React.Dispatch<React.SetStateAction<Asset[]>>;
  expenses: MonthlyExpense[];
  setExpenses: React.Dispatch<React.SetStateAction<MonthlyExpense[]>>;
  recurringTasks: RecurringTask[];
  setRecurringTasks: React.Dispatch<React.SetStateAction<RecurringTask[]>>;
  tstAudit: TSTAuditItem[];
  setTstAudit: React.Dispatch<React.SetStateAction<TSTAuditItem[]>>;
  actionPlans: ActionPlan5W2H[];
  setActionPlans: React.Dispatch<React.SetStateAction<ActionPlan5W2H[]>>;
  externalEvents: ExternalMaintenanceEvent[];
  setExternalEvents: React.Dispatch<React.SetStateAction<ExternalMaintenanceEvent[]>>;
  globalAlerts: GlobalAlert[];
  addGlobalAlert: (alert: Omit<GlobalAlert, 'id' | 'timestamp'>) => void;
  notifications: AppNotification[];
  addNotification: (n: Omit<AppNotification, 'id' | 'timestamp' | 'read'>) => void;
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
  theme: ThemeType;
  setTheme: (t: ThemeType) => void;
  loading: boolean;
  auditLogs: AuditLogEntry[];
  logAction: (action: string, details: string, user: User) => void;
  exportSnapshot: () => void;
  importSnapshot: (file: File) => Promise<boolean>;
  currentUser: User | null;
  setCurrentUser: React.Dispatch<React.SetStateAction<User | null>>;
  activeUnitId: string;
  setActiveUnitId: (id: string) => void;
  resetRequests: PasswordResetRequest[];
  addResetRequest: (email: string, requestedPassword: string) => Promise<void>;
  approveResetRequest: (requestId: string) => Promise<void>;
  rejectResetRequest: (requestId: string) => Promise<void>;
  changePassword: (userId: string, newPassword: string) => Promise<void>;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [orders, setOrders] = useState<ServiceOrder[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [units, setUnits] = useState<Unit[]>(INITIAL_UNITS);
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [assets, setAssets] = useState<Asset[]>([]);
  const [expenses, setExpenses] = useState<MonthlyExpense[]>([]);
  const [recurringTasks, setRecurringTasks] = useState<RecurringTask[]>([]);
  const [tstAudit, setTstAudit] = useState<TSTAuditItem[]>([]);
  const [actionPlans, setActionPlans] = useState<ActionPlan5W2H[]>([]);
  const [externalEvents, setExternalEvents] = useState<ExternalMaintenanceEvent[]>([]);
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [auditLogs, setAuditLogs] = useState<AuditLogEntry[]>([]);
  const [globalAlerts, setGlobalAlerts] = useState<GlobalAlert[]>([]);
  const [theme, setTheme] = useState<ThemeType>('slate');
  const [loading, setLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [activeUnitId, setActiveUnitId] = useState<string>(LUZIANIA_UNIT_ID);
  const [resetRequests, setResetRequests] = useState<PasswordResetRequest[]>([]);

  useEffect(() => {
    const loadAll = async () => {
      try {
        const [o, u, i, e, a, un, r, t, p, rr, al, nt] = await Promise.all([
          db.getOrders(), db.getUsers(), db.getInventory(), db.getExpenses(),
          db.getAssets(), db.getUnits(), db.getRecurringTasks(), db.getTSTAudit(), db.getActionPlans(),
          db.getResetRequests(), db.getAuditLogs(), db.getNotifications()
        ]);
        setOrders(o || []); 
        setUsers(u || []); 
        setInventory(i || []); 
        setExpenses(e || []);
        setAssets(a || []); 
        setUnits(un && un.length > 0 ? un : INITIAL_UNITS); 
        setRecurringTasks(r || []); 
        setTstAudit(t || []); 
        setActionPlans(p || []);
        setResetRequests(rr || []);
        setAuditLogs(al || []);
        setNotifications(nt || []);
        
        const savedAlerts = localStorage.getItem('aviagen_global_alerts');
        if (savedAlerts) setGlobalAlerts(JSON.parse(savedAlerts));
      } catch (err) {
        console.error("Critical system error", err);
      } finally {
        setLoading(false);
      }
    };
    loadAll();
  }, []);

  const addGlobalAlert = useCallback((a: Omit<GlobalAlert, 'id' | 'timestamp'>) => {
    const newAlert: GlobalAlert = { ...a, id: `alert-${Date.now()}`, timestamp: new Date().toISOString() };
    setGlobalAlerts(prev => {
        const updated = [newAlert, ...prev].slice(0, 5);
        localStorage.setItem('aviagen_global_alerts', JSON.stringify(updated));
        return updated;
    });
  }, []);

  const addNotification = useCallback((n: Omit<AppNotification, 'id' | 'timestamp' | 'read'>) => {
    const newNotif: AppNotification = { ...n, id: Math.random().toString(36).substr(2, 9), timestamp: new Date(), read: false };
    setNotifications(prev => {
        const updated = [newNotif, ...prev].slice(0, 50);
        db.saveNotifications(updated);
        return updated;
    });
  }, []);

  const markAsRead = (id: string) => {
    setNotifications(prev => {
        const updated = prev.map(n => n.id === id ? { ...n, read: true } : n);
        db.saveNotifications(updated);
        return updated;
    });
  };

  const markAllAsRead = () => {
    setNotifications(prev => {
        const updated = prev.map(n => ({ ...n, read: true }));
        db.saveNotifications(updated);
        return updated;
    });
  };

  const logAction = useCallback((action: string, details: string, user: User) => {
    const newEntry: AuditLogEntry = { id: `log-${Date.now()}`, action, details, userId: user.id, userName: user.name, timestamp: new Date().toISOString() };
    setAuditLogs(prev => {
      const updated = [newEntry, ...prev].slice(0, 1000);
      db.saveAuditLogs(updated);
      return updated;
    });
  }, []);

  const exportSnapshot = () => {
    const data = { orders, users, units, inventory, assets, expenses, recurringTasks, auditLogs, tstAudit, actionPlans };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `SGI_AVIAGEN_SNAPSHOT_${new Date().toISOString().split('T')[0]}.json`;
    link.click();
  };

  const importSnapshot = async (file: File): Promise<boolean> => {
    try {
      const text = await file.text();
      const data = JSON.parse(text);
      setOrders(data.orders || []); setUsers(data.users || []); setUnits(data.units || INITIAL_UNITS);
      setInventory(data.inventory || []); setAssets(data.assets || []); setExpenses(data.expenses || []);
      setRecurringTasks(data.recurringTasks || []); setTstAudit(data.tstAudit || []); setActionPlans(data.actionPlans || []);
      setResetRequests(data.resetRequests || []);
      return true;
    } catch (e) { return false; }
  };

  const addResetRequest = async (email: string, requestedPassword: string) => {
    const newRequest: PasswordResetRequest = {
      id: `reset-${Date.now()}`,
      email,
      requestedPassword,
      timestamp: new Date().toISOString(),
      status: 'PENDING'
    };
    const updated = [newRequest, ...resetRequests];
    setResetRequests(updated);
    await db.saveResetRequests(updated);
    
    addNotification({
      type: 'info',
      title: 'Solicitação de Senha',
      message: `Usuário ${email} solicitou alteração de senha.`
    });
  };

  const approveResetRequest = async (requestId: string) => {
    const request = resetRequests.find(r => r.id === requestId);
    if (!request) return;

    const updatedRequests = resetRequests.map(r => 
      r.id === requestId ? { ...r, status: 'APPROVED' as const } : r
    );
    setResetRequests(updatedRequests);
    await db.saveResetRequests(updatedRequests);

    // Update user password
    const updatedUsers = users.map(u => 
      u.email.toLowerCase() === request.email.toLowerCase() 
        ? { ...u, password: request.requestedPassword } 
        : u
    );
    setUsers(updatedUsers);
    await db.saveUsers(updatedUsers);

    addNotification({
      type: 'success',
      title: 'Senha Aprovada',
      message: `A nova senha para ${request.email} foi ativada.`
    });
  };

  const rejectResetRequest = async (requestId: string) => {
    const updatedRequests = resetRequests.map(r => 
      r.id === requestId ? { ...r, status: 'REJECTED' as const } : r
    );
    setResetRequests(updatedRequests);
    await db.saveResetRequests(updatedRequests);
  };

  const changePassword = async (userId: string, newPassword: string) => {
    const updatedUsers = users.map(u => 
      u.id === userId ? { ...u, password: newPassword } : u
    );
    setUsers(updatedUsers);
    await db.saveUsers(updatedUsers);
    
    if (currentUser && currentUser.id === userId) {
      setCurrentUser({ ...currentUser, password: newPassword });
    }

    addNotification({
      type: 'success',
      title: 'Senha Alterada',
      message: 'Sua senha foi atualizada com sucesso.'
    });
  };

  return (
    <AppContext.Provider value={{
      orders, setOrders, users, setUsers, units, setUnits, inventory, setInventory,
      assets, setAssets, expenses, setExpenses, recurringTasks, setRecurringTasks,
      tstAudit, setTstAudit, actionPlans, setActionPlans, externalEvents, setExternalEvents,
      globalAlerts, addGlobalAlert,
      notifications, addNotification, markAsRead, markAllAsRead, theme, setTheme, 
      loading, auditLogs, logAction, exportSnapshot, importSnapshot, currentUser, 
      setCurrentUser, activeUnitId, setActiveUnitId,
      resetRequests, addResetRequest, approveResetRequest, rejectResetRequest, changePassword
    }}>
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) throw new Error('useApp must be used within AppProvider');
  return context;
};
