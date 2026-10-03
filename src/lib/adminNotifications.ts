import { useEffect, useMemo, useState, useCallback } from 'react';

export type AdminNotificationKind = 'job' | 'payment' | 'cv';

export interface AdminNotification {
  id: string;
  kind: AdminNotificationKind;
  title: string;
  body: string;
  createdAt: string;
  link: string;
  refId: string;
}

const WINDOW_DAYS = 30;
const NEW_HOURS = 24;

function companyName(employers: any[], id: string) {
  return employers.find((e: any) => e.id === id)?.company_name || 'Unknown employer';
}

export function buildAdminNotifications(data: {
  jobs: any[];
  employers: any[];
  cvRequests: any[];
}): AdminNotification[] {
  const cutoff = Date.now() - WINDOW_DAYS * 24 * 60 * 60 * 1000;
  const items: AdminNotification[] = [];

  data.jobs.forEach((job: any) => {
    const employer = companyName(data.employers, job.employer_id);
    if (job.created_at && new Date(job.created_at).getTime() >= cutoff) {
      items.push({
        id: `job-${job.id}`,
        kind: 'job',
        title: `New job posted: ${job.job_title}`,
        body: `${employer} · ${job.city || 'Location not set'} · status ${job.status}`,
        createdAt: job.created_at,
        link: `/admin/notifications/job-${job.id}`,
        refId: job.id,
      });
    }
    if (job.payment_status === 'paid' && job.updated_at && new Date(job.updated_at).getTime() >= cutoff) {
      items.push({
        id: `pay-${job.id}`,
        kind: 'payment',
        title: `Payment submitted for ${job.job_title}`,
        body: `${employer} · awaiting verification`,
        createdAt: job.updated_at,
        link: `/admin/notifications/pay-${job.id}`,
        refId: job.id,
      });
    }
  });

  data.cvRequests.forEach((req: any) => {
    if (!req.created_at || new Date(req.created_at).getTime() < cutoff) return;
    const employer = companyName(data.employers, req.employer_id);
    const total = Math.round(Number(req.amount || 0) * 1.18);
    items.push({
      id: `cv-${req.id}`,
      kind: 'cv',
      title: `New CV request · ${req.plan_label}`,
      body: `${employer} · ₹${total.toLocaleString()} incl. GST · ${req.status}`,
      createdAt: req.created_at,
      link: `/admin/notifications/cv-${req.id}`,
      refId: req.id,
    });
  });

  return items.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
}

export function isNewNotification(n: AdminNotification) {
  return Date.now() - new Date(n.createdAt).getTime() < NEW_HOURS * 60 * 60 * 1000;
}

const CHANGE_EVENT = 'rojgaarhai-admin-notif-change';
const storageKey = (userId: string) => `rojgaarhai_admin_notif_read_${userId}`;

function loadRead(userId: string): Record<string, string> {
  try {
    return JSON.parse(localStorage.getItem(storageKey(userId)) || '{}');
  } catch {
    return {};
  }
}

/**
 * Read state lives per admin in localStorage (this device). Map of id -> readAt.
 */
export function useAdminNotifications(userId: string | undefined, source: { jobs: any[]; employers: any[]; cvRequests: any[] }) {
  const [readMap, setReadMap] = useState<Record<string, string>>({});

  useEffect(() => {
    if (!userId) return;
    setReadMap(loadRead(userId));
    const sync = () => setReadMap(loadRead(userId));
    window.addEventListener(CHANGE_EVENT, sync);
    return () => window.removeEventListener(CHANGE_EVENT, sync);
  }, [userId]);

  const persist = useCallback((next: Record<string, string>) => {
    setReadMap(next);
    if (userId) {
      try { localStorage.setItem(storageKey(userId), JSON.stringify(next)); } catch { /* storage full/blocked */ }
      window.dispatchEvent(new Event(CHANGE_EVENT));
    }
  }, [userId]);

  const items = useMemo(() => buildAdminNotifications(source), [source.jobs, source.employers, source.cvRequests]);

  const isRead = useCallback((id: string) => Boolean(readMap[id]), [readMap]);
  const markRead = useCallback((id: string) => {
    if (readMap[id]) return;
    persist({ ...readMap, [id]: new Date().toISOString() });
  }, [readMap, persist]);
  const markUnread = useCallback((id: string) => {
    if (!readMap[id]) return;
    const next = { ...readMap };
    delete next[id];
    persist(next);
  }, [readMap, persist]);
  const markAllRead = useCallback(() => {
    const next = { ...readMap };
    items.forEach(n => { if (!next[n.id]) next[n.id] = new Date().toISOString(); });
    persist(next);
  }, [items, readMap, persist]);

  const unreadCount = items.filter(n => !readMap[n.id]).length;

  return { items, isRead, markRead, markUnread, markAllRead, unreadCount };
}
