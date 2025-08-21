class UsersController < ApplicationController
  skip_before_action :require_authentication, only: [:new, :create]
  
  def new
    @user = User.new
    @organizations = Organization.all # Fetch all organizations for dropdown
  end

  def create
    @user = User.new(user_params)
    
    if @user.save
      flash[:notice] = "User created successfully!"
      redirect_to root_path # or wherever you want to redirect
    else
      @organizations = Organization.all # Reload organizations for dropdown
      flash[:alert] = @user.errors.full_messages.join(", ")
      render :new
    end
  end

  private

  def user_params
    params.require(:user).permit(:email_address, :password, :organization_id)
  end
end