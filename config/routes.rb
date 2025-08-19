Rails.application.routes.draw do
  resource :session
  resources :passwords, param: :token
  resources :tasks
  root "tasks#index"
end