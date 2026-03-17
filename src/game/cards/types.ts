/**
 * Card System for Europa Universalis
 * Includes Action Cards (Advisers/Leaders), Event Cards, and Mission Cards
 */

import type { MonarchPowerCost } from "../actions/types";
import type { PlayerId } from "../state/types";
import type { CountryID, AreaID, ProvinceID } from "../../types/GameEntities";

// ==================== BASE CARD ====================
export interface BaseCard {
  id: string;
  name: string;
  deckType: "administrative" | "diplomatic" | "military" | "event" | "mission";
  imageUrl?: string;
}

// ==================== ACTION CARDS ====================
export type ActionCardType = "adviser" | "leader" | "action" | "display";

export interface ActionCard extends BaseCard {
  deckType: "administrative" | "diplomatic" | "military";
  cardType: ActionCardType;
  cost: MonarchPowerCost;
  
  // Adviser properties (square portrait)
  adviserType?: "administrative" | "diplomatic" | "military";
  adviserBonus?: number; // +1 or +2 to monthly generation
  upkeepCost?: number; // Monthly upkeep in ducats
  
  // Leader properties (circular portrait)
  leaderStats?: {
    fire: number; // Combat bonus
    shock: number; // Combat bonus
    maneuver: number; // Movement bonus
    siege: number; // Siege bonus
  };
  leaderType?: "land" | "naval"; // Can command armies or fleets
  
  // Card action effect (when played)
  effect?: CardEffect;
  
  // Display card properties
  displayActions?: DisplayAction[]; // Actions available from this display card
  cubesRequired?: number; // Number of influence cubes needed for display
}

export interface DisplayAction {
  id: string;
  name: string;
  cost: MonarchPowerCost;
  effect: CardEffect;
}

// ==================== CARD EFFECTS ====================
export type CardEffectType =
  | "gain_resources"
  | "gain_influence"
  | "place_claim"
  | "subjugate"
  | "royal_marriage"
  | "remove_unrest"
  | "counter_espionage"
  | "steal_map"
  | "sabotage"
  | "custom";

export interface CardEffect {
  type: CardEffectType;
  
  // Resource effects
  ducats?: number;
  administrativePower?: number;
  diplomaticPower?: number;
  militaryPower?: number;
  prestige?: number;
  stability?: number;
  manpower?: number;
  
  // Diplomatic effects
  influenceCubes?: number;
  targetArea?: AreaID;
  targetRealm?: CountryID;
  
  // Claims
  claimAreas?: AreaID[];
  
  // Special effects
  removeUnrest?: number; // How many unrest tokens to remove
  isCovertAction?: boolean; // Can be blocked by counter espionage
  
  // Battle effects
  battleModifier?: {
    attackBonus?: number;
    defenseBonus?: number;
    rerollDice?: number;
    extraDice?: number;
  };
  
  // Custom scripted effect
  scriptedEffect?: string; // Reference to a specific game effect
}

// ==================== EVENT CARDS ====================
export interface EventCard extends BaseCard {
  deckType: "event";
  age: 1 | 2 | 3 | 4;
  halfPeriod?: "first" | "second"; // For Age 1
  
  // Nation-specific event
  nationFlag?: CountryID; // If event is for specific nation
  newRuler?: RulerCard; // New ruler for nation
  
  // Primary effects (player who takes card)
  primaryEffects: EventChoice[];
  
  // Secondary effects (all players)
  secondaryEffects: SecondaryEffect[];
}

export interface EventChoice {
  id: "A" | "B";
  label: string;
  cost?: MonarchPowerCost;
  effects: CardEffect[];
}

export interface SecondaryEffect {
  type: "mortality" | "idea_available" | "milestone_trigger" | "other";
  
  // Mortality
  affectedCharacters?: ("ruler" | "leader" | "adviser")[];
  characterShape?: "circle" | "square" | "diamond"; // Icon on card
  
  // Ideas
  ideaId?: string;
  
  // Custom
  customEffect?: string;
}

export interface RulerCard {
  name: string;
  administrativeSkill: number; // 0-6
  diplomaticSkill: number; // 0-6
  militarySkill: number; // 0-6
  
  // Can also be used as a leader
  isLeader?: boolean;
  leaderStats?: {
    fire: number;
    shock: number;
    maneuver: number;
    siege: number;
  };
}

// ==================== MISSION CARDS ====================
export interface MissionCard extends BaseCard {
  deckType: "mission";
  nationTag: CountryID; // Specific to each nation
  missionTrack: "military" | "diplomatic" | "administrative"; // Which chain
  tier: "starting" | "advanced" | "final"; // Green, white, or red background
  
