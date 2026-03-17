/**
 * Simple AI Implementation Example
 * Demonstrates basic AI decision-making for single-player games
 */

import type {
  AIProfile,
  ScoredAction,
  EvaluatedGameState,
  PlayerPosition,
} from "./types";
import type { GameAction } from "../actions/types";
import type { CompleteGameState } from "../state/enhanced-types";
import type { PlayerId } from "../state/types";

// ==================== SIMPLE AI CONTROLLER ====================
export class SimpleAI {
  private profiles: Map<PlayerId, AIProfile>;

  constructor() {
    this.profiles = new Map();
  }

  // Initialize AI player with personality
  initializeAI(playerId: PlayerId, personality: AIProfile["personality"]): void {
    const profile: AIProfile = {
      playerId,
      personality,
      difficulty: "medium",
      weights: this.getPersonalityWeights(personality),
      preferences: {
        preferredAllies: [],
        rivals: [],
        expansionTargets: [],
        tradeEmphasis: personality === "economic",
        colonialAmbition: personality === "aggressive" || personality === "economic",
        religiousFervor: false,
      },
      riskTolerance: {
        acceptUnfavorableWars: personality === "aggressive",
        overdraftEconomy: personality === "aggressive" || personality === "economic",
        stabilityThreshold: personality === "defensive" ? 0 : -1,
        minPowerReserve: personality === "defensive" ? 3 : 1,
      },
    };

    this.profiles.set(playerId, profile);
  }

  // Get personality-specific weights
  private getPersonalityWeights(personality: AIProfile["personality"]) {
    switch (personality) {
      case "aggressive":
        return {
          expansion: 90,
          diplomacy: 30,
          economy: 40,
          military: 100,
          ideas: 50,
          prestige: 70,
        };

      case "diplomatic":
        return {
          expansion: 40,
          diplomacy: 100,
          economy: 60,
          military: 50,
          ideas: 70,
          prestige: 80,
        };

      case "economic":
        return {
          expansion: 50,
          diplomacy: 60,
          economy: 100,
          military: 40,
          ideas: 80,
          prestige: 60,
        };

      case "defensive":
        return {
          expansion: 20,
          diplomacy: 70,
          economy: 70,
          military: 80,
          ideas: 60,
          prestige: 40,
        };

      case "balanced":
      default:
        return {
          expansion: 60,
          diplomacy: 60,
          economy: 60,
          military: 60,
          ideas: 60,
          prestige: 60,
        };
    }
  }

  // Main decision function - called on AI's turn
  async decideTurn(playerId: PlayerId, gameState: CompleteGameState): Promise<GameAction | null> {
    const profile = this.profiles.get(playerId);
    if (!profile) {
      throw new Error(`No AI profile found for player ${playerId}`);
    }

    // Evaluate game state
    const evaluatedState = this.evaluateGameState(playerId, gameState);

    // Generate possible actions
    const possibleActions = this.generatePossibleActions(playerId, gameState);

    if (possibleActions.length === 0) {
      return null; // Must pass
    }

    // Score each action
    const scoredActions = possibleActions.map((action) =>
      this.scoreAction(action, evaluatedState, profile)
    );

    // Filter out actions we can't execute
    const validActions = scoredActions.filter((sa) => sa.canExecute);

    if (validActions.length === 0) {
      return null; // Must pass
    }

    // Sort by score and pick the best
    validActions.sort((a, b) => b.score - a.score);

    // Add some randomness based on difficulty
    const topNActions = Math.min(3, validActions.length);
    const randomIndex = Math.floor(Math.random() * topNActions);

    return validActions[randomIndex].action;
  }

