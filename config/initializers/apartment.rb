# config/initializers/apartment.rb
require 'apartment/elevators/subdomain'

Apartment.configure do |config|
  # Models that should be shared across all tenants (in the public schema)
  config.excluded_models = %w[Organization User Session]
  
  # For multi-database setup with ros-apartment, use this approach:
  # tenant_names as a hash with database configurations
  config.tenant_names = lambda do
    tenant_configs = {}
    
    # Only try to load organizations if the table exists (avoids issues during initial setup)
    if ActiveRecord::Base.connection.table_exists?('organizations')
      Organization.find_each do |org|
        tenant_configs[org.subdomain] = {
          adapter: 'sqlite3',
          database: Rails.root.join('storage', "#{Rails.env}_tenant_#{org.subdomain}.sqlite3").to_s,
          pool: ENV.fetch("RAILS_MAX_THREADS") { 5 }.to_i,
          timeout: 5000
        }
      end
    end
    
    tenant_configs
  rescue ActiveRecord::StatementInvalid, ActiveRecord::NoDatabaseError
    # Return empty hash if database/table doesn't exist yet
    {}
  end
  
  # Use separate databases instead of schemas
  config.use_schemas = false
  
  # Don't prepend/append environment to database names since we're handling it manually
  config.prepend_environment = false
  config.append_environment = false
  
  # Default tenant fallback
  config.default_tenant = 'public'
end