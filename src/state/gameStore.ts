import { create } from "zustand";
import type { GameState } from "../types/eu-pop";
import { loadGrandCampaign } from "./loadGame";

type GameStore = {
  game: GameState;
  setAge: (age: GameState["age"]) => void;
  nextRound: () => void;
  adjustDucats: (realm: string, delta: number) => void;
  advanceTurnOrder: () => void;
  grantPrestige: (realm: string, amount: number) => void;
};

export const useGameStore = create<GameStore>((set) => ({
  game: loadGrandCampaign(),
  setAge: (age) => set((s) => ({ game: { ...s.game, age } })),
  nextRound: () => set((s) => ({ game: { ...s.game, round: s.game.round + 1 } })),
  adjustDucats: (realm, delta) => set((s) => {
    const p = s.game.players[realm];
    if (!p) return s;
    return {
      game: {
        ...s.game,
        players: {
          ...s.game.players,
          [realm]: { ...p, ducats: Math.max(0, p.ducats + delta) }
        }
      }
    };
  }),
  advanceTurnOrder: () => set((s) => {
    const next = [...s.game.turnOrder];
    next.push(next.shift()!);
    return { game: { ...s.game, turnOrder: next } };
  }),
  grantPrestige: (realm: string, amount: number) =>
    set((s) => {
      const p = s.game.players[realm];
      if (!p) return s;
      return {
        game: {
          ...s.game,
          players: {
            ...s.game.players,
            [realm]: { ...p, prestige: p.prestige + amount }
          }
        }
      };
    }),
}));
