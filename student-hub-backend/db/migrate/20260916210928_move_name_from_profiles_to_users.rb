# frozen_string_literal: true

class MoveNameFromProfilesToUsers < ActiveRecord::Migration[8.1]
  def up
    # Add name to users
    add_column :users, :name, :string, limit: 100

    # Copy existing names from profiles
    # (There's no data in production yet, but this makes the migration
    # safe to run in any environment.)
    execute <<~SQL
      UPDATE users
         SET name = profiles.name
        FROM profiles
       WHERE profiles.user_id = users.id
         AND profiles.name IS NOT NULL
    SQL

    # Remove name from profiles
    remove_column :profiles, :name
  end

  def down
    add_column :profiles, :name, :string, limit: 100

    execute <<~SQL
      UPDATE profiles
         SET name = users.name
        FROM users
       WHERE users.id = profiles.user_id
         AND users.name IS NOT NULL
    SQL

    remove_column :users, :name
  end
end
