# lib/tasks/apartment.rake
namespace :apartment do
  desc "Run migrations for all tenants"
  task migrate_all: :environment do
    Organization.find_each do |org|
      puts "Migrating tenant: #{org.subdomain}"
      Apartment::Tenant.switch!(org.subdomain) do
        ActiveRecord::Migration.verbose = true
        ActiveRecord::MigrationContext.new(
          Rails.application.paths["db/migrate"].expanded
        ).migrate
      end
    rescue => e
      puts "Error migrating #{org.subdomain}: #{e.message}"
    end
  end
  
  desc "Create a new tenant database"
  task :create_tenant, [:subdomain] => :environment do |_, args|
    subdomain = args[:subdomain]
    raise "Subdomain required" unless subdomain
    
    Apartment::Tenant.create(subdomain)
    puts "Created tenant database: #{subdomain}"
  end
end