export { designTokens } from '@portfolio/ui';

export function formatPeriod(
  startDate: string | null | undefined,
  endDate: string | null | undefined,
  current: boolean,
): string {
  const fmt = (value: string | null | undefined) => {
    if (!value) return '';
    const d = new Date(value);
    if (Number.isNaN(d.getTime())) return '';
    return new Intl.DateTimeFormat('en-GB', { month: 'short', year: 'numeric' }).format(d);
  };
  const start = fmt(startDate);
  if (current) return `${start} — Present`;
  const end = fmt(endDate);
  if (start && end) return `${start} — ${end}`;
  return start || end;
}

export function publicationYear(label: number | string | null | undefined): string {
  return label ? String(label) : '-';
}