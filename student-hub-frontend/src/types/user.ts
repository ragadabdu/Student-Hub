// Types matching the backend's profile response shape.
// JSON is converted from snake_case to camelCase by the API client,
// so these types use camelCase.
//
// Backend reference:
//   - ProfileSerializer (app/serializers/profile_serializer.rb)
//   - UserSerializer (app/serializers/user_serializer.rb)
//   - GET /api/v1/auth/me (inline profile shape)

export type LookingFor =
  | 'friends'
  | 'project_collaborators'
  | 'study_buddies'
  | 'mentors';

export type ProfileVisibility = 'public_profile' | 'private_profile';

export type LinkType = 'github' | 'linkedin' | 'website' | 'twitter' | 'other';

// The "public user" shape — id, name, avatarUrl. Appears inline in
// profiles, project owners, message senders, etc.
export type PublicUser = {
  id: string;
  name: string | null;
  avatarUrl: string | null;
};

// The authenticated user. Returned by /auth/login, /auth/register, /auth/me.
export type CurrentUser = {
  id: string;
  email: string;
  name: string | null;
  createdAt: string; // ISO 8601
  profile?: Profile; // Included by /auth/me, not by login/register
};

// A user's profile. Returned by /profiles, /profiles/:id, /me/profile.
export type Profile = {
  id: string;
  userId: string;
  user: PublicUser;

  // Optional profile fields
  university: string | null;
  major: string | null;
  tagline: string | null;
  bio: string | null;
  age: number | null;

  lookingFor: LookingFor;
  profileVisibility: ProfileVisibility;
  showOnExplore: boolean;

  interests: Interest[];
  skills: Skill[];

  // Only included on detail views (show endpoints), not list views
  portfolioLinks?: PortfolioLink[];

  createdAt: string;
  updatedAt: string;
};

export type Interest = {
  id: string;
  name: string;
  isCustom: boolean;
};

export type Skill = {
  id: string;
  name: string;
  isCustom: boolean;
};

export type PortfolioLink = {
  id: string;
  linkType: LinkType;
  url: string;
  title: string | null;
  createdAt: string;
};

// Legacy type used by existing components — kept temporarily during
// integration so we don't break the current UI. Will be removed once
// components are migrated to `Profile` above.
//
// Migration plan: search for `User` and `ProjectPreview` usages and
// switch them to `Profile`. Until then, keep both.
export type User = Profile;
