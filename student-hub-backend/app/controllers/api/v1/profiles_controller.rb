# frozen_string_literal: true

module Api
  module V1
    class ProfilesController < ApplicationController
      # GET /api/v1/profiles
      def index
        scope = Profile
          .discoverable
          .where.not(user_id: current_user.id)
          .includes(user: [:interests, :skills, :portfolio_links])
          .order(created_at: :desc)

        result = Pagination.paginate(
          scope,
          page:     params[:page],
          per_page: params[:per_page]
        )

        # AMS's each_serializer returns the array directly. We wrap it
        # in a hash so we can add the pagination meta alongside.
        profiles = ActiveModelSerializers::SerializableResource.new(
          result[:records],
          each_serializer: ProfileSerializer
        ).as_json

        render json: {
          profiles: profiles,
          meta:     result[:meta]
        }
      end

      # GET /api/v1/profiles/:id
      def show
        profile = Profile.find(params[:id])

        if profile.profile_visibility_private_profile? &&
           profile.user_id != current_user.id
          raise ActiveRecord::RecordNotFound.new("Profile not found", "Profile")
        end

        # Wrap the show response in a `profile` key for consistency.
        serialized = ActiveModelSerializers::SerializableResource.new(
          profile,
          serializer: ProfileSerializer,
          include_portfolio_links: true
        ).as_json

        render json: { profile: serialized }
      end
    end
  end
end