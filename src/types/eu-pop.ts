export type MonarchPower = { a: number; b: number; c: number };

export type Military = {
  armies?: Record<string, string[]>;
  fleets?: Record<string, string[]>;
};

export type PlayerState = {
  color: string;
  provinces?: string[];
  distantProvinces?: string[];
  vassals?: string[];
  influence?: Record<string, number>;
  stateReligion?: string;
  marriages?: string[];
  allies?: string[];
  claims?: string[];
  tradeNodes?: string[];
  military?: Military;
  monarchPower: MonarchPower;
  ducats: number;
  stability?: number;
  ideas?: string[];
  missions?: string[];
  prestige: number;
  emperor?: boolean;
  imperialAuthority?: number;
  manpowerBonus?: number;
  taxIncomeBonus?: number;
  ruler?: string;
};

export type EventDecks = {
  ageI_firstHalf: string[];
  ageI_secondHalf: string[];
  ageII: string[];
  ageIII: string[];
  ageIV: string[];
};

export type GlobalState = {
  papalCuria: Record<string, string>;
  eventDeck: EventDecks;
  powerStruggles: string[];
  dynamicNPRs: string[];
};

export type GameState = {
  scenario: string;
  timePeriod: string;
  age: number;
  round: number;
  turnOrder: string[];
  firstPlayer: string;
  players: Record<string, PlayerState>;
  global: GlobalState;
  victoryCondition: string;
};
