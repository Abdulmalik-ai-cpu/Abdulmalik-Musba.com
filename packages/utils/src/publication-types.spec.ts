import { describe, expect, it } from 'vitest';
import {
  PUBLICATION_TYPES,
  PUBLICATION_TYPE_LABELS,
  PUBLICATION_TYPE_OPTIONS,
} from './publication-types';

describe('publication types', () => {
  it('offers every value the API accepts, including OTHER as the default', () => {
    expect(PUBLICATION_TYPES).toContain('OTHER');
    expect([...PUBLICATION_TYPES]).toEqual([
      'JOURNAL',
      'CONFERENCE',
      'THESIS',
      'REPORT',
      'BOOK',
      'CHAPTER',
      'OTHER',
    ]);
  });

  it('exposes one labelled option per value with no duplicates', () => {
    expect(PUBLICATION_TYPE_OPTIONS).toHaveLength(PUBLICATION_TYPES.length);
    expect(new Set(PUBLICATION_TYPE_OPTIONS.map((option) => option.value)).size).toBe(
      PUBLICATION_TYPES.length,
    );

    for (const option of PUBLICATION_TYPE_OPTIONS) {
      expect(option.label.trim().length).toBeGreaterThan(0);
      expect(PUBLICATION_TYPE_LABELS[option.value]).toBe(option.label);
    }
  });
});
