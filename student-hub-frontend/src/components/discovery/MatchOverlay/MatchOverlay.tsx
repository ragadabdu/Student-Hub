import type { Profile } from '../../../types/user';
import { Button } from '../../ui/Button/Button';
import { Avatar } from '../../ui/Avatar/Avatar';
import { Sparkles, MessageCircle } from 'lucide-react';
import { useEffect } from 'react';
import { Heart } from 'lucide-react';

interface MatchOverlayProps {
  matchedProfile: Profile;
  onDismiss: () => void;
  onMessage: () => void;
}

export function MatchOverlay({ matchedProfile, onDismiss, onMessage }: MatchOverlayProps) {
  // Prevent scroll when overlay is open
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, []);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl p-8 max-w-sm w-full mx-4 shadow-2xl animate-in zoom-in-95 duration-300">
        {/* Match celebration */}
        <div className="text-center space-y-4">
          <div className="relative">
            <Sparkles className="w-12 h-12 text-yellow-400 mx-auto animate-pulse" />
            <h2 className="text-3xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent mt-2">
              ✨ It's a Match! ✨
            </h2>
          </div>

          {/* Avatars */}
          <div className="flex items-center justify-center gap-4 py-4">
            <div className="relative">
              <Avatar src={matchedProfile.avatarUrl} alt={matchedProfile.name} size="lg" className="border-4 border-primary/20" />
            </div>
            <Heart className="w-8 h-8 text-red-500 fill-red-500 animate-pulse" />
            <div className="relative">
              <Avatar 
                src="https://api.dicebear.com/7.x/avataaars/svg?seed=you" 
                alt="You" 
                size="lg" 
                className="border-4 border-primary/20" 
              />
            </div>
          </div>

          <div>
            <p className="text-xl font-bold text-text">You + {matchedProfile.name}</p>
            <p className="text-sm text-text-secondary mt-1">
              You both like: {matchedProfile.interests.slice(0, 3).join(' · ')}
            </p>
          </div>

          <div className="flex flex-col gap-3 pt-2">
            <Button 
              variant="primary" 
              size="lg" 
              fullWidth
              onClick={onMessage}
              className="gap-2"
            >
              <MessageCircle className="w-5 h-5" />
              Say hello 👋
            </Button>
            <Button 
              variant="ghost" 
              size="md" 
              fullWidth
              onClick={onDismiss}
              className="text-text-secondary"
            >
              Keep exploring
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}