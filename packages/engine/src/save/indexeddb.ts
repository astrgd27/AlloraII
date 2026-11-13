/** Saves in the browser's IndexedDB. Works in a Web Worker. */
import { SAVES_KEPT, type SaveRecord, type SaveStore } from './store';

const DB_NAME = 'allora-ii';
const DB_VERSION = 1;
const STORE = 'saves';

const request = <T>(req: IDBRequest<T>): Promise<T> =>
  new Promise((resolve, reject) => {
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error ?? new Error('IndexedDB request failed'));
  });

const done = (tx: IDBTransaction): Promise<void> =>
  new Promise((resolve, reject) => {
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error ?? new Error('IndexedDB transaction failed'));
    tx.onabort = () => reject(tx.error ?? new Error('IndexedDB transaction aborted'));
  });

export class IndexedDbStore implements SaveStore {
  private db: Promise<IDBDatabase> | undefined;

  private open(): Promise<IDBDatabase> {
    this.db ??= new Promise((resolve, reject) => {
      const req = indexedDB.open(DB_NAME, DB_VERSION);
      req.onupgradeneeded = () => {
        if (!req.result.objectStoreNames.contains(STORE)) {
          req.result.createObjectStore(STORE, { keyPath: 'savedAt' });
        }
      };
      req.onsuccess = () => resolve(req.result);
      req.onerror = () => reject(req.error ?? new Error('Could not open IndexedDB'));
    });
    return this.db;
  }

  async latest(): Promise<SaveRecord | undefined> {
    const db = await this.open();
    const all = await request(db.transaction(STORE).objectStore(STORE).getAll());
    return (all as SaveRecord[]).sort((a, b) => b.savedAt - a.savedAt)[0];
  }

  async write(record: SaveRecord): Promise<void> {
    const db = await this.open();
    const tx = db.transaction(STORE, 'readwrite');
    const store = tx.objectStore(STORE);
    store.put(record);
    const keys = (await request(store.getAllKeys())) as number[];
    for (const key of keys.sort((a, b) => b - a).slice(SAVES_KEPT)) store.delete(key);
    await done(tx);
  }

  async clear(): Promise<void> {
    const db = await this.open();
    const tx = db.transaction(STORE, 'readwrite');
    tx.objectStore(STORE).clear();
    await done(tx);
  }
}
