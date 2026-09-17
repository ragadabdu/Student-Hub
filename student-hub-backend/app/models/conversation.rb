# frozen_string_literal: true

class Conversation < ApplicationRecord
  # ------------------------------------------------------------------
  # Associations
  # ------------------------------------------------------------------
  belongs_to :match
  has_many   :messages, dependent: :destroy

  # ------------------------------------------------------------------
  # Validations
  # ------------------------------------------------------------------
  validates :match_id, uniqueness: true

  # ------------------------------------------------------------------
  # Scopes
  # ------------------------------------------------------------------
  scope :recent_first, -> {
    order(Arel.sql("conversations.last_message_at DESC NULLS LAST, conversations.created_at DESC"))
  }

  # ------------------------------------------------------------------
  # Instance methods
  # ------------------------------------------------------------------
  # The two users in this conversation, in no particular order.
  def participants
    [match.user, match.matched_user]
  end

  # Given a viewer, returns the OTHER participant.
  def other_user_for(viewer)
    match.other_user_for(viewer)
  end

  # Is the given user a participant in this conversation?
  def includes_user?(user)
    match.user_id == user.id || match.matched_user_id == user.id
  end

  # The most recent message, or nil.
  def last_message
    messages.order(created_at: :desc).first
  end

  # Number of unread messages for the given user (i.e., messages sent by
  # the OTHER participant that this user hasn't read).
  def unread_count_for(user)
    messages.where.not(user_id: user.id).where(read_at: nil).count
  end
end