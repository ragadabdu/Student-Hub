import React, { useState } from 'react';
import type { FormEvent } from 'react';
import type { Profile, LookingFor } from '../../../types/user';
import { Button } from '../../ui/Button/Button';

interface ProfileEditFormProps {
  profile: Profile;
  onSave: (updates: Partial<Profile>) => void;
  onCancel: () => void;
  isSaving: boolean;
}

export function ProfileEditForm({ profile, onSave, onCancel, isSaving }: ProfileEditFormProps) {
  const [formData, setFormData] = useState({
    name: profile.name,
    age: profile.age,
    university: profile.university,
    major: profile.major,
    bio: profile.bio || '',
    tagline: profile.tagline || '',
    interests: profile.interests.join(', '),
    lookingFor: profile.lookingFor as string[],
  });

  const [newInterest, setNewInterest] = useState('');

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    
    const updates: Partial<Profile> = {
      name: formData.name,
      age: formData.age,
      university: formData.university,
      major: formData.major,
      bio: formData.bio,
      tagline: formData.tagline,
      interests: formData.interests.split(',').map(s => s.trim()).filter(Boolean),
      lookingFor: formData.lookingFor as LookingFor[],
    };
    
    onSave(updates);
  };

  const handleChange = (field: string, value: string | number | string[]) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const toggleLookingFor = (item: string) => {
    setFormData(prev => {
      const current = prev.lookingFor as string[];
      const updated = current.includes(item)
        ? current.filter(i => i !== item)
        : [...current, item];
      return { ...prev, lookingFor: updated };
    });
  };

  const lookingForOptions = [
    { value: 'friends', label: '🤝 Friends' },
    { value: 'project_collaborators', label: '💻 Project teammates' },
    { value: 'study_buddies', label: '☕ Study buddies' },
    { value: 'mentors', label: '🧠 Mentors' },
  ];

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Basic Info */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label htmlFor="name" className="block text-sm font-medium text-text-secondary mb-1.5">
            Full Name
          </label>
          <input
            id="name"
            type="text"
            value={formData.name}
            onChange={(e) => handleChange('name', e.target.value)}
            className="w-full px-4 py-2 rounded-lg border border-border focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-colors"
            required
          />
        </div>
        <div>
          <label htmlFor="age" className="block text-sm font-medium text-text-secondary mb-1.5">
            Age
          </label>
          <input
            id="age"
            type="number"
            value={formData.age}
            onChange={(e) => handleChange('age', parseInt(e.target.value) || 0)}
            className="w-full px-4 py-2 rounded-lg border border-border focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-colors"
            min={16}
            max={99}
            required
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label htmlFor="university" className="block text-sm font-medium text-text-secondary mb-1.5">
            University
          </label>
          <input
            id="university"
            type="text"
            value={formData.university}
            onChange={(e) => handleChange('university', e.target.value)}
            className="w-full px-4 py-2 rounded-lg border border-border focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-colors"
            required
          />
        </div>
        <div>
          <label htmlFor="major" className="block text-sm font-medium text-text-secondary mb-1.5">
            Major / Field
          </label>
          <input
            id="major"
            type="text"
            value={formData.major}
            onChange={(e) => handleChange('major', e.target.value)}
            className="w-full px-4 py-2 rounded-lg border border-border focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-colors"
            required
          />
        </div>
      </div>

      {/* Tagline */}
      <div>
        <label htmlFor="tagline" className="block text-sm font-medium text-text-secondary mb-1.5">
          Tagline <span className="text-xs text-text-secondary">(e.g., "Designer · Developer · Dreamer")</span>
        </label>
        <input
          id="tagline"
          type="text"
          value={formData.tagline}
          onChange={(e) => handleChange('tagline', e.target.value)}
          className="w-full px-4 py-2 rounded-lg border border-border focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-colors"
          placeholder="Designer · Developer · Dreamer"
        />
      </div>

      {/* Bio */}
      <div>
        <label htmlFor="bio" className="block text-sm font-medium text-text-secondary mb-1.5">
          Bio
        </label>
        <textarea
          id="bio"
          value={formData.bio}
          onChange={(e) => handleChange('bio', e.target.value)}
          rows={3}
          className="w-full px-4 py-2 rounded-lg border border-border focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-colors resize-y"
          placeholder="Tell others about yourself..."
        />
      </div>

      {/* Interests */}
      <div>
        <label htmlFor="interests" className="block text-sm font-medium text-text-secondary mb-1.5">
          Interests <span className="text-xs text-text-secondary">(comma-separated)</span>
        </label>
        <input
          id="interests"
          type="text"
          value={formData.interests}
          onChange={(e) => handleChange('interests', e.target.value)}
          className="w-full px-4 py-2 rounded-lg border border-border focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-colors"
          placeholder="Design, Development, Music, Sports..."
        />
      </div>

      {/* Looking For */}
      <div>
        <label className="block text-sm font-medium text-text-secondary mb-2">
          Looking For
        </label>
        <div className="flex flex-wrap gap-3">
          {lookingForOptions.map((option) => {
            const isSelected = (formData.lookingFor as string[]).includes(option.value);
            return (
              <button
                key={option.value}
                type="button"
                onClick={() => toggleLookingFor(option.value)}
                className={`px-4 py-2 rounded-lg border-2 transition-all text-sm font-medium ${
                  isSelected
                    ? 'border-primary bg-primary/10 text-primary'
                    : 'border-border bg-white text-text-secondary hover:border-gray-300'
                }`}
              >
                {option.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Actions */}
      <div className="flex gap-3 pt-4 border-t border-border">
        <Button
          type="submit"
          variant="primary"
          isLoading={isSaving}
          disabled={isSaving}
        >
          Save Changes
        </Button>
        <Button
          type="button"
          variant="ghost"
          onClick={onCancel}
          disabled={isSaving}
        >
          Cancel
        </Button>
      </div>
    </form>
  );
}