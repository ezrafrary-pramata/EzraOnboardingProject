class RemoveUserForeignKeyFromTasks < ActiveRecord::Migration[8.0]
  def change
    # Remove the foreign key constraint if it exists
    if foreign_key_exists?(:tasks, :users)
      remove_foreign_key :tasks, :users
    end
    
    # Keep the user_id column but without foreign key constraint
    unless column_exists?(:tasks, :user_id)
      add_column :tasks, :user_id, :integer, null: false
    end
    
    # Add an index for performance
    add_index :tasks, :user_id unless index_exists?(:tasks, :user_id)
  end
end