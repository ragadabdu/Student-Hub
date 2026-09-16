# frozen_string_literal: true

Rails.application.routes.draw do
  get "up" => "rails/health#show", as: :rails_health_check

  # Register Devise's :user mapping. We skip all route groups
  # because we expose our own /api/v1/auth/* endpoints.
  devise_for :users, skip: [:sessions, :registrations, :passwords,
                            :confirmations, :unlocks]

  namespace :api do
    namespace :v1 do
      get "health", to: "health#show"

      namespace :auth do
        post   "register", to: "registrations#create"
        post   "login",    to: "sessions#create"
        delete "logout",   to: "sessions#destroy"
        get    "me",       to: "sessions#show"
      end

      # Projects — full CRUD
      resources :projects, only: [:index, :show, :create, :update, :destroy]

      # Discoverable profiles (list and view).
      resources :profiles, only: [:index, :show]

      # Current user's own profile and related resources.
      namespace :me do
        resource  :profile,          only: [:show, :update]
        resource  :interests,        only: [:update]
        resource  :skills,           only: [:update]
        resources :portfolio_links,  only: [:create, :destroy]
      end
    end
  end
end