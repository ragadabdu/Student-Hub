export type Message = {
  id: string;
  conversationId: string;
  senderId: string;
  content: string;
  sentAt: Date;
  readAt?: Date;
};

export type Conversation = {
  id: string;
  participants: {
    id: string;
    name: string;
    avatarUrl: string;
  }[];
  lastMessage?: Message;
  messages: Message[];
};