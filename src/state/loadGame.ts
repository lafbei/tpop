import raw from "../data/s2-01-grand-campaign.json";
import type { GameState } from "../types/eu-pop";

export function loadGrandCampaign(): GameState {
  return raw as GameState;
}
