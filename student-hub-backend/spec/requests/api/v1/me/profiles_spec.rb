# frozen_string_literal: true

require "rails_helper"

RSpec.describe "Me::Profiles API", type: :request do
  let!(:user) { create(:user, email: "me@example.com") }

  describe "GET /api/v1/me/profile" do
    context "when not authenticated" do
      it "returns 401" do
        get "/api/v1/me/profile"
        expect(response).to have_http_status(:unauthorized)
      end
    end

    context "when authenticated" do
      before { sign_in(user) }

      it "returns the current user's profile" do
        user.profile.update!(name: "Me Myself", university: "MyU")

        get "/api/v1/me/profile", as: :json

        expect(response).to have_http_status(:ok)
        body = JSON.parse(response.body)["profile"]
        expect(body["name"]).to eq("Me Myself")
        expect(body["university"]).to eq("MyU")
      end

      it "includes portfolio links" do
        user.portfolio_links.create!(
          link_type: :github,
          url:       "https://github.com/me"
        )

        get "/api/v1/me/profile", as: :json

        body = JSON.parse(response.body)["profile"]
        expect(body["portfolio_links"].length).to eq(1)
      end
    end
  end

  describe "PATCH /api/v1/me/profile" do
    context "when not authenticated" do
      it "returns 401" do
        patch "/api/v1/me/profile", params: { profile: { name: "Hacker" } }, as: :json
        expect(response).to have_http_status(:unauthorized)
      end
    end

    context "when authenticated" do
      before { sign_in(user) }

      it "updates name, university, major, tagline, and bio" do
        patch "/api/v1/me/profile", params: {
          profile: {
            name:       "New Name",
            university: "NewU",
            major:      "Physics",
            tagline:    "Changed tagline",
            bio:        "New bio"
          }
        }, as: :json

        expect(response).to have_http_status(:ok)
        user.profile.reload
        expect(user.profile.name).to eq("New Name")
        expect(user.profile.university).to eq("NewU")
        expect(user.profile.major).to eq("Physics")
        expect(user.profile.tagline).to eq("Changed tagline")
        expect(user.profile.bio).to eq("New bio")
      end

      it "updates looking_for enum" do
        patch "/api/v1/me/profile", params: {
          profile: { looking_for: "mentors" }
        }, as: :json

        expect(response).to have_http_status(:ok)
        expect(user.profile.reload.looking_for).to eq("mentors")
      end

      it "updates profile_visibility enum" do
        patch "/api/v1/me/profile", params: {
          profile: { profile_visibility: "private_profile" }
        }, as: :json

        expect(response).to have_http_status(:ok)
        expect(user.profile.reload.profile_visibility).to eq("private_profile")
      end

      it "updates birthdate and returns computed age" do
        patch "/api/v1/me/profile", params: {
          profile: { birthdate: 25.years.ago.to_date.to_s }
        }, as: :json

        expect(response).to have_http_status(:ok)
        body = JSON.parse(response.body)["profile"]
        expect(body["age"]).to eq(25)
      end

      it "returns 422 when validation fails" do
        patch "/api/v1/me/profile", params: {
          profile: { bio: "a" * 501 }
        }, as: :json

        expect(response).to have_http_status(:unprocessable_content)
        body = JSON.parse(response.body)
        expect(body["error"]["code"]).to eq("VALIDATION_ERROR")
        expect(body["error"]["details"]).to have_key("bio")
      end

      it "rejects birthdate in the future" do
        patch "/api/v1/me/profile", params: {
          profile: { birthdate: (Date.current + 1.day).to_s }
        }, as: :json

        expect(response).to have_http_status(:unprocessable_content)
        body = JSON.parse(response.body)
        expect(body["error"]["details"]).to have_key("birthdate")
      end

      it "cannot update another user's profile" do
        other = create(:user, email: "victim@example.com")
        original_name = other.profile.name

        patch "/api/v1/me/profile", params: {
          profile: { name: "Attacker" }
        }, as: :json

        # The current user's profile is updated (not the other user's),
        # because /me is scoped to current_user.
        expect(user.profile.reload.name).to eq("Attacker")
        expect(other.profile.reload.name).to eq(original_name)
      end
    end
  end
end