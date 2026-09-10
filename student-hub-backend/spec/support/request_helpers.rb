# spec/support/request_helpers.rb
module RequestHelpers
  # Sign in a user for request specs. Devise's built-in test helpers
  # work for controller specs, but request specs need a different approach.
  # We'll fill this in during Phase 1.
end

RSpec.configure do |config|
  config.include RequestHelpers, type: :request
end