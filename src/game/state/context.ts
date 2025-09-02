import React from "react";
import type { GameState } from "./types";
import type { Action } from "./reducer";

export interface GameContextValue {
  state: GameState;
  dispatch: React.Dispatch<Action>;
}

export const GameContext = React.createContext<GameContextValue | null>(null);
