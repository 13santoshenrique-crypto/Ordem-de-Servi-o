
import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import { ServiceOrder, User, Unit, InventoryItem, MonthlyExpense, AppNotification, ThemeType, Asset, RecurringTask, ExternalMaintenanceEvent, AuditLogEntry, TSTAuditItem, UserRole, OSStatus, ActionPlan5W2H } from '../types';
import { db } from '../services/database';
import { INITIAL_UNITS } from '../constants';

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
  syncEagleTrax: (unitId: string) => Promise<boolean>;
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
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [auditLogs, setAuditLogs] = useState<AuditLogEntry[]>([]);
  const [externalEvents, setExternalEvents] = useState<ExternalMaintenanceEvent[]>([]);
  const [theme, setTheme] = useState<ThemeType>('slate');
  const [loading, setLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [activeUnitId, setActiveUnitId] = useState<string>('');

  const notifiedEvents = useRef<Set<string>>(new Set());

  useEffect(() => {
    const loadAll = async () => {
      try {
        const [o, u, i, e, a, un, r, t, p] = await Promise.all([
          db.getOrders(),
          db.getUsers(),
          db.getInventory(),
          db.getExpenses(),
          db.getAssets(),
          db.getUnits(),
          db.getRecurringTasks(),
          db.getTSTAudit(),
          db.getActionPlans()
        ]);
        setOrders(o);
        setUsers(u);
        setInventory(i);
        setExpenses(e);
        setAssets(a);
        setUnits(un);
        setRecurringTasks(r);
        setTstAudit(t);
        setActionPlans(p);
        
        const savedLogs = localStorage.getItem('aviagen_audit_logs');
        if (savedLogs) setAuditLogs(JSON.parse(savedLogs));

        const savedNotifs = localStorage.getItem('aviagen_notifications');
        if (savedNotifs) {
            const parsed = JSON.parse(savedNotifs);
            setNotifications(parsed.map((n: any) => ({ ...n, timestamp: new Date(n.timestamp) })));
        }
      } catch (err) {
        console.error("Erro industrial critico ao carregar banco", err);
      } finally {
        setLoading(false);
      }
    };
    loadAll();
  }, []);

  useEffect(() => {
    if (!loading) {
      localStorage.setItem('aviagen_notifications', JSON.stringify(notifications));
    }
  }, [notifications, loading]);

  const addNotification = useCallback((n: Omit<AppNotification, 'id' | 'timestamp' | 'read'>) => {
    const newNotif: AppNotification = {
      ...n,
      id: Math.random().toString(36).substr(2, 9),
      timestamp: new Date(),
      read: false
    };
    setNotifications(prev => [newNotif, ...prev].slice(0, 50));
  }, []);

  const markAsRead = (id: string) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
  };

  const markAllAsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  };

  useEffect(() => {
    if (loading || !currentUser) return;

    const checkCompliance = () => {
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      orders.forEach(os => {
        if (os.status === OSStatus.OPEN && os.unitId === activeUnitId) {
          const deadlineDate = new Date(os.deadline);
          const eventKey = `overdue-${os.id}-${os.deadline}`;
          
          if (deadlineDate < today && !notifiedEvents.current.has(eventKey)) {
            addNotification({
              type: 'critical',
              title: 'OS Vencida',
              message: `A Ordem #${os.id} ultrapassou o prazo de conclusão (${os.deadline}).`
            });
            notifiedEvents.current.add(eventKey);
          }
        }
      });

      if (currentUser.role === UserRole.ADMIN || currentUser.role === UserRole.GLOBAL_ADMIN) {
        const monthYear = `${today.getMonth() + 1}-${today.getFullYear()}`;
        const auditNotifKey = `audit-reminder-${monthYear}-${activeUnitId}`;
        
        if (!localStorage.getItem(auditNotifKey)) {
          addNotification({
            type: 'warning',
            title: 'Verificação Mensal',
            message: 'Administrador, por favor verifique se todo o sistema está preenchido corretamente para o fechamento do mês.'
          });
          localStorage.setItem(auditNotifKey, 'true');
        }
      }
    };

    checkCompliance();
    const interval = setInterval(checkCompliance, 1000 * 60 * 30);
    return () => clearInterval(interval);
  }, [orders, activeUnitId, currentUser, loading, addNotification]);

  const logAction = useCallback((action: string, details: string, user: User) => {
    const newEntry: AuditLogEntry = {
      id: `log-${Date.now()}`,
      action,
      details,
      userId: user.id,
      userName: user.name,
      timestamp: new Date().toISOString()
    };
    setAuditLogs(prev => {
      const updated = [newEntry, ...prev].slice(0, 1000);
      localStorage.setItem('aviagen_audit_logs', JSON.stringify(updated));
      return updated;
    });
  }, []);

  const syncEagleTrax = async (unitId: string): Promise<boolean> => {
    try {
      await new Promise(r => setTimeout(r, 2000));
      setUnits(prev => prev.map(u => u.id === unitId ? { ...u, eagleTraxStatus: 'CONNECTED' } : u));
      addNotification({
        type: 'success',
        title: 'Eagle Trax',
        message: 'Sincronização de telemetria concluída com sucesso.'
      });
      return true;
    } catch (e) {
      return false;
    }
  };

  const exportSnapshot = () => {
    const data = { orders, users, units, inventory, assets, expenses, recurringTasks, auditLogs, tstAudit, actionPlans };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `SGI_AVIAGEN_EXPORT_${new Date().toISOString().split('T')[0]}.json`;
    link.click();
  };

  const importSnapshot = async (file: File): Promise<boolean> => {
    try {
      const text = await file.text();
      const data = JSON.parse(text);
      setOrders(data.orders || []);
      setUsers(data.users || []);
      setUnits(data.units || INITIAL_UNITS);
      setInventory(data.inventory || []);
      setAssets(data.assets || []);
      setExpenses(data.expenses || []);
      setRecurringTasks(data.recurringTasks || []);
      setTstAudit(data.tstAudit || []);
      setActionPlans(data.actionPlans || []);
      return true;
    } catch (e) {
      return false;
    }
  };

  return (
    <AppContext.Provider value={{
      orders, setOrders, users, setUsers, units, setUnits, inventory, setInventory,
      assets, setAssets, expenses, setExpenses, recurringTasks, setRecurringTasks,
      tstAudit, setTstAudit, actionPlans, setActionPlans,
      externalEvents, syncEagleTrax, notifications, addNotification,
      markAsRead, markAllAsRead, theme, setTheme, loading, auditLogs, logAction,
      exportSnapshot, importSnapshot, currentUser, setCurrentUser, activeUnitId, setActiveUnitId
    }}>
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) throw new Error('useApp deve ser usado dentro de um AppProvider');
  return context;
};
