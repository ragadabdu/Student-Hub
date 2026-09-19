# frozen_string_literal: true

module Api
  module V1
    module Auth
      class SessionsController < ::Api::V1::ApplicationController
        skip_before_action :authenticate_user!,        only: :create
        skip_before_action :verify_authenticity_token, only: :create

        # POST /api/v1/auth/login
        def create
          user = User.find_by(email: login_params[:email]&.downcase)

          if user&.valid_password?(login_params[:password])
            sign_in(user, scope: :user)
            render json: { user: user_payload(user) }, status: :ok
          else
            render_error(
              code:    "INVALID_CREDENTIALS",
              message: "Invalid email or password",
              status:  :unauthorized
            )
          end
        end

        # DELETE /api/v1/auth/logout
        def destroy
          unless user_signed_in?
            return render_error(
              code:    "UNAUTHORIZED",
              message: "Authentication required",
              status:  :unauthorized
            )
          end

          sign_out(current_user)
          head :no_content
        end

        # GET /api/v1/auth/me
        def show
          if user_signed_in?
            render json: { user: user_payload(current_user, include_profile: true) }, status: :ok
          else
            render_error(
              code:    "UNAUTHORIZED",
              message: "Authentication required",
              status:  :unauthorized
            )
          end
        end

        private

        def login_params
          params.require(:user).permit(:email, :password)
        end

        # Payload shape for both /auth/login and /auth/me.
        #
        # When `include_profile` is true, the profile is serialized via
        # the canonical ProfileSerializer — the same one used by
        # /api/v1/me/profile and /api/v1/profiles/:id. This keeps the
        # profile shape identical across the API, so the frontend doesn't
        # have to guess which endpoint returns which fields.
        def user_payload(user, include_profile: false)
          payload = {
            id:         user.id,
            email:      user.email,
            name:       user.name,
            created_at: user.created_at.iso8601
          }

          if include_profile && (profile = user.profile)
            payload[:profile] = ActiveModelSerializers::SerializableResource.new(
              profile,
              serializer: ProfileSerializer,
              include_portfolio_links: true
            ).as_json
          end

          payload
        end
      end
    end
  end
end
