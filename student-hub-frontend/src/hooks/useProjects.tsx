import { useState, useEffect, useCallback } from 'react';
import type { Project, ProjectCategory } from '../types/project';
import { projectsService } from '../services/projects';

export function useProjects() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<ProjectCategory | 'all'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [isExpressingInterest, setIsExpressingInterest] = useState(false);

  const loadProjects = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await projectsService.getProjects({
        category: selectedCategory === 'all' ? undefined : selectedCategory,
        search: searchQuery || undefined,
      });
      setProjects(data);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load projects';
      setError(errorMessage);
      console.error('Failed to load projects:', err);
    } finally {
      setIsLoading(false);
    }
  }, [selectedCategory, searchQuery]);

  useEffect(() => {
    loadProjects();
  }, [loadProjects]);

  const handleSearch = useCallback((query: string) => {
    setSearchQuery(query);
  }, []);

  const handleCategoryChange = useCallback((category: ProjectCategory | 'all') => {
    setSelectedCategory(category);
  }, []);

  const handleExpressInterest = useCallback(async (projectId: string) => {
    setIsExpressingInterest(true);
    try {
      const result = await projectsService.expressInterest(projectId);
      return result;
    } catch (err) {
      console.error('Failed to express interest:', err);
      throw err;
    } finally {
      setIsExpressingInterest(false);
    }
  }, []);

  const categories: { value: ProjectCategory | 'all'; label: string }[] = [
    { value: 'all', label: 'All' },
    { value: 'web_dev', label: 'Web Dev' },
    { value: 'ai_ml', label: 'AI / ML' },
    { value: 'design', label: 'Design' },
    { value: 'mobile', label: 'Mobile' },
    { value: 'business', label: 'Business' },
    { value: 'other', label: 'Other' },
  ];

  return {
    projects,
    isLoading,
    error,
    selectedCategory,
    searchQuery,
    isExpressingInterest,
    handleSearch,
    handleCategoryChange,
    handleExpressInterest,
    loadProjects,
    categories,
  };
}