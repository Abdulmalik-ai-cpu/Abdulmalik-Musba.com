'use client';

import { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import type { AuditRecordSummary, Paginated } from '@portfolio/types';

export default function AuditPage() {
  const [logs, setLogs] = useState<AuditRecordSummary[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [pageSize] = useState(20);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    api.admin.audit
      .list({ page, pageSize })
      .then((data: Paginated<AuditRecordSummary>) => {
        setLogs(data.items);
        setTotal(data.total);
      })
      .catch(() => setError('Could not load audit logs. Is the API running?'));
  }, [page, pageSize]);

  const totalPages = Math.max(1, Math.ceil(total / pageSize));

  return (
    <div>
      <h1 className="font-display text-2xl font-semibold">Audit log</h1>
      <p className="mt-1 text-sm text-ink/50">Every administrative action, immutably recorded.</p>

      {error && <p className="mt-6 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p>}

      <div className="mt-8 overflow-hidden rounded-2xl border border-ink/10">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-ink/10 bg-ink/5">
            <tr>
              <th className="px-4 py-3 font-mono text-xs uppercase tracking-widest text-ink/50">When</th>
              <th className="px-4 py-3 font-mono text-xs uppercase tracking-widest text-ink/50">Action</th>
              <th className="px-4 py-3 font-mono text-xs uppercase tracking-widest text-ink/50">Entity</th>
              <th className="px-4 py-3 font-mono text-xs uppercase tracking-widest text-ink/50">Admin</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-ink/5">
            {logs.map((log) => (
              <tr key={log.id}>
                <td className="whitespace-nowrap px-4 py-3 font-mono text-xs text-ink/60">
                  {new Date(log.createdAt).toLocaleString('en-GB', {
                    day: '2-digit',
                    month: 'short',
                    year: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </td>
                <td className="px-4 py-3">
                  <span className="rounded-full bg-ink/5 px-2.5 py-1 font-mono text-xs uppercase tracking-wider">
                    {log.action}
                  </span>
                </td>
                <td className="px-4 py-3 text-ink/70">
                  {log.entity ? `${log.entity}${log.entityId ? ` (${log.entityId.slice(0, 8)}…)` : ''}` : '—'}
                </td>
                <td className="px-4 py-3 text-ink/70">{log.adminUserEmail ?? '—'}</td>
              </tr>
            ))}
            {logs.length === 0 && !error && (
              <tr>
                <td colSpan={4} className="px-4 py-8 text-center text-ink/40">
                  No audit events recorded yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <div className="mt-6 flex items-center justify-between text-sm">
        <p className="text-ink/50">
          Page {page} of {totalPages} · {total} events
        </p>
        <div className="flex gap-3">
          <button
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page <= 1}
            className="rounded-lg border border-ink/15 px-4 py-2 transition-colors hover:border-ink disabled:opacity-40"
          >
            Previous
          </button>
          <button
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={page >= totalPages}
            className="rounded-lg border border-ink/15 px-4 py-2 transition-colors hover:border-ink disabled:opacity-40"
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
}