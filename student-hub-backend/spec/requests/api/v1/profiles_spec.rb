# frozen_string_literal: true

require "rails_helper"

RSpec.describe "Profiles API", type: :request do
  # Every test has a signed-in viewer, except the auth test.
  let!(:viewer) { create(:user, email: "viewer@example.com") }

  describe "GET /api/v1/profiles" do
    context "when not authenticated" do
      it "returns 401" do
        get "/api/v1/profiles"
        expect(response).to have_http_status(:unauthorized)
      end
    end

    context "when authenticated" do
      before { sign_in(viewer) }

      it "returns an empty list when there are no other discoverable profiles" do
        get "/api/v1/profiles", as: :json

        expect(response).to have_http_status(:ok)
        body = JSON.parse(response.body)
        expect(body["profiles"]).to eq([])
        expect(body["meta"]["total_count"]).to eq(0)
        expect(body["meta"]["current_page"]).to eq(1)
      end

      it "returns other users' public profiles" do
        other = create(:user, email: "other@example.com")
        other.update!(name: "Other Student")
        other.profile.update!(university: "MIT")

        get "/api/v1/profiles", as: :json

        body = JSON.parse(response.body)
        expect(body["profiles"].length).to eq(1)
        expect(body["profiles"].first.dig("user", "name")).to eq("Other Student")
        expect(body["profiles"].first["university"]).to eq("MIT")
      end

      it "excludes the current user's own profile" do
        viewer.update!(name: "Viewer Name")

        get "/api/v1/profiles", as: :json

        body = JSON.parse(response.body)
        names = body["profiles"].map { |p| p.dig("user", "name") }
        expect(names).not_to include("Viewer Name")
      end

      it "excludes private profiles" do
        other = create(:user, email: "private@example.com")
        other.update!(name: "Private User")
        other.profile.update!(profile_visibility: :private_profile)

        get "/api/v1/profiles", as: :json

        body = JSON.parse(response.body)
        names = body["profiles"].map { |p| p.dig("user", "name") }
        expect(names).not_to include("Private User")
      end

      it "excludes profiles with show_on_explore = false" do
        other = create(:user, email: "hidden@example.com")
        other.update!(name: "Hidden User")
        other.profile.update!(show_on_explore: false)

        get "/api/v1/profiles", as: :json

        body = JSON.parse(response.body)
        names = body["profiles"].map { |p| p.dig("user", "name") }
        expect(names).not_to include("Hidden User")
      end

      it "includes interests and skills in the response" do
        other = create(:user, email: "with_int@example.com")
        other.interests.create!(name: "AI", is_custom: false)
        other.skills.create!(name: "Python", is_custom: false)

        get "/api/v1/profiles", as: :json

        body = JSON.parse(response.body)
        profile = body["profiles"].first
        expect(profile["interests"].map { |i| i["name"] }).to include("AI")
        expect(profile["skills"].map { |s| s["name"] }).to include("Python")
      end

      it "paginates with page and per_page params" do
        # Create 5 profiles
        5.times { |i| create(:user, email: "user#{i}@example.com") }

        get "/api/v1/profiles", params: { page: 2, per_page: 2 }, as: :json

        body = JSON.parse(response.body)
        expect(body["profiles"].length).to eq(2)
        expect(body["meta"]["current_page"]).to eq(2)
        expect(body["meta"]["per_page"]).to eq(2)
        expect(body["meta"]["total_count"]).to eq(5)
        expect(body["meta"]["total_pages"]).to eq(3)
      end

      it "caps per_page at 100" do
        get "/api/v1/profiles", params: { per_page: 5000 }, as: :json

        body = JSON.parse(response.body)
        expect(body["meta"]["per_page"]).to eq(100)
      end

      it "treats invalid page numbers as page 1" do
        get "/api/v1/profiles", params: { page: "abc" }, as: :json

        body = JSON.parse(response.body)
        expect(body["meta"]["current_page"]).to eq(1)
      end

      it "does not include portfolio_links in the list view" do
        other = create(:user, email: "with_links@example.com")
        other.portfolio_links.create!(
          link_type: :github,
          url:       "https://github.com/test",
          title:     "GitHub"
        )

        get "/api/v1/profiles", as: :json

        body = JSON.parse(response.body)
        profile = body["profiles"].first
        expect(profile).not_to have_key("portfolio_links")
      end
    end
  end

  describe "GET /api/v1/profiles/:id" do
    let!(:other) { create(:user, email: "other@example.com") }

    context "when not authenticated" do
      it "returns 401" do
        get "/api/v1/profiles/#{other.profile.id}"
        expect(response).to have_http_status(:unauthorized)
      end
    end

    context "when authenticated" do
      before { sign_in(viewer) }

      it "returns the profile with all details" do
        other.update!(name: "Detailed User")
        other.profile.update!(
          university: "Stanford",
          major:      "AI",
          tagline:    "Building things",
          bio:        "Long bio here",
          birthdate:  22.years.ago.to_date
        )
        other.interests.create!(name: "Robotics", is_custom: false)
        other.skills.create!(name: "Rust", is_custom: false)
        other.portfolio_links.create!(
          link_type: :github,
          url:       "https://github.com/other",
          title:     "My GitHub"
        )

        get "/api/v1/profiles/#{other.profile.id}", as: :json

        expect(response).to have_http_status(:ok)
        body = JSON.parse(response.body)["profile"]
        expect(body.dig("user", "name")).to eq("Detailed User")
        expect(body["university"]).to eq("Stanford")
        expect(body["age"]).to eq(22)
        expect(body["interests"].map { |i| i["name"] }).to include("Robotics")
        expect(body["skills"].map { |s| s["name"] }).to include("Rust")
        expect(body["portfolio_links"].length).to eq(1)
        expect(body["portfolio_links"].first["link_type"]).to eq("github")
      end

      it "does not include birthdate in the response" do
        other.profile.update!(birthdate: 22.years.ago.to_date)

        get "/api/v1/profiles/#{other.profile.id}", as: :json

        body = JSON.parse(response.body)["profile"]
        expect(body).not_to have_key("birthdate")
        expect(body).to have_key("age")
      end

      it "returns 404 for a nonexistent profile" do
        get "/api/v1/profiles/00000000-0000-0000-0000-000000000000", as: :json
        expect(response).to have_http_status(:not_found)
      end

      it "returns 404 for a private profile" do
        other.profile.update!(profile_visibility: :private_profile)

        get "/api/v1/profiles/#{other.profile.id}", as: :json
        expect(response).to have_http_status(:not_found)
      end

      it "returns 404 for a private profile even with show_on_explore true" do
        other.profile.update!(
          profile_visibility: :private_profile,
          show_on_explore:    true
        )

        get "/api/v1/profiles/#{other.profile.id}", as: :json
        expect(response).to have_http_status(:not_found)
      end

    end
  end
end