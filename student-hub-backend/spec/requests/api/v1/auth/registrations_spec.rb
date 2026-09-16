# frozen_string_literal: true

require "rails_helper"

RSpec.describe "POST /api/v1/auth/register", type: :request do
  let(:valid_params) do
    {
      user: {
        email: "new_student@example.com",
        password: "password123",
        password_confirmation: "password123"
      }
    }
  end

  describe "with valid parameters" do
    it "creates a new user" do
      expect {
        post "/api/v1/auth/register", params: valid_params, as: :json
      }.to change(User, :count).by(1)

      expect(response).to have_http_status(:created)

      body = JSON.parse(response.body)
      expect(body["user"]["email"]).to eq("new_student@example.com")
      expect(body["user"]["id"]).to be_present
      expect(body["user"]).not_to have_key("encrypted_password")
    end

    it "creates a profile for the new user" do
      expect {
        post "/api/v1/auth/register", params: valid_params, as: :json
      }.to change(Profile, :count).by(1)
    end

    it "signs the user in (sets session cookie)" do
      post "/api/v1/auth/register", params: valid_params, as: :json

      # Subsequent request should identify as the new user
      get "/api/v1/auth/me"
      expect(response).to have_http_status(:ok)

      body = JSON.parse(response.body)
      expect(body["user"]["email"]).to eq("new_student@example.com")
    end
  end

  describe "with invalid parameters" do
    it "rejects duplicate email" do
      create(:user, email: "new_student@example.com")

      post "/api/v1/auth/register", params: valid_params, as: :json

      expect(response).to have_http_status(:unprocessable_content)

      body = JSON.parse(response.body)
      expect(body["error"]["code"]).to eq("VALIDATION_ERROR")
      expect(body["error"]["details"]["email"]).to be_present
    end

    it "rejects missing email" do
      params = { user: { email: "", password: "password123", password_confirmation: "password123" } }

      post "/api/v1/auth/register", params: params, as: :json

      expect(response).to have_http_status(:unprocessable_content)
      body = JSON.parse(response.body)
      expect(body["error"]["details"]).to have_key("email")
    end

    it "rejects short password" do
      params = {
        user: { email: "short@example.com", password: "abc", password_confirmation: "abc" }
      }

      post "/api/v1/auth/register", params: params, as: :json

      expect(response).to have_http_status(:unprocessable_content)
      body = JSON.parse(response.body)
      expect(body["error"]["details"]).to have_key("password")
    end

    it "rejects mismatched password confirmation" do
      params = {
        user: {
          email: "mismatch@example.com",
          password: "password123",
          password_confirmation: "different"
        }
      }

      post "/api/v1/auth/register", params: params, as: :json

      expect(response).to have_http_status(:unprocessable_content)
      body = JSON.parse(response.body)
      expect(body["error"]["details"]).to have_key("password_confirmation")
    end

    it "rejects missing user key" do
      post "/api/v1/auth/register", params: {}, as: :json
      
      expect(response).to have_http_status(:bad_request)
      body = JSON.parse(response.body)
      expect(body["error"]["code"]).to eq("MISSING_PARAMETER")
    end
  end
end