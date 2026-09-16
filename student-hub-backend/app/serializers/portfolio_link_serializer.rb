# frozen_string_literal: true

class PortfolioLinkSerializer < ActiveModel::Serializer
  attributes :id, :link_type, :url, :title, :created_at

  def created_at
    object.created_at.iso8601
  end
end