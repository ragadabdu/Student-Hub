# frozen_string_literal: true

module Projects
  # Replaces a project's skills from an array of names.
  # Existing skills are matched case-insensitively. Names that don't
  # match become new custom skills. Duplicates are collapsed.
  #
  # Also garbage-collects custom skills that were removed and are no
  # longer attached to any project or user.
  #
  # Runs in a transaction. Returns the resulting Skill records ordered
  # alphabetically.
  class SyncSkills
    def self.call(project:, names:)
      new(project: project, names: names).call
    end

    def initialize(project:, names:)
      @project = project
      @names   = Array(names).map(&:to_s).map(&:strip).reject(&:empty?)
    end

    def call
      previous_custom_skill_ids = @project.skills
        .where(is_custom: true)
        .pluck(:id)

      ActiveRecord::Base.transaction do
        @project.project_skills.destroy_all

        deduplicated_names.each do |name|
          skill = find_or_create_skill(name)
          @project.project_skills.create!(skill: skill)
        end

        cleanup_orphaned_custom_skills(previous_custom_skill_ids)
      end

      @project.skills.reload.order(:name)
    end

    private

    def deduplicated_names
      seen = {}
      @names.each do |name|
        key = name.downcase
        seen[key] ||= name
      end
      seen.values
    end

    def find_or_create_skill(name)
      skill = Skill.find_by("LOWER(name) = ?", name.downcase)
      return skill if skill

      Skill.create!(name: name, is_custom: true)
    end

    def cleanup_orphaned_custom_skills(skill_ids)
      return if skill_ids.empty?

      # Only delete custom skills that are no longer attached to any
      # project OR any user. A skill attached to either is still "in use".
      Skill
        .where(id: skill_ids, is_custom: true)
        .where.missing(:project_skills)
        .where.missing(:user_skills)
        .delete_all
    end
  end
end