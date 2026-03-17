/**
 * Warfare System for Europa Universalis
 * Includes armies, fleets, battles, sieges, and peace
 */

import type { PlayerId } from "../state/types";
import type { CountryID, AreaID, ProvinceID, SeaID } from "../../types/GameEntities";
import type { CasusBelliType } from "../actions/types";

// ==================== MILITARY UNITS ====================
export type UnitType = "infantry" | "cavalry" | "artillery" | "light_ship" | "heavy_ship" | "galley";
export type UnitSource = "regular" | "allied" | "mercenary";
export type UnitState = "active" | "exhausted" | "destroyed";

export interface MilitaryUnit {
  id: string;
  type: UnitType;
  source: UnitSource;
  owner: PlayerId | CountryID;
  state: UnitState;
  
  // For NPR/rebel units
  isNPR?: boolean;
  isRebel?: boolean;
  
  // Location
  assignedTo?: string; // Army or fleet ID
}

// ==================== ARMIES AND FLEETS ====================
export interface Army {
  id: string;
  owner: PlayerId | CountryID;
  location: AreaID;
  units: string[]; // Unit IDs
  leader?: string; // Leader card ID
  
  // Composition limits
  maxInfantry: number; // Unlimited
  maxCavalry: number; // Usually limited
  maxArtillery: number; // Usually limited, requires tech
}

export interface Fleet {
  id: string;
  owner: PlayerId | CountryID;
  location: SeaID | "docked";
  dockedAt?: ProvinceID; // If docked
  units: string[]; // Ship IDs
  admiral?: string; // Naval leader card ID
  
  // Can transport land units
  transportingUnits?: string[]; // Land unit IDs being transported
}

// ==================== MILITARY CAPACITY ====================
export interface MilitaryCapacity {
  areaId: AreaID;
  playerId: PlayerId;
  
  // Land capacity (for recruiting)
  landCapacity: number; // Tax value of area + adjacent areas
  contributingProvinces: ProvinceID[];
  
  // Naval capacity (for recruiting)
  navalCapacity: number; // Tax value of area + adjacent sea zones with ports
  contributingPorts: ProvinceID[];
}

// ==================== WAR STATE ====================
export interface War {
  id: string;
  startRound: number;
  
  // Participants
  attackers: PlayerId[];
  defenders: PlayerId[];
  
  // NPC allies
  attackerNPCAllies: CountryID[];
  defenderNPCAllies: CountryID[];
  
  // War goal
  casusBelli: CasusBelliType;
  targetArea?: AreaID;
  
  // Occupied provinces
  occupiedByAttackers: ProvinceID[];
  occupiedByDefenders: ProvinceID[];
  
  // Status
  status: "active" | "white_peace" | "attacker_victory" | "defender_victory" | "partial_victory";
  canEndWar: boolean; // Checked each peace phase
}

export interface WarGoals {
  type: "conquest" | "reconquest" | "liberation" | "humiliation";
  targetProvinces?: ProvinceID[];
  targetVassals?: CountryID[];
}

// ==================== BATTLES ====================
export type BattleType = "land" | "naval";
export type BattlePhase = "preparation" | "roll_dice" | "assign_casualties" | "retreat_check" | "complete";

export interface Battle {
  id: string;
  type: BattleType;
  location: AreaID | SeaID;
  round: number; // Which round of battle (can go multiple rounds)
  phase: BattlePhase;
  
  // Participants
  attacker: BattleSide;
  defender: BattleSide;
  
  // Results
  attackerCasualties: string[]; // Unit IDs destroyed
  defenderCasualties: string[]; // Unit IDs destroyed
  winner?: "attacker" | "defender";
  
  // Retreat
  retreated?: "attacker" | "defender";
  retreatDestination?: AreaID | SeaID;
}

export interface BattleSide {
  playerId: PlayerId | "NPR" | "rebels";
  nprRealm?: CountryID; // If NPR
  
  // Forces
  units: BattleUnit[];
  leader?: string; // Leader card ID providing bonuses
  
  // Combat stats
  totalHits: number;
  leaderWounds: number; // From double infantry rolls
  
  // Dice
  baseDice: number; // Usually 3
  bonusDice: number; // From cards/leaders
  diceType: "white" | "orange" | "blue"; // Orange = cavalry, blue = naval
  
  // Modifiers
  attackBonus: number;
  defenseBonus: number;
  
  // Cards played
  battleCardsPlayed: string[];
}

export interface BattleUnit {
  unitId: string;
  type: UnitType;
  source: UnitSource;
  
  // Combat values
  hitOn: number[]; // Die faces that score hits [1, 2, 3] for infantry
  hitsPerUnit: number; // Usually 1, but heavy ships get 1 free hit
  hitsToDestroy: number; // Usually 1, but heavy ships take 2
  
  // Siege value (for land units)
  siegeStrength?: number; // 1 for infantry, 0.5 for cavalry, 2 for artillery
}

// ==================== SIEGE ====================
export interface Siege {
  id: string;
  attacker: PlayerId | CountryID;
  targetProvince: ProvinceID;
  areaId: AreaID;
  
