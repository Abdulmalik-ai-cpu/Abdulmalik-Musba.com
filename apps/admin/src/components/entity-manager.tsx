'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { api } from '@/lib/api';
import { Button, Card, Input, Label, Textarea } from '@portfolio/ui';
import { Plus, Save, Trash2, Eye, EyeOff, Pencil } from 'lucide-react';

export interface EntityFieldDef {
  name: string;
  label: string;
  type?: 'text' | 'textarea' | 'number' | 'boolean' | 'date';
  required?: boolean;
  placeholder?: string;
}

const ENTITY_FIELD_DEFS: Record<string, EntityFieldDef[]> = {
  education: [
    { name: 'institution', label: 'Institution', required: true },
    { name: 'degree', label: 'Degree', required: true },
    { name: 'fieldOfStudy', label: 'Field of study' },
    { name: 'startDate', label: 'Start date', type: 'date', required: true },
    { name: 'endDate', label: 'End date', type: 'date' },
    { name: 'description', label: 'Description', type: 'textarea' },
  ],
  experience: [
    { name: 'title', label: 'Title', required: true },
    { name: 'company', label: 'Company' },
    { name: 'organization', label: 'Organization' },
    { name: 'location', label: 'Location' },
    { name: 'startDate', label: 'Start date', type: 'date', required: true },
    { name: 'endDate', label: 'End date', type: 'date' },
    { name: 'description', label: 'Description', type: 'textarea' },
  ],
  research: [
    { name: 'title', label: 'Title', required: true },
    { name: 'category', label: 'Category' },
    { name: 'summary', label: 'Summary', type: 'textarea', required: true },
    { name: 'status', label: 'Status' },
    { name: 'startDate', label: 'Start date', type: 'date' },
    { name: 'endDate', label: 'End date', type: 'date' },
  ],
  projects: [
    { name: 'title', label: 'Title', required: true },
    { name: 'summary', label: 'Summary', type: 'textarea', required: true },
    { name: 'status', label: 'Status' },
    { name: 'repositoryUrl', label: 'Repository URL' },
    { name: 'liveUrl', label: 'Live URL' },
    { name: 'imageUrl', label: 'Image URL' },
    { name: 'featured', label: 'Featured', type: 'boolean' },
  ],
  publications: [
    { name: 'title', label: 'Title', required: true },
    { name: 'type', label: 'Type' },
    { name: 'venue', label: 'Venue' },
    { name: 'year', label: 'Year', type: 'number' },
    { name: 'doi', label: 'DOI' },
    { name: 'url', label: 'URL' },
    { name: 'citation', label: 'Citation', type: 'textarea' },
  ],
  skills: [
    { name: 'name', label: 'Name', required: true },
    { name: 'category', label: 'Category' },
    { name: 'proficiency', label: 'Proficiency (0-100)', type: 'number' },
  ],
  certifications: [
    { name: 'title', label: 'Title', required: true },
    { name: 'issuer', label: 'Issuer', required: true },
    { name: 'dateObtained', label: 'Date obtained', type: 'date' },
    { name: 'credentialUrl', label: 'Credential URL' },
    { name: 'credentialId', label: 'Credential ID' },
  ],
  achievements: [
    { name: 'title', label: 'Title', required: true },
    { name: 'description', label: 'Description', type: 'textarea' },
    { name: 'date', label: 'Date', type: 'date' },
    { name: 'category', label: 'Category' },
  ],
  awards: [
    { name: 'title', label: 'Title', required: true },
    { name: 'issuer', label: 'Issuer' },
    { name: 'description', label: 'Description', type: 'textarea' },
    { name: 'date', label: 'Date', type: 'date' },
  ],
  talks: [
    { name: 'title', label: 'Title', required: true },
    { name: 'event', label: 'Event' },
    { name: 'date', label: 'Date', type: 'date' },
    { name: 'location', label: 'Location' },
    { name: 'url', label: 'URL' },
  ],
  services: [{ name: 'title', label: 'Title', required: true }, { name: 'description', label: 'Description', type: 'textarea' }],
  timeline: [
    { name: 'title', label: 'Title', required: true },
    { name: 'date', label: 'Date', type: 'date', required: true },
    { name: 'category', label: 'Category' },
    { name: 'description', label: 'Description', type: 'textarea' },
  ],
};

