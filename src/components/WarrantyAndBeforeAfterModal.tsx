import React, { useState } from 'react';
import {
  Award,
  ShieldCheck,
  CheckCircle,
  Camera,
  Share2,
  Printer,
  Download,
  Calendar,
  UserCheck,
  FileText,
  X,
  ExternalLink,
  Split,
  Eye,
  Sparkles
} from 'lucide-react';
import { WarrantyCertificate, BeforeAfterRecord } from '../types';

interface WarrantyAndBeforeAfterModalProps {
  isOpen: boolean;
  onClose: () => void;
  serviceTitle: string;
  category: string;
  clientName: string;
  providerName: string;
  providerDoc?: string;
  requestId: string;
}

export const WarrantyAndBeforeAfterModal: React.FC<WarrantyAndBeforeAfterModalProps> = ({
  isOpen,
  onClose,
  serviceTitle,
  category,
  clientName,
  providerName,
  providerDoc = 'MEI 38.912.441/0001-82',
  requestId
}) => {
  const [activeTab, setActiveTab] = useState<'before_after' | 'certificate'>('before_after');
  const [viewMode, setViewMode] = useState<'side_by_side' | 'toggle'>('side_by_side');
  const [activeToggle, setActiveToggle] = useState<'before' | 'after'>('after');

  // Simulated before and after photos tailored to technical work
  const [beforePhoto, setBeforePhoto] = useState<string>(
    'https://images.unsplash.com/photo-1544725176-7c40e5a71c5e?w=600&auto=format&fit=crop&q=80'
  );
  const [afterPhoto, setAfterPhoto] = useState<string>(
    'https://images.unsplash.com/photo-1513694203232-719a280e022f?w=600&auto=format&fit=crop&q=80'
  );

  const todayStr = new Date().toLocaleDateString('pt-BR');
  const validityDate = new Date();
  validityDate.setDate(validityDate.getDate() + 90);
  const validityStr = validityDate.toLocaleDateString('pt-BR');

  const certificateCode = `GAR-SP-2026-${requestId.slice(-4).toUpperCase()}`;

  if (!isOpen) return null;

  const handlePrintCertificate = () => {
    window.print();
  };

  const handleShareWhatsApp = () => {
    const text = encodeURIComponent(
      `🛡️ *Certificado de Garantia ProServiços*\n` +
      `Código: *${certificateCode}*\n` +
      `Serviço: ${serviceTitle}\n` +
      `Prestador: ${providerName} (${providerDoc})\n` +
      `Cliente: ${clientName}\n` +
      `Validade: 90 dias (Até ${validityStr})\n` +
      `Garantia assegurada pelo ProServiços e CDC.`
    );
    window.open(`https://api.whatsapp.com/send?text=${text}`, '_blank');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
      <div
        id="warranty-modal"
        className="relative w-full max-w-2xl bg-white rounded-2xl shadow-2xl border border-slate-100 overflow-hidden flex flex-col max-h-[92vh] animate-in fade-in zoom-in-95 duration-200"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 bg-zinc-950 text-white border-b border-zinc-800">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-zinc-900 text-sky-400 flex items-center justify-center border border-zinc-800">
              <Award className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-base font-bold flex items-center gap-2">
                Laudo Técnico & Garantia Digital
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-sky-100 text-sky-950 border border-sky-200">
                  90 Dias CDC
                </span>
              </h2>
              <p className="text-xs text-zinc-400">
                Registro fotográfico antes/depois e termo formal de conformidade
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

        {/* Tab Switcher */}
        <div className="flex border-b border-zinc-200 bg-zinc-50 px-6">
          <button
            onClick={() => setActiveTab('before_after')}
            className={`py-3 px-4 text-xs font-bold border-b-2 flex items-center gap-2 transition-all ${
              activeTab === 'before_after'
                ? 'border-sky-500 text-sky-900 bg-white'
                : 'border-transparent text-zinc-500 hover:text-zinc-800'
            }`}
          >
            <Split className="w-4 h-4" />
            Registro Fotográfico (Antes & Depois)
          </button>
          <button
            onClick={() => setActiveTab('certificate')}
            className={`py-3 px-4 text-xs font-bold border-b-2 flex items-center gap-2 transition-all ${
              activeTab === 'certificate'
                ? 'border-sky-500 text-sky-900 bg-white'
                : 'border-transparent text-zinc-500 hover:text-zinc-800'
            }`}
          >
            <Award className="w-4 h-4" />
            Certificado de Garantia Oficial
          </button>
        </div>

        {/* Content area */}
        <div className="flex-1 overflow-y-auto p-6">
          {activeTab === 'before_after' ? (
            <div className="space-y-5">
              {/* Instructions and Controls */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-zinc-50 p-3.5 rounded-xl border border-zinc-200">
                <div className="flex items-center gap-2 text-xs text-zinc-800 font-medium">
                  <ShieldCheck className="w-4 h-4 text-sky-600 shrink-0" />
                  <span>
                    Fotos geolocalizadas registradas no início e ao término da intervenção.
                  </span>
                </div>
                <div className="flex items-center gap-1.5 self-end sm:self-center">
                  <button
                    onClick={() => setViewMode('side_by_side')}
                    className={`px-2.5 py-1 text-xs font-semibold rounded-lg transition ${
                      viewMode === 'side_by_side'
                        ? 'bg-sky-400 text-zinc-950 shadow-xs font-bold'
                        : 'bg-white text-zinc-700 border border-zinc-200 hover:bg-zinc-100'
                    }`}
                  >
                    Lado a Lado
                  </button>
                  <button
                    onClick={() => setViewMode('toggle')}
                    className={`px-2.5 py-1 text-xs font-semibold rounded-lg transition ${
                      viewMode === 'toggle'
                        ? 'bg-sky-400 text-zinc-950 shadow-xs font-bold'
                        : 'bg-white text-zinc-700 border border-zinc-200 hover:bg-zinc-100'
                    }`}
                  >
                    Alternador
                  </button>
                </div>
              </div>

              {/* Photos Comparison */}
              {viewMode === 'side_by_side' ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Before */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-bold text-rose-700 bg-rose-50 px-2 py-0.5 rounded-md border border-rose-200">
                        🔴 Antes do Reparo
                      </span>
                      <span className="text-slate-400 text-[11px]">Foto inicial</span>
                    </div>
                    <div className="relative rounded-xl overflow-hidden border border-slate-200 aspect-4/3 bg-slate-100 group">
                      <img
                        src={beforePhoto}
                        alt="Antes do reparo"
                        className="w-full h-full object-cover transition duration-300 group-hover:scale-105"
                      />
                      <div className="absolute bottom-2 left-2 bg-slate-900/80 backdrop-blur-xs text-white text-[10px] px-2 py-1 rounded">
                        Estado inicial verificado
                      </div>
                    </div>
                  </div>

                  {/* After */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200 flex items-center gap-1">
                        🟢 Concluído / Final
                      </span>
                      <span className="text-slate-400 text-[11px]">Finalizado</span>
                    </div>
                    <div className="relative rounded-xl overflow-hidden border border-slate-200 aspect-4/3 bg-slate-100 group">
                      <img
                        src={afterPhoto}
                        alt="Depois do reparo"
                        className="w-full h-full object-cover transition duration-300 group-hover:scale-105"
                      />
                      <div className="absolute bottom-2 left-2 bg-emerald-950/80 backdrop-blur-xs text-white text-[10px] px-2 py-1 rounded flex items-center gap-1">
                        <CheckCircle className="w-3 h-3 text-emerald-400" />
                        Padrão técnico aprovado
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="space-y-3">
                  <div className="flex justify-center gap-2">
                    <button
                      onClick={() => setActiveToggle('before')}
                      className={`px-4 py-1.5 rounded-full text-xs font-bold transition ${
                        activeToggle === 'before'
                          ? 'bg-rose-600 text-white shadow-xs'
                          : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                      }`}
                    >
                      Ver Foto do Antes
                    </button>
                    <button
                      onClick={() => setActiveToggle('after')}
                      className={`px-4 py-1.5 rounded-full text-xs font-bold transition ${
                        activeToggle === 'after'
                          ? 'bg-emerald-600 text-white shadow-xs'
                          : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                      }`}
                    >
                      Ver Foto do Depois (Concluído)
                    </button>
                  </div>
                  <div className="relative rounded-2xl overflow-hidden border border-slate-200 aspect-16/9 bg-slate-100 max-h-[300px]">
                    <img
                      src={activeToggle === 'before' ? beforePhoto : afterPhoto}
                      alt={activeToggle === 'before' ? 'Antes' : 'Depois'}
                      className="w-full h-full object-cover"
                    />
                    <div
                      className={`absolute top-3 left-3 text-xs font-bold px-3 py-1 rounded-full text-white ${
                        activeToggle === 'before' ? 'bg-rose-600' : 'bg-emerald-600'
                      }`}
                    >
                      {activeToggle === 'before' ? 'Antes do Serviço' : 'Serviço Finalizado'}
                    </div>
                  </div>
                </div>
              )}

              {/* Technical notes */}
              <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 text-xs text-slate-700 space-y-1">
                <p className="font-bold text-slate-900">Observações Técnicas do Profissional:</p>
                <p className="text-slate-600 leading-relaxed">
                  Substituição e aperto de fiação conforme norma NBR 5410. Isolamento com fita antichama
                  e teste de carga elétrica realizado com multímetro digital. Sem risco de aquecimento.
                </p>
              </div>

              {/* Call to action to view certificate */}
              <button
                onClick={() => setActiveTab('certificate')}
                className="w-full py-2.5 bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold rounded-xl text-xs flex items-center justify-center gap-2 transition"
              >
                <Award className="w-4 h-4" />
                Acessar Certificado de Garantia de 90 Dias
              </button>
            </div>
          ) : (
            /* Digital Warranty Certificate Layout */
            <div className="space-y-5">
              {/* Printed Certificate Container */}
              <div className="border-4 border-double border-amber-300 bg-gradient-to-b from-amber-50/40 via-white to-amber-50/30 p-6 rounded-2xl relative shadow-xs">
                {/* Watermark/Emblem */}
                <div className="absolute top-4 right-4 text-amber-300/40 pointer-events-none">
                  <ShieldCheck className="w-24 h-24" />
                </div>

                <div className="text-center space-y-1 border-b border-amber-200 pb-4">
                  <span className="text-[10px] font-black uppercase tracking-widest text-amber-700 bg-amber-100 px-3 py-0.5 rounded-full inline-block">
                    Termo de Conformidade & Garantia Legal
                  </span>
                  <h3 className="text-xl font-black text-slate-900 tracking-tight">
                    CERTIFICADO DE GARANTIA
                  </h3>
                  <p className="text-xs text-slate-500 font-mono">
                    Código de Autenticidade: <strong>{certificateCode}</strong>
                  </p>
                </div>

                <div className="py-4 space-y-3 text-xs text-slate-700">
                  <p className="leading-relaxed">
                    Certificamos que o serviço especificado abaixo foi executado pelo profissional credenciado e
                    possui cobertura e suporte integral durante o período legal de vigência:
                  </p>

                  <div className="grid grid-cols-2 gap-2 bg-white/80 p-3 rounded-xl border border-amber-200/60">
                    <div>
                      <span className="text-slate-400 block text-[10px]">Serviço Realizado:</span>
                      <strong className="text-slate-900">{serviceTitle}</strong>
                    </div>
                    <div>
                      <span className="text-slate-400 block text-[10px]">Categoria:</span>
                      <strong className="text-slate-900">{category}</strong>
                    </div>
                    <div>
                      <span className="text-slate-400 block text-[10px]">Prestador Responsável:</span>
                      <strong className="text-slate-900">{providerName}</strong>
                      <span className="text-[10px] text-slate-500 block">{providerDoc}</span>
                    </div>
                    <div>
                      <span className="text-slate-400 block text-[10px]">Cliente Beneficiário:</span>
                      <strong className="text-slate-900">{clientName}</strong>
                    </div>
                  </div>

                  {/* Coverage Dates */}
                  <div className="flex items-center justify-between p-3 bg-amber-100/60 rounded-xl border border-amber-200 text-xs">
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-amber-700" />
                      <span>Emitido em: <strong>{todayStr}</strong></span>
                    </div>
                    <div className="font-bold text-amber-900">
                      Válido até: <span className="underline">{validityStr} (90 dias)</span>
                    </div>
                  </div>

                  {/* Legal Terms Bullet points */}
                  <div className="text-[11px] text-slate-600 space-y-1 bg-slate-50 p-3 rounded-lg border border-slate-200">
                    <p className="font-semibold text-slate-800">Termos e Condições de Cobertura:</p>
                    <ul className="list-disc pl-4 space-y-0.5 text-slate-600">
                      <li>Garantia contra vícios de execução e defeitos de mão de obra (Art. 26 do CDC).</li>
                      <li>Visita técnica gratuita de revisão em até 48 horas em caso de falha no reparo.</li>
                      <li>Materiais fornecidos com garantia do fabricante correspondente.</li>
                      <li>Mediação com suporte prioritário ProServiços via chat.</li>
                    </ul>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-3 border-t border-amber-200 text-[11px] text-slate-500">
                  <div className="flex items-center gap-1.5">
                    <UserCheck className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Identidade biométrica e CNH validadas no app</span>
                  </div>
                  <span className="font-mono text-slate-400">ProServiços Certificado Digital</span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={handleShareWhatsApp}
                  className="py-2.5 px-4 bg-zinc-100 hover:bg-zinc-200 text-zinc-800 border border-zinc-200 font-bold rounded-xl text-xs flex items-center justify-center gap-2 transition shadow-xs"
                >
                  <Share2 className="w-4 h-4 text-emerald-600" />
                  Enviar via WhatsApp
                </button>
                <button
                  onClick={handlePrintCertificate}
                  className="py-2.5 px-4 bg-sky-400 hover:bg-sky-500 text-zinc-950 font-bold rounded-xl text-xs flex items-center justify-center gap-2 transition shadow-xs"
                >
                  <Printer className="w-4 h-4" />
                  Imprimir / Salvar PDF
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
