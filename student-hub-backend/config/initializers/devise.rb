# frozen_string_literal: true

# Devise configuration for Student Hub.
#
# Key architectural choices reflected here:
#   - Sessions are cookie-based (not JWT).
#   - Cookies are HttpOnly, Secure in production, SameSite=Lax.
#   - CSRF protection is enabled for state-changing requests.
#   - We use Devise modules: database_authenticatable, registerable,
#     recoverable, rememberable, trackable, validatable.

Devise.setup do |config|
  # ==> Mailer
  config.mailer_sender = "no-reply@student-hub.local"

  # ==> ORM
  require "devise/orm/active_record"

  # ==> Configuration for any authentication mechanism
  config.case_insensitive_keys = [:email]
  config.strip_whitespace_keys = [:email]

  # Skip session storage for HTTP auth; keep for database auth.
  config.skip_session_storage = [:http_auth]

  # Password hashing cost (bcrypt).
  # Lower cost in test so specs are fast.
  config.stretches = Rails.env.test? ? 1 : 12

  # Reconfirm on email change — disable for MVP.
  config.reconfirmable = false

  # Time window for password reset.
  config.reset_password_within = 6.hours

  # Sign out via DELETE request (we expose it as an API action).
  config.sign_out_via = :delete

  # ==> Navigation
  # API-only: do not attempt HTML redirects on auth failure.
  config.navigational_formats = []

  # ==> Hotwire / Turbo (not used, API only)
  # Leave defaults.
end
