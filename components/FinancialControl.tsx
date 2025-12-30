
import React, { useState, useMemo } from 'react';
import { 
  DollarSign, Calendar, Plus, History, Scale, TrendingUp, AlertCircle, FileText, CheckCircle2
} from 'lucide-react';
import { MonthlyExpense, Unit, ServiceOrder } from '../types';

interface FinancialControlProps {
  expenses: MonthlyExpense[];
  onAddExpense: (expense: Omit<MonthlyExpense, 'id'>) => void;
  unit: Unit;
  orders: ServiceOrder[];
}

const FinancialControl: React.FC<FinancialControlProps> = ({ expenses, onAddExpense, unit, orders }) => {
  const [formData, setFormData] = useState({
    month: new Date().getMonth(),
    year: new Date().getFullYear(),
    totalRealCost: 0,
    notes: ''
  });

  const months = [
    'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
    'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
  ];

  // Calcula o custo sistêmico (SGI) para o mês/ano selecionado
  const systemicCost = useMemo(() => {
    return orders
      .filter(o => {
        const d = new Date(o.requestDate);
        return d.getMonth() === formData.month && d.getFullYear() === formData.year;
      })
      .reduce((acc, o) => acc + (o.cost || 0), 0);
  }, [orders, formData.month, formData.year]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.totalRealCost <= 0) return alert("Informe um valor válido.");
    onAddExpense({ ...formData, unitId: unit.id });
    setFormData({ ...formData, totalRealCost: 0, notes: '' });
  };

  const diff = formData.totalRealCost - systemicCost;
  const accuracy = formData.totalRealCost > 0 ? (systemicCost / formData.totalRealCost) * 100 : 0;

  return (
    <div className="space-y-10 animate-in fade-in duration-700 pb-20">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h2 className="text-4xl font-black text-white uppercase tracking-tighter italic">Controle <span className="text-[#0047ba]">Financeiro</span> Real</h2>
          <p className="text-white/40 text-xs font-black uppercase tracking-[0.4em] mt-2">Conciliação de Notas Fiscais vs Dados Sistêmicos SGI</p>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        <div className="lg:col-span-1 glass-card p-10 rounded-[3.5rem] border border-white/5 space-y-8 h-fit shadow-2xl">
           <div className="flex items-center gap-4 mb-4">
              <div className="w-12 h-12 bg-[#0047ba] rounded-2xl flex items-center justify-center text-white">
                 <Plus size={24} />
              </div>
              <h3 className="text-xl font-black text-white uppercase tracking-tight">Entrada de Gasto Real</h3>
           </div>

           <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                 <div className="space-y-2">
                    <label className="text-[10px] font-black text-white/30 uppercase tracking-widest ml-1">Mês de Referência</label>
                    <select 
                      className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-4 text-white focus:outline-none focus:border-[#0047ba] appearance-none cursor-pointer text-xs font-bold"
                      value={formData.month}
                      onChange={(e) => setFormData({...formData, month: Number(e.target.value)})}
                    >
                      {months.map((m, i) => <option key={i} value={i} className="bg-slate-900">{m}</option>)}
                    </select>
                 </div>
                 <div className="space-y-2">
                    <label className="text-[10px] font-black text-white/30 uppercase tracking-widest ml-1">Ano</label>
                    <input 
                      type="number" 
                      className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-4 text-white focus:outline-none focus:border-[#0047ba] text-xs font-bold"
                      value={formData.year}
                      onChange={(e) => setFormData({...formData, year: Number(e.target.value)})}
                    />
                 </div>
              </div>

              <div className="space-y-2">
                 <label className="text-[10px] font-black text-white/30 uppercase tracking-widest ml-1">Valor Total Real (Soma de Notas)</label>
                 <div className="relative">
                    <div className="absolute left-6 top-1/2 -translate-y-1/2 text-[#0047ba] font-black">{unit.currency}</div>
                    <input 
                      type="number" 
                      className="w-full bg-white/5 border border-white/10 rounded-2xl py-6 pl-20 pr-8 text-white focus:outline-none focus:border-[#0047ba] font-black text-2xl"
                      placeholder="0.00"
                      value={formData.totalRealCost}
                      onChange={(e) => setFormData({...formData, totalRealCost: Number(e.target.value)})}
                    />
                 </div>
              </div>

              <div className="space-y-2">
                 <label className="text-[10px] font-black text-white/30 uppercase tracking-widest ml-1">Observações (Opcional)</label>
                 <textarea 
                   className="w-full bg-white/5 border border-white/10 rounded-2xl p-5 text-white text-xs focus:border-[#0047ba] outline-none resize-none"
                   rows={3}
                   placeholder="Detalhamento do fechamento..."
                   value={formData.notes}
                   onChange={(e) => setFormData({...formData, notes: e.target.value})}
                 />
              </div>

              <button type="submit" className="w-full py-6 bg-[#0047ba] hover:bg-[#e31b23] text-white font-black uppercase text-xs tracking-widest rounded-3xl shadow-2xl transition-all">
                 Registrar Fechamento Mensal
              </button>
           </form>
        </div>

        <div className="lg:col-span-2 space-y-8">
           <div className="glass p-10 rounded-[3.5rem] border border-white/5 bg-gradient-to-br from-[#0047ba]/5 to-transparent shadow-3xl">
              <h3 className="text-xl font-black text-white uppercase tracking-tighter mb-10 flex items-center gap-3">
                 <Scale size={24} className="text-[#e31b23]" />
                 Auditoria de Fechamento: {months[formData.month]} {formData.year}
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-10 mb-12">
                 <div className="space-y-4">
                    <div className="flex justify-between items-center text-[10px] font-black uppercase text-white/30 tracking-widest">
                       <span>Registrado no SGI (OS)</span>
                       <span className="text-[#0047ba]">{unit.currency} {systemicCost.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between items-center text-[10px] font-black uppercase text-white/30 tracking-widest">
                       <span>Valor Informado Real</span>
                       <span className="text-white">{unit.currency} {formData.totalRealCost.toLocaleString()}</span>
                    </div>
                    <div className="pt-4 border-t border-white/5 flex justify-between items-end">
                       <div>
                          <p className="text-[10px] font-black text-white/20 uppercase tracking-[0.2em]">Diferença de Caixa</p>
                          <p className={`text-3xl font-black tracking-tighter ${diff > 0 ? 'text-[#e31b23]' : 'text-emerald-400'}`}>
                             {unit.currency} {Math.abs(diff).toLocaleString()}
                          </p>
                       </div>
                       <div className="text-right">
                          <p className="text-[10px] font-black text-white/20 uppercase tracking-[0.2em]">Acuracidade SGI</p>
                          <p className="text-3xl font-black text-white tracking-tighter">{accuracy.toFixed(1)}%</p>
                       </div>
                    </div>
                 </div>

                 <div className="flex flex-col justify-center gap-6">
                    <div className={`p-6 rounded-3xl border ${diff > 0 ? 'bg-[#e31b23]/5 border-[#e31b23]/20' : 'bg-emerald-500/5 border-emerald-500/20'}`}>
                       <div className="flex items-center gap-4">
                          {diff > 0 ? <AlertCircle size={24} className="text-[#e31b23]" /> : <CheckCircle2 size={24} className="text-emerald-400" />}
                          <p className="text-xs font-bold text-white/70 leading-relaxed italic">
                             {diff > 0 
                               ? `Existem R$ ${diff.toLocaleString()} gastos não reportados via Ordem de Serviço. Verifique desvios ou compras emergenciais.` 
                               : "Os custos registrados no sistema cobrem integralmente o gasto real. Excelente governança."}
                          </p>
                       </div>
                    </div>
                 </div>
              </div>
           </div>

           <div className="glass rounded-[3rem] border border-white/5 overflow-hidden shadow-2xl">
              <div className="p-8 border-b border-white/5 bg-white/2 flex items-center justify-between">
                 <h3 className="font-black text-lg uppercase tracking-tight flex items-center gap-3">
                    <History size={20} className="text-[#0047ba]" />
                    Histórico de Fechamentos
                 </h3>
              </div>
              <div className="p-0">
                 <table className="w-full text-left">
                    <thead>
                       <tr className="border-b border-white/5">
                          <th className="px-8 py-5 text-[9px] font-black text-white/20 uppercase tracking-widest">Mês/Ano</th>
                          <th className="px-8 py-5 text-[9px] font-black text-white/20 uppercase tracking-widest">Valor Real</th>
                          <th className="px-8 py-5 text-[9px] font-black text-white/20 uppercase tracking-widest">Status Auditoria</th>
                       </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                       {expenses.length === 0 ? (
                         <tr><td colSpan={3} className="px-8 py-10 text-center text-white/20 font-black text-[10px] uppercase">Nenhum fechamento registrado</td></tr>
                       ) : (
                         expenses.sort((a,b) => b.year - a.year || b.month - a.month).map(exp => (
                           <tr key={exp.id} className="hover:bg-white/2 transition-colors">
                              <td className="px-8 py-6 text-sm font-black text-white">{months[exp.month]} {exp.year}</td>
                              <td className="px-8 py-6 text-sm font-black text-[#0047ba]">{unit.currency} {exp.totalRealCost.toLocaleString()}</td>
                              <td className="px-8 py-6">
                                 <span className="px-4 py-1.5 bg-white/5 rounded-full text-[9px] font-black uppercase text-white/30 tracking-widest border border-white/5 flex items-center gap-2 w-fit">
                                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-[0_0_8px_#10b981]"></div>
                                    Validado IA
                                 </span>
                              </td>
                           </tr>
                         ))
                       )}
                    </tbody>
                 </table>
              </div>
           </div>
        </div>
      </div>
    </div>
  );
};

export default FinancialControl;
