# frozen_string_literal: true

require "rails_helper"

RSpec.describe "Discovery API", type: :request do
  let!(:me)    { create(:user, email: "me@example.com", name: "Me") }
  let!(:alice) { create(:user, email: "alice@example.com", name: "Alice") }
  let!(:bob)   { create(:user, email: "bob@example.com", name: "Bob") }

  # ==================================================================
  # GET /api/v1/discovery
  # ==================================================================
  describe "GET /api/v1/discovery" do
    context "when not authenticated" do
      it "returns 401" do
        get "/api/v1/discovery"
        expect(response).to have_http_status(:unauthorized)
      end
    end

    context "when authenticated" do
      before { sign_in(me) }

      it "returns discoverable profiles with user info inline" do
        get "/api/v1/discovery", as: :json

        expect(response).to have_http_status(:ok)
        body = JSON.parse(response.body)
        names = body["profiles"].map { |p| p.dig("user", "name") }
        expect(names).to match_array(["Alice", "Bob"])
      end

      it "excludes the current user" do
        get "/api/v1/discovery", as: :json

        body = JSON.parse(response.body)
        user_ids = body["profiles"].map { |p| p["user_id"] }
        expect(user_ids).not_to include(me.id)
      end

      it "excludes private profiles" do
        alice.profile.update!(profile_visibility: :private_profile)

        get "/api/v1/discovery", as: :json

        body = JSON.parse(response.body)
        names = body["profiles"].map { |p| p.dig("user", "name") }
        expect(names).not_to include("Alice")
        expect(names).to include("Bob")
      end

      it "excludes profiles with show_on_explore = false" do
        alice.profile.update!(show_on_explore: false)

        get "/api/v1/discovery", as: :json

        body = JSON.parse(response.body)
        names = body["profiles"].map { |p| p.dig("user", "name") }
        expect(names).not_to include("Alice")
        expect(names).to include("Bob")
      end

      it "excludes users the current user has already acted on" do
        me.outgoing_connections.create!(target_user: alice, status: :pass)

        get "/api/v1/discovery", as: :json

        body = JSON.parse(response.body)
        names = body["profiles"].map { |p| p.dig("user", "name") }
        expect(names).not_to include("Alice")
        expect(names).to include("Bob")
      end

      it "does not exclude users based on others' connections" do
        # Alice passed on Bob — this should NOT affect what Me sees.
        alice.outgoing_connections.create!(target_user: bob, status: :pass)

        get "/api/v1/discovery", as: :json

        body = JSON.parse(response.body)
        names = body["profiles"].map { |p| p.dig("user", "name") }
        expect(names).to match_array(["Alice", "Bob"])
      end

      it "paginates" do
        5.times { |i| create(:user, email: "u#{i}@example.com") }

        get "/api/v1/discovery", params: { page: 2, per_page: 2 }, as: :json

        body = JSON.parse(response.body)
        expect(body["profiles"].length).to eq(2)
        expect(body["meta"]["current_page"]).to eq(2)
        expect(body["meta"]["total_count"]).to eq(7)  # me + alice + bob + 5
      end
    end
  end

  # ==================================================================
  # POST /api/v1/discovery/:user_id/pass
  # ==================================================================
  describe "POST /api/v1/discovery/:user_id/pass" do
    context "when not authenticated" do
      it "returns 401" do
        post "/api/v1/discovery/#{alice.id}/pass"
        expect(response).to have_http_status(:unauthorized)
      end
    end

    context "when authenticated" do
      before { sign_in(me) }

      it "records a pass" do
        expect {
          post "/api/v1/discovery/#{alice.id}/pass", as: :json
        }.to change(Connection, :count).by(1)

        expect(response).to have_http_status(:ok)
        body = JSON.parse(response.body)
        expect(body["connection"]["status"]).to eq("pass")
        expect(body["connection"]["user_id"]).to eq(me.id)
        expect(body["connection"]["target_user_id"]).to eq(alice.id)
        expect(body["match_created"]).to be(false)
      end

      it "excludes the passed user from future discovery" do
        post "/api/v1/discovery/#{alice.id}/pass", as: :json

        get "/api/v1/discovery", as: :json

        names = JSON.parse(response.body)["profiles"].map { |p| p.dig("user", "name") }
        expect(names).not_to include("Alice")
      end

      it "is idempotent — passing twice does not create duplicate rows" do
        post "/api/v1/discovery/#{alice.id}/pass", as: :json

        expect {
          post "/api/v1/discovery/#{alice.id}/pass", as: :json
        }.not_to change(Connection, :count)
      end

      it "upserts: connect then pass leaves status = pass" do
        post "/api/v1/discovery/#{alice.id}/connect", as: :json
        post "/api/v1/discovery/#{alice.id}/pass",    as: :json

        expect(Connection.find_by(user: me, target_user: alice).status).to eq("pass")
      end

      it "returns 422 for self-action" do
        post "/api/v1/discovery/#{me.id}/pass", as: :json

        expect(response).to have_http_status(:unprocessable_content)
        body = JSON.parse(response.body)
        expect(body["error"]["code"]).to eq("SELF_ACTION_FORBIDDEN")
      end

      it "returns 404 for a nonexistent user" do
        post "/api/v1/discovery/00000000-0000-0000-0000-000000000000/pass", as: :json
        expect(response).to have_http_status(:not_found)
      end

      it "returns 404 for a private profile" do
        alice.profile.update!(profile_visibility: :private_profile)

        post "/api/v1/discovery/#{alice.id}/pass", as: :json
        expect(response).to have_http_status(:not_found)
      end
    end
  end

  # ==================================================================
  # POST /api/v1/discovery/:user_id/connect
  # ==================================================================
  describe "POST /api/v1/discovery/:user_id/connect" do
    context "when not authenticated" do
      it "returns 401" do
        post "/api/v1/discovery/#{alice.id}/connect"
        expect(response).to have_http_status(:unauthorized)
      end
    end

    context "when authenticated" do
      before { sign_in(me) }

      it "records a connect" do
        post "/api/v1/discovery/#{alice.id}/connect", as: :json

        expect(response).to have_http_status(:ok)
        body = JSON.parse(response.body)
        expect(body["connection"]["status"]).to eq("connect")
        expect(body["match_created"]).to be(false)  # Phase 5 will flip this
      end

      it "excludes the connected user from future discovery" do
        post "/api/v1/discovery/#{alice.id}/connect", as: :json

        get "/api/v1/discovery", as: :json

        names = JSON.parse(response.body)["profiles"].map { |p| p.dig("user", "name") }
        expect(names).not_to include("Alice")
      end

      it "is idempotent — connecting twice does not create duplicate rows" do
        post "/api/v1/discovery/#{alice.id}/connect", as: :json

        expect {
          post "/api/v1/discovery/#{alice.id}/connect", as: :json
        }.not_to change(Connection, :count)
      end

      it "upserts: pass then connect leaves status = connect" do
        post "/api/v1/discovery/#{alice.id}/pass",    as: :json
        post "/api/v1/discovery/#{alice.id}/connect", as: :json

        expect(Connection.find_by(user: me, target_user: alice).status).to eq("connect")
      end

      it "does not record a mutual row — connections are directional" do
        post "/api/v1/discovery/#{alice.id}/connect", as: :json

        # Only one row: me -> alice. Not alice -> me.
        expect(Connection.count).to eq(1)
        expect(Connection.first.user_id).to eq(me.id)
        expect(Connection.first.target_user_id).to eq(alice.id)
      end

      it "returns 422 for self-action" do
        post "/api/v1/discovery/#{me.id}/connect", as: :json
        expect(response).to have_http_status(:unprocessable_content)
      end
    end
  end

  # ==================================================================
  # POST /api/v1/discovery/:user_id/super_connect
  # ==================================================================
  describe "POST /api/v1/discovery/:user_id/super_connect" do
    context "when authenticated" do
      before { sign_in(me) }

      it "records a super_connect" do
        post "/api/v1/discovery/#{alice.id}/super_connect", as: :json

        expect(response).to have_http_status(:ok)
        body = JSON.parse(response.body)
        expect(body["connection"]["status"]).to eq("super_connect")
      end

      it "is idempotent" do
        post "/api/v1/discovery/#{alice.id}/super_connect", as: :json

        expect {
          post "/api/v1/discovery/#{alice.id}/super_connect", as: :json
        }.not_to change(Connection, :count)
      end

      it "upserts: connect then super_connect updates to super_connect" do
        post "/api/v1/discovery/#{alice.id}/connect",       as: :json
        post "/api/v1/discovery/#{alice.id}/super_connect", as: :json

        expect(Connection.find_by(user: me, target_user: alice).status).to eq("super_connect")
      end

      it "upserts: super_connect then connect downgrades to connect" do
        post "/api/v1/discovery/#{alice.id}/super_connect", as: :json
        post "/api/v1/discovery/#{alice.id}/connect",       as: :json

        expect(Connection.find_by(user: me, target_user: alice).status).to eq("connect")
      end
    end
  end
end
