require 'rails_helper'
require 'ostruct'

RSpec.describe Task, type: :model do
  # Basic validation tests without database complexity
  describe "validations" do
    it "is valid with a name and user_id" do
      task = Task.new(name: "Test Task", user_id: 1)
      expect(task).to be_valid
    end
    
    it "is invalid without a name" do
      task = Task.new(name: nil, user_id: 1)
      expect(task).to_not be_valid
      expect(task.errors[:name]).to include("can't be blank")
    end
    
    it "is invalid without a user_id" do
      task = Task.new(name: "Test Task", user_id: nil)
      expect(task).to_not be_valid
      expect(task.errors[:user_id]).to include("can't be blank")
    end

    it "accepts empty description" do
      task = Task.new(name: "Test Task", description: "", user_id: 1)
      expect(task).to be_valid
    end

    it "accepts nil description" do
      task = Task.new(name: "Test Task", description: nil, user_id: 1)
      expect(task).to be_valid
    end

    it "accepts empty due_date" do
      task = Task.new(name: "Test Task", due_date: nil, user_id: 1)
      expect(task).to be_valid
    end
  end
  
  describe "attributes" do
    it "can have a description" do
      task = Task.new(name: "Test", description: "Test description", user_id: 1)
      expect(task.description).to eq("Test description")
    end
    
    it "can have a due date" do
      due_date = Time.current + 1.day
      task = Task.new(name: "Test", due_date: due_date, user_id: 1)
      expect(task.due_date).to be_within(1.second).of(due_date)
    end

    it "stores user_id as integer" do
      task = Task.new(name: "Test", user_id: "123")
      expect(task.user_id).to eq(123)
    end

    it "handles string user_id conversion" do
      task = Task.new(name: "Test", user_id: "456")
      expect(task.user_id).to be_a(Integer)
      expect(task.user_id).to eq(456)
    end
  end

  describe "user association methods" do
    let(:task) { Task.new(name: "Test Task", user_id: 1) }

    describe "#user_email" do
      it "returns 'Unknown User' when user not found" do
        task = Task.new(name: "Test", user_id: 99999)
        expect(task.user_email).to eq("Unknown User")
      end

      it "returns 'Unknown User' when user_id is nil" do
        task = Task.new(name: "Test", user_id: nil)
        expect(task.user_email).to eq("Unknown User")
      end

      it "uses cached user data when available" do
        # Mock the cache to return user data
        user_data = { id: 1, email_address: "test@example.com", organization_id: 1 }
        allow(Rails.cache).to receive(:fetch).with("user_1", expires_in: 5.minutes).and_return(user_data)
        
        task = Task.new(name: "Test", user_id: 1)
        expect(task.user_email).to eq("test@example.com")
      end
    end

    describe "#user" do
      it "returns nil when user_id is nil" do
        task = Task.new(name: "Test", user_id: nil)
        expect(task.user).to be_nil
      end

      it "caches user data for performance" do
        user_data = { id: 1, email_address: "test@example.com", organization_id: 1 }
        allow(Rails.cache).to receive(:fetch).with("user_1", expires_in: 5.minutes).and_return(user_data)
        
        task = Task.new(name: "Test", user_id: 1)
        user_info = task.user
        
        expect(user_info.id).to eq(1)
        expect(user_info.email_address).to eq("test@example.com")
        expect(user_info.organization_id).to eq(1)
      end

      it "handles cache miss gracefully" do
        allow(Rails.cache).to receive(:fetch).with("user_1", expires_in: 5.minutes).and_return(nil)
        
        task = Task.new(name: "Test", user_id: 1)
        expect(task.user).to be_nil
      end

      it "returns the same user object on repeated calls (memoization)" do
        user_data = { id: 1, email_address: "test@example.com", organization_id: 1 }
        allow(Rails.cache).to receive(:fetch).with("user_1", expires_in: 5.minutes).and_return(user_data)
        
        task = Task.new(name: "Test", user_id: 1)
        user1 = task.user
        user2 = task.user
        
        expect(user1).to eq(user2)
        expect(Rails.cache).to have_received(:fetch).once
      end
    end

    describe "#user=" do
      it "accepts a user object and sets user_id" do
        user_double = double('User', id: 42)
        task = Task.new(name: "Test")
        task.user = user_double
        
        expect(task.user_id).to eq(42)
      end

      it "accepts a user_id directly" do
        task = Task.new(name: "Test")
        task.user = 99
        
        expect(task.user_id).to eq(99)
      end
    end
  end

  describe "edge cases and data integrity" do
    it "handles very long task names" do
      long_name = "A" * 1000
      task = Task.new(name: long_name, user_id: 1)
      expect(task).to be_valid
      expect(task.name.length).to eq(1000)
    end

    it "handles very long descriptions" do
      long_description = "Description " * 500
      task = Task.new(name: "Test", description: long_description, user_id: 1)
      expect(task).to be_valid
      expect(task.description.length).to be > 1000
    end

    it "handles future due dates correctly" do
      future_date = Time.current + 5.years
      task = Task.new(name: "Future Task", due_date: future_date, user_id: 1)
      expect(task).to be_valid
      # Use be_within to handle timestamp precision differences
      expect(task.due_date).to be_within(1.second).of(future_date)
    end

    it "handles past due dates correctly" do
      past_date = Time.current - 2.years
      task = Task.new(name: "Past Task", due_date: past_date, user_id: 1)
      expect(task).to be_valid
      # Use be_within to handle timestamp precision differences
      expect(task.due_date).to be_within(1.second).of(past_date)
    end

    it "handles special characters in name" do
      special_name = "Task with émojis 🎯 and symbols @#$%"
      task = Task.new(name: special_name, user_id: 1)
      expect(task).to be_valid
      expect(task.name).to eq(special_name)
    end

    it "handles special characters in description" do
      special_description = "Description with line breaks\nand\ttabs\rand symbols ©®™"
      task = Task.new(name: "Test", description: special_description, user_id: 1)
      expect(task).to be_valid
      expect(task.description).to eq(special_description)
    end
  end

  describe "multi-tenant awareness" do
    it "works with the current tenant system" do
      # Mock the tenant system
      allow(Apartment::Tenant).to receive(:current).and_return("test_tenant")
      
      task = Task.new(name: "Tenant Task", user_id: 1)
      expect(task).to be_valid
    end

    it "handles tenant switching in user lookup" do
      # Mock the cache and tenant switching
      allow(Rails.cache).to receive(:fetch).and_return(nil)
      allow(Apartment::Tenant).to receive(:current).and_return("tenant1")
      allow(Apartment::Tenant).to receive(:reset)
      allow(Apartment::Tenant).to receive(:switch!)
      
      # Mock User.find_by to return user data
      user_record = double('User', id: 1, email_address: "test@example.com", organization_id: 1)
      allow(User).to receive(:find_by).with(id: 1).and_return(user_record)
      
      task = Task.new(name: "Test", user_id: 1)
      
      # This should trigger the user lookup which handles tenant switching
      expect { task.user }.not_to raise_error
    end
  end

  describe "error handling" do
    it "handles invalid user_id gracefully" do
      task = Task.new(name: "Test", user_id: "invalid")
      # Should convert to 0
      expect(task.user_id).to eq(0)
      expect(task).to be_valid # 0 is a valid integer, even if user doesn't exist
    end

    it "handles extremely large user_id" do
      large_id = 9999999999999999999
      task = Task.new(name: "Test", user_id: large_id)
      expect(task.user_id).to eq(large_id)
      expect(task).to be_valid
    end

    it "handles negative user_id" do
      task = Task.new(name: "Test", user_id: -1)
      expect(task.user_id).to eq(-1)
      expect(task).to be_valid # Model validation allows this, but it's invalid in practice
    end
  end
end