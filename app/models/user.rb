class User < ApplicationRecord
  has_secure_password
  has_many :sessions, dependent: :destroy
  belongs_to :organization
  
  # Remove has_many :tasks since tasks are in tenant databases
  
  # Helper method for tenant contexts
  def self.find_for_tenant(user_id)
    user_info = nil
    Apartment::Tenant.reset do
      user_info = User.select(:id, :email_address, :organization_id).find(user_id)
    end
    user_info
  end
end