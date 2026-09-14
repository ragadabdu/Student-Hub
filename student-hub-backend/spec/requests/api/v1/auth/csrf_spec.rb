# frozen_string_literal: true

require "rails_helper"

RSpec.describe "CSRF protection", type: :request do
  # CSRF protection is disabled by default in test env (config/environments/test.rb).
  # We enable it for these specific specs so we actually exercise the real
  # production behavior.
  #
  # Setting it on Api::V1::ApplicationController affects all API controllers
  # because class_attribute values are inherited by subclasses.
  around do |example|
    original = ApplicationController.allow_forgery_protection
    ApplicationController.allow_forgery_protection = true
    example.run
  ensure
    ApplicationController.allow_forgery_protection = original
  end

  let!(:user) { create(:user, email: "dave@example.com", password: "password123") }

  describe "on POST /api/v1/auth/login" do
    it "does NOT require a CSRF token (login has no session to protect)" do
      post "/api/v1/auth/login", params: {
        user: { email: "dave@example.com", password: "password123" }
      }, as: :json

      expect(response).to have_http_status(:ok)
    end
  end

  describe "on DELETE /api/v1/auth/logout" do
    it "requires a valid CSRF token" do
      sign_in(user)

      # Force the request format to JSON so `verify_authenticity_token`
      # definitely runs. In production the React client always sends
      # Accept: application/json.
      delete "/api/v1/auth/logout",
             headers: { "X-CSRF-Token" => "bogus" },
             as: :json

      expect(response).to have_http_status(:unprocessable_entity)
        .or have_http_status(:unauthorized)
    end

    it "accepts a valid CSRF token" do
      sign_in(user)

      token = csrf_token_from_session

      delete "/api/v1/auth/logout",
             headers: { "X-CSRF-Token" => token },
             as: :json

      expect(response).to have_http_status(:no_content)
    end
  end
end