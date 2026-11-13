/// <reference lib="webworker" />
/**
 * The Web Worker entry. It only wires the host to the worker's messages, a
 * timer and IndexedDB; all rules live in the engine.
 */
import { EngineHost } from './host';
import type { FromEngine, ToEngine } from './protocol';
import { IndexedDbStore } from './save/indexeddb';

/** How often the clock is advanced and the state reported, in real milliseconds. */
const STEP_MS = 250;

const scope = self as unknown as DedicatedWorkerGlobalScope;

const host = new EngineHost({
  store: new IndexedDbStore(),
  now: () => Date.now(),
  post: (message: FromEngine) => scope.postMessage(message),
});

// Messages are handled one at a time, in the order they arrive.
let queue: Promise<void> = Promise.resolve();
scope.onmessage = (event: MessageEvent<ToEngine>) => {
  queue = queue.then(() => host.receive(event.data));
};

setInterval(() => host.step(), STEP_MS);
