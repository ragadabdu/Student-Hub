# frozen_string_literal: true

if defined?(Bullet)
  Bullet.enable        = true
  Bullet.alert         = false
  Bullet.bullet_logger = true
  Bullet.console       = true
  Bullet.rails_logger  = true
  Bullet.add_footer    = false

  # Enable N+1 detection for ActiveRecord
  Bullet.n_plus_one_query_enable     = true
  Bullet.unused_eager_loading_enable = true
  Bullet.counter_cache_enable        = true
end