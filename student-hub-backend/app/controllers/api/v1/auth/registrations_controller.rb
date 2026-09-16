# frozen_string_literal: true

module Api
  module V1
    module Auth
      class RegistrationsController < ::Api::V1::ApplicationController
        # POST /api/v1/auth/register
        #
        # Body:
        #   { "user": { "email", "password", "password_confirmation" } }
        #
        # Success: 201 with { "user": { ... } }
        # Failure: 422 with error envelope

        # Registration creates a session via the cookie jar. It has no
        # prior session, so there is no CSRF state to protect against.
        # (An attacker can't force a victim to register an account they
        # don't control, unlike the login-CSRF scenario.)
        skip_before_action :authenticate_user!,        only: :create
        skip_before_action :verify_authenticity_token, only: :create

        def create
          user = User.new(sign_up_params)

          if user.save
            # sign_in sets the session cookie via Devise/Warden.
            sign_in(user, scope: :user)

            render json: { user: user_payload(user) }, status: :created
          else
            render_error(
              code:    "VALIDATION_ERROR",
              message: "Registration failed",
              details: user.errors.to_hash,
              status:  :unprocessable_content
            )
          end
        end

        private

        def sign_up_params
          params.require(:user).permit(:email, :password, :password_confirmation)
        end

        def user_payload(user)
          {
            id:         user.id,
            email:      user.email,
            created_at: user.created_at.iso8601
          }
        end
      end
    end
  end
end