import { useMatches } from '../../hooks/useMatches';
import { MatchCard } from '../../components/matches/MatchCard/MatchCard';
import { MatchMessages } from '../../components/matches/MatchMessages/MatchMessages';
import { LoadingState } from '../../components/ui/LoadingState/LoadingState';
import { EmptyState } from '../../components/ui/EmptyState/EmptyState';
import { Button } from '../../components/ui/Button/Button';
import { AlertCircle, Heart } from 'lucide-react';

export default function Matches() {
  const {
    matches,
    isLoading,
    error,
    selectedMatchId,
    isSendingMessage,
    loadMatches,
    selectMatch,
    clearSelectedMatch,
    getSelectedMatch,
    sendMessage,
    unmatch,
    hasMatches,
  } = useMatches();

  const selectedMatch = getSelectedMatch();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <LoadingState message="Loading your matches..." />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[60vh] p-4">
        <div className="text-center max-w-md">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-text mb-2">Failed to load matches</h3>
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
          icon="💔"
          title="No matches yet"
          description="Start exploring and connecting with people who share your interests!"
          action={
            <Button variant="primary" onClick={() => window.location.href = '/'}>
              Find People
            </Button>
          }
        />
      </div>
    );
  }

  return (
    <div className="p-4 md:p-6 max-w-7xl mx-auto h-[calc(100vh-8rem)]">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-3xl md:text-4xl font-bold text-navy">Your Matches</h1>
        <p className="text-text-secondary mt-1">
          {matches.length} match{matches.length !== 1 ? 'es' : ''} — connect and collaborate
        </p>
      </div>

      {/* Desktop: Two-column layout */}
      <div className="flex gap-6 h-[calc(100%-5rem)]">
        {/* Match List */}
        <div className={`
          w-full lg:w-96 flex-shrink-0 overflow-y-auto space-y-3 pr-2
          ${selectedMatch ? 'hidden lg:block' : 'block'}
        `}>
          {matches.map((match) => (
            <MatchCard
              key={match.id}
              match={match}
              isSelected={match.id === selectedMatchId}
              onSelect={selectMatch}
              onUnmatch={unmatch}
            />
          ))}
        </div>

        {/* Messages View */}
        <div className={`
          flex-1 min-w-0
          ${selectedMatch ? 'block' : 'hidden lg:block'}
        `}>
          {selectedMatch ? (
            <MatchMessages
              match={selectedMatch}
              onSendMessage={sendMessage}
              onBack={clearSelectedMatch}
              className="h-full"
            />
          ) : (
            <div className="flex items-center justify-center h-full bg-white rounded-2xl shadow-sm border border-border">
              <div className="text-center p-8">
                <Heart className="w-16 h-16 text-primary/20 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-text">Select a match</h3>
                <p className="text-text-secondary mt-2">
                  Choose a match from the list to start chatting
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}