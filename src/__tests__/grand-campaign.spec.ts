// src/__tests__/grand-campaign.spec.ts
import { describe, it, expect } from "vitest";
import raw from "../data/s2-01-grand-campaign.json";

type AnyRec = Record<string, any>;
const game = raw as AnyRec;

describe("Grand Campaign data", () => {
  it("has core fields", () => {
    expect(game.scenario).toBeTruthy();
    expect(game.age).toBe("I");
    expect(game.round).toBe(1);
    expect(Array.isArray(game.turnOrder)).toBe(true);
    expect(Object.keys(game.players).length).toBe(6);
  });

  it("players have basic resources", () => {
    for (const [name, p] of Object.entries<AnyRec>(game.players)) {
      expect(p.ducats).toBeGreaterThanOrEqual(0);
      expect(p.monarchPower).toBeTruthy();
      expect(typeof p.monarchPower.a).toBe("number");
      expect(typeof p.monarchPower.b).toBe("number");
      expect(typeof p.monarchPower.c).toBe("number");
    }
  });

  it("event decks exist for all ages", () => {
    const ed = game.global.eventDeck;
    expect(Array.isArray(ed.ageI_firstHalf)).toBe(true);
    expect(Array.isArray(ed.ageI_secondHalf)).toBe(true);
    expect(Array.isArray(ed.ageII)).toBe(true);
    expect(Array.isArray(ed.ageIII)).toBe(true);
    expect(Array.isArray(ed.ageIV)).toBe(true);
  });

  it("papal curia has five seats", () => {
    expect(Object.keys(game.global.papalCuria).length).toBe(5);
  });
});
