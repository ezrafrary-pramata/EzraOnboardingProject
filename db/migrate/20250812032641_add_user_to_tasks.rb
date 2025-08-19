# db/migrate/20250812032641_add_user_to_tasks.rb
class AddUserToTasks < ActiveRecord::Migration[8.0]
  def change
    add_reference :tasks, :user, null: true, foreign_key: true
  end
end