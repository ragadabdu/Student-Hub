# frozen_string_literal: true

module RequestHelpers
  # Sign in a user for request specs.
  #
  # Rack::Test maintains a cookie jar per example, so cookies set by
  # one request are automatically sent on subsequent requests.
  def sign_in(user, password: "password123")
    post "/api/v1/auth/login", params: {
      user: { email: user.email, password: password }
    }, as: :json

    expect(response).to have_http_status(:ok),
      "sign_in helper failed: #{response.status} #{response.body}"
  end

  # Fetch the CSRF token that Rails set as the XSRF-TOKEN cookie.
  #
  # After any request that succeeds, our `set_xsrf_cookie` after_action
  # sets `cookies["XSRF-TOKEN"]`. We can read it from the response headers.
  def csrf_token_from_session
    get "/api/v1/auth/me"
    response.cookies["XSRF-TOKEN"]
  end
  
  # Returns the JSON body of the last response, parsed into a Hash.
  def json_response
    JSON.parse(response.body)
  end
end

RSpec.configure do |config|
  config.include RequestHelpers, type: :request
end