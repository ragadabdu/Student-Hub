# frozen_string_literal: true

class CreateMatches < ActiveRecord::Migration[8.1]
  def change
    create_table :matches, id: :uuid, default: -> { "gen_random_uuid()" } do |t|
      # Normalized ordering: user_id < matched_user_id (enforced below).
      # This ensures a pair (A, B) is representable in exactly one row,
      # regardless of who "created" the match.
      t.references :user,         type: :uuid, null: false,
                                  foreign_key: { to_table: :users }
      t.references :matched_user, type: :uuid, null: false,
                                  foreign_key: { to_table: :users }

      t.timestamps null: false
    end

    # Exactly one match row per pair (in normalized order).
    add_index :matches, [:user_id, :matched_user_id],
              unique: true,
              name: "index_matches_on_user_and_matched_user"

    # Index for reverse lookups: "matches where I'm the matched_user".
    add_index :matches, [:matched_user_id, :user_id],
              name: "index_matches_on_matched_user_and_user"

    # Enforce normalized ordering (user_id < matched_user_id) at the DB level.
    # This makes "the pair" canonical — we never have both (A, B) and (B, A).
    add_check_constraint :matches,
                         "user_id < matched_user_id",
                         name: "matches_normalized_order"
  end
end