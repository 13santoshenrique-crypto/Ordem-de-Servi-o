
import { ServiceOrder, InventoryItem, User, MonthlyExpense, Asset, Unit, RecurringTask, TSTAuditItem, ActionPlan5W2H, PasswordResetRequest } from '../types';
import { INITIAL_OS, INITIAL_INVENTORY, INITIAL_USERS, INITIAL_ASSETS, INITIAL_UNITS } from '../constants';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.SUPABASE_URL || '';
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY || '';

const supabase = (supabaseUrl && supabaseAnonKey) 
  ? createClient(supabaseUrl, supabaseAnonKey) 
  : null;

const API_BASE = '/api';

const fetchAPI = async (endpoint: string) => {
  try {
    const res = await fetch(`${API_BASE}/${endpoint}`);
    if (!res.ok) throw new Error('API Error');
    return await res.json();
  } catch (e) {
    console.error(`Failed to fetch ${endpoint}:`, e);
    return null;
  }
};

const saveAPI = async (endpoint: string, data: any) => {
  try {
    await fetch(`${API_BASE}/${endpoint}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
  } catch (e) {
    console.error(`Failed to save ${endpoint}:`, e);
  }
};

const STORAGE_KEYS = {
  ORDERS: 'aviagen_orders',
  INVENTORY: 'aviagen_inventory',
  USERS: 'aviagen_users',
  EXPENSES: 'aviagen_expenses',
  ASSETS: 'aviagen_assets',
  UNITS: 'aviagen_units',
  RECURRING: 'aviagen_recurring',
  TST_AUDIT: 'aviagen_tst_audit',
  ACTION_PLANS: 'aviagen_5w2h_plans',
  RESET_REQUESTS: 'aviagen_password_resets',
  AUDIT_LOGS: 'aviagen_audit_logs',
  NOTIFICATIONS: 'aviagen_notifications',
  AUDIT_SIMULATIONS: 'aviagen_audit_simulations',
  AUDIT_TEMPLATES: 'aviagen_audit_templates'
};

export const db = {
  async getUnits(): Promise<Unit[]> {
    if (supabase) {
      const { data, error } = await supabase.from('units').select('*');
      if (!error && data && data.length > 0) return data;
    }
    const apiData = await fetchAPI('units');
    if (apiData && apiData.length > 0) return apiData;

    const data = localStorage.getItem(STORAGE_KEYS.UNITS);
    return data ? JSON.parse(data) : INITIAL_UNITS;
  },

  async saveUnits(units: Unit[]): Promise<void> {
    if (supabase) {
      await supabase.from('units').upsert(units);
    }
    await saveAPI('units', units);
    localStorage.setItem(STORAGE_KEYS.UNITS, JSON.stringify(units));
  },

  async getOrders(): Promise<ServiceOrder[]> {
    if (supabase) {
      const { data, error } = await supabase.from('service_orders').select('*');
      if (!error && data && data.length > 0) return data;
    }
    const apiData = await fetchAPI('orders');
    if (apiData && apiData.length > 0) return apiData;

    const data = localStorage.getItem(STORAGE_KEYS.ORDERS);
    return data ? JSON.parse(data) : INITIAL_OS;
  },

  async saveOrders(orders: ServiceOrder[]): Promise<void> {
    if (supabase) {
      await supabase.from('service_orders').upsert(orders);
    }
    await saveAPI('orders', orders);
    localStorage.setItem(STORAGE_KEYS.ORDERS, JSON.stringify(orders));
  },

  async getInventory(): Promise<InventoryItem[]> {
    if (supabase) {
      const { data, error } = await supabase.from('inventory').select('*');
      if (!error && data && data.length > 0) return data;
    }
    const apiData = await fetchAPI('inventory');
    if (apiData && apiData.length > 0) return apiData;

    const data = localStorage.getItem(STORAGE_KEYS.INVENTORY);
    return data ? JSON.parse(data) : INITIAL_INVENTORY;
  },

  async saveInventory(items: InventoryItem[]): Promise<void> {
    if (supabase) {
      await supabase.from('inventory').upsert(items);
    }
    await saveAPI('inventory', items);
    localStorage.setItem(STORAGE_KEYS.INVENTORY, JSON.stringify(items));
  },

  async getAssets(): Promise<Asset[]> {
    if (supabase) {
      const { data, error } = await supabase.from('assets').select('*');
      if (!error && data && data.length > 0) return data;
    }
    const apiData = await fetchAPI('assets');
    if (apiData && apiData.length > 0) return apiData;

    const data = localStorage.getItem(STORAGE_KEYS.ASSETS);
    return data ? JSON.parse(data) : INITIAL_ASSETS;
  },

  async saveAssets(items: Asset[]): Promise<void> {
    if (supabase) {
      await supabase.from('assets').upsert(items);
    }
    await saveAPI('assets', items);
    localStorage.setItem(STORAGE_KEYS.ASSETS, JSON.stringify(items));
  },

  async getRecurringTasks(): Promise<RecurringTask[]> {
    if (supabase) {
       const { data, error } = await supabase.from('recurring_tasks').select('*');
       if (!error && data && data.length > 0) return data;
    }
    const apiData = await fetchAPI('recurring');
    if (apiData && apiData.length > 0) return apiData;

    const data = localStorage.getItem(STORAGE_KEYS.RECURRING);
    return data ? JSON.parse(data) : [];
  },

  async saveRecurringTasks(tasks: RecurringTask[]): Promise<void> {
    if (supabase) {
       await supabase.from('recurring_tasks').upsert(tasks);
    }
    await saveAPI('recurring', tasks);
    localStorage.setItem(STORAGE_KEYS.RECURRING, JSON.stringify(tasks));
  },

  async getTSTAudit(): Promise<TSTAuditItem[]> {
    if (supabase) {
      const { data, error } = await supabase.from('tst_audit').select('*');
      if (!error && data && data.length > 0) return data;
    }
    const apiData = await fetchAPI('tst_audit');
    if (apiData && apiData.length > 0) return apiData;

    const data = localStorage.getItem(STORAGE_KEYS.TST_AUDIT);
    return data ? JSON.parse(data) : [];
  },

  async saveTSTAudit(items: TSTAuditItem[]): Promise<void> {
    if (supabase) {
      await supabase.from('tst_audit').upsert(items);
    }
    await saveAPI('tst_audit', items);
    localStorage.setItem(STORAGE_KEYS.TST_AUDIT, JSON.stringify(items));
  },

  async getActionPlans(): Promise<ActionPlan5W2H[]> {
    if (supabase) {
      const { data, error } = await supabase.from('action_plans').select('*');
      if (!error && data && data.length > 0) return data;
    }
    const apiData = await fetchAPI('action_plans');
    if (apiData && apiData.length > 0) return apiData;

    const data = localStorage.getItem(STORAGE_KEYS.ACTION_PLANS);
    return data ? JSON.parse(data) : [];
  },

  async saveActionPlans(plans: ActionPlan5W2H[]): Promise<void> {
    if (supabase) {
      await supabase.from('action_plans').upsert(plans);
    }
    await saveAPI('action_plans', plans);
    localStorage.setItem(STORAGE_KEYS.ACTION_PLANS, JSON.stringify(plans));
  },

  async getUsers(): Promise<User[]> {
    if (supabase) {
      const { data, error } = await supabase.from('users').select('*');
      if (!error && data && data.length > 0) return data;
    }
    const apiData = await fetchAPI('users');
    if (apiData && apiData.length > 0) return apiData;

    const data = localStorage.getItem(STORAGE_KEYS.USERS);
    return data ? JSON.parse(data) : INITIAL_USERS;
  },

  async saveUsers(users: User[]): Promise<void> {
    if (supabase) {
      await supabase.from('users').upsert(users);
    }
    await saveAPI('users', users);
    localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(users));
  },

  async getExpenses(): Promise<MonthlyExpense[]> {
    if (supabase) {
      const { data, error } = await supabase.from('monthly_expenses').select('*');
      if (!error && data && data.length > 0) return data;
    }
    const apiData = await fetchAPI('expenses');
    if (apiData && apiData.length > 0) return apiData;

    const data = localStorage.getItem(STORAGE_KEYS.EXPENSES);
    return data ? JSON.parse(data) : [];
  },

  async saveExpenses(expenses: MonthlyExpense[]): Promise<void> {
    if (supabase) {
      await supabase.from('monthly_expenses').upsert(expenses);
    }
    await saveAPI('expenses', expenses);
    localStorage.setItem(STORAGE_KEYS.EXPENSES, JSON.stringify(expenses));
  },

  async getResetRequests(): Promise<PasswordResetRequest[]> {
    if (supabase) {
      const { data, error } = await supabase.from('password_resets').select('*');
      if (!error && data && data.length > 0) return data;
    }
    const apiData = await fetchAPI('resets');
    if (apiData && apiData.length > 0) return apiData;

    const data = localStorage.getItem(STORAGE_KEYS.RESET_REQUESTS);
    return data ? JSON.parse(data) : [];
  },

  async saveResetRequests(requests: PasswordResetRequest[]): Promise<void> {
    if (supabase) {
      await supabase.from('password_resets').upsert(requests);
    }
    await saveAPI('resets', requests);
    localStorage.setItem(STORAGE_KEYS.RESET_REQUESTS, JSON.stringify(requests));
  },

  async getAuditLogs(): Promise<AuditLogEntry[]> {
    const apiData = await fetchAPI('audit_logs');
    if (apiData && apiData.length > 0) return apiData;

    const data = localStorage.getItem(STORAGE_KEYS.AUDIT_LOGS);
    return data ? JSON.parse(data) : [];
  },

  async saveAuditLogs(logs: AuditLogEntry[]): Promise<void> {
    await saveAPI('audit_logs', logs);
    localStorage.setItem(STORAGE_KEYS.AUDIT_LOGS, JSON.stringify(logs));
  },

  async getNotifications(): Promise<AppNotification[]> {
    const apiData = await fetchAPI('notifications');
    if (apiData && apiData.length > 0) {
        return apiData.map((n: any) => ({ ...n, timestamp: new Date(n.timestamp) }));
    }

    const data = localStorage.getItem(STORAGE_KEYS.NOTIFICATIONS);
    return data ? JSON.parse(data).map((n: any) => ({ ...n, timestamp: new Date(n.timestamp) })) : [];
  },

  async saveNotifications(notifications: AppNotification[]): Promise<void> {
    await saveAPI('notifications', notifications);
    localStorage.setItem(STORAGE_KEYS.NOTIFICATIONS, JSON.stringify(notifications));
  },
  
  async getAuditSimulations(): Promise<any[]> {
    const apiData = await fetchAPI('audit_simulations');
    if (apiData && apiData.length > 0) return apiData;
    const data = localStorage.getItem(STORAGE_KEYS.AUDIT_SIMULATIONS);
    return data ? JSON.parse(data) : [];
  },

  async saveAuditSimulations(sims: any[]): Promise<void> {
    await saveAPI('audit_simulations', sims);
    localStorage.setItem(STORAGE_KEYS.AUDIT_SIMULATIONS, JSON.stringify(sims));
  },

  async getAuditTemplates(): Promise<any[]> {
    const apiData = await fetchAPI('audit_templates');
    if (apiData && apiData.length > 0) return apiData;
    const data = localStorage.getItem(STORAGE_KEYS.AUDIT_TEMPLATES);
    return data ? JSON.parse(data) : [];
  },

  async saveAuditTemplates(templates: any[]): Promise<void> {
    await saveAPI('audit_templates', templates);
    localStorage.setItem(STORAGE_KEYS.AUDIT_TEMPLATES, JSON.stringify(templates));
  }
};
