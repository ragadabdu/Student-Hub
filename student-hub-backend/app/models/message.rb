# frozen_string_literal: true

class Message < ApplicationRecord
  # ------------------------------------------------------------------
  # Associations
  # ------------------------------------------------------------------
  belongs_to :conversation
  belongs_to :user

  # ------------------------------------------------------------------
  # Validations
  # ------------------------------------------------------------------
  validates :content, presence: true, length: { maximum: 2000 }

  # ------------------------------------------------------------------
  # Scopes
  # ------------------------------------------------------------------
  scope :recent_first, -> { order(created_at: :desc, id: :desc) }
  scope :unread,       -> { where(read_at: nil) }

  # ------------------------------------------------------------------
  # Callbacks
  # ------------------------------------------------------------------
  after_create :touch_conversation

  private

  # Update the conversation's `last_message_at` so conversation lists
  # can be sorted by most recent activity without a JOIN + subquery.
  def touch_conversation
    conversation.update_column(:last_message_at, created_at)
  end
end