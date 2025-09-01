// src/components/TurnBar.tsx
import { useGameStore } from "../state/gameStore";
export default function TurnBar() {
  const order = useGameStore(s => s.game.turnOrder);
  const advance = useGameStore(s => s.advanceTurnOrder);
  const grant = useGameStore(s => s.grantPrestige);

  return (
    <div className="flex gap-2 items-center p-2 border rounded-xl">
      <span>Turn: {order[0]}</span>
      <button onClick={advance}>End Turn</button>
      <button onClick={() => grant(order[0], 1)}>+1 Prestige to current</button>
    </div>
  );
}
