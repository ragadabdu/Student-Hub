import { useProfile } from '../../hooks/useProfile';
import { useAuth } from '../../context/AuthContext';
import { ProfileHeader } from '../../components/profile/ProfileHeader/ProfileHeader';
import { InterestTags } from '../../components/profile/InterestTags/InterestTags';
import { SkillTags } from '../../components/profile/SkillTags/SkillTags';
import { LookingFor } from '../../components/profile/LookingFor/LookingFor';
import { PortfolioLinks } from '../../components/profile/PortfolioLinks/PortfolioLinks';
import { ProfileEditForm } from '../../components/profile/ProfileEditForm/ProfileEditForm';
import { LoadingState } from '../../components/ui/LoadingState/LoadingState';
import { EmptyState } from '../../components/ui/EmptyState/EmptyState';
import { Button } from '../../components/ui/Button/Button';
import { AlertCircle, CheckCircle } from 'lucide-react';

export default function Profile() {
  const { user } = useAuth();
  const {
    profile,
    isLoading,
    error,
    mode,
    isSaving,
    saveSuccess,
    startEditing,
    cancelEditing,
    saveProfile,
  } = useProfile();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <LoadingState message="Loading your profile..." />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[60vh] p-4">
        <div className="text-center max-w-md">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-text mb-2">
            Something went wrong
          </h3>
          <p className="text-text-secondary mb-4">{error}</p>
          <Button onClick={() => window.location.reload()}>Reload</Button>
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="flex items-center justify-center min-h-[60vh] p-4">
        <EmptyState
          icon="👤"
          title="No profile found"
          description="We couldn't find your profile. Please try refreshing."
          action={
            <Button onClick={() => window.location.reload()}>Refresh</Button>
          }
        />
      </div>
    );
  }

  // Normalize the profile object so all downstream components get
  // well-defined values. /auth/me returns a partial profile (missing
  // interests/skills/portfolioLinks/user), so we fill in safe defaults.
  const profileUser =
    profile.user ??
    (user
      ? { id: user.id, name: user.name, avatarUrl: null }
      : { id: '', name: null, avatarUrl: null });

  const normalizedProfile = {
    ...profile,
    user: profileUser,
    interests: profile.interests ?? [],
    skills: profile.skills ?? [],
    portfolioLinks: profile.portfolioLinks ?? [],
  };

  return (
    <div className="p-4 md:p-6 max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl md:text-4xl font-bold text-navy">My Profile</h1>
        <p className="text-text-secondary mt-1">Manage your student portfolio</p>
      </div>

      {saveSuccess && (
        <div className="bg-green-50 border border-green-200 rounded-xl p-4 flex items-center gap-3">
          <CheckCircle className="w-5 h-5 text-green-500" />
          <p className="text-green-700 font-medium">
            Profile updated successfully!
          </p>
        </div>
      )}

      <ProfileHeader
        profile={normalizedProfile}
        isOwnProfile
        onEdit={startEditing}
      />

      {mode === 'edit' ? (
        <div className="bg-white rounded-2xl shadow-sm border border-border p-6 md:p-8">
          <h3 className="text-lg font-semibold text-text mb-6">Edit Profile</h3>
          <ProfileEditForm
            initial={{
              name: profileUser.name,
              birthdate: null,
              university: normalizedProfile.university,
              major: normalizedProfile.major,
              bio: normalizedProfile.bio,
              tagline: normalizedProfile.tagline,
              lookingFor: normalizedProfile.lookingFor,
              interests: normalizedProfile.interests.map((i) => i.name),
              skills: normalizedProfile.skills.map((s) => s.name),
            }}
            onSave={saveProfile}
            onCancel={cancelEditing}
            isSaving={isSaving}
          />
        </div>
      ) : (
        <div className="space-y-6">
          <div className="bg-white rounded-2xl shadow-sm border border-border p-6 md:p-8">
            <h3 className="text-sm font-semibold text-text-secondary uppercase tracking-wider mb-3">
              About
            </h3>
            {normalizedProfile.bio ? (
              <p className="text-text leading-relaxed">{normalizedProfile.bio}</p>
            ) : (
              <p className="text-text-secondary italic">No bio added yet</p>
            )}
          </div>

          <div className="bg-white rounded-2xl shadow-sm border border-border p-6 md:p-8">
            <h3 className="text-sm font-semibold text-text-secondary uppercase tracking-wider mb-3">
              Interests
            </h3>
            <InterestTags interests={normalizedProfile.interests} />
          </div>

          <div className="bg-white rounded-2xl shadow-sm border border-border p-6 md:p-8">
            <h3 className="text-sm font-semibold text-text-secondary uppercase tracking-wider mb-3">
              Skills
            </h3>
            <SkillTags skills={normalizedProfile.skills} />
          </div>

          <div className="bg-white rounded-2xl shadow-sm border border-border p-6 md:p-8">
            <h3 className="text-sm font-semibold text-text-secondary uppercase tracking-wider mb-3">
              Looking For
            </h3>
            <LookingFor lookingFor={normalizedProfile.lookingFor} />
          </div>

          <div className="bg-white rounded-2xl shadow-sm border border-border p-6 md:p-8">
            <h3 className="text-sm font-semibold text-text-secondary uppercase tracking-wider mb-3">
              Portfolio
            </h3>
            {normalizedProfile.portfolioLinks.length > 0 ? (
              <PortfolioLinks links={normalizedProfile.portfolioLinks} />
            ) : (
              <p className="text-text-secondary italic">
                No portfolio links added
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}