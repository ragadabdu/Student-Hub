interface AvatarProps {
  src?: string;
  alt?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
}

export function Avatar({ src, alt = 'Avatar', size = 'md', className = '' }: AvatarProps) {
  const sizes = {
    sm: 'w-8 h-8',
    md: 'w-12 h-12',
    lg: 'w-16 h-16',
    xl: 'w-24 h-24',
  };

  return (
    <img
      src={src || 'https://api.dicebear.com/7.x/avataaars/svg?seed=default'}
      alt={alt}
      className={`rounded-full object-cover bg-gray-200 ${sizes[size]} ${className}`}
    />
  );
}