import React, { useState, useEffect } from 'react';
import {
  Star,
  CheckCircle2,
  Sparkles,
  ShieldCheck,
  ThumbsUp,
  ThumbsDown,
  X,
  Award,
  ExternalLink,
  MessageSquare,
  Send,
  Heart,
  Clock,
  Wrench,
  Check
} from 'lucide-react';
import { UserProfile, ServiceRequest, ServiceFeedback } from '../types';

interface PostServiceFeedbackModalProps {
  isOpen: boolean;
  onClose: () => void;
  request: ServiceRequest;
  provider: UserProfile;
  clientName: string;
  clientAvatar?: string;
  existingFeedback?: ServiceFeedback;
  onSubmitFeedback: (feedback: ServiceFeedback) => void;
  onOpenWarrantyModal?: () => void;
  onOpenMicroPage?: (provider: UserProfile) => void;
}

const QUICK_TAGS = [
  '⚡ Super Pontual',
  '🧹 Deixou Tudo Limpo',
  '🛡️ Serviço Impecável',
  '🔧 Ferramentas Completas',
  '💬 Comunicação Clara',
  '💰 Preço Justo',
  '⏱️ Ágil e Eficiente',
  '✨ Muito Cuidadoso'
];

const RATING_DESCRIPTIONS: Record<number, { title: string; subtitle: string; color: string }> = {
  1: {
    title: 'Péssimo',
    subtitle: 'Houve problemas graves na execução ou atendimento',
    color: 'text-red-500'
  },
  2: {
    title: 'Ruim',
    subtitle: 'O serviço ficou abaixo do esperado',
    color: 'text-orange-500'
  },
  3: {
    title: 'Regular',
    subtitle: 'Atendeu o básico, mas há pontos a melhorar',
    color: 'text-amber-500'
  },
  4: {
    title: 'Muito Bom',
    subtitle: 'Serviço bem executado e profissional cordial',
    color: 'text-emerald-500'
  },
  5: {
    title: 'Excelente / Impecável!',
    subtitle: 'Superou as expectativas em qualidade e pontualidade',
    color: 'text-amber-400'
  }
};

