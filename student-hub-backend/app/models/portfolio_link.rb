# frozen_string_literal: true

class PortfolioLink < ApplicationRecord
  belongs_to :user

  enum :link_type, {
    github:   0,
    linkedin: 1,
    website:  2,
    twitter:  3,
    other:    4
  }

  validates :url, presence: true,
                  format: { with: URI::DEFAULT_PARSER.make_regexp(%w[http https]),
                            message: "must be a valid HTTP or HTTPS URL" }
  validates :link_type, presence: true
  validates :title, length: { maximum: 100 }, allow_blank: true

  # URL must not exceed reasonable length
  validates :url, length: { maximum: 500 }
end
