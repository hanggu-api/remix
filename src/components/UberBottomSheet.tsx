import React, { useState, useRef } from 'react';
import {
  Zap,
  Scissors,
  Wrench,
  Paintbrush,
  Sparkles,
  Mic,
  Square,
  Play,
  Camera,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  Clock,
  Car,
  Phone,
  MessageSquare,
  Star,
  ExternalLink,
  ChevronUp,
  ChevronDown,
  Navigation,
  KeyRound,
  RotateCcw,
  ShoppingBag,
  Store,
  Award,
  Lock,
  Shield,
  Loader2
} from 'lucide-react';
import { UserProfile, ServiceRequest, ProviderQuote, ServiceFeedback } from '../types';

interface UberBottomSheetProps {
  serviceStep: 'idle' | 'radar' | 'quotes' | 'en_route' | 'in_progress' | 'completed';
  selectedCategory: string;
  onSelectCategory: (cat: string) => void;
  onRequestQuotes: (title: string, desc: string, audioUrl?: string, photoUrl?: string) => void;
  activeRequest: ServiceRequest | null;
  onAcceptQuote: (quote: ProviderQuote) => void;
  selectedProvider: UserProfile | null;
  onOpenMicroPage: (provider: UserProfile) => void;
  onOpenChat: () => void;
  onOpenMaterialsModal?: () => void;
  onOpenWarrantyModal?: () => void;
  onOpenFeedbackModal?: () => void;
  serviceFeedback?: ServiceFeedback;
  providerDistanceKm: number;
  providerEtaMinutes: number;
  onSimulateArrival: () => void;
  onFinishService: () => void;
  onResetToNewService: () => void;
}

