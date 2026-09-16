# frozen_string_literal: true

FactoryBot.define do
  factory :user do
    sequence(:email) { |n| "student#{n}@example.com" }
    password { "password123" }
    password_confirmation { "password123" }

    # Traits for common profile configurations. The profile itself is
    # created automatically by User's after_create callback, so these
    # traits update the profile after the fact.

    trait :with_public_profile do
      after(:create) do |user|
        user.profile.update!(
          profile_visibility: :public_profile,
          show_on_explore:    true
        )
      end
    end

    trait :with_private_profile do
      after(:create) do |user|
        user.profile.update!(
          profile_visibility: :private_profile,
          show_on_explore:    true
        )
      end
    end

    trait :hidden_from_explore do
      after(:create) do |user|
        user.profile.update!(show_on_explore: false)
      end
    end

    trait :with_complete_profile do
      after(:create) do |user|
        user.profile.update!(
          name:       Faker::Name.name,
          university: Faker::University.name,
          major:      "Computer Science",
          tagline:    Faker::Lorem.sentence(word_count: 6),
          bio:        Faker::Lorem.paragraph(sentence_count: 3),
          birthdate:  20.years.ago.to_date
        )
      end
    end
  end
end