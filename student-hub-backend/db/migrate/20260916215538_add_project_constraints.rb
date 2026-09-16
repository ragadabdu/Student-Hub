# frozen_string_literal: true

class AddProjectConstraints < ActiveRecord::Migration[8.1]
  def change
    # Index on looking_for to support filtering by what a project needs.
    add_index :projects, :looking_for

    # DB-level constraint on team_size to match the model validation.
    # Belt-and-suspenders: prevents invalid data even if the model is
    # bypassed (e.g., direct SQL, future data imports).
    add_check_constraint :projects,
                         "team_size IS NULL OR (team_size > 0 AND team_size <= 100)",
                         name: "projects_team_size_range"
  end
end
