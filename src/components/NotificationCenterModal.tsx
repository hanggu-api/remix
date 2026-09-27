import React, { useState, useEffect } from 'react';
import {
  Bell,
  CheckCircle,
  Clock,
  MessageSquare,
  DollarSign,
  ShoppingBag,
  Navigation,
  X,
  Send,
  ShieldCheck,
  Check,
  Trash2,
  Volume2,
  Sparkles
} from 'lucide-react';
import {
  notificationService,
  AppNotificationItem,
  playNotificationTone
} from '../services/notificationService';

interface NotificationCenterModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectNotification?: (item: AppNotificationItem) => void;
  userId?: string;
  userRole?: 'client' | 'provider';
}

export const NotificationCenterModal: React.FC<NotificationCenterModalProps> = ({
  isOpen,
  onClose,
  onSelectNotification,
  userId,
  userRole
}) => {
  const [notifications, setNotifications] = useState<AppNotificationItem[]>([]);
  const [permissionState, setPermissionState] = useState<NotificationPermission>('default');
  const [isSubscribing, setIsSubscribing] = useState(false);
  const [isTesting, setIsTesting] = useState(false);
  const [activeFilter, setActiveFilter] = useState<'all' | 'quotes' | 'status' | 'chat'>('all');
  const [feedbackMsg, setFeedbackMsg] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      setNotifications(notificationService.getNotificationHistory());
      setPermissionState(notificationService.getPermission());
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleEnablePush = async () => {
    setIsSubscribing(true);
    setFeedbackMsg(null);
    try {
      const res = await notificationService.requestPermissionAndSubscribe(userId, userRole);
      setPermissionState(notificationService.getPermission());
      if (res.success) {
        setFeedbackMsg('✅ Notificações Push ativadas com sucesso!');
        setNotifications(notificationService.getNotificationHistory());
      } else {
        setFeedbackMsg(`⚠️ ${res.error || 'Não foi possível ativar as notificações'}`);
      }
    } finally {
      setIsSubscribing(false);
    }
  };

  const handleSendTestNotification = async () => {
    setIsTesting(true);
    playNotificationTone();
    try {
      await notificationService.triggerAlert({
        title: '🔔 Teste de Notificação Web Push',
        body: 'O serviço de notificações em tempo real está 100% ativo e sincronizado com o Edge!',
        type: 'system',
        targetUserId: userId,
        targetRole: userRole,
        data: { url: '/' }
      });
      setNotifications(notificationService.getNotificationHistory());
      setFeedbackMsg('🚀 Alerta disparado com sucesso via Web Push!');
    } finally {
      setIsTesting(false);
    }
  };

  const handleMarkAllRead = () => {
    const updated = notificationService.markAllAsRead();
    setNotifications(updated);
  };

  const handleClear = () => {
    notificationService.clearHistory();
    setNotifications([]);
  };

  const filteredNotifications = notifications.filter((item) => {
    if (activeFilter === 'quotes') return item.type === 'quote_received' || item.type === 'quote_accepted';
    if (activeFilter === 'status') return item.type === 'service_status';
    if (activeFilter === 'chat') return item.type === 'chat_message';
    return true;
  });

  const getIconForType = (type: AppNotificationItem['type']) => {
    switch (type) {
      case 'quote_received':
      case 'quote_accepted':
        return <DollarSign className="w-5 h-5 text-emerald-600" />;
      case 'service_status':
        return <Navigation className="w-5 h-5 text-blue-600" />;
      case 'chat_message':
        return <MessageSquare className="w-5 h-5 text-indigo-600" />;
      case 'materials_update':
        return <ShoppingBag className="w-5 h-5 text-amber-600" />;
      default:
        return <Bell className="w-5 h-5 text-slate-600" />;
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
      <div
        id="notification-center-modal"
        className="relative w-full max-w-xl bg-white rounded-2xl shadow-2xl border border-slate-100 overflow-hidden flex flex-col max-h-[90vh] animate-in fade-in zoom-in-95 duration-200"
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/80">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-50 flex items-center justify-center text-indigo-600 border border-indigo-100">
              <Bell className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                Central de Notificações
                <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-indigo-100 text-indigo-700">
                  Web Push API
                </span>
              </h2>
              <p className="text-xs text-slate-500">
                Alertas em tempo real sobre orçamentos, status e mensagens
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-200/50 rounded-full transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Web Push Status & Fast Activation Banner */}
        <div className="p-4 bg-gradient-to-r from-indigo-50/70 via-blue-50/40 to-slate-50 border-b border-slate-100">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-start gap-2.5">
              <div
                className={`w-3 h-3 rounded-full mt-1 shrink-0 ${
                  permissionState === 'granted'
                    ? 'bg-emerald-500 animate-pulse'
                    : permissionState === 'denied'
                    ? 'bg-rose-500'
                    : 'bg-amber-400'
                }`}
              />
              <div>
                <p className="text-sm font-semibold text-slate-800">
                  {permissionState === 'granted'
                    ? 'Notificações Push Ativas no Navegador'
                    : permissionState === 'denied'
                    ? 'Permissão de Push Bloqueada no Navegador'
                    : 'Permissão de Notificação Pendente'}
                </p>
                <p className="text-xs text-slate-500">
                  {permissionState === 'granted'
                    ? 'Receba alertas sonoros e na tela mesmo com o app em segundo plano.'
                    : 'Ative para receber avisos instantâneos quando prestadores enviarem propostas.'}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
              {permissionState !== 'granted' ? (
                <button
                  onClick={handleEnablePush}
                  disabled={isSubscribing}
                  className="px-3.5 py-1.5 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-sm transition-all flex items-center gap-1.5 disabled:opacity-50"
                >
                  <Bell className="w-3.5 h-3.5" />
                  {isSubscribing ? 'Ativando...' : 'Ativar Web Push'}
                </button>
              ) : (
                <button
                  onClick={handleSendTestNotification}
                  disabled={isTesting}
                  className="px-3 py-1.5 text-xs font-bold text-indigo-700 bg-white hover:bg-indigo-50 border border-indigo-200 rounded-lg shadow-xs transition-all flex items-center gap-1.5 disabled:opacity-50"
                >
                  <Send className="w-3 h-3" />
                  {isTesting ? 'Disparando...' : 'Testar Alerta'}
                </button>
              )}
            </div>
          </div>

          {feedbackMsg && (
            <div className="mt-2 text-xs font-medium text-slate-700 bg-white/80 p-2 rounded-lg border border-slate-200/60 animate-in fade-in">
              {feedbackMsg}
            </div>
          )}
        </div>

        {/* Filter Pills & Actions */}
        <div className="flex items-center justify-between px-6 py-2.5 bg-white border-b border-slate-100 text-xs text-slate-600">
          <div className="flex items-center gap-1.5 overflow-x-auto">
            <button
              onClick={() => setActiveFilter('all')}
              className={`px-2.5 py-1 rounded-full font-medium transition-colors ${
                activeFilter === 'all'
                  ? 'bg-slate-900 text-white'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              Todas ({notifications.length})
            </button>
            <button
              onClick={() => setActiveFilter('quotes')}
              className={`px-2.5 py-1 rounded-full font-medium transition-colors ${
                activeFilter === 'quotes'
                  ? 'bg-emerald-600 text-white'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              Orçamentos
            </button>
            <button
              onClick={() => setActiveFilter('status')}
              className={`px-2.5 py-1 rounded-full font-medium transition-colors ${
                activeFilter === 'status'
                  ? 'bg-blue-600 text-white'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              Status / GPS
            </button>
            <button
              onClick={() => setActiveFilter('chat')}
              className={`px-2.5 py-1 rounded-full font-medium transition-colors ${
                activeFilter === 'chat'
                  ? 'bg-indigo-600 text-white'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              Chat
            </button>
          </div>

          <div className="flex items-center gap-2">
            {notifications.some((n) => !n.read) && (
              <button
                onClick={handleMarkAllRead}
                className="hover:text-indigo-600 transition-colors flex items-center gap-1 text-[11px]"
                title="Marcar todas como lidas"
              >
                <Check className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Lidas</span>
              </button>
            )}
            {notifications.length > 0 && (
              <button
                onClick={handleClear}
                className="hover:text-rose-600 transition-colors p-1"
                title="Limpar notificações"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>

        {/* Notifications Scroll List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-2.5 divide-y divide-slate-100">
          {filteredNotifications.length === 0 ? (
            <div className="text-center py-12 text-slate-400">
              <Bell className="w-10 h-10 mx-auto mb-2 opacity-30" />
              <p className="text-sm font-medium text-slate-500">Nenhuma notificação no momento</p>
              <p className="text-xs text-slate-400">
                Novos orçamentos e mensagens aparecerão automaticamente aqui.
              </p>
            </div>
          ) : (
            filteredNotifications.map((item) => (
              <div
                key={item.id}
                onClick={() => onSelectNotification?.(item)}
                className={`pt-2.5 first:pt-0 flex items-start gap-3 p-3 rounded-xl transition-all cursor-pointer ${
                  !item.read
                    ? 'bg-indigo-50/40 border border-indigo-100/60'
                    : 'hover:bg-slate-50 border border-transparent'
                }`}
              >
                <div className="p-2 rounded-lg bg-white shadow-xs border border-slate-100 shrink-0">
                  {getIconForType(item.type)}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <h3
                      className={`text-sm truncate ${
                        !item.read ? 'font-bold text-slate-900' : 'font-medium text-slate-700'
                      }`}
                    >
                      {item.title}
                    </h3>
                    <span className="text-[11px] text-slate-400 shrink-0 flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {item.timestamp}
                    </span>
                  </div>
                  <p className="text-xs text-slate-600 mt-0.5 line-clamp-2 leading-relaxed">
                    {item.body}
                  </p>
                </div>

                {!item.read && (
                  <span className="w-2 h-2 rounded-full bg-indigo-600 mt-2 shrink-0" />
                )}
              </div>
            ))
          )}
        </div>

        {/* Footer info about Edge Function */}
        <div className="p-3 bg-slate-50 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
          <div className="flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span>Integrado com Vercel Edge Function & VAPID</span>
          </div>
          <button
            onClick={() => {
              playNotificationTone();
            }}
            className="hover:text-slate-800 flex items-center gap-1 transition-colors"
          >
            <Volume2 className="w-3.5 h-3.5" />
            <span>Testar Som</span>
          </button>
        </div>
      </div>
    </div>
  );
};
