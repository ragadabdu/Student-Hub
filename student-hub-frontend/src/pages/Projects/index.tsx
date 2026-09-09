import { useProjects } from '../../hooks/useProjects';
import { ProjectCard } from '../../components/projects/ProjectCard/ProjectCard';
import { ProjectFilters } from '../../components/projects/ProjectFilters/ProjectFilters';
import { LoadingState } from '../../components/ui/LoadingState/LoadingState';
import { EmptyState } from '../../components/ui/EmptyState/EmptyState';
import { Button } from '../../components/ui/Button/Button';
import { AlertCircle, Plus } from 'lucide-react';

export default function Projects() {
  const {
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
  } = useProjects();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <LoadingState message="Loading projects..." />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[60vh] p-4">
        <div className="text-center max-w-md">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-text mb-2">Failed to load projects</h3>
          <p className="text-text-secondary mb-4">{error}</p>
          <Button onClick={loadProjects}>Try Again</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-6 max-w-7xl mx-auto space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl md:text-4xl font-bold text-navy">Projects</h1>
          <p className="text-text-secondary mt-1">Discover interesting student projects to join</p>
        </div>
        <Button variant="primary">
          <Plus className="w-4 h-4 mr-2" />
          New Project
        </Button>
      </div>

      {/* Filters */}
      <ProjectFilters
        categories={categories}
        selectedCategory={selectedCategory}
        onCategoryChange={handleCategoryChange}
        searchQuery={searchQuery}
        onSearchChange={handleSearch}
      />

      {/* Results Count */}
      <div className="flex items-center justify-between text-sm text-text-secondary">
        <span>
          {projects.length} project{projects.length !== 1 ? 's' : ''} found
        </span>
        {searchQuery && (
          <span>
            Searching: "{searchQuery}"
          </span>
        )}
      </div>

      {/* Projects Grid */}
      {projects.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {projects.map((project) => (
            <ProjectCard
              key={project.id}
              project={project}
              onExpressInterest={handleExpressInterest}
              isExpressingInterest={isExpressingInterest}
            />
          ))}
        </div>
      ) : (
        <div className="flex items-center justify-center min-h-[40vh]">
          <EmptyState
            icon="🚀"
            title="No projects found"
            description={
              searchQuery
                ? `No projects match your search for "${searchQuery}". Try adjusting your filters.`
                : 'No projects available in this category yet. Check back later!'
            }
            action={
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                {searchQuery && (
                  <Button variant="outline" onClick={() => handleSearch('')}>
                    Clear Search
                  </Button>
                )}
                <Button variant="outline" onClick={() => handleCategoryChange('all')}>
                  View All Projects
                </Button>
              </div>
            }
          />
        </div>
      )}
    </div>
  );
}