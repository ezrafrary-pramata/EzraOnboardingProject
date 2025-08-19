require 'rails_helper'

RSpec.describe TasksController, type: :controller do
  describe "GET #index" do
    let(:user) { User.create!(email_address: "test@example.com", password: "password") }
    let(:session_record) { Session.create!(user: user) }
    
    it "redirects when not authenticated" do
      get :index
      expect(response).to have_http_status(:redirect)
      expect(response).to redirect_to(new_session_path)
    end

    it "returns success when authenticated" do
      # Mock the session cookie that the authentication system expects
      
      allow_any_instance_of(ActionDispatch::Cookies::CookieJar).to receive(:signed).and_return({session_id: session_record.id})
      

      get :index
      expect(response).to have_http_status(:success)
    end
  end

  describe "GET #show" do
    let(:user) { User.create!(email_address: "test@example.com", password: "password") }
    let(:session_record) { Session.create!(user: user) }
    let(:task) { Task.create!(name: "Test Task", user: user) }

    
    it "redirects when not authenticated" do
      get :show, params: { id: task.id }
      expect(response).to have_http_status(:redirect)
      expect(response).to redirect_to(new_session_path)
    end

    it "returns success when authenticated" do
      allow_any_instance_of(ActionDispatch::Cookies::CookieJar).to receive(:signed).and_return({session_id: session_record.id})
      get :show, params: { id: task.id }
      expect(response).to have_http_status(:success)
    end
  end

  describe "GET #new" do
    let(:user) { User.create!(email_address: "test@example.com", password: "password") }
    let(:session_record) { Session.create!(user: user) }
    
    it "redirects when not authenticated" do
      get :new
      expect(response).to have_http_status(:redirect)
      expect(response).to redirect_to(new_session_path)
    end

    it "returns success when authenticated" do
      allow_any_instance_of(ActionDispatch::Cookies::CookieJar).to receive(:signed).and_return({session_id: session_record.id})
      get :new
      expect(response).to have_http_status(:success)
    end
  end

  describe "POST #create" do
    let(:user) { User.create!(email_address: "test@example.com", password: "password") }
    let(:session_record) { Session.create!(user: user) }
    
    it "redirects when not authenticated" do
      post :create, params: { task: { name: "Test Task" } }
      expect(response).to have_http_status(:redirect)
      expect(response).to redirect_to(new_session_path)
    end

    it "returns success when authenticated" do
      allow_any_instance_of(ActionDispatch::Cookies::CookieJar).to receive(:signed).and_return({session_id: session_record.id})
      post :create, params: { task: { name: "Test Task" } }
      expect(response).to have_http_status(:redirect)
    end
  end

  describe "GET #edit" do
    let(:user) { User.create!(email_address: "test@example.com", password: "password") }
    let(:session_record) { Session.create!(user: user) }
    let(:task) { Task.create!(name: "Test Task", user: user) }
    
    it "redirects when not authenticated" do
      get :edit, params: { id: 1 }
      expect(response).to have_http_status(:redirect)
      expect(response).to redirect_to(new_session_path)
    end

    it "returns success when authenticated" do
      allow_any_instance_of(ActionDispatch::Cookies::CookieJar).to receive(:signed).and_return({session_id: session_record.id})
      get :edit, params: { id: task.id }
      expect(response).to have_http_status(:success)
    end
  end
  
  describe "PUT #update" do
    let(:user) { User.create!(email_address: "test@example.com", password: "password") }
    let(:session_record) { Session.create!(user: user) }
    let(:task) { Task.create!(name: "Test Task", user: user) }
    
    it "redirects when not authenticated" do
      put :update, params: { id: task.id, task: { name: "Updated Task" } }
      expect(response).to have_http_status(:redirect)
      expect(response).to redirect_to(new_session_path)
    end

    it "returns success when authenticated" do
      allow_any_instance_of(ActionDispatch::Cookies::CookieJar).to receive(:signed).and_return({session_id: session_record.id})
      put :update, params: { id: task.id, task: { name: "Updated Task" } }
      expect(response).to have_http_status(:redirect)
    end
  end
  
  describe "DELETE #destroy" do
    let(:user) { User.create!(email_address: "test@example.com", password: "password") }
    let(:session_record) { Session.create!(user: user) }
    let(:task) { Task.create!(name: "Test Task", user: user) }

    it "redirects when not authenticated" do
      delete :destroy, params: { id: task.id }
      expect(response).to have_http_status(:redirect)
      expect(response).to redirect_to(new_session_path)
    end

    it "returns success when authenticated" do
      allow_any_instance_of(ActionDispatch::Cookies::CookieJar).to receive(:signed).and_return({session_id: session_record.id})
      delete :destroy, params: { id: task.id }
      expect(response).to have_http_status(:redirect)
    end
  end
end