# frozen_string_literal: true

class MessageSerializer < ActiveModel::Serializer
  attributes :id,
             :conversation_id,
             :sender,
             :content,
             :read_at,
             :sent_at

  def sender
    {
      id:         object.user.id,
      name:       object.user.name,
      avatar_url: nil  # TODO: Active Storage (Phase 8)
    }
  end

  def read_at
    object.read_at&.iso8601
  end

  def sent_at
    object.created_at.iso8601
  end
end