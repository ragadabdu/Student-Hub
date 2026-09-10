# app/controllers/api/v1/application_controller.rb
class Api::V1::ApplicationController < ApplicationController
  rescue_from ActiveRecord::RecordNotFound, with: :record_not_found
  rescue_from ActiveRecord::RecordInvalid, with: :record_invalid
  rescue_from ActionController::ParameterMissing, with: :parameter_missing
  
  private
  
  def record_not_found(exception)
    render json: {
      error: {
        code: 'NOT_FOUND',
        message: 'Resource not found',
        details: { model: exception.model }
      }
    }, status: :not_found
  end
  
  def record_invalid(exception)
    render json: {
      error: {
        code: 'VALIDATION_ERROR',
        message: 'Validation failed',
        details: exception.record.errors.messages
      }
    }, status: :unprocessable_entity
  end
  
  def parameter_missing(exception)
    render json: {
      error: {
        code: 'MISSING_PARAMETER',
        message: "Missing parameter: #{exception.param}",
        details: { param: exception.param }
      }
    }, status: :bad_request
  end
  
  def unauthorized(message = 'Unauthorized')
    render json: {
      error: {
        code: 'UNAUTHORIZED',
        message: message
      }
    }, status: :unauthorized
  end
  
  def forbidden(message = 'Forbidden')
    render json: {
      error: {
        code: 'FORBIDDEN',
        message: message
      }
    }, status: :forbidden
  end
end