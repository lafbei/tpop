import React, { useEffect, useMemo, useRef, useState } from "react";
import { MapInteractionCSS } from "react-map-interaction";
import state from "../data/s2-01-grand-campaign.json";
import type { GameState } from "../types/eu-pop";
import mapImg from "../assets/maps/mainmap.jpg";
import { ProvinceLocations } from "../data/provinceLocations";
import { TradeNodeLocations } from "../data/tradeNodeLocations";
import { Sprites } from "../assets/sprites";
import { tokenSizes } from "../data/tokensizes";
import { PieceSprite } from "../map/Piece";

type Locs = Record<string, { x: number; y: number }>;

export default function GrandCampaignMap({ captureMode = false, showPins = true, showUnits = true }) {
  const game = state as GameState;

  // --- image sizing so overlay matches exactly ---
  const imgRef = useRef<HTMLImageElement>(null);
  const [imgSize, setImgSize] = useState<{ w: number; h: number }>({ w: 0, h: 0 });

  useEffect(() => {
    if (!imgRef.current) return;
    const ro = new ResizeObserver(([entry]) => {
      const box = entry.contentRect;
      setImgSize({ w: box.width, h: box.height });
    });
    ro.observe(imgRef.current);
    return () => ro.disconnect();
  }, []);

  // --- capture hover + click in % relative to the image rect only ---
  const [hovered, setHovered] = useState<string | null>(null);
  const [lastCapture, setLastCapture] = useState<{ x: number; y: number } | null>(null);

  function percentFromEvent(e: React.MouseEvent) {
    if (!imgRef.current) return null;
    const rect = imgRef.current.getBoundingClientRect();
    const px = (e.clientX - rect.left) / rect.width;
    const py = (e.clientY - rect.top) / rect.height;
    return { x: +(px * 100).toFixed(2), y: +(py * 100).toFixed(2) };
  }

  function handleBackgroundClick(e: React.MouseEvent) {
    if (!captureMode) return;
    const p = percentFromEvent(e);
    if (!p) return;
    setLastCapture(p);
    navigator.clipboard?.writeText(`{ x: ${p.x}, y: ${p.y} }`).catch(() => {});
  }

  // --- markers built only from areas that exist in Locations ---
  const markers = useMemo(() => {
    if (!showUnits) return [];
    const out: Array<{ realm: string; area: string; x: number; y: number; label: string }> = [];
    for (const [realm, p] of Object.entries(game.players)) {
      const armies = p.military?.armies ?? {};
      for (const [area, units] of Object.entries(armies)) {
        const loc = (ProvinceLocations as Locs)[area];
        if (!loc) continue;
        out.push({ realm, area, x: loc.x, y: loc.y, label: `${realm}: ${units.join(", ")}` });
      }
    }
    return out;
  }, [game.players, showUnits]);

  return (
    <div className="relative w-screen h-screen bg-neutral-900 text-white">
      {/* HUD OUTSIDE the stage so it doesn't affect overlay size */}
      <div className="absolute left-2 top-2 z-10 flex flex-wrap items-center gap-2">
        <Badge>scroll=zoom · drag=pan</Badge>
        {captureMode && <Badge>click=capture %</Badge>}
        <Badge>Age {game.age} · Round {game.round}</Badge>
        <Badge>Turn: {game.turnOrder[0]}</Badge>
      </div>

      {/* Only the stage (image + overlays) goes inside MapInteractionCSS */}
      <MapInteractionCSS>
        <div className="relative inline-block select-none" onClick={handleBackgroundClick}>
          <img
            ref={imgRef}
            src={mapImg}
            alt="EUtPoP board"
            className="block max-w-none"
            draggable={false}
            onMouseMove={(e) => {
              const p = percentFromEvent(e);
              if (!p) return;
              setHovered(nearest(ProvinceLocations as Locs, p.x, p.y, 1.5));
            }}
            onMouseLeave={() => setHovered(null)}
          />

          {/* The overlay is absolutely sized to the image ONLY */}
          <div
            className="absolute left-0 top-0 pointer-events-none"
            style={{ width: imgSize.w, height: imgSize.h }}
          >
            {Object.entries(ProvinceLocations).map(([name, coords]) => (
                <PieceSprite key={name} imagePath={Sprites.greentown} mapLocation={coords} size={tokenSizes.small.width} />
            ))}
            {Object.entries(TradeNodeLocations).map(([name, coords]) => (
                <PieceSprite key={name} imagePath={Sprites.yellowtown} mapLocation={coords} size={tokenSizes.large.width} />
            ))}

            {/* province pins */}
            {showPins &&
              Object.entries(ProvinceLocations as Locs).map(([name, p]) => (
                <button
                  key={name}
                  className={`absolute -translate-x-1/2 -translate-y-1/2 pointer-events-auto rounded-full border
                    ${hovered === name ? "w-4 h-4 border-2" : "w-3 h-3 border"} bg-white/80`}
                  style={{ left: `${p.x}%`, top: `${p.y}%` }}
                  title={name}
                  onClick={(e) => {
                    e.stopPropagation();
                    // eslint-disable-next-line no-alert
                    alert(name);
                  }}
                />
              ))}

            {/* unit markers */}
            {showUnits &&
              markers.map((m, i) => (
                <div
                  key={`${m.realm}-${m.area}-${i}`}
                  className="absolute -translate-x-1/2 -translate-y-full"
                  style={{ left: `${m.x}%`, top: `${m.y}%` }}
                  title={m.label}
                >
                  <div className="px-2 py-1 rounded bg-black/70 border border-white/30 text-xs whitespace-nowrap">
                    {m.realm}
                  </div>
                </div>
              ))}

            {/* hover tooltip */}
            {hovered && (ProvinceLocations as Locs)[hovered] && (
              <div
                className="absolute -translate-x-1/2 -translate-y-full bg-black/80 border border-white/30 text-xs px-2 py-1 rounded pointer-events-none"
                style={{
                  left: `${(ProvinceLocations as Locs)[hovered].x}%`,
                  top: `${(ProvinceLocations as Locs)[hovered].y}%`,
                }}
              >
                {hovered}
              </div>
            )}

            {/* capture readout (absolute inside overlay, doesn't change size) */}
            {captureMode && lastCapture && (
              <div className="absolute left-2 bottom-2 bg-black/70 border border-white/30 text-xs px-2 py-1 rounded pointer-events-none">
                captured: x {lastCapture.x}% · y {lastCapture.y}%
              </div>
            )}
          </div>
        </div>
      </MapInteractionCSS>
    </div>
  );
}

/* helpers */
function nearest(locations: Locs, px: number, py: number, radius = 1.5): string | null {
  let best: string | null = null;
  let bd = Infinity;
  for (const [k, p] of Object.entries(locations)) {
    const dx = p.x - px;
    const dy = p.y - py;
    const d = Math.hypot(dx, dy);
    if (d < bd && d <= radius) {
      bd = d; best = k;
    }
  }
  return best;
}

function Badge({ children }: { children: React.ReactNode }) {
  return <span className="px-2 py-1 rounded bg-black/60 border border-white/30 text-xs">{children}</span>;
}
