import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { BrowserRouter } from 'react-router-dom';
import Projects from '../index';
import { projectsService } from '../../../services/projects';
import type { Project } from '../../../types/project';

vi.mock('../../../services/projects', () => ({
  projectsService: {
    getProjects: vi.fn(),
    expressInterest: vi.fn(),
  },
}));

const mockProjects: Project[] = [
  {
    id: 'p1',
    title: 'CampusConnect',
    description: 'Building a platform to connect students across campus.',
    tags: ['React', 'Rails'],
    category: 'web_dev',
    teamSize: 3,
    lookingFor: ['UX Designer'],
    ownerId: '1',
    ownerName: 'Daniel Chen',
    createdAt: new Date('2024-01-15'),
  },
  {
    id: 'p2',
    title: 'EcoTrack',
    description: 'Tracking sustainability efforts across campuses.',
    tags: ['Python', 'Data Science'],
    category: 'ai_ml',
    teamSize: 2,
    lookingFor: ['Data Analyst'],
    ownerId: '2',
    ownerName: 'Maya Patel',
    createdAt: new Date('2024-02-01'),
  },
];

describe('Projects Page', () => {
  const renderProjects = () => {
    return render(
      <BrowserRouter>
        <Projects />
      </BrowserRouter>
    );
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render loading state initially', () => {
    vi.mocked(projectsService.getProjects).mockImplementation(
      () => new Promise(() => {}) // Never resolves
    );

    renderProjects();
    expect(screen.getByText('Loading projects...')).toBeInTheDocument();
  });

  it('should render projects when loaded', async () => {
    vi.mocked(projectsService.getProjects).mockResolvedValue(mockProjects);

    renderProjects();

    await waitFor(() => {
      expect(screen.queryByText('Loading projects...')).not.toBeInTheDocument();
    });

    expect(screen.getByText('Projects')).toBeInTheDocument();
    expect(screen.getByText('CampusConnect')).toBeInTheDocument();
    expect(screen.getByText('EcoTrack')).toBeInTheDocument();
    expect(screen.getByText('2 projects found')).toBeInTheDocument();
  });

  it('should handle error state', async () => {
    vi.mocked(projectsService.getProjects).mockRejectedValue(
      new Error('Network error')
    );

    renderProjects();

    await waitFor(() => {
      expect(screen.getByText('Failed to load projects')).toBeInTheDocument();
      expect(screen.getByText('Network error')).toBeInTheDocument();
      expect(screen.getByText('Try Again')).toBeInTheDocument();
    });
  });

  it('should filter projects by category', async () => {
    const user = userEvent.setup();
    vi.mocked(projectsService.getProjects).mockResolvedValue(mockProjects);

    renderProjects();

    await waitFor(() => {
      expect(screen.queryByText('Loading projects...')).not.toBeInTheDocument();
    });

    // Find the AI / ML filter button (not the badge)
    const allAIMLElements = screen.getAllByText('AI / ML');
    const aiCategoryButton = allAIMLElements[0];
    await user.click(aiCategoryButton);

    // Should call getProjects with the category filter
    expect(projectsService.getProjects).toHaveBeenLastCalledWith({
      category: 'ai_ml',
      search: undefined,
    });
  });

  it('should search projects', async () => {
    vi.mocked(projectsService.getProjects).mockResolvedValue(mockProjects);

    renderProjects();

    await waitFor(() => {
      expect(screen.queryByText('Loading projects...')).not.toBeInTheDocument();
    });

    const searchInput = screen.getByPlaceholderText(
      /Search projects by title, description, or tags/i
    );
    
    // Use fireEvent.change for direct value change
    fireEvent.change(searchInput, { target: { value: 'Campus' } });

    // Check that the search input value is updated
    expect(searchInput).toHaveValue('Campus');

    // Check that the "Searching" text appears with the search term
    await waitFor(() => {
      expect(screen.getByText(/Searching: "Campus"/)).toBeInTheDocument();
    });

    // Verify getProjects was called with search parameter
    await waitFor(() => {
      const lastCall = vi.mocked(projectsService.getProjects).mock.lastCall;
      expect(lastCall?.[0]?.search).toBe('Campus');
    });
  });

  it('should show empty state when no projects match', async () => {
    vi.mocked(projectsService.getProjects).mockResolvedValue([]);

    renderProjects();

    await waitFor(() => {
      expect(screen.queryByText('Loading projects...')).not.toBeInTheDocument();
    });

    expect(screen.getByText('No projects found')).toBeInTheDocument();
  });

  it('should show empty state with search message when searching', async () => {
    const user = userEvent.setup();
    vi.mocked(projectsService.getProjects).mockResolvedValue([]);

    renderProjects();

    await waitFor(() => {
      expect(screen.queryByText('Loading projects...')).not.toBeInTheDocument();
    });

    const searchInput = screen.getByPlaceholderText(
      /Search projects by title, description, or tags/i
    );
    
    await user.clear(searchInput);
    await user.type(searchInput, 'NonExistent');

    // Wait for the empty state to update
    await waitFor(() => {
      expect(screen.getByText(/No projects match your search for/)).toBeInTheDocument();
    });
  });

  it('should handle expressing interest in a project', async () => {
    const user = userEvent.setup();
    vi.mocked(projectsService.getProjects).mockResolvedValue(mockProjects);
    vi.mocked(projectsService.expressInterest).mockResolvedValue({ success: true });

    renderProjects();

    await waitFor(() => {
      expect(screen.queryByText('Loading projects...')).not.toBeInTheDocument();
    });

    // Find and click Express Interest button on first project
    const expressButtons = screen.getAllByText('Express Interest');
    await user.click(expressButtons[0]);

    expect(projectsService.expressInterest).toHaveBeenCalledWith('p1');
  });

  it('should show clear search button when searching', async () => {
    const user = userEvent.setup();
    vi.mocked(projectsService.getProjects).mockResolvedValue([]);

    renderProjects();

    await waitFor(() => {
      expect(screen.queryByText('Loading projects...')).not.toBeInTheDocument();
    });

    // Type search
    const searchInput = screen.getByPlaceholderText(
      /Search projects by title, description, or tags/i
    );
    await user.type(searchInput, 'Test');

    await waitFor(() => {
      expect(screen.getByText('Clear Search')).toBeInTheDocument();
    });
  });

  it('should show view all projects button when category filter has no results', async () => {
    vi.mocked(projectsService.getProjects).mockResolvedValue([]);

    renderProjects();

    await waitFor(() => {
      expect(screen.queryByText('Loading projects...')).not.toBeInTheDocument();
    });

    expect(screen.getByText('View All Projects')).toBeInTheDocument();
  });
});