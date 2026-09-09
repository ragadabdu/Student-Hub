import { describe, it, expect, vi, beforeEach, beforeAll } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { BrowserRouter } from 'react-router-dom';
import Matches from '../index';
import { matchesService } from '../../../services/matches';
import type { Match } from '../../../types/match';

// Mock scrollIntoView for JSDOM
beforeAll(() => {
  Element.prototype.scrollIntoView = vi.fn();
});

vi.mock('../../../services/matches', () => ({
  matchesService: {
    getMatches: vi.fn(),
    sendMessage: vi.fn(),
    unmatch: vi.fn(),
  },
}));

const mockMatches: Match[] = [
  {
    id: 'm1',
    userId: '1',
    matchedUserId: '2',
    matchedUser: {
      name: 'Maya Patel',
      avatarUrl: 'maya.jpg',
      major: 'Computer Science',
      university: 'UCLA',
    },
    sharedInterests: ['AI', 'Design'],
    matchedAt: new Date('2024-03-15'),
    lastMessage: {
      preview: 'Hey! Would love to work on a project.',
      sentAt: new Date('2024-03-16'),
    },
  },
  {
    id: 'm2',
    userId: '1',
    matchedUserId: '3',
    matchedUser: {
      name: 'Alex Kim',
      avatarUrl: 'alex.jpg',
      major: 'Engineering',
      university: 'UC Berkeley',
    },
    sharedInterests: ['Robotics'],
    matchedAt: new Date('2024-03-10'),
  },
];

