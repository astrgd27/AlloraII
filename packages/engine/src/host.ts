/**
 * The engine host: loads and writes saves, keeps the clock moving, and speaks
 * the message protocol. The worker is a thin shell around it, so everything
 * here runs in tests with a memory store and a pretend clock.
 */
import { Engine, type EngineOptions } from './engine';
import type { FromEngine, InitMessage, ToEngine } from './protocol';
import { migrate } from './save/migrations';
import type { SaveStore } from './save/store';
import { newGame } from './state';

export interface HostDeps {
  store: SaveStore;
  /** Real time now, in milliseconds since the epoch. */
  now: () => number;
  post: (message: FromEngine) => void;
  engineOptions?: EngineOptions;
}

export class EngineHost {
  engine: Engine | undefined;
  private options: EngineOptions = {};

  constructor(private readonly deps: HostDeps) {}

  /** Handles one message from the UI. */
  async receive(message: ToEngine): Promise<void> {
    try {
      if (message.type === 'init') await this.init(message);
      else if (!this.engine) throw new Error('The engine has not been started');
      else if (message.type === 'save') await this.save();
      else if (message.type === 'reset') await this.reset();
      else {
        this.engine.handle(message, this.deps.now());
        if (message.type === 'pause') await this.save();
        this.postState();
      }
    } catch (e) {
      this.deps.post({ type: 'error', message: e instanceof Error ? e.message : String(e) });
    }
  }

  private async init(message: InitMessage): Promise<void> {
    this.options = {
      ...this.deps.engineOptions,
      ...(message.msPerGameHour ? { msPerGameHour: message.msPerGameHour } : {}),
    };
    const now = this.deps.now();
    const saved = await this.deps.store.latest();
    if (saved) {
      this.start(new Engine(migrate(saved.data), this.options));
      this.engine?.catchUpTo(now);
    } else {
      const seed = message.seed ?? (now ^ 0x9e3779b9) >>> 0;
      this.start(new Engine(newGame(seed, now), this.options));
    }
    await this.save();
    this.postState();
  }

  private start(engine: Engine): void {
    this.engine = engine;
    // Autosave at the start of every game day.
    engine.bus.on('DayBegan', () => void this.save());
  }

  /** Call often (the worker does, a few times a second). Advances the clock and reports. */
  step(): void {
    if (!this.engine) return;
    this.engine.advanceTo(this.deps.now());
    this.postState();
  }

  async save(): Promise<void> {
    if (!this.engine) return;
    const now = this.deps.now();
    this.engine.advanceTo(now);
    await this.deps.store.write({ savedAt: now, data: this.engine.state });
    this.deps.post({ type: 'saved', hours: this.engine.state.hours });
  }

  private async reset(): Promise<void> {
    await this.deps.store.clear();
    const now = this.deps.now();
    this.start(new Engine(newGame((now ^ 0x9e3779b9) >>> 0, now), this.options));
    await this.save();
    this.postState();
  }

  private postState(): void {
    if (this.engine) this.deps.post({ type: 'state', snapshot: this.engine.snapshot() });
  }
}
