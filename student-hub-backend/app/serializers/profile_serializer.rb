# frozen_string_literal: true

class ProfileSerializer < ActiveModel::Serializer
  attributes :id,
             :name,
             :university,
             :major,
             :tagline,
             :bio,
             :looking_for,
             :profile_visibility,
             :show_on_explore,
             :age,
             :created_at,
             :updated_at

  # `birthdate` is deliberately omitted. Clients see only `age`.
  # This is a privacy decision: exact DOB is more sensitive than age.

  has_many :interests
  has_many :skills

  # Controller passes `include_portfolio_links: true` when we want links.
  # Default: omit (they're only relevant on detail views).
  attribute :portfolio_links, if: :include_portfolio_links?

  def age
    object.age
  end

  def created_at
    object.created_at.iso8601
  end

  def updated_at
    object.updated_at.iso8601
  end

  def include_portfolio_links?
    instance_options[:include_portfolio_links].present?
  end
end