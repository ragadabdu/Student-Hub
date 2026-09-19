import type { Profile } from '../../../types/user';
import { Avatar } from '../../ui/Avatar/Avatar';
import { Button } from '../../ui/Button/Button';
import { Pencil, MapPin, GraduationCap, Briefcase } from 'lucide-react';

interface ProfileHeaderProps {
  profile: Profile;
  isOwnProfile?: boolean;
  onEdit?: () => void;
}

export function ProfileHeader({
  profile,
  isOwnProfile = false,
  onEdit,
}: ProfileHeaderProps) {
  // Name and avatar come from the embedded public user object.
  const displayName = profile.user.name ?? 'Unnamed Student';
  const avatarUrl = profile.user.avatarUrl ?? undefined;

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-border p-6 md:p-8">
      <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
        {/* Avatar */}
        <div className="relative">
          <Avatar
            src={avatarUrl}
            alt={displayName}
            size="xl"
            className="border-4 border-primary/10"
          />
          {isOwnProfile && (
            <button
              onClick={onEdit}
              className="absolute -bottom-1 -right-1 bg-primary text-white rounded-full p-1.5 shadow-md hover:bg-primary-dark transition-colors"
              aria-label="Edit profile"
            >
              <Pencil className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Profile Info */}
        <div className="flex-1 min-w-0">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <h2 className="text-2xl md:text-3xl font-bold text-text">
                {displayName}
              </h2>

              <div className="flex flex-wrap items-center gap-3 mt-1 text-text-secondary">
                {profile.major && (
                  <span className="flex items-center gap-1.5">
                    <GraduationCap className="w-4 h-4" />
                    {profile.major}
                  </span>
                )}
                {profile.university && (
                  <span className="flex items-center gap-1.5">
                    <MapPin className="w-4 h-4" />
                    {profile.university}
                  </span>
                )}
                {profile.age !== null && (
                  <span className="flex items-center gap-1.5">
                    <Briefcase className="w-4 h-4" />
                    {profile.age} years old
                  </span>
                )}
              </div>
            </div>

            {isOwnProfile && (
              <Button variant="outline" size="sm" onClick={onEdit}>
                <Pencil className="w-4 h-4 mr-2" />
                Edit Profile
              </Button>
            )}
          </div>

          {/* Tagline */}
          {profile.tagline && (
            <p className="text-primary font-medium mt-2">{profile.tagline}</p>
          )}
        </div>
      </div>
    </div>
  );
}
