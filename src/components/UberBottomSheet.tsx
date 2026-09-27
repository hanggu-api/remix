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
          <div className="space-y-5">
            {/* Category Ride Cards (UberX Style) */}
            <div>
              <label className="text-xs font-bold text-slate-700 block mb-2.5">
                Selecione a categoria do chamado:
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
                {UBER_SERVICES.map((srv) => {
                  const Icon = srv.icon;
                  const isSelected = selectedCategory === srv.id;
                  return (
                    <div
                      key={srv.id}
                      onClick={() => onSelectCategory(srv.id)}
                      className={`p-4 sm:p-5 rounded-2xl sm:rounded-3xl border cursor-pointer transition-all flex flex-col justify-between min-h-[145px] sm:min-h-[160px] ${
                        isSelected
                          ? 'border-2 border-zinc-950 bg-zinc-950 text-white shadow-md'
                          : 'border-zinc-200 bg-white hover:border-zinc-300 hover:shadow-xs text-zinc-800'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div
                          className={`w-11 h-11 rounded-xl flex items-center justify-center ${
                            isSelected ? 'bg-sky-400 text-zinc-950 font-bold' : 'bg-zinc-100 text-zinc-800 border border-zinc-200/80'
                          }`}
                        >
                          <Icon className="w-5 h-5" />
                        </div>
                        <span className={`text-[11px] font-bold px-2 py-0.5 rounded-md ${
                          isSelected ? 'bg-zinc-800 text-sky-300' : 'bg-zinc-100 text-zinc-700 border border-zinc-200'
                        }`}>
                          {srv.eta}
                        </span>
                      </div>
                      <div className="mt-3">
                        <div className="text-sm font-bold leading-tight">{srv.name}</div>
                        <div className={`text-xs mt-1 leading-snug ${isSelected ? 'text-zinc-300' : 'text-zinc-500'}`}>
                          {srv.sub}
                        </div>
                        <div className={`text-xs font-semibold mt-2 pt-2 border-t ${isSelected ? 'border-zinc-800 text-sky-300' : 'border-zinc-100 text-zinc-700'}`}>
                          {srv.basePrice}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Quick Request Problem Input */}
            <div className="bg-white rounded-2xl sm:rounded-3xl p-5 sm:p-6 border border-zinc-200 shadow-xs space-y-4">
              <div>
                <label className="text-xs font-bold text-zinc-800 block mb-1.5">
                  O que precisa ser feito?
                </label>
                <input
                  type="text"
                  value={quickTitle}
                  onChange={(e) => setQuickTitle(e.target.value)}
                  placeholder="Ex: Trocar 4 lâmpadas e tomada da sala"
                  className="w-full px-4 py-3 bg-zinc-50 focus:bg-white rounded-xl border border-zinc-200 text-sm font-semibold text-zinc-900 focus:outline-none focus:ring-2 focus:ring-sky-400 focus:border-sky-400 transition"
                />
              </div>

              {/* Audio and Photo One-Touch Controls */}
              <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
                <div className="flex flex-wrap items-center gap-2.5">
                  <button
                    type="button"
                    onClick={toggleVoiceRecording}
                    className={`py-2.5 px-3.5 rounded-xl text-xs font-bold flex items-center gap-2 transition ${
                      isRecording
                        ? 'bg-rose-600 text-white animate-pulse'
                        : isTranscribing
                        ? 'bg-sky-100 text-sky-950 font-bold border border-sky-300'
                        : hasAudio
                        ? 'bg-sky-50 text-sky-900 border border-sky-200'
                        : 'bg-white border border-zinc-200 text-zinc-700 hover:bg-zinc-100'
                    }`}
                  >
                    {isTranscribing ? (
                      <Loader2 className="w-4 h-4 animate-spin text-sky-600" />
                    ) : (
                      <Mic className="w-4 h-4" />
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

                  <label className="py-2.5 px-3.5 rounded-xl bg-white border border-zinc-200 hover:bg-zinc-100 text-zinc-700 text-xs font-bold flex items-center gap-2 cursor-pointer transition">
                    <Camera className="w-4 h-4 text-zinc-600" />
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

                <div className="text-xs text-zinc-500 font-medium">
                  📍 Raio de busca: <strong className="text-zinc-800">5 km</strong>
                </div>
              </div>
            </div>

            {/* Uber Big CTA Action - Light Blue Button */}
            <button
              onClick={handleStartSearch}
              className="w-full py-4 rounded-xl sm:rounded-2xl bg-sky-400 hover:bg-sky-500 text-zinc-950 font-bold text-sm sm:text-base shadow-xs flex items-center justify-center gap-2 transition active:scale-98"
            >
              <Zap className="w-4 h-4 fill-zinc-950" />
              <span>Chamar Orçamentos Próximos Agora</span>
              <ArrowRight className="w-4 h-4 text-zinc-900" />
            </button>
          </div>
        )}

        {/* STEP 2: RADAR SEARCHING - Pulsing search like Uber */}
        {serviceStep === 'radar' && (
          <div className="py-8 text-center space-y-5">
            <div className="relative w-24 h-24 mx-auto flex items-center justify-center">
              <div className="absolute inset-0 rounded-full border-4 border-sky-400/30 animate-ping" />
              <div className="w-20 h-20 rounded-full bg-zinc-950 text-sky-400 flex items-center justify-center shadow-lg border border-zinc-800">
                <Zap className="w-10 h-10 animate-bounce" />
              </div>
            </div>

            <div>
              <h3 className="text-lg font-black text-zinc-950">
                Disparando pedido para os prestadores no mapa...
              </h3>
              <p className="text-xs sm:text-sm text-zinc-500 max-w-md mx-auto mt-1.5 leading-relaxed">
                A IA analisou seu pedido e encontrou <strong>profissionais credenciados</strong> no seu raio de atendimento.
              </p>
            </div>

            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-zinc-100 border border-zinc-200 text-zinc-700 text-xs font-bold">
              <ShieldCheck className="w-4 h-4 text-sky-600" />
              <span>Profissionais checados com biometria facial e CNH/RG</span>
            </div>
          </div>
        )}

        {/* STEP 3: QUOTES COMPARISON - Uber Rides Card Deck */}
        {serviceStep === 'quotes' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between pb-1">
              <div>
                <h3 className="text-base sm:text-lg font-black text-zinc-950">
                  Propostas Recebidas ({quotes.length} {quotes.length === 1 ? 'opção disponível' : 'opções disponíveis'})
                </h3>
                <p className="text-xs sm:text-sm text-zinc-500">
                  Escolha pelo menor preço, menor distância ou melhor avaliação
                </p>
              </div>
              <span className="px-3 py-1 rounded-full text-xs font-bold bg-sky-50 text-sky-900 border border-sky-200 shrink-0">
                ⚡ Resposta Imediata
              </span>
            </div>

            {/* AI Materials Recommendation Card */}
            {onOpenMaterialsModal && (
              <div className="p-5 sm:p-6 rounded-2xl sm:rounded-3xl bg-white border border-zinc-200 flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-xs">
                <div className="flex items-start sm:items-center gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-zinc-950 text-sky-400 border border-zinc-800 flex items-center justify-center font-bold shadow-xs shrink-0">
                    <ShoppingBag className="w-6 h-6" />
                  </div>
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-sm sm:text-base font-extrabold text-zinc-950">
                        Lista de Materiais IA Gerada
                      </span>
                      <span className="text-xs bg-sky-100 text-sky-950 font-bold px-2.5 py-0.5 rounded-full border border-sky-300">
                        10% OFF Parceiro Credenciado
                      </span>
                    </div>
                    <p className="text-xs sm:text-sm text-zinc-600 mt-1 leading-relaxed">
                      O prestador pode retirar os materiais no balcão da <strong>Elétrica Pinheiros</strong> a caminho ou receber direto no local!
                    </p>
                    <div className="flex items-center gap-2 text-[11px] text-zinc-500 mt-1">
                      <span>✓ Orçamento otimizado</span>
                      <span>•</span>
                      <span>✓ Sem desperdício de insumos</span>
                    </div>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={onOpenMaterialsModal}
                  className="py-2.5 sm:py-3 px-5 rounded-xl bg-sky-100 hover:bg-sky-200 text-sky-950 font-bold text-xs sm:text-sm whitespace-nowrap transition border border-sky-300 shadow-2xs shrink-0 flex items-center justify-center gap-2"
                >
                  <ShoppingBag className="w-4 h-4 text-sky-700" />
                  <span>Ver Materiais</span>
                </button>
              </div>
            )}

            {/* Escrow Custody Protection Assurance Card */}
            <div className="p-4 sm:p-5 rounded-2xl sm:rounded-3xl bg-white border border-zinc-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3.5 shadow-xs">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-zinc-950 text-sky-400 flex items-center justify-center shrink-0 border border-zinc-800 shadow-xs">
                  <Lock className="w-5 h-5" />
                </div>
                <div>
                  <span className="font-extrabold text-sm sm:text-base text-zinc-950 block">
                    Pagamento Seguro com Custódia ProServiços
                  </span>
                  <p className="text-xs sm:text-sm text-zinc-600 mt-0.5 leading-relaxed">
                    Seu PIX ou cartão fica retido com segurança em conta garantia e só é liberado para o prestador após a sua conferência e aprovação.
                  </p>
                </div>
              </div>
              <span className="text-xs font-bold uppercase tracking-wider text-zinc-800 bg-zinc-100 px-3 py-1.5 rounded-xl border border-zinc-200 shrink-0 self-start sm:self-auto flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-sky-600" />
                Garantia 90 Dias
              </span>
            </div>

            {/* Uber Options Vertical Cards - Expanded Height and Content */}
            <div className="space-y-4">
              {quotes.map((quote, idx) => {
                const isSelected = activeRequest?.selectedQuoteId === quote.id;
                const isBestPrice = quote.price === Math.min(...quotes.map((q) => q.price));

                // Provider tier calculation
                const tierName =
                  quote.providerRating >= 4.9 ? 'Pro Diamante ★' : quote.providerRating >= 4.7 ? 'Pro Ouro' : 'Pro Prata';
                const tierColor =
                  quote.providerRating >= 4.9
                    ? 'bg-sky-100 text-sky-950 border-sky-300'
                    : quote.providerRating >= 4.7
                    ? 'bg-sky-50 text-sky-900 border-sky-200'
                    : 'bg-zinc-100 text-zinc-800 border-zinc-300';

                return (
                  <div
                    key={quote.id}
                    className={`p-5 sm:p-6 rounded-2xl sm:rounded-3xl border transition-all flex flex-col justify-between gap-4.5 ${
                      isSelected
                        ? 'border-2 border-sky-400 bg-sky-50/20 shadow-md ring-2 ring-sky-400/10'
                        : 'border-zinc-200 bg-white hover:border-zinc-300 hover:shadow-xs'
                    }`}
                  >
                    {/* Top Row: Provider identity, Rating, Badges and Price */}
                    <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                      <div className="flex items-start gap-4">
                        <div className="relative shrink-0">
                          <img
                            src={quote.providerAvatar}
                            alt={quote.providerName}
                            className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl object-cover border-2 border-zinc-100 shadow-xs"
                          />
                          {quote.providerFacialVerified && (
                            <span className="absolute -bottom-1 -right-1 bg-sky-500 text-white rounded-full p-1 shadow-xs" title="Biometria Facial Confirmada">
                              <CheckCircle2 className="w-3.5 h-3.5" />
                            </span>
                          )}
                        </div>

                        <div>
                          <div className="flex flex-wrap items-center gap-2">
                            <h4 className="text-base sm:text-lg font-black text-zinc-950">
                              {quote.providerName}
                            </h4>
                            <span className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full border shadow-2xs ${tierColor}`}>
                              {tierName}
                            </span>
                            {isBestPrice && (
                              <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-sky-100 text-sky-950 border border-sky-200 shadow-2xs">
                                Menor Preço
                              </span>
                            )}
                          </div>

                          <div className="flex flex-wrap items-center gap-2 sm:gap-3 text-xs sm:text-sm text-zinc-500 mt-1.5">
                            <span className="flex items-center text-amber-500 font-bold bg-amber-50/60 px-2 py-0.5 rounded-md border border-amber-200/60">
                              <Star className="w-4 h-4 fill-current mr-1" />
                              {quote.providerRating}
                            </span>
                            <span>•</span>
                            <span className="font-medium text-zinc-700">{quote.providerJobsCount} atendimentos realizados</span>
                            <span>•</span>
                            <span className="font-semibold text-zinc-900 bg-zinc-100 px-2 py-0.5 rounded-md">
                              Chegada: ~{quote.scheduledTime}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Top Right Price */}
                      <div className="sm:text-right shrink-0">
                        <span className="text-xs text-zinc-400 block font-medium">Mão de obra com custódia:</span>
                        <span className="text-2xl sm:text-3xl font-black text-zinc-950 tracking-tight">
                          R$ {quote.price.toFixed(2)}
                        </span>
                        <span className="text-[11px] text-zinc-500 block mt-0.5">Sem cobranças surpresa</span>
                      </div>
                    </div>

                    {/* Middle: Rich Content Box with Message & Guarantee */}
                    <div className="bg-zinc-50 border border-zinc-100 rounded-xl sm:rounded-2xl p-4 space-y-2">
                      <div className="flex items-start gap-2.5 text-xs sm:text-sm text-zinc-700">
                        <div className="text-sky-600 font-serif text-lg leading-none shrink-0 select-none">“</div>
                        <p className="leading-relaxed italic text-zinc-800">
                          {quote.message}
                        </p>
                      </div>
                      <div className="pt-2 border-t border-zinc-200/60 flex flex-wrap items-center justify-between gap-2 text-xs text-zinc-500">
                        <div className="flex items-center gap-1.5 text-zinc-700 font-medium">
                          <ShieldCheck className="w-4 h-4 text-sky-600" />
                          <span>Garantia de 90 dias com emissão de Laudo Técnico ProServiços</span>
                        </div>
                        <span className="text-zinc-500">Duração estimada: {quote.estimatedDuration || '45 min'}</span>
                      </div>
                    </div>

                    {/* Bottom Actions Row */}
                    <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pt-2 border-t border-zinc-100">
                      <div className="flex items-center gap-2 text-xs text-zinc-500">
                        <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                        <span>Pronto para iniciar o deslocamento agora</span>
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          type="button"
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
                          className="py-2.5 sm:py-3 px-4 rounded-xl bg-zinc-100 hover:bg-zinc-200 text-zinc-800 text-xs sm:text-sm font-bold transition border border-zinc-200 flex items-center justify-center gap-2"
                          title="Ver Micropágina Aberta"
                        >
                          <ExternalLink className="w-4 h-4" />
                          <span>Ver Perfil & Avaliações</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => onAcceptQuote(quote)}
                          className="py-3 sm:py-3.5 px-6 rounded-xl bg-sky-400 hover:bg-sky-500 text-zinc-950 font-bold text-xs sm:text-sm shadow-xs transition flex items-center justify-center gap-2"
                        >
                          <Zap className="w-4 h-4 fill-zinc-950" />
                          <span>Contratar {quote.providerName.split(' ')[0]} Agora</span>
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
            <div className="flex items-center justify-between p-5 sm:p-6 rounded-2xl sm:rounded-3xl bg-slate-950 text-white shadow-sm">
              <div className="flex items-center gap-4">
                <div className="relative">
                  <img
                    src={selectedProvider?.avatar || 'https://images.unsplash.com/photo-1540569014015-19a7be504e3a?w=150&auto=format&fit=crop&q=80'}
                    alt="Driver"
                    className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl object-cover border-2 border-white/20 shadow-xs"
                  />
                  <span className="absolute -bottom-1 -right-1 bg-emerald-500 text-white rounded-full p-1 shadow-xs">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                  </span>
                </div>

                <div>
                  <div className="flex items-center gap-2">
                    <h4 className="text-base sm:text-lg font-black text-white">{selectedProvider?.name || 'Carlos Mendes'}</h4>
                    <span className="text-[11px] font-bold px-2 py-0.5 rounded-md bg-sky-100 text-sky-950 border border-sky-200">
                      {selectedProvider?.category || 'Eletricista'}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-xs sm:text-sm text-zinc-300 mt-1">
                    <span className="text-amber-400">⭐ {selectedProvider?.rating || 4.9}</span>
                    <span>•</span>
                    <span>Valor Fechado: <strong className="text-white">R$ {selectedQuote?.price.toFixed(2) || '110.00'}</strong></span>
                  </div>
                </div>
              </div>

              {/* Uber PIN Code for Security */}
              <div className="text-right bg-zinc-900 border border-zinc-800 px-3.5 py-2 rounded-xl">
                <span className="text-[10px] text-zinc-400 uppercase font-mono block">PIN de Segurança</span>
                <span className="text-lg font-mono font-black text-sky-300 tracking-widest">7412</span>
              </div>
            </div>

            {/* ETA & Distance Metric Bar */}
            <div className="grid grid-cols-2 gap-3.5 text-xs">
              <div className="p-4 bg-zinc-50 rounded-2xl border border-zinc-200">
                <span className="text-xs text-zinc-500 block font-medium">Tempo Estimado de Chegada:</span>
                <strong className="text-lg font-black text-zinc-950 mt-0.5 block">
                  {serviceStep === 'completed' ? 'Finalizado' : providerEtaMinutes > 0 ? `${providerEtaMinutes} min` : 'No Local!'}
                </strong>
              </div>
              <div className="p-4 bg-zinc-50 rounded-2xl border border-zinc-200">
                <span className="text-xs text-zinc-500 block font-medium">Distância do Prestador:</span>
                <strong className="text-lg font-black text-zinc-950 mt-0.5 block">
                  {serviceStep === 'completed' ? '0 km' : providerDistanceKm > 0 ? `${providerDistanceKm} km` : 'Chegou'}
                </strong>
              </div>
            </div>

            {/* Custody Escrow Status & Warranty Digital Certificate Action */}
            <div className="p-4 sm:p-5 rounded-2xl sm:rounded-3xl bg-white border border-zinc-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3.5 text-xs shadow-xs">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-zinc-950 text-sky-400 border border-zinc-800 flex items-center justify-center shrink-0 shadow-xs">
                  <Award className="w-5 h-5" />
                </div>
                <div>
                  <span className="font-extrabold text-sm sm:text-base text-zinc-900 block">Garantia ProServiços 90 Dias & Laudo Técnico</span>
                  <p className="text-xs sm:text-sm text-zinc-600 mt-0.5">
                    Fotos antes/depois registradas e termo de garantia digital oficial.
                  </p>
                </div>
              </div>
              {onOpenWarrantyModal && (
                <button
                  type="button"
                  onClick={onOpenWarrantyModal}
                  className="py-2.5 px-4 rounded-xl bg-sky-100 hover:bg-sky-200 text-sky-950 font-bold text-xs sm:text-sm flex items-center gap-2 self-start sm:self-auto transition border border-sky-300 shadow-2xs shrink-0"
                >
                  <Award className="w-4 h-4 text-sky-700" />
                  <span>Ver Laudo & Garantia</span>
                </button>
              )}
            </div>

            {/* Post-Service Feedback Section */}
            {serviceStep === 'completed' && (
              <div
                id="post-service-feedback-banner"
                className="p-5 sm:p-6 rounded-2xl sm:rounded-3xl bg-white border border-zinc-200 shadow-xs space-y-3"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex items-center gap-3.5">
                    <div className="w-10 h-10 rounded-xl bg-zinc-950 text-sky-400 border border-zinc-800 flex items-center justify-center font-bold shrink-0 shadow-xs">
                      <Star className="w-5 h-5 fill-sky-400" />
                    </div>
                    <div>
                      <span className="text-sm sm:text-base font-extrabold text-zinc-900 block">
                        {serviceFeedback
                          ? 'Sua Avaliação do Atendimento'
                          : `Avaliar Atendimento de ${selectedProvider?.name || 'Profissional'}`}
                      </span>
                      <p className="text-xs sm:text-sm text-zinc-600 mt-0.5">
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
                      className="py-2.5 px-4 rounded-xl bg-sky-400 hover:bg-sky-500 text-zinc-950 font-bold text-xs sm:text-sm flex items-center gap-2 transition shadow-xs shrink-0"
                    >
                      <Star className="w-3.5 h-3.5 fill-zinc-950" />
                      <span>{serviceFeedback ? 'Ver / Editar' : 'Avaliar Agora'}</span>
                    </button>
                  )}
                </div>

                {serviceFeedback && (
                  <div className="pt-2 border-t border-zinc-200 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
                    <div className="flex items-center gap-2">
                      <div className="flex text-amber-500">
                        {[1, 2, 3, 4, 5].map((s) => (
                          <Star
                            key={s}
                            className={`w-3.5 h-3.5 ${
                              s <= serviceFeedback.rating
                                ? 'fill-amber-400 text-amber-400'
                                : 'text-zinc-200'
                            }`}
                          />
                        ))}
                      </div>
                      <span className="font-extrabold text-zinc-900">{serviceFeedback.rating}.0</span>
                      <span className="text-zinc-600 italic truncate max-w-[200px] sm:max-w-sm">
                        "{serviceFeedback.comment}"
                      </span>
                    </div>
                    {serviceFeedback.tags && serviceFeedback.tags.length > 0 && (
                      <div className="flex gap-1 flex-wrap">
                        {serviceFeedback.tags.slice(0, 2).map((t, idx) => (
                          <span
                            key={idx}
                            className="px-2 py-0.5 rounded-md bg-white border border-zinc-200 text-zinc-800 text-[10px] font-semibold"
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
                className="py-3 px-4 rounded-xl bg-zinc-100 hover:bg-zinc-200 text-zinc-800 font-semibold text-xs flex items-center justify-center gap-2 transition border border-zinc-200/80"
              >
                <MessageSquare className="w-4 h-4 text-sky-600" />
                <span>Abrir Chat com Prestador</span>
              </button>

              <a
                href="https://wa.me/5511991238844"
                target="_blank"
                rel="noopener noreferrer"
                className="py-3 px-4 rounded-xl bg-zinc-100 hover:bg-zinc-200 text-zinc-800 font-semibold text-xs flex items-center justify-center gap-2 transition border border-zinc-200/80"
              >
                <Phone className="w-4 h-4 text-emerald-600" />
                <span>Ligar / WhatsApp</span>
              </a>

              {serviceStep === 'en_route' && (
                <button
                  onClick={onSimulateArrival}
                  className="py-3 px-4 rounded-xl bg-sky-400 hover:bg-sky-500 text-zinc-950 font-bold text-xs flex items-center justify-center gap-2 transition shadow-xs"
                >
                  <Car className="w-4 h-4" />
                  <span>Simular Carro Andando (GPS)</span>
                </button>
              )}

              {serviceStep === 'in_progress' && (
                <button
                  onClick={onFinishService}
                  className="py-3 px-4 rounded-xl bg-zinc-950 hover:bg-zinc-900 text-white font-bold text-xs flex items-center justify-center gap-2 transition shadow-xs"
                >
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  <span>Concluir Serviço</span>
                </button>
              )}

              {serviceStep === 'completed' && onOpenFeedbackModal && (
                <button
                  type="button"
                  id="action-eval-provider-btn"
                  onClick={onOpenFeedbackModal}
                  className="py-3 px-4 rounded-xl bg-sky-400 hover:bg-sky-500 text-zinc-950 font-bold text-xs flex items-center justify-center gap-2 transition shadow-xs"
                >
                  <Star className="w-4 h-4 fill-zinc-950" />
                  <span>{serviceFeedback ? 'Ver Avaliação' : 'Avaliar Prestador'}</span>
                </button>
              )}

              {serviceStep === 'completed' && (
                <button
                  onClick={onResetToNewService}
                  className="py-3 px-4 rounded-xl bg-zinc-100 hover:bg-zinc-200 text-zinc-800 font-bold text-xs flex items-center justify-center gap-2 transition border border-zinc-200"
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
