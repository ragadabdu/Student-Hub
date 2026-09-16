# frozen_string_literal: true

module Api
  module V1
    class ProjectsController < ApplicationController
      # ------------------------------------------------------------------
      # GET /api/v1/projects
      #
      # Query params:
      #   page        (default 1)
      #   per_page    (default 20, max 100)
      #   category    (optional enum string, e.g. "web_dev")
      #   owner_id    (optional UUID)
      #   q           (optional search string — title or description)
      # ------------------------------------------------------------------
      def index
        scope = Project
          .includes(:user, :skills)
          .recent_first
          .search(params[:q])
          .by_category(params[:category])
          .owned_by(params[:owner_id])

        result = Pagination.paginate(
          scope,
          page:     params[:page],
          per_page: params[:per_page]
        )

        projects = ActiveModelSerializers::SerializableResource.new(
          result[:records],
          each_serializer: ProjectSerializer
        ).as_json

        render json: {
          projects: projects,
          meta:     result[:meta]
        }
      end

      # ------------------------------------------------------------------
      # GET /api/v1/projects/:id
      # ------------------------------------------------------------------
      def show
        project = Project.includes(:user, :skills).find(params[:id])

        serialized = ActiveModelSerializers::SerializableResource.new(
          project,
          serializer: ProjectSerializer
        ).as_json

        render json: { project: serialized }
      end

      # ------------------------------------------------------------------
      # POST /api/v1/projects
      #
      # Body:
      #   {
      #     "project": {
      #       "title": "...",
      #       "description": "...",
      #       "category": "web_dev",
      #       "team_size": 4,
      #       "looking_for": "project_collaborators",
      #       "github_url": "https://...",
      #       "live_demo_url": "https://...",
      #       "skill_names": ["Python", "Rails"]
      #     }
      #   }
      # ------------------------------------------------------------------
      def create
        project = current_user.projects.new(project_params)

        ActiveRecord::Base.transaction do
          project.save!

          if params.dig(:project, :skill_names).present?
            Projects::SyncSkills.call(
              project: project,
              names:   params[:project][:skill_names]
            )
          end
        end

        serialized = ActiveModelSerializers::SerializableResource.new(
          project.reload,
          serializer: ProjectSerializer
        ).as_json

        render json: { project: serialized }, status: :created
      rescue ActiveRecord::RecordInvalid => e
        render_error(
          code:    "VALIDATION_ERROR",
          message: "Project could not be created",
          details: e.record.errors.to_hash,
          status:  :unprocessable_content
        )
      end

      # ------------------------------------------------------------------
      # PATCH /api/v1/projects/:id
      # ------------------------------------------------------------------
      def update
        # Scoped to current_user: a user can only find/update their own
        # projects. Attempting to update someone else's project returns
        # 404, not 403, so we don't leak existence.
        project = current_user.projects.find(params[:id])

        ActiveRecord::Base.transaction do
          project.update!(project_params)

          # skill_names is handled separately from project_params because
          # it's not a column on Project. If present (even as an empty
          # array), we sync.
          if params.dig(:project, :skill_names).present? ||
             params.dig(:project, :skill_names) == []
            Projects::SyncSkills.call(
              project: project,
              names:   params[:project][:skill_names]
            )
          end
        end

        serialized = ActiveModelSerializers::SerializableResource.new(
          project.reload,
          serializer: ProjectSerializer
        ).as_json

        render json: { project: serialized }
      rescue ActiveRecord::RecordInvalid => e
        render_error(
          code:    "VALIDATION_ERROR",
          message: "Project could not be updated",
          details: e.record.errors.to_hash,
          status:  :unprocessable_content
        )
      end

      # ------------------------------------------------------------------
      # DELETE /api/v1/projects/:id
      # ------------------------------------------------------------------
      def destroy
        # Same authorization pattern: scoped to current_user → 404 if
        # not the owner.
        project = current_user.projects.find(params[:id])
        project.destroy
        head :no_content
      end

      private

      def project_params
        params.require(:project).permit(
          :title,
          :description,
          :category,
          :team_size,
          :looking_for,
          :github_url,
          :live_demo_url
        )
      end
    end
  end
end
