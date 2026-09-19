// Matches service — real API calls.
//
// Backend reference:
//   GET    /matches              → paginated list
//   GET    /matches/:id          → one match
//   DELETE /matches/:id          → unmatch (destroys the match)
//
// The API client converts snake_case → camelCase.

import { api } from './api';
import type { Match } from '../types/match';

type MatchListResponse = {
  matches: Match[];
  meta: {
    currentPage: number;
    perPage: number;
    totalCount: number;
    totalPages: number;
  };
};

type MatchDetailResponse = { match: Match };

export const matchesService = {
  async list(params?: {
    page?: number;
    perPage?: number;
  }): Promise<MatchListResponse> {
    const query = new URLSearchParams();
    if (params?.page) query.set('page', String(params.page));
    if (params?.perPage) query.set('per_page', String(params.perPage));
    const qs = query.toString();

    return api.get<MatchListResponse>(`/matches${qs ? `?${qs}` : ''}`);
  },

  async get(id: string): Promise<Match> {
    const { match } = await api.get<MatchDetailResponse>(`/matches/${id}`);
    return match;
  },

  async unmatch(id: string): Promise<void> {
    await api.delete<void>(`/matches/${id}`);
  },
};
