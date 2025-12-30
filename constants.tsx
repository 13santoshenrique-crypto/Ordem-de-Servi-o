
import { ServiceOrder, ServiceType, OSStatus, User, UserRole, Unit, InventoryItem } from './types';

export const INITIAL_UNITS: Unit[] = [
  { id: 'u1', name: 'Aviagen Luziânia', country: 'Brasil', currency: 'BRL', shareDashboard: true, costReductionGoal: 15 },
  { id: 'u2', name: 'Aviagen Alabama', country: 'EUA', currency: 'USD', shareDashboard: true, costReductionGoal: 10 }
];

export const INITIAL_INVENTORY: InventoryItem[] = [
  // Unidade u1
  { id: 'p1', name: 'Motor Exaustor 5HP', cost: 1200.00, stock: 5, minStock: 2, unit: 'un', unitId: 'u1' },
  { id: 'p2', name: 'Contatora 24V Schneider', cost: 150.00, stock: 20, minStock: 5, unit: 'un', unitId: 'u1' },
  // Unidade u2
  { id: 'p3', name: 'Motor de Ventoinha 10HP', cost: 450.00, stock: 3, minStock: 2, unit: 'un', unitId: 'u2' }
];

export const INITIAL_USERS: User[] = [
  { id: 'adm-global', name: 'Emerson Henrique', role: UserRole.GLOBAL_ADMIN, unitId: 'u1', hourlyRate: 200, language: 'pt' },
  { id: 'adm-lhz', name: 'Gestor Luziânia', role: UserRole.ADMIN, unitId: 'u1', hourlyRate: 100, language: 'pt' },
  { id: 'adm-ala', name: 'Gerente Alabama', role: UserRole.ADMIN, unitId: 'u2', hourlyRate: 80, language: 'en' },
  { id: 'tech-lhz', name: 'Técnico Luziânia', role: UserRole.TECHNICIAN, unitId: 'u1', hourlyRate: 45, language: 'pt' }
];

export const INITIAL_OS: ServiceOrder[] = [
  {
    id: 'OS-LHZ-001',
    technicianId: 'tech-lhz',
    requestDate: '2024-05-10',
    deadline: '2024-05-15',
    type: ServiceType.CORRECTIVE,
    status: OSStatus.OPEN,
    description: 'Manutenção em quadro elétrico principal',
    sector: 'Elétrica',
    unitId: 'u1',
    timeSpent: 0
  },
  {
    id: 'OS-ALA-001',
    technicianId: 'adm-ala',
    requestDate: '2024-05-12',
    deadline: '2024-05-20',
    type: ServiceType.PREVENTIVE,
    status: OSStatus.OPEN,
    description: 'Inspeção Geral da Planta Alabama',
    sector: 'Mecânica',
    unitId: 'u2',
    timeSpent: 0
  }
];

export const SECTORS = ['Elétrica', 'Mecânica', 'Civil', 'Hidráulica', 'TI', 'Biossegurança', 'Logística'];
