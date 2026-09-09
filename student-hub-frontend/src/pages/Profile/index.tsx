import { useProfile } from '../../hooks/useProfile';
import { ProfileHeader } from '../../components/profile/ProfileHeader/ProfileHeader';
import { InterestTags } from '../../components/profile/InterestTags/InterestTags';
import { LookingFor } from '../../components/profile/LookingFor/LookingFor';
import { PortfolioLinks } from '../../components/profile/PortfolioLinks/PortfolioLinks';
import { ProfileEditForm } from '../../components/profile/ProfileEditForm/ProfileEditForm';
import { LoadingState } from '../../components/ui/LoadingState/LoadingState';
import { EmptyState } from '../../components/ui/EmptyState/EmptyState';
import { Button } from '../../components/ui/Button/Button';
import { AlertCircle, CheckCircle, Layers } from 'lucide-react';
import type { ProjectPreview } from '../../types/user';

export default function Profile() {
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

  // Show loading state
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <LoadingState message="Loading your profile..." />
      </div>
    );
  }

  // Show error state
  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[60vh] p-4">
        <div className="text-center max-w-md">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-text mb-2">Failed to load profile</h3>
          <p className="text-text-secondary mb-4">{error}</p>
          <Button onClick={() => window.location.reload()}>Try Again</Button>
        </div>
      </div>
    );
  }

  // Show empty state if no profile
  if (!profile) {
    return (
      <div className="flex items-center justify-center min-h-[60vh] p-4">
        <EmptyState
          icon="👤"
          title="No profile found"
          description="We couldn't find your profile. Please try refreshing the page."
          action={<Button onClick={() => window.location.reload()}>Refresh</Button>}
        />
      </div>
    );
  }

  // Success notification
  const SuccessNotification = () => (
    <div className="bg-green-50 border border-green-200 rounded-xl p-4 flex items-center gap-3 animate-in slide-in-from-top-2 duration-300">
      <CheckCircle className="w-5 h-5 text-green-500" />
      <p className="text-green-700 font-medium">Profile updated successfully!</p>
    </div>
  );

  return (
    <div className="p-4 md:p-6 max-w-4xl mx-auto space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-3xl md:text-4xl font-bold text-navy">My Profile</h1>
        <p className="text-text-secondary mt-1">Manage your student portfolio</p>
      </div>

      {/* Success Notification */}
      {saveSuccess && <SuccessNotification />}

      {/* Profile Header */}
      <ProfileHeader
        profile={profile}
        isOwnProfile={true}
        onEdit={startEditing}
      />

      {/* Edit Mode */}
      {mode === 'edit' ? (
        <div className="bg-white rounded-2xl shadow-sm border border-border p-6 md:p-8">
          <h3 className="text-lg font-semibold text-text mb-6">Edit Profile</h3>
          <ProfileEditForm
            profile={profile}
            onSave={saveProfile}
            onCancel={cancelEditing}
            isSaving={isSaving}
          />
        </div>
      ) : (
        /* View Mode */
        <div className="space-y-6">
          {/* Bio */}
          <div className="bg-white rounded-2xl shadow-sm border border-border p-6 md:p-8">
            <h3 className="text-sm font-semibold text-text-secondary uppercase tracking-wider mb-3">
              About
            </h3>
            {profile.bio ? (
              <p className="text-text leading-relaxed">{profile.bio}</p>
            ) : (
              <p className="text-text-secondary italic">No bio added yet</p>
            )}
          </div>

          {/* Interests */}
          <div className="bg-white rounded-2xl shadow-sm border border-border p-6 md:p-8">
            <h3 className="text-sm font-semibold text-text-secondary uppercase tracking-wider mb-3">
              Interests
            </h3>
            <InterestTags interests={profile.interests} />
          </div>

          {/* Looking For */}
          <div className="bg-white rounded-2xl shadow-sm border border-border p-6 md:p-8">
            <h3 className="text-sm font-semibold text-text-secondary uppercase tracking-wider mb-3">
              Looking For
            </h3>
            <LookingFor lookingFor={profile.lookingFor} />
          </div>

          {/* Projects */}
          <div className="bg-white rounded-2xl shadow-sm border border-border p-6 md:p-8">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-semibold text-text-secondary uppercase tracking-wider">
                Projects
              </h3>
              <Button variant="ghost" size="sm" className="text-primary">
                <Layers className="w-4 h-4 mr-1" />
                View all
              </Button>
            </div>
            
            {profile.projects && profile.projects.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {profile.projects.map((project: ProjectPreview) => (
                  <div
                    key={project.id}
                    className="bg-gray-50 rounded-xl p-4 border border-border hover:border-primary/20 transition-colors"
                  >
                    <h4 className="font-medium text-text">{project.title}</h4>
                    {project.description && (
                      <p className="text-sm text-text-secondary mt-1">{project.description}</p>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-text-secondary italic">No projects added yet</p>
            )}
          </div>

          {/* Portfolio Links */}
          <div className="bg-white rounded-2xl shadow-sm border border-border p-6 md:p-8">
            <h3 className="text-sm font-semibold text-text-secondary uppercase tracking-wider mb-3">
              Portfolio
            </h3>
            {profile.portfolioLinks && profile.portfolioLinks.length > 0 ? (
              <PortfolioLinks links={profile.portfolioLinks} />
            ) : (
              <p className="text-text-secondary italic">No portfolio links added</p>
            )}
          </div>

          {/* Edit Button (mobile) - already shown in header */}
        </div>
      )}
    </div>
  );
}