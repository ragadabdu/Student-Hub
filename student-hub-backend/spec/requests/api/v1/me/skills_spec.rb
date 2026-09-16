# frozen_string_literal: true

require "rails_helper"

RSpec.describe "Me::Skills API", type: :request do
  let!(:user) { create(:user, email: "skills@example.com") }

  describe "PUT /api/v1/me/skills" do
    context "when not authenticated" do
      it "returns 401" do
        put "/api/v1/me/skills", params: { skills: ["Ruby"] }, as: :json
        expect(response).to have_http_status(:unauthorized)
      end
    end

    context "when authenticated" do
      before { sign_in(user) }

      it "replaces skills with the provided list" do
        put "/api/v1/me/skills", params: {
          skills: ["Ruby", "Rails", "PostgreSQL"]
        }, as: :json

        expect(response).to have_http_status(:ok)
        body = JSON.parse(response.body)
        expect(body["skills"].map { |s| s["name"] }).to match_array(
          ["Ruby", "Rails", "PostgreSQL"]
        )
      end

      it "reuses existing skills (case-insensitive)" do
        existing = Skill.create!(name: "Ruby", is_custom: false)

        put "/api/v1/me/skills", params: {
          skills: ["ruby"]
        }, as: :json

        expect(response).to have_http_status(:ok)
        expect(user.reload.skills.first.id).to eq(existing.id)
      end

      it "deduplicates case-insensitively" do
        put "/api/v1/me/skills", params: {
          skills: ["Ruby", "ruby", "RUBY"]
        }, as: :json

        expect(response).to have_http_status(:ok)
        expect(user.reload.skills.count).to eq(1)
      end

      it "returns 400 when skills is not an array" do
        put "/api/v1/me/skills", params: { skills: "Ruby" }, as: :json
        expect(response).to have_http_status(:bad_request)
      end
    end
  end
end