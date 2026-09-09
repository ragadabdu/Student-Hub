export interface UserSettings {
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
    profileVisibility: 'public' | 'connections' | 'private';
  };
  preferences: {
    theme: 'light' | 'dark' | 'system';
    language: string;
    discoveryRadius: number;
    showMeOnExplore: boolean;
  };
}

// Default settings
const defaultSettings: UserSettings = {
  notifications: {
    email: true,
    push: true,
    matches: true,
    messages: true,
    projectUpdates: true,
  },
  privacy: {
    showOnlineStatus: true,
    showLastActive: true,
    profileVisibility: 'public',
  },
  preferences: {
    theme: 'light',
    language: 'en',
    discoveryRadius: 50,
    showMeOnExplore: true,
  },
};

// Mock current settings
let currentSettings: UserSettings = { ...defaultSettings };

export const settingsService = {
  // Get user settings
  getSettings: async (): Promise<UserSettings> => {
    await new Promise(resolve => setTimeout(resolve, 300));
    return { ...currentSettings };
  },

  // Update user settings
  updateSettings: async (updates: Partial<UserSettings>): Promise<UserSettings> => {
    await new Promise(resolve => setTimeout(resolve, 400));
    currentSettings = { ...currentSettings, ...updates };
    return { ...currentSettings };
  },

  // Reset to default settings
  resetSettings: async (): Promise<UserSettings> => {
    await new Promise(resolve => setTimeout(resolve, 300));
    currentSettings = { ...defaultSettings };
    return { ...currentSettings };
  },
};