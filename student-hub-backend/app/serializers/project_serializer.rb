# frozen_string_literal: true

class ProjectSerializer < ActiveModel::Serializer
  attributes :id,
             :title,
             :description,
             :category,
             :team_size,
             :looking_for,
             :github_url,
             :live_demo_url,
             :owner,
             :skills,
             :created_at,
             :updated_at

  # `owner` and `skills` are computed methods rather than AMS relationships.
  # This gives us explicit control over the response shape and avoids the
  # root-key/relationship quirks we've hit with AMS 0.10.
  #
  # `owner` follows the canonical "public user" shape: { id, name, avatar_url }.
  # See ProfileSerializer#user for the same shape.
  def owner
    {
      id:         object.user.id,
      name:       object.user.name,
      avatar_url: nil  # TODO: Active Storage (Phase 8)
    }
  end

  def skills
    object.skills.order(:name).map do |s|
      { id: s.id, name: s.name, is_custom: s.is_custom }
    end
  end

  def created_at
    object.created_at.iso8601
  end

  def updated_at
    object.updated_at.iso8601
  end
end
