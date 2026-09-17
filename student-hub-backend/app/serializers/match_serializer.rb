# frozen_string_literal: true

class MatchSerializer < ActiveModel::Serializer
  attributes :id,
             :matched_user,
             :shared_interests,
             :last_message,
             :matched_at

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
    # Avoid N+1: if the conversation/messages weren't eager-loaded, this
    # will query per match. Callers should `includes(conversation: :messages)`
    # when listing many matches.
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

  private

  def viewer
    instance_options.fetch(:viewer)
  end
end