describe('Matches Page', () => {
  const renderMatches = () => {
    return render(
      <BrowserRouter>
        <Matches />
      </BrowserRouter>
    );
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render loading state initially', () => {
    vi.mocked(matchesService.getMatches).mockImplementation(
      () => new Promise(() => {})
    );

    renderMatches();
    expect(screen.getByText('Loading your matches...')).toBeInTheDocument();
  });

  it('should render matches when loaded', async () => {
    vi.mocked(matchesService.getMatches).mockResolvedValue(mockMatches);

    renderMatches();

    await waitFor(() => {
      expect(screen.queryByText('Loading your matches...')).not.toBeInTheDocument();
    });

    expect(screen.getByText('Your Matches')).toBeInTheDocument();
    expect(screen.getByText('2 matches — connect and collaborate')).toBeInTheDocument();
    expect(screen.getByText('Maya Patel')).toBeInTheDocument();
    expect(screen.getByText('Alex Kim')).toBeInTheDocument();
  });

  it('should handle error state', async () => {
    vi.mocked(matchesService.getMatches).mockRejectedValue(
      new Error('Network error')
    );

    renderMatches();

    await waitFor(() => {
      expect(screen.getByText('Failed to load matches')).toBeInTheDocument();
      expect(screen.getByText('Network error')).toBeInTheDocument();
      expect(screen.getByText('Try Again')).toBeInTheDocument();
    });
  });

  it('should show empty state when no matches', async () => {
    vi.mocked(matchesService.getMatches).mockResolvedValue([]);

    renderMatches();

    await waitFor(() => {
      expect(screen.queryByText('Loading your matches...')).not.toBeInTheDocument();
    });

    expect(screen.getByText('No matches yet')).toBeInTheDocument();
    expect(screen.getByText('Find People')).toBeInTheDocument();
  });

  it('should select a match and show messages', async () => {
    const user = userEvent.setup();
    vi.mocked(matchesService.getMatches).mockResolvedValue(mockMatches);

    renderMatches();

    await waitFor(() => {
      expect(screen.queryByText('Loading your matches...')).not.toBeInTheDocument();
    });

    // Click on a match - use getAllByText and click the first one
    const matchElements = screen.getAllByText('Maya Patel');
    await user.click(matchElements[0]);

    // Should show the match's name in the messages view
    await waitFor(() => {
      // Look for the messages header by finding the header section
      // The messages header has a specific structure with "Back to matches" button on mobile
      // Find the messages container by looking for the text input
      const messageInput = screen.getByPlaceholderText('Type a message...');
      const messagesContainer = messageInput.closest('.flex.flex-col.h-full');
      expect(messagesContainer).toBeInTheDocument();
      
      // Check that the name appears in the messages header
      const headerName = messagesContainer?.querySelector('h4');
      expect(headerName).toHaveTextContent('Maya Patel');
      
      // Check that the major/university appears in the header
      const majorElement = messagesContainer?.querySelector('.text-xs.text-text-secondary');
      expect(majorElement).toHaveTextContent('Computer Science · UCLA');
    });
  });

  it('should send a message', async () => {
    const user = userEvent.setup();
    vi.mocked(matchesService.getMatches).mockResolvedValue(mockMatches);
    vi.mocked(matchesService.sendMessage).mockResolvedValue({ success: true });

    renderMatches();

    await waitFor(() => {
      expect(screen.queryByText('Loading your matches...')).not.toBeInTheDocument();
    });

    // Select a match
    const matchElements = screen.getAllByText('Maya Patel');
    await user.click(matchElements[0]);

    // Wait for messages to load
    await waitFor(() => {
      expect(screen.getByPlaceholderText('Type a message...')).toBeInTheDocument();
    });

    // Type and send a message
    const input = screen.getByPlaceholderText('Type a message...');
    await user.type(input, 'Hello!');
    
    // Find and click the send button - it has an svg child
    const buttons = screen.getAllByRole('button');
    // Find the button that contains the Send icon
    const sendButton = buttons.find(btn => {
      const svg = btn.querySelector('svg');
      return svg && svg.getAttribute('class')?.includes('lucide-send');
    });
    
    // If we found it, click it
    if (sendButton) {
      await user.click(sendButton);
    }

    expect(matchesService.sendMessage).toHaveBeenCalledWith('m1', 'Hello!');
  });

  it('should unmatch a user', async () => {
    const user = userEvent.setup();
    vi.mocked(matchesService.getMatches).mockResolvedValue(mockMatches);
    vi.mocked(matchesService.unmatch).mockResolvedValue({ success: true });

    renderMatches();

    await waitFor(() => {
      expect(screen.queryByText('Loading your matches...')).not.toBeInTheDocument();
    });

    // Find and click the unmatch button on the first match
    const unmatchButtons = screen.getAllByLabelText('Unmatch');
    await user.click(unmatchButtons[0]);

    expect(matchesService.unmatch).toHaveBeenCalledWith('m1');
  });

  it('should show "Select a match" placeholder when no match selected', async () => {
    vi.mocked(matchesService.getMatches).mockResolvedValue(mockMatches);

    renderMatches();

    await waitFor(() => {
      expect(screen.queryByText('Loading your matches...')).not.toBeInTheDocument();
    });

    // On desktop, the placeholder should be visible
    expect(screen.getByText('Select a match')).toBeInTheDocument();
    expect(screen.getByText('Choose a match from the list to start chatting')).toBeInTheDocument();
  });

  it('should go back to match list on mobile', async () => {
    const user = userEvent.setup();
    vi.mocked(matchesService.getMatches).mockResolvedValue(mockMatches);

    // Mock window.innerWidth for mobile
    Object.defineProperty(window, 'innerWidth', { value: 375, writable: true });

    renderMatches();

    await waitFor(() => {
      expect(screen.queryByText('Loading your matches...')).not.toBeInTheDocument();
    });

    // Click on a match
    const matchElements = screen.getAllByText('Maya Patel');
    await user.click(matchElements[0]);

    // Should show the back button
    await waitFor(() => {
      const backButton = screen.getByLabelText('Back to matches');
      expect(backButton).toBeInTheDocument();
    });

    // Click back
    const backButton = screen.getByLabelText('Back to matches');
    await user.click(backButton);

    // Should show the match list again
    expect(screen.getByText('Maya Patel')).toBeInTheDocument();
  });
});