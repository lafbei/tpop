// src/state/loadGame.ts
import type { GameState } from "../types/eu-pop";
import { seedS201 } from "./seed-castile-ottomans";

/**
 * Adapt Castile+Ottomans seed to your GameState.
 * - Hoists age/round/turnOrder to root
 * - Renames treasury -> ducats
 * - Keys players by realm name
 */
export function loadGrandCampaign(): GameState {
  const s = seedS201();

  const playersByRealm: GameState["players"] = {} as never;

  // seedS201().players is keyed by color; we want keys by realm
  for (const p of Object.values(s.players)) {
    playersByRealm[p.realm] = {
      // fields your store mutates/reads today
      ducats: p.treasury,
      prestige: p.prestige,
      // keep useful info for rendering/logic
      color: p.color,
      realm: p.realm,
      stateReligion: p.stateReligion,
      stability: p.stability,
      monarchPower: p.monarchPower,
      towns: p.towns,
      vassals: p.vassals,
      claims: p.claims,
      influence: p.influence,
      merchants: p.merchants,
      armies: p.armies,
      fleets: p.fleets,
      manpower: p.manpower,
      townTrack: p.townTrack,
      vassalTrack: p.vassalTrack,
      passed: p.passed,
    } as never;
  }

  // Turn order: your store rotates realm strings, not colors
  const turnOrder = s.meta.turnOrder
    .map((color) => Object.values(s.players).find((pl) => pl.color === color)?.realm)
    .filter(Boolean) as string[];

  const game: GameState = {
      age: s.meta.age,
      round: s.meta.round,
      turnOrder,
      players: playersByRealm,
      scenario: "",
      timePeriod: "",
      firstPlayer: "",
      global: {
          papalCuria: {},
          eventDeck: {
              ageI_firstHalf: [],
              ageI_secondHalf: [],
              ageII: [],
              ageIII: [],
              ageIV: []
          },
          powerStruggles: [],
          dynamicNPRs: []
      },
      victoryCondition: ""
  };

  return game;
}
