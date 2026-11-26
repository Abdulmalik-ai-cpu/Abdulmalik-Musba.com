'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { api } from '@/lib/api';
import { Button, Card, Input, Label, Select, Textarea } from '@portfolio/ui';
import {
  blankEntityForm,
  createSubmissionGuard,
  describeApiError,
  ENTITY_API_KEY,
  ENTITY_FIELD_DEFS,
  ENTITY_LABELS,
  normalizeEntityPayload,
} from '@portfolio/utils';
import { Plus, Save, Trash2, Eye, EyeOff, Pencil } from 'lucide-react';

interface Row {
  id: string;
  [key: string]: unknown;
}

export function EntityManager({ entity }: { entity: string }) {
  const [rows, setRows] = useState<Row[]>([]);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [editing, setEditing] = useState<Row | null>(null);
  const [form, setForm] = useState<Record<string, unknown>>({});
  const [display, setDisplay] = useState<'list' | 'form'>('list');
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const guard = useRef(createSubmissionGuard()).current;

  const fields = useMemo(() => ENTITY_FIELD_DEFS[entity] ?? [], [entity]);
  const label = ENTITY_LABELS[entity] ?? entity;
  const apiKey = ENTITY_API_KEY[entity] ?? entity;

  const refresh = useCallback(() => {
    setLoadError(null);
    const manager = api.admin[apiKey as keyof typeof api.admin] as unknown as {
      list: () => Promise<Row[]>;
    };
    manager
      .list()
      .then((data) => setRows(data))
      .catch((error) =>
        setLoadError(
          describeApiError(error, {
            notFound: `${label} could not be loaded because the server has no matching configuration.`,
          }),
        ),
      );
  }, [apiKey, label]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  function startCreate() {
    setEditing(null);
    setForm(blankEntityForm(fields));
    setSaveError(null);
    setNotice(null);
    setDisplay('form');
  }

  function startEdit(row: Row) {
    setEditing(row);
    setForm(flattenRecord(row));
    setSaveError(null);
    setNotice(null);
    setDisplay('form');
  }

  function flattenRecord(row: Row): Record<string, unknown> {
    const out: Record<string, unknown> = {};
    for (const field of fields) {
      out[field.name] = row[field.name] ?? field.defaultValue ?? '';
    }
    return out;
  }

  function updateField(name: string, value: unknown) {
    setForm((prev) => ({ ...prev, [name]: value }));
  }

  async function save() {
    const manager = api.admin[apiKey as keyof typeof api.admin] as unknown as {
      create: (payload: unknown) => Promise<Row>;
      update: (id: string, payload: unknown) => Promise<Row>;
    };
    const payload = normalizeEntityPayload(form, fields);
    const current = editing;

    // The guard makes a second click a no-op while the first request is in
    // flight, so one submission can never produce two records.
    await guard.run(async () => {
      setSaving(true);
      setSaveError(null);
      setNotice(null);
      try {
        const record = current ? await manager.update(current.id, payload) : await manager.create(payload);
        setRows((prev) =>
          current ? prev.map((row) => (row.id === record.id ? record : row)) : [record, ...prev],
        );
        setEditing(null);
        setDisplay('list');
        setNotice(`${label} ${current ? 'updated' : 'created'}.`);
      } catch (error) {
        // Keep the form (and the user's input) exactly as it was.
        setSaveError(describeApiError(error));
      } finally {
        setSaving(false);
      }
    });
  }

  async function remove(row: Row) {
    const manager = api.admin[apiKey as keyof typeof api.admin] as unknown as {
      remove: (id: string) => Promise<{ ok: boolean }>;
    };
    if (!window.confirm(`Delete this ${label.toLowerCase()}?`)) return;
    try {
      await manager.remove(row.id);
      setRows((prev) => prev.filter((item) => item.id !== row.id));
      setNotice(`${label} deleted.`);
    } catch (error) {
      setLoadError(describeApiError(error));
    }
  }

  function titleOf(row: Row): string {
    return String(row.title ?? row.name ?? row.institution ?? row.degree ?? row.label ?? row.platform ?? row.id);
  }

  function summaryOf(row: Row): string {
    return String(
      row.summary ??
        row.description ??
        row.category ??
        row.company ??
        row.organization ??
        row.location ??
        row.venue ??
        row.issuer ??
        row.event ??
        row.url ??
        '',
    );
  }

  if (display === 'form') {
    return (
      <div className="max-w-2xl">
        <button
          onClick={() => setDisplay('list')}
          disabled={saving}
          className="mb-6 text-sm text-ink/50 hover:text-ink disabled:opacity-50"
        >
          ← Back
        </button>
        <h1 className="font-display text-2xl font-semibold">
          {editing ? `Edit ${label.toLowerCase()}` : `New ${label.toLowerCase()}`}
        </h1>
        {saveError && (
          <p role="alert" className="mt-6 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">
            {saveError}
          </p>
        )}
        <Card className="mt-6 space-y-5 p-8">
          {fields.map((field) => (
            <div key={field.name} className="space-y-2">
              <Label htmlFor={field.name}>
                {field.label}
                {field.required ? ' *' : ''}
              </Label>
              {field.type === 'textarea' ? (
                <Textarea
                  id={field.name}
                  rows={4}
                  value={String(form[field.name] ?? '')}
                  onChange={(e) => updateField(field.name, e.target.value)}
                />
              ) : field.type === 'boolean' ? (
                <input
                  id={field.name}
                  type="checkbox"
                  checked={Boolean(form[field.name])}
                  onChange={(e) => updateField(field.name, e.target.checked)}
                  className="h-5 w-5"
                />
              ) : field.type === 'select' ? (
                <Select
                  id={field.name}
                  value={String(form[field.name] ?? '')}
                  onChange={(e) => updateField(field.name, e.target.value)}
                >
                  {field.defaultValue === undefined && <option value="">Not set</option>}
                  {field.options?.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </Select>
              ) : (
                <Input
                  id={field.name}
                  type={field.type === 'date' ? 'date' : field.type === 'number' ? 'number' : 'text'}
                  value={String(form[field.name] ?? '')}
                  onChange={(e) => updateField(field.name, e.target.value)}
                />
              )}
            </div>
          ))}
          <div className="flex items-center gap-4 pt-2">
            <Button onClick={save} loading={saving} disabled={saving}>
              <Save className="mr-2 h-4 w-4" />
              {saving ? 'Saving…' : 'Save'}
            </Button>
            <button
              onClick={() => setDisplay('list')}
              disabled={saving}
              className="text-sm text-ink/50 hover:text-ink disabled:opacity-50"
            >
              Cancel
            </button>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between">
        <h1 className="font-display text-2xl font-semibold">{label}</h1>
        <Button onClick={startCreate}>
          <Plus className="mr-2 h-4 w-4" />
          Add {label.toLowerCase()}
        </Button>
      </div>

      {notice && (
        <p role="status" className="mt-6 rounded-xl bg-green-50 px-4 py-3 text-sm text-green-700">
          {notice}
        </p>
      )}
      {loadError && (
        <p role="alert" className="mt-6 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">
          {loadError}
        </p>
      )}

      <div className="mt-8 space-y-3">
        {rows.length === 0 && !loadError && <p className="text-sm text-ink/50">Nothing here yet — add your first item.</p>}
        {rows.map((row) => (
          <Card key={row.id} className="flex items-start justify-between gap-4 p-6">
            <div className="min-w-0">
              <p className="font-medium">{titleOf(row)}</p>
              {summaryOf(row) && <p className="mt-1 line-clamp-1 text-sm text-ink/50">{summaryOf(row)}</p>}
            </div>
            <div className="flex shrink-0 items-center gap-3">
              {row.visibility === 'PRIVATE' && (
                <span className="flex items-center gap-1 text-xs text-ink/40">
                  <EyeOff className="h-3.5 w-3.5" />
                  Hidden
                </span>
              )}
              {row.visibility === 'PUBLIC' && (
                <span className="flex items-center gap-1 text-xs text-ink/40">
                  <Eye className="h-3.5 w-3.5" />
                  Public
                </span>
              )}
              <button onClick={() => startEdit(row)} className="text-ink/50 hover:text-ink" aria-label="Edit">
                <Pencil className="h-4 w-4" />
              </button>
              <button onClick={() => remove(row)} className="text-ink/50 hover:text-red-600" aria-label="Delete">
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
