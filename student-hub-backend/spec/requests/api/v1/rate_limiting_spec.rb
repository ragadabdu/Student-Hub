# frozen_string_literal: true

require "rails_helper"

RSpec.describe "Rate limiting", type: :request do
  # Enable rack-attack just for these specs. Everything else runs with
  # it disabled (see config/initializers/rack_attack.rb).
  around do |example|
    original = Rack::Attack.enabled
    Rack::Attack.enabled = true
    Rack::Attack.cache.store.clear
    example.run
  ensure
    Rack::Attack.cache.store.clear
    Rack::Attack.enabled = original
  end

  describe "login throttling" do
    it "throttles repeated login attempts by IP" do
      # The IP-based throttle allows 10 requests per 20 seconds.
      # Make 11 requests; the last should be throttled.
      11.times do |i|
        post "/api/v1/auth/login", params: {
          user: { email: "nonexistent#{i}@example.com", password: "wrong" }
        }, as: :json
      end

      expect(response).to have_http_status(:too_many_requests)
      body = JSON.parse(response.body)
      expect(body["error"]["code"]).to eq("RATE_LIMITED")
    end

    it "includes a Retry-After header when throttled" do
      11.times do
        post "/api/v1/auth/login", params: {
          user: { email: "x@example.com", password: "wrong" }
        }, as: :json
      end

      expect(response.headers["Retry-After"]).to be_present
    end
  end

  describe "registration throttling" do
    it "throttles repeated registration attempts by IP" do
      # Register: 5 per hour. Make 6 requests; the last should be throttled.
      6.times do |i|
        post "/api/v1/auth/register", params: {
          user: {
            email: "reg#{i}@example.com",
            password: "password123",
            password_confirmation: "password123"
          }
        }, as: :json
      end

      expect(response).to have_http_status(:too_many_requests)
    end
  end

  describe "health check safelist" do
    it "does not throttle health checks" do
      50.times do
        get "/api/v1/health"
      end

      expect(response).to have_http_status(:ok)
    end
  end
end