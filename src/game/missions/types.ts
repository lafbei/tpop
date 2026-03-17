/**
 * Missions and Milestones System for Europa Universalis
 * Personal objectives and public goals
 */

import type { PlayerId } from "../state/types";
import type { CountryID, AreaID, ProvinceID } from "../../types/GameEntities";
import type { CardEffect } from "../cards/types";

// ==================== MISSION SYSTEM ====================
export interface Mission {
  id: string;
  nationTag: CountryID; // Each nation has their own mission chains
  track: "military" | "diplomatic" | "administrative";
  tier: 1 | 2 | 3; // Tiers unlock sequentially
  
  // Visual
  name: string;
  description: string;
  flavorText?: string;
  backgroundColor: "green" | "white" | "red"; // Green=tier1, White=tier2, Red=tier3
  
  // Requirements to take this mission
  prerequisites: MissionPrerequisite[];
  
  // Completion conditions
  completionConditions: MissionCondition[];
  
  // Rewards
  rewards: CardEffect[];
  prestigeValue: number;
  
  // Chain mechanics
  nextMission?: string; // Next mission in this chain
  previousMission?: string; // Must complete this first
}

export type MissionConditionType =
  | "own_provinces"
  | "own_provinces_in_area"
  | "control_provinces"
  | "vassal_count"
  | "ally_count"
  | "alliance_with_specific"
  | "royal_marriage_count"
  | "influence_in_areas"
  | "win_battle"
  | "win_war_against"
  | "occupy_capital"
  | "control_trade_node"
  | "trade_income_threshold"
  | "research_idea"
  | "research_ideas_count"
  | "stability_level"
  | "prestige_threshold"
  | "tax_value"
  | "colonial_provinces"
  | "convert_provinces"
  | "at_peace"
  | "at_war_with";

export interface MissionCondition {
  type: MissionConditionType;
  
  // Numeric conditions
  target?: number;
  comparison?: ">=" | ">" | "=" | "<" | "<=";
  
  // Specific targets
  targetArea?: AreaID;
  targetAreas?: AreaID[];
  targetProvince?: ProvinceID;
  targetProvinces?: ProvinceID[];
  targetRealm?: CountryID;
  targetRealms?: CountryID[];
  targetTradeNode?: string;
  targetIdea?: string;
  
  // For complex conditions
  allRequired?: boolean; // All provinces vs any province
  description: string; // Human-readable condition
}

export interface MissionPrerequisite {
  type: "previous_mission" | "age" | "owns_area" | "researched_idea";
  
  missionId?: string; // For previous_mission
  minAge?: number; // For age
  requiredArea?: AreaID; // For owns_area
  requiredIdea?: string; // For researched_idea
}

// ==================== MISSION PROGRESS ====================
export interface MissionProgress {
  playerId: PlayerId;
  missionId: string;
  
  status: "not_started" | "in_progress" | "completed";
  
  // Condition tracking
  conditionProgress: Record<string, {
    conditionIndex: number;
    currentValue: number;
    targetValue: number;
    completed: boolean;
  }>;
  
  // Completion
  completedOn?: number; // Round number
  rewardsClaimed: boolean;
}

export interface PlayerMissionState {
  playerId: PlayerId;
  
  // Active missions (max 2)
  activeMissions: string[]; // Mission IDs
  
  // Available to choose
  availableMissions: string[]; // Can choose from these
  
  // Completed
  completedMissions: string[];
  
  // Progress tracking
  missionProgress: Record<string, MissionProgress>;
  
  // Next draw
  canDrawNewMission: boolean; // At start of next round
}

// ==================== MILESTONE SYSTEM ====================
export interface Milestone {
  id: string;
  age: 1 | 2 | 3 | 4;
  
  // Description
  name: string;
  description: string;
  
  // Completion condition
  condition: MilestoneCondition;
  
  // Rewards
  firstToCompleteRewards: CardEffect[];
  firstToCompletePrestige: number;
  
  subsequentRewards: CardEffect[];
  subsequentPrestige: number;
  
  // Can be completed multiple times?
  oneTimeOnly: boolean;
}

export type MilestoneConditionType =
  | "province_count"
  | "tax_value_threshold"
  | "vassal_count"
  | "ally_count"
  | "control_trade_nodes_count"
  | "research_ideas_count"
  | "research_specific_idea"
  | "prestige_threshold"
  | "win_wars_count"
  | "colonial_provinces_count"
  | "own_provinces_in_region"
  | "own_all_cores"
  | "papal_controller"
  | "emperor"
  | "stability_level"
  | "no_loans"
  | "no_unrest";

export interface MilestoneCondition {
  type: MilestoneConditionType;
  
  // Numeric targets
  target: number;
  comparison?: ">=" | ">" | "=" | "<" | "<=";
  
  // Specific requirements
  specificIdea?: string;
  specificRegion?: string;
  specificTradeNodes?: string[];
  
  // Description
  description: string;
}

export interface MilestoneProgress {
  milestoneId: string;
  
  // Completion tracking
  firstCompleted?: PlayerId; // Who completed first
  firstCompletedOn?: number; // Round number
  
