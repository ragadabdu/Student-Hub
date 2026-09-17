# frozen_string_literal: true

class Connection < ApplicationRecord
  # ------------------------------------------------------------------
  # Associations
  # ------------------------------------------------------------------
  belongs_to :user
  belongs_to :target_user, class_name: "User"

  # ------------------------------------------------------------------
  # Enums
  # ------------------------------------------------------------------
  # Status reflects the *current* intent of the acting user toward the
  # target. There is no history — if a user passes on someone they
  # previously connected with, the row is updated (upsert), not duplicated.
  enum :status, {
    pass:          0,
    connect:       1,
    super_connect: 2
  }, prefix: true

  # ------------------------------------------------------------------
  # Validations
  # ------------------------------------------------------------------
  validates :user_id, uniqueness: { scope: :target_user_id }
  validate  :cannot_target_self

  # ------------------------------------------------------------------
  # Scopes
  # ------------------------------------------------------------------
  scope :from_user, ->(user_id) { where(user_id: user_id) }
  scope :to_user,   ->(user_id) { where(target_user_id: user_id) }
  scope :positive,  -> { where(status: [:connect, :super_connect]) }

  private

  def cannot_target_self
    return if user_id.blank? || target_user_id.blank?
    if user_id == target_user_id
      errors.add(:target_user_id, "cannot be the same as user")
    end
  end
end
