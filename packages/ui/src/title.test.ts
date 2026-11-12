import { describe, expect, it } from 'vitest';
import { TITLE } from './title';

describe('ui package', () => {
  it('names the game', () => {
    expect(TITLE).toBe('Allora II');
  });
});
