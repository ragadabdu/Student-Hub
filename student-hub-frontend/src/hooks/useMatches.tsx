import { useCallback, useEffect, useState } from 'react';
import { matchesService } from '../services/matches';
import type { Match } from '../types/match';

const PAGE_SIZE = 20;

export function useMatches() {
  const [matches, setMatches] = useState<Match[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [unmatchingId, setUnmatchingId] = useState<string | null>(null);

  const loadMatches = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const { matches: list, meta } = await matchesService.list({
        page,
        perPage: PAGE_SIZE,
      });
      setMatches(list);
      setTotalPages(meta.totalPages);
      setTotalCount(meta.totalCount);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to load matches';
      setError(message);
      setMatches([]);
    } finally {
      setIsLoading(false);
    }
  }, [page]);

  useEffect(() => {
    loadMatches();
  }, [loadMatches]);

  const unmatch = useCallback(async (matchId: string) => {
    if (!window.confirm('Unmatch this person? This action cannot be undone.')) {
      return false;
    }

    setUnmatchingId(matchId);
    try {
      await matchesService.unmatch(matchId);
      setMatches((prev) => prev.filter((m) => m.id !== matchId));
      setTotalCount((prev) => Math.max(0, prev - 1));
      return true;
    } catch (err) {
      console.error('Unmatch failed:', err);
      setError(err instanceof Error ? err.message : 'Failed to unmatch');
      return false;
    } finally {
      setUnmatchingId(null);
    }
  }, []);

  const goToPage = useCallback(
    (nextPage: number) => {
      if (nextPage < 1 || nextPage > totalPages) return;
      setPage(nextPage);
    },
    [totalPages],
  );

  return {
    matches,
    isLoading,
    error,
    page,
    totalPages,
    totalCount,
    unmatchingId,
    loadMatches,
    unmatch,
    goToPage,
    hasMatches: matches.length > 0,
  };
}
