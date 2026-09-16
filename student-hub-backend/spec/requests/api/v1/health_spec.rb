# frozen_string_literal: true

require "rails_helper"

RSpec.describe "GET /api/v1/health", type: :request do
  it "returns 200 with a health payload without requiring authentication" do
    get "/api/v1/health"

    expect(response).to have_http_status(:ok)

    body = JSON.parse(response.body)
    expect(body["status"]).to eq("ok")
    expect(body["time"]).to be_present
  end
end