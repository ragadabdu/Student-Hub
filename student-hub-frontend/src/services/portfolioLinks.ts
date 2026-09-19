// Portfolio links service.
//
// Backend reference:
//   POST   /me/portfolio_links       → create
//   DELETE /me/portfolio_links/:id   → delete own
//
// Portfolio links belong to the current user only. A user can add their
// own links (no profile_id needed — the backend scopes to current_user).

import { api } from './api';
import type { PortfolioLink, LinkType } from '../types/user';

export type CreatePortfolioLinkPayload = {
  linkType: LinkType;
  url: string;
  title?: string;
};

export const portfolioLinksService = {
  async create(payload: CreatePortfolioLinkPayload): Promise<PortfolioLink> {
    return api.post<PortfolioLink>('/me/portfolio_links', {
      portfolio_link: {
        link_type: payload.linkType,
        url: payload.url,
        title: payload.title,
      },
    });
  },

  async delete(id: string): Promise<void> {
    await api.delete<void>(`/me/portfolio_links/${id}`);
  },
};
