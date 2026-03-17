/**
 * Complete Enhanced Game State for Europa Universalis
 * Integrates all game systems into a unified state
 */

import type { PlayerId } from "./types";
import type { Province, Area, CountryID, ProvinceID, AreaID, Religion } from "../../types/GameEntities";
import type { PlayerCardState, GameCardState } from "../cards/types";
import type { War, Army, Fleet, MilitaryUnit, Siege, UnrestToken, RebelUnit } from "../warfare/types";
import type {
  DiplomaticRelation,
  AreaInfluence,
  RoyalMarriage,
  Alliance,
  Claim,
  Merchant,
  TradeNode,
  PapalCuria,
  HolyRomanEmpire,
} from "../diplomacy/types";
import type { PlayerMissionState, GameMilestoneState } from "../missions/types";
import type { AIProfile, AIStrategy } from "../ai/types";
import type { GameAction } from "../actions/types";

// ==================== ENHANCED PLAYER STATE ====================
export interface EnhancedPlayerState {
  // Identity
  id: PlayerId;
  isAI: boolean;
  aiProfile?: AIProfile;
  
  // Basic info
  nationTag: CountryID; // "FRA", "CAS", "ENG", etc.
  nationName: string;
  color: string;
  
  // Ruler
  ruler: {
    name: string;
    cardId?: string;
    skills: {
      administrative: number; // 0-6
      diplomatic: number;
      military: number;
    };
    isInterregnum: boolean; // No ruler currently
  };
  
  // Monarch Power
  monarchPower: {
    administrative: number;
    diplomatic: number;
    military: number;
    
    // Generation per round (base + advisers + ruler)
    generationRates: {
      administrative: number;
      diplomatic: number;
      military: number;
    };
  };
  
  // Economy
  economy: {
    ducats: number;
    taxIncome: number; // Per round from provinces
    tradeIncome: number; // Last round's trade earnings
    upkeep: number; // Military + adviser costs
    
    loans: number; // Interest tokens
    interestCost: number; // -1 income per loan
  };
  
  // Power and prestige
  prestige: number;
  stability: number; // -3 to +3
  manpower: number; // Available for recruitment
  
  // National focus
  nationalFocus?: "administrative" | "diplomatic" | "military";
  focusChangedThisRound: boolean;
  
  // Territory
  provinces: ProvinceID[]; // Owned provinces
  coreProvinces: ProvinceID[]; // Provinces with nation's flag
  capital: ProvinceID;
  totalTaxValue: number; // Sum of all town values
  
  // Vassals and subjects
  vassals: CountryID[];
  isVassal: boolean;
  overlord?: PlayerId | CountryID;
  
  // Religion
  stateReligion: Religion;
  religiousDissent: ProvinceID[]; // Provinces not following state religion
  
  // Cards
  cardState: PlayerCardState;
  
  // Missions
  missionState: PlayerMissionState;
  
  // Military
  armies: Record<string, Army>;
  fleets: Record<string, Fleet>;
  availableUnits: {
    infantry: number;
    cavalry: number;
    artillery: number;
    lightShips: number;
    heavyShips: number;
    galleys: number;
  };
  exhaustedUnits: string[]; // Unit IDs that need refreshing
  
  // Diplomacy
  alliances: string[]; // Alliance IDs
  royalMarriages: string[]; // Marriage IDs
  influenceCubes: string[]; // Influence cube IDs
  claims: string[]; // Claim IDs
  merchants: string[]; // Merchant IDs
  
  // War and Peace
  activeWars: string[]; // War IDs where this player is involved
  truces: string[]; // Truce IDs
  atWarWith: (PlayerId | CountryID)[];
  
  // Unrest
  unrestTokens: string[]; // Unrest token IDs on our provinces
  
  // Ideas
  researchedIdeas: string[];
  
  // Special roles
  isEmperor: boolean; // Holy Roman Emperor
  isPapalController: boolean; // Controls Catholic Church
  
  // HRE-specific (if emperor)
  imperialAuthority?: number;
  
  // Cardinals (if Catholic)
  cardinals: number;
  
  // Colonization
  colonists: number; // Available colonists
  colonialClaims: string[]; // Claim IDs on distant continents
  
  // Turn state
  hasPlayedEvent: boolean; // Required before passing
  hasPassed: boolean;
  actionsThisTurn: number;
}

// ==================== COMPLETE GAME STATE ====================
export interface CompleteGameState {
  // Game info
  gameId: string;
  scenarioId: string;
  scenarioName: string;
  
  // Time
  currentAge: number; // 1-4
  currentRound: number; // 1-4 per age usually
  roundsPerAge: number;
  totalRounds: number; // Track across all ages
  
  // Phase tracking
  currentPhase:
    | "setup"
    | "draw_cards"
    | "actions"
    | "peace_and_rebels"
    | "income_and_upkeep"
    | "cleanup"
    | "age_transition"
    | "game_over";
  
  // Turn order
  firstPlayer: PlayerId;
  turnOrder: PlayerId[];
  currentPlayer: PlayerId;
  passedPlayers: PlayerId[]; // Who has passed this round
  passOrder: PlayerId[]; // Order players passed (for bonuses)
  
  // Players
  players: Record<PlayerId, EnhancedPlayerState>;
  humanPlayers: PlayerId[]; // Which players are human
  aiPlayers: PlayerId[]; // Which players are AI
  
  // AI state
  aiStrategies?: Record<PlayerId, AIStrategy>;
  
  // Map state
  provinces: Record<ProvinceID, Province>;
  areas: Record<AreaID, Area>;
  
  // Non-player realms
  nprs: Record<CountryID, NonPlayerRealmState>;
  
