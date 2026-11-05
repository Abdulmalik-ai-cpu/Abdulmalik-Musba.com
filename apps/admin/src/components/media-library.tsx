'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { api } from '@/lib/api';
import { Button, Card, Input, Label, Select } from '@portfolio/ui';
import { Upload, Trash2, Copy, Lock, Globe, ShieldAlert } from 'lucide-react';
import type { Media } from '@portfolio/types';

const STORAGE_CLASSES: Array<{ value: 'PUBLIC' | 'PRIVATE' | 'ADMIN_ONLY'; label: string; hint: string }> = [
  { value: 'PUBLIC', label: 'Public', hint: 'Served on the public site' },
  { value: 'PRIVATE', label: 'Private', hint: 'Signed, expiring links only' },
  { value: 'ADMIN_ONLY', label: 'Admin only', hint: 'Never served publicly' },
];

function classIcon(storageClass: string) {
  if (storageClass === 'PRIVATE') return <Lock className="h-3.5 w-3.5" />;
  if (storageClass === 'ADMIN_ONLY') return <ShieldAlert className="h-3.5 w-3.5" />;
  return <Globe className="h-3.5 w-3.5" />;
}

export function MediaLibrary() {
  const [items, setItems] = useState<Media[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [storageClass, setStorageClass] = useState<'PUBLIC' | 'PRIVATE' | 'ADMIN_ONLY'>('PUBLIC');
  const [altText, setAltText] = useState('');
  const fileRef = useRef<HTMLInputElement>(null);

  const refresh = useCallback(() => {
    setError(null);
    api.admin.media
      .list()
      .then(setItems)
      .catch(() => setError('Could not load media. Is the API running?'));
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  async function handleUpload(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;
    setUploading(true);
    setError(null);
    setNotice(null);
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('storageClass', storageClass);
      if (altText.trim()) formData.append('altText', altText.trim());
      await api.admin.media.upload(formData);
      setNotice(`Uploaded ${file.name}.`);
      setAltText('');
      if (fileRef.current) fileRef.current.value = '';
      refresh();
    } catch {
      setError('Upload rejected. Check the file type and size.');
    } finally {
      setUploading(false);
    }
  }

  async function copyUrl(media: Media) {
    // Private assets get a fresh signed URL rather than the stored one.
    try {
      const { url } = await api.admin.media.url(media.id);
      if (!url) return;
      await navigator.clipboard.writeText(url);
      setNotice('Link copied to clipboard.');
    } catch {
      setError('Could not generate a link.');
    }
  }

  async function remove(media: Media) {
    if (!window.confirm(`Delete ${media.originalName}? This removes the stored file.`)) return;
    try {
      await api.admin.media.remove(media.id);
      refresh();
    } catch {
      setError('Delete failed.');
    }
  }

  return (
    <div>
      <h1 className="font-display text-2xl font-semibold">Media</h1>
      <p className="mt-1 text-sm text-ink/50">
        Uploads are validated by type and content, then stored by access class.
      </p>

      {error && <p className="mt-6 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p>}
      {notice && <p className="mt-6 rounded-xl bg-green-50 px-4 py-3 text-sm text-green-700">{notice}</p>}

      <Card className="mt-8 space-y-4 p-6">
        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="storageClass">Access class</Label>
            <Select
              id="storageClass"
              value={storageClass}
              onChange={(e) => setStorageClass(e.target.value as typeof storageClass)}
            >
              {STORAGE_CLASSES.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label} — {option.hint}
                </option>
              ))}
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="altText">Alt text (accessibility)</Label>
            <Input
              id="altText"
              value={altText}
              onChange={(e) => setAltText(e.target.value)}
              placeholder="Describe the image for screen readers"
            />
          </div>
        </div>
        <div className="flex items-center gap-4">
          <input
            ref={fileRef}
            type="file"
            onChange={handleUpload}
            disabled={uploading}
            className="text-sm"
            aria-label="Choose file to upload"
          />
          <Button onClick={() => fileRef.current?.click()} loading={uploading}>
            <Upload className="mr-2 h-4 w-4" />
            Upload
          </Button>
        </div>
      </Card>

      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {items.length === 0 && !error && <p className="text-sm text-ink/50">No media uploaded yet.</p>}
        {items.map((media) => (
          <Card key={media.id} className="flex flex-col p-4">
            <div className="flex h-36 items-center justify-center overflow-hidden rounded-lg bg-ink/5">
              {media.type === 'IMAGE' && media.storageClass === 'PUBLIC' && media.url ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={media.url} alt={media.altText ?? media.originalName} className="h-full w-full object-cover" />
              ) : (
                <span className="font-mono text-xs uppercase tracking-widest text-ink/40">{media.type}</span>
              )}
            </div>
            <p className="mt-3 truncate text-sm font-medium">{media.originalName}</p>
            <p className="mt-0.5 flex items-center gap-1.5 font-mono text-[11px] uppercase tracking-wider text-ink/40">
              {classIcon(media.storageClass)}
              {media.storageClass.replace('_', ' ')} · {(media.size / 1024).toFixed(0)} KB
            </p>
            {media.altText ? (
              <p className="mt-2 line-clamp-2 text-xs text-ink/50">{media.altText}</p>
            ) : (
              <p className="mt-2 text-xs text-amber-700">No alt text — add one for accessibility.</p>
            )}
            <div className="mt-auto flex items-center gap-2 pt-4">
              <Button size="sm" variant="ghost" onClick={() => copyUrl(media)}>
                <Copy className="mr-1.5 h-3.5 w-3.5" />
                Link
              </Button>
              <button
                onClick={() => remove(media)}
                className="text-ink/40 hover:text-red-600"
                aria-label="Delete media"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
