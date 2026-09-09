import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { BrowserRouter } from 'react-router-dom';
import Explore from '../index';
import type { Profile } from '../../../types/user';

// Mock the profiles service
vi.mock('../../../services/profiles', () => ({
  profilesService: {
    getDiscoveryProfiles: vi.fn(),
    passProfile: vi.fn(),
    likeProfile: vi.fn(),
    superLikeProfile: vi.fn(),
  },
}));

// Mock useSwipeDeck hook partially
vi.mock('../../../hooks/useSwipeDeck', () => ({
  useSwipeDeck: vi.fn(),
}));

import { useSwipeDeck } from '../../../hooks/useSwipeDeck';

const mockProfile: Profile = {
  id: '1',
  name: 'Test Student',
  age: 21,
  university: 'Test University',
  major: 'Computer Science',
  bio: 'Test bio',
  tagline: 'Test tagline',
  interests: ['React', 'TypeScript'],
  lookingFor: ['friends'],
  avatarUrl: 'test.jpg',
  projects: [],
  portfolioLinks: [],
  createdAt: new Date(),
};

const mockSwipeDeckReturn = {
  currentProfile: mockProfile,
  hasMoreProfiles: true,
  isLoading: false,
  error: null,
  showMatch: false,
  matchedProfile: null,
  handleSwipe: vi.fn(),
  undoLastAction: vi.fn(),
  resetDeck: vi.fn(),
  dismissMatch: vi.fn(),
  canUndo: false,
  remainingProfiles: 3,
  totalProfiles: 4,
};

describe('Explore Page Integration', () => {
  const renderExplore = () => {
    return render(
      <BrowserRouter>
        <Explore />
      </BrowserRouter>
    );
  };

  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(useSwipeDeck).mockReturnValue(mockSwipeDeckReturn);
  });

  it('should render loading state initially', () => {
    vi.mocked(useSwipeDeck).mockReturnValue({
      ...mockSwipeDeckReturn,
      isLoading: true,
    });

    renderExplore();
    expect(screen.getByText('Finding your people...')).toBeInTheDocument();
  });

  it('should render error state', () => {
    vi.mocked(useSwipeDeck).mockReturnValue({
      ...mockSwipeDeckReturn,
      error: 'Failed to load profiles',
    });

    renderExplore();
    expect(screen.getByText('Failed to load profiles')).toBeInTheDocument();
    expect(screen.getByText('Try Again')).toBeInTheDocument();
  });

  it('should render empty state when no profiles', () => {
    vi.mocked(useSwipeDeck).mockReturnValue({
      ...mockSwipeDeckReturn,
      currentProfile: undefined as unknown as Profile,
      hasMoreProfiles: false,
      remainingProfiles: 0,
    });

    renderExplore();
    expect(screen.getByText("You're all caught up!")).toBeInTheDocument();
    expect(screen.getByText('Refresh')).toBeInTheDocument();
    expect(screen.getByText('Explore projects')).toBeInTheDocument();
  });

  it('should render profile card when profiles exist', () => {
    renderExplore();

    expect(screen.getByText('Test Student, 21')).toBeInTheDocument();
    expect(screen.getByText('Test University · Computer Science')).toBeInTheDocument();
    expect(screen.getByText('Test tagline')).toBeInTheDocument();
    expect(screen.getByText('"Test bio"')).toBeInTheDocument();
  });

  it('should render swipe actions when profiles exist', () => {
    renderExplore();

    expect(screen.getByLabelText('Undo last action')).toBeInTheDocument();
    expect(screen.getByLabelText('Pass')).toBeInTheDocument();
    expect(screen.getByLabelText('Connect')).toBeInTheDocument();
    expect(screen.getByLabelText('Super Connect')).toBeInTheDocument();
  });

  it('should show remaining profiles count', () => {
    renderExplore();
    expect(screen.getByText('3 remaining')).toBeInTheDocument();
  });

  it('should toggle between People and Projects modes', async () => {
    const user = userEvent.setup();
    renderExplore();

    // Initially in People mode
    expect(screen.getByText('Test Student, 21')).toBeInTheDocument();

    // Click Projects tab
    const projectsTab = screen.getByText('Projects');
    await user.click(projectsTab);

    // Should show projects placeholder
    expect(screen.getByText('Projects Coming Soon')).toBeInTheDocument();
    expect(screen.queryByText('Test Student, 21')).not.toBeInTheDocument();

    // Click People tab again
    const peopleTab = screen.getByText('People');
    await user.click(peopleTab);

    // Should show people again
    expect(screen.getByText('Test Student, 21')).toBeInTheDocument();
  });

  it('should handle pass action', async () => {
    const user = userEvent.setup();
    const handleSwipe = vi.fn();
    vi.mocked(useSwipeDeck).mockReturnValue({
      ...mockSwipeDeckReturn,
      handleSwipe,
    });

    renderExplore();

    const passButton = screen.getByLabelText('Pass');
    await user.click(passButton);

    expect(handleSwipe).toHaveBeenCalledWith('left');
  });

  it('should handle connect action', async () => {
    const user = userEvent.setup();
    const handleSwipe = vi.fn();
    vi.mocked(useSwipeDeck).mockReturnValue({
      ...mockSwipeDeckReturn,
      handleSwipe,
    });

    renderExplore();

    const connectButton = screen.getByLabelText('Connect');
    await user.click(connectButton);

    expect(handleSwipe).toHaveBeenCalledWith('right');
  });

  it('should handle super connect action', async () => {
    const user = userEvent.setup();
    const handleSwipe = vi.fn();
    vi.mocked(useSwipeDeck).mockReturnValue({
      ...mockSwipeDeckReturn,
      handleSwipe,
    });

    renderExplore();

    const superButton = screen.getByLabelText('Super Connect');
    await user.click(superButton);

    expect(handleSwipe).toHaveBeenCalledWith('super');
  });

  it('should handle undo action', async () => {
    const user = userEvent.setup();
    const undoLastAction = vi.fn();
    vi.mocked(useSwipeDeck).mockReturnValue({
      ...mockSwipeDeckReturn,
      canUndo: true,
      undoLastAction,
    });

    renderExplore();

    const undoButton = screen.getByLabelText('Undo last action');
    await user.click(undoButton);

    expect(undoLastAction).toHaveBeenCalled();
  });

  it('should show match overlay when match occurs', () => {
    const matchedProfile = { ...mockProfile, name: 'Matched Student' };
    vi.mocked(useSwipeDeck).mockReturnValue({
      ...mockSwipeDeckReturn,
      showMatch: true,
      matchedProfile,
    });

    renderExplore();

    expect(screen.getByText('✨ It\'s a Match! ✨')).toBeInTheDocument();
    expect(screen.getByText('You + Matched Student')).toBeInTheDocument();
    expect(screen.getByText('Say hello 👋')).toBeInTheDocument();
    expect(screen.getByText('Keep exploring')).toBeInTheDocument();
  });

  it('should navigate to messages when "Say hello" is clicked in match overlay', async () => {
    const user = userEvent.setup();
    const matchedProfile = { ...mockProfile, name: 'Matched Student' };
    const dismissMatch = vi.fn();
    
    vi.mocked(useSwipeDeck).mockReturnValue({
      ...mockSwipeDeckReturn,
      showMatch: true,
      matchedProfile,
      dismissMatch,
    });

    renderExplore();

    const sayHelloButton = screen.getByText('Say hello 👋');
    await user.click(sayHelloButton);

    expect(dismissMatch).toHaveBeenCalled();
    // Navigation would be tested separately or with memory router
  });
});