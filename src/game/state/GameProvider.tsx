import React from "react";
import { GameContext } from "./context";
import { reducer, makeInitialGameState } from "./reducer";
import type { GameState } from "./types";

const GameProvider: React.FC<React.PropsWithChildren<{ initial?: Partial<GameState> }>> = ({
  initial,
  children,
}) => {
  const [state, dispatch] = React.useReducer(reducer, makeInitialGameState(initial));
  return <GameContext.Provider value={{ state, dispatch }}>{children}</GameContext.Provider>;
};

export default GameProvider;
