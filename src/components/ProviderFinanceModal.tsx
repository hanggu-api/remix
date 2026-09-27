import React, { useState } from 'react';
import {
  DollarSign,
  TrendingUp,
  Wallet,
  ArrowDownToLine,
  CheckCircle,
  FileText,
  Share2,
  Calendar,
  Clock,
  Sparkles,
  Award,
  X,
  CreditCard,
  Building2,
  Info,
  BarChart3,
  ArrowUpRight,
  ArrowDownRight,
  Layers,
  Activity,
  Percent,
  CheckCircle2
} from 'lucide-react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend
} from 'recharts';
import { UserProfile, ProviderTier } from '../types';
import { PROVIDER_TIERS_CONFIG } from '../data/mockData';
import { notificationService } from '../services/notificationService';

export interface MonthlyFinancialRecord {
  month: string;
  monthFullName: string;
  year: number;
  faturamentoBruto: number;
  ganhosLiquidos: number;
  taxaApp: number;
  servicosConcluidos: number;
  ticketMedio: number;
  growth: number;
}

export const MONTHLY_FINANCIAL_HISTORY: MonthlyFinancialRecord[] = [
  { month: 'Abr/25', monthFullName: 'Abril 2025', year: 2025, faturamentoBruto: 2800, ganhosLiquidos: 2604, taxaApp: 196, servicosConcluidos: 16, ticketMedio: 175.0, growth: 0 },
  { month: 'Mai/25', monthFullName: 'Maio 2025', year: 2025, faturamentoBruto: 3100, ganhosLiquidos: 2883, taxaApp: 217, servicosConcluidos: 18, ticketMedio: 172.2, growth: 10.7 },
  { month: 'Jun/25', monthFullName: 'Junho 2025', year: 2025, faturamentoBruto: 2950, ganhosLiquidos: 2743, taxaApp: 207, servicosConcluidos: 17, ticketMedio: 173.5, growth: -4.8 },
  { month: 'Jul/25', monthFullName: 'Julho 2025', year: 2025, faturamentoBruto: 3400, ganhosLiquidos: 3162, taxaApp: 238, servicosConcluidos: 20, ticketMedio: 170.0, growth: 15.3 },
  { month: 'Ago/25', monthFullName: 'Agosto 2025', year: 2025, faturamentoBruto: 3600, ganhosLiquidos: 3348, taxaApp: 252, servicosConcluidos: 21, ticketMedio: 171.4, growth: 5.9 },
  { month: 'Set/25', monthFullName: 'Setembro 2025', year: 2025, faturamentoBruto: 3350, ganhosLiquidos: 3115, taxaApp: 235, servicosConcluidos: 19, ticketMedio: 176.3, growth: -6.9 },
  { month: 'Out/25', monthFullName: 'Outubro 2025', year: 2025, faturamentoBruto: 3500, ganhosLiquidos: 3255, taxaApp: 245, servicosConcluidos: 20, ticketMedio: 175.0, growth: 4.5 },
  { month: 'Nov/25', monthFullName: 'Novembro 2025', year: 2025, faturamentoBruto: 3950, ganhosLiquidos: 3673, taxaApp: 277, servicosConcluidos: 22, ticketMedio: 179.5, growth: 12.8 },
  { month: 'Dez/25', monthFullName: 'Dezembro 2025', year: 2025, faturamentoBruto: 5200, ganhosLiquidos: 4836, taxaApp: 364, servicosConcluidos: 29, ticketMedio: 179.3, growth: 31.6 },
  { month: 'Jan/26', monthFullName: 'Janeiro 2026', year: 2026, faturamentoBruto: 4300, ganhosLiquidos: 3999, taxaApp: 301, servicosConcluidos: 24, ticketMedio: 179.1, growth: -17.3 },
  { month: 'Fev/26', monthFullName: 'Fevereiro 2026', year: 2026, faturamentoBruto: 4700, ganhosLiquidos: 4371, taxaApp: 329, servicosConcluidos: 26, ticketMedio: 180.7, growth: 9.3 },
  { month: 'Mar/26', monthFullName: 'Março 2026 (Atual)', year: 2026, faturamentoBruto: 4890, ganhosLiquidos: 4547, taxaApp: 343, servicosConcluidos: 28, ticketMedio: 174.6, growth: 4.0 }
];

interface ProviderFinanceModalProps {
  isOpen: boolean;
  onClose: () => void;
  provider: UserProfile;
}

