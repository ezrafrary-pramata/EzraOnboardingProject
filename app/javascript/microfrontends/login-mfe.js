// app/javascript/microfrontends/login-mfe.js
import React from 'react';
import { createRoot } from 'react-dom/client';
import LoginForm from 'components/LoginPage';

console.log('🔵 Login MFE: Module loading...');

let reactRoot = null;

const LoginMicrofrontend = {
  bootstrap: (props) => {
    console.log('🔵 Login MFE: Bootstrapping...', props);
    return Promise.resolve();
  },

  mount: async (props) => {
    console.log('🔵 Login MFE: Mounting...', props);
    
    try {
      // Get the container element
      const container = document.getElementById('login-mfe-container');
      if (!container) {
        throw new Error('Login MFE container not found');
      }

      // Get login page data from global window object or props
      const sessionPath = window.loginData?.sessionPath || props.sessionPath || '/session';
      const newPasswordPath = window.loginData?.newPasswordPath || props.newPasswordPath || '/password/new';
      const newUserPath = window.loginData?.newUserPath || props.newUserPath || '/users/new';
      const flashAlert = window.loginData?.flashAlert || props.flashAlert || null;
      const flashNotice = window.loginData?.flashNotice || props.flashNotice || null;
      const emailValue = window.loginData?.emailValue || props.emailValue || '';

      console.log('🔵 Login MFE: Login data loaded', { 
        sessionPath, 
        flashAlert: !!flashAlert,
        flashNotice: !!flashNotice 
      });

      // Create React root and render LoginForm
      reactRoot = createRoot(container);
      
      // Add a wrapper with microfrontend identification
      const LoginWrapper = () => {
        return React.createElement('div', {
          style: {
            border: '2px dashed #4f46e5',
            borderRadius: '8px',
            margin: '10px 0'
          }
        }, [
          React.createElement('div', {
            key: 'mfe-header',
            style: {
              background: '#eff6ff',
              padding: '8px 12px',
              borderRadius: '4px 4px 0 0',
              marginBottom: '0',
              fontSize: '12px',
              color: '#4338ca',
              fontWeight: 'bold',
              textAlign: 'center'
            }
          }, '🔐 Login Microfrontend (Independently Loaded)'),
          
          React.createElement(LoginForm, {
            key: 'loginform',
            sessionPath: sessionPath,
            newPasswordPath: newPasswordPath,
            newUserPath: newUserPath,
            flashAlert: flashAlert,
            flashNotice: flashNotice,
            emailValue: emailValue
          })
        ]);
      };

      reactRoot.render(React.createElement(LoginWrapper));
      
      console.log('✅ Login MFE: Mounted successfully');
      return Promise.resolve();
      
    } catch (error) {
      console.error('❌ Login MFE: Mount error:', error);
      throw error;
    }
  },

  unmount: (props) => {
    console.log('🔵 Login MFE: Unmounting...', props);
    
    try {
      if (reactRoot) {
        reactRoot.unmount();
        reactRoot = null;
      }
      
      // Clear the container
      const container = document.getElementById('login-mfe-container');
      if (container) {
        container.innerHTML = '<div style="text-align: center; color: #666; padding: 20px;">Login Microfrontend Unloaded</div>';
      }
      
      console.log('✅ Login MFE: Unmounted successfully');
      return Promise.resolve();
      
    } catch (error) {
      console.error('❌ Login MFE: Unmount error:', error);
      return Promise.resolve(); // Don't fail the unmount process
    }
  }
};

// Export the microfrontend
export default () => Promise.resolve(LoginMicrofrontend);