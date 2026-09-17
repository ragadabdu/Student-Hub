# frozen_string_literal: true

class Match < ApplicationRecord
  # ------------------------------------------------------------------
  # Associations
  # ------------------------------------------------------------------
  belongs_to :user
  belongs_to :matched_user, class_name: "User"

  has_one :conversation, dependent: :destroy

  # ------------------------------------------------------------------
  # Validations
  # ------------------------------------------------------------------
  validates :user_id, uniqueness: { scope: :matched_user_id }

  validate :users_must_be_different
  validate :must_be_normalized_order

  # ------------------------------------------------------------------
  # Callbacks
  # ------------------------------------------------------------------
  after_create :create_conversation!

  # ------------------------------------------------------------------
  # Scopes
  # ------------------------------------------------------------------
  scope :involving, ->(user) {
    where("user_id = :id OR matched_user_id = :id", id: user.id)
  }

  scope :recent_first, -> { order(created_at: :desc) }

  # ------------------------------------------------------------------
  # Class methods
  # ------------------------------------------------------------------
  def self.create_between!(user_a, user_b)
    raise ArgumentError, "Cannot match a user with themselves" if user_a.id == user_b.id

    a, b = [user_a.id, user_b.id].sort

    begin
      find_or_create_by!(user_id: a, matched_user_id: b)
    rescue ActiveRecord::RecordNotUnique
      find_by!(user_id: a, matched_user_id: b)
    end
  end

  # ------------------------------------------------------------------
  # Instance methods
  # ------------------------------------------------------------------
  def other_user_for(viewer)
    viewer.id == user_id ? matched_user : user
  end

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

  def create_conversation!
    Conversation.create!(match: self)
  end
end