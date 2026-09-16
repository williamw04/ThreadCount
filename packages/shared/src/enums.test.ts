import { describe, expect, it } from 'vitest';
import { CATEGORIES, COMMON_COLORS, JOB_STATUSES, SEASONS } from './enums';

describe('enums', () => {
  it('have no duplicate values', () => {
    for (const list of [CATEGORIES, SEASONS, JOB_STATUSES, COMMON_COLORS]) {
      expect(new Set(list).size).toBe(list.length);
    }
  });

  it('match the database CHECK constraints from the migrations', () => {
    expect(CATEGORIES).toEqual(['tops', 'bottoms', 'dresses', 'shoes', 'accessories', 'outerwear']);
    expect(SEASONS).toEqual(['spring', 'summer', 'fall', 'winter']);
    expect(JOB_STATUSES).toEqual(['pending', 'processing', 'ready', 'failed']);
  });
});
