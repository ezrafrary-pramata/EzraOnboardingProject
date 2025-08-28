class TasksController < ApplicationController
  before_action :authenticate_user!
  before_action :set_task, only: [:show, :edit, :update, :destroy]
  before_action :load_organization_users, only: [:new, :create, :edit, :update]

  def index
    # In multi-database setup, tasks are automatically scoped to current tenant
    @tasks = Task.all.order(created_at: :desc)

    # Get unique user_ids from tasks to fetch only needed users
    user_ids = @tasks.pluck(:user_id).uniq
    
    # Fetch users for the current tenant
    @users = User.where(id: user_ids).select(:id, :email_address)

    respond_to do |format|
      format.html # renders the HTML view as normal
      format.json { 
        render json: {
          tasks: @tasks.as_json,
          users: @users.as_json(only: [:id, :email_address])
        }
      }
    end
  end

  def show
  end

  def new
    # Create task manually since we can't use User association across databases
    @task = Task.new(user_id: Current.user.id)
  end

  def create
    merged_params = task_params.merge(user_id: Current.user.id)
    
    @task = Task.new(merged_params)
    
    respond_to do |format|
      begin
        if @task.save
          format.html { redirect_to @task }
          format.json { render json: @task.as_json, status: :created }
        else
          format.html { render :new, status: :unprocessable_entity }
          format.json { render json: @task.errors, status: :unprocessable_entity }
        end
      rescue => e
        raise e
      end
    end
  rescue => e
    raise e
  end

  def edit
  end

  def update
    if @task.update(task_params)
      redirect_to @task
    else
      render :edit, status: :unprocessable_entity
    end
  end

  def destroy
    @task.destroy
    redirect_to tasks_path
  end

  private

  def authenticate_user!
    unless Current.user
      redirect_to new_session_path, alert: "You must be logged in to view tasks"
    end
  end

  def set_task
    @task = Task.find(params[:id])
  rescue ActiveRecord::RecordNotFound
    redirect_to tasks_path, alert: "Task not found"
  end

  def load_organization_users
    # Get all users in the current organization
    if Current.user&.organization
      current_tenant = Apartment::Tenant.current
      
      begin
        Apartment::Tenant.reset
        @organization_users = User.where(organization_id: Current.user.organization.id)
                                 .select(:id, :email_address)
                                 .order(:email_address)
      ensure
        if current_tenant && current_tenant != 'public'
          Apartment::Tenant.switch!(current_tenant)
        end
      end
    else
      @organization_users = []
    end
  end

  def task_params
    params.expect(task: [:name, :description, :due_date, :assigned_to])
  end
end