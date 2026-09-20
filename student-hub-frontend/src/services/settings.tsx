// Settings service — real API calls.
//
// Backend reference (see docs/api.md):
//   GET   /me/settings  → aggregated settings
//   PATCH /me/settings  → partial update
//
// The response aggregates data from two tables (user_settings and
// profiles). The API presents them as one nested object.
//
// The API client converts snake_case ↔ camelCase transparently.

import { api } from './api';

export type ProfileVisibility = 'public_profile' | 'private_profile';
export type Theme = 'system' | 'light' | 'dark';

export type Settings = {
  notifications: {
    email: boolean;
    push: boolean;
    matches: boolean;
    messages: boolean;
    projectUpdates: boolean;
  };
  privacy: {
    showOnlineStatus: boolean;
    showLastActive: boolean;
    profileVisibility: ProfileVisibility;
    showOnExplore: boolean;
  };
  preferences: {
    theme: Theme;
    language: string;
    discoveryRadius: number;
  };
};

// Deep partial for updates.
export type SettingsUpdate = {
  notifications?: Partial<Settings['notifications']>;
  privacy?: Partial<Settings['privacy']>;
  preferences?: Partial<Settings['preferences']>;
};

type SettingsResponse = { settings: Settings };

export const settingsService = {
  async get(): Promise<Settings> {
    const { settings } = await api.get<SettingsResponse>('/me/settings');
    return settings;
  },

  async update(patch: SettingsUpdate): Promise<Settings> {
    const { settings } = await api.patch<SettingsResponse>('/me/settings', {
      settings: patch,
    });
    return settings;
  },
};
