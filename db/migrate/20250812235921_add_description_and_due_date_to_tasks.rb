class AddDescriptionAndDueDateToTasks < ActiveRecord::Migration[8.0]
  def change
    add_column :tasks, :description, :text
    add_column :tasks, :due_date, :datetime
  end
end
