# frozen_string_literal: true

class CreateConnections < ActiveRecord::Migration[8.1]
  def change
    create_table :connections, id: :uuid, default: -> { "gen_random_uuid()" } do |t|
      t.references :user,        type: :uuid, null: false,
                                 foreign_key: { to_table: :users }
      t.references :target_user, type: :uuid, null: false,
                                 foreign_key: { to_table: :users }

      # status: 0=pass, 1=connect, 2=super_connect
      t.integer :status, null: false, default: 0

      t.timestamps null: false
    end

    # One action per (user, target) pair. Last action wins via upsert.
    add_index :connections, [:user_id, :target_user_id],
              unique: true,
              name: "index_connections_on_user_and_target"

    # Index for reverse lookups: "did X act on me?"
    add_index :connections, [:target_user_id, :user_id],
              name: "index_connections_on_target_and_user"

    # Self-connections are nonsense. Enforce at DB level.
    add_check_constraint :connections,
                         "user_id != target_user_id",
                         name: "connections_no_self"
  end
end