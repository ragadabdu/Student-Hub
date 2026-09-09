import '@testing-library/jest-dom/vitest';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { BrowserRouter } from 'react-router-dom';
import Settings from '../index';
import { settingsService } from '../../../services/settings';

vi.mock('../../../services/settings', () => ({
  settingsService: {
    getSettings: vi.fn(),
    updateSettings: vi.fn(),
    resetSettings: vi.fn(),
  },
}));

const mockSettings = {
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
    profileVisibility: 'public' as const,
  },
  preferences: {
    theme: 'light' as const,
    language: 'en',
    discoveryRadius: 50,
    showMeOnExplore: true,
  },
};

describe('Settings Page', () => {
  const renderSettings = () => {
    return render(
      <BrowserRouter>
        <Settings />
      </BrowserRouter>
    );
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render loading state initially', () => {
    vi.mocked(settingsService.getSettings).mockImplementation(
      () => new Promise(() => {})
    );

    renderSettings();
    expect(screen.getByText('Loading settings...')).toBeInTheDocument();
  });

  it('should render settings when loaded', async () => {
    vi.mocked(settingsService.getSettings).mockResolvedValue(mockSettings);

    renderSettings();

    await waitFor(() => {
      expect(screen.queryByText('Loading settings...')).not.toBeInTheDocument();
    });

    expect(screen.getByText('Settings')).toBeInTheDocument();
    expect(screen.getByText('Manage your preferences and account settings')).toBeInTheDocument();
    
    // Use getAllByText since "Preferences" appears twice (tab + heading)
    const preferencesElements = screen.getAllByText('Preferences');
    expect(preferencesElements.length).toBe(2);
    
    expect(screen.getByText('Notifications')).toBeInTheDocument();
    expect(screen.getByText('Privacy')).toBeInTheDocument();
  });

  it('should handle error state', async () => {
    vi.mocked(settingsService.getSettings).mockRejectedValue(
      new Error('Network error')
    );

    renderSettings();

    await waitFor(() => {
      expect(screen.getByText('Failed to load settings')).toBeInTheDocument();
      expect(screen.getByText('Network error')).toBeInTheDocument();
      expect(screen.getByText('Try Again')).toBeInTheDocument();
    });
  });

  it('should switch between sections', async () => {
    const user = userEvent.setup();
    vi.mocked(settingsService.getSettings).mockResolvedValue(mockSettings);

    renderSettings();

    await waitFor(() => {
      expect(screen.queryByText('Loading settings...')).not.toBeInTheDocument();
    });

    // Click Notifications tab
    const notificationsTab = screen.getByText('Notifications');
    await user.click(notificationsTab);

    // Should show notification settings
    expect(screen.getByText('Notification Settings')).toBeInTheDocument();
    expect(screen.getByText('Email Notifications')).toBeInTheDocument();
    expect(screen.getByText('Push Notifications')).toBeInTheDocument();

    // Click Privacy tab
    const privacyTab = screen.getByText('Privacy');
    await user.click(privacyTab);

    // Should show privacy settings
    expect(screen.getByText('Privacy Settings')).toBeInTheDocument();
    expect(screen.getByText('Show online status')).toBeInTheDocument();
    expect(screen.getByText('Show last active time')).toBeInTheDocument();
    expect(screen.getByText('Profile Visibility')).toBeInTheDocument();

    // Click Preferences tab (back to default)
    const preferencesTab = screen.getByText('Preferences');
    await user.click(preferencesTab);

    // Should show preferences - use getAllByText since it appears twice
    const preferencesElements = screen.getAllByText('Preferences');
    expect(preferencesElements.length).toBe(2);
    expect(screen.getByText('Theme')).toBeInTheDocument();
    expect(screen.getByText('Language')).toBeInTheDocument();
    expect(screen.getByText('Discovery Radius: 50 miles')).toBeInTheDocument();
  });

  it('should toggle notification settings', async () => {
    const user = userEvent.setup();
    vi.mocked(settingsService.getSettings).mockResolvedValue(mockSettings);
    vi.mocked(settingsService.updateSettings).mockResolvedValue({
      ...mockSettings,
      notifications: { ...mockSettings.notifications, email: false },
    });

    renderSettings();

    await waitFor(() => {
      expect(screen.queryByText('Loading settings...')).not.toBeInTheDocument();
    });

    // Switch to Notifications tab
    const notificationsTab = screen.getByText('Notifications');
    await user.click(notificationsTab);

    // Find and click the Email Notifications toggle
    const emailToggle = screen.getByLabelText('Toggle Email Notifications');
    await user.click(emailToggle);

    expect(settingsService.updateSettings).toHaveBeenCalledWith({
      notifications: { ...mockSettings.notifications, email: false },
    });
  });

  it('should change theme preference', async () => {
    const user = userEvent.setup();
    vi.mocked(settingsService.getSettings).mockResolvedValue(mockSettings);
    vi.mocked(settingsService.updateSettings).mockResolvedValue({
      ...mockSettings,
      preferences: { ...mockSettings.preferences, theme: 'dark' },
    });

    renderSettings();

    await waitFor(() => {
      expect(screen.queryByText('Loading settings...')).not.toBeInTheDocument();
    });

    // Click Dark theme button
    const darkButton = screen.getByText('Dark');
    await user.click(darkButton);

    expect(settingsService.updateSettings).toHaveBeenCalledWith({
      preferences: { ...mockSettings.preferences, theme: 'dark' },
    });
  });

  it('should change language preference', async () => {
    const user = userEvent.setup();
    vi.mocked(settingsService.getSettings).mockResolvedValue(mockSettings);
    vi.mocked(settingsService.updateSettings).mockResolvedValue({
      ...mockSettings,
      preferences: { ...mockSettings.preferences, language: 'es' },
    });

    renderSettings();

    await waitFor(() => {
      expect(screen.queryByText('Loading settings...')).not.toBeInTheDocument();
    });

    // Change language
    const languageSelect = screen.getByLabelText('Language');
    await user.selectOptions(languageSelect, 'es');

    expect(settingsService.updateSettings).toHaveBeenCalledWith({
      preferences: { ...mockSettings.preferences, language: 'es' },
    });
  });

  it('should change discovery radius', async () => {
    
    vi.mocked(settingsService.getSettings).mockResolvedValue(mockSettings);
    vi.mocked(settingsService.updateSettings).mockResolvedValue({
      ...mockSettings,
      preferences: { ...mockSettings.preferences, discoveryRadius: 75 },
    });

    renderSettings();

    await waitFor(() => {
      expect(screen.queryByText('Loading settings...')).not.toBeInTheDocument();
    });

    // Find the range input
    const radiusInput = screen.getByLabelText('Discovery Radius: 50 miles');
    
    // Use fireEvent.change instead of userEvent.clear/type for range inputs
    fireEvent.change(radiusInput, { target: { value: '75' } });

    // Verify the update was called
    expect(settingsService.updateSettings).toHaveBeenCalledWith({
      preferences: { ...mockSettings.preferences, discoveryRadius: 75 },
    });
  });

  it('should toggle show on explore', async () => {
    const user = userEvent.setup();
    vi.mocked(settingsService.getSettings).mockResolvedValue(mockSettings);
    vi.mocked(settingsService.updateSettings).mockResolvedValue({
      ...mockSettings,
      preferences: { ...mockSettings.preferences, showMeOnExplore: false },
    });

    renderSettings();

    await waitFor(() => {
      expect(screen.queryByText('Loading settings...')).not.toBeInTheDocument();
    });

    // Find and click the "Show me on Explore" toggle
    const exploreToggle = screen.getByLabelText('Visible on explore');
    await user.click(exploreToggle);

    expect(settingsService.updateSettings).toHaveBeenCalledWith({
      preferences: { ...mockSettings.preferences, showMeOnExplore: false },
    });
  });

  it('should change profile visibility', async () => {
    const user = userEvent.setup();
    vi.mocked(settingsService.getSettings).mockResolvedValue(mockSettings);
    vi.mocked(settingsService.updateSettings).mockResolvedValue({
      ...mockSettings,
      privacy: { ...mockSettings.privacy, profileVisibility: 'private' },
    });

    renderSettings();

    await waitFor(() => {
      expect(screen.queryByText('Loading settings...')).not.toBeInTheDocument();
    });

    // Switch to Privacy tab
    const privacyTab = screen.getByText('Privacy');
    await user.click(privacyTab);

    // Click Private option
    const privateButton = screen.getByText('Private');
    await user.click(privateButton);

    expect(settingsService.updateSettings).toHaveBeenCalledWith({
      privacy: { ...mockSettings.privacy, profileVisibility: 'private' },
    });
  });

  it('should save settings', async () => {
    const user = userEvent.setup();
    vi.mocked(settingsService.getSettings).mockResolvedValue(mockSettings);
    vi.mocked(settingsService.updateSettings).mockResolvedValue(mockSettings);

    renderSettings();

    await waitFor(() => {
      expect(screen.queryByText('Loading settings...')).not.toBeInTheDocument();
    });

    // Click Save Settings button
    const saveButton = screen.getByText('Save Settings');
    await user.click(saveButton);

    expect(settingsService.updateSettings).toHaveBeenCalledWith(mockSettings);

    // Should show success message
    await waitFor(() => {
      expect(screen.getByText('Settings saved successfully!')).toBeInTheDocument();
    });
  });

  it('should reset settings to defaults', async () => {
    const user = userEvent.setup();
    vi.mocked(settingsService.getSettings).mockResolvedValue(mockSettings);
    vi.mocked(settingsService.resetSettings).mockResolvedValue({
      ...mockSettings,
      preferences: { ...mockSettings.preferences, theme: 'system' },
    });

    renderSettings();

    await waitFor(() => {
      expect(screen.queryByText('Loading settings...')).not.toBeInTheDocument();
    });

    // Click Reset to Defaults button
    const resetButton = screen.getByText('Reset to Defaults');
    await user.click(resetButton);

    expect(settingsService.resetSettings).toHaveBeenCalled();

    // Should show success message
    await waitFor(() => {
      expect(screen.getByText('Settings saved successfully!')).toBeInTheDocument();
    });
  });
});