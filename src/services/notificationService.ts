// Web Push Notification Client Service
export interface AppNotificationItem {
  id: string;
  title: string;
  body: string;
  type: 'quote_received' | 'quote_accepted' | 'service_status' | 'chat_message' | 'materials_update' | 'system';
  timestamp: string;
  read: boolean;
  data?: {
    requestId?: string;
    quoteId?: string;
    senderId?: string;
    storeId?: string;
    url?: string;
  };
}

const PUBLIC_VAPID_KEY =
  (import.meta as any).env?.VITE_VAPID_PUBLIC_KEY ||
  'BOeorx--cQIFm7U2sJQb7p98K4hEE6wzz0ZdkC24_rg-3UpFHYovzzX-6XqM4c4xY0nYyU4zCes-Ee0Lreur-qA';

const NOTIFICATIONS_STORAGE_KEY = 'proservicos_app_notifications_v1';
const PUSH_SUBSCRIBED_KEY = 'proservicos_push_subscribed_state';

// Convert URL-safe base64 to Uint8Array for pushManager.subscribe
function urlBase64ToUint8Array(base64String: string): Uint8Array {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);
  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

// Gentle pleasant alert tone using Web Audio API
export function playNotificationTone(): void {
  try {
    const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioCtx) return;
    const ctx = new AudioCtx();
    
    // Note 1 (E5 - 659Hz)
    const osc1 = ctx.createOscillator();
    const gain1 = ctx.createGain();
    osc1.type = 'sine';
    osc1.frequency.setValueAtTime(659.25, ctx.currentTime);
    gain1.gain.setValueAtTime(0.12, ctx.currentTime);
    gain1.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.18);
    osc1.connect(gain1);
    gain1.connect(ctx.destination);
    osc1.start(ctx.currentTime);
    osc1.stop(ctx.currentTime + 0.18);

    // Note 2 (B5 - 987Hz)
    const osc2 = ctx.createOscillator();
    const gain2 = ctx.createGain();
    osc2.type = 'sine';
    osc2.frequency.setValueAtTime(987.77, ctx.currentTime + 0.1);
    gain2.gain.setValueAtTime(0.15, ctx.currentTime + 0.1);
    gain2.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.35);
    osc2.connect(gain2);
    gain2.connect(ctx.destination);
    osc2.start(ctx.currentTime + 0.1);
    osc2.stop(ctx.currentTime + 0.35);
  } catch (e) {
    // Audio context may be restricted before user gesture
  }
}

