export type UserRole = 'client' | 'provider';

export interface UserProfile {
  id: string;
  name: string;
  phone: string;
  email: string;
  role: UserRole;
  avatar: string;
  facialVerified: boolean;
  facialVerificationDate?: string;
  facialPhotoUrl?: string;
  documentVerified?: boolean;
  documentType?: 'RG' | 'CNH';
  documentPhotoUrl?: string;
  // Provider specific properties
  slug?: string;
  category?: string;
  specialtyTags?: string[];
  bio?: string;
  city?: string;
  neighborhood?: string;
  rating?: number;
  totalReviews?: number;
  completedJobsCount?: number;
  portfolioPhotos?: string[];
  basePriceNotice?: string;
  availableToday?: boolean;
  coordinates?: { lat: number; lng: number };
  tier?: 'bronze' | 'silver' | 'gold' | 'diamond';
  reviewsList?: ServiceFeedback[];
}

export type ProviderTier = 'bronze' | 'silver' | 'gold' | 'diamond';

export interface EscrowPayment {
  id: string;
  requestId: string;
  quoteId: string;
  totalAmount: number;
  laborAmount: number;
  materialsAmount: number;
  platformFee: number;
  providerNet: number;
  pixCode: string;
  status: 'pending' | 'in_escrow' | 'released_to_provider' | 'refunded';
  paidAt?: string;
  releasedAt?: string;
  securityPin: string;
}

export interface BeforeAfterRecord {
  beforePhotoUrl: string;
  afterPhotoUrl: string;
  notes?: string;
  completedAt: string;
}

export interface WarrantyCertificate {
  id: string;
  certificateCode: string;
  requestId: string;
  serviceTitle: string;
  category: string;
  clientName: string;
  providerName: string;
  providerDocument: string;
  issuedAt: string;
  validUntil: string;
  coverageDays: number;
  terms: string[];
  beforePhotoUrl?: string;
  afterPhotoUrl?: string;
  status: 'active' | 'expired';
}

export interface ProviderFinancialSummary {
  totalEarned: number;
  balanceInEscrow: number;
  availableForWithdraw: number;
  completedJobsCount: number;
  pixKey: string;
  recentTransactions: Array<{
    id: string;
    type: 'escrow_credit' | 'payout_pix' | 'materials_expense';
    title: string;
    amount: number;
    date: string;
    status: 'completed' | 'in_custody' | 'processing';
  }>;
}

export interface MaterialItem {
  id: string;
  name: string;
  quantity: number;
  unit: string;
  unitPrice: number;
  totalPrice: number;
  inStock: boolean;
  suggestedBrand?: string;
  selected: boolean;
}

export interface PartnerStore {
  id: string;
  name: string;
  category: string;
  address: string;
  distanceKm: number;
  etaMinutes: number;
  rating: number;
  reviewsCount: number;
  phone: string;
  whatsapp: string;
  discountPercent: number;
  mapPosition: { x: number; y: number };
  isOpenNow: boolean;
  pickupReadyMinutes: number;
}

export interface AiRequestAnalysis {
  category: string;
  serviceType: string;
  urgency: 'Baixa' | 'Média' | 'Alta';
  estimatedDuration: string;
  requiredTools: string[];
  materialsList?: MaterialItem[];
  materialsEstimatedTotal?: number;
  technicalSummary: string;
  priceRangeEstimate: string;
}

export interface ProviderQuote {
  id: string;
  requestId: string;
  providerId: string;
  providerName: string;
  providerAvatar: string;
  providerPhone: string;
  providerRating: number;
  providerJobsCount: number;
  providerFacialVerified: boolean;
  providerDocVerified: boolean;
  price: number; // Labor price
  materialsTotal?: number; // Materials price from partner store
  includeMaterials?: boolean;
  selectedStoreId?: string;
  selectedStoreName?: string;
  scheduledDate: string;
  scheduledTime: string;
  estimatedDuration: string;
  message: string;
  warrantyTerms: string;
  status: 'pending' | 'accepted' | 'declined';
  createdAt: string;
}

export type ServiceStatus =
  | 'open'
  | 'quotes_received'
  | 'accepted'
  | 'provider_en_route'
  | 'in_progress'
  | 'completed'
  | 'cancelled';

export interface ServiceRequest {
  id: string;
  clientId: string;
  clientName: string;
  clientPhone: string;
  clientAddress: string;
  clientCoordinates: { lat: number; lng: number };
  title: string;
  description: string;
  category: string;
  mediaType?: 'photo' | 'video' | 'audio' | 'none';
  mediaUrl?: string;
  audioBlobUrl?: string;
  aiAnalysis?: AiRequestAnalysis;
  status: ServiceStatus;
  createdAt: string;
  quotes: ProviderQuote[];
  selectedQuoteId?: string;
  directProviderId?: string; // Direct quote requested via micro-page
  materialsList?: MaterialItem[];
  selectedStoreId?: string;
  selectedStoreName?: string;
  feedback?: ServiceFeedback;
}

export interface ServiceFeedback {
  id: string;
  requestId: string;
  providerId: string;
  providerName: string;
  clientName: string;
  clientAvatar?: string;
  rating: number; // 1 to 5
  comment: string;
  tags?: string[];
  recommends?: boolean;
  aspectRatings?: {
    punctuality?: number;
    quality?: number;
    cleanliness?: number;
    communication?: number;
  };
  createdAt: string;
}

export interface ChatMessage {
  id: string;
  requestId: string;
  senderId: string;
  senderName: string;
  senderRole: 'client' | 'provider';
  text: string;
  timestamp: string;
  isLocationShare?: boolean;
  locationData?: { lat: number; lng: number; label: string };
  isSystemUpdate?: boolean;
}
