# frozen_string_literal: true

class UserInterest < ApplicationRecord
  belongs_to :user
  belongs_to :interest

  validates :user_id, uniqueness: { scope: :interest_id }
end
