# frozen_string_literal: true

module Api
  module V1
    module Me
      class ProfilesController < ApplicationController
        # GET /api/v1/me/profile
        def show
          serialized = ActiveModelSerializers::SerializableResource.new(
            current_user.profile,
            serializer: ProfileSerializer,
            include_portfolio_links: true
          ).as_json

          render json: { profile: serialized }
        end

        # PATCH /api/v1/me/profile
        def update
          profile = current_user.profile

          if profile.update(profile_params)
            serialized = ActiveModelSerializers::SerializableResource.new(
              profile,
              serializer: ProfileSerializer,
              include_portfolio_links: true
            ).as_json

            render json: { profile: serialized }
          else
            render_error(
              code:    "VALIDATION_ERROR",
              message: "Profile could not be updated",
              details: profile.errors.to_hash,
              status:  :unprocessable_content
            )
          end
        end

        private

        def profile_params
          params.require(:profile).permit(
            :name,
            :birthdate,
            :university,
            :major,
            :tagline,
            :bio,
            :looking_for,
            :profile_visibility,
            :show_on_explore
          )
        end
      end
    end
  end
end