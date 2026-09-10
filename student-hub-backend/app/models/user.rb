# frozen_string_literal: true

class User < ApplicationRecord
  # ------------------------------------------------------------------
  # Devise
  # ------------------------------------------------------------------
  # Included modules:
  #   database_authenticatable  - email/password auth
  #   registerable              - sign up
  #   recoverable               - password reset
  #   rememberable              - "remember me" cookie
  #   trackable                 - sign-in count/IP/timestamps
  #   validatable               - email format + password length
  #
  # Explicitly excluded:
  #   confirmable  - would require email delivery, out of scope for MVP
  #   lockable     - we will use Rack::Attack for brute-force protection
  #   timeoutable  - cookie expiration handles session timeout
  #   omniauthable - not using third-party login
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
  # Devise's :validatable already covers email format + password length.
  # We add anything app-specific here.

  # ------------------------------------------------------------------
  # Callbacks
  # ------------------------------------------------------------------
  # Every user gets a Profile automatically. This keeps the API simple:
  # the frontend never has to create one explicitly.
  after_create :create_default_profile

  private

  def create_default_profile
    create_profile!
  end
end
