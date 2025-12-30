
import React, { useState } from 'react';
import { 
  Users, Building, UserPlus, 
  Trash2, Plus, Globe, X, Edit3, Save, HardHat
} from 'lucide-react';
import { User, UserRole, Unit } from '../types';

interface AdminPanelProps {
  users: User[];
  units: Unit[];
  onAddUser: (user: Omit<User, 'id'>) => void;
  onUpdateUser: (userId: string, updates: Partial<User>) => void;
  onDeleteUser: (userId: string) => void;
  onAddUnit: (unit: Unit) => void;
  onUpdateUnit: (unitId: string, updates: Partial<Unit>) => void;
  onDeleteUnit: (unitId: string) => void;
  currentUser: User;
}

const AdminPanel: React.FC<AdminPanelProps> = ({ 
  users, units, onAddUser, onUpdateUser, onDeleteUser, onAddUnit, onDeleteUnit
}) => {
  const [activeTab, setActiveTab] = useState<'users' | 'units'>('units');
  const [showUnitForm, setShowUnitForm] = useState(false);
  const [showUserForm, setShowUserForm] = useState<'add' | 'edit' | null>(null);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);

  const [newUnit, setNewUnit] = useState<Unit>({
    id: '', name: '', country: '', currency: 'BRL', shareDashboard: true, costReductionGoal: 15
  });

  const [userData, setUserData] = useState<Omit<User, 'id'>>({
    name: '', role: UserRole.TECHNICIAN, unitId: units[0]?.id || '', hourlyRate: 50, language: 'pt'
  });

  const handleUnitSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onAddUnit({...newUnit, id: `u-${Date.now()}`});
    setShowUnitForm(false);
  };

  const handleOpenAddUser = () => {
    setUserData({ name: '', role: UserRole.TECHNICIAN, unitId: units[0]?.id || '', hourlyRate: 50, language: 'pt' });
    setShowUserForm('add');
  };

  const handleOpenEditUser = (user: User) => {
    setSelectedUser(user);
    setUserData({ 
      name: user.name, 
      role: user.role, 
      unitId: user.unitId, 
      hourlyRate: user.hourlyRate, 
      language: user.language 
    });
    setShowUserForm('edit');
  };

  const handleUserSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (showUserForm === 'add') {
      onAddUser(userData);
    } else if (showUserForm === 'edit' && selectedUser) {
      onUpdateUser(selectedUser.id, userData);
    }
    setShowUserForm(null);
    setSelectedUser(null);
  };

  return (
    <div className="space-y-10 animate-in fade-in duration-700">
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-8 border-b border-theme pb-10">
        <div>
          <h2 className="text-4xl font-black text-theme-main uppercase tracking-tighter mb-1 italic">Governança</h2>
          <p className="text-theme-muted text-[10px] font-black uppercase tracking-[0.4em]">Arquitetura Organizacional Aviagen</p>
        </div>
        
        <div className="flex glass rounded-[2rem] p-1.5 shadow-sm">
          <button 
            onClick={() => setActiveTab('units')}
            className={`flex items-center gap-3 px-10 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === 'units' ? 'bg-[#0047ba] text-white shadow-lg' : 'text-theme-muted'}`}
          >
            <Building size={16} /> Unidades
          </button>
          <button 
            onClick={() => setActiveTab('users')}
            className={`flex items-center gap-3 px-10 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === 'users' ? 'bg-[#0047ba] text-white shadow-lg' : 'text-theme-muted'}`}
          >
            <Users size={16} /> Usuários
          </button>
        </div>
      </header>

      {activeTab === 'units' ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
           <div onClick={() => setShowUnitForm(true)} className="industrial-card p-10 rounded-[3rem] border-dashed border-2 flex flex-col items-center justify-center text-theme-muted hover:border-[#0047ba] hover:text-[#0047ba] transition-all cursor-pointer group">
              <Plus size={40} className="mb-4 group-hover:scale-125 transition-transform" />
              <span className="font-black text-xs uppercase tracking-widest">Adicionar Planta</span>
           </div>
           {units.map(unit => (
              <div key={unit.id} className="industrial-card p-10 rounded-[3rem] group">
                 <div className="flex justify-between items-start mb-6">
                    <Globe size={32} className="text-[#0047ba]/20 group-hover:text-[#0047ba] transition-colors" />
                    <button onClick={() => onDeleteUnit(unit.id)} className="p-2 text-theme-muted hover:text-red-500 transition-colors"><Trash2 size={16}/></button>
                 </div>
                 <h4 className="text-2xl font-black text-theme-main uppercase tracking-tighter mb-1">{unit.name}</h4>
                 <p className="text-[10px] font-black text-theme-muted uppercase tracking-widest">{unit.country} // {unit.currency}</p>
              </div>
           ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
           <div onClick={handleOpenAddUser} className="industrial-card p-8 rounded-[2.5rem] border-dashed border-2 flex flex-col items-center justify-center text-theme-muted hover:border-[#0047ba] hover:text-[#0047ba] transition-all cursor-pointer group">
              <Plus size={32} className="mb-4" />
              <span className="font-black text-[10px] uppercase tracking-widest">Novo Acesso</span>
           </div>
           {users.map(user => (
              <div key={user.id} className="industrial-card p-8 rounded-[2.5rem] group hover:border-[#0047ba]/40 transition-all">
                 <div className="flex justify-between items-start mb-6">
                    <div className="w-10 h-10 rounded-xl bg-[#0047ba]/10 text-[#0047ba] flex items-center justify-center font-black">
                       {user.name.charAt(0)}
                    </div>
                    <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                       <button 
                         onClick={() => handleOpenEditUser(user)} 
                         className="p-2 text-theme-muted hover:text-[#0047ba]"
                         title="Editar Colaborador"
                       >
                         <Edit3 size={16}/>
                       </button>
                       <button 
                         onClick={() => onDeleteUser(user.id)} 
                         className="p-2 text-theme-muted hover:text-red-500"
                         title="Remover Acesso"
                       >
                         <Trash2 size={16}/>
                       </button>
                    </div>
                 </div>
                 <h4 className="text-lg font-black text-theme-main uppercase tracking-tight truncate mb-1">{user.name}</h4>
                 <p className="text-[9px] font-black text-[#0047ba] uppercase tracking-widest mb-4">{user.role}</p>
                 <div className="pt-4 border-t border-theme flex flex-col gap-1">
                    <span className="text-[9px] font-black text-theme-muted uppercase truncate">
                      Planta: <span className="text-theme-main">{units.find(u => u.id === user.unitId)?.name || 'N/A'}</span>
                    </span>
                    <span className="text-[9px] font-black text-theme-muted uppercase">
                      Custo H/H: <span className="text-emerald-500">R$ {user.hourlyRate}</span>
                    </span>
                 </div>
              </div>
           ))}
        </div>
      )}

      {/* MODAL PARA UNIDADES */}
      {showUnitForm && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[100] flex items-center justify-center p-6">
           <div className="bg-theme-card max-w-xl w-full p-12 rounded-[3.5rem] border border-theme shadow-3xl animate-in zoom-in-95">
              <div className="flex justify-between items-center mb-10">
                 <h2 className="text-2xl font-black text-theme-main uppercase italic tracking-tighter">Registrar Planta</h2>
                 <button onClick={() => setShowUnitForm(false)} className="text-theme-muted hover:text-red-500"><X size={24}/></button>
              </div>
              <form onSubmit={handleUnitSubmit} className="space-y-6">
                <div className="space-y-2">
                    <label className="text-[9px] font-black text-theme-muted uppercase tracking-widest ml-2">Nome da Unidade</label>
                    <input 
                      type="text" required placeholder="EX: AVIAGEN CAMPINAS"
                      className="w-full rounded-2xl py-4 px-6 text-sm font-bold uppercase outline-none"
                      value={newUnit.name} onChange={e => setNewUnit({...newUnit, name: e.target.value.toUpperCase()})}
                    />
                </div>
                <div className="grid grid-cols-2 gap-4">
                    <input 
                      type="text" required placeholder="PAÍS"
                      className="w-full rounded-2xl py-4 px-6 text-sm font-bold uppercase"
                      value={newUnit.country} onChange={e => setNewUnit({...newUnit, country: e.target.value.toUpperCase()})}
                    />
                    <input 
                      type="text" required placeholder="MOEDA (ISO)"
                      className="w-full rounded-2xl py-4 px-6 text-sm font-bold uppercase"
                      value={newUnit.currency} onChange={e => setNewUnit({...newUnit, currency: e.target.value.toUpperCase()})}
                    />
                </div>
                <button type="submit" className="w-full py-5 bg-[#0047ba] text-white font-black uppercase text-xs tracking-widest rounded-2xl shadow-xl transition-all">
                    Processar Registro
                </button>
              </form>
           </div>
        </div>
      )}

      {/* MODAL PARA USUÁRIOS (ADD/EDIT) */}
      {showUserForm && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[100] flex items-center justify-center p-6">
           <div className="bg-theme-card max-w-xl w-full p-12 rounded-[3.5rem] border border-theme shadow-3xl animate-in zoom-in-95">
              <div className="flex justify-between items-center mb-10">
                 <div className="flex items-center gap-4">
                    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-white ${showUserForm === 'add' ? 'bg-[#0047ba]' : 'bg-emerald-600'}`}>
                       {showUserForm === 'add' ? <Plus size={24} /> : <Edit3 size={24} />}
                    </div>
                    <div>
                       <h2 className="text-2xl font-black text-theme-main uppercase italic tracking-tighter">
                          {showUserForm === 'add' ? 'Habilitar Credencial' : 'Editar Colaborador'}
                       </h2>
                       <p className="text-[10px] font-black text-theme-muted uppercase tracking-widest">Controle de Acesso Aviagen</p>
                    </div>
                 </div>
                 <button onClick={() => { setShowUserForm(null); setSelectedUser(null); }} className="text-theme-muted hover:text-red-500"><X size={24}/></button>
              </div>
              
              <form onSubmit={handleUserSubmit} className="space-y-6">
                 <div className="space-y-2">
                    <label className="text-[9px] font-black text-theme-muted uppercase tracking-widest ml-2">Nome Completo</label>
                    <input 
                      type="text" required placeholder="EX: JOÃO SILVA"
                      className="w-full rounded-2xl py-5 px-6 text-sm font-bold uppercase outline-none focus:ring-2 focus:ring-[#0047ba]/20"
                      value={userData.name} onChange={e => setUserData({...userData, name: e.target.value.toUpperCase()})}
                    />
                 </div>

                 <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                       <label className="text-[9px] font-black text-theme-muted uppercase tracking-widest ml-2">Nível de Acesso</label>
                       <select 
                         className="w-full rounded-2xl py-4 px-6 text-sm font-bold uppercase outline-none cursor-pointer"
                         value={userData.role} onChange={e => setUserData({...userData, role: e.target.value as UserRole})}
                       >
                          {Object.values(UserRole).map(r => <option key={r} value={r} className="bg-slate-900">{r}</option>)}
                       </select>
                    </div>
                    <div className="space-y-2">
                       <label className="text-[9px] font-black text-theme-muted uppercase tracking-widest ml-2">Planta Alocada</label>
                       <select 
                         className="w-full rounded-2xl py-4 px-6 text-sm font-bold uppercase outline-none cursor-pointer"
                         value={userData.unitId} onChange={e => setUserData({...userData, unitId: e.target.value})}
                       >
                          {units.map(u => <option key={u.id} value={u.id} className="bg-slate-900">{u.name}</option>)}
                       </select>
                    </div>
                 </div>

                 <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                       <label className="text-[9px] font-black text-theme-muted uppercase tracking-widest ml-2">Custo Hora (R$)</label>
                       <input 
                         type="number" required
                         className="w-full rounded-2xl py-4 px-6 text-sm font-bold outline-none"
                         value={userData.hourlyRate} onChange={e => setUserData({...userData, hourlyRate: Number(e.target.value)})}
                       />
                    </div>
                    <div className="space-y-2">
                       <label className="text-[9px] font-black text-theme-muted uppercase tracking-widest ml-2">Idioma Preferencial</label>
                       <select 
                         className="w-full rounded-2xl py-4 px-6 text-sm font-bold uppercase outline-none"
                         value={userData.language} onChange={e => setUserData({...userData, language: e.target.value as 'pt' | 'en' | 'es'})}
                       >
                          <option value="pt" className="bg-slate-900">PORTUGUÊS</option>
                          <option value="en" className="bg-slate-900">ENGLISH</option>
                          <option value="es" className="bg-slate-900">ESPAÑOL</option>
                       </select>
                    </div>
                 </div>

                 <button type="submit" className={`w-full py-5 text-white font-black uppercase text-xs tracking-widest rounded-2xl shadow-xl transition-all active:scale-95 flex items-center justify-center gap-3 ${showUserForm === 'add' ? 'bg-[#0047ba]' : 'bg-emerald-600'}`}>
                    {showUserForm === 'add' ? <UserPlus size={18} /> : <Save size={18} />}
                    {showUserForm === 'add' ? 'Habilitar Acesso Industrial' : 'Salvar Alterações'}
                 </button>
              </form>
           </div>
        </div>
      )}
    </div>
  );
};

export default AdminPanel;
