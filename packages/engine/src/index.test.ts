import { describe, expect, it } from 'vitest';
import { ENGINE_NAME, ENGINE_VERSION } from './index';

describe('engine package', () => {
  it('declares its name and version', () => {
    expect(ENGINE_NAME).toBe('allora-ii-engine');
    expect(ENGINE_VERSION).toMatch(/^\d+\.\d+\.\d+$/);
  });
});
