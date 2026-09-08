export type LookingFor = 'friends' | 'project_collaborators' | 'study_buddies' | 'mentors';

export type User = {
  id: string;
  name: string;
  age: number;
  university: string;
  major: string;
  bio: string;
  tagline?: string;
  interests: string[];
  lookingFor: LookingFor[];
  avatarUrl: string;
  portfolioLinks?: PortfolioLink[];
  createdAt: Date;
};

export type PortfolioLink = {
  id: string;
  label: 'GitHub' | 'LinkedIn' | 'Website' | 'Twitter' | 'Other';
  url: string;
};

// For profile display
export type Profile = User & {
  projects?: ProjectPreview[];
};

export type ProjectPreview = {
  id: string;
  title: string;
  description: string;
  thumbnailUrl?: string;
};