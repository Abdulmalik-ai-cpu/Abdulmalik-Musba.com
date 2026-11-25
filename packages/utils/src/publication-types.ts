/**
 * Publication types accepted by the API.
 *
 * Source of truth: `publicationSchema.type` in `packages/validation/src/index.ts`.
 * `apps/api/src/admin/publication-types.spec.ts` fails if these two lists drift,
 * so the dropdown can never offer a value the API rejects.
 */
export const PUBLICATION_TYPES = [
  'JOURNAL',
  'CONFERENCE',
  'THESIS',
  'REPORT',
  'BOOK',
  'CHAPTER',
  'OTHER',
] as const;

export type PublicationTypeValue = (typeof PUBLICATION_TYPES)[number];

export const PUBLICATION_TYPE_LABELS: Record<PublicationTypeValue, string> = {
  JOURNAL: 'Journal article',
  CONFERENCE: 'Conference paper',
  THESIS: 'Thesis',
  REPORT: 'Report',
  BOOK: 'Book',
  CHAPTER: 'Book chapter',
  OTHER: 'Other',
};

export const PUBLICATION_TYPE_OPTIONS: ReadonlyArray<{ value: PublicationTypeValue; label: string }> =
  PUBLICATION_TYPES.map((value) => ({ value, label: PUBLICATION_TYPE_LABELS[value] }));
