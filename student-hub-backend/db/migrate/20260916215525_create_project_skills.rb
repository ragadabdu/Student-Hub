# frozen_string_literal: true

class CreateProjectSkills < ActiveRecord::Migration[8.1]
  def change
    create_table :project_skills, id: :uuid, default: -> { "gen_random_uuid()" } do |t|
      t.references :project, type: :uuid, null: false, foreign_key: true
      t.references :skill,   type: :uuid, null: false, foreign_key: true
      t.timestamps null: false
    end

    add_index :project_skills, [:project_id, :skill_id],
              unique: true,
              name: "index_project_skills_on_project_and_skill"
  end
end
