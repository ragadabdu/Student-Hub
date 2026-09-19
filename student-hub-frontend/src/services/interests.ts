// Interests service.
//
// Backend reference:
//   PUT /me/interests  → replace the current user's interests
//
// Accepts an array of names. The backend matches existing interests
// case-insensitively, creates custom ones for unknown names, and
// garbage-collects orphaned custom interests.

import { api } from './api';
import type { Interest } from '../types/user';

type InterestsResponse = { interests: Interest[] };

export const interestsService = {
  async replace(names: string[]): Promise<Interest[]> {
    const { interests } = await api.put<InterestsResponse>('/me/interests', {
      interests: names,
    });
    return interests;
  },
};
