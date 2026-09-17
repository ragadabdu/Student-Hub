# frozen_string_literal: true

class CreateConversationsAndMessages < ActiveRecord::Migration[8.1]
  def change
    # ------------------------------------------------------------------
    # conversations
    # ------------------------------------------------------------------
    # One conversation per match (1:1 between the two matched users).
    # Participants are derived from the match's two users.
    create_table :conversations, id: :uuid, default: -> { "gen_random_uuid()" } do |t|
      t.references :match, type: :uuid, null: false,
                           foreign_key: true,
                           index: { unique: true }

      t.datetime :last_message_at  # for ordering conversation lists efficiently

      t.timestamps null: false
    end

    # ------------------------------------------------------------------
    # messages
    # ------------------------------------------------------------------
    create_table :messages, id: :uuid, default: -> { "gen_random_uuid()" } do |t|
      t.references :conversation, type: :uuid, null: false, foreign_key: true
      t.references :user,         type: :uuid, null: false, foreign_key: true

      t.text :content, null: false

      # When the recipient has read the message. Null = unread.
      # Not "read by everyone" — for 1:1, it's just "the other person."
      t.datetime :read_at

      t.timestamps null: false
    end

    # Pagination query: fetch messages in a conversation ordered by time.
    add_index :messages, [:conversation_id, :created_at],
              name: "index_messages_on_conversation_and_created_at"

    # Fast unread-count: count messages in a conversation where read_at IS NULL
    # (we'll additionally filter by user_id in the app).
    add_index :messages, [:conversation_id, :read_at],
              name: "index_messages_on_conversation_and_read_at"

    # Sort conversation list by most recent activity.
    add_index :conversations, :last_message_at
  end
end