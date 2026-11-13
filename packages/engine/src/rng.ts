/**
 * Seeded random numbers. The same seed always gives the same sequence, so a
 * save can be replayed exactly. Each stream (the world, each life) has its own
 * state, so one stream's draws never shift another's.
 */

export interface RngState {
  /** Stream name → its 32-bit state. */
  streams: Record<string, number>;
}

/** A 32-bit hash of a string (FNV-1a), used to give each stream its own start. */
export function hashString(text: string): number {
  let h = 0x811c9dc5;
  for (let i = 0; i < text.length; i++) {
    h ^= text.charCodeAt(i);
    h = Math.imul(h, 0x01000193);
  }
  return h >>> 0;
}

export function createRng(): RngState {
  return { streams: {} };
}

/** The next number in [0, 1) from a stream. Updates the stream's state in place. */
export function nextRandom(rng: RngState, seed: number, stream: string): number {
  let a = rng.streams[stream] ?? (seed ^ hashString(stream)) >>> 0;
  // mulberry32
  a = (a + 0x6d2b79f5) >>> 0;
  let t = a;
  t = Math.imul(t ^ (t >>> 15), t | 1);
  t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
  rng.streams[stream] = a;
  return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
}
