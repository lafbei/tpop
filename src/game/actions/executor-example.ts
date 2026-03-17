/**
 * Example Action Executors
 * Demonstrates how to implement game actions using the scaffolded types
 */

import type {
  GameAction,
  TakeLoanAction,
  RepayLoanAction,
  IncreaseStabilityAction,
  InfluenceAction,
  MonarchPowerCost,
} from "./types";
import type { EnhancedPlayerState, CompleteGameState } from "../state/enhanced-types";

// ==================== ACTION RESULT ====================
export interface ActionResult {
  success: boolean;
  newState: CompleteGameState;
  error?: string;
  logs: string[];
}

// ==================== VALIDATION HELPERS ====================
export function canAffordCost(
  player: EnhancedPlayerState,
  cost: MonarchPowerCost
): { canAfford: boolean; reason?: string } {
  if (cost.administrative && player.monarchPower.administrative < cost.administrative) {
    return {
      canAfford: false,
      reason: `Need ${cost.administrative} administrative power, have ${player.monarchPower.administrative}`,
    };
  }

  if (cost.diplomatic && player.monarchPower.diplomatic < cost.diplomatic) {
    return {
      canAfford: false,
      reason: `Need ${cost.diplomatic} diplomatic power, have ${player.monarchPower.diplomatic}`,
    };
  }

  if (cost.military && player.monarchPower.military < cost.military) {
    return {
      canAfford: false,
      reason: `Need ${cost.military} military power, have ${player.monarchPower.military}`,
    };
  }

  if (cost.ducats && player.economy.ducats < cost.ducats) {
    return {
      canAfford: false,
      reason: `Need ${cost.ducats} ducats, have ${player.economy.ducats}`,
    };
  }

  return { canAfford: true };
}

export function deductCost(
  player: EnhancedPlayerState,
  cost: MonarchPowerCost
): EnhancedPlayerState {
  return {
    ...player,
    monarchPower: {
      ...player.monarchPower,
      administrative: player.monarchPower.administrative - (cost.administrative || 0),
      diplomatic: player.monarchPower.diplomatic - (cost.diplomatic || 0),
      military: player.monarchPower.military - (cost.military || 0),
    },
    economy: {
      ...player.economy,
      ducats: player.economy.ducats - (cost.ducats || 0),
    },
  };
}

// ==================== EXAMPLE: TAKE LOAN ====================
export function executeTakeLoan(
  action: TakeLoanAction,
  state: CompleteGameState
): ActionResult {
  const logs: string[] = [];
  const player = state.players[action.playerId];

  // Validate
  if (player.economy.loans >= 5) {
    return {
      success: false,
      newState: state,
      error: "Cannot have more than 5 loans (interest tokens)",
      logs,
    };
  }

  // Execute
  logs.push(`${player.nationName} takes a loan for 5 ducats`);

  const updatedPlayer: EnhancedPlayerState = {
    ...player,
    economy: {
      ...player.economy,
      ducats: player.economy.ducats + 5,
      loans: player.economy.loans + 1,
      interestCost: player.economy.interestCost + 1,
      taxIncome: player.economy.taxIncome - 1, // Each loan reduces income by 1
    },
  };

  return {
    success: true,
    newState: {
      ...state,
      players: {
        ...state.players,
        [action.playerId]: updatedPlayer,
      },
      gameLog: [
        ...state.gameLog,
        {
          id: `log_${Date.now()}`,
          round: state.currentRound,
          timestamp: Date.now(),
          type: "event_occurred",
          primaryActor: action.playerId,
          description: `${player.nationName} took a loan`,
          details: { ducatsGained: 5, loansTotal: updatedPlayer.economy.loans },
          visibleTo: "all",
        },
      ],
    },
    logs,
  };
}

