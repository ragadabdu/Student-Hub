# frozen_string_literal: true

module Api
  module V1
    module Me
      class SettingsController < ApplicationController
        NOTIFICATION_MAP = {
          email:           :notify_email,
          push:            :notify_push,
          matches:         :notify_matches,
          messages:        :notify_messages,
          project_updates: :notify_project_updates
        }.freeze

        NOTIFICATION_KEYS = NOTIFICATION_MAP.keys.freeze

        # GET /api/v1/me/settings
        def show
          render json: { settings: settings_payload }
        end

        # PATCH /api/v1/me/settings
        def update
          ActiveRecord::Base.transaction do
            apply_notification_updates
            apply_privacy_updates
            apply_preference_updates
          end

          render json: { settings: settings_payload }
        rescue ActiveRecord::RecordInvalid => e
          render_error(
            code:    "VALIDATION_ERROR",
            message: "Settings could not be updated",
            details: e.record.errors.to_hash,
            status:  :unprocessable_content
          )
        end

        private

        def settings_payload
          SettingsSerializer.new(
            setting: current_user.setting,
            profile: current_user.profile
          ).as_json
        end

        def apply_notification_updates
          n = settings_params[:notifications]
          return if n.blank?

          current_user.setting.update!(notification_attrs(n))
        end

        def apply_privacy_updates
          p = settings_params[:privacy]
          return if p.blank?

          user_setting_keys = %i[show_online_status show_last_active]
          profile_keys      = %i[profile_visibility show_on_explore]

          user_attrs    = p.slice(*user_setting_keys).to_h
          profile_attrs = p.slice(*profile_keys).to_h

          current_user.setting.update!(user_attrs)    if user_attrs.present?
          current_user.profile.update!(profile_attrs) if profile_attrs.present?
        end

        def apply_preference_updates
          p = settings_params[:preferences]
          return if p.blank?

          pref_keys = %i[theme language discovery_radius]
          attrs = p.slice(*pref_keys).to_h

          current_user.setting.update!(attrs) if attrs.present?
        end

        # Convert the JSON "notifications" sub-hash (string keys like "email")
        # into the flat column names UserSetting expects (:notify_email).
        def notification_attrs(params_hash)
          params_hash.to_h.symbolize_keys.transform_keys(NOTIFICATION_MAP)
        end

        def settings_params
          # Distinguish "settings key absent" (400) from "settings: {}" (200).
          unless params.key?(:settings)
            raise ActionController::ParameterMissing, :settings
          end

          params[:settings].permit(
            notifications: NOTIFICATION_KEYS,
            privacy:       [:show_online_status, :show_last_active,
                            :profile_visibility, :show_on_explore],
            preferences:   [:theme, :language, :discovery_radius]
          )
        end
      end
    end
  end
end