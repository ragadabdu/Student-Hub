# frozen_string_literal: true

# Devise configuration for Student Hub.

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
  config.stretches = Rails.env.test? ? 1 : 12

  # Reconfirm on email change — disable for MVP.
  config.reconfirmable = false

  # Time window for password reset.
  config.reset_password_within = 6.hours

  # Sign out via DELETE request.
  config.sign_out_via = :delete

  # API-only: do not attempt HTML redirects on auth failure.
  config.navigational_formats = []
end

# Ensure the User mapping is registered even though we don't use
# devise_for in routes.
#
# This is necessary because Devise's `sign_in`/`sign_out` helpers
# rely on the mapping being registered in Devise.mappings, and our
# custom routes bypass the normal devise_for route generation.
#
# We add the mapping AFTER Devise.setup so that the Warden middleware
# (which is configured during Devise.setup) can find it. The
# `to_prepare` hook ensures the mapping is registered after all models
# are loaded.
Rails.application.config.to_prepare do
  unless Devise.mappings[:user]
    Devise.add_mapping(:user, {
      class_name:   "User",
      router_name:  :main_app,
      path:         "users",
      path_names:   { sign_in: "sign_in", sign_out: "sign_out", sign_up: "sign_up" },
      skip:         :all
    })
  end
end