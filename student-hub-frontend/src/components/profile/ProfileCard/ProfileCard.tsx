import type { Profile } from '../../../types/user';
import { Avatar } from '../../ui/Avatar/Avatar';
import { Badge } from '../../ui/Badge/Badge';
import { Users, Briefcase, Coffee, Sparkles } from 'lucide-react';

interface ProfileCardProps {
  profile: Profile;
  className?: string;
}

const lookingForLabels: Record<string, string> = {
  friends: '🤝 Friends',
  project_collaborators: '💻 Project teammates',
  study_buddies: '☕ Study buddies',
  mentors: '🧠 Mentors',
};

const lookingForIcons = {
  friends: Users,
  project_collaborators: Briefcase,
  study_buddies: Coffee,
  mentors: Sparkles,
};

export function ProfileCard({ profile, className = '' }: ProfileCardProps) {
  const displayName = profile.user.name ?? 'Unnamed Student';
  const avatarUrl = profile.user.avatarUrl ?? undefined;

  return (
    <div className={`bg-white rounded-2xl shadow-lg overflow-hidden max-w-md w-full ${className}`}>
      {/* Profile Photo */}
      <div className="relative h-64 bg-gradient-to-br from-primary/20 to-blue-200/20">
        <div className="absolute inset-0 flex items-center justify-center">
          <Avatar
            src={avatarUrl}
            alt={displayName}
            size="xl"
            className="w-32 h-32 border-4 border-white shadow-lg"
          />
        </div>

        <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-white/80 to-transparent" />
      </div>

      {/* Profile Content */}
      <div className="p-6 space-y-4">
        {/* Name & University */}
        <div>
          <h3 className="text-2xl font-bold text-text">
            {displayName}
            {profile.age !== null && `, ${profile.age}`}
          </h3>
          <p className="text-text-secondary">
            {[profile.university, profile.major].filter(Boolean).join(' · ') || 'Student'}
          </p>
        </div>

        {/* Tagline */}
        {profile.tagline && (
          <p className="text-sm font-medium text-primary">{profile.tagline}</p>
        )}

        {/* Interests */}
        {profile.interests.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {profile.interests.map((interest) => (
              <Badge key={interest.id} variant="primary">
                {interest.name}
              </Badge>
            ))}
          </div>
        )}

        {/* Bio */}
        {profile.bio && (
          <p className="text-text-secondary text-sm leading-relaxed italic">
            "{profile.bio}"
          </p>
        )}

        {/* Looking For (single value) */}
        {profile.lookingFor && (
          <div>
            <p className="text-xs font-semibold text-text-secondary uppercase tracking-wider mb-2">
              Looking for
            </p>
            <div className="flex flex-wrap gap-3">
              {(() => {
                const item = profile.lookingFor;
                const Icon = lookingForIcons[item];
                return (
                  <span className="flex items-center gap-1.5 text-sm text-text-secondary">
                    <Icon className="w-4 h-4" />
                    {lookingForLabels[item]}
                  </span>
                );
              })()}
            </div>
          </div>
        )}

        {/* Projects section removed — will return in FI.4 as a separate fetch */}
      </div>
    </div>
  );
}
