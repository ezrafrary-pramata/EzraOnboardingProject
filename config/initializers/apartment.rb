require 'apartment/elevators/subdomain'

Apartment.configure do |config|
  # Models that should be shared across all tenants (in the public schema)
  config.excluded_models = %w[Organization User Session]
  
  # Dynamic tenant names based on organization subdomains
  config.tenant_names = lambda { Organization.pluck(:subdomain) }
  
  # Use schemas for better isolation (set to false for SQLite)
  config.use_schemas = Rails.env.production? ? true : false
  
  # Default tenant (fallback)
  config.default_tenant = 'public'
end

# Enable subdomain-based tenant switching
Rails.application.config.middleware.use Apartment::Elevators::Subdomain