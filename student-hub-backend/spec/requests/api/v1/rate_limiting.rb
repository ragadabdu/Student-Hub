# spec/requests/rate_limiting_spec.rb

RSpec.describe "Rate limiting", type: :request do
  around do |example|
    original = Rack::Attack.enabled
    Rack::Attack.enabled = true
    Rack::Attack.cache.store.clear  # start fresh
    example.run
  ensure
    Rack::Attack.enabled = original
  end

  it "throttles repeated login attempts" do
    11.times do
      post "/api/v1/auth/login", params: { user: { email: "x@example.com", password: "wrong" } }, as: :json
    end
    expect(response).to have_http_status(:too_many_requests)
  end
end