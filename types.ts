
export type ThemeType = 'deep' | 'light' | 'slate';

export enum ServiceType {
  PREVENTIVE = 'Preventivo',
  CORRECTIVE = 'Corretivo',
  IMPROVEMENT = 'Melhoria',
  PREDICTIVE = 'Preditivo'
}

export enum OSStatus {
  OPEN = 'Aberta',
  FINISHED = 'Finalizada',
  PAUSED = 'Pausada'
}

export enum UserRole {
  ADMIN = 'ADM',
  TECHNICIAN = 'TECNICO',
  GLOBAL_ADMIN = 'GLOBAL_ADMIN',
  BOARD_MEMBER = 'BOARD_MEMBER'
}

export interface InventoryItem {
  id: string;
  name: string;
  cost: number;
  stock: number;
  minStock: number;
  unit: string;
  unitId: string;
}

export interface MonthlyExpense {
  id: string;
  unitId: string;
  month: number; // 0-11
  year: number;
  totalRealCost: number;
  notes?: string;
}

export interface User {
  id: string;
  name: string;
  role: UserRole;
  unitId: string;
  hourlyRate: number;
  language: 'pt' | 'en' | 'es';
}

export interface Unit {
  id: string;
  name: string;
  country: string;
  currency: string;
  shareDashboard: boolean;
  costReductionGoal: number;
}

export interface ServiceOrder {
  id: string;
  technicianId: string;
  requestDate: string;
  deadline: string;
  executionDate?: string;
  timeSpent: number;
  type: ServiceType;
  status: OSStatus;
  description: string;
  sector: string;
  unitId: string;
  cost?: number;
  partsUsed?: { itemId: string; quantity: number; cost: number }[];
  lastUpdated?: number;
}

export interface CloudSyncState {
  plantKey: string;
  isSyncing: boolean;
  lastSync: Date | null;
  status: 'online' | 'offline' | 'error';
}

export interface ChatMessage {
  role: 'user' | 'model';
  text: string;
  timestamp: Date;
}

export interface PredictionRisk {
  sector: string;
  equipment: string;
  riskLevel: string;
  probability: number;
  recommendation: string;
  estimatedSaving: number;
}

export interface DetailedAIReport {
  title: string;
  date: string;
  summary: string;
  sections: { title: string; content: string }[];
  recommendations: string[];
}
