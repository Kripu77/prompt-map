import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { getOrCreateUserSettings, updateUserSettings } from '@/lib/db/user-settings';
import { UserSettingsUpdate } from '@/lib/types/settings';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const settings = await getOrCreateUserSettings(session.user.id);
    
    if (!settings) {
      return NextResponse.json({ error: 'Failed to load settings' }, { status: 500 });
    }

    return NextResponse.json(settings);
  } catch (error) {
    console.error('Error in GET /api/user/settings:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const updates: UserSettingsUpdate = {};

    // Validate and sanitize updates
    if (typeof body.showReasoning === 'boolean') {
      updates.showReasoning = body.showReasoning;
    }

    if (body.mindmapMode === 'lite' || body.mindmapMode === 'comprehensive') {
      updates.mindmapMode = body.mindmapMode;
    }

    if (Object.keys(updates).length === 0) {
      return NextResponse.json({ error: 'No valid updates provided' }, { status: 400 });
    }

    const updatedSettings = await updateUserSettings(session.user.id, updates);
    
    if (!updatedSettings) {
      return NextResponse.json({ error: 'Failed to update settings' }, { status: 500 });
    }

    return NextResponse.json(updatedSettings);
  } catch (error) {
    console.error('Error in PATCH /api/user/settings:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}