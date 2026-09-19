import { useState, type FormEvent } from 'react';
import type { LookingFor } from '../../../types/user';
import type { UpdateProfilePayload } from '../../../services/profiles';
import { Button } from '../../ui/Button/Button';

interface ProfileEditFormProps {
  // Initial values (from the current profile).
  initial: {
    name: string | null;
    birthdate: string | null;
    university: string | null;
    major: string | null;
    bio: string | null;
    tagline: string | null;
    lookingFor: LookingFor;
    interests: string[]; // names only
    skills: string[];    // names only
  };
  onSave: (payload: UpdateProfilePayload, interestNames: string[], skillNames: string[]) => void;
  onCancel: () => void;
  isSaving: boolean;
}

const lookingForOptions: { value: LookingFor; label: string }[] = [
  { value: 'friends', label: '🤝 Friends' },
  { value: 'project_collaborators', label: '💻 Project teammates' },
  { value: 'study_buddies', label: '☕ Study buddies' },
  { value: 'mentors', label: '🧠 Mentors' },
];

export function ProfileEditForm({
  initial,
  onSave,
  onCancel,
  isSaving,
}: ProfileEditFormProps) {
  const [name, setName] = useState(initial.name ?? '');
  const [birthdate, setBirthdate] = useState(initial.birthdate ?? '');
  const [university, setUniversity] = useState(initial.university ?? '');
  const [major, setMajor] = useState(initial.major ?? '');
  const [bio, setBio] = useState(initial.bio ?? '');
  const [tagline, setTagline] = useState(initial.tagline ?? '');
  const [interestsText, setInterestsText] = useState(initial.interests.join(', '));
  const [skillsText, setSkillsText] = useState(initial.skills.join(', '));
  const [lookingFor, setLookingFor] = useState<LookingFor>(initial.lookingFor);

  function parseCommaSeparated(text: string): string[] {
    return text
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean);
  }

  function handleSubmit(e: FormEvent) {
    e.preventDefault();

    const profilePayload: UpdateProfilePayload = {
      name: name.trim() || undefined,
      birthdate: birthdate || null,
      university: university.trim() || null,
      major: major.trim() || null,
      bio: bio.trim() || null,
      tagline: tagline.trim() || null,
      lookingFor,
    };

    onSave(
      profilePayload,
      parseCommaSeparated(interestsText),
      parseCommaSeparated(skillsText),
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Name + Birthdate */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label htmlFor="name" className="block text-sm font-medium text-text-secondary mb-1.5">
            Full Name
          </label>
          <input
            id="name"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full px-4 py-2 rounded-lg border border-border focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-colors"
          />
        </div>
        <div>
          <label htmlFor="birthdate" className="block text-sm font-medium text-text-secondary mb-1.5">
            Date of Birth
          </label>
          <input
            id="birthdate"
            type="date"
            value={birthdate}
            onChange={(e) => setBirthdate(e.target.value)}
            max={new Date().toISOString().split('T')[0]}
            className="w-full px-4 py-2 rounded-lg border border-border focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-colors"
          />
        </div>
      </div>

      {/* University + Major */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label htmlFor="university" className="block text-sm font-medium text-text-secondary mb-1.5">
            University
          </label>
          <input
            id="university"
            type="text"
            value={university}
            onChange={(e) => setUniversity(e.target.value)}
            className="w-full px-4 py-2 rounded-lg border border-border focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-colors"
          />
        </div>
        <div>
          <label htmlFor="major" className="block text-sm font-medium text-text-secondary mb-1.5">
            Major / Field
          </label>
          <input
            id="major"
            type="text"
            value={major}
            onChange={(e) => setMajor(e.target.value)}
            className="w-full px-4 py-2 rounded-lg border border-border focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-colors"
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
          value={tagline}
          onChange={(e) => setTagline(e.target.value)}
          maxLength={160}
          className="w-full px-4 py-2 rounded-lg border border-border focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-colors"
        />
      </div>

      {/* Bio */}
      <div>
        <label htmlFor="bio" className="block text-sm font-medium text-text-secondary mb-1.5">
          Bio
        </label>
        <textarea
          id="bio"
          value={bio}
          onChange={(e) => setBio(e.target.value)}
          rows={3}
          maxLength={500}
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
          value={interestsText}
          onChange={(e) => setInterestsText(e.target.value)}
          className="w-full px-4 py-2 rounded-lg border border-border focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-colors"
          placeholder="Design, Development, Music, Sports..."
        />
      </div>

      {/* Skills */}
      <div>
        <label htmlFor="skills" className="block text-sm font-medium text-text-secondary mb-1.5">
          Skills <span className="text-xs text-text-secondary">(comma-separated)</span>
        </label>
        <input
          id="skills"
          type="text"
          value={skillsText}
          onChange={(e) => setSkillsText(e.target.value)}
          className="w-full px-4 py-2 rounded-lg border border-border focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-colors"
          placeholder="Python, React, Figma, Public Speaking..."
        />
      </div>

      {/* Looking For (single-select) */}
      <div>
        <label className="block text-sm font-medium text-text-secondary mb-2">
          Looking For
        </label>
        <div className="flex flex-wrap gap-3">
          {lookingForOptions.map((option) => {
            const isSelected = lookingFor === option.value;
            return (
              <button
                key={option.value}
                type="button"
                onClick={() => setLookingFor(option.value)}
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
        <Button type="submit" variant="primary" isLoading={isSaving} disabled={isSaving}>
          Save Changes
        </Button>
        <Button type="button" variant="ghost" onClick={onCancel} disabled={isSaving}>
          Cancel
        </Button>
      </div>
    </form>
  );
}
