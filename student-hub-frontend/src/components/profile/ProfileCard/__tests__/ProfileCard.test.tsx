import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { ProfileCard } from '../ProfileCard';
import type { Profile } from '../../../../types/user';

const mockProfile: Profile = {
  id: 'profile-1',
  userId: 'user-1',
  user: {
    id: 'user-1',
    name: 'Test Student',
    avatarUrl: 'test-avatar.jpg',
  },
  age: 21,
  university: 'Test University',
  major: 'Computer Science',
  bio: 'This is a test bio for the profile card component.',
  tagline: 'Developer · Designer · Innovator',
  interests: [
    { id: 'i1', name: 'React', isCustom: false },
    { id: 'i2', name: 'TypeScript', isCustom: false },
    { id: 'i3', name: 'Design', isCustom: false },
    { id: 'i4', name: 'Music', isCustom: false },
  ],
  skills: [
    { id: 's1', name: 'Python', isCustom: false },
  ],
  lookingFor: 'friends',
  profileVisibility: 'public_profile',
  showOnExplore: true,
  portfolioLinks: [
    {
      id: 'pl1',
      linkType: 'github',
      url: 'https://github.com/test',
      title: null,
      createdAt: new Date().toISOString(),
    },
    {
      id: 'pl2',
      linkType: 'linkedin',
      url: 'https://linkedin.com/test',
      title: null,
      createdAt: new Date().toISOString(),
    },
  ],
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
};

describe('ProfileCard', () => {
  it('should render the user name', () => {
    render(<ProfileCard profile={mockProfile} />);
    expect(screen.getByText(/Test Student/)).toBeInTheDocument();
  });

  it('should render interests as badges', () => {
    render(<ProfileCard profile={mockProfile} />);
    mockProfile.interests.forEach((interest) => {
      expect(screen.getByText(interest.name)).toBeInTheDocument();
    });
  });
});
