import { describe, it, expect, vi, beforeEach, beforeAll } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { BrowserRouter } from 'react-router-dom';
import Messages from '../index';
import { messagesService } from '../../../services/messages';
import type { Conversation } from '../../../types/message';

// Mock scrollIntoView for JSDOM
beforeAll(() => {
  Element.prototype.scrollIntoView = vi.fn();
});

vi.mock('../../../services/messages', () => ({
  messagesService: {
    getConversations: vi.fn(),
    sendMessage: vi.fn(),
    markAsRead: vi.fn(),
  },
}));

const mockConversations: Conversation[] = [
  {
    id: 'conv1',
    participants: [
      { id: '1', name: 'You', avatarUrl: 'you.jpg' },
      { id: '2', name: 'Maya Patel', avatarUrl: 'maya.jpg' },
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
        content: 'Hey! Likewise!',
        sentAt: new Date('2024-03-15T10:32:00'),
      },
    ],
  },
  {
    id: 'conv2',
    participants: [
      { id: '1', name: 'You', avatarUrl: 'you.jpg' },
      { id: '3', name: 'Alex Kim', avatarUrl: 'alex.jpg' },
    ],
    messages: [
      {
        id: 'msg3',
        conversationId: 'conv2',
        senderId: '3',
        content: 'Hey! Can you review the design?',
        sentAt: new Date('2024-03-12T09:00:00'),
      },
    ],
  },
];

