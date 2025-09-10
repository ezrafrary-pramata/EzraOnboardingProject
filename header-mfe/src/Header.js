import React from 'react';

class Header extends React.Component {
  constructor(props) {
    super(props);
    
    // Check for Rails data first, then props, then defaults
    const railsData = window.currentUser;
    const isAuthenticated = window.isAuthenticated || props.isAuthenticated || false;
    const userEmail = railsData?.email_address || props.userEmail || '';
    const organizationName = railsData?.organization_name || props.organizationName || 'No organization assigned';
    
    this.state = { 
      isAuthenticated,
      userEmail,
      organizationName,
      dataSource: railsData ? 'rails' : (props.userEmail ? 'props' : 'none')
    };
    
    console.log('🔵 Header MFE: Initialized with data source:', this.state.dataSource);
    console.log('🔵 Header MFE: Auth status:', isAuthenticated, 'User:', userEmail);
  }
  
  handleLogout = () => {
    console.log('🔵 Header MFE: Logout initiated');
    
    // Create and submit logout form
    const form = document.createElement('form');
    form.method = 'POST';
    form.action = '/session';
    form.style.display = 'none';
    
    // Add CSRF token
    const csrfToken = document.querySelector('meta[name="csrf-token"]')?.getAttribute('content');
    if (csrfToken) {
      const csrfInput = document.createElement('input');
      csrfInput.type = 'hidden';
      csrfInput.name = 'authenticity_token';
      csrfInput.value = csrfToken;
      form.appendChild(csrfInput);
    }
    
    // Add method override for DELETE
    const methodInput = document.createElement('input');
    methodInput.type = 'hidden';
    methodInput.name = '_method';
    methodInput.value = 'DELETE';
    form.appendChild(methodInput);
    
    document.body.appendChild(form);
    form.submit();
  };

  getDataSourceBadge = () => {
    const { dataSource } = this.state;
    const badges = {
      rails: { text: 'Rails Data', color: '#28a745', icon: '🔗' },
      props: { text: 'Props Data', color: '#ffc107', icon: '⚡' },
      none: { text: 'Demo Data', color: '#fd7e14', icon: '🎭' }
    };
    
    const badge = badges[dataSource] || badges.none;
    
    return React.createElement('span', {
      style: {
        backgroundColor: badge.color,
        color: 'white',
        padding: '2px 6px',
        
        fontSize: '10px',
        fontWeight: '500',
        marginLeft: '8px'
      }
    }, `${badge.icon} ${badge.text}`);
  };
  
  render() {
    const { isAuthenticated, userEmail, organizationName } = this.state;
    
    return React.createElement('div', {
      style: {
        
        
        margin: '0'
      }
    }, [
      // MFE identification header
      React.createElement('div', {
        key: 'mfe-header',
        style: {
          background: '#fff3e0',
          padding: '6px 12px',
          fontSize: '11px',
          color: '#f57c00',
          fontWeight: 'bold',
          textAlign: 'center',
          borderRadius: '4px 4px 0 0',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }
      }, [
        '🧭 Header/Navigation Microfrontend (Port 8082)',
        this.getDataSourceBadge()
      ]),
      
      // Main navigation
      React.createElement('nav', {
        key: 'main-nav',
        style: {
          backgroundColor: '#fff',
          borderBottom: '1px solid #e5e7eb',
          boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)',
          padding: '0.75rem 1.5rem'
        }
      },
        React.createElement('div', {
          style: {
            maxWidth: '1200px',
            margin: '0 auto',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center'
          }
        }, [
          // Logo/Home Link
          React.createElement('a', {
            key: 'logo-link',
            href: '/',
            style: {
              display: 'flex',
              alignItems: 'center',
              gap: '0.75rem',
              textDecoration: 'none',
              color: '#1f2937',
              transition: 'opacity 0.2s ease'
            },
            onMouseEnter: (e) => e.target.style.opacity = '0.8',
            onMouseLeave: (e) => e.target.style.opacity = '1'
          }, [
            React.createElement('div', {
              key: 'logo-icon',
              style: {
                width: '32px',
                height: '32px',
                backgroundColor: '#3b82f6',
                
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'white',
                fontWeight: 'bold',
                fontSize: '16px'
              }
            }, 'T'),
            React.createElement('h1', {
              key: 'logo-text',
              style: {
                fontSize: '1.5rem',
                fontWeight: '700',
                color: '#1f2937',
                margin: '0'
              }
            }, 'TaskTracker')
          ]),
          
          // Right side - User info and actions
          React.createElement('div', {
            key: 'nav-right',
            style: {
              display: 'flex',
              alignItems: 'center',
              gap: '1rem'
            }
          }, isAuthenticated ? [
            // User info
            userEmail && React.createElement('div', {
              key: 'user-info',
              style: {
                textAlign: 'right',
                fontSize: '0.875rem'
              }
            }, [
              React.createElement('div', {
                key: 'user-email',
                style: {
                  fontWeight: '600',
                  color: '#374151',
                  marginBottom: '2px'
                }
              }, `Welcome, ${userEmail}`),
              React.createElement('div', {
                key: 'org-name',
                style: {
                  fontSize: '0.75rem',
                  color: '#6b7280'
                }
              }, organizationName)
            ]),
            
            // Logout button
            React.createElement('button', {
              key: 'logout-btn',
              onClick: this.handleLogout,
              style: {
                backgroundColor: '#ef4444',
                color: 'white',
                border: 'none',
                padding: '0.5rem 1rem',
                borderRadius: '6px',
                fontSize: '0.875rem',
                fontWeight: '500',
                cursor: 'pointer',
                transition: 'background-color 0.2s ease'
              },
              onMouseEnter: (e) => e.target.style.backgroundColor = '#dc2626',
              onMouseLeave: (e) => e.target.style.backgroundColor = '#ef4444'
            }, 'Log out')
          ] : [
            // Login link
            React.createElement('a', {
              key: 'login-link',
              href: '/session/new',
              style: {
                backgroundColor: '#3b82f6',
                color: 'white',
                textDecoration: 'none',
                padding: '0.5rem 1rem',
                borderRadius: '6px',
                fontSize: '0.875rem',
                fontWeight: '500',
                transition: 'background-color 0.2s ease'
              },
              onMouseEnter: (e) => e.target.style.backgroundColor = '#2563eb',
              onMouseLeave: (e) => e.target.style.backgroundColor = '#3b82f6'
            }, 'Log in')
          ])
        ])
      )
    ]);
  }
}

export default Header;
