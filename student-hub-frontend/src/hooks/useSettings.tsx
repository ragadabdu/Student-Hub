import { useCallback, useEffect, useRef, useState } from 'react';
import {
  settingsService,
  type Settings,
  type SettingsUpdate,
} from '../services/settings';

export function useSettings() {
  const [settings, setSettings] = useState<Settings | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [transientError, setTransientError] = useState<string | null>(null);

  // Track in-flight updates so we can display a spinner and ignore
  // stale responses.
  const requestIdRef = useRef(0);

  const load = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await settingsService.get();
      setSettings(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load settings');
      setSettings(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  // Update a section of settings. Optimistic: applies the change locally
  // before the server confirms, and reverts on failure.
  const update = useCallback(
    async (patch: SettingsUpdate): Promise<boolean> => {
      if (!settings) return false;

      const snapshot = settings;
      const optimistic: Settings = {
        notifications: { ...settings.notifications, ...(patch.notifications ?? {}) },
        privacy: { ...settings.privacy, ...(patch.privacy ?? {}) },
        preferences: { ...settings.preferences, ...(patch.preferences ?? {}) },
      };

      setSettings(optimistic);
      setTransientError(null);

      const myId = ++requestIdRef.current;
      try {
        const confirmed = await settingsService.update(patch);
        // Only apply if this is the most recent update.
        if (myId === requestIdRef.current) {
          setSettings(confirmed);
        }
        return true;
      } catch (err) {
        if (myId === requestIdRef.current) {
          // Revert to pre-update state and surface a transient error.
          setSettings(snapshot);
          const message =
            err instanceof Error ? err.message : 'Failed to save settings';
          setTransientError(message);
          setTimeout(() => setTransientError(null), 4000);
        }
        return false;
      }
    },
    [settings],
  );

  return {
    settings,
    isLoading,
    error,
    transientError,
    update,
    reload: load,
  };
}
