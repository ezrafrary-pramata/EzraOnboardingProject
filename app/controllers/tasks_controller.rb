class TasksController < ApplicationController
  before_action :authenticate_user!
  before_action :set_task, only: [:show, :edit, :update, :destroy]

  def index
    # In multi-database setup, tasks are automatically scoped to current tenant
    @tasks = Task.all.order(created_at: :desc)
  end

  def show
  end

  def new
    # Create task manually since we can't use User association across databases
    @task = Task.new(user_id: Current.user.id)
  end

  def create
    # puts "=== TASK CREATION DEBUG ==="
    # puts "Raw params: #{params.inspect}"
    # puts "Task params: #{task_params.inspect}"
    # puts "Current user: #{Current.user&.id}"
    # puts "Current tenant: #{Apartment::Tenant.current}"
    
    merged_params = task_params.merge(user_id: Current.user.id)
    # puts "Merged params: #{merged_params.inspect}"
    
    @task = Task.new(merged_params)
    # puts "Task before save: #{@task.attributes.inspect}"
    # puts "Task valid?: #{@task.valid?}"
    # puts "Task errors: #{@task.errors.full_messages}" unless @task.valid?
    
    respond_to do |format|
      begin
        if @task.save
          #puts "✓ Task saved successfully with ID: #{@task.id}"
          format.html { redirect_to @task }
          format.json { render json: @task.as_json, status: :created }
        else
          #puts "✗ Task save failed: #{@task.errors.full_messages}"
          format.html { render :new, status: :unprocessable_entity }
          format.json { render json: @task.errors, status: :unprocessable_entity }
        end
      rescue => e
        #puts "✗ Exception during task save: #{e.class} - #{e.message}"
        #puts "Backtrace:"
        #puts e.backtrace.first(10).join("\n")
        raise e
      end
    end
  rescue => e
    #puts "✗ Exception in create method: #{e.class} - #{e.message}"
    #puts "Backtrace:"
    #puts e.backtrace.first(10).join("\n")
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

  def task_params
    params.expect(task: [:name, :description, :due_date])
  end
end