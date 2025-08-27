# Your migration should work the same way
class AddAssignedToToTasks < ActiveRecord::Migration[8.0]  # Note Rails 8 version
  def change
    add_column :tasks, :assigned_to, :integer
    add_index :tasks, :assigned_to
  end
end