// src/ui/dev/Controls.tsx
import React from "react";
import { useGame } from "../../game/state/useGame";
import { PlayerIds, type PlayerId } from "../../game/state/types";
import type { BoardState } from "../../board/types";

type Props = { board: BoardState };

const isPlayerId = (v: string): v is PlayerId =>
  (PlayerIds as readonly string[]).includes(v);

export const DevControls: React.FC<Props> = ({ board }) => {
  const { state, dispatch } = useGame();

  const onNextRound = () => {
    // sync upkeep from the board before advancing the round
    dispatch({ type: "SET_UPKEEP_FROM_BOARD", board });
    dispatch({ type: "NEXT_ROUND" });
  };

  const onRoundsChange: React.ChangeEventHandler<HTMLInputElement> = (e) => {
    const v = Number(e.target.value);
    dispatch({ type: "SET_ROUNDS_PER_AGE", value: v });
  };

  const onPlayerChange: React.ChangeEventHandler<HTMLSelectElement> = (e) => {
    const v = e.target.value;
    if (!isPlayerId(v)) return;
    dispatch({ type: "SELECT_PLAYER", id: v });
  };


  return (
    <div
      style={{
        position: "fixed",
        top: 56,
        right: 12,
        zIndex: 1001,
        display: "flex",
        gap: 8,
        alignItems: "center",
      }}
    >
      <button onClick={onNextRound}>Next Round</button>

      <label style={{ display: "flex", alignItems: "center", gap: 4 }}>
        Rounds/Turn
        <input
          type="number"
          min={1}
          value={state.roundsPerAge}
          onChange={onRoundsChange}
          style={{ width: 56 }}
        />
      </label>

      <select value={state.currentPlayer} onChange={onPlayerChange}>
        {PlayerIds.map((id) => (
          <option key={id} value={id}>
            {id}
          </option>
        ))}
      </select>
    </div>
  );
};
