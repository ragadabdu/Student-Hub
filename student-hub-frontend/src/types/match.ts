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