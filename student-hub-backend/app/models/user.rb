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