/**
 * Tools (design bible, Items). A tool carried helps the work of its skill:
 * it adds to the roll of that skill's checks, and paid work done with it pays
 * a quarter more. Each hour of such work wears it; when it is spent it breaks,
 * and the next one in the pack is taken up.
 */
import type { Modifier } from './challenge';
import { note } from './log';
import type { GameState } from './state';
import type { Tool, World } from './world';

/** What a tool adds to the pay of work done with it. */
export const TOOL_PAY = 1.25;

/** The best tool the life carries for a skill, if any. */
export function toolFor(
  state: GameState,
  world: World,
  skill: string | undefined,
): Tool | undefined {
  if (!skill) return undefined;
  let best: Tool | undefined;
  for (const tool of world.toolsBySkill.get(skill) ?? []) {
    if ((state.goods[tool.item] ?? 0) > 0 && (!best || tool.edge > best.edge)) best = tool;
  }
  return best;
}

/** The tool's part in a check, named so the roll can always be explained. */
export function toolModifiers(
  state: GameState,
  world: World,
  skill: string | undefined,
): Modifier[] {
  const tool = toolFor(state, world, skill);
  return tool ? [{ source: world.items.get(tool.item)?.name ?? tool.item, value: tool.edge }] : [];
}

/** Hours of use left in the tool in hand. */
export function wearLeft(state: GameState, tool: Tool): number {
  return state.wear[tool.item] ?? tool.wear;
}

/** Wears the tool for a skill by some hours of work. Breaks it when spent. */
export function wearTool(
  state: GameState,
  world: World,
  skill: string | undefined,
  hours: number,
): void {
  const tool = toolFor(state, world, skill);
  if (!tool) return;
  const left = wearLeft(state, tool) - hours;
  if (left > 0) {
    state.wear[tool.item] = left;
    return;
  }
  const held = state.goods[tool.item] ?? 0;
  if (held <= 1) delete state.goods[tool.item];
  else state.goods[tool.item] = held - 1;
  delete state.wear[tool.item];
  note(state, { kind: 'broke', item: tool.item });
}
