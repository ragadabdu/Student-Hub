# frozen_string_literal: true

module Api
  module V1
    class MessagesController < ApplicationController
      # GET /api/v1/conversations/:conversation_id/messages
      #
      # Cursor-paginated list of messages, newest first.
      #
      # Query params:
      #   cursor  (optional) — opaque cursor from a previous response
      #   limit   (optional, default 30, max 100)
      def index
        conversation = find_own_conversation!(params[:conversation_id])

        scope = conversation
          .messages
          .includes(:user)

        result = CursorPagination.paginate(
          scope,
          cursor: params[:cursor],
          limit:  params[:limit]
        )

        messages = ActiveModelSerializers::SerializableResource.new(
          result[:records],
          each_serializer: MessageSerializer
        ).as_json

        render json: {
          messages:    messages,
          next_cursor: result[:next_cursor],
          has_more:    result[:has_more]
        }
      end

      # POST /api/v1/conversations/:conversation_id/messages
      #
      # Body: { "message": { "content": "..." } }
      def create
        conversation = find_own_conversation!(params[:conversation_id])

        message = conversation.messages.new(message_params)
        message.user = current_user

        if message.save
          serialized = ActiveModelSerializers::SerializableResource.new(
            message,
            serializer: MessageSerializer
          ).as_json

          render json: { message: serialized }, status: :created
        else
          render_error(
            code:    "VALIDATION_ERROR",
            message: "Message could not be sent",
            details: message.errors.to_hash,
            status:  :unprocessable_content
          )
        end
      end

      # DELETE /api/v1/conversations/:conversation_id/messages/:id
      #
      # Only the sender can delete their own message.
      def destroy
        conversation = find_own_conversation!(params[:conversation_id])

        # Scoped to `current_user` — a user can only delete their own
        # messages. Trying to delete someone else's yields 404.
        message = conversation.messages.where(user: current_user).find(params[:id])
        message.destroy
        head :no_content
      end

      private

      def find_own_conversation!(id)
        Conversation
          .joins(:match)
          .where(
            "matches.user_id = :id OR matches.matched_user_id = :id",
            id: current_user.id
          )
          .find(id)
      end

      def message_params
        params.require(:message).permit(:content)
      end
    end
  end
end