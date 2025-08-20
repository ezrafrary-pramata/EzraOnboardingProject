# lib/tasks/apartment.rake
namespace :apartment do
    desc "Create tenant schemas for all organizations"
    task create_schemas: :environment do
      Organization.find_each do |org|
        Apartment::Tenant.create(org.subdomain)
      end
    end
  end