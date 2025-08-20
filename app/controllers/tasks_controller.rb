class TasksController < ApplicationController
  before_action :authenticate_user!
  before_action :set_tenant
  before_action :set_task, only: [:show, :edit, :update, :destroy]

  def index
    # Get all tasks for users in the current user's organization
    @tasks = Task.joins(:user)
                 .where(users: { organization_id: Current.user.organization_id })
                 .includes(:user)
                 .order(created_at: :desc)
  end

  def show
  end

  def new
    @task = Current.user.tasks.build
  end

  def create
    @task = Current.user.tasks.build(task_params)
    
    respond_to do |format|
      if @task.save
        format.html { redirect_to @task }
        format.json { render json: @task.as_json(include: { user: { only: [:email_address] } }), status: :created }
      else
        format.html { render :new, status: :unprocessable_entity }
        format.json { render json: @task.errors, status: :unprocessable_entity }
      end
    end
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

def set_tenant
  return unless Current.user&.organization
  
  subdomain = Current.user.organization.subdomain
  
  begin
    # Check if tenant exists before switching
    if Apartment.tenant_names.include?(subdomain)
      Apartment::Tenant.switch!(subdomain)
      Rails.logger.info "Switched to tenant: #{subdomain}"
    else
      # Create the tenant if it doesn't exist
      Rails.logger.warn "Creating missing tenant: #{subdomain}"
      Apartment::Tenant.create(subdomain)
      Apartment::Tenant.switch!(subdomain)
    end
  rescue => e
    Rails.logger.error "Tenant switching error: #{e.message}"
  end
end

  def set_task
    # Allow users to access any task within their organization
    organization_task_ids = Task.joins(:user)
                               .where(users: { organization_id: Current.user.organization_id })
                               .pluck(:id)
    
    @task = Task.find(params[:id])
    
    unless organization_task_ids.include?(@task.id)
      redirect_to tasks_path, alert: "Task not found or access denied"
    end
  end

  def task_params
    params.expect(task: [:name, :description, :due_date])
  end
end