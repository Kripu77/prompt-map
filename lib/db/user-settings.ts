import { db } from "./index";
import { userSettings } from "./schema";
import { eq } from "drizzle-orm";
import { UserSettings, UserSettingsUpdate, MindmapMode } from "../types/settings";

export async function getUserSettings(userId: string): Promise<UserSettings | null> {
  try {
    const result = await db
      .select()
      .from(userSettings)
      .where(eq(userSettings.userId, userId))
      .limit(1);

    const settings = result[0];
    if (!settings) return null;

    return {
      ...settings,
      mindmapMode: settings.mindmapMode as MindmapMode,
    };
  } catch (error) {
    console.error("Error fetching user settings:", error);
    return null;
  }
}

export async function createUserSettings(userId: string): Promise<UserSettings | null> {
  try {
    const result = await db
      .insert(userSettings)
      .values({
        userId,
        showReasoning: true,
        mindmapMode: "lite",
      })
      .returning();

    const settings = result[0];
    if (!settings) return null;

    return {
      ...settings,
      mindmapMode: settings.mindmapMode as MindmapMode,
    };
  } catch (error) {
    console.error("Error creating user settings:", error);
    return null;
  }
}

export async function updateUserSettings(
  userId: string,
  updates: UserSettingsUpdate
): Promise<UserSettings | null> {
  try {
    const result = await db
      .update(userSettings)
      .set({
        ...updates,
        updatedAt: new Date(),
      })
      .where(eq(userSettings.userId, userId))
      .returning();

    const settings = result[0];
    if (!settings) return null;

    return {
      ...settings,
      mindmapMode: settings.mindmapMode as MindmapMode,
    };
  } catch (error) {
    console.error("Error updating user settings:", error);
    return null;
  }
}

export async function getOrCreateUserSettings(userId: string): Promise<UserSettings | null> {
  let settings = await getUserSettings(userId);
  
  if (!settings) {
    settings = await createUserSettings(userId);
  }
  
  return settings;
}