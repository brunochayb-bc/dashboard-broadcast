/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  TrendingUp, 
  Users, 
  PhoneCall, 
  MapPin, 
  AlertCircle, 
  DollarSign, 
  Percent,
  Calculator,
  ChevronRight,
  Info
} from 'lucide-react';

const Tooltip = ({ text }: { text: string }) => {
  const [isVisible, setIsVisible] = useState(false);

  return (
    <div className="relative inline-block ml-2 align-middle">
      <div 
        onMouseEnter={() => setIsVisible(true)}
        onMouseLeave={() => setIsVisible(false)}
        className="cursor-help text-slate-400 hover:text-blue-500 transition-colors"
      >
        <Info className="w-4 h-4" />
      </div>
      <AnimatePresence>
        {isVisible && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 10 }}
            className="absolute z-50 bottom-full left-1/2 -translate-x-1/2 mb-2 w-64 p-3 bg-slate-900 text-white text-xs rounded-xl shadow-xl pointer-events-none"
          >
            {text}
            <div className="absolute top-full left-1/2 -translate-x-1/2 border-8 border-transparent border-t-slate-900" />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

interface KPI {
  id: string;
  name: string;
  description: string;
  weight: number;
  target: number;
  actual: number;
  type: 'standard' | 'growth' | 'inverse';
  icon: any;
}

const INITIAL_KPIS: KPI[] = [
  { 
    id: '1', 
    name: 'Atendimento Presencial', 
    description: 'Quantidade total de atendimentos presenciais feitos pelo time de Customer Success ao longo do período',
    weight: 30, 
    target: 792, 
    actual: 0, 
    type: 'standard', 
    icon: MapPin 
  },
  { 
    id: '2', 
    name: 'Atendimento Remoto', 
    description: 'Quantidade total de atendimentos remotos feitos pelo time de Customer Success ao longo do período',
    weight: 20, 
    target: 1128, 
    actual: 0, 
    type: 'standard', 
    icon: PhoneCall 
  },
  { 
    id: '3', 
    name: 'DAU (Daily Active Users)', 
    description: 'Média do DAY (Daily Active Users) dos usuários das plataformas BPRO e BAGRO ao término do período de apuração. Utiliza-se como referência o indicador do término do mesmo período de apuração do ano anterior.',
    weight: 30, 
    target: 66.47, 
    actual: 0, 
    type: 'growth', 
    icon: Users 
  },
  { 
    id: '4', 
    name: 'Desuso (NAU)', 
    description: 'Média do Desuso (PACC/NAU) da carteira ao término do período de apuração para usuários da plataforma BPRO e BAGRO. Utiliza-se como referência para meta o indicador do último mês de apuração do trimestre anterior',
    weight: 20, 
    target: 16.19, 
    actual: 16.19, 
    type: 'inverse', 
    icon: AlertCircle 
  },
];

const BONUS_TABLE = [
  { min: 0, max: 74.99, multiplier: 0 },
  { min: 75, max: 89.99, multiplier: 0.5 },
  { min: 90, max: 99.99, multiplier: 0.75 },
  { min: 100, max: 109.99, multiplier: 1 },
  { min: 110, max: 119.99, multiplier: 1.25 },
  { min: 120, max: Infinity, multiplier: 1.5 },
];

export default function App() {
  const [kpis, setKpis] = useState<KPI[]>(INITIAL_KPIS);
  const [baseSalary, setBaseSalary] = useState<number>(5000);

  const calculateAchievement = (kpi: KPI): number => {
    const { target, actual, weight, type } = kpi;
    if (target === 0) return 0;

    switch (type) {
      case 'standard':
      case 'growth':
        return Math.min(weight, (actual / target) * weight);
      case 'inverse':
        return actual <= target ? weight : 0;
      default:
        return 0;
    }
  };

  const kpiResults = useMemo(() => {
    return kpis.map(kpi => ({
      ...kpi,
      achievement: calculateAchievement(kpi)
    }));
  }, [kpis]);

  const totalAchievement = useMemo(() => {
    return kpiResults.reduce((sum, kpi) => sum + kpi.achievement, 0);
  }, [kpiResults]);

  const bonusMultiplier = useMemo(() => {
    const tier = BONUS_TABLE.find(t => totalAchievement >= t.min && totalAchievement <= t.max);
    return tier ? tier.multiplier : 0;
  }, [totalAchievement]);

  const estimatedBonus = useMemo(() => {
    return baseSalary * bonusMultiplier;
  }, [baseSalary, bonusMultiplier]);

  const formatNumber = (val: number, decimals: number = 2) => {
    return new Intl.NumberFormat('pt-BR', {
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals,
    }).format(val);
  };

  const formatKPIValue = (kpiId: string, val: number) => {
    // IDs 1 and 2 are Atendimento (Integer), others are % (2 decimals)
    const decimals = ['1', '2'].includes(kpiId) ? 0 : 2;
    return formatNumber(val, decimals);
  };

  const handleInputChange = (id: string, field: 'target' | 'actual', value: string) => {
    const numValue = parseFloat(value) || 0;
    setKpis(prev => prev.map(kpi => kpi.id === id ? { ...kpi, [field]: numValue } : kpi));
  };

  return (
    <div className="min-h-screen bg-[#f8f9fa] text-[#1a1a1a] font-sans p-4 md:p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header - Broadcast Style */}
        <header className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b-4 border-[#003366] pb-6">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <div className="bg-[#003366] text-white px-2 py-0.5 text-xs font-black tracking-tighter uppercase">Broadcast</div>
              <div className="h-4 w-[1px] bg-slate-300"></div>
              <span className="text-xs font-bold text-[#003366] uppercase tracking-widest">Simulador de Performance</span>
            </div>
            <div className="mb-1">
              <span className="bg-[#ff6600] text-white px-2 py-0.5 text-[10px] font-black uppercase tracking-widest">Customer Success</span>
            </div>
            <h1 className="text-4xl font-black text-[#003366] tracking-tight uppercase italic">Metas e Remuneração Variável</h1>
            <div className="mt-2 space-y-1">
              <p className="text-slate-500 font-medium">Projeção de Remuneração Variável Trimestral</p>
              <p className="text-[#003366] text-xs font-black uppercase tracking-widest bg-slate-100 inline-block px-2 py-1">Período de Apuração: 2Q26</p>
            </div>
          </div>
          <div className="flex items-center gap-4 bg-white p-4 border border-slate-200 shadow-sm">
            <div className="p-2 bg-[#003366] text-white">
              <span className="font-bold text-sm">R$</span>
            </div>
            <div>
              <div className="flex flex-col">
                <span className="text-[10px] font-black text-[#ff6600] uppercase tracking-widest mb-0.5">Informar Salário</span>
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Salário Base Atual</label>
              </div>
              <div className="flex items-center">
                <span className="text-xl font-black text-[#003366] mr-1">R$</span>
                <input 
                  type="number" 
                  value={baseSalary}
                  onChange={(e) => setBaseSalary(parseFloat(e.target.value) || 0)}
                  className="text-xl font-black text-[#003366] focus:outline-none w-32 bg-transparent"
                />
              </div>
            </div>
          </div>
        </header>

        {/* Summary Cards - Broadcast Style */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="bg-[#003366] text-white p-6 border-l-8 border-[#ff6600]"
          >
            <div className="flex flex-col h-full justify-between">
              <div>
                <span className="text-[10px] font-black uppercase tracking-[0.2em] opacity-70">Atingimento Total</span>
                <h2 className="text-6xl font-black mt-2 leading-none">{formatNumber(totalAchievement)}%</h2>
              </div>
              <div className="mt-4 pt-4 border-t border-white/10">
                <p className="text-white/60 text-[10px] font-bold uppercase tracking-wider">Soma ponderada dos KPIs apurados</p>
              </div>
            </div>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.1 }}
            className="bg-white p-6 border border-slate-200 border-l-8 border-emerald-500 shadow-sm"
          >
            <div className="flex flex-col h-full justify-between">
              <div>
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Remuneração Variável Estimada no Trimestre</span>
                <h2 className="text-5xl font-black text-[#003366] mt-2 leading-none">
                  {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(estimatedBonus)}
                </h2>
              </div>
              <div className="mt-4 pt-4 border-t border-slate-100">
                <p className="text-slate-400 text-[10px] font-bold uppercase tracking-wider">Múltiplo Projetado: <span className="text-[#003366]">{formatNumber(bonusMultiplier)}x</span></p>
              </div>
            </div>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="bg-white p-6 border border-slate-200 shadow-sm"
          >
            <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-4">Grade de múltiplos salariais no trimestre</h3>
            <div className="space-y-1">
              {BONUS_TABLE.map((tier, idx) => {
                const isActive = totalAchievement >= tier.min && totalAchievement <= tier.max;
                return (
                  <div 
                    key={idx}
                    className={`flex items-center justify-between px-3 py-1.5 transition-all ${
                      isActive ? 'bg-[#003366] text-white font-bold' : 'text-slate-500 hover:bg-slate-50'
                    }`}
                  >
                    <span className="text-[11px] uppercase tracking-tighter">
                      {tier.max === Infinity ? `Acima de ${formatNumber(tier.min)}%` : `${formatNumber(tier.min)}% a ${formatNumber(tier.max)}%`}
                    </span>
                    <span className={`text-[11px] font-black ${isActive ? 'text-[#ff6600]' : 'text-slate-400'}`}>
                      {formatNumber(tier.multiplier)}x
                    </span>
                  </div>
                );
              })}
            </div>
          </motion.div>
        </div>

        {/* KPI Table - Broadcast Style */}
        <div className="bg-white border border-slate-200 shadow-sm overflow-hidden">
          <div className="bg-slate-50 px-6 py-3 border-b border-slate-200 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <h2 className="text-xs font-black text-[#003366] uppercase tracking-[0.2em]">Monitor de Indicadores (KPIs)</h2>
            </div>
            <div className="flex gap-4">
              <div className="flex items-center gap-2 text-[10px] font-bold text-slate-400 uppercase">
                <span className="w-2 h-2 bg-[#003366]"></span> Peso
              </div>
              <div className="flex items-center gap-2 text-[10px] font-bold text-slate-400 uppercase">
                <span className="w-2 h-2 bg-emerald-500"></span> Atingimento
              </div>
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-white border-b border-slate-100">
                  <th className="p-4 text-[10px] font-black text-slate-400 uppercase tracking-widest pl-8">Indicador</th>
                  <th className="p-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Peso</th>
                  <th className="p-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Meta Contratada</th>
                  <th className="p-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Realizado</th>
                  <th className="p-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right pr-8">Atingimento</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {kpiResults.map((kpi) => (
                  <motion.tr 
                    key={kpi.id}
                    layout
                    className="hover:bg-slate-50 transition-colors group"
                  >
                    <td className="p-4 pl-8">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 flex items-center justify-center bg-slate-100 text-[#003366] group-hover:bg-[#003366] group-hover:text-white transition-colors">
                          <kpi.icon className="w-4 h-4" />
                        </div>
                        <div>
                          <div className="flex items-center">
                            <p className="text-sm font-black text-slate-700 uppercase tracking-tight">{kpi.name}</p>
                            <Tooltip text={kpi.description} />
                          </div>
                          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">
                            {kpi.type === 'inverse' ? 'Binário (Menos é melhor)' : kpi.type === 'growth' ? 'Crescimento' : 'Proporcional (Cap 100%)'}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="p-4 text-center">
                      <span className="text-xs font-black text-slate-600">
                        {kpi.weight}%
                      </span>
                    </td>
                    <td className="p-4 text-center">
                      <div className="relative inline-block">
                        <div className={`w-28 p-2 bg-slate-100 border border-slate-200 text-center text-sm font-black text-slate-500 select-none ${['3', '4'].includes(kpi.id) ? 'pr-6' : ''}`}>
                          {kpi.target}
                        </div>
                        {['3', '4'].includes(kpi.id) && (
                          <span className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 text-[10px] font-black">%</span>
                        )}
                      </div>
                    </td>
                    <td className="p-4 text-center">
                      <div className="relative inline-block">
                        <input 
                          type="number" 
                          step={['1', '2'].includes(kpi.id) ? "1" : "0.01"}
                          value={kpi.actual}
                          onChange={(e) => handleInputChange(kpi.id, 'actual', e.target.value)}
                          className={`w-28 p-2 bg-white border border-slate-200 text-center text-sm font-black text-[#003366] focus:border-[#003366] outline-none transition-all ${['3', '4'].includes(kpi.id) ? 'pr-6' : ''}`}
                        />
                        {['3', '4'].includes(kpi.id) && (
                          <span className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 text-[10px] font-black">%</span>
                        )}
                      </div>
                    </td>
                    <td className="p-4 text-right pr-8">
                      <div className="flex flex-col items-end">
                        <span className="text-base font-black text-emerald-600">
                          {formatNumber(kpi.achievement)}%
                        </span>
                        <div className="w-20 h-1 bg-slate-100 mt-1 overflow-hidden">
                          <motion.div 
                            initial={{ width: 0 }}
                            animate={{ width: `${Math.min(100, (kpi.achievement / kpi.weight) * 100)}%` }}
                            className="h-full bg-emerald-500"
                          />
                        </div>
                      </div>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
              <tfoot>
                <tr className="bg-[#003366] text-white">
                  <td colSpan={4} className="p-4 pl-8 text-xs font-black uppercase tracking-[0.2em]">Atingimento Consolidado</td>
                  <td className="p-4 pr-8 text-right">
                    <span className="text-2xl font-black">
                      {formatNumber(totalAchievement)}%
                    </span>
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>

        {/* Footer Info */}
        <footer className="flex items-center justify-between border-t border-slate-200 pt-4 pb-8">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-[#ff6600]"></div>
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Agência Estado • Broadcast</span>
          </div>
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">© 2026 Simulador de Performance Corporativa • Dados em Tempo Real</p>
        </footer>
      </div>
    </div>
  );
}

