import type { Profile } from '@portfolio/types';

/**
 * Neutral placeholders only (§2, §143.1).
 * The platform must never invent biography, roles, employers, or metrics.
 * Until the owner publishes a profile, the public site shows an honest
 * "content pending" state rather than placeholder prose that reads as fact.
 */
export const DEFAULT_PROFILE_FALLBACK: Partial<Profile> = {
  fullName: 'Abdulmalik Musba',
  displayName: 'Abdulmalik Musba',
  professionalTitle: '',
  shortIntro: '',
  biography: '',
};

export const EMPTY_STATE = {
  profile: 'A full profile has not been published yet.',
  generic: 'This section will be populated from the admin portal.',
} as const;