// src/mutations/moveArmy.ts
import type { GameState } from "../types/eu-pop";

export function moveArmy(
  g: GameState,
  realm: string,
  fromArea: string,
  toArea: string
): GameState {
  const player = g.players[realm];
  if (!player?.military?.armies) return g;
  const fromStack = player.military.armies[fromArea];
  if (!fromStack || fromStack.length === 0) return g;

  const newArmies = { ...player.military.armies };
  newArmies[fromArea] = [];
  newArmies[toArea] = [...(newArmies[toArea] ?? []), ...fromStack];

  return {
    ...g,
    players: {
      ...g.players,
      [realm]: {
        ...player,
        military: { ...player.military, armies: newArmies }
      }
    }
  };
}
