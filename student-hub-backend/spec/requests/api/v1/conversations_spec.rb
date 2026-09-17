# frozen_string_literal: true

require "rails_helper"

RSpec.describe "Conversations API", type: :request do
  let!(:alice) { create(:user, email: "alice@example.com", name: "Alice") }
  let!(:bob)   { create(:user, email: "bob@example.com",   name: "Bob") }
  let!(:carol) { create(:user, email: "carol@example.com", name: "Carol") }

  # Alice and Bob are matched and have a conversation.
  let!(:match)        { Match.create_between!(alice, bob) }
  let!(:conversation) { match.conversation }

  # ==================================================================
  # GET /api/v1/conversations
  # ==================================================================
  describe "GET /api/v1/conversations" do
    context "when not authenticated" do
      it "returns 401" do
        get "/api/v1/conversations"
        expect(response).to have_http_status(:unauthorized)
      end
    end

    context "when authenticated" do
      before { sign_in(alice) }

      it "returns conversations the user is a participant in" do
        get "/api/v1/conversations", as: :json

        expect(response).to have_http_status(:ok)
        body = JSON.parse(response.body)
        expect(body["conversations"].length).to eq(1)
        c = body["conversations"].first
        expect(c["id"]).to eq(conversation.id)
        expect(c["match_id"]).to eq(match.id)
      end

      it "includes the other participant" do
        get "/api/v1/conversations", as: :json

        c = JSON.parse(response.body)["conversations"].first
        expect(c["other_user"]["id"]).to eq(bob.id)
        expect(c["other_user"]["name"]).to eq("Bob")
        expect(c["other_user"]["avatar_url"]).to be_nil
      end

      it "computes other_user from the viewer's perspective" do
        get "/api/v1/conversations", as: :json
        expect(JSON.parse(response.body)["conversations"].first["other_user"]["id"]).to eq(bob.id)

        sign_in(bob)
        get "/api/v1/conversations", as: :json
        expect(JSON.parse(response.body)["conversations"].first["other_user"]["id"]).to eq(alice.id)
      end

      it "does not return conversations the user is not part of" do
        # Carol is not in the match
        sign_in(carol)
        get "/api/v1/conversations", as: :json

        expect(JSON.parse(response.body)["conversations"]).to eq([])
      end

      it "returns last_message as null when no messages exist" do
        get "/api/v1/conversations", as: :json

        c = JSON.parse(response.body)["conversations"].first
        expect(c["last_message"]).to be_nil
      end

      it "includes last_message when messages exist" do
        conversation.messages.create!(user: alice, content: "Hi Bob")
        conversation.messages.create!(user: alice, content: "Second message")

        get "/api/v1/conversations", as: :json

        c = JSON.parse(response.body)["conversations"].first
        expect(c["last_message"]["content"]).to eq("Second message")
        expect(c["last_message"]["sender"]["id"]).to eq(alice.id)
      end

      it "returns unread_count for the viewer" do
        conversation.messages.create!(user: bob, content: "Hi Alice 1")
        conversation.messages.create!(user: bob, content: "Hi Alice 2")
        conversation.messages.create!(user: alice, content: "Hi Bob")

        get "/api/v1/conversations", as: :json

        c = JSON.parse(response.body)["conversations"].first
        # Alice has 2 unread (Bob's messages); the message she sent isn't unread to her.
        expect(c["unread_count"]).to eq(2)
      end

      it "orders conversations by most recent activity" do
        # Second match
        carol_match = Match.create_between!(alice, carol)
        carol_conv  = carol_match.conversation

        # Activity in carol's conversation
        sleep 0.01
        carol_conv.messages.create!(user: alice, content: "Hi Carol")

        get "/api/v1/conversations", as: :json

        convs = JSON.parse(response.body)["conversations"]
        expect(convs.first["id"]).to eq(carol_conv.id)
      end
    end
  end

  # ==================================================================
  # GET /api/v1/conversations/:id
  # ==================================================================
  describe "GET /api/v1/conversations/:id" do
    context "when not authenticated" do
      it "returns 401" do
        get "/api/v1/conversations/#{conversation.id}"
        expect(response).to have_http_status(:unauthorized)
      end
    end

    context "when authenticated as a participant" do
      before { sign_in(alice) }

      it "returns the conversation with recent messages" do
        conversation.messages.create!(user: bob, content: "Old message")
        conversation.messages.create!(user: alice, content: "Newer message")

        get "/api/v1/conversations/#{conversation.id}", as: :json

        expect(response).to have_http_status(:ok)
        body = JSON.parse(response.body)
        expect(body["conversation"]["other_user"]["id"]).to eq(bob.id)
        expect(body["messages"].length).to eq(2)
        # Newest first
        expect(body["messages"].first["content"]).to eq("Newer message")
      end

      it "marks messages from the other user as read" do
        msg = conversation.messages.create!(user: bob, content: "Hello")

        expect {
          get "/api/v1/conversations/#{conversation.id}", as: :json
        }.to change { msg.reload.read_at }.from(nil)

        expect(msg.reload.read_at).to be_present
      end

      it "does not mark own messages as read" do
        own_msg = conversation.messages.create!(user: alice, content: "Mine")

        get "/api/v1/conversations/#{conversation.id}", as: :json

        expect(own_msg.reload.read_at).to be_nil
      end

      it "does not mark messages from other conversations as read" do
        carol_match = Match.create_between!(alice, carol)
        carol_conv  = carol_match.conversation
        carol_msg   = carol_conv.messages.create!(user: carol, content: "Hi from Carol")

        get "/api/v1/conversations/#{conversation.id}", as: :json

        expect(carol_msg.reload.read_at).to be_nil
      end
    end

    context "when authenticated as a non-participant" do
      before { sign_in(carol) }

      it "returns 404" do
        get "/api/v1/conversations/#{conversation.id}", as: :json
        expect(response).to have_http_status(:not_found)
      end
    end
  end

  # ==================================================================
  # GET /api/v1/conversations/:conversation_id/messages
  # ==================================================================
  describe "GET /api/v1/conversations/:conversation_id/messages" do
    before { sign_in(alice) }

    it "returns an empty list when there are no messages" do
      get "/api/v1/conversations/#{conversation.id}/messages", as: :json

      expect(response).to have_http_status(:ok)
      body = JSON.parse(response.body)
      expect(body["messages"]).to eq([])
      expect(body["next_cursor"]).to be_nil
      expect(body["has_more"]).to be(false)
    end

    it "returns messages newest first" do
      m1 = conversation.messages.create!(user: alice, content: "First")
      m2 = conversation.messages.create!(user: bob,   content: "Second")
      m3 = conversation.messages.create!(user: alice, content: "Third")

      get "/api/v1/conversations/#{conversation.id}/messages", as: :json

      contents = JSON.parse(response.body)["messages"].map { |m| m["content"] }
      expect(contents).to eq(["Third", "Second", "First"])
    end

    it "respects the limit parameter" do
      5.times { |i| conversation.messages.create!(user: alice, content: "Msg #{i}") }

      get "/api/v1/conversations/#{conversation.id}/messages",
          params: { limit: 2 }, as: :json

      body = JSON.parse(response.body)
      expect(body["messages"].length).to eq(2)
      expect(body["has_more"]).to be(true)
      expect(body["next_cursor"]).to be_present
    end

    it "returns the next page using the cursor" do
      5.times { |i| conversation.messages.create!(user: alice, content: "Msg #{i}") }

      # First page
      get "/api/v1/conversations/#{conversation.id}/messages",
          params: { limit: 2 }, as: :json
      page1 = JSON.parse(response.body)
      cursor = page1["next_cursor"]

      # Second page
      get "/api/v1/conversations/#{conversation.id}/messages",
          params: { limit: 2, cursor: cursor }, as: :json
      page2 = JSON.parse(response.body)

      page1_ids = page1["messages"].map { |m| m["id"] }
      page2_ids = page2["messages"].map { |m| m["id"] }
      expect(page1_ids & page2_ids).to eq([])  # No overlap
    end

    it "has_more is false on the last page" do
      conversation.messages.create!(user: alice, content: "Only message")

      get "/api/v1/conversations/#{conversation.id}/messages", as: :json

      body = JSON.parse(response.body)
      expect(body["has_more"]).to be(false)
      expect(body["next_cursor"]).to be_nil
    end

    it "returns 404 for a non-participant" do
      sign_in(carol)
      get "/api/v1/conversations/#{conversation.id}/messages", as: :json
      expect(response).to have_http_status(:not_found)
    end
  end

  # ==================================================================
  # POST /api/v1/conversations/:conversation_id/messages
  # ==================================================================
  describe "POST /api/v1/conversations/:conversation_id/messages" do
    let(:valid_params) { { message: { content: "Hello!" } } }

    context "when not authenticated" do
      it "returns 401" do
        post "/api/v1/conversations/#{conversation.id}/messages", params: valid_params, as: :json
        expect(response).to have_http_status(:unauthorized)
      end
    end

    context "when authenticated as a participant" do
      before { sign_in(alice) }

      it "creates a message" do
        expect {
          post "/api/v1/conversations/#{conversation.id}/messages",
               params: valid_params, as: :json
        }.to change(conversation.messages, :count).by(1)

        expect(response).to have_http_status(:created)
        body = JSON.parse(response.body)["message"]
        expect(body["content"]).to eq("Hello!")
        expect(body["sender"]["id"]).to eq(alice.id)
        expect(body["read_at"]).to be_nil
      end

      it "updates the conversation's last_message_at" do
        post "/api/v1/conversations/#{conversation.id}/messages",
             params: valid_params, as: :json

        expect(conversation.reload.last_message_at).to be_present
      end

      it "rejects blank content" do
        post "/api/v1/conversations/#{conversation.id}/messages",
             params: { message: { content: "" } }, as: :json

        expect(response).to have_http_status(:unprocessable_content)
        body = JSON.parse(response.body)
        expect(body["error"]["details"]).to have_key("content")
      end

      it "rejects content over 2000 chars" do
        post "/api/v1/conversations/#{conversation.id}/messages",
             params: { message: { content: "a" * 2001 } }, as: :json

        expect(response).to have_http_status(:unprocessable_content)
      end

      it "returns 400 for missing message key" do
        post "/api/v1/conversations/#{conversation.id}/messages",
             params: {}, as: :json

        expect(response).to have_http_status(:bad_request)
      end
    end

    context "when authenticated as a non-participant" do
      before { sign_in(carol) }

      it "returns 404" do
        post "/api/v1/conversations/#{conversation.id}/messages",
             params: valid_params, as: :json
        expect(response).to have_http_status(:not_found)
      end
    end
  end

  # ==================================================================
  # DELETE /api/v1/conversations/:conversation_id/messages/:id
  # ==================================================================
  describe "DELETE /api/v1/conversations/:conversation_id/messages/:id" do
    let!(:my_message)    { conversation.messages.create!(user: alice, content: "Mine") }
    let!(:their_message) { conversation.messages.create!(user: bob,   content: "Theirs") }

    context "when not authenticated" do
      it "returns 401" do
        delete "/api/v1/conversations/#{conversation.id}/messages/#{my_message.id}"
        expect(response).to have_http_status(:unauthorized)
      end
    end

    context "when authenticated as the sender" do
      before { sign_in(alice) }

      it "deletes their own message" do
        expect {
          delete "/api/v1/conversations/#{conversation.id}/messages/#{my_message.id}", as: :json
        }.to change(Message, :count).by(-1)

        expect(response).to have_http_status(:no_content)
      end

      it "returns 404 for another user's message (does not leak existence)" do
        expect {
          delete "/api/v1/conversations/#{conversation.id}/messages/#{their_message.id}", as: :json
        }.not_to change(Message, :count)

        expect(response).to have_http_status(:not_found)
      end
    end

    context "when authenticated as a non-participant" do
      before { sign_in(carol) }

      it "returns 404" do
        delete "/api/v1/conversations/#{conversation.id}/messages/#{my_message.id}", as: :json
        expect(response).to have_http_status(:not_found)
      end
    end
  end
end
