import { useCallback, useEffect, useRef, useState } from 'react';
import { projectsService } from '../services/projects';
import type { Project, ProjectCategory } from '../types/project';

const PAGE_SIZE = 12;
const SEARCH_DEBOUNCE_MS = 300;

export type { Project };

export function useProjects() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<ProjectCategory | 'all'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);

  // Debounced search value — the value we actually use to query.
  const [debouncedSearch, setDebouncedSearch] = useState('');

  // Cancel token for in-flight requests
  const requestIdRef = useRef(0);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchQuery.trim());
      setPage(1); // reset to page 1 on new search
    }, SEARCH_DEBOUNCE_MS);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  const loadProjects = useCallback(async () => {
    const myId = ++requestIdRef.current;

    setIsLoading(true);
    setError(null);

    try {
      const { projects: list, meta } = await projectsService.list({
        page,
        perPage: PAGE_SIZE,
        category: selectedCategory === 'all' ? undefined : selectedCategory,
        q: debouncedSearch || undefined,
      });

      // Ignore stale responses
      if (myId !== requestIdRef.current) return;

      setProjects(list);
      setTotalPages(meta.totalPages);
      setTotalCount(meta.totalCount);
    } catch (err) {
      if (myId !== requestIdRef.current) return;
      const message = err instanceof Error ? err.message : 'Failed to load projects';
      setError(message);
      setProjects([]);
    } finally {
      if (myId === requestIdRef.current) {
        setIsLoading(false);
      }
    }
  }, [page, selectedCategory, debouncedSearch]);

  useEffect(() => {
    loadProjects();
  }, [loadProjects]);

  const handleSearch = useCallback((query: string) => {
    setSearchQuery(query);
  }, []);

  const handleCategoryChange = useCallback((category: ProjectCategory | 'all') => {
    setSelectedCategory(category);
    setPage(1); // reset page on filter change
  }, []);

  const goToPage = useCallback((nextPage: number) => {
    if (nextPage < 1 || nextPage > totalPages) return;
    setPage(nextPage);
  }, [totalPages]);

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
    page,
    totalPages,
    totalCount,
    categories,
    handleSearch,
    handleCategoryChange,
    goToPage,
    loadProjects,
  };
}
