# Europa Universalis Board Game - Implementation Scaffolding

This scaffolding provides type definitions and system architecture for implementing a single-player digital version of Europa Universalis: The Price of Power board game with AI opponents.

## 📁 Structure Overview

### Core Systems Created

1. **Actions System** (`game/actions/types.ts`)
   - All action types (Minor, Generic, Administrative, Diplomatic, Military)
   - Action costs and validation structures
   - Casus belli types for warfare

2. **Cards System** (`game/cards/types.ts`)
   - Action cards (Advisers, Leaders, Display cards)
   - Event cards with choices and effects
   - Mission cards with prerequisites and rewards
   - Idea cards for research
   - Trade cards for commerce
   - Milestone cards for public objectives

3. **Warfare System** (`game/warfare/types.ts`)
   - Military units (infantry, cavalry, artillery, ships)
   - Armies and fleets
   - Battle mechanics
   - Siege operations
   - Peace terms and truces
   - Rebels and unrest

4. **Diplomacy System** (`game/diplomacy/types.ts`)
   - Alliances and royal marriages
   - Influence cubes and claims
   - Vassals and overlords
   - Non-player realms (NPRs)
   - Trade nodes and merchants
   - Papal Curia (Catholic church)
   - Holy Roman Empire

5. **AI System** (`game/ai/types.ts`)
   - AI personalities and difficulty levels
   - Strategic planning and goal setting
   - Action evaluation and scoring
   - Threat and opportunity assessment
   - Decision-making framework
   - Learning and adaptation

6. **Missions & Milestones** (`game/missions/types.ts`)
   - Personal mission chains (3 tiers per track)
   - Mission prerequisites and conditions
   - Public milestones for all players
   - Progress tracking
   - Reward distribution

7. **Enhanced Game State** (`game/state/enhanced-types.ts`)
   - Complete game state integrating all systems
   - Player state with all resources
   - NPR management
   - Phase handling
   - Game controller interface

## 🎯 Key Game Concepts

### Monarch Powers
- **Administrative**: Development, stability, colonization
- **Diplomatic**: Alliances, trade, influence
- **Military**: Warfare, recruitment, movement

### Action Phase Flow
1. Players take turns performing one main action
2. Can perform unlimited minor actions on their turn
3. Must play an event card before passing
4. First player to pass gets bonus ducats

### War System
1. Declare war with casus belli
2. Call allies to arms (offensive or defensive)
3. Move armies and fight battles
4. Siege enemy provinces
5. Negotiate peace terms

### AI Implementation
- Personality-based (aggressive, diplomatic, economic, etc.)
- Evaluates actions based on strategic goals
- Threat assessment and opportunity recognition
- Difficulty scaling through decision quality

## 🚀 Getting Started

### Step 1: Implement Basic Actions

Start with the simpler actions to build familiarity:

```typescript
// Example: Implement the Take Loan action
import type { TakeLoanAction } from './game/actions/types';
import type { EnhancedPlayerState } from './game/state/enhanced-types';

function executeTakeLoan(
  action: TakeLoanAction, 
  state: EnhancedPlayerState
): EnhancedPlayerState {
  // Check prerequisites
  if (state.economy.loans >= 5) {
    throw new Error("Cannot take more than 5 loans");
  }
  
  // Execute action
  return {
    ...state,
    economy: {
      ...state.economy,
      ducats: state.economy.ducats + 5,
      loans: state.economy.loans + 1,
      interestCost: state.economy.interestCost + 1
    }
  };
}
```

### Step 2: Build Action Validators

Create validators for each action type:

```typescript
import type { GameAction } from './game/actions/types';
import type { ActionValidation } from './game/actions/types';

function validateAction(
  action: GameAction,
  playerState: EnhancedPlayerState
): ActionValidation {
  switch (action.type) {
    case "TAKE_LOAN":
      return validateTakeLoan(action, playerState);
    case "INCREASE_STABILITY":
      return validateIncreaseStability(action, playerState);
    // ... other actions
  }
}
```

### Step 3: Implement Simple AI

Start with a basic AI that makes random valid moves:

```typescript
import type { AIProfile, AIDecision } from './game/ai/types';

class BasicAI {
  async decideTurn(
    playerId: PlayerId,
    gameState: CompleteGameState
  ): Promise<GameAction> {
    // 1. Get all valid actions
    const validActions = this.getAllValidActions(playerId, gameState);
    
    // 2. Score each action based on personality
    const scoredActions = validActions.map(action => 
      this.scoreAction(action, gameState)
    );
    
    // 3. Pick highest scoring action
    const best = scoredActions.sort((a, b) => b.score - a.score)[0];
    
    return best.action;
  }
}
```

### Step 4: Build Game Loop

Create the main game loop that handles phases:

