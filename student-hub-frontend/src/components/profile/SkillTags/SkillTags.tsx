import { Badge } from '../../ui/Badge/Badge';
import type { Skill } from '../../../types/user';

interface SkillTagsProps {
  skills?: Skill[];
  className?: string;
}

export function SkillTags({ skills = [], className = '' }: SkillTagsProps) {
  if (skills.length === 0) {
    return (
      <p className="text-text-secondary text-sm italic">No skills added yet</p>
    );
  }

  return (
    <div className={`flex flex-wrap gap-2 ${className}`}>
      {skills.map((skill) => (
        <Badge key={skill.id} variant="blue">
          {skill.name}
        </Badge>
      ))}
    </div>
  );
}
