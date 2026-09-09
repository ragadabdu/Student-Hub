import type { PortfolioLink } from '../../../types/user';
import { Globe, Link, Plus } from 'lucide-react';
import { FaGithub, FaLinkedin, FaTwitter } from 'react-icons/fa';

interface PortfolioLinksProps {
  links: PortfolioLink[];
  isEditable?: boolean;
  onAddLink?: () => void;
  onRemoveLink?: (id: string) => void;
  className?: string;
}

const linkIcons = {
  GitHub: FaGithub,
  LinkedIn: FaLinkedin,
  Website: Globe,
  Twitter: FaTwitter,
  Other: Link,
};

export function PortfolioLinks({
  links,
  isEditable = false,
  onAddLink,
  onRemoveLink,
  className = '',
}: PortfolioLinksProps) {
  if (links.length === 0 && !isEditable) {
    return (
      <p className="text-text-secondary text-sm italic">
        No portfolio links added
      </p>
    );
  }

  return (
    <div className={`space-y-2 ${className}`}>
      {links.map((link) => {
        const Icon = linkIcons[link.label] || Link;

        return (
          <div key={link.id} className="flex items-center gap-2">
            <a
              href={link.url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2.5 text-text-secondary hover:text-primary transition-colors py-1.5 px-3 rounded-lg hover:bg-gray-50"
            >
              <Icon className="w-4 h-4" />
              <span>{link.label}</span>
            </a>

            {isEditable && onRemoveLink && (
              <button
                onClick={() => onRemoveLink(link.id)}
                className="text-text-secondary hover:text-red-500 transition-colors"
                aria-label={`Remove ${link.label}`}
              >
                ×
              </button>
            )}
          </div>
        );
      })}

      {isEditable && onAddLink && (
        <button
          onClick={onAddLink}
          className="flex items-center gap-2 text-primary hover:text-primary-dark transition-colors py-1.5 px-3 rounded-lg hover:bg-primary/5"
        >
          <Plus className="w-4 h-4" />
          <span className="text-sm">Add link</span>
        </button>
      )}
    </div>
  );
}