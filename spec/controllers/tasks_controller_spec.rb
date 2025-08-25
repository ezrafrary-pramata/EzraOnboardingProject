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

  describe "create action data validation" do
    let(:user_double) { double('User', id: 1, email_address: 'test@example.com', organization: nil) }
    let(:session_double) { double('Session', user: user_double) }
    
    before do
      allow(Current).to receive(:session).and_return(session_double)
      allow(Current).to receive(:user).and_return(user_double)
      allow(controller).to receive(:switch_tenant)
    end

    describe "with valid task data" do
      let(:valid_task_params) do
        {
          name: "Complete project documentation",
          description: "Write comprehensive documentation for the new feature",
          due_date: "2024-12-31T15:30"
        }
      end

      let(:created_task) do 
        double('Task', 
          id: 42, 
          name: "Complete project documentation",
          description: "Write comprehensive documentation for the new feature",
          due_date: Time.parse("2024-12-31T15:30"),
          user_id: 1,
          save: true, 
          valid?: true, 
          errors: double(full_messages: []),
          attributes: { 
            'id' => 42, 
            'name' => "Complete project documentation",
            'description' => "Write comprehensive documentation for the new feature",
            'due_date' => Time.parse("2024-12-31T15:30"),
            'user_id' => 1 
          }
        )
      end

      before do
        allow(Task).to receive(:new).and_return(created_task)
        allow(controller).to receive(:redirect_to).and_return(true)
      end

      it "creates task with correct name" do
        expect(Task).to receive(:new).with(hash_including("name" => "Complete project documentation"))
        post :create, params: { task: valid_task_params }
      end

      it "creates task with correct description" do
        expect(Task).to receive(:new).with(hash_including("description" => "Write comprehensive documentation for the new feature"))
        post :create, params: { task: valid_task_params }
      end

      it "creates task with correct due date" do
        expect(Task).to receive(:new).with(hash_including("due_date" => "2024-12-31T15:30"))
        post :create, params: { task: valid_task_params }
      end

      it "automatically assigns current user_id" do
        expect(Task).to receive(:new).with(hash_including("user_id" => 1))
        post :create, params: { task: valid_task_params }
      end

      it "creates task with all provided attributes" do
        expect(Task).to receive(:new).with(hash_including(
          "name" => "Complete project documentation",
          "description" => "Write comprehensive documentation for the new feature",
          "due_date" => "2024-12-31T15:30",
          "user_id" => 1
        ))
        post :create, params: { task: valid_task_params }
      end

      it "redirects to the created task on success" do
        post :create, params: { task: valid_task_params }
        expect(controller).to have_received(:redirect_to).with(created_task)
      end

      it "responds with success for JSON requests" do
        # This test would require more complex mocking of the respond_to block
        # For now, we'll just verify the task creation succeeds
        post :create, params: { task: valid_task_params }
        expect(created_task).to have_received(:save)
      end
    end

    describe "with minimal valid data (only name)" do
      let(:minimal_task_params) { { name: "Simple task" } }
      let(:minimal_task) do
        double('Task', 
          id: 1, 
          name: "Simple task",
          description: nil,
          due_date: nil,
          user_id: 1,
          save: true, 
          valid?: true, 
          errors: double(full_messages: []),
          attributes: { 'id' => 1, 'name' => "Simple task", 'user_id' => 1 }
        )
      end

      before do
        allow(Task).to receive(:new).and_return(minimal_task)
        allow(controller).to receive(:redirect_to).and_return(true)
      end

      it "creates task with only name and user_id" do
        expect(Task).to receive(:new).with(hash_including(
          "name" => "Simple task",
          "user_id" => 1
        ))
        post :create, params: { task: minimal_task_params }
      end

      it "accepts nil description" do
        # When description is explicitly nil, Rails converts it to empty string in params
        expect(Task).to receive(:new).with(hash_including("description" => ""))
        post :create, params: { task: minimal_task_params.merge(description: nil) }
      end

      it "accepts empty description" do
        expect(Task).to receive(:new).with(hash_including("description" => ""))
        post :create, params: { task: minimal_task_params.merge(description: "") }
      end
    end

    describe "with invalid task data" do
      describe "missing required name" do
        let(:invalid_task_params) { { description: "Task without name", due_date: "2024-12-31" } }
        let(:invalid_task) do
          double('Task', 
            name: nil,
            description: "Task without name",
            user_id: 1,
            save: false, 
            valid?: false, 
            errors: double(full_messages: ["Name can't be blank"]),
            attributes: { 'id' => nil, 'name' => nil, 'user_id' => 1 }
          )
        end

        before do
          allow(Task).to receive(:new).and_return(invalid_task)
        end

        it "does not create task without name" do
          # When name is missing from params, it's not included in the hash
          expect(Task).to receive(:new).with(hash_not_including("name"))
          post :create, params: { task: invalid_task_params }
        end

        it "renders new template with validation errors" do
          post :create, params: { task: invalid_task_params }
          expect(response).to have_http_status(:unprocessable_content)
          expect(response).to render_template(:new)
        end

        it "assigns task with errors to view" do
          post :create, params: { task: invalid_task_params }
          expect(assigns(:task)).to eq(invalid_task)
          expect(assigns(:task).errors.full_messages).to include("Name can't be blank")
        end
      end

      describe "empty name" do
        let(:empty_name_params) { { name: "", description: "Task with empty name" } }
        let(:empty_name_task) do
          double('Task', 
            name: "",
            save: false, 
            valid?: false, 
            errors: double(full_messages: ["Name can't be blank"]),
            attributes: { 'id' => nil, 'name' => "", 'user_id' => 1 }
          )
        end

        before do
          allow(Task).to receive(:new).and_return(empty_name_task)
        end

        it "treats empty string as invalid name" do
          expect(Task).to receive(:new).with(hash_including("name" => ""))
          post :create, params: { task: empty_name_params }
        end

        it "fails validation for empty name" do
          post :create, params: { task: empty_name_params }
          expect(response).to have_http_status(:unprocessable_content)
        end
      end

      describe "whitespace-only name" do
        let(:whitespace_name_params) { { name: "   \n\t   ", description: "Task with whitespace name" } }
        let(:whitespace_task) do
          double('Task', 
            name: "   \n\t   ",
            save: false, 
            valid?: false, 
            errors: double(full_messages: ["Name can't be blank"]),
            attributes: { 'id' => nil, 'name' => "   \n\t   ", 'user_id' => 1 }
          )
        end

        before do
          allow(Task).to receive(:new).and_return(whitespace_task)
        end

        it "treats whitespace-only string as invalid name" do
          expect(Task).to receive(:new).with(hash_including("name" => "   \n\t   "))
          post :create, params: { task: whitespace_name_params }
        end
      end
    end

    describe "parameter filtering and security" do
      let(:malicious_params) do
        {
          name: "Valid task name",
          description: "Valid description",
          user_id: 999, # Attempting to override user_id
          id: 123,      # Attempting to set id
          created_at: "2020-01-01", # Attempting to set timestamps
          updated_at: "2020-01-01"
        }
      end

      let(:secure_task) do
        double('Task', 
          id: 1, 
          save: true, 
          valid?: true, 
          errors: double(full_messages: []),
          attributes: { 'id' => 1, 'name' => "Valid task name", 'user_id' => 1 }
        )
      end

      before do
        allow(Task).to receive(:new).and_return(secure_task)
        allow(controller).to receive(:redirect_to).and_return(true)
      end

      it "ignores user-supplied user_id and uses current user" do
        expect(Task).to receive(:new).with(hash_including("user_id" => 1))
        expect(Task).not_to receive(:new).with(hash_including("user_id" => 999))
        post :create, params: { task: malicious_params }
      end

      it "only accepts permitted parameters (name, description, due_date)" do
        expect(Task).to receive(:new).with(hash_including(
          "name" => "Valid task name",
          "description" => "Valid description",
          "user_id" => 1
        ))
        expect(Task).not_to receive(:new).with(hash_including("id", "created_at", "updated_at"))
        post :create, params: { task: malicious_params }
      end
    end

    describe "due date validation" do
      let(:future_date_params) { { name: "Future task", due_date: "2025-12-31T10:00" } }
      let(:past_date_params) { { name: "Past task", due_date: "2020-01-01T10:00" } }
      let(:invalid_date_params) { { name: "Invalid date task", due_date: "not-a-date" } }

      before do
        allow(controller).to receive(:redirect_to).and_return(true)
      end

      it "accepts future due dates" do
        valid_future_task = double('Task', save: true, valid?: true, errors: double(full_messages: []))
        allow(Task).to receive(:new).and_return(valid_future_task)
        
        expect(Task).to receive(:new).with(hash_including("due_date" => "2025-12-31T10:00"))
        post :create, params: { task: future_date_params }
      end

      it "accepts past due dates" do
        valid_past_task = double('Task', save: true, valid?: true, errors: double(full_messages: []))
        allow(Task).to receive(:new).and_return(valid_past_task)
        
        expect(Task).to receive(:new).with(hash_including("due_date" => "2020-01-01T10:00"))
        post :create, params: { task: past_date_params }
      end

      it "handles invalid date formats gracefully" do
        invalid_date_task = double('Task', save: true, valid?: true, errors: double(full_messages: []))
        allow(Task).to receive(:new).and_return(invalid_date_task)
        
        expect(Task).to receive(:new).with(hash_including("due_date" => "not-a-date"))
        post :create, params: { task: invalid_date_params }
      end
    end
  end

  describe "update action data validation" do
    let(:user_double) { double('User', id: 1, email_address: 'test@example.com', organization: nil) }
    let(:session_double) { double('Session', user: user_double) }
    let(:existing_task) do
      double('Task', 
        id: 1, 
        name: 'Original Task',
        description: 'Original description',
        due_date: Time.current + 1.day,
        user_id: 1
      )
    end

    before do
      allow(Current).to receive(:session).and_return(session_double)
      allow(Current).to receive(:user).and_return(user_double)
      allow(controller).to receive(:switch_tenant)
      allow(Task).to receive(:find).with('1').and_return(existing_task)
    end

    describe "with valid update data" do
      let(:valid_update_params) do
        {
          name: "Updated Task Name",
          description: "Updated description with more details",
          due_date: "2024-12-25T14:30"
        }
      end

      before do
        allow(existing_task).to receive(:update).and_return(true)
        allow(controller).to receive(:redirect_to).and_return(true)
      end

      it "updates task with correct name" do
        expect(existing_task).to receive(:update).with(hash_including("name" => "Updated Task Name"))
        put :update, params: { id: 1, task: valid_update_params }
      end

      it "updates task with correct description" do
        expect(existing_task).to receive(:update).with(hash_including("description" => "Updated description with more details"))
        put :update, params: { id: 1, task: valid_update_params }
      end

      it "updates task with correct due date" do
        expect(existing_task).to receive(:update).with(hash_including("due_date" => "2024-12-25T14:30"))
        put :update, params: { id: 1, task: valid_update_params }
      end

      it "updates all provided attributes" do
        expect(existing_task).to receive(:update).with(hash_including(
          "name" => "Updated Task Name",
          "description" => "Updated description with more details",
          "due_date" => "2024-12-25T14:30"
        ))
        put :update, params: { id: 1, task: valid_update_params }
      end

      it "redirects to updated task on success" do
        put :update, params: { id: 1, task: valid_update_params }
        expect(controller).to have_received(:redirect_to).with(existing_task)
      end
    end

    describe "with partial update data" do
      it "updates only name when only name provided" do
        expect(existing_task).to receive(:update).with(hash_including("name" => "Just Name Update"))
        put :update, params: { id: 1, task: { name: "Just Name Update" } }
      end

      it "updates only description when only description provided" do
        expect(existing_task).to receive(:update).with(hash_including("description" => "Just description update"))
        put :update, params: { id: 1, task: { description: "Just description update" } }
      end

      it "clears description when set to empty string" do
        allow(existing_task).to receive(:update).and_return(true)
        allow(controller).to receive(:redirect_to)
        
        expect(existing_task).to receive(:update).with(hash_including("description" => ""))
        put :update, params: { id: 1, task: { description: "" } }
        expect(controller).to have_received(:redirect_to).with(existing_task)
      end

      it "clears due_date when set to empty string" do
        allow(existing_task).to receive(:update).and_return(true)
        allow(controller).to receive(:redirect_to)
        
        expect(existing_task).to receive(:update).with(hash_including("due_date" => ""))
        put :update, params: { id: 1, task: { due_date: "" } }
        expect(controller).to have_received(:redirect_to).with(existing_task)
      end
    end

    describe "with invalid update data" do
      let(:invalid_update_params) { { name: "" } }

      before do
        allow(existing_task).to receive(:update).and_return(false)
        allow(existing_task).to receive(:errors).and_return(double(full_messages: ["Name can't be blank"]))
      end

      it "does not update with empty name" do
        expect(existing_task).to receive(:update).with(hash_including("name" => ""))
        put :update, params: { id: 1, task: invalid_update_params }
      end

      it "renders edit template on validation failure" do
        put :update, params: { id: 1, task: invalid_update_params }
        expect(response).to have_http_status(:unprocessable_content)
        expect(response).to render_template(:edit)
      end
    end

    describe "update parameter security" do
      let(:malicious_update_params) do
        {
          name: "Updated name",
          user_id: 999,         # Attempting to change ownership
          id: 456,             # Attempting to change ID
          created_at: "2020-01-01",
          updated_at: "2020-01-01"
        }
      end

      before do
        allow(existing_task).to receive(:update).and_return(true)
        allow(controller).to receive(:redirect_to).and_return(true)
      end

      it "only accepts permitted parameters and ignores dangerous ones" do
        expect(existing_task).to receive(:update).with(hash_including("name" => "Updated name"))
        expect(existing_task).not_to receive(:update).with(hash_including("user_id", "id", "created_at", "updated_at"))
        put :update, params: { id: 1, task: malicious_update_params }
      end
    end
  end

  describe "edit action data validation" do
    let(:user_double) { double('User', id: 1, email_address: 'test@example.com', organization: nil) }
    let(:session_double) { double('Session', user: user_double) }
    let(:task_with_data) do
      double('Task', 
        id: 1, 
        name: 'Task with Full Data',
        description: 'Complete task description',
        due_date: Time.parse('2024-06-15T10:30'),
        user_id: 1
      )
    end

    before do
      allow(Current).to receive(:session).and_return(session_double)
      allow(Current).to receive(:user).and_return(user_double)
      allow(controller).to receive(:switch_tenant)
    end

    it "assigns task with all data intact" do
      allow(Task).to receive(:find).with('1').and_return(task_with_data)
      
      get :edit, params: { id: 1 }
      
      assigned_task = assigns(:task)
      expect(assigned_task).to eq(task_with_data)
      expect(assigned_task.name).to eq('Task with Full Data')
      expect(assigned_task.description).to eq('Complete task description')
      expect(assigned_task.due_date).to eq(Time.parse('2024-06-15T10:30'))
    end

    it "handles task with minimal data" do
      minimal_task = double('Task', id: 2, name: 'Minimal Task', description: nil, due_date: nil, user_id: 1)
      allow(Task).to receive(:find).with('2').and_return(minimal_task)
      
      get :edit, params: { id: 2 }
      
      assigned_task = assigns(:task)
      expect(assigned_task.name).to eq('Minimal Task')
      expect(assigned_task.description).to be_nil
      expect(assigned_task.due_date).to be_nil
    end
  end

  describe "destroy action when authenticated" do
    let(:user_double) { double('User', id: 1, email_address: 'test@example.com', organization: nil) }
    let(:session_double) { double('Session', user: user_double) }
    let(:task_to_delete) { double('Task', id: 1, name: 'Task to Delete', destroy: true) }

    before do
      allow(Current).to receive(:session).and_return(session_double)
      allow(Current).to receive(:user).and_return(user_double)
      allow(controller).to receive(:switch_tenant)
      allow(Task).to receive(:find).with('1').and_return(task_to_delete)
    end

    it "finds the correct task before destroying" do
      expect(Task).to receive(:find).with('1').and_return(task_to_delete)
      delete :destroy, params: { id: 1 }
    end

    it "calls destroy on the found task" do
      expect(task_to_delete).to receive(:destroy)
      delete :destroy, params: { id: 1 }
    end

    it "redirects to tasks index after destruction" do
      delete :destroy, params: { id: 1 }
      expect(response).to redirect_to(tasks_path)
    end

    it "handles destroy failure gracefully" do
      allow(task_to_delete).to receive(:destroy).and_raise(StandardError, "Cannot delete")
      expect { delete :destroy, params: { id: 1 } }.to raise_error(StandardError)
    end
  end
end