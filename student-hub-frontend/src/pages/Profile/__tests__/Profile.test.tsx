import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { BrowserRouter } from 'react-router-dom';
import Profile from '../index';
import { profilesService } from '../../../services/profiles';
import type { Profile as ProfileType } from '../../../types/user';

vi.mock('../../../services/profiles', () => ({
  profilesService: {
    getCurrentUserProfile: vi.fn(),
    getProfile: vi.fn(),
    updateProfile: vi.fn(),
  },
}));

const mockProfile: ProfileType = {
  id: '1',
  name: 'Test User',
  age: 21,
  university: 'Test University',
  major: 'Computer Science',
  bio: 'This is a test bio for the profile page.',
  tagline: 'Developer · Designer · Innovator',
  interests: ['React', 'TypeScript', 'Design'],
  lookingFor: ['friends', 'project_collaborators'],
  avatarUrl: 'test-avatar.jpg',
  projects: [
    { id: 'p1', title: 'Test Project 1', description: 'Test description' },
    { id: 'p2', title: 'Test Project 2', description: 'Another project' },
  ],
  portfolioLinks: [
    { id: 'pl1', label: 'GitHub', url: 'https://github.com/test' },
    { id: 'pl2', label: 'LinkedIn', url: 'https://linkedin.com/test' },
  ],
  createdAt: new Date(),
};

