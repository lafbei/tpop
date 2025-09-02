import type { BoardState } from "../board/types";
import type { PlayerId } from "../game/types";


/**
* Upkeep rules (as per your boardgame):
* - 1 ducat per Army piece
* - 1 ducat per 2 Ship pieces (rounded up)
* - No forts
*/
export function computeUpkeep(board: BoardState, player: PlayerId): number {
    let armies = 0;
    let ships = 0;
    for (const piece of Object.values(board.pieces)) {
        if (piece.owner !== player) continue;
        if (piece.type === "army") armies += 1;
        else if (piece.type === "ship") ships += 1;
    }
    const armyCost = armies; // 1 per army
    const shipCost = Math.ceil(ships / 2); // 1 per 2 ships, rounded up
    return armyCost + shipCost;
}


// If/when tax income has a rule, add a computeTaxIncome(board, player) here.