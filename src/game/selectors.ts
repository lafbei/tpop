import type { GameState, PlayerId } from "./types";


export const selectPlayer = (s: GameState, id: PlayerId) => s.players[id];
export const selectCurrent = (s: GameState) => s.players[s.currentPlayer];
export const selectTurnText = (s: GameState) => `Turn ${s.turn.turn} • Round ${s.turn.round}/${s.roundsPerAge}`;


export const selectNetPerRound = (s: GameState, id: PlayerId) => {
const p = s.players[id];
return (p.economy.taxIncome || 0) - (p.economy.upkeep || 0);
};