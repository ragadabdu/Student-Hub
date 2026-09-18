import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSettings } from '../../hooks/useSettings';
import { useAuth } from '../../context/AuthContext';
import { LoadingState } from '../../components/ui/LoadingState/LoadingState';
import { Button } from '../../components/ui/Button/Button';
import { AlertCircle, CheckCircle, Moon, Sun, Monitor, Globe, Eye, Bell, Mail, Users, RefreshCw, Shield, LogOut } from 'lucide-react';

export default function Settings() {
  const {
    settings,
    isLoading,
    isSaving,
    error,
    saveSuccess,
    updateSettings,
    resetSettings,
  } = useSettings();

  const navigate = useNavigate();
  const { logout } = useAuth();
  const [activeSection, setActiveSection] = useState<'preferences' | 'notifications' | 'privacy'>('preferences');
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const handleLogout = async () => {
    setIsLoggingOut(true);
    try {
      await logout();
    } catch (err) {
      console.error('Logout failed:', err);
    } finally {
      setIsLoggingOut(false);
      navigate('/login', { replace: true });
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <LoadingState message="Loading settings..." />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[60vh] p-4">
        <div className="text-center max-w-md">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-text mb-2">Failed to load settings</h3>
          <p className="text-text-secondary mb-4">{error}</p>
          <Button onClick={() => window.location.reload()}>Try Again</Button>
        </div>
      </div>
    );
  }

  if (!settings) {
    return null;
  }

  const handleToggle = (section: 'notifications' | 'privacy' | 'preferences', key: string) => {
    const current = settings[section] as Record<string, any>;
    updateSettings({
      [section]: {
        ...current,
        [key]: !current[key],
      },
    });
  };

  const handleSelect = (section: 'notifications' | 'privacy' | 'preferences', key: string, value: any) => {
    const current = settings[section] as Record<string, any>;
    updateSettings({
      [section]: {
        ...current,
        [key]: value,
      },
    });
  };

  const sections = [
    { id: 'preferences', label: 'Preferences', icon: Globe },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'privacy', label: 'Privacy', icon: Shield },
  ];

  return (
    <div className="p-4 md:p-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl md:text-4xl font-bold text-navy">Settings</h1>
        <p className="text-text-secondary mt-1">Manage your preferences and account settings</p>
      </div>

      {/* Success Notification */}
      {saveSuccess && (
        <div className="bg-green-50 border border-green-200 rounded-xl p-4 flex items-center gap-3 mb-6 animate-in slide-in-from-top-2 duration-300">
          <CheckCircle className="w-5 h-5 text-green-500" />
          <p className="text-green-700 font-medium">Settings saved successfully!</p>
        </div>
      )}

      {/* Section Tabs */}
      <div className="flex gap-2 bg-gray-100 p-1 rounded-xl w-fit mb-6 overflow-x-auto">
        {sections.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            onClick={() => setActiveSection(id as any)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all whitespace-nowrap ${
              activeSection === id
                ? 'bg-white text-primary shadow-sm'
                : 'text-text-secondary hover:text-text'
            }`}
          >
            <Icon className="w-4 h-4" />
            {label}
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="bg-white rounded-2xl shadow-sm border border-border p-6 md:p-8">
        {/* Preferences Section */}
        {activeSection === 'preferences' && (
          <div className="space-y-6">
            <h3 className="text-lg font-semibold text-text">Preferences</h3>

            {/* Theme */}
            <div>
              <label className="block text-sm font-medium text-text-secondary mb-2">
                Theme
              </label>
              <div className="flex gap-3">
                {[
                  { value: 'light', label: 'Light', icon: Sun },
                  { value: 'dark', label: 'Dark', icon: Moon },
                  { value: 'system', label: 'System', icon: Monitor },
                ].map(({ value, label, icon: Icon }) => (
                  <button
                    key={value}
                    onClick={() => handleSelect('preferences', 'theme', value)}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg border-2 transition-all ${
                      settings.preferences.theme === value
                        ? 'border-primary bg-primary/10 text-primary'
                        : 'border-border text-text-secondary hover:border-gray-300'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    {label}
                  </button>
                ))}
              </div>
            </div>

            {/* Language */}
            <div>
              <label htmlFor="language" className="block text-sm font-medium text-text-secondary mb-2">
                Language
              </label>
              <select
                id="language"
                value={settings.preferences.language}
                onChange={(e) => handleSelect('preferences', 'language', e.target.value)}
                className="w-full max-w-xs px-4 py-2 rounded-lg border border-border focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-colors bg-white"
              >
                <option value="en">English</option>
                <option value="es">Spanish</option>
                <option value="fr">French</option>
                <option value="zh">Chinese</option>
              </select>
            </div>

            {/* Discovery Radius */}
            <div>
              <label htmlFor="radius" className="block text-sm font-medium text-text-secondary mb-2">
                Discovery Radius: {settings.preferences.discoveryRadius} miles
              </label>
              <input
                id="radius"
                type="range"
                min="5"
                max="100"
                step="5"
                value={settings.preferences.discoveryRadius}
                onChange={(e) => handleSelect('preferences', 'discoveryRadius', parseInt(e.target.value))}
                className="w-full max-w-md accent-primary"
              />
              <div className="flex justify-between text-xs text-text-secondary max-w-md">
                <span>5 mi</span>
                <span>50 mi</span>
                <span>100 mi</span>
              </div>
            </div>

            {/* Show on Explore */}
            <div className="flex items-center justify-between py-3 border-t border-border">
              <div>
                <p className="font-medium text-text">Show me on Explore</p>
                <p className="text-sm text-text-secondary">Appear in other students' discovery feed</p>
              </div>
              <button
                onClick={() => handleToggle('preferences', 'showMeOnExplore')}
                className={`relative w-12 h-6 rounded-full transition-colors ${
                  settings.preferences.showMeOnExplore ? 'bg-primary' : 'bg-gray-300'
                }`}
                aria-label={settings.preferences.showMeOnExplore ? 'Visible on explore' : 'Hidden from explore'}
              >
                <span
                  className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full transition-transform ${
                    settings.preferences.showMeOnExplore ? 'translate-x-6' : ''
                  }`}
                />
              </button>
            </div>
          </div>
        )}

        {/* Notifications Section */}
        {activeSection === 'notifications' && (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-text">Notification Settings</h3>
            <p className="text-sm text-text-secondary">Control how you receive notifications</p>

            <div className="space-y-4 mt-4">
              {[
                { key: 'email', label: 'Email Notifications', icon: Mail, desc: 'Receive notifications via email' },
                { key: 'push', label: 'Push Notifications', icon: Bell, desc: 'Receive push notifications on your device' },
              ].map(({ key, label, icon: Icon, desc }) => (
                <div key={key} className="flex items-center justify-between py-3 border-b border-border last:border-0">
                  <div className="flex items-center gap-3">
                    <Icon className="w-5 h-5 text-text-secondary" />
                    <div>
                      <p className="font-medium text-text">{label}</p>
                      <p className="text-sm text-text-secondary">{desc}</p>
                    </div>
                  </div>
                  <button
                    onClick={() => handleToggle('notifications', key)}
                    className={`relative w-12 h-6 rounded-full transition-colors ${
                      settings.notifications[key as keyof typeof settings.notifications] ? 'bg-primary' : 'bg-gray-300'
                    }`}
                    aria-label={`Toggle ${label}`}
                  >
                    <span
                      className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full transition-transform ${
                        settings.notifications[key as keyof typeof settings.notifications] ? 'translate-x-6' : ''
                      }`}
                    />
                  </button>
                </div>
              ))}
            </div>

            <div className="mt-6 pt-4 border-t border-border">
              <h4 className="text-sm font-medium text-text mb-3">Notify me about</h4>
              <div className="space-y-3">
                {[
                  { key: 'matches', label: 'New matches' },
                  { key: 'messages', label: 'New messages' },
                  { key: 'projectUpdates', label: 'Project updates' },
                ].map(({ key, label }) => (
                  <div key={key} className="flex items-center justify-between">
                    <span className="text-sm text-text-secondary">{label}</span>
                    <button
                      onClick={() => handleToggle('notifications', key)}
                      className={`relative w-10 h-5 rounded-full transition-colors ${
                        settings.notifications[key as keyof typeof settings.notifications] ? 'bg-primary' : 'bg-gray-300'
                      }`}
                      aria-label={`Toggle ${label}`}
                    >
                      <span
                        className={`absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full transition-transform ${
                          settings.notifications[key as keyof typeof settings.notifications] ? 'translate-x-5' : ''
                        }`}
                      />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Privacy Section */}
        {activeSection === 'privacy' && (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-text">Privacy Settings</h3>
            <p className="text-sm text-text-secondary">Control your privacy and visibility</p>

            <div className="space-y-4 mt-4">
              {[
                { key: 'showOnlineStatus', label: 'Show online status', desc: 'Let others see when you\'re active' },
                { key: 'showLastActive', label: 'Show last active time', desc: 'Display when you were last active' },
              ].map(({ key, label, desc }) => (
                <div key={key} className="flex items-center justify-between py-3 border-b border-border last:border-0">
                  <div>
                    <p className="font-medium text-text">{label}</p>
                    <p className="text-sm text-text-secondary">{desc}</p>
                  </div>
                  <button
                    onClick={() => handleToggle('privacy', key)}
                    className={`relative w-12 h-6 rounded-full transition-colors ${
                      settings.privacy[key as keyof typeof settings.privacy] ? 'bg-primary' : 'bg-gray-300'
                    }`}
                    aria-label={`Toggle ${label}`}
                  >
                    <span
                      className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full transition-transform ${
                        settings.privacy[key as keyof typeof settings.privacy] ? 'translate-x-6' : ''
                      }`}
                    />
                  </button>
                </div>
              ))}
            </div>

            {/* Profile Visibility */}
            <div className="pt-4 border-t border-border">
              <label className="block text-sm font-medium text-text-secondary mb-2">
                Profile Visibility
              </label>
              <div className="flex flex-wrap gap-3">
                {[
                  { value: 'public', label: 'Public', icon: Eye, desc: 'Visible to everyone' },
                  { value: 'connections', label: 'Connections', icon: Users, desc: 'Visible to your matches' },
                  { value: 'private', label: 'Private', icon: Shield, desc: 'Only visible to you' },
                ].map(({ value, label, icon: Icon, desc }) => (
                  <button
                    key={value}
                    onClick={() => handleSelect('privacy', 'profileVisibility', value)}
                    className={`flex-1 min-w-[120px] p-4 rounded-xl border-2 text-center transition-all ${
                      settings.privacy.profileVisibility === value
                        ? 'border-primary bg-primary/5'
                        : 'border-border hover:border-gray-300'
                    }`}
                  >
                    <Icon className={`w-5 h-5 mx-auto mb-2 ${
                      settings.privacy.profileVisibility === value ? 'text-primary' : 'text-text-secondary'
                    }`} />
                    <p className={`font-medium text-sm ${settings.privacy.profileVisibility === value ? 'text-text' : 'text-text-secondary'}`}>
                      {label}
                    </p>
                    <p className="text-xs text-text-secondary mt-1">{desc}</p>
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="mt-8 pt-6 border-t border-border flex flex-wrap gap-4">
          <Button
            variant="primary"
            onClick={() => settings && updateSettings(settings)}
            isLoading={isSaving}
            disabled={isSaving}
          >
            Save Settings
          </Button>
          <Button
            variant="outline"
            onClick={resetSettings}
            isLoading={isSaving}
            disabled={isSaving}
          >
            <RefreshCw className="w-4 h-4 mr-2" />
            Reset to Defaults
          </Button>
        </div>

        {/* Account */}
        <div className="mt-8 pt-6 border-t border-border">
          <h3 className="text-lg font-semibold text-text mb-2">Account</h3>
          <p className="text-sm text-text-secondary mb-4">
            Sign out of your Student Hub account on this device.
          </p>
          <Button
            variant="danger"
            onClick={handleLogout}
            isLoading={isLoggingOut}
            disabled={isLoggingOut}
          >
            <LogOut className="w-4 h-4 mr-2" />
            Log out
          </Button>
        </div>
      </div>
    </div>
  );
}