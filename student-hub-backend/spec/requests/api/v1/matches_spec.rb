# frozen_string_literal: true

require "rails_helper"

RSpec.describe "Matches API", type: :request do
  let!(:alice) { create(:user, email: "alice@example.com", name: "Alice") }
  let!(:bob)   { create(:user, email: "bob@example.com",   name: "Bob") }
  let!(:carol) { create(:user, email: "carol@example.com", name: "Carol") }

  # Helper to create a match, in normalized order.
  def create_match!(a, b)
    Match.create_between!(a, b)
  end

  # ==================================================================
  # GET /api/v1/matches
  # ==================================================================
  describe "GET /api/v1/matches" do
    context "when not authenticated" do
      it "returns 401" do
        get "/api/v1/matches"
        expect(response).to have_http_status(:unauthorized)
      end
    end

    context "when authenticated" do
      before { sign_in(alice) }

      it "returns an empty list when there are no matches" do
        get "/api/v1/matches", as: :json

        expect(response).to have_http_status(:ok)
        body = JSON.parse(response.body)
        expect(body["matches"]).to eq([])
        expect(body["meta"]["total_count"]).to eq(0)
      end

      it "returns matches where the current user is a participant" do
        create_match!(alice, bob)

        get "/api/v1/matches", as: :json

        body = JSON.parse(response.body)
        expect(body["matches"].length).to eq(1)
        expect(body["matches"].first["matched_user"]["id"]).to eq(bob.id)
        expect(body["matches"].first["matched_user"]["name"]).to eq("Bob")
        expect(body["matches"].first["matched_user"]["avatar_url"]).to be_nil
      end

      it "returns matches where the current user is the second participant" do
        # Alice is `matched_user` in this match, not `user`.
        create_match!(bob, alice)

        get "/api/v1/matches", as: :json

        body = JSON.parse(response.body)
        expect(body["matches"].length).to eq(1)
        # Even though alice is the higher-ID side, matched_user must be Bob (the OTHER side).
        expect(body["matches"].first["matched_user"]["id"]).to eq(bob.id)
      end

      it "does not return matches the current user is not part of" do
        create_match!(bob, carol)

        get "/api/v1/matches", as: :json

        body = JSON.parse(response.body)
        expect(body["matches"]).to eq([])
      end

      it "computes matched_user from the viewer's perspective" do
        create_match!(alice, bob)

        # As Alice, matched_user is Bob.
        get "/api/v1/matches", as: :json
        expect(JSON.parse(response.body)["matches"].first["matched_user"]["id"]).to eq(bob.id)

        # As Bob, matched_user is Alice.
        sign_in(bob)
        get "/api/v1/matches", as: :json
        expect(JSON.parse(response.body)["matches"].first["matched_user"]["id"]).to eq(alice.id)
      end

      it "includes shared interests between the two users" do
        ai        = Interest.create!(name: "AI",        is_custom: false)
        robotics  = Interest.create!(name: "Robotics",  is_custom: false)
        physics   = Interest.create!(name: "Physics",   is_custom: false)

        alice.interests << ai
        alice.interests << robotics
        bob.interests   << ai
        bob.interests   << robotics
        bob.interests   << physics  # Not shared

        create_match!(alice, bob)

        get "/api/v1/matches", as: :json

        shared = JSON.parse(response.body)["matches"].first["shared_interests"]
        expect(shared.map { |i| i["name"] }).to match_array(["AI", "Robotics"])
      end

      it "returns last_message as null (Phase 6 will populate)" do
        create_match!(alice, bob)

        get "/api/v1/matches", as: :json

        expect(JSON.parse(response.body)["matches"].first["last_message"]).to be_nil
      end

      it "orders matches by most recent first" do
        create_match!(alice, bob)
        sleep 0.01
        create_match!(alice, carol)

        get "/api/v1/matches", as: :json

        names = JSON.parse(response.body)["matches"].map { |m| m["matched_user"]["name"] }
        expect(names).to eq(["Carol", "Bob"])
      end

      it "paginates matches" do
        5.times { |i| create(:user, email: "u#{i}@example.com") }
        User.where.not(id: alice.id).limit(6).each do |u|
          create_match!(alice, u)
        end

        get "/api/v1/matches", params: { page: 1, per_page: 2 }, as: :json

        body = JSON.parse(response.body)
        expect(body["matches"].length).to eq(2)
        expect(body["meta"]["current_page"]).to eq(1)
        expect(body["meta"]["per_page"]).to eq(2)
      end
    end
  end

  # ==================================================================
  # GET /api/v1/matches/:id
  # ==================================================================
  describe "GET /api/v1/matches/:id" do
    let!(:match) { create_match!(alice, bob) }

    context "when not authenticated" do
      it "returns 401" do
        get "/api/v1/matches/#{match.id}"
        expect(response).to have_http_status(:unauthorized)
      end
    end

    context "when authenticated as a participant" do
      before { sign_in(alice) }

      it "returns the match" do
        get "/api/v1/matches/#{match.id}", as: :json

        expect(response).to have_http_status(:ok)
        body = JSON.parse(response.body)["match"]
        expect(body["matched_user"]["id"]).to eq(bob.id)
        expect(body["matched_at"]).to be_present
      end
    end

    context "when authenticated as a non-participant" do
      before { sign_in(carol) }

      it "returns 404 (does not leak existence)" do
        get "/api/v1/matches/#{match.id}", as: :json
        expect(response).to have_http_status(:not_found)
      end
    end

    context "with a nonexistent match" do
      before { sign_in(alice) }

      it "returns 404" do
        get "/api/v1/matches/00000000-0000-0000-0000-000000000000", as: :json
        expect(response).to have_http_status(:not_found)
      end
    end
  end

  # ==================================================================
  # DELETE /api/v1/matches/:id
  # ==================================================================
  describe "DELETE /api/v1/matches/:id" do
    let!(:match) { create_match!(alice, bob) }

    context "when not authenticated" do
      it "returns 401" do
        delete "/api/v1/matches/#{match.id}"
        expect(response).to have_http_status(:unauthorized)
      end
    end

    context "when authenticated as a participant" do
      before { sign_in(alice) }

      it "deletes the match" do
        expect {
          delete "/api/v1/matches/#{match.id}", as: :json
        }.to change(Match, :count).by(-1)

        expect(response).to have_http_status(:no_content)
      end

      it "does NOT delete the underlying connections" do
        # Set up the connections that would have caused the match.
        alice.outgoing_connections.create!(target_user: bob, status: :connect)
        bob.outgoing_connections.create!(target_user: alice, status: :connect)

        expect {
          delete "/api/v1/matches/#{match.id}", as: :json
        }.not_to change(Connection, :count)
      end

      it "removes the match from the user's list" do
        delete "/api/v1/matches/#{match.id}", as: :json

        get "/api/v1/matches", as: :json
        expect(JSON.parse(response.body)["matches"]).to eq([])
      end
    end

    context "when authenticated as a non-participant" do
      before { sign_in(carol) }

      it "returns 404 and does not delete" do
        expect {
          delete "/api/v1/matches/#{match.id}", as: :json
        }.not_to change(Match, :count)

        expect(response).to have_http_status(:not_found)
      end
    end
  end

  # ==================================================================
  # Match creation via connections
  # ==================================================================
  describe "match creation via connect" do
    before { sign_in(alice) }

    it "creates a match when both users have connected with each other" do
      # Bob has already connected with Alice.
      bob.outgoing_connections.create!(target_user: alice, status: :connect)

      # Alice connects with Bob. Should trigger match.
      expect {
        post "/api/v1/discovery/#{bob.id}/connect", as: :json
      }.to change(Match, :count).by(1)

      body = JSON.parse(response.body)
      expect(body["match_created"]).to be(true)
      expect(body["match"]).to be_present
      expect(body["match"]["matched_user"]["id"]).to eq(bob.id)
    end

    it "creates a match when the other side used super_connect" do
      bob.outgoing_connections.create!(target_user: alice, status: :super_connect)

      expect {
        post "/api/v1/discovery/#{bob.id}/connect", as: :json
      }.to change(Match, :count).by(1)

      expect(JSON.parse(response.body)["match_created"]).to be(true)
    end

    it "does NOT create a match if the other side passed" do
      bob.outgoing_connections.create!(target_user: alice, status: :pass)

      expect {
        post "/api/v1/discovery/#{bob.id}/connect", as: :json
      }.not_to change(Match, :count)

      expect(JSON.parse(response.body)["match_created"]).to be(false)
    end

    it "does NOT create a match on a single connect" do
      expect {
        post "/api/v1/discovery/#{bob.id}/connect", as: :json
      }.not_to change(Match, :count)

      expect(JSON.parse(response.body)["match_created"]).to be(false)
    end

    it "does NOT create a duplicate match on repeated connects" do
      bob.outgoing_connections.create!(target_user: alice, status: :connect)
      post "/api/v1/discovery/#{bob.id}/connect", as: :json

      expect {
        post "/api/v1/discovery/#{bob.id}/connect", as: :json
      }.not_to change(Match, :count)
    end

    it "leaves an existing match intact when a participant later passes" do
      bob.outgoing_connections.create!(target_user: alice, status: :connect)
      post "/api/v1/discovery/#{bob.id}/connect", as: :json

      expect(Match.count).to eq(1)

      # Alice changes her mind and passes on Bob.
      post "/api/v1/discovery/#{bob.id}/pass", as: :json

      # The connection status is now pass, but the match remains.
      expect(Connection.find_by(user: alice, target_user: bob).status).to eq("pass")
      expect(Match.count).to eq(1)
    end
  end
end
