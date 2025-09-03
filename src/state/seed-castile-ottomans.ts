// EUTPOP – Grand Campaign 1444 minimal types + seeder for Castile (yellow) and Ottomans (green)

// ---------- Types ----------
export type PlayerColor = "yellow" | "green";
export type AreaId = string;          // e.g., "CastillaLaVieja", "MacedoniaThrace"
export type SeaZoneId = string;       // e.g., "WesternMediterranean", "AegeanSea"
export type TradeNodeId = string;     // e.g., "Sevilla", "Genoa", "BlackSea", "Alexandria"
export type ProvinceId = string;      // free-form; use your internal IDs if you have them

export interface MetaState {
  scenario: string;
  age: number;
  round: number;
  firstPlayer: PlayerColor;
  turnOrder: PlayerColor[];
}

export interface HREState {
  imperialAuthority: number;
  emperor: PlayerColor | null;
  imperialInfluence: Array<{ area: AreaId; amount: number }>;
}

export interface PapacyState {
  controller: PlayerColor | null;
  cardinals: Array<{ owner: PlayerColor; slot: number }>; // minimal
}

export interface BoardState {
  events: { deck: string[]; display: string[] };
  ideas: { display: string[] };
  hre: HREState;
  papacy: PapacyState;
  prestigeTrack: Record<string, never>;
}

export interface MonarchPower { adm: number; dip: number; mil: number }

export type TownSize = "S" | "L";

export interface TownPlacement {
  province: ProvinceId;
  area: AreaId;
  size: TownSize;
}

export interface VassalLink {
  realm: string;
  areas: AreaId[];
}

export interface Claim {
  area: AreaId;
  type: "Conquest" | string;
}

export interface Influence {
  area: AreaId;
  amount: number; // tokens placed now (not max)
}

export interface Merchant {
  node: TradeNodeId;
  active: boolean; // laid down for the round
}

export interface Army {
  id: string;
  location: { area: AreaId };
  general: string | null; // card id or name
  units: { inf: number; cav: number; art: number; mercInf: number; mercCav: number };
}

export interface Fleet {
  id: string;
  location: { sea: SeaZoneId };
  admiral: string | null;
  ships: { light: number; heavy: number; galley: number };
}

export interface ManpowerState {
  available: number;
  exhausted: number;
  deployedRegular: number;
  maxRegular: number | null; // null if your engine derives from tracks
}

export interface PlayerState {
  realm: string;
  color: PlayerColor;
  stateReligion: string;
  stability: number;
  treasury: number;
  monarchPower: MonarchPower;
  advisors: { adm: string | null; dip: string | null; mil: string | null };
  ruler: { name: string; adm: number; dip: number; mil: number };
  towns: TownPlacement[];
  vassals: VassalLink[];
  claims: Claim[];
  influence: Influence[];
  alliances: string[]; // realm names or player ids
  marriages: string[]; // realm names or player ids
  missions: string[];  // card ids
  merchants: Merchant[];
  armies: Army[];
  fleets: Fleet[];
  manpower: ManpowerState;
  townTrack: { smallPlaced: number; largePlaced: number };
  vassalTrack: { tokensPlaced: number };
  prestige: number;
  passed: boolean;
}

export interface RulesState {
  phase: 1 | 2 | 3 | 4 | 5;
  subphase: string;
  eventsTakenThisRound: PlayerColor[];
  passedOrder: PlayerColor[];
}

export interface GameState {
  meta: MetaState;
  banks: { ducatsSupply: number };
  board: BoardState;
  players: Record<PlayerColor, PlayerState>;
  rulesState: RulesState;
}

// ---------- Helpers ----------
// If you want to compute manpower max from track placements, wire this to your engine.
export function deriveMaxManpowerFromTracks(townSmallPlaced: number, townLargePlaced: number, vassalTokensPlaced: number): number {
  // This is a placeholder; your engine likely maps uncovered track slots -> m value
  // Return null from the seeder to force your reducer to recompute.
  const _ignore = townSmallPlaced + townLargePlaced + vassalTokensPlaced;
  void _ignore;
  return 0;
}

