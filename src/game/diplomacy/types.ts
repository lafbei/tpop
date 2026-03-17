/**
 * Diplomacy System for Europa Universalis
 * Includes alliances, influence, royal marriages, and diplomatic relations
 */

import type { PlayerId } from "../state/types";
import type { CountryID, AreaID, ProvinceID } from "../../types/GameEntities";

// ==================== DIPLOMATIC RELATIONS ====================
export type RelationType =
  | "alliance"
  | "royal_marriage"
  | "vassal"
  | "overlord"
  | "war"
  | "truce"
  | "neutral";

export interface DiplomaticRelation {
  id: string;
  type: RelationType;
  participant1: PlayerId | CountryID;
  participant2: PlayerId | CountryID;
  
  // For specific relation types
  startRound?: number;
  endRound?: number; // For temporary relations like truces
  
  // Alliance specific
  isActiveAlly?: boolean; // Currently fighting together
  
  // Marriage specific
  isDisputed?: boolean; // Flipped over due to interregnum
  
  // Vassal specific
  overlord?: PlayerId | CountryID;
  libertyDesire?: number; // For advanced rules
}

// ==================== INFLUENCE ====================
export interface InfluenceCube {
  id: string;
  owner: PlayerId;
  location: AreaID;
}

export interface AreaInfluence {
  areaId: AreaID;
  influences: Record<PlayerId, number>; // Player ID -> cube count
  royalMarriages: RoyalMarriage[]; // Count as 1 influence each
  maxInfluence: number; // Usually 5
  
  // Computed
  mostInfluential?: PlayerId; // Player with most influence
  isPlayerOwned: boolean; // If completely owned by players, no influence allowed
}

// ==================== ROYAL MARRIAGES ====================
export interface RoyalMarriage {
  id: string;
  participant1: PlayerId | CountryID;
  participant2: PlayerId | CountryID;
  location: AreaID; // Where the marriage token is placed
  
  // State
  isDisputed: boolean; // Flipped due to disputed succession
  
  // Benefits
  countsAsInfluence: boolean; // Counts as 1 influence in area
  worthPrestige: boolean; // Worth 1 prestige at end of age
}

// ==================== ALLIANCES ====================
export interface Alliance {
  id: string;
  participant1: PlayerId | CountryID;
  participant2: PlayerId | CountryID;
  
  // Formation details
  formedOnRound: number;
  influenceSpent: number; // How much diplomatic power spent to form
  
  // Status
  status: "inactive" | "active" | "broken";
  
  // Active alliance (currently at war together)
  activeInWar?: string; // War ID
  unitsProvided?: number; // For NPR allies
  
  // Breaking alliance penalties
  breakPenalty: {
    prestige: number; // -2 for offensive CTA, -4 for defensive
    stabilityLoss?: number; // Possible additional penalty
  };
}

export interface AllianceOffer {
  offeredBy: PlayerId;
  targetRealm: CountryID;
  influenceInArea: number; // Must have 2+ influence
  costInPower: number; // Half tax value, max 3
  
  // Requirements
  requirementsmet: boolean;
  cannotAllyReason?: string; // "at_war" | "allied_to_enemy" | "insufficient_influence"
}

// ==================== VASSALS ====================
export interface Vassal {
  id: CountryID;
  overlord: PlayerId | CountryID;
  provinces: ProvinceID[];
  
  // Status
  canBeIntegrated: boolean; // After certain conditions
  libertyDesire: number; // 0-100, higher = more likely to rebel
  
  // Benefits to overlord
  taxValue: number;
  forceLimit: number; // How many units they can provide
  
  // Diplomatic restrictions
  cannotDeclareWar: boolean;
  cannotFormAlliances: boolean;
  mustJoinOverlordWars: boolean;
}

export interface SubjugateAction {
  playerId: PlayerId;
  targetRealm: CountryID;
  
  // Requirements (from subjugate card)
  influenceRequired: number;
  influenceSpent: number;
  additionalCost?: {
    power?: number;
    ducats?: number;
  };
  
  // Result
  success: boolean;
}

// ==================== NON-PLAYER REALMS ====================
export type NPRType = "regular" | "dynamic" | "vassal";

export interface NonPlayerRealm {
  id: CountryID;
  name: string;
  type: NPRType;
  
  // Territory
  provinces: ProvinceID[];
  coreProvinces: ProvinceID[]; // Provinces with their flag
  capital: ProvinceID;
  
  // Economic
  taxValue: number; // Sum of all towns
  
  // Military
  militaryCapacity: number; // For defense
  currentUnits: string[]; // Unit IDs if currently defending
  
  // Diplomatic status
  stateReligion: string;
  alliances: string[]; // Alliance IDs
  overlord?: PlayerId | CountryID; // If vassal
  
  // Dynamic NPR specific (advanced rule)
  isDynamic?: boolean;
  dynamicBehavior?: DynamicNPRBehavior;
}

export interface DynamicNPRBehavior {
  aggressionLevel: number; // How likely to declare war
  diplomaticPreference: "expansionist" | "defensive" | "opportunistic";
  willAllyPlayers: boolean;
  willColonize: boolean;
  priorityTargets: CountryID[]; // Nations they're likely to attack
}

// ==================== CLAIMS ====================
export interface Claim {
  id: string;
  owner: PlayerId;
  location: AreaID;
  type: "regular" | "colonial"; // Colonial claims on distant continents
  
  // Fabrication details
  fabricatedOnRound: number;
  
  // Purpose
  usedForWarGoal: boolean; // Used as casus belli
  
  // Colonial specific
  isDiscovered?: boolean; // Colonial claims become discovered
  canColonize?: boolean; // Colonial claims can be turned into towns
}

