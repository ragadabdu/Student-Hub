# frozen_string_literal: true

class Match < ApplicationRecord
  # ------------------------------------------------------------------
  # Associations
  # ------------------------------------------------------------------
  belongs_to :user
  belongs_to :matched_user, class_name: "User"

  # ------------------------------------------------------------------
  # Validations
  # ------------------------------------------------------------------
  validates :user_id, uniqueness: { scope: :matched_user_id }

  validate :users_must_be_different
  validate :must_be_normalized_order

  # ------------------------------------------------------------------
  # Scopes
  # ------------------------------------------------------------------
  # All matches involving a given user, regardless of whether they're
  # the "user_id" or "matched_user_id" side.
  scope :involving, ->(user) {
    where("user_id = :id OR matched_user_id = :id", id: user.id)
  }

  # Matches ordered by most recent first.
  scope :recent_first, -> { order(created_at: :desc) }

  # ------------------------------------------------------------------
  # Class methods
  # ------------------------------------------------------------------
  # Creates a match between two users in normalized order.
  # Idempotent: if a match already exists (in either direction), returns it.
  # Runs in a transaction so it's safe under race conditions (the unique
  # index is the ultimate guard).
  def self.create_between!(user_a, user_b)
    raise ArgumentError, "Cannot match a user with themselves" if user_a.id == user_b.id

    a, b = [user_a.id, user_b.id].sort

    begin
      find_or_create_by!(user_id: a, matched_user_id: b)
    rescue ActiveRecord::RecordNotUnique
      # Concurrent insert won the race; fetch the winner.
      find_by!(user_id: a, matched_user_id: b)
    end
  end

  # ------------------------------------------------------------------
  # Instance methods
  # ------------------------------------------------------------------
  # Given a viewer, returns the OTHER user in the match.
  def other_user_for(viewer)
    viewer.id == user_id ? matched_user : user
  end

  # Given a viewer, returns interests shared with the other user.
  def shared_interests_for(viewer)
    viewer.interests & other_user_for(viewer).interests
  end

  private

  def users_must_be_different
    return if user_id.blank? || matched_user_id.blank?
    if user_id == matched_user_id
      errors.add(:matched_user_id, "cannot be the same as user")
    end
  end

  def must_be_normalized_order
    return if user_id.blank? || matched_user_id.blank?
    if user_id >= matched_user_id
      errors.add(:base, "user_id must be less than matched_user_id")
    end
  end
end