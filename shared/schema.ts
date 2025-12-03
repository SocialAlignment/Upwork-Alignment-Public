import { sql } from "drizzle-orm";
import { pgTable, text, varchar, jsonb, timestamp, integer } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const userProfiles = pgTable("user_profiles", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  resumeText: text("resume_text").notNull(),
  upworkUrl: text("upwork_url").notNull(),
  linkedinUrl: text("linkedin_url").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const analysisResults = pgTable("analysis_results", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  profileId: varchar("profile_id").notNull().references(() => userProfiles.id),
  archetype: text("archetype").notNull(),
  proficiency: integer("proficiency").notNull(),
  skills: jsonb("skills").notNull().$type<string[]>(),
  projects: jsonb("projects").notNull().$type<{ name: string; type: string }[]>(),
  gapTitle: text("gap_title").notNull(),
  gapDescription: text("gap_description").notNull(),
  suggestedPivot: text("suggested_pivot").notNull(),
  missingSkillCluster: text("missing_skill_cluster").notNull(),
  missingSkill: text("missing_skill").notNull(),
  missingSkillDesc: text("missing_skill_desc").notNull(),
  clientGapType: text("client_gap_type").notNull(),
  clientGap: text("client_gap").notNull(),
  clientGapDesc: text("client_gap_desc").notNull(),
  recommendedKeywords: jsonb("recommended_keywords").notNull().$type<string[]>(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const upworkKnowledge = pgTable("upwork_knowledge", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  knowledgeType: varchar("knowledge_type").notNull(),
  data: jsonb("data").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertUserProfileSchema = createInsertSchema(userProfiles).omit({
  id: true,
  createdAt: true,
});

export const insertAnalysisResultSchema = createInsertSchema(analysisResults).omit({
  id: true,
  createdAt: true,
});

export const insertUpworkKnowledgeSchema = createInsertSchema(upworkKnowledge).omit({
  id: true,
  createdAt: true,
});

export type InsertUserProfile = z.infer<typeof insertUserProfileSchema>;
export type UserProfile = typeof userProfiles.$inferSelect;

export type InsertAnalysisResult = z.infer<typeof insertAnalysisResultSchema>;
export type AnalysisResult = typeof analysisResults.$inferSelect;

export type InsertUpworkKnowledge = z.infer<typeof insertUpworkKnowledgeSchema>;
export type UpworkKnowledge = typeof upworkKnowledge.$inferSelect;

export interface ProjectSuggestion {
  titles: Array<{
    text: string;
    rationale: string;
    confidence: number;
  }>;
  categories: Array<{
    level1: string;
    level2: string;
    level3?: string;
    rationale: string;
    confidence: number;
  }>;
  attributes: Record<string, {
    recommended: string[];
    rationale: string;
  }>;
  searchTags: Array<{
    tag: string;
    rationale: string;
  }>;
  marketInsights: string;
}

export interface PricingTier {
  name: string;
  title: string;
  titleRationale: string;
  description: string;
  descriptionRationale: string;
  deliveryDays: number;
  deliveryRationale: string;
  price: number;
  priceRationale: string;
  features: string[];
  featuresRationale: string;
}

export interface ServiceOption {
  name: string;
  starterIncluded: boolean;
  standardIncluded: boolean;
  advancedIncluded: boolean;
  rationale: string;
}

export interface AddOn {
  name: string;
  price: number;
  rationale: string;
}

export interface PricingSuggestion {
  tiers: {
    starter: PricingTier;
    standard: PricingTier;
    advanced: PricingTier;
  };
  serviceOptions: ServiceOption[];
  addOns: AddOn[];
  pricingStrategy: string;
  marketContext: string;
}

export interface ThumbnailPrompt {
  prompt: string;
  styleNotes: string;
  colorPalette: string[];
  compositionTips: string;
}

export interface VideoScript {
  hook: string;
  introduction: string;
  mainPoints: Array<{
    point: string;
    duration: string;
    visualSuggestion: string;
  }>;
  callToAction: string;
  totalDuration: string;
  fullScript: string;
}

export interface SampleDocument {
  title: string;
  description: string;
  contentOutline: string[];
  purpose: string;
}

export interface GallerySuggestion {
  thumbnailPrompt: ThumbnailPrompt;
  videoScript: VideoScript;
  sampleDocuments: SampleDocument[];
  galleryStrategy: string;
}
