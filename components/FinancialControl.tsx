
import React, { useState, useMemo } from 'react';
import { 
  DollarSign, Calendar, Plus, History, Scale, TrendingUp, AlertCircle, CheckCircle2, ReceiptText
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
    <div className="space-y-10 animate-in fade-in duration-500 pb-20">
      <header className="flex items-center gap-6">
        <div className="w-16 h-16 bg-blue-700 rounded-2xl flex items-center justify-center text-white shadow-xl shimmer">
          <Scale size={32} />
        </div>
        <div>
          <h2 className="text-3xl font-black text-slate-900 uppercase tracking-tighter italic">Conciliação <span className="text-blue-700">Financeira</span></h2>
          <p className="text-slate-500 text-[10px] font-bold uppercase tracking-[0.3em]">Auditoria de Notas Fiscais vs Dados SGI</p>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        
        {/* Formulário de Gasto */}
        <div className="lg:col-span-4 crystal-card p-10">
           <div className="flex items-center gap-4 mb-10">
              <div className="w-12 h-12 bg-blue-100 text-blue-700 rounded-xl flex items-center justify-center">
                 <ReceiptText size={24} />
              </div>
              <h3 className="text-xl font-extrabold text-slate-900 uppercase tracking-tight">Entrada de Gasto</h3>
           </div>

           <form onSubmit={handleSubmit} className="space-y-8">
              <div className="grid grid-cols-2 gap-4">
                 <div className="space-y-2">
                    <label className="industrial-label">Mês Fiscal</label>
                    <select 
                      className="industrial-input !py-4 appearance-none"
                      value={formData.month}
                      onChange={(e) => setFormData({...formData, month: Number(e.target.value)})}
                    >
                      {months.map((m, i) => <option key={i} value={i}>{m}</option>)}
                    </select>
                 </div>
                 <div className="space-y-2">
                    <label className="industrial-label">Ano</label>
                    <input 
                      type="number" 
                      className="industrial-input !py-4"
                      value={formData.year}
                      onChange={(e) => setFormData({...formData, year: Number(e.target.value)})}
                    />
                 </div>
              </div>

              <div className="space-y-2">
                 <label className="industrial-label">Valor Total Informado (R$)</label>
                 <div className="relative">
                    <div className="absolute left-5 top-1/2 -translate-y-1/2 text-blue-700 font-black text-xl">R$</div>
                    <input 
                      type="number" 
                      className="industrial-input pl-16 text-3xl font-black"
                      placeholder="0,00"
                      value={formData.totalRealCost}
                      onChange={(e) => setFormData({...formData, totalRealCost: Number(e.target.value)})}
                    />
                 </div>
              </div>

              <div className="space-y-2">
                 <label className="industrial-label">Notas do Fechamento</label>
                 <textarea 
                   className="industrial-input !px-6 !py-4 resize-none text-sm font-medium"
                   rows={3}
                   placeholder="Observações complementares..."
                   value={formData.notes}
                   onChange={(e) => setFormData({...formData, notes: e.target.value})}
                 />
              </div>

              <button type="submit" className="w-full btn-primary">
                 Registrar Auditoria
              </button>
           </form>
        </div>

        {/* Dash de Auditoria */}
        <div className="lg:col-span-8 space-y-10">
           <div className="crystal-card p-12 bg-blue-50/40 border-blue-100">
              <div className="flex justify-between items-center mb-12">
                 <h3 className="text-xl font-black text-slate-900 uppercase tracking-widest flex items-center gap-3">
                    <CheckCircle2 size={24} className="text-blue-700" />
                    Status da Conciliação: {months[formData.month].toUpperCase()}
                 </h3>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
                 <div className="space-y-2">
                    <p className="industrial-label !text-slate-400">Registrado no SGI (OS)</p>
                    <p className="text-4xl font-black text-slate-400 tracking-tighter italic">R$ {systemicCost.toLocaleString()}</p>
                 </div>
                 <div className="space-y-2">
                    <p className="industrial-label">Valor Informado Real</p>
                    <p className="text-4xl font-black text-slate-900 tracking-tighter italic">R$ {formData.totalRealCost.toLocaleString()}</p>
                 </div>
                 <div className="space-y-2">
                    <p className="industrial-label">Acuracidade SGI</p>
                    <p className={`text-4xl font-black tracking-tighter italic ${accuracy >= 95 ? 'text-emerald-500' : 'text-amber-500'}`}>{accuracy.toFixed(1)}%</p>
                 </div>
              </div>

              <div className={`mt-12 p-8 rounded-[2rem] border-2 flex items-center gap-6 ${diff > 0 ? 'bg-rose-50 border-rose-200 text-rose-800 shadow-xl shadow-rose-200/20' : 'bg-emerald-50 border-emerald-200 text-emerald-800 shadow-xl shadow-emerald-200/20'}`}>
                 <div className={`p-4 rounded-2xl ${diff > 0 ? 'bg-rose-200' : 'bg-emerald-200'}`}>
                    {diff > 0 ? <AlertCircle size={28}/> : <CheckCircle2 size={28}/>}
                 </div>
                 <div>
                    <p className="text-lg font-black uppercase tracking-tight">
                       Diferença de Caixa: R$ {Math.abs(diff).toLocaleString()}
                    </p>
                    <p className="text-sm font-bold opacity-80 mt-1">
                       {diff > 0 
                          ? "Atenção: Existem gastos externos não lançados como Ordens de Serviço no sistema." 
                          : "Excelente governança. Todos os gastos reais estão cobertos por ordens sistêmicas."}
                    </p>
                 </div>
              </div>
           </div>

           {/* Histórico */}
           <div className="crystal-card overflow-hidden">
              <div className="p-8 border-b border-slate-100 bg-slate-50 flex items-center justify-between">
                 <h3 className="font-black text-slate-900 uppercase text-sm tracking-widest flex items-center gap-3">
                    <History size={20} className="text-blue-700" /> Histórico de Fechamentos
                 </h3>
              </div>
              <div className="overflow-x-auto">
                 <table className="w-full text-left">
                    <thead>
                       <tr className="bg-slate-50/50">
                          <th className="px-10 py-5 industrial-label">Período</th>
                          <th className="px-10 py-5 industrial-label">Valor Real</th>
                          <th className="px-10 py-5 industrial-label">Status Auditoria</th>
                       </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                       {expenses.length === 0 ? (
                         <tr><td colSpan={3} className="px-10 py-16 text-center text-slate-400 font-bold text-sm uppercase tracking-widest">Nenhum fechamento registrado</td></tr>
                       ) : (
                         expenses.map(exp => (
                           <tr key={exp.id} className="hover:bg-blue-50/30 transition-colors">
                              <td className="px-10 py-6 text-sm font-black text-slate-900 uppercase">{months[exp.month]} {exp.year}</td>
                              <td className="px-10 py-6 text-lg font-black text-blue-700 italic">R$ {exp.totalRealCost.toLocaleString()}</td>
                              <td className="px-10 py-6">
                                 <div className="flex items-center gap-2 text-[10px] font-black uppercase text-emerald-600 bg-emerald-50 px-4 py-1.5 rounded-full border border-emerald-100 w-fit">
                                    <CheckCircle2 size={14}/> Conciliado
                                 </div>
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
