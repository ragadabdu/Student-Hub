// Discovery service — the swipe deck and its actions.
//
// Backend reference (see docs/api.md):
//   GET  /discovery                    → paginated profiles to discover
//   POST /discovery/:user_id/pass
//   POST /discovery/:user_id/connect         (may create a match)
//   POST /discovery/:user_id/super_connect
//
// The API client converts snake_case → camelCase, so `match_created`
// arrives as `matchCreated`.
//
// Note: the `match` field in the action response is intentionally typed
// as `unknown`. Discovery only checks `matchCreated`. The full match
// object will be properly typed in Phase FI.5 (matches integration).

import { api } from './api';
import type { Profile } from '../types/user';

type DiscoveryListResponse = {
  profiles: Profile[];
  meta: {
    currentPage: number;
    perPage: number;
    totalCount: number;
    totalPages: number;
  };
};

type ActionResponse = {
  connection: {
    id: string;
    userId: string;
    targetUserId: string;
    status: 'pass' | 'connect' | 'super_connect';
    createdAt: string;
    updatedAt: string;
  };
  matchCreated: boolean;
  match?: unknown | null;
};

export const discoveryService = {
  async getProfiles(params?: {
    page?: number;
    perPage?: number;
  }): Promise<DiscoveryListResponse> {
    const query = new URLSearchParams();
    if (params?.page) query.set('page', String(params.page));
    if (params?.perPage) query.set('per_page', String(params.perPage));
    const qs = query.toString();

    return api.get<DiscoveryListResponse>(`/discovery${qs ? `?${qs}` : ''}`);
  },

  async pass(userId: string): Promise<ActionResponse> {
    return api.post<ActionResponse>(`/discovery/${userId}/pass`);
  },

  async connect(userId: string): Promise<ActionResponse> {
    return api.post<ActionResponse>(`/discovery/${userId}/connect`);
  },

  async superConnect(userId: string): Promise<ActionResponse> {
    return api.post<ActionResponse>(`/discovery/${userId}/super_connect`);
  },
};
