import React from "react";
import { useGame } from "../../game/state/useGame"
import { selectCurrent, selectTurnText, selectNetPerRound } from "../../game/selectors";
import { StatPill } from "./StatPill";
import { Flag } from "./Flag";


export const PlayerHUDBar: React.FC = () => {
const { state } = useGame();
const p = selectCurrent(state);
const turnText = selectTurnText(state);
const net = selectNetPerRound(state, p.id);


return (
<div className="hud-root">
{/* Left: Flag + ruler */}
<div className="hud-left">
<Flag />
<div className="hud-title">
<div className="hud-country">{p.meta.name} ({p.meta.tag})</div>
<div className="hud-ruler">Ruler: {p.meta.ruler}</div>
</div>
</div>


{/* Center: Stats */}
<div className="hud-stats">
<StatPill label="Stab" value={p.meta.stability} title="Stability (-3 to +3)" />
<StatPill label="Upkeep" value={p.economy.upkeep} title="Per-round expenses" />
<StatPill label="Tax" value={p.economy.taxIncome} title="Per-round income" />
<StatPill label="Net" value={net} title="Income - expenses (per round)" />
</div>


{/* Right: Points + Treasury + Turn */}
<div className="hud-right">
<StatPill label="ADM" value={p.points.adm} title="Administrative power" />
<StatPill label="DIP" value={p.points.dip} title="Diplomatic power" />
<StatPill label="MIL" value={p.points.mil} title="Military power" />
<StatPill label="Ducats" value={p.economy.treasury} title="Treasury (ducats)" />
<div className="hud-turn" title="Turn / Round">{turnText}</div>
</div>
</div>
);
};