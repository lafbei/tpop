import React from "react";
import { useGame } from "../../game/state/useGame";
import { StatPill } from "./StatPill";
import { Flag } from "./Flag";
// if you have selectors, keep using them; here we read directly for brevity

export const PlayerHUDBar: React.FC = () => {
  const { state } = useGame();
  const p = state.players[state.currentPlayer];
  const net = (p.economy.taxIncome || 0) - (p.economy.upkeep || 0);
  const turnText = `Turn ${state.turn.turn} • Round ${state.turn.round}/${state.roundsPerAge}`;

  return (
    <div className="hud-root">
      <div className="hud-left">
        <Flag player={p.id} />
        <div className="hud-title">
          <div className="hud-country">{p.meta.name} ({p.meta.tag})</div>
          <div className="hud-ruler">Ruler: {p.meta.ruler}</div>
        </div>
      </div>

      <div className="hud-stats">
        <StatPill label="Stab" value={p.meta.stability} title="Stability (-3 to +3)" />
        <StatPill label="Upkeep" value={p.economy.upkeep} title="Per-round expenses" />
        <StatPill label="Tax" value={p.economy.taxIncome} title="Per-round income" />
        <StatPill label="Net" value={net} title="Income - expenses (per round)" />
        <StatPill label="Manpower" value={'todo'} title="Manpower" />
      </div>

      <div className="hud-right">
        <StatPill label="ADM" value={p.points.adm} title="Administrative power" />
        <StatPill label="DIP" value={p.points.dip} title="Diplomatic power" />
        <StatPill label="MIL" value={p.points.mil} title="Military power" />
        <StatPill label="Ducets" value={p.economy.treasury} title="Treasury (ducats)" />
        <div className="hud-turn" title="Turn / Round">{turnText}</div>
      </div>
    </div>
  );
};
