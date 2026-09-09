import { useState, useEffect, useCallback } from 'react';
import type { Profile } from '../types/user';
import { profilesService } from '../services/profiles';

type ProfileMode = 'view' | 'edit';

export function useProfile(profileId?: string) {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [mode, setMode] = useState<ProfileMode>('view');
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Load profile
  const loadProfile = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      let data;
      if (profileId) {
        data = await profilesService.getProfile(profileId);
      } else {
        // Load current user's profile
        data = await profilesService.getCurrentUserProfile();
      }
      
      if (!data) {
        throw new Error('Profile not found');
      }
      
      setProfile(data);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load profile';
      setError(errorMessage);
      console.error('Failed to load profile:', err);
    } finally {
      setIsLoading(false);
    }
  }, [profileId]);

  useEffect(() => {
    loadProfile();
  }, [loadProfile]);

  // Edit profile
  const startEditing = useCallback(() => {
    setMode('edit');
    setSaveSuccess(false);
  }, []);

  const cancelEditing = useCallback(() => {
    setMode('view');
    // Reload to reset changes
    loadProfile();
  }, [loadProfile]);

  // Save profile
  const saveProfile = useCallback(async (updates: Partial<Profile>) => {
    if (!profile) return;
    
    setIsSaving(true);
    setError(null);
    
    try {
      const updated = await profilesService.updateProfile(profile.id, updates);
      setProfile(updated);
      setMode('view');
      setSaveSuccess(true);
      
      // Clear success message after 3 seconds
      setTimeout(() => {
        setSaveSuccess(false);
      }, 3000);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to save profile';
      setError(errorMessage);
      console.error('Failed to save profile:', err);
    } finally {
      setIsSaving(false);
    }
  }, [profile]);

  return {
    profile,
    isLoading,
    error,
    mode,
    isSaving,
    saveSuccess,
    startEditing,
    cancelEditing,
    saveProfile,
    loadProfile,
  };
}