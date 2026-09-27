import webpush from 'web-push';
import { getSubscriptions, removeSubscriptionByEndpoint } from '../../src/lib/pushSubscriptions';

// VAPID keys for Web Push authentication
const DEFAULT_VAPID_PUBLIC_KEY =
  process.env.VAPID_PUBLIC_KEY ||
  'BOeorx--cQIFm7U2sJQb7p98K4hEE6wzz0ZdkC24_rg-3UpFHYovzzX-6XqM4c4xY0nYyU4zCes-Ee0Lreur-qA';

const DEFAULT_VAPID_PRIVATE_KEY =
  process.env.VAPID_PRIVATE_KEY || '2P5ZAeZa35ojz7jyGPmPez5guiDcko9pd5GgwBqDDxg';

const DEFAULT_VAPID_SUBJECT =
  process.env.VAPID_SUBJECT || 'mailto:suporte@proservicos.app';

try {
  webpush.setVapidDetails(
    DEFAULT_VAPID_SUBJECT,
    DEFAULT_VAPID_PUBLIC_KEY,
    DEFAULT_VAPID_PRIVATE_KEY
  );
} catch (e) {
  console.error('Failed to configure VAPID details:', e);
}

export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { targetUserId, targetRole, notification } = req.body || {};

    if (!notification || !notification.title || !notification.body) {
      return res.status(400).json({ error: 'Payload de notificação incompleto (requer title e body)' });
    }

    const matchedSubs = getSubscriptions(targetUserId, targetRole);

    const payload = JSON.stringify({
      title: notification.title,
      body: notification.body,
      icon: notification.icon || '/favicon.ico',
      badge: notification.badge || '/favicon.ico',
      tag: notification.tag || `proservicos-${Date.now()}`,
      data: notification.data || { url: '/' },
      actions: notification.actions || [
        { action: 'open', title: 'Ver Chamado' },
        { action: 'dismiss', title: 'Fechar' }
      ]
    });

    let sentCount = 0;
    let failureCount = 0;

    await Promise.all(
      matchedSubs.map(async (sub) => {
        try {
          await webpush.sendNotification(sub.subscription as any, payload);
          sentCount++;
        } catch (err: any) {
          failureCount++;
          // If status is 404 or 410, subscription is expired or cancelled
          if (err.statusCode === 404 || err.statusCode === 410) {
            removeSubscriptionByEndpoint(sub.subscription.endpoint);
          }
        }
      })
    );

    return res.status(200).json({
      success: true,
      sentCount,
      failureCount,
      totalMatched: matchedSubs.length,
      notification
    });
  } catch (error: any) {
    console.error('Send push error:', error);
    return res.status(500).json({ error: error.message || 'Erro ao enviar notificação push' });
  }
}
