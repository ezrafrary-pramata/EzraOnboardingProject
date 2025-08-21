Rails.application.routes.draw do
  resource :session
  resources :passwords, param: :token
  resources :users, only: [:new, :create]
  resources :tasks
  root "tasks#index"
end