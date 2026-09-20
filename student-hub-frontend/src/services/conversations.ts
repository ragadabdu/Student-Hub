// Conversations + messages service.
//
// Backend reference:
//   GET    /conversations                          → paginated list
//   GET    /conversations/:id                      → one + recent messages (marks read)
//   GET    /conversations/:id/messages?cursor=&limit=  → cursor-paginated messages
//   POST   /conversations/:id/messages             → send
//   DELETE /conversations/:id/messages/:message_id → delete own message
//
// The API client converts snake_case → camelCase on the way in and
// camelCase → snake_case on the way out.

import { api } from './api';
import type { Conversation, Message } from '../types/message';

type ConversationListResponse = {
  conversations: Conversation[];
  meta: {
    currentPage: number;
    perPage: number;
    totalCount: number;
    totalPages: number;
  };
};

type ConversationDetailResponse = {
  conversation: Conversation;
  messages: Message[];
};

type MessageListResponse = {
  messages: Message[];
  nextCursor: string | null;
  hasMore: boolean;
};

type MessageResponse = { message: Message };

export const conversationsService = {
  async list(params?: {
    page?: number;
    perPage?: number;
  }): Promise<ConversationListResponse> {
    const query = new URLSearchParams();
    if (params?.page) query.set('page', String(params.page));
    if (params?.perPage) query.set('per_page', String(params.perPage));
    const qs = query.toString();

    return api.get<ConversationListResponse>(
      `/conversations${qs ? `?${qs}` : ''}`,
    );
  },

  async get(id: string): Promise<ConversationDetailResponse> {
    return api.get<ConversationDetailResponse>(`/conversations/${id}`);
  },

  async listMessages(
    conversationId: string,
    params?: { cursor?: string; limit?: number },
  ): Promise<MessageListResponse> {
    const query = new URLSearchParams();
    if (params?.cursor) query.set('cursor', params.cursor);
    if (params?.limit) query.set('limit', String(params.limit));
    const qs = query.toString();

    return api.get<MessageListResponse>(
      `/conversations/${conversationId}/messages${qs ? `?${qs}` : ''}`,
    );
  },

  async sendMessage(
    conversationId: string,
    content: string,
  ): Promise<Message> {
    const { message } = await api.post<MessageResponse>(
      `/conversations/${conversationId}/messages`,
      { message: { content } },
    );
    return message;
  },

  async deleteMessage(
    conversationId: string,
    messageId: string,
  ): Promise<void> {
    await api.delete<void>(
      `/conversations/${conversationId}/messages/${messageId}`,
    );
  },
};
