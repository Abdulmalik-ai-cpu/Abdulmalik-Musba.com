import { describe, expect, it, vi } from 'vitest';
import {
  blankEntityForm,
  createSubmissionGuard,
  normalizeEntityPayload,
  type EntityFieldLike,
} from './entity-payload';

const PROJECT_FIELDS: EntityFieldLike[] = [
  { name: 'title' },
  { name: 'summary', type: 'textarea' },
  { name: 'status' },
  { name: 'repositoryUrl' },
  { name: 'liveUrl' },
  { name: 'imageUrl' },
  { name: 'featured', type: 'boolean' },
];

describe('normalizeEntityPayload', () => {
  it('turns an untouched optional field into null, never the string "undefined"', () => {
    const payload = normalizeEntityPayload({ title: 'Portfolio' }, PROJECT_FIELDS);

    expect(payload.repositoryUrl).toBeNull();
    expect(payload.liveUrl).toBeNull();
    expect(payload.imageUrl).toBeNull();
    expect(payload.status).toBeNull();
    expect(payload).not.toHaveProperty('undefined');
  });

  it('never serializes undefined as the literal string "undefined"', () => {
    const payload = normalizeEntityPayload({}, PROJECT_FIELDS);
    const serialized = JSON.stringify(payload);

    expect(serialized).not.toContain('undefined');
    for (const value of Object.values(payload)) {
      expect(value).not.toBe('undefined');
    }
  });

  it('turns empty and whitespace-only strings into null', () => {
    const payload = normalizeEntityPayload(
      { title: '  ', summary: '', repositoryUrl: '' },
      PROJECT_FIELDS,
    );

    expect(payload.title).toBeNull();
    expect(payload.summary).toBeNull();
    expect(payload.repositoryUrl).toBeNull();
  });

  it('keeps explicit null as null', () => {
    const payload = normalizeEntityPayload({ title: null }, PROJECT_FIELDS);
    expect(payload.title).toBeNull();
  });

  it('preserves valid user input, including a valid URL', () => {
    const payload = normalizeEntityPayload(
      {
        title: '  Abdulmalik Portfolio  ',
        summary: 'A lifelong record of work',
        repositoryUrl: 'https://github.com/Abdulmalik-ai-cpu/Abdulmalik-Musba.com',
      },
      PROJECT_FIELDS,
    );

    expect(payload.title).toBe('  Abdulmalik Portfolio  ');
    expect(payload.summary).toBe('A lifelong record of work');
    expect(payload.repositoryUrl).toBe('https://github.com/Abdulmalik-ai-cpu/Abdulmalik-Musba.com');
  });

  it('coerces numbers and maps non-numeric input to null', () => {
    const fields: EntityFieldLike[] = [{ name: 'year', type: 'number' }];

    expect(normalizeEntityPayload({ year: '2024' }, fields).year).toBe(2024);
    expect(normalizeEntityPayload({ year: 2024 }, fields).year).toBe(2024);
    expect(normalizeEntityPayload({ year: '' }, fields).year).toBeNull();
    expect(normalizeEntityPayload({}, fields).year).toBeNull();
    expect(normalizeEntityPayload({ year: 'not-a-year' }, fields).year).toBeNull();
  });

  it('normalizes dates to ISO strings and blanks to null', () => {
    const fields: EntityFieldLike[] = [{ name: 'dateObtained', type: 'date' }];

    expect(normalizeEntityPayload({ dateObtained: '2024-05-01' }, fields).dateObtained).toBe(
      '2024-05-01T00:00:00.000Z',
    );
    expect(normalizeEntityPayload({ dateObtained: '' }, fields).dateObtained).toBeNull();
    expect(normalizeEntityPayload({}, fields).dateObtained).toBeNull();
    expect(normalizeEntityPayload({ dateObtained: 'not-a-date' }, fields).dateObtained).toBeNull();
  });

  it('keeps booleans boolean', () => {
    const payload = normalizeEntityPayload({ featured: true }, PROJECT_FIELDS);
    expect(payload.featured).toBe(true);

    const unticked = normalizeEntityPayload({}, PROJECT_FIELDS);
    expect(unticked.featured).toBe(false);
  });

  it('keeps a selected enum value unchanged', () => {
    const fields: EntityFieldLike[] = [{ name: 'type', type: 'select' }];
    const payload = normalizeEntityPayload({ type: 'OTHER' }, fields);
    expect(payload.type).toBe('OTHER');
  });

  it('omits a blank field marked blankAs: "omit" so schema defaults still apply', () => {
    const fields: EntityFieldLike[] = [{ name: 'sortOrder', type: 'number', blankAs: 'omit' }];

    expect(normalizeEntityPayload({}, fields)).not.toHaveProperty('sortOrder');
    expect(normalizeEntityPayload({ sortOrder: '' }, fields)).not.toHaveProperty('sortOrder');
    expect(normalizeEntityPayload({ sortOrder: '3' }, fields).sortOrder).toBe(3);
  });

  it('does not drop fields that were not declared in the form definition', () => {
    const payload = normalizeEntityPayload({ title: 'x' }, [{ name: 'title' }]);
    expect(Object.keys(payload)).toEqual(['title']);
  });
});

describe('blankEntityForm', () => {
  it('applies declared defaults and false for booleans', () => {
    const form = blankEntityForm([
      { name: 'title' },
      { name: 'type', type: 'select', defaultValue: 'OTHER' },
      { name: 'featured', type: 'boolean' },
    ]);

    expect(form).toEqual({ type: 'OTHER', featured: false });
  });
});

describe('createSubmissionGuard', () => {
  it('runs one task per submission when a second click arrives while in flight', async () => {
    const guard = createSubmissionGuard();
    const task = vi.fn(async () => {
      await Promise.resolve();
      return 'saved';
    });

    const first = guard.run(task);
    const second = guard.run(task);

    expect(guard.inFlight).toBe(true);
    await expect(second).resolves.toEqual({ started: false });
    await expect(first).resolves.toEqual({ started: true, result: 'saved' });
    expect(task).toHaveBeenCalledTimes(1);
    expect(guard.inFlight).toBe(false);
  });

  it('accepts a new submission once the previous one finished', async () => {
    const guard = createSubmissionGuard();
    const task = vi.fn(async () => 'ok');

    await guard.run(task);
    const second = await guard.run(task);

    expect(second).toEqual({ started: true, result: 'ok' });
    expect(task).toHaveBeenCalledTimes(2);
  });

  it('releases the guard after a failed submission so the user can retry', async () => {
    const guard = createSubmissionGuard();
    const failing = vi.fn(async () => {
      throw new Error('network');
    });

    await expect(guard.run(failing)).rejects.toThrow('network');
    expect(guard.inFlight).toBe(false);

    await expect(guard.run(async () => 'retried')).resolves.toEqual({
      started: true,
      result: 'retried',
    });
  });
});
