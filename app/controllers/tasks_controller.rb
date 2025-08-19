class TasksController < ApplicationController
  # Remove unauthenticated access since we want to protect user data
  before_action :set_task, only: [:show, :edit, :update, :destroy]

  def index
    if Current.user
      @tasks = Current.user.tasks
    else
      @tasks = []
      redirect_to new_session_path, alert: "You must be logged in to view tasks"
    end
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
        format.json { render json: @task, status: :created }
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
    def set_task
      # Only allow users to access their own tasks
      @task = Current.user.tasks.find(params[:id])
    end

    def task_params
      params.expect(task: [:name, :description, :due_date])
    end
end