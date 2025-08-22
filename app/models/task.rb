class Task < ApplicationRecord
  validates :name, presence: true
  validates :user_id, presence: true
  
  def user
    return @user if defined?(@user)
    
    @user = Rails.cache.fetch("user_#{user_id}", expires_in: 5.minutes) do
      current_tenant = Apartment::Tenant.current
      user_data = nil
      
      begin
        Apartment::Tenant.reset
        user_record = User.find_by(id: user_id)
        if user_record
          user_data = {
            id: user_record.id,
            email_address: user_record.email_address,
            organization_id: user_record.organization_id
          }
        end
      ensure
        if current_tenant && current_tenant != 'public'
          Apartment::Tenant.switch!(current_tenant)
        end
      end
      
      user_data
    end
    
    @user = OpenStruct.new(@user) if @user
  end
  
  def user=(user_obj)
    self.user_id = user_obj.respond_to?(:id) ? user_obj.id : user_obj
    @user = user_obj
  end
  
  def user_email
    user&.email_address || "Unknown User"
  end
end