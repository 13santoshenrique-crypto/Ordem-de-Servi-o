
import React, { useState } from 'react';
import { 
  Trash2, Pencil, UserPlus, X, Check, Shield, Building2, Terminal, Key, PlusCircle, Lock, 
  Globe, DollarSign, Target, Landmark, Plus, ShieldCheck, UserCheck
} from 'lucide-react';
import { User, UserRole, Unit } from '../types';
import { useApp } from '../context/AppContext';

interface AdminPanelProps {
  users: User[];
  units: Unit[];
  onAddUser: (user: Omit<User, 'id'>) => void;
  onUpdateUser: (userId: string, updates: Partial<User>) => void;
  onDeleteUser: (userId: string) => void;
  onAddUnit: (unit: Omit<Unit, 'id'>) => void;
  onUpdateUnit: (id: string, updates: Partial<Unit>) => void;
  onDeleteUnit: (id: string) => void;
  currentUser: User;
}

const AdminPanel: React.FC<AdminPanelProps> = ({ 
  users, units, onAddUser, onUpdateUser, onDeleteUser,
  onAddUnit, onUpdateUnit, onDeleteUnit, currentUser
}) => {
  const { auditLogs, activeUnitId } = useApp();
  const [showForm, setShowForm] = useState<'add_user' | 'edit_user' | 'add_unit' | 'edit_unit' | null>(null);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [editingUnit, setEditingUnit] = useState<Unit | null>(null);
  const [activeTab, setActiveTab] = useState<'users' | 'units_manage' | 'audit'>('units_manage');
  
  const isEmerson = currentUser.role === UserRole.GLOBAL_ADMIN;

  const [unitFormData, setUnitFormData] = useState<Omit<Unit, 'id'>>({
      name: '', country: 'Brasil', currency: 'R$', shareDashboard: true, costReductionGoal: 10, annualBudget: 0
  });

  const [userFormData, setUserFormData] = useState<Omit<User, 'id'>>({
    name: '', role: UserRole.TECHNICIAN, unitId: activeUnitId, hourlyRate: 50, language: 'pt', email: '', password: ''
  });

  const handleSubmitUnit = (e: React.FormEvent) => {
    e.preventDefault();
    if (showForm === 'add_unit') onAddUnit(unitFormData);
    else if (editingUnit) onUpdateUnit(editingUnit.id, unitFormData);
    setShowForm(null);
  };

  const handleSubmitUser = (e: React.FormEvent) => {
    e.preventDefault();
    if (showForm === 'add_user') onAddUser(userFormData);
    else if (editingUser) onUpdateUser(editingUser.id, userFormData);
    setShowForm(null);
  };

  return (
    <div className="space-y-10 animate-in fade-in duration-500 pb-20">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 pt-6">
        <div>
          <h2 className="text-3xl font-black text-[#1A3673] uppercase tracking-tighter italic">Governança & Expansão</h2>
          <p className="text-slate-400 text-xs font-bold uppercase tracking-widest mt-1">
             Controle Centralizado do Ecossistema Aviagen
          </p>
        </div>
        
        <div className="flex bg-white p-1.5 rounded-2xl border border-slate-200 shadow-sm overflow-x-auto no-scrollbar">
            {isEmerson && (
                <button 
                    onClick={() => setActiveTab('units_manage')} 
                    className={`px-8 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all flex items-center gap-2 ${activeTab === 'units_manage' ? 'bg-[#1A3673] text-white shadow-lg' : 'text-slate-400 hover:text-slate-700'}`}
                >
                    <Building2 size={14} /> Unidades Industriais
                </button>
            )}
            <button 
                onClick={() => setActiveTab('users')} 
                className={`px-8 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all flex items-center gap-2 ${activeTab === 'users' ? 'bg-[#1A3673] text-white shadow-lg' : 'text-slate-400 hover:text-slate-700'}`}
            >
                <UserCheck size={14} /> Gestão de Equipe
            </button>
            <button 
                onClick={() => setActiveTab('audit')} 
                className={`px-8 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all flex items-center gap-2 ${activeTab === 'audit' ? 'bg-[#1A3673] text-white shadow-lg' : 'text-slate-400 hover:text-slate-700'}`}
            >
                <Terminal size={14} /> Logs de Auditoria
            </button>
        </div>
      </div>

      {activeTab === 'units_manage' && (
        <div className="space-y-6">
            <div className="flex justify-between items-center bg-white p-10 rounded-[2.5rem] border border-slate-100 shadow-sm">
                <div>
                   <h3 className="text-xl font-black text-[#1A3673] uppercase italic">Plantas Operacionais</h3>
                   <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Gerencie a expansão global da rede Aviagen</p>
                </div>
                {isEmerson && (
                  <button onClick={() => { setUnitFormData({name: '', country: 'Brasil', currency: 'R$', shareDashboard: true, costReductionGoal: 10, annualBudget: 0}); setShowForm('add_unit'); }} className="bg-[#1A3673] text-white px-8 py-4 rounded-2xl shadow-xl hover:bg-slate-900 transition-all flex items-center gap-3">
                      <Plus size={20} /><span className="text-[10px] font-black uppercase tracking-widest">Nova Unidade</span>
                  </button>
                )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {units.map(unit => (
                    <div key={unit.id} className="industrial-card p-10 rounded-[3rem] relative group border-2 border-transparent hover:border-[#1A3673] bg-white">
                        <div className="absolute top-8 right-8 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button onClick={() => { setEditingUnit(unit); setUnitFormData({...unit}); setShowForm('edit_unit'); }} className="p-3 bg-blue-50 text-blue-600 rounded-xl hover:bg-blue-600 hover:text-white transition-all"><Pencil size={18} /></button>
                            <button onClick={() => onDeleteUnit(unit.id)} className="p-3 bg-red-50 text-red-600 rounded-xl hover:bg-red-600 hover:text-white transition-all"><Trash2 size={18} /></button>
                        </div>

                        <div className="space-y-8">
                            <div className="flex items-center gap-5">
                                <div className="p-4 bg-blue-50 text-[#1A3673] rounded-2xl shadow-inner">
                                    <Building2 size={28} />
                                </div>
                                <div>
                                    <h4 className="text-xl font-black text-slate-900 uppercase italic tracking-tighter">{unit.name}</h4>
                                    <div className="flex items-center gap-1.5 mt-1 text-slate-400">
                                        <Globe size={10} />
                                        <span className="text-[9px] font-black uppercase tracking-widest">{unit.country}</span>
                                    </div>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                                    <p className="text-[8px] font-black text-slate-400 uppercase mb-1">Budget Anual</p>
                                    <p className="text-sm font-black text-slate-800 italic">{unit.currency} {(unit.annualBudget/1000).toFixed(0)}k</p>
                                </div>
                                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                                    <p className="text-[8px] font-black text-slate-400 uppercase mb-1">Meta Poupança</p>
                                    <p className="text-sm font-black text-emerald-600 italic">{unit.costReductionGoal}%</p>
                                </div>
                            </div>

                            <div className="flex items-center justify-between pt-6 border-t border-slate-100">
                                <div className="flex items-center gap-2">
                                    <div className={`w-2 h-2 rounded-full ${unit.id === activeUnitId ? 'bg-emerald-500 animate-pulse' : 'bg-slate-300'}`}></div>
                                    <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest">{unit.id === activeUnitId ? 'Unidade Selecionada' : 'ID: ' + unit.id}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
      )}

      {activeTab === 'users' && (
        <div className="space-y-6">
            <div className="flex justify-between items-center bg-white p-10 rounded-[2.5rem] border border-slate-100 shadow-sm">
                <div>
                   <h3 className="text-xl font-black text-[#1A3673] uppercase italic">Equipe Técnica</h3>
                   <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Gestão de colaboradores e níveis de acesso</p>
                </div>
                {isEmerson && (
                    <button onClick={() => { setUserFormData({...userFormData, unitId: activeUnitId}); setShowForm('add_user'); }} className="bg-[#1A3673] text-white px-8 py-4 rounded-2xl shadow-xl hover:bg-slate-900 transition-all flex items-center gap-3">
                        <UserPlus size={20} /><span className="text-[10px] font-black uppercase tracking-widest">Novo Usuário</span>
                    </button>
                )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {users.map(user => (
                    <div key={user.id} className="industrial-card p-8 rounded-[3rem] bg-white relative group">
                        {isEmerson && (
                            <div className="absolute top-8 right-8 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                <button onClick={() => { setEditingUser(user); setUserFormData({...user}); setShowForm('edit_user'); }} className="p-2.5 bg-blue-50 text-blue-600 rounded-xl hover:bg-blue-600 hover:text-white transition-all"><Pencil size={16} /></button>
                                <button onClick={() => onDeleteUser(user.id)} className="p-2.5 bg-red-50 text-red-600 rounded-xl hover:bg-red-600 hover:text-white transition-all"><Trash2 size={16} /></button>
                            </div>
                        )}
                        <div className="flex flex-col items-center text-center">
                            <div className="w-20 h-20 bg-[#1A3673] text-white rounded-[1.5rem] flex items-center justify-center text-3xl font-black italic mb-4 shadow-xl">
                                {user.name.charAt(0)}
                            </div>
                            <h4 className="text-lg font-black text-slate-900 uppercase italic leading-none mb-1">{user.name}</h4>
                            <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">{user.role}</p>
                            <p className="mt-3 text-[9px] font-black text-[#1A3673] bg-blue-50 px-3 py-1 rounded-lg uppercase tracking-widest">
                                {units.find(u => u.id === user.unitId)?.name || 'Unidade Indefinida'}
                            </p>
                        </div>
                    </div>
                ))}
            </div>
        </div>
      )}

      {/* MODAL UNIDADE (O QUE FALTAVA) */}
      {(showForm === 'add_unit' || showForm === 'edit_unit') && (
        <div className="fixed inset-0 bg-slate-900/70 backdrop-blur-md z-[2000] flex items-center justify-center p-6 animate-in fade-in">
           <div className="bg-white max-w-xl w-full p-12 rounded-[4rem] shadow-3xl animate-in zoom-in-95 max-h-[90vh] overflow-y-auto">
              <div className="flex justify-between items-center mb-10">
                <h2 className="text-2xl font-black text-slate-900 uppercase italic">
                    {showForm === 'add_unit' ? 'Ativar Nova Planta' : 'Configurações da Unidade'}
                </h2>
                <button onClick={() => setShowForm(null)} className="text-slate-300 hover:text-red-500 transition-colors"><X size={28}/></button>
              </div>

              <form onSubmit={handleSubmitUnit} className="space-y-8">
                 <div className="space-y-2">
                    <label className="industrial-label">Nome Oficial (Ex: Incubatório Uberaba)</label>
                    <div className="relative">
                        <Building2 className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
                        <input type="text" required placeholder="Nome da Unidade" className="industrial-input pl-12" value={unitFormData.name} onChange={e => setUnitFormData({...unitFormData, name: e.target.value})}/>
                    </div>
                 </div>

                 <div className="grid grid-cols-2 gap-8">
                    <div className="space-y-2">
                        <label className="industrial-label">País</label>
                        <div className="relative">
                            <Globe className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
                            <input type="text" required className="industrial-input pl-12" value={unitFormData.country} onChange={e => setUnitFormData({...unitFormData, country: e.target.value})}/>
                        </div>
                    </div>
                    <div className="space-y-2">
                        <label className="industrial-label">Moeda (R$, US$, €)</label>
                        <div className="relative">
                            <DollarSign className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
                            <input type="text" required maxLength={3} className="industrial-input pl-12" value={unitFormData.currency} onChange={e => setUnitFormData({...unitFormData, currency: e.target.value})}/>
                        </div>
                    </div>
                 </div>

                 <div className="grid grid-cols-2 gap-8">
                    <div className="space-y-2">
                        <label className="industrial-label">Budget Anual OPEX</label>
                        <div className="relative">
                            <Landmark className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
                            <input type="number" required className="industrial-input pl-12" value={unitFormData.annualBudget} onChange={e => setUnitFormData({...unitFormData, annualBudget: Number(e.target.value)})}/>
                        </div>
                    </div>
                    <div className="space-y-2">
                        <label className="industrial-label">Meta Redução Custos (%)</label>
                        <div className="relative">
                            <Target className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
                            <input type="number" required className="industrial-input pl-12" value={unitFormData.costReductionGoal} onChange={e => setUnitFormData({...unitFormData, costReductionGoal: Number(e.target.value)})}/>
                        </div>
                    </div>
                 </div>

                 <button type="submit" className="w-full py-6 bg-[#1A3673] text-white rounded-2xl font-black uppercase text-xs tracking-widest shadow-2xl flex items-center justify-center gap-3">
                    <Check size={20} /> {showForm === 'add_unit' ? 'Ativar Unidade Industrial' : 'Atualizar Planta'}
                 </button>
              </form>
           </div>
        </div>
      )}

      {/* MODAL USUÁRIO */}
      {(showForm === 'add_user' || showForm === 'edit_user') && (
        <div className="fixed inset-0 bg-slate-900/70 backdrop-blur-md z-[2000] flex items-center justify-center p-6 animate-in fade-in">
           <div className="bg-white max-w-xl w-full p-12 rounded-[4rem] shadow-3xl animate-in zoom-in-95 max-h-[90vh] overflow-y-auto">
              <div className="flex justify-between items-center mb-10">
                <h2 className="text-2xl font-black text-slate-900 uppercase italic">
                    {showForm === 'add_user' ? 'Registrar Profissional' : 'Editar Colaborador'}
                </h2>
                <button onClick={() => setShowForm(null)} className="text-slate-300 hover:text-red-500 transition-colors"><X size={28}/></button>
              </div>

              <form onSubmit={handleSubmitUser} className="space-y-8">
                 <div className="space-y-2">
                    <label className="industrial-label">Nome Completo</label>
                    <input type="text" required className="industrial-input uppercase" value={userFormData.name} onChange={e => setUserFormData({...userFormData, name: e.target.value})}/>
                 </div>

                 <div className="grid grid-cols-2 gap-8">
                    <div className="space-y-2">
                        <label className="industrial-label">Unidade</label>
                        <select className="industrial-input" value={userFormData.unitId} onChange={e => setUserFormData({...userFormData, unitId: e.target.value})}>
                            {units.map(u => <option key={u.id} value={u.id}>{u.name}</option>)}
                        </select>
                    </div>
                    <div className="space-y-2">
                        <label className="industrial-label">Nível de Acesso</label>
                        <select className="industrial-input" value={userFormData.role} onChange={e => setUserFormData({...userFormData, role: e.target.value as UserRole})}>
                            <option value={UserRole.TECHNICIAN}>Manutenção</option>
                            <option value={UserRole.ADMIN}>Supervisor</option>
                            <option value={UserRole.GLOBAL_ADMIN}>Diretor Global</option>
                        </select>
                    </div>
                 </div>

                 <div className="space-y-2">
                    <label className="industrial-label">E-mail Corporativo</label>
                    <input type="email" required className="industrial-input" value={userFormData.email} onChange={e => setUserFormData({...userFormData, email: e.target.value})}/>
                 </div>

                 <button type="submit" className="w-full py-6 bg-[#1A3673] text-white rounded-2xl font-black uppercase text-xs tracking-widest shadow-2xl flex items-center justify-center gap-3">
                    <Check size={20} /> {showForm === 'add_user' ? 'Cadastrar Profissional' : 'Salvar Alterações'}
                 </button>
              </form>
           </div>
        </div>
      )}

      {activeTab === 'audit' && (
        <div className="industrial-card p-10 bg-white space-y-8 rounded-[3rem]">
           <div className="flex items-center gap-4 mb-6">
              <Terminal className="text-[#1A3673]" size={28} />
              <h3 className="text-xl font-black text-slate-900 uppercase italic">Logs de Operação</h3>
           </div>
           <div className="space-y-3 overflow-y-auto max-h-[600px] pr-4 custom-scrollbar">
              {auditLogs.map(log => (
                 <div key={log.id} className="p-5 bg-slate-50 border border-slate-100 rounded-2xl flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="flex items-center gap-4">
                        <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-[10px] font-black text-[#1A3673] border border-slate-100 uppercase">
                            {log.userName.charAt(0)}
                        </div>
                        <div>
                            <p className="text-[10px] font-black text-[#1A3673] uppercase tracking-widest">{log.action}</p>
                            <p className="text-xs text-slate-600 font-medium">{log.details}</p>
                        </div>
                    </div>
                    <div className="text-right">
                        <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">{new Date(log.timestamp).toLocaleString()}</p>
                        <p className="text-[9px] font-bold text-slate-500 uppercase">{log.userName}</p>
                    </div>
                 </div>
              ))}
           </div>
        </div>
      )}
    </div>
  );
};

export default AdminPanel;
