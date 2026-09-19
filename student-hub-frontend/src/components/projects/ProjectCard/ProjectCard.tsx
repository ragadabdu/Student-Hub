import type { Project } from '../../../types/project';
import { Avatar } from '../../ui/Avatar/Avatar';
import { Badge } from '../../ui/Badge/Badge';
import { Users, Calendar, Sparkles, ExternalLink } from 'lucide-react';
import { FaGithub } from 'react-icons/fa';

interface ProjectCardProps {
  project: Project;
  className?: string;
}

type BadgeVariant = 'primary' | 'green' | 'pink' | 'yellow' | 'gray' | 'blue';

const categoryLabels: Record<Project['category'], string> = {
  web_dev: 'Web Dev',
  ai_ml: 'AI / ML',
  design: 'Design',
  mobile: 'Mobile',
  business: 'Business',
  other: 'Other',
};

const categoryColors: Record<Project['category'], BadgeVariant> = {
  web_dev: 'primary',
  ai_ml: 'green',
  design: 'pink',
  mobile: 'yellow',
  business: 'blue',
  other: 'gray',
};

export function ProjectCard({ project, className = '' }: ProjectCardProps) {
  const ownerName = project.owner.name ?? 'Unnamed Student';

  const formattedDate = new Date(project.createdAt).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });

  return (
    <div
      className={`bg-white rounded-2xl shadow-sm border border-border hover:shadow-md transition-all duration-200 p-6 flex flex-col ${className}`}
    >
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1 min-w-0">
          <h3 className="text-lg font-semibold text-text truncate">
            {project.title}
          </h3>
          <div className="flex items-center gap-3 mt-2 text-sm text-text-secondary">
            <span className="flex items-center gap-1.5">
              <Avatar
                src={project.owner.avatarUrl ?? undefined}
                alt={ownerName}
                size="sm"
                className="w-5 h-5"
              />
              {ownerName}
            </span>
            <span className="flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5" />
              {formattedDate}
            </span>
          </div>
        </div>
        <Badge variant={categoryColors[project.category]}>
          {categoryLabels[project.category]}
        </Badge>
      </div>

      {/* Description */}
      {project.description && (
        <p className="text-text-secondary text-sm mt-3 line-clamp-2">
          {project.description}
        </p>
      )}

      {/* Skills */}
      {project.skills.length > 0 && (
        <div className="flex flex-wrap gap-2 mt-3">
          {project.skills.map((skill) => (
            <Badge key={skill.id} variant="gray">
              {skill.name}
            </Badge>
          ))}
        </div>
      )}

      {/* Footer */}
      <div className="mt-4 pt-4 border-t border-border flex items-center justify-between gap-3 flex-wrap">
        <div className="flex items-center gap-4 text-sm">
          {project.teamSize !== null && (
            <span className="flex items-center gap-1.5 text-text-secondary">
              <Users className="w-4 h-4" />
              {project.teamSize} member{project.teamSize !== 1 ? 's' : ''}
            </span>
          )}
          <span className="flex items-center gap-1.5 text-primary">
            <Sparkles className="w-4 h-4" />
            {project.lookingFor.replace(/_/g, ' ')}
          </span>
        </div>

        {/* External links */}
        <div className="flex items-center gap-2">
          {project.githubUrl && (
            <a
              href={project.githubUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-text-secondary hover:text-primary transition-colors"
              aria-label="GitHub repository"
            >
              <FaGithub className="w-4 h-4" />
            </a>
          )}
          {project.liveDemoUrl && (
            <a
              href={project.liveDemoUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-text-secondary hover:text-primary transition-colors"
              aria-label="Live demo"
            >
              <ExternalLink className="w-4 h-4" />
            </a>
          )}
        </div>
      </div>
    </div>
  );
}
