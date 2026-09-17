# frozen_string_literal: true

require "rails_helper"

RSpec.describe "Me::Settings API", type: :request do
  let!(:user) { create(:user, email: "settings@example.com") }

  # ==================================================================
  # GET /api/v1/me/settings
  # ==================================================================
  describe "GET /api/v1/me/settings" do
    context "when not authenticated" do
      it "returns 401" do
        get "/api/v1/me/settings"
        expect(response).to have_http_status(:unauthorized)
      end
    end

    context "when authenticated" do
      before { sign_in(user) }

      it "returns the aggregated settings shape" do
        get "/api/v1/me/settings", as: :json

        expect(response).to have_http_status(:ok)
        body = JSON.parse(response.body)["settings"]

        expect(body["notifications"]).to eq({
          "email"           => true,
          "push"            => true,
          "matches"         => true,
          "messages"        => true,
          "project_updates" => true
        })

        expect(body["privacy"]).to eq({
          "show_online_status" => true,
          "show_last_active"   => true,
          "profile_visibility" => "public_profile",
          "show_on_explore"    => true
        })

        expect(body["preferences"]).to eq({
          "theme"            => "system",
          "language"         => "en",
          "discovery_radius" => 50
        })
      end

      it "reflects current user_settings values" do
        user.setting.update!(
          notify_email:           false,
          show_online_status:     false,
          theme:                  "dark",
          discovery_radius:       200
        )

        get "/api/v1/me/settings", as: :json

        body = JSON.parse(response.body)["settings"]
        expect(body["notifications"]["email"]).to be(false)
        expect(body["privacy"]["show_online_status"]).to be(false)
        expect(body["preferences"]["theme"]).to eq("dark")
        expect(body["preferences"]["discovery_radius"]).to eq(200)
      end

      it "reflects profile-level fields (profile_visibility, show_on_explore)" do
        user.profile.update!(
          profile_visibility: :private_profile,
          show_on_explore:    false
        )

        get "/api/v1/me/settings", as: :json

        body = JSON.parse(response.body)["settings"]
        expect(body["privacy"]["profile_visibility"]).to eq("private_profile")
        expect(body["privacy"]["show_on_explore"]).to be(false)
      end
    end
  end

  # ==================================================================
  # PATCH /api/v1/me/settings
  # ==================================================================
  describe "PATCH /api/v1/me/settings" do
    context "when not authenticated" do
      it "returns 401" do
        patch "/api/v1/me/settings", params: { settings: {} }, as: :json
        expect(response).to have_http_status(:unauthorized)
      end
    end

    context "when authenticated" do
      before { sign_in(user) }

      it "updates notification preferences only" do
        patch "/api/v1/me/settings", params: {
          settings: {
            notifications: { email: false, push: false }
          }
        }, as: :json

        expect(response).to have_http_status(:ok)
        user.setting.reload
        expect(user.setting.notify_email).to be(false)
        expect(user.setting.notify_push).to be(false)
        # Unmentioned notifications unchanged
        expect(user.setting.notify_matches).to be(true)
      end

      it "updates privacy settings across both tables" do
        patch "/api/v1/me/settings", params: {
          settings: {
            privacy: {
              show_online_status: false,
              profile_visibility: "private_profile"
            }
          }
        }, as: :json

        expect(response).to have_http_status(:ok)
        expect(user.setting.reload.show_online_status).to be(false)
        expect(user.profile.reload.profile_visibility).to eq("private_profile")
      end

      it "updates preferences only" do
        patch "/api/v1/me/settings", params: {
          settings: {
            preferences: { theme: "dark", language: "es", discovery_radius: 100 }
          }
        }, as: :json

        expect(response).to have_http_status(:ok)
        user.setting.reload
        expect(user.setting.theme).to eq("dark")
        expect(user.setting.language).to eq("es")
        expect(user.setting.discovery_radius).to eq(100)
      end

      it "updates multiple sections in one request" do
        patch "/api/v1/me/settings", params: {
          settings: {
            notifications: { email: false },
            privacy:       { show_last_active: false },
            preferences:   { theme: "light" }
          }
        }, as: :json

        expect(response).to have_http_status(:ok)
        user.setting.reload
        expect(user.setting.notify_email).to be(false)
        expect(user.setting.show_last_active).to be(false)
        expect(user.setting.theme).to eq("light")
      end

      it "returns the updated settings in the response" do
        patch "/api/v1/me/settings", params: {
          settings: { preferences: { theme: "dark" } }
        }, as: :json

        body = JSON.parse(response.body)["settings"]
        expect(body["preferences"]["theme"]).to eq("dark")
      end

      it "rejects an invalid theme" do
        patch "/api/v1/me/settings", params: {
          settings: { preferences: { theme: "purple" } }
        }, as: :json

        expect(response).to have_http_status(:unprocessable_content)
        body = JSON.parse(response.body)
        expect(body["error"]["code"]).to eq("VALIDATION_ERROR")
        expect(body["error"]["details"]).to have_key("theme")
      end

      it "rejects discovery_radius out of range" do
        patch "/api/v1/me/settings", params: {
          settings: { preferences: { discovery_radius: 9999 } }
        }, as: :json

        expect(response).to have_http_status(:unprocessable_content)
        body = JSON.parse(response.body)
        expect(body["error"]["details"]).to have_key("discovery_radius")
      end

      it "rejects discovery_radius below 1" do
        patch "/api/v1/me/settings", params: {
          settings: { preferences: { discovery_radius: 0 } }
        }, as: :json

        expect(response).to have_http_status(:unprocessable_content)
      end

      it "rolls back all changes if any section fails" do
        original_email_setting = user.setting.notify_email

        patch "/api/v1/me/settings", params: {
          settings: {
            notifications: { email: false },      # valid
            preferences:   { theme: "purple" }    # INVALID
          }
        }, as: :json

        expect(response).to have_http_status(:unprocessable_content)
        # Email change should have rolled back
        expect(user.setting.reload.notify_email).to eq(original_email_setting)
      end

      it "ignores unknown fields silently" do
        patch "/api/v1/me/settings", params: {
          settings: { preferences: { theme: "dark", evil_field: "hack" } }
        }, as: :json

        expect(response).to have_http_status(:ok)
        expect(user.setting.reload.theme).to eq("dark")
      end

      it "accepts an empty settings object (no-op)" do
        patch "/api/v1/me/settings", params: { settings: {} }, as: :json
        expect(response).to have_http_status(:ok)
      end

      it "returns 400 when settings key is missing" do
        patch "/api/v1/me/settings", params: {}, as: :json
        expect(response).to have_http_status(:bad_request)
        body = JSON.parse(response.body)
        expect(body["error"]["code"]).to eq("MISSING_PARAMETER")
      end
    end
  end
end
