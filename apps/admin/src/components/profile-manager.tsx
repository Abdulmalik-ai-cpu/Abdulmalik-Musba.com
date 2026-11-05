'use client';

import { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import { Button, Card, Input, Label, Textarea } from '@portfolio/ui';
import { Save } from 'lucide-react';
import type { Profile } from '@portfolio/types';

type ProfileForm = Omit<Profile, 'id' | 'createdAt' | 'updatedAt' | 'languages' | 'personalDomains' | 'externalWebsites'> & {
  languages: string;
  personalDomains: string;
  externalWebsites: string;
};

const EMPTY: ProfileForm = {
  fullName: '',
  displayName: '',
  professionalTitle: '',
  shortIntro: '',
  biography: '',
  longBiography: '',
  profileImageUrl: '',
  location: '',
  nationality: '',
  languages: '',
  email: '',
  phone: '',
  orcid: '',
  googleScholar: '',
  github: '',
  linkedin: '',
  personalDomains: '',
  externalWebsites: '',
  cvUrl: '',
};

function toForm(profile: Partial<Profile>): ProfileForm {
  return {
    ...EMPTY,
    ...Object.fromEntries(
      Object.entries(profile).map(([key, value]) => [key, value ?? '']),
    ),
    languages: (profile.languages ?? []).join(', '),
    personalDomains: (profile.personalDomains ?? []).join(', '),
    externalWebsites: (profile.externalWebsites ?? []).join(', '),
  } as ProfileForm;
}

export function ProfileManager() {
  const [form, setForm] = useState<ProfileForm | null>(null);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    api.admin.profile
      .get()
      .then((profile) => setForm(toForm(profile)))
      .catch(() => {
        // A brand-new deployment has no profile row yet; start from an empty form.
        setForm(EMPTY);
      });
  }, []);

  function update<K extends keyof ProfileForm>(key: K, value: ProfileForm[K]) {
    setForm((prev) => (prev ? { ...prev, [key]: value } : prev));
  }

  async function save() {
    if (!form) return;
    setSaving(true);
    setMessage(null);
    setError(null);
    const toList = (value: string) =>
      value
        .split(',')
        .map((entry) => entry.trim())
        .filter(Boolean);
    // Nullable fields must be null (not "") so URL/email validation passes.
    const nullable = (value: string | null | undefined) => (value && value.trim() ? value.trim() : null);
    const payload = {
      fullName: form.fullName.trim(),
      displayName: form.displayName.trim(),
      professionalTitle: form.professionalTitle.trim(),
      shortIntro: form.shortIntro.trim(),
      biography: form.biography.trim(),
      longBiography: nullable(form.longBiography),
      profileImageUrl: nullable(form.profileImageUrl),
      location: nullable(form.location),
      nationality: nullable(form.nationality),
      languages: toList(form.languages),
      email: nullable(form.email),
      phone: nullable(form.phone),
      orcid: nullable(form.orcid),
      googleScholar: nullable(form.googleScholar),
      github: nullable(form.github),
      linkedin: nullable(form.linkedin),
      personalDomains: toList(form.personalDomains),
      externalWebsites: toList(form.externalWebsites),
      cvUrl: nullable(form.cvUrl),
    };
    try {
      const saved = await api.admin.profile.update(payload);
      setForm(toForm(saved));
      setMessage('Profile saved.');
    } catch {
      setError('Save failed. Full name, display name, title, intro, and biography are required.');
    } finally {
      setSaving(false);
    }
  }

  if (!form) {
    return (
      <div className="max-w-3xl">
        <h1 className="font-display text-2xl font-semibold">Profile</h1>
        <div className="mt-8 h-64 animate-pulse rounded-2xl bg-ink/5" />
      </div>
    );
  }

  const textFields: Array<{ key: keyof ProfileForm; label: string; placeholder?: string }> = [
    { key: 'fullName', label: 'Full name' },
    { key: 'displayName', label: 'Display name' },
    { key: 'professionalTitle', label: 'Professional title' },
    { key: 'location', label: 'Location' },
    { key: 'nationality', label: 'Nationality' },
    { key: 'email', label: 'Public email' },
    { key: 'phone', label: 'Public phone' },
    { key: 'profileImageUrl', label: 'Profile image URL' },
    { key: 'cvUrl', label: 'CV URL' },
  ];

  const scholarlyFields: Array<{ key: keyof ProfileForm; label: string }> = [
    { key: 'orcid', label: 'ORCID' },
    { key: 'googleScholar', label: 'Google Scholar URL' },
    { key: 'github', label: 'GitHub URL' },
    { key: 'linkedin', label: 'LinkedIn URL' },
    { key: 'personalDomains', label: 'Personal domains (comma separated)' },
    { key: 'externalWebsites', label: 'External websites (comma separated)' },
  ];

  return (
    <div className="max-w-3xl">
      <h1 className="font-display text-2xl font-semibold">Profile</h1>
      <p className="mt-1 text-sm text-ink/50">
        Only values you enter here appear on the public site. Nothing is invented for you.
      </p>

      {error && <p className="mt-6 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p>}
      {message && <p className="mt-6 rounded-xl bg-green-50 px-4 py-3 text-sm text-green-700">{message}</p>}

      <Card className="mt-8 space-y-5 p-8">
        {textFields.map((field) => (
          <div key={field.key} className="space-y-2">
            <Label htmlFor={field.key}>{field.label}</Label>
            <Input
              id={field.key}
              value={String(form[field.key] ?? '')}
              onChange={(e) => update(field.key, e.target.value as never)}
            />
          </div>
        ))}

        <div className="space-y-2">
          <Label htmlFor="shortIntro">Short intro</Label>
          <Textarea
            id="shortIntro"
            rows={3}
            value={form.shortIntro}
            onChange={(e) => update('shortIntro', e.target.value)}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="biography">Biography</Label>
          <Textarea
            id="biography"
            rows={5}
            value={form.biography}
            onChange={(e) => update('biography', e.target.value)}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="longBiography">Long biography</Label>
          <Textarea
            id="longBiography"
            rows={6}
            value={form.longBiography ?? ''}
            onChange={(e) => update('longBiography', e.target.value)}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="languages">Languages (comma separated)</Label>
          <Input
            id="languages"
            value={form.languages}
            onChange={(e) => update('languages', e.target.value)}
          />
        </div>

        <div className="border-t border-ink/10 pt-6">
          <p className="font-mono text-xs uppercase tracking-widest text-ink/40">Scholarly & social</p>
          <div className="mt-4 space-y-5">
            {scholarlyFields.map((field) => (
              <div key={field.key} className="space-y-2">
                <Label htmlFor={field.key}>{field.label}</Label>
                <Input
                  id={field.key}
                  value={String(form[field.key] ?? '')}
                  onChange={(e) => update(field.key, e.target.value as never)}
                />
              </div>
            ))}
          </div>
        </div>

        <Button onClick={save} loading={saving} className="mt-2">
          <Save className="mr-2 h-4 w-4" />
          Save profile
        </Button>
      </Card>
    </div>
  );
}