  // Siege progress
  siegeStrength: number; // Total strength committed
  unitsCommitted: string[]; // Unit IDs
  
  // Result
  completed: boolean;
  occupiedOn?: number; // Round number
}

// ==================== UNREST AND REBELS ====================
export interface UnrestToken {
  id: string;
  provinceId: ProvinceID;
  reason: "conversion" | "occupation" | "religious_dissent" | "low_stability" | "war";
  canSuppress: boolean; // Can't suppress if occupied or rebels present
}

export interface RebelUnit {
  id: string;
  location: AreaID;
  strength: number; // Number of rebel units
  
  // Behavior
  willSiege: boolean; // If in area with unrest
  willMove: boolean; // If no unrest, moves to adjacent area with unrest
}

export const REBEL_DIE_RESULTS = {
  NO_EFFECT: "no_effect",
  LOSE_2_DUCATS: "lose_2_ducats",
  LOSE_POWER: "lose_power", // Player chooses which
  EXHAUST_UNIT: "exhaust_unit",
  REBELLION: "rebellion", // Spawn rebel
  REMOVE_UNREST: "remove_unrest", // Good outcome!
} as const;

// ==================== PEACE TERMS ====================
export type PeaceTermType =
  | "white_peace"
  | "status_quo" // Keep occupied provinces
  | "exchange_provinces"
  | "sell_back_provinces"
  | "liberate_provinces"
  | "annex_vassal"
  | "release_vassal"
  | "war_reparations"
  | "revoke_alliance"
  | "show_strength"; // Just gain prestige

export interface PeaceTerm {
  type: PeaceTermType;
  
  // Province changes
  provincesToGain?: ProvinceID[];
  provincesToLose?: ProvinceID[];
  provincesToLiberate?: ProvinceID[];
  
  // Financial
  ducatsGained?: number;
  ducatsPaid?: number;
  
  // Diplomatic
  alliancesToBreak?: CountryID[];
  vassalsToRelease?: CountryID[];
  vassalsToGain?: CountryID[];
  
  // Prestige
  prestigeChange?: number;
}

export interface PeaceOffer {
  warId: string;
  offeredBy: PlayerId;
  terms: PeaceTerm[];
  
  // Limitations
  maxRansom: number; // Can't take more than 2x defender's tax value
  mustReturnCapital: boolean; // Always return capital (with ransom)
  
  // Status
  status: "offered" | "accepted" | "rejected" | "automatic"; // Some peace is automatic
}

// ==================== TRUCE ====================
export interface Truce {
  id: string;
  participants: PlayerId[];
  startRound: number;
  duration: number; // Usually until end of age
  
  // Restrictions during truce
  cannotDeclareWar: boolean;
  cannotFabricateClaims: boolean;
}

// ==================== CALL TO ARMS ====================
export interface CallToArms {
  id: string;
  caller: PlayerId;
  target: PlayerId | CountryID;
  warId: string;
  type: "offensive" | "defensive";
  
  // Response
  accepted?: boolean;
  declined?: boolean;
  
  // For NPR allies
  influenceRequired?: number; // 2 for offensive, 1 for defensive
  influenceSpent?: number;
  
  // Allied units provided
  alliedUnitsProvided?: number;
  adjacentToEnemy?: boolean; // Bonus military power if true
}

// ==================== MILITARY ACCESS ====================
export interface MilitaryAccess {
  playerId: PlayerId;
  throughArea: AreaID;
  grantedBy: PlayerId | "neutral";
  cost: number; // 1 diplomatic power or 3 ducats
  duration: "this_war" | "permanent";
}

// ==================== COMBAT MODIFIERS ====================
export interface CombatModifiers {
  terrain?: number; // Mountains, etc.
  crossing?: boolean; // River/strait crossing
  leaderBonus?: number; // From leader stats
  ideaBonus?: number; // From researched ideas
  cardBonus?: number; // From battle action cards
  
  // Defender advantages
  fortification?: number; // If defending in fortified town
}

// ==================== WAR EXHAUSTION ====================
export interface WarExhaustion {
  playerId: PlayerId;
  level: number; // 0-100
  
  // Effects
  stabilityPenalty: number;
  manpowerPenalty: number;
  unrestIncrease: number;
}

// ==================== NPR MILITARY BEHAVIOR ====================
export interface NPRMilitaryBehavior {
  realmId: CountryID;
  
  // Defensive stance
  defenseStrength: number; // Based on military capacity
  willRetreat: boolean; // Retreat if outnumbered
  retreatThreshold: number; // Retreat if below this unit count
  
  // Active ally behavior
  isActiveAlly: boolean;
  providedUnits: number;
  supportingPlayer: PlayerId;
}

// ==================== MILITARY PHASE RESULTS ====================
export interface MilitaryPhaseResult {
  battles: Battle[];
  sieges: Siege[];
  newOccupations: ProvinceID[];
  unitsDestroyed: string[];
  leadersKilled: string[];
  
  // For action phase
  triggeredBattles: Battle[]; // Battles that start immediately after war declaration
}