const ENTITY_LABELS: Record<string, string> = {
  education: 'Education',
  experience: 'Experience',
  research: 'Research',
  projects: 'Projects',
  publications: 'Publications',
  skills: 'Skills',
  technologies: 'Technologies',
  certifications: 'Certifications',
  achievements: 'Achievements',
  awards: 'Awards',
  talks: 'Talks',
  services: 'Services',
  timeline: 'Timeline',
};

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

  const fields = useMemo(() => ENTITY_FIELD_DEFS[entity] ?? [], [entity]);
  const label = ENTITY_LABELS[entity] ?? entity;

  const refresh = useCallback(() => {
    setLoadError(null);
    const manager = api.admin[entity as keyof typeof api.admin] as unknown as {
      list: () => Promise<Row[]>;
    };
    manager
      .list()
      .then((data) => setRows(data))
      .catch(() => setLoadError(`Could not load ${label.toLowerCase()}. Is the API running?`));
  }, [entity, label]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  function startCreate() {
    setEditing(null);
    setForm({});
    setDisplay('form');
  }

  function startEdit(row: Row) {
    setEditing(row);
    setForm(flattenRecord(row));
    setDisplay('form');
  }

  function flattenRecord(row: Row): Record<string, unknown> {
    const out: Record<string, unknown> = {};
    for (const field of fields) {
      out[field.name] = row[field.name] ?? '';
    }
    return out;
  }

  function updateField(name: string, value: unknown) {
    setForm((prev) => ({ ...prev, [name]: value }));
  }

  async function save() {
    const manager = api.admin[entity as keyof typeof api.admin] as unknown as {
      create: (payload: unknown) => Promise<Row>;
      update: (id: string, payload: unknown) => Promise<Row>;
    };
    const payload = normalizePayload(form, fields);
    try {
      if (editing) await manager.update(editing.id, payload);
      else await manager.create(payload);
      setDisplay('list');
      refresh();
    } catch {
      setLoadError('Save failed. Check the values and try again.');
    }
  }

  async function remove(row: Row) {
    const manager = api.admin[entity as keyof typeof api.admin] as unknown as {
      remove: (id: string) => Promise<{ ok: boolean }>;
    };
    if (!window.confirm(`Delete this ${label.toLowerCase()}?`)) return;
    try {
      await manager.remove(row.id);
      refresh();
    } catch {
      setLoadError('Delete failed.');
    }
  }

  function titleOf(row: Row): string {
    return String(row.title ?? row.name ?? row.institution ?? row.degree ?? row.id);
  }

  function summaryOf(row: Row): string {
    return String(
      row.summary ??
        row.description ??
        row.category ??
        row.company ??
        row.organization ??
        row.locacation ??
        row.venue ??
        row.issuer ??
        row.event ??
        '',
    );
  }

  if (display === 'form') {
    return (
      <div className="max-w-2xl">
        <button onClick={() => setDisplay('list')} className="mb-6 text-sm text-ink/50 hover:text-ink">
          ← Back
        </button>
        <h1 className="font-display text-2xl font-semibold">
          {editing ? `Edit ${label.toLowerCase()}` : `New ${label.toLowerCase()}`}
        </h1>
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
            <Button onClick={save}>
              <Save className="mr-2 h-4 w-4" />
              Save
            </Button>
            <button onClick={() => setDisplay('list')} className="text-sm text-ink/50 hover:text-ink">
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

      {loadError && <p className="mt-6 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">{loadError}</p>}

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

function normalizePayload(form: Record<string, unknown>, fields: EntityFieldDef[]): Record<string, unknown> {
  const out: Record<string, unknown> = {};
  for (const field of fields) {
    const raw = form[field.name];
    if (field.type === 'date') {
      out[field.name] = raw ? new Date(String(raw)).toISOString() : null;
    } else if (field.type === 'number') {
      out[field.name] = raw === '' || raw === null ? null : Number(raw);
    } else if (field.type === 'boolean') {
      out[field.name] = Boolean(raw);
    } else {
      out[field.name] = raw === '' ? null : String(raw);
    }
  }
  return out;
}