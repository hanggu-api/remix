import React, { useState, useEffect } from 'react';
import {
  ShieldCheck,
  CheckCircle,
  Copy,
  Clock,
  Lock,
  ArrowRight,
  AlertCircle,
  X,
  CreditCard,
  DollarSign,
  Smartphone,
  Info
} from 'lucide-react';
import { ProviderQuote, EscrowPayment } from '../types';
import { notificationService } from '../services/notificationService';

interface EscrowPaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  quote: ProviderQuote | null;
  clientName: string;
  serviceTitle?: string;
  onPaymentSuccess: (payment: EscrowPayment) => void;
}

export const EscrowPaymentModal: React.FC<EscrowPaymentModalProps> = ({
  isOpen,
  onClose,
  quote,
  clientName,
  serviceTitle,
  onPaymentSuccess
}) => {
  const [copied, setCopied] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentStep, setPaymentStep] = useState<'checkout' | 'paid'>('checkout');
  const [timeLeft, setTimeLeft] = useState(895); // ~15 minutes

  // Calculate pricing breakdown
  const laborPrice = quote ? quote.price : 0;
  const materialsPrice = quote?.includeMaterials && quote?.materialsTotal ? quote.materialsTotal : 0;
  const subtotal = laborPrice + materialsPrice;
  const platformFee = Math.round(subtotal * 0.08 * 100) / 100; // 8% escrow protection fee
  const totalAmount = subtotal + platformFee;
  const providerNet = Math.round((laborPrice * 0.90) * 100) / 100; // 90% of labor goes to provider

  // Simulated EMV PIX string
  const pixCode = `00020126580014BR.GOV.BCB.PIX0136proservicos-escrow-${quote?.id || 'default'}520400005303986540${totalAmount.toFixed(2)}5802BR5911PROSERVICOS6009SAO_PAULO62070503***6304`;

  useEffect(() => {
    if (!isOpen) {
      setPaymentStep('checkout');
      setIsProcessing(false);
      setCopied(false);
      setTimeLeft(895);
      return;
    }

    const interval = setInterval(() => {
      setTimeLeft((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(interval);
  }, [isOpen]);

  if (!isOpen || !quote) return null;

  const formatTimer = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleCopyPix = () => {
    navigator.clipboard.writeText(pixCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleSimulatePayment = () => {
    setIsProcessing(true);
    setTimeout(() => {
      setIsProcessing(false);
      setPaymentStep('paid');

      const paymentRecord: EscrowPayment = {
        id: `escrow-${Date.now()}`,
        requestId: quote.requestId,
        quoteId: quote.id,
        totalAmount,
        laborAmount: laborPrice,
        materialsAmount: materialsPrice,
        platformFee,
        providerNet,
        pixCode,
        status: 'in_escrow',
        paidAt: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
        securityPin: '7412'
      };

      // Real-time Push Alert
      notificationService.triggerAlert({
        title: '🛡️ Pagamento em Custódia Protegido!',
        body: `R$ ${totalAmount.toFixed(2)} recebido e retido em custódia. O prestador foi acionado para iniciar o trajeto.`,
        type: 'quote_accepted',
        targetRole: 'client',
        data: { requestId: quote.requestId, quoteId: quote.id }
      });

      onPaymentSuccess(paymentRecord);
    }, 1200);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
      <div
        id="escrow-payment-modal"
        className="relative w-full max-w-lg bg-white rounded-2xl shadow-2xl border border-slate-100 overflow-hidden flex flex-col max-h-[92vh] animate-in fade-in zoom-in-95 duration-200"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 bg-zinc-950 text-white border-b border-zinc-800">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-zinc-900 border border-zinc-800 flex items-center justify-center">
              <ShieldCheck className="w-6 h-6 text-sky-400" />
            </div>
            <div>
              <h2 className="text-base font-bold flex items-center gap-2 text-white">
                Pagamento Seguro ProServiços
                <span className="text-[10px] uppercase tracking-wider bg-zinc-800 text-sky-300 border border-zinc-700 px-2 py-0.5 rounded-full font-bold">
                  Escrow 100%
                </span>
              </h2>
              <p className="text-xs text-zinc-400">
                Seu dinheiro fica protegido e só é liberado após o serviço concluído
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-zinc-400 hover:text-white hover:bg-zinc-800 rounded-full transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {paymentStep === 'checkout' ? (
          <div className="p-6 overflow-y-auto space-y-5">
            {/* Custody Guarantee Badge */}
            <div className="p-3.5 bg-zinc-50 rounded-xl border border-zinc-200 flex items-start gap-3">
              <Lock className="w-5 h-5 text-sky-600 shrink-0 mt-0.5" />
              <div className="text-xs text-zinc-900 space-y-1">
                <p className="font-bold">Garantia de Custódia ProServiços:</p>
                <p className="text-zinc-600 leading-relaxed">
                  O prestador <strong>{quote.providerName}</strong> saberá que o valor já está garantido,
                  mas só receberá a transferência PIX na conta dele após você conferir o resultado e confirmar o PIN no local.
                </p>
              </div>
            </div>

            {/* Price Breakdown Card */}
            <div className="bg-slate-50 rounded-xl p-4 border border-slate-200/80 space-y-2 text-xs">
              <div className="flex justify-between text-slate-600">
                <span>Mão de Obra ({quote.providerName}):</span>
                <span className="font-semibold text-slate-800">R$ {laborPrice.toFixed(2)}</span>
              </div>

              {materialsPrice > 0 && (
                <div className="flex justify-between text-slate-600">
                  <span>Materiais da Loja ({quote.selectedStoreName || 'Parceira'}):</span>
                  <span className="font-semibold text-slate-800">R$ {materialsPrice.toFixed(2)}</span>
                </div>
              )}

              <div className="flex justify-between text-slate-500">
                <span className="flex items-center gap-1">
                  Taxa de Proteção & Escrow Seguro:
                  <Info className="w-3.5 h-3.5 text-slate-400" />
                </span>
                <span>R$ {platformFee.toFixed(2)}</span>
              </div>

              <div className="border-t border-slate-200 pt-2 mt-2 flex justify-between items-baseline text-sm">
                <span className="font-bold text-slate-900">Total a Pagar via PIX:</span>
                <span className="text-xl font-black text-emerald-700">R$ {totalAmount.toFixed(2)}</span>
              </div>
            </div>

            {/* PIX QR Code & Code section */}
            <div className="text-center space-y-3">
              <div className="inline-block p-3 bg-white rounded-2xl border-2 border-emerald-500/30 shadow-sm relative">
                {/* SVG Visual Simulated QR Code */}
                <svg
                  className="w-44 h-44 mx-auto"
                  viewBox="0 0 100 100"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  {/* Outer corner finders */}
                  <rect width="100" height="100" fill="white" />
                  <rect x="5" y="5" width="26" height="26" rx="4" fill="#047857" />
                  <rect x="9" y="9" width="18" height="18" rx="2" fill="white" />
                  <rect x="13" y="13" width="10" height="10" fill="#047857" />

                  <rect x="69" y="5" width="26" height="26" rx="4" fill="#047857" />
                  <rect x="73" y="9" width="18" height="18" rx="2" fill="white" />
                  <rect x="77" y="13" width="10" height="10" fill="#047857" />

                  <rect x="5" y="69" width="26" height="26" rx="4" fill="#047857" />
                  <rect x="9" y="73" width="18" height="18" rx="2" fill="white" />
                  <rect x="13" y="77" width="10" height="10" fill="#047857" />

                  {/* Dense pattern matrix */}
                  <rect x="36" y="8" width="6" height="6" fill="#047857" />
                  <rect x="46" y="8" width="6" height="6" fill="#047857" />
                  <rect x="56" y="8" width="6" height="6" fill="#047857" />
                  <rect x="36" y="18" width="6" height="6" fill="#047857" />
                  <rect x="48" y="22" width="8" height="8" fill="#047857" />
                  <rect x="8" y="36" width="6" height="6" fill="#047857" />
                  <rect x="18" y="42" width="6" height="6" fill="#047857" />
                  <rect x="28" y="36" width="6" height="6" fill="#047857" />
                  <rect x="38" y="36" width="10" height="10" fill="#047857" />
                  <rect x="52" y="36" width="6" height="6" fill="#047857" />
                  <rect x="62" y="36" width="12" height="12" fill="#047857" />
                  <rect x="78" y="36" width="6" height="6" fill="#047857" />
                  <rect x="88" y="42" width="6" height="6" fill="#047857" />
                  <rect x="36" y="52" width="10" height="10" fill="#047857" />
                  <rect x="50" y="50" width="12" height="12" fill="#047857" />
                  <rect x="66" y="54" width="8" height="8" fill="#047857" />
                  <rect x="78" y="50" width="6" height="6" fill="#047857" />
                  <rect x="88" y="56" width="6" height="6" fill="#047857" />
                  <rect x="36" y="66" width="8" height="8" fill="#047857" />
                  <rect x="48" y="68" width="14" height="14" fill="#047857" />
                  <rect x="66" y="66" width="6" height="6" fill="#047857" />
                  <rect x="76" y="70" width="18" height="18" fill="#047857" />
                  <rect x="36" y="80" width="8" height="8" fill="#047857" />
                  <rect x="48" y="86" width="6" height="6" fill="#047857" />
                  <rect x="58" y="84" width="10" height="10" fill="#047857" />

                  {/* Center PIX icon symbol */}
                  <circle cx="50" cy="50" r="11" fill="white" />
                  <circle cx="50" cy="50" r="9" fill="#059669" />
                  <path d="M46 47L50 51L54 47" stroke="white" strokeWidth="2" strokeLinecap="round" />
                  <path d="M46 53L50 49L54 53" stroke="white" strokeWidth="2" strokeLinecap="round" />
                </svg>

                <div className="mt-1 flex items-center justify-center gap-1.5 text-[11px] font-semibold text-slate-500">
                  <Clock className="w-3.5 h-3.5 text-amber-500" />
                  <span>Expira em: <strong className="text-slate-800">{formatTimer(timeLeft)}</strong></span>
                </div>
              </div>

              {/* PIX Copy & Paste Box */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-700 block text-left">
                  Código PIX Copia e Cola:
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    readOnly
                    value={pixCode}
                    className="w-full text-xs font-mono text-slate-600 bg-slate-100 px-3 py-2 rounded-lg border border-slate-200 select-all"
                  />
                  <button
                    onClick={handleCopyPix}
                    className={`px-3.5 py-2 text-xs font-bold rounded-lg transition-all flex items-center gap-1.5 shrink-0 ${
                      copied
                        ? 'bg-emerald-600 text-white'
                        : 'bg-slate-900 text-white hover:bg-slate-800'
                    }`}
                  >
                    {copied ? (
                      <>
                        <CheckCircle className="w-3.5 h-3.5" />
                        Copiado!
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5" />
                        Copiar
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>

            {/* Simulation Action */}
            <div className="pt-2">
              <button
                id="btn-simulate-pix-paid"
                onClick={handleSimulatePayment}
                disabled={isProcessing}
                className="w-full py-3 px-4 bg-sky-400 hover:bg-sky-500 text-zinc-950 rounded-xl font-bold text-sm shadow-xs transition-all flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {isProcessing ? (
                  <span className="flex items-center gap-2">
                    <span className="w-4 h-4 border-2 border-zinc-950 border-t-transparent rounded-full animate-spin" />
                    Confirmando PIX no Banco Central...
                  </span>
                ) : (
                  <>
                    <CheckCircle className="w-4 h-4" />
                    Simular Pagamento PIX Confirmado
                  </>
                )}
              </button>
              <p className="text-[11px] text-zinc-400 text-center mt-2">
                Ambiente de teste com processamento instantâneo via Banco Central / BACEN
              </p>
            </div>
          </div>
        ) : (
          <div className="p-8 text-center space-y-4">
            <div className="w-16 h-16 rounded-full bg-sky-50 text-sky-600 mx-auto flex items-center justify-center">
              <CheckCircle className="w-8 h-8" />
            </div>

            <div className="space-y-1">
              <h3 className="text-lg font-black text-zinc-950">
                Pagamento Retido em Custódia com Sucesso!
              </h3>
              <p className="text-xs text-zinc-600 max-w-sm mx-auto">
                O valor de <strong>R$ {totalAmount.toFixed(2)}</strong> está protegido no cofre digital ProServiços.
              </p>
            </div>

            <div className="bg-zinc-50 p-4 rounded-xl border border-zinc-200 text-left text-xs space-y-2">
              <div className="flex justify-between">
                <span className="text-zinc-500">ID da Custódia:</span>
                <span className="font-mono font-bold text-zinc-800">ESC-98234-BR</span>
              </div>
              <div className="flex justify-between">
                <span className="text-zinc-500">PIN de Liberação:</span>
                <span className="font-mono text-sm font-black text-sky-950 bg-sky-100 border border-sky-200 px-2 py-0.5 rounded">
                  7412
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-zinc-500">Prestador Acionado:</span>
                <span className="font-semibold text-zinc-800">{quote.providerName}</span>
              </div>
            </div>

            <button
              onClick={onClose}
              className="w-full py-2.5 bg-sky-400 hover:bg-sky-500 text-zinc-950 rounded-xl font-bold text-xs shadow-xs transition"
            >
              Acompanhar Prestador a Caminho
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
