import type { Match } from '../../../types/match';
import { useNavigate } from 'react-router-dom';
import { Avatar } from '../../ui/Avatar/Avatar';
import { Badge } from '../../ui/Badge/Badge';
import { MessageCircle, Calendar, X } from 'lucide-react';

interface MatchCardProps {
  match: Match;
  onUnmatch?: (matchId: string) => void;
  isUnmatching?: boolean;
  className?: string;
}

export function MatchCard({
  match,
  onUnmatch,
  isUnmatching = false,
  className = '',
}: MatchCardProps) {
  const navigate = useNavigate();
  const displayName = match.matchedUser.name ?? 'Unnamed Student';

  const formattedDate = new Date(match.matchedAt).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });

  const timeAgo = (date: Date): string => {
    const diff = Date.now() - date.getTime();
    const mins = Math.floor(diff / 60000);
    const hours = Math.floor(mins / 60);
    const days = Math.floor(hours / 24);
    if (days > 0) return `${days}d ago`;
    if (hours > 0) return `${hours}h ago`;
    return `${mins}m ago`;
  };

  const handleUnmatch = (e: React.MouseEvent) => {
    e.stopPropagation();
    onUnmatch?.(match.id);
  };

  const handleOpenConversation = () => {
    // FI.6 will wire this to a specific conversation route.
    navigate('/messages');
  };

  return (
    <div
      onClick={handleOpenConversation}
      className={`bg-white rounded-2xl shadow-sm border-2 border-border hover:border-primary/30 hover:shadow-md p-4 cursor-pointer transition-all duration-200 ${className}`}
    >
      <div className="flex items-start gap-4">
        <Avatar
          src={match.matchedUser.avatarUrl ?? undefined}
          alt={displayName}
          size="md"
        />

        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0">
              <h4 className="font-semibold text-text truncate">
                {displayName}
              </h4>
              <p className="text-xs text-text-secondary flex items-center gap-1 mt-0.5">
                <Calendar className="w-3 h-3" />
                Matched {formattedDate}
              </p>
            </div>
            <button
              onClick={handleUnmatch}
              disabled={isUnmatching}
              className="text-text-secondary hover:text-red-500 transition-colors p-1 rounded-full hover:bg-red-50 disabled:opacity-50 disabled:cursor-not-allowed"
              aria-label="Unmatch"
              title="Unmatch"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {match.sharedInterests.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mt-3">
              <span className="text-xs text-text-secondary font-medium">
                You both like:
              </span>
              {match.sharedInterests.slice(0, 3).map((interest) => (
                <Badge key={interest.id} variant="primary">
                  {interest.name}
                </Badge>
              ))}
              {match.sharedInterests.length > 3 && (
                <span className="text-xs text-text-secondary">
                  +{match.sharedInterests.length - 3} more
                </span>
              )}
            </div>
          )}

          {match.lastMessage ? (
            <div className="mt-3 flex items-center gap-2 text-sm">
              <MessageCircle className="w-3.5 h-3.5 text-text-secondary flex-shrink-0" />
              <p className="text-text-secondary truncate italic">
                {match.lastMessage.content}
              </p>
              <span className="text-xs text-text-secondary ml-auto flex-shrink-0">
                {timeAgo(new Date(match.lastMessage.sentAt))}
              </span>
            </div>
          ) : (
            <div className="mt-3 flex items-center gap-2 text-sm">
              <MessageCircle className="w-3.5 h-3.5 text-primary/60 flex-shrink-0" />
              <p className="text-primary/60 text-xs">
                Say hello to start the conversation
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