  // Generate list of possible actions
  private generatePossibleActions(
    playerId: PlayerId,
    gameState: CompleteGameState
  ): GameAction[] {
    const actions: GameAction[] = [];
    const player = gameState.players[playerId];

    // Minor actions
    if (player.economy.loans < 5 && player.economy.ducats < 10) {
      actions.push({
        type: "TAKE_LOAN",
        id: `action_${Date.now()}_loan`,
        playerId,
        category: "minor",
        cost: {},
        canBeReaction: true,
      });
    }

    if (player.economy.loans > 0 && player.economy.ducats >= 6) {
      actions.push({
        type: "REPAY_LOAN",
        id: `action_${Date.now()}_repay`,
        playerId,
        category: "minor",
        cost: {},
        amount: 1,
      });
    }

    // Administrative actions
    if (player.stability < 3) {
      const cost = 5 + player.stability;
      if (player.monarchPower.administrative >= cost) {
        actions.push({
          type: "INCREASE_STABILITY",
          id: `action_${Date.now()}_stability`,
          playerId,
          category: "administrative",
          cost: { administrative: cost },
        });
      }
    }

    // Diplomatic actions
    if (player.monarchPower.diplomatic >= 1) {
      // Could place influence - simplified example
      actions.push({
        type: "INFLUENCE",
        id: `action_${Date.now()}_influence`,
        playerId,
        category: "diplomatic",
        cost: { diplomatic: 1 },
        targetAreas: [], // Would be filled in with valid areas
        cubesPerArea: {},
      });
    }

    // Trade action
    if (player.monarchPower.diplomatic >= 1 && !player.hasPlayedEvent) {
      actions.push({
        type: "TRADE",
        id: `action_${Date.now()}_trade`,
        playerId,
        category: "diplomatic",
        cost: { diplomatic: 1 },
        drawnCards: [], // Would draw 3 cards
        selectedCard: "",
        tradeNodeId: "",
        merchantId: "",
      });
    }

    // TODO: Add more action types
    // - Recruit units
    // - Move armies
    // - Declare war
    // - Research ideas
    // - etc.

    return actions;
  }

  // Score an action based on AI profile and game state
  private scoreAction(
    action: GameAction,
    state: EvaluatedGameState,
    profile: AIProfile
  ): ScoredAction {
    let score = 0;

    const myPosition = state.myPosition;

    // Base scoring by action type and personality
    switch (action.type) {
      case "TAKE_LOAN": {
        // Only take loans if we need money urgently
        const needUrgently = myPosition.treasury < 5;
        score = needUrgently ? 70 : 30;
        break;
      }

      case "REPAY_LOAN": {
        // Repay loans if we have excess money
        const hasExcess = myPosition.treasury > 20;
        score = hasExcess ? 60 : 20;
        break;
      }

      case "INCREASE_STABILITY": {
        // High priority if stability is negative
        const stabilityBonus = myPosition.stability < 0 ? 50 : 20;
        score = 50 + stabilityBonus;
        score *= profile.weights.expansion / 100; // Stability helps expansion
        break;
      }

      case "INFLUENCE":
        score = 60;
        score *= profile.weights.diplomacy / 100;
        break;

      case "TRADE":
        score = 70;
        score *= profile.weights.economy / 100;
        break;

      case "FORGE_ALLIANCE":
        score = 65;
        score *= profile.weights.diplomacy / 100;
        break;

      case "DECLARE_WAR":
        score = 80;
        score *= profile.weights.military / 100;

        // Reduce score if we're weak or at risk
        if (state.imThreatened) {
          score *= 0.5;
        }
        break;

      case "RESEARCH_IDEA":
        score = 55;
        score *= profile.weights.ideas / 100;
        break;

      default:
        score = 50;
    }

    // Adjust for game state
    if (state.imLeader && action.category === "military") {
      score *= 1.2; // Leaders can afford to be aggressive
    }

    if (!state.imLeader && state.roundsRemaining < 5) {
      // End game - prioritize prestige
      if (action.type === "RESEARCH_IDEA" || action.type === "FORGE_ALLIANCE") {
        score *= 1.3;
      }
    }

    // Check if we can afford it
    const canAfford = this.canAffordAction(action, myPosition);

    return {
      action,
      score: Math.min(100, Math.max(0, score)),
      scoring: {
        alignsWithGoals: score,
        resourceEfficiency: canAfford ? 80 : 0,
        timing: 70,
        riskVsReward: 60,
        strategicValue: 65,
      },
      expectedOutcome: {},
      canExecute: canAfford,
      blockerReason: canAfford ? undefined : "Cannot afford",
    };
  }

