# frozen_string_literal: true

class Project < ApplicationRecord
  belongs_to :user

  enum :category, {
    web_dev:  0,
    ai_ml:    1,
    design:   2,
    mobile:   3,
    business: 4,
    other:    5
  }, prefix: true

  enum :looking_for, {
    friends:               0,
    project_collaborators: 1,
    study_buddies:         2,
    mentors:               3
  }, prefix: true

  validates :title,       presence: true, length: { maximum: 120 }
  validates :description, length: { maximum: 2000 }, allow_blank: true
  validates :team_size,   numericality: { only_integer: true,
                                          greater_than: 0,
                                          less_than_or_equal_to: 100 },
                          allow_nil: true
  validates :github_url,   format: { with: URI::DEFAULT_PARSER.make_regexp(%w[http https]) },
                           allow_blank: true
  validates :live_demo_url, format: { with: URI::DEFAULT_PARSER.make_regexp(%w[http https]) },
                            allow_blank: true

  scope :by_category, ->(cat) { where(category: cat) }
  scope :recent,      -> { order(created_at: :desc) }
end
