import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from 'react';
import { authService } from '../services/auth';
import {
  profilesService,
  type UpdateProfilePayload,
} from '../services/profiles';
import { interestsService } from '../services/interests';
import { skillsService } from '../services/skills';
import {
  portfolioLinksService,
  type CreatePortfolioLinkPayload,
} from '../services/portfolioLinks';
import type { CurrentUser, Profile } from '../types/user';

export type AuthContextType = {
  user: CurrentUser | null;
  profile: Profile | null;
  isAuthenticated: boolean;
  isLoading: boolean;

  // Auth lifecycle
  login: (email: string, password: string) => Promise<void>;
  register: (
    email: string,
    password: string,
    passwordConfirmation: string,
  ) => Promise<void>;
  logout: () => Promise<void>;
  refresh: () => Promise<void>;

  // Profile actions — these all update `profile` state so consumers
  // re-render with the fresh data.
  updateProfile: (payload: UpdateProfilePayload) => Promise<Profile>;
  replaceInterests: (names: string[]) => Promise<void>;
  replaceSkills: (names: string[]) => Promise<void>;
  createPortfolioLink: (payload: CreatePortfolioLinkPayload) => Promise<void>;
  deletePortfolioLink: (id: string) => Promise<void>;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<CurrentUser | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Hydrate session on mount.
  useEffect(() => {
    let cancelled = false;

    async function hydrate() {
      try {
        const { user: u } = await authService.me();
        if (cancelled) return;
        setUser(u);
        setProfile(u.profile ?? null);
      } catch {
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
    await authService.login({ email, password });
    const { user: full } = await authService.me();
    setUser(full);
    setProfile(full.profile ?? null);
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

  // ------------------------------------------------------------------
  // Profile actions
  // ------------------------------------------------------------------

  const updateProfile = useCallback(
    async (payload: UpdateProfilePayload) => {
      const updated = await profilesService.update(payload);
      setProfile(updated);
      // Also refresh `user.name` if it was updated, so the Sidebar etc.
      // reflect it immediately.
      if (payload.name !== undefined) {
        setUser((prev) => (prev ? { ...prev, name: updated.user.name } : prev));
      }
      return updated;
    },
    [],
  );

  const replaceInterests = useCallback(async (names: string[]) => {
    const interests = await interestsService.replace(names);
    setProfile((prev) => (prev ? { ...prev, interests } : prev));
  }, []);

  const replaceSkills = useCallback(async (names: string[]) => {
    const skills = await skillsService.replace(names);
    setProfile((prev) => (prev ? { ...prev, skills } : prev));
  }, []);

  const createPortfolioLink = useCallback(
    async (payload: CreatePortfolioLinkPayload) => {
      const link = await portfolioLinksService.create(payload);
      setProfile((prev) =>
        prev
          ? { ...prev, portfolioLinks: [...(prev.portfolioLinks ?? []), link] }
          : prev,
      );
    },
    [],
  );

  const deletePortfolioLink = useCallback(async (id: string) => {
    await portfolioLinksService.delete(id);
    setProfile((prev) =>
      prev
        ? {
            ...prev,
            portfolioLinks: (prev.portfolioLinks ?? []).filter(
              (l) => l.id !== id,
            ),
          }
        : prev,
    );
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
    updateProfile,
    replaceInterests,
    replaceSkills,
    createPortfolioLink,
    deletePortfolioLink,
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
