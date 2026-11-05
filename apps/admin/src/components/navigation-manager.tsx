'use client';

import { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import { Button, Card, Input, Label } from '@portfolio/ui';
import { Plus, Save, Trash2, GripVertical } from 'lucide-react';
import type { NavItem } from '@portfolio/types';

interface EditableNavItem {
  label: string;
  href: string;
  visible: boolean;
  isExternal: boolean;
}

export function NavigationManager() {
  const [items, setItems] = useState<EditableNavItem[]>([]);
  const [loaded, setLoaded] = useState(false);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    api.admin.navigation
      .get()
      .then((nav: NavItem[]) =>
        setItems(
          [...nav]
            .sort((a, b) => a.order - b.order)
            .map((item) => ({
              label: item.label,
              href: item.href,
              visible: item.visible,
              isExternal: item.isExternal,
            })),
        ),
      )
      .catch(() => setError('Could not load navigation. Is the API running?'))
      .finally(() => setLoaded(true));
  }, []);

  function update(index: number, patch: Partial<EditableNavItem>) {
    setItems((prev) => prev.map((item, i) => (i === index ? { ...item, ...patch } : item)));
  }

  function move(index: number, direction: -1 | 1) {
    setItems((prev) => {
      const next = [...prev];
      const target = index + direction;
      if (target < 0 || target >= next.length) return prev;
      const current = next[index]!;
      next[index] = next[target]!;
      next[target] = current;
      return next;
    });
  }

  function add() {
    setItems((prev) => [...prev, { label: '', href: '/', visible: true, isExternal: false }]);
  }

  function remove(index: number) {
    setItems((prev) => prev.filter((_, i) => i !== index));
  }

  async function save() {
    setSaving(true);
    setMessage(null);
    setError(null);
    try {
      await api.admin.navigation.update(
        items
          .filter((item) => item.label.trim() && item.href.trim())
          .map((item, index) => ({ ...item, order: index })),
      );
      setMessage('Navigation saved. The public site updates on the next request.');
    } catch {
      setError('Save failed. Every item needs a label and an href.');
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="max-w-3xl">
      <h1 className="font-display text-2xl font-semibold">Navigation</h1>
      <p className="mt-1 text-sm text-ink/50">
        The header menu on the public site. Order and visibility are content, not code.
      </p>

      {error && <p className="mt-6 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p>}
      {message && <p className="mt-6 rounded-xl bg-green-50 px-4 py-3 text-sm text-green-700">{message}</p>}

      <div className="mt-8 space-y-3">
        {loaded && items.length === 0 && (
          <p className="text-sm text-ink/50">No navigation items. Add the first one.</p>
        )}
        {items.map((item, index) => (
          <Card key={index} className="flex flex-wrap items-end gap-3 p-4">
            <div className="flex flex-col gap-1">
              <button
                type="button"
                onClick={() => move(index, -1)}
                className="text-ink/40 hover:text-ink"
                aria-label="Move up"
              >
                <GripVertical className="h-4 w-4" />
              </button>
            </div>
            <div className="min-w-[10rem] flex-1 space-y-1">
              <Label htmlFor={`label-${index}`}>Label</Label>
              <Input
                id={`label-${index}`}
                value={item.label}
                onChange={(e) => update(index, { label: e.target.value })}
              />
            </div>
            <div className="min-w-[12rem] flex-1 space-y-1">
              <Label htmlFor={`href-${index}`}>Link</Label>
              <Input
                id={`href-${index}`}
                value={item.href}
                onChange={(e) => update(index, { href: e.target.value })}
              />
            </div>
            <label className="flex items-center gap-2 pb-2 text-sm">
              <input
                type="checkbox"
                checked={item.visible}
                onChange={(e) => update(index, { visible: e.target.checked })}
                className="h-4 w-4"
              />
              Visible
            </label>
            <label className="flex items-center gap-2 pb-2 text-sm">
              <input
                type="checkbox"
                checked={item.isExternal}
                onChange={(e) => update(index, { isExternal: e.target.checked })}
                className="h-4 w-4"
              />
              External
            </label>
            <button
              type="button"
              onClick={() => remove(index)}
              className="mb-2 text-ink/40 hover:text-red-600"
              aria-label="Remove item"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          </Card>
        ))}
      </div>

      <div className="mt-6 flex items-center gap-4">
        <Button variant="outline" onClick={add}>
          <Plus className="mr-2 h-4 w-4" />
          Add item
        </Button>
        <Button onClick={save} loading={saving}>
          <Save className="mr-2 h-4 w-4" />
          Save navigation
        </Button>
      </div>
    </div>
  );
}
