# frozen_string_literal: true

class Interest < ApplicationRecord
  has_many :user_interests, dependent: :destroy
  has_many :users, through: :user_interests

  validates :name, presence: true, length: { maximum: 50 }
  validates :name, uniqueness: { case_sensitive: false }

  before_validation :normalize_name

  private

  def normalize_name
    self.name = name.strip if name.is_a?(String)
  end
end
