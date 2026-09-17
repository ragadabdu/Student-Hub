# frozen_string_literal: true

module Api
  module V1
    class DiscoveryController < ApplicationController
      # GET /api/v1/discovery
      #
      # Returns discoverable profiles excluding:
      #   - the current user
      #   - users the current user has already acted on (pass/connect/etc.)
      #   - private profiles and users opted out of Explore
      def index
        acted_on_ids = Connection
          .from_user(current_user.id)
          .select(:target_user_id)

        scope = Profile
          .discoverable
          .where.not(user_id: current_user.id)
          .where.not(user_id: acted_on_ids)
          .includes(user: [:interests, :skills, :portfolio_links])
          .order(created_at: :desc)

        result = Pagination.paginate(
          scope,
          page:     params[:page],
          per_page: params[:per_page]
        )

        profiles = ActiveModelSerializers::SerializableResource.new(
          result[:records],
          each_serializer: ProfileSerializer
        ).as_json

        render json: {
          profiles: profiles,
          meta:     result[:meta]
        }
      end

      # POST /api/v1/discovery/:user_id/pass
      def pass
        act(:pass)
      end

      # POST /api/v1/discovery/:user_id/connect
      def connect
        act(:connect)
      end

      # POST /api/v1/discovery/:user_id/super_connect
      def super_connect
        act(:super_connect)
      end

      private

      def act(action)
        return render_self_action_error if params[:user_id] == current_user.id

        target = find_target_user!

        result = Connections::RecordAction.call(
          user:        current_user,
          target_user: target,
          action:      action
        )

        serialized_connection = ActiveModelSerializers::SerializableResource.new(
          result[:connection],
          serializer: ConnectionSerializer
        ).as_json

        payload = {
          connection:    serialized_connection,
          match_created: result[:match_created]
        }

        if result[:match].present?
          payload[:match] = ActiveModelSerializers::SerializableResource.new(
            result[:match],
            serializer: MatchSerializer,
            viewer:     current_user
          ).as_json
        end

        render json: payload, status: :ok
      end

      def render_self_action_error
        render_error(
          code:    "SELF_ACTION_FORBIDDEN",
          message: "You cannot interact with yourself",
          status:  :unprocessable_content
        )
      end

      # Finds the target user. Raises RecordNotFound (→ 404) if:
      #   - the user doesn't exist
      #   - the user's profile is missing or private
      # Both cases return 404 to avoid leaking whether a private profile exists.
      def find_target_user!
        target = User.includes(:profile).find_by(id: params[:user_id])

        unless target
          raise ActiveRecord::RecordNotFound.new("User not found", "User")
        end

        profile = target.profile
        if profile.nil? || profile.profile_visibility_private_profile?
          raise ActiveRecord::RecordNotFound.new("User not found", "User")
        end

        target
      end
    end
  end
end
