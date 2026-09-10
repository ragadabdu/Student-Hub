# frozen_string_literal: true

class ApplicationController < ActionController::Base
  # API-focused error handling. All responses are JSON.
  #
  # Error response format:
  #   {
  #     "error": {
  #       "code":    "MACHINE_READABLE_CODE",
  #       "message": "Human-readable message",
  #       "details": { ... optional structured details ... }
  #     }
  #   }

  # CSRF: API-only clients that authenticate with cookies MUST send
  # the CSRF token on state-changing requests. React will read it from
  # the `XSRF-TOKEN` cookie and echo it in the `X-CSRF-Token` header.
  protect_from_forgery with: :null_session, if: :json_request?

  # JSON is the only response format we support.
  respond_to :json

  rescue_from StandardError,                       with: :handle_internal_error
  rescue_from ActiveRecord::RecordNotFound,        with: :handle_not_found
  rescue_from ActiveRecord::RecordInvalid,         with: :handle_record_invalid
  rescue_from ActionController::ParameterMissing,  with: :handle_parameter_missing
  rescue_from ActionController::BadRequest,        with: :handle_bad_request

  private

  def json_request?
    request.format.json?
  end

  def handle_not_found(exception)
    render_error(
      code:    "NOT_FOUND",
      message: "Resource not found",
      details: { model: exception.model },
      status:  :not_found
    )
  end

  def handle_record_invalid(exception)
    render_error(
      code:    "VALIDATION_ERROR",
      message: "Validation failed",
      details: exception.record.errors.to_hash,
      status:  :unprocessable_entity
    )
  end

  def handle_parameter_missing(exception)
    render_error(
      code:    "MISSING_PARAMETER",
      message: "Missing required parameter: #{exception.param}",
      details: { param: exception.param },
      status:  :bad_request
    )
  end

  def handle_bad_request(exception)
    render_error(
      code:    "BAD_REQUEST",
      message: exception.message,
      status:  :bad_request
    )
  end

  def handle_internal_error(exception)
    # Log the full error for operators; return a generic message to clients.
    Rails.logger.error("#{exception.class}: #{exception.message}")
    Rails.logger.error(exception.backtrace&.join("\n"))

    render_error(
      code:    "INTERNAL_ERROR",
      message: "An unexpected error occurred",
      status:  :internal_server_error
    )
  end

  def render_error(code:, message:, status:, details: nil)
    payload = { error: { code: code, message: message } }
    payload[:error][:details] = details if details
    render json: payload, status: status
  end
end
