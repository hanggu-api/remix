export interface PushSubscriptionRecord {
  id: string;
  subscription: {
    endpoint: string;
    keys: {
      p256dh: string;
      auth: string;
    };
  };
  userId?: string;
  role?: 'client' | 'provider';
  userAgent?: string;
  createdAt: string;
}

// In-memory store for active push subscriptions (persisted across warm serverless container invocations)
const memorySubscriptions: PushSubscriptionRecord[] = [];

export function addSubscription(record: Omit<PushSubscriptionRecord, 'id' | 'createdAt'>): PushSubscriptionRecord {
  // Check if endpoint already registered
  const existingIdx = memorySubscriptions.findIndex(
    (s) => s.subscription.endpoint === record.subscription.endpoint
  );

  const now = new Date().toISOString();
  if (existingIdx >= 0) {
    memorySubscriptions[existingIdx] = {
      ...memorySubscriptions[existingIdx],
      userId: record.userId || memorySubscriptions[existingIdx].userId,
      role: record.role || memorySubscriptions[existingIdx].role,
      userAgent: record.userAgent || memorySubscriptions[existingIdx].userAgent,
      createdAt: now
    };
    return memorySubscriptions[existingIdx];
  }

  const newRecord: PushSubscriptionRecord = {
    ...record,
    id: `sub-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`,
    createdAt: now
  };

  memorySubscriptions.push(newRecord);
  return newRecord;
}

export function getSubscriptions(targetUserId?: string, targetRole?: 'client' | 'provider' | 'all'): PushSubscriptionRecord[] {
  let list = memorySubscriptions;

  if (targetUserId) {
    list = list.filter((s) => s.userId === targetUserId);
  }

  if (targetRole && targetRole !== 'all') {
    list = list.filter((s) => !s.role || s.role === targetRole);
  }

  return list;
}

export function removeSubscriptionByEndpoint(endpoint: string): void {
  const idx = memorySubscriptions.findIndex((s) => s.subscription.endpoint === endpoint);
  if (idx >= 0) {
    memorySubscriptions.splice(idx, 1);
  }
}
