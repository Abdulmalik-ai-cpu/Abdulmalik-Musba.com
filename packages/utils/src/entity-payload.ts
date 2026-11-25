/**
 * Form → API payload rules for the Super Admin entity forms.
 *
 * Dependency-free so it can be unit tested without a DOM. The important
 * invariant: a field the user never touched must become `null`, never the
 * literal string "undefined" (which the API's Zod schemas reject for URL and
 * enum fields).
 */

export type EntityFieldKind = 'text' | 'textarea' | 'number' | 'boolean' | 'date' | 'select';

export interface EntityFieldLike {
  name: string;
  type?: EntityFieldKind;
  /**
   * How a blank value is sent. `null` (default) clears the column; `omit` drops
   * the key so schemas such as `z.number().optional().default(0)` keep working.
   */
  blankAs?: 'null' | 'omit';
}

export interface EntityFieldDefault extends EntityFieldLike {
  defaultValue?: unknown;
}

function isBlank(value: unknown): boolean {
  if (value === undefined || value === null) return true;
  return typeof value === 'string' && value.trim() === '';
}

export function normalizeEntityPayload(
  form: Record<string, unknown>,
  fields: readonly EntityFieldLike[],
): Record<string, unknown> {
  const payload: Record<string, unknown> = {};

  for (const field of fields) {
    const raw = form[field.name];

    if (isBlank(raw) && field.blankAs === 'omit') continue;

    switch (field.type) {
      case 'date': {
        if (isBlank(raw)) {
          payload[field.name] = null;
          break;
        }
        const date = new Date(String(raw));
        payload[field.name] = Number.isNaN(date.getTime()) ? null : date.toISOString();
        break;
      }
      case 'number': {
        if (isBlank(raw)) {
          payload[field.name] = null;
          break;
        }
        const value = Number(raw);
        payload[field.name] = Number.isFinite(value) ? value : null;
        break;
      }
      case 'boolean': {
        payload[field.name] = raw === true || raw === 'true';
        break;
      }
      default: {
        payload[field.name] = isBlank(raw) ? null : String(raw);
      }
    }
  }

  return payload;
}

/** Initial form state for a "new record" form, honouring per-field defaults. */
export function blankEntityForm(fields: readonly EntityFieldDefault[]): Record<string, unknown> {
  const form: Record<string, unknown> = {};
  for (const field of fields) {
    if (field.defaultValue !== undefined) {
      form[field.name] = field.defaultValue;
    } else if (field.type === 'boolean') {
      form[field.name] = false;
    }
  }
  return form;
}

export interface SubmissionGuard {
  readonly inFlight: boolean;
  run<T>(task: () => Promise<T>): Promise<{ started: false } | { started: true; result: T }>;
}

/**
 * Prevents a second submission while one is already in flight.
 * React state updates are batched, so a ref-backed guard is needed on top of
 * the disabled button to guarantee one click → one request.
 */
export function createSubmissionGuard(): SubmissionGuard {
  let inFlight = false;

  return {
    get inFlight() {
      return inFlight;
    },
    async run<T>(task: () => Promise<T>) {
      if (inFlight) return { started: false as const };
      inFlight = true;
      try {
        return { started: true as const, result: await task() };
      } finally {
        inFlight = false;
      }
    },
  };
}
