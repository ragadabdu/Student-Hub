# frozen_string_literal: true

class Profile < ApplicationRecord
  # ------------------------------------------------------------------
  # Enums
  # ------------------------------------------------------------------
  # looking_for values are shared with Project#looking_for.
  # Changing these integers requires a data migration.
  enum :looking_for, {
    friends:               0,
    project_collaborators: 1,
    study_buddies:         2,
    mentors:               3
  }, prefix: true

  enum :profile_visibility, {
    public_profile:  0,
    private_profile: 1
  }, prefix: true

  # ------------------------------------------------------------------
  # Associations
  # ------------------------------------------------------------------
  belongs_to :user

  # ------------------------------------------------------------------
  # Validations
  # ------------------------------------------------------------------
  validates :bio,     length: { maximum: 500 }, allow_blank: true
  validates :tagline, length: { maximum: 160 }, allow_blank: true
  validates :name,    length: { maximum: 100 }, allow_blank: true

  validates :birthdate,
            comparison: { less_than_or_equal_to: -> { Date.current } },
            allow_blank: true

  # ------------------------------------------------------------------
  # Scopes
  # ------------------------------------------------------------------
  scope :discoverable, -> {
    joins(:user)
      .where(profile_visibility: :public_profile)
      .where(show_on_explore: true)
  }

  # ------------------------------------------------------------------
  # Derived attributes
  # ------------------------------------------------------------------
  def age
    return nil unless birthdate
    now = Date.current
    now.year - birthdate.year - ((now.month > birthdate.month ||
      (now.month == birthdate.month && now.day >= birthdate.day)) ? 0 : 1)
  end
end
