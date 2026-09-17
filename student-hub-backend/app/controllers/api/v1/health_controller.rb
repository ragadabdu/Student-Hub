# frozen_string_literal: true

module Api
  module V1
    # Health endpoint for load balancers and uptime monitors.
    # Public — does not require authentication.
    #
    # Returns:
    #   200 — app boots and the database is reachable
    #   503 — database is unreachable (the app is degraded)
    class HealthController < ::ApplicationController
      def show
        db_ok = database_reachable?

        status_code = db_ok ? :ok : :service_unavailable

        render json: {
          status:    db_ok ? "ok" : "degraded",
          time:      Time.current.iso8601,
          checks: {
            database: db_ok ? "ok" : "unreachable"
          }
        }, status: status_code
      end

      private

      def database_reachable?
        ActiveRecord::Base.connection.select_value("SELECT 1") == 1
      rescue StandardError => e
        Rails.logger.error("Health check: database unreachable: #{e.class}: #{e.message}")
        false
      end
    end
  end
end