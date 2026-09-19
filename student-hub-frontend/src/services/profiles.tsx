// Profile service — real API calls against the Rails backend.
//
// Backend reference (see docs/api.md):
//   GET   /profiles          → discoverable profiles (paginated)
//   GET   /profiles/:id      → one profile
//   GET   /me/profile        → own profile
//   PATCH /me/profile        → update own profile (name under user, rest under profile)
//
// The API client (api.ts) handles cookies, CSRF, and case conversion.

import { api } from './api';
import type { Profile, LookingFor, ProfileVisibility } from '../types/user';

type ProfileListResponse = {
  profiles: Profile[];
  meta: {
    currentPage: number;
    perPage: number;
    totalCount: number;
    totalPages: number;
  };
};

type ProfileDetailResponse = { profile: Profile };

export type UpdateProfilePayload = {
  // User-level fields
  name?: string;
  // Profile-level fields
  birthdate?: string | null;
  university?: string | null;
  major?: string | null;
  tagline?: string | null;
  bio?: string | null;
  lookingFor?: LookingFor;
  profileVisibility?: ProfileVisibility;
  showOnExplore?: boolean;
};

export const profilesService = {
  // List discoverable profiles (paginated).
  async list(params?: {
    page?: number;
    perPage?: number;
  }): Promise<ProfileListResponse> {
    const query = new URLSearchParams();
    if (params?.page) query.set('page', String(params.page));
    if (params?.perPage) query.set('per_page', String(params.perPage));
    const qs = query.toString();

    return api.get<ProfileListResponse>(`/profiles${qs ? `?${qs}` : ''}`);
  },

  // View one profile by ID.
  async get(id: string): Promise<Profile> {
    const { profile } = await api.get<ProfileDetailResponse>(`/profiles/${id}`);
    return profile;
  },

  // Get own profile. Includes portfolio links.
  async me(): Promise<Profile> {
    const { profile } = await api.get<ProfileDetailResponse>('/me/profile');
    return profile;
  },

  // Update own profile. Name goes under `user`, the rest under `profile`.
  // The API client converts camelCase → snake_case automatically.
  async update(payload: UpdateProfilePayload): Promise<Profile> {
    const body: Record<string, unknown> = {};

    if (payload.name !== undefined) {
      body.user = { name: payload.name };
    }

    const profileKeys = [
      'birthdate',
      'university',
      'major',
      'tagline',
      'bio',
      'lookingFor',
      'profileVisibility',
      'showOnExplore',
    ] as const;

    const profileFields: Record<string, unknown> = {};
    for (const key of profileKeys) {
      if (payload[key] !== undefined) {
        profileFields[key] = payload[key];
      }
    }
    if (Object.keys(profileFields).length > 0) {
      body.profile = profileFields;
    }

    const { profile } = await api.patch<ProfileDetailResponse>(
      '/me/profile',
      body,
    );
    return profile;
  },
};
