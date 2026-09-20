// Match type — matches the backend MatchSerializer.

import type { PublicUser, Interest } from './user';

export type Match = {
  id: string;
  matchedUser: PublicUser;
  sharedInterests: Interest[];
  lastMessage: LastMessage | null;
  matchedAt: string; // ISO 8601
  conversationId: string | null;
};

export type LastMessage = {
  id: string;
  conversationId: string;
  sender: PublicUser;
  content: string;
  readAt: string | null;
  sentAt: string;
};
