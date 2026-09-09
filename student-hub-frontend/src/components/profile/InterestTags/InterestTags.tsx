import { Badge } from '../../ui/Badge/Badge';

interface InterestTagsProps {
  interests: string[];
  className?: string;
}

export function InterestTags({ interests, className = '' }: InterestTagsProps) {
  if (interests.length === 0) {
    return (
      <p className="text-text-secondary text-sm italic">No interests added yet</p>
    );
  }

  return (
    <div className={`flex flex-wrap gap-2 ${className}`}>
      {interests.map((interest) => (
        <Badge key={interest} variant="primary">
          {interest}
        </Badge>
      ))}
    </div>
  );
}