// Messaging types — match backend serializers.
//
// Backend reference:
//   ConversationSerializer (app/serializers/conversation_serializer.rb)
//   MessageSerializer (app/serializers/message_serializer.rb)

import type { PublicUser } from './user';

export type Message = {
  id: string;
  conversationId: string;
  sender: PublicUser;
  content: string;
  readAt: string | null;
  sentAt: string; // ISO 8601
};

export type Conversation = {
  id: string;
  matchId: string;
  otherUser: PublicUser;
  lastMessage: Message | null;
  unreadCount: number;
  createdAt: string; // ISO 8601
};
