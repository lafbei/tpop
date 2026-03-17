/**
 * Action System for Europa Universalis
 * Based on the board game mechanics
 */

import type { PlayerId } from "../state/types";
import type { ProvinceID, AreaID, CountryID } from "../../types/GameEntities";

// ==================== MONARCH POWERS ====================
export type MonarchPowerType = "administrative" | "diplomatic" | "military";

export interface MonarchPowerCost {
  administrative?: number;
  diplomatic?: number;
  military?: number;
  ducats?: number; // Alternative or additional cost in money
}

// ==================== ACTION TYPES ====================
export type ActionCategory = "minor" | "generic" | "administrative" | "diplomatic" | "military";

export interface BaseAction {
  id: string;
  playerId: PlayerId;
  category: ActionCategory;
  cost: MonarchPowerCost;
  canBeReaction?: boolean; // Can be done on other players' turns
}

// ==================== MINOR ACTIONS ====================
export interface TakeLoanAction extends BaseAction {
  type: "TAKE_LOAN";
  category: "minor";
}

export interface RepayLoanAction extends BaseAction {
  type: "REPAY_LOAN";
  category: "minor";
  amount: number; // costs 6 ducats to repay
}

export interface AppointLeaderOrAdviserAction extends BaseAction {
  type: "APPOINT_LEADER_OR_ADVISER";
  category: "minor";
  cardId: string;
  targetType: "adviser" | "leader" | "ruler";
  advisorType?: "administrative" | "diplomatic" | "military"; // For advisers
  targetArmyOrFleet?: string; // For leaders
}

export interface ReplenishManpowerAction extends BaseAction {
  type: "REPLENISH_MANPOWER";
  category: "minor";
  unitIds: string[]; // Up to 3 units per military power spent
}

export interface CutTiesAction extends BaseAction {
  type: "CUT_TIES";
  category: "minor";
  targetRealm: CountryID;
  tieType: "influence" | "claim" | "alliance";
  areaId?: AreaID; // For influence/claims
}

// ==================== GENERIC ACTIONS ====================
export interface PlayCardAction extends BaseAction {
  type: "PLAY_CARD";
  category: "generic";
  cardId: string;
  targets?: Record<string, unknown>; // Flexible targets based on card
}

export interface PlayEventAction extends BaseAction {
  type: "PLAY_EVENT";
  category: "generic";
  cardId: string;
  choice?: "A" | "B"; // For events with choices
}

export interface ChangeNationalFocusAction extends BaseAction {
  type: "CHANGE_NATIONAL_FOCUS";
  category: "generic";
  focusType: MonarchPowerType;
  cardsToDiscard: string[];
  cardsToDrawFrom: MonarchPowerType[];
}

export interface PlayerDiplomacyAction extends BaseAction {
  type: "PLAYER_DIPLOMACY";
  category: "generic";
  targetPlayer: PlayerId;
  diplomacyType: "alliance" | "royal_marriage" | "monetary_support" | "buy_province" | "sell_province";
  amount?: number; // For monetary support or province sale
  provinceIds?: ProvinceID[]; // For buying/selling provinces
}

export interface ResearchIdeaAction extends BaseAction {
  type: "RESEARCH_IDEA";
  category: "generic";
  ideaId: string;
}

export interface ChangeStateReligionAction extends BaseAction {
  type: "CHANGE_STATE_RELIGION";
  category: "generic";
  newReligion: "Catholic" | "Protestant";
}

export interface ExplorationAction extends BaseAction {
  type: "EXPLORATION";
  category: "generic";
  shipId: string;
  targetSeaZone: string;
  rerollCount: number; // 0-2 rerolls
}

// ==================== ADMINISTRATIVE ACTIONS ====================
export interface IncreaseStabilityAction extends BaseAction {
  type: "INCREASE_STABILITY";
  category: "administrative";
}

export interface ConvertReligionAction extends BaseAction {
  type: "CONVERT_RELIGION";
  category: "administrative";
  areaId: AreaID;
  targetProvinceId: ProvinceID; // Which town gets unrest
}

export interface ColonizeAction extends BaseAction {
  type: "COLONIZE";
  category: "administrative";
  claimId: string; // Colonial claim to convert to town
  colonistCount: number;
  powerCount: number;
  // colonistCount + powerCount must equal 4
}

// ==================== DIPLOMATIC ACTIONS ====================
export interface InfluenceAction extends BaseAction {
  type: "INFLUENCE";
  category: "diplomatic";
  targetAreas: AreaID[]; // Can place in multiple areas
  cubesPerArea: Record<AreaID, number>;
}

