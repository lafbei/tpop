import { useGameStore } from "./state/gameStore";

export default function App() {
  const game = useGameStore((s) => s.game);
  const nextRound = useGameStore((s) => s.nextRound);

  return (
    <main style={{ padding: 16, fontFamily: "system-ui" }}>
      <h1>{game.scenario}</h1>
      <p>Age: {game.age} · Round: {game.round}</p>
      <p>Turn order: {game.turnOrder.join(" → ")}</p>

      <h2>Players</h2>
      <ul>
        {Object.entries(game.players).map(([name, p]) => (
          <li key={name}>
            <strong>{name}</strong> — ducats: {p.ducats}, religion: {p.stateReligion}
          </li>
        ))}
      </ul>

      <button onClick={nextRound}>Next Round</button>
    </main>
  );
}
