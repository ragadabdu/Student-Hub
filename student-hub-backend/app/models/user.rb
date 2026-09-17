# frozen_string_literal: true

class User < ApplicationRecord
  # ------------------------------------------------------------------
  # Devise
  # ------------------------------------------------------------------
  devise :database_authenticatable,
         :registerable,
         :recoverable,
         :rememberable,
         :trackable,
         :validatable

  # ------------------------------------------------------------------
  # Associations
  # ------------------------------------------------------------------
  has_one  :profile, dependent: :destroy
  has_many :user_interests, dependent: :destroy
  has_many :interests, through: :user_interests

  has_many :user_skills, dependent: :destroy
  has_many :skills, through: :user_skills

  has_many :portfolio_links, dependent: :destroy
  has_many :projects, dependent: :destroy

  # Outgoing connections: interactions this user performed on others.
  has_many :outgoing_connections,
           class_name: "Connection",
           foreign_key: :user_id,
           dependent: :destroy,
           inverse_of: :user

  # Incoming connections: interactions others performed on this user.
  has_many :incoming_connections,
           class_name: "Connection",
           foreign_key: :target_user_id,
           dependent: :destroy,
           inverse_of: :target_user

    # Outgoing matches: matches where this user is the lower-ID side.
  # Note: because matches are normalized (user_id < matched_user_id),
  # this is NOT "matches I created" — it's just one side of the pair.
  has_many :matches_as_lower,
           class_name: "Match",
           foreign_key: :user_id,
           dependent: :destroy,
           inverse_of: :user

  # Incoming matches: matches where this user is the higher-ID side.
  has_many :matches_as_higher,
           class_name: "Match",
           foreign_key: :matched_user_id,
           dependent: :destroy,
           inverse_of: :matched_user

  # All matches involving this user. Uses a scope-based association.
  # Not a true `has_many :through`, so we implement via a method.
  def matches
    Match.involving(self)
  end

  # ------------------------------------------------------------------
  # Validations
  # ------------------------------------------------------------------
  # `name` is a user identity attribute (not a profile one) so that
  # endpoints which need "the user's name" (e.g., project owner, message
  # sender) can access it without loading the profile.
  validates :name, length: { maximum: 100 }, allow_blank: true

  # ------------------------------------------------------------------
  # Callbacks
  # ------------------------------------------------------------------
  after_create :create_default_profile

  private

  def create_default_profile
    create_profile!
  end
end