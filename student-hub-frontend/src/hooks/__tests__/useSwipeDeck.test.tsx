import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act, waitFor } from '@testing-library/react';
import { useSwipeDeck } from '../useSwipeDeck';
import { profilesService } from '../../services/profiles';
import type { Profile } from '../../types/user';

// Mock the profiles service
vi.mock('../../services/profiles', () => ({
  profilesService: {
    getDiscoveryProfiles: vi.fn(),
    passProfile: vi.fn(),
    likeProfile: vi.fn(),
    superLikeProfile: vi.fn(),
  },
}));

const mockProfiles: Profile[] = [
  {
    id: '1',
    name: 'Test User',
    age: 20,
    university: 'Test University',
    major: 'Test Major',
    bio: 'Test bio',
    tagline: 'Test tagline',
    interests: ['Test Interest'],
    lookingFor: ['friends'],
    avatarUrl: 'test.jpg',
    projects: [],
    portfolioLinks: [],
    createdAt: new Date(),
  },
  {
    id: '2',
    name: 'Second User',
    age: 21,
    university: 'Another University',
    major: 'Another Major',
    bio: 'Another bio',
    tagline: 'Another tagline',
    interests: ['Another Interest'],
    lookingFor: ['project_collaborators'],
    avatarUrl: 'another.jpg',
    projects: [],
    portfolioLinks: [],
    createdAt: new Date(),
  },
];

describe('useSwipeDeck', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Silence console.error for cleaner test output
    vi.spyOn(console, 'error').mockImplementation(() => {});
  });

  describe('loading profiles', () => {
    it('should load profiles on mount', async () => {
      vi.mocked(profilesService.getDiscoveryProfiles).mockResolvedValue(mockProfiles);

      const { result } = renderHook(() => useSwipeDeck());

      expect(result.current.isLoading).toBe(true);

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.currentProfile).toEqual(mockProfiles[0]);
      expect(result.current.hasMoreProfiles).toBe(true);
      expect(result.current.totalProfiles).toBe(2);
      expect(result.current.remainingProfiles).toBe(1);
    });

    it('should handle loading error', async () => {
      const error = new Error('Network error');
      vi.mocked(profilesService.getDiscoveryProfiles).mockRejectedValue(error);

      const { result } = renderHook(() => useSwipeDeck());

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
        expect(result.current.error).toBe('Network error');
      });
    });
  });

  describe('swipe actions', () => {
    beforeEach(async () => {
      vi.mocked(profilesService.getDiscoveryProfiles).mockResolvedValue(mockProfiles);
    });

    it('should handle pass swipe correctly', async () => {
      vi.mocked(profilesService.passProfile).mockResolvedValue({ success: true });

      const { result } = renderHook(() => useSwipeDeck());

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      act(() => {
        result.current.handleSwipe('left');
      });

      expect(profilesService.passProfile).toHaveBeenCalledWith('1');
      
      await waitFor(() => {
        expect(result.current.currentProfile).toEqual(mockProfiles[1]);
        expect(result.current.canUndo).toBe(true);
      });
    });

    it('should handle like swipe correctly', async () => {
      vi.mocked(profilesService.likeProfile).mockResolvedValue({ success: true, matched: true });

      const { result } = renderHook(() => useSwipeDeck());

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      act(() => {
        result.current.handleSwipe('right');
      });

      expect(profilesService.likeProfile).toHaveBeenCalledWith('1');

      await waitFor(() => {
        expect(result.current.showMatch).toBe(true);
        expect(result.current.matchedProfile).toEqual(mockProfiles[0]);
        expect(result.current.currentProfile).toEqual(mockProfiles[1]);
      });
    });

    it('should handle super like swipe correctly', async () => {
      vi.mocked(profilesService.superLikeProfile).mockResolvedValue({ success: true, matched: false });

      const { result } = renderHook(() => useSwipeDeck());

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      act(() => {
        result.current.handleSwipe('super');
      });

      expect(profilesService.superLikeProfile).toHaveBeenCalledWith('1');

      await waitFor(() => {
        expect(result.current.showMatch).toBe(false);
        expect(result.current.currentProfile).toEqual(mockProfiles[1]);
      });
    });

    it('should handle swipe failure gracefully', async () => {
      const error = new Error('API error');
      vi.mocked(profilesService.likeProfile).mockRejectedValue(error);

      const { result } = renderHook(() => useSwipeDeck());

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      act(() => {
        result.current.handleSwipe('right');
      });

      // Should not advance to next profile
      await waitFor(() => {
        expect(result.current.currentProfile).toEqual(mockProfiles[0]);
        expect(result.current.canUndo).toBe(false);
        expect(result.current.error).toBe('API error');
      });
    });
  });

  describe('undo functionality', () => {
    beforeEach(async () => {
      vi.mocked(profilesService.getDiscoveryProfiles).mockResolvedValue(mockProfiles);
      vi.mocked(profilesService.passProfile).mockResolvedValue({ success: true });
    });

    it('should undo last action', async () => {
      const { result } = renderHook(() => useSwipeDeck());

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      // Perform a swipe
      act(() => {
        result.current.handleSwipe('left');
      });

      await waitFor(() => {
        expect(result.current.currentProfile).toEqual(mockProfiles[1]);
        expect(result.current.canUndo).toBe(true);
      });

      // Undo the swipe
      act(() => {
        result.current.undoLastAction();
      });

      await waitFor(() => {
        expect(result.current.currentProfile).toEqual(mockProfiles[0]);
        expect(result.current.canUndo).toBe(false);
      });
    });

    it('should not undo if no actions', async () => {
      const { result } = renderHook(() => useSwipeDeck());

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.canUndo).toBe(false);

      act(() => {
        result.current.undoLastAction();
      });

      expect(result.current.currentProfile).toEqual(mockProfiles[0]);
    });
  });

  describe('empty state', () => {
    it('should handle empty profiles list', async () => {
      vi.mocked(profilesService.getDiscoveryProfiles).mockResolvedValue([]);

      const { result } = renderHook(() => useSwipeDeck());

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.currentProfile).toBeNull();
      expect(result.current.hasMoreProfiles).toBe(false);
      expect(result.current.totalProfiles).toBe(0);
    });
  });

  describe('match overlay', () => {
    it('should dismiss match overlay', async () => {
      vi.mocked(profilesService.getDiscoveryProfiles).mockResolvedValue(mockProfiles);
      vi.mocked(profilesService.likeProfile).mockResolvedValue({ success: true, matched: true });

      const { result } = renderHook(() => useSwipeDeck());

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      act(() => {
        result.current.handleSwipe('right');
      });

      await waitFor(() => {
        expect(result.current.showMatch).toBe(true);
        expect(result.current.matchedProfile).toEqual(mockProfiles[0]);
      });

      act(() => {
        result.current.dismissMatch();
      });

      expect(result.current.showMatch).toBe(false);
      expect(result.current.matchedProfile).toBeNull();
    });

    it('should reset deck', async () => {
      vi.mocked(profilesService.getDiscoveryProfiles).mockResolvedValue(mockProfiles);

      const { result } = renderHook(() => useSwipeDeck());

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      act(() => {
        result.current.resetDeck();
      });

      expect(result.current.isLoading).toBe(true);
      expect(profilesService.getDiscoveryProfiles).toHaveBeenCalledTimes(2);
    });
  });
});