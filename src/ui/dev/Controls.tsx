import React from "react";
import { useGame } from "../../game/state/useGame";
import { PlayerIds, type PlayerId } from "../../game/state/types";
import type { BoardState } from "../../board/types";


type Props = { board: BoardState };


export const DevControls: React.FC<Props> = ({ board }) => {
const { state, dispatch } = useGame();
const p = state.players[state.currentPlayer];


// --- handlers -----------------------------------------------------
const onNextRound = () => {
dispatch({ type: "SET_UPKEEP_FROM_BOARD", board });
dispatch({ type: "NEXT_ROUND" });
};


const onPlayerChange: React.ChangeEventHandler<HTMLSelectElement> = (e) => {
dispatch({ type: "SELECT_PLAYER", id: e.target.value as PlayerId });
};


const setRoundsPerAge: React.ChangeEventHandler<HTMLInputElement> = (e) => {
const v = Number(e.target.value);
if (Number.isFinite(v)) dispatch({ type: "SET_ROUNDS_PER_AGE", value: v });
};


const setStability: React.ChangeEventHandler<HTMLInputElement> = (e) => {
const v = Number(e.target.value);
if (Number.isFinite(v)) dispatch({ type: "SET_STABILITY", id: p.id, value: v });
};


const adjustPrestige = (delta: number) => dispatch({ type: "ADJUST_PRESTIGE", id: p.id, delta });
const setPrestigeExact: React.ChangeEventHandler<HTMLInputElement> = (e) => {
const v = Number(e.target.value);
if (Number.isFinite(v)) dispatch({ type: "SET_PRESTIGE", id: p.id, value: v });
};


const adjustMP = (key: "adm" | "dip" | "mil", delta: number) =>
dispatch({ type: "ADJUST_POINTS", id: p.id, [key]: delta } as never);


const setMPExact = (key: "adm" | "dip" | "mil") => (e: React.ChangeEvent<HTMLInputElement>) => {
const v = Number(e.target.value);
if (!Number.isFinite(v)) return;
const curr = p.points[key];
dispatch({ type: "ADJUST_POINTS", id: p.id, [key]: v - curr } as never);
};


const setEconomy = (patch: Partial<typeof p.economy>) =>
dispatch({ type: "SET_ECONOMY", id: p.id, patch });

// --- UI -----------------------------------------------------------
const row: React.CSSProperties = { display: "flex", gap: 8, alignItems: "center", marginBottom: 6 };
const num: React.CSSProperties = { width: 72 };
const card: React.CSSProperties = {
position: "fixed",
top: 92,
left: 12,
zIndex: 1001,
width: 420,
background: "rgba(20,20,24,0.88)",
color: "#eee",
border: "1px solid rgba(255,255,255,0.1)",
borderRadius: 8,
padding: 12,
backdropFilter: "blur(6px)",
};

return (<div style={card}>
<div style={{ ...row, justifyContent: "space-between" }}>
<strong>Dev Controls</strong>
<div>Round {state.turn.round}/{state.roundsPerAge} • Turn {state.turn.turn}</div>
</div>
<div style={row}>
<button onClick={onNextRound}>Next Round</button>
<label style={{ display: "flex", alignItems: "center", gap: 6 }}>
Rounds/Age
<input type="number" min={1} value={state.roundsPerAge} onChange={setRoundsPerAge} style={{ width: 64 }} />
</label>
<select value={state.currentPlayer} onChange={onPlayerChange}>
{PlayerIds.map((id) => (
<option key={id} value={id}>{id}</option>
))}
</select>
</div>


<hr style={{ opacity: 0.2, margin: "8px 0" }} />


<div style={row}>
<label>Stability</label>
<input type="number" min={-3} max={3} value={p.meta.stability} onChange={setStability} style={num} />
</div>


<div style={row}>
<label>Prestige</label>
<button onClick={() => adjustPrestige(-5)}>-5</button>
<button onClick={() => adjustPrestige(-1)}>-1</button>
<input type="number" value={p.prestige} onChange={setPrestigeExact} style={num} />
<button onClick={() => adjustPrestige(+1)}>+1</button>
<button onClick={() => adjustPrestige(+5)}>+5</button>
</div>


<div style={row}>
<label>ADM</label>
<button onClick={() => adjustMP("adm", -1)}>-1</button>
<input type="number" value={p.points.adm} onChange={setMPExact("adm")} style={num} />
<button onClick={() => adjustMP("adm", +1)}>+1</button>
</div>
<div style={row}>
<label>DIP</label>
<button onClick={() => adjustMP("dip", -1)}>-1</button>
<input type="number" value={p.points.dip} onChange={setMPExact("dip")} style={num} />
<button onClick={() => adjustMP("dip", +1)}>+1</button>
</div>
<div style={row}>
<label>MIL</label>
<button onClick={() => adjustMP("mil", -1)}>-1</button>
<input type="number" value={p.points.mil} onChange={setMPExact("mil")} style={num} />
<button onClick={() => adjustMP("mil", +1)}>+1</button>
</div>


<hr style={{ opacity: 0.2, margin: "8px 0" }} />


<div style={row}>
<label>Treasury</label>
<input type="number" value={p.economy.treasury} onChange={(e) => setEconomy({ treasury: Number(e.target.value) })} style={num} />
</div>
<div style={row}>
<label>Tax income</label>
<input type="number" value={p.economy.taxIncome} onChange={(e) => setEconomy({ taxIncome: Number(e.target.value) })} style={num} />
</div>
<div style={row}>
<label>Upkeep</label>
<input type="number" value={p.economy.upkeep} onChange={(e) => setEconomy({ upkeep: Number(e.target.value) })} style={num} />
<button onClick={() => dispatch({ type: "SET_UPKEEP_FROM_BOARD", board })}>sync from board</button>
</div>
</div>
);
};