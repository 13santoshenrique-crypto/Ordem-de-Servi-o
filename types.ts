
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
  GLOBAL_ADMIN = 'GLOBAL_ADMIN'
}

export enum ActionStatus {
  PENDING = 'Pendente',
  IN_PROGRESS = 'Em Andamento',
  COMPLETED = 'Concluído',
  CANCELED = 'Cancelado'
}

export interface Unit {
  id: string;
  name: string;
  country: string;
  currency: string;
  shareDashboard: boolean;
  costReductionGoal: number;
  annualBudget: number;
  eagleTraxStatus?: 'CONNECTED' | 'DISCONNECTED';
  eagleTraxApiKey?: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  password?: string;
  role: UserRole;
  unitId: string;
  hourlyRate: number;
  language: 'pt' | 'en' | 'es';
}

export interface Asset {
  id: string;
  name: string;
  model: string;
  serialNumber: string;
  sector: string;
  status: 'OPERATIONAL' | 'MAINTENANCE' | 'STOPPED';
  unitId: string;
  lastMaintenance?: string;
  nextMaintenance?: string;
  maintenancePlanName?: string;
  eagleTraxData?: EagleTraxTelemetry;
  maintenanceFreqDays?: number;
  eagleTraxUrl?: string;
  components?: AssetComponent[];
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
  assetId?: string;
  unitId: string;
  cost?: number;
  partsUsed?: { itemId: string; quantity: number; cost: number; name: string }[];
  signature?: string;
}

export interface ActionPlan5W2H {
  id: string;
  what: string;
  why: string;
  where: string;
  when: string;
  who: string;
  how: string;
  howMuch: number;
  status: ActionStatus;
  unitId: string;
  sector: string;
  createdAt: string;
}

export interface MonthlyExpense {
  id: string;
  unitId: string;
  month: number;
  year: number;
  totalRealCost: number;
  notes?: string;
}

export interface AuditLogEntry {
  id: string;
  action: string;
  details: string;
  userId: string;
  userName: string;
  timestamp: string;
}

export interface AppNotification {
  id: string;
  type: 'info' | 'warning' | 'critical' | 'success';
  title: string;
  message: string;
  timestamp: Date;
  read: boolean;
}

export interface TSTAuditItem {
  id: string;
  name: string;
  inspectionDate: string;
  expirationDate: string;
  category: string;
  unitId: string;
}

export interface RecurringTask {
  id: string;
  title: string;
  description: string;
  sector: string;
  intervalDays: number;
  nextTriggerDate: string;
  active: boolean;
}

export interface ChatMessage {
  role: 'user' | 'model';
  text: string;
  timestamp: Date;
}

export interface PredictionRisk {
  equipment: string;
  riskLevel: string;
  probability: number;
  recommendation: string;
  estimatedSaving: number;
  sector: string;
}

export interface AuditQuestion {
  id: string;
  category: string;
  text: string;
  weight: number;
  score: number;
  options: { label: string; value: number }[];
  na?: boolean;
}

export interface AuditTemplate {
  id: string;
  name: string;
  questions: AuditQuestion[];
  importDate: string;
}

export interface AuditSimulation {
  id: string;
  title: string;
  date: string;
  auditorId: string;
  unitId: string;
  templateId: string;
  questions: AuditQuestion[];
  finalScore: number;
  status: 'DRAFT' | 'COMPLETED';
}

export interface DetailedAIReport {
  title: string;
  date: string;
  summary: string;
  sections: { title: string; content: string }[];
  recommendations: string[];
}

export type ThemeType = 'slate' | 'blue' | 'industrial';

export interface ExternalMaintenanceEvent {
  id: string;
  source: string;
  assetId: string;
  assetName: string;
  title: string;
  date: string;
  severity: string;
  description: string;
  confidence: number;
}

export interface AssetComponent {
  id: string;
  name: string;
  installDate: string;
  lifespanHours: number;
  currentHours: number;
  status: 'OK' | 'WARNING' | 'CRITICAL';
}

export interface EagleTraxTelemetry {
  temperature: number;
  humidity: number;
  co2: number;
  damper: number;
  turning: 'LEFT' | 'RIGHT' | 'LEVEL';
  programStep: number;
  totalDays: number;
  lastUpdate: string;
}
