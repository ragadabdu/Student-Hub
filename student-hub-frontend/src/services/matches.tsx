import type { Match } from '../types/match';

// Mock match data
const mockMatches: Match[] = [
  {
    id: 'm1',
    userId: '1',
    matchedUserId: '2',
    matchedUser: {
      name: 'Maya Patel',
      avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=maya',
      major: 'Computer Science',
      university: 'UCLA',
    },
    sharedInterests: ['AI', 'Design', 'Startups'],
    matchedAt: new Date('2024-03-15T10:30:00'),
    lastMessage: {
      preview: 'Hey! Would love to work on a project together.',
      sentAt: new Date('2024-03-16T14:20:00'),
    },
  },
  {
    id: 'm2',
    userId: '1',
    matchedUserId: '3',
    matchedUser: {
      name: 'Alex Kim',
      avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=alex',
      major: 'Mechanical Engineering',
      university: 'UC Berkeley',
    },
    sharedInterests: ['Robotics', 'Sustainability'],
    matchedAt: new Date('2024-03-10T09:15:00'),
    lastMessage: {
      preview: 'Can you review the latest design?',
      sentAt: new Date('2024-03-12T16:45:00'),
    },
  },
  {
    id: 'm3',
    userId: '1',
    matchedUserId: '4',
    matchedUser: {
      name: 'Sarah Johnson',
      avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=sarah',
      major: 'Psychology',
      university: 'Stanford',
    },
    sharedInterests: ['Writing', 'Art', 'Meditation'],
    matchedAt: new Date('2024-03-05T13:00:00'),
    lastMessage: {
      preview: 'Looking forward to our study session!',
      sentAt: new Date('2024-03-06T10:30:00'),
    },
  },
];

export const matchesService = {
  // Get all matches for the current user
  getMatches: async (): Promise<Match[]> => {
    await new Promise(resolve => setTimeout(resolve, 500));
    return mockMatches;
  },

  // Get a specific match by ID
  getMatch: async (id: string): Promise<Match | null> => {
    await new Promise(resolve => setTimeout(resolve, 300));
    return mockMatches.find(m => m.id === id) || null;
  },

  // Send a message to a match (will connect to POST /api/v1/messages)
  sendMessage: async (matchId: string, content: string): Promise<{ success: boolean }> => {
    await new Promise(resolve => setTimeout(resolve, 300));
    console.log(`Sending message to match ${matchId}: ${content}`);
    return { success: true };
  },

  // Unmatch a user (will connect to DELETE /api/v1/matches/:id)
  unmatch: async (matchId: string): Promise<{ success: boolean }> => {
    await new Promise(resolve => setTimeout(resolve, 400));
    const index = mockMatches.findIndex(m => m.id === matchId);
    if (index !== -1) {
      mockMatches.splice(index, 1);
    }
    return { success: true };
  },
};