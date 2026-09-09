import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { MatchOverlay } from '../MatchOverlay';
import type { Profile } from '../../../../types/user';

const mockProfile: Profile = {
  id: '1',
  name: 'Match Student',
  age: 22,
  university: 'Test University',
  major: 'Engineering',
  bio: 'Test bio',
  tagline: 'Test tagline',
  interests: ['React', 'TypeScript', 'Design', 'Music'],
  lookingFor: ['friends', 'project_collaborators'],
  avatarUrl: 'match-avatar.jpg',
  projects: [],
  portfolioLinks: [],
  createdAt: new Date(),
};

describe('MatchOverlay', () => {
  it('should render match celebration message', () => {
    render(
      <MatchOverlay
        matchedProfile={mockProfile}
        onDismiss={vi.fn()}
        onMessage={vi.fn()}
      />
    );

    expect(screen.getByText('✨ It\'s a Match! ✨')).toBeInTheDocument();
    expect(screen.getByText('You + Match Student')).toBeInTheDocument();
  });

  it('should show shared interests', () => {
    render(
      <MatchOverlay
        matchedProfile={mockProfile}
        onDismiss={vi.fn()}
        onMessage={vi.fn()}
      />
    );

    expect(screen.getByText('You both like: React · TypeScript · Design')).toBeInTheDocument();
  });

  it('should show limited interests (max 3)', () => {
    const profileWithManyInterests: Profile = {
      ...mockProfile,
      interests: ['React', 'TypeScript', 'Design', 'Music', 'Art', 'Sports'],
    };

    render(
      <MatchOverlay
        matchedProfile={profileWithManyInterests}
        onDismiss={vi.fn()}
        onMessage={vi.fn()}
      />
    );

    const interestText = screen.getByText(/You both like:/);
    expect(interestText).toHaveTextContent('React · TypeScript · Design');
    expect(interestText).not.toHaveTextContent('Music');
  });

  it('should call onDismiss when Keep exploring is clicked', () => {
    const onDismiss = vi.fn();
    
    render(
      <MatchOverlay
        matchedProfile={mockProfile}
        onDismiss={onDismiss}
        onMessage={vi.fn()}
      />
    );

    fireEvent.click(screen.getByText('Keep exploring'));
    expect(onDismiss).toHaveBeenCalledTimes(1);
  });

  it('should call onMessage when Say hello is clicked', () => {
    const onMessage = vi.fn();
    
    render(
      <MatchOverlay
        matchedProfile={mockProfile}
        onDismiss={vi.fn()}
        onMessage={onMessage}
      />
    );

    fireEvent.click(screen.getByText('Say hello 👋'));
    expect(onMessage).toHaveBeenCalledTimes(1);
  });

  it('should render both user avatars', () => {
    render(
      <MatchOverlay
        matchedProfile={mockProfile}
        onDismiss={vi.fn()}
        onMessage={vi.fn()}
      />
    );

    const avatars = screen.getAllByRole('img');
    expect(avatars).toHaveLength(2);
    expect(avatars[0]).toHaveAttribute('src', 'match-avatar.jpg');
    expect(avatars[1]).toHaveAttribute('src', expect.stringContaining('avataaars'));
  });

  it('should prevent body scroll when mounted', () => {
    render(
      <MatchOverlay
        matchedProfile={mockProfile}
        onDismiss={vi.fn()}
        onMessage={vi.fn()}
      />
    );

    expect(document.body.style.overflow).toBe('hidden');
  });

  it('should restore body scroll when unmounted', () => {
    const { unmount } = render(
      <MatchOverlay
        matchedProfile={mockProfile}
        onDismiss={vi.fn()}
        onMessage={vi.fn()}
      />
    );

    expect(document.body.style.overflow).toBe('hidden');
    
    unmount();
    expect(document.body.style.overflow).toBe('unset');
  });
});