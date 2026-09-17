# frozen_string_literal: true

module Connections
  class RecordAction
    ALLOWED_ACTIONS = %i[pass connect super_connect].freeze
    POSITIVE_ACTIONS = %i[connect super_connect].freeze

    def self.call(user:, target_user:, action:)
      new(user: user, target_user: target_user, action: action).call
    end

    def initialize(user:, target_user:, action:)
      @user        = user
      @target_user = target_user
      @action      = action.to_sym
    end

    def call
      unless ALLOWED_ACTIONS.include?(@action)
        raise ArgumentError, "Invalid action: #{@action}"
      end

      if @user.id == @target_user.id
        raise ArgumentError, "Cannot act on yourself"
      end

      connection = nil
      match      = nil

      ActiveRecord::Base.transaction do
        connection = Connection.find_or_initialize_by(
          user_id:        @user.id,
          target_user_id: @target_user.id
        )
        connection.status = @action
        connection.save!

        # Match detection: only positive actions can create matches.
        # A "match" requires BOTH sides to have a positive action toward
        # each other.
        if POSITIVE_ACTIONS.include?(@action) && mutual_positive_connection_exists?
          match = Match.create_between!(@user, @target_user)
        end
      end

      {
        connection:    connection,
        match:         match,
        match_created: match.present?
      }
    end

    private

    def mutual_positive_connection_exists?
      Connection
        .where(user_id:        @target_user.id,
               target_user_id: @user.id,
               status:         POSITIVE_ACTIONS)
        .exists?
    end
  end
end