# frozen_string_literal: true

class ConnectionSerializer < ActiveModel::Serializer
  attributes :id,
             :user_id,
             :target_user_id,
             :status,
             :created_at,
             :updated_at

  def created_at
    object.created_at.iso8601
  end

  def updated_at
    object.updated_at.iso8601
  end
end