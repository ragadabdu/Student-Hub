import { Button } from '../../ui/Button/Button';
import { 
  RotateCcw, 
  X, 
  Heart, 
  Sparkles
} from 'lucide-react';

interface SwipeActionsProps {
  onUndo: () => void;
  onPass: () => void;
  onLike: () => void;
  onSuperLike: () => void;
  canUndo: boolean;
  hasMore: boolean;
  className?: string;
}

export function SwipeActions({
  onUndo,
  onPass,
  onLike,
  onSuperLike,
  canUndo,
  hasMore,
  className = '',
}: SwipeActionsProps) {
  return (
    <div className={`flex items-center justify-center gap-3 ${className}`}>
      {/* Undo */}
      <Button
        variant="ghost"
        size="lg"
        onClick={onUndo}
        disabled={!canUndo}
        aria-label="Undo last action"
        className="w-14 h-14 rounded-full bg-white shadow-md hover:shadow-lg disabled:opacity-30 disabled:hover:shadow-md border border-border"
      >
        <RotateCcw className="w-5 h-5" />
      </Button>

      {/* Pass */}
      <Button
        variant="outline"
        size="lg"
        onClick={onPass}
        disabled={!hasMore}
        aria-label="Pass"
        className="w-16 h-16 rounded-full border-2 border-red-300 text-red-500 hover:bg-red-50 hover:border-red-500 hover:text-red-600 bg-white shadow-md"
      >
        <X className="w-6 h-6" />
      </Button>

      {/* Connect (Like) */}
      <Button
        variant="primary"
        size="lg"
        onClick={onLike}
        disabled={!hasMore}
        aria-label="Connect"
        className="w-16 h-16 rounded-full bg-gradient-to-br from-primary to-secondary hover:shadow-lg hover:scale-105 transition-transform"
      >
        <Heart className="w-6 h-6" fill="currentColor" />
      </Button>

      {/* Super Connect */}
      <Button
        variant="secondary"
        size="lg"
        onClick={onSuperLike}
        disabled={!hasMore}
        aria-label="Super Connect"
        className="w-14 h-14 rounded-full bg-gradient-to-br from-yellow-400 to-orange-400 text-white hover:shadow-lg hover:scale-105 transition-transform"
      >
        <Sparkles className="w-5 h-5" />
      </Button>
    </div>
  );
}