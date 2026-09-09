import type { Project, ProjectCategory } from '../types/project';

// Mock project data
const mockProjects: Project[] = [
  {
    id: 'p1',
    title: 'CampusConnect',
    description: 'Building a platform to connect students across campus for events, study groups, and collaboration.',
    tags: ['React', 'Rails', 'Design'],
    category: 'web_dev',
    teamSize: 3,
    lookingFor: ['UX Designer', 'Backend Developer'],
    ownerId: '1',
    ownerName: 'Daniel Chen',
    createdAt: new Date('2024-01-15'),
  },
  {
    id: 'p2',
    title: 'EcoTrack',
    description: 'Tracking and visualizing sustainability efforts across university campuses.',
    tags: ['Python', 'Data Science', 'Sustainability'],
    category: 'ai_ml',
    teamSize: 2,
    lookingFor: ['Data Analyst', 'Frontend Developer'],
    ownerId: '2',
    ownerName: 'Maya Patel',
    createdAt: new Date('2024-02-01'),
  },
  {
    id: 'p3',
    title: 'StudyBuddy AI',
    description: 'AI-powered study group matching and scheduling assistant for students.',
    tags: ['AI', 'Mobile', 'Education'],
    category: 'ai_ml',
    teamSize: 4,
    lookingFor: ['Mobile Developer', 'UX Designer'],
    ownerId: '2',
    ownerName: 'Maya Patel',
    createdAt: new Date('2024-02-15'),
  },
  {
    id: 'p4',
    title: 'SolarCar Project',
    description: 'Designing and building a solar-powered vehicle for inter-collegiate competitions.',
    tags: ['Engineering', 'Sustainability', 'Robotics'],
    category: 'other',
    teamSize: 6,
    lookingFor: ['Mechanical Engineer', 'Electrical Engineer'],
    ownerId: '3',
    ownerName: 'Alex Kim',
    createdAt: new Date('2024-03-01'),
  },
  {
    id: 'p5',
    title: 'HealthTrack',
    description: 'Mobile app for tracking mental health and wellness for college students.',
    tags: ['Mobile', 'Health', 'Design'],
    category: 'mobile',
    teamSize: 3,
    lookingFor: ['iOS Developer', 'Product Designer'],
    ownerId: '4',
    ownerName: 'Sarah Johnson',
    createdAt: new Date('2024-03-15'),
  },
  {
    id: 'p6',
    title: 'MarketMind',
    description: 'AI-driven market research tool for student entrepreneurs and startup founders.',
    tags: ['AI', 'Business', 'Analytics'],
    category: 'business',
    teamSize: 2,
    lookingFor: ['Business Analyst', 'Data Scientist'],
    ownerId: '1',
    ownerName: 'Daniel Chen',
    createdAt: new Date('2024-04-01'),
  },
];

export const projectsService = {
  // Get all projects with optional filters
  getProjects: async (filters?: { category?: ProjectCategory | 'all'; search?: string }): Promise<Project[]> => {
    await new Promise(resolve => setTimeout(resolve, 500));
    
    let filtered = [...mockProjects];
    
    if (filters?.category && filters.category !== 'all') {
      filtered = filtered.filter(p => p.category === filters.category);
    }
    
    if (filters?.search) {
      const searchLower = filters.search.toLowerCase();
      filtered = filtered.filter(p => 
        p.title.toLowerCase().includes(searchLower) ||
        p.description.toLowerCase().includes(searchLower) ||
        p.tags.some(tag => tag.toLowerCase().includes(searchLower))
      );
    }
    
    return filtered;
  },

  // Get a single project by ID
  getProject: async (id: string): Promise<Project | null> => {
    await new Promise(resolve => setTimeout(resolve, 300));
    return mockProjects.find(p => p.id === id) || null;
  },

  // Get projects by owner
  getProjectsByOwner: async (ownerId: string): Promise<Project[]> => {
    await new Promise(resolve => setTimeout(resolve, 300));
    return mockProjects.filter(p => p.ownerId === ownerId);
  },

  // Create a new project
  createProject: async (project: Omit<Project, 'id' | 'createdAt'>): Promise<Project> => {
    await new Promise(resolve => setTimeout(resolve, 600));
    const newProject: Project = {
      ...project,
      id: `p${mockProjects.length + 1}`,
      createdAt: new Date(),
    };
    mockProjects.push(newProject);
    return newProject;
  },

  // Update a project
  updateProject: async (id: string, updates: Partial<Project>): Promise<Project> => {
    await new Promise(resolve => setTimeout(resolve, 500));
    const index = mockProjects.findIndex(p => p.id === id);
    if (index === -1) {
      throw new Error('Project not found');
    }
    mockProjects[index] = { ...mockProjects[index], ...updates };
    return mockProjects[index];
  },

  // Delete a project
  deleteProject: async (id: string): Promise<{ success: boolean }> => {
    await new Promise(resolve => setTimeout(resolve, 400));
    const index = mockProjects.findIndex(p => p.id === id);
    if (index === -1) {
      throw new Error('Project not found');
    }
    mockProjects.splice(index, 1);
    return { success: true };
  },

  // Express interest in a project
  expressInterest: async (_projectId: string): Promise<{ success: boolean }> => {
    await new Promise(resolve => setTimeout(resolve, 400));
    return { success: true };
  },
};