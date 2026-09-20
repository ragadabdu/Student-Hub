import { useCallback, useEffect, useRef, useState } from 'react';
import { conversationsService } from '../services/conversations';
import type { Conversation, Message } from '../types/message';

const CONVERSATION_PAGE_SIZE = 20;
const MESSAGE_PAGE_SIZE = 30;

// ------------------------------------------------------------------
// Conversation list
// ------------------------------------------------------------------
export function useConversations() {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const { conversations: list } = await conversationsService.list({
        page: 1,
        perPage: CONVERSATION_PAGE_SIZE,
      });
      setConversations(list);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load conversations');
      setConversations([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  return { conversations, isLoading, error, reload: load };
}

// ------------------------------------------------------------------
// Single conversation with messages
// ------------------------------------------------------------------
export function useConversation(conversationId: string | null) {
  const [conversation, setConversation] = useState<Conversation | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSending, setIsSending] = useState(false);
  const [nextCursor, setNextCursor] = useState<string | null>(null);
  const [isLoadingMore, setIsLoadingMore] = useState(false);

  // Request token to ignore stale responses when switching conversations.
  const requestIdRef = useRef(0);

  // Load conversation on mount / when id changes.
  useEffect(() => {
    if (!conversationId) {
      setConversation(null);
      setMessages([]);
      setNextCursor(null);
      return;
    }

    const myId = ++requestIdRef.current;
    setIsLoading(true);
    setError(null);

    conversationsService
      .get(conversationId)
      .then(({ conversation: conv, messages: msgs }) => {
        if (myId !== requestIdRef.current) return;
        setConversation(conv);
        // Backend returns newest-first. We want to render oldest-first
        // in the chat, so reverse before setting.
        setMessages([...msgs].reverse());
        // The `get` endpoint doesn't return a cursor — subsequent pages
        // use listMessages with cursor.
        setNextCursor(null);
      })
      .catch((err) => {
        if (myId !== requestIdRef.current) return;
        setError(err instanceof Error ? err.message : 'Failed to load conversation');
        setConversation(null);
        setMessages([]);
      })
      .finally(() => {
        if (myId === requestIdRef.current) setIsLoading(false);
      });
  }, [conversationId]);

  const sendMessage = useCallback(
    async (content: string): Promise<boolean> => {
      if (!conversationId || !content.trim()) return false;

      setIsSending(true);
      try {
        const message = await conversationsService.sendMessage(
          conversationId,
          content.trim(),
        );
        setMessages((prev) => [...prev, message]);
        // Update conversation's lastMessage locally
        setConversation((prev) =>
          prev ? { ...prev, lastMessage: message } : prev,
        );
        return true;
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to send message');
        return false;
      } finally {
        setIsSending(false);
      }
    },
    [conversationId],
  );

  // Load older messages (paginate toward the top).
  const loadOlder = useCallback(async () => {
    if (!conversationId || isLoadingMore || !messages.length) return;

    // Cursor is the oldest message's `sentAt` + id. We use the backend's
    // opaque cursor format only when the backend gives us one — the `get`
    // endpoint doesn't, so we pass the oldest message's `sentAt:id`
    // through listMessages to page backward. Simpler: re-fetch page of
    // messages strictly older than the oldest we have, using limit only.
    //
    // NOTE: the backend expects an opaque base64 cursor. To get older
    // messages we need to start from the newest and walk forward, which
    // our initial `get` already covers (30 newest). Loading further back
    // requires the next_cursor from a listMessages call. To keep this
    // simple for MVP we skip loadOlder. If needed later, initial load
    // should call listMessages instead of get.
    setIsLoadingMore(true);
    try {
      await Promise.resolve();
      // Placeholder — see comment above.
    } finally {
      setIsLoadingMore(false);
    }
  }, [conversationId, isLoadingMore, messages.length]);

  return {
    conversation,
    messages,
    isLoading,
    error,
    isSending,
    hasMore: nextCursor !== null,
    isLoadingMore,
    sendMessage,
    loadOlder,
  };
}