export const ProviderFinanceModal: React.FC<ProviderFinanceModalProps> = ({
  isOpen,
  onClose,
  provider
}) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'evolution' | 'receipt' | 'history'>('overview');
  const [isWithdrawing, setIsWithdrawing] = useState(false);
  const [withdrawSuccess, setWithdrawSuccess] = useState(false);

  // Financial values
  const [availableBalance, setAvailableBalance] = useState(1485.50);
  const [escrowBalance, setEscrowBalance] = useState(240.00);
  const [monthTotal, setMonthTotal] = useState(4890.00);

  // Chart controls in Recharts evolution tab
  const [chartPeriod, setChartPeriod] = useState<'6m' | '12m'>('6m');
  const [chartType, setChartType] = useState<'area' | 'bar' | 'services'>('area');

  // Receipt generator state
  const [receiptClientName, setReceiptClientName] = useState('Ana Clara Souza');
  const [receiptService, setReceiptService] = useState('Troca de disjuntor bipolar e fiação');
  const [receiptAmount, setReceiptAmount] = useState('240.00');
  const [receiptDate, setReceiptDate] = useState(new Date().toLocaleDateString('pt-BR'));

  const providerTier: ProviderTier = provider.tier || 'diamond';
  const tierConfig = PROVIDER_TIERS_CONFIG[providerTier];

  if (!isOpen) return null;

  // Selected period data
  const displayData = chartPeriod === '6m' ? MONTHLY_FINANCIAL_HISTORY.slice(-6) : MONTHLY_FINANCIAL_HISTORY;

  // Aggregated calculations for selected period
  const totalFaturamento = displayData.reduce((acc, d) => acc + d.faturamentoBruto, 0);
  const totalLiquido = displayData.reduce((acc, d) => acc + d.ganhosLiquidos, 0);
  const totalTaxas = displayData.reduce((acc, d) => acc + d.taxaApp, 0);
  const totalServicos = displayData.reduce((acc, d) => acc + d.servicosConcluidos, 0);
  const mediaMensalLiquida = totalLiquido / displayData.length;
  const ticketMedioGeral = totalFaturamento / totalServicos;
  const firstMonth = displayData[0].ganhosLiquidos;
  const lastMonth = displayData[displayData.length - 1].ganhosLiquidos;
  const crescimentoPeriodo = (((lastMonth - firstMonth) / firstMonth) * 100).toFixed(1);

  // Annual MEI cap progress (R$ 81.000 limit)
  const faturamentoAnualAcumulado = MONTHLY_FINANCIAL_HISTORY.reduce((acc, d) => acc + d.faturamentoBruto, 0);
  const meiAnnualLimit = 81000;
  const meiProgressPercent = Math.min(100, (faturamentoAnualAcumulado / meiAnnualLimit) * 100);

  const handleWithdrawPix = () => {
    if (availableBalance <= 0) return;
    setIsWithdrawing(true);
    setTimeout(() => {
      const withdrawnAmount = availableBalance;
      setAvailableBalance(0);
      setIsWithdrawing(false);
      setWithdrawSuccess(true);

      notificationService.triggerAlert({
        title: '💸 Saque PIX Transferido com Sucesso!',
        body: `R$ ${withdrawnAmount.toFixed(2)} foi enviado para sua chave PIX ${provider.phone} via TED/PIX instantâneo.`,
        type: 'quote_accepted',
        targetUserId: provider.id,
        targetRole: 'provider'
      });

      setTimeout(() => setWithdrawSuccess(false), 4000);
    }, 1500);
  };

  const handleSendReceiptWhatsApp = () => {
    const text = encodeURIComponent(
      `📄 *RECIBO DE PAGAMENTO DE SERVIÇOS (MEI)*\n` +
      `--------------------------------------\n` +
      `Prestador: *${provider.name}*\n` +
      `Documento: CNH/MEI Verificado\n` +
      `Telefone/PIX: ${provider.phone}\n` +
      `Cliente: *${receiptClientName}*\n` +
      `Serviço: ${receiptService}\n` +
      `Data de Execução: ${receiptDate}\n` +
      `Valor Total Pago: *R$ ${receiptAmount}*\n` +
      `Status: Pago & Garantido por 90 dias via ProServiços.`
    );
    window.open(`https://api.whatsapp.com/send?text=${text}`, '_blank');
  };

  // Custom interactive tooltip for Recharts
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const CustomRechartsTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload as MonthlyFinancialRecord;
      const isPositive = data.growth >= 0;
      return (
        <div className="bg-slate-900/95 backdrop-blur-md text-white p-3.5 rounded-2xl shadow-2xl border border-slate-700/80 text-xs space-y-2 min-w-[220px] pointer-events-none">
          <div className="flex items-center justify-between border-b border-slate-800 pb-1.5">
            <span className="font-extrabold text-slate-100">{data.monthFullName}</span>
            <span
              className={`text-[10px] font-bold font-mono px-1.5 py-0.5 rounded ${
                isPositive ? 'bg-emerald-500/20 text-emerald-400' : 'bg-rose-500/20 text-rose-400'
              }`}
            >
              {isPositive ? `+${data.growth}%` : `${data.growth}%`}
            </span>
          </div>

          <div className="space-y-1.5">
            <div className="flex justify-between items-center text-emerald-400">
              <span className="text-[11px] font-medium flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-emerald-400" />
                Ganhos Líquidos:
              </span>
              <span className="font-mono font-bold text-sm">
                R$ {data.ganhosLiquidos.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </span>
            </div>

            <div className="flex justify-between items-center text-indigo-300">
              <span className="text-[11px] flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-indigo-400" />
                Faturamento Bruto:
              </span>
              <span className="font-mono text-[11px]">
                R$ {data.faturamentoBruto.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </span>
            </div>

            <div className="flex justify-between items-center text-slate-400 text-[11px]">
              <span>Taxa ProServiços ({tierConfig.commissionPercent}%):</span>
              <span className="font-mono text-rose-300">
                - R$ {data.taxaApp.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </span>
            </div>
          </div>

          <div className="pt-2 border-t border-slate-800 flex justify-between items-center text-[11px]">
            <span className="text-amber-400 font-bold flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5" />
              {data.servicosConcluidos} chamados
            </span>
            <span className="text-slate-400">Ticket méd: R$ {data.ticketMedio.toFixed(0)}</span>
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-xs">
      <div
        id="provider-finance-modal"
        className="relative w-full max-w-3xl lg:max-w-4xl bg-white rounded-2xl shadow-2xl border border-slate-100 overflow-hidden flex flex-col max-h-[92vh] animate-in fade-in zoom-in-95 duration-200"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-500/20 text-indigo-400 flex items-center justify-center border border-indigo-400/30 shrink-0">
              <Wallet className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold">Cockpit Financeiro & Evolução de Ganhos</h2>
                <span
                  className={`text-[10px] font-black px-2 py-0.5 rounded-full border ${tierConfig.badgeBg} ${tierConfig.badgeText} ${tierConfig.borderColor}`}
                >
                  {tierConfig.badgeLabel}
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Gestão analítica de faturamento mensal, taxa MEI e saques PIX
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white hover:bg-white/10 rounded-full transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Tabs */}
        <div className="flex border-b border-slate-200 bg-slate-50 px-4 sm:px-6 overflow-x-auto">
          <button
            onClick={() => setActiveTab('overview')}
            className={`py-3 px-4 text-xs font-bold border-b-2 flex items-center gap-2 transition whitespace-nowrap ${
              activeTab === 'overview'
                ? 'border-indigo-600 text-indigo-700 bg-white'
                : 'border-transparent text-slate-500 hover:text-slate-700'
            }`}
          >
            <TrendingUp className="w-4 h-4" />
            Visão Geral & Saldo
          </button>
          <button
            id="tab-btn-evolution"
            onClick={() => setActiveTab('evolution')}
            className={`py-3 px-4 text-xs font-bold border-b-2 flex items-center gap-2 transition whitespace-nowrap ${
              activeTab === 'evolution'
                ? 'border-indigo-600 text-indigo-700 bg-white'
                : 'border-transparent text-slate-500 hover:text-slate-700'
            }`}
          >
            <BarChart3 className="w-4 h-4 text-indigo-600" />
            Evolução Mensal (Recharts)
          </button>
          <button
            onClick={() => setActiveTab('receipt')}
            className={`py-3 px-4 text-xs font-bold border-b-2 flex items-center gap-2 transition whitespace-nowrap ${
              activeTab === 'receipt'
                ? 'border-indigo-600 text-indigo-700 bg-white'
                : 'border-transparent text-slate-500 hover:text-slate-700'
            }`}
          >
            <FileText className="w-4 h-4" />
            Emissor de Recibo MEI
          </button>
          <button
            onClick={() => setActiveTab('history')}
            className={`py-3 px-4 text-xs font-bold border-b-2 flex items-center gap-2 transition whitespace-nowrap ${
              activeTab === 'history'
                ? 'border-indigo-600 text-indigo-700 bg-white'
                : 'border-transparent text-slate-500 hover:text-slate-700'
            }`}
          >
            <Calendar className="w-4 h-4" />
            Histórico de Lançamentos
          </button>
        </div>

        {/* Tab Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-5">
          {activeTab === 'overview' ? (
            <div className="space-y-5">
              {/* Balance Cards Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {/* Available for withdraw */}
                <div className="p-4 bg-emerald-50/80 rounded-xl border border-emerald-200/80 relative overflow-hidden">
                  <div className="text-[11px] font-bold text-emerald-800 flex items-center justify-between">
                    <span>Disponível para PIX</span>
                    <CheckCircle className="w-4 h-4 text-emerald-600" />
                  </div>
                  <div className="text-xl font-black text-emerald-950 mt-1">
                    R$ {availableBalance.toFixed(2)}
                  </div>
                  <p className="text-[10px] text-emerald-700 mt-1">Liberado pós-conclusão</p>
                </div>

                {/* Retained in Escrow */}
                <div className="p-4 bg-indigo-50/80 rounded-xl border border-indigo-200/80">
                  <div className="text-[11px] font-bold text-indigo-800 flex items-center justify-between">
                    <span>Retido em Custódia</span>
                    <Clock className="w-4 h-4 text-indigo-600" />
                  </div>
                  <div className="text-xl font-black text-indigo-950 mt-1">
                    R$ {escrowBalance.toFixed(2)}
                  </div>
                  <p className="text-[10px] text-indigo-700 mt-1">Aguardando cliente validar PIN</p>
                </div>

                {/* Month total */}
                <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
                  <div className="text-[11px] font-bold text-slate-700 flex items-center justify-between">
                    <span>Faturado no Mês</span>
                    <TrendingUp className="w-4 h-4 text-slate-600" />
                  </div>
                  <div className="text-xl font-black text-slate-900 mt-1">
                    R$ {monthTotal.toFixed(2)}
                  </div>
                  <p className="text-[10px] text-slate-500 mt-1">28 chamados atendidos</p>
                </div>
              </div>

              {/* Instant PIX Cashout Banner */}
              <div className="p-4 bg-gradient-to-r from-emerald-600 to-teal-700 rounded-xl text-white flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-sm">
                <div>
                  <h4 className="text-sm font-bold flex items-center gap-1.5">
                    <ArrowDownToLine className="w-4 h-4" />
                    Saque Instantâneo via PIX
                  </h4>
                  <p className="text-xs text-emerald-100 mt-0.5">
                    Chave PIX cadastrada: <strong className="font-mono text-white">{provider.phone}</strong> (Sem tarifas)
                  </p>
                </div>
                <button
                  onClick={handleWithdrawPix}
                  disabled={isWithdrawing || availableBalance <= 0}
                  className="px-4 py-2 bg-white text-emerald-800 hover:bg-emerald-50 rounded-lg font-bold text-xs shadow-sm transition disabled:opacity-50 flex items-center gap-2 self-start sm:self-auto shrink-0"
                >
                  {isWithdrawing ? (
                    <>
                      <span className="w-3.5 h-3.5 border-2 border-emerald-800 border-t-transparent rounded-full animate-spin" />
                      Enviando PIX...
                    </>
                  ) : (
                    <>
                      <DollarSign className="w-4 h-4" />
                      Transferir R$ {availableBalance.toFixed(2)}
                    </>
                  )}
                </button>
              </div>

              {withdrawSuccess && (
                <div className="p-3 bg-emerald-100 text-emerald-900 text-xs font-semibold rounded-xl border border-emerald-300 flex items-center gap-2 animate-in fade-in">
                  <CheckCircle className="w-4 h-4 text-emerald-700" />
                  <span>Transferência PIX realizada com sucesso no Banco Central! O saldo já caiu na sua conta.</span>
                </div>
              )}

              {/* Monthly Evolution Mini-Panel (Recharts) */}
              <div className="p-4 bg-slate-50/90 rounded-2xl border border-slate-200/90 space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-xl bg-indigo-600 text-white flex items-center justify-center font-bold shadow-xs">
                      <TrendingUp className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-slate-900 flex items-center gap-2">
                        <span>Evolução Mensal de Faturamento</span>
                        <span className="px-1.5 py-0.5 text-[10px] font-bold rounded bg-emerald-100 text-emerald-800">
                          +{crescimentoPeriodo}%
                        </span>
                      </h4>
                      <p className="text-[11px] text-slate-500">
                        Visualização gráfica dos últimos 6 meses com Recharts
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setActiveTab('evolution')}
                    className="py-1.5 px-3 rounded-lg bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-bold text-xs flex items-center gap-1.5 transition self-start sm:self-auto border border-indigo-200/60"
                  >
                    <span>Ver Painel Detalhado</span>
                    <ArrowUpRight className="w-3.5 h-3.5" />
                  </button>
                </div>

                {/* Recharts Area Chart in Overview */}
                <div className="w-full h-44 pt-1">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart
                      data={MONTHLY_FINANCIAL_HISTORY.slice(-6)}
                      margin={{ top: 8, right: 10, left: -20, bottom: 0 }}
                    >
                      <defs>
                        <linearGradient id="overviewGanhos" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#10b981" stopOpacity={0.35} />
                          <stop offset="95%" stopColor="#10b981" stopOpacity={0.0} />
                        </linearGradient>
                        <linearGradient id="overviewBruto" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#6366f1" stopOpacity={0.2} />
                          <stop offset="95%" stopColor="#6366f1" stopOpacity={0.0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                      <XAxis
                        dataKey="month"
                        tick={{ fontSize: 10, fill: '#64748b' }}
                        axisLine={false}
                        tickLine={false}
                      />
                      <YAxis
                        tick={{ fontSize: 10, fill: '#64748b' }}
                        axisLine={false}
                        tickLine={false}
                        tickFormatter={(v) => `R$${(v / 1000).toFixed(0)}k`}
                      />
                      <Tooltip content={<CustomRechartsTooltip />} />
                      <Area
                        type="monotone"
                        dataKey="faturamentoBruto"
                        stroke="#818cf8"
                        strokeWidth={1.5}
                        fill="url(#overviewBruto)"
                      />
                      <Area
                        type="monotone"
                        dataKey="ganhosLiquidos"
                        stroke="#10b981"
                        strokeWidth={2.5}
                        fill="url(#overviewGanhos)"
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>

                <div className="flex items-center justify-between text-[11px] text-slate-500 pt-1 border-t border-slate-200">
                  <div className="flex items-center gap-3">
                    <span className="flex items-center gap-1.5 font-medium">
                      <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                      Ganhos Líquidos (R$ {lastMonth.toLocaleString('pt-BR', { minimumFractionDigits: 2 })})
                    </span>
                    <span className="flex items-center gap-1.5 font-medium">
                      <span className="w-2.5 h-2.5 rounded-full bg-indigo-500" />
                      Faturamento Bruto
                    </span>
                  </div>
                  <span className="font-bold text-slate-700">Média: R$ {mediaMensalLiquida.toFixed(0)}/mês</span>
                </div>
              </div>

              {/* Tier Commission Advantage */}
              <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/60 space-y-2 text-xs">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Award className="w-4 h-4 text-indigo-600" />
                    <span className="font-bold text-slate-800">
                      Vantagem do Nível {tierConfig.name}: Taxa de Apenas {tierConfig.commissionPercent}%
                    </span>
                  </div>
                  <span className="text-[11px] text-emerald-700 font-semibold">
                    Economia de R$ 340,00 este mês
                  </span>
                </div>
                <p className="text-slate-600 leading-relaxed">
                  Por possuir verificação biométrica e nota média 4.9★, você tem acesso à menor alíquota de serviço
                  do mercado e prioridade no raio do mapa.
                </p>
              </div>
            </div>
          ) : activeTab === 'evolution' ? (
            /* Dedicated Visual Recharts Evolution Panel */
            <div id="recharts-monthly-evolution-panel" className="space-y-5">
              {/* Header Metrics Highlights */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="p-3.5 bg-gradient-to-br from-indigo-50 to-indigo-100/50 rounded-2xl border border-indigo-200/80">
                  <span className="text-[10px] font-bold text-indigo-800 uppercase tracking-wide block">
                    Ganhos Líquidos ({chartPeriod === '6m' ? '6 Meses' : '1 Ano'})
                  </span>
                  <div className="text-lg font-black text-indigo-950 mt-1 font-mono">
                    R$ {totalLiquido.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </div>
                  <span className="text-[10px] text-emerald-700 font-semibold flex items-center gap-0.5 mt-0.5">
                    <ArrowUpRight className="w-3 h-3" />
                    +{crescimentoPeriodo}% no período
                  </span>
                </div>

                <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200">
                  <span className="text-[10px] font-bold text-slate-600 uppercase tracking-wide block">
                    Faturamento Bruto
                  </span>
                  <div className="text-lg font-black text-slate-900 mt-1 font-mono">
                    R$ {totalFaturamento.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </div>
                  <span className="text-[10px] text-slate-500 block mt-0.5">
                    Taxas: R$ {totalTaxas.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </span>
                </div>

                <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200">
                  <span className="text-[10px] font-bold text-slate-600 uppercase tracking-wide block">
                    Média Mensal Líquida
                  </span>
                  <div className="text-lg font-black text-slate-900 mt-1 font-mono">
                    R$ {mediaMensalLiquida.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </div>
                  <span className="text-[10px] text-slate-500 block mt-0.5">
                    {displayData.length} meses apurados
                  </span>
                </div>

                <div className="p-3.5 bg-amber-50/70 rounded-2xl border border-amber-200/70">
                  <span className="text-[10px] font-bold text-amber-900 uppercase tracking-wide block">
                    Total Atendimentos
                  </span>
                  <div className="text-lg font-black text-amber-950 mt-1 font-mono">
                    {totalServicos} serviços
                  </div>
                  <span className="text-[10px] text-amber-800 block mt-0.5">
                    Méd. R$ {ticketMedioGeral.toFixed(0)} por chamado
                  </span>
                </div>
              </div>

              {/* Chart Controls Toolbar */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3 bg-slate-50 rounded-2xl border border-slate-200">
                <div className="flex items-center gap-1 bg-white p-1 rounded-xl border border-slate-200 self-start sm:self-auto">
                  <button
                    type="button"
                    onClick={() => setChartPeriod('6m')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${
                      chartPeriod === '6m'
                        ? 'bg-indigo-600 text-white shadow-xs'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    Últimos 6 Meses
                  </button>
                  <button
                    type="button"
                    onClick={() => setChartPeriod('12m')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${
                      chartPeriod === '12m'
                        ? 'bg-indigo-600 text-white shadow-xs'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    12 Meses (Anual)
                  </button>
                </div>

                {/* Chart Type Selector */}
                <div className="flex items-center gap-1 bg-white p-1 rounded-xl border border-slate-200 self-start sm:self-auto">
                  <button
                    type="button"
                    onClick={() => setChartType('area')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 ${
                      chartType === 'area'
                        ? 'bg-indigo-600 text-white shadow-xs'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                    title="Gráfico de Área Suave"
                  >
                    <TrendingUp className="w-3.5 h-3.5" />
                    <span>Área Suave</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setChartType('bar')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 ${
                      chartType === 'bar'
                        ? 'bg-indigo-600 text-white shadow-xs'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                    title="Gráfico de Barras Comparativo"
                  >
                    <BarChart3 className="w-3.5 h-3.5" />
                    <span>Barras</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setChartType('services')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 ${
                      chartType === 'services'
                        ? 'bg-indigo-600 text-white shadow-xs'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                    title="Volume de Serviços Realizados"
                  >
                    <Activity className="w-3.5 h-3.5" />
                    <span>Chamados</span>
                  </button>
                </div>
              </div>

              {/* Main Recharts Container */}
              <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-xs space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-extrabold text-slate-900">
                      {chartType === 'area'
                        ? 'Evolução Líquida vs Faturamento Bruto'
                        : chartType === 'bar'
                        ? 'Comparativo Mensal de Recebíveis'
                        : 'Histórico de Chamados Concluídos por Mês'}
                    </h3>
                    <p className="text-xs text-slate-500">
                      Valores garantidos pela ProServiços via PIX e custódia segura
                    </p>
                  </div>
                  <div className="flex items-center gap-3 text-xs">
                    {chartType !== 'services' ? (
                      <>
                        <span className="flex items-center gap-1.5 text-emerald-700 font-bold">
                          <span className="w-3 h-3 rounded-md bg-emerald-500 inline-block" />
                          Ganhos Líquidos
                        </span>
                        <span className="flex items-center gap-1.5 text-indigo-700 font-bold">
                          <span className="w-3 h-3 rounded-md bg-indigo-500 inline-block" />
                          Faturamento Bruto
                        </span>
                      </>
                    ) : (
                      <span className="flex items-center gap-1.5 text-amber-700 font-bold">
                        <span className="w-3 h-3 rounded-md bg-amber-500 inline-block" />
                        Chamados Atendidos
                      </span>
                    )}
                  </div>
                </div>

                {/* The Responsive Recharts Box */}
                <div className="w-full h-72">
                  <ResponsiveContainer width="100%" height="100%">
                    {chartType === 'area' ? (
                      <AreaChart
                        data={displayData}
                        margin={{ top: 10, right: 10, left: -10, bottom: 0 }}
                      >
                        <defs>
                          <linearGradient id="colorGanhosLiquidos" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#10b981" stopOpacity={0.4} />
                            <stop offset="95%" stopColor="#10b981" stopOpacity={0.0} />
                          </linearGradient>
                          <linearGradient id="colorFaturamentoBruto" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#6366f1" stopOpacity={0.25} />
                            <stop offset="95%" stopColor="#6366f1" stopOpacity={0.0} />
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                        <XAxis
                          dataKey="month"
                          tick={{ fontSize: 11, fill: '#64748b' }}
                          axisLine={{ stroke: '#e2e8f0' }}
                          tickLine={false}
                        />
                        <YAxis
                          tick={{ fontSize: 11, fill: '#64748b' }}
                          axisLine={false}
                          tickLine={false}
                          tickFormatter={(v) => `R$${v >= 1000 ? (v / 1000).toFixed(0) + 'k' : v}`}
                        />
                        <Tooltip content={<CustomRechartsTooltip />} />
                        <Area
                          type="monotone"
                          dataKey="faturamentoBruto"
                          name="Faturamento Bruto"
                          stroke="#6366f1"
                          strokeWidth={2}
                          fillOpacity={1}
                          fill="url(#colorFaturamentoBruto)"
                        />
                        <Area
                          type="monotone"
                          dataKey="ganhosLiquidos"
                          name="Ganhos Líquidos"
                          stroke="#10b981"
                          strokeWidth={3}
                          fillOpacity={1}
                          fill="url(#colorGanhosLiquidos)"
                        />
                      </AreaChart>
                    ) : chartType === 'bar' ? (
                      <BarChart
                        data={displayData}
                        margin={{ top: 10, right: 10, left: -10, bottom: 0 }}
                      >
                        <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                        <XAxis
                          dataKey="month"
                          tick={{ fontSize: 11, fill: '#64748b' }}
                          axisLine={{ stroke: '#e2e8f0' }}
                          tickLine={false}
                        />
                        <YAxis
                          tick={{ fontSize: 11, fill: '#64748b' }}
                          axisLine={false}
                          tickLine={false}
                          tickFormatter={(v) => `R$${v >= 1000 ? (v / 1000).toFixed(0) + 'k' : v}`}
                        />
                        <Tooltip content={<CustomRechartsTooltip />} />
                        <Bar
                          dataKey="faturamentoBruto"
                          name="Faturamento Bruto"
                          fill="#818cf8"
                          radius={[4, 4, 0, 0]}
                        />
                        <Bar
                          dataKey="ganhosLiquidos"
                          name="Ganhos Líquidos"
                          fill="#10b981"
                          radius={[4, 4, 0, 0]}
                        />
                      </BarChart>
                    ) : (
                      <BarChart
                        data={displayData}
                        margin={{ top: 10, right: 10, left: -10, bottom: 0 }}
                      >
                        <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                        <XAxis
                          dataKey="month"
                          tick={{ fontSize: 11, fill: '#64748b' }}
                          axisLine={{ stroke: '#e2e8f0' }}
                          tickLine={false}
                        />
                        <YAxis
                          tick={{ fontSize: 11, fill: '#64748b' }}
                          axisLine={false}
                          tickLine={false}
                          tickFormatter={(v) => `${v}`}
                        />
                        <Tooltip content={<CustomRechartsTooltip />} />
                        <Bar
                          dataKey="servicosConcluidos"
                          name="Chamados Concluídos"
                          fill="#f59e0b"
                          radius={[6, 6, 0, 0]}
                        />
                      </BarChart>
                    )}
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Monthly Breakdown Data Table */}
              <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-xs">
                <div className="p-4 bg-slate-50/80 border-b border-slate-200 flex items-center justify-between">
                  <h4 className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                    <FileText className="w-4 h-4 text-indigo-600" />
                    Tabela Detalhada de Rendimentos Mês a Mês
                  </h4>
                  <span className="text-[11px] text-slate-500">
                    Taxa ProServiços: {tierConfig.commissionPercent}%
                  </span>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-xs text-left">
                    <thead className="bg-slate-100 text-slate-700 font-bold border-b border-slate-200">
                      <tr>
                        <th className="py-2.5 px-4">Mês / Ano</th>
                        <th className="py-2.5 px-4">Faturamento Bruto</th>
                        <th className="py-2.5 px-4">Taxa App ({tierConfig.commissionPercent}%)</th>
                        <th className="py-2.5 px-4">Ganhos Líquidos</th>
                        <th className="py-2.5 px-4 text-center">Chamados</th>
                        <th className="py-2.5 px-4">Ticket Médio</th>
                        <th className="py-2.5 px-4 text-right">Crescimento</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 font-mono">
                      {displayData.map((row, idx) => (
                        <tr key={idx} className="hover:bg-slate-50/80 transition-colors">
                          <td className="py-2.5 px-4 font-sans font-bold text-slate-800">
                            {row.monthFullName}
                          </td>
                          <td className="py-2.5 px-4 text-slate-600">
                            R$ {row.faturamentoBruto.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                          </td>
                          <td className="py-2.5 px-4 text-rose-500">
                            - R$ {row.taxaApp.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                          </td>
                          <td className="py-2.5 px-4 font-bold text-emerald-700">
                            R$ {row.ganhosLiquidos.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                          </td>
                          <td className="py-2.5 px-4 text-center font-sans">
                            <span className="px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 text-[11px] font-bold">
                              {row.servicosConcluidos}
                            </span>
                          </td>
                          <td className="py-2.5 px-4 text-slate-600">
                            R$ {row.ticketMedio.toFixed(2)}
                          </td>
                          <td className="py-2.5 px-4 text-right">
                            {row.growth !== 0 ? (
                              <span
                                className={`inline-flex items-center gap-0.5 font-bold text-[11px] ${
                                  row.growth > 0 ? 'text-emerald-600' : 'text-rose-600'
                                }`}
                              >
                                {row.growth > 0 ? (
                                  <ArrowUpRight className="w-3 h-3" />
                                ) : (
                                  <ArrowDownRight className="w-3 h-3" />
                                )}
                                {Math.abs(row.growth)}%
                              </span>
                            ) : (
                              <span className="text-slate-400 text-[11px]">—</span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* MEI Limit Tracker & Tax Benefits */}
              <div className="p-4 bg-gradient-to-r from-indigo-900 to-slate-900 rounded-3xl text-white space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-xl bg-indigo-500/20 text-indigo-400 flex items-center justify-center border border-indigo-400/30">
                      <Building2 className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="text-xs font-bold">Acompanhamento do Limite Anual MEI</h4>
                      <p className="text-[11px] text-slate-400">
                        Limite anual legal MEI: R$ 81.000,00 (R$ 6.750,00/mês)
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-sm font-black font-mono text-emerald-400">
                      R$ {faturamentoAnualAcumulado.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </span>
                    <span className="text-[10px] text-slate-400 block">
                      ({meiProgressPercent.toFixed(1)}% do teto anual)
                    </span>
                  </div>
                </div>

                {/* Progress Bar */}
                <div className="w-full bg-slate-800 rounded-full h-2.5 overflow-hidden">
                  <div
                    className="bg-gradient-to-r from-emerald-500 to-indigo-500 h-full rounded-full transition-all duration-500"
                    style={{ width: `${meiProgressPercent}%` }}
                  />
                </div>

                <div className="flex items-center justify-between text-[11px] text-slate-400 pt-1">
                  <span>Margem restante no ano: R$ {(meiAnnualLimit - faturamentoAnualAcumulado).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
                  <span className="text-emerald-400 font-semibold flex items-center gap-1">
                    <CheckCircle className="w-3.5 h-3.5" />
                    Situação Regular & Isento de IRPF adicional
                  </span>
                </div>
              </div>
            </div>
          ) : activeTab === 'receipt' ? (
            /* Digital Receipt Generator for MEI */
            <div className="space-y-4">
              <div className="bg-indigo-50/70 p-3.5 rounded-xl border border-indigo-100 text-xs text-indigo-950 flex items-start gap-2.5">
                <FileText className="w-4 h-4 text-indigo-600 shrink-0 mt-0.5" />
                <p>
                  Gere comprovantes profissionais para enviar aos clientes pelo WhatsApp com seus dados de prestador,
                  garantia de 90 dias e código de transação.
                </p>
              </div>

              {/* Form to tweak receipt */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Nome do Cliente:</label>
                  <input
                    type="text"
                    value={receiptClientName}
                    onChange={(e) => setReceiptClientName(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-slate-900 bg-white"
                  />
                </div>
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Valor do Serviço (R$):</label>
                  <input
                    type="text"
                    value={receiptAmount}
                    onChange={(e) => setReceiptAmount(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-slate-900 bg-white font-mono font-bold"
                  />
                </div>
                <div className="sm:col-span-2">
                  <label className="font-semibold text-slate-700 block mb-1">Descrição do Serviço Realizado:</label>
                  <input
                    type="text"
                    value={receiptService}
                    onChange={(e) => setReceiptService(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-slate-900 bg-white"
                  />
                </div>
              </div>

              {/* Receipt Preview Card */}
              <div className="bg-slate-50 border border-slate-200 p-5 rounded-2xl space-y-3 text-xs font-mono">
                <div className="text-center border-b border-dashed border-slate-300 pb-3 space-y-1">
                  <h4 className="font-black text-slate-900 text-sm">COMPROVANTE DE PRESTAÇÃO DE SERVIÇOS</h4>
                  <p className="text-[11px] text-slate-500">PROSERVIÇOS BRASIL - EMISSÃO DIGITAL MEI</p>
                </div>

                <div className="space-y-1.5 text-slate-700">
                  <div className="flex justify-between">
                    <span>PRESTADOR:</span>
                    <strong>{provider.name}</strong>
                  </div>
                  <div className="flex justify-between">
                    <span>CATEGORIA / ESPECIALIDADE:</span>
                    <span>{provider.category || 'Eletricista'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>DOCUMENTAÇÃO:</span>
                    <span>CNH & Facial Verificados</span>
                  </div>
                  <div className="flex justify-between">
                    <span>CLIENTE:</span>
                    <strong>{receiptClientName}</strong>
                  </div>
                  <div className="flex justify-between">
                    <span>DESCRIÇÃO:</span>
                    <span>{receiptService}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>DATA:</span>
                    <span>{receiptDate}</span>
                  </div>
                  <div className="flex justify-between border-t border-dashed border-slate-300 pt-2 text-sm font-black text-slate-900">
                    <span>VALOR TOTAL:</span>
                    <span className="text-emerald-700">R$ {receiptAmount}</span>
                  </div>
                </div>

                <div className="border-t border-dashed border-slate-300 pt-2 text-[10px] text-slate-500 text-center">
                  Garantia de 90 dias assegurada conforme Código de Defesa do Consumidor.
                </div>
              </div>

              {/* Action Buttons */}
              <div className="grid grid-cols-2 gap-3 pt-2">
                <button
                  onClick={handleSendReceiptWhatsApp}
                  className="py-2.5 px-4 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs flex items-center justify-center gap-2 transition shadow-xs"
                >
                  <Share2 className="w-4 h-4" />
                  Enviar Recibo no WhatsApp
                </button>
                <button
                  onClick={() => window.print()}
                  className="py-2.5 px-4 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-xl text-xs flex items-center justify-center gap-2 transition shadow-xs"
                >
                  <FileText className="w-4 h-4" />
                  Imprimir Comprovante
                </button>
              </div>
            </div>
          ) : (
            /* Transaction history */
            <div className="space-y-2 divide-y divide-slate-100">
              {[
                {
                  title: 'Troca de fiação e disjuntores - Ana Clara',
                  date: 'Hoje, 14:32',
                  type: 'Crédito de Serviço',
                  amount: '+ R$ 240,00',
                  status: 'Liberado PIX',
                  positive: true
                },
                {
                  title: 'Materiais na Leroy Merlin Pinheiros',
                  date: 'Hoje, 13:10',
                  type: 'Repasse Loja Parceira',
                  amount: '- R$ 85,00',
                  status: 'Faturado',
                  positive: false
                },
                {
                  title: 'Instalação de Chuveiro Lorenzetti - Rodrigo',
                  date: 'Ontem, 18:20',
                  type: 'Crédito de Serviço',
                  amount: '+ R$ 120,00',
                  status: 'Liberado PIX',
                  positive: true
                },
                {
                  title: 'Saque Instantâneo PIX para conta',
                  date: '18 Set, 09:15',
                  type: 'Transferência Bancária',
                  amount: '- R$ 1.200,00',
                  status: 'Concluído',
                  positive: false
                }
              ].map((tx, idx) => (
                <div key={idx} className="pt-2.5 first:pt-0 flex items-center justify-between text-xs">
                  <div>
                    <h5 className="font-semibold text-slate-800">{tx.title}</h5>
                    <div className="flex items-center gap-2 text-[11px] text-slate-400 mt-0.5">
                      <span>{tx.date}</span>
                      <span>•</span>
                      <span>{tx.type}</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className={`font-mono font-bold ${tx.positive ? 'text-emerald-700' : 'text-slate-700'}`}>
                      {tx.amount}
                    </span>
                    <span className="block text-[10px] text-slate-500 font-medium">{tx.status}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
