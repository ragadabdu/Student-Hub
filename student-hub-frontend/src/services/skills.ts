// Skills service.
//
// Backend reference:
//   PUT /me/skills  → replace the current user's skills
//
// Same semantics as interests: full replace, case-insensitive dedupe,
// custom skill creation, orphan garbage collection.

import { api } from './api';
import type { Skill } from '../types/user';

type SkillsResponse = { skills: Skill[] };

export const skillsService = {
  async replace(names: string[]): Promise<Skill[]> {
    const { skills } = await api.put<SkillsResponse>('/me/skills', {
      skills: names,
    });
    return skills;
  },
};
