class ApplicationController < ActionController::Base
  include Authentication
  # Only allow modern browsers supporting webp images, web push, badges, import maps, CSS nesting, and CSS :has.
  allow_browser versions: :modern
  
  before_action :switch_tenant
  
  private
  
  def switch_tenant
    if Current.user&.organization
      subdomain = Current.user.organization.subdomain
      
      begin
        # Switch to the tenant database
        Apartment::Tenant.switch!(subdomain)
        Rails.logger.info "Switched to tenant: #{subdomain}"
      rescue Apartment::TenantNotFound
        # Create tenant database if it doesn't exist
        Rails.logger.warn "Creating missing tenant: #{subdomain}"
        begin
          Apartment::Tenant.create(subdomain)
          Apartment::Tenant.switch!(subdomain)
        rescue => e
          Rails.logger.error "Failed to create tenant #{subdomain}: #{e.message}"
          redirect_to root_path, alert: "Organization database not found"
          return
        end
      rescue => e
        Rails.logger.error "Tenant switching error: #{e.message}"
        redirect_to root_path, alert: "Unable to access organization data"
        return
      end
    else
      # Switch back to primary database if no user or organization
      Apartment::Tenant.reset
    end
  end
end