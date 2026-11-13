/**
 * The typed event bus. Systems talk through events and declared hook points
 * with explicit priorities, never by wrapping each other's functions.
 */
import type { GameDate } from './calendar';

export interface EngineEvents {
  HourPassed: { hours: number; date: GameDate };
  DayBegan: { hours: number; date: GameDate };
  SeasonBegan: { hours: number; date: GameDate };
  YearBegan: { hours: number; date: GameDate };
  Arrived: { hours: number; place: string; from: string };
}

export type EventName = keyof EngineEvents;
type Handler<K extends EventName> = (payload: EngineEvents[K]) => void;

interface Hook {
  priority: number;
  order: number;
  handler: (payload: never) => void;
}

export class EventBus {
  private hooks = new Map<EventName, Hook[]>();
  private count = 0;

  /** Handlers run by priority, lowest first; equal priorities run in the order they were added. */
  on<K extends EventName>(name: K, handler: Handler<K>, priority = 0): () => void {
    const hook: Hook = { priority, order: this.count++, handler: handler as Hook['handler'] };
    const list = [...(this.hooks.get(name) ?? []), hook].sort(
      (a, b) => a.priority - b.priority || a.order - b.order,
    );
    this.hooks.set(name, list);
    return () => {
      this.hooks.set(
        name,
        (this.hooks.get(name) ?? []).filter((h) => h !== hook),
      );
    };
  }

  emit<K extends EventName>(name: K, payload: EngineEvents[K]): void {
    for (const hook of this.hooks.get(name) ?? []) (hook.handler as Handler<K>)(payload);
  }
}