// ==================== CASUS BELLI (WAR JUSTIFICATION) ====================
export interface CasusBelliToken {
  id: string;
  owner: PlayerId;
  targetRealm: CountryID;
  type: string; // "conquest", "reconquest", etc.
  validUntil?: number; // Round number, if temporary
  
  // Based on
  basedOnClaim?: string; // Claim ID
  basedOnCard?: string; // Card ID that granted it
  basedOnExcommunication?: boolean;
  basedOnCrusade?: boolean;
}

// ==================== TRADE ====================
export interface Merchant {
  id: string;
  owner: PlayerId;
  location: string; // Trade node ID
  isActive: boolean; // Used this round
  
  // Trade power contribution
  tradePowerBonus: number; // Usually just 1
}

export interface TradeNode {
  id: string;
  name: string;
  type: "land" | "naval";
  
  // Key provinces (give bonus trade power)
  keyProvinces: ProvinceID[];
  
  // Protected trade spots (for naval nodes)
  protectedTradeSlots?: number; // Shadowed boat spots
  occupiedSlots?: Record<PlayerId, number>; // Ships in protected slots
  
  // Expanded trade
  isExpanded: boolean; // Has expanded trade token
  
  // Income levels
  incomeTable: number[]; // Income by trade power [0, 3, 5, 7, 9, 11]
  expandedIncomeTable?: number[];
}

export interface TradeActivity {
  round: number;
  playerId: PlayerId;
  tradeNode: string;
  tradePower: number;
  incomeBracket: number;
  ducatsEarned: number;
  
  // Participants
  otherTraders: Array<{
    playerId: PlayerId;
    tradePower: number;
    incomeBracket: number;
  }>;
}

// ==================== PAPAL CURIA (CATHOLIC DIPLOMACY) ====================
export interface PapalCuria {
  // Cardinals
  cardinals: Record<PlayerId, number>; // How many cardinals each Catholic player has
  cardinalPositions: Array<PlayerId | null>; // Max players + 1 positions
  
  // Control
  controller?: PlayerId; // Player with most cardinals (leftmost if tied)
  contested: boolean; // Multiple players have equal cardinals
  
  // Controller benefits
  controllerBonuses: {
    stabilityBonus: number; // +1
    diplomaticPowerBonus: number; // +1 per round
    canExcommunicate: boolean;
    canCallCrusade: boolean;
  };
  
  // Prestige from control
  prestigePerRound: number; // Number of Catholic PRs - 1
  
  // Actions used this round
  excommunicationUsed: boolean;
  crusadeUsed: boolean;
  
  // Excommunicated rulers
  excommunicatedPlayers: PlayerId[];
  
  // Active crusade
  activeCrusade?: {
    target: CountryID; // Must be Muslim
    participants: PlayerId[];
  };
}

export interface CardinalToken {
  owner: PlayerId;
  location: "roma" | "track"; // Roma if have alliance/captured, otherwise on track
  position?: number; // Position on track (0 = leftmost)
}

// ==================== HOLY ROMAN EMPIRE ====================
export interface HolyRomanEmpire {
  emperor: PlayerId; // Usually Austria
  
  // Imperial authority
  authority: number; // 0-10+
  
  // Protected provinces
  protectedProvinces: ProvinceID[]; // Within yellow dotted lines
  protectedAreas: AreaID[];
  
  // Benefits
  emperorBonuses: {
    diplomaticPowerBonus: number;
    militaryPowerBonus: number; // When defending HRE
    prestigeBonus: number; // At end of age
  };
  
  // Obligations
  mustDefendHRE: boolean;
  
  // Special actions available
  canIncreaseAuthority: boolean;
  canRevokeElectors: boolean; // Advanced
  canAddToHRE: boolean; // Advanced
}

// ==================== DIPLOMATIC ACTIONS TRACKING ====================
export interface DiplomaticActionTracker {
  playerId: PlayerId;
  round: number;
  
  // Actions taken this round
  influencePlaced: number; // How many cubes placed
  alliancesForged: number;
  claimsFabricated: number;
  tradeActionsTaken: number;
  
  // Diplomatic budget spent
  diplomaticPowerSpent: number;
  ducatsSpentOnDiplomacy: number;
}

// ==================== OPINION AND AI DIPLOMACY ====================
export interface OpinionModifier {
  fromRealm: PlayerId | CountryID;
  towardRealm: PlayerId | CountryID;
  
  modifiers: {
    alliance: number; // +50
    royal_marriage: number; // +25
    at_war: number; // -100
    historical_rivalry: number; // -50
    same_religion: number; // +10
    different_religion: number; // -20
    recently_attacked: number; // -50
    broke_alliance: number; // -30
    
    // Custom modifiers
    custom?: Array<{ reason: string; value: number }>;
  };
  
  totalOpinion: number;
}

// ==================== DIPLOMATIC DEALS (PLAYER TO PLAYER) ====================
export interface DiplomaticDeal {
  proposedBy: PlayerId;
  proposedTo: PlayerId;
  round: number;
  
  dealType: "alliance" | "royal_marriage" | "monetary_support" | "province_sale";
  
  // Alliance/marriage
  allianceOrMarriage?: {
    type: "alliance" | "marriage";
    cost: number; // 1 diplomatic power
  };
  
  // Monetary support
  monetarySupport?: {
    amount: number; // Ducats
    direction: "give" | "receive";
    cost: number; // 1 dip power per 10 ducats
  };
  
  // Province sale
  provinceSale?: {
    provinces: ProvinceID[];
    pricePerProvince: number; // 3-15 ducats
    buyerMustHaveClaims: boolean;
    sellerCoreProvincePenalty: number; // -2 prestige per tax value if selling cores
    cost: number; // 1 admin power each for buyer and seller
  };
  
  // Status
  status: "proposed" | "accepted" | "rejected" | "canceled";
}