  // Check if player can afford action
  private canAffordAction(action: GameAction, position: PlayerPosition): boolean {
    const cost = action.cost;

    if (cost.administrative && position.monarchPower.adm < cost.administrative) {
      return false;
    }

    if (cost.diplomatic && position.monarchPower.dip < cost.diplomatic) {
      return false;
    }

    if (cost.military && position.monarchPower.mil < cost.military) {
      return false;
    }

    if (cost.ducats && position.treasury < cost.ducats) {
      return false;
    }

    return true;
  }

  // Evaluate current game state
  private evaluateGameState(playerId: PlayerId, gameState: CompleteGameState): EvaluatedGameState {
    const myPosition = this.getPlayerPosition(playerId, gameState);

    const otherPlayers: Partial<Record<PlayerId, PlayerPosition>> = {};
    for (const pid of Object.keys(gameState.players)) {
      if (pid !== playerId) {
        otherPlayers[pid as PlayerId] = this.getPlayerPosition(pid as PlayerId, gameState);
      }
    }

    // Determine if we're leading
    const allPrestige = Object.values(gameState.players).map((p) => p.prestige);
    const maxPrestige = Math.max(...allPrestige);
    const imLeader = myPosition.totalPrestige >= maxPrestige;

    // Determine if we're threatened
    const myMilitary = myPosition.militaryStrength;
    const imThreatened = Object.values(otherPlayers).some(
      (p) => p.relationToMe === "enemy" && p.militaryStrength > myMilitary * 1.3
    );

    return {
      myPosition,
      otherPlayers: otherPlayers as Record<PlayerId, PlayerPosition>,
      nprs: {},
      imLeader,
      imThreatened,
      roundsRemaining: gameState.roundsPerAge * 4 - gameState.totalRounds,
    };
  }

  // Get player position summary
  private getPlayerPosition(playerId: PlayerId, gameState: CompleteGameState): PlayerPosition {
    const player = gameState.players[playerId];

    return {
      playerId,
      totalPrestige: player.prestige,
      militaryStrength:
        player.availableUnits.infantry +
        player.availableUnits.cavalry * 1.5 +
        player.availableUnits.artillery * 2,
      economicStrength: player.economy.taxIncome + player.economy.tradeIncome,
      diplomaticInfluence: player.alliances.length * 10 + player.influenceCubes.length,
      provinceCount: player.provinces.length,
      taxValue: player.totalTaxValue,
      monarchPower: {
        adm: player.monarchPower.administrative,
        dip: player.monarchPower.diplomatic,
        mil: player.monarchPower.military,
      },
      treasury: player.economy.ducats,
      stability: player.stability,
      armySize: Object.keys(player.armies).length,
      fleetSize: Object.keys(player.fleets).length,
      activeWars: player.activeWars.length,
      relationToMe: "neutral", // Would check diplomatic relations
    };
  }
}

// ==================== USAGE EXAMPLE ====================
/*
// Initialize AI players
const ai = new SimpleAI();

// Set up different AI personalities for opponents
ai.initializeAI("blue", "aggressive");   // France - aggressive
ai.initializeAI("red", "diplomatic");    // Austria - diplomatic
ai.initializeAI("green", "economic");    // England - economic

// During action phase, when it's an AI's turn:
async function handleAITurn(playerId: PlayerId, gameState: CompleteGameState) {
  const action = await ai.decideTurn(playerId, gameState);
  
  if (action) {
    // Execute the action
    return actionExecutor.execute(action, gameState);
  } else {
    // AI passes
    return handlePlayerPass(playerId, gameState);
  }
}
*/
