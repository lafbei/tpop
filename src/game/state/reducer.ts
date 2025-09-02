import type { BoardState } from "../../board/types";
import { computeUpkeep } from "../../econ/derived";
import { type GameState, type PlayerId, PlayerIds, type PlayerState } from "./types";

const clamp = (n: number, min: number, max: number) => Math.max(min, Math.min(max, n));

const makePlayer = (id: PlayerId, init?: Partial<PlayerState>): PlayerState => ({
  id,
  meta: {
    tag: id.slice(0, 3).toUpperCase(),
    name: id.charAt(0).toUpperCase() + id.slice(1),
    flagPath: `src/assets/flags/${id}.png`,
    ruler: "Regency Council",
    stability: 0,
    ...(init?.meta ?? {}),
  },
  points: { adm: 0, dip: 0, mil: 0, ...(init?.points ?? {}) },
  economy: { treasury: 0, taxIncome: 0, upkeep: 0, ...(init?.economy ?? {}) },
  prestige: init?.prestige ?? 0, // <-- seed
});

const mergePlayer = (base: PlayerState, patch?: Partial<PlayerState>): PlayerState => {
  if (!patch) return base;
  return {
    ...base,
    ...patch,
    meta: { ...base.meta, ...(patch.meta ?? {}) },
    points: { ...base.points, ...(patch.points ?? {}) },
    economy: { ...base.economy, ...(patch.economy ?? {}) },
    prestige: patch.prestige ?? base.prestige,
  };
};

export const makeInitialGameState = (overrides?: Partial<GameState>): GameState => {
  const basePlayers = PlayerIds.reduce((acc, id) => {
    acc[id] = makePlayer(id, overrides?.players?.[id]);
    return acc;
  }, {} as Record<PlayerId, PlayerState>);

  return {
    players: basePlayers,
    currentPlayer: overrides?.currentPlayer ?? "yellow",
    turn: overrides?.turn ?? { turn: 1, round: 1 },
    roundsPerAge: overrides?.roundsPerAge ?? 4,
  };
};

export type Action =
  | { type: "SELECT_PLAYER"; id: PlayerId }
  | { type: "SET_STABILITY"; id: PlayerId; value: number }
  | { type: "ADJUST_POINTS"; id: PlayerId; adm?: number; dip?: number; mil?: number }
  | { type: "SET_ECONOMY"; id: PlayerId; patch: Partial<PlayerState["economy"]> }
  | { type: "SET_PRESTIGE"; id: PlayerId; value: number }          // <-- NEW
  | { type: "ADJUST_PRESTIGE"; id: PlayerId; delta: number }        // <-- NEW
  | { type: "SET_UPKEEP_FROM_BOARD"; board: BoardState }
  | { type: "NEXT_ROUND" }
  | { type: "SET_ROUNDS_PER_AGE"; value: number };

export const reducer = (state: GameState, action: Action): GameState => {
  switch (action.type) {
    case "SELECT_PLAYER":
      return { ...state, currentPlayer: action.id };

    case "SET_STABILITY": {
      const p = state.players[action.id];
      const next = { ...p, meta: { ...p.meta, stability: clamp(action.value, -3, 3) } };
      return { ...state, players: { ...state.players, [action.id]: next } };
    }

    case "ADJUST_POINTS": {
      const p = state.players[action.id];
      const next = {
        ...p,
        points: {
          adm: Math.max(0, p.points.adm + (action.adm ?? 0)),
          dip: Math.max(0, p.points.dip + (action.dip ?? 0)),
          mil: Math.max(0, p.points.mil + (action.mil ?? 0)),
        },
      };
      return { ...state, players: { ...state.players, [action.id]: next } };
    }

    case "SET_ECONOMY": {
      const p = state.players[action.id];
      const next = { ...p, economy: { ...p.economy, ...action.patch } };
      return { ...state, players: { ...state.players, [action.id]: next } };
    }

    case "SET_PRESTIGE": {                      // <-- NEW
      const p = state.players[action.id];
      const next = { ...p, prestige: action.value };
      return { ...state, players: { ...state.players, [action.id]: next } };
    }

    case "ADJUST_PRESTIGE": {                   // <-- NEW
      const p = state.players[action.id];
      const next = { ...p, prestige: p.prestige + action.delta };
      return { ...state, players: { ...state.players, [action.id]: next } };
    }

    case "SET_UPKEEP_FROM_BOARD": {
      const players = { ...state.players };
      for (const id of Object.keys(players) as PlayerId[]) {
        const p = players[id];
        const upkeep = computeUpkeep(action.board, id);
        players[id] = { ...p, economy: { ...p.economy, upkeep } };
      }
      return { ...state, players };
    }

    case "NEXT_ROUND": {
      const players = { ...state.players };
      for (const id of Object.keys(players) as PlayerId[]) {
        const p = players[id];
        const net = (p.economy.taxIncome || 0) - (p.economy.upkeep || 0);
        const stabilityBonus = p.meta.stability * 0.1;
        const treasury = (p.economy.treasury || 0) + net * (1 + stabilityBonus);
        const mpBase = 1 + Math.max(0, p.meta.stability);
        players[id] = {
          ...p,
          economy: { ...p.economy, treasury },
          points: {
            adm: p.points.adm + mpBase,
            dip: p.points.dip + mpBase,
            mil: p.points.mil + mpBase,
          },
          // Prestige changes are scenario/event-driven, so we don't auto-change here.
        };
      }
      let { turn, round } = state.turn;
      round += 1;
      if (round > state.roundsPerTurn) { turn += 1; round = 1; }
      return { ...state, players, turn: { turn, round } };
    }

    case "SET_ROUNDS_PER_AGE": {
      const v = Math.max(1, Math.floor(action.value));
      return { ...state, roundsPerAge: v };
    }

    default:
      return state;
  }
};
