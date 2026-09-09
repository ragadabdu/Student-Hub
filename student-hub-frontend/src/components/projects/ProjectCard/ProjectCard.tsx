import type { Project } from '../../../types/project';
import { Badge } from '../../ui/Badge/Badge';
import { Button } from '../../ui/Button/Button';
import { Users, User, Calendar, Sparkles } from 'lucide-react';

interface ProjectCardProps {
  project: Project;
  onExpressInterest?: (projectId: string) => void;
  isExpressingInterest?: boolean;
  className?: string;
}

const categoryLabels = {
  web_dev: 'Web Dev',
  ai_ml: 'AI / ML',
  design: 'Design',
  mobile: 'Mobile',
  business: 'Business',
  other: 'Other',
};

const categoryColors = {
  web_dev: 'primary',
  ai_ml: 'green',
  design: 'pink',
  mobile: 'yellow',
  business: 'blue',
  other: 'gray',
} as const;

export function ProjectCard({ 
  project, 
  onExpressInterest, 
  isExpressingInterest = false,
  className = '' 
}: ProjectCardProps) {
  const handleInterest = () => {
    if (onExpressInterest) {
      onExpressInterest(project.id);
    }
  };

  const formattedDate = project.createdAt.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });

  return (
    <div className={`bg-white rounded-2xl shadow-sm border border-border hover:shadow-md transition-all duration-200 p-6 ${className}`}>
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1 min-w-0">
          <h3 className="text-lg font-semibold text-text truncate">
            {project.title}
          </h3>
          <div className="flex items-center gap-3 mt-1 text-sm text-text-secondary">
            <span className="flex items-center gap-1">
              <User className="w-4 h-4" />
              {project.ownerName}
            </span>
            <span className="flex items-center gap-1">
              <Calendar className="w-4 h-4" />
              {formattedDate}
            </span>
          </div>
        </div>
        <Badge variant={categoryColors[project.category]}>
          {categoryLabels[project.category]}
        </Badge>
      </div>

      {/* Description */}
      <p className="text-text-secondary text-sm mt-3 line-clamp-2">
        {project.description}
      </p>

      {/* Tags */}
      <div className="flex flex-wrap gap-2 mt-3">
        {project.tags.map((tag) => (
          <Badge key={tag} variant="gray">
            {tag}
          </Badge>
        ))}
      </div>

      {/* Team & Looking For */}
      <div className="mt-4 pt-4 border-t border-border">
        <div className="flex items-center gap-4 text-sm">
          <span className="flex items-center gap-1.5 text-text-secondary">
            <Users className="w-4 h-4" />
            {project.teamSize} member{project.teamSize !== 1 ? 's' : ''}
          </span>
          {project.lookingFor.length > 0 && (
            <span className="flex items-center gap-1.5 text-primary">
              <Sparkles className="w-4 h-4" />
              Looking for: {project.lookingFor.join(', ')}
            </span>
          )}
        </div>
      </div>

      {/* Actions */}
      <div className="mt-4 flex gap-3">
        <Button
          variant="primary"
          size="sm"
          onClick={handleInterest}
          isLoading={isExpressingInterest}
          disabled={isExpressingInterest}
          className="flex-1"
        >
          Express Interest
        </Button>
        <Button variant="outline" size="sm">
          View Details
        </Button>
      </div>
    </div>
  );
}