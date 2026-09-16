# frozen_string_literal: true

module Api
  module V1
    module Me
      class SkillsController < ApplicationController
        # PUT /api/v1/me/skills
        def update
          names = params[:skills]

          unless names.is_a?(Array)
            return render_error(
              code:    "INVALID_PARAMETER",
              message: "skills must be an array of strings",
              status:  :bad_request
            )
          end

          skills = Skills::ReplaceUserSkills.call(
            user:  current_user,
            names: names
          )

          render json: {
            skills: ActiveModelSerializers::SerializableResource.new(
              skills,
              each_serializer: SkillSerializer
            ).as_json
          }
        end
      end
    end
  end
end