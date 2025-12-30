
import React, { useState, useEffect } from 'react';
import { 
  Wrench, User as UserIcon, Calendar, Clock, ClipboardList, Send, FileText, LayoutTemplate
} from 'lucide-react';
import { ServiceType, User } from '../types';
import { SECTORS } from '../constants';

interface OSFormProps {
  onSubmit: (data: any) => void;
  technicians: User[];
  preFilledData?: any;
}

const OSForm: React.FC<OSFormProps> = ({ onSubmit, technicians, preFilledData }) => {
  const [formData, setFormData] = useState({
    technicianId: technicians[0]?.id || '',
    requestDate: new Date().toISOString().split('T')[0],
    deadline: '',
    type: ServiceType.CORRECTIVE,
    description: '',
    sector: SECTORS[0],
    timeSpent: 0
  });

  useEffect(() => {
    if (preFilledData) {
      setFormData(prev => ({
        ...prev,
        description: preFilledData.description || prev.description,
        type: preFilledData.type || prev.type,
      }));
    }
  }, [preFilledData]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.deadline || !formData.description) return alert('Por favor, preencha todos os campos!');
    onSubmit(formData);
  };

  return (
    <div className="max-w-3xl mx-auto">
      <div className="glass p-8 rounded-[2rem] border border-white/10 shadow-2xl relative overflow-hidden">
        <div className="absolute -top-24 -right-24 w-64 h-64 bg-indigo-600/10 blur-[100px] rounded-full"></div>
        
        <div className="flex items-center gap-4 mb-8">
          <div className="w-14 h-14 bg-[#0047ba] rounded-2xl flex items-center justify-center text-white shadow-lg shadow-blue-600/30">
            <PlusIcon size={28} />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-white tracking-tight uppercase italic">Nova Ordem de Serviço</h2>
            <p className="text-white/40 text-[10px] font-black uppercase tracking-widest">Preencha os dados para registro industrial</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-xs font-bold text-white/40 uppercase tracking-widest ml-1 flex items-center gap-2">
                <UserIcon size={12} /> Técnico Responsável
              </label>
              <select 
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-[#0047ba]/50 appearance-none"
                value={formData.technicianId}
                onChange={(e) => setFormData({...formData, technicianId: e.target.value})}
              >
                {technicians.map(t => (
                  <option key={t.id} value={t.id} className="bg-slate-900">{t.name}</option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold text-white/40 uppercase tracking-widest ml-1 flex items-center gap-2">
                <LayoutTemplate size={12} /> Setor
              </label>
              <select 
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-[#0047ba]/50 appearance-none"
                value={formData.sector}
                onChange={(e) => setFormData({...formData, sector: e.target.value})}
              >
                {SECTORS.map(s => (
                  <option key={s} value={s} className="bg-slate-900">{s}</option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold text-white/40 uppercase tracking-widest ml-1 flex items-center gap-2">
                <Calendar size={12} /> Data da Solicitação
              </label>
              <input 
                type="date" 
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-[#0047ba]/50"
                value={formData.requestDate}
                readOnly
              />
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold text-white/40 uppercase tracking-widest ml-1 flex items-center gap-2">
                <Clock size={12} /> Prazo Limite
              </label>
              <input 
                type="date" 
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-[#0047ba]/50"
                value={formData.deadline}
                onChange={(e) => setFormData({...formData, deadline: e.target.value})}
              />
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold text-white/40 uppercase tracking-widest ml-1 flex items-center gap-2">
                <Wrench size={12} /> Tipo de Serviço
              </label>
              <div className="grid grid-cols-2 gap-2">
                {Object.values(ServiceType).map(type => (
                  <button
                    key={type}
                    type="button"
                    onClick={() => setFormData({...formData, type})}
                    className={`py-3 rounded-xl text-[10px] font-black uppercase transition-all border ${
                      formData.type === type 
                        ? 'bg-[#0047ba] border-[#0047ba] text-white shadow-lg' 
                        : 'bg-white/5 border-white/10 text-white/40 hover:text-white/60'
                    }`}
                  >
                    {type}
                  </button>
                ))}
              </div>
            </div>
            
            <div className="space-y-2">
              <label className="text-xs font-bold text-white/40 uppercase tracking-widest ml-1 flex items-center gap-2">
                <ClipboardList size={12} /> Estimativa (H/H)
              </label>
              <input 
                type="number" 
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-[#0047ba]/50"
                placeholder="0.0"
                value={formData.timeSpent}
                onChange={(e) => setFormData({...formData, timeSpent: Number(e.target.value)})}
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-bold text-white/40 uppercase tracking-widest ml-1 flex items-center gap-2">
              <FileText size={12} /> Descrição Técnica
            </label>
            <textarea 
              rows={4}
              className={`w-full bg-white/5 border border-white/10 rounded-2xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-[#0047ba]/50 resize-none font-bold text-sm ${preFilledData ? 'border-[#0047ba]/50 bg-[#0047ba]/5 shadow-inner' : ''}`}
              placeholder="Descreva detalhadamente o serviço necessário..."
              value={formData.description}
              onChange={(e) => setFormData({...formData, description: e.target.value})}
            ></textarea>
            {preFilledData && <p className="text-[8px] font-black text-[#0047ba] uppercase tracking-widest italic ml-2">Dados carregados via Cérebro SGI</p>}
          </div>

          <div className="flex justify-end pt-4">
            <button 
              type="submit"
              className="flex items-center gap-3 bg-[#0047ba] hover:bg-[#e31b23] text-white font-black py-5 px-12 rounded-2xl shadow-xl transition-all active:scale-95 uppercase tracking-widest text-[11px]"
            >
              <Send size={18} />
              Confirmar Registro Industrial
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

const PlusIcon = ({ size }: { size: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M12 5V19M5 12H19" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

export default OSForm;
