import type { Conversation, Message } from '../types/message';

// Mock conversations data
const mockConversations: Conversation[] = [
  {
    id: 'conv1',
    participants: [
      { id: '1', name: 'You', avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=you' },
      { id: '2', name: 'Maya Patel', avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=maya' },
    ],
    messages: [
      {
        id: 'msg1',
        conversationId: 'conv1',
        senderId: '2',
        content: 'Hey! Great to match with you!',
        sentAt: new Date('2024-03-15T10:30:00'),
      },
      {
        id: 'msg2',
        conversationId: 'conv1',
        senderId: '1',
        content: 'Hey! Likewise! I saw you\'re working on AI projects.',
        sentAt: new Date('2024-03-15T10:32:00'),
      },
      {
        id: 'msg3',
        conversationId: 'conv1',
        senderId: '2',
        content: 'Yeah! I\'m building an AI study assistant. Want to collaborate?',
        sentAt: new Date('2024-03-15T10:35:00'),
      },
      {
        id: 'msg4',
        conversationId: 'conv1',
        senderId: '1',
        content: 'That sounds amazing! I\'d love to help out.',
        sentAt: new Date('2024-03-15T10:40:00'),
      },
      {
        id: 'msg5',
        conversationId: 'conv1',
        senderId: '2',
        content: 'Perfect! Let\'s meet up this week to discuss.',
        sentAt: new Date('2024-03-15T10:42:00'),
      },
    ],
  },
  {
    id: 'conv2',
    participants: [
      { id: '1', name: 'You', avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=you' },
      { id: '3', name: 'Alex Kim', avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=alex' },
    ],
    messages: [
      {
        id: 'msg6',
        conversationId: 'conv2',
        senderId: '3',
        content: 'Hey! I saw you\'re interested in robotics projects.',
        sentAt: new Date('2024-03-12T09:00:00'),
      },
      {
        id: 'msg7',
        conversationId: 'conv2',
        senderId: '1',
        content: 'Yes! I\'ve been working on a robotics project for my engineering class.',
        sentAt: new Date('2024-03-12T09:05:00'),
      },
      {
        id: 'msg8',
        conversationId: 'conv2',
        senderId: '3',
        content: 'Can you review the latest design?',
        sentAt: new Date('2024-03-12T09:10:00'),
      },
    ],
  },
  {
    id: 'conv3',
    participants: [
      { id: '1', name: 'You', avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=you' },
      { id: '4', name: 'Sarah Johnson', avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=sarah' },
    ],
    messages: [
      {
        id: 'msg9',
        conversationId: 'conv3',
        senderId: '4',
        content: 'Looking forward to our study session!',
        sentAt: new Date('2024-03-06T10:30:00'),
      },
      {
        id: 'msg10',
        conversationId: 'conv3',
        senderId: '1',
        content: 'Me too! I\'ve been studying for the psychology exam.',
        sentAt: new Date('2024-03-06T10:35:00'),
      },
      {
        id: 'msg11',
        conversationId: 'conv3',
        senderId: '4',
        content: 'Great! Let\'s meet at the library at 2pm.',
        sentAt: new Date('2024-03-06T10:40:00'),
      },
    ],
  },
];

export const messagesService = {
  // Get all conversations for the current user
  getConversations: async (): Promise<Conversation[]> => {
    await new Promise(resolve => setTimeout(resolve, 500));
    return mockConversations;
  },

  // Get a specific conversation by ID
  getConversation: async (id: string): Promise<Conversation | null> => {
    await new Promise(resolve => setTimeout(resolve, 300));
    return mockConversations.find(c => c.id === id) || null;
  },

  // Send a message in a conversation
  sendMessage: async (conversationId: string, content: string): Promise<Message> => {
    await new Promise(resolve => setTimeout(resolve, 300));
    const conversation = mockConversations.find(c => c.id === conversationId);
    if (!conversation) {
      throw new Error('Conversation not found');
    }
    
    const newMessage: Message = {
      id: `msg${Date.now()}`,
      conversationId,
      senderId: '1', // Current user
      content,
      sentAt: new Date(),
    };
    
    conversation.messages.push(newMessage);
    return newMessage;
  },

  // Delete a message
  deleteMessage: async (messageId: string): Promise<{ success: boolean }> => {
    await new Promise(resolve => setTimeout(resolve, 300));
    // Find and remove the message
    for (const conv of mockConversations) {
      const index = conv.messages.findIndex(m => m.id === messageId);
      if (index !== -1) {
        conv.messages.splice(index, 1);
        return { success: true };
      }
    }
    return { success: false };
  },

  // Mark messages as read
  markAsRead: async (conversationId: string): Promise<{ success: boolean }> => {
    await new Promise(resolve => setTimeout(resolve, 200));
    const conversation = mockConversations.find(c => c.id === conversationId);
    if (conversation) {
      conversation.messages.forEach(msg => {
        if (msg.senderId !== '1') {
          msg.readAt = new Date();
        }
      });
    }
    return { success: true };
  },
};