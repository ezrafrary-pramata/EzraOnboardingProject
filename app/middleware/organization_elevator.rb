class OrganizationElevator < Apartment::Elevators::Generic
    # Extract tenant from request
    def parse_tenant_name(request)
      # Try multiple methods to identify the tenant
      tenant_identifier = extract_tenant_identifier(request)
      
      if tenant_identifier
        # Validate that the organization exists and return its subdomain
        organization = Organization.find_by(subdomain: tenant_identifier)
        if organization
          # Store organization in request env for controllers to access
          request.env['current_organization'] = organization
          request.env['current_tenant'] = organization.subdomain
          return organization.subdomain
        end
      end
      
      # Return nil to stay on shared database
      nil
    end
  
    private
  
    def extract_tenant_identifier(request)
      # Method 1: Subdomain (e.g., acme.tasktracker.com)
      subdomain = extract_subdomain(request)
      return subdomain if subdomain.present? && valid_subdomain?(subdomain)
      
      # Method 2: Path prefix (e.g., /orgs/acme/dashboard)
      path_tenant = extract_from_path(request)
      return path_tenant if path_tenant.present?
      
      # Method 3: Header (e.g., X-Tenant: acme)
      header_tenant = request.headers['X-Tenant']
      return header_tenant if header_tenant.present?
      
      # Method 4: Session (for logged-in users)
      session_tenant = extract_from_session(request)
      return session_tenant if session_tenant.present?
      
      nil
    end
  
    def extract_subdomain(request)
      host = request.host
      return nil unless host
      
      # Skip localhost and IP addresses in development
      return nil if host == 'localhost' || host.match?(/^\d+\.\d+\.\d+\.\d+$/)
      
      # Extract subdomain (everything before the main domain)
      parts = host.split('.')
      return nil if parts.length < 3  # Need at least subdomain.domain.tld
      
      subdomain = parts.first
      return subdomain unless %w[www api admin].include?(subdomain)
      
      nil
    end
  
    def extract_from_path(request)
      # Match patterns like /orgs/acme/... or /organizations/acme/...
      path = request.path
      match = path.match(%r{^/(?:orgs?|organizations?)/([a-z0-9\-]+)})
      match ? match[1] : nil
    end
  
    def extract_from_session(request)
      # Get session if available
      session = request.session rescue nil
      return nil unless session
      
      # Check for current organization in session
      org_id = session[:current_organization_id]
      return nil unless org_id
      
      # Look up organization subdomain
      organization = Organization.find_by(id: org_id)
      organization&.subdomain
    end
  
    def valid_subdomain?(subdomain)
      # Basic validation - must match organization subdomain format
      subdomain.match?(/\A[a-z0-9\-]+\z/) && subdomain.length >= 2
    end
  end