export type PlayerId = "yellow" | "green" | "blue" | "red" | "white" | "purple";
export const PlayerIds: PlayerId[] = ["yellow", "green", "blue", "red", "white", "purple"];

export interface MonarchPoints { adm: number; dip: number; mil: number; }

export interface Economy {
  treasury: number;   // ducats
  taxIncome: number;  // per-round income
  upkeep: number;     // per-round expenses
}

export interface PlayerMeta {
  tag: string;
  name: string;
  ruler: string;
  stability: number;  // -3..+3
}

export interface PlayerState {
  id: PlayerId;
  meta: PlayerMeta;
  points: MonarchPoints;
  economy: Economy;
  prestige: number;   // <-- NEW
}

export interface GameTurn { turn: number; round: number; }

export interface GameState {
  players: Record<PlayerId, PlayerState>;
  currentPlayer: PlayerId;
  turn: GameTurn;
  roundsPerAge: number;
}
