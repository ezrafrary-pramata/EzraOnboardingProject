module TenantConcern
    extend ActiveSupport::Concern
  
    included do
      before_action :set_current_tenant_context
      helper_method :current_organization, :current_tenant
    end
  
    private
  
    def set_current_tenant_context
      # Set Current attributes from request environment
      Current.organization = request.env['current_organization']
      Current.tenant = request.env['current_tenant']
    end
  
    def current_organization
      Current.organization
    end
  
    def current_tenant
      Current.tenant
    end
  
    def require_organization
      unless current_organization
        redirect_to root_path, alert: 'Please select an organization'
      end
    end
  
    def switch_to_organization(organization)
      organization.switch_tenant do
        yield if block_given?
      end
    end
  
    # Helper method to ensure we're in the right tenant context
    def ensure_tenant_context
      unless current_organization
        raise "No tenant context available. Make sure TenantMiddleware is properly configured."
      end
    end
  
    # Method to temporarily switch to shared database
    def with_shared_database
      Apartment::Tenant.switch!('public') do  # or however you configure shared DB
        yield if block_given?
      end
    end
  end