describe('Profile Page', () => {
  const renderProfile = () => {
    return render(
      <BrowserRouter>
        <Profile />
      </BrowserRouter>
    );
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render loading state initially', () => {
    vi.mocked(profilesService.getCurrentUserProfile).mockImplementation(
      () => new Promise(() => {}) // Never resolves
    );

    renderProfile();
    expect(screen.getByText('Loading your profile...')).toBeInTheDocument();
  });

  it('should render profile data when loaded', async () => {
    vi.mocked(profilesService.getCurrentUserProfile).mockResolvedValue(mockProfile);

    renderProfile();

    await waitFor(() => {
      expect(screen.queryByText('Loading your profile...')).not.toBeInTheDocument();
    });

    // Check profile header
    expect(screen.getByText('Test User')).toBeInTheDocument();
    expect(screen.getByText('Computer Science')).toBeInTheDocument();
    expect(screen.getByText('Test University')).toBeInTheDocument();
    expect(screen.getByText('Developer · Designer · Innovator')).toBeInTheDocument();

    // Check bio
    expect(screen.getByText('This is a test bio for the profile page.')).toBeInTheDocument();

    // Check interests
    expect(screen.getByText('React')).toBeInTheDocument();
    expect(screen.getByText('TypeScript')).toBeInTheDocument();
    expect(screen.getByText('Design')).toBeInTheDocument();

    // Check looking for - look for the emoji + text combination
    // The LookingFor component renders: 🤝 Friends and 💻 Project teammates
    // Use a more flexible approach - look for the checkmark icon and text
    expect(screen.getByText('Friends', { exact: false })).toBeInTheDocument();
    expect(screen.getByText('Project collaborators', { exact: false })).toBeInTheDocument();

    // Check projects
    expect(screen.getByText('Test Project 1')).toBeInTheDocument();
    expect(screen.getByText('Test Project 2')).toBeInTheDocument();

    // Check portfolio links
    expect(screen.getByText('GitHub')).toBeInTheDocument();
    expect(screen.getByText('LinkedIn')).toBeInTheDocument();
  });

  it('should handle error state', async () => {
    vi.mocked(profilesService.getCurrentUserProfile).mockRejectedValue(
      new Error('Network error')
    );

    renderProfile();

    await waitFor(() => {
      expect(screen.getByText('Failed to load profile')).toBeInTheDocument();
      expect(screen.getByText('Network error')).toBeInTheDocument();
      expect(screen.getByText('Try Again')).toBeInTheDocument();
    });
  });

  it('should switch to edit mode when Edit button is clicked', async () => {
    const user = userEvent.setup();
    vi.mocked(profilesService.getCurrentUserProfile).mockResolvedValue(mockProfile);

    renderProfile();

    await waitFor(() => {
      expect(screen.queryByText('Loading your profile...')).not.toBeInTheDocument();
    });

    // Find the Edit Profile button (not the heading)
    // Use getAllByRole and filter for buttons
    const editButtons = screen.getAllByRole('button', { name: /Edit Profile/i });
    // Click the first button (the one in the header)
    await user.click(editButtons[0]);

    // Should show edit form - look for the heading specifically
    await waitFor(() => {
      // Look for the heading text "Edit Profile" (h3)
      const editHeading = screen.getByRole('heading', { name: 'Edit Profile' });
      expect(editHeading).toBeInTheDocument();
    });
    
    // Check form fields
    expect(screen.getByLabelText('Full Name')).toBeInTheDocument();
    expect(screen.getByLabelText('Bio')).toBeInTheDocument();
    expect(screen.getByText('Save Changes')).toBeInTheDocument();
    expect(screen.getByText('Cancel')).toBeInTheDocument();
  });

  it('should cancel editing and return to view mode', async () => {
    const user = userEvent.setup();
    vi.mocked(profilesService.getCurrentUserProfile).mockResolvedValue(mockProfile);

    renderProfile();

    await waitFor(() => {
      expect(screen.queryByText('Loading your profile...')).not.toBeInTheDocument();
    });

    // Enter edit mode
    const editButtons = screen.getAllByRole('button', { name: /Edit Profile/i });
    await user.click(editButtons[0]);
    
    // Wait for edit form to appear
    await waitFor(() => {
      expect(screen.getByText('Save Changes')).toBeInTheDocument();
    });
    
    // Cancel editing - click the Cancel button
    await user.click(screen.getByText('Cancel'));

    // Should return to view mode - Save Changes should disappear
    await waitFor(() => {
      expect(screen.queryByText('Save Changes')).not.toBeInTheDocument();
    });
    
    // Should still show the user's name
    expect(screen.getByText('Test User')).toBeInTheDocument();
  });

  it('should save profile changes', async () => {
    const user = userEvent.setup();
    vi.mocked(profilesService.getCurrentUserProfile).mockResolvedValue(mockProfile);
    vi.mocked(profilesService.updateProfile).mockResolvedValue({
      ...mockProfile,
      bio: 'Updated bio',
    });

    renderProfile();

    await waitFor(() => {
      expect(screen.queryByText('Loading your profile...')).not.toBeInTheDocument();
    });

    // Enter edit mode
    const editButtons = screen.getAllByRole('button', { name: /Edit Profile/i });
    await user.click(editButtons[0]);

    // Wait for edit form
    await waitFor(() => {
      expect(screen.getByLabelText('Bio')).toBeInTheDocument();
    });

    // Update bio
    const bioTextarea = screen.getByLabelText('Bio');
    await user.clear(bioTextarea);
    await user.type(bioTextarea, 'Updated bio');

    // Save changes
    await user.click(screen.getByText('Save Changes'));

    // Should show success message
    await waitFor(() => {
      expect(screen.getByText('Profile updated successfully!')).toBeInTheDocument();
    });

    // Should return to view mode with updated content
    expect(screen.getByText('Updated bio')).toBeInTheDocument();
  });

  it('should render empty state for no interests', async () => {
    const profileWithoutInterests = {
      ...mockProfile,
      interests: [],
    };
    vi.mocked(profilesService.getCurrentUserProfile).mockResolvedValue(profileWithoutInterests);

    renderProfile();

    await waitFor(() => {
      expect(screen.queryByText('Loading your profile...')).not.toBeInTheDocument();
    });

    expect(screen.getByText('No interests added yet')).toBeInTheDocument();
  });

  it('should render empty state for no projects', async () => {
    const profileWithoutProjects = {
      ...mockProfile,
      projects: [],
    };
    vi.mocked(profilesService.getCurrentUserProfile).mockResolvedValue(profileWithoutProjects);

    renderProfile();

    await waitFor(() => {
      expect(screen.queryByText('Loading your profile...')).not.toBeInTheDocument();
    });

    expect(screen.getByText('No projects added yet')).toBeInTheDocument();
  });

  it('should render empty state for no portfolio links', async () => {
    const profileWithoutLinks = {
      ...mockProfile,
      portfolioLinks: [],
    };
    vi.mocked(profilesService.getCurrentUserProfile).mockResolvedValue(profileWithoutLinks);

    renderProfile();

    await waitFor(() => {
      expect(screen.queryByText('Loading your profile...')).not.toBeInTheDocument();
    });

    expect(screen.getByText('No portfolio links added')).toBeInTheDocument();
  });
});