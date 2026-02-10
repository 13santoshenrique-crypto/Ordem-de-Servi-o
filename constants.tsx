
import { ServiceOrder, ServiceType, OSStatus, User, UserRole, Unit, InventoryItem, Asset, AuditQuestion } from './types';

export const LUZIANIA_UNIT_ID = 'u1';
export const UBERABA_UNIT_ID = 'u2';

export const PETERSIME_AUTH_URL = "https://www.mypetersime.com/";

// --- TEMPLATE DE AUDITORIA EXCEL ---
// Fix: Added missing 'options' property to satisfy AuditQuestion interface requirements
export const AUDIT_TEMPLATE_SGI: Omit<AuditQuestion, 'score'>[] = [
  { id: 'q1', category: 'Biossegurança', text: 'Arco de desinfecção de veículos operando com pressão correta?', weight: 5, options: [{ label: 'Conforme', value: 10 }, { label: 'Não Conforme', value: 0 }] },
  { id: 'q2', category: 'Biossegurança', text: 'Registro de entrada/saída de visitantes sem pendências?', weight: 4, options: [{ label: 'Conforme', value: 10 }, { label: 'Não Conforme', value: 0 }] },
  { id: 'q3', category: 'Biossegurança', text: 'Barreiras sanitárias (pedilúvios) com solução ativa?', weight: 5, options: [{ label: 'Conforme', value: 10 }, { label: 'Não Conforme', value: 0 }] },
  { id: 'q4', category: 'Infraestrutura', text: 'Integridade de telas contra pássaros e roedores?', weight: 5, options: [{ label: 'Conforme', value: 10 }, { label: 'Não Conforme', value: 0 }] },
  { id: 'q5', category: 'Infraestrutura', text: 'Estado de conservação das calçadas e pátios externos?', weight: 2, options: [{ label: 'Conforme', value: 10 }, { label: 'Não Conforme', value: 0 }] },
  { id: 'q6', category: 'Manutenção', text: 'Motores e geradores sem vazamentos de óleo visíveis?', weight: 4, options: [{ label: 'Conforme', value: 10 }, { label: 'Não Conforme', value: 0 }] },
  { id: 'q7', category: 'Manutenção', text: 'Painéis elétricos identificados e termografados?', weight: 3, options: [{ label: 'Conforme', value: 10 }, { label: 'Não Conforme', value: 0 }] },
  { id: 'q8', category: 'Documentação', text: 'AVCB e Licenças Ambientais dentro da validade?', weight: 5, options: [{ label: 'Conforme', value: 10 }, { label: 'Não Conforme', value: 0 }] },
  { id: 'q9', category: 'Documentação', text: 'Prontuários de NR-13 (Vasos de Pressão) atualizados?', weight: 5, options: [{ label: 'Conforme', value: 10 }, { label: 'Não Conforme', value: 0 }] },
  { id: 'q10', category: 'Segurança', text: 'EPIs em uso correto pela equipe técnica?', weight: 4, options: [{ label: 'Conforme', value: 10 }, { label: 'Não Conforme', value: 0 }] },
];

export const INITIAL_UNITS: Unit[] = [
  { id: LUZIANIA_UNIT_ID, name: 'Aviagen Luziânia', country: 'Brasil', currency: 'R$', shareDashboard: true, costReductionGoal: 15, annualBudget: 500000 },
  { id: UBERABA_UNIT_ID, name: 'Incubatório Uberaba', country: 'Brasil', currency: 'R$', shareDashboard: true, costReductionGoal: 10, annualBudget: 350000 }
];

export const INITIAL_INVENTORY: InventoryItem[] = [
  { id: 'p1', name: 'Motor Exaustor 5HP', cost: 1200.00, stock: 5, minStock: 2, unit: 'un', unitId: LUZIANIA_UNIT_ID },
  { id: 'p2', name: 'Contatora 24V Schneider', cost: 150.00, stock: 20, minStock: 5, unit: 'un', unitId: LUZIANIA_UNIT_ID },
  { id: 'p3', name: 'Graxa Industrial NLGI2', cost: 45.00, stock: 15, minStock: 10, unit: 'kg', unitId: LUZIANIA_UNIT_ID },
  { id: 'p4', name: 'Lâmpada LED Industrial', cost: 85.00, stock: 50, minStock: 10, unit: 'un', unitId: UBERABA_UNIT_ID }
];

export const INITIAL_ASSETS: Asset[] = [
  { 
    id: 'a1', 
    name: 'Incubadora Múltiplo Estágio 01', 
    model: 'Petersime BioStreamer', 
    serialNumber: 'INC-2023-001', 
    sector: 'Mecânica', 
    status: 'OPERATIONAL', 
    unitId: LUZIANIA_UNIT_ID,
    maintenanceFreqDays: 21, 
    lastMaintenance: '2024-05-01',
    nextMaintenance: '2024-05-22',
    maintenancePlanName: 'Revisão Pós-Ciclo (21 Dias)'
  },
  { 
    id: 'a4', 
    name: 'Nascedouro Uberaba 01', 
    model: 'ChickMaster Classic', 
    serialNumber: 'UB-NASC-001', 
    sector: 'Elétrica', 
    status: 'OPERATIONAL', 
    unitId: UBERABA_UNIT_ID,
    maintenanceFreqDays: 30,
    lastMaintenance: '2024-05-01',
    nextMaintenance: '2024-06-01'
  }
];

export const INITIAL_USERS: User[] = [
  { id: 'adm-emerson', name: 'Emerson Henrique', role: UserRole.GLOBAL_ADMIN, unitId: LUZIANIA_UNIT_ID, hourlyRate: 150, language: 'pt', email: 'admin@aviagen.com' },
  { id: 'sup-uberaba', name: 'Supervisor Uberaba', role: UserRole.ADMIN, unitId: UBERABA_UNIT_ID, hourlyRate: 80, language: 'pt', email: 'uberaba@aviagen.com' },
  { id: 'tec-lhz', name: 'Manutenção Luziânia', role: UserRole.TECHNICIAN, unitId: LUZIANIA_UNIT_ID, hourlyRate: 45, language: 'pt', email: 'tec@aviagen.com' }
];

export const INITIAL_OS: ServiceOrder[] = [
  {
    id: 'OS-LHZ-001',
    technicianId: 'tec-lhz',
    requestDate: '2024-05-10',
    deadline: '2024-05-15',
    type: ServiceType.CORRECTIVE,
    status: OSStatus.OPEN,
    description: 'Manutenção em Luziânia',
    sector: 'Elétrica',
    unitId: LUZIANIA_UNIT_ID,
    timeSpent: 0
  },
  {
    id: 'OS-UB-001',
    technicianId: 'sup-uberaba',
    requestDate: '2024-05-12',
    deadline: '2024-05-20',
    type: ServiceType.PREVENTIVE,
    status: OSStatus.OPEN,
    description: 'Revisão Preventiva Uberaba',
    sector: 'Mecânica',
    unitId: UBERABA_UNIT_ID,
    timeSpent: 0
  }
];

export const SECTORS = ['Elétrica', 'Mecânica', 'Civil', 'Hidráulica', 'TI', 'Biossegurança', 'Logística'];
