# frozen_string_literal: true

class Project < ApplicationRecord
  # ------------------------------------------------------------------
  # Associations
  # ------------------------------------------------------------------
  belongs_to :user

  has_many :project_skills, dependent: :destroy
  has_many :skills, through: :project_skills

  # ------------------------------------------------------------------
  # Enums
  # ------------------------------------------------------------------
  # Categories match the frontend's expected values.
  enum :category, {
    web_dev:  0,
    ai_ml:    1,
    design:   2,
    mobile:   3,
    business: 4,
    other:    5
  }, prefix: true

  # Same vocabulary as Profile#looking_for — a project can be looking
  # for the same kinds of connections a student is.
  enum :looking_for, {
    friends:               0,
    project_collaborators: 1,
    study_buddies:         2,
    mentors:               3
  }, prefix: true

  # ------------------------------------------------------------------
  # Validations
  # ------------------------------------------------------------------
  validates :title,       presence: true, length: { maximum: 120 }
  validates :description, length: { maximum: 2000 }, allow_blank: true

  validates :team_size,   numericality: { only_integer: true,
                                          greater_than: 0,
                                          less_than_or_equal_to: 100 },
                          allow_nil: true

  validates :github_url,    format: { with: URI::DEFAULT_PARSER.make_regexp(%w[http https]),
                                      message: "must be a valid HTTP or HTTPS URL" },
                            allow_blank: true,
                            length: { maximum: 500 }

  validates :live_demo_url, format: { with: URI::DEFAULT_PARSER.make_regexp(%w[http https]),
                                      message: "must be a valid HTTP or HTTPS URL" },
                            allow_blank: true,
                            length: { maximum: 500 }

  # ------------------------------------------------------------------
  # Scopes
  # ------------------------------------------------------------------
  scope :by_category,   ->(cat) { where(category: cat) if cat.present? }
  scope :owned_by,      ->(user_id) { where(user_id: user_id) if user_id.present? }
  scope :recent_first,  -> { order(created_at: :desc) }

  # Case-insensitive search across title and description.
  # Uses ILIKE which is PostgreSQL-specific — appropriate since we're
  # PostgreSQL-only.
  scope :search, ->(query) {
    next all if query.blank?
    pattern = "%#{sanitize_sql_like(query.to_s.strip)}%"
    where("title ILIKE :q OR description ILIKE :q", q: pattern)
  }
end