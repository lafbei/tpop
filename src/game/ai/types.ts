/**
 * AI Decision-Making Framework for Europa Universalis
 * For single-player games vs AI bots
 */

import type { PlayerId } from "../state/types";
import type { GameAction } from "../actions/types";
import type { CountryID, AreaID } from "../../types/GameEntities";

// ==================== AI PERSONALITY ====================
export type AIPersonality = "aggressive" | "balanced" | "diplomatic" | "economic" | "defensive";

export interface AIProfile {
  playerId: PlayerId;
  personality: AIPersonality;
  difficulty: "easy" | "medium" | "hard" | "expert";
  
  // Personality weights (0-100)
  weights: {
    expansion: number; // Territory conquest
    diplomacy: number; // Alliances and marriages
    economy: number; // Trade and development
    military: number; // Army building and warfare
    ideas: number; // Research priority
    prestige: number; // Prestige-seeking behavior
  };
  
  // Strategic preferences
  preferences: {
    preferredAllies: CountryID[]; // Historical or strategic allies
    rivals: CountryID[]; // Historical rivals
    expansionTargets: AreaID[]; // Priority areas for conquest
    tradeEmphasis: boolean; // Focus on trade income
    colonialAmbition: boolean; // Will pursue colonization
    religiousFervor: boolean; // Prioritize religious conversion
  };
  
  // Risk tolerance
  riskTolerance: {
    acceptUnfavorableWars: boolean; // Fight even when outnumbered
    overdraftEconomy: boolean; // Take loans aggressively
    stabilityThreshold: number; // Min stability before avoiding risky actions
    minPowerReserve: number; // Keep this much monarch power in reserve
  };
}

// ==================== AI STRATEGY ====================
export interface AIStrategy {
  playerId: PlayerId;
  currentAge: number;
  round: number;
  
  // Strategic goals
  shortTermGoals: StrategicGoal[];
  longTermGoals: StrategicGoal[];
  
  // Current focus
  focus: "military_expansion" | "diplomatic_maneuvering" | "economic_development" | "defensive_consolidation";
  
  // Threat assessment
  threats: ThreatAssessment[];
  
  // Opportunities
  opportunities: OpportunityAssessment[];
}

export interface StrategicGoal {
  id: string;
  type: "conquer_area" | "forge_alliance" | "complete_mission" | "research_idea" | "vassalize" | "colonize" | "dominate_trade";
  priority: number; // 0-100
  
  // Target
  targetArea?: AreaID;
  targetRealm?: CountryID;
  targetMission?: string;
  targetIdea?: string;
  targetTradeNode?: string;
  
  // Progress
  progress: number; // 0-100
  blockers: string[]; // What's preventing completion
  
  // Timeline
  estimatedRounds: number;
}

export interface ThreatAssessment {
  threatFrom: PlayerId | CountryID;
  threatLevel: number; // 0-100
  
  reasons: {
    militaryStrength: number; // Their army vs ours
    proximity: number; // How close are they
    hostileActions: number; // Recent aggressive moves
    rivalry: number; // Historical or declared rivalry
    claimsOnUs: number; // Do they have claims on our land
  };
  
  recommendedResponse: "prepare_defense" | "seek_allies" | "pre_emptive_strike" | "diplomatic_appeasement";
}

export interface OpportunityAssessment {
  opportunityType: "weak_neighbor" | "uncontested_trade" | "available_alliance" | "colonial_opening" | "idea_research";
  targetRealm?: CountryID;
  targetArea?: AreaID;
  targetResource?: string;
  
  attractiveness: number; // 0-100
  feasibility: number; // 0-100
  expectedBenefit: {
    prestige?: number;
    ducats?: number;
    provinces?: number;
    tradeIncome?: number;
  };
  
  requiredInvestment: {
    militaryPower?: number;
    diplomaticPower?: number;
    administrativePower?: number;
    ducats?: number;
    militaryUnits?: number;
  };
}

// ==================== AI DECISION MAKING ====================
export interface AIDecision {
  playerId: PlayerId;
  round: number;
  turnNumber: number; // Within this action phase
  
  // Evaluated actions
  consideredActions: ScoredAction[];
  
