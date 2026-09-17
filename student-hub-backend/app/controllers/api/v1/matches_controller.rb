# frozen_string_literal: true

module Api
  module V1
    class MatchesController < ApplicationController
      # GET /api/v1/matches
      def index
        scope = Match
          .involving(current_user)
          .includes(:user, :matched_user)
          .recent_first

        result = Pagination.paginate(
          scope,
          page:     params[:page],
          per_page: params[:per_page]
        )

        matches = ActiveModelSerializers::SerializableResource.new(
          result[:records],
          each_serializer: MatchSerializer,
          viewer:          current_user
        ).as_json

        render json: {
          matches: matches,
          meta:    result[:meta]
        }
      end

      # GET /api/v1/matches/:id
      def show
        match = find_own_match!(params[:id])

        serialized = ActiveModelSerializers::SerializableResource.new(
          match,
          serializer: MatchSerializer,
          viewer:     current_user
        ).as_json

        render json: { match: serialized }
      end

      # DELETE /api/v1/matches/:id
      #
      # Unmatches. Destroys the match row. Does NOT touch the underlying
      # connections — those remain, so the users won't re-appear in each
      # other's discovery feeds.
      def destroy
        match = find_own_match!(params[:id])
        match.destroy
        head :no_content
      end

      private

      # Finds a match only if the current user is a participant.
      # Returns 404 for matches the user isn't part of (no existence leak).
      def find_own_match!(id)
        Match.involving(current_user).find(id)
      end
    end
  end
end