export const notificationService = {
  isSupported(): boolean {
    return (
      typeof window !== 'undefined' &&
      'Notification' in window &&
      'serviceWorker' in navigator &&
      'PushManager' in window
    );
  },

  getPermission(): NotificationPermission {
    if (typeof window === 'undefined' || !('Notification' in window)) {
      return 'denied';
    }
    return Notification.permission;
  },

  async registerServiceWorker(): Promise<ServiceWorkerRegistration | null> {
    if (!this.isSupported()) return null;
    try {
      const reg = await navigator.serviceWorker.register('/sw.js', { scope: '/' });
      await navigator.serviceWorker.ready;
      return reg;
    } catch (err) {
      console.warn('Service worker registration failed:', err);
      return null;
    }
  },

  async getExistingSubscription(): Promise<PushSubscription | null> {
    if (!this.isSupported()) return null;
    try {
      const reg = await navigator.serviceWorker.ready;
      return await reg.pushManager.getSubscription();
    } catch {
      return null;
    }
  },

  async requestPermissionAndSubscribe(
    userId?: string,
    role?: 'client' | 'provider'
  ): Promise<{ success: boolean; subscription?: PushSubscription; error?: string }> {
    if (!this.isSupported()) {
      return { success: false, error: 'Web Push API não é suportada neste navegador' };
    }

    try {
      const permission = await Notification.requestPermission();
      if (permission !== 'granted') {
        return { success: false, error: 'Permissão de notificações não concedida' };
      }

      const reg = await this.registerServiceWorker();
      if (!reg) {
        return { success: false, error: 'Falha ao registrar Service Worker' };
      }

      let sub = await reg.pushManager.getSubscription();
      if (!sub) {
        const applicationServerKey = urlBase64ToUint8Array(PUBLIC_VAPID_KEY);
        sub = await reg.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: applicationServerKey as any
        });
      }

      // Synchronize subscription with backend / edge function
      const subJSON = sub.toJSON();
      try {
        await fetch('/api/notifications/subscribe', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            subscription: subJSON,
            userId,
            role,
            userAgent: navigator.userAgent
          })
        });
      } catch (e) {
        console.warn('Could not sync subscription to backend API:', e);
      }

      localStorage.setItem(PUSH_SUBSCRIBED_KEY, 'true');
      playNotificationTone();

      return { success: true, subscription: sub };
    } catch (err: any) {
      console.error('Push subscribe error:', err);
      return { success: false, error: err.message || 'Erro ao inscrever para notificações push' };
    }
  },

  // Dispatches alert via Web Push Edge endpoint + local notification fallback
  async triggerAlert(options: {
    title: string;
    body: string;
    type: AppNotificationItem['type'];
    targetUserId?: string;
    targetRole?: 'client' | 'provider' | 'all';
    data?: AppNotificationItem['data'];
  }): Promise<void> {
    const { title, body, type, targetUserId, targetRole, data } = options;

    // 1. Log to in-app notification center
    this.addNotificationItem({
      id: `notif-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      title,
      body,
      type,
      timestamp: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
      read: false,
      data
    });

    // 2. Play audio cue
    playNotificationTone();

    // 3. Vibration feedback on mobile
    if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
      try {
        navigator.vibrate([150, 80, 150]);
      } catch (e) {
        // Safe ignore
      }
    }

    // 4. Try sending to Web Push backend / Edge function
    try {
      await fetch('/api/notifications/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          targetUserId,
          targetRole,
          notification: {
            title,
            body,
            icon: '/favicon.ico',
            tag: `proservicos-${type}`,
            data: {
              ...data,
              url: '/'
            }
          }
        })
      });
    } catch (e) {
      // Ignore network fail
    }

    // 5. If browser permission is granted and document is currently hidden or active, show local notification
    if (typeof window !== 'undefined' && 'Notification' in window && Notification.permission === 'granted') {
      try {
        if ('serviceWorker' in navigator) {
          const reg = await navigator.serviceWorker.ready;
          reg.showNotification(title, {
            body,
            icon: '/favicon.ico',
            tag: `proservicos-${type}-${Date.now()}`,
            data: { ...data, url: '/' },
            renotify: true
          } as any);
        } else {
          new Notification(title, { body, icon: '/favicon.ico' });
        }
      } catch (err) {
        // Fallback or permission constraint
      }
    }
  },

  // In-app notification center history
  getNotificationHistory(): AppNotificationItem[] {
    if (typeof window === 'undefined') return [];
    try {
      const data = localStorage.getItem(NOTIFICATIONS_STORAGE_KEY);
      if (data) {
        return JSON.parse(data);
      }
    } catch {
      // Fallback
    }

    // Initial mock history
    const initial: AppNotificationItem[] = [
      {
        id: 'notif-init-1',
        title: 'Novo Orçamento Recebido',
        body: 'Carlos Mendes enviou um orçamento de R$ 90,00 para troca de lâmpadas.',
        type: 'quote_received',
        timestamp: '14:22',
        read: false
      },
      {
        id: 'notif-init-2',
        title: 'Prestador em Rota GPS',
        body: 'Carlos Mendes está a caminho do seu endereço. Previsão de chegada: 4 min.',
        type: 'service_status',
        timestamp: '14:35',
        read: false
      },
      {
        id: 'notif-init-3',
        title: 'Lista de Materiais IA Gerada',
        body: '4 itens estimados para compra com 12% OFF na loja parceira.',
        type: 'materials_update',
        timestamp: '14:20',
        read: true
      }
    ];
    return initial;
  },

  addNotificationItem(item: AppNotificationItem): void {
    const list = this.getNotificationHistory();
    const updated = [item, ...list].slice(0, 30); // keep last 30
    try {
      localStorage.setItem(NOTIFICATIONS_STORAGE_KEY, JSON.stringify(updated));
    } catch {
      // Ignore storage errors
    }
  },

  markAllAsRead(): AppNotificationItem[] {
    const list = this.getNotificationHistory().map((n) => ({ ...n, read: true }));
    try {
      localStorage.setItem(NOTIFICATIONS_STORAGE_KEY, JSON.stringify(list));
    } catch {
      // Ignore
    }
    return list;
  },

  clearHistory(): void {
    try {
      localStorage.removeItem(NOTIFICATIONS_STORAGE_KEY);
    } catch {
      // Ignore
    }
  }
};
