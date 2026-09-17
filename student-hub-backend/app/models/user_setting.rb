# frozen_string_literal: true

class UserSetting < ApplicationRecord
  belongs_to :user

  THEMES = %w[system light dark].freeze

  validates :theme, inclusion: { in: THEMES }
  validates :discovery_radius,
            numericality: { only_integer: true,
                            greater_than_or_equal_to: 1,
                            less_than_or_equal_to: 500 }
  validates :language,
            length: { maximum: 10 },
            format: { with: /\A[a-z]{2}(-[A-Z]{2})?\z/,
                      message: "must be an ISO 639-1 code (e.g., 'en' or 'en-US')" },
            allow_blank: true
end