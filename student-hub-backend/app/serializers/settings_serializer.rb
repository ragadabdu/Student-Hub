# frozen_string_literal: true

class SettingsSerializer
  def initialize(setting:, profile:)
    @setting = setting
    @profile = profile
  end

  def as_json(*)
    {
      notifications: {
        email:           @setting.notify_email,
        push:            @setting.notify_push,
        matches:         @setting.notify_matches,
        messages:        @setting.notify_messages,
        project_updates: @setting.notify_project_updates
      },
      privacy: {
        show_online_status: @setting.show_online_status,
        show_last_active:   @setting.show_last_active,
        profile_visibility: @profile.profile_visibility,
        show_on_explore:    @profile.show_on_explore
      },
      preferences: {
        theme:            @setting.theme,
        language:         @setting.language,
        discovery_radius: @setting.discovery_radius
      }
    }
  end
end