import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { ProfileCard } from '../ProfileCard';
import type { Profile } from '../../../../types/user';

const mockProfile: Profile = {
  id: '1',
  name: 'Test Student',
  age: 21,
  university: 'Test University',
  major: 'Computer Science',
  bio: 'This is a test bio for the profile card component.',
  tagline: 'Developer · Designer · Innovator',
  interests: ['React', 'TypeScript', 'Design', 'Music'],
  lookingFor: ['friends', 'project_collaborators', 'study_buddies'],
  avatarUrl: 'test-avatar.jpg',
  projects: [
    {
      id: 'p1',
      title: 'Test Project 1',
      description: 'This is a test project description',
    },
    {
      id: 'p2',
      title: 'Test Project 2',
      description: 'Another test project',
    },
  ],
  portfolioLinks: [
    { id: 'pl1', label: 'GitHub', url: 'https://github.com/test' },
    { id: 'pl2', label: 'LinkedIn', url: 'https://linkedin.com/test' },
  ],
  createdAt: new Date(),
};

describe('ProfileCard', () => {
  it('should render profile information correctly', () => {
    render(<ProfileCard profile={mockProfile} />);

    // Name and age
    expect(screen.getByText('Test Student, 21')).toBeInTheDocument();
    
    // University and major
    expect(screen.getByText('Test University · Computer Science')).toBeInTheDocument();
    
    // Tagline
    expect(screen.getByText('Developer · Designer · Innovator')).toBeInTheDocument();
    
    // Bio
    expect(screen.getByText('"This is a test bio for the profile card component."')).toBeInTheDocument();
  });

  it('should render interests as badges', () => {
    render(<ProfileCard profile={mockProfile} />);

    mockProfile.interests.forEach((interest) => {
      expect(screen.getByText(interest)).toBeInTheDocument();
    });
  });

  it('should render "Looking for" section with correct labels', () => {
    render(<ProfileCard profile={mockProfile} />);

    expect(screen.getByText('Looking for')).toBeInTheDocument();
    expect(screen.getByText('🤝 Friends')).toBeInTheDocument();
    expect(screen.getByText('💻 Project teammates')).toBeInTheDocument();
    expect(screen.getByText('☕ Study buddies')).toBeInTheDocument();
  });

  it('should render projects when available', () => {
    render(<ProfileCard profile={mockProfile} />);

    expect(screen.getByText('Projects')).toBeInTheDocument();
    expect(screen.getByText('Test Project 1')).toBeInTheDocument();
    expect(screen.getByText('This is a test project description')).toBeInTheDocument();
    expect(screen.getByText('Test Project 2')).toBeInTheDocument();
  });

  it('should not render projects section when no projects', () => {
    const profileWithoutProjects = { ...mockProfile, projects: [] };
    render(<ProfileCard profile={profileWithoutProjects} />);

    expect(screen.queryByText('Projects')).not.toBeInTheDocument();
  });

  it('should render avatar with correct attributes', () => {
    render(<ProfileCard profile={mockProfile} />);

    const avatar = screen.getByAltText('Test Student');
    expect(avatar).toBeInTheDocument();
    expect(avatar).toHaveAttribute('src', 'test-avatar.jpg');
  });

  it('should apply custom className when provided', () => {
    render(<ProfileCard profile={mockProfile} className="custom-class" />);
    
    const card = screen.getByRole('img', { name: 'Test Student' }).closest('.bg-white');
    expect(card).toHaveClass('custom-class');
  });
});