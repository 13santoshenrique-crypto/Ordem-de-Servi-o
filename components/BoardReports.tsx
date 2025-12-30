
import React, { useState } from 'react';
import { 
  FileBarChart, Sparkles, Scale, FileText,
  SearchCode, CheckCircle2, ShieldAlert, TrendingUp, DollarSign
} from 'lucide-react';
import { ServiceOrder, Unit, DetailedAIReport } from '../types';
import { getDetailedAIAnalysis } from '../services/geminiService';

interface BoardReportsProps {
  orders: ServiceOrder[];
  unit: Unit;
}

const BoardReports: React.FC<BoardReportsProps> = ({ orders, unit }) => {
  const [detailedReport, setDetailedReport] = useState<DetailedAIReport | null>(null);
  const [auditLoading, setAuditLoading] = useState(false);

  const generateDeepAudit = async () => {
    setAuditLoading(true);
    try {
      const report = await getDetailedAIAnalysis(orders, unit.name);
      setDetailedReport(report);
    } catch (e) {
      console.error("Erro na auditoria", e);
    } finally {
      setAuditLoading(false);
    }
  };

  const metrics = {
    totalValue: orders.reduce((a, b) => a + (b.cost || 0), 0),
    compliance: 98.4,
    criticalFailures: orders.filter(o => o.type === 'Corretivo' && o.status === 'Aberta').length,
    opexSaved: orders.filter(o => o.type === 'Preditivo').length * 1500, // Estimativa simples
  };

  return (
    <div className="space-y-8 pb-20 animate-in fade-in duration-700">
      <header className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-black text-white uppercase tracking-tighter">Relatórios Executivos</h2>
          <p className="text-white/40 text-xs font-bold uppercase tracking-widest">Governança & Auditoria Financeira • Aviagen Global</p>
        </div>
        <div className="flex gap-3">
          <button 
            onClick={generateDeepAudit}
            disabled={auditLoading}
            className="bg-[#0047ba] hover:bg-[#e31b23] text-white px-8 py-3.5 rounded-2xl font-black text-xs uppercase tracking-widest transition-all disabled:opacity-50 flex items-center gap-3"
          >
            {auditLoading ? <SearchCode className="animate-spin" size={18} /> : <Sparkles size={18} />}
            Auditoria IA Financeira
          </button>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        <div className="lg:col-span-3 space-y-8">
          {detailedReport ? (
            <div className="glass rounded-[3.5rem] border border-[#0047ba]/20 bg-gradient-to-br from-[#0047ba]/5 to-transparent overflow-hidden animate-in zoom-in-95 duration-500 shadow-3xl">
              <div className="p-10 border-b border-white/5 flex items-center justify-between bg-white/2">
                <div>
                  <h3 className="text-3xl font-black text-white tracking-tighter uppercase">{detailedReport.title}</h3>
                  <p className="text-[#0047ba] text-[10px] font-black uppercase tracking-[0.3em] mt-1">Protocolo Industrial {detailedReport.date}</p>
                </div>
                <div className="w-16 h-16 bg-white rounded-3xl flex items-center justify-center shadow-2xl p-3">
                   <div className="font-black text-[#0047ba] text-2xl italic">A</div>
                </div>
              </div>
              
              <div className="p-10 space-y-10">
                <div className="glass p-8 rounded-3xl border border-white/5">
                  <h4 className="text-[10px] font-black text-white/30 uppercase tracking-[0.3em] mb-4">Sumário de Governança</h4>
                  <p className="text-white/80 text-lg leading-relaxed font-medium italic">"{detailedReport.summary}"</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  {detailedReport.sections.map((sec, idx) => (
                    <div key={idx} className="space-y-3 group">
                      <div className="flex items-center gap-3">
                        <div className="w-1 h-4 bg-[#e31b23] rounded-full group-hover:h-6 transition-all"></div>
                        <h5 className="font-black text-white uppercase text-sm tracking-widest">{sec.title}</h5>
                      </div>
                      <p className="text-xs text-white/50 leading-relaxed font-medium pl-4">{sec.content}</p>
                    </div>
                  ))}
                </div>

                <div className="bg-[#0047ba]/10 border border-[#0047ba]/20 p-10 rounded-[2.5rem] relative overflow-hidden">
                  <div className="absolute top-0 right-0 p-10 opacity-5 text-white">
                    <Scale size={150} />
                  </div>
                  <h4 className="text-[10px] font-black text-[#0047ba] uppercase tracking-[0.4em] mb-8 flex items-center gap-3">
                    <CheckCircle2 size={16} className="text-[#e31b23]" />
                    Recomendações Estratégicas
                  </h4>
                  <ul className="grid grid-cols-1 md:grid-cols-2 gap-6 relative z-10">
                    {detailedReport.recommendations.map((rec, idx) => (
                      <li key={idx} className="flex items-start gap-4 text-white/90 text-sm leading-tight font-bold">
                        <div className="w-2 h-2 rounded-full bg-[#e31b23] mt-1.5 shrink-0 shadow-[0_0_10px_#e31b23]"></div>
                        {rec}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          ) : (
            <div className="glass p-16 rounded-[3.5rem] border border-white/5 text-center flex flex-col items-center justify-center space-y-8 opacity-40">
               <FileText size={120} className="text-[#0047ba]" />
               <div>
                  <h3 className="text-2xl font-black text-white uppercase tracking-tighter">Auditoria Pendente</h3>
                  <p className="max-w-md mx-auto text-xs font-bold uppercase tracking-widest mt-2 leading-loose">
                    Gere o relatório para analisar a saúde financeira e conformidade da unidade {unit.name}.
                  </p>
               </div>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="glass p-10 rounded-[2.5rem] border border-white/5 group hover:border-[#0047ba]/30 transition-all duration-500">
              <h4 className="text-[10px] font-black text-white/20 uppercase tracking-[0.3em] mb-4">Investimento Total Opex</h4>
              <p className="text-4xl font-black text-white tracking-tighter">R$ {metrics.totalValue.toLocaleString()}</p>
              <div className="mt-6 flex items-center gap-2 text-emerald-400 font-black text-xs uppercase tracking-widest">
                <TrendingUp size={16} />
                <span>Eficiência de Alocação: Alta</span>
              </div>
            </div>
            <div className="glass p-10 rounded-[2.5rem] border border-white/5 group hover:border-[#e31b23]/30 transition-all duration-500">
              <h4 className="text-[10px] font-black text-white/20 uppercase tracking-[0.3em] mb-4">Conformidade NBR/ISO</h4>
              <p className="text-4xl font-black text-white tracking-tighter">{metrics.compliance}%</p>
              <div className="mt-6 h-2.5 w-full bg-white/5 rounded-full overflow-hidden">
                <div className="h-full bg-gradient-to-r from-[#0047ba] to-[#e31b23] transition-all duration-1000" style={{ width: `${metrics.compliance}%` }}></div>
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-8">
          <div className="glass p-8 rounded-[2.5rem] border border-[#e31b23]/20 bg-[#e31b23]/5 shadow-2xl">
            <div className="flex items-center gap-3 text-[#e31b23] font-black uppercase text-xs tracking-widest mb-6">
              <ShieldAlert size={20} />
              <span>Pontos de Atenção</span>
            </div>
            <ul className="space-y-4">
              <li className="text-sm text-white/70 flex items-start gap-3 font-bold">
                <div className="w-2 h-2 rounded-full bg-[#e31b23] mt-1.5 shrink-0 shadow-[0_0_8px_#e31b23]"></div>
                {metrics.criticalFailures} corretivas ativas impactando o uptime.
              </li>
              <li className="text-sm text-white/70 flex items-start gap-3 font-bold">
                <div className="w-2 h-2 rounded-full bg-amber-500 mt-1.5 shrink-0 shadow-[0_0_8px_#f59e0b]"></div>
                {orders.filter(o => o.status === 'Aberta' && new Date(o.deadline) < new Date()).length} Ordens com prazo expirado.
              </li>
            </ul>
          </div>

          <div className="glass p-8 rounded-[2.5rem] border border-emerald-500/20 bg-emerald-500/5">
            <div className="flex items-center gap-3 text-emerald-400 font-black uppercase text-xs tracking-widest mb-4">
              <DollarSign size={20} />
              <span>Saving Preditivo</span>
            </div>
            <p className="text-[11px] text-white/60 leading-relaxed italic font-medium">
              A manutenção baseada em inteligência artificial evitou a perda estimada de R$ {metrics.opexSaved.toLocaleString()} em quebras catastróficas.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BoardReports;
