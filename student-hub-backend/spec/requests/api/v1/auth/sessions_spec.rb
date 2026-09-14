# frozen_string_literal: true

require "rails_helper"

RSpec.describe "Authentication sessions", type: :request do
  describe "POST /api/v1/auth/login" do
    let!(:user) { create(:user, email: "alice@example.com", password: "password123") }

    it "authenticates with valid credentials" do
      post "/api/v1/auth/login", params: {
        user: { email: "alice@example.com", password: "password123" }
      }, as: :json

      expect(response).to have_http_status(:ok)
      body = JSON.parse(response.body)
      expect(body["user"]["email"]).to eq("alice@example.com")
      expect(body["user"]).not_to have_key("encrypted_password")
    end

    it "sets a session so subsequent requests are authenticated" do
      post "/api/v1/auth/login", params: {
        user: { email: "alice@example.com", password: "password123" }
      }, as: :json

      get "/api/v1/auth/me"
      expect(response).to have_http_status(:ok)
      expect(JSON.parse(response.body)["user"]["email"]).to eq("alice@example.com")
    end

    it "rejects wrong password with generic message (no enumeration)" do
      post "/api/v1/auth/login", params: {
        user: { email: "alice@example.com", password: "wrong" }
      }, as: :json

      expect(response).to have_http_status(:unauthorized)
      body = JSON.parse(response.body)
      expect(body["error"]["code"]).to eq("INVALID_CREDENTIALS")
      expect(body["error"]["message"]).to eq("Invalid email or password")
    end

    it "rejects unknown email with the same generic message" do
      post "/api/v1/auth/login", params: {
        user: { email: "nobody@example.com", password: "password123" }
      }, as: :json

      expect(response).to have_http_status(:unauthorized)
      body = JSON.parse(response.body)
      expect(body["error"]["code"]).to eq("INVALID_CREDENTIALS")
      expect(body["error"]["message"]).to eq("Invalid email or password")
    end
  end

  describe "DELETE /api/v1/auth/logout" do
    let!(:user) { create(:user, email: "bob@example.com", password: "password123") }

    it "requires authentication" do
      delete "/api/v1/auth/logout"

      expect(response).to have_http_status(:unauthorized)
    end

    it "destroys the session" do
      sign_in(user)

      delete "/api/v1/auth/logout"
      expect(response).to have_http_status(:no_content)

      # Subsequent request should be unauthorized
      get "/api/v1/auth/me"
      expect(response).to have_http_status(:unauthorized)
    end

    it "is idempotent" do
      sign_in(user)
      delete "/api/v1/auth/logout"
      delete "/api/v1/auth/logout"

      # Whatever the second response is, it shouldn't 500
      expect(response.status).to be < 500
    end
  end

  describe "GET /api/v1/auth/me" do
    let!(:user) { create(:user, email: "carol@example.com", password: "password123") }

    it "returns 401 when not signed in" do
      get "/api/v1/auth/me"

      expect(response).to have_http_status(:unauthorized)
      body = JSON.parse(response.body)
      expect(body["error"]["code"]).to eq("UNAUTHORIZED")
    end

    it "returns the current user when signed in" do
      sign_in(user)

      get "/api/v1/auth/me"

      expect(response).to have_http_status(:ok)
      body = JSON.parse(response.body)
      expect(body["user"]["email"]).to eq("carol@example.com")
      expect(body["user"]["id"]).to eq(user.id)
    end

    it "includes the user's profile" do
      user.profile.update!(name: "Carol S.", university: "MIT")

      sign_in(user)
      get "/api/v1/auth/me"

      body = JSON.parse(response.body)
      expect(body["user"]["profile"]).to be_present
      expect(body["user"]["profile"]["name"]).to eq("Carol S.")
      expect(body["user"]["profile"]["university"]).to eq("MIT")
    end
  end
end