'use client';

import { useCallback, useEffect, useState } from 'react';
import { api } from '@/lib/api';
import { Card, Select } from '@portfolio/ui';
import { Mail, Trash2, AlertTriangle, CheckCircle2 } from 'lucide-react';
import type { ContactStatus, ContactSubmission } from '@portfolio/types';

const STATUSES: ContactStatus[] = ['NEW', 'READ', 'IN_PROGRESS', 'RESPONDED', 'ARCHIVED', 'SPAM'];

const STATUS_STYLE: Record<ContactStatus, string> = {
  NEW: 'bg-accent/20 text-ink',
  READ: 'bg-ink/10 text-ink/70',
  IN_PROGRESS: 'bg-blue-100 text-blue-800',
  RESPONDED: 'bg-green-100 text-green-800',
  ARCHIVED: 'bg-ink/10 text-ink/50',
  SPAM: 'bg-red-100 text-red-800',
};

export function InboxManager() {
  const [items, setItems] = useState<ContactSubmission[]>([]);
  const [filter, setFilter] = useState<'' | ContactStatus>('');
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(() => {
    setError(null);
    api.admin.contact
      .list()
      .then((data) => {
        const sorted = [...data].sort(
          (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
        );
        setItems(sorted);
      })
      .catch(() => setError('Could not load messages. Is the API running?'));
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  async function setStatus(id: string, status: ContactStatus) {
    try {
      await api.admin.contact.update(id, { status });
      refresh();
    } catch {
      setError('Could not update the message.');
    }
  }

  async function remove(id: string) {
    if (!window.confirm('Delete this message permanently?')) return;
    try {
      await api.admin.contact.remove(id);
      refresh();
    } catch {
      setError('Delete failed.');
    }
  }

  const visible = filter ? items.filter((item) => item.status === filter) : items;

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h1 className="font-display text-2xl font-semibold">Inbox</h1>
        <Select
          value={filter}
          onChange={(e) => setFilter(e.target.value as '' | ContactStatus)}
          className="max-w-[12rem]"
          aria-label="Filter by status"
        >
          <option value="">All messages</option>
          {STATUSES.map((status) => (
            <option key={status} value={status}>
              {status.replace('_', ' ')}
            </option>
          ))}
        </Select>
      </div>

      {error && <p className="mt-6 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p>}

      <div className="mt-8 space-y-4">
        {visible.length === 0 && !error && (
          <p className="text-sm text-ink/50">No messages{filter ? ` with status ${filter}` : ''} yet.</p>
        )}
        {visible.map((message) => (
          <Card key={message.id} className="p-6">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-3">
                  <span
                    className={`rounded-full px-2.5 py-0.5 font-mono text-[11px] uppercase tracking-wider ${STATUS_STYLE[message.status]}`}
                  >
                    {message.status.replace('_', ' ')}
                  </span>
                  <p className="font-medium">{message.name}</p>
                  <a href={`mailto:${message.email}`} className="text-sm text-accent hover:underline">
                    {message.email}
                  </a>
                </div>
                {message.organization ? (
                  <p className="mt-1 text-xs text-ink/50">{message.organization}</p>
                ) : null}
                {message.subject ? <p className="mt-3 font-medium">{message.subject}</p> : null}
                <p className="mt-2 max-w-3xl whitespace-pre-line text-sm text-ink/70">{message.message}</p>
                <p className="mt-3 font-mono text-[11px] uppercase tracking-wider text-ink/40">
                  {new Date(message.createdAt).toLocaleString('en-GB')}
                </p>
              </div>
              <div className="flex shrink-0 items-center gap-2">
                <Select
                  value={message.status}
                  onChange={(e) => setStatus(message.id, e.target.value as ContactStatus)}
                  className="w-40"
                  aria-label="Change status"
                >
                  {STATUSES.map((status) => (
                    <option key={status} value={status}>
                      {status.replace('_', ' ')}
                    </option>
                  ))}
                </Select>
                <button
                  onClick={() => remove(message.id)}
                  className="text-ink/40 hover:text-red-600"
                  aria-label="Delete message"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>

            <div className="mt-4 flex items-center gap-2 border-t border-ink/5 pt-3 text-xs">
              {message.notifiedAt ? (
                <span className="flex items-center gap-1.5 text-green-700">
                  <CheckCircle2 className="h-3.5 w-3.5" />
                  Notification accepted by provider
                </span>
              ) : message.notificationError ? (
                <span className="flex items-center gap-1.5 text-amber-700">
                  <AlertTriangle className="h-3.5 w-3.5" />
                  Notification not delivered: {message.notificationError}
                </span>
              ) : (
                <span className="flex items-center gap-1.5 text-ink/40">
                  <Mail className="h-3.5 w-3.5" />
                  Stored — no notification attempted
                </span>
              )}
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
