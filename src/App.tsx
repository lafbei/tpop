import GameProvider from "./game/state/GameProvider";
import { PlayerHUDBar } from "./ui/hud/PlayerHUDBar";
import "./ui/hud/hud.css";
import { Map1444 } from "./map/Map1444"; // your existing component
import { useBoardState } from "./board/useBoardState"; // from your previous setup


import { DevControls } from "./ui/dev/Controls";


export default function App() {
  const { board } = useBoardState();
  return (
    <GameProvider>
      <PlayerHUDBar />
      <DevControls board={board} />
      <Map1444 board={board} />
    </GameProvider>
  );
}