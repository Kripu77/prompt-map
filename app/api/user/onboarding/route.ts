import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { userOnboarding } from "@/lib/db/schema";
import { eq } from "drizzle-orm";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    
    const userId = session.user.id;
    
    // Fetch onboarding state for this user
    const userOnboardingState = await db.query.userOnboarding.findFirst({
      where: eq(userOnboarding.userId, userId),
    });
    
    if (!userOnboardingState) {
      // Return default state if no record exists yet
      return NextResponse.json({
        hasCompletedOnboarding: false,
        lastCompletedStep: -1,
        completedSteps: [],
        onboardingVersion: 1,
      });
    }
    
    return NextResponse.json({
      hasCompletedOnboarding: Boolean(userOnboardingState.hasCompletedOnboarding),
      lastCompletedStep: userOnboardingState.lastCompletedStep,
      dismissedAt: userOnboardingState.dismissedAt,
      completedSteps: userOnboardingState.completedSteps || [],
      lastSeenAt: userOnboardingState.lastSeenAt,
      onboardingVersion: userOnboardingState.onboardingVersion,
    });
  } catch (error) {
    console.error("Error fetching onboarding state:", error);
    return NextResponse.json(
      { error: "Failed to fetch onboarding state" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    
    const userId = session.user.id;
    const data = await request.json();
    
    // Validate the request data
    const {
      hasCompletedOnboarding,
      lastCompletedStep,
      dismissedAt,
      completedSteps,
      lastSeenAt,
      onboardingVersion,
    } = data;
    
    // Check if a record already exists
    const existingState = await db.query.userOnboarding.findFirst({
      where: eq(userOnboarding.userId, userId),
    });
    
    let result;
    
    if (existingState) {
      // Update existing record
      result = await db
        .update(userOnboarding)
        .set({
          hasCompletedOnboarding: hasCompletedOnboarding ? 1 : 0,
          lastCompletedStep,
          dismissedAt: dismissedAt ? new Date(dismissedAt) : undefined,
          completedSteps,
          lastSeenAt: lastSeenAt ? new Date(lastSeenAt) : new Date(),
          onboardingVersion: onboardingVersion || 1,
          updatedAt: new Date(),
        })
        .where(eq(userOnboarding.userId, userId))
        .returning();
    } else {
      // Insert new record
      result = await db
        .insert(userOnboarding)
        .values({
          userId,
          hasCompletedOnboarding: hasCompletedOnboarding ? 1 : 0,
          lastCompletedStep,
          dismissedAt: dismissedAt ? new Date(dismissedAt) : undefined,
          completedSteps,
          lastSeenAt: lastSeenAt ? new Date(lastSeenAt) : new Date(),
          onboardingVersion: onboardingVersion || 1,
        })
        .returning();
    }
    
    return NextResponse.json({
      hasCompletedOnboarding: Boolean(result[0].hasCompletedOnboarding),
      lastCompletedStep: result[0].lastCompletedStep,
      dismissedAt: result[0].dismissedAt,
      completedSteps: result[0].completedSteps || [],
      lastSeenAt: result[0].lastSeenAt,
      onboardingVersion: result[0].onboardingVersion,
    });
  } catch (error) {
    console.error("Error updating onboarding state:", error);
    return NextResponse.json(
      { error: "Failed to update onboarding state" },
      { status: 500 }
    );
  }
} 