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
        #
        # Accepts:
        #   { "user": { "name": "Alice" }, "profile": { "bio": "...", ... } }
        #
        # Name is a User attribute; other fields are Profile attributes.
        # Both are updated atomically in a transaction.
        def update
          profile = current_user.profile

          ActiveRecord::Base.transaction do
            if user_params.present?
              current_user.update!(user_params)
            end
            if profile_params.present?
              profile.update!(profile_params)
            end
          end

          serialized = ActiveModelSerializers::SerializableResource.new(
            profile.reload,
            serializer: ProfileSerializer,
            include_portfolio_links: true
          ).as_json

          render json: { profile: serialized }
        rescue ActiveRecord::RecordInvalid => e
          record = e.record
          render_error(
            code:    "VALIDATION_ERROR",
            message: "Profile could not be updated",
            details: record.errors.to_hash,
            status:  :unprocessable_content
          )
        end

        private

        def user_params
          return {} unless params[:user].present?
          params.require(:user).permit(:name)
        end

        def profile_params
          return {} unless params[:profile].present?
          params.require(:profile).permit(
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