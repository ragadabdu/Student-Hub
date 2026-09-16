# frozen_string_literal: true

class ProfileSerializer < ActiveModel::Serializer
  attributes :id,
             :user_id,
             :university,
             :major,
             :tagline,
             :bio,
             :looking_for,
             :profile_visibility,
             :show_on_explore,
             :age,
             :created_at,
             :updated_at,
             :user,
             :interests,
             :skills

  # `birthdate` is deliberately omitted. Clients see only `age`.

  attribute :portfolio_links, if: :include_portfolio_links?

  # The "public user" shape — id, name, avatar_url.
  # This is the canonical way users are exposed inline across the API.
  # See docs (in code) for why this shape matters.
  def user
    {
      id:         object.user.id,
      name:       object.user.name,
      avatar_url: nil  # TODO: Active Storage (Phase 8)
    }
  end

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