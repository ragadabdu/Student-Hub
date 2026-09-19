// Match type — matches the backend MatchSerializer.
//
// Backend reference: app/serializers/match_serializer.rb
//
// A match is normalized as one row per pair of users. The `matchedUser`
// is the OTHER user from the perspective of the requesting user — the
// backend computes it based on who is making the request.

import type { PublicUser, Interest } from './user';

export type Match = {
  id: string;
  matchedUser: PublicUser;
  sharedInterests: Interest[];
  lastMessage: LastMessage | null;
  matchedAt: string; // ISO 8601
};

export type LastMessage = {
  id: string;
  conversationId: string;
  sender: PublicUser;
  content: string;
  readAt: string | null;
  sentAt: string; // ISO 8601
};
