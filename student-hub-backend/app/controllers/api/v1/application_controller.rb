# frozen_string_literal: true

module Api
  module V1
    class ApplicationController < ::ApplicationController
      # All responses from API controllers are JSON, and errors are
      # rendered in a consistent envelope:
      #
      #   { "error": { "code": "...", "message": "...", "details": {...} } }
      #
      # Every API controller inherits:
      #   - Error handling (NOT_FOUND, VALIDATION_ERROR, etc.)
      #   - `authenticate_user!` for protected endpoints
      #   - `current_user` accessor
      #   - The XSRF-TOKEN cookie (non-HttpOnly) for CSRF

      # ------------------------------------------------------------------
      # CSRF
      # ------------------------------------------------------------------
      # We set an XSRF-TOKEN cookie on every response so the SPA can read
      # it from document.cookie and echo it back in the X-CSRF-Token header.
      # This is the standard Rails+SPA pattern — the cookie is NOT the
      # session, just the anti-CSRF token.
      after_action :set_xsrf_cookie

      # Every API controller requires authentication by default.
      # Public endpoints (register, login, health) skip this explicitly.
      before_action :authenticate_user!

      # ------------------------------------------------------------------
      # Error handling
      # ------------------------------------------------------------------
      rescue_from StandardError,                              with: :render_internal_error
      rescue_from ActiveRecord::RecordNotFound,               with: :render_not_found
      rescue_from ActiveRecord::RecordInvalid,                with: :render_record_invalid
      rescue_from ActionController::ParameterMissing,         with: :render_parameter_missing
      rescue_from ActionController::InvalidAuthenticityToken, with: :render_csrf_failure

      # ------------------------------------------------------------------
      # Authentication helpers
      # ------------------------------------------------------------------
      # `authenticate_user!` is provided by Devise. It will call
      # `unauthorized_response` (below) instead of trying to redirect.
      
      # Override Devise's default `authenticate_user!` so unauthenticated
      # requests get our JSON error envelope instead of a redirect.
      # Every API controller inherits this.
      def authenticate_user!
        return if user_signed_in?

        render_error(
          code:    "UNAUTHORIZED",
          message: "Authentication required",
          status:  :unauthorized
        )
      end

      private

      def set_xsrf_cookie
        # form_authenticity_token may not be available if the session
        # isn't loaded, so guard against nil.
        return if request.get? && response.status >= 400

        cookies["XSRF-TOKEN"] = {
          value:     form_authenticity_token,
          same_site: :lax,
          secure:    Rails.env.production?,
          httponly:  false  # React MUST be able to read this
        }
      end

      def render_not_found(exception)
        render_error(
          code:    "NOT_FOUND",
          message: "Resource not found",
          details: { model: exception.model },
          status:  :not_found
        )
      end

      def render_record_invalid(exception)
        render_error(
          code:    "VALIDATION_ERROR",
          message: "Validation failed",
          details: exception.record.errors.to_hash,
          status:  :unprocessable_content
        )
      end

      def render_parameter_missing(exception)
        render_error(
          code:    "MISSING_PARAMETER",
          message: "Missing required parameter: #{exception.param}",
          details: { param: exception.param },
          status:  :bad_request
        )
      end

      def render_csrf_failure(_exception)
        render_error(
          code:    "CSRF_INVALID",
          message: "CSRF token is missing or invalid",
          status:  :unprocessable_content
        )
      end

      def render_error(code:, message:, status:, details: nil)
        payload = { error: { code: code, message: message } }
        payload[:error][:details] = details if details
        render json: payload, status: status
      end

      def render_internal_error(exception)
        if Rails.env.test? || Rails.env.development?
          render json: {
            error: {
              code:    "INTERNAL_ERROR",
              message: exception.message,
              details: {
                class:     exception.class.name,
                backtrace: exception.backtrace&.first(10)
              }
            }
          }, status: :internal_server_error
        else
          Rails.logger.error("#{exception.class}: #{exception.message}")
          Rails.logger.error(exception.backtrace&.join("\n"))
          render_error(
            code:    "INTERNAL_ERROR",
            message: "An unexpected error occurred",
            status:  :internal_server_error
          )
        end
      end
    end
  end
end