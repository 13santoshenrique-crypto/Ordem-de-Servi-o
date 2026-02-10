
import React, { useState, useEffect, useMemo } from 'react';
import { ShieldAlert, AlertTriangle, CheckCircle, ArrowRight, BellRing, Lock, Clock } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { UserRole } from '../types';

const ComplianceAlert: React.FC = () => {
  const { tstAudit, currentUser, logAction, activeUnitId, setActiveUnitId, units } = useApp();
  const [isOpen, setIsOpen] = useState(false);
  const [acknowledged, setAcknowledged] = useState(false);

  // Identifica itens críticos DA UNIDADE ATIVA (vencidos ou vencendo em 30 dias)
  const criticalItems = useMemo(() => {
    const today = new Date();
    const thirtyDaysFromNow = new Date();
    thirtyDaysFromNow.setDate(today.getDate() + 30);

    return tstAudit.filter(item => {
      if (item.unitId !== activeUnitId) return false;
      const expDate = new Date(item.expirationDate);
      return expDate <= thirtyDaysFromNow;
    });
  }, [tstAudit, activeUnitId]);

  // Lógica de exibição: Somente Admins, se houver itens críticos na unidade visualizada
  useEffect(() => {
    const isAllowedRole = currentUser?.role === UserRole.ADMIN || currentUser?.role === UserRole.GLOBAL_ADMIN;
    
    if (!isAllowedRole || criticalItems.length === 0) {
      setIsOpen(false);
      return;
    }

    const currentMonthYear = new Date().getMonth() + '-' + new Date().getFullYear();
    const storageKey = `aviagen_compliance_review_${activeUnitId}_${currentMonthYear}`;
    const lastReview = localStorage.getItem(storageKey);

    if (lastReview !== 'SIGNED') {
      setIsOpen(true);
      setAcknowledged(false);
    }
  }, [currentUser, criticalItems, activeUnitId]);

  const handleAcknowledge = () => {
    if (!acknowledged) return;

    const currentMonthYear = new Date().getMonth() + '-' + new Date().getFullYear();
    const storageKey = `aviagen_compliance_review_${activeUnitId}_${currentMonthYear}`;
    localStorage.setItem(storageKey, 'SIGNED');
    setIsOpen(false);
    
    if (currentUser) {
      logAction(
        "COMPLIANCE_REVIEW_SIGNED", 
        `Administrador assinou o protocolo de ciência mensal de TST para a unidade ${activeUnitId}.`, 
        currentUser
      );
    }
  };

  const currentUnitName = units.find(u => u.id === activeUnitId)?.name || 'Unidade';

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-slate-900/90 backdrop-blur-xl animate-in fade-in duration-500">
      <div className="max-w-4xl w-full bg-white rounded-[3rem] shadow-[0_0_100px_rgba(227,27,35,0.3)] border-4 border-[#E31B23] overflow-hidden flex flex-col max-h-[90vh]">
        
        <div className="bg-[#E31B23] p-8 text-white flex items-center justify-between shrink-0">
          <div className="flex items-center gap-6">
            <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center animate-pulse">
              <ShieldAlert size={40} />
            </div>
            <div>
              <h2 className="text-3xl font-black uppercase italic tracking-tighter leading-none">Alerta de Conformidade: {currentUnitName}</h2>
              <p className="text-white/70 text-[10px] font-bold uppercase tracking-[0.3em] mt-2">Protocolo Obrigatório de Ciência Técnica</p>
            </div>
          </div>
          {currentUser?.role === UserRole.GLOBAL_ADMIN && (
             <div className="text-right">
                <p className="text-[10px] font-black uppercase opacity-60">Global Admin</p>
                <button 
                  onClick={() => setIsOpen(false)}
                  className="text-xs font-black bg-white/10 hover:bg-white/20 px-4 py-2 rounded-xl border border-white/20 transition-all"
                >
                    Sair desta Unidade
                </button>
             </div>
          )}
        </div>

        <div className="flex-1 overflow-y-auto p-10 custom-scrollbar space-y-8 bg-slate-50">
          <div className="flex items-center gap-3 p-4 bg-amber-50 border border-amber-200 rounded-2xl text-amber-700">
            <BellRing size={20} className="animate-bounce" />
            <p className="text-xs font-bold uppercase tracking-tight">
              {criticalItems.length} itens de TST pendentes nesta unidade. Visualize para liberar o acesso.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-4">
            {criticalItems.map(item => {
              const isExpired = new Date(item.expirationDate) < new Date();
              return (
                <div key={item.id} className={`flex items-center justify-between p-6 bg-white rounded-2xl border ${isExpired ? 'border-red-200 bg-red-50/30' : 'border-slate-200 shadow-sm'}`}>
                  <div className="flex items-center gap-4">
                    <div className={`p-3 rounded-xl ${isExpired ? 'bg-red-100 text-red-600' : 'bg-amber-100 text-amber-600'}`}>
                      {isExpired ? <AlertTriangle size={24} /> : <Clock size={24} />}
                    </div>
                    <div>
                      <h4 className="font-black text-slate-900 uppercase italic leading-none">{item.name}</h4>
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">{item.category}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Expiração</p>
                    <p className={`text-sm font-black italic ${isExpired ? 'text-red-600' : 'text-slate-900'}`}>
                      {new Date(item.expirationDate).toLocaleDateString('pt-BR')}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="p-10 bg-white border-t border-slate-100 shrink-0 space-y-6">
          <div 
            onClick={() => setAcknowledged(!acknowledged)}
            className={`flex items-center gap-4 p-5 rounded-2xl border-2 transition-all cursor-pointer ${acknowledged ? 'bg-emerald-50 border-emerald-500 text-emerald-900' : 'bg-slate-50 border-slate-200 text-slate-500 hover:border-[#1A3673]'}`}
          >
            <div className={`w-6 h-6 rounded-md border-2 flex items-center justify-center transition-all ${acknowledged ? 'bg-emerald-500 border-emerald-500 text-white' : 'bg-white border-slate-300'}`}>
              {acknowledged && <CheckCircle size={16} />}
            </div>
            <span className="text-xs font-black uppercase tracking-widest select-none">
              Confirmo que visualizei os riscos técnicos da unidade {currentUnitName}.
            </span>
          </div>

          <button 
            onClick={handleAcknowledge}
            disabled={!acknowledged}
            className={`w-full py-6 rounded-2xl font-black uppercase text-xs tracking-[0.2em] shadow-xl transition-all flex items-center justify-center gap-3 ${acknowledged ? 'bg-[#1A3673] text-white hover:bg-slate-900' : 'bg-slate-100 text-slate-300 cursor-not-allowed'}`}
          >
            <Lock size={18} /> Liberar Unidade <ArrowRight size={18} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default ComplianceAlert;
