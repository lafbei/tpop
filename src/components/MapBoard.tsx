import React, { useMemo, useRef, useState } from "react";
import { usePanZoom } from "../hooks/usePanZoom";
import ProvincePins from "./ProvincePins";
import type { Locs } from "./ProvincePins";

// import your map image
import mapImg from "../assets/maps/mainmap.jpg";

type UnitStack = {
  area: string;
  units: string[]; // ["2 Infantry", "1 Cavalry"]
};
type UnitsByRealm = Record<string, UnitStack[]>;

type Props = {
  locations: Locs;
  onProvinceClick?: (name: string) => void;
  captureMode?: boolean;
  units?: UnitsByRealm; // optional rendering of unit stacks
};

export default function MapBoard({ locations, onProvinceClick, captureMode = false, units }: Props) {
  const { containerRef, transform, onWheel, onPointerDown, onPointerMove, onPointerUp } = usePanZoom();
  const [hovered, setHovered] = useState<string | null>(null);
  const [lastCapture, setLastCapture] = useState<{ x: number; y: number } | null>(null);
  const imgRef = useRef<HTMLImageElement>(null);

  const handleBackgroundClick = (e: React.MouseEvent) => {
    if (!captureMode || !imgRef.current) return;

    // get % coords relative to image
    const rect = imgRef.current.getBoundingClientRect();
    const px = (e.clientX - rect.left) / rect.width;
    const py = (e.clientY - rect.top) / rect.height;
    const x = +(px * 100).toFixed(2);
    const y = +(py * 100).toFixed(2);

    setLastCapture({ x, y });
    const str = `{ x: ${x}, y: ${y} }`;
    navigator.clipboard?.writeText(str).catch(() => {});
    console.log("Captured:", str);
  };

  // render unit markers if provided
  const unitMarkers = useMemo(() => {
    if (!units) return [];
    const out: { left: string; top: string; realm: string; label: string }[] = [];
    for (const [realm, stacks] of Object.entries(units)) {
      for (const s of stacks) {
        const p = locations[s.area];
        if (!p) continue;
        out.push({
          left: `${p.x}%`,
          top: `${p.y}%`,
          realm,
          label: `${realm}: ${s.units.join(", ")}`
        });
      }
    }
    return out;
  }, [units, locations]);

  return (
    <div className="relative w-full h-full overflow-hidden bg-neutral-900 text-white">
      <div
        ref={containerRef}
        className="absolute inset-0 touch-none"
        onWheel={onWheel}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
      >
        <div className="origin-top-left" style={{ transform }}>
          <div className="relative inline-block select-none" onClick={handleBackgroundClick}>
            <img
              ref={imgRef}
              src={mapImg}
              alt="World Map"
              draggable={false}
              className="block max-w-none"
              onMouseMove={(e) => {
                if (!imgRef.current) return;
                const rect = imgRef.current.getBoundingClientRect();
                const px = ((e.clientX - rect.left) / rect.width) * 100;
                const py = ((e.clientY - rect.top) / rect.height) * 100;
                // show nearest province name if within 1.5% radius
                const near = nearestProvince(locations, px, py, 1.5);
                setHovered(near ?? null);
              }}
              onMouseLeave={() => setHovered(null)}
            />

            {/* province pins */}
            <ProvincePins
              locations={locations}
              onSelect={(n) => onProvinceClick?.(n)}
              hovered={hovered ?? undefined}
            />

            {/* unit markers */}
            <div className="absolute inset-0 pointer-events-none">
              {unitMarkers.map((m, i) => (
                <div
                  key={i}
                  className="absolute -translate-x-1/2 -translate-y-full pointer-events-none"
                  style={{ left: m.left, top: m.top }}
                  title={m.label}
                >
                  <div className="px-2 py-1 rounded bg-black/70 border border-white/30 text-xs whitespace-nowrap">
                    {m.realm}
                  </div>
                </div>
              ))}
            </div>

            {/* capture badge */}
            {captureMode && lastCapture && (
              <div className="absolute left-2 top-2 bg-black/70 border border-white/30 text-xs px-2 py-1 rounded">
                captured: x {lastCapture.x}% · y {lastCapture.y}%
              </div>
            )}

            {/* hover tooltip */}
            {hovered && locations[hovered] && (
              <div
                className="absolute -translate-x-1/2 -translate-y-full bg-black/80 border border-white/30 text-xs px-2 py-1 rounded pointer-events-none"
                style={{
                  left: `${locations[hovered].x}%`,
                  top: `${locations[hovered].y}%`,
                }}
              >
                {hovered}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* controls overlay */}
      <div className="absolute left-2 bottom-2 flex gap-2">
        <div className="px-2 py-1 rounded bg-black/60 border border-white/30 text-xs">
          scroll = zoom · drag = pan {captureMode ? "· click = capture coords" : ""}
        </div>
      </div>
    </div>
  );
}

// return nearest province key within threshold (% of width/height)
function nearestProvince(
  locations: Record<string, { x: number; y: number }>,
  px: number,
  py: number,
  radius = 1.5
) {
  let best: string | null = null;
  let bd = Infinity;
  for (const [k, p] of Object.entries(locations)) {
    const dx = p.x - px;
    const dy = p.y - py;
    const d = Math.hypot(dx, dy);
    if (d < bd && d <= radius) {
      bd = d;
      best = k;
    }
  }
  return best;
}
