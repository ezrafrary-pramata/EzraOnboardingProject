require 'rails_helper'

RSpec.describe Task, type: :model do
  # Create a user for our tests - use email_address instead of email
  let(:user) { User.create!(email_address: "test@example.com", password: "password") }
  
  describe "validations" do
    it "is valid with a name and user" do
      task = Task.new(name: "Test Task", user: user)
      expect(task).to be_valid
    end
    
    it "is invalid without a name" do
      task = Task.new(name: nil, user: user)
      expect(task).to_not be_valid
    end
    
    it "is invalid without a user" do
      task = Task.new(name: "Test Task", user: nil)
      expect(task).to_not be_valid
    end
  end
  
  describe "associations" do
    it "belongs to a user" do
      association = Task.reflect_on_association(:user)
      expect(association.macro).to eq :belongs_to
    end
  end
  
  describe "attributes" do
    it "can have a description" do
      task = Task.new(name: "Test", description: "Test description", user: user)
      expect(task.description).to eq("Test description")
    end
    
    it "can have a due date" do
      due_date = Time.current + 1.day
      task = Task.create!(name: "Test", due_date: due_date, user: user)
      
      # Compare with a small tolerance to handle precision differences
      expect(task.due_date).to be_within(1.second).of(due_date)
    end
  end
end