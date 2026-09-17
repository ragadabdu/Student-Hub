# frozen_string_literal: true

# Rate limiting and abuse prevention.
#
# Uses the in-memory cache store for MVP. If we move to a multi-process
# deployment (or want rate limits to span processes), swap to a Redis
# store — but only when we actually need it.
#
# Throttle definitions follow a "safe by default" stance: generous enough
# to not annoy real users, tight enough to stop automated abuse.
#
# Disabled in the test environment. Tests make thousands of requests and
# would trip every throttle. To test rate limiting itself, add a spec
# that temporarily enables Rack::Attack (see spec/requests/rate_limiting_spec.rb).

class Rack::Attack
  ### Configure Cache ###
  # Use Rails' in-memory cache (not shared across processes). Acceptable
  # for MVP; replace with Redis-backed cache for multi-process deployments.
  Rack::Attack.cache.store = ActiveSupport::Cache::MemoryStore.new

  ### Safelist ###
  # Never rate limit health checks (load balancers will hammer them).
  safelist("health check") do |req|
    req.path == "/up" || req.path == "/api/v1/health"
  end

  ### Throttles ###

  # Login: 10 attempts per 20 seconds per IP.
  # Prevents password brute-force.
  throttle("login/ip", limit: 10, period: 20.seconds) do |req|
    if req.path == "/api/v1/auth/login" && req.post?
      req.ip
    end
  end

  # Login: 5 attempts per 20 seconds per email.
  # Prevents targeted brute-force against a single account, even from
  # many IPs.
  throttle("login/email", limit: 5, period: 20.seconds) do |req|
    if req.path == "/api/v1/auth/login" && req.post?
      req.params.dig("user", "email")&.downcase
    end
  end

  # Register: 5 per hour per IP.
  # Prevents mass account creation.
  throttle("register/ip", limit: 5, period: 1.hour) do |req|
    if req.path == "/api/v1/auth/register" && req.post?
      req.ip
    end
  end

  # Password reset requests: 5 per hour per IP.
  throttle("password_reset/ip", limit: 5, period: 1.hour) do |req|
    if req.path =~ %r{/api/v1/auth/password} && req.post?
      req.ip
    end
  end

  # Discovery actions: 100 per minute per user.
  # Prevents scripted mass-swipe.
  throttle("discovery/user", limit: 100, period: 1.minute) do |req|
    if req.path =~ %r{/api/v1/discovery/.*/(pass|connect|super_connect)} && req.post?
      req.env["warden"]&.user&.id || req.ip
    end
  end

  # Messages: 60 per minute per user.
  # Prevents spam.
  throttle("messages/user", limit: 60, period: 1.minute) do |req|
    if req.path =~ %r{/api/v1/conversations/.*/messages} && req.post?
      req.env["warden"]&.user&.id || req.ip
    end
  end

  # Global fallback: 300 requests per 5 minutes per IP.
  # Catches any endpoint we haven't explicitly throttled.
  throttle("global/ip", limit: 300, period: 5.minutes) do |req|
    req.ip
  end

  ### Custom response ###
  # Return our standard error envelope for throttled requests.
  self.throttled_responder = lambda do |request|
    retry_after = request.env["rack.attack.match_data"]&.fetch(:period, 60) || 60

    [
      429,
      {
        "Content-Type" => "application/json",
        "Retry-After"  => retry_after.to_s
      },
      [{ error: { code: "RATE_LIMITED", message: "Too many requests. Please try again later." } }.to_json]
    ]
  end
end

# Disable rate limiting in the test environment.
# Tests make thousands of requests; enforcing rate limits during tests
# would produce spurious 429s. Rate limiting is verified separately via
# a dedicated spec that temporarily re-enables it.
Rack::Attack.enabled = !Rails.env.test? if defined?(Rack::Attack)