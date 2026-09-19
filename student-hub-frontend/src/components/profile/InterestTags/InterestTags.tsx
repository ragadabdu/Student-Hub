import { Badge } from '../../ui/Badge/Badge';
import type { Interest } from '../../../types/user';

interface InterestTagsProps {
  interests?: Interest[];
  className?: string;
}

export function InterestTags({ interests = [], className = '' }: InterestTagsProps) {
  if (interests.length === 0) {
    return (
      <p className="text-text-secondary text-sm italic">
        No interests added yet
      </p>
    );
  }

  return (
    <div className={`flex flex-wrap gap-2 ${className}`}>
      {interests.map((interest) => (
        <Badge key={interest.id} variant="primary">
          {interest.name}
        </Badge>
      ))}
    </div>
  );
}
