class ApplicationController < ActionController::Base
  include Authentication
  # Only allow modern browsers supporting webp images, web push, badges, import maps, CSS nesting, and CSS :has.
  allow_browser versions: :modern
  
  class ApplicationController < ActionController::Base
    before_action :switch_tenant
    
    private
    
    def switch_tenant
      if Current.user&.organization
        Apartment::Tenant.switch!(Current.user.organization.subdomain)
      else
        Apartment::Tenant.switch!('public') # or your default schema
      end
    rescue Apartment::TenantNotFound
      # Handle case where tenant doesn't exist
      redirect_to root_path, alert: "Organization not found"
    end
  end
end
