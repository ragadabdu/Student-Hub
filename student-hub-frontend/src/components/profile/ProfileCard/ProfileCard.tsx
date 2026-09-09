import type { Profile } from '../../../types/user';
import { Avatar } from '../../ui/Avatar/Avatar';
import { Badge } from '../../ui/Badge/Badge';
import { Users, Book, Briefcase, Coffee, Sparkles } from 'lucide-react';

interface ProfileCardProps {
  profile: Profile;
  className?: string;
}

const lookingForLabels = {
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
  return (
    <div className={`bg-white rounded-2xl shadow-lg overflow-hidden max-w-md w-full ${className}`}>
      {/* Profile Photo */}
      <div className="relative h-64 bg-gradient-to-br from-primary/20 to-blue-200/20">
        <div className="absolute inset-0 flex items-center justify-center">
          <Avatar src={profile.avatarUrl} alt={profile.name} size="xl" className="w-32 h-32 border-4 border-white shadow-lg" />
        </div>
        
        {/* Subtle decorative gradient overlay */}
        <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-white/80 to-transparent" />
      </div>

      {/* Profile Content */}
      <div className="p-6 space-y-4">
        {/* Name & University */}
        <div>
          <h3 className="text-2xl font-bold text-text">
            {profile.name}, {profile.age}
          </h3>
          <p className="text-text-secondary">
            {profile.university} · {profile.major}
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
              <Badge key={interest} variant="primary">
                {interest}
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

        {/* Looking For */}
        {profile.lookingFor.length > 0 && (
          <div>
            <p className="text-xs font-semibold text-text-secondary uppercase tracking-wider mb-2">
              Looking for
            </p>
            <div className="flex flex-wrap gap-3">
              {profile.lookingFor.map((item) => {
                const Icon = lookingForIcons[item];
                return (
                  <span key={item} className="flex items-center gap-1.5 text-sm text-text-secondary">
                    <Icon className="w-4 h-4" />
                    {lookingForLabels[item]}
                  </span>
                );
              })}
            </div>
          </div>
        )}

        {/* Projects Preview */}
        {profile.projects && profile.projects.length > 0 && (
          <div>
            <p className="text-xs font-semibold text-text-secondary uppercase tracking-wider mb-2">
              Projects
            </p>
            <div className="flex gap-3">
              {profile.projects.slice(0, 2).map((project) => (
                <div
                  key={project.id}
                  className="flex-1 bg-gray-50 rounded-xl p-3 border border-border hover:border-primary/20 transition-colors"
                >
                  <p className="text-sm font-medium text-text">{project.title}</p>
                  <p className="text-xs text-text-secondary mt-1">{project.description}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}