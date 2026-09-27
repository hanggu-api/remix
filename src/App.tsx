import React, { useState, useEffect } from 'react';
import {
  Wrench,
  Zap,
  Scissors,
  Sparkles,
  ShieldCheck,
  CheckCircle2,
  Clock,
  ArrowRight,
  Star,
  ExternalLink,
  Plus,
  MessageSquare,
  Users,
  Search,
  Check,
  AlertCircle
} from 'lucide-react';
import {
  UserProfile,
  ServiceRequest,
  ProviderQuote,
  ChatMessage,
  ServiceStatus,
  MaterialItem,
  PartnerStore,
  ServiceFeedback,
  EscrowPayment
} from './types';
import {
  INITIAL_CLIENT,
  INITIAL_PROVIDERS,
  INITIAL_REQUESTS,
  INITIAL_MESSAGES
} from './data/mockData';
import { PARTNER_STORES, generateSmartMaterialsList } from './data/mockStores';
import { Navbar } from './components/Navbar';
import { UberMapView } from './components/UberMapView';
import { UberBottomSheet } from './components/UberBottomSheet';
import { UberDriverOverlay } from './components/UberDriverOverlay';
import { FacialVerificationModal } from './components/FacialVerificationModal';
import { DocumentVerificationModal } from './components/DocumentVerificationModal';
import { ChatAndTrackingModal } from './components/ChatAndTrackingModal';
import { ProviderMicroPage } from './components/ProviderMicroPage';
import { RegisterModal } from './components/RegisterModal';
import { NewRequestModal } from './components/NewRequestModal';
import { VercelDeployModal } from './components/VercelDeployModal';
import { MaterialsStoreModal } from './components/MaterialsStoreModal';
import { NotificationCenterModal } from './components/NotificationCenterModal';
import { EscrowPaymentModal } from './components/EscrowPaymentModal';
import { WarrantyAndBeforeAfterModal } from './components/WarrantyAndBeforeAfterModal';
import { ProviderFinanceModal } from './components/ProviderFinanceModal';
import { GeminiChatbotModal } from './components/GeminiChatbotModal';
import { PostServiceFeedbackModal } from './components/PostServiceFeedbackModal';
import { CloudflareDualAppModal } from './components/CloudflareDualAppModal';
import { notificationService } from './services/notificationService';
import {
  auth,
  signInWithGoogle,
  logoutUser,
  syncUserProfileToFirestore,
  syncServiceRequestToFirestore,
  subscribeToFirestoreRequests,
  testFirestoreConnection
} from './lib/firebase';
import { onAuthStateChanged, User as FirebaseUser } from 'firebase/auth';

