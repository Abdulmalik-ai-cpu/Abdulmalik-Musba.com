'use client';

import { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import { Button, Card, Input, Label, Textarea } from '@portfolio/ui';
import { NavigationManager } from '@/components/navigation-manager';
import { SeoManager } from '@/components/seo-manager';
import { SecurityManager } from '@/components/security-manager';
import type { SiteSetting } from '@portfolio/types';

type Settings = Pick<SiteSetting, 'siteName' | 'tagline' | 'footerText' | 'theme' | 'contactEnabled' | 'analyticsEnabled'>;

const TABS = ['General', 'Navigation', 'SEO', 'Security'] as const;
type Tab = (typeof TABS)[number];

export default function SettingsPage() {
  const [tab, setTab] = useState<Tab>('General');

  return (
    <div>
      <h1 className="font-display text-2xl font-semibold">Settings</h1>
      <p className="mt-1 text-sm text-ink/50">Site-wide configuration for the public web app.</p>

      <div className="mt-6 flex flex-wrap gap-2 border-b border-ink/10">
        {TABS.map((value) => (
          <button
            key={value}
            onClick={() => setTab(value)}
            className={`-mb-px border-b-2 px-4 py-2 text-sm transition-colors ${
              tab === value ? 'border-accent text-ink' : 'border-transparent text-ink/50 hover:text-ink'
            }`}
          >
            {value}
          </button>
        ))}
      </div>

      <div className="mt-8">
        {tab === 'General' && <GeneralSettings />}
        {tab === 'Navigation' && <NavigationManager />}
        {tab === 'SEO' && <SeoManager />}
        {tab === 'Security' && <SecurityManager />}
      </div>
    </div>
  );
}

function GeneralSettings() {
  const [form, setForm] = useState<Settings | null>(null);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    api.admin.settings
      .get()
      .then((data) => setForm(data as Settings))
      .catch(() => setError('Could not load settings. Is the API running?'));
  }, []);

  function update<K extends keyof Settings>(key: K, value: Settings[K]) {
    setForm((prev) => (prev ? { ...prev, [key]: value } : prev));
  }

  async function save() {
    if (!form) return;
    setSaving(true);
    setMessage(null);
    setError(null);
    try {
      const updated = await api.admin.settings.update(form);
      setForm(updated as Settings);
      setMessage('Settings saved.');
    } catch {
      setError('Save failed.');
    } finally {
      setSaving(false);
    }
  }

  if (!form) {
    return (
      <div className="max-w-2xl">
        <div className="h-64 animate-pulse rounded-2xl bg-ink/5" />
        {error && <p className="mt-6 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p>}
      </div>
    );
  }

  return (
    <div className="max-w-2xl">
      {error && <p className="mb-6 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p>}
      {message && <p className="mb-6 rounded-xl bg-green-50 px-4 py-3 text-sm text-green-700">{message}</p>}

      <Card className="space-y-5 p-8">
        <div className="space-y-2">
          <Label htmlFor="siteName">Site name</Label>
          <Input id="siteName" value={form.siteName} onChange={(e) => update('siteName', e.target.value)} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="tagline">Tagline</Label>
          <Input id="tagline" value={form.tagline ?? ''} onChange={(e) => update('tagline', e.target.value)} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="footerText">Footer text</Label>
          <Textarea
            id="footerText"
            rows={3}
            value={form.footerText ?? ''}
            onChange={(e) => update('footerText', e.target.value)}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="theme">Theme</Label>
          <Input id="theme" value={form.theme} onChange={(e) => update('theme', e.target.value)} />
        </div>
        <div className="flex items-center gap-3">
          <input
            id="contactEnabled"
            type="checkbox"
            checked={form.contactEnabled}
            onChange={(e) => update('contactEnabled', e.target.checked)}
            className="h-5 w-5"
          />
          <Label htmlFor="contactEnabled">Enable contact form</Label>
        </div>
        <div className="flex items-center gap-3">
          <input
            id="analyticsEnabled"
            type="checkbox"
            checked={form.analyticsEnabled}
            onChange={(e) => update('analyticsEnabled', e.target.checked)}
            className="h-5 w-5"
          />
          <Label htmlFor="analyticsEnabled">Enable analytics</Label>
        </div>
        <Button onClick={save} loading={saving} className="mt-2">
          {saving ? 'Saving…' : 'Save settings'}
        </Button>
      </Card>
    </div>
  );
}