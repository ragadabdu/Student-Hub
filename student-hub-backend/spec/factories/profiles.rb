# frozen_string_literal: true

FactoryBot.define do
  factory :profile do
    association :user
    name      { Faker::Name.name }
    tagline   { Faker::Lorem.sentence(word_count: 6) }
    bio       { Faker::Lorem.paragraph(sentence_count: 3) }
    university { Faker::University.name }
    major      { "Computer Science" }
    birthdate  { 20.years.ago.to_date }
  end
end
