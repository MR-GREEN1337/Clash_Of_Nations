// schemas.ts

import { z } from 'zod';

export const MilitarySchema = z.object({
  expenditure: z.number().positive("Expenditure must be a positive number"),
  nuclear_capability: z.boolean(),
});

export const EconomySchema = z.object({
  inflation_rate: z.number().positive("Inflation rate must be a positive number"),
  unemployement_rate: z.number().positive("Unemployment rate must be a positive number"),
  GDP: z.number().positive("GDP must be a positive number"),
  HDI: z.number().positive("HDI must be a positive number"),
});

export const EnvironmentSchema = z.object({
  carbon_emissions: z.number().positive("Carbon emissions must be a positive number"),
  renewable_energy_percentage: z.number().positive("Renewable energy percentage must be a positive number"),
  natural_disaster_risk: z.number().positive("Natural disaster risk must be a positive number"),
});

export const GovernmentSchema = z.object({
  name: z.string().min(1, "Name is required"),
  system: z.string().min(1, "System is required"),
  democracy_level: z.string().min(1, "Democracy level is required"),
  corruption_index: z.number().positive("Corruption index must be a positive number"),
  human_rights_record: z.string().min(1, "Human rights record is required"),
  election_frequency: z.string().min(1, "Election frequency is required"),
});

export const CountrySchema = z.object({
  name: z.string().min(1, "Name is required"),
  military_power: MilitarySchema,
  alliances: z.array(z.string().min(1, "Alliance name is required")),
  social_media_sentiment: z.enum(["positive", "negative", "neutral"]),
  economy: EconomySchema,
  env_factors: EnvironmentSchema,
  government: GovernmentSchema,
});

export const EnterpriseSchema = z.object({
  name: z.string().min(1, "Name is required"),
  industry: z.string().min(1, "Industry is required"),
  revenue: z.number().positive("Revenue must be a positive number"),
  number_of_employees: z.number().int().positive("Number of employees must be a positive integer"),
  market_cap: z.number().positive("Market cap must be a positive number"),
  business_strategy: z.string().min(1, "Business strategy is required"),
  country_of_incorporation: z.string().min(1, "Country of incorporation is required"),
});

export const OrganizationSchema = z.object({
  name: z.string().min(1, "Name is required"),
  type: z.enum(["NGO", "Government", "Private Sector", "International"]),
  influence_level: z.number().positive("Influence level must be a positive number"),
  number_of_members: z.number().positive("Number of members must be a positive number"),
  primary_focus: z.string().min(1, "Primary focus is required"),
});

export const SocialMediaSchema = z.object({
  messages: z.array(z.string().min(1, "Message cannot be empty")),
});

export const GameSchema = z.object({
  countries: z.array(CountrySchema).optional(),
  enterprises: z.array(EnterpriseSchema).optional(),
  scenario: z.array(z.string().min(1, "Scenario cannot be empty")).optional(),
  social_media_messages: SocialMediaSchema.optional(),
  messages: z.array(z.any()).optional(), // Assuming BaseMessage can be of any type
  next: z.string().optional(),
  updates: z.record(z.any()), // updates can have any shape
});
