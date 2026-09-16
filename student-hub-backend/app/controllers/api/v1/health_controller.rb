# frozen_string_literal: true

module Api
  module V1
    # Health endpoint. Public — does not require authentication.
    # Inherits from the top-level ApplicationController so it doesn't
    # pick up Api::V1::ApplicationController's `authenticate_user!` guard.
    class HealthController < ::ApplicationController
      def show
        render json: { status: "ok", time: Time.current.iso8601 }
      end
    end
  end
end