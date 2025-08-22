# config/initializers/apartment.rb
Apartment.configure do |config|
  # Models that should remain in the primary database
  config.excluded_models = %w[Organization User Session]
  
  # THIS IS CRUCIAL - Use separate databases, not schemas
  config.use_schemas = false
  
  # Tenant names as a hash with database configurations
  config.tenant_names = lambda do
    tenant_configs = {}
    
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
    {}
  end
  
  # Don't prepend/append environment 
  config.prepend_environment = false
  config.append_environment = false
end