// ==================== EXAMPLE: REPAY LOAN ====================
export function executeRepayLoan(
  action: RepayLoanAction,
  state: CompleteGameState
): ActionResult {
  const logs: string[] = [];
  const player = state.players[action.playerId];

  // Validate
  if (player.economy.loans === 0) {
    return {
      success: false,
      newState: state,
      error: "No loans to repay",
      logs,
    };
  }

  if (player.economy.ducats < 6) {
    return {
      success: false,
      newState: state,
      error: "Need 6 ducats to repay a loan (5 principal + 1 interest)",
      logs,
    };
  }

  // Execute
  logs.push(`${player.nationName} repays a loan for 6 ducats`);

  const updatedPlayer: EnhancedPlayerState = {
    ...player,
    economy: {
      ...player.economy,
      ducats: player.economy.ducats - 6,
      loans: player.economy.loans - 1,
      interestCost: player.economy.interestCost - 1,
      taxIncome: player.economy.taxIncome + 1, // Restore income
    },
  };

  return {
    success: true,
    newState: {
      ...state,
      players: {
        ...state.players,
        [action.playerId]: updatedPlayer,
      },
      gameLog: [
        ...state.gameLog,
        {
          id: `log_${Date.now()}`,
          round: state.currentRound,
          timestamp: Date.now(),
          type: "event_occurred",
          primaryActor: action.playerId,
          description: `${player.nationName} repaid a loan`,
          details: { ducatsPaid: 6, loansRemaining: updatedPlayer.economy.loans },
          visibleTo: "all",
        },
      ],
    },
    logs,
  };
}

// ==================== EXAMPLE: INCREASE STABILITY ====================
export function executeIncreaseStability(
  action: IncreaseStabilityAction,
  state: CompleteGameState
): ActionResult {
  const logs: string[] = [];
  const player = state.players[action.playerId];

  // Validate max stability
  if (player.stability >= 3) {
    return {
      success: false,
      newState: state,
      error: "Stability is already at maximum (+3)",
      logs,
    };
  }

  // Calculate cost: 5 + current stability
  const cost: MonarchPowerCost = {
    administrative: 5 + player.stability,
  };

  const affordCheck = canAffordCost(player, cost);
  if (!affordCheck.canAfford) {
    return {
      success: false,
      newState: state,
      error: affordCheck.reason,
      logs,
    };
  }

  // Execute
  logs.push(
    `${player.nationName} increases stability from ${player.stability} to ${player.stability + 1}`
  );

  let updatedPlayer = deductCost(player, cost);
  updatedPlayer = {
    ...updatedPlayer,
    stability: updatedPlayer.stability + 1,
  };

  return {
    success: true,
    newState: {
      ...state,
      players: {
        ...state.players,
        [action.playerId]: updatedPlayer,
      },
      gameLog: [
        ...state.gameLog,
        {
          id: `log_${Date.now()}`,
          round: state.currentRound,
          timestamp: Date.now(),
          type: "stability_change",
          primaryActor: action.playerId,
          description: `${player.nationName} increased stability to ${updatedPlayer.stability}`,
          details: { oldStability: player.stability, newStability: updatedPlayer.stability },
          visibleTo: "all",
        },
      ],
    },
    logs,
  };
}

