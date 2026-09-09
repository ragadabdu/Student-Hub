# config/initializers/cors.rb

Rails.application.config.middleware.insert_before 0, Rack::Cors do
  allow do
    # Development origins
    if Rails.env.development?
      origins 'http://localhost:5173', 'http://localhost:5174', 'http://127.0.0.1:5173', 'http://127.0.0.1:5174'
    elsif Rails.env.production?
      origins 'https://your-student-hub-domain.com'
    else
      origins []
    end

    resource '*',
      headers: :any,
      methods: [:get, :post, :put, :patch, :delete, :options, :head],
      credentials: false,  
      max_age: 86400
  end
end