# frozen_string_literal: true

class BackfillUserSettings < ActiveRecord::Migration[8.1]
  def up
    # For any user without settings, create default settings.
    execute <<~SQL
      INSERT INTO user_settings (
        id, user_id,
        notify_email, notify_push, notify_matches, notify_messages, notify_project_updates,
        show_online_status, show_last_active,
        theme, language, discovery_radius,
        created_at, updated_at
      )
      SELECT
        gen_random_uuid(), users.id,
        TRUE, TRUE, TRUE, TRUE, TRUE,
        TRUE, TRUE,
        'system', 'en', 50,
        NOW(), NOW()
      FROM users
      LEFT JOIN user_settings ON user_settings.user_id = users.id
      WHERE user_settings.id IS NULL
    SQL
  end

  def down
    # No-op: removing settings is destructive (loses preferences).
  end
end