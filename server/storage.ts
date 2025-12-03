import { drizzle } from "drizzle-orm/neon-serverless";
import { Pool } from "@neondatabase/serverless";
import {
  type UserProfile,
  type InsertUserProfile,
  type AnalysisResult,
  type InsertAnalysisResult,
  type UpworkKnowledge,
  type InsertUpworkKnowledge,
  userProfiles,
  analysisResults,
  upworkKnowledge,
} from "@shared/schema";
import { eq } from "drizzle-orm";

export interface IStorage {
  createUserProfile(profile: InsertUserProfile): Promise<UserProfile>;
  getUserProfile(id: string): Promise<UserProfile | undefined>;
  
  createAnalysisResult(result: InsertAnalysisResult): Promise<AnalysisResult>;
  getAnalysisResultByProfileId(profileId: string): Promise<AnalysisResult | undefined>;
  
  createUpworkKnowledge(knowledge: InsertUpworkKnowledge): Promise<UpworkKnowledge>;
  getUpworkKnowledgeByType(type: string): Promise<UpworkKnowledge | undefined>;
}

class DatabaseStorage implements IStorage {
  private db;

  constructor() {
    const pool = new Pool({ connectionString: process.env.DATABASE_URL });
    this.db = drizzle(pool);
  }

  async createUserProfile(profile: InsertUserProfile): Promise<UserProfile> {
    const [result] = await this.db.insert(userProfiles).values(profile).returning();
    return result;
  }

  async getUserProfile(id: string): Promise<UserProfile | undefined> {
    const [result] = await this.db.select().from(userProfiles).where(eq(userProfiles.id, id));
    return result;
  }

  async createAnalysisResult(result: InsertAnalysisResult): Promise<AnalysisResult> {
    const [created] = await this.db.insert(analysisResults).values({
      ...result,
      skills: result.skills as any,
      projects: result.projects as any,
      recommendedKeywords: result.recommendedKeywords as any,
    }).returning();
    return created;
  }

  async getAnalysisResultByProfileId(profileId: string): Promise<AnalysisResult | undefined> {
    const [result] = await this.db.select().from(analysisResults).where(eq(analysisResults.profileId, profileId));
    return result;
  }

  async createUpworkKnowledge(knowledge: InsertUpworkKnowledge): Promise<UpworkKnowledge> {
    const [result] = await this.db.insert(upworkKnowledge).values(knowledge).returning();
    return result;
  }

  async getUpworkKnowledgeByType(type: string): Promise<UpworkKnowledge | undefined> {
    const [result] = await this.db.select().from(upworkKnowledge).where(eq(upworkKnowledge.knowledgeType, type));
    return result;
  }
}

export const storage = new DatabaseStorage();
