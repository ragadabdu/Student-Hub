import { useMatches } from '../../hooks/useMatches';
import { MatchCard } from '../../components/matches/MatchCard/MatchCard';
import { LoadingState } from '../../components/ui/LoadingState/LoadingState';
import { EmptyState } from '../../components/ui/EmptyState/EmptyState';
import { Button } from '../../components/ui/Button/Button';
import { AlertCircle, ChevronLeft, ChevronRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function Matches() {
  const navigate = useNavigate();
  const {
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
    hasMatches,
  } = useMatches();

  if (isLoading && matches.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <LoadingState message="Loading your matches..." />
      </div>
    );
  }

  if (error && matches.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-[60vh] p-4">
        <div className="text-center max-w-md">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-text mb-2">
            Failed to load matches
          </h3>
          <p className="text-text-secondary mb-4">{error}</p>
          <Button onClick={loadMatches}>Try Again</Button>
        </div>
      </div>
    );
  }

  if (!hasMatches) {
    return (
      <div className="flex items-center justify-center min-h-[60vh] p-4">
        <EmptyState
          icon="💫"
          title="No matches yet"
          description="Start exploring and connecting with people who share your interests!"
          action={
            <Button variant="primary" onClick={() => navigate('/')}>
              Find People
            </Button>
          }
        />
      </div>
    );
  }

  return (
    <div className="p-4 md:p-6 max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl md:text-4xl font-bold text-navy">
          Your Matches
        </h1>
        <p className="text-text-secondary mt-1">
          {totalCount} {totalCount === 1 ? 'match' : 'matches'} — say hello and start collaborating
        </p>
      </div>

      {error && matches.length > 0 && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-3 text-sm text-red-700">
          {error}
        </div>
      )}

      <div className="grid gap-4">
        {matches.map((match) => (
          <MatchCard
            key={match.id}
            match={match}
            onUnmatch={unmatch}
            isUnmatching={unmatchingId === match.id}
          />
        ))}
      </div>

      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-3 pt-4">
          <Button
            variant="outline"
            size="sm"
            onClick={() => goToPage(page - 1)}
            disabled={page <= 1}
          >
            <ChevronLeft className="w-4 h-4 mr-1" />
            Previous
          </Button>
          <span className="text-sm text-text-secondary">
            Page {page} of {totalPages}
          </span>
          <Button
            variant="outline"
            size="sm"
            onClick={() => goToPage(page + 1)}
            disabled={page >= totalPages}
          >
            Next
            <ChevronRight className="w-4 h-4 ml-1" />
          </Button>
        </div>
      )}
    </div>
  );
}
