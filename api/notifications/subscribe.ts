import { addSubscription } from '../../src/lib/pushSubscriptions';

export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { subscription, userId, role, userAgent } = req.body || {};

    if (!subscription || !subscription.endpoint || !subscription.keys) {
      return res.status(400).json({ error: 'Invalid push subscription payload' });
    }

    const saved = addSubscription({
      subscription,
      userId,
      role,
      userAgent: userAgent || req.headers['user-agent']
    });

    return res.status(200).json({
      success: true,
      message: 'Notificações Push registradas com sucesso no servidor!',
      id: saved.id
    });
  } catch (error: any) {
    console.error('Push subscribe error:', error);
    return res.status(500).json({ error: error.message || 'Erro ao salvar inscrição push' });
  }
}
