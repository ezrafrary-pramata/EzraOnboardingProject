require 'rails_helper'

RSpec.describe TasksController, type: :controller do
  # Test authentication redirect - this doesn't need any database setup
  describe "authentication" do
    it "redirects unauthenticated users to sign in" do
      get :index
      expect(response).to redirect_to(new_session_path)
    end

    it "redirects unauthenticated users from show action" do
      get :show, params: { id: 1 }
      expect(response).to redirect_to(new_session_path)
    end

    it "redirects unauthenticated users from new action" do
      get :new
      expect(response).to redirect_to(new_session_path)
    end

    it "redirects unauthenticated users from create action" do
      post :create, params: { task: { name: "Test" } }
      expect(response).to redirect_to(new_session_path)
    end

    it "redirects unauthenticated users from edit action" do
      get :edit, params: { id: 1 }
      expect(response).to redirect_to(new_session_path)
    end

    it "redirects unauthenticated users from update action" do
      put :update, params: { id: 1, task: { name: "Updated" } }
      expect(response).to redirect_to(new_session_path)
    end

    it "redirects unauthenticated users from destroy action" do
      delete :destroy, params: { id: 1 }
      expect(response).to redirect_to(new_session_path)
    end
  end

  # Test with mocked authentication - avoid database complexity
  describe "when authenticated" do
    let(:user_double) { double('User', id: 1, email_address: 'test@example.com', organization: nil) }
    let(:session_double) { double('Session', user: user_double) }

    before do
      # Mock the authentication system
      allow(Current).to receive(:session).and_return(session_double)
      allow(Current).to receive(:user).and_return(user_double)
      
      # Skip the tenant switching to avoid database issues
      allow(controller).to receive(:switch_tenant)
      
      # Mock Task.all to return a relation that responds to order
      mock_tasks = double('TaskRelation')
      allow(mock_tasks).to receive(:order).with(created_at: :desc).and_return([])
      allow(Task).to receive(:all).and_return(mock_tasks)
    end

    it "renders index successfully when authenticated" do
      get :index
      expect(response).to be_successful
    end

    it "assigns @tasks" do
      get :index
      expect(assigns(:tasks)).to eq([])
    end

    it "renders new task form" do
      get :new
      expect(response).to be_successful
      expect(assigns(:task)).to be_a_new(Task)
    end

    it "assigns current user id to new task" do
      get :new
      expect(assigns(:task).user_id).to eq(1)
    end
  end

  describe "show action when authenticated" do
    let(:user_double) { double('User', id: 1, email_address: 'test@example.com', organization: nil) }
    let(:session_double) { double('Session', user: user_double) }
    let(:task_double) { double('Task', id: 1, name: 'Test Task', description: 'Test Description') }

    before do
      allow(Current).to receive(:session).and_return(session_double)
      allow(Current).to receive(:user).and_return(user_double)
      allow(controller).to receive(:switch_tenant)
      allow(Task).to receive(:find).with('1').and_return(task_double)
    end

    it "renders show successfully" do
      get :show, params: { id: 1 }
      expect(response).to be_successful
    end

    it "assigns the requested task" do
      get :show, params: { id: 1 }
      expect(assigns(:task)).to eq(task_double)
    end

    it "handles task not found" do
      allow(Task).to receive(:find).with('999').and_raise(ActiveRecord::RecordNotFound)
      
      get :show, params: { id: 999 }
      expect(response).to redirect_to(tasks_path)
      expect(flash[:alert]).to eq("Task not found")
    end
  end

  describe "create action when authenticated" do
    let(:user_double) { double('User', id: 1, email_address: 'test@example.com', organization: nil) }
    let(:session_double) { double('Session', user: user_double) }
    
    before do
      allow(Current).to receive(:session).and_return(session_double)
      allow(Current).to receive(:user).and_return(user_double)
      allow(controller).to receive(:switch_tenant)
    end

    context "with valid parameters" do
      let(:task_double) do 
        double('Task', 
          id: 1, 
          save: true, 
          valid?: true, 
          errors: double(full_messages: []),
          attributes: { 'id' => 1, 'name' => 'Test Task', 'user_id' => 1 }
        )
      end

      before do
        allow(Task).to receive(:new).and_return(task_double)
        # Mock the redirect to avoid Rails routing complexity
        allow(controller).to receive(:redirect_to).and_return(true)
      end

      it "creates a task successfully" do
        post :create, params: { task: { name: "Test Task", description: "Test Description" } }
        expect(controller).to have_received(:redirect_to).with(task_double)
      end

      it "merges user_id into task params" do
        expect(Task).to receive(:new).with(hash_including("user_id" => 1))
        post :create, params: { task: { name: "Test Task" } }
      end
    end

    context "with invalid parameters" do
      let(:invalid_task) do
        double('Task', 
          save: false, 
          valid?: false, 
          errors: double(full_messages: ["Name can't be blank"]),
          attributes: { 'id' => nil, 'name' => '', 'user_id' => 1 }
        )
      end

      before do
        allow(Task).to receive(:new).and_return(invalid_task)
      end

      it "renders new template on validation errors" do
        post :create, params: { task: { name: "" } }
        expect(response).to have_http_status(:unprocessable_content)
        expect(response).to render_template(:new)
      end
    end
  end

  describe "edit action when authenticated" do
    let(:user_double) { double('User', id: 1, email_address: 'test@example.com', organization: nil) }
    let(:session_double) { double('Session', user: user_double) }
    let(:task_double) { double('Task', id: 1, name: 'Test Task') }

    before do
      allow(Current).to receive(:session).and_return(session_double)
      allow(Current).to receive(:user).and_return(user_double)
      allow(controller).to receive(:switch_tenant)
      allow(Task).to receive(:find).with('1').and_return(task_double)
    end

    it "renders edit form successfully" do
      get :edit, params: { id: 1 }
      expect(response).to be_successful
    end

    it "assigns the requested task" do
      get :edit, params: { id: 1 }
      expect(assigns(:task)).to eq(task_double)
    end
  end

  describe "update action when authenticated" do
    let(:user_double) { double('User', id: 1, email_address: 'test@example.com', organization: nil) }
    let(:session_double) { double('Session', user: user_double) }
    let(:task_double) do
      double('Task', 
        id: 1, 
        update: true
      )
    end

    before do
      allow(Current).to receive(:session).and_return(session_double)
      allow(Current).to receive(:user).and_return(user_double)
      allow(controller).to receive(:switch_tenant)
      allow(Task).to receive(:find).with('1').and_return(task_double)
    end

    context "with valid parameters" do
      before do
        # Mock the redirect to avoid Rails routing complexity
        allow(controller).to receive(:redirect_to).and_return(true)
      end

      it "updates the task successfully" do
        expect(task_double).to receive(:update).with(hash_including("name" => "Updated Task")).and_return(true)
        put :update, params: { id: 1, task: { name: "Updated Task" } }
        expect(controller).to have_received(:redirect_to).with(task_double)
      end
    end

    context "with invalid parameters" do
      before do
        allow(task_double).to receive(:update).and_return(false)
      end

      it "renders edit template on validation errors" do
        put :update, params: { id: 1, task: { name: "" } }
        expect(response).to have_http_status(:unprocessable_content)
        expect(response).to render_template(:edit)
      end
    end
  end

  describe "destroy action when authenticated" do
    let(:user_double) { double('User', id: 1, email_address: 'test@example.com', organization: nil) }
    let(:session_double) { double('Session', user: user_double) }
    let(:task_double) { double('Task', id: 1, destroy: true) }

    before do
      allow(Current).to receive(:session).and_return(session_double)
      allow(Current).to receive(:user).and_return(user_double)
      allow(controller).to receive(:switch_tenant)
      allow(Task).to receive(:find).with('1').and_return(task_double)
    end

    it "destroys the task successfully" do
      expect(task_double).to receive(:destroy)
      delete :destroy, params: { id: 1 }
      expect(response).to redirect_to(tasks_path)
    end
  end
end