import React from "react";
import { useGame } from "../../game/state/useGame";
import { PlayerIds } from "../../game/state/types";

const formatPrestige = (n: number) => String(n); // plain number per your request
// If you ever want track semantics:
// const formatPrestige = (n:number) => n > 60 ? `${n-60} (+60)` : n < 0 ? `-${Math.abs(n)}` : `${n}`;

const rowStyle: React.CSSProperties = { display: "grid", gridTemplateColumns: "100px 1fr 80px", gap: 8, padding: "6px 8px" };

export const PrestigeBoard: React.FC = () => {
  const { state } = useGame();
  const rows = PlayerIds
    .map((id) => state.players[id])
    .sort((a, b) => b.prestige - a.prestige);

  return (
    <div style={{
      position: "fixed",
      top: 92,
      right: 12,
      zIndex: 1001,
      width: 150,
      background: "rgba(20,20,24,0.85)",
      color: "#eee",
      border: "1px solid rgba(255,255,255,0.1)",
      borderRadius: 8,
      backdropFilter: "blur(6px)",
      overflow: "hidden",
    }}>
      <div style={{ ...rowStyle, fontWeight: 700, background: "rgba(255,255,255,0.06)", display: "flex", justifyContent: "space-between" }}>
        <div>Country</div>
        <div>Prestige</div>
      </div>
      {rows.sort((a, b) => b.prestige - a.prestige).map((p) => (
        <div key={p.id} style={{...rowStyle, display: "flex", justifyContent: "space-between"}}>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            {p.meta.name}
          </div>
          <div style={{ fontWeight: 700 }}>{formatPrestige(p.prestige)}</div>
        </div>
      ))}
    </div>
  );
};
