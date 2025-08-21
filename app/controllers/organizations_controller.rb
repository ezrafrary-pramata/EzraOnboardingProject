class OrganizationsController < ApplicationController
    before_action :ensure_no_subdomain
    
    def index
      # Landing page for choosing organization
    end
    
    def show
      @organization = Organization.find_by!(subdomain: params[:id])
      redirect_to root_url(subdomain: @organization.subdomain)
    end
    
    def new
      @organization = Organization.new
    end
    
    def create
      @organization = Organization.new(organization_params)
      
      if @organization.save
        # Create tenant database
        Apartment::Tenant.create(@organization.subdomain)
        redirect_to root_url(subdomain: @organization.subdomain), notice: "Organization created successfully"
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