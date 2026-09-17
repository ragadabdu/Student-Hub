# frozen_string_literal: true

class ConversationSerializer < ActiveModel::Serializer
  attributes :id,
             :match_id,
             :other_user,
             :last_message,
             :unread_count,
             :created_at

  def other_user
    other = object.other_user_for(viewer)
    {
      id:         other.id,
      name:       other.name,
      avatar_url: nil
    }
  end

  def last_message
    last = object.last_message
    return nil unless last

    ActiveModelSerializers::SerializableResource.new(
      last,
      serializer: MessageSerializer
    ).as_json
  end

  def unread_count
    object.unread_count_for(viewer)
  end

  def created_at
    object.created_at.iso8601
  end

  private

  def viewer
    instance_options.fetch(:viewer)
  end
end