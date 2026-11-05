'use client';

import { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import { Button, Card, Input, Label, Textarea } from '@portfolio/ui';
import { Save } from 'lucide-react';
import type { SeoConfig } from '@portfolio/types';

type SeoForm = Omit<SeoConfig, 'id' | 'keywords'> & { keywords: string };

const EMPTY: SeoForm = {
  siteTitle: '',
  description: '',
  keywords: '',
  ogImageUrl: '',
  twitterHandle: '',
  canonicalBaseUrl: '',
};

export function SeoManager() {
  const [form, setForm] = useState<SeoForm | null>(null);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    api.admin.seo
      .get()
      .then((seo) =>
        setForm({
          siteTitle: seo.siteTitle,
          description: seo.description,
          keywords: seo.keywords.join(', '),
          ogImageUrl: seo.ogImageUrl ?? '',
          twitterHandle: seo.twitterHandle ?? '',
          canonicalBaseUrl: seo.canonicalBaseUrl ?? '',
        }),
      )
      .catch(() => {
        setForm(EMPTY);
        setError('Could not load SEO configuration. Starting from a blank form.');
      });
  }, []);

  function update<K extends keyof SeoForm>(key: K, value: SeoForm[K]) {
    setForm((prev) => (prev ? { ...prev, [key]: value } : prev));
  }

  async function save() {
    if (!form) return;
    setSaving(true);
    setMessage(null);
    setError(null);
    try {
      await api.admin.seo.update({
        ...form,
        keywords: form.keywords
          .split(',')
          .map((keyword) => keyword.trim())
          .filter(Boolean),
        ogImageUrl: form.ogImageUrl || null,
        twitterHandle: form.twitterHandle || null,
        canonicalBaseUrl: form.canonicalBaseUrl || null,
      });
      setMessage('SEO configuration saved.');
    } catch {
      setError('Save failed.');
    } finally {
      setSaving(false);
    }
  }

  if (!form) {
    return (
      <div className="max-w-3xl">
        <h1 className="font-display text-2xl font-semibold">SEO</h1>
        <div className="mt-8 h-64 animate-pulse rounded-2xl bg-ink/5" />
      </div>
    );
  }

  return (
    <div className="max-w-3xl">
      <h1 className="font-display text-2xl font-semibold">SEO</h1>
      <p className="mt-1 text-sm text-ink/50">
        Defaults for every public page. Article pages can override the title and description.
      </p>

      {error && <p className="mt-6 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p>}
      {message && <p className="mt-6 rounded-xl bg-green-50 px-4 py-3 text-sm text-green-700">{message}</p>}

      <Card className="mt-8 space-y-5 p-8">
        <div className="space-y-2">
          <Label htmlFor="siteTitle">Site title</Label>
          <Input id="siteTitle" value={form.siteTitle} onChange={(e) => update('siteTitle', e.target.value)} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="description">Meta description</Label>
          <Textarea
            id="description"
            rows={3}
            value={form.description}
            onChange={(e) => update('description', e.target.value)}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="keywords">Keywords (comma separated)</Label>
          <Input id="keywords" value={form.keywords} onChange={(e) => update('keywords', e.target.value)} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="canonicalBaseUrl">Canonical base URL</Label>
          <Input
            id="canonicalBaseUrl"
            value={form.canonicalBaseUrl ?? ''}
            onChange={(e) => update('canonicalBaseUrl', e.target.value)}
            placeholder="https://example.com"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="ogImageUrl">Social share image URL</Label>
          <Input
            id="ogImageUrl"
            value={form.ogImageUrl ?? ''}
            onChange={(e) => update('ogImageUrl', e.target.value)}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="twitterHandle">Twitter / X handle</Label>
          <Input
            id="twitterHandle"
            value={form.twitterHandle ?? ''}
            onChange={(e) => update('twitterHandle', e.target.value)}
            placeholder="@handle"
          />
        </div>
        <Button onClick={save} loading={saving} className="mt-2">
          <Save className="mr-2 h-4 w-4" />
          Save SEO
        </Button>
      </Card>
    </div>
  );
}