  // Diplomacy
  alliances: Record<string, Alliance>;
  royalMarriages: Record<string, RoyalMarriage>;
  diplomaticRelations: Record<string, DiplomaticRelation>;
  areaInfluence: Record<AreaID, AreaInfluence>;
  claims: Record<string, Claim>;
  
  // Trade
  tradeNodes: Record<string, TradeNode>;
  merchants: Record<string, Merchant>;
  
  // Military
  wars: Record<string, War>;
  armies: Record<string, Army>;
  fleets: Record<string, Fleet>;
  units: Record<string, MilitaryUnit>;
  sieges: Record<string, Siege>;
  
  // Unrest and rebels
  unrestTokens: Record<string, UnrestToken>;
  rebelUnits: Record<string, RebelUnit>;
  
  // Cards
  cardState: GameCardState;
  
  // Missions and milestones
  milestoneState: GameMilestoneState;
  
  // Special institutions
  papalCuria: PapalCuria;
  holyRomanEmpire: HolyRomanEmpire;
  
  // Victory conditions
  victoryConditions: {
    type: "most_prestige" | "mission_completion" | "custom";
    description: string;
    targetPrestige?: number;
  };
  
  // Game options
  options: {
    useDynamicNPRs: boolean;
    useAdvancedRules: boolean;
    difficulty: "easy" | "medium" | "hard" | "expert";
    enableAI: boolean;
  };
  
  // History / log
  gameLog: GameLogEntry[];
  
  // UI state
  selectedProvince?: ProvinceID;
  selectedArmy?: string;
  selectedFleet?: string;
  hoveredArea?: AreaID;
}

// ==================== NON-PLAYER REALM STATE ====================
export interface NonPlayerRealmState {
  id: CountryID;
  name: string;
  flag: string;
  
  // Territory
  provinces: ProvinceID[];
  coreProvinces: ProvinceID[];
  capital: ProvinceID;
  taxValue: number;
  
  // Status
  isVassal: boolean;
  overlord?: PlayerId | CountryID;
  isDynamic: boolean; // Uses advanced AI rules
  
  // Diplomacy
  stateReligion: Religion;
  alliances: PlayerId[]; // Allied with these players
  isActiveAlly: boolean; // Currently in a war
  activeAllyOf?: PlayerId;
  
  // Military
  militaryCapacity: number;
  currentUnits: string[]; // Unit IDs if defending
  
  // Influence
  influencedBy: Record<PlayerId, number>; // Players with influence here
}

// ==================== GAME LOG ====================
export type GameLogEntryType =
  | "war_declared"
  | "war_ended"
  | "battle"
  | "siege_completed"
  | "province_gained"
  | "province_lost"
  | "alliance_formed"
  | "alliance_broken"
  | "royal_marriage"
  | "leader_died"
  | "ruler_changed"
  | "idea_researched"
  | "mission_completed"
  | "milestone_achieved"
  | "stability_change"
  | "event_occurred"
  | "age_transition"
  | "rebellion"
  | "bankruptcy";

export interface GameLogEntry {
  id: string;
  round: number;
  timestamp: number;
  type: GameLogEntryType;
  
  // Participants
  primaryActor?: PlayerId | CountryID;
  secondaryActor?: PlayerId | CountryID;
  
  // Details
  description: string;
  details?: Record<string, unknown>;
  
  // Impact
  prestigeChanges?: Record<PlayerId, number>;
  provinceChanges?: {
    gained: ProvinceID[];
    lost: ProvinceID[];
  };
  
  // Visibility
  visibleTo: "all" | "participants" | PlayerId[];
}

// ==================== GAME PHASE HANDLERS ====================
export interface PhaseHandler {
  // Draw phase
  handleDrawPhase(): void;
  
  // Action phase
  handleActionPhase(): void;
  playerTakeAction(playerId: PlayerId): Promise<void>;
  playerPass(playerId: PlayerId): void;
  
  // Peace and rebels phase
  handlePeacePhase(): void;
  resolveWar(warId: string): void;
  rollRebelDice(): void;
  rebelMovement(): void;
  
  // Income phase
  handleIncomePhase(): void;
  calculateIncome(playerId: PlayerId): number;
  payUpkeep(playerId: PlayerId): void;
  generateMonarchPower(playerId: PlayerId): void;
  
  // Cleanup phase
  handleCleanupPhase(): void;
  refreshMerchants(): void;
  updateManpower(): void;
  discardDownToHandLimit(): void;
  
  // Age transition
  handleAgeTransition(): void;
  scoreEndOfAge(): void;
}

// ==================== GAME CONTROLLER ====================
export interface GameController {
  state: CompleteGameState;
  
  // Game flow
  startGame(): void;
  advancePhase(): void;
  endRound(): void;
  endAge(): void;
  endGame(): void;
  
  // Action execution
  executeAction(playerId: PlayerId, action: GameAction): Promise<void>;
  validateAction(playerId: PlayerId, action: GameAction): boolean;
  
  // AI
  aiTakeTurn(playerId: PlayerId): Promise<void>;
  
  // State queries
  getPlayer(playerId: PlayerId): EnhancedPlayerState;
  getProvince(provinceId: ProvinceID): Province;
  getArea(areaId: AreaID): Area;
  
  // Calculations
  calculatePrestige(playerId: PlayerId): number;
  calculateMilitaryStrength(playerId: PlayerId): number;
  checkVictoryConditions(): PlayerId | null;
}

// ==================== SAVE/LOAD ====================
export interface SavedGame {
  version: string;
  savedAt: number;
  gameState: CompleteGameState;
  metadata: {
    turnNumber: number;
    humanPlayer: PlayerId;
    gameDuration: number; // minutes
    lastAction: string;
  };
}
