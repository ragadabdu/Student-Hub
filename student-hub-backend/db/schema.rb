# This file is auto-generated from the current state of the database. Instead
# of editing this file, please use the migrations feature of Active Record to
# incrementally modify your database, and then regenerate this schema definition.
#
# This file is the source Rails uses to define your schema when running `bin/rails
# db:schema:load`. When creating a new database, `bin/rails db:schema:load` tends to
# be faster and is potentially less error prone than running all of your
# migrations from scratch. Old migrations may fail to apply correctly if those
# migrations use external dependencies or application code.
#
# It's strongly recommended that you check this file into your version control system.

ActiveRecord::Schema[8.1].define(version: 2026_09_17_114529) do
  # These are extensions that must be enabled in order to support this database
  enable_extension "pg_catalog.plpgsql"
  enable_extension "pgcrypto"

  create_table "connections", id: :uuid, default: -> { "gen_random_uuid()" }, force: :cascade do |t|
    t.datetime "created_at", null: false
    t.integer "status", default: 0, null: false
    t.uuid "target_user_id", null: false
    t.datetime "updated_at", null: false
    t.uuid "user_id", null: false
    t.index ["target_user_id", "user_id"], name: "index_connections_on_target_and_user"
    t.index ["target_user_id"], name: "index_connections_on_target_user_id"
    t.index ["user_id", "target_user_id"], name: "index_connections_on_user_and_target", unique: true
    t.index ["user_id"], name: "index_connections_on_user_id"
    t.check_constraint "user_id <> target_user_id", name: "connections_no_self"
  end

  create_table "conversations", id: :uuid, default: -> { "gen_random_uuid()" }, force: :cascade do |t|
    t.datetime "created_at", null: false
    t.datetime "last_message_at"
    t.uuid "match_id", null: false
    t.datetime "updated_at", null: false
    t.index ["last_message_at"], name: "index_conversations_on_last_message_at"
    t.index ["match_id"], name: "index_conversations_on_match_id", unique: true
  end

  create_table "interests", id: :uuid, default: -> { "gen_random_uuid()" }, force: :cascade do |t|
    t.datetime "created_at", null: false
    t.boolean "is_custom", default: false, null: false
    t.string "name", null: false
    t.datetime "updated_at", null: false
    t.index "lower((name)::text)", name: "index_interests_on_lower_name", unique: true
  end

  create_table "matches", id: :uuid, default: -> { "gen_random_uuid()" }, force: :cascade do |t|
    t.datetime "created_at", null: false
    t.uuid "matched_user_id", null: false
    t.datetime "updated_at", null: false
    t.uuid "user_id", null: false
    t.index ["matched_user_id", "user_id"], name: "index_matches_on_matched_user_and_user"
    t.index ["matched_user_id"], name: "index_matches_on_matched_user_id"
    t.index ["user_id", "matched_user_id"], name: "index_matches_on_user_and_matched_user", unique: true
    t.index ["user_id"], name: "index_matches_on_user_id"
    t.check_constraint "user_id < matched_user_id", name: "matches_normalized_order"
  end

  create_table "messages", id: :uuid, default: -> { "gen_random_uuid()" }, force: :cascade do |t|
    t.text "content", null: false
    t.uuid "conversation_id", null: false
    t.datetime "created_at", null: false
    t.datetime "read_at"
    t.datetime "updated_at", null: false
    t.uuid "user_id", null: false
    t.index ["conversation_id", "created_at"], name: "index_messages_on_conversation_and_created_at"
    t.index ["conversation_id", "read_at"], name: "index_messages_on_conversation_and_read_at"
    t.index ["conversation_id"], name: "index_messages_on_conversation_id"
    t.index ["user_id"], name: "index_messages_on_user_id"
  end

  create_table "portfolio_links", id: :uuid, default: -> { "gen_random_uuid()" }, force: :cascade do |t|
    t.datetime "created_at", null: false
    t.integer "link_type", null: false
    t.string "title"
    t.datetime "updated_at", null: false
    t.string "url", null: false
    t.uuid "user_id", null: false
    t.index ["user_id", "link_type"], name: "index_portfolio_links_on_user_id_and_link_type"
    t.index ["user_id"], name: "index_portfolio_links_on_user_id"
  end

  create_table "profiles", id: :uuid, default: -> { "gen_random_uuid()" }, force: :cascade do |t|
    t.text "bio"
    t.date "birthdate"
    t.datetime "created_at", null: false
    t.integer "looking_for", default: 0, null: false
    t.string "major"
    t.integer "profile_visibility", default: 0, null: false
    t.boolean "show_on_explore", default: true, null: false
    t.string "tagline"
    t.string "university"
    t.datetime "updated_at", null: false
    t.uuid "user_id", null: false
    t.index ["major"], name: "index_profiles_on_major"
    t.index ["university"], name: "index_profiles_on_university"
    t.index ["user_id"], name: "index_profiles_on_user_id", unique: true
  end

  create_table "project_skills", id: :uuid, default: -> { "gen_random_uuid()" }, force: :cascade do |t|
    t.datetime "created_at", null: false
    t.uuid "project_id", null: false
    t.uuid "skill_id", null: false
    t.datetime "updated_at", null: false
    t.index ["project_id", "skill_id"], name: "index_project_skills_on_project_and_skill", unique: true
    t.index ["project_id"], name: "index_project_skills_on_project_id"
    t.index ["skill_id"], name: "index_project_skills_on_skill_id"
  end

  create_table "projects", id: :uuid, default: -> { "gen_random_uuid()" }, force: :cascade do |t|
    t.integer "category", default: 0, null: false
    t.datetime "created_at", null: false
    t.text "description"
    t.string "github_url"
    t.string "live_demo_url"
    t.integer "looking_for", default: 0, null: false
    t.integer "team_size"
    t.string "title", null: false
    t.datetime "updated_at", null: false
    t.uuid "user_id", null: false
    t.index ["category"], name: "index_projects_on_category"
    t.index ["created_at"], name: "index_projects_on_created_at"
    t.index ["looking_for"], name: "index_projects_on_looking_for"
    t.index ["user_id"], name: "index_projects_on_user_id"
    t.check_constraint "team_size IS NULL OR team_size > 0 AND team_size <= 100", name: "projects_team_size_range"
  end

  create_table "skills", id: :uuid, default: -> { "gen_random_uuid()" }, force: :cascade do |t|
    t.datetime "created_at", null: false
    t.boolean "is_custom", default: false, null: false
    t.string "name", null: false
    t.datetime "updated_at", null: false
    t.index "lower((name)::text)", name: "index_skills_on_lower_name", unique: true
  end

  create_table "user_interests", id: :uuid, default: -> { "gen_random_uuid()" }, force: :cascade do |t|
    t.datetime "created_at", null: false
    t.uuid "interest_id", null: false
    t.datetime "updated_at", null: false
    t.uuid "user_id", null: false
    t.index ["interest_id"], name: "index_user_interests_on_interest_id"
    t.index ["user_id", "interest_id"], name: "index_user_interests_on_user_id_and_interest_id", unique: true
    t.index ["user_id"], name: "index_user_interests_on_user_id"
  end

  create_table "user_settings", id: :uuid, default: -> { "gen_random_uuid()" }, force: :cascade do |t|
    t.datetime "created_at", null: false
    t.integer "discovery_radius", default: 50, null: false
    t.string "language", default: "en", null: false
    t.boolean "notify_email", default: true, null: false
    t.boolean "notify_matches", default: true, null: false
    t.boolean "notify_messages", default: true, null: false
    t.boolean "notify_project_updates", default: true, null: false
    t.boolean "notify_push", default: true, null: false
    t.boolean "show_last_active", default: true, null: false
    t.boolean "show_online_status", default: true, null: false
    t.string "theme", default: "system", null: false
    t.datetime "updated_at", null: false
    t.uuid "user_id", null: false
    t.index ["user_id"], name: "index_user_settings_on_user_id", unique: true
    t.check_constraint "discovery_radius >= 1 AND discovery_radius <= 500", name: "user_settings_discovery_radius_range"
    t.check_constraint "theme::text = ANY (ARRAY['system'::character varying, 'light'::character varying, 'dark'::character varying]::text[])", name: "user_settings_theme_values"
  end

  create_table "user_skills", id: :uuid, default: -> { "gen_random_uuid()" }, force: :cascade do |t|
    t.datetime "created_at", null: false
    t.uuid "skill_id", null: false
    t.datetime "updated_at", null: false
    t.uuid "user_id", null: false
    t.index ["skill_id"], name: "index_user_skills_on_skill_id"
    t.index ["user_id", "skill_id"], name: "index_user_skills_on_user_id_and_skill_id", unique: true
    t.index ["user_id"], name: "index_user_skills_on_user_id"
  end

  create_table "users", id: :uuid, default: -> { "gen_random_uuid()" }, force: :cascade do |t|
    t.datetime "created_at", null: false
    t.datetime "current_sign_in_at"
    t.inet "current_sign_in_ip"
    t.string "email", default: "", null: false
    t.string "encrypted_password", default: "", null: false
    t.datetime "last_sign_in_at"
    t.inet "last_sign_in_ip"
    t.string "name", limit: 100
    t.datetime "remember_created_at"
    t.datetime "reset_password_sent_at"
    t.string "reset_password_token"
    t.integer "sign_in_count", default: 0, null: false
    t.datetime "updated_at", null: false
    t.index ["email"], name: "index_users_on_email", unique: true
    t.index ["reset_password_token"], name: "index_users_on_reset_password_token", unique: true
  end

  add_foreign_key "connections", "users"
  add_foreign_key "connections", "users", column: "target_user_id"
  add_foreign_key "conversations", "matches"
  add_foreign_key "matches", "users"
  add_foreign_key "matches", "users", column: "matched_user_id"
  add_foreign_key "messages", "conversations"
  add_foreign_key "messages", "users"
  add_foreign_key "portfolio_links", "users"
  add_foreign_key "profiles", "users"
  add_foreign_key "project_skills", "projects"
  add_foreign_key "project_skills", "skills"
  add_foreign_key "projects", "users"
  add_foreign_key "user_interests", "interests"
  add_foreign_key "user_interests", "users"
  add_foreign_key "user_settings", "users"
  add_foreign_key "user_skills", "skills"
  add_foreign_key "user_skills", "users"
end
