// Projects service — real API calls against the Rails backend.
//
// The API client (api.ts) converts camelCase → snake_case on the way
// out and snake_case → camelCase on the way in. We write idiomatic
// camelCase here and let the client handle the wire format.

import { api } from './api';
import type { Project, ProjectCategory, LookingFor } from '../types/project';

type ProjectListResponse = {
  projects: Project[];
  meta: {
    currentPage: number;
    perPage: number;
    totalCount: number;
    totalPages: number;
  };
};

type ProjectDetailResponse = { project: Project };

export type ListProjectsParams = {
  page?: number;
  perPage?: number;
  category?: ProjectCategory;
  ownerId?: string;
  q?: string;
};

export type CreateProjectPayload = {
  title: string;
  description?: string;
  category?: ProjectCategory;
  teamSize?: number;
  lookingFor?: LookingFor;
  githubUrl?: string;
  liveDemoUrl?: string;
  skillNames?: string[];
};

export type UpdateProjectPayload = Partial<CreateProjectPayload>;

function buildQuery(params: ListProjectsParams): string {
  const query = new URLSearchParams();
  if (params.page) query.set('page', String(params.page));
  if (params.perPage) query.set('per_page', String(params.perPage));
  if (params.category) query.set('category', params.category);
  if (params.ownerId) query.set('owner_id', params.ownerId);
  if (params.q) query.set('q', params.q);
  const qs = query.toString();
  return qs ? `?${qs}` : '';
}

export const projectsService = {
  async list(params: ListProjectsParams = {}): Promise<ProjectListResponse> {
    return api.get<ProjectListResponse>(`/projects${buildQuery(params)}`);
  },

  async get(id: string): Promise<Project> {
    const { project } = await api.get<ProjectDetailResponse>(`/projects/${id}`);
    return project;
  },

  async create(payload: CreateProjectPayload): Promise<Project> {
    const { project } = await api.post<ProjectDetailResponse>('/projects', {
      project: payload,
    });
    return project;
  },

  async update(id: string, payload: UpdateProjectPayload): Promise<Project> {
    const { project } = await api.patch<ProjectDetailResponse>(`/projects/${id}`, {
      project: payload,
    });
    return project;
  },

  async remove(id: string): Promise<void> {
    await api.delete<void>(`/projects/${id}`);
  },
};
