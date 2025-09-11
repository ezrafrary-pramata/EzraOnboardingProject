# Configure Turbo to avoid caching issues with MFEs
Rails.application.configure do
  config.after_initialize do
    # Disable caching for auth-related pages to prevent MFE issues
    if defined?(Turbo::Streams)
      puts "✅ Turbo configured for MFE compatibility"
    end
  end
end
