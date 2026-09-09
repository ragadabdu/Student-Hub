import { useState, useEffect, useCallback } from 'react';
import { type UserSettings, settingsService } from '../services/settings';

export function useSettings() {
  const [settings, setSettings] = useState<UserSettings | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saveSuccess, setSaveSuccess] = useState(false);

  const loadSettings = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await settingsService.getSettings();
      setSettings(data);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load settings';
      setError(errorMessage);
      console.error('Failed to load settings:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadSettings();
  }, [loadSettings]);

  const updateSettings = useCallback(async (updates: Partial<UserSettings>) => {
    if (!settings) return;
    
    setIsSaving(true);
    setError(null);
    setSaveSuccess(false);
    
    try {
      const updated = await settingsService.updateSettings(updates);
      setSettings(updated);
      setSaveSuccess(true);
      
      // Clear success message after 3 seconds
      setTimeout(() => {
        setSaveSuccess(false);
      }, 3000);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to save settings';
      setError(errorMessage);
      console.error('Failed to save settings:', err);
    } finally {
      setIsSaving(false);
    }
  }, [settings]);

  const resetSettings = useCallback(async () => {
    setIsSaving(true);
    setError(null);
    try {
      const reset = await settingsService.resetSettings();
      setSettings(reset);
      setSaveSuccess(true);
      
      setTimeout(() => {
        setSaveSuccess(false);
      }, 3000);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to reset settings';
      setError(errorMessage);
      console.error('Failed to reset settings:', err);
    } finally {
      setIsSaving(false);
    }
  }, []);

  return {
    settings,
    isLoading,
    isSaving,
    error,
    saveSuccess,
    loadSettings,
    updateSettings,
    resetSettings,
  };
}