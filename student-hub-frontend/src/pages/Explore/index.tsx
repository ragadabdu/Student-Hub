import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ProfileCard } from '../../components/profile/ProfileCard/ProfileCard';
import { SwipeCard } from '../../components/discovery/SwipeCard/SwipeCard';
import { SwipeActions } from '../../components/discovery/SwipeActions/SwipeActions';
import { MatchOverlay } from '../../components/discovery/MatchOverlay/MatchOverlay';
import { Button } from '../../components/ui/Button/Button';
import { EmptyState } from '../../components/ui/EmptyState/EmptyState';
import { LoadingState } from '../../components/ui/LoadingState/LoadingState';
import { useSwipeDeck } from '../../hooks/useSwipeDeck';

type ExploreMode = 'people' | 'projects';

export default function Explore() {
  const [mode, setMode] = useState<ExploreMode>('people');
  const navigate = useNavigate();

  const {
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
    canUndo,
    remainingProfiles,
  } = useSwipeDeck();

  const handleSwipeLeft = () => handleSwipe('left');
  const handleSwipeRight = () => handleSwipe('right');
  const handleSuperLike = () => handleSwipe('super');

  const handleMessage = () => {
    dismissMatch();
    navigate('/messages');
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <LoadingState message="Finding your people..." />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <p className="text-red-500 mb-4">{error}</p>
          <Button onClick={resetDeck}>Try Again</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl md:text-4xl font-bold text-navy">Explore</h1>
          <p className="text-text-secondary mt-1">Find your people ✨</p>
        </div>
        <div className="text-sm text-text-secondary">
          {remainingProfiles > 0 ? `${remainingProfiles} remaining` : 'No more profiles'}
        </div>
      </div>

      {/* Mode Toggle */}
      <div className="flex gap-2 bg-gray-100 p-1 rounded-xl w-fit mb-6">
        <button
          onClick={() => setMode('people')}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
            mode === 'people'
              ? 'bg-white text-primary shadow-sm'
              : 'text-text-secondary hover:text-text'
          }`}
        >
          People
        </button>
        <button
          onClick={() => setMode('projects')}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
            mode === 'projects'
              ? 'bg-white text-primary shadow-sm'
              : 'text-text-secondary hover:text-text'
          }`}
        >
          Projects
        </button>
      </div>

      {/* Content */}
      {mode === 'people' ? (
        /* People Discovery */
        <div className="flex flex-col items-center">
          {currentProfile ? (
            <>
              <div className="relative w-full max-w-md mx-auto">
                {/* Background cards for depth */}
                <div className="absolute top-1 left-1 w-full h-full bg-gray-200/50 rounded-2xl -z-10 translate-x-1 translate-y-1" />
                <div className="absolute top-0.5 left-0.5 w-full h-full bg-gray-100/70 rounded-2xl -z-5 translate-x-0.5 translate-y-0.5" />
                
                <SwipeCard
                  onSwipeLeft={handleSwipeLeft}
                  onSwipeRight={handleSwipeRight}
                >
                  <ProfileCard profile={currentProfile} />
                </SwipeCard>
              </div>

              <SwipeActions
                onUndo={undoLastAction}
                onPass={handleSwipeLeft}
                onLike={handleSwipeRight}
                onSuperLike={handleSuperLike}
                canUndo={canUndo}
                disabled={!currentProfile}
                className="mt-6"
              />
            </>
          ) : (
            <div className="w-full max-w-md">
              <EmptyState
                icon="✨"
                title="You're all caught up!"
                description="You've seen everyone in your current discovery list."
                action={
                  <div className="flex flex-col gap-2 w-full">
                    <Button onClick={resetDeck}>Refresh</Button>
                    <Button variant="outline" onClick={() => setMode('projects')}>
                      Explore projects
                    </Button>
                  </div>
                }
              />
            </div>
          )}
        </div>
      ) : (
        /* Projects Mode - Placeholder for Step 6 */
        <div className="flex items-center justify-center min-h-[40vh]">
          <EmptyState
            icon="🚀"
            title="Projects Coming Soon"
            description="Find interesting student projects to join or collaborate on."
          />
        </div>
      )}

      {/* Match Overlay */}
      {showMatch && matchedProfile && (
        <MatchOverlay
          matchedProfile={matchedProfile}
          onDismiss={dismissMatch}
          onMessage={handleMessage}
        />
      )}
    </div>
  );
}