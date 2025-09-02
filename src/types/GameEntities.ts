// --- Core Identifiers ---
export type ProvinceID = number; // e.g., 151 for Stockholm
export type DistantProvinceID = number; // e.g., 201 for a distant province
export type CountryID = string; // e.g., "SWE" for Sweden
export type AreaID = string; // e.g., "svealand"
export type DistantRegionID = string; // e.g., "Americas"
export type Religion = 'Catholic' | 'Protestant' | 'Orthodox' | 'Muslim' | 'Disputed';
export type TradeNodeID = string; // e.g., "trade_node_1"
export type MerchantID = string; // e.g., "merchant_1"
export type SeaID = string; // e.g., "sea_1"
export type Port = false | 'normal' | 'fortified';
export type Location = { x: number; y: number };

// --- Main Interfaces ---
export interface Province {
  id: ProvinceID;
  name: string;
  owner: CountryID;
  controller: CountryID;
  area: AreaID;
  port: Port;
}

export interface Area {
  id: AreaID;
  name: string;
  religion: Religion;
  provinces: ProvinceID[]; // A list of province IDs in this area
  neighboringAreas: AreaID[]; // A list of neighboring area IDs
  connectedSeas: SeaID[];
}

export interface DistantRegion {
  id: DistantRegionID;
  name: string;
  provinces: DistantProvinceID[]; // A list of province IDs in this area
}

export interface DistantProvince {
  id: DistantProvinceID;
  name: string;
  neighboringProvinces: ProvinceID[]; // A list of neighboring province IDs
  neighboringAreas: AreaID[]; // A list of neighboring area IDs
  distantRegion: DistantRegionID; // The ID of the distant region this province belongs to
}

export interface TradeNode {
  id: TradeNodeID;
  name: string;
  merchants: MerchantID[];
  connectedSeas: SeaID[];
}

export interface Sea {
  id: SeaID;
  name: string;
  connectedTradeNodes: TradeNodeID[];
  connectedSeas: SeaID[];
  connectedProvinces: ProvinceID[];
  connectedAreas: AreaID[];
  connectedDistantProvinces: DistantProvinceID[];
  tradeSlots: number[];
  numberOfTradeSlots: number;
}
