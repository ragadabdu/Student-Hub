# frozen_string_literal: true

module Interests
  class ReplaceUserInterests
    def self.call(user:, names:)
      new(user: user, names: names).call
    end

    def initialize(user:, names:)
      @user  = user
      @names = Array(names).map(&:to_s).map(&:strip).reject(&:empty?)
    end

    def call
      # Capture the old custom interest IDs before replacing them, so
      # we can garbage-collect any that end up orphaned.
      previous_custom_interest_ids = @user.interests
        .where(is_custom: true)
        .pluck(:id)

      ActiveRecord::Base.transaction do
        @user.user_interests.destroy_all

        deduplicated_names.each do |name|
          interest = find_or_create_interest(name)
          @user.user_interests.create!(interest: interest)
        end

        cleanup_orphaned_custom_interests(previous_custom_interest_ids)
      end

      @user.interests.reload.order(:name)
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

    def find_or_create_interest(name)
      interest = Interest.find_by("LOWER(name) = ?", name.downcase)
      return interest if interest

      Interest.create!(name: name, is_custom: true)
    end

    def cleanup_orphaned_custom_interests(interest_ids)
      return if interest_ids.empty?

      # Only delete custom interests that are no longer attached to any user
      Interest
        .where(id: interest_ids, is_custom: true)
        .where.missing(:user_interests)
        .delete_all
    end
  end
end