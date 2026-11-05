'use client';

import { useCallback, useEffect, useState } from 'react';
import { api } from '@/lib/api';
import { Button, Card, Input, Label, Select, Textarea } from '@portfolio/ui';
import { Plus, Save, Trash2, Send, Undo2, CalendarClock } from 'lucide-react';
import type { Article, ArticleSummary, Paginated } from '@portfolio/types';
import { slugify } from '@portfolio/utils';

interface FormState {
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  seoTitle: string;
  seoDescription: string;
  tags: string;
  coverImageUrl: string;
  featured: boolean;
  scheduledFor: string;
}

const EMPTY: FormState = {
  title: '',
  slug: '',
  excerpt: '',
  content: '',
  seoTitle: '',
  seoDescription: '',
  tags: '',
  coverImageUrl: '',
  featured: false,
  scheduledFor: '',
};

const STATUS_STYLE: Record<string, string> = {
  PUBLISHED: 'bg-green-100 text-green-800',
  DRAFT: 'bg-ink/10 text-ink/70',
  SCHEDULED: 'bg-amber-100 text-amber-800',
  ARCHIVED: 'bg-ink/10 text-ink/50',
};

export function ArticleManager() {
  const [items, setItems] = useState<ArticleSummary[]>([]);
  const [statusFilter, setStatusFilter] = useState('');
  const [search, setSearch] = useState('');
  const [display, setDisplay] = useState<'list' | 'form'>('list');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<FormState>(EMPTY);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const refresh = useCallback(() => {
    setError(null);
    api.admin.articles
      .list({ status: statusFilter || undefined, search: search || undefined, page: 1, pageSize: 50 })
      .then((data: Paginated<ArticleSummary>) => setItems(data.items))
      .catch(() => setError('Could not load articles. Is the API running?'));
  }, [statusFilter, search]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  function startCreate() {
    setEditingId(null);
    setForm(EMPTY);
    setDisplay('form');
  }

  async function startEdit(id: string) {
    setError(null);
    try {
      const article = await api.admin.articles.get(id);
      setEditingId(id);
      setForm({
        title: article.title,
        slug: article.slug,
        excerpt: article.excerpt ?? '',
        content: article.content,
        seoTitle: (article as Article & { seoTitle?: string | null }).seoTitle ?? '',
        seoDescription: (article as Article & { seoDescription?: string | null }).seoDescription ?? '',
        tags: article.tags.join(', '),
        coverImageUrl: article.coverImageUrl ?? '',
        featured: article.featured,
        scheduledFor: article.scheduledFor ? article.scheduledFor.slice(0, 16) : '',
      });
      setDisplay('form');
    } catch {
      setError('Could not open that article.');
    }
  }

  function update<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  function payload() {
    return {
      title: form.title.trim(),
      slug: form.slug.trim() || slugify(form.title),
      excerpt: form.excerpt.trim() || null,
      content: form.content,
      seoTitle: form.seoTitle.trim() || null,
      seoDescription: form.seoDescription.trim() || null,
      tags: form.tags
        .split(',')
        .map((tag) => tag.trim())
        .filter(Boolean),
      coverImageUrl: form.coverImageUrl.trim() || null,
      featured: form.featured,
      scheduledFor: form.scheduledFor ? new Date(form.scheduledFor).toISOString() : null,
    };
  }

  async function save() {
    setBusy(true);
    setError(null);
    try {
      if (editingId) await api.admin.articles.update(editingId, payload());
      else await api.admin.articles.create(payload());
      setDisplay('list');
      refresh();
    } catch {
      setError('Save failed. Check required fields (title, slug, content).');
    } finally {
      setBusy(false);
    }
  }

  async function publish(id: string, action: 'PUBLISH' | 'UNPUBLISH') {
    setError(null);
    try {
      await api.admin.articles.publish(id, { action });
      refresh();
    } catch {
      setError('Publish action failed.');
    }
  }

  async function remove(id: string) {
    if (!window.confirm('Delete this article permanently?')) return;
    try {
      await api.admin.articles.remove(id);
      refresh();
    } catch {
      setError('Delete failed.');
    }
  }

  if (display === 'form') {
    return (
      <div className="max-w-3xl">
        <button onClick={() => setDisplay('list')} className="mb-6 text-sm text-ink/50 hover:text-ink">
          ← Back to articles
        </button>
        <h1 className="font-display text-2xl font-semibold">{editingId ? 'Edit article' : 'New article'}</h1>

        {error && <p className="mt-6 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p>}

        <Card className="mt-6 space-y-5 p-8">
          <div className="space-y-2">
            <Label htmlFor="title">Title *</Label>
            <Input
              id="title"
              value={form.title}
              onChange={(e) => {
                update('title', e.target.value);
                if (!editingId) update('slug', slugify(e.target.value));
              }}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="slug">Slug *</Label>
            <Input id="slug" value={form.slug} onChange={(e) => update('slug', e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="excerpt">Excerpt</Label>
            <Textarea
              id="excerpt"
              rows={2}
              value={form.excerpt}
              onChange={(e) => update('excerpt', e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="content">Content (Markdown) *</Label>
            <Textarea
              id="content"
              rows={18}
              value={form.content}
              onChange={(e) => update('content', e.target.value)}
              className="font-mono text-xs"
            />
            <p className="text-xs text-ink/40">
              Supports headings, bold, italics, inline code, links, lists, and quotes.
            </p>
          </div>
          <div className="space-y-2">
            <Label htmlFor="tags">Tags (comma separated)</Label>
            <Input id="tags" value={form.tags} onChange={(e) => update('tags', e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="coverImageUrl">Cover image URL</Label>
            <Input
              id="coverImageUrl"
              value={form.coverImageUrl}
              onChange={(e) => update('coverImageUrl', e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="scheduledFor">Schedule for</Label>
            <Input
              id="scheduledFor"
              type="datetime-local"
              value={form.scheduledFor}
              onChange={(e) => update('scheduledFor', e.target.value)}
            />
          </div>
          <div className="flex items-center gap-3">
            <input
              id="featured"
              type="checkbox"
              checked={form.featured}
              onChange={(e) => update('featured', e.target.checked)}
              className="h-5 w-5"
            />
            <Label htmlFor="featured">Feature on the home page</Label>
          </div>

          <div className="border-t border-ink/10 pt-6">
            <p className="font-mono text-xs uppercase tracking-widest text-ink/40">Search preview</p>
            <div className="mt-3 space-y-2">
              <Label htmlFor="seoTitle">SEO title</Label>
              <Input id="seoTitle" value={form.seoTitle} onChange={(e) => update('seoTitle', e.target.value)} />
              <Label htmlFor="seoDescription">SEO description</Label>
              <Textarea
                id="seoDescription"
                rows={2}
                value={form.seoDescription}
                onChange={(e) => update('seoDescription', e.target.value)}
              />
            </div>
          </div>

          <div className="flex items-center gap-4 pt-2">
            <Button onClick={save} loading={busy}>
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
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h1 className="font-display text-2xl font-semibold">Articles</h1>
        <Button onClick={startCreate}>
          <Plus className="mr-2 h-4 w-4" />
          New article
        </Button>
      </div>

      <div className="mt-6 flex flex-wrap gap-3">
        <Input
          placeholder="Search titles…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="max-w-xs"
        />
        <Select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="max-w-[12rem]"
          aria-label="Filter by status"
        >
          <option value="">All statuses</option>
          <option value="DRAFT">Draft</option>
          <option value="SCHEDULED">Scheduled</option>
          <option value="PUBLISHED">Published</option>
          <option value="ARCHIVED">Archived</option>
        </Select>
      </div>

      {error && <p className="mt-6 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p>}

      <div className="mt-8 space-y-3">
        {items.length === 0 && !error && (
          <p className="text-sm text-ink/50">No articles yet — write your first one.</p>
        )}
        {items.map((article) => (
          <Card key={article.id} className="flex flex-wrap items-center justify-between gap-4 p-6">
            <div className="min-w-0">
              <div className="flex items-center gap-3">
                <span
                  className={`rounded-full px-2.5 py-0.5 font-mono text-[11px] uppercase tracking-wider ${
                    STATUS_STYLE[article.status] ?? 'bg-ink/10 text-ink/70'
                  }`}
                >
                  {article.status}
                </span>
                {article.featured && (
                  <span className="font-mono text-[11px] uppercase tracking-wider text-accent">Featured</span>
                )}
              </div>
              <p className="mt-2 font-medium">{article.title}</p>
              <p className="mt-0.5 text-xs text-ink/40">
                /{article.slug}
                {article.scheduledFor
                  ? ` · scheduled ${new Date(article.scheduledFor).toLocaleString('en-GB')}`
                  : ''}
              </p>
            </div>
            <div className="flex shrink-0 items-center gap-2">
              {article.status !== 'PUBLISHED' ? (
                <Button size="sm" variant="outline" onClick={() => publish(article.id, 'PUBLISH')}>
                  <Send className="mr-1.5 h-3.5 w-3.5" />
                  Publish
                </Button>
              ) : (
                <Button size="sm" variant="outline" onClick={() => publish(article.id, 'UNPUBLISH')}>
                  <Undo2 className="mr-1.5 h-3.5 w-3.5" />
                  Unpublish
                </Button>
              )}
              <Button size="sm" variant="ghost" onClick={() => startEdit(article.id)}>
                Edit
              </Button>
              <button
                onClick={() => remove(article.id)}
                className="text-ink/40 hover:text-red-600"
                aria-label="Delete article"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          </Card>
        ))}
      </div>

      <p className="mt-8 flex items-center gap-2 text-xs text-ink/40">
        <CalendarClock className="h-3.5 w-3.5" />
        Scheduled articles publish automatically while the API is running.
      </p>
    </div>
  );
}
