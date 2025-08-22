# app/controllers/organizations_controller.rb
class OrganizationsController < ApplicationController
  skip_before_action :switch_tenant  # Organizations are in primary DB
  before_action :ensure_no_subdomain
  
  def create
    @organization = Organization.new(organization_params)
    
    if @organization.save
      # Create tenant database for the organization
      begin
        Apartment::Tenant.create(@organization.subdomain)
        redirect_to root_url(subdomain: @organization.subdomain), 
                   notice: "Organization created successfully"
      rescue => e
        Rails.logger.error "Failed to create tenant database: #{e.message}"
        @organization.destroy
        flash[:alert] = "Failed to create organization database"
        render :new, status: :unprocessable_entity
      end
    else
      render :new, status: :unprocessable_entity
    end
  end
  
  private
  
  def ensure_no_subdomain
    if request.subdomain.present?
      redirect_to root_url(subdomain: false)
    end
  end
  
  def organization_params
    params.require(:organization).permit(:name, :subdomain)
  end
end