import { PUBLICATION_TYPE_OPTIONS } from './publication-types';
import type { EntityFieldKind } from './entity-payload';

/**
 * Field definitions for the Super Admin entity forms.
 *
 * Kept here (not in the React component) so the API contract test can feed the
 * real definitions through `normalizeEntityPayload` and the Zod schemas.
 */

export interface EntityFieldDef {
  name: string;
  label: string;
  type?: EntityFieldKind;
  required?: boolean;
  placeholder?: string;
  options?: ReadonlyArray<{ value: string; label: string }>;
  defaultValue?: string | boolean;
  blankAs?: 'null' | 'omit';
}

export const ENTITY_FIELD_DEFS: Record<string, EntityFieldDef[]> = {
  education: [
    { name: 'institution', label: 'Institution', required: true },
    { name: 'degree', label: 'Degree', required: true },
    { name: 'fieldOfStudy', label: 'Field of study' },
    { name: 'startDate', label: 'Start date', type: 'date', required: true },
    { name: 'endDate', label: 'End date', type: 'date' },
    { name: 'description', label: 'Description', type: 'textarea' },
  ],
  experience: [
    { name: 'title', label: 'Title', required: true },
    { name: 'company', label: 'Company' },
    { name: 'organization', label: 'Organization' },
    { name: 'location', label: 'Location' },
    { name: 'startDate', label: 'Start date', type: 'date', required: true },
    { name: 'endDate', label: 'End date', type: 'date' },
    { name: 'description', label: 'Description', type: 'textarea' },
  ],
  research: [
    { name: 'title', label: 'Title', required: true },
    { name: 'category', label: 'Category' },
    { name: 'summary', label: 'Summary', type: 'textarea', required: true },
    { name: 'status', label: 'Status' },
    { name: 'startDate', label: 'Start date', type: 'date' },
    { name: 'endDate', label: 'End date', type: 'date' },
  ],
  projects: [
    { name: 'title', label: 'Title', required: true },
    { name: 'summary', label: 'Summary', type: 'textarea', required: true },
    { name: 'status', label: 'Status' },
    { name: 'repositoryUrl', label: 'Repository URL' },
    { name: 'liveUrl', label: 'Live URL' },
    { name: 'imageUrl', label: 'Image URL' },
    { name: 'featured', label: 'Featured', type: 'boolean' },
  ],
  publications: [
    { name: 'title', label: 'Title', required: true },
    {
      name: 'type',
      label: 'Type',
      type: 'select',
      options: PUBLICATION_TYPE_OPTIONS,
      defaultValue: 'OTHER',
    },
    { name: 'venue', label: 'Venue' },
    { name: 'year', label: 'Year', type: 'number' },
    { name: 'doi', label: 'DOI' },
    { name: 'url', label: 'URL' },
    { name: 'citation', label: 'Citation', type: 'textarea' },
  ],
  skills: [
    { name: 'name', label: 'Name', required: true },
    { name: 'category', label: 'Category' },
    { name: 'proficiency', label: 'Proficiency (0-100)', type: 'number' },
  ],
  certifications: [
    { name: 'title', label: 'Title', required: true },
    { name: 'issuer', label: 'Issuer', required: true },
    { name: 'dateObtained', label: 'Date obtained', type: 'date' },
    { name: 'credentialUrl', label: 'Credential URL' },
    { name: 'credentialId', label: 'Credential ID' },
  ],
  achievements: [
    { name: 'title', label: 'Title', required: true },
    { name: 'description', label: 'Description', type: 'textarea' },
    { name: 'date', label: 'Date', type: 'date' },
    { name: 'category', label: 'Category' },
  ],
  awards: [
    { name: 'title', label: 'Title', required: true },
    { name: 'issuer', label: 'Issuer' },
    { name: 'description', label: 'Description', type: 'textarea' },
    { name: 'date', label: 'Date', type: 'date' },
  ],
  talks: [
    { name: 'title', label: 'Title', required: true },
    { name: 'event', label: 'Event' },
    { name: 'date', label: 'Date', type: 'date' },
    { name: 'location', label: 'Location' },
    { name: 'url', label: 'URL' },
  ],
  services: [
    { name: 'title', label: 'Title', required: true },
    { name: 'description', label: 'Description', type: 'textarea' },
  ],
  'social-links': [
    { name: 'platform', label: 'Platform', required: true },
    { name: 'label', label: 'Label', required: true },
    { name: 'url', label: 'URL', required: true },
    { name: 'icon', label: 'Icon name' },
    // `sortOrder` is `optional().default(0)`, so a blank must be omitted, not null.
    { name: 'sortOrder', label: 'Order', type: 'number', blankAs: 'omit' },
  ],
  timeline: [
    { name: 'title', label: 'Title', required: true },
    { name: 'date', label: 'Date', type: 'date', required: true },
    { name: 'category', label: 'Category' },
    { name: 'description', label: 'Description', type: 'textarea' },
  ],
};

export const ENTITY_LABELS: Record<string, string> = {
  education: 'Education',
  experience: 'Experience',
  research: 'Research',
  projects: 'Projects',
  publications: 'Publications',
  skills: 'Skills',
  technologies: 'Technologies',
  certifications: 'Certifications',
  achievements: 'Achievements',
  awards: 'Awards',
  talks: 'Talks',
  services: 'Services',
  'social-links': 'Social links',
  timeline: 'Timeline',
};

/** Entity slug → api-client admin namespace key, when they differ. */
export const ENTITY_API_KEY: Record<string, string> = {
  'social-links': 'socialLinks',
};
