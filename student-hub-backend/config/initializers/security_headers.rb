# frozen_string_literal: true

# Security headers applied to every response.
#
# Rails 8 sets some sensible defaults via ActionDispatch::DefaultHeaders.
# This initializer ADDS headers we consider important for the API.
#
# Not included (handled elsewhere):
#   - HSTS: only when serving over HTTPS in production (see below)
#   - CSP: not applicable (API-only, no HTML responses)
#   - X-Frame-Options: Rails sets SAMEORIGIN by default; fine for API

Rails.application.config.action_dispatch.default_headers.merge!(
  # Don't let browsers sniff content types. Prevents a JSON response from
  # being interpreted as executable content.
  "X-Content-Type-Options" => "nosniff",

  # Disallow embedding this API in iframes (defense in depth).
  "X-Frame-Options" => "DENY",

  # Modern replacement for X-Frame-Options. `none` blocks all framing.
  "Content-Security-Policy" => "frame-ancestors 'none'",

  # Don't send the full URL as referrer to other origins. Prevents
  # leaking tokens in URLs to third-party sites.
  "Referrer-Policy" => "strict-origin-when-cross-origin",

  # Disable legacy XSS-auditing header (browsers deprecated this; can
  # cause harm in some cases). Explicitly disable.
  "X-XSS-Protection" => "0",

  # Restrict what browser features this API is allowed to use when
  # fetched (doesn't apply to JSON responses but harmless).
  "Permissions-Policy" => "camera=(), microphone=(), geolocation=()"
)

# In production, force HTTPS and enable HSTS.
if Rails.env.production?
  Rails.application.config.force_ssl = true
  Rails.application.config.ssl_options = { hsts: { subdomains: true, preload: true } }
end