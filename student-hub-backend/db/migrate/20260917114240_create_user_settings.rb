# frozen_string_literal: true

class CreateUserSettings < ActiveRecord::Migration[8.1]
  def change
    create_table :user_settings, id: :uuid, default: -> { "gen_random_uuid()" } do |t|
      t.references :user, type: :uuid, null: false,
                          foreign_key: true,
                          index: { unique: true }

      # --- Notifications ---
      t.boolean :notify_email,           null: false, default: true
      t.boolean :notify_push,            null: false, default: true
      t.boolean :notify_matches,         null: false, default: true
      t.boolean :notify_messages,        null: false, default: true
      t.boolean :notify_project_updates, null: false, default: true

      # --- Privacy (per-user, not per-profile) ---
      t.boolean :show_online_status, null: false, default: true
      t.boolean :show_last_active,   null: false, default: true

      # --- Preferences ---
      # theme: "system", "light", "dark"
      t.string  :theme,            null: false, default: "system"
      # ISO 639-1 language code
      t.string  :language,         null: false, default: "en"
      # discovery radius in km
      t.integer :discovery_radius, null: false, default: 50

      t.timestamps null: false
    end

    add_check_constraint :user_settings,
                         "discovery_radius >= 1 AND discovery_radius <= 500",
                         name: "user_settings_discovery_radius_range"

    add_check_constraint :user_settings,
                         "theme IN ('system', 'light', 'dark')",
                         name: "user_settings_theme_values"
  end
end