import React from 'react';
import {
  CheckCircle2,
  ShieldCheck,
  Clock,
  Calendar,
  DollarSign,
  Star,
  ExternalLink,
  MessageSquare,
  Award,
  Zap
} from 'lucide-react';
import { ServiceRequest, ProviderQuote, UserProfile } from '../types';

interface ClientQuotesComparatorProps {
  request: ServiceRequest;
  onAcceptQuote: (requestId: string, quote: ProviderQuote) => void;
  onOpenMicroPage: (providerId: string) => void;
  onOpenChat: (request: ServiceRequest) => void;
}

export const ClientQuotesComparator: React.FC<ClientQuotesComparatorProps> = ({
  request,
  onAcceptQuote,
  onOpenMicroPage,
  onOpenChat
}) => {
  const quotes = request.quotes || [];

  if (quotes.length === 0) {
    return (
      <div className="bg-white rounded-2xl p-8 border border-zinc-200 text-center space-y-3">
        <div className="w-12 h-12 mx-auto rounded-full bg-zinc-100 text-zinc-800 flex items-center justify-center animate-pulse">
          <Clock className="w-6 h-6" />
        </div>
        <h4 className="text-base font-bold text-zinc-900">Aguardando propostas dos prestadores</h4>
        <p className="text-xs text-zinc-500 max-w-md mx-auto">
          Os profissionais da categoria <strong>{request.category}</strong> já foram notificados sobre o seu pedido de <em>"{request.title}"</em> e estão montando as propostas com valores e horários.
        </p>
      </div>
    );
  }

  // Find lowest price and highest rating for badges
  const lowestPrice = Math.min(...quotes.map((q) => q.price));
  const highestRating = Math.max(...quotes.map((q) => q.providerRating));

  const isAccepted = !!request.selectedQuoteId;
  const acceptedQuote = quotes.find((q) => q.id === request.selectedQuoteId);

  return (
    <div className="space-y-4">
      {/* Top Banner if already accepted */}
      {isAccepted && acceptedQuote && (
        <div className="bg-zinc-950 border border-zinc-800 text-white rounded-2xl p-4.5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-zinc-900 text-sky-400 border border-zinc-800 flex items-center justify-center font-bold">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <div>
              <span className="text-[11px] font-bold text-sky-400 uppercase tracking-wider block">
                Contratação Fechada!
              </span>
              <h4 className="text-sm font-bold text-white">
                Você fechou com <strong>{acceptedQuote.providerName}</strong> por R$ {acceptedQuote.price.toFixed(2)}
              </h4>
              <p className="text-xs text-zinc-400">
                Agendado para {acceptedQuote.scheduledDate} às {acceptedQuote.scheduledTime}
              </p>
            </div>
          </div>

          <button
            onClick={() => onOpenChat(request)}
            className="py-2.5 px-4 rounded-xl bg-sky-400 hover:bg-sky-500 text-zinc-950 text-xs font-bold flex items-center gap-1.5 shadow-xs transition shrink-0"
          >
            <MessageSquare className="w-4 h-4" />
            <span>Abrir Chat & Rastreamento</span>
          </button>
        </div>
      )}

      {/* Comparison Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-base font-bold text-zinc-950">
            Comparador de Orçamentos ({quotes.length} {quotes.length === 1 ? 'proposta' : 'propostas'})
          </h3>
          <p className="text-xs text-zinc-500">
            Compare os valores, horários e reputação dos profissionais para escolher o melhor
          </p>
        </div>
      </div>

      {/* Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {quotes.map((quote) => {
          const isSelected = request.selectedQuoteId === quote.id;
          const isBestPrice = quote.price === lowestPrice;
          const isTopRated = quote.providerRating === highestRating;

          return (
            <div
              key={quote.id}
              className={`relative bg-white rounded-3xl p-6 sm:p-7 border transition-all flex flex-col justify-between min-h-[460px] ${
                isSelected
                  ? 'border-2 border-zinc-950 shadow-lg ring-2 ring-zinc-900/10'
                  : 'border-zinc-200 hover:border-zinc-300 hover:shadow-md'
              }`}
            >
              {/* Highlight badge */}
              <div className="absolute -top-3 right-6 flex gap-1.5">
                {isBestPrice && !isSelected && (
                  <span className="px-3 py-1 rounded-full text-xs font-bold bg-sky-100 text-sky-950 border border-sky-300 shadow-xs">
                    Melhor Preço
                  </span>
                )}
                {isTopRated && !isSelected && (
                  <span className="px-3 py-1 rounded-full text-xs font-bold bg-zinc-950 text-white shadow-xs">
                    Top Avaliado ★
                  </span>
                )}
                {isSelected && (
                  <span className="px-3 py-1 rounded-full text-xs font-bold bg-zinc-950 text-white shadow-xs">
                    Escolhida por você
                  </span>
                )}
              </div>

              <div className="space-y-4">
                {/* Provider info header */}
                <div className="flex items-center gap-4 pb-4 border-b border-zinc-100">
                  <div className="relative shrink-0">
                    <img
                      src={quote.providerAvatar}
                      alt={quote.providerName}
                      className="w-16 h-16 rounded-2xl object-cover border border-zinc-100 shadow-2xs"
                    />
                    {quote.providerFacialVerified && (
                      <span className="absolute -bottom-1 -right-1 bg-sky-500 text-white rounded-full p-1 shadow-2xs">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                      </span>
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <h4 className="text-base font-extrabold text-zinc-950 truncate">{quote.providerName}</h4>
                    <div className="flex items-center gap-2 text-xs text-zinc-500 mt-1">
                      <span className="flex items-center text-amber-500 font-bold bg-amber-50 px-2 py-0.5 rounded-md border border-amber-200">
                        <Star className="w-3.5 h-3.5 fill-current mr-1" />
                        {quote.providerRating}
                      </span>
                      <span>•</span>
                      <span className="font-medium text-zinc-700">{quote.providerJobsCount} serviços</span>
                    </div>
                  </div>
                </div>

                {/* Trust Badges */}
                <div className="flex flex-wrap gap-2">
                  {quote.providerFacialVerified && (
                    <span className="px-2.5 py-1 rounded-lg bg-zinc-100 text-zinc-800 text-xs font-semibold flex items-center gap-1.5 border border-zinc-200">
                      <CheckCircle2 className="w-3.5 h-3.5 text-sky-600" /> Biometria Facial
                    </span>
                  )}
                  {quote.providerDocVerified && (
                    <span className="px-2.5 py-1 rounded-lg bg-zinc-100 text-zinc-800 text-xs font-semibold flex items-center gap-1.5 border border-zinc-200">
                      <ShieldCheck className="w-3.5 h-3.5 text-sky-600" /> Doc Verificado
                    </span>
                  )}
                </div>

                {/* Price & Schedule Card Box */}
                <div className="bg-zinc-50 rounded-2xl p-4 space-y-2.5 border border-zinc-200/80">
                  <div className="flex items-baseline justify-between">
                    <span className="text-xs text-zinc-500 font-medium">Mão de obra total:</span>
                    <span className="text-2xl font-black text-zinc-950">
                      R$ {quote.price.toFixed(2)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-xs text-zinc-700 pt-1.5 border-t border-zinc-200/60">
                    <span className="flex items-center gap-1.5 font-medium">
                      <Calendar className="w-3.5 h-3.5 text-zinc-400" />
                      {quote.scheduledDate}
                    </span>
                    <span className="flex items-center gap-1.5 font-semibold text-zinc-900 bg-white px-2 py-0.5 rounded-md border border-zinc-200">
                      <Clock className="w-3.5 h-3.5 text-zinc-500" />
                      {quote.scheduledTime} ({quote.estimatedDuration})
                    </span>
                  </div>
                </div>

                {/* Message & Guarantee Box */}
                <div className="bg-zinc-50/70 border border-zinc-100 rounded-xl p-3.5 space-y-2">
                  <p className="text-xs sm:text-sm text-zinc-700 italic leading-relaxed">
                    "{quote.message}"
                  </p>
                  <div className="text-xs text-zinc-600 flex items-center gap-1.5 pt-1 border-t border-zinc-200/60 font-medium">
                    <Award className="w-4 h-4 text-sky-600 shrink-0" />
                    <span>{quote.warrantyTerms}</span>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-4 mt-4 border-t border-zinc-100 flex flex-col gap-2.5">
                <button
                  type="button"
                  onClick={() => onOpenMicroPage(quote.providerId)}
                  className="w-full py-2 px-3 rounded-xl text-xs font-bold text-zinc-700 hover:text-zinc-950 hover:bg-zinc-100 transition flex items-center justify-center gap-1.5 border border-zinc-200"
                >
                  <ExternalLink className="w-3.5 h-3.5 text-zinc-500" />
                  <span>Ver Micropágina e Avaliações</span>
                </button>

                {isSelected ? (
                  <button
                    onClick={() => onOpenChat(request)}
                    className="w-full py-3 px-4 rounded-xl bg-zinc-950 hover:bg-zinc-900 text-white font-bold text-xs sm:text-sm shadow-xs transition flex items-center justify-center gap-2"
                  >
                    <MessageSquare className="w-4 h-4 text-sky-400" />
                    <span>Abrir Chat com {quote.providerName}</span>
                  </button>
                ) : (
                  <button
                    disabled={isAccepted}
                    onClick={() => onAcceptQuote(request.id, quote)}
                    className="w-full py-3 px-4 rounded-xl bg-sky-400 hover:bg-sky-500 disabled:opacity-40 text-zinc-950 font-bold text-xs sm:text-sm shadow-xs transition flex items-center justify-center gap-2"
                  >
                    <Zap className="w-4 h-4 fill-zinc-950" />
                    <span>Contratar {quote.providerName.split(' ')[0]} Agora</span>
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
