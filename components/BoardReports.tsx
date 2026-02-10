
import React, { useState } from 'react';
import { 
  FileBarChart, Sparkles, Scale, FileText,
  SearchCode, CheckCircle2, ShieldAlert, TrendingUp, DollarSign, Printer, Download, ArrowRight
} from 'lucide-react';
import { ServiceOrder, Unit, DetailedAIReport } from '../types';
import { getDetailedAIAnalysis } from '../services/geminiService';
import Benchmarking from './Benchmarking';

interface BoardReportsProps {
  orders: ServiceOrder[];
  unit: Unit;
  units: Unit[];
}

const BoardReports: React.FC<BoardReportsProps> = ({ orders, unit, units }) => {
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

  const handlePrint = () => {
    window.print();
  };

  const metrics = {
    totalValue: orders.reduce((a, b) => a + (b.cost || 0), 0),
    compliance: 98.4,
    criticalFailures: orders.filter(o => o.type === 'Corretivo' && o.status === 'Aberta').length,
    opexSaved: orders.filter(o => o.type === 'Preditivo').length * 1500,
  };

  return (
    <div className="space-y-12 pb-24 animate-in fade-in duration-700">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-6 no-print">
        <div>
          <h2 className="text-3xl font-black text-[#1A3673] uppercase tracking-tighter italic">Governança Industrial</h2>
          <p className="text-slate-400 text-xs font-bold uppercase tracking-widest">Auditoria Cognitiva & Benchmarking • Aviagen Global</p>
        </div>
        <div className="flex gap-3">
          <button 
            onClick={generateDeepAudit}
            disabled={auditLoading}
            className="bg-[#1A3673] hover:bg-slate-900 text-white px-8 py-4 rounded-2xl font-black text-xs uppercase tracking-widest transition-all disabled:opacity-50 flex items-center gap-3 shadow-xl"
          >
            {auditLoading ? <SearchCode className="animate-spin" size={18} /> : <Sparkles size={18} />}
            Auditoria Financeira IA
          </button>
          {detailedReport && (
            <button onClick={handlePrint} className="p-4 bg-white border border-slate-200 text-[#1A3673] rounded-2xl hover:bg-slate-50 shadow-sm transition-all">
                <Printer size={20} />
            </button>
          )}
        </div>
      </header>

      {/* BENCHMARKING (Oculto na impressão detalhada se preferir, ou mantido) */}
      <div className="no-print">
          <div className="industrial-card p-2 bg-[#1A3673] rounded-[2.5rem] border-none">
            <div className="bg-slate-900/50 rounded-[2rem] p-6 lg:p-10">
               <Benchmarking units={units} orders={orders} currentUserUnitId={unit.id} />
            </div>
          </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 print-container">
        <div className="lg:col-span-3 space-y-8">
          {detailedReport ? (
            <div className="bg-white rounded-[3.5rem] border border-slate-200 overflow-hidden animate-in zoom-in-95 duration-500 shadow-3xl print-content">
              <div className="p-10 border-b border-slate-100 flex items-center justify-between bg-slate-50">
                <div>
                  <h3 className="text-3xl font-black text-slate-900 tracking-tighter uppercase italic">{detailedReport.title}</h3>
                  <p className="text-[#1A3673] text-[10px] font-black uppercase tracking-[0.3em] mt-1">Status de Compliance: {unit.name} • {detailedReport.date}</p>
                </div>
                <div className="w-16 h-16 bg-[#1A3673] rounded-3xl flex items-center justify-center shadow-2xl p-3 text-white">
                   <div className="font-black text-2xl italic">A</div>
                </div>
              </div>
              
              <div className="p-10 space-y-10">
                <div className="bg-blue-50/50 p-8 rounded-3xl border border-blue-100">
                  <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] mb-4">Sumário Executivo</h4>
                  <p className="text-slate-700 text-lg leading-relaxed font-medium italic">"{detailedReport.summary}"</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  {detailedReport.sections.map((sec, idx) => (
                    <div key={idx} className="space-y-3 group">
                      <div className="flex items-center gap-3">
                        <div className="w-1 h-4 bg-[#E31B23] rounded-full group-hover:h-6 transition-all"></div>
                        <h5 className="font-black text-slate-900 uppercase text-sm tracking-widest">{sec.title}</h5>
                      </div>
                      <p className="text-xs text-slate-500 leading-relaxed font-medium pl-4">{sec.content}</p>
                    </div>
                  ))}
                </div>

                <div className="bg-slate-900 text-white p-10 rounded-[2.5rem] relative overflow-hidden shadow-2xl">
                  <h4 className="text-[10px] font-black text-white/40 uppercase tracking-[0.4em] mb-8 flex items-center gap-3">
                    <TrendingUp size={16} className="text-[#E31B23]" />
                    Diretrizes de Otimização
                  </h4>
                  <ul className="grid grid-cols-1 md:grid-cols-2 gap-6 relative z-10">
                    {detailedReport.recommendations.map((rec, idx) => (
                      <li key={idx} className="flex items-start gap-4 text-white/80 text-sm leading-tight font-bold">
                        <div className="w-2 h-2 rounded-full bg-[#E31B23] mt-1.5 shrink-0 shadow-[0_0_10px_#E31B23]"></div>
                        {rec}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          ) : (
            <div className="industrial-card p-20 rounded-[3.5rem] text-center flex flex-col items-center justify-center space-y-8 opacity-40">
               <FileText size={100} className="text-[#1A3673]/20" />
               <h3 className="text-xl font-black text-slate-400 uppercase tracking-tighter">Aguardando Auditoria Cognitiva</h3>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 no-print">
            <div className="industrial-card p-10 rounded-[2.5rem] group hover:border-[#1A3673] transition-all">
              <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] mb-4">OPEX Acumulado</h4>
              <p className="text-4xl font-black text-slate-900 tracking-tighter italic">R$ {metrics.totalValue.toLocaleString()}</p>
              <div className="mt-6 flex items-center gap-2 text-emerald-600 font-black text-[9px] uppercase tracking-widest bg-emerald-50 w-fit px-3 py-1 rounded-lg">
                <TrendingUp size={14} /> Estabilidade Financeira
              </div>
            </div>
            <div className="industrial-card p-10 rounded-[2.5rem] group hover:border-[#E31B23] transition-all">
              <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] mb-4">Índice de Segurança TST</h4>
              <p className="text-4xl font-black text-slate-900 tracking-tighter italic">{metrics.compliance}%</p>
              <div className="mt-6 h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                <div className="h-full bg-gradient-to-r from-[#1A3673] to-[#E31B23]" style={{ width: `${metrics.compliance}%` }}></div>
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-8 no-print">
          <div className="industrial-card p-8 rounded-[2.5rem] bg-rose-50 border-rose-100 shadow-xl">
            <div className="flex items-center gap-3 text-[#E31B23] font-black uppercase text-xs tracking-widest mb-6">
              <ShieldAlert size={20} />
              <span>Pendências Críticas</span>
            </div>
            <ul className="space-y-4">
              <li className="text-xs text-rose-900/70 flex items-start gap-3 font-bold uppercase tracking-tight">
                <div className="w-2 h-2 rounded-full bg-[#E31B23] mt-1 shrink-0"></div>
                {metrics.criticalFailures} OS Corretivas em Aberto
              </li>
            </ul>
          </div>

          <div className="industrial-card p-8 rounded-[2.5rem] bg-emerald-50 border-emerald-100">
            <div className="flex items-center gap-3 text-emerald-600 font-black uppercase text-xs tracking-widest mb-4">
              <DollarSign size={20} />
              <span>Saving Gerado</span>
            </div>
            <p className="text-[10px] text-emerald-900/60 leading-relaxed italic font-black uppercase">
              R$ {metrics.opexSaved.toLocaleString()} economizados via IA Preditiva.
            </p>
          </div>
        </div>
      </div>
      
      <style>{`
        @media print {
            .no-print { display: none !important; }
            body { background: white !important; padding: 0 !important; }
            .print-container { grid-template-columns: 1fr !important; width: 100% !important; margin: 0 !important; }
            .print-content { border: none !important; box-shadow: none !important; border-radius: 0 !important; width: 100% !important; }
            .industrial-card { border: 1px solid #eee !important; page-break-inside: avoid; }
        }
      `}</style>
    </div>
  );
};

export default BoardReports;
