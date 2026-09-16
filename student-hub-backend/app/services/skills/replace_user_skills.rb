# frozen_string_literal: true

module Skills
  class ReplaceUserSkills
    def self.call(user:, names:)
      new(user: user, names: names).call
    end

    def initialize(user:, names:)
      @user  = user
      @names = Array(names).map(&:to_s).map(&:strip).reject(&:empty?)
    end

    def call
      previous_custom_skill_ids = @user.skills
        .where(is_custom: true)
        .pluck(:id)

      ActiveRecord::Base.transaction do
        @user.user_skills.destroy_all

        deduplicated_names.each do |name|
          skill = find_or_create_skill(name)
          @user.user_skills.create!(skill: skill)
        end

        cleanup_orphaned_custom_skills(previous_custom_skill_ids)
      end

      @user.skills.reload.order(:name)
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

      Skill
        .where(id: skill_ids, is_custom: true)
        .where.missing(:user_skills)
        .delete_all
    end
  end
end