// app/javascript/microfrontends/header-mfe.js
import React from 'react';
import { createRoot } from 'react-dom/client';

console.log('🔵 Header MFE: Module loading...');

let reactRoot = null;

const HeaderMicrofrontend = {
  bootstrap: (props) => {
    console.log('🔵 Header MFE: Bootstrapping...', props);
    return Promise.resolve();
  },

  mount: async (props) => {
    console.log('🔵 Header MFE: Mounting...', props);
    
    try {
      // Get the container element
      const container = document.getElementById('header-mfe-container');
      if (!container) {
        throw new Error('Header MFE container not found');
      }

      // Get user data from global window object or props
      const userData = window.currentUser || props.user || null;
      const isAuthenticated = window.isAuthenticated || props.isAuthenticated || false;

      console.log('🔵 Header MFE: User data loaded', { 
        isAuthenticated, 
        user: userData?.email_address || 'none' 
      });

      // Create React root and render Header
      reactRoot = createRoot(container);
      
      // Header Navigation Component
      const HeaderNavigation = () => {
        const handleLogout = () => {
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

        return React.createElement('div', {
          style: {
            border: '2px dashed #ff9800',
            borderRadius: '8px',
            margin: '5px'
          }
        }, [
          // MFE identification header
          React.createElement('div', {
            key: 'mfe-header',
            style: {
              background: '#fff3e0',
              padding: '4px 8px',
              fontSize: '10px',
              color: '#f57c00',
              fontWeight: 'bold',
              textAlign: 'center',
              borderRadius: '4px 4px 0 0'
            }
          }, '🧭 Header/Navigation Microfrontend'),
          
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
                    borderRadius: '8px',
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
              
              // Right side - logout or login
              isAuthenticated ? 
                React.createElement('button', {
                  key: 'logout-btn',
                  onClick: handleLogout,
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
                }, 'Log out') :
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
          )
        ]);
      };

      reactRoot.render(React.createElement(HeaderNavigation));
      
      console.log('✅ Header MFE: Mounted successfully');
      return Promise.resolve();
      
    } catch (error) {
      console.error('❌ Header MFE: Mount error:', error);
      throw error;
    }
  },

  unmount: (props) => {
    console.log('🔵 Header MFE: Unmounting...', props);
    
    try {
      if (reactRoot) {
        reactRoot.unmount();
        reactRoot = null;
      }
      
      // Clear the container
      const container = document.getElementById('header-mfe-container');
      if (container) {
        container.innerHTML = '<div style="text-align: center; color: #666; padding: 10px;">Header Microfrontend Unloaded</div>';
      }
      
      console.log('✅ Header MFE: Unmounted successfully');
      return Promise.resolve();
      
    } catch (error) {
      console.error('❌ Header MFE: Unmount error:', error);
      return Promise.resolve(); // Don't fail the unmount process
    }
  }
};

// Export the microfrontend
export default () => Promise.resolve(HeaderMicrofrontend);