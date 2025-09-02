import { useCallback, useMemo, useState } from "react";
import { ProvinceLocations } from "../data/provinceLocations"; // adjust path
import type { BoardState, MaybeOwner, Piece, ProvinceId, ProvinceState } from "./types";

function buildInitialProvinces(): Record<ProvinceId, ProvinceState> {
return (Object.keys(ProvinceLocations) as ProvinceId[]).reduce((acc, pid) => {
acc[pid] = { control: null };
return acc;
}, {} as Record<ProvinceId, ProvinceState>);
}

export function useBoardState(initial?: Partial<BoardState>) {
const [board, setBoard] = useState<BoardState>(() => ({
provinces: { ...buildInitialProvinces(), ...(initial?.provinces ?? {}) },
pieces: { ...(initial?.pieces ?? {}) },
}));


const setControl = useCallback((province: ProvinceId, owner: MaybeOwner) => {
setBoard(prev => ({
...prev,
provinces: { ...prev.provinces, [province]: { control: owner } },
}));
}, []);

const bulkSetControl = useCallback((input: Array<[ProvinceId, MaybeOwner]> | Partial<Record<ProvinceId, MaybeOwner>>) => {
setBoard(prev => {
const next = { ...prev.provinces } as Record<ProvinceId, ProvinceState>;
if (Array.isArray(input)) {
for (const [pid, owner] of input) next[pid] = { control: owner };
} else {
for (const [pid, owner] of Object.entries(input) as Array<[ProvinceId, MaybeOwner]>) {
next[pid] = { control: owner };
}
}
return { ...prev, provinces: next };
});
}, []);


const upsertPiece = useCallback((piece: Piece) => {
setBoard(prev => ({ ...prev, pieces: { ...prev.pieces, [piece.id]: piece } }));
}, []);


const removePiece = useCallback((id: string) => {
setBoard(prev => {
const next = { ...prev.pieces };
delete next[id];
return { ...prev, pieces: next };
});
}, []);

const clearPieces = useCallback(() => {
setBoard(prev => ({ ...prev, pieces: {} }));
}, []);


// Useful selector: pieces grouped by province (for stacking/offsets)
const piecesByProvince = useMemo(() => {
const map: Partial<Record<ProvinceId, Piece[]>> = {};
for (const p of Object.values(board.pieces)) {
(map[p.location] ||= []).push(p);
}
return map;
}, [board.pieces]);


    const getPiecesAtProvince = useCallback((pid: ProvinceId) => piecesByProvince[pid] ?? [], [piecesByProvince]);


    return {
        board,
        setControl,
        bulkSetControl,
        upsertPiece,
        removePiece,
        clearPieces,
        getPiecesAtProvince,
    } as const;
}