// ---------- Seeder ----------
export function seedS201(): GameState {
  const state: GameState = {
    meta: {
      scenario: "Grand Campaign 1444",
      age: 1,
      round: 1,
      firstPlayer: "yellow",
      turnOrder: ["yellow", "green"]
    },
    banks: {
      ducatsSupply: 9999
    },
    board: {
      events: { deck: [], display: [] },
      ideas: { display: [] },
      hre: { imperialAuthority: 0, emperor: null, imperialInfluence: [] },
      papacy: { controller: null, cardinals: [] },
      prestigeTrack: {}
    },
    players: {
      yellow: {
        realm: "Castile",
        color: "yellow",
        stateReligion: "Catholic",
        stability: 0,
        treasury: 15,
        monarchPower: { adm: 3, dip: 3, mil: 3 },
        advisors: { adm: null, dip: null, mil: null },
        ruler: { name: "Starting Ruler", adm: 1, dip: 1, mil: 1 },
        towns: [
          { province: "Toledo",            area: "CastillaLaNueva", size: "L" },
          { province: "León",              area: "Leon",            size: "L" },
          { province: "Castilla la Vieja", area: "CastillaLaVieja", size: "S" },
          { province: "Galicia",           area: "Galicia",         size: "S" },
          { province: "Badajoz",           area: "Extremadura",     size: "S" },
          { province: "Salamanca",         area: "Salamanca",       size: "S" },
          { province: "Asturias",          area: "Asturias",        size: "S" },
          { province: "Sevilla",           area: "Andalucia",       size: "S" },
          { province: "Córdoba",           area: "Andalucia",       size: "S" },
          { province: "Granada",           area: "Andalucia",       size: "S" }
        ],
        vassals: [ { realm: "Navarra", areas: ["Navarra"] } ],
        claims: [ { area: "Andalucia", type: "Conquest" } ],
        influence: [
          { area: "Aragon", amount: 2 },
          { area: "Portugal", amount: 1 },
          { area: "Naples", amount: 1 },
          { area: "NorthAfrica", amount: 1 }
        ],
        alliances: [],
        marriages: [],
        missions: [],
        merchants: [
          { node: "Sevilla",   active: false },
          { node: "Genoa",     active: false }
        ],
        armies: [
          { id: "Y-A1", location: { area: "CastillaLaVieja" }, general: null, units: { inf: 2, cav: 0, art: 0, mercInf: 0, mercCav: 0 } },
          { id: "Y-A2", location: { area: "Andalucia" },      general: null, units: { inf: 1, cav: 1, art: 0, mercInf: 0, mercCav: 0 } }
        ],
        fleets: [
          { id: "Y-F1", location: { sea: "WesternMediterranean" }, admiral: null, ships: { light: 1, heavy: 1, galley: 0 } }
        ],
        manpower: { available: 0, exhausted: 0, deployedRegular: 4, maxRegular: null },
        townTrack: { smallPlaced: 8, largePlaced: 2 },
        vassalTrack: { tokensPlaced: 1 },
        prestige: 0,
        passed: false
      },
      green: {
        realm: "Ottomans",
        color: "green",
        stateReligion: "Muslim",
        stability: 0,
        treasury: 15,
        monarchPower: { adm: 3, dip: 3, mil: 3 },
        advisors: { adm: null, dip: null, mil: null },
        ruler: { name: "Starting Ruler", adm: 1, dip: 1, mil: 1 },
        towns: [
          { province: "Edirne",       area: "MacedoniaThrace",  size: "L" },
          { province: "Hüdavendigar", area: "Bithynia",          size: "L" },
          { province: "Selanik",      area: "MacedoniaThrace",  size: "S" },
          { province: "Yanya",        area: "Epirus",            size: "S" },
          { province: "Sofya",        area: "Bulgaria",          size: "S" },
          { province: "Silistre",     area: "WallachiaBulgaria", size: "S" },
          { province: "Ankara",       area: "Anatolia",          size: "S" },
          { province: "Izmir",        area: "AegeanCoast",       size: "S" },
          { province: "Kütahya",      area: "Anatolia",          size: "S" },
          { province: "Menteşe",      area: "AegeanCoast",       size: "S" },
          { province: "Teke",         area: "AnatoliaSouth",     size: "S" },
          { province: "Amasya",       area: "Rum",               size: "S" },
          { province: "Sivas",        area: "Rum",               size: "S" }
        ],
        vassals: [],
        claims: [ { area: "MacedoniaThrace", type: "Conquest" } ],
        influence: [
          { area: "Karaman",           amount: 2 },
          { area: "Kurdistan",         amount: 1 },
          { area: "Rum",               amount: 1 },
          { area: "WallachiaBulgaria", amount: 1 },
          { area: "SerbiaAlbania",     amount: 1 }
        ],
        alliances: [],
        marriages: [],
        missions: [],
        merchants: [
          { node: "BlackSea",   active: false },
          { node: "Alexandria", active: false }
        ],
        armies: [
          { id: "G-A1", location: { area: "MacedoniaThrace" }, general: null, units: { inf: 2, cav: 1, art: 0, mercInf: 0, mercCav: 0 } }
        ],
        fleets: [
          { id: "G-F1", location: { sea: "AegeanSea" }, admiral: null, ships: { light: 1, heavy: 0, galley: 3 } }
        ],
        manpower: { available: 0, exhausted: 0, deployedRegular: 3, maxRegular: null },
        townTrack: { smallPlaced: 11, largePlaced: 2 },
        vassalTrack: { tokensPlaced: 0 },
        prestige: 0,
        passed: false
      }
    },
    rulesState: {
      phase: 1,
      subphase: "DrawCards",
      eventsTakenThisRound: [],
      passedOrder: []
    }
  };

  return state;
}

// ---------- Convenience: shallow clone for quick resets ----------
export function cloneSeed(): GameState {
  return JSON.parse(JSON.stringify(seedS201())) as GameState;
}
