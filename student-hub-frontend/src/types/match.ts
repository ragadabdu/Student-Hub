// Match type.
//
// NOTE: This is the OLD mock shape, retained so the existing matches page
// (MatchCard, MatchMessages, useMatches, services/matches) continues to
// compile. It will be replaced in Phase FI.5 when we integrate the matches
// page with the real backend.
//
// The real backend shape is:
//   { id, matchedUser: PublicUser, sharedInterests: Interest[],
//     lastMessage: LastMessage | null, matchedAt: ISO8601 }

export type Match = {
  id: string;
  userId: string;
  matchedUserId: string;
  matchedUser: {
    name: string;
    avatarUrl: string;
    major: string;
    university: string;
  };
  sharedInterests: string[];
  matchedAt: Date;
  lastMessage?: {
    preview: string;
    sentAt: Date;
  };
};
