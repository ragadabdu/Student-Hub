# frozen_string_literal: true

FactoryBot.define do
  factory :user do
    sequence(:email) { |n| "student#{n}@example.com" }
    password { "password123" }
    password_confirmation { "password123" }

    # Build an associated profile automatically
    after(:create) do |user, _evaluator|
      # The User model's after_create callback already creates a profile.
      # Nothing to do here unless we want to customize it.
    end
  end
end
