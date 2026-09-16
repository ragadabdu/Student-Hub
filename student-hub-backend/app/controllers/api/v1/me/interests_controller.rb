# frozen_string_literal: true

module Api
  module V1
    module Me
      class InterestsController < ApplicationController
        # PUT /api/v1/me/interests
        def update
          names = params[:interests]

          unless names.is_a?(Array)
            return render_error(
              code:    "INVALID_PARAMETER",
              message: "interests must be an array of strings",
              status:  :bad_request
            )
          end

          interests = Interests::ReplaceUserInterests.call(
            user:  current_user,
            names: names
          )

          render json: {
            interests: ActiveModelSerializers::SerializableResource.new(
              interests,
              each_serializer: InterestSerializer
            ).as_json
          }
        end
      end
    end
  end
end