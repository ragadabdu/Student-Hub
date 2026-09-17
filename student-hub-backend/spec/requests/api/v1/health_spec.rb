# frozen_string_literal: true

require "rails_helper"

RSpec.describe "GET /api/v1/health", type: :request do
  it "returns 200 when the database is reachable" do
    get "/api/v1/health"

    expect(response).to have_http_status(:ok)
    body = JSON.parse(response.body)
    expect(body["status"]).to eq("ok")
    expect(body["checks"]["database"]).to eq("ok")
    expect(body["time"]).to be_present
  end

  it "returns 503 when the database is unreachable" do
    # Simulate DB failure by making the connection raise on `select_value`.
    allow_any_instance_of(ActiveRecord::ConnectionAdapters::AbstractAdapter)
      .to receive(:select_value)
      .and_raise(ActiveRecord::ConnectionNotEstablished.new("simulated failure"))

    get "/api/v1/health"

    expect(response).to have_http_status(:service_unavailable)
    body = JSON.parse(response.body)
    expect(body["status"]).to eq("degraded")
    expect(body["checks"]["database"]).to eq("unreachable")
  end
end