# frozen_string_literal: true

require "rails_helper"

RSpec.describe "Me::Interests API", type: :request do
  let!(:user) { create(:user, email: "interests@example.com") }

  describe "PUT /api/v1/me/interests" do
    context "when not authenticated" do
      it "returns 401" do
        put "/api/v1/me/interests", params: { interests: ["AI"] }, as: :json
        expect(response).to have_http_status(:unauthorized)
      end
    end

    context "when authenticated" do
      before { sign_in(user) }

      it "replaces interests with the provided list" do
        put "/api/v1/me/interests", params: {
          interests: ["AI", "Machine Learning", "Robotics"]
        }, as: :json

        expect(response).to have_http_status(:ok)
        body = JSON.parse(response.body)
        expect(body["interests"].map { |i| i["name"] }).to match_array(
          ["AI", "Machine Learning", "Robotics"]
        )
        expect(user.reload.interests.count).to eq(3)
      end

      it "replaces previous interests completely" do
        user.interests.create!(name: "OldInterest", is_custom: true)

        put "/api/v1/me/interests", params: {
          interests: ["NewInterest"]
        }, as: :json

        expect(response).to have_http_status(:ok)
        expect(user.reload.interests.map(&:name)).to eq(["NewInterest"])
        expect(Interest.exists?(name: "OldInterest")).to be(false)
        # Note: this only holds if OldInterest was custom and no other
        # user had it. If it were shared, it wouldn't be destroyed.
      end

      it "reuses existing interests (case-insensitive)" do
        existing = Interest.create!(name: "Python", is_custom: false)

        put "/api/v1/me/interests", params: {
          interests: ["python"]  # lowercase
        }, as: :json

        expect(response).to have_http_status(:ok)
        expect(user.reload.interests.first.id).to eq(existing.id)
        # Should NOT have created a second "Python"
        expect(Interest.where("LOWER(name) = 'python'").count).to eq(1)
      end

      it "creates custom interests for names that don't exist" do
        put "/api/v1/me/interests", params: {
          interests: ["Totally Unique Interest"]
        }, as: :json

        expect(response).to have_http_status(:ok)
        interest = Interest.find_by(name: "Totally Unique Interest")
        expect(interest).to be_present
        expect(interest.is_custom).to be(true)
      end

      it "deduplicates case-insensitively within a single request" do
        put "/api/v1/me/interests", params: {
          interests: ["AI", "ai", "Ai"]
        }, as: :json

        expect(response).to have_http_status(:ok)
        expect(user.reload.interests.count).to eq(1)
      end

      it "strips whitespace" do
        put "/api/v1/me/interests", params: {
          interests: ["  AI  ", "  Robotics  "]
        }, as: :json

        expect(response).to have_http_status(:ok)
        names = user.reload.interests.map(&:name)
        expect(names).to match_array(["AI", "Robotics"])
      end

      it "ignores empty strings" do
        put "/api/v1/me/interests", params: {
          interests: ["AI", "", "   ", "Robotics"]
        }, as: :json

        expect(response).to have_http_status(:ok)
        expect(user.reload.interests.count).to eq(2)
      end

      it "handles empty array" do
        user.interests.create!(name: "Previous", is_custom: true)

        put "/api/v1/me/interests", params: { interests: [] }, as: :json

        expect(response).to have_http_status(:ok)
        expect(user.reload.interests.count).to eq(0)
      end

      it "returns 400 when interests is not an array" do
        put "/api/v1/me/interests", params: { interests: "AI" }, as: :json

        expect(response).to have_http_status(:bad_request)
        body = JSON.parse(response.body)
        expect(body["error"]["code"]).to eq("INVALID_PARAMETER")
      end

      it "returns 400 when interests param is missing" do
        put "/api/v1/me/interests", params: {}, as: :json

        expect(response).to have_http_status(:bad_request)
      end
    end
  end
end