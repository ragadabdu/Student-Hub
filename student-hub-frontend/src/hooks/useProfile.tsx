import { useCallback, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import type { UpdateProfilePayload } from '../services/profiles';
import type { Profile } from '../types/user';

type ProfileMode = 'view' | 'edit';

// Thin wrapper around AuthContext's profile state.
// Adds UI-only state (edit mode, saving indicator, success flag).
export function useProfile() {
  const {
    profile,
    isLoading,
    updateProfile,
    replaceInterests,
    replaceSkills,
  } = useAuth();

  const [mode, setMode] = useState<ProfileMode>('view');
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saveSuccess, setSaveSuccess] = useState(false);

  const startEditing = useCallback(() => {
    setMode('edit');
    setSaveSuccess(false);
    setError(null);
  }, []);

  const cancelEditing = useCallback(() => {
    setMode('view');
    setError(null);
  }, []);

  const saveProfile = useCallback(
    async (
      payload: UpdateProfilePayload,
      interestNames: string[],
      skillNames: string[],
    ): Promise<Profile | null> => {
      setIsSaving(true);
      setError(null);
      setSaveSuccess(false);

      try {
        // Order matters slightly: we update the profile first (which may
        // include a name change), then sync interests and skills.
        // If any call fails, the earlier ones remain applied — the backend
        // doesn't span these in a transaction because they're separate
        // endpoints. This is a known limitation of the HTTP-per-resource
        // design. If we needed strict atomicity, we'd add a composite
        // endpoint. For MVP, this is acceptable.
        await updateProfile(payload);
        await replaceInterests(interestNames);
        await replaceSkills(skillNames);

        setMode('view');
        setSaveSuccess(true);
        setTimeout(() => setSaveSuccess(false), 3000);
        return profile;
      } catch (err) {
        const message =
          err instanceof Error ? err.message : 'Failed to save profile';
        setError(message);
        return null;
      } finally {
        setIsSaving(false);
      }
    },
    [updateProfile, replaceInterests, replaceSkills, profile],
  );

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
  };
}
