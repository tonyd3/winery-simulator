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
