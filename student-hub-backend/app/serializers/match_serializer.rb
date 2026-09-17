# frozen_string_literal: true

class MatchSerializer < ActiveModel::Serializer
  attributes :id,
             :matched_user,
             :shared_interests,
             :last_message,
             :matched_at

  # `matched_user` is the OTHER user from the viewer's perspective.
  # The controller passes `viewer: current_user` as an instance option.
  def matched_user
    other = object.other_user_for(viewer)
    {
      id:         other.id,
      name:       other.name,
      avatar_url: nil  # TODO: Active Storage (Phase 8)
    }
  end

  def shared_interests
    object.shared_interests_for(viewer).map do |interest|
      { id: interest.id, name: interest.name }
    end
  end

  # Phase 6 will populate this with the most recent message.
  def last_message
    nil
  end

  def matched_at
    object.created_at.iso8601
  end

  private

  def viewer
    instance_options.fetch(:viewer)
  end
end