```typescript
class GameEngine {
  async runRound(state: CompleteGameState): Promise<CompleteGameState> {
    // Draw cards phase
    state = await this.handleDrawPhase(state);
    
    // Action phase (players take turns)
    state = await this.handleActionPhase(state);
    
    // Peace and rebels phase
    state = await this.handlePeacePhase(state);
    
    // Income and upkeep phase
    state = await this.handleIncomePhase(state);
    
    // Cleanup phase
    state = await this.handleCleanupPhase(state);
    
    return state;
  }
}
```

## 📋 Implementation Priority

Recommended order for implementing systems:

### Phase 1: Core Mechanics (Weeks 1-2)
- [ ] Basic game state management
- [ ] Player resources (monarch power, ducats, prestige)
- [ ] Simple actions (loans, stability, national focus)
- [ ] Turn order and passing

### Phase 2: Territory & Economy (Weeks 3-4)
- [ ] Province ownership
- [ ] Tax income calculation
- [ ] Trade system basics
- [ ] Merchant placement

### Phase 3: Diplomacy (Weeks 5-6)
- [ ] Influence placement
- [ ] Alliance formation
- [ ] Royal marriages
- [ ] Claims fabrication
- [ ] NPR behavior

### Phase 4: Military (Weeks 7-9)
- [ ] Unit recruitment
- [ ] Army movement
- [ ] Battle resolution
- [ ] Siege mechanics
- [ ] War declaration and peace

### Phase 5: Cards (Weeks 10-11)
- [ ] Card drawing and hand management
- [ ] Event card selection
- [ ] Advisers and leaders
- [ ] Card effects execution

### Phase 6: Advanced Systems (Weeks 12-14)
- [ ] Missions system
- [ ] Milestones tracking
- [ ] Ideas research
- [ ] Colonization
- [ ] Papal Curia
- [ ] Holy Roman Empire

### Phase 7: AI (Weeks 15-18)
- [ ] Basic AI decision-making
- [ ] Personality implementation
- [ ] Strategic planning
- [ ] Threat assessment
- [ ] Difficulty scaling

### Phase 8: Polish (Weeks 19-20)
- [ ] Complete all card effects
- [ ] Balance testing
- [ ] Bug fixes
- [ ] Performance optimization

## 🎮 Testing Strategy

1. **Unit Tests**: Test individual action executors
2. **Integration Tests**: Test phase handlers
3. **AI Tests**: Test AI decision quality
4. **Playthrough Tests**: Complete game simulations

## 📚 Reference

Key game concepts from the tutorial:

- **Tax Value**: Sum of province values (small town = 1, large town = 2)
- **Military Capacity**: Tax value of area + adjacent areas
- **Stability Range**: -3 to +3
- **Hand Limit**: 5 cards (4 at start + event card)
- **Maximum Loans**: 5 interest tokens
- **Alliance Cost**: Half target's tax value (max 3 power)
- **Influence Limit**: 5 cubes per area
- **Armies per Player**: 3 armies + 1 fleet

## 🔧 Utility Functions Needed

You'll want to create helper functions for:

```typescript
// State queries
function getPlayerProvinces(playerId: PlayerId, state: CompleteGameState): Province[]
function getPlayerTaxValue(playerId: PlayerId, state: CompleteGameState): number
function getPlayerMilitaryStrength(playerId: PlayerId, state: CompleteGameState): number

// Validation
function canAffordAction(playerId: PlayerId, cost: MonarchPowerCost, state: CompleteGameState): boolean
function canDeclareWar(attacker: PlayerId, target: CountryID, state: CompleteGameState): boolean

// Calculations
function calculateMilitaryCapacity(areaId: AreaID, playerId: PlayerId, state: CompleteGameState): number
function calculateBattleResult(attacker: BattleSide, defender: BattleSide): BattleResult
function calculateTradeIncome(playerId: PlayerId, tradeNode: string, state: CompleteGameState): number

// AI helpers
function evaluateThreat(from: CountryID, to: PlayerId, state: CompleteGameState): number
function findBestExpansionTarget(playerId: PlayerId, state: CompleteGameState): CountryID | null
```

## 💡 Tips

1. **Start Small**: Implement one action type completely before moving to the next
2. **Test Early**: Write tests as you build each system
3. **Use TypeScript**: The type system will catch many bugs
4. **Log Everything**: Comprehensive logging helps debug AI behavior
5. **Iterate on AI**: Start with simple AI, gradually make it smarter
6. **Reference the Tutorial**: The 50-minute video covers edge cases

## 🤝 Contributing

When implementing systems:
- Follow the type definitions provided
- Add JSDoc comments for complex functions
- Create unit tests for all game mechanics
- Update this README with implementation notes

Good luck building your digital Europa Universalis game! 🎲👑