  // Selected action
  selectedAction?: GameAction;
  reasoning: string; // Why this action was chosen
  
  // Context
  gameState: EvaluatedGameState;
}

export interface ScoredAction {
  action: GameAction;
  score: number; // 0-100
  
  scoring: {
    alignsWithGoals: number; // How well does this support our goals
    resourceEfficiency: number; // Good use of monarch power/ducats
    timing: number; // Is now the right time
    riskVsReward: number; // Risk assessment
    strategicValue: number; // Long-term benefit
  };
  
  // Consequences
  expectedOutcome: {
    prestigeChange?: number;
    powerChange?: { adm?: number; dip?: number; mil?: number };
    ducatsChange?: number;
    stabilityChange?: number;
    newAlliances?: number;
    newEnemies?: number;
    territoriesGained?: number;
  };
  
  // Blockers
  canExecute: boolean;
  blockerReason?: string;
}

export interface EvaluatedGameState {
  myPosition: PlayerPosition;
  otherPlayers: Record<PlayerId, PlayerPosition>;
  nprs: Record<CountryID, NPRPosition>;
  
  // Meta analysis
  imLeader: boolean; // Am I in first place?
  imThreatened: boolean; // Am I under threat?
  roundsRemaining: number; // How many rounds left in age/game
}

export interface PlayerPosition {
  playerId: PlayerId;
  
  // Power metrics
  totalPrestige: number;
  militaryStrength: number; // Count of units
  economicStrength: number; // Income per round
  diplomaticInfluence: number; // Alliances + influence
  
  // Territory
  provinceCount: number;
  taxValue: number;
  
  // Resources
  monarchPower: { adm: number; dip: number; mil: number };
  treasury: number;
  stability: number;
  
  // Military
  armySize: number;
  fleetSize: number;
  activeWars: number;
  
  // Relations with me
  relationToMe: "ally" | "enemy" | "neutral" | "rival";
}

export interface NPRPosition {
  realmId: CountryID;
  
  // Basic attributes
  taxValue: number;
  militaryCapacity: number;
  
  // Diplomatic status
  isVassal: boolean;
  overlord?: PlayerId | CountryID;
  alliances: PlayerId[];
  
  // Vulnerability
  vulnerability: number; // 0-100, how easy to conquer
  alreadyInfluenced: Record<PlayerId, number>; // Who has influence here
}

// ==================== AI ACTION EVALUATORS ====================
export interface AIActionEvaluator {
  evaluateAction(action: GameAction, state: EvaluatedGameState, profile: AIProfile): ScoredAction;
}

// Specific evaluators for different action types
export interface WarDecisionEvaluator {
  shouldDeclareWar(
    target: CountryID,
    state: EvaluatedGameState,
    profile: AIProfile
  ): {
    decision: boolean;
    confidence: number;
    reasoning: string;
  };
  
  evaluateMilitaryAdvantage(
    myForces: { infantry: number; cavalry: number; artillery: number },
    theirForces: { infantry: number; cavalry: number; artillery: number }
  ): number; // -100 to +100, positive means we have advantage
}

export interface DiplomacyEvaluator {
  shouldAllyWith(
    target: CountryID | PlayerId,
    state: EvaluatedGameState,
    profile: AIProfile
  ): {
    decision: boolean;
    value: number; // How valuable is this alliance
    reasoning: string;
  };
  
  shouldBreakAlliance(
    current: CountryID | PlayerId,
    reason: string,
    state: EvaluatedGameState
  ): boolean;
}

export interface EconomicEvaluator {
  evaluateTradeAction(
    tradeNode: string,
    expectedIncome: number,
    cost: number
  ): number; // Score 0-100
  
  shouldTakeLoan(
    currentDebt: number,
    urgency: number
  ): boolean;
  
  calculateOptimalSpending(
    available: { adm: number; dip: number; mil: number; ducats: number },
    needs: { adm: number; dip: number; mil: number; ducats: number }
  ): { adm: number; dip: number; mil: number; ducats: number };
}

export interface IdeaEvaluator {
  rankIdeas(
    availableIdeas: string[],
    profile: AIProfile,
    state: EvaluatedGameState
  ): Array<{ ideaId: string; priority: number; reasoning: string }>;
}

