# frozen_string_literal: true

class MatchSerializer < ActiveModel::Serializer
  attributes :id,
             :matched_user,
             :shared_interests,
             :last_message,
             :matched_at,
             :conversation_id

  def matched_user
    other = object.other_user_for(viewer)
    {
      id:         other.id,
      name:       other.name,
      avatar_url: nil
    }
  end

  def shared_interests
    object.shared_interests_for(viewer).map do |interest|
      { id: interest.id, name: interest.name }
    end
  end

  def last_message
    last = object.conversation&.last_message
    return nil unless last

    ActiveModelSerializers::SerializableResource.new(
      last,
      serializer: MessageSerializer
    ).as_json
  end

  def matched_at
    object.created_at.iso8601
  end

  # Exposes the match's conversation id so the frontend can navigate
  # directly to the conversation from a match card.
  def conversation_id
    object.conversation&.id
  end

  private

  def viewer
    instance_options.fetch(:viewer)
  end
end