import React from 'react';
import {
  Wrench,
  ShieldCheck,
  PlusCircle,
  UserCheck,
  Users,
  Search,
  ExternalLink,
  ChevronDown,
  Sparkles,
  Bell,
  Wallet,
  Award
} from 'lucide-react';
import { UserProfile } from '../types';
import { PROVIDER_TIERS_CONFIG } from '../data/mockData';

interface NavbarProps {
  currentUser: UserProfile;
  providers: UserProfile[];
  onSelectUser: (user: UserProfile) => void;
  onOpenNewRequest: () => void;
  onOpenRegister: () => void;
  onOpenFacialVerification: () => void;
  onOpenDocVerification: () => void;
  onOpenMicroPage: (provider: UserProfile) => void;
  onOpenVercelModal?: () => void;
  onOpenNotifications?: () => void;
  unreadNotificationCount?: number;
  onOpenFinanceModal?: () => void;
  onOpenWarrantyModal?: () => void;
  onOpenGeminiChat?: () => void;
  onOpenCloudflareModal?: () => void;
  firebaseUser?: any;
  onGoogleSignIn?: () => void;
  onGoogleSignOut?: () => void;
  isFirestoreConnected?: boolean;
  searchQuery: string;
  onSearchChange: (q: string) => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentUser,
  providers,
  onSelectUser,
  onOpenNewRequest,
  onOpenRegister,
  onOpenFacialVerification,
  onOpenDocVerification,
  onOpenMicroPage,
  onOpenVercelModal,
  onOpenNotifications,
  unreadNotificationCount = 0,
  onOpenFinanceModal,
  onOpenWarrantyModal,
  onOpenGeminiChat,
  onOpenCloudflareModal,
  firebaseUser,
  onGoogleSignIn,
  onGoogleSignOut,
  isFirestoreConnected = true,
  searchQuery,
  onSearchChange
}) => {
  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-zinc-200/80 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-4">
          {/* Logo & Brand */}
          <div className="flex items-center gap-3 shrink-0">
            <div className="w-10 h-10 rounded-xl bg-zinc-950 text-sky-400 border border-zinc-800 flex items-center justify-center font-black shadow-xs">
              <Wrench className="w-5 h-5" />
            </div>
            <div>
              <span className="text-base font-extrabold text-zinc-950 tracking-tight flex items-center gap-1.5">
                ProServiços
                <span className="text-[10px] uppercase font-bold px-1.5 py-0.5 rounded-md bg-zinc-100 text-zinc-700 border border-zinc-200">
                  Verificado
                </span>
              </span>
              <p className="text-[10px] text-zinc-500 font-medium hidden sm:block">
                Orçamentos com Validação Facial & Micropáginas
              </p>
            </div>
          </div>

          {/* Search Input (Filters services & providers) */}
          <div className="flex-1 max-w-md hidden md:block">
            <div className="relative">
              <Search className="w-4 h-4 text-zinc-400 absolute left-3 top-2.5" />
              <input
                type="text"
                placeholder="Buscar serviço (ex: trocar lâmpada, cortar grama, vazamento)..."
                value={searchQuery}
                onChange={(e) => onSearchChange(e.target.value)}
                className="w-full pl-9 pr-4 py-2 rounded-xl bg-zinc-50 border border-zinc-200 text-xs focus:bg-white focus:outline-none focus:ring-2 focus:ring-sky-400/40 focus:border-sky-400 text-zinc-800 transition"
              />
            </div>
          </div>

          {/* Right Action & User Profile Switcher */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Real-time Web Push Notifications Bell */}
            {onOpenNotifications && (
              <button
                id="btn-open-notifications"
                onClick={onOpenNotifications}
                className="relative p-2 rounded-xl bg-zinc-100 hover:bg-zinc-200 text-zinc-700 hover:text-zinc-900 transition flex items-center justify-center border border-zinc-200/60"
                title="Central de Notificações Web Push"
              >
                <Bell className="w-4 h-4" />
                {unreadNotificationCount > 0 && (
                  <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 bg-sky-500 text-white text-[10px] font-black rounded-full flex items-center justify-center shadow-xs">
                    {unreadNotificationCount > 9 ? '9+' : unreadNotificationCount}
                  </span>
                )}
              </button>
            )}

            {/* Provider Finance Mini-ERP button */}
            {currentUser.role === 'provider' && onOpenFinanceModal && (
              <button
                id="btn-open-finance"
                onClick={onOpenFinanceModal}
                className="py-1.5 px-2.5 rounded-xl bg-sky-50 hover:bg-sky-100 text-sky-950 border border-sky-200 font-semibold text-xs transition flex items-center gap-1.5 shadow-2xs"
                title="Cockpit Financeiro MEI & Saque PIX"
              >
                <Wallet className="w-3.5 h-3.5 text-sky-600" />
                <span className="hidden sm:inline">Financeiro MEI</span>
              </button>
            )}

            {/* Digital Warranty 90-day button */}
            {onOpenWarrantyModal && (
              <button
                id="btn-open-warranty"
                onClick={onOpenWarrantyModal}
                className="py-1.5 px-2.5 rounded-xl bg-sky-50 hover:bg-sky-100 text-sky-950 border border-sky-200 font-semibold text-xs transition flex items-center gap-1.5 shadow-2xs"
                title="Garantia 90 Dias & Laudo Antes/Depois"
              >
                <Award className="w-3.5 h-3.5 text-sky-600" />
                <span className="hidden sm:inline">Garantia 90D</span>
              </button>
            )}

            {/* Vercel & Database Status Button */}
            {onOpenVercelModal && (
              <button
                onClick={onOpenVercelModal}
                className="py-1.5 px-2.5 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-white font-semibold text-xs shadow-2xs transition flex items-center gap-1.5 border border-zinc-700"
                title="Configurações de Deploy e Banco de Dados Vercel"
              >
                <span className="font-mono text-[11px] text-sky-300">▲</span>
                <span className="hidden sm:inline">Vercel & BD</span>
              </button>
            )}

            {/* Cloudflare Workers & Flutter Dual App Button */}
            {onOpenCloudflareModal && (
              <button
                id="btn-open-cloudflare-modal"
                onClick={onOpenCloudflareModal}
                className="py-1.5 px-3 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white font-black text-xs transition flex items-center gap-1.5 shadow-sm border border-amber-400/40"
                title="Visualizar Apps Flutter (Cliente e Prestador) & Backend Cloudflare Workers/D1"
              >
                <span className="text-[13px]">☁️</span>
                <span className="hidden md:inline">2 Apps Flutter + Cloudflare</span>
                <span className="md:hidden">Cloudflare</span>
              </button>
            )}

            {/* Gemini IA Chatbot Button */}
            {onOpenGeminiChat && (
              <button
                id="btn-open-gemini-chat"
                onClick={onOpenGeminiChat}
                className="py-1.5 px-3 rounded-xl bg-sky-100 hover:bg-sky-200 text-sky-950 border border-sky-300/80 font-bold text-xs transition flex items-center gap-1.5 shadow-2xs"
                title="Assistente Técnico Gemini IA com Google Maps & Voz"
              >
                <Sparkles className="w-3.5 h-3.5 text-sky-600" />
                <span>IA Gemini</span>
              </button>
            )}

            {/* Google Sign-in with Firebase Auth */}
            {firebaseUser ? (
              <div className="flex items-center gap-2 pl-1 border-l border-zinc-200">
                <img
                  src={firebaseUser.photoURL || currentUser.avatar}
                  alt={firebaseUser.displayName || 'Google User'}
                  className="w-8 h-8 rounded-full border-2 border-emerald-500 object-cover"
                />
                <button
                  onClick={onGoogleSignOut}
                  className="py-1 px-2 text-[11px] font-semibold text-zinc-600 hover:text-rose-600 bg-zinc-100 hover:bg-rose-50 rounded-lg transition"
                  title="Sair do Google"
                >
                  Sair
                </button>
              </div>
            ) : onGoogleSignIn ? (
              <button
                id="btn-google-signin"
                onClick={onGoogleSignIn}
                className="py-1.5 px-2.5 rounded-xl bg-white hover:bg-zinc-50 text-zinc-700 border border-zinc-300 font-semibold text-xs shadow-2xs transition flex items-center gap-1.5"
                title="Conectar com conta Google via Firebase Auth"
              >
                <svg className="w-3.5 h-3.5" viewBox="0 0 24 24">
                  <path
                    fill="#4285F4"
                    d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.8-2.4 3.65v3.05h3.9c2.28-2.1 3.645-5.2 3.645-9.14z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.9-3.05c-1.08.72-2.45 1.16-4.03 1.16-3.1 0-5.73-2.1-6.67-4.93H1.28v3.13C3.26 21.29 7.34 24 12 24z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.33 14.27c-.24-.72-.38-1.49-.38-2.27s.14-1.55.38-2.27V6.6H1.28C.46 8.22 0 10.05 0 12s.46 3.78 1.28 5.4l4.05-3.13z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.34 0 3.26 2.71 1.28 6.6l4.05 3.13c.94-2.83 3.57-4.98 6.67-4.98z"
                  />
                </svg>
                <span className="hidden sm:inline">Google Login</span>
              </button>
            ) : null}

            {/* New Request Button - Light Blue */}
            <button
              onClick={onOpenNewRequest}
              className="py-2 px-3.5 rounded-xl bg-sky-400 hover:bg-sky-500 text-zinc-950 font-bold text-xs shadow-xs transition flex items-center gap-1.5"
            >
              <PlusCircle className="w-4 h-4" />
              <span className="hidden sm:inline">Pedir Orçamento</span>
            </button>

            {/* User Switcher Dropdown */}
            <div className="flex items-center gap-2 pl-2 border-l border-zinc-200">
              <div className="text-right hidden sm:block">
                <span className="text-xs font-bold text-zinc-900 block truncate max-w-[120px]">
                  {currentUser.name}
                </span>
                <span className="text-[10px] font-semibold text-zinc-700 bg-zinc-100 border border-zinc-200/80 px-1.5 py-0.2 rounded">
                  {currentUser.role === 'client' ? 'Cliente' : `Prestador (${currentUser.category})`}
                </span>
              </div>

              {/* Selector */}
              <select
                value={currentUser.id}
                onChange={(e) => {
                  const found = providers.find((p) => p.id === e.target.value);
                  if (found) onSelectUser(found);
                  else if (e.target.value === 'new_user') onOpenRegister();
                  else {
                    // Client Ana
                    onSelectUser({
                      id: 'client-1',
                      name: 'Ana Clara Souza',
                      phone: '(11) 98765-4321',
                      email: 'ana.souza@exemplo.com',
                      role: 'client',
                      avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80',
                      facialVerified: true,
                      facialVerificationDate: '2026-03-10'
                    });
                  }
                }}
                className="py-1.5 px-2 rounded-xl bg-slate-100 hover:bg-slate-200 border border-slate-200 text-xs font-semibold text-slate-800 cursor-pointer focus:outline-none"
              >
                <option value="client-1">👤 Visão: Cliente Ana (Pedir/Comparar)</option>
                <optgroup label="Prestadores Cadastrados:">
                  {providers.map((p) => (
                    <option key={p.id} value={p.id}>
                      🔧 Visão: {p.name} ({p.category})
                    </option>
                  ))}
                </optgroup>
                <option value="new_user">➕ Cadastrar Novo Perfil</option>
              </select>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};
