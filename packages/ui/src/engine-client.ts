/**
 * The UI's link to the engine worker. It sends orders and keeps the latest
 * snapshot. It holds no game rules.
 */
import type { FromEngine, Order, Snapshot, ToEngine } from '@allora/engine';

type Listener = () => void;

export class EngineClient {
  private worker: Worker | undefined;
  private snapshot: Snapshot | undefined;
  private error: string | undefined;
  private listeners = new Set<Listener>();

  start(): void {
    if (this.worker) return;
    this.worker = new Worker(new URL('../../engine/src/worker.ts', import.meta.url), {
      type: 'module',
    });
    this.worker.onmessage = (event: MessageEvent<FromEngine>) => {
      const message = event.data;
      if (message.type === 'state') this.snapshot = message.snapshot;
      else if (message.type === 'error') this.error = message.message;
      else return;
      for (const listener of this.listeners) listener();
    };
    // `?rate=<ms per game hour>` speeds the clock up, for tests and debugging.
    const rate = Number(new URLSearchParams(location.search).get('rate'));
    this.post({ type: 'init', ...(rate > 0 ? { msPerGameHour: rate } : {}) });
    addEventListener('pagehide', () => this.send({ type: 'save' }));
    document.addEventListener('visibilitychange', () => {
      if (document.visibilityState === 'hidden') this.send({ type: 'save' });
    });
  }

  send(order: Order): void {
    this.post(order);
  }

  private post(message: ToEngine): void {
    this.worker?.postMessage(message);
  }

  subscribe = (listener: Listener): (() => void) => {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  };

  getSnapshot = (): Snapshot | undefined => this.snapshot;
  getError = (): string | undefined => this.error;
}

export const engine = new EngineClient();