// ==================== EXAMPLE: PLACE INFLUENCE ====================
export function executeInfluence(
  action: InfluenceAction,
  state: CompleteGameState
): ActionResult {
  const logs: string[] = [];
  const player = state.players[action.playerId];

  // Calculate total cost
  const totalCubes = Object.values(action.cubesPerArea).reduce(
    (sum: number, count: number) => sum + count,
    0
  );
  if (totalCubes === 0) {
    return {
      success: false,
      newState: state,
      error: "Must place at least 1 influence cube",
      logs,
    };
  }

  // First cube costs 1 diplomatic power, subsequent cubes cost 1 power OR 3 ducats each
  const firstCubeCost = 1;
  const additionalCubes = totalCubes - 1;

  // For this example, let's assume we pay with power for all
  const totalCost: MonarchPowerCost = {
    diplomatic: firstCubeCost + additionalCubes,
  };

  const affordCheck = canAffordCost(player, totalCost);
  if (!affordCheck.canAfford) {
    return {
      success: false,
      newState: state,
      error: affordCheck.reason,
      logs,
    };
  }

  // Validate areas can accept influence
  for (const [areaId, count] of Object.entries(action.cubesPerArea)) {
    const areaInfluence = state.areaInfluence[areaId];

    if (!areaInfluence) {
      return {
        success: false,
        newState: state,
        error: `Area ${areaId} not found`,
        logs,
      };
    }

    const totalInfluenceInArea = Object.values(areaInfluence.influences).reduce(
      (sum: number, c: number) => sum + c,
      0
    );

    if (totalInfluenceInArea + count > 5) {
      return {
        success: false,
        newState: state,
        error: `Area ${areaId} cannot have more than 5 total influence cubes`,
        logs,
      };
    }

    if (areaInfluence.isPlayerOwned) {
      return {
        success: false,
        newState: state,
        error: `Cannot place influence in ${areaId} - completely owned by players`,
        logs,
      };
    }
  }

  // Execute
  let updatedPlayer = deductCost(player, totalCost);

  const newInfluenceCubes: string[] = [];
  const updatedAreaInfluence = { ...state.areaInfluence };

  for (const [areaId, count] of Object.entries(action.cubesPerArea)) {
    logs.push(`${player.nationName} places ${count} influence in ${areaId}`);

    // Create new influence cubes
    for (let i = 0; i < count; i++) {
      const cubeId = `influence_${action.playerId}_${areaId}_${Date.now()}_${i}`;
      newInfluenceCubes.push(cubeId);
    }

    // Update area influence
    updatedAreaInfluence[areaId] = {
      ...updatedAreaInfluence[areaId],
      influences: {
        ...updatedAreaInfluence[areaId].influences,
        [action.playerId]:
          (updatedAreaInfluence[areaId].influences[action.playerId] || 0) + count,
      },
    };
  }

  updatedPlayer = {
    ...updatedPlayer,
    influenceCubes: [...updatedPlayer.influenceCubes, ...newInfluenceCubes],
  };

  return {
    success: true,
    newState: {
      ...state,
      players: {
        ...state.players,
        [action.playerId]: updatedPlayer,
      },
      areaInfluence: updatedAreaInfluence,
      gameLog: [
        ...state.gameLog,
        {
          id: `log_${Date.now()}`,
          round: state.currentRound,
          timestamp: Date.now(),
          type: "event_occurred",
          primaryActor: action.playerId,
          description: `${player.nationName} placed ${totalCubes} influence`,
          details: { areas: action.targetAreas },
          visibleTo: "all",
        },
      ],
    },
    logs,
  };
}

// ==================== ACTION EXECUTOR ====================
export class ActionExecutor {
  execute(action: GameAction, state: CompleteGameState): ActionResult {
    switch (action.type) {
      case "TAKE_LOAN":
        return executeTakeLoan(action as TakeLoanAction, state);

      case "REPAY_LOAN":
        return executeRepayLoan(action as RepayLoanAction, state);

      case "INCREASE_STABILITY":
        return executeIncreaseStability(action as IncreaseStabilityAction, state);

      case "INFLUENCE":
        return executeInfluence(action as InfluenceAction, state);

      default:
        return {
          success: false,
          newState: state,
          error: `Action type ${(action as GameAction).type} not yet implemented`,
          logs: [],
        };
    }
  }
}

// ==================== USAGE EXAMPLE ====================
/*
// In your game controller:

const executor = new ActionExecutor();

function handlePlayerAction(action: GameAction, state: CompleteGameState) {
  const result = executor.execute(action, state);
  
  if (result.success) {
    console.log('Action succeeded:', result.logs);
    return result.newState;
  } else {
    console.error('Action failed:', result.error);
    return state; // Return unchanged state
  }
}

// Example usage:
const loanAction: TakeLoanAction = {
  type: "TAKE_LOAN",
  id: "action_123",
  playerId: "yellow",
  category: "minor",
  cost: {},
  canBeReaction: true
};

const newState = handlePlayerAction(loanAction, currentGameState);
*/
