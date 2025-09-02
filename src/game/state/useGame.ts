import React from "react";
import { GameContext } from "./context";

export function useGame() {
  const ctx = React.useContext(GameContext);
  if (!ctx) throw new Error("useGame must be used within <GameProvider>");
  return ctx;
}
