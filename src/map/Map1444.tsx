// src/map/Map1444.tsx
import React from "react";
import { MapInteractionCSS } from "react-map-interaction";
import type { BoardState, Piece } from "../board/types";
import { ProvinceLocations } from "../data/provinceLocations"; // your Locations map
import { PieceSprite } from "./Piece";         // your Piece component
import { tokenSizes } from "../data/tokensizes" // wherever you keep sizes

type Props = { board: BoardState };

const controlTownPath = (owner: string) =>
  `src/assets/tokens/${owner}town.png`; // adjust if your filenames differ

const pieceImagePath = (p: Piece) => {
  // example filename pattern: yellow_army.png, yellow_ship.png, marker.png, etc.
  if (p.owner) return `src/assets/tokens/${p.owner}_${p.type}.png`;
  return `src/assets/tokens/neutral_${p.type}.png`; // or whatever you use for neutral
};

export const Map1444: React.FC<Props> = ({ board }) => {
  return (
    <MapInteractionCSS>
      <img src="src/assets/maps/mainmap.jpg" />

      {/* Control markers (town tokens) */}
      {Object.entries(board.provinces).map(([pid, prov]) => {
        if (!prov.control) return null;
        const coords = ProvinceLocations[pid as keyof typeof ProvinceLocations];
        if (!coords) return null;
        return (
          <PieceSprite
            key={`control-${pid}`}
            imagePath={controlTownPath(prov.control)}
            mapLocation={coords}
            size={tokenSizes.small.width}
          />
        );
      })}

      {/* Other pieces (armies, ships, markers) */}
      {Object.values(board.pieces).map((p) => {
        const coords = ProvinceLocations[p.location];
        if (!coords) return null;
        return (
          <PieceSprite
            key={p.id}
            imagePath={pieceImagePath(p)}
            mapLocation={coords}
            size={tokenSizes[p.size].width}
          />
        );
      })}
    </MapInteractionCSS>
  );
};
