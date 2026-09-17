# frozen_string_literal: true

class BackfillConversationsForExistingMatches < ActiveRecord::Migration[8.1]
  def up
    # For any match without a conversation, create one.
    # Uses raw SQL for speed on potentially large tables, but is
    # idempotent and safe to re-run.
    execute <<~SQL
      INSERT INTO conversations (id, match_id, created_at, updated_at)
      SELECT gen_random_uuid(), matches.id, NOW(), NOW()
      FROM matches
      LEFT JOIN conversations ON conversations.match_id = matches.id
      WHERE conversations.id IS NULL
    SQL
  end

  def down
    # No-op: removing backfilled conversations would cascade-delete
    # messages, which is destructive. We leave them.
  end
end