export const PostServiceFeedbackModal: React.FC<PostServiceFeedbackModalProps> = ({
  isOpen,
  onClose,
  request,
  provider,
  clientName,
  clientAvatar,
  existingFeedback,
  onSubmitFeedback,
  onOpenWarrantyModal,
  onOpenMicroPage
}) => {
  const [rating, setRating] = useState<number>(existingFeedback?.rating || 5);
  const [hoverRating, setHoverRating] = useState<number>(0);
  const [comment, setComment] = useState<string>(existingFeedback?.comment || '');
  const [selectedTags, setSelectedTags] = useState<string[]>(existingFeedback?.tags || [
    '⚡ Super Pontual',
    '🧹 Deixou Tudo Limpo',
    '🛡️ Serviço Impecável'
  ]);
  const [recommends, setRecommends] = useState<boolean>(
    existingFeedback?.recommends !== undefined ? existingFeedback.recommends : true
  );

  // Micro-ratings for aspects
  const [aspectRatings, setAspectRatings] = useState({
    punctuality: existingFeedback?.aspectRatings?.punctuality || 5,
    quality: existingFeedback?.aspectRatings?.quality || 5,
    cleanliness: existingFeedback?.aspectRatings?.cleanliness || 5,
    communication: existingFeedback?.aspectRatings?.communication || 5
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(!!existingFeedback);
  const [submittedFeedback, setSubmittedFeedback] = useState<ServiceFeedback | null>(existingFeedback || null);

  useEffect(() => {
    if (existingFeedback) {
      setRating(existingFeedback.rating);
      setComment(existingFeedback.comment);
      setSelectedTags(existingFeedback.tags || []);
      setRecommends(existingFeedback.recommends ?? true);
      setIsSubmitted(true);
      setSubmittedFeedback(existingFeedback);
    }
  }, [existingFeedback]);

  if (!isOpen) return null;

  const currentDisplayRating = hoverRating || rating;
  const ratingInfo = RATING_DESCRIPTIONS[currentDisplayRating] || RATING_DESCRIPTIONS[5];

  const handleToggleTag = (tag: string) => {
    setSelectedTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    );
  };

  const handleAspectChange = (aspect: keyof typeof aspectRatings, score: number) => {
    setAspectRatings((prev) => ({ ...prev, [aspect]: score }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    const feedbackData: ServiceFeedback = {
      id: existingFeedback?.id || `feedback-${Date.now()}`,
      requestId: request.id,
      providerId: provider.id,
      providerName: provider.name,
      clientName: clientName || 'Cliente ProServiços',
      clientAvatar: clientAvatar || 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80',
      rating,
      comment: comment.trim() || 'Serviço executado com excelência e dentro do combinado.',
      tags: selectedTags,
      recommends,
      aspectRatings,
      createdAt: new Date().toISOString()
    };

    setTimeout(() => {
      onSubmitFeedback(feedbackData);
      setSubmittedFeedback(feedbackData);
      setIsSubmitting(false);
      setIsSubmitted(true);
    }, 450);
  };

  const selectedQuote = request.quotes?.find((q) => q.id === request.selectedQuoteId);

  return (
    <div
      id="post-service-feedback-backdrop"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-slate-950/70 backdrop-blur-xs overflow-y-auto"
    >
      <div
        id="post-service-feedback-dialog"
        className="relative w-full max-w-xl bg-white rounded-3xl shadow-2xl border border-slate-100 overflow-hidden flex flex-col max-h-[92vh] animate-in fade-in zoom-in-95 duration-200"
      >
        {/* Header */}
        <div className="relative px-6 py-5 bg-zinc-950 text-white border-b border-zinc-800 shrink-0">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-zinc-900 text-sky-400 border border-zinc-800 flex items-center justify-center font-bold shadow-xs">
                <Star className="w-5 h-5 fill-current" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-base font-extrabold tracking-tight">Avaliar Atendimento</h3>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-sky-500/20 text-sky-300 border border-sky-500/30">
                    Serviço Concluído
                  </span>
                </div>
                <p className="text-xs text-zinc-400">
                  Sua avaliação ajuda outros clientes e valoriza bons profissionais
                </p>
              </div>
            </div>
            <button
              id="close-feedback-modal-btn"
              onClick={onClose}
              className="p-2 rounded-xl text-zinc-400 hover:text-white hover:bg-zinc-800 transition"
              title="Fechar"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-5">
          {/* Provider and Service Overview Header Banner */}
          <div className="p-4 rounded-2xl bg-zinc-50 border border-zinc-200/80 flex items-center justify-between gap-3">
            <div className="flex items-center gap-3 min-w-0">
              <div className="relative shrink-0">
                <img
                  src={provider.avatar}
                  alt={provider.name}
                  className="w-14 h-14 rounded-2xl object-cover border-2 border-white shadow-2xs bg-zinc-200"
                />
                {provider.facialVerified && (
                  <span
                    className="absolute -bottom-1 -right-1 bg-sky-500 text-white p-0.5 rounded-full shadow-xs"
                    title="Validação Facial Biométrica Aprovada"
                  >
                    <ShieldCheck className="w-3.5 h-3.5" />
                  </span>
                )}
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-1.5 flex-wrap">
                  <h4 className="text-sm font-bold text-zinc-950 truncate">{provider.name}</h4>
                  <span className="px-2 py-0.5 rounded-md text-[10px] font-semibold bg-sky-50 text-sky-800 border border-sky-200">
                    {provider.category || 'Eletricista'}
                  </span>
                </div>
                <p className="text-xs text-slate-500 truncate mt-0.5">
                  {request.title || 'Serviço Residencial'}
                </p>
                <div className="flex items-center gap-2 text-[11px] text-slate-400 mt-1">
                  <span>Média atual: ★ {provider.rating || 4.9}</span>
                  <span>•</span>
                  <span>{provider.totalReviews || 87} avaliações</span>
                </div>
              </div>
            </div>

            {selectedQuote && (
              <div className="text-right shrink-0">
                <span className="text-[10px] text-slate-400 block">Total Pago</span>
                <span className="text-sm font-bold text-slate-800">
                  R$ {selectedQuote.price.toFixed(2)}
                </span>
              </div>
            )}
          </div>

          {/* Success / Already Submitted View */}
          {isSubmitted && submittedFeedback ? (
            <div className="space-y-5 py-2 animate-in fade-in duration-300">
              <div className="text-center p-6 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-950 space-y-2">
                <div className="w-12 h-12 rounded-full bg-emerald-500 text-white flex items-center justify-center mx-auto shadow-md">
                  <Check className="w-6 h-6 stroke-[3]" />
                </div>
                <h4 className="text-base font-extrabold text-emerald-900">
                  Avaliação Registrada com Sucesso!
                </h4>
                <p className="text-xs text-emerald-800 max-w-md mx-auto">
                  Obrigado, <strong>{clientName}</strong>! Sua avaliação de{' '}
                  <strong>{submittedFeedback.rating}.0 estrelas</strong> foi associada ao perfil
                  público de <strong>{provider.name}</strong> e reforça a reputação verificada na ProServiços.
                </p>
              </div>

              {/* Review Card Preview */}
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <img
                      src={submittedFeedback.clientAvatar || clientAvatar}
                      alt={submittedFeedback.clientName}
                      className="w-8 h-8 rounded-full object-cover border border-white shadow-xs"
                    />
                    <div>
                      <span className="text-xs font-bold text-slate-900 block">
                        {submittedFeedback.clientName}
                      </span>
                      <span className="text-[10px] text-slate-400">Cliente Verificado</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-1 text-amber-500 font-bold text-xs">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star
                        key={i}
                        className={`w-4 h-4 ${
                          i < submittedFeedback.rating ? 'fill-current text-amber-400' : 'text-slate-200'
                        }`}
                      />
                    ))}
                    <span className="ml-1 text-slate-800">{submittedFeedback.rating}.0</span>
                  </div>
                </div>

                <p className="text-xs text-slate-700 italic bg-white p-3 rounded-xl border border-slate-100 leading-relaxed">
                  "{submittedFeedback.comment}"
                </p>

                {submittedFeedback.tags && submittedFeedback.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {submittedFeedback.tags.map((t, idx) => (
                      <span
                        key={idx}
                        className="px-2.5 py-1 rounded-lg bg-amber-50 border border-amber-200 text-amber-800 text-[11px] font-semibold"
                      >
                        {t}
                      </span>
                    ))}
                  </div>
                )}
              </div>

              {/* Actions */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-2">
                {onOpenMicroPage && (
                  <button
                    id="view-provider-micropage-btn"
                    onClick={() => {
                      onOpenMicroPage(provider);
                      onClose();
                    }}
                    className="py-2.5 px-4 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs flex items-center justify-center gap-2 transition"
                  >
                    <ExternalLink className="w-3.5 h-3.5 text-amber-600" />
                    <span>Ver no Perfil do Prestador</span>
                  </button>
                )}

                {onOpenWarrantyModal && (
                  <button
                    id="view-warranty-from-feedback-btn"
                    onClick={() => {
                      onOpenWarrantyModal();
                      onClose();
                    }}
                    className="py-2.5 px-4 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs flex items-center justify-center gap-2 transition shadow-xs"
                  >
                    <Award className="w-3.5 h-3.5" />
                    <span>Certificado de Garantia (90 dias)</span>
                  </button>
                )}
              </div>

              <div className="flex items-center justify-between pt-2 border-t border-slate-100">
                <button
                  onClick={() => setIsSubmitted(false)}
                  className="text-xs font-semibold text-slate-500 hover:text-slate-800 underline"
                >
                  Editar Avaliação
                </button>
                <button
                  onClick={onClose}
                  className="py-2 px-5 rounded-xl bg-slate-900 text-white text-xs font-bold hover:bg-slate-800 transition"
                >
                  Concluir
                </button>
              </div>
            </div>
          ) : (
            /* Interactive Rating Form */
            <form onSubmit={handleSubmit} className="space-y-5">
              {/* 5-Star Primary Rating Widget */}
              <div className="p-5 rounded-2xl bg-gradient-to-b from-amber-50/60 to-white border border-amber-200/70 text-center space-y-3">
                <span className="text-xs font-bold text-slate-700 uppercase tracking-wider block">
                  Como foi sua experiência geral?
                </span>

                {/* Stars Buttons */}
                <div
                  className="flex items-center justify-center gap-2 sm:gap-3 py-1"
                  role="radiogroup"
                  aria-label="Avaliação em 5 estrelas"
                >
                  {[1, 2, 3, 4, 5].map((starIndex) => {
                    const isFilled = starIndex <= currentDisplayRating;
                    return (
                      <button
                        key={starIndex}
                        type="button"
                        id={`star-btn-${starIndex}`}
                        onClick={() => setRating(starIndex)}
                        onMouseEnter={() => setHoverRating(starIndex)}
                        onMouseLeave={() => setHoverRating(0)}
                        className="group p-1.5 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-400 transition-transform active:scale-90"
                        title={`${starIndex} Estrela${starIndex > 1 ? 's' : ''}`}
                        aria-label={`${starIndex} de 5 estrelas`}
                      >
                        <Star
                          className={`w-9 h-9 sm:w-10 sm:h-10 transition-all duration-150 ${
                            isFilled
                              ? 'text-amber-400 fill-amber-400 drop-shadow-sm group-hover:scale-115'
                              : 'text-slate-200 group-hover:text-amber-300'
                          }`}
                        />
                      </button>
                    );
                  })}
                </div>

                {/* Rating Description Label */}
                <div className="space-y-0.5">
                  <div className="flex items-center justify-center gap-1.5">
                    <span className="text-lg font-black text-slate-900">
                      {currentDisplayRating}.0
                    </span>
                    <span className={`text-sm font-extrabold ${ratingInfo.color}`}>
                      • {ratingInfo.title}
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 font-medium">
                    {ratingInfo.subtitle}
                  </p>
                </div>
              </div>

              {/* Aspect Specific Ratings (Micro-Ratings) */}
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
                <span className="text-xs font-bold text-slate-700 block">
                  Avaliação detalhada por critério:
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  {/* Punctuality */}
                  <div className="p-2.5 rounded-xl bg-white border border-slate-100 flex items-center justify-between">
                    <div>
                      <span className="font-bold text-slate-800 block">Pontualidade</span>
                      <span className="text-[10px] text-slate-500">Horário e chegada</span>
                    </div>
                    <div className="flex gap-1">
                      {[1, 2, 3, 4, 5].map((s) => (
                        <button
                          key={s}
                          type="button"
                          onClick={() => handleAspectChange('punctuality', s)}
                          className={`w-6 h-6 rounded-md text-[10px] font-bold flex items-center justify-center transition ${
                            s <= aspectRatings.punctuality
                              ? 'bg-sky-400 text-zinc-950 font-black'
                              : 'bg-zinc-100 text-zinc-400 hover:bg-zinc-200'
                          }`}
                        >
                          {s}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Quality */}
                  <div className="p-2.5 rounded-xl bg-white border border-slate-100 flex items-center justify-between">
                    <div>
                      <span className="font-bold text-slate-800 block">Qualidade</span>
                      <span className="text-[10px] text-slate-500">Acabamento e teste</span>
                    </div>
                    <div className="flex gap-1">
                      {[1, 2, 3, 4, 5].map((s) => (
                        <button
                          key={s}
                          type="button"
                          onClick={() => handleAspectChange('quality', s)}
                          className={`w-6 h-6 rounded-md text-[10px] font-bold flex items-center justify-center transition ${
                            s <= aspectRatings.quality
                              ? 'bg-sky-400 text-zinc-950 font-black'
                              : 'bg-zinc-100 text-zinc-400 hover:bg-zinc-200'
                          }`}
                        >
                          {s}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Cleanliness */}
                  <div className="p-2.5 rounded-xl bg-white border border-slate-100 flex items-center justify-between">
                    <div>
                      <span className="font-bold text-slate-800 block">Limpeza</span>
                      <span className="text-[10px] text-slate-500">Organização do local</span>
                    </div>
                    <div className="flex gap-1">
                      {[1, 2, 3, 4, 5].map((s) => (
                        <button
                          key={s}
                          type="button"
                          onClick={() => handleAspectChange('cleanliness', s)}
                          className={`w-6 h-6 rounded-md text-[10px] font-bold flex items-center justify-center transition ${
                            s <= aspectRatings.cleanliness
                              ? 'bg-sky-400 text-zinc-950 font-black'
                              : 'bg-zinc-100 text-zinc-400 hover:bg-zinc-200'
                          }`}
                        >
                          {s}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Communication */}
                  <div className="p-2.5 rounded-xl bg-white border border-slate-100 flex items-center justify-between">
                    <div>
                      <span className="font-bold text-slate-800 block">Comunicação</span>
                      <span className="text-[10px] text-slate-500">Educação e clareza</span>
                    </div>
                    <div className="flex gap-1">
                      {[1, 2, 3, 4, 5].map((s) => (
                        <button
                          key={s}
                          type="button"
                          onClick={() => handleAspectChange('communication', s)}
                          className={`w-6 h-6 rounded-md text-[10px] font-bold flex items-center justify-center transition ${
                            s <= aspectRatings.communication
                              ? 'bg-sky-400 text-zinc-950 font-black'
                              : 'bg-zinc-100 text-zinc-400 hover:bg-zinc-200'
                          }`}
                        >
                          {s}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Quick Compliment Tags */}
              <div className="space-y-2">
                <span className="text-xs font-bold text-slate-700 block">
                  Destaques positivos (toque para adicionar):
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {QUICK_TAGS.map((tag) => {
                    const isSelected = selectedTags.includes(tag);
                    return (
                      <button
                        key={tag}
                        type="button"
                        onClick={() => handleToggleTag(tag)}
                        className={`py-1.5 px-3 rounded-xl text-xs font-semibold transition flex items-center gap-1.5 ${
                          isSelected
                            ? 'bg-sky-400 text-zinc-950 font-bold shadow-xs'
                            : 'bg-zinc-100 hover:bg-zinc-200 text-zinc-700'
                        }`}
                      >
                        {isSelected && <Check className="w-3 h-3 stroke-[3]" />}
                        <span>{tag}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Written Review Textarea */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label
                    htmlFor="feedback-comment-textarea"
                    className="text-xs font-bold text-slate-800 flex items-center gap-1.5"
                  >
                    <MessageSquare className="w-3.5 h-3.5 text-sky-600" />
                    <span>Seu depoimento sobre o serviço</span>
                  </label>
                  <span className="text-[11px] text-slate-400">
                    {comment.length} / 500 caracteres
                  </span>
                </div>
                <textarea
                  id="feedback-comment-textarea"
                  rows={3}
                  maxLength={500}
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  placeholder="Conte como foi o atendimento... O profissional chegou no horário combinado? Explicou o que estava sendo feito? Deixou o local limpo e funcionando perfeitamente?"
                  className="w-full p-3.5 rounded-2xl border border-zinc-200 bg-white text-xs text-zinc-800 placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-sky-400 focus:border-sky-400 transition"
                />
              </div>

              {/* Recommendation Choice */}
              <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-between gap-3 text-xs">
                <div>
                  <span className="font-bold text-slate-800 block">
                    Recomenda {provider.name} para outros clientes?
                  </span>
                  <span className="text-[11px] text-slate-500">
                    Sua resposta ajuda na pontuação de destaque do profissional
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setRecommends(true)}
                    className={`py-1.5 px-3 rounded-xl font-bold flex items-center gap-1.5 transition ${
                      recommends === true
                        ? 'bg-emerald-600 text-white shadow-xs'
                        : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-100'
                    }`}
                  >
                    <ThumbsUp className="w-3.5 h-3.5" />
                    <span>Sim</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setRecommends(false)}
                    className={`py-1.5 px-3 rounded-xl font-bold flex items-center gap-1.5 transition ${
                      recommends === false
                        ? 'bg-rose-600 text-white shadow-xs'
                        : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-100'
                    }`}
                  >
                    <ThumbsDown className="w-3.5 h-3.5" />
                    <span>Não</span>
                  </button>
                </div>
              </div>

              {/* Trust Badge note */}
              <div className="p-3 rounded-xl bg-slate-100 text-[11px] text-slate-500 flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>
                  <strong>Avaliação 100% Verificada:</strong> Apenas clientes que contrataram e
                  concluíram o pagamento seguro podem avaliar profissionais na ProServiços.
                </span>
              </div>

              {/* Submit Button */}
              <div className="pt-2 flex items-center gap-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="py-3 px-4 rounded-xl border border-slate-200 hover:bg-slate-100 text-slate-700 text-xs font-bold transition"
                >
                  Mais Tarde
                </button>
                <button
                  type="submit"
                  id="submit-feedback-btn"
                  disabled={isSubmitting}
                  className="flex-1 py-3 px-5 rounded-xl bg-sky-400 hover:bg-sky-500 text-zinc-950 font-bold text-xs shadow-xs flex items-center justify-center gap-2 transition disabled:opacity-50"
                >
                  {isSubmitting ? (
                    <span>Salvando Avaliação...</span>
                  ) : (
                    <>
                      <Star className="w-4 h-4 fill-zinc-950" />
                      <span>Publicar Avaliação do Profissional</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
