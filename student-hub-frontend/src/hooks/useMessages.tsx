import { useState, useEffect, useCallback } from 'react';
import type { Conversation, Message } from '../types/message';
import { messagesService } from '../services/messages';

export function useMessages() {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedConversationId, setSelectedConversationId] = useState<string | null>(null);
  const [isSendingMessage, setIsSendingMessage] = useState(false);

  const loadConversations = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await messagesService.getConversations();
      setConversations(data);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load conversations';
      setError(errorMessage);
      console.error('Failed to load conversations:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadConversations();
  }, [loadConversations]);

  const selectConversation = useCallback((conversationId: string) => {
    setSelectedConversationId(conversationId);
    // Mark messages as read when selected
    messagesService.markAsRead(conversationId);
  }, []);

  const clearSelectedConversation = useCallback(() => {
    setSelectedConversationId(null);
  }, []);

  const getSelectedConversation = useCallback(() => {
    return conversations.find(c => c.id === selectedConversationId) || null;
  }, [conversations, selectedConversationId]);

  const sendMessage = useCallback(async (content: string) => {
    if (!selectedConversationId || !content.trim()) return false;
    
    setIsSendingMessage(true);
    try {
      const newMessage = await messagesService.sendMessage(selectedConversationId, content);
      
      // Update the conversation with the new message
      setConversations(prev => prev.map(conv => {
        if (conv.id === selectedConversationId) {
          return {
            ...conv,
            messages: [...conv.messages, newMessage],
          };
        }
        return conv;
      }));
      
      return true;
    } catch (err) {
      console.error('Failed to send message:', err);
      return false;
    } finally {
      setIsSendingMessage(false);
    }
  }, [selectedConversationId]);

  const getOtherParticipant = useCallback((conversation: Conversation) => {
    return conversation.participants.find(p => p.id !== '1') || conversation.participants[0];
  }, []);

  const formatLastMessageTime = useCallback((date: Date) => {
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(hours / 24);
    
    if (days > 7) {
      return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    } else if (days > 0) {
      return `${days}d`;
    } else if (hours > 0) {
      return `${hours}h`;
    } else {
      const mins = Math.floor(diff / (1000 * 60));
      return `${mins}m`;
    }
  }, []);

  return {
    conversations,
    isLoading,
    error,
    selectedConversationId,
    isSendingMessage,
    loadConversations,
    selectConversation,
    clearSelectedConversation,
    getSelectedConversation,
    sendMessage,
    getOtherParticipant,
    formatLastMessageTime,
    hasConversations: conversations.length > 0,
  };
}