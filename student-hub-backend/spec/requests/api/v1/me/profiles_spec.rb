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

      it "returns the current user's profile with embedded user" do
        user.update!(name: "Me Myself")
        user.profile.update!(university: "MyU")

        get "/api/v1/me/profile", as: :json

        expect(response).to have_http_status(:ok)
        body = JSON.parse(response.body)["profile"]
        expect(body["university"]).to eq("MyU")
        expect(body["user"]["name"]).to eq("Me Myself")
        expect(body["user"]["id"]).to eq(user.id)
        expect(body["user"]["avatar_url"]).to be_nil
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
        patch "/api/v1/me/profile", params: { user: { name: "Hacker" } }, as: :json
        expect(response).to have_http_status(:unauthorized)
      end
    end

    context "when authenticated" do
      before { sign_in(user) }

      it "updates name (user attribute)" do
        patch "/api/v1/me/profile", params: {
          user: { name: "New Name" }
        }, as: :json

        expect(response).to have_http_status(:ok)
        expect(user.reload.name).to eq("New Name")
      end

      it "updates profile attributes" do
        patch "/api/v1/me/profile", params: {
          profile: {
            university: "NewU",
            major:      "Physics",
            tagline:    "Changed tagline",
            bio:        "New bio"
          }
        }, as: :json

        expect(response).to have_http_status(:ok)
        user.profile.reload
        expect(user.profile.university).to eq("NewU")
        expect(user.profile.major).to eq("Physics")
        expect(user.profile.tagline).to eq("Changed tagline")
        expect(user.profile.bio).to eq("New bio")
      end

      it "updates both user and profile atomically" do
        patch "/api/v1/me/profile", params: {
          user:    { name: "Both Names" },
          profile: { university: "BothU" }
        }, as: :json

        expect(response).to have_http_status(:ok)
        user.reload
        expect(user.name).to eq("Both Names")
        expect(user.profile.university).to eq("BothU")
      end

      it "rolls back if profile validation fails" do
        original_name = user.name
        original_bio  = user.profile.bio

        patch "/api/v1/me/profile", params: {
          user:    { name: "Should Not Persist" },
          profile: { bio: "a" * 501 }
        }, as: :json

        expect(response).to have_http_status(:unprocessable_content)
        expect(user.reload.name).to eq(original_name)
        expect(user.profile.reload.bio).to eq(original_bio)
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

      it "returns 422 when profile validation fails" do
        patch "/api/v1/me/profile", params: {
          profile: { bio: "a" * 501 }
        }, as: :json

        expect(response).to have_http_status(:unprocessable_content)
        body = JSON.parse(response.body)
        expect(body["error"]["code"]).to eq("VALIDATION_ERROR")
        expect(body["error"]["details"]).to have_key("bio")
      end

      it "returns 422 when user validation fails" do
        patch "/api/v1/me/profile", params: {
          user: { name: "a" * 101 }
        }, as: :json

        expect(response).to have_http_status(:unprocessable_content)
        body = JSON.parse(response.body)
        expect(body["error"]["details"]).to have_key("name")
      end

      it "rejects birthdate in the future" do
        patch "/api/v1/me/profile", params: {
          profile: { birthdate: (Date.current + 1.day).to_s }
        }, as: :json

        expect(response).to have_http_status(:unprocessable_content)
        body = JSON.parse(response.body)
        expect(body["error"]["details"]).to have_key("birthdate")
      end
    end
  end
end