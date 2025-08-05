import { useState, useEffect, useCallback } from 'react';
import { useSession } from 'next-auth/react';
import { UserSettings, UserSettingsUpdate, MindmapMode } from '@/lib/types/settings';

export function useUserSettings() {
  const { data: session } = useSession();
  const [settings, setSettings] = useState<UserSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadSettings = useCallback(async () => {
    if (!session?.user?.id) return;

    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch('/api/user/settings');
      if (!response.ok) {
        throw new Error('Failed to load settings');
      }
      
      const data = await response.json();
      setSettings(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load settings');
      console.error('Error loading user settings:', err);
    } finally {
      setLoading(false);
    }
  }, [session?.user?.id]);

  // Load settings on mount and when user changes
  useEffect(() => {
    if (session?.user?.id) {
      loadSettings();
    } else {
      setSettings(null);
      setLoading(false);
    }
  }, [session?.user?.id]); // Removed loadSettings from dependencies

  const updateSettings = async (updates: UserSettingsUpdate) => {
    if (!session?.user?.id || !settings) return;

    try {
      setError(null);
      
      const response = await fetch('/api/user/settings', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updates),
      });

      if (!response.ok) {
        throw new Error('Failed to update settings');
      }

      const updatedSettings = await response.json();
      setSettings(updatedSettings);
      return updatedSettings;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update settings');
      console.error('Error updating user settings:', err);
      throw err;
    }
  };

  const toggleReasoning = async () => {
    if (!settings) return;
    return updateSettings({ showReasoning: !settings.showReasoning });
  };

  const setMindmapMode = async (mode: MindmapMode) => {
    return updateSettings({ mindmapMode: mode });
  };

  return {
    settings,
    loading,
    error,
    updateSettings,
    toggleReasoning,
    setMindmapMode,
    reload: loadSettings,
  };
}