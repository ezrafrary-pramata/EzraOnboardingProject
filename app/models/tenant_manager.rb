# app/models/tenant_manager.rb
class TenantManager
    def self.create_tenant_database(tenant_slug)
      config = Rails.application.config.database_configuration[Rails.env]['tenant_template']
      tenant_db_path = config['database'].gsub('tenant_template', "tenant_#{tenant_slug}")
      
      # Create the physical database file
      tenant_config = config.merge('database' => tenant_db_path)
      
      # Establish connection and run migrations
      ActiveRecord::Base.establish_connection(tenant_config)
      ActiveRecord::MigrationContext.new(Rails.application.paths["db/migrate"].first).migrate
      
      # Store tenant info in system database
      ActiveRecord::Base.establish_connection(Rails.env.to_sym)
      Tenant.create!(
        slug: tenant_slug,
        database_name: tenant_db_path
      )
    end
    
    def self.switch_to_tenant(tenant_slug)
      tenant = Tenant.find_by!(slug: tenant_slug)
      config = Rails.application.config.database_configuration[Rails.env]['tenant_template']
      tenant_config = config.merge('database' => tenant.database_name)
      
      ActiveRecord::Base.establish_connection(tenant_config)
    end
  end
  
  # Usage:
  # TenantManager.create_tenant_database('acme_corp')
  # TenantManager.switch_to_tenant('acme_corp')