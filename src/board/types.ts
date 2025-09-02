import { ProvinceLocations } from "../data/provinceLocations"; // e.g., ../data/Locations
import type { PlayerId } from "../game/types";


export type ProvinceId = keyof typeof ProvinceLocations;
export type MaybeOwner = PlayerId | null;


export type PieceType = "town" | "army" | "fleet" | "marker" | "ship";
export type SizeKey = "small" | "medium" | "large";


export interface Piece {
    id: string;
    type: PieceType;
    owner: MaybeOwner; // null = neutral / no player
    location: ProvinceId;
    size: SizeKey;
}


export interface ProvinceState {
    control: MaybeOwner; // null = uncontrolled
}

export interface BoardState {
    provinces: Record<ProvinceId, ProvinceState>;
    pieces: Record<string, Piece>; // normalized by id
}
