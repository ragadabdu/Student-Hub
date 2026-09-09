import type { Profile } from '../types/user';

// Mock data - this will eventually come from Rails API
const mockProfiles: Profile[] = [
  {
    id: '1',
    name: 'Daniel Chen',
    age: 21,
    university: 'UCSD',
    major: 'Product Design',
    bio: 'I love turning ideas into real things. Building products that make campus life better.',
    tagline: 'Builder · Designer · Dreamer',
    interests: ['Design', 'Product', 'Tech', 'Basketball'],
    lookingFor: ['friends', 'project_collaborators', 'study_buddies'],
    avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=daniel',
    projects: [
      {
        id: 'p1',
        title: 'CampusConnect',
        description: 'Connecting students across campus',
      },
      {
        id: 'p2',
        title: 'EcoTrack',
        description: 'Tracking sustainability efforts',
      },
    ],
    portfolioLinks: [
      { id: 'pl1', label: 'GitHub', url: 'https://github.com' },
      { id: 'pl2', label: 'LinkedIn', url: 'https://linkedin.com' },
    ],
    createdAt: new Date('2024-01-15'),
  },
  {
    id: '2',
    name: 'Maya Patel',
    age: 20,
    university: 'UCLA',
    major: 'Computer Science',
    bio: 'Building things that make campus life better. Passionate about AI and education.',
    tagline: 'Developer · Learner · Problem Solver',
    interests: ['AI', 'Design', 'Startups', 'Music'],
    lookingFor: ['friends', 'project_collaborators'],
    avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=maya',
    projects: [
      {
        id: 'p3',
        title: 'StudyBuddy',
        description: 'AI-powered study groups',
      },
    ],
    portfolioLinks: [
      { id: 'pl3', label: 'GitHub', url: 'https://github.com' },
      { id: 'pl4', label: 'Website', url: 'https://maya.dev' },
    ],
    createdAt: new Date('2024-02-01'),
  },
  {
    id: '3',
    name: 'Alex Kim',
    age: 22,
    university: 'UC Berkeley',
    major: 'Mechanical Engineering',
    bio: 'Designing the future of sustainable transportation. Robotics enthusiast.',
    tagline: 'Engineer · Maker · Innovator',
    interests: ['Robotics', 'Sustainability', '3D Printing', 'Climbing'],
    lookingFor: ['project_collaborators', 'mentors'],
    avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=alex',
    projects: [
      {
        id: 'p4',
        title: 'SolarCar',
        description: 'Building a solar-powered vehicle',
      },
      {
        id: 'p5',
        title: 'RobotArm',
        description: 'Low-cost prosthetic arm',
      },
    ],
    portfolioLinks: [
      { id: 'pl5', label: 'GitHub', url: 'https://github.com' },
      { id: 'pl6', label: 'LinkedIn', url: 'https://linkedin.com' },
    ],
    createdAt: new Date('2024-02-15'),
  },
  {
    id: '4',
    name: 'Sarah Johnson',
    age: 20,
    university: 'Stanford',
    major: 'Psychology',
    bio: 'Understanding how people think and connect. Mental health advocate.',
    tagline: 'Curious · Empathetic · Driven',
    interests: ['Psychology', 'Writing', 'Meditation', 'Art'],
    lookingFor: ['friends', 'study_buddies'],
    avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=sarah',
    projects: [],
    portfolioLinks: [
      { id: 'pl7', label: 'Website', url: 'https://sarahwrites.com' },
    ],
    createdAt: new Date('2024-03-01'),
  },
];

// Service interface - this will be replaced with real API calls
export const profilesService = {
  // Get profiles for discovery (exclude current user)
  getDiscoveryProfiles: async (userId?: string): Promise<Profile[]> => {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 500));
    
    // If userId provided, filter them out
    if (userId) {
      return mockProfiles.filter(p => p.id !== userId);
    }
    return mockProfiles;
  },

  // Get a single profile by ID
  getProfile: async (id: string): Promise<Profile | null> => {
    await new Promise(resolve => setTimeout(resolve, 300));
    return mockProfiles.find(p => p.id === id) || null;
  },

  // Like a profile (will connect to POST /api/v1/likes)
  likeProfile: async (profileId: string): Promise<{ success: boolean; matched?: boolean }> => {
    await new Promise(resolve => setTimeout(resolve, 400));
    // Simulate match 30% of the time for demo
    const matched = Math.random() < 0.3;
    return { success: true, matched };
  },

  // Pass on a profile (will connect to DELETE /api/v1/likes/:id)
  passProfile: async (profileId: string): Promise<{ success: boolean }> => {
    await new Promise(resolve => setTimeout(resolve, 300));
    return { success: true };
  },

  // Super like a profile
  superLikeProfile: async (profileId: string): Promise<{ success: boolean; matched?: boolean }> => {
    await new Promise(resolve => setTimeout(resolve, 400));
    // Higher match rate for super likes
    const matched = Math.random() < 0.6;
    return { success: true, matched };
  },
};