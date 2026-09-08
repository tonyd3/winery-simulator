import { act } from '../src/game.ts';
import type { GameState } from '../src/game.ts';
import { DEFAULT_DESIGN, volume } from '../src/winemaking.ts';
export function bottleBatch(state: GameState, id: number) {
  const stored = act(state, { type: 'reserve', id });
  const r = stored.reserves.at(-1)!;
  return act(stored, {
    type: 'bottle',
    id: r.id,
    bottles: Math.floor(volume(r.components) / 750),
    line: { name: r.name, design: DEFAULT_DESIGN },
  });
}

import { RESEARCH, VARIETIES } from '../src/catalog.ts';
import type { ResearchId } from '../src/catalog.ts';
// Explicit prerequisites for tests focused on production or investment behavior.
export function learn(s: GameState, ...ids: ResearchId[]) {
  for (const id of ids) {
    learn(s, ...RESEARCH[id].requires);
    if (!s.research.includes(id)) s.research.push(id);
  }
  return s;
}
export function allGrapes(s: GameState) {
  s.grapeLicenses = Object.keys(VARIETIES);
  return s;
}
