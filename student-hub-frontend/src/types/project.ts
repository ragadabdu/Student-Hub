// Project type — matches the backend ProjectSerializer shape.
//
// Backend reference: app/serializers/project_serializer.rb
//
// The API client converts snake_case → camelCase, so fields arrive
// as camelCase. Note: `lookingFor` is a SINGLE enum value per project
// (matching Profile.lookingFor), not an array.

import type { PublicUser, Skill } from './user';

export type ProjectCategory =
  | 'web_dev'
  | 'ai_ml'
  | 'design'
  | 'mobile'
  | 'business'
  | 'other';

export type LookingFor =
  | 'friends'
  | 'project_collaborators'
  | 'study_buddies'
  | 'mentors';

export type Project = {
  id: string;
  title: string;
  description: string | null;
  category: ProjectCategory;
  teamSize: number | null;
  lookingFor: LookingFor;
  githubUrl: string | null;
  liveDemoUrl: string | null;
  owner: PublicUser;
  skills: Skill[];
  createdAt: string; // ISO 8601
  updatedAt: string;
};
