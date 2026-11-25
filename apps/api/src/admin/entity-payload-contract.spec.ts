import { describe, expect, it } from 'vitest';
import {
  achievementSchema,
  awardSchema,
  certificationSchema,
  educationSchema,
  experienceSchema,
  projectSchema,
  publicationSchema,
  researchSchema,
  serviceSchema,
  skillSchema,
  socialLinkSchema,
  talkSchema,
} from '@portfolio/validation';
import {
  blankEntityForm,
  ENTITY_FIELD_DEFS,
  normalizeEntityPayload,
  type EntityFieldDef,
} from '@portfolio/utils';

/**
 * End-to-end payload contract for the admin entity forms.
 *
 * Every case starts from the real field definitions the admin renders, fills
 * only the fields the user must fill, runs the same normalisation the form uses,
 * and feeds the result to the same Zod schema the API enforces. A form the user
 * can legitimately complete must never be rejected by the API.
 */

const SCHEMAS = {
  education: educationSchema,
  experience: experienceSchema,
  research: researchSchema,
  projects: projectSchema,
  publications: publicationSchema,
  skills: skillSchema,
  certifications: certificationSchema,
  achievements: achievementSchema,
  awards: awardSchema,
  talks: talkSchema,
  services: serviceSchema,
  'social-links': socialLinkSchema,
} as const;

/** A value a user could actually type into the rendered control. */
function valueFor(field: EntityFieldDef): string | number | boolean {
  switch (field.type) {
    case 'date':
      return '2024-05-01'; // exactly what <input type="date"> produces
    case 'number':
      return 2024;
    case 'boolean':
      return true;
    case 'select':
      return typeof field.defaultValue === 'string' ? field.defaultValue : 'OTHER';
    default:
      return /url/i.test(field.name) ? 'https://example.com' : 'Example value';
  }
}

function minimalPayload(entity: string) {
  const fields = ENTITY_FIELD_DEFS[entity];
  if (!fields) throw new Error(`No field definitions for ${entity}`);
  const form = blankEntityForm(fields);
  for (const field of fields) {
    if (field.required) form[field.name] = valueFor(field);
  }
  return normalizeEntityPayload(form, fields);
}

describe('entity form payload contract', () => {
  for (const [entity, schema] of Object.entries(SCHEMAS)) {
    it(`${entity}: a form with only the required fields filled is accepted by the API`, () => {
      const payload = minimalPayload(entity);
      const result = schema.safeParse(payload);

      expect(result.success, JSON.stringify((result as { error?: unknown }).error)).toBe(true);
    });
  }

  it('timeline: produces an ISO date and null for untouched fields', () => {
    const payload = minimalPayload('timeline');

    expect(payload.date).toBe('2024-05-01T00:00:00.000Z');
    expect(payload.category).toBeNull();
    expect(payload.description).toBeNull();
  });

  it('never sends the literal string "undefined" for any module', () => {
    for (const entity of Object.keys(ENTITY_FIELD_DEFS)) {
      const payload = minimalPayload(entity);
      for (const [name, value] of Object.entries(payload)) {
        expect(value, `${entity}.${name}`).not.toBe('undefined');
      }
      expect(JSON.stringify(payload), entity).not.toContain('"undefined"');
    }
  });

  it('rejects the payload the previous implementation produced (regression)', () => {
    // Before the fix, every untouched text field became "undefined".
    for (const entity of ['projects', 'publications', 'certifications', 'talks'] as const) {
      const fields = ENTITY_FIELD_DEFS[entity]!;
      const broken = minimalPayload(entity);
      for (const field of fields) {
        if (field.type === undefined || field.type === 'text' || field.type === 'select') {
          if (!field.required) broken[field.name] = 'undefined';
        }
      }
      expect(SCHEMAS[entity].safeParse(broken).success, entity).toBe(false);
    }
  });

  it('accepts every URL field left untouched as null', () => {
    const projects = minimalPayload('projects');
    expect(projects.repositoryUrl).toBeNull();
    expect(projects.liveUrl).toBeNull();
    expect(projects.imageUrl).toBeNull();

    const talks = minimalPayload('talks');
    expect(talks.url).toBeNull();

    const certifications = minimalPayload('certifications');
    expect(certifications.credentialUrl).toBeNull();
  });

  it('keeps a URL the user actually typed', () => {
    const fields = ENTITY_FIELD_DEFS.projects!;
    const form = blankEntityForm(fields);
    form.title = 'Portfolio platform';
    form.summary = 'Public site, admin portal and API';
    form.repositoryUrl = 'https://github.com/Abdulmalik-ai-cpu/Abdulmalik-Musba.com';

    const payload = normalizeEntityPayload(form, fields);

    expect(payload.repositoryUrl).toBe('https://github.com/Abdulmalik-ai-cpu/Abdulmalik-Musba.com');
    expect(projectSchema.safeParse(payload).success).toBe(true);
  });

  it('defaults the publication type to a value the API accepts', () => {
    const payload = minimalPayload('publications');
    expect(payload.type).toBe('OTHER');
    expect(publicationSchema.safeParse(payload).success).toBe(true);
  });
});