export interface ForgeAllianceAction extends BaseAction {
  type: "FORGE_ALLIANCE";
  category: "diplomatic";
  targetRealm: CountryID;
  areaId: AreaID; // Where we have influence
}

export interface TradeAction extends BaseAction {
  type: "TRADE";
  category: "diplomatic";
  drawnCards: string[]; // 3 trade cards drawn
  selectedCard: string; // Which one to use
  tradeNodeId: string;
  merchantId: string;
  shipToMove?: string; // Optional ship movement
}

export interface FabricateClaimAction extends BaseAction {
  type: "FABRICATE_CLAIM";
  category: "diplomatic";
  targetAreas: AreaID[];
}

// ==================== MILITARY ACTIONS ====================
export interface DeclareWarAction extends BaseAction {
  type: "DECLARE_WAR";
  category: "military";
  targets: CountryID[];
  casusBelli: CasusBelliType;
  casusBelliTarget?: AreaID; // For claim-based CB
  callToArmsAllies?: CountryID[]; // Which allies to call
}

export interface RecruitUnitsAction extends BaseAction {
  type: "RECRUIT_UNITS";
  category: "military";
  areaId: AreaID;
  armyOrFleetId: string;
  units: {
    type: "infantry" | "cavalry" | "artillery" | "light_ship" | "heavy_ship" | "galley";
    count: number;
    source: "regular" | "allied" | "mercenary";
  }[];
}

export interface ActivateUnitsAction extends BaseAction {
  type: "ACTIVATE_UNITS";
  category: "military";
  activationType: "land" | "naval";
  armyOrFleetId: string;
  fromArea: AreaID;
  toArea: AreaID;
  path?: AreaID[]; // For multi-step movement
  pickupUnits?: string[]; // Units to pick up along the way
  dropoffUnits?: string[]; // Units to drop off
  dock?: boolean; // For naval, whether to dock
}

export interface SiegeAction extends BaseAction {
  type: "SIEGE";
  category: "military";
  areaId: AreaID;
  targetProvinceId: ProvinceID;
  unitIds: string[]; // Which units participate
}

export interface SuppressUnrestAction extends BaseAction {
  type: "SUPPRESS_UNREST";
  category: "military";
  provinceIds: ProvinceID[];
}

// ==================== HOLY ROMAN EMPIRE ACTIONS ====================
export interface IncreaseImperialAuthorityAction extends BaseAction {
  type: "INCREASE_IMPERIAL_AUTHORITY";
  category: "administrative";
  // Only available to Emperor
}

// ==================== PAPAL ACTIONS ====================
export interface ExcommunicateRulerAction extends BaseAction {
  type: "EXCOMMUNICATE_RULER";
  category: "diplomatic";
  targetPlayer: PlayerId;
  // Only available to Papal Controller
}

export interface CallCrusadeAction extends BaseAction {
  type: "CALL_CRUSADE";
  category: "diplomatic";
  targetRealm: CountryID; // Must be Muslim
  // Only available to Papal Controller
}

// ==================== CASUS BELLI ====================
export type CasusBelliType =
  | "conquest" // Have claim in target's realm
  | "reconquest" // Reclaiming core provinces
  | "no_cb" // Lose 2 stability
  | "restoration_of_union" // From card effects
  | "excommunication" // Target is excommunicated
  | "crusade" // Crusade called against target
  | "imperial_liberation" // HRE related
  | "disputed_succession"; // Royal marriage related

// ==================== UNION TYPE ====================
export type GameAction =
  | TakeLoanAction
  | RepayLoanAction
  | AppointLeaderOrAdviserAction
  | ReplenishManpowerAction
  | CutTiesAction
  | PlayCardAction
  | PlayEventAction
  | ChangeNationalFocusAction
  | PlayerDiplomacyAction
  | ResearchIdeaAction
  | ChangeStateReligionAction
  | ExplorationAction
  | IncreaseStabilityAction
  | ConvertReligionAction
  | ColonizeAction
  | InfluenceAction
  | ForgeAllianceAction
  | TradeAction
  | FabricateClaimAction
  | DeclareWarAction
  | RecruitUnitsAction
  | ActivateUnitsAction
  | SiegeAction
  | SuppressUnrestAction
  | IncreaseImperialAuthorityAction
  | ExcommunicateRulerAction
  | CallCrusadeAction;

// ==================== ACTION VALIDATION ====================
export interface ActionValidation {
  valid: boolean;
  reason?: string;
  cost?: MonarchPowerCost;
}

// ==================== PASS ACTION ====================
export interface PassAction {
  type: "PASS";
  playerId: PlayerId;
  canPass: boolean; // Must have played event card
  passBonus?: number; // First player gets 5 ducats, etc.
}
