/** Where saves are kept. The last few are kept, newest first. */

export const SAVES_KEPT = 3;

export interface SaveRecord {
  /** When it was written, in real milliseconds since the epoch. */
  savedAt: number;
  /** The save itself, in whatever version it was written. */
  data: unknown;
}

export interface SaveStore {
  /** The newest save, if any. */
  latest(): Promise<SaveRecord | undefined>;
  /** Writes a save and drops all but the newest SAVES_KEPT. */
  write(record: SaveRecord): Promise<void>;
  clear(): Promise<void>;
}

/** Keeps saves in memory. For tests and the balance bot. */
export class MemoryStore implements SaveStore {
  records: SaveRecord[] = [];

  async latest(): Promise<SaveRecord | undefined> {
    return this.records[0];
  }

  async write(record: SaveRecord): Promise<void> {
    // Copy, as a real store would, so later changes to the state do not leak in.
    const copy = JSON.parse(JSON.stringify(record)) as SaveRecord;
    this.records = [copy, ...this.records].slice(0, SAVES_KEPT);
  }

  async clear(): Promise<void> {
    this.records = [];
  }
}