  allCompletions: Array<{
    playerId: PlayerId;
    completedOn: number;
    wasFirst: boolean;
  }>;
}

export interface GameMilestoneState {
  // Available milestones this age
  currentMilestones: string[]; // Milestone IDs
  
  // Progress tracking
  milestoneProgress: Record<string, MilestoneProgress>;
  
  // Historical
  previousMilestones: Record<number, string[]>; // Age -> milestone IDs
}

// ==================== MISSION TEMPLATES ====================
// Example mission structures for different nations

export interface FranceMissions {
  military: {
    tier1: "conquer_provence" | "defeat_england";
    tier2: "italian_ambitions" | "push_to_rhine";
    tier3: "hegemon_of_europe";
  };
  diplomatic: {
    tier1: "court_castile" | "imperial_diplomacy";
    tier2: "balance_of_power" | "trade_league";
    tier3: "diplomatic_supremacy";
  };
  administrative: {
    tier1: "strengthen_crown" | "expand_trade";
    tier2: "cultural_flowering" | "colonial_venture";
    tier3: "age_of_absolutism";
  };
}

export interface CastileMissions {
  military: {
    tier1: "reconquista_completion" | "unite_iberia";
    tier2: "italian_inheritance" | "north_african_ventures";
    tier3: "spanish_tercios";
  };
  diplomatic: {
    tier1: "habsburg_connection" | "papal_favor";
    tier2: "burgundian_inheritance" | "new_world_treaties";
    tier3: "diplomatic_marriage_network";
  };
  administrative: {
    tier1: "colonial_pioneer" | "seville_trade";
    tier2: "treasure_fleet" | "colonial_empire";
    tier3: "empire_on_which_sun_never_sets";
  };
}

// ==================== MISSION REWARDS ====================
export interface MissionReward {
  // Immediate rewards
  immediate: {
    ducats?: number;
    monarchPower?: {
      administrative?: number;
      diplomatic?: number;
      military?: number;
    };
    prestige: number;
    stability?: number;
    manpower?: number;
  };
  
  // Ongoing effects
  ongoing?: {
    description: string;
    effect: CardEffect;
    duration: "permanent" | "until_end_of_age" | "rounds";
    roundsRemaining?: number;
  };
  
  // Special rewards
  special?: {
    freeClaim?: AreaID;
    freeIdea?: string;
    freeColonist?: number;
    unitBonus?: string; // e.g., "elite_infantry"
    buildingBonus?: string;
  };
}

// ==================== MISSION TRACKING ====================
export interface MissionTracker {
  // Check if conditions are met
  checkMissionCompletion(playerId: PlayerId, missionId: string): boolean;
  
  // Check individual conditions
  evaluateCondition(playerId: PlayerId, condition: MissionCondition): {
    met: boolean;
    currentValue: number;
    targetValue: number;
    progress: number; // 0-100
  };
  
  // Grant rewards
  grantMissionRewards(playerId: PlayerId, missionId: string): void;
  
  // Unlock next missions
  checkUnlockedMissions(playerId: PlayerId): string[];
}

export interface MilestoneTracker {
  // Check milestone completion
  checkMilestoneCompletion(playerId: PlayerId, milestoneId: string): boolean;
  
  // Check who completed first
  checkFirstCompletion(milestoneId: string): PlayerId | null;
  
  // Grant milestone rewards
  grantMilestoneRewards(playerId: PlayerId, milestoneId: string, wasFirst: boolean): void;
  
  // Update milestones for new age
  refreshMilestonesForAge(age: number): void;
}

// ==================== SCENARIO-SPECIFIC MISSIONS ====================
export interface ScenarioMissions {
  scenarioId: "discovery_and_reformation" | "thirty_years_war" | "age_of_revolutions";
  
  // Nation-specific mission decks
  nationMissions: Record<CountryID, {
    military: Mission[];
    diplomatic: Mission[];
    administrative: Mission[];
  }>;
  
  // Shared missions (generic ones any nation can attempt)
  sharedMissions?: Mission[];
}

// ==================== OBJECTIVE NOTIFICATIONS ====================
export interface ObjectiveNotification {
  type: "mission_completed" | "milestone_achieved" | "mission_available" | "mission_failed";
  playerId: PlayerId;
  objectiveId: string;
  timestamp: number;
  
  // Details
  wasFirst?: boolean; // For milestones
  rewards?: MissionReward;
  
  // UI
  message: string;
  importance: "low" | "medium" | "high";
  shouldShowModal?: boolean;
}

// ==================== MISSION UI STATE ====================
export interface MissionUIState {
  playerId: PlayerId;
  
  // Display state
  selectedTrack?: "military" | "diplomatic" | "administrative";
  highlightedMission?: string;
  
  // Available choices
  pendingMissionChoice: boolean; // Need to choose new mission
  availableToChoose: string[];
  
  // Progress bars
  missionProgressVisuals: Record<string, {
    percentComplete: number;
    conditionsSummary: string;
    canComplete: boolean;
  }>;
  
  // Notifications
  unreadCompletions: string[]; // Missions completed but not acknowledged
  newMissionsAvailable: string[];
}
