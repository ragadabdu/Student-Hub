# frozen_string_literal: true

require "rails_helper"

RSpec.describe "Projects API", type: :request do
  let!(:user)  { create(:user, email: "owner@example.com", name: "Owner") }
  let!(:other) { create(:user, email: "other@example.com", name: "Other") }

  # ==================================================================
  # GET /api/v1/projects
  # ==================================================================
  describe "GET /api/v1/projects" do
    context "when not authenticated" do
      it "returns 401" do
        get "/api/v1/projects"
        expect(response).to have_http_status(:unauthorized)
      end
    end

    context "when authenticated" do
      before { sign_in(user) }

      it "returns an empty list when there are no projects" do
        get "/api/v1/projects", as: :json

        expect(response).to have_http_status(:ok)
        body = JSON.parse(response.body)
        expect(body["projects"]).to eq([])
        expect(body["meta"]["total_count"]).to eq(0)
      end

      it "returns all projects with owner and skills inlined" do
        project = other.projects.create!(title: "Cool Project", category: :ai_ml)
        project.skills.create!(name: "Python", is_custom: false)

        get "/api/v1/projects", as: :json

        body = JSON.parse(response.body)
        expect(body["projects"].length).to eq(1)
        p = body["projects"].first
        expect(p["title"]).to eq("Cool Project")
        expect(p["category"]).to eq("ai_ml")
        expect(p["owner"]["id"]).to eq(other.id)
        expect(p["owner"]["name"]).to eq("Other")
        expect(p["owner"]["avatar_url"]).to be_nil
        expect(p["skills"].map { |s| s["name"] }).to eq(["Python"])
      end

      it "orders by created_at descending (newest first)" do
        old_project = other.projects.create!(title: "Old", created_at: 2.days.ago)
        new_project = other.projects.create!(title: "New", created_at: 1.hour.ago)

        get "/api/v1/projects", as: :json

        titles = JSON.parse(response.body)["projects"].map { |p| p["title"] }
        expect(titles).to eq(["New", "Old"])
      end

      it "filters by category" do
        other.projects.create!(title: "AI Thing", category: :ai_ml)
        other.projects.create!(title: "Web Thing", category: :web_dev)

        get "/api/v1/projects", params: { category: "ai_ml" }, as: :json

        titles = JSON.parse(response.body)["projects"].map { |p| p["title"] }
        expect(titles).to eq(["AI Thing"])
      end

      it "filters by owner_id" do
        user.projects.create!(title: "Mine")
        other.projects.create!(title: "Theirs")

        get "/api/v1/projects", params: { owner_id: user.id }, as: :json

        titles = JSON.parse(response.body)["projects"].map { |p| p["title"] }
        expect(titles).to eq(["Mine"])
      end

      it "searches title and description case-insensitively" do
        other.projects.create!(title: "Machine Learning", description: "AI stuff")
        other.projects.create!(title: "Web App", description: "A MACHINE for the web")
        other.projects.create!(title: "Unrelated", description: "Nothing here")

        get "/api/v1/projects", params: { q: "machine" }, as: :json

        titles = JSON.parse(response.body)["projects"].map { |p| p["title"] }.sort
        expect(titles).to eq(["Machine Learning", "Web App"])
      end

      it "safely handles search special characters" do
        other.projects.create!(title: "100% Complete")
        other.projects.create!(title: "Other")

        # % is a wildcard in SQL LIKE. Sanitization should treat it literally.
        get "/api/v1/projects", params: { q: "100%" }, as: :json

        titles = JSON.parse(response.body)["projects"].map { |p| p["title"] }
        expect(titles).to eq(["100% Complete"])
      end

      it "paginates with page and per_page" do
        5.times { |i| other.projects.create!(title: "Project #{i}") }

        get "/api/v1/projects", params: { page: 2, per_page: 2 }, as: :json

        body = JSON.parse(response.body)
        expect(body["projects"].length).to eq(2)
        expect(body["meta"]["current_page"]).to eq(2)
        expect(body["meta"]["per_page"]).to eq(2)
        expect(body["meta"]["total_count"]).to eq(5)
        expect(body["meta"]["total_pages"]).to eq(3)
      end

      it "caps per_page at 100" do
        get "/api/v1/projects", params: { per_page: 5000 }, as: :json
        expect(JSON.parse(response.body)["meta"]["per_page"]).to eq(100)
      end
    end
  end

  # ==================================================================
  # GET /api/v1/projects/:id
  # ==================================================================
  describe "GET /api/v1/projects/:id" do
    let!(:project) do
      other.projects.create!(
        title:       "Detailed Project",
        description: "Full description",
        category:    :mobile,
        team_size:   3,
        looking_for: :project_collaborators,
        github_url:  "https://github.com/other/project"
      )
    end

    context "when not authenticated" do
      it "returns 401" do
        get "/api/v1/projects/#{project.id}"
        expect(response).to have_http_status(:unauthorized)
      end
    end

    context "when authenticated" do
      before { sign_in(user) }

      it "returns the project with full details" do
        project.skills.create!(name: "Swift", is_custom: false)

        get "/api/v1/projects/#{project.id}", as: :json

        expect(response).to have_http_status(:ok)
        body = JSON.parse(response.body)["project"]
        expect(body["title"]).to eq("Detailed Project")
        expect(body["description"]).to eq("Full description")
        expect(body["category"]).to eq("mobile")
        expect(body["team_size"]).to eq(3)
        expect(body["looking_for"]).to eq("project_collaborators")
        expect(body["github_url"]).to eq("https://github.com/other/project")
        expect(body["owner"]["id"]).to eq(other.id)
        expect(body["skills"].map { |s| s["name"] }).to eq(["Swift"])
      end

      it "returns 404 for a nonexistent project" do
        get "/api/v1/projects/00000000-0000-0000-0000-000000000000", as: :json
        expect(response).to have_http_status(:not_found)
      end

      it "allows the owner to view their own project" do
        mine = user.projects.create!(title: "Mine")
        get "/api/v1/projects/#{mine.id}", as: :json
        expect(response).to have_http_status(:ok)
      end
    end
  end

  # ==================================================================
  # POST /api/v1/projects
  # ==================================================================
  describe "POST /api/v1/projects" do
    let(:valid_params) do
      {
        project: {
          title:       "New Project",
          description: "A description",
          category:    "web_dev",
          team_size:   4,
          looking_for: "project_collaborators",
          github_url:  "https://github.com/me/project"
        }
      }
    end

    context "when not authenticated" do
      it "returns 401" do
        post "/api/v1/projects", params: valid_params, as: :json
        expect(response).to have_http_status(:unauthorized)
      end
    end

    context "when authenticated" do
      before { sign_in(user) }

      it "creates a project owned by the current user" do
        expect {
          post "/api/v1/projects", params: valid_params, as: :json
        }.to change(user.projects, :count).by(1)

        expect(response).to have_http_status(:created)
        body = JSON.parse(response.body)["project"]
        expect(body["title"]).to eq("New Project")
        expect(body["owner"]["id"]).to eq(user.id)
      end

      it "syncs skills from skill_names" do
        post "/api/v1/projects", params: valid_params.deep_merge(
          project: { skill_names: ["Python", "Rails"] }
        ), as: :json

        expect(response).to have_http_status(:created)
        body = JSON.parse(response.body)["project"]
        expect(body["skills"].map { |s| s["name"] }).to match_array(["Python", "Rails"])
      end

      it "creates custom skills for unknown names" do
        post "/api/v1/projects", params: valid_params.deep_merge(
          project: { skill_names: ["SuperNiche"] }
        ), as: :json

        expect(response).to have_http_status(:created)
        skill = Skill.find_by(name: "SuperNiche")
        expect(skill).to be_present
        expect(skill.is_custom).to be(true)
      end

      it "rejects missing title" do
        post "/api/v1/projects", params: { project: { title: "" } }, as: :json
        expect(response).to have_http_status(:unprocessable_content)
        body = JSON.parse(response.body)
        expect(body["error"]["code"]).to eq("VALIDATION_ERROR")
        expect(body["error"]["details"]).to have_key("title")
      end

      it "rejects title longer than 120 chars" do
        post "/api/v1/projects", params: valid_params.deep_merge(
          project: { title: "a" * 121 }
        ), as: :json

        expect(response).to have_http_status(:unprocessable_content)
        body = JSON.parse(response.body)
        expect(body["error"]["details"]).to have_key("title")
      end

      it "rejects invalid URL" do
        post "/api/v1/projects", params: valid_params.deep_merge(
          project: { github_url: "not-a-url" }
        ), as: :json

        expect(response).to have_http_status(:unprocessable_content)
        body = JSON.parse(response.body)
        expect(body["error"]["details"]).to have_key("github_url")
      end

      it "rejects team_size of 0" do
        post "/api/v1/projects", params: valid_params.deep_merge(
          project: { team_size: 0 }
        ), as: :json

        expect(response).to have_http_status(:unprocessable_content)
      end

      it "rejects team_size greater than 100" do
        post "/api/v1/projects", params: valid_params.deep_merge(
          project: { team_size: 200 }
        ), as: :json

        expect(response).to have_http_status(:unprocessable_content)
      end

      it "returns 400 for missing project key" do
        post "/api/v1/projects", params: {}, as: :json
        expect(response).to have_http_status(:bad_request)
        body = JSON.parse(response.body)
        expect(body["error"]["code"]).to eq("MISSING_PARAMETER")
      end
    end
  end

  # ==================================================================
  # PATCH /api/v1/projects/:id
  # ==================================================================
  describe "PATCH /api/v1/projects/:id" do
    let!(:project) { user.projects.create!(title: "Original Title") }

    context "when not authenticated" do
      it "returns 401" do
        patch "/api/v1/projects/#{project.id}",
              params: { project: { title: "Hacked" } }, as: :json
        expect(response).to have_http_status(:unauthorized)
      end
    end

    context "when authenticated as the owner" do
      before { sign_in(user) }

      it "updates the project" do
        patch "/api/v1/projects/#{project.id}",
              params: { project: { title: "Updated", category: "design" } },
              as: :json

        expect(response).to have_http_status(:ok)
        project.reload
        expect(project.title).to eq("Updated")
        expect(project.category).to eq("design")
      end

      it "syncs skills when skill_names is provided" do
        project.skills.create!(name: "OldSkill", is_custom: true)

        patch "/api/v1/projects/#{project.id}",
              params: { project: { skill_names: ["NewSkill"] } },
              as: :json

        expect(response).to have_http_status(:ok)
        expect(project.reload.skills.map(&:name)).to eq(["NewSkill"])
      end

      it "clears all skills when skill_names is an empty array" do
        project.skills.create!(name: "OldSkill", is_custom: true)

        patch "/api/v1/projects/#{project.id}",
              params: { project: { skill_names: [] } },
              as: :json

        expect(response).to have_http_status(:ok)
        expect(project.reload.skills.count).to eq(0)
      end

      it "rejects invalid updates" do
        patch "/api/v1/projects/#{project.id}",
              params: { project: { title: "" } },
              as: :json

        expect(response).to have_http_status(:unprocessable_content)
      end
    end

    context "when authenticated as a non-owner" do
      before { sign_in(other) }

      it "returns 404 (does not leak existence)" do
        patch "/api/v1/projects/#{project.id}",
              params: { project: { title: "Hacked" } },
              as: :json

        expect(response).to have_http_status(:not_found)
        expect(project.reload.title).to eq("Original Title")
      end
    end
  end

  # ==================================================================
  # DELETE /api/v1/projects/:id
  # ==================================================================
  describe "DELETE /api/v1/projects/:id" do
    let!(:project) { user.projects.create!(title: "To Be Deleted") }

    context "when not authenticated" do
      it "returns 401" do
        delete "/api/v1/projects/#{project.id}"
        expect(response).to have_http_status(:unauthorized)
      end
    end

    context "when authenticated as the owner" do
      before { sign_in(user) }

      it "deletes the project" do
        expect {
          delete "/api/v1/projects/#{project.id}", as: :json
        }.to change(Project, :count).by(-1)

        expect(response).to have_http_status(:no_content)
      end

      it "cascades to project_skills" do
        project.skills.create!(name: "Python", is_custom: false)

        expect {
          delete "/api/v1/projects/#{project.id}", as: :json
        }.to change(ProjectSkill, :count).by(-1)
      end
    end

    context "when authenticated as a non-owner" do
      before { sign_in(other) }

      it "returns 404 (does not leak existence)" do
        delete "/api/v1/projects/#{project.id}", as: :json

        expect(response).to have_http_status(:not_found)
        expect(Project.exists?(project.id)).to be(true)
      end
    end
  end
end
