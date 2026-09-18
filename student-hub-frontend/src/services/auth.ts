// Auth endpoints for the Student Hub backend.
//
// Backend reference (see docs/api.md):
//   POST   /auth/register  → { user }
//   POST   /auth/login     → { user }
//   DELETE /auth/logout    → 204
//   GET    /auth/me        → { user } with profile
//
// The API client (api.ts) handles cookies, CSRF, and case conversion.

import { api } from './api';
import type { CurrentUser, Profile } from '../types/user';

// /auth/me includes a nested profile; other auth endpoints don't.
type MeResponse = { user: CurrentUser & { profile: Profile } };
type AuthResponse = { user: CurrentUser };

export const authService = {
  async register(params: {
    email: string;
    password: string;
    passwordConfirmation: string;
  }): Promise<AuthResponse> {
    return api.post<AuthResponse>('/auth/register', {
      user: {
        email: params.email,
        password: params.password,
        password_confirmation: params.passwordConfirmation,
      },
    });
  },

  async login(params: { email: string; password: string }): Promise<AuthResponse> {
    return api.post<AuthResponse>('/auth/login', {
      user: {
        email: params.email,
        password: params.password,
      },
    });
  },

  async logout(): Promise<void> {
    await api.delete<void>('/auth/logout');
  },

  async me(): Promise<MeResponse> {
    return api.get<MeResponse>('/auth/me');
  },
};
