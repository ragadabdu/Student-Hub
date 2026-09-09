export type ProjectCategory = 'web_dev' | 'ai_ml' | 'design' | 'mobile' | 'business' | 'other';

export type Project = {
  id: string;
  title: string;
  description: string;
  tags: string[];
  category: ProjectCategory;
  teamSize: number;
  lookingFor: string[];
  ownerId: string;
  ownerName: string;
  createdAt: Date;
};