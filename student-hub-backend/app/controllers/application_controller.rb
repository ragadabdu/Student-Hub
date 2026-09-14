# frozen_string_literal: true

class ApplicationController < ActionController::Base
  # All responses from our API are JSON.
  respond_to :json

  # CSRF protection runs on EVERY state-changing request (POST, PUT,
  # PATCH, DELETE). It is NOT conditional on content type — CSRF is
  # about whether the request carries an unforgeable token tied to
  # the user's session, not about what format the body is in.
  #
  # Endpoints that legitimately need to bypass this (register, login)
  # do so explicitly via `skip_before_action :verify_authenticity_token`.
  protect_from_forgery with: :exception
end