export default function App() {
  const [currentUser, setCurrentUser] = useState<UserProfile>(INITIAL_CLIENT);
  const [providers, setProviders] = useState<UserProfile[]>(INITIAL_PROVIDERS);
  const [requests, setRequests] = useState<ServiceRequest[]>(INITIAL_REQUESTS);
  const [messages, setMessages] = useState<Record<string, ChatMessage[]>>(INITIAL_MESSAGES);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('Eletricista');

  // Materials & Partner Stores state
  const [currentMaterials, setCurrentMaterials] = useState<MaterialItem[]>(() =>
    generateSmartMaterialsList('Eletricista', 'Troca de 4 lâmpadas e verificação de tomada')
  );
  const [isMaterialsModalOpen, setIsMaterialsModalOpen] = useState(false);

  // Escrow, Warranty & Finance state
  const [isEscrowModalOpen, setIsEscrowModalOpen] = useState(false);
  const [pendingQuoteToEscrow, setPendingQuoteToEscrow] = useState<ProviderQuote | null>(null);
  const [isWarrantyModalOpen, setIsWarrantyModalOpen] = useState(false);
  const [isFinanceModalOpen, setIsFinanceModalOpen] = useState(false);

  // Uber flow state: 'idle' -> 'radar' -> 'quotes' -> 'en_route' -> 'in_progress' -> 'completed'
  const [serviceStep, setServiceStep] = useState<
    'idle' | 'radar' | 'quotes' | 'en_route' | 'in_progress' | 'completed'
  >('quotes'); // Starts in quotes for immediate demonstration of comparative Uber deck!

  const [activeRequestId, setActiveRequestId] = useState<string>(INITIAL_REQUESTS[0].id);
  const [selectedProvider, setSelectedProvider] = useState<UserProfile | null>(INITIAL_PROVIDERS[0]);

  // Live GPS Tracking Metrics
  const [providerDistanceKm, setProviderDistanceKm] = useState<number>(1.4);
  const [providerEtaMinutes, setProviderEtaMinutes] = useState<number>(4);

  // Modals & Navigation
  const [isFacialModalOpen, setIsFacialModalOpen] = useState(false);
  const [isDocModalOpen, setIsDocModalOpen] = useState(false);
  const [isRegisterModalOpen, setIsRegisterModalOpen] = useState(false);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [isNewRequestModalOpen, setIsNewRequestModalOpen] = useState(false);
  const [isFeedbackModalOpen, setIsFeedbackModalOpen] = useState(false);
  const [isVercelModalOpen, setIsVercelModalOpen] = useState(false);
  const [isCloudflareModalOpen, setIsCloudflareModalOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState<number>(() => {
    return notificationService.getNotificationHistory().filter((n) => !n.read).length;
  });
  const [selectedMicroPage, setSelectedMicroPage] = useState<UserProfile | null>(null);

  // Register service worker on startup
  useEffect(() => {
    notificationService.registerServiceWorker();
  }, []);

  // Check URL hash for direct public micro-page navigation (e.g. #p/carlos-mendes-eletricista)
  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash;
      if (hash.startsWith('#p/')) {
        const slug = hash.replace('#p/', '');
        const found = providers.find((p) => p.slug === slug);
        if (found) setSelectedMicroPage(found);
      }
    };
    handleHashChange();
    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, [providers]);

  const activeRequest = requests.find((r) => r.id === activeRequestId) || requests[0];

  // Handler: Start Uber-like search
  const handleRequestQuotes = (
    title: string,
    desc: string,
    audioUrl?: string,
    photoUrl?: string
  ) => {
    const smartMats = generateSmartMaterialsList(selectedCategory, title, desc);
    setCurrentMaterials(smartMats);

    const newReqId = `req-${Date.now()}`;
    const newReq: ServiceRequest = {
      id: newReqId,
      clientId: currentUser.id,
      clientName: currentUser.name,
      clientPhone: currentUser.phone,
      clientAddress: 'Rua Fradique Coutinho, 1240 - Pinheiros, São Paulo - SP',
      clientCoordinates: {
        lat: -23.5617,
        lng: -46.6865
      },
      title,
      description: desc,
      category: selectedCategory,
      mediaType: photoUrl ? 'photo' : audioUrl ? 'audio' : 'none',
      mediaUrl: photoUrl,
      audioBlobUrl: audioUrl,
      status: 'open',
      quotes: [],
      materialsList: smartMats,
      createdAt: new Date().toISOString()
    };

    setRequests((prev) => [newReq, ...prev]);
    setActiveRequestId(newReqId);
    setServiceStep('radar');

    // Web Push alert to providers in the area
    notificationService.triggerAlert({
      title: '🚨 Novo Chamado no Radar!',
      body: `${currentUser.name} abriu solicitação para "${title}" (${selectedCategory}). Envie seu orçamento!`,
      type: 'quote_received',
      targetRole: 'provider',
      data: { requestId: newReqId }
    });

    // Simulate Radar searching and receiving responses from Providers B, C, D in 2.2 seconds
    setTimeout(() => {
      const matchingProviders = providers.filter(
        (p) => !selectedCategory || p.category?.toLowerCase() === selectedCategory.toLowerCase()
      );

      const generatedQuotes: ProviderQuote[] = matchingProviders.slice(0, 3).map((prov, index) => ({
        id: `quote-${prov.id}-${Date.now()}`,
        requestId: newReqId,
        providerId: prov.id,
        providerName: prov.name,
        providerAvatar: prov.avatar,
        providerPhone: prov.phone,
        providerRating: prov.rating || 4.9,
        providerJobsCount: prov.completedJobsCount || 90,
        providerFacialVerified: !!prov.facialVerified,
        providerDocVerified: !!prov.documentVerified,
        price: 85 + index * 25,
        materialsTotal: index === 0 ? 70.5 : undefined,
        includeMaterials: index === 0,
        selectedStoreName: index === 0 ? 'Elétrica & Iluminação Pinheiros' : undefined,
        scheduledDate: new Date().toISOString().split('T')[0],
        scheduledTime: `Em ${15 + index * 10} min`,
        estimatedDuration: '1h',
        message:
          index === 0
            ? 'Passo na Elétrica Pinheiros para pegar as lâmpadas e chego em 15 min!'
            : 'Estou com van equipada e ferramentas completas para executar agora.',
        warrantyTerms: 'Garantia de 90 dias',
        status: 'pending',
        createdAt: new Date().toISOString()
      }));

      setRequests((prev) =>
        prev.map((r) =>
          r.id === newReqId
            ? { ...r, status: 'quotes_received', quotes: generatedQuotes }
            : r
        )
      );
      setServiceStep('quotes');

      // Web Push alert to client: 3 quotes received
      notificationService.triggerAlert({
        title: '💰 3 Novos Orçamentos Recebidos!',
        body: 'Carlos Mendes e outros profissionais enviaram propostas a partir de R$ 85,00. Toque para comparar.',
        type: 'quote_received',
        targetRole: 'client',
        data: { requestId: newReqId }
      });
      setUnreadCount((c) => c + 1);
    }, 2200);
  };

  // Handler: Accept Quote (Triggers Escrow & PIX Checkout)
  const handleAcceptQuote = (quote: ProviderQuote) => {
    setPendingQuoteToEscrow(quote);
    setIsEscrowModalOpen(true);
  };

  // Handler: Confirm Escrow PIX Payment
  const handleConfirmEscrowPayment = (quote: ProviderQuote, escrowData: EscrowPayment) => {
    const prov = providers.find((p) => p.id === quote.providerId) || null;
    setSelectedProvider(prov);

    setRequests((prev) =>
      prev.map((r) =>
        r.id === activeRequestId
          ? {
              ...r,
              status: 'accepted',
              selectedQuoteId: quote.id,
              escrowStatus: 'held',
              escrowPayment: escrowData
            }
          : r
      )
    );

    // Initial system confirmation message in chat
    const newMsg: ChatMessage = {
      id: `msg-${Date.now()}`,
      requestId: activeRequestId,
      senderId: 'system',
      senderName: 'Sistema ProServiços (Custódia PIX)',
      senderRole: 'client',
      text: `🔒 Pagamento de R$ ${quote.price.toFixed(2)} retido em Custódia Segura! Prestador ${quote.providerName} a caminho. PIN de liberação no local: 7412.`,
      timestamp: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
      isSystemUpdate: true
    };

    setMessages((prev) => ({
      ...prev,
      [activeRequestId]: [...(prev[activeRequestId] || []), newMsg]
    }));

    setServiceStep('en_route');
    setProviderDistanceKm(1.4);
    setProviderEtaMinutes(4);

    // Web Push alert to provider
    notificationService.triggerAlert({
      title: '🔒 Pagamento em Custódia Confirmado!',
      body: `${currentUser.name} realizou o PIX de R$ ${quote.price.toFixed(2)} que está retido em garantia. Desloque-se até o local!`,
      type: 'quote_accepted',
      targetUserId: quote.providerId,
      targetRole: 'provider',
      data: { requestId: activeRequestId, quoteId: quote.id }
    });
    setUnreadCount((c) => c + 1);
  };

  // Handler: Simulate Provider Driving Closer via GPS
  const handleSimulateArrival = () => {
    let currentKm = providerDistanceKm;
    let currentEta = providerEtaMinutes;

    const interval = setInterval(() => {
      currentKm = Math.max(0, Number((currentKm - 0.4).toFixed(1)));
      currentEta = Math.max(0, currentEta - 1);
      setProviderDistanceKm(currentKm);
      setProviderEtaMinutes(currentEta);

      if (currentKm <= 0) {
        clearInterval(interval);
        setServiceStep('in_progress');
        setRequests((prev) =>
          prev.map((r) => (r.id === activeRequestId ? { ...r, status: 'in_progress' } : r))
        );

        // Notify chat
        const arrivalMsg: ChatMessage = {
          id: `msg-${Date.now()}`,
          requestId: activeRequestId,
          senderId: 'system',
          senderName: 'Sistema',
          senderRole: 'client',
          text: `🚗 O prestador ${selectedProvider?.name || 'Profissional'} chegou ao local! Confirme o PIN 7412.`,
          timestamp: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
          isSystemUpdate: true
        };
        setMessages((prev) => ({
          ...prev,
          [activeRequestId]: [...(prev[activeRequestId] || []), arrivalMsg]
        }));

        // Web Push alert: Provider arrived at destination
        notificationService.triggerAlert({
          title: '🚗 Prestador no Local!',
          body: `${selectedProvider?.name || 'Profissional'} chegou ao endereço. Código PIN de segurança: 7412.`,
          type: 'service_status',
          targetRole: 'client',
          data: { requestId: activeRequestId }
        });
        setUnreadCount((c) => c + 1);
      }
    }, 1200);
  };

  // Handler: Complete Service
  const handleFinishService = () => {
    setServiceStep('completed');
    setRequests((prev) =>
      prev.map((r) =>
        r.id === activeRequestId
          ? { ...r, status: 'completed', escrowStatus: 'released' }
          : r
      )
    );

    // Confirmation message in chat with warranty certificate link
    const finishMsg: ChatMessage = {
      id: `msg-${Date.now()}`,
      requestId: activeRequestId,
      senderId: 'system',
      senderName: 'Sistema ProServiços',
      senderRole: 'client',
      text: `✅ Serviço concluído com sucesso e PIN validado! O valor em custódia foi liberado para o prestador. Seu Certificado de Garantia de 90 dias (CDC) foi emitido.`,
      timestamp: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
      isSystemUpdate: true
    };

    setMessages((prev) => ({
      ...prev,
      [activeRequestId]: [...(prev[activeRequestId] || []), finishMsg]
    }));

    // Web Push alert
    notificationService.triggerAlert({
      title: '✅ Serviço Concluído! Avalie seu Prestador',
      body: `O serviço "${activeRequest?.title || 'Serviço'}" foi finalizado. Dê sua nota de 1 a 5 estrelas para valorizar o profissional.`,
      type: 'service_status',
      targetRole: 'all',
      data: { requestId: activeRequestId }
    });
    setUnreadCount((c) => c + 1);

    // Automatically prompt client with post-service feedback component
    setIsFeedbackModalOpen(true);
  };

  // Handler: Submit Post-Service Client Feedback & Review
  const handleSubmitFeedback = (feedback: ServiceFeedback) => {
    // 1. Update active request with feedback
    setRequests((prev) =>
      prev.map((r) => (r.id === feedback.requestId ? { ...r, feedback } : r))
    );

    // 2. Update provider rating, reviews count and append to reviews list
    setProviders((prev) =>
      prev.map((p) => {
        if (p.id === feedback.providerId) {
          const currentReviews = p.reviewsList || [];
          const updatedReviews = [
            feedback,
            ...currentReviews.filter((r) => r.id !== feedback.id)
          ];
          const totalRating = updatedReviews.reduce((sum, rev) => sum + rev.rating, 0);
          const newAvgRating = Number((totalRating / updatedReviews.length).toFixed(1));

          return {
            ...p,
            rating: newAvgRating,
            totalReviews: (p.totalReviews || 0) + 1,
            reviewsList: updatedReviews
          };
        }
        return p;
      })
    );

    // 3. Keep selectedProvider in sync
    if (selectedProvider && selectedProvider.id === feedback.providerId) {
      setSelectedProvider((prev) => {
        if (!prev) return null;
        const currentReviews = prev.reviewsList || [];
        const updatedReviews = [
          feedback,
          ...currentReviews.filter((r) => r.id !== feedback.id)
        ];
        const totalRating = updatedReviews.reduce((sum, rev) => sum + rev.rating, 0);
        const newAvgRating = Number((totalRating / updatedReviews.length).toFixed(1));

        return {
          ...prev,
          rating: newAvgRating,
          totalReviews: (prev.totalReviews || 0) + 1,
          reviewsList: updatedReviews
        };
      });
    }

    // 4. Post feedback notice to chat
    const feedbackMsg: ChatMessage = {
      id: `msg-${Date.now()}`,
      requestId: feedback.requestId,
      senderId: 'system',
      senderName: 'Sistema ProServiços',
      senderRole: 'client',
      text: `⭐ Avaliação de ${feedback.rating}.0 estrelas enviada para ${feedback.providerName}: "${feedback.comment}"`,
      timestamp: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
      isSystemUpdate: true
    };

    setMessages((prev) => ({
      ...prev,
      [feedback.requestId]: [...(prev[feedback.requestId] || []), feedbackMsg]
    }));

    // 5. Send Web Push notification
    notificationService.triggerAlert({
      title: `⭐ Avaliação Registrada (${feedback.rating}.0★)!`,
      body: `Sua avaliação foi publicada no perfil público de ${feedback.providerName}.`,
      type: 'service_status',
      targetRole: 'client',
      data: { requestId: feedback.requestId }
    });
    setUnreadCount((c) => c + 1);

    // 6. Sync request with feedback to Firestore if connected
    const targetReq = requests.find((r) => r.id === feedback.requestId);
    if (targetReq) {
      syncServiceRequestToFirestore({
        ...targetReq,
        feedback
      });
    }
  };

  // Handler: Reset to make a new service request
  const handleResetToNewService = () => {
    setServiceStep('idle');
    setProviderDistanceKm(1.8);
    setProviderEtaMinutes(5);
  };

  // Handler: Provider sends bid from Driver Cockpit
  const handleProviderSubmitQuote = (
    reqId: string,
    quoteData: Omit<ProviderQuote, 'id' | 'createdAt' | 'status'>
  ) => {
    const newQuote: ProviderQuote = {
      ...quoteData,
      id: `quote-${Date.now()}`,
      status: 'pending',
      createdAt: new Date().toISOString()
    };

    setRequests((prev) =>
      prev.map((r) =>
        r.id === reqId
          ? {
              ...r,
              status: 'quotes_received',
              quotes: [...r.quotes.filter((q) => q.providerId !== quoteData.providerId), newQuote]
            }
          : r
      )
    );

    // Web Push alert to client
    notificationService.triggerAlert({
      title: `💵 Orçamento Recebido de ${newQuote.providerName}`,
      body: `Proposta de R$ ${newQuote.price.toFixed(2)} (${newQuote.scheduledTime}). Toque para revisar.`,
      type: 'quote_received',
      targetRole: 'client',
      data: { requestId: reqId, quoteId: newQuote.id }
    });
    setUnreadCount((c) => c + 1);
  };

  // Chat message sending
  const handleSendMessage = (requestId: string, text: string, isLocation: boolean = false) => {
    const newMsg: ChatMessage = {
      id: `msg-${Date.now()}`,
      requestId,
      senderId: currentUser.id,
      senderName: currentUser.name,
      senderRole: currentUser.role,
      text,
      timestamp: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
      isLocationShare: isLocation
    };

    setMessages((prev) => ({
      ...prev,
      [requestId]: [...(prev[requestId] || []), newMsg]
    }));

    // Web Push alert to chat recipient
    notificationService.triggerAlert({
      title: `💬 Nova Mensagem de ${currentUser.name}`,
      body: isLocation ? '📍 Compartilhou localização em tempo real' : text,
      type: 'chat_message',
      targetRole: currentUser.role === 'client' ? 'provider' : 'client',
      data: { requestId }
    });
    setUnreadCount((c) => c + 1);
  };

  // Open public micro-page
  const handleOpenMicroPage = (provider: UserProfile) => {
    window.location.hash = `p/${provider.slug || 'perfil'}`;
    setSelectedMicroPage(provider);
  };

  // If viewing a standalone public micro-page via URL hash
  if (selectedMicroPage) {
    return (
      <ProviderMicroPage
        provider={selectedMicroPage}
        onRequestQuoteDirectly={(prov) => {
          setSelectedMicroPage(null);
          window.location.hash = '';
          setSelectedCategory(prov.category || 'Eletricista');
          setServiceStep('idle');
        }}
        onBack={() => {
          setSelectedMicroPage(null);
          window.location.hash = '';
        }}
      />
    );
  }

  return (
    <div className="relative w-screen h-screen overflow-hidden flex flex-col bg-zinc-950 font-sans">
      {/* Top Navbar Header */}
      <Navbar
        currentUser={currentUser}
        providers={providers}
        onSelectUser={(u) => {
          setCurrentUser(u);
          if (u.role === 'provider') {
            setSelectedProvider(u);
          }
        }}
        onOpenNewRequest={() => {
          setServiceStep('idle');
        }}
        onOpenRegister={() => setIsRegisterModalOpen(true)}
        onOpenFacialVerification={() => setIsFacialModalOpen(true)}
        onOpenDocVerification={() => setIsDocModalOpen(true)}
        onOpenMicroPage={handleOpenMicroPage}
        onOpenVercelModal={() => setIsVercelModalOpen(true)}
        onOpenNotifications={() => {
          setIsNotificationsOpen(true);
          setUnreadCount(0);
        }}
        unreadNotificationCount={unreadCount}
        onOpenFinanceModal={() => setIsFinanceModalOpen(true)}
        onOpenWarrantyModal={() => setIsWarrantyModalOpen(true)}
        onOpenCloudflareModal={() => setIsCloudflareModalOpen(true)}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
      />

      {/* Main Screen: Uber Map is the Primary Canvas */}
      <div className="relative flex-1 w-full h-full overflow-hidden">
        <UberMapView
          userLocation={{
            lat: -23.5617,
            lng: -46.6865,
            address: 'Rua Fradique Coutinho, 1240 - Pinheiros, SP'
          }}
          providers={providers}
          selectedCategory={selectedCategory}
          activeRequest={activeRequest}
          selectedProvider={selectedProvider}
          onSelectProviderPin={(p) => {
            setSelectedProvider(p);
            handleOpenMicroPage(p);
          }}
          onOpenStoreMaterials={(storeId) => setIsMaterialsModalOpen(true)}
          isRadarActive={serviceStep === 'radar'}
          providerDistanceKm={providerDistanceKm}
          providerEtaMinutes={providerEtaMinutes}
          serviceStep={serviceStep}
        />

        {/* Floating Dual-App Cloudflare Banner */}
        <div className="absolute top-4 left-4 z-20 hidden sm:flex items-center gap-2">
          <button
            onClick={() => setIsCloudflareModalOpen(true)}
            className="py-2 px-3.5 rounded-2xl bg-zinc-950/90 hover:bg-zinc-900 text-white backdrop-blur-md border border-amber-400/50 shadow-xl transition flex items-center gap-2 group cursor-pointer"
          >
            <span className="w-2.5 h-2.5 rounded-full bg-amber-400 animate-ping" />
            <span className="text-xs font-bold text-zinc-100">
              Arquitetura Dividida: <span className="text-amber-400">2 Apps Flutter</span> + <span className="text-sky-400">Cloudflare D1</span>
            </span>
            <span className="text-[10px] bg-amber-500/20 text-amber-300 font-extrabold px-2 py-0.5 rounded-md border border-amber-500/30">
              Ver Código & Deploy
            </span>
          </button>
        </div>

        {/* If Current User is Client: Show Uber Bottom Sheet */}
        {currentUser.role === 'client' ? (
          <UberBottomSheet
            serviceStep={serviceStep}
            selectedCategory={selectedCategory}
            onSelectCategory={setSelectedCategory}
            onRequestQuotes={handleRequestQuotes}
            activeRequest={activeRequest}
            onAcceptQuote={handleAcceptQuote}
            selectedProvider={selectedProvider}
            onOpenMicroPage={handleOpenMicroPage}
            onOpenChat={() => setIsChatOpen(true)}
            onOpenMaterialsModal={() => setIsMaterialsModalOpen(true)}
            onOpenWarrantyModal={() => setIsWarrantyModalOpen(true)}
            onOpenFeedbackModal={() => setIsFeedbackModalOpen(true)}
            serviceFeedback={activeRequest?.feedback}
            providerDistanceKm={providerDistanceKm}
            providerEtaMinutes={providerEtaMinutes}
            onSimulateArrival={handleSimulateArrival}
            onFinishService={handleFinishService}
            onResetToNewService={handleResetToNewService}
          />
        ) : (
          /* If Current User is Provider: Show Uber Driver Cockpit HUD */
          <UberDriverOverlay
            provider={currentUser}
            incomingRequests={requests}
            onSubmitQuote={handleProviderSubmitQuote}
            onOpenMicroPage={handleOpenMicroPage}
            onOpenChat={(req) => {
              setActiveRequestId(req.id);
              setIsChatOpen(true);
            }}
            onOpenFacialVerification={() => setIsFacialModalOpen(true)}
            onOpenDocVerification={() => setIsDocModalOpen(true)}
            onOpenMaterialsModal={() => setIsMaterialsModalOpen(true)}
            onOpenFinanceModal={() => setIsFinanceModalOpen(true)}
          />
        )}
      </div>

      {/* Materials & Partner Store Modal */}
      {isMaterialsModalOpen && (
        <MaterialsStoreModal
          isOpen={isMaterialsModalOpen}
          onClose={() => setIsMaterialsModalOpen(false)}
          materials={currentMaterials}
          onUpdateMaterials={(updated) => setCurrentMaterials(updated)}
          serviceTitle={activeRequest?.title || 'Troca de 4 lâmpadas e verificação de tomada'}
          providerName={selectedProvider?.name || currentUser.name}
          onConfirmMaterialsToQuote={(store, totalMaterials) => {
            setRequests((prev) =>
              prev.map((r) =>
                r.id === activeRequest.id
                  ? {
                      ...r,
                      materialsList: currentMaterials,
                      selectedStoreId: store.id,
                      selectedStoreName: store.name
                    }
                  : r
              )
            );
          }}
        />
      )}

      {/* Live Chat & Geolocation Tracking Modal */}
      {isChatOpen && activeRequest && (
        <ChatAndTrackingModal
          isOpen={isChatOpen}
          onClose={() => setIsChatOpen(false)}
          request={activeRequest}
          currentUser={currentUser}
          provider={selectedProvider || providers[0]}
          messages={messages[activeRequest.id] || []}
          onSendMessage={handleSendMessage}
          onUpdateStatus={(reqId, newStatus) => {
            setRequests((prev) =>
              prev.map((r) => (r.id === reqId ? { ...r, status: newStatus } : r))
            );
            if (newStatus === 'completed') {
              setServiceStep('completed');
              setIsFeedbackModalOpen(true);
            }
            if (newStatus === 'in_progress') setServiceStep('in_progress');
          }}
        />
      )}

      {/* Biometric Facial Verification Modal */}
      <FacialVerificationModal
        isOpen={isFacialModalOpen}
        onClose={() => setIsFacialModalOpen(false)}
        onSuccess={(photoUrl) => {
          setCurrentUser((prev) => ({
            ...prev,
            facialVerified: true,
            facialPhotoUrl: photoUrl,
            facialVerificationDate: new Date().toISOString().split('T')[0]
          }));
        }}
        userName={currentUser.name}
        role={currentUser.role}
      />

      {/* Document (RG/CNH) Verification Modal */}
      <DocumentVerificationModal
        isOpen={isDocModalOpen}
        onClose={() => setIsDocModalOpen(false)}
        onSuccess={(docType, docPhotoUrl) => {
          setCurrentUser((prev) => ({
            ...prev,
            documentVerified: true,
            documentType: docType,
            documentPhotoUrl: docPhotoUrl
          }));
        }}
        providerName={currentUser.name}
      />

      {/* Register New Profile Modal */}
      <RegisterModal
        isOpen={isRegisterModalOpen}
        onClose={() => setIsRegisterModalOpen(false)}
        onRegister={(newUser) => {
          if (newUser.role === 'provider') {
            setProviders((prev) => [newUser, ...prev]);
          }
          setCurrentUser(newUser);
        }}
        onTriggerFacial={() => setIsFacialModalOpen(true)}
        onTriggerDoc={() => setIsDocModalOpen(true)}
      />

      {/* Vercel & Database Status Modal */}
      <VercelDeployModal
        isOpen={isVercelModalOpen}
        onClose={() => setIsVercelModalOpen(false)}
      />

      {/* Web Push Notification Center Modal */}
      <NotificationCenterModal
        isOpen={isNotificationsOpen}
        onClose={() => {
          setIsNotificationsOpen(false);
          setUnreadCount(notificationService.getNotificationHistory().filter((n) => !n.read).length);
        }}
        userId={currentUser.id}
        userRole={currentUser.role}
        onSelectNotification={(item) => {
          setIsNotificationsOpen(false);
          if (item.data?.requestId) {
            setActiveRequestId(item.data.requestId);
          }
          if (item.type === 'chat_message') {
            setIsChatOpen(true);
          }
          if (item.type === 'quote_received' || item.type === 'quote_accepted') {
            setServiceStep('quotes');
          }
          if (item.type === 'materials_update') {
            setIsMaterialsModalOpen(true);
          }
        }}
      />

      {/* 1. Escrow PIX Payment Checkout Modal */}
      {isEscrowModalOpen && pendingQuoteToEscrow && (
        <EscrowPaymentModal
          isOpen={isEscrowModalOpen}
          onClose={() => {
            setIsEscrowModalOpen(false);
            setPendingQuoteToEscrow(null);
          }}
          quote={pendingQuoteToEscrow}
          clientName={currentUser.name}
          serviceTitle={activeRequest?.title || 'Serviço Express'}
          onPaymentSuccess={(escrowData: EscrowPayment) => {
            if (pendingQuoteToEscrow) {
              handleConfirmEscrowPayment(pendingQuoteToEscrow, escrowData);
            }
            setIsEscrowModalOpen(false);
            setPendingQuoteToEscrow(null);
          }}
        />
      )}

      {/* 2. Before & After Photo Log & 90-Day Digital Warranty */}
      <WarrantyAndBeforeAfterModal
        isOpen={isWarrantyModalOpen}
        onClose={() => setIsWarrantyModalOpen(false)}
        serviceTitle={activeRequest?.title || 'Serviço Residencial'}
        category={activeRequest?.category || selectedCategory}
        clientName={currentUser.role === 'client' ? currentUser.name : 'Ana Clara Souza'}
        providerName={selectedProvider?.name || 'Carlos Mendes'}
        providerDoc="MEI 38.912.441/0001-82"
        requestId={activeRequestId}
      />

      {/* 6. Provider Finance Cockpit & MEI Receipt Generator */}
      <ProviderFinanceModal
        isOpen={isFinanceModalOpen}
        onClose={() => setIsFinanceModalOpen(false)}
        provider={currentUser.role === 'provider' ? currentUser : selectedProvider || providers[0]}
      />

      {/* 7. Post-Service Feedback & Rating Modal */}
      {isFeedbackModalOpen && activeRequest && (
        <PostServiceFeedbackModal
          isOpen={isFeedbackModalOpen}
          onClose={() => setIsFeedbackModalOpen(false)}
          request={activeRequest}
          provider={selectedProvider || providers[0]}
          clientName={currentUser.role === 'client' ? currentUser.name : 'Ana Clara Souza'}
          clientAvatar={currentUser.avatar}
          existingFeedback={activeRequest.feedback}
          onSubmitFeedback={handleSubmitFeedback}
          onOpenWarrantyModal={() => {
            setIsFeedbackModalOpen(false);
            setIsWarrantyModalOpen(true);
          }}
          onOpenMicroPage={(prov) => {
            setIsFeedbackModalOpen(false);
            handleOpenMicroPage(prov);
          }}
        />
      )}

      {/* Cloudflare Workers & Flutter Dual App Hub Modal */}
      <CloudflareDualAppModal
        isOpen={isCloudflareModalOpen}
        onClose={() => setIsCloudflareModalOpen(false)}
      />
    </div>
  );
}
