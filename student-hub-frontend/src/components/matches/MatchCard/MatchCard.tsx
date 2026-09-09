import type { Match } from '../../../types/match';
import { Avatar } from '../../ui/Avatar/Avatar';
import { Badge } from '../../ui/Badge/Badge';
import { MessageCircle, Calendar, X } from 'lucide-react';

interface MatchCardProps {
  match: Match;
  isSelected?: boolean;
  onSelect?: (matchId: string) => void;
  onUnmatch?: (matchId: string) => void;
  className?: string;
}

export function MatchCard({ 
  match, 
  isSelected = false, 
  onSelect, 
  onUnmatch,
  className = '' 
}: MatchCardProps) {
  const formattedDate = match.matchedAt.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });

  const timeAgo = (date: Date) => {
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(hours / 24);
    
    if (days > 0) return `${days}d ago`;
    if (hours > 0) return `${hours}h ago`;
    const mins = Math.floor(diff / (1000 * 60));
    return `${mins}m ago`;
  };

  const handleClick = () => {
    if (onSelect) {
      onSelect(match.id);
    }
  };

  const handleUnmatch = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onUnmatch) {
      onUnmatch(match.id);
    }
  };

  return (
    <div
      onClick={handleClick}
      className={`
        bg-white rounded-2xl shadow-sm border-2 p-4 cursor-pointer transition-all duration-200
        ${isSelected 
          ? 'border-primary shadow-md' 
          : 'border-border hover:border-primary/30 hover:shadow-md'}
        ${className}
      `}
    >
      <div className="flex items-start gap-4">
        {/* Avatar */}
        <Avatar 
          src={match.matchedUser.avatarUrl} 
          alt={match.matchedUser.name}
          size="md"
        />

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <div>
              <h4 className="font-semibold text-text">
                {match.matchedUser.name}
              </h4>
              <p className="text-sm text-text-secondary">
                {match.matchedUser.major} · {match.matchedUser.university}
              </p>
            </div>
            <button
              onClick={handleUnmatch}
              className="text-text-secondary hover:text-red-500 transition-colors p-1 rounded-full hover:bg-red-50"
              aria-label="Unmatch"
              title="Unmatch"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Shared Interests */}
          {match.sharedInterests.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mt-2">
              <span className="text-xs text-text-secondary font-medium">You both like:</span>
              {match.sharedInterests.map((interest) => (
                <Badge key={interest} variant="primary">
                  {interest}
                </Badge>
              ))}
            </div>
          )}

          {/* Last Message */}
          {match.lastMessage && (
            <div className="mt-2 flex items-center gap-2 text-sm">
              <MessageCircle className="w-3.5 h-3.5 text-text-secondary" />
              <p className="text-text-secondary truncate">
                "{match.lastMessage.preview}"
              </p>
              <span className="text-xs text-text-secondary ml-auto">
                {timeAgo(match.lastMessage.sentAt)}
              </span>
            </div>
          )}

          {/* Match Date */}
          <div className="mt-1 flex items-center gap-1.5 text-xs text-text-secondary">
            <Calendar className="w-3 h-3" />
            Matched on {formattedDate}
          </div>
        </div>
      </div>
    </div>
  );
}