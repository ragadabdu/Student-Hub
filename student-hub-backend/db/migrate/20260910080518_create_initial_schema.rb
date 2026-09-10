# frozen_string_literal: true

class CreateInitialSchema < ActiveRecord::Migration[8.1]
  def change
    # ------------------------------------------------------------------
    # Extensions
    # ------------------------------------------------------------------
    # pgcrypto gives us gen_random_uuid() for UUID primary keys.
    # We use pgcrypto rather than uuid-ossp because it is included by
    # default in modern PostgreSQL distributions and its API is simpler.
    enable_extension "pgcrypto" unless extension_enabled?("pgcrypto")

    # ------------------------------------------------------------------
    # users
    # ------------------------------------------------------------------
    # Owns:       Devise authentication data + account-level fields.
    # Read by:    Self (full), other users (only via Profile).
    # Create by:  Public (registration).
    # Modify by:  Self only.
    # Delete by:  Self (future feature); admins (out of scope for MVP).
    # ------------------------------------------------------------------
    create_table :users, id: :uuid, default: -> { "gen_random_uuid()" } do |t|
      # --- Devise: database_authenticatable ---
      t.string   :email,              null: false, default: ""
      t.string   :encrypted_password, null: false, default: ""

      # --- Devise: recoverable ---
      t.string   :reset_password_token
      t.datetime :reset_password_sent_at

      # --- Devise: rememberable ---
      t.datetime :remember_created_at

      # --- Devise: trackable ---
      t.integer  :sign_in_count,      null: false, default: 0
      t.datetime :current_sign_in_at
      t.datetime :last_sign_in_at
      t.inet     :current_sign_in_ip
      t.inet     :last_sign_in_ip

      t.timestamps null: false
    end

    add_index :users, :email,                unique: true
    add_index :users, :reset_password_token, unique: true

    # ------------------------------------------------------------------
    # profiles
    # ------------------------------------------------------------------
    # Owns:       Public-facing profile data for a user.
    # Read by:    Anyone (subject to profile_visibility).
    # Create by:  Automatically created with User.
    # Modify by:  Self only.
    # Delete by:  Cascade from User.
    # ------------------------------------------------------------------
    create_table :profiles, id: :uuid, default: -> { "gen_random_uuid()" } do |t|
      t.references :user, type: :uuid, null: false, foreign_key: true,
                          index: { unique: true }

      t.string  :name
      t.date    :birthdate
      t.string  :university
      t.string  :major
      t.string  :tagline
      t.text    :bio

      # looking_for: 0=friends, 1=project_collaborators, 2=study_buddies, 3=mentors
      t.integer :looking_for,        null: false, default: 0

      # profile_visibility: 0=public, 1=private
      t.integer :profile_visibility, null: false, default: 0

      t.boolean :show_on_explore,    null: false, default: true

      t.timestamps null: false
    end

    add_index :profiles, :university
    add_index :profiles, :major

    # ------------------------------------------------------------------
    # interests  (controlled vocabulary + custom user-created entries)
    # ------------------------------------------------------------------
    create_table :interests, id: :uuid, default: -> { "gen_random_uuid()" } do |t|
      t.string  :name,      null: false
      t.boolean :is_custom, null: false, default: false
      t.timestamps null: false
    end

    add_index :interests, "lower(name)", unique: true, name: "index_interests_on_lower_name"

    # ------------------------------------------------------------------
    # user_interests  (join table, user <-> interest)
    # ------------------------------------------------------------------
    create_table :user_interests, id: :uuid, default: -> { "gen_random_uuid()" } do |t|
      t.references :user,     type: :uuid, null: false, foreign_key: true
      t.references :interest, type: :uuid, null: false, foreign_key: true
      t.timestamps null: false
    end

    add_index :user_interests, [:user_id, :interest_id], unique: true

    # ------------------------------------------------------------------
    # skills  (separate table from interests, per your decision)
    # ------------------------------------------------------------------
    create_table :skills, id: :uuid, default: -> { "gen_random_uuid()" } do |t|
      t.string  :name,      null: false
      t.boolean :is_custom, null: false, default: false
      t.timestamps null: false
    end

    add_index :skills, "lower(name)", unique: true, name: "index_skills_on_lower_name"

    # ------------------------------------------------------------------
    # user_skills  (join table, user <-> skill)
    # ------------------------------------------------------------------
    create_table :user_skills, id: :uuid, default: -> { "gen_random_uuid()" } do |t|
      t.references :user,  type: :uuid, null: false, foreign_key: true
      t.references :skill, type: :uuid, null: false, foreign_key: true
      t.timestamps null: false
    end

    add_index :user_skills, [:user_id, :skill_id], unique: true

    # ------------------------------------------------------------------
    # portfolio_links
    # ------------------------------------------------------------------
    # link_type: 0=github, 1=linkedin, 2=website, 3=twitter, 4=other
    # ------------------------------------------------------------------
    create_table :portfolio_links, id: :uuid, default: -> { "gen_random_uuid()" } do |t|
      t.references :user, type: :uuid, null: false, foreign_key: true
      t.integer :link_type, null: false
      t.string  :url,       null: false
      t.string  :title
      t.timestamps null: false
    end

    add_index :portfolio_links, [:user_id, :link_type]

    # ------------------------------------------------------------------
    # projects
    # ------------------------------------------------------------------
    # category:     0=web_dev, 1=ai_ml, 2=design, 3=mobile, 4=business, 5=other
    # looking_for:  same enum as profiles.looking_for
    # ------------------------------------------------------------------
    create_table :projects, id: :uuid, default: -> { "gen_random_uuid()" } do |t|
      t.references :user, type: :uuid, null: false, foreign_key: true

      t.string  :title,       null: false
      t.text    :description
      t.integer :category,    null: false, default: 0
      t.integer :team_size
      t.integer :looking_for, null: false, default: 0

      t.string  :github_url
      t.string  :live_demo_url

      t.timestamps null: false
    end

    add_index :projects, :category
    add_index :projects, :created_at
  end
end
