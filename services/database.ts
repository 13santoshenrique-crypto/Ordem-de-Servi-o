
import { ServiceOrder, InventoryItem, User, MonthlyExpense, Asset, Unit, RecurringTask, TSTAuditItem, ActionPlan5W2H } from '../types';
import { INITIAL_OS, INITIAL_INVENTORY, INITIAL_USERS, INITIAL_ASSETS, INITIAL_UNITS } from '../constants';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.SUPABASE_URL || '';
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY || '';

const supabase = (supabaseUrl && supabaseAnonKey) 
  ? createClient(supabaseUrl, supabaseAnonKey) 
  : null;

const STORAGE_KEYS = {
  ORDERS: 'aviagen_orders',
  INVENTORY: 'aviagen_inventory',
  USERS: 'aviagen_users',
  EXPENSES: 'aviagen_expenses',
  ASSETS: 'aviagen_assets',
  UNITS: 'aviagen_units',
  RECURRING: 'aviagen_recurring',
  TST_AUDIT: 'aviagen_tst_audit',
  ACTION_PLANS: 'aviagen_5w2h_plans'
};

export const db = {
  async getUnits(): Promise<Unit[]> {
    if (supabase) {
      const { data, error } = await supabase.from('units').select('*');
      if (!error && data) return data;
    }
    const data = localStorage.getItem(STORAGE_KEYS.UNITS);
    return data ? JSON.parse(data) : INITIAL_UNITS;
  },

  async saveUnits(units: Unit[]): Promise<void> {
    if (supabase) {
      await supabase.from('units').upsert(units);
    }
    localStorage.setItem(STORAGE_KEYS.UNITS, JSON.stringify(units));
  },

  async getOrders(): Promise<ServiceOrder[]> {
    if (supabase) {
      const { data, error } = await supabase.from('service_orders').select('*');
      if (!error && data) return data;
    }
    const data = localStorage.getItem(STORAGE_KEYS.ORDERS);
    return data ? JSON.parse(data) : INITIAL_OS;
  },

  async saveOrders(orders: ServiceOrder[]): Promise<void> {
    if (supabase) {
      await supabase.from('service_orders').upsert(orders);
    }
    localStorage.setItem(STORAGE_KEYS.ORDERS, JSON.stringify(orders));
  },

  async getInventory(): Promise<InventoryItem[]> {
    if (supabase) {
      const { data, error } = await supabase.from('inventory').select('*');
      if (!error && data) return data;
    }
    const data = localStorage.getItem(STORAGE_KEYS.INVENTORY);
    return data ? JSON.parse(data) : INITIAL_INVENTORY;
  },

  async saveInventory(items: InventoryItem[]): Promise<void> {
    if (supabase) {
      await supabase.from('inventory').upsert(items);
    }
    localStorage.setItem(STORAGE_KEYS.INVENTORY, JSON.stringify(items));
  },

  async getAssets(): Promise<Asset[]> {
    if (supabase) {
      const { data, error } = await supabase.from('assets').select('*');
      if (!error && data) return data;
    }
    const data = localStorage.getItem(STORAGE_KEYS.ASSETS);
    return data ? JSON.parse(data) : INITIAL_ASSETS;
  },

  async saveAssets(items: Asset[]): Promise<void> {
    if (supabase) {
      await supabase.from('assets').upsert(items);
    }
    localStorage.setItem(STORAGE_KEYS.ASSETS, JSON.stringify(items));
  },

  async getRecurringTasks(): Promise<RecurringTask[]> {
    if (supabase) {
       const { data, error } = await supabase.from('recurring_tasks').select('*');
       if (!error && data) return data;
    }
    const data = localStorage.getItem(STORAGE_KEYS.RECURRING);
    return data ? JSON.parse(data) : [];
  },

  async saveRecurringTasks(tasks: RecurringTask[]): Promise<void> {
    if (supabase) {
       await supabase.from('recurring_tasks').upsert(tasks);
    }
    localStorage.setItem(STORAGE_KEYS.RECURRING, JSON.stringify(tasks));
  },

  async getTSTAudit(): Promise<TSTAuditItem[]> {
    if (supabase) {
      const { data, error } = await supabase.from('tst_audit').select('*');
      if (!error && data) return data;
    }
    const data = localStorage.getItem(STORAGE_KEYS.TST_AUDIT);
    return data ? JSON.parse(data) : [];
  },

  async saveTSTAudit(items: TSTAuditItem[]): Promise<void> {
    if (supabase) {
      await supabase.from('tst_audit').upsert(items);
    }
    localStorage.setItem(STORAGE_KEYS.TST_AUDIT, JSON.stringify(items));
  },

  async getActionPlans(): Promise<ActionPlan5W2H[]> {
    if (supabase) {
      const { data, error } = await supabase.from('action_plans').select('*');
      if (!error && data) return data;
    }
    const data = localStorage.getItem(STORAGE_KEYS.ACTION_PLANS);
    return data ? JSON.parse(data) : [];
  },

  async saveActionPlans(plans: ActionPlan5W2H[]): Promise<void> {
    if (supabase) {
      await supabase.from('action_plans').upsert(plans);
    }
    localStorage.setItem(STORAGE_KEYS.ACTION_PLANS, JSON.stringify(plans));
  },

  async getUsers(): Promise<User[]> {
    if (supabase) {
      const { data, error } = await supabase.from('users').select('*');
      if (!error && data) return data;
    }
    const data = localStorage.getItem(STORAGE_KEYS.USERS);
    return data ? JSON.parse(data) : INITIAL_USERS;
  },

  async saveUsers(users: User[]): Promise<void> {
    if (supabase) {
      await supabase.from('users').upsert(users);
    }
    localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(users));
  },

  async getExpenses(): Promise<MonthlyExpense[]> {
    if (supabase) {
      const { data, error } = await supabase.from('monthly_expenses').select('*');
      if (!error && data) return data;
    }
    const data = localStorage.getItem(STORAGE_KEYS.EXPENSES);
    return data ? JSON.parse(data) : [];
  },

  async saveExpenses(expenses: MonthlyExpense[]): Promise<void> {
    if (supabase) {
      await supabase.from('monthly_expenses').upsert(expenses);
    }
    localStorage.setItem(STORAGE_KEYS.EXPENSES, JSON.stringify(expenses));
  }
};
