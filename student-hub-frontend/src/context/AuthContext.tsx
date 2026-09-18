import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from 'react';
import { authService } from '../services/auth';
import type { CurrentUser, Profile } from '../types/user';

// What the AuthContext exposes to consumers.
//
// `isLoading` is true until the initial /auth/me resolves. Components
// that need to know "is the user signed in?" should wait for
// isLoading === false before deciding.
export type AuthContextType = {
  user: CurrentUser | null;
  profile: Profile | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (
    email: string,
    password: string,
    passwordConfirmation: string,
  ) => Promise<void>;
  logout: () => Promise<void>;
  refresh: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<CurrentUser | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Initial load: try to hydrate the session from the backend.
  // If we have a session cookie, /auth/me returns the user; otherwise 401.
  useEffect(() => {
    let cancelled = false;

    async function hydrate() {
      try {
        const { user: u } = await authService.me();
        if (cancelled) return;
        setUser(u);
        setProfile(u.profile ?? null);
      } catch {
        // 401 = not signed in. Anything else also leaves us anonymous.
        if (cancelled) return;
        setUser(null);
        setProfile(null);
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    }

    hydrate();
    return () => {
      cancelled = true;
    };
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    const { user: u } = await authService.login({ email, password });
    // After login, fetch the full /me to get the profile too.
    const { user: full } = await authService.me();
    setUser(full);
    setProfile(full.profile ?? null);
    void u; // login response not needed beyond confirming success
  }, []);

  const register = useCallback(
    async (email: string, password: string, passwordConfirmation: string) => {
      await authService.register({ email, password, passwordConfirmation });
      const { user: full } = await authService.me();
      setUser(full);
      setProfile(full.profile ?? null);
    },
    [],
  );

  const logout = useCallback(async () => {
    try {
      await authService.logout();
    } finally {
      setUser(null);
      setProfile(null);
    }
  }, []);

  const refresh = useCallback(async () => {
    const { user: full } = await authService.me();
    setUser(full);
    setProfile(full.profile ?? null);
  }, []);

  const value: AuthContextType = {
    user,
    profile,
    isAuthenticated: user !== null,
    isLoading,
    login,
    register,
    logout,
    refresh,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
