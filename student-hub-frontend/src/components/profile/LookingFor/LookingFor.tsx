import type { LookingFor as LookingForType } from '../../../types/user';
import { Check, Users, Briefcase, Coffee, Sparkles } from 'lucide-react';

interface LookingForProps {
  lookingFor: LookingForType;
  className?: string;
}

const lookingForConfig: Record<
  LookingForType,
  { icon: typeof Users; label: string; emoji: string }
> = {
  friends: { icon: Users, label: 'Friends', emoji: '🤝' },
  project_collaborators: {
    icon: Briefcase,
    label: 'Project collaborators',
    emoji: '💻',
  },
  study_buddies: { icon: Coffee, label: 'Study buddies', emoji: '☕' },
  mentors: { icon: Sparkles, label: 'Mentors', emoji: '🧠' },
};

export function LookingFor({ lookingFor, className = '' }: LookingForProps) {
  const config = lookingForConfig[lookingFor];
  if (!config) return null;

  const Icon = config.icon;

  return (
    <div className={`space-y-2 ${className}`}>
      <div className="flex items-center gap-2.5 text-text-secondary">
        <Check className="w-4 h-4 text-green-500" strokeWidth={3} />
        <span className="flex items-center gap-2 text-sm">
          <Icon className="w-4 h-4" />
          {config.label}
        </span>
      </div>
    </div>
  );
}
