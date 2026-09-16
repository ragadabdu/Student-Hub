# frozen_string_literal: true

module Api
  module V1
    module Auth
      class SessionsController < ::Api::V1::ApplicationController
        # ------------------------------------------------------------------
        # POST /api/v1/auth/login
        # ------------------------------------------------------------------
        # Public endpoint. Login has no prior session to protect, so we
        # skip CSRF here. (Login-CSRF exists as a theoretical attack, but
        # for an MVP it's an acceptable tradeoff; we can revisit.)
        skip_before_action :authenticate_user!,        only: :create
        skip_before_action :verify_authenticity_token, only: :create

        def create
          user = User.find_by(email: login_params[:email]&.downcase)

          # Use Devise's password validation via `valid_password?`
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

        # ------------------------------------------------------------------
        # DELETE /api/v1/auth/logout
        # ------------------------------------------------------------------
        # Requires authentication. CSRF IS enforced here (state-changing
        # request with an active session).
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

        # ------------------------------------------------------------------
        # GET /api/v1/auth/me
        # ------------------------------------------------------------------
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

        def user_payload(user, include_profile: false)
          payload = {
            id:         user.id,
            email:      user.email,
            created_at: user.created_at.iso8601
          }

          if include_profile
            profile = user.profile
            payload[:profile] = if profile
              {
                id:                 profile.id,
                name:               profile.name,
                university:         profile.university,
                major:              profile.major,
                tagline:            profile.tagline,
                bio:                profile.bio,
                looking_for:        profile.looking_for,
                profile_visibility: profile.profile_visibility,
                show_on_explore:    profile.show_on_explore,
                age:                profile.age
              }
            end
          end

          payload
        end
      end
    end
  end
end