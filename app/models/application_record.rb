# app/models/application_record.rb
class ApplicationRecord < ActiveRecord::Base
  primary_abstract_class
end

# Create a new base class for tenant models
# app/models/tenant_record.rb
class TenantRecord < ActiveRecord::Base
  self.abstract_class = true
  
  # This will be dynamically connected to tenant databases
  connects_to database: { writing: :tenant_template }
end