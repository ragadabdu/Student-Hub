# frozen_string_literal: true

module Api
  module V1
    class ConversationsController < ApplicationController
      # GET /api/v1/conversations
      #
      # Lists conversations for the current user, most recent first.
      # Each conversation includes the other participant, last message,
      # and unread count.
      def index
        # Scope: conversations whose match includes the current user.
        scope = Conversation
          .joins(:match)
          .where(
            "matches.user_id = :id OR matches.matched_user_id = :id",
            id: current_user.id
          )
          .includes(:match, :messages)
          .recent_first

        result = Pagination.paginate(
          scope,
          page:     params[:page],
          per_page: params[:per_page]
        )

        conversations = ActiveModelSerializers::SerializableResource.new(
          result[:records],
          each_serializer: ConversationSerializer,
          viewer:          current_user
        ).as_json

        render json: {
          conversations: conversations,
          meta:          result[:meta]
        }
      end

      # GET /api/v1/conversations/:id
      #
      # Shows a conversation with its most recent messages.
      def show
        conversation = find_own_conversation!(params[:id])

        # Mark messages from the other user as read (as of now).
        mark_unread_messages_as_read!(conversation)

        # Serialize conversation with a preview of the most recent messages.
        # Full message pagination is via GET /conversations/:id/messages.
        conversation_json = ActiveModelSerializers::SerializableResource.new(
          conversation,
          serializer: ConversationSerializer,
          viewer:     current_user
        ).as_json

        recent_messages = conversation
          .messages
          .recent_first
          .limit(30)
          .includes(:user)

        messages_json = ActiveModelSerializers::SerializableResource.new(
          recent_messages,
          each_serializer: MessageSerializer
        ).as_json

        render json: {
          conversation: conversation_json,
          messages:     messages_json
        }
      end

      private

      def find_own_conversation!(id)
        Conversation
          .joins(:match)
          .where(
            "matches.user_id = :id OR matches.matched_user_id = :id",
            id: current_user.id
          )
          .includes(:match, :messages)
          .find(id)
      end

      def mark_unread_messages_as_read!(conversation)
        conversation
          .messages
          .where.not(user_id: current_user.id)
          .where(read_at: nil)
          .update_all(read_at: Time.current)
      end
    end
  end
end