  // Prerequisites
  prerequisites: MissionPrerequisite[];
  
  // Completion rewards
  rewards: CardEffect[];
  
  // Prestige value
  prestigeValue: number;
}

export interface MissionPrerequisite {
  type:
    | "own_provinces"
    | "control_trade_node"
    | "have_ally"
    | "at_war"
    | "research_idea"
    | "stability_level"
    | "prestige_level"
    | "previous_mission"; // Must complete another mission first
  
  target?: string | number;
  count?: number;
  comparison?: ">=" | ">" | "=" | "<" | "<=";
}

// ==================== IDEA CARDS ====================
export interface IdeaCard {
  id: string;
  name: string;
  category: "administrative" | "diplomatic" | "military" | "naval" | "economic";
  age: 1 | 2 | 3 | 4;
  isBasic: boolean; // Basic ideas stay in play all game
  
  cost: MonarchPowerCost; // Always 5 of specific types
  
  // Ongoing benefit
  ongoingEffect: CardEffect;
  
  // Instant effect when researched
  instantEffect?: CardEffect;
  
  // Prestige rewards
  firstResearchPrestige: number; // 2 for first player
  secondResearchPrestige: number; // 1 for second player
  thirdResearchPrestige: number; // 1 for third player
  
  // Some ideas enable new actions
  enablesAction?: string; // e.g., "exploration", "colonization"
}

// ==================== TRADE CARDS ====================
export interface TradeCard {
  id: string;
  goodType: "wine" | "cloth" | "spice" | "fur" | "sugar" | "coffee" | "ivory" | "silk";
  
  // Primary trade node
  primaryNode: string;
  keyProvinces: ProvinceID[]; // Provinces that give bonus trade power
  
  // Optional secondary node
  secondaryNode?: string;
  secondaryMinimumPower?: number; // Must have this much trade power
  secondaryBonus?: number; // Ducats from secondary
  
  // Income table (by trade power)
  incomeTable: number[]; // e.g., [0, 3, 5, 7, 9, 11] for power 0-5+
  incomeTableExpanded?: number[]; // If node has expanded trade token
  
  // Continental restriction
  continent?: "America" | "Africa" | "Asia"; // For distant continents
  continentNumber?: number; // Numbered area on distant map
}

// ==================== MILESTONE CARDS ====================
export interface MilestoneCard {
  id: string;
  name: string;
  description: string;
  age: 1 | 2 | 3 | 4;
  
  // Completion condition
  condition: MilestoneCondition;
  
  // Rewards
  firstToComplete: CardEffect; // Bigger reward
  othersComplete: CardEffect; // Smaller reward
}

export interface MilestoneCondition {
  type:
    | "own_provinces_count"
    | "control_trade_nodes"
    | "have_ideas_count"
    | "vassal_count"
    | "prestige_threshold"
    | "tax_value"
    | "colonial_provinces"
    | "custom";
  
  target: number;
  specification?: string; // Additional details
}

// ==================== CARD STATE ====================
export interface PlayerCardState {
  playerId: PlayerId;
  
  // Hand
  hand: string[]; // Card IDs
  
  // Played cards
  advisers: {
    administrative?: string;
    diplomatic?: string;
    military?: string;
  };
  leaders: string[]; // Leaders in armies/fleets
  ruler?: string; // Current ruler card
  displayCards: string[]; // Max 2 active display cards
  
  // Missions
  activeMissions: string[]; // Up to 2 active missions
  completedMissions: string[]; // Track for chaining
  
  // Ideas researched
  researchedIdeas: string[];
}

export interface GameCardState {
  // Decks
  administrativeDeck: string[];
  administrativeDiscard: string[];
  diplomaticDeck: string[];
  diplomaticDiscard: string[];
  militaryDeck: string[];
  militaryDiscard: string[];
  eventDeck: string[];
  eventDiscard: string[];
  
  // Event cards in play (face up)
  activeEvents: string[];
  moneyOnEvents: Record<string, number>; // Ducats on each unchosen event
  
  // Ideas available
  availableIdeas: string[]; // Grid of ideas to research
  ideaResearchers: Record<string, PlayerId[]>; // Who has researched each idea
  
  // Milestones available
  availableMilestones: string[];
  milestoneCompletions: Record<string, PlayerId[]>; // Who completed each
  
  // Card registry (all cards in game)
  cardRegistry: Record<string, ActionCard | EventCard | MissionCard | IdeaCard | TradeCard | MilestoneCard>;
}
