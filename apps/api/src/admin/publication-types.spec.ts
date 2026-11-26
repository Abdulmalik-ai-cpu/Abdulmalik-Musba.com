import { describe, expect, it } from 'vitest';
import { z } from 'zod';
import { publicationSchema } from '@portfolio/validation';
import { PUBLICATION_TYPES } from '@portfolio/utils';

/**
 * The admin Publications dropdown is driven by PUBLICATION_TYPES. If the API's
 * schema ever changes, this test fails instead of the admin silently offering a
 * value the server rejects with a 400.
 */
describe('admin publication types match the API schema', () => {
  // `type` is `z.enum([...]).default('OTHER')`, so unwrap the default first.
  const typeField = publicationSchema.shape.type;
  const enumField = typeField instanceof z.ZodDefault ? typeField.removeDefault() : typeField;
  const schemaValues = (enumField as z.ZodEnum<[string, ...string[]]>).options;

  it('offers exactly the enum values accepted by publicationSchema', () => {
    expect([...PUBLICATION_TYPES].sort()).toEqual([...schemaValues].sort());
  });

  it('accepts OTHER, the dropdown default', () => {
    const parsed = publicationSchema.parse({ title: 'A paper', type: 'OTHER' });
    expect(parsed.type).toBe('OTHER');
  });

  it('accepts a minimal payload with no optional fields set', () => {
    const parsed = publicationSchema.parse({
      title: 'A paper',
      type: 'OTHER',
      venue: null,
      year: null,
      doi: null,
      url: null,
      citation: null,
    });

    expect(parsed.type).toBe('OTHER');
    expect(parsed.url).toBeNull();
  });

  it('rejects the literal string "undefined" that the old form produced', () => {
    expect(publicationSchema.safeParse({ title: 'A paper', type: 'undefined' }).success).toBe(false);
    expect(
      publicationSchema.safeParse({ title: 'A paper', type: 'OTHER', url: 'undefined' }).success,
    ).toBe(false);
  });
});
