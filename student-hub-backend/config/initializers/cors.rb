# config/initializers/cors.rb
#
# CORS configuration for Student Hub.
#
# Because we use cookie-based session authentication (Devise), we MUST:
#   - set credentials: true
#   - use explicit origins (no wildcards)
#
# The frontend runs on a different origin during development (Vite on :5173)
# and in production (a different subdomain/domain than the API).

Rails.application.config.middleware.insert_before 0, Rack::Cors do
  allow do
    origins_list =
      if Rails.env.production?
        # Explicit production origins only. Set FRONTEND_ORIGIN in the environment.
        [ENV.fetch("FRONTEND_ORIGIN", "https://student-hub.example.com")]
      else
        # Development + test origins (Vite default ports)
        [
          "http://localhost:5173",
          "http://127.0.0.1:5173",
          "http://localhost:5174",
          "http://127.0.0.1:5174"
        ]
      end

    origins(*origins_list)

    resource "*",
      headers: :any,
      methods: [:get, :post, :put, :patch, :delete, :options, :head],
      credentials: true,           # ← Required for cookie auth
      expose: ["Authorization"],   # ← Future-proofing for bearer tokens
      max_age: 86_400              # ← 24h preflight cache
  end
end