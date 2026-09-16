/**
 * Closed vocabularies. These are the values the database CHECK constraints
 * accept, so a change here is a migration, not just an edit.
 */
export const CATEGORIES = [
  'tops',
  'bottoms',
  'dresses',
  'shoes',
  'accessories',
  'outerwear',
] as const;
export type Category = (typeof CATEGORIES)[number];

export const SEASONS = ['spring', 'summer', 'fall', 'winter'] as const;
export type Season = (typeof SEASONS)[number];

/** Lifecycle of a fal.ai job: avatar generation, try-on, background removal. */
export const JOB_STATUSES = ['pending', 'processing', 'ready', 'failed'] as const;
export type JobStatus = (typeof JOB_STATUSES)[number];

/** Lifecycle of a wardrobe item's background-removal job / a generated image's render job. */
export const ITEM_STATUSES = ['processing', 'ready', 'failed'] as const;
export type ItemStatus = (typeof ITEM_STATUSES)[number];

/** Color names the analysis endpoint returns. The web color filter maps these to hex. */
export const COMMON_COLORS = [
  'black',
  'white',
  'gray',
  'navy',
  'blue',
  'red',
  'green',
  'yellow',
  'orange',
  'pink',
  'purple',
  'brown',
  'beige',
  'cream',
  'tan',
  'burgundy',
  'teal',
  'coral',
  'olive',
  'charcoal',
] as const;
export type CommonColor = (typeof COMMON_COLORS)[number];
