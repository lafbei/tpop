// --- Core Identifiers ---
export type ProvinceID = number; // e.g., 151 for Stockholm
export type DistantProvinceID = number; // e.g., 201 for a distant province
export type CountryID = string; // e.g., "SWE" for Sweden
export type AreaID = string; // e.g., "svealand"
export type DistantColoniesID = string; // e.g., "Americas"

// --- Main Interfaces ---
export interface Province {
  id: ProvinceID;
  name: string;
  owner: CountryID;
  controller: CountryID;
  area: AreaID;
}

export interface Area {
  id: AreaID;
  name: string;
  religion: string;
  provinces: ProvinceID[]; // A list of province IDs in this area
}

export interface DistantColony {
  id: DistantColoniesID;
  name: string;
  religion: string;
  distantProvinces: DistantProvinceID[]; // A list of province IDs in this area
}
