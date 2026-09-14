# frozen_string_literal: true

Rails.application.config.session_store :cookie_store,
  key: "_student_hub_session",
  same_site: :lax,
  secure: Rails.env.production?,
  httponly: true,
  expire_after: 2.weeks