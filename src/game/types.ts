export type PlayerId = "yellow" | "green" | "blue" | "red" | "white" | "purple";
export const PlayerIds: PlayerId[] = ["yellow","green","blue","red","white","purple"];


export interface MonarchPoints { adm: number; dip: number; mil: number; }


export interface Economy {
treasury: number; // current ducats
taxIncome: number; // per round income (ducats)
upkeep: number; // per round expenses (ducats)
}


export interface PlayerMeta {
tag: string; // e.g., "FRA"
name: string; // e.g., "France"
flagPath: string; // path to flag image
ruler: string; // ruler name
stability: number; // -3..+3
}


export interface PlayerState {
id: PlayerId;
meta: PlayerMeta;
points: MonarchPoints;
economy: Economy;
}


export interface GameTurn { turn: number; round: number; } // boardgame pacing


export interface GameState {
players: Record<PlayerId, PlayerState>;
currentPlayer: PlayerId;
turn: GameTurn; // current turn
roundsPerAge: number; // e.g., 4 rounds per age
}