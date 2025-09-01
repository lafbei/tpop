// src/components/Sidebar.tsx
import { useGameStore } from "../state/gameStore"

export default function Sidebar() {
  const game = useGameStore((s) => s.game);
  const nextRound = useGameStore((s) => s.nextRound);

  return (
    <aside className="p-3">
      <div>Scenario: {game.scenario}</div>
      <div>Age: {game.age}</div>
      <div>Round: {game.round}</div>
      <div>Turn Order: {game.turnOrder.join(" → ")}</div>
      <button onClick={nextRound}>Next Round</button>
    </aside>
  );
}
