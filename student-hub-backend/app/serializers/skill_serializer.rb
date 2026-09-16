# frozen_string_literal: true

class SkillSerializer < ActiveModel::Serializer
  attributes :id, :name, :is_custom
end