interface Military {
  nuclear_capability: boolean;
}

interface Economy {
  inflation_rate?: number;
  unemployement_rate?: number;
  GDP?: number;
  HDI?: number;
}

interface Environment {
  carbon_emissions: number;
  renewable_energy_percentage: number;
  natural_disaster_risk: number;
}

interface Government {
  name: string;
  system: string;
  democracy_level?: string;
  corruption_index?: number;
  human_rights_record?: string;
  election_frequency?: string;
}

export interface Country {
  name: string;
  military_power: Military;
  alliances: string[];
  social_media_sentiment: 'positive' | 'negative' | 'neutral';
  economy: Economy;
  env_factors?: Environment;
  government: Government;
  flag: 'Bot' | 'Human';
}

export interface Enterprise {
  name: string;
  industry: string;
  revenue: number;
  number_of_employees: number;
  market_cap: number;
  business_strategy: string;
  country_of_incorporation: string;
  tension_with_country: 'Low' | 'Mid' | 'High';
  social_media_sentiment: 'positive' | 'negative' | 'neutral';
  flag: 'Bot' | 'Human';
}