describe('Messages Page', () => {
  const renderMessages = () => {
    return render(
      <BrowserRouter>
        <Messages />
      </BrowserRouter>
    );
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render loading state initially', () => {
    vi.mocked(messagesService.getConversations).mockImplementation(
      () => new Promise(() => {})
    );

    renderMessages();
    expect(screen.getByText('Loading messages...')).toBeInTheDocument();
  });

  it('should render conversations when loaded', async () => {
    vi.mocked(messagesService.getConversations).mockResolvedValue(mockConversations);

    renderMessages();

    await waitFor(() => {
      expect(screen.queryByText('Loading messages...')).not.toBeInTheDocument();
    });

    // "Messages" appears twice (page heading + list heading)
    const messagesHeadings = screen.getAllByText('Messages');
    expect(messagesHeadings.length).toBe(2);
    
    // "2 conversations" appears twice (page + list)
    const conversationCounts = screen.getAllByText(/2 conversations?/i);
    expect(conversationCounts.length).toBe(2);
    
    // Check for names - using getAllByText since they might appear in multiple places
    const mayaElements = screen.getAllByText('Maya Patel');
    expect(mayaElements.length).toBeGreaterThan(0);
    
    const alexElements = screen.getAllByText('Alex Kim');
    expect(alexElements.length).toBeGreaterThan(0);
  });

  it('should handle error state', async () => {
    vi.mocked(messagesService.getConversations).mockRejectedValue(
      new Error('Network error')
    );

    renderMessages();

    await waitFor(() => {
      expect(screen.getByText('Failed to load messages')).toBeInTheDocument();
      expect(screen.getByText('Network error')).toBeInTheDocument();
      expect(screen.getByText('Try Again')).toBeInTheDocument();
    });
  });

  it('should show empty state when no conversations', async () => {
    vi.mocked(messagesService.getConversations).mockResolvedValue([]);

    renderMessages();

    await waitFor(() => {
      expect(screen.queryByText('Loading messages...')).not.toBeInTheDocument();
    });

    expect(screen.getByText('No messages yet')).toBeInTheDocument();
    expect(screen.getByText('Find People')).toBeInTheDocument();
  });

  it('should select a conversation and show messages', async () => {
    const user = userEvent.setup();
    vi.mocked(messagesService.getConversations).mockResolvedValue(mockConversations);

    renderMessages();

    await waitFor(() => {
      expect(screen.queryByText('Loading messages...')).not.toBeInTheDocument();
    });

    // Click on a conversation
    const conversationElements = screen.getAllByText('Maya Patel');
    await user.click(conversationElements[0]);

    // Should show the conversation in the chat window
    await waitFor(() => {
      // Look for the chat header
      const chatHeader = screen.getByRole('heading', { name: 'Maya Patel', level: 4 });
      expect(chatHeader).toBeInTheDocument();
      expect(screen.getByText('Hey! Great to match with you!')).toBeInTheDocument();
      expect(screen.getByText('Hey! Likewise!')).toBeInTheDocument();
    });
  });

  it('should send a message', async () => {
    const user = userEvent.setup();
    vi.mocked(messagesService.getConversations).mockResolvedValue(mockConversations);
    vi.mocked(messagesService.sendMessage).mockResolvedValue({
      id: 'msg4',
      conversationId: 'conv1',
      senderId: '1',
      content: 'Hello!',
      sentAt: new Date(),
    });

    renderMessages();

    await waitFor(() => {
      expect(screen.queryByText('Loading messages...')).not.toBeInTheDocument();
    });

    // Select a conversation
    const conversationElements = screen.getAllByText('Maya Patel');
    await user.click(conversationElements[0]);

    // Wait for chat to load
    await waitFor(() => {
      expect(screen.getByPlaceholderText('Type a message...')).toBeInTheDocument();
    });

    // Type and send a message
    const input = screen.getByPlaceholderText('Type a message...');
    await user.type(input, 'Hello!');
    
    // Find and click the send button
    const buttons = screen.getAllByRole('button');
    const sendButton = buttons.find(btn => {
      const svg = btn.querySelector('svg');
      return svg && svg.getAttribute('class')?.includes('lucide-send');
    });
    
    if (sendButton) {
      await user.click(sendButton);
    }

    expect(messagesService.sendMessage).toHaveBeenCalledWith('conv1', 'Hello!');
  });

  it('should show "Select a conversation" placeholder when no conversation selected', async () => {
    vi.mocked(messagesService.getConversations).mockResolvedValue(mockConversations);

    renderMessages();

    await waitFor(() => {
      expect(screen.queryByText('Loading messages...')).not.toBeInTheDocument();
    });

    expect(screen.getByText('Select a conversation')).toBeInTheDocument();
    expect(screen.getByText('Choose a conversation from the list to start chatting')).toBeInTheDocument();
  });

  it('should go back to conversation list on mobile', async () => {
    const user = userEvent.setup();
    vi.mocked(messagesService.getConversations).mockResolvedValue(mockConversations);

    // Mock window.innerWidth for mobile
    Object.defineProperty(window, 'innerWidth', { value: 375, writable: true });

    renderMessages();

    await waitFor(() => {
      expect(screen.queryByText('Loading messages...')).not.toBeInTheDocument();
    });

    // Click on a conversation
    const conversationElements = screen.getAllByText('Maya Patel');
    await user.click(conversationElements[0]);

    // Should show the back button
    await waitFor(() => {
      const backButton = screen.getByLabelText('Back to conversations');
      expect(backButton).toBeInTheDocument();
    });

    // Click back
    const backButton = screen.getByLabelText('Back to conversations');
    await user.click(backButton);

    // Should show the conversation list again
    expect(screen.getByText('Maya Patel')).toBeInTheDocument();
  });

  it('should show unread indicator', async () => {
    const conversationsWithUnread = [
      {
        ...mockConversations[0],
        messages: [
          ...mockConversations[0].messages,
          {
            id: 'msg3',
            conversationId: 'conv1',
            senderId: '2',
            content: 'This is unread!',
            sentAt: new Date(),
            readAt: undefined,
          },
        ],
      },
      mockConversations[1],
    ];
    vi.mocked(messagesService.getConversations).mockResolvedValue(conversationsWithUnread);

    renderMessages();

    await waitFor(() => {
      expect(screen.queryByText('Loading messages...')).not.toBeInTheDocument();
    });

    // Should show unread indicator (the message should be bold)
    const unreadMessage = screen.getByText('This is unread!');
    expect(unreadMessage).toBeInTheDocument();
    // The parent should have font-medium class
    const parent = unreadMessage.closest('p');
    expect(parent).toHaveClass('font-medium');
  });
});