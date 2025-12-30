
import React, { useState } from 'react';
import { Target, Play, TrendingUp, Sparkles, BrainCircuit, Activity } from 'lucide-react';
import { getWhatIfSimulation } from '../services/geminiService';
import { ServiceOrder, Unit } from '../types';

interface StrategicProps {
  orders: ServiceOrder[];
  units: Unit[];
}

const StrategicPlanning: React.FC<StrategicProps> = ({ orders, units }) => {
  const [scenario, setScenario] = useState('');
  const [simulation, setSimulation] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const runSimulation = async () => {
    if (!scenario) return;
    setLoading(true);
    const stats = {
      totalOrders: orders.length,
      correctiveRatio: orders.filter(o => o.type === 'Corretivo').length / orders.length,
      totalCost: orders.reduce((a, b) => a + (b.cost || 0), 0)
    };
    try {
      const result = await getWhatIfSimulation(scenario, stats);
      setSimulation(result);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8">
      <header>
        <h1 className="text-3xl font-black text-white uppercase tracking-tighter">Planejamento Estratégico</h1>
        <p className="text-white/40 text-xs font-bold uppercase tracking-widest">Simulação de Cenários & ROI Aviagen</p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-1 space-y-6">
          <div className="glass p-8 rounded-[2.5rem] border border-white/5 space-y-6">
            <h3 className="text-lg font-black text-white flex items-center gap-3 uppercase">
              <BrainCircuit className="text-[#0047ba]" />
              Motor de Simulação IA
            </h3>
            <div className="space-y-4">
              <label className="text-[10px] font-black text-white/30 uppercase tracking-widest">Cenário Desejado</label>
              <textarea 
                className="w-full bg-white/5 border border-white/10 rounded-2xl p-5 text-white text-sm focus:ring-2 focus:ring-[#0047ba]/50 focus:outline-none resize-none"
                rows={4}
                placeholder="Ex: E se reduzirmos em 30% as manutenções corretivas no setor de Elétrica da unidade Alabama?"
                value={scenario}
                onChange={(e) => setScenario(e.target.value)}
              />
              <button 
                onClick={runSimulation}
                disabled={loading || !scenario}
                className="w-full py-5 bg-[#0047ba] hover:bg-[#e31b23] disabled:opacity-30 text-white rounded-2xl font-black uppercase text-xs tracking-widest transition-all shadow-xl shadow-[#0047ba]/20 flex items-center justify-center gap-3"
              >
                {loading ? <Activity className="animate-spin" /> : <Play size={18} />}
                Processar Simulação
              </button>
            </div>
          </div>
        </div>

        <div className="lg:col-span-2">
          {simulation ? (
            <div className="glass p-10 rounded-[3rem] border border-[#0047ba]/20 bg-gradient-to-br from-[#0047ba]/5 to-transparent space-y-8 animate-in zoom-in-95 duration-500">
              <div className="flex items-center justify-between border-b border-white/5 pb-6">
                <div className="flex items-center gap-4">
                   <div className="p-3 bg-[#0047ba] rounded-2xl text-white">
                      <Sparkles size={24} />
                   </div>
                   <div>
                      <h4 className="text-2xl font-black text-white tracking-tight">Projeção Financeira</h4>
                      <p className="text-[#0047ba] text-[10px] font-black uppercase tracking-widest">Análise Preditiva de ROI</p>
                   </div>
                </div>
                <div className="text-right">
                  <p className="text-white/20 text-[10px] font-black uppercase">Economia Projetada</p>
                  <p className="text-4xl font-black text-emerald-400">R$ {simulation.projectedSaving.toLocaleString()}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-8">
                 <div className="space-y-4">
                    <h5 className="text-[10px] font-black text-emerald-400 uppercase tracking-widest">Impacto Positivo</h5>
                    <ul className="space-y-2">
                      {simulation.pros.map((p: string, i: number) => (
                        <li key={i} className="text-sm text-white/70 flex items-start gap-2">
                           <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 mt-1.5 shrink-0"></div>
                           {p}
                        </li>
                      ))}
                    </ul>
                 </div>
                 <div className="space-y-4">
                    <h5 className="text-[10px] font-black text-[#e31b23] uppercase tracking-widest">Riscos Identificados</h5>
                    <ul className="space-y-2">
                      {simulation.cons.map((c: string, i: number) => (
                        <li key={i} className="text-sm text-white/70 flex items-start gap-2">
                           <div className="w-1.5 h-1.5 rounded-full bg-[#e31b23] mt-1.5 shrink-0"></div>
                           {c}
                        </li>
                      ))}
                    </ul>
                 </div>
              </div>

              <div className="p-6 bg-white/2 border border-white/5 rounded-3xl">
                 <p className="text-white/60 text-sm leading-relaxed italic">"{simulation.summary}"</p>
              </div>
            </div>
          ) : (
            <div className="h-full flex flex-col items-center justify-center text-center opacity-10">
               <Target size={120} className="text-[#0047ba] mb-6" />
               <p className="font-black uppercase tracking-widest text-2xl">Aguardando Parâmetros Estratégicos</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default StrategicPlanning;
