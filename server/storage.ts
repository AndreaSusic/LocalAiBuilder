import {
  users,
  websites,
  drafts,
  type User,
  type UpsertUser,
  type Website,
  type Draft,
} from "../shared/schema";
import { db } from "./db";
import { eq } from "drizzle-orm";

// Interface for storage operations
export interface IStorage {
  // User operations
  // (IMPORTANT) these user operations are mandatory for Replit Auth.
  getUser(id: string): Promise<User | undefined>;
  upsertUser(user: UpsertUser): Promise<User>;
  
  // Website operations
  getWebsiteByUserId(userId: string): Promise<Website | undefined>;
  saveWebsite(userId: string, websiteData: any): Promise<Website>;
  
  // Draft operations
  getDraftByUserId(userId: string): Promise<Draft | undefined>;
  saveDraft(userId: string, draftData: any): Promise<Draft>;
}

export class DatabaseStorage implements IStorage {
  // User operations
  // (IMPORTANT) these user operations are mandatory for Replit Auth.

  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async upsertUser(userData: UpsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(userData)
      .onConflictDoUpdate({
        target: users.id,
        set: {
          ...userData,
          updatedAt: new Date(),
        },
      })
      .returning();
    return user;
  }

  // Website operations
  async getWebsiteByUserId(userId: string): Promise<Website | undefined> {
    const [website] = await db.select().from(websites).where(eq(websites.userId, userId));
    return website;
  }

  async saveWebsite(userId: string, websiteData: any): Promise<Website> {
    const websiteId = `website_${userId}_${Date.now()}`;
    const [website] = await db
      .insert(websites)
      .values({
        id: websiteId,
        userId,
        websiteData,
      })
      .onConflictDoUpdate({
        target: websites.userId,
        set: {
          websiteData,
          updatedAt: new Date(),
        },
      })
      .returning();
    return website;
  }

  // Draft operations
  async getDraftByUserId(userId: string): Promise<Draft | undefined> {
    const [draft] = await db.select().from(drafts).where(eq(drafts.userId, userId));
    return draft;
  }

  async saveDraft(userId: string, draftData: any): Promise<Draft> {
    const draftId = `draft_${userId}_${Date.now()}`;
    const [draft] = await db
      .insert(drafts)
      .values({
        id: draftId,
        userId,
        draftData,
      })
      .onConflictDoUpdate({
        target: drafts.userId,
        set: {
          draftData,
          updatedAt: new Date(),
        },
      })
      .returning();
    return draft;
  }
}

export const storage = new DatabaseStorage();