export const UberBottomSheet: React.FC<UberBottomSheetProps> = ({
  serviceStep,
  selectedCategory,
  onSelectCategory,
  onRequestQuotes,
  activeRequest,
  onAcceptQuote,
  selectedProvider,
  onOpenMicroPage,
  onOpenChat,
  onOpenMaterialsModal,
  onOpenWarrantyModal,
  onOpenFeedbackModal,
  serviceFeedback,
  providerDistanceKm,
  providerEtaMinutes,
  onSimulateArrival,
  onFinishService,
  onResetToNewService
}) => {
  const [quickTitle, setQuickTitle] = useState('Troca de 4 lâmpadas e verificação de tomada');
  const [quickDesc, setQuickDesc] = useState('Lâmpadas do teto da sala queimaram. Preciso de um eletricista que traga escada.');
  const [isRecording, setIsRecording] = useState(false);
  const [isTranscribing, setIsTranscribing] = useState(false);
  const [hasAudio, setHasAudio] = useState(true);
  const [photoPreview, setPhotoPreview] = useState<string | null>(
    'https://images.unsplash.com/photo-1513694203232-719a280e022f?w=600&auto=format&fit=crop&q=80'
  );
  const [isExpanded, setIsExpanded] = useState(true);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);

  const toggleVoiceRecording = async () => {
    if (isRecording) {
      if (mediaRecorderRef.current) {
        mediaRecorderRef.current.stop();
        setIsRecording(false);
      }
      return;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      audioChunksRef.current = [];
      const mr = new MediaRecorder(stream);
      mediaRecorderRef.current = mr;

      mr.ondataavailable = (e) => {
        if (e.data.size > 0) audioChunksRef.current.push(e.data);
      };

      mr.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        stream.getTracks().forEach((track) => track.stop());
        setIsTranscribing(true);

        const reader = new FileReader();
        reader.readAsDataURL(audioBlob);
        reader.onloadend = async () => {
          try {
            const base64Audio = reader.result as string;
            const res = await fetch('/api/transcribe-audio', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ audioBase64: base64Audio, mimeType: 'audio/webm' })
            });
            const data = await res.json();
            if (data.success && data.text) {
              setQuickTitle(data.text.slice(0, 60));
              setQuickDesc(data.text);
              setHasAudio(true);
            }
          } catch (err) {
            console.error('Transcription error:', err);
          } finally {
            setIsTranscribing(false);
          }
        };
      };

      mr.start();
      setIsRecording(true);
    } catch (err) {
      console.warn('Microphone permission not granted:', err);
      setIsRecording(false);
    }
  };

  // Uber categories catalog
  const UBER_SERVICES = [
    {
      id: 'Eletricista',
      name: 'Eletricista Express',
      sub: 'Lâmpadas, tomadas, disjuntores',
      eta: '4 min',
      basePrice: 'a partir de R$ 80',
      icon: Zap,
      activeColor: 'from-amber-500 to-orange-500'
    },
    {
      id: 'Jardineiro',
      name: 'Jardim & Gramado',
      sub: 'Corte de grama e poda',
      eta: '8 min',
      basePrice: 'a partir de R$ 120',
      icon: Scissors,
      activeColor: 'from-emerald-500 to-teal-600'
    },
    {
      id: 'Encanador',
      name: 'Hidráulica Rápida',
      sub: 'Vazamentos, pias e ralos',
      eta: '6 min',
      basePrice: 'a partir de R$ 90',
      icon: Wrench,
      activeColor: 'from-blue-500 to-indigo-600'
    },
    {
      id: 'Pintor',
      name: 'Pintura & Retoques',
      sub: 'Paredes e portas',
      eta: 'Agendado',
      basePrice: 'a partir de R$ 150',
      icon: Paintbrush,
      activeColor: 'from-purple-500 to-pink-600'
    }
  ];

  const handleStartSearch = () => {
    onRequestQuotes(
      quickTitle,
      quickDesc,
      hasAudio ? 'simulated_audio' : undefined,
      photoPreview || undefined
    );
  };

  const quotes = activeRequest?.quotes || [];
  const selectedQuote = quotes.find((q) => q.id === activeRequest?.selectedQuoteId);

  return (
    <div
      className={`fixed bottom-0 left-0 right-0 z-30 transition-all duration-300 ${
        isExpanded ? 'max-h-[85vh]' : 'max-h-20'
      } bg-white rounded-t-3xl shadow-2xl border-t border-slate-200 overflow-hidden flex flex-col`}
    >
      {/* Pull Handle / Header */}
      <div
        onClick={() => setIsExpanded(!isExpanded)}
        className="pt-3 pb-2 px-6 flex items-center justify-between cursor-pointer border-b border-slate-100 bg-slate-50/50 hover:bg-slate-100/50 transition"
      >
        <div className="flex items-center gap-2">
          <div className="w-8 h-1 bg-slate-300 rounded-full mx-auto" />
          <span className="text-xs font-bold text-slate-800">
            {serviceStep === 'idle' && 'Novo Pedido de Serviço (Uber para Serviços)'}
            {serviceStep === 'radar' && 'Radar de Proximidade Ativo'}
            {serviceStep === 'quotes' && `Escolha seu Profissional (${quotes.length} propostas no raio)`}
            {serviceStep === 'en_route' && 'Profissional em Deslocamento'}
            {serviceStep === 'in_progress' && 'Serviço em Andamento no Local'}
            {serviceStep === 'completed' && 'Serviço Concluído'}
          </span>
        </div>
        <button className="text-slate-400 hover:text-slate-600">
          {isExpanded ? <ChevronDown className="w-4 h-4" /> : <ChevronUp className="w-4 h-4" />}
        </button>
      </div>

      {/* Content Container */}
      <div className="p-4 sm:p-6 overflow-y-auto max-h-[75vh] space-y-4">
        {/* STEP 1: IDLE - Select Service like Uber */}
        {serviceStep === 'idle' && (
          <div className="space-y-4">
            {/* Category Ride Cards (UberX Style) */}
            <div>
              <label className="text-xs font-bold text-slate-700 block mb-2">
                Selecione a categoria do chamado:
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                {UBER_SERVICES.map((srv) => {
                  const Icon = srv.icon;
                  const isSelected = selectedCategory === srv.id;
                  return (
                    <div
                      key={srv.id}
                      onClick={() => onSelectCategory(srv.id)}
                      className={`p-3 rounded-2xl border cursor-pointer transition-all flex flex-col justify-between ${
                        isSelected
                          ? 'border-2 border-slate-900 bg-slate-900 text-white shadow-lg shadow-slate-900/10'
                          : 'border-slate-200 bg-slate-50/70 hover:border-slate-300 text-slate-800'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div
                          className={`w-8 h-8 rounded-xl flex items-center justify-center ${
                            isSelected ? 'bg-amber-400 text-slate-950 font-bold' : 'bg-white shadow-xs text-slate-700'
                          }`}
                        >
                          <Icon className="w-4 h-4" />
                        </div>
                        <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                          isSelected ? 'bg-slate-800 text-amber-300' : 'bg-slate-200 text-slate-700'
                        }`}>
                          {srv.eta}
                        </span>
                      </div>
                      <div className="mt-2">
                        <div className="text-xs font-bold leading-tight">{srv.name}</div>
                        <div className={`text-[10px] truncate mt-0.5 ${isSelected ? 'text-slate-300' : 'text-slate-500'}`}>
                          {srv.basePrice}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Quick Request Problem Input */}
            <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200 space-y-3">
              <div>
                <label className="text-xs font-bold text-slate-800 block mb-1">
                  O que precisa ser feito?
                </label>
                <input
                  type="text"
                  value={quickTitle}
                  onChange={(e) => setQuickTitle(e.target.value)}
                  placeholder="Ex: Trocar 4 lâmpadas e tomada da sala"
                  className="w-full px-3.5 py-2.5 bg-white rounded-xl border border-slate-200 text-xs font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
              </div>

              {/* Audio and Photo One-Touch Controls */}
              <div className="flex items-center justify-between gap-3 pt-1">
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={toggleVoiceRecording}
                    className={`py-2 px-3 rounded-xl text-xs font-bold flex items-center gap-1.5 transition ${
                      isRecording
                        ? 'bg-red-600 text-white animate-pulse'
                        : isTranscribing
                        ? 'bg-amber-500 text-slate-950 font-extrabold'
                        : hasAudio
                        ? 'bg-amber-100 text-amber-900 border border-amber-300'
                        : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-100'
                    }`}
                  >
                    {isTranscribing ? (
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    ) : (
                      <Mic className="w-3.5 h-3.5" />
                    )}
                    <span>
                      {isRecording
                        ? 'Gravando... Toque p/ parar'
                        : isTranscribing
                        ? 'Transcrevendo (Gemini)...'
                        : hasAudio
                        ? 'Áudio de voz transcrito ✓'
                        : 'Gravar Áudio'}
                    </span>
                  </button>

                  <label className="py-2 px-3 rounded-xl bg-white border border-slate-200 hover:bg-slate-100 text-slate-700 text-xs font-bold flex items-center gap-1.5 cursor-pointer transition">
                    <Camera className="w-3.5 h-3.5 text-blue-600" />
                    <span>{photoPreview ? 'Foto do local anexada ✓' : 'Tirar Foto'}</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => {
                        const f = e.target.files?.[0];
                        if (f) {
                          const r = new FileReader();
                          r.onload = () => setPhotoPreview(r.result as string);
                          r.readAsDataURL(f);
                        }
                      }}
                      className="hidden"
                    />
                  </label>
                </div>

                <div className="text-[11px] text-slate-500 font-medium hidden sm:block">
                  📍 Raio de busca: <strong>5 km</strong>
                </div>
              </div>
            </div>

            {/* Uber Big CTA Action */}
            <button
              onClick={handleStartSearch}
              className="w-full py-4 rounded-2xl bg-slate-950 hover:bg-slate-900 text-white font-extrabold text-sm shadow-xl flex items-center justify-center gap-2 transition active:scale-98"
            >
              <Zap className="w-4 h-4 text-amber-400" />
              <span>Chamar Orçamentos Próximos Agora</span>
              <ArrowRight className="w-4 h-4 text-slate-400" />
            </button>
          </div>
        )}

        {/* STEP 2: RADAR SEARCHING - Pulsing search like Uber */}
        {serviceStep === 'radar' && (
          <div className="py-6 text-center space-y-4">
            <div className="relative w-20 h-20 mx-auto flex items-center justify-center">
              <div className="absolute inset-0 rounded-full border-4 border-sky-400/30 animate-ping" />
              <div className="w-16 h-16 rounded-full bg-slate-900 text-amber-400 flex items-center justify-center shadow-xl">
                <Zap className="w-8 h-8 animate-bounce" />
              </div>
            </div>

            <div>
              <h3 className="text-base font-extrabold text-slate-900">
                Disparando pedido para os prestadores no mapa...
              </h3>
              <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1">
                A IA analisou seu áudio/foto e encontrou <strong>3 eletricistas credenciados</strong> a menos de 10 minutos da sua localização.
              </p>
            </div>

            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <span>Profissionais checados com biometria facial e CNH/RG</span>
            </div>
          </div>
        )}

        {/* STEP 3: QUOTES COMPARISON - Uber Rides Card Deck */}
        {serviceStep === 'quotes' && (
          <div className="space-y-3">
            <div className="flex items-center justify-between pb-1">
              <div>
                <h3 className="text-sm font-extrabold text-slate-900">
                  Propostas Recebidas ({quotes.length} opções disponíveis)
                </h3>
                <p className="text-xs text-slate-500">
                  Escolha pelo menor preço, menor distância ou melhor avaliação
                </p>
              </div>
              <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-amber-100 text-amber-900">
                ⚡ Resposta Imediata
              </span>
            </div>

            {/* AI Materials Recommendation Banner */}
            {onOpenMaterialsModal && (
              <div className="p-3.5 rounded-2xl bg-gradient-to-r from-amber-50 to-amber-100/50 border border-amber-300/80 flex items-center justify-between gap-3 shadow-xs">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-amber-400 text-slate-950 flex items-center justify-center font-bold shadow-xs shrink-0">
                    <ShoppingBag className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="text-xs font-black text-slate-950 flex items-center gap-2">
                      <span>Lista de Materiais IA Gerada</span>
                      <span className="text-[10px] bg-emerald-600 text-white font-extrabold px-1.5 py-0.5 rounded-full">
                        10% OFF Parceiro
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-600 mt-0.5">
                      O prestador pode retirar os materiais no balcão da <strong>Elétrica Pinheiros</strong> a caminho!
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={onOpenMaterialsModal}
                  className="py-1.5 px-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-amber-400 font-extrabold text-xs whitespace-nowrap transition shadow-sm shrink-0"
                >
                  Ver Materiais
                </button>
              </div>
            )}

            {/* Escrow Custody Protection Assurance Banner */}
            <div className="p-3 rounded-2xl bg-emerald-50/80 border border-emerald-200 flex items-center justify-between gap-3 text-xs text-emerald-950 shadow-xs">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-emerald-600 text-white flex items-center justify-center shrink-0">
                  <Lock className="w-4 h-4" />
                </div>
                <div>
                  <span className="font-black text-emerald-900 block">Pagamento Seguro com Custódia ProServiços</span>
                  <p className="text-[11px] text-emerald-700">
                    Seu PIX fica retido com segurança e só é liberado para o prestador após conferir o resultado.
                  </p>
                </div>
              </div>
              <span className="text-[10px] font-black uppercase tracking-wider text-emerald-800 bg-white px-2 py-1 rounded-lg border border-emerald-300 shrink-0">
                Garantia 90D
              </span>
            </div>

            {/* Uber Options Vertical Cards */}
            <div className="space-y-2.5">
              {quotes.map((quote, idx) => {
                const isSelected = activeRequest?.selectedQuoteId === quote.id;
                const isBestPrice = quote.price === Math.min(...quotes.map((q) => q.price));

                // Provider tier calculation
                const tierName =
                  quote.providerRating >= 4.9 ? 'Pro Diamante ★' : quote.providerRating >= 4.7 ? 'Pro Ouro' : 'Pro Prata';
                const tierColor =
                  quote.providerRating >= 4.9
                    ? 'bg-gradient-to-r from-sky-100 to-indigo-100 text-indigo-900 border-indigo-300'
                    : quote.providerRating >= 4.7
                    ? 'bg-amber-100 text-amber-900 border-amber-300'
                    : 'bg-slate-100 text-slate-800 border-slate-300';

                return (
                  <div
                    key={quote.id}
                    className={`p-4 rounded-2xl border transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                      isSelected
                        ? 'border-2 border-emerald-500 bg-emerald-50/40 shadow-md ring-2 ring-emerald-500/10'
                        : 'border-slate-200 bg-white hover:border-slate-400 shadow-xs'
                    }`}
                  >
                    {/* Left: Provider info + Uber ride look */}
                    <div className="flex items-center gap-3.5">
                      <div className="relative">
                        <img
                          src={quote.providerAvatar}
                          alt={quote.providerName}
                          className="w-14 h-14 rounded-2xl object-cover border border-slate-200"
                        />
                        {quote.providerFacialVerified && (
                          <span className="absolute -bottom-1 -right-1 bg-emerald-500 text-white rounded-full p-0.5 shadow">
                            <CheckCircle2 className="w-3.5 h-3.5" />
                          </span>
                        )}
                      </div>

                      <div>
                        <div className="flex flex-wrap items-center gap-1.5">
                          <h4 className="text-sm font-extrabold text-slate-900">
                            {quote.providerName}
                          </h4>
                          <span className={`text-[10px] font-black px-2 py-0.5 rounded-full border shadow-2xs ${tierColor}`}>
                            {tierName}
                          </span>
                          {isBestPrice && (
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-amber-400 text-slate-950 shadow-xs">
                              Menor Preço
                            </span>
                          )}
                        </div>

                        <div className="flex items-center gap-2 text-xs text-slate-500 mt-0.5">
                          <span className="flex items-center text-amber-500 font-bold">
                            <Star className="w-3.5 h-3.5 fill-current mr-0.5" />
                            {quote.providerRating}
                          </span>
                          <span>•</span>
                          <span>{quote.providerJobsCount} chamados</span>
                          <span>•</span>
                          <span className="font-semibold text-slate-700">Chegada: {quote.scheduledTime}</span>
                        </div>

                        <p className="text-[11px] text-slate-600 line-clamp-1 italic mt-1">
                          "{quote.message}"
                        </p>
                      </div>
                    </div>

                    {/* Right: Price & Confirm Button */}
                    <div className="flex items-center justify-between sm:justify-end gap-3 pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-100">
                      <div className="text-left sm:text-right">
                        <span className="text-[10px] text-slate-400 block font-medium">Mão de obra:</span>
                        <span className="text-lg font-black text-slate-900">
                          R$ {quote.price.toFixed(2)}
                        </span>
                      </div>

                      <div className="flex items-center gap-1.5">
                        <button
                          onClick={() => {
                            const prov = {
                              id: quote.providerId,
                              name: quote.providerName,
                              phone: quote.providerPhone,
                              email: '',
                              role: 'provider' as const,
                              avatar: quote.providerAvatar,
                              facialVerified: quote.providerFacialVerified,
                              documentVerified: quote.providerDocVerified,
                              rating: quote.providerRating,
                              completedJobsCount: quote.providerJobsCount,
                              slug: quote.providerName.toLowerCase().replace(/[^a-z0-9]+/g, '-')
                            };
                            onOpenMicroPage(prov);
                          }}
                          className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition"
                          title="Ver Micropágina Aberta"
                        >
                          <ExternalLink className="w-4 h-4" />
                        </button>

                        <button
                          onClick={() => onAcceptQuote(quote)}
                          className="py-2.5 px-4 rounded-xl bg-slate-950 hover:bg-slate-900 text-white font-extrabold text-xs shadow-md transition flex items-center gap-1.5"
                        >
                          <Zap className="w-3.5 h-3.5 text-amber-400" />
                          <span>Chamar {quote.providerName.split(' ')[0]}</span>
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* STEP 4 & 5: EN ROUTE / IN PROGRESS - Uber Active Trip HUD */}
        {(serviceStep === 'en_route' || serviceStep === 'in_progress' || serviceStep === 'completed') && (
          <div className="space-y-4">
            {/* Driver Live Header */}
            <div className="flex items-center justify-between p-4 rounded-2xl bg-slate-950 text-white">
              <div className="flex items-center gap-3">
                <div className="relative">
                  <img
                    src={selectedProvider?.avatar || 'https://images.unsplash.com/photo-1540569014015-19a7be504e3a?w=150&auto=format&fit=crop&q=80'}
                    alt="Driver"
                    className="w-12 h-12 rounded-xl object-cover border-2 border-white/20"
                  />
                  <span className="absolute -bottom-1 -right-1 bg-emerald-500 text-white rounded-full p-0.5">
                    <CheckCircle2 className="w-3 h-3" />
                  </span>
                </div>

                <div>
                  <div className="flex items-center gap-2">
                    <h4 className="text-sm font-extrabold">{selectedProvider?.name || 'Carlos Mendes'}</h4>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-amber-400 text-slate-950">
                      {selectedProvider?.category || 'Eletricista'}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-slate-300 mt-0.5">
                    <span>⭐ {selectedProvider?.rating || 4.9}</span>
                    <span>•</span>
                    <span>Valor Fechado: <strong>R$ {selectedQuote?.price.toFixed(2) || '110.00'}</strong></span>
                  </div>
                </div>
              </div>

              {/* Uber PIN Code for Security */}
              <div className="text-right bg-slate-900 border border-slate-800 px-3 py-1.5 rounded-xl">
                <span className="text-[10px] text-slate-400 uppercase font-mono block">PIN de Segurança</span>
                <span className="text-base font-mono font-black text-amber-400 tracking-widest">7412</span>
              </div>
            </div>

            {/* ETA & Distance Metric Bar */}
            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                <span className="text-[10px] text-slate-500 block">Tempo Estimado de Chegada:</span>
                <strong className="text-base font-black text-slate-900">
                  {serviceStep === 'completed' ? 'Finalizado' : providerEtaMinutes > 0 ? `${providerEtaMinutes} min` : 'No Local!'}
                </strong>
              </div>
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                <span className="text-[10px] text-slate-500 block">Distância do Prestador:</span>
                <strong className="text-base font-black text-slate-900">
                  {serviceStep === 'completed' ? '0 km' : providerDistanceKm > 0 ? `${providerDistanceKm} km` : 'Chegou'}
                </strong>
              </div>
            </div>

            {/* Custody Escrow Status & Warranty Digital Certificate Action */}
            <div className="p-3.5 rounded-2xl bg-amber-50/80 border border-amber-200/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-amber-400 text-slate-950 flex items-center justify-center shrink-0 shadow-xs">
                  <Award className="w-4 h-4" />
                </div>
                <div>
                  <span className="font-bold text-amber-950 block">Garantia ProServiços 90 Dias & Laudo Técnico</span>
                  <p className="text-[11px] text-amber-800">
                    Fotos antes/depois registradas e termo de garantia digital oficial.
                  </p>
                </div>
              </div>
              {onOpenWarrantyModal && (
                <button
                  type="button"
                  onClick={onOpenWarrantyModal}
                  className="py-1.5 px-3 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs flex items-center gap-1.5 self-start sm:self-auto transition shadow-xs shrink-0"
                >
                  <Award className="w-3.5 h-3.5" />
                  <span>Ver Laudo & Garantia</span>
                </button>
              )}
            </div>

            {/* Post-Service Feedback Section */}
            {serviceStep === 'completed' && (
              <div
                id="post-service-feedback-banner"
                className="p-4 rounded-2xl bg-gradient-to-r from-amber-500/10 via-orange-500/10 to-amber-500/10 border border-amber-300/80 shadow-xs space-y-2.5"
              >
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-xl bg-amber-400 text-slate-950 flex items-center justify-center font-bold shrink-0 shadow-xs">
                      <Star className="w-4 h-4 fill-slate-950" />
                    </div>
                    <div>
                      <span className="text-xs font-extrabold text-slate-900 block">
                        {serviceFeedback
                          ? 'Sua Avaliação do Atendimento'
                          : `Avaliar Atendimento de ${selectedProvider?.name || 'Profissional'}`}
                      </span>
                      <p className="text-[11px] text-slate-600">
                        {serviceFeedback
                          ? 'Avaliação registrada com sucesso no perfil público do prestador.'
                          : 'Dê sua nota de 1 a 5 estrelas e adicione um depoimento sobre o serviço.'}
                      </p>
                    </div>
                  </div>

                  {onOpenFeedbackModal && (
                    <button
                      type="button"
                      id="open-feedback-sheet-btn"
                      onClick={onOpenFeedbackModal}
                      className="py-1.5 px-3.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-extrabold text-xs flex items-center gap-1.5 transition shadow-xs shrink-0"
                    >
                      <Star className="w-3.5 h-3.5 fill-slate-950" />
                      <span>{serviceFeedback ? 'Ver / Editar' : 'Avaliar Agora'}</span>
                    </button>
                  )}
                </div>

                {serviceFeedback && (
                  <div className="pt-2 border-t border-amber-200/80 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
                    <div className="flex items-center gap-2">
                      <div className="flex text-amber-500">
                        {[1, 2, 3, 4, 5].map((s) => (
                          <Star
                            key={s}
                            className={`w-3.5 h-3.5 ${
                              s <= serviceFeedback.rating
                                ? 'fill-amber-400 text-amber-400'
                                : 'text-slate-200'
                            }`}
                          />
                        ))}
                      </div>
                      <span className="font-extrabold text-slate-900">{serviceFeedback.rating}.0</span>
                      <span className="text-slate-600 italic truncate max-w-[200px] sm:max-w-sm">
                        "{serviceFeedback.comment}"
                      </span>
                    </div>
                    {serviceFeedback.tags && serviceFeedback.tags.length > 0 && (
                      <div className="flex gap-1 flex-wrap">
                        {serviceFeedback.tags.slice(0, 2).map((t, idx) => (
                          <span
                            key={idx}
                            className="px-2 py-0.5 rounded-md bg-white border border-amber-200 text-amber-900 text-[10px] font-semibold"
                          >
                            {t}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* Action Buttons: Chat, Call & Simulation */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-1">
              <button
                onClick={onOpenChat}
                className="py-3 px-4 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs flex items-center justify-center gap-2 transition"
              >
                <MessageSquare className="w-4 h-4 text-amber-600" />
                <span>Abrir Chat com Prestador</span>
              </button>

              <a
                href="https://wa.me/5511991238844"
                target="_blank"
                rel="noopener noreferrer"
                className="py-3 px-4 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-800 font-bold text-xs flex items-center justify-center gap-2 transition"
              >
                <Phone className="w-4 h-4 text-emerald-600" />
                <span>Ligar / WhatsApp</span>
              </a>

              {serviceStep === 'en_route' && (
                <button
                  onClick={onSimulateArrival}
                  className="py-3 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs flex items-center justify-center gap-2 transition shadow-md shadow-blue-600/20"
                >
                  <Car className="w-4 h-4" />
                  <span>Simular Carro Andando (GPS)</span>
                </button>
              )}

              {serviceStep === 'in_progress' && (
                <button
                  onClick={onFinishService}
                  className="py-3 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center justify-center gap-2 transition shadow-md shadow-emerald-600/20"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Concluir Serviço</span>
                </button>
              )}

              {serviceStep === 'completed' && onOpenFeedbackModal && (
                <button
                  type="button"
                  id="action-eval-provider-btn"
                  onClick={onOpenFeedbackModal}
                  className="py-3 px-4 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs flex items-center justify-center gap-2 transition shadow-md shadow-amber-500/20"
                >
                  <Star className="w-4 h-4 fill-slate-950" />
                  <span>{serviceFeedback ? 'Ver Avaliação' : 'Avaliar Prestador'}</span>
                </button>
              )}

              {serviceStep === 'completed' && (
                <button
                  onClick={onResetToNewService}
                  className="py-3 px-4 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs flex items-center justify-center gap-2 transition shadow-md"
                >
                  <RotateCcw className="w-4 h-4" />
                  <span>Fazer Novo Chamado</span>
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
