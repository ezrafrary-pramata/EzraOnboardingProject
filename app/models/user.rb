class User < ApplicationRecord
  has_secure_password
  has_many :sessions, dependent: :destroy
  has_many :tasks, dependent: :destroy
  belongs_to :organization
  
  # Add a method to get all tasks within the organization
  def organization_tasks
    Task.joins(:user).where(users: { organization_id: organization_id })
  end
end