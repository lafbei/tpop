import GameProvider from "./game/state/GameProvider";
import { PlayerHUDBar } from "./ui/hud/PlayerHUDBar";
import { PrestigeBoard } from "./ui/panels/PrestigeBoard";
import "./ui/hud/hud.css";
import { Map1444 } from "./map/Map1444";
import { useBoardState } from "./board/useBoardState";
import { DevControls } from "./ui/dev/Controls";

export default function App() {
  const { board } = useBoardState();
  return (
    <GameProvider>
      <PlayerHUDBar />
      <PrestigeBoard />
      <DevControls board={board} />
      <Map1444 board={board} />
    </GameProvider>
  );
}
