# frozen_string_literal: true

module Connections
  # Records a single directional action (pass / connect / super_connect)
  # from `user` on `target_user`.
  #
  # Semantics:
  #   - Idempotent per pair: at most one Connection row exists for
  #     (user, target_user). A subsequent action updates the existing row
  #     rather than creating a new one.
  #   - Last action wins: connecting then passing leaves status=:pass.
  #
  # Returns a hash:
  #   { connection: Connection, match_created: Boolean }
  #
  # `match_created` is always false in Phase 4. It will be used in Phase 5
  # when we implement mutual-connection detection.
  class RecordAction
    ALLOWED_ACTIONS = %i[pass connect super_connect].freeze

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

      ActiveRecord::Base.transaction do
        connection = Connection.find_or_initialize_by(
          user_id:        @user.id,
          target_user_id: @target_user.id
        )

        connection.status = @action
        connection.save!
      end

      # Phase 5: check for mutual connection here and possibly create a Match.
      match_created = false

      { connection: connection, match_created: match_created }
    end
  end
end
