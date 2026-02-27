
import React, { useState } from 'react';
import { 
  Trash2, Pencil, UserPlus, X, Check, Shield, Building2, Terminal, Key, PlusCircle, Lock, 
  Globe, DollarSign, Target, Landmark, Plus, ShieldCheck, UserCheck, Zap, Database, AlertOctagon, RefreshCw, Mail,
  Download, Upload, ShieldAlert
} from 'lucide-react';
import { User, UserRole, Unit, ServiceType, OSStatus } from '../types';
import { useApp } from '../context/AppContext';
import { SECTORS } from '../constants';

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
  const { 
    auditLogs, activeUnitId, setOrders, addNotification, resetRequests, 
    approveResetRequest, rejectResetRequest, exportSnapshot, importSnapshot 
  } = useApp();
  const [showForm, setShowForm] = useState<'add_user' | 'edit_user' | null>(null);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [activeTab, setActiveTab] = useState<'users' | 'audit' | 'stress' | 'resets' | 'backup'>('users');
  const [isGenerating, setIsGenerating] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  
  const isGlobalAdmin = currentUser.role === UserRole.GLOBAL_ADMIN;

  const [userFormData, setUserFormData] = useState<Omit<User, 'id'>>({
    name: '', role: UserRole.MAINTENANCE_OFFICER, unitId: activeUnitId, hourlyRate: 50, language: 'pt', email: '', password: ''
  });

  const handleSubmitUser = (e: React.FormEvent) => {
    e.preventDefault();
    if (showForm === 'add_user') onAddUser(userFormData);
    else if (editingUser) onUpdateUser(editingUser.id, userFormData);
    setShowForm(null);
  };

  // Filtra usuários: Global vê todos, Supervisor vê apenas da sua unidade
  const visibleUsers = isGlobalAdmin 
    ? users 
    : users.filter(u => u.unitId === currentUser.unitId);

  const handleOpenAddUser = () => {
      setUserFormData({ 
          name: '', 
          role: UserRole.MAINTENANCE_OFFICER, 
          // Se for Global, usa a unidade ativa. Se for Supervisor, FORÇA a unidade dele.
          unitId: isGlobalAdmin ? activeUnitId : currentUser.unitId, 
          hourlyRate: 50, 
          language: 'pt', 
          email: '', 
          password: '' 
      }); 
      setShowForm('add_user');
  };

  const handleStressTest = async (amount: number) => {
     setIsGenerating(true);
     await new Promise(r => setTimeout(r, 1000));
     
     const techIds = users.filter(u => u.unitId === activeUnitId).map(u => u.id);
     const newBatch = Array.from({ length: amount }).map((_, i) => ({
        id: `STRESS-${Date.now()}-${i}`,
        technicianId: techIds[Math.floor(Math.random() * techIds.length)] || 'admin',
        requestDate: new Date(Date.now() - Math.random() * 10000000000).toISOString().split('T')[0],
        deadline: new Date(Date.now() + Math.random() * 10000000000).toISOString().split('T')[0],
        type: [ServiceType.CORRECTIVE, ServiceType.PREVENTIVE, ServiceType.PREDICTIVE][Math.floor(Math.random()*3)],
        status: OSStatus.OPEN,
        description: `TESTE DE CARGA #${i+1}: Monitoramento de integridade estrutural e vibração em componentes críticos.`,
        sector: SECTORS[Math.floor(Math.random() * SECTORS.length)],
        unitId: activeUnitId,
        timeSpent: 0
     }));

     setOrders(prev => [...newBatch, ...prev]);
     addNotification({ type: 'success', title: 'Stress Test Concluído', message: `${amount} registros injetados na unidade atual.` });
     setIsGenerating(false);
  };

  const handleClearOrders = () => {
    if(confirm("Deseja APAGAR TODAS as OS desta unidade? Esta ação é irreversível.")) {
        setOrders(prev => prev.filter(o => o.unitId !== activeUnitId));
        addNotification({ type: 'warning', title: 'Dados Limpos', message: 'Histórico de OS resetado para esta planta.' });
    }
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
            <button 
                onClick={() => setActiveTab('users')} 
                className={`px-8 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all flex items-center gap-2 ${activeTab === 'users' ? 'bg-[#1A3673] text-white shadow-lg' : 'text-slate-400 hover:text-slate-700'}`}
            >
                <UserCheck size={14} /> Equipe
            </button>
            <button 
                onClick={() => setActiveTab('audit')} 
                className={`px-8 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all flex items-center gap-2 ${activeTab === 'audit' ? 'bg-[#1A3673] text-white shadow-lg' : 'text-slate-400 hover:text-slate-700'}`}
            >
                <Terminal size={14} /> Logs
            </button>
            {isGlobalAdmin && (
               <button 
                  onClick={() => setActiveTab('resets')} 
                  className={`px-8 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all flex items-center gap-2 ${activeTab === 'resets' ? 'bg-amber-600 text-white shadow-lg' : 'text-amber-400 hover:text-amber-600'}`}
               >
                  <Key size={14} /> Senhas {resetRequests.filter(r => r.status === 'PENDING').length > 0 && `(${resetRequests.filter(r => r.status === 'PENDING').length})`}
               </button>
            )}
            {isGlobalAdmin && (
               <button 
                  onClick={() => setActiveTab('backup')} 
                  className={`px-8 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all flex items-center gap-2 ${activeTab === 'backup' ? 'bg-emerald-600 text-white shadow-lg' : 'text-emerald-400 hover:text-emerald-600'}`}
               >
                  <Database size={14} /> Backup
               </button>
            )}
            {isGlobalAdmin && (
               <button 
                  onClick={() => setActiveTab('stress')} 
                  className={`px-8 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all flex items-center gap-2 ${activeTab === 'stress' ? 'bg-red-600 text-white shadow-lg' : 'text-red-400 hover:text-red-600'}`}
               >
                  <Zap size={14} /> Stress Test
               </button>
            )}
        </div>
      </div>

      {activeTab === 'stress' && isGlobalAdmin && (
         <div className="space-y-8 animate-in zoom-in-95">
            <div className="bg-white p-10 rounded-[3rem] border-2 border-red-100 shadow-xl relative overflow-hidden">
               <div className="absolute top-0 right-0 p-10 opacity-5 pointer-events-none"><AlertOctagon size={150} className="text-red-600" /></div>
               <div className="relative z-10">
                  <h3 className="text-2xl font-black text-red-600 uppercase italic mb-2">Simulador de Carga Industrial</h3>
                  <p className="text-slate-500 text-xs font-bold uppercase tracking-widest max-w-2xl leading-relaxed">
                     Utilize esta ferramenta para testar a robustez da interface e a velocidade do banco de dados. 
                     A geração de massa de dados simula meses de operação intensa em segundos.
                  </p>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-10">
                     {[100, 500, 1000].map(amount => (
                        <button 
                           key={amount}
                           disabled={isGenerating}
                           onClick={() => handleStressTest(amount)}
                           className="bg-white border-2 border-slate-100 p-8 rounded-[2rem] hover:border-red-500 transition-all group flex flex-col items-center text-center gap-4"
                        >
                           <div className="w-16 h-16 bg-red-50 text-red-600 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform">
                              {isGenerating ? <RefreshCw size={28} className="animate-spin" /> : <Zap size={28} />}
                           </div>
                           <div>
                              <p className="text-2xl font-black text-slate-900 italic">+{amount} OS</p>
                              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Injeção em Massa</p>
                           </div>
                        </button>
                     ))}
                  </div>

                  <div className="mt-12 pt-10 border-t border-slate-100 flex justify-between items-center">
                     <div>
                        <h4 className="text-sm font-black text-slate-900 uppercase">Limpeza de Ambiente</h4>
                        <p className="text-[10px] text-slate-400 font-bold uppercase mt-1">Remova todos os dados de teste desta unidade</p>
                     </div>
                     <button onClick={handleClearOrders} className="bg-red-50 text-red-600 px-8 py-4 rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-red-600 hover:text-white transition-all flex items-center gap-2">
                        <Trash2 size={16} /> Purga Geral OS
                     </button>
                  </div>
               </div>
            </div>
         </div>
      )}

      {activeTab === 'users' && (
        <div className="space-y-6">
            <div className="flex justify-between items-center bg-white p-10 rounded-[2.5rem] border border-slate-100 shadow-sm">
                <div>
                   <h3 className="text-xl font-black text-[#1A3673] uppercase italic">Equipe Técnica</h3>
                   <p className="text-slate-400 text-[10px] font-bold uppercase tracking-widest mt-1">
                      {isGlobalAdmin ? 'Visão Global da Organização' : `Colaboradores da Unidade Local`}
                   </p>
                </div>
                <button onClick={handleOpenAddUser} className="bg-[#1A3673] text-white px-8 py-4 rounded-2xl shadow-xl hover:bg-slate-900 transition-all flex items-center gap-3">
                    <UserPlus size={20} /><span className="text-[10px] font-black uppercase tracking-widest">Novo Usuário</span>
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {visibleUsers.map(user => (
                    <div key={user.id} className="industrial-card p-8 rounded-[3rem] bg-white relative group">
                        <div className="absolute top-8 right-8 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button onClick={() => { setEditingUser(user); setUserFormData({...user}); setShowForm('edit_user'); }} className="p-2.5 bg-blue-50 text-blue-600 rounded-xl hover:bg-blue-600 hover:text-white transition-all"><Pencil size={16} /></button>
                            <button onClick={() => onDeleteUser(user.id)} className="p-2.5 bg-red-50 text-red-600 rounded-xl hover:bg-red-600 hover:text-white transition-all"><Trash2 size={16} /></button>
                        </div>
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

      {/* MODAL DE USUÁRIOS */}
      {(showForm === 'add_user' || showForm === 'edit_user') && (
        <div className="fixed inset-0 bg-slate-900/70 backdrop-blur-md z-[2000] flex items-center justify-center p-6 animate-in fade-in">
           <div className="bg-white max-w-xl w-full p-12 rounded-[4rem] shadow-3xl animate-in zoom-in-95 max-h-[90vh] overflow-y-auto custom-scrollbar">
              <div className="flex justify-between items-center mb-10">
                <h2 className="text-2xl font-black text-slate-900 uppercase italic">
                    {showForm === 'add_user' ? 'Novo Colaborador' : 'Editar Perfil'}
                </h2>
                <button onClick={() => setShowForm(null)} className="text-slate-300 hover:text-red-500 transition-colors"><X size={28}/></button>
              </div>

              <form onSubmit={handleSubmitUser} className="space-y-8">
                 <div className="space-y-2">
                    <label className="industrial-label">Nome Completo</label>
                    <input type="text" required className="industrial-input" value={userFormData.name} onChange={e => setUserFormData({...userFormData, name: e.target.value})}/>
                 </div>
                 
                 <div className="space-y-2">
                    <label className="industrial-label">Email Corporativo</label>
                    <div className="relative">
                        <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
                        <input type="email" required className="industrial-input pl-12" value={userFormData.email} onChange={e => setUserFormData({...userFormData, email: e.target.value})}/>
                    </div>
                 </div>

                 <div className="grid grid-cols-2 gap-6">
                    <div className="space-y-2">
                       <label className="industrial-label">Função / Cargo</label>
                       <select className="industrial-input" value={userFormData.role} onChange={e => setUserFormData({...userFormData, role: e.target.value as UserRole})}>
                          {Object.values(UserRole).map(role => <option key={role} value={role}>{role}</option>)}
                       </select>
                    </div>
                    <div className="space-y-2">
                       <label className="industrial-label">Unidade Alocada {isGlobalAdmin ? '' : '(Fixa)'}</label>
                       <select 
                          className={`industrial-input ${!isGlobalAdmin ? 'bg-slate-100 text-slate-500' : ''}`}
                          value={userFormData.unitId} 
                          disabled={!isGlobalAdmin} // Apenas Global Admin pode mover usuários de unidade
                          onChange={e => setUserFormData({...userFormData, unitId: e.target.value})}
                       >
                          {units.filter(u => u.id === activeUnitId).map(u => <option key={u.id} value={u.id}>{u.name}</option>)}
                       </select>
                    </div>
                 </div>

                 <div className="grid grid-cols-2 gap-6">
                     <div className="space-y-2">
                        <label className="industrial-label">Valor Hora (H/H)</label>
                        <div className="relative">
                           <DollarSign className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={16} />
                           <input type="number" className="industrial-input pl-10" value={userFormData.hourlyRate} onChange={e => setUserFormData({...userFormData, hourlyRate: Number(e.target.value)})}/>
                        </div>
                     </div>
                     <div className="space-y-2">
                        <label className="industrial-label">Senha Acesso</label>
                        <input type="text" className="industrial-input" placeholder="Manter atual" value={userFormData.password || ''} onChange={e => setUserFormData({...userFormData, password: e.target.value})}/>
                     </div>
                 </div>

                 <button type="submit" className="w-full py-6 bg-[#1A3673] text-white rounded-2xl font-black uppercase text-xs tracking-widest shadow-2xl">Salvar Colaborador</button>
              </form>
           </div>
        </div>
      )}

      {activeTab === 'backup' && isGlobalAdmin && (
        <div className="space-y-8 animate-in zoom-in-95">
           <div className="bg-white p-10 rounded-[3rem] border border-slate-100 shadow-xl relative overflow-hidden">
              <div className="absolute top-0 right-0 p-10 opacity-5 pointer-events-none"><Database size={150} className="text-emerald-600" /></div>
              <div className="relative z-10">
                 <h3 className="text-2xl font-black text-emerald-600 uppercase italic mb-2">Segurança de Dados & Backup</h3>
                 <p className="text-slate-500 text-xs font-bold uppercase tracking-widest max-w-2xl leading-relaxed">
                    Proteja a integridade da operação Aviagen. Gere snapshots completos para armazenamento offline 
                    ou restaure o sistema em caso de migração de servidor local.
                 </p>
                 
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-10">
                    {/* Export Card */}
                    <div className="bg-slate-50 border-2 border-slate-100 p-10 rounded-[2.5rem] flex flex-col items-center text-center gap-6 hover:border-emerald-500 transition-all group">
                       <div className="w-20 h-20 bg-emerald-100 text-emerald-600 rounded-3xl flex items-center justify-center group-hover:scale-110 transition-transform shadow-inner">
                          <Download size={32} />
                       </div>
                       <div>
                          <h4 className="text-xl font-black text-slate-900 uppercase italic">Gerar Snapshot</h4>
                          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-2">Baixar banco de dados completo (.json)</p>
                       </div>
                       <button 
                          onClick={exportSnapshot}
                          className="w-full py-5 bg-emerald-600 text-white rounded-2xl font-black uppercase text-[10px] tracking-widest shadow-xl hover:bg-emerald-700 transition-all flex items-center justify-center gap-3"
                       >
                          <Download size={16} /> Iniciar Download
                       </button>
                    </div>

                    {/* Import Card */}
                    <div className="bg-slate-50 border-2 border-slate-100 p-10 rounded-[2.5rem] flex flex-col items-center text-center gap-6 hover:border-amber-500 transition-all group">
                       <div className="w-20 h-20 bg-amber-100 text-amber-600 rounded-3xl flex items-center justify-center group-hover:scale-110 transition-transform shadow-inner">
                          <Upload size={32} />
                       </div>
                       <div>
                          <h4 className="text-xl font-black text-slate-900 uppercase italic">Restaurar Sistema</h4>
                          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-2">Carregar arquivo de backup anterior</p>
                       </div>
                       <label className="w-full cursor-pointer">
                          <input 
                             type="file" 
                             className="hidden" 
                             accept=".json"
                             onChange={async (e) => {
                                const file = e.target.files?.[0];
                                if (!file) return;
                                if (confirm("ATENÇÃO: Restaurar um backup irá SOBRESCREVER todos os dados atuais. Deseja continuar?")) {
                                   setIsImporting(true);
                                   const success = await importSnapshot(file);
                                   if (success) {
                                      addNotification({ type: 'success', title: 'Restauração Concluída', message: 'O sistema foi atualizado com os dados do backup.' });
                                      window.location.reload(); // Força reload para garantir que todos os contextos peguem os novos dados
                                   } else {
                                      addNotification({ type: 'critical', title: 'Falha no Backup', message: 'O arquivo selecionado é inválido ou está corrompido.' });
                                   }
                                   setIsImporting(false);
                                }
                             }}
                          />
                          <div className="w-full py-5 bg-amber-600 text-white rounded-2xl font-black uppercase text-[10px] tracking-widest shadow-xl hover:bg-amber-700 transition-all flex items-center justify-center gap-3">
                             {isImporting ? <RefreshCw size={16} className="animate-spin" /> : <Upload size={16} />} 
                             {isImporting ? 'Processando...' : 'Selecionar Arquivo'}
                          </div>
                       </label>
                    </div>
                 </div>

                 <div className="mt-12 p-6 bg-amber-50 border border-amber-100 rounded-2xl flex items-start gap-4">
                    <ShieldAlert className="text-amber-600 shrink-0" size={20} />
                    <div>
                       <p className="text-[10px] font-black text-amber-800 uppercase tracking-widest">Aviso de Segurança</p>
                       <p className="text-[10px] font-bold text-amber-600 uppercase tracking-widest mt-1 leading-relaxed">
                          Recomendamos gerar um snapshot semanalmente. O arquivo contém informações sensíveis de usuários e histórico de manutenção. Guarde-o em local seguro.
                       </p>
                    </div>
                 </div>
              </div>
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
                    </div>
                 </div>
              ))}
           </div>
        </div>
      )}

      {activeTab === 'resets' && isGlobalAdmin && (
        <div className="industrial-card p-10 bg-white space-y-8 rounded-[3rem]">
           <div className="flex items-center gap-4 mb-6">
              <Key className="text-amber-600" size={28} />
              <h3 className="text-xl font-black text-slate-900 uppercase italic">Solicitações de Nova Senha</h3>
           </div>
           
           <div className="space-y-4">
              {resetRequests.length === 0 ? (
                <div className="p-10 text-center text-slate-400 font-bold uppercase text-xs">Nenhuma solicitação pendente</div>
              ) : (
                resetRequests.map(request => (
                  <div key={request.id} className={`p-6 rounded-2xl border flex flex-col md:flex-row md:items-center justify-between gap-6 transition-all ${request.status === 'PENDING' ? 'bg-amber-50 border-amber-100' : 'bg-slate-50 border-slate-100 opacity-60'}`}>
                    <div className="flex items-center gap-4">
                      <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-white shadow-md ${request.status === 'PENDING' ? 'bg-amber-500' : request.status === 'APPROVED' ? 'bg-emerald-500' : 'bg-red-500'}`}>
                        <Mail size={20} />
                      </div>
                      <div>
                        <p className="text-sm font-black text-slate-900 uppercase italic">{request.email}</p>
                        <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Solicitado em: {new Date(request.timestamp).toLocaleString()}</p>
                        <div className="mt-2 flex items-center gap-2">
                          <span className="text-[9px] font-black text-slate-400 uppercase">Nova Senha:</span>
                          <span className="text-[10px] font-black text-[#1A3673] bg-white px-2 py-0.5 rounded border border-slate-100">{request.requestedPassword}</span>
                        </div>
                      </div>
                    </div>

                    {request.status === 'PENDING' ? (
                      <div className="flex gap-2">
                        <button 
                          onClick={() => approveResetRequest(request.id)}
                          className="px-6 py-3 bg-emerald-600 text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-emerald-700 transition-all flex items-center gap-2"
                        >
                          <Check size={14} /> Aprovar
                        </button>
                        <button 
                          onClick={() => rejectResetRequest(request.id)}
                          className="px-6 py-3 bg-red-50 text-red-600 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-red-600 hover:text-white transition-all flex items-center gap-2"
                        >
                          <X size={14} /> Rejeitar
                        </button>
                      </div>
                    ) : (
                      <div className={`px-4 py-2 rounded-lg text-[9px] font-black uppercase tracking-widest ${request.status === 'APPROVED' ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'}`}>
                        {request.status === 'APPROVED' ? 'Aprovado' : 'Rejeitado'}
                      </div>
                    )}
                  </div>
                ))
              )}
           </div>
        </div>
      )}
    </div>
  );
};

export default AdminPanel;
