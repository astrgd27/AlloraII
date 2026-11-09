import { describe, expect, it } from 'vitest';
import { ORIGINS, isStableId } from './index';

describe('content-tools package', () => {
  it('knows the three origins', () => {
    expect(ORIGINS).toEqual(['allora1', 'polygoetia', 'allora2']);
  });

  it('accepts kind-prefixed snake_case ids', () => {
    expect(isStableId('place_ostwick_market')).toBe(true);
    expect(isStableId('item_blade_t4')).toBe(true);
  });

  it('rejects ids without a kind prefix or with capitals', () => {
    expect(isStableId('ostwick')).toBe(false);
    expect(isStableId('Place_Ostwick')).toBe(false);
    expect(isStableId('place-ostwick')).toBe(false);
  });
});
