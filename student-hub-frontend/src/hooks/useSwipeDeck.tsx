import { useState, useCallback, useEffect } from 'react';
import type { Profile } from '../types/user';
import { profilesService } from '../services/profiles';

type SwipeDirection = 'left' | 'right' | 'super';

type SwipeAction = {
  type: 'pass' | 'like' | 'super_like';
  profileId: string;
};

export function useSwipeDeck() {
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showMatch, setShowMatch] = useState(false);
  const [matchedProfile, setMatchedProfile] = useState<Profile | null>(null);
  const [actionHistory, setActionHistory] = useState<SwipeAction[]>([]);

  // Load profiles
  const loadProfiles = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await profilesService.getDiscoveryProfiles();
      setProfiles(data);
      setCurrentIndex(0);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load profiles. Please try again.';
      setError(errorMessage);
      console.error('Failed to load profiles:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadProfiles();
  }, [loadProfiles]);

  // Get current profile
  const currentProfile = profiles[currentIndex] || null;

  // Check if there are more profiles
  const hasMoreProfiles = currentIndex < profiles.length - 1;

  // Handle swipe action
  const handleSwipe = useCallback(async (direction: SwipeDirection) => {
    if (!currentProfile) return;

    const action: SwipeAction = {
      type: direction === 'left' ? 'pass' : direction === 'right' ? 'like' : 'super_like',
      profileId: currentProfile.id,
    };

    // Add to history (for undo)
    setActionHistory(prev => [...prev, action]);

    // Perform the action
    try {
      let result;
      switch (direction) {
        case 'left':
          result = await profilesService.passProfile(currentProfile.id);
          break;
        case 'right':
          result = await profilesService.likeProfile(currentProfile.id);
          if (result.matched) {
            setMatchedProfile(currentProfile);
            setShowMatch(true);
          }
          break;
        case 'super':
          result = await profilesService.superLikeProfile(currentProfile.id);
          if (result.matched) {
            setMatchedProfile(currentProfile);
            setShowMatch(true);
          }
          break;
      }
    } catch (err) {
      // Log the error
      console.error('Swipe action failed:', err);
      
      // Remove from history since it failed
      setActionHistory(prev => prev.slice(0, -1));
      
      // Set error state
      const errorMessage = err instanceof Error ? err.message : 'Action failed';
      setError(errorMessage);
      
      // Don't advance to next profile
      return;
    }

    // Move to next profile on success
    setCurrentIndex(prev => prev + 1);
  }, [currentProfile]);

  // Undo last action
  const undoLastAction = useCallback(async () => {
    if (actionHistory.length === 0 || currentIndex === 0) return;

    const lastAction = actionHistory[actionHistory.length - 1];
    
    // Remove the action from history
    setActionHistory(prev => prev.slice(0, -1));
    
    // Go back to previous profile
    setCurrentIndex(prev => prev - 1);

    // TODO: In the future, we might want to call an API to undo the like/pass
    // DELETE /api/v1/likes/:id or similar
  }, [actionHistory, currentIndex]);

  // Reset deck
  const resetDeck = useCallback(() => {
    loadProfiles();
    setShowMatch(false);
    setMatchedProfile(null);
    setActionHistory([]);
    setError(null);
  }, [loadProfiles]);

  // Dismiss match overlay
  const dismissMatch = useCallback(() => {
    setShowMatch(false);
    setMatchedProfile(null);
  }, []);

  return {
    currentProfile,
    hasMoreProfiles,
    isLoading,
    error,
    showMatch,
    matchedProfile,
    handleSwipe,
    undoLastAction,
    resetDeck,
    dismissMatch,
    canUndo: actionHistory.length > 0 && currentIndex > 0,
    totalProfiles: profiles.length,
    remainingProfiles: profiles.length - currentIndex - 1,
  };
}