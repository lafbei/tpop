// src/selectors.ts
import type { GameState } from "./types/eu-pop";

export const listPlayers = (g: GameState) => Object.keys(g.players);

export const getProvinceOwner = (g: GameState, province: string) =>
  Object.entries(g.players).find(([, p]) => p.provinces?.includes(province))?.[0];

export const getArmiesInArea = (g: GameState, area: string) =>
  Object.entries(g.players).map(([name, p]) => ({
    realm: name,
    stack: p.military?.armies?.[area] ?? []
  })).filter(x => x.stack.length);
