
export enum ServiceType {
  PREVENTIVE = 'Preventivo',
  CORRECTIVE = 'Corretivo',
  IMPROVEMENT = 'Melhoria',
  PREDICTIVE = 'Preditivo',
  BIOSAFETY = 'Biosseguridade'
}

export enum OSStatus {
  OPEN = 'Aberta',
  FINISHED = 'Finalizada',
  PAUSED = 'Pausada',
  WAITING_PARTS = 'Aguardando Peças'
}

export enum UserRole {
  ADMIN = 'ADM',
  MAINTENANCE_OFFICER = 'Oficial de Manutenção',
  UTILITIES_OFFICER = 'Oficial de Utilidades',
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
  biosafetyScore: number;
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

export interface AssetDocument {
  id: string;
  name: string;
  url?: string;
  expirationDate?: string;
  type: 'MANUAL' | 'CERTIFICATE' | 'LICENSE' | 'OTHER';
}

export interface Asset {
  id: string;
  tag: string;
  name: string;
  model: string;
  serialNumber: string;
  sector: string;
  status: 'OPERATIONAL' | 'MAINTENANCE' | 'STOPPED';
  unitId: string;
  photoUrl?: string;
  lastMaintenance?: string;
  nextMaintenance?: string;
  manualUrl?: string; // Link para PDF do manual
  documents?: AssetDocument[];
  criticalParts?: string[]; // IDs de itens do estoque que são vitais para esta máquina
  maintenanceFreqDays?: number;
  components?: AssetComponent[];
  reliabilityIndex: number; // Score 0-100 calculado pela IA
  maintenancePlanName?: string;
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

export interface SafetyChecklist {
  energyLocked: boolean;
  ppeVerified: boolean;
  areaSignaled: boolean;
  riskAssessmentDone: boolean;
  sanitizationDone?: boolean; // Requisito Aviagen
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
  evidencePhoto?: string; 
  location?: { lat: number; lng: number }; 
  safetyCheck?: SafetyChecklist;
  technicalNotes?: string;
}

export interface GlobalAlert {
  id: string;
  title: string;
  message: string;
  severity: 'CRITICAL' | 'INFO';
  timestamp: string;
  author: string;
}

export interface AssetComponent {
  id: string;
  name: string;
  installDate: string;
  lifespanHours: number;
  currentHours: number;
  status: 'OK' | 'WARNING' | 'CRITICAL';
  inventoryItemId?: string;
}

export interface MonthlyExpense {
  id: string;
  unitId: string;
  month: number;
  year: number;
  totalRealCost: number;
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
  expirationDate: string;
  category: string;
  unitId: string;
  inspectionDate: string;
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

export interface AuditQuestion {
  id: string;
  category: string;
  text: string;
  weight: number;
  options: { label: string; value: number }[];
  score: number;
  na?: boolean;
}

export interface AuditTemplate {
  id: string;
  name: string;
  questions: Omit<AuditQuestion, 'score'>[];
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

export interface PredictionRisk {
  equipment: string;
  riskLevel: string;
  probability: number;
  recommendation: string;
  estimatedSaving: number;
  sector: string;
}

export interface DetailedAIReport {
  title: string;
  date: string;
  summary: string;
  sections: { title: string; content: string }[];
  recommendations: string[];
}

export interface ChatMessage {
  role: 'user' | 'model';
  text: string;
  timestamp: Date;
}

export interface PasswordResetRequest {
  id: string;
  email: string;
  requestedPassword: string;
  timestamp: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
}

export type ThemeType = 'slate' | 'blue' | 'emerald';

export interface ExternalMaintenanceEvent {
  id: string;
  title: string;
  assetName: string;
  description: string;
  date: string;
}

declare global {
  interface Window {
    aistudio: {
      hasSelectedApiKey: () => Promise<boolean>;
      openSelectKey: () => Promise<void>;
    };
  }
}