// ==================== AI TURN PLANNING ====================
export interface AITurnPlan {
  playerId: PlayerId;
  round: number;
  
  // Planned actions for this round (in order)
  plannedActions: Array<{
    priority: number;
    action: GameAction;
    condition?: string; // Only execute if condition met
    fallbackAction?: GameAction;
  }>;
  
  // Phase-specific plans
  actionPhase: {
    targetNumberOfActions: number;
    mustPlayEvent: boolean;
    eventPreference?: string; // Which event to take if available
  };
  
  peacePhase: {
    warsToEnd: string[]; // War IDs to resolve
    peaceTerms: Record<string, unknown>; // Terms for each war
  };
  
  // Resource management
  resourceAllocation: {
    reserveAdm: number; // Don't spend below this
    reserveDip: number;
    reserveMil: number;
    reserveDucats: number;
  };
}

// ==================== AI LEARNING / ADAPTATION ====================
export interface AIMemory {
  playerId: PlayerId;
  
  // Historical tracking
  pastActions: Array<{
    round: number;
    action: GameAction;
    outcome: "success" | "failure" | "neutral";
    prestigeChange: number;
  }>;
  
  // Relationship memory
  playerRelationships: Record<PlayerId, {
    trustLevel: number; // How reliable has this player been
    betrayals: number; // Times they broke alliance or attacked
    cooperations: number; // Times they helped
    trades: number; // Successful diplomatic deals
  }>;
  
  // Learned patterns
  effectiveStrategies: string[]; // What has worked well
  avoidedMistakes: string[]; // What to not do again
}

// ==================== AI BEHAVIOR MODES ====================
export type AIBehaviorMode =
  | "early_game" // Focus on development and securing position
  | "expansion" // Active conquest and growth
  | "consolidation" // Digest gains, stabilize
  | "competition" // Actively competing for first place
  | "desperation" // Behind and taking risks
  | "preservation"; // Defending what we have

export interface AIBehaviorContext {
  mode: AIBehaviorMode;
  modeChangedOn: number; // Round number
  
  // Triggers for mode changes
  triggerThresholds: {
    enterExpansion: { minStability: number; minMilitary: number };
    enterDesperation: { prestigeDifference: number; roundsRemaining: number };
    enterPreservation: { threatsNearby: number; militaryRatio: number };
  };
}

// ==================== AI DIFFICULTY SETTINGS ====================
export interface AIDifficultySettings {
  difficulty: "easy" | "medium" | "hard" | "expert";
  
  // Decision quality
  actionEvaluationDepth: number; // How many actions to consider
  lookaheadRounds: number; // How far ahead to plan
  mistakeRate: number; // 0-1, probability of suboptimal choice
  
  // Resource management
  resourceEfficiency: number; // 0-1, how well they use monarch power
  economicManagement: number; // 0-1, how well they manage ducats
  
  // Strategic awareness
  threatDetection: number; // 0-1, how well they identify threats
  opportunityRecognition: number; // 0-1, how well they spot opportunities
  
  // Execution
  timingOptimization: number; // 0-1, how well they time actions
  coordinationQuality: number; // 0-1, how well they coordinate multi-step plans
  
  // Bonuses (for higher difficulties)
  bonusMonarchPower?: number; // Extra power per round
  bonusDucats?: number; // Extra income
  bonusPrestige?: number; // Starting prestige bonus
}

// ==================== AI CONTROLLER ====================
export interface AIController {
  aiPlayers: Map<PlayerId, AIProfile>;
  
  // Turn execution
  takeTurn(playerId: PlayerId): Promise<GameAction>;
  
  // Phase handlers
  handleDrawPhase(playerId: PlayerId): void;
  handlePeacePhase(playerId: PlayerId): void;
  handleIncomePhase(playerId: PlayerId): void;
  
  // Event handlers
  respondToWarDeclaration(playerId: PlayerId, warId: string): void;
  respondToDiplomaticProposal(playerId: PlayerId, proposalId: string): boolean;
  respondToCallToArms(playerId: PlayerId, ctaId: string): boolean;
  
  // Updates
  updateStrategy(playerId: PlayerId): void;
  updateThreatAssessment(playerId: PlayerId): void;
}
