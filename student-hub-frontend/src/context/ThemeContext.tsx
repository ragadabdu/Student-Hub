// Theme context — reads the theme from the user's settings and applies
// the `dark` class to <html> so Tailwind's `dark:` variants activate.
//
// The user's choice lives in the backend (settings.preferences.theme).
// We hydrate it once from /me/settings on app load and keep it in sync
// when the Settings page updates it.
//
// Three modes:
//   - 'light'  → no `dark` class
//   - 'dark'   → `dark` class always
//   - 'system' → follows prefers-color-scheme, updates on OS change

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from 'react';
import { settingsService, type Theme } from '../services/settings';

type ThemeContextType = {
  theme: Theme;
  // Resolved theme (what's actually applied right now).
  // 'system' resolves to 'light' or 'dark' based on OS preference.
  resolvedTheme: 'light' | 'dark';
  // Set the theme locally AND persist it to the backend.
  setTheme: (theme: Theme) => Promise<void>;
  // Are we still hydrating from the backend?
  isLoading: boolean;
};

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

const MEDIA_QUERY = '(prefers-color-scheme: dark)';

function getSystemTheme(): 'light' | 'dark' {
  if (typeof window === 'undefined') return 'light';
  return window.matchMedia(MEDIA_QUERY).matches ? 'dark' : 'light';
}

function applyTheme(theme: Theme): 'light' | 'dark' {
  const resolved = theme === 'system' ? getSystemTheme() : theme;
  const root = document.documentElement;
  if (resolved === 'dark') {
    root.classList.add('dark');
  } else {
    root.classList.remove('dark');
  }
  return resolved;
}

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setThemeState] = useState<Theme>('system');
  const [resolvedTheme, setResolvedTheme] = useState<'light' | 'dark'>(() =>
    getSystemTheme(),
  );
  const [isLoading, setIsLoading] = useState(true);

  // Hydrate the user's chosen theme from the backend once.
  useEffect(() => {
    let cancelled = false;

    (async () => {
      try {
        const settings = await settingsService.get();
        if (cancelled) return;
        setThemeState(settings.preferences.theme);
        setResolvedTheme(applyTheme(settings.preferences.theme));
      } catch {
        // Not signed in or request failed — keep the default 'system'.
        if (!cancelled) {
          setResolvedTheme(applyTheme('system'));
        }
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  // When theme is 'system', listen for OS changes and reapply.
  useEffect(() => {
    if (theme !== 'system') return;

    const media = window.matchMedia(MEDIA_QUERY);
    const handler = () => {
      setResolvedTheme(applyTheme('system'));
    };

    media.addEventListener('change', handler);
    return () => media.removeEventListener('change', handler);
  }, [theme]);

  const setTheme = useCallback(async (next: Theme) => {
    // Apply locally first (instant feedback).
    setThemeState(next);
    setResolvedTheme(applyTheme(next));

    // Then persist. If it fails, we keep the local change — the next
    // page load will revert it. This is an acceptable tradeoff for
    // a non-critical preference.
    try {
      await settingsService.update({ preferences: { theme: next } });
    } catch (err) {
      console.error('Failed to persist theme:', err);
    }
  }, []);

  return (
    <ThemeContext.Provider value={{ theme, resolvedTheme, setTheme, isLoading }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (ctx === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return ctx;
}
