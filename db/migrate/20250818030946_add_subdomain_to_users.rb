class AddSubdomainToUsers < ActiveRecord::Migration[7.0] # or your Rails version
  def change
    add_column :users, :subdomain, :string
    add_index :users, :subdomain, unique: true
  end
end