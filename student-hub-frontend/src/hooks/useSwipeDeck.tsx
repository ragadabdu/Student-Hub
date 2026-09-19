import { useCallback, useEffect, useRef, useState } from 'react';
import { discoveryService } from '../services/discovery';
import type { Profile } from '../types/user';

const PAGE_SIZE = 20;
const REFETCH_THRESHOLD = 5; // fetch next page when queue drops below this

type SwipeDirection = 'left' | 'right' | 'super';

export type LastAction = {
  profile: Profile;
  direction: SwipeDirection;
};

export function useSwipeDeck() {
  const [queue, setQueue] = useState<Profile[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showMatch, setShowMatch] = useState(false);
  const [matchedProfile, setMatchedProfile] = useState<Profile | null>(null);
  const [lastAction, setLastAction] = useState<LastAction | null>(null);
  const [hasMore, setHasMore] = useState(true);

  // Track page and deduplicate by id — server-side dedup means new pages
  // shouldn't duplicate, but belt-and-suspenders.
  const pageRef = useRef(1);
  const seenIdsRef = useRef<Set<string>>(new Set());
  const fetchingRef = useRef(false);

  const currentProfile = queue[0] ?? null;
  const remainingProfiles = queue.length;

  // ------------------------------------------------------------------
  // Fetch a page of profiles
  // ------------------------------------------------------------------
  const fetchPage = useCallback(
    async (page: number): Promise<Profile[]> => {
      const { profiles } = await discoveryService.getProfiles({
        page,
        perPage: PAGE_SIZE,
      });

      // Dedupe: filter out anything we've already seen this session.
      const fresh = profiles.filter((p) => !seenIdsRef.current.has(p.id));
      fresh.forEach((p) => seenIdsRef.current.add(p.id));

      return fresh;
    },
    [],
  );

  // ------------------------------------------------------------------
  // Initial load + refresh
  // ------------------------------------------------------------------
  const loadInitial = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    setHasMore(true);
    pageRef.current = 1;
    seenIdsRef.current.clear();

    try {
      const profiles = await fetchPage(1);
      setQueue(profiles);
      if (profiles.length === 0) setHasMore(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load profiles');
      setQueue([]);
    } finally {
      setIsLoading(false);
    }
  }, [fetchPage]);

  useEffect(() => {
    loadInitial();
  }, [loadInitial]);

  // ------------------------------------------------------------------
  // Background refetch when queue is running low
  // ------------------------------------------------------------------
  useEffect(() => {
    if (isLoading || !hasMore || fetchingRef.current) return;
    if (queue.length > REFETCH_THRESHOLD) return;

    fetchingRef.current = true;
    const nextPage = pageRef.current + 1;

    fetchPage(nextPage)
      .then((fresh) => {
        if (fresh.length === 0) {
          setHasMore(false);
        } else {
          pageRef.current = nextPage;
          setQueue((prev) => [...prev, ...fresh]);
        }
      })
      .catch((err) => {
        // Non-fatal — the user still has profiles to swipe on.
        console.error('Background fetch failed:', err);
      })
      .finally(() => {
        fetchingRef.current = false;
      });
  }, [queue.length, isLoading, hasMore, fetchPage]);

  // ------------------------------------------------------------------
  // Actions
  // ------------------------------------------------------------------

  // Optimistically pop the top of the queue, call the API, restore on error.
  const performAction = useCallback(
    async (direction: SwipeDirection) => {
      const profile = queue[0];
      if (!profile) return;

      // Pop it optimistically
      setQueue((prev) => prev.slice(1));
      setLastAction({ profile, direction });

      try {
        const response =
          direction === 'left'
            ? await discoveryService.pass(profile.userId)
            : direction === 'right'
            ? await discoveryService.connect(profile.userId)
            : await discoveryService.superConnect(profile.userId);

        if (response.matchCreated) {
          setMatchedProfile(profile);
          setShowMatch(true);
        }
      } catch (err) {
        // Restore the profile at the top of the queue and surface the error.
        setQueue((prev) => [profile, ...prev]);
        setLastAction(null);
        const message =
          err instanceof Error ? err.message : 'Something went wrong';
        setError(message);
        // Auto-clear the error after a few seconds
        setTimeout(() => setError(null), 3000);
      }
    },
    [queue],
  );

  const handleSwipe = useCallback(
    (direction: SwipeDirection) => performAction(direction),
    [performAction],
  );

  const undoLastAction = useCallback(() => {
    if (!lastAction) return;
    // Put the profile back at the top of the queue.
    setQueue((prev) => [lastAction.profile, ...prev]);
    setLastAction(null);
    // Note: this doesn't undo the server-side action. The connection
    // record remains. On next refresh, the profile won't reappear.
  }, [lastAction]);

  const dismissMatch = useCallback(() => {
    setShowMatch(false);
    setMatchedProfile(null);
  }, []);

  const resetDeck = useCallback(() => {
    loadInitial();
  }, [loadInitial]);

  // ------------------------------------------------------------------
  // Derived state
  // ------------------------------------------------------------------
  const canUndo = lastAction !== null;

  return {
    currentProfile,
    hasMoreProfiles: hasMore,
    isLoading,
    error,
    showMatch,
    matchedProfile,
    handleSwipe,
    undoLastAction,
    resetDeck,
    dismissMatch,
    canUndo,
    remainingProfiles,
  };
}
