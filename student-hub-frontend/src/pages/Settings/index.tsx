import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSettings } from '../../hooks/useSettings';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { LoadingState } from '../../components/ui/LoadingState/LoadingState';
import { Button } from '../../components/ui/Button/Button';
import {
  AlertCircle,
  Moon,
  Sun,
  Monitor,
  Globe,
  Eye,
  Bell,
  Mail,
  Shield,
  LogOut,
} from 'lucide-react';

type SectionId = 'preferences' | 'notifications' | 'privacy';

export default function Settings() {
  const { settings, isLoading, error, transientError, update, reload } = useSettings();
  const { theme, setTheme } = useTheme();
  const navigate = useNavigate();
  const { logout } = useAuth();

  const [activeSection, setActiveSection] = useState<SectionId>('preferences');
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
          <h3 className="text-xl font-semibold text-text mb-2">
            Failed to load settings
          </h3>
          <p className="text-text-secondary mb-4">{error}</p>
          <Button onClick={reload}>Try Again</Button>
        </div>
      </div>
    );
  }

  if (!settings) return null;

  const sections: { id: SectionId; label: string; icon: typeof Globe }[] = [
    { id: 'preferences', label: 'Preferences', icon: Globe },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'privacy', label: 'Privacy', icon: Shield },
  ];

  return (
    <div className="p-4 md:p-6 max-w-4xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl md:text-4xl font-bold text-navy">Settings</h1>
        <p className="text-text-secondary mt-1">
          Manage your preferences and account settings
        </p>
      </div>

      {transientError && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-center gap-3 mb-6">
          <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0" />
          <p className="text-red-700 font-medium text-sm">{transientError}</p>
        </div>
      )}

      {/* Section Tabs */}
      <div className="flex gap-2 bg-gray-100 p-1 rounded-xl w-fit mb-6 overflow-x-auto">
        {sections.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            onClick={() => setActiveSection(id)}
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

      <div className="bg-white rounded-2xl shadow-sm border border-border p-6 md:p-8">
        {/* Preferences */}
        {activeSection === 'preferences' && (
          <div className="space-y-6">
            <h3 className="text-lg font-semibold text-text">Preferences</h3>

            {/* Theme */}
            <div>
              <label className="block text-sm font-medium text-text-secondary mb-2">
                Theme
              </label>
              <div className="flex gap-3 flex-wrap">
                {[
                  { value: 'light' as const, label: 'Light', icon: Sun },
                  { value: 'dark' as const, label: 'Dark', icon: Moon },
                  { value: 'system' as const, label: 'System', icon: Monitor },
                ].map(({ value, label, icon: Icon }) => (
                  <button
                    key={value}
                    onClick={() => setTheme(value)}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg border-2 transition-all ${
                      theme === value
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
                onChange={(e) => update({ preferences: { language: e.target.value } })}
                className="w-full max-w-xs px-4 py-2 rounded-lg border border-border focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-colors bg-white"
              >
                <option value="en">English</option>
                <option value="es">Spanish</option>
                <option value="fr">French</option>
                <option value="ar">Arabic</option>
                <option value="zh">Chinese</option>
              </select>
            </div>

            {/* Discovery Radius */}
            <div>
              <label htmlFor="radius" className="block text-sm font-medium text-text-secondary mb-2">
                Discovery Radius: {settings.preferences.discoveryRadius} km
              </label>
              <input
                id="radius"
                type="range"
                min="1"
                max="500"
                step="5"
                value={settings.preferences.discoveryRadius}
                onChange={(e) =>
                  update({ preferences: { discoveryRadius: parseInt(e.target.value) } })
                }
                className="w-full max-w-md accent-primary"
              />
              <div className="flex justify-between text-xs text-text-secondary max-w-md">
                <span>1 km</span>
                <span>250 km</span>
                <span>500 km</span>
              </div>
            </div>
          </div>
        )}

        {/* Notifications */}
        {activeSection === 'notifications' && (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-text">Notification Settings</h3>
            <p className="text-sm text-text-secondary">
              Control how you receive notifications
            </p>

            <div className="space-y-4 mt-4">
              {[
                { key: 'email' as const, label: 'Email Notifications', icon: Mail, desc: 'Receive notifications via email' },
                { key: 'push' as const, label: 'Push Notifications', icon: Bell, desc: 'Receive push notifications on your device' },
              ].map(({ key, label, icon: Icon, desc }) => (
                <ToggleRow
                  key={key}
                  icon={Icon}
                  label={label}
                  description={desc}
                  checked={settings.notifications[key]}
                  onChange={(v) => update({ notifications: { [key]: v } })}
                />
              ))}
            </div>

            <div className="mt-6 pt-4 border-t border-border">
              <h4 className="text-sm font-medium text-text mb-3">Notify me about</h4>
              <div className="space-y-3">
                {[
                  { key: 'matches' as const, label: 'New matches' },
                  { key: 'messages' as const, label: 'New messages' },
                  { key: 'projectUpdates' as const, label: 'Project updates' },
                ].map(({ key, label }) => (
                  <div key={key} className="flex items-center justify-between">
                    <span className="text-sm text-text-secondary">{label}</span>
                    <SmallToggle
                      checked={settings.notifications[key]}
                      onChange={(v) => update({ notifications: { [key]: v } })}
                      ariaLabel={`Toggle ${label}`}
                    />
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Privacy */}
        {activeSection === 'privacy' && (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-text">Privacy Settings</h3>
            <p className="text-sm text-text-secondary">
              Control your privacy and visibility
            </p>

            <div className="space-y-4 mt-4">
              {[
                { key: 'showOnlineStatus' as const, label: 'Show online status', desc: "Let others see when you're active" },
                { key: 'showLastActive' as const, label: 'Show last active time', desc: 'Display when you were last active' },
                { key: 'showOnExplore' as const, label: 'Show me on Explore', desc: "Appear in other students' discovery feed" },
              ].map(({ key, label, desc }) => (
                <ToggleRow
                  key={key}
                  label={label}
                  description={desc}
                  checked={settings.privacy[key]}
                  onChange={(v) => update({ privacy: { [key]: v } })}
                />
              ))}
            </div>

            <div className="pt-4 border-t border-border">
              <label className="block text-sm font-medium text-text-secondary mb-2">
                Profile Visibility
              </label>
              <div className="flex flex-wrap gap-3">
                {[
                  { value: 'public_profile' as const, label: 'Public', icon: Eye, desc: 'Visible to everyone' },
                  { value: 'private_profile' as const, label: 'Private', icon: Shield, desc: 'Only visible to you' },
                ].map(({ value, label, icon: Icon, desc }) => (
                  <button
                    key={value}
                    onClick={() => update({ privacy: { profileVisibility: value } })}
                    className={`flex-1 min-w-[140px] p-4 rounded-xl border-2 text-center transition-all ${
                      settings.privacy.profileVisibility === value
                        ? 'border-primary bg-primary/5'
                        : 'border-border hover:border-gray-300'
                    }`}
                  >
                    <Icon
                      className={`w-5 h-5 mx-auto mb-2 ${
                        settings.privacy.profileVisibility === value
                          ? 'text-primary'
                          : 'text-text-secondary'
                      }`}
                    />
                    <p
                      className={`font-medium text-sm ${
                        settings.privacy.profileVisibility === value
                          ? 'text-text'
                          : 'text-text-secondary'
                      }`}
                    >
                      {label}
                    </p>
                    <p className="text-xs text-text-secondary mt-1">{desc}</p>
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

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

// ----------------------------------------------------------------------
// Small presentational helpers
// ----------------------------------------------------------------------

function ToggleRow({
  icon: Icon,
  label,
  description,
  checked,
  onChange,
}: {
  icon?: typeof Mail;
  label: string;
  description?: string;
  checked: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <div className="flex items-center justify-between py-3 border-b border-border last:border-0">
      <div className="flex items-center gap-3">
        {Icon && <Icon className="w-5 h-5 text-text-secondary flex-shrink-0" />}
        <div>
          <p className="font-medium text-text">{label}</p>
          {description && (
            <p className="text-sm text-text-secondary">{description}</p>
          )}
        </div>
      </div>
      <BigToggle checked={checked} onChange={onChange} ariaLabel={`Toggle ${label}`} />
    </div>
  );
}

function BigToggle({
  checked,
  onChange,
  ariaLabel,
}: {
  checked: boolean;
  onChange: (v: boolean) => void;
  ariaLabel: string;
}) {
  return (
    <button
      onClick={() => onChange(!checked)}
      className={`relative w-12 h-6 rounded-full transition-colors flex-shrink-0 ${
        checked ? 'bg-primary' : 'bg-gray-300'
      }`}
      aria-label={ariaLabel}
      aria-checked={checked}
      role="switch"
    >
      <span
        className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full transition-transform ${
          checked ? 'translate-x-6' : ''
        }`}
      />
    </button>
  );
}

function SmallToggle({
  checked,
  onChange,
  ariaLabel,
}: {
  checked: boolean;
  onChange: (v: boolean) => void;
  ariaLabel: string;
}) {
  return (
    <button
      onClick={() => onChange(!checked)}
      className={`relative w-10 h-5 rounded-full transition-colors flex-shrink-0 ${
        checked ? 'bg-primary' : 'bg-gray-300'
      }`}
      aria-label={ariaLabel}
      aria-checked={checked}
      role="switch"
    >
      <span
        className={`absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full transition-transform ${
          checked ? 'translate-x-5' : ''
        }`}
      />
    </button>
  );
}