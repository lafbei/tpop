// src/components/GrandCampaignDebug.tsx
import { useMemo } from "react";
import data from "../data/s2-01-grand-campaign.json";
import type { GameState } from "../types/eu-pop";

export default function GrandCampaignDebug() {
  const game = data as unknown as GameState;

  const summary = useMemo(() => {
    const players = Object.entries(game.players).map(([name, p]) => ({
      name,
      provinces: p.provinces?.length ?? 0,
      fleets: Object.values(p.military?.fleets ?? {}).reduce((a, b) => a + b.length, 0),
      armies: Object.values(p.military?.armies ?? {}).reduce((a, b) => a + b.length, 0),
      ducats: p.ducats,
    }));
    return { players };
  }, [game]);

  return (
    <section className="p-4 space-y-3">
      <h1 className="text-xl font-bold">{game.scenario}</h1>
      <p>Age {game.age} · Round {game.round}</p>
      <p>Turn order: {game.turnOrder.join(" → ")}</p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {summary.players.map(p => (
          <article key={p.name} className="rounded-xl border p-3">
            <h2 className="font-semibold">{p.name}</h2>
            <ul className="text-sm">
              <li>Provinces: {p.provinces}</li>
              <li>Armies: {p.armies}</li>
              <li>Fleets: {p.fleets}</li>
              <li>Ducats: {p.ducats}</li>
            </ul>
          </article>
        ))}
      </div>